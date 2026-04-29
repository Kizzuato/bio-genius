"use client";

import React from "react";
import { useBioGenius } from "@/context/BioGeniusContext";
import { AlertTriangle, Settings, RefreshCw, Zap } from "lucide-react";

export default function ControlPanelPage() {
  const { pressure, isAnomaly, triggerAnomaly, applySolution } = useBioGenius();

  return (
    <div className="max-w-2xl mx-auto mt-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl shadow-black/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Settings className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Kontrol Panel Plant Bio-CNG</h2>
            <p className="text-sm text-slate-400">Manajemen manual parameter kompresi dan simulasi</p>
          </div>
        </div>

        {isAnomaly && (
          <div className="mb-8 bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-start gap-4 animate-in fade-in slide-in-from-top-2">
            <div className="bg-rose-500/20 p-2 rounded-full shrink-0">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <h3 className="text-rose-400 font-semibold mb-1">Peringatan Sistem: Tekanan Tidak Normal</h3>
              <p className="text-rose-200/80 text-sm">Tekanan saat ini ({pressure.toFixed(2)} bar) berada di luar batas aman (4.0 - 6.0 bar). Segera lakukan tindakan untuk menstabilkan sistem.</p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-950/50 hover:border-slate-700 transition-colors">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Simulasi Gangguan (Training Mode)</h4>
            <p className="text-sm text-slate-500 mb-6">Memicu lonjakan tekanan secara tiba-tiba untuk melatih AI dan menguji sistem respons peringatan pada Dashboard.</p>
            <button 
              onClick={triggerAnomaly}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-4 rounded-xl transition-colors border border-slate-700 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4 text-slate-400" />
              Picu Simulasi Anomali
            </button>
          </div>

          <div className="p-6 rounded-xl border border-slate-800 bg-slate-950/50 hover:border-slate-700 transition-colors">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Tindakan Mitigasi</h4>
            <p className="text-sm text-slate-500 mb-6">Secara otomatis menyesuaikan rasio kompresi dan melakukan venting jika diperlukan untuk mengembalikan sistem ke 5.0 bar.</p>
            <button 
              onClick={applySolution}
              disabled={pressure <= 5.5 && pressure >= 4.5}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 text-white/80" />
              Terapkan Solusi Stabilisasi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
