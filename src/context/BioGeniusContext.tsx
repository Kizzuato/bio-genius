"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";

// Simulated Data for Chart
const generateInitialData = () => {
  const data = [];
  const now = new Date();
  for (let i = 20; i >= 0; i--) {
    data.push({
      time: new Date(now.getTime() - i * 1000).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      pressure: 0.0,
    });
  }
  return data;
};

const BioGeniusContext = createContext<any>(null);

export const BioGeniusProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [pressure, setPressure] = useState(0.0);
  const [pressureHistory, setPressureHistory] = useState<any[]>([]);
  const isAnomaly = false;

  useEffect(() => {
    // Inisialisasi data chart
    setPressureHistory(generateInitialData());

    // Set pressure awal langsung ke 0
    setPressure(0.0);

    // Tambahkan log anomali otomatis ke history alert
    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

  }, []);

  const [chatMessages, setChatMessages] = useState([
    { role: "ai", content: "Sistem AI Bio-Genius aktif. Siap membantu pemantauan dan optimasi plant." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showPrompts, setShowPrompts] = useState(true);

  const [alertHistory, setAlertHistory] = useState([
    { id: 1, time: "17:00 WIB", message: "Mesin dimatikan secara manual", type: "info" },
    { id: 2, time: "14:15 WIB", message: "Overpressure Detected (7.8 bar)", type: "critical" },
    { id: 3, time: "12:00 WIB", message: "System check performed", type: "info" },
  ]);

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
      setPressure(0.0);
    }, 2000);

    return () => clearInterval(interval);
  }, [isLoggedIn]);

  // Update History Array when pressure changes
  useEffect(() => {
    const now = new Date();
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

      const greetings = ["halo", "hai", "hi", "pagi", "siang", "sore", "malam", "hello", "hei"];
      const isGreeting = greetings.some(g => lowerInput.match(new RegExp(`\\b${g}\\b`)));

      const affirmations = ["oh", "oke", "ok", "baik", "mengerti", "paham", "ya", "terima kasih", "thanks", "makasih", "siap", "begitu"];
      const isAffirmation = affirmations.some(a => lowerInput.match(new RegExp(`\\b${a}\\b`)));

      const contextKeywords = ["tekanan", "normal", "apa", "bagaimana", "sistem", "tindakan", "penyebab", "kondisi", "aman", "risiko", "mengapa", "langkah", "status", "kompresor", "solusi", "turun", "naik"];
      const isContextual = contextKeywords.some(k => lowerInput.includes(k)) || lowerInput.length > 25;

      if (isGreeting && !isContextual) {
        aiResponse = "Halo! Saya adalah AI Virtual Consultant Bio-Genius Optimizer. Ada yang bisa saya bantu terkait pemantauan tekanan kompresor hari ini?";
      } else if (isAffirmation && !isContextual) {
        aiResponse = "Baik. Jika ada hal lain terkait **tekanan kompresor** atau operasional plant Bio-CNG yang perlu dianalisis, saya siap membantu kapan saja!";
      } else if (!isContextual) {
        aiResponse = "Maaf, saya kurang memahami maksud Anda. Sebagai AI Consultant, saya dirancang untuk menganalisis **tekanan kompresor** dan memberikan rekomendasi operasional. Silakan gunakan template pertanyaan yang tersedia atau tanyakan kondisi sistem saat ini.";
      } else {
        if (pressure === 0 || pressure < 0.1) {
          aiResponse = `**Analisis**: Tidak ada data aliran yang terdeteksi. Tekanan saat ini **0.00 bar**.\n\n**Status**: Mesin kompresor dan sensor dalam keadaan **tidak aktif** (OFF).\n\n**Rekomendasi**: Pastikan mesin dihidupkan dan sensor terhubung untuk memulai pemantauan operasi.`;
        } else if (pressure > 6.0) {
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
      { id: Date.now(), time: timeStr, message: "Tindakan Solusi: Sistem dikembalikan ke 5.0 bar", type: "info" },
      ...prev
    ]);
  };

  const activePrompts = isAnomaly ? [
    "Tekanan tidak normal, apa penyebabnya?",
    "Apa yang harus saya lakukan sekarang?",
    "Bagaimana cara menstabilkan sistem?"
  ] : [
    "Apakah kondisi sistem saat ini normal?",
    "Apakah perlu tindakan tambahan?",
    "Apakah kondisi sekarang aman?"
  ];

  return (
    <BioGeniusContext.Provider value={{
      isLoggedIn, setIsLoggedIn,
      username, setUsername,
      password, setPassword,
      loginError, handleLogin,
      pressure, pressureHistory, isAnomaly,
      chatMessages, chatInput, setChatInput, isTyping, isChatOpen, setIsChatOpen, showPrompts, setShowPrompts,
      alertHistory, handleSendMessage, triggerAnomaly, applySolution, activePrompts
    }}>
      {children}
    </BioGeniusContext.Provider>
  );
};

export const useBioGenius = () => useContext(BioGeniusContext);
