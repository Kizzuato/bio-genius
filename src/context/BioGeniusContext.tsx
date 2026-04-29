"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";

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

const BioGeniusContext = createContext<any>(null);

export const BioGeniusProvider = ({ children }: { children: React.ReactNode }) => {
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
        let nextPressure = prev + (Math.random() * 0.1 - 0.05);
        if (prev >= 6.5) {
          nextPressure = 6.5 + (Math.random() * 0.2 - 0.1);
        } else if (prev <= 3.5) {
          nextPressure = 3.5 + (Math.random() * 0.2 - 0.1);
        } else {
          const diff = 5.0 - nextPressure;
          nextPressure += diff * 0.1;
        }
        return Math.round(nextPressure * 100) / 100;
      });
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
