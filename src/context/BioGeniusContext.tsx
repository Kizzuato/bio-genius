"use client";

import React, { createContext, useContext, useState, useMemo } from "react";

export type VisualDetection = {
  id: string;
  component: string;
  label: string;
  confidence: number;
  risk: "normal" | "warning" | "critical";
  box: { x: number; y: number; width: number; height: number };
};

export type SegmentedRegion = {
  id: string;
  component: string;
  method: string;
  coverage: number;
};

export type VisualFeature = {
  component: string;
  color: string;
  texture: string;
  shape: string;
  finding: string;
};

export type VisualInspection = {
  preprocessing: {
    lowPass: number;
    highPass: number;
    contrastStretching: number;
    histogramEqualization: number;
    interpolation: string;
    qualityScore: number;
  };
  segmentation: SegmentedRegion[];
  features: VisualFeature[];
  motion: {
    opticalFlowScore: number;
    motionMap: number[];
    stitchingCoverage: number;
    alert: string;
  };
  detections: VisualDetection[];
};

export type MitigationAction = {
  id: string;
  label: string;
  effect: number;
  duration: number;
  safety: number;
  actuator: string;
};

export type AiDecision = {
  fuzzySeverity: {
    low: number;
    medium: number;
    high: number;
    label: string;
  };
  searchPlan: MitigationAction[];
  constrainedPlan: string[];
  anomalyRisk: number;
  observations: string[];
  recommendation: string;
};

export type PressurePoint = {
  time: string;
  pressure: number;
};

export type AlertItem = {
  id: number;
  time: string;
  message: string;
  type: "critical" | "warning" | "info";
};

export type ChatMessage = {
  role: "ai" | "user";
  content: string;
};

export type BioGeniusContextValue = {
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  username: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  loginError: string;
  handleLogin: (e: React.FormEvent) => void;
  pressure: number;
  pressureHistory: PressurePoint[];
  isAnomaly: boolean;
  chatMessages: ChatMessage[];
  chatInput: string;
  setChatInput: React.Dispatch<React.SetStateAction<string>>;
  isTyping: boolean;
  isChatOpen: boolean;
  setIsChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
  showPrompts: boolean;
  setShowPrompts: React.Dispatch<React.SetStateAction<boolean>>;
  alertHistory: AlertItem[];
  handleSendMessage: (overrideMessage?: string) => void;
  triggerAnomaly: () => void;
  applySolution: () => void;
  activePrompts: string[];
  visualInspection: VisualInspection;
  aiDecision: AiDecision;
};

const generateInitialData = () => {
  const data: PressurePoint[] = [];
  const now = new Date();
  for (let i = 20; i >= 0; i--) {
    data.push({
      time: new Date(now.getTime() - i * 1000).toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      pressure: 0.0,
    });
  }
  return data;
};

const BioGeniusContext = createContext<BioGeniusContextValue | null>(null);

const mitigationActions: MitigationAction[] = [
  { id: "vent", label: "Buka venting bertahap", effect: -1.2, duration: 3, safety: 0.96, actuator: "vent-valve" },
  { id: "rpm-down", label: "Turunkan RPM kompresor", effect: -0.8, duration: 4, safety: 0.9, actuator: "compressor-vfd" },
  { id: "intake-check", label: "Periksa intake dan filter", effect: 0.7, duration: 5, safety: 0.88, actuator: "operator" },
  { id: "rpm-up", label: "Naikkan kompresi bertahap", effect: 0.9, duration: 4, safety: 0.86, actuator: "compressor-vfd" },
  { id: "isolate", label: "Isolasi jalur berisiko", effect: -0.5, duration: 6, safety: 0.98, actuator: "block-valve" },
];

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const calculateFuzzySeverity = (pressure: number) => {
  const distanceFromTarget = Math.abs(pressure - 5);
  const low = clamp(1 - distanceFromTarget / 1.2);
  const medium = clamp(1 - Math.abs(distanceFromTarget - 1.2) / 1.1);
  const high = clamp((distanceFromTarget - 1.4) / 1.6);
  const label = high >= 0.45 ? "tinggi" : medium >= 0.45 ? "sedang" : "rendah";

  return {
    low: Number(low.toFixed(2)),
    medium: Number(medium.toFixed(2)),
    high: Number(high.toFixed(2)),
    label,
  };
};

