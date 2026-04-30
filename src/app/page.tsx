"use client";

import React from "react";
import { useBioGenius } from "@/context/BioGeniusContext";
import { Activity, AlertTriangle, CheckCircle, History } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardPage() {
  const { pressure, pressureHistory, isAnomaly, alertHistory } = useBioGenius();

  return (
    <div className="space-y-6">
      {/* Top Status Bar */}
      {isAnomaly && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start sm:items-center gap-4 shadow-lg shadow-red-500/5 animate-in fade-in slide-in-from-top-4">
          <div className="bg-red-500/20 p-2 rounded-lg text-red-400 flex-shrink-0">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div className="flex-1">
            <h3 className="text-red-400 font-semibold">Peringatan: Anomali Terdeteksi</h3>
            <p className="text-red-300/80 text-sm mt-1">⚠️ Tekanan tidak normal, sistem berpotensi tidak efisien. Tanyakan pada AI untuk rekomendasi tindakan.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0 p-8">
        {/* Left Column: Metrics & Chart */}
        <div className="lg:col-span-2 space-y-6 min-w-0 ">
          {/* Primary Metric Cards */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 transform group-hover:scale-110 transition-transform duration-500 pointer-events-none">
              <Activity className="w-24 h-24" />
            </div>
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">Tekanan Kompresor</p>
                <div className="flex items-baseline gap-2">
                  <h2 className={`text-5xl font-bold tracking-tight ${isAnomaly ? 'text-red-400' : 'text-emerald-400'}`}>
                    {pressure.toFixed(2)}
                  </h2>
                  <span className="text-slate-500 font-medium">bar</span>
                </div>
              </div>
              <div className={`p-3 rounded-xl shadow-inner ${isAnomaly ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {isAnomaly ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-slate-400">
                <span className="inline-block w-2 h-2 rounded-full bg-slate-600"></span>
                <span>Target: - bar</span>
              </div>
              <div className={`font-medium ${isAnomaly ? 'text-red-400' : 'text-emerald-400'}`}>
                {isAnomaly ? 'Kritis' : 'Optimal'}
              </div>
            </div>
          </div>

          {/* Chart Area */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm min-w-0">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold text-white">Monitoring Tekanan Real-time</h3>
              <div className="flex gap-2">
                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-800 px-2 py-1 rounded-md border border-slate-700">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Aktual
                </span>
              </div>
            </div>

            <div className="h-72 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <LineChart data={pressureHistory} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis
                    dataKey="time"
                    stroke="#64748b"
                    fontSize={12}
                    tickMargin={10}
                    minTickGap={30}
                  />
                  <YAxis
                    domain={[3, 8]}
                    stroke="#64748b"
                    fontSize={12}
                    tickCount={6}
                    tickFormatter={(val) => `${val} bar`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                    itemStyle={{ color: '#818cf8' }}
                    labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="pressure"
                    stroke={isAnomaly ? "#f87171" : "#818cf8"}
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, fill: isAnomaly ? "#ef4444" : "#6366f1", stroke: "#1e293b", strokeWidth: 2 }}
                    animationDuration={300}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Histori Alert */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:sticky lg:top-24 h-fit shadow-xl shadow-black/20 min-w-0">
          <div className="flex items-center gap-2 mb-6 text-slate-200">
            <History className="w-5 h-5 text-orange-400" />
            <h3 className="font-semibold text-lg tracking-tight">Histori Alert</h3>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {alertHistory.map((alert: any) => (
              <div key={alert.id} className={`p-4 rounded-r-lg border-l-4 ${alert.type === 'critical' ? 'bg-red-950/30 border-red-500' :
                  alert.type === 'warning' ? 'bg-orange-950/30 border-orange-500' :
                    'bg-slate-800/50 border-slate-600'
                }`}>
                <div className={`text-xs mb-1 ${alert.type === 'critical' ? 'text-red-400' :
                    alert.type === 'warning' ? 'text-orange-400' :
                      'text-slate-400'
                  }`}>Pukul {alert.time}</div>
                <div className="text-sm font-medium text-slate-200">{alert.message}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
