"use client";

import React from "react";
import { Camera, LoaderCircle, ScanSearch, ShieldCheck } from "lucide-react";

type Detection = {
  label: string;
  confidence: number;
  box: { x1: number; y1: number; x2: number; y2: number };
};

type AnalysisResult = {
  filename: string;
  model: { path: string; confidence_threshold: number };
  image: { width: number; height: number };
  summary: {
    person_present: boolean;
    compliant: boolean;
    risk_level: "low" | "medium" | "high";
    compliance_score: number;
    detected_apd: string[];
    missing_apd: string[];
    total_detections: number;
  };
  detections: Detection[];
  annotated_image_base64: string;
};

const API_BASE = process.env.NEXT_PUBLIC_APD_API_URL ?? "http://127.0.0.1:8001";

export default function ControlPanelPage() {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<AnalysisResult | null>(null);
  const [health, setHealth] = React.useState<{ ready: boolean; message: string } | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    fetch(`${API_BASE}/health`)
      .then((res) => res.json())
      .then((data) => {
        if (active) setHealth({ ready: Boolean(data?.model_ready), message: data?.message ?? "unknown" });
      })
      .catch(() => {
        if (active) setHealth({ ready: false, message: "backend offline" });
      });
    return () => {
      active = false;
    };
  }, []);

  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const onPick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    setError(null);
    setResult(null);
    setFile(nextFile);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(nextFile ? URL.createObjectURL(nextFile) : null);
  };

  const analyze = async () => {
    if (!file) {
      setError("Pilih gambar APD terlebih dahulu.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`${API_BASE}/detect`, { method: "POST", body: formData });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.detail ?? `Request failed with status ${response.status}`);
      }
      setResult((await response.json()) as AnalysisResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analisis APD gagal dijalankan");
    } finally {
      setLoading(false);
    }
  };

  const complianceLabel = result ? (result.summary.compliant ? "APD Lengkap" : "APD Belum Lengkap") : "Menunggu analisis";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Computer Vision</p>
            <h2 className="text-2xl font-bold text-white tracking-tight">Pembacaan APD dengan YOLO</h2>
            <p className="text-sm text-slate-400 mt-1">Unggah frame CCTV atau snapshot kamera untuk mendeteksi helm, rompi, masker, kacamata, dan sarung tangan.</p>
          </div>
          <span className={`text-xs px-2 py-1 border ${health?.ready ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/10" : "border-amber-500/40 text-amber-300 bg-amber-500/10"}`}>
            {health?.ready ? "Backend YOLO siap" : `Backend: ${health?.message ?? "belum tersedia"}`}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input ref={inputRef} type="file" accept="image/*" onChange={onPick} className="hidden" />
          <button type="button" onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700">
            <Camera className="w-4 h-4" />
            Pilih Gambar
          </button>
          <button type="button" onClick={analyze} disabled={!file || loading || !health?.ready} className="inline-flex items-center gap-2 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <ScanSearch className="w-4 h-4" />}
            Analisis YOLO
          </button>
          <span className="text-xs text-slate-400">{file ? file.name : "Belum ada file dipilih"}</span>
        </div>

        {error && <div className="mt-4 border border-red-500/30 bg-red-500/10 text-red-200 px-4 py-3 text-sm">{error}</div>}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)] gap-6">
        <div className="space-y-4 min-w-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="border border-slate-800 bg-slate-950 p-4 min-h-[340px]">
              <div className="flex items-center gap-2 mb-3 text-slate-200"><Camera className="w-4 h-4 text-cyan-300" /><h3 className="font-medium text-sm">Input Frame</h3></div>
              {previewUrl ? <img src={previewUrl} alt="Preview APD" className="w-full h-[270px] object-contain bg-slate-900 border border-slate-800" /> : <div className="h-[270px] border border-dashed border-slate-700 flex items-center justify-center text-slate-500 text-sm">Upload gambar CCTV atau snapshot kamera.</div>}
            </div>
            <div className="border border-slate-800 bg-slate-950 p-4 min-h-[340px]">
              <div className="flex items-center gap-2 mb-3 text-slate-200"><ShieldCheck className="w-4 h-4 text-emerald-300" /><h3 className="font-medium text-sm">Output Anotasi</h3></div>
              {result ? <img src={`data:image/jpeg;base64,${result.annotated_image_base64}`} alt="Annotated APD result" className="w-full h-[270px] object-contain bg-slate-900 border border-slate-800" /> : <div className="h-[270px] border border-dashed border-slate-700 flex items-center justify-center text-slate-500 text-sm">Hasil bounding box akan tampil di sini.</div>}
            </div>
          </div>
        </div>

        <div className="space-y-4 min-w-0">
          <div className="border border-slate-800 bg-slate-950 p-4">
            <div className="flex items-center justify-between gap-3">
              <div><p className="text-xs text-slate-500">Status APD</p><h3 className="text-lg font-semibold text-white">{complianceLabel}</h3></div>
              <div className={`text-xs px-2 py-1 border ${result?.summary.compliant ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/10" : "border-rose-500/40 text-rose-300 bg-rose-500/10"}`}>{result ? `${Math.round(result.summary.compliance_score * 100)}% patuh` : "Belum dianalisis"}</div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
              <div className="border border-slate-800 p-3"><p className="text-xs text-slate-500">Risk level</p><p className="text-white font-medium">{result?.summary.risk_level ?? "-"}</p></div>
              <div className="border border-slate-800 p-3"><p className="text-xs text-slate-500">Total deteksi</p><p className="text-white font-medium">{result?.summary.total_detections ?? 0}</p></div>
              <div className="border border-slate-800 p-3"><p className="text-xs text-slate-500">APD terdeteksi</p><p className="text-white font-medium">{result?.summary.detected_apd.join(", ") || "-"}</p></div>
              <div className="border border-slate-800 p-3"><p className="text-xs text-slate-500">APD hilang</p><p className="text-white font-medium">{result?.summary.missing_apd.join(", ") || "-"}</p></div>
            </div>
          </div>

          <div className="border border-slate-800 bg-slate-950 p-4">
            <h3 className="font-medium text-sm text-white mb-3">Deteksi Bounding Box</h3>
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {result?.detections.length ? result.detections.map((item, index) => (
                <div key={`${item.label}-${index}`} className="border border-slate-800 p-3">
                  <div className="flex items-center justify-between gap-3"><span className="text-sm text-white">{item.label}</span><span className="text-xs text-cyan-300">{Math.round(item.confidence * 100)}%</span></div>
                  <p className="text-xs text-slate-500 mt-1">x1 {item.box.x1}, y1 {item.box.y1}, x2 {item.box.x2}, y2 {item.box.y2}</p>
                </div>
              )) : <p className="text-sm text-slate-500">Belum ada hasil deteksi.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