const buildVisualInspection = (pressure: number, isAnomaly: boolean): VisualInspection => {
  const stress = clamp(Math.abs(pressure - 5) / 2);
  const offState = pressure < 0.1;
  const corrosionRisk = isAnomaly ? "warning" : "normal";
  const motionAlert = offState
    ? "Tidak ada motion signifikan karena plant offline"
    : isAnomaly
      ? "Alert: optical flow menunjukkan getaran pipa di atas ambang"
      : "Motion normal pada area kompresor";

  return {
    preprocessing: {
      lowPass: offState ? 0.42 : 0.78,
      highPass: offState ? 0.18 : 0.64,
      contrastStretching: offState ? 0.35 : 0.82,
      histogramEqualization: offState ? 0.31 : 0.79,
      interpolation: "bicubic 2x untuk frame CCTV minim cahaya",
      qualityScore: Number((offState ? 0.38 : 0.84 - stress * 0.12).toFixed(2)),
    },
    segmentation: [
      { id: "pipe", component: "Pipa inlet", method: "Canny + watershed", coverage: offState ? 18 : 31 },
      { id: "valve", component: "Valve utama", method: "Otsu thresholding", coverage: offState ? 9 : 14 },
      { id: "gauge", component: "Gauge tekanan", method: "Hough/circular region", coverage: offState ? 6 : 11 },
      { id: "panel", component: "Panel kompresor", method: "Mean-shift region", coverage: offState ? 12 : 19 },
    ],
    features: [
      {
        component: "Pipa inlet",
        color: isAnomaly ? "histogram dominan cokelat-kemerahan" : "histogram abu metal stabil",
        texture: isAnomaly ? "LBP kasar, indikasi karat ringan" : "LBP halus",
        shape: "chain code linear",
        finding: isAnomaly ? "indikasi korosi perlu inspeksi operator" : "normal",
      },
      {
        component: "Valve utama",
        color: "momen warna konsisten",
        texture: "SIFT keypoint stabil",
        shape: isAnomaly ? "orientasi handle setengah terbuka" : "orientasi handle tertutup/normal",
        finding: isAnomaly ? "status valve perlu konfirmasi" : "normal",
      },
      {
        component: "Gauge tekanan",
        color: pressure > 6 ? "zona merah terdeteksi" : pressure < 4 && !offState ? "zona rendah terdeteksi" : "zona hijau/off",
        texture: "needle edge terdeteksi",
        shape: "kontur lingkar gauge valid",
        finding: pressure > 6 ? "indikasi overpressure visual" : "pembacaan visual sinkron",
      },
    ],
    motion: {
      opticalFlowScore: Number((offState ? 0.03 : 0.18 + stress * 0.52).toFixed(2)),
      motionMap: offState ? [3, 2, 4, 2, 3, 2] : [12, 18, 24, 31, isAnomaly ? 69 : 28, isAnomaly ? 74 : 22],
      stitchingCoverage: offState ? 42 : 86,
      alert: motionAlert,
    },
    detections: [
      {
        id: "det-pipe",
        component: "Pipa inlet",
        label: isAnomaly ? "karat/kebocoran visual" : "pipa normal",
        confidence: isAnomaly ? 0.82 : 0.91,
        risk: corrosionRisk,
        box: { x: 10, y: 26, width: 58, height: 15 },
      },
      {
        id: "det-valve",
        component: "Valve utama",
        label: isAnomaly ? "valve setengah terbuka" : "valve normal",
        confidence: isAnomaly ? 0.79 : 0.88,
        risk: isAnomaly ? "warning" : "normal",
        box: { x: 57, y: 38, width: 19, height: 26 },
      },
      {
        id: "det-gauge",
        component: "Gauge tekanan",
        label: pressure > 6 ? "gauge overpressure" : pressure < 4 && !offState ? "gauge underpressure" : "gauge normal/off",
        confidence: pressure > 6 ? 0.93 : 0.86,
        risk: pressure > 6 ? "critical" : pressure < 4 && !offState ? "warning" : "normal",
        box: { x: 75, y: 12, width: 16, height: 22 },
      },
    ],
  };
};

