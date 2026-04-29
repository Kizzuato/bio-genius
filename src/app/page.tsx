"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Settings,
  Send,
  Power,
  Cpu,
  RefreshCw,
  Zap,
  History,
  MessageCircle,
  X,
  Sparkles
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

// Simulated Data for Chart
const generateInitialData = () => {
  const data = [];
  const now = new Date();
  for (let i = 20; i >= 0; i--) {
    data.push({
      time: new Date(now.getTime() - i * 1000).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      pressure: 5.0 + (Math.random() * 0.2 - 0.1),
    });
  }
  return data;
};

export default function BioGeniusApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [pressure, setPressure] = useState(5.0);
  const [pressureHistory, setPressureHistory] = useState(generateInitialData());
  const isAnomaly = pressure > 6.0 || pressure < 4.0;
  
  const [chatMessages, setChatMessages] = useState([
    { role: "ai", content: "Sistem AI Bio-Genius aktif. Siap membantu pemantauan dan optimasi plant." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showPrompts, setShowPrompts] = useState(true);

  const [alertHistory, setAlertHistory] = useState([
    { id: 1, time: "22:15 WIB", message: "Overpressure Detected (18.2 bar)", type: "critical" },
    { id: 2, time: "21:05 WIB", message: "Fluctuating pressure in Tank B", type: "warning" },
    { id: 3, time: "19:00 WIB", message: "System check performed", type: "info" },
  ]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const activePrompts = isAnomaly ? [
    "Tekanan tidak normal, apa penyebabnya?",
    "Apa yang harus saya lakukan sekarang?",
    "Bagaimana cara menstabilkan sistem?"
  ] : [
    "Apakah kondisi sistem saat ini normal?",
    "Apakah perlu tindakan tambahan?",
    "Apakah kondisi sekarang aman?"
  ];

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin" && password === "admin123") {
      setIsLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError("Username atau password salah!");
    }
  };



  // Update Chart Data periodically if no manual intervention
  useEffect(() => {
    if (!isLoggedIn) return;
    
    const interval = setInterval(() => {
      setPressure((prev) => {
        // Add slight random noise to current pressure
        let nextPressure = prev + (Math.random() * 0.1 - 0.05);
        
        // If it's supposed to be an anomaly, keep it high
        if (prev >= 6.5) {
          nextPressure = 6.5 + (Math.random() * 0.2 - 0.1);
        } else if (prev <= 3.5) {
          nextPressure = 3.5 + (Math.random() * 0.2 - 0.1);
        } else {
          // If normal, slowly drift towards 5.0
          const diff = 5.0 - nextPressure;
          nextPressure += diff * 0.1;
        }
        
        // Format to 2 decimal places
        return Math.round(nextPressure * 100) / 100;
      });
    }, 2000);
    
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  // Update History Array when pressure changes
  useEffect(() => {
    const now = new Date();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPressureHistory(prev => {
      const newHistory = [...prev, {
        time: now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        pressure: pressure
      }];
      if (newHistory.length > 20) {
        newHistory.shift();
      }
      return newHistory;
    });
  }, [pressure]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isTyping]);

  // AI Chat Simulation
  const handleSendMessage = (overrideMessage?: string) => {
    const textToSend = typeof overrideMessage === 'string' ? overrideMessage : chatInput;
    if (!textToSend.trim()) return;

    const userMessage = textToSend;
    setChatMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setChatInput("");
    setIsTyping(true);
    setShowPrompts(false);

    setTimeout(() => {
      let aiResponse = "";
      const lowerInput = userMessage.toLowerCase();
      
      // Deteksi sapaan
      const greetings = ["halo", "hai", "hi", "pagi", "siang", "sore", "malam", "hello", "hei"];
      const isGreeting = greetings.some(g => lowerInput.match(new RegExp(`\\b${g}\\b`)));

      // Deteksi afirmasi / penutup
      const affirmations = ["oh", "oke", "ok", "baik", "mengerti", "paham", "ya", "terima kasih", "thanks", "makasih", "siap", "begitu"];
      const isAffirmation = affirmations.some(a => lowerInput.match(new RegExp(`\\b${a}\\b`)));
      
      // Deteksi konteks pertanyaan yang valid
      const contextKeywords = ["tekanan", "normal", "apa", "bagaimana", "sistem", "tindakan", "penyebab", "kondisi", "aman", "risiko", "mengapa", "langkah", "status", "kompresor", "solusi", "turun", "naik"];
      const isContextual = contextKeywords.some(k => lowerInput.includes(k)) || lowerInput.length > 25;

      if (isGreeting && !isContextual) {
        aiResponse = "Halo! Saya adalah AI Virtual Consultant Bio-Genius Optimizer. Ada yang bisa saya bantu terkait pemantauan tekanan kompresor hari ini?";
      } else if (isAffirmation && !isContextual) {
        aiResponse = "Baik. Jika ada hal lain terkait **tekanan kompresor** atau operasional plant Bio-CNG yang perlu dianalisis, saya siap membantu kapan saja!";
      } else if (!isContextual) {
        aiResponse = "Maaf, saya kurang memahami maksud Anda. Sebagai AI Consultant, saya dirancang untuk menganalisis **tekanan kompresor** dan memberikan rekomendasi operasional. Silakan gunakan template pertanyaan yang tersedia atau tanyakan kondisi sistem saat ini.";
      } else {
        // Analyze current condition
        if (pressure > 6.0) {
          aiResponse = `**Analisis**: Tekanan kompresor saat ini berada di **${pressure.toFixed(2)} bar**, yang melebihi batas normal (5 bar).\n\n**Potensi Masalah**: Tekanan berlebih (overpressure) dapat menyebabkan efisiensi proses menurun, kerusakan seal kompresor, dan risiko kebocoran pada sistem perpipaan.\n\n**Rekomendasi Tindakan**: Segera lakukan "Venting" (pelepasan tekanan berlebih) atau sesuaikan putaran kompresor untuk menstabilkan sistem ke 5 bar.`;
        } else if (pressure < 4.0) {
          aiResponse = `**Analisis**: Tekanan kompresor saat ini berada di **${pressure.toFixed(2)} bar**, yang berada di bawah batas optimal (5 bar).\n\n**Potensi Masalah**: Kurangnya tekanan (underpressure) dapat menyebabkan suplai gas ke unit pemurnian tidak maksimal, menurunkan kualitas output Bio-CNG.\n\n**Rekomendasi Tindakan**: Periksa apakah ada kebocoran atau masalah pada sistem intake. Tingkatkan daya kompresi untuk mengembalikan ke 5 bar.`;
        } else {
          aiResponse = `**Analisis**: Tekanan kompresor stabil di **${pressure.toFixed(2)} bar**.\n\n**Status**: Sistem beroperasi pada efisiensi optimal.\n\n**Rekomendasi**: Tidak ada tindakan darurat yang diperlukan. Terus pantau parameter operasi lainnya.`;
        }
      }

      setChatMessages(prev => [...prev, { role: "ai", content: aiResponse }]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  // Actions
  const triggerAnomaly = () => {
    setPressure(6.5);
    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    setAlertHistory(prev => [
      { id: Date.now(), time: timeStr, message: "Simulasi Anomali: Tekanan melonjak ke 6.5 bar", type: "critical" },
      ...prev
    ]);
  };

  const applySolution = () => {
    setPressure(5.0);
    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    setAlertHistory(prev => [
      { id: Date.now(), time: timeStr, message: "Solusi diterapkan: Tekanan kembali normal", type: "info" },
      ...prev
    ]);
    setChatMessages(prev => [...prev, { 
      role: "ai", 
      content: "✅ **Tindakan Berhasil**: Penyesuaian tekanan telah diterapkan. Sistem kembali ke kondisi normal (5 bar)." 
    }]);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
          <div className="p-8 text-center bg-gradient-to-br from-indigo-900 to-slate-800 border-b border-slate-700">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/20 mb-4 ring-4 ring-indigo-500/10">
              <Zap className="w-8 h-8 text-indigo-400" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Bio-Genius Optimizer</h1>
            <p className="text-slate-400 mt-2 text-sm">AI Decision Support System</p>
          </div>
          
          <div className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {loginError && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {loginError}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                  placeholder="admin"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                  placeholder="admin123"
                />
              </div>
              
              <button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Login to System
              </button>
              
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex-1 flex flex-col overflow-x-hidden bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-sm w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4 bg-slate-900">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight truncate min-w-0">Bio-Genius <span className="text-indigo-400 font-medium">Optimizer</span></h1>
          </div>
          
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 shrink-0">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
              <span className="text-xs font-medium text-slate-300 whitespace-nowrap">System Online</span>
            </div>
            <button 
              onClick={() => setIsLoggedIn(false)}
              className="text-slate-400 hover:text-white transition-colors shrink-0"
              title="Logout"
            >
              <Power className="w-5 h-5 shrink-0" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full relative z-0">
        {/* Top Status Bar */}
        {isAnomaly && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start sm:items-center gap-4 shadow-lg shadow-red-500/5 animate-in fade-in slide-in-from-top-4">
            <div className="bg-red-500/20 p-2 rounded-lg text-red-400 flex-shrink-0">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div className="flex-1">
              <h3 className="text-red-400 font-semibold">Peringatan: Anomali Terdeteksi</h3>
              <p className="text-red-300/80 text-sm mt-1">⚠️ Tekanan tidak normal, sistem berpotensi tidak efisien. Tanyakan pada AI untuk rekomendasi tindakan.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0">
          
          {/* Left Column: Metrics & Chart */}
          <div className="lg:col-span-2 space-y-6 min-w-0">
            
            {/* Primary Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <span>Target: 5.0 bar</span>
                  </div>
                  <div className={`font-medium ${isAnomaly ? 'text-red-400' : 'text-emerald-400'}`}>
                    {isAnomaly ? 'Kritis' : 'Optimal'}
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-4 flex items-center gap-2">
                    <Settings className="w-4 h-4" /> Kontrol Panel
                  </h3>
                  <div className="space-y-3">
                    <button 
                      onClick={triggerAnomaly}
                      className="w-full flex items-center justify-between px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all group"
                    >
                      <span className="font-medium text-slate-300 group-hover:text-white transition-colors">Simulasi Anomali</span>
                      <RefreshCw className="w-4 h-4 text-slate-500 group-hover:text-red-400 transition-colors" />
                    </button>
                    
                    <button 
                      onClick={applySolution}
                      disabled={!isAnomaly}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all border ${
                        isAnomaly 
                        ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30' 
                        : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <span className="font-medium">Terapkan Solusi</span>
                      <Zap className={`w-4 h-4 ${isAnomaly ? 'text-indigo-400' : 'text-slate-600'}`} />
                    </button>
                  </div>
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
                <ResponsiveContainer width="100%" height="100%">
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
                    {/* Safe zone indicator area */}
                    <svg>
                      <defs>
                        <linearGradient id="safeZone" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.1} />
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                    </svg>
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
              {alertHistory.map(alert => (
                <div key={alert.id} className={`p-4 rounded-r-lg border-l-4 ${
                  alert.type === 'critical' ? 'bg-red-950/30 border-red-500' :
                  alert.type === 'warning' ? 'bg-orange-950/30 border-orange-500' :
                  'bg-slate-800/50 border-slate-600'
                }`}>
                  <div className={`text-xs mb-1 ${
                    alert.type === 'critical' ? 'text-red-400' :
                    alert.type === 'warning' ? 'text-orange-400' :
                    'text-slate-400'
                  }`}>Pukul {alert.time}</div>
                  <div className="text-sm font-medium text-slate-200">{alert.message}</div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </main>

      {/* Floating AI Chatbot Button */}
      <button 
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/30 transition-all z-50 hover:scale-110 active:scale-95"
      >
        {isChatOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Floating AI Chatbot Window */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 w-[calc(100vw-3rem)] max-w-[380px] bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[500px] max-h-[calc(100vh-8rem)] overflow-hidden shadow-2xl shadow-black/50 z-50 animate-in slide-in-from-bottom-8 fade-in duration-300">
          <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">AI Virtual Consultant</h3>
                <p className="text-xs text-indigo-400">Azure ML Agent (Simulated)</p>
              </div>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/50">
            {chatMessages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user" 
                    ? "bg-indigo-600 text-white rounded-tr-sm shadow-md" 
                    : "bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm shadow-md"
                }`}>
                  {msg.content.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {/* Simple markdown parsing for bold text */}
                      {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return <strong key={j} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
                        }
                        return part;
                      })}
                      {i < msg.content.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
                <div className="bg-slate-800 border border-slate-700 text-slate-400 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-3 border-t border-slate-800 bg-slate-900 shrink-0 flex flex-col gap-3">
            {/* Suggested Prompts */}
            {showPrompts && (
              <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2">
                {activePrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(prompt)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-indigo-600/50 hover:border-indigo-500/50 text-slate-300 text-[11px] leading-tight text-left rounded-xl border border-slate-700 transition-colors flex-1 min-w-[120px] sm:min-w-[auto] sm:flex-none"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-1 shadow-inner focus-within:ring-1 focus-within:ring-indigo-500/50 focus-within:border-indigo-500/50 transition-all">
              <button 
                onClick={() => setShowPrompts(!showPrompts)}
                className={`p-2 rounded-lg transition-colors ${showPrompts ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500 hover:text-slate-300'}`}
                title="Toggle Saran Pertanyaan"
              >
                <Sparkles className="w-4 h-4" />
              </button>
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ketik manual atau pilih template..."
                className="flex-1 bg-transparent px-3 py-2 text-sm text-white focus:outline-none placeholder:text-slate-500"
              />
              <button 
                onClick={() => handleSendMessage()}
                disabled={!chatInput.trim() || isTyping}
                className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-center text-[10px] text-slate-500 mt-1">
              AI memberikan saran berdasarkan parameter real-time
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
