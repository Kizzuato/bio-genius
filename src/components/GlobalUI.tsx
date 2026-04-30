"use client";

import React, { useRef } from "react";
import { useBioGenius } from "@/context/BioGeniusContext";
import { Cpu, X, Send, Sparkles, Power, MessageCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function GlobalUI({ children }: { children: React.ReactNode }) {
  const {
    isLoggedIn, password, username, setPassword, setUsername, handleLogin, loginError,
    isChatOpen, setIsChatOpen, chatMessages, isTyping, chatInput, setChatInput, handleSendMessage, showPrompts, setShowPrompts, activePrompts, setIsLoggedIn
  } = useBioGenius();

  const chatEndRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 selection:bg-indigo-500/30">
        <div className="w-full max-w-md">
          <div className="text-center mb-10 animate-in slide-in-from-bottom-4 fade-in duration-700">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/20 mb-6">
              <span className="text-2xl font-bold text-white">BG</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-3">Bio-Genius</h1>
            <p className="text-slate-400">Monitoring & Optimizer Platform</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl animate-in slide-in-from-bottom-8 fade-in duration-700 delay-150 fill-mode-backwards">
            <h2 className="text-xl font-semibold text-white mb-6">Operator Login</h2>

            {loginError && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                  placeholder="admin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                  placeholder="admin123"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-indigo-600/25 flex items-center justify-center gap-2"
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
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-sm w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4 bg-slate-900">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-white font-bold text-xs">BG</span>
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight truncate min-w-0">Bio-Genius <span className="text-indigo-400 font-medium">Optimizer</span></h1>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 shrink-0">
              {/* <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
              <span className="text-xs font-medium text-slate-300 whitespace-nowrap">System Online</span>
            </div> */}
              <div className="w-2 h-2 rounded-full bg-gray-500 animate-pulse shrink-0"></div>
              <span className="text-xs font-medium text-slate-300 whitespace-nowrap">System Offline</span>
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

        {/* Navigation Tabs */}
        {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-6 text-sm">
          <Link 
            href="/"
            className={`py-3 font-medium border-b-2 transition-colors ${pathname === '/' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
          >
            Dashboard Utama
          </Link>
          <Link 
            href="/control"
            className={`py-3 font-medium border-b-2 transition-colors ${pathname === '/control' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
          >
            Kontrol Panel
          </Link>
        </div> */}
      </header>

      {/* Main Content Rendered Here */}
      {children}

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
            {chatMessages.map((msg: any, idx: number) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-tr-sm shadow-md"
                    : "bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm shadow-md"
                  }`}>
                  {msg.content.split('\n').map((line: string, i: number) => (
                    <React.Fragment key={i}>
                      {line.split(/(\*\*.*?\*\*)/).map((part: string, j: number) => {
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
            {showPrompts && (
              <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2">
                {activePrompts.map((prompt: string, i: number) => (
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
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
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
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 z-40"
      >
        {isChatOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
}