const buildAiDecision = (pressure: number, isAnomaly: boolean, history: PressurePoint[]): AiDecision => {
  const fuzzySeverity = calculateFuzzySeverity(pressure);
  const direction = pressure > 5 ? -1 : 1;
  const availableActuators = new Set(["vent-valve", "compressor-vfd", "operator", "block-valve"]);
  const maxResponseTime = isAnomaly ? 8 : 12;

  const scoredActions = mitigationActions
    .filter((action) => availableActuators.has(action.actuator))
    .filter((action) => action.duration <= maxResponseTime)
    .map((action) => {
      const targetMatch = direction * action.effect > 0 ? Math.abs(action.effect) : 0.1;
      const heuristicCost = Math.abs(5 - (pressure + action.effect)) + action.duration * 0.12 + (1 - action.safety);
      return { action, score: targetMatch / Math.max(heuristicCost, 0.1) };
    })
    .sort((a, b) => b.score - a.score)
    .map((item) => item.action);

  const recentPressure = history.slice(-8).map((item) => item.pressure);
  const drift = recentPressure.length > 1 ? recentPressure[recentPressure.length - 1] - recentPressure[0] : 0;
  const anomalyRisk = clamp(fuzzySeverity.high * 0.62 + fuzzySeverity.medium * 0.24 + Math.abs(drift) * 0.08 + (isAnomaly ? 0.18 : 0));
  const constrainedPlan = (isAnomaly ? scoredActions.slice(0, 3) : scoredActions.slice(0, 2)).map((action, index) => {
    const prefix = index === 0 ? "Prioritas 1" : `Langkah ${index + 1}`;
    return `${prefix}: ${action.label} (${action.duration} menit, aktuator ${action.actuator})`;
  });

  return {
    fuzzySeverity,
    searchPlan: scoredActions.slice(0, 4),
    constrainedPlan,
    anomalyRisk: Number(anomalyRisk.toFixed(2)),
    observations: [
      `Fuzzy severity: rendah ${fuzzySeverity.low}, sedang ${fuzzySeverity.medium}, tinggi ${fuzzySeverity.high}.`,
      `Heuristic search memilih ${scoredActions[0]?.label ?? "monitoring pasif"} sebagai aksi dengan biaya estimasi terendah.`,
      `Constraint aktif: respons maksimal ${maxResponseTime} menit dan aktuator tersedia ${Array.from(availableActuators).join(", ")}.`,
      `Model prediktif berbasis tren historis memberi skor risiko ${Number(anomalyRisk.toFixed(2))}.`,
    ],
    recommendation: isAnomaly
      ? `Jalankan ${scoredActions[0]?.label ?? "prosedur stabilisasi"} lalu verifikasi gauge dan valve dari dashboard visual.`
      : "Pertahankan monitoring, lakukan inspeksi visual berkala, dan siapkan rencana stabilisasi bila skor risiko meningkat.",
  };
};

