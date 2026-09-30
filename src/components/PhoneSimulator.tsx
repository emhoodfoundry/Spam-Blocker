import React, { useState, useEffect } from 'react';
import { Wifi, Battery, ShieldCheck, Signal } from 'lucide-react';

interface PhoneSimulatorProps {
  children: React.ReactNode;
  activeNotification?: {
    title: string;
    message: string;
    type: 'blocked' | 'warning' | 'info';
  } | null;
  onDismissNotification?: () => void;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  children,
  activeNotification,
  onDismissNotification,
}) => {
  const [timeStr, setTimeStr] = useState('13:00');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-[420px] h-[84vh] min-h-[720px] max-h-[900px] bg-slate-950 rounded-[44px] p-2.5 shadow-2xl shadow-cyan-950/50 border-[4px] border-slate-700 ring-1 ring-slate-600/60 flex flex-col justify-between overflow-hidden">
      
      {/* Side Hardware Buttons (Samsung Galaxy S26 Armor Aluminum Frame) */}
      <div className="absolute -left-[7px] top-28 w-[3px] h-12 bg-slate-600 rounded-l-sm" />
      <div className="absolute -left-[7px] top-44 w-[3px] h-12 bg-slate-600 rounded-l-sm" />
      <div className="absolute -right-[7px] top-36 w-[3px] h-16 bg-slate-600 rounded-r-sm" />

      {/* Screen Container */}
      <div className="relative w-full h-full bg-slate-950 rounded-[34px] flex flex-col overflow-hidden border border-slate-800">
        
        {/* Status Bar (Samsung One UI 8 Header) */}
        <div className="relative z-30 shrink-0 flex items-center justify-between px-5 pt-2.5 pb-1.5 text-xs font-semibold text-slate-300 select-none bg-slate-950 border-b border-slate-900">
          {/* Clock */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-white tabular-nums">{timeStr}</span>
            <span title="Knox Guard Active">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </span>
          </div>

          {/* Punch Hole Camera (Samsung Infinity-O) */}
          <div className="absolute left-1/2 top-2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-black ring-1 ring-slate-800 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-900 ring-1 ring-cyan-950/40" />
          </div>

          {/* System Icons */}
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="text-[11px] font-mono text-cyan-400 font-bold">5G</span>
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center gap-0.5">
              <span className="text-[11px] font-mono tabular-nums font-bold">98%</span>
              <Battery className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Live Notification Banner */}
        {activeNotification && (
          <div className="relative z-40 mx-2.5 mt-2 mb-1 p-3 rounded-2xl bg-slate-900 border border-rose-500/50 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-4 duration-300 shrink-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4 text-rose-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-rose-300 truncate">
                      {activeNotification.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">Just now</span>
                  </div>
                  <p className="text-xs text-slate-200 mt-0.5 leading-snug break-words">
                    {activeNotification.message}
                  </p>
                </div>
              </div>
              {onDismissNotification && (
                <button
                  onClick={onDismissNotification}
                  className="text-slate-400 hover:text-white text-xs p-0.5 shrink-0"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

        {/* Inner Content Area */}
        <div className="relative flex-1 overflow-hidden flex flex-col min-h-0">
          {children}
        </div>

        {/* Android Navigation Bar */}
        <div className="relative z-30 h-4 w-full bg-slate-950 flex items-center justify-center select-none shrink-0 border-t border-slate-900">
          <div className="w-24 h-1 bg-slate-600 rounded-full" />
        </div>
      </div>
    </div>
  );
};
