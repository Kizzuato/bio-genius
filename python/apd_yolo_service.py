from __future__ import annotations

import base64
import os
from pathlib import Path
from typing import Any

import cv2
import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from huggingface_hub import hf_hub_download
from ultralytics import YOLO


BASE_DIR = Path(__file__).resolve().parent
MODEL_SOURCE = os.getenv("YOLO_WEIGHTS_PATH") or "hf://Hexmon/vyra-yolo-ppe-detection/best.pt"
HF_CACHE_DIR = BASE_DIR / ".hf-cache"
CONFIDENCE = float(os.getenv("YOLO_CONF", "0.25"))
PPE_CLASSES = [x.strip().lower() for x in os.getenv("PPE_CLASSES", "helmet,vest,mask,gloves,glasses").split(",") if x.strip()]
MODEL: YOLO | None = None

app = FastAPI(title="Bio-Genius APD YOLO Service", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


ALIASES = {
    "hardhat": "helmet",
    "safety helmet": "helmet",
    "worker helmet": "helmet",
    "safety vest": "vest",
    "reflective vest": "vest",
    "high visibility vest": "vest",
    "masker": "mask",
    "face mask": "mask",
    "glove": "gloves",
    "safety glove": "gloves",
    "safety glasses": "glasses",
    "spectacles": "glasses",
}


def normalize_label(label: str) -> str:
    value = label.strip().lower().replace("-", " ").replace("_", " ")
    return ALIASES.get(value, value)


def resolve_model_source() -> str:
    source = MODEL_SOURCE.strip()
    if source.startswith("hf://") or source.startswith("hf:/"):
        repo_path = source.removeprefix("hf://").removeprefix("hf:/").lstrip("/")
        if "/" not in repo_path:
            raise ValueError("Invalid YOLO_WEIGHTS_PATH format. Use hf://repo_id/filename.pt or a local path.")
        repo_id, filename = repo_path.rsplit("/", 1)
        try:
            return hf_hub_download(repo_id=repo_id, filename=filename, cache_dir=str(HF_CACHE_DIR))
        except Exception as exc:
            raise RuntimeError(
                "Failed to download YOLO weights from Hugging Face: %s/%s. "
                "Set YOLO_WEIGHTS_PATH to a local .pt file if you want to run offline."
                % (repo_id, filename)
            ) from exc
    return source


def load_model() -> YOLO:
    global MODEL
    if MODEL is None:
        MODEL = YOLO(resolve_model_source())
    return MODEL


def encode_jpeg(image: np.ndarray) -> str:
    ok, buf = cv2.imencode(".jpg", image)
    if not ok:
        raise RuntimeError("Failed to encode annotated image")
    return base64.b64encode(buf).decode()


def color_for_label(label: str) -> tuple[int, int, int]:
    return (0, 220, 180) if label in PPE_CLASSES else (255, 180, 0)


def annotate(image: np.ndarray, detections: list[dict[str, Any]]) -> np.ndarray:
    annotated = image.copy()
    for item in detections:
        box = item["box"]
        x1, y1, x2, y2 = map(int, [box["x1"], box["y1"], box["x2"], box["y2"]])
        color = color_for_label(item["label"])
        cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 2)
        caption = f'{item["label"]} {int(item["confidence"] * 100)}%'
        (tw, th), baseline = cv2.getTextSize(caption, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
        top = max(y1 - 8, th + 8)
        cv2.rectangle(annotated, (x1, top - th - baseline - 4), (x1 + tw + 8, top), color, -1)
        cv2.putText(
            annotated,
            caption,
            (x1 + 4, top - baseline - 2),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5,
            (10, 15, 24),
            1,
            cv2.LINE_AA,
        )
    return annotated


@app.get("/health")
def health() -> dict[str, Any]:
    try:
        load_model()
        return {
            "ok": True,
            "model_ready": True,
            "model_path": MODEL_SOURCE,
            "confidence_threshold": CONFIDENCE,
            "ppe_classes": PPE_CLASSES,
            "message": "YOLO model loaded",
        }
    except Exception as exc:
        return {
            "ok": False,
            "model_ready": False,
            "model_path": MODEL_SOURCE,
            "confidence_threshold": CONFIDENCE,
            "ppe_classes": PPE_CLASSES,
            "message": str(exc),
        }


@app.post("/detect")
async def detect(file: UploadFile = File(...)) -> dict[str, Any]:
    try:
        model = load_model()
    except Exception as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    image = cv2.imdecode(np.frombuffer(await file.read(), np.uint8), cv2.IMREAD_COLOR)
    if image is None:
        raise HTTPException(status_code=400, detail="Uploaded file is not a valid image")

    result = model.predict(source=image, conf=CONFIDENCE, verbose=False)[0]
    detections: list[dict[str, Any]] = []
    detected_apd: list[str] = []

    for box in result.boxes:
        cls_id = int(box.cls.item())
        label = normalize_label(str(result.names.get(cls_id, cls_id)))
        confidence = float(box.conf.item())
        x1, y1, x2, y2 = [float(v) for v in box.xyxy[0].tolist()]
        detections.append(
            {
                "label": label,
                "confidence": round(confidence, 4),
                "box": {
                    "x1": round(x1, 1),
                    "y1": round(y1, 1),
                    "x2": round(x2, 1),
                    "y2": round(y2, 1),
                },
            }
        )
        if label in PPE_CLASSES:
            detected_apd.append(label)

    detected_apd = sorted(set(detected_apd))
    missing_apd = [x for x in PPE_CLASSES if x not in detected_apd]
    compliance_score = 1.0 if not PPE_CLASSES else round(max(0.0, 1.0 - (len(missing_apd) / len(PPE_CLASSES))), 4)
    person_present = any(x["label"] == "person" for x in detections)
    compliant = len(missing_apd) == 0 and (person_present or not PPE_CLASSES)
    risk_level = "low" if compliant else ("high" if len(missing_apd) >= 3 else "medium")

    return {
        "filename": file.filename,
        "image": {
            "width": int(image.shape[1]),
            "height": int(image.shape[0]),
        },
        "model": {
            "path": MODEL_SOURCE,
            "confidence_threshold": CONFIDENCE,
        },
        "summary": {
            "person_present": person_present,
            "compliant": compliant,
            "risk_level": risk_level,
            "compliance_score": compliance_score,
            "detected_apd": detected_apd,
            "missing_apd": missing_apd,
            "total_detections": len(detections),
        },
        "detections": detections,
        "annotated_image_base64": encode_jpeg(annotate(image, detections)),
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host=os.getenv("HOST", "0.0.0.0"), port=int(os.getenv("PORT", "8001")))