export const BioGeniusProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [pressure, setPressure] = useState(0.0);
  const [pressureHistory, setPressureHistory] = useState<PressurePoint[]>(generateInitialData);
  const isAnomaly = pressure > 6.0 || (pressure > 0.1 && pressure < 4.0);
  const visualInspection = useMemo(() => buildVisualInspection(pressure, isAnomaly), [pressure, isAnomaly]);
  const aiDecision = useMemo(() => buildAiDecision(pressure, isAnomaly, pressureHistory), [pressure, isAnomaly, pressureHistory]);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: "ai", content: "Sistem AI Bio-Genius aktif. Pipeline searching, fuzzy reasoning, planning, learning, dan visual inspection siap membantu operator." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showPrompts, setShowPrompts] = useState(true);

  const [alertHistory, setAlertHistory] = useState<AlertItem[]>([
    { id: 1, time: "17:00 WIB", message: "Mesin dimatikan secara manual", type: "info" },
    { id: 2, time: "14:15 WIB", message: "Overpressure Detected (7.8 bar)", type: "critical" },
    { id: 3, time: "12:00 WIB", message: "System check performed", type: "info" },
  ]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin" && password === "admin123") {
      setIsLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError("Username atau password salah!");
    }
  };

  const appendPressurePoint = (nextPressure: number) => {
    const now = new Date();
    setPressureHistory(prev => {
      const newHistory = [...prev, {
        time: now.toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        pressure: nextPressure
      }];
      if (newHistory.length > 20) {
        newHistory.shift();
      }
      return newHistory;
    });
  };

  const handleSendMessage = (overrideMessage?: string) => {
    const textToSend = typeof overrideMessage === "string" ? overrideMessage : chatInput;
    if (!textToSend.trim()) return;

    const userMessage = textToSend;
    setChatMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setChatInput("");
    setIsTyping(true);
    setShowPrompts(false);

    setTimeout(() => {
      let aiResponse = "";
      const lowerInput = userMessage.toLowerCase();

      const greetings = ["halo", "hai", "hi", "pagi", "siang", "sore", "malam", "hello", "hei"];
      const isGreeting = greetings.some(g => lowerInput.match(new RegExp(`\b${g}\b`)));

      const affirmations = ["oh", "oke", "ok", "baik", "mengerti", "paham", "ya", "terima kasih", "thanks", "makasih", "siap", "begitu"];
      const isAffirmation = affirmations.some(a => lowerInput.match(new RegExp(`\b${a}\b`)));

      const contextKeywords = ["tekanan", "normal", "apa", "bagaimana", "sistem", "tindakan", "penyebab", "kondisi", "aman", "risiko", "mengapa", "langkah", "status", "kompresor", "solusi", "turun", "naik", "visual", "kamera", "cv", "deteksi", "gauge", "valve", "planning", "fuzzy"];
      const isContextual = contextKeywords.some(k => lowerInput.includes(k)) || lowerInput.length > 25;

      if (isGreeting && !isContextual) {
        aiResponse = "Halo! Saya adalah AI Virtual Consultant Bio-Genius Optimizer. Ada yang bisa saya bantu terkait tekanan, inspeksi visual, atau mitigasi plant hari ini?";
      } else if (isAffirmation && !isContextual) {
        aiResponse = "Baik. Jika ada hal lain terkait tekanan kompresor, visual inspection, atau rencana stabilisasi Bio-CNG yang perlu dianalisis, saya siap membantu.";
      } else if (!isContextual) {
        aiResponse = "Maaf, saya kurang memahami maksud Anda. Saya dirancang untuk menganalisis tekanan kompresor, hasil computer vision, dan rekomendasi tindakan operasional.";
      } else if (lowerInput.includes("visual") || lowerInput.includes("kamera") || lowerInput.includes("cv") || lowerInput.includes("deteksi") || lowerInput.includes("gauge") || lowerInput.includes("valve")) {
        aiResponse = `**Visual Inspection**: Kualitas preprocessing frame saat ini **${Math.round(visualInspection.preprocessing.qualityScore * 100)}%** dengan low-pass, high-pass, contrast stretching, histogram equalization, dan ${visualInspection.preprocessing.interpolation}.

**Object Detection**: ${visualInspection.detections.map((item) => `${item.component}: ${item.label} (${Math.round(item.confidence * 100)}%)`).join("; ")}.

**Motion Tracking**: ${visualInspection.motion.alert}.`;
      } else if (pressure === 0 || pressure < 0.1) {
        aiResponse = `**Analisis**: Tidak ada data aliran yang terdeteksi. Tekanan saat ini **0.00 bar**.

**Fuzzy Reasoning**: Tingkat keparahan dominan **${aiDecision.fuzzySeverity.label}** karena sistem berada pada kondisi OFF, bukan operasi abnormal aktif.

**Rekomendasi**: Pastikan mesin dihidupkan, sensor terhubung, dan kamera visual inspection aktif sebelum memulai pemantauan operasi.`;
      } else if (pressure > 6.0) {
        aiResponse = `**Analisis**: Tekanan kompresor saat ini **${pressure.toFixed(2)} bar**, melebihi batas normal.

**Reasoning Terintegrasi**: Fuzzy severity **${aiDecision.fuzzySeverity.label}**, risiko prediktif **${Math.round(aiDecision.anomalyRisk * 100)}%**, dan object detection menandai **${visualInspection.detections.filter((item) => item.risk !== "normal").length}** komponen perlu perhatian.

**Rencana Mitigasi**:
${aiDecision.constrainedPlan.map((step) => `- ${step}`).join("\\n")}

**Rekomendasi Akhir**: ${aiDecision.recommendation}`;
      } else if (pressure < 4.0) {
        aiResponse = `**Analisis**: Tekanan kompresor saat ini **${pressure.toFixed(2)} bar**, di bawah batas optimal.

**AI Planning**: Sistem memilih urutan aksi dengan heuristic search dan constraint waktu respons.

${aiDecision.constrainedPlan.map((step) => `- ${step}`).join("\\n")}

**Rekomendasi Akhir**: Periksa kebocoran intake, validasi gauge pada visual inspection, lalu stabilkan kompresi bertahap.`;
      } else {
        aiResponse = `**Analisis**: Tekanan kompresor stabil di **${pressure.toFixed(2)} bar**.

**Status AI**: Fuzzy severity **${aiDecision.fuzzySeverity.label}**, risiko prediktif **${Math.round(aiDecision.anomalyRisk * 100)}%**, dan monitoring visual tidak menemukan kondisi kritis.

**Rekomendasi**: Tidak ada tindakan darurat. Lanjutkan pemantauan tekanan, object detection, dan motion tracking.`;
      }

      setChatMessages(prev => [...prev, { role: "ai", content: aiResponse }]);
      setIsTyping(false);
    }, 1500);
  };

  const triggerAnomaly = () => {
    setPressure(6.5);
    appendPressurePoint(6.5);
    const now = new Date();
    const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";
    setAlertHistory(prev => [
      { id: Date.now(), time: timeStr, message: "Simulasi Anomali: Tekanan melonjak ke 6.5 bar dan visual inspection menandai gauge/valve", type: "critical" },
      ...prev
    ]);
  };

  const applySolution = () => {
    setPressure(5.0);
    appendPressurePoint(5.0);
    const now = new Date();
    const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";
    setAlertHistory(prev => [
      { id: Date.now(), time: timeStr, message: "Tindakan Solusi: Rencana AI dijalankan dan sistem dikembalikan ke 5.0 bar", type: "info" },
      ...prev
    ]);
  };

  const activePrompts = isAnomaly ? [
    "Tekanan tidak normal, apa penyebabnya?",
    "Apa rencana mitigasi AI sekarang?",
    "Bagaimana hasil visual inspection?"
  ] : [
    "Apakah kondisi sistem saat ini normal?",
    "Bagaimana hasil visual inspection?",
    "Apakah risiko anomali meningkat?"
  ];

  return (
    <BioGeniusContext.Provider value={{
      isLoggedIn, setIsLoggedIn,
      username, setUsername,
      password, setPassword,
      loginError, handleLogin,
      pressure, pressureHistory, isAnomaly,
      chatMessages, chatInput, setChatInput, isTyping, isChatOpen, setIsChatOpen, showPrompts, setShowPrompts,
      alertHistory, handleSendMessage, triggerAnomaly, applySolution, activePrompts,
      visualInspection, aiDecision
    }}>
      {children}
    </BioGeniusContext.Provider>
  );
};

export const useBioGenius = () => {
  const context = useContext(BioGeniusContext);
  if (!context) {
    throw new Error("useBioGenius must be used within BioGeniusProvider");
  }
  return context;
};

