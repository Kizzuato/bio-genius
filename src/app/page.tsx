"use client";

import React from "react";
import { useBioGenius, type AlertItem, type MitigationAction, type SegmentedRegion, type VisualDetection, type VisualFeature } from "@/context/BioGeniusContext";
import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  Camera,
  CheckCircle,
  Eye,
  Gauge,
  History,
  Network,
  Route,
  ScanLine,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const riskClass = {
  normal: "border-emerald-400 text-emerald-300 bg-emerald-500/10",
  warning: "border-amber-400 text-amber-300 bg-amber-500/10",
  critical: "border-red-400 text-red-300 bg-red-500/10",
};

const barClass = (risk: string) => {
  if (risk === "critical") return "bg-red-400";
  if (risk === "warning") return "bg-amber-400";
  return "bg-emerald-400";
};

export default function DashboardPage() {
  const { pressure, pressureHistory, isAnomaly, alertHistory, visualInspection, aiDecision } = useBioGenius();
  const statusLabel = pressure < 0.1 ? "Offline" : isAnomaly ? "Kritis" : "Optimal";

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {isAnomaly && (
        <div className="border border-red-500/30 bg-red-500/10 p-4 flex items-start sm:items-center gap-4 shadow-lg shadow-red-500/5 animate-in fade-in slide-in-from-top-4">
          <div className="bg-red-500/20 p-2 rounded-lg text-red-400 shrink-0">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div className="flex-1">
            <h3 className="text-red-400 font-semibold">Peringatan: Anomali Terdeteksi</h3>
            <p className="text-red-300/80 text-sm mt-1">Tekanan tidak normal dan pipeline visual inspection menemukan komponen yang perlu diverifikasi operator.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.75fr)] gap-6 min-w-0">
        <div className="space-y-6 min-w-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 transform group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                <Activity className="w-24 h-24" />
              </div>
              <div className="flex justify-between items-start relative z-10 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-1">Tekanan Kompresor</p>
                  <div className="flex items-baseline gap-2">
                    <h2 className={`text-5xl font-bold tracking-tight ${isAnomaly ? "text-red-400" : pressure < 0.1 ? "text-slate-300" : "text-emerald-400"}`}>
                      {pressure.toFixed(2)}
                    </h2>
                    <span className="text-slate-500 font-medium">bar</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl shadow-inner ${isAnomaly ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                  {isAnomaly ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="inline-block w-2 h-2 rounded-full bg-slate-600"></span>
                  <span>Target: 5.00 bar</span>
                </div>
                <div className={`font-medium ${isAnomaly ? "text-red-400" : pressure < 0.1 ? "text-slate-400" : "text-emerald-400"}`}>{statusLabel}</div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6">
              <div className="flex items-center gap-2 text-slate-200 mb-4">
                <BrainCircuit className="w-5 h-5 text-cyan-300" />
                <h3 className="font-semibold">AI Severity</h3>
              </div>
              <div className="space-y-3">
                {[
                  ["Rendah", aiDecision.fuzzySeverity.low, "bg-emerald-400"],
                  ["Sedang", aiDecision.fuzzySeverity.medium, "bg-amber-400"],
                  ["Tinggi", aiDecision.fuzzySeverity.high, "bg-red-400"],
                ].map(([label, value, color]) => (
                  <div key={label as string}>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>{label as string}</span>
                      <span>{Math.round((value as number) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-slate-800 overflow-hidden">
                      <div className={`h-full ${color as string}`} style={{ width: `${(value as number) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-slate-800">
                <p className="text-xs text-slate-500">Prediksi Anomali</p>
                <p className="text-2xl font-bold text-white mt-1">{Math.round(aiDecision.anomalyRisk * 100)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 shadow-sm min-w-0">
            <div className="flex items-center justify-between mb-6 gap-4">
              <h3 className="text-base font-semibold text-white">Monitoring Tekanan Real-time</h3>
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-800 px-2 py-1 border border-slate-700">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Aktual
              </span>
            </div>
            <div className="h-72 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <LineChart data={pressureHistory} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickMargin={10} minTickGap={30} />
                  <YAxis domain={[0, 8]} stroke="#64748b" fontSize={12} tickCount={6} tickFormatter={(val) => `${val} bar`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "8px" }}
                    itemStyle={{ color: "#67e8f9" }}
                    labelStyle={{ color: "#94a3b8", marginBottom: "4px" }}
                  />
                  <Line type="monotone" dataKey="pressure" stroke={isAnomaly ? "#f87171" : "#67e8f9"} strokeWidth={3} dot={false} activeDot={{ r: 6, fill: isAnomaly ? "#ef4444" : "#06b6d4", stroke: "#1e293b", strokeWidth: 2 }} animationDuration={300} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <section className="bg-slate-900 border border-slate-800 p-6">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-2 text-slate-200">
                <Eye className="w-5 h-5 text-emerald-300" />
                <h3 className="font-semibold text-lg tracking-tight">Pembacaan APD YOLO</h3>
              </div>
              <span className="text-xs text-slate-400 border border-slate-700 px-2 py-1">IFB301 APD Pipeline</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)] gap-5">
              <div className="border border-slate-800 bg-slate-950 min-h-[320px] relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:28px_28px]" />
                <div className="absolute left-[8%] right-[8%] top-[35%] h-12 bg-slate-700 border border-slate-500 shadow-lg" />
                <div className="absolute left-[18%] top-[25%] h-32 w-16 border-4 border-slate-600 bg-slate-800" />
                <div className="absolute right-[9%] top-[11%] h-24 w-24 rounded-full border-8 border-slate-600 bg-slate-800 flex items-center justify-center">
                  <Gauge className={`w-11 h-11 ${isAnomaly ? "text-red-300" : "text-emerald-300"}`} />
                </div>
                <div className="absolute right-[23%] bottom-[18%] h-28 w-20 bg-slate-800 border border-slate-600" />
                <div className="absolute left-[56%] top-[39%] h-20 w-20 rounded-full border-8 border-slate-600 bg-slate-900" />
                <div className={`absolute left-[59%] top-[47%] h-2 w-16 origin-left ${isAnomaly ? "rotate-12 bg-amber-300" : "rotate-90 bg-emerald-300"}`} />
                {visualInspection.detections.map((item: VisualDetection) => (
                  <div
                    key={item.id}
                    className={`absolute border-2 ${riskClass[item.risk as keyof typeof riskClass]} p-1`}
                    style={{ left: `${item.box.x}%`, top: `${item.box.y}%`, width: `${item.box.width}%`, height: `${item.box.height}%` }}
                  >
                    <span className="absolute -top-6 left-0 bg-slate-950 border border-current px-2 py-0.5 text-[10px] whitespace-nowrap">
                      {item.label} {Math.round(item.confidence * 100)}%
                    </span>
                  </div>
                ))}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-400">
                  <span className="inline-flex items-center gap-2"><Camera className="w-4 h-4" /> CCTV-COMP-01</span>
                  <span>Stitching coverage {visualInspection.motion.stitchingCoverage}%</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="border border-slate-800 bg-slate-950 p-4">
                  <div className="flex items-center gap-2 mb-3 text-slate-200"><ScanLine className="w-4 h-4 text-cyan-300" /><h4 className="font-medium text-sm">Preprocessing Citra</h4></div>
                  {[
                    ["Low-pass", visualInspection.preprocessing.lowPass],
                    ["High-pass", visualInspection.preprocessing.highPass],
                    ["Contrast stretching", visualInspection.preprocessing.contrastStretching],
                    ["Histogram equalization", visualInspection.preprocessing.histogramEqualization],
                  ].map(([label, value]) => (
                    <div key={label as string} className="mb-2">
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1"><span>{label as string}</span><span>{Math.round((value as number) * 100)}%</span></div>
                      <div className="h-1.5 bg-slate-800"><div className="h-full bg-cyan-300" style={{ width: `${(value as number) * 100}%` }} /></div>
                    </div>
                  ))}
                </div>

                <div className="border border-slate-800 bg-slate-950 p-4">
                  <div className="flex items-center gap-2 mb-3 text-slate-200"><Network className="w-4 h-4 text-emerald-300" /><h4 className="font-medium text-sm">Segmentasi Komponen</h4></div>
                  <div className="grid grid-cols-2 gap-2">
                    {visualInspection.segmentation.map((region: SegmentedRegion) => (
                      <div key={region.id} className="border border-slate-800 p-2">
                        <p className="text-xs text-white truncate">{region.component}</p>
                        <p className="text-[10px] text-slate-500 truncate">{region.method}</p>
                        <p className="text-[11px] text-cyan-300 mt-1">{region.coverage}% area</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-5">
              <div className="border border-slate-800 bg-slate-950 p-4 lg:col-span-2">
                <div className="flex items-center gap-2 mb-3 text-slate-200"><Sparkles className="w-4 h-4 text-amber-300" /><h4 className="font-medium text-sm">Ekstraksi Fitur Visual</h4></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {visualInspection.features.map((feature: VisualFeature) => (
                    <div key={feature.component} className="border border-slate-800 p-3">
                      <p className="text-sm font-medium text-white mb-2">{feature.component}</p>
                      <p className="text-xs text-slate-400">Warna: {feature.color}</p>
                      <p className="text-xs text-slate-400 mt-1">Tekstur: {feature.texture}</p>
                      <p className="text-xs text-slate-400 mt-1">Bentuk: {feature.shape}</p>
                      <p className="text-xs text-cyan-300 mt-2">{feature.finding}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-center gap-2 mb-3 text-slate-200"><Activity className="w-4 h-4 text-red-300" /><h4 className="font-medium text-sm">Video & Motion Tracking</h4></div>
                <div className="flex items-end gap-2 h-24 mb-3">
                  {visualInspection.motion.motionMap.map((value: number, index: number) => (
                    <div key={index} className="flex-1 bg-slate-800 flex items-end h-full">
                      <div className={barClass(isAnomaly && value > 60 ? "critical" : value > 40 ? "warning" : "normal")} style={{ height: `${value}%`, width: "100%" }} />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-400">Optical flow score: {visualInspection.motion.opticalFlowScore}</p>
                <p className={`text-xs mt-2 ${isAnomaly ? "text-red-300" : "text-emerald-300"}`}>{visualInspection.motion.alert}</p>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-6 min-w-0">
          <div className="bg-slate-900 border border-slate-800 p-6 shadow-xl shadow-black/20 min-w-0">
            <div className="flex items-center gap-2 mb-5 text-slate-200">
              <Route className="w-5 h-5 text-cyan-300" />
              <h3 className="font-semibold text-lg tracking-tight">AI Decision Pipeline</h3>
            </div>
            <div className="space-y-3">
              {aiDecision.searchPlan.map((action: MitigationAction, index: number) => (
                <div key={action.id} className="border border-slate-800 bg-slate-950 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-white">{index + 1}. {action.label}</p>
                    <span className="text-[11px] text-cyan-300">{action.duration}m</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Effect {action.effect > 0 ? "+" : ""}{action.effect} bar, safety {Math.round(action.safety * 100)}%, actuator {action.actuator}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 border-t border-slate-800 pt-4">
              <div className="flex items-center gap-2 text-slate-200 mb-3"><ShieldCheck className="w-4 h-4 text-emerald-300" /><h4 className="text-sm font-medium">Constraint-Based Planning</h4></div>
              <div className="space-y-2">
                {aiDecision.constrainedPlan.map((step: string) => (
                  <p key={step} className="text-xs text-slate-300 bg-slate-950 border border-slate-800 p-2">{step}</p>
                ))}
              </div>
            </div>
            <div className="mt-5 border-t border-slate-800 pt-4">
              <h4 className="text-sm font-medium text-white mb-2">Log Observasi Sistem</h4>
              <div className="space-y-2">
                {aiDecision.observations.map((item: string) => (
                  <p key={item} className="text-xs text-slate-400 leading-relaxed">{item}</p>
                ))}
              </div>
              <p className="text-sm text-cyan-200 mt-4 leading-relaxed">{aiDecision.recommendation}</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 shadow-xl shadow-black/20 min-w-0">
            <div className="flex items-center gap-2 mb-6 text-slate-200">
              <History className="w-5 h-5 text-amber-400" />
              <h3 className="font-semibold text-lg tracking-tight">Histori Alert</h3>
            </div>
            <div className="space-y-4 max-h-[520px] overflow-y-auto pr-2 custom-scrollbar">
              {alertHistory.map((alert: AlertItem) => (
                <div key={alert.id} className={`p-4 border-l-4 ${alert.type === "critical" ? "bg-red-950/30 border-red-500" : alert.type === "warning" ? "bg-amber-950/30 border-amber-500" : "bg-slate-800/50 border-slate-600"}`}>
                  <div className={`text-xs mb-1 ${alert.type === "critical" ? "text-red-400" : alert.type === "warning" ? "text-amber-400" : "text-slate-400"}`}>Pukul {alert.time}</div>
                  <div className="text-sm font-medium text-slate-200">{alert.message}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
