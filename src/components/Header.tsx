import React from 'react';
import { Smartphone, LayoutDashboard, PlayCircle, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  currentTab: 'blocked' | 'keywords' | 'reports' | 'shield';
  onSelectTab: (tab: 'blocked' | 'keywords' | 'reports' | 'shield') => void;
  viewMode: 'phone' | 'dashboard';
  onToggleViewMode: () => void;
  onOpenLiveTest: () => void;
  onOpenAddKeyword: () => void;
  onOpenInstallModal: () => void;
  totalBlockedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  viewMode,
  onToggleViewMode,
  onOpenLiveTest,
  onOpenInstallModal,
  totalBlockedCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onSelectTab('blocked');
            }}
            className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            ShieldS26
          </a>
          <span className="hidden lg:inline-block text-xs text-slate-400 font-mono">
            Samsung Galaxy S26 Telephony Guard
          </span>
        </div>

        {/* Zone 2: Navigation Links (Text with hover underlines / active highlight) */}
        <nav className="flex items-center gap-1 sm:gap-6 text-xs sm:text-sm font-medium overflow-x-auto py-1">
          <button
            onClick={() => onSelectTab('blocked')}
            className={`px-2.5 py-1.5 transition-colors relative whitespace-nowrap ${
              currentTab === 'blocked'
                ? 'text-cyan-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Blocked Feed
            {totalBlockedCount > 0 && (
              <span className="ml-1.5 text-xs font-mono text-cyan-300 font-semibold">
                ({totalBlockedCount})
              </span>
            )}
            {currentTab === 'blocked' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onSelectTab('keywords')}
            className={`px-2.5 py-1.5 transition-colors relative whitespace-nowrap ${
              currentTab === 'keywords'
                ? 'text-cyan-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Keyword Rules
            {currentTab === 'keywords' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onSelectTab('reports')}
            className={`px-2.5 py-1.5 transition-colors relative whitespace-nowrap ${
              currentTab === 'reports'
                ? 'text-cyan-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Threat Analytics
            {currentTab === 'reports' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onSelectTab('shield')}
            className={`px-2.5 py-1.5 transition-colors relative whitespace-nowrap ${
              currentTab === 'shield'
                ? 'text-cyan-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Shield Setup
            {currentTab === 'shield' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
            )}
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Segmented View Switcher */}
          <div className="flex items-center p-1 bg-slate-900 border border-slate-700/80 rounded-xl">
            <button
              onClick={() => {
                if (viewMode !== 'dashboard') onToggleViewMode();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg font-semibold transition-all ${
                viewMode === 'dashboard'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Full width console dashboard"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Console</span>
            </button>
            <button
              onClick={() => {
                if (viewMode !== 'phone') onToggleViewMode();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg font-semibold transition-all ${
                viewMode === 'phone'
                  ? 'bg-slate-800 text-cyan-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Samsung Galaxy S26 phone view"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">S26 Frame</span>
            </button>
          </div>

          {/* Install to Phone Button */}
          <button
            onClick={onOpenInstallModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-100 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all whitespace-nowrap"
            title="Download app to your Samsung Galaxy S26"
          >
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Install to S26</span>
            <span className="sm:hidden">Install</span>
          </button>

          {/* Simulate Incoming Button */}
          <button
            onClick={onOpenLiveTest}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl shadow-sm transition-all active:scale-95 whitespace-nowrap"
          >
            <PlayCircle className="w-3.5 h-3.5 fill-current" />
            <span>Simulate</span>
          </button>
        </div>

      </div>
    </header>
  );
};
