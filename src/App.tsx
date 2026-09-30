import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldAlert, 
  Sliders, 
  BarChart3, 
  ShieldCheck, 
  Smartphone, 
  LayoutDashboard, 
  PlayCircle
} from 'lucide-react';
import { BlockedItem, KeywordRule, BlockerSettings, SpamCategory } from './types';
import { 
  getBlockedItems, 
  saveBlockedItems, 
  getKeywords, 
  saveKeywords, 
  getSettings, 
  saveSettings, 
  getWhitelist, 
  saveWhitelist, 
  calculateSpamStats, 
  resetToDefaults 
} from './services/storage';
import { Header } from './components/Header';
import { PhoneSimulator } from './components/PhoneSimulator';
import { BlockedFeed } from './components/BlockedFeed';
import { KeywordManager } from './components/KeywordManager';
import { ReportsView } from './components/ReportsView';
import { SettingsShield } from './components/SettingsShield';
import { LiveTestModal } from './components/LiveTestModal';
import { InstallModal } from './components/InstallModal';

export default function App() {
  const [items, setItems] = useState<BlockedItem[]>(() => getBlockedItems());
  const [keywords, setKeywords] = useState<KeywordRule[]>(() => getKeywords());
  const [settings, setSettings] = useState<BlockerSettings>(() => getSettings());
  const [whitelist, setWhitelist] = useState<string[]>(() => getWhitelist());
  
  // Default to 'dashboard' for spacious layout and high legibility
  const [currentTab, setCurrentTab] = useState<'blocked' | 'keywords' | 'reports' | 'shield'>('blocked');
  const [viewMode, setViewMode] = useState<'phone' | 'dashboard'>('dashboard');
  
  const [isLiveTestOpen, setIsLiveTestOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [prefillKeyword, setPrefillKeyword] = useState<string | undefined>(undefined);
  const [activeNotification, setActiveNotification] = useState<{
    title: string;
    message: string;
    type: 'blocked' | 'warning' | 'info';
  } | null>(null);

  useEffect(() => {
    saveBlockedItems(items);
  }, [items]);

  useEffect(() => {
    saveKeywords(keywords);
  }, [keywords]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveWhitelist(whitelist);
  }, [whitelist]);

  const stats = useMemo(() => calculateSpamStats(items, keywords), [items, keywords]);

  const handleWhitelistNumber = (id: string, number: string) => {
    if (!whitelist.includes(number)) {
      setWhitelist(prev => [...prev, number]);
    }
    setItems(prev => prev.map(item => item.id === id ? { ...item, whitelisted: true } : item));
    showNotification(
      'Number Whitelisted',
      `${number} added to safe list. Future calls and SMS will be allowed.`,
      'info'
    );
  };

  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleReportItem = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, reportedToSamsung: true } : item));
    showNotification(
      'Report Submitted',
      'Telemetry forwarded to Samsung Smart Call & FTC Robocall Database.',
      'info'
    );
  };

  const handleClearAllItems = () => {
    if (window.confirm('Are you sure you want to clear all blocked call and SMS logs?')) {
      setItems([]);
    }
  };

  const handleAddKeyword = (newRule: Omit<KeywordRule, 'id' | 'matchCount' | 'dateAdded'>) => {
    const created: KeywordRule = {
      ...newRule,
      id: `kw-${Date.now()}`,
      matchCount: 0,
      dateAdded: new Date().toISOString(),
    };
    setKeywords(prev => [created, ...prev]);
    showNotification(
      'New Keyword Filter Active',
      `ShieldS26 will now automatically drop communications containing "${newRule.keyword}".`,
      'info'
    );
  };

  const handleUpdateKeyword = (id: string, updates: Partial<KeywordRule>) => {
    setKeywords(prev => prev.map(k => k.id === id ? { ...k, ...updates } : k));
  };

  const handleDeleteKeyword = (id: string) => {
    setKeywords(prev => prev.filter(k => k.id !== id));
  };

  const handleImportPack = (packKeywords: string[], category: SpamCategory) => {
    const existingSet = new Set(keywords.map(k => k.keyword.toLowerCase()));
    const newRules: KeywordRule[] = [];

    packKeywords.forEach(kw => {
      if (!existingSet.has(kw.toLowerCase())) {
        newRules.push({
          id: `kw-pack-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          keyword: kw.toLowerCase(),
          category,
          matchType: 'contains',
          target: 'all',
          action: 'silent_drop',
          enabled: true,
          matchCount: 0,
          dateAdded: new Date().toISOString(),
          notes: 'Added from quick pack',
        });
      }
    });

    if (newRules.length > 0) {
      setKeywords(prev => [...newRules, ...prev]);
      showNotification(
        'Spam Pack Activated',
        `Added ${newRules.length} new automated blocker rules to Samsung Knox.`,
        'info'
      );
    }
  };

  const handleAddKeywordFromText = (phrase: string) => {
    setPrefillKeyword(phrase);
    setCurrentTab('keywords');
  };

  const handleTriggerSimulation = (newItem: BlockedItem, isBlocked: boolean) => {
    if (isBlocked) {
      setKeywords(prev => prev.map(kw => {
        if (newItem.matchedKeywords.includes(kw.keyword)) {
          return { ...kw, matchCount: kw.matchCount + 1 };
        }
        return kw;
      }));

      setItems(prev => [newItem, ...prev]);

      showNotification(
        `🛡️ Auto-Blocked: ${newItem.type === 'call' ? 'Robocall Dropped' : 'Spam Text Quarantined'}`,
        `${newItem.triggerReason} from ${newItem.senderNumber}. Samsung S26 did not ring.`,
        'blocked'
      );
    } else {
      showNotification(
        `📞 Incoming ${newItem.type === 'call' ? 'Call' : 'Text'} Allowed`,
        `From ${newItem.senderName || newItem.senderNumber}. No spam patterns detected.`,
        'info'
      );
    }
  };

  const showNotification = (title: string, message: string, type: 'blocked' | 'warning' | 'info') => {
    setActiveNotification({ title, message, type });
    setTimeout(() => {
      setActiveNotification(null);
    }, 6000);
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Reset all rules, blocked history, and settings to factory defaults?')) {
      resetToDefaults();
      setItems(getBlockedItems());
      setKeywords(getKeywords());
      setSettings(getSettings());
      setWhitelist(getWhitelist());
      showNotification(
        'Reset Complete',
        'Restored default loan spam rules and Samsung Smart Call configurations.',
        'info'
      );
    }
  };

  const renderTabContent = (isMobileLayout: boolean) => {
    switch (currentTab) {
      case 'blocked':
        return (
          <BlockedFeed
            items={items}
            onWhitelist={handleWhitelistNumber}
            onDelete={handleDeleteItem}
            onReport={handleReportItem}
            onAddKeywordFromText={handleAddKeywordFromText}
            onClearAll={handleClearAllItems}
            isMobileLayout={isMobileLayout}
          />
        );
      case 'keywords':
        return (
          <KeywordManager
            keywords={keywords}
            onAddKeyword={handleAddKeyword}
            onUpdateKeyword={handleUpdateKeyword}
            onDeleteKeyword={handleDeleteKeyword}
            onImportPack={handleImportPack}
            prefillKeyword={prefillKeyword}
            onClearPrefill={() => setPrefillKeyword(undefined)}
            isMobileLayout={isMobileLayout}
          />
        );
      case 'reports':
        return (
          <ReportsView
            stats={stats}
            items={items}
            keywords={keywords}
            isMobileLayout={isMobileLayout}
          />
        );
      case 'shield':
        return (
          <SettingsShield
            settings={settings}
            whitelist={whitelist}
            onUpdateSettings={setSettings}
            onAddWhitelist={(num) => setWhitelist(prev => [...prev, num])}
            onRemoveWhitelist={(num) => setWhitelist(prev => prev.filter(n => n !== num))}
            onResetDefaults={handleResetToDefaults}
            isMobileLayout={isMobileLayout}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Bar */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode(prev => prev === 'phone' ? 'dashboard' : 'phone')}
        onOpenLiveTest={() => setIsLiveTestOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onOpenAddKeyword={() => {
          setPrefillKeyword('loan approval');
          setCurrentTab('keywords');
        }}
        totalBlockedCount={items.length}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {viewMode === 'phone' ? (
          /* Phone View Mode: Authentic Samsung Galaxy S26 frame */
          <div className="flex flex-col items-center justify-center space-y-4">
            
            {/* Quick Context Bar */}
            <div className="w-full max-w-[440px] flex items-center justify-between px-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="font-bold text-slate-200">Samsung Galaxy S26</span>
                <span>· Knox Guard 5.2</span>
              </div>
              <button
                onClick={() => setViewMode('dashboard')}
                className="hover:text-cyan-400 font-semibold transition-colors flex items-center gap-1.5"
              >
                <span>Console Mode</span>
                <LayoutDashboard className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* S26 Hardware Frame */}
            <PhoneSimulator
              activeNotification={activeNotification}
              onDismissNotification={() => setActiveNotification(null)}
            >
              {/* Internal Mobile Top App Bar */}
              <div className="shrink-0 px-3.5 py-2.5 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between z-20">
                <div className="min-w-0 flex-1">
                  <h1 className="text-xs sm:text-sm font-bold text-white tracking-tight flex items-center gap-1.5 truncate">
                    <ShieldAlert className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>ShieldS26 Guard</span>
                  </h1>
                  <p className="text-[11px] text-amber-300 font-mono font-medium truncate">
                    {stats.loanSpamBlocked} loan scams stopped
                  </p>
                </div>

                <button
                  onClick={() => setIsLiveTestOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-cyan-400 text-slate-950 text-xs font-bold shadow-sm hover:bg-cyan-300 transition-colors shrink-0 ml-2"
                >
                  Test
                </button>
              </div>

              {/* Scrollable Mobile Screen Body */}
              <div className="flex-1 overflow-y-auto min-h-0">
                {renderTabContent(true)}
              </div>

              {/* Pinned Bottom Tab Bar */}
              <div className="shrink-0 z-30 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 grid grid-cols-4 items-center h-13 px-1">
                {[
                  { id: 'blocked', label: 'Blocked', icon: ShieldAlert, count: items.length },
                  { id: 'keywords', label: 'Keywords', icon: Sliders, count: keywords.length },
                  { id: 'reports', label: 'Reports', icon: BarChart3 },
                  { id: 'shield', label: 'Shield', icon: ShieldCheck },
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = currentTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setCurrentTab(tab.id as any)}
                      className={`flex flex-col items-center justify-center py-1 transition-colors relative ${
                        isActive ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="relative">
                        <Icon className="w-4 h-4" />
                        {tab.count !== undefined && tab.count > 0 && (
                          <span className="absolute -top-1 -right-2 text-[8px] font-mono px-1 rounded-full bg-slate-800 text-cyan-300 font-bold border border-slate-700">
                            {tab.count}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-medium tracking-tight mt-0.5">
                        {tab.label}
                      </span>
                      {isActive && (
                        <span className="w-1 h-1 rounded-full bg-cyan-400 absolute bottom-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

            </PhoneSimulator>

          </div>
        ) : (
          /* Dashboard Console Mode: Spacious, clean, zero clipping or overflow */
          <div className="space-y-6">
            {/* Console Subheader */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3.5 shadow-sm">
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                <span className="font-bold text-white text-sm">Samsung Knox Telephony Console</span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-400">Active Spam Interceptor for Galaxy S26</span>
              </div>
              <button
                onClick={() => setViewMode('phone')}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-2 font-bold transition-colors self-start sm:self-auto"
              >
                <Smartphone className="w-4 h-4" />
                <span>Switch to S26 Phone Simulator</span>
              </button>
            </div>

            {/* Dashboard Content */}
            <div className="bg-slate-900/60 rounded-3xl border border-slate-800/80 p-2 sm:p-4">
              {renderTabContent(false)}
            </div>
          </div>
        )}

      </main>

      {/* Live Simulation Trigger Modal */}
      <LiveTestModal
        isOpen={isLiveTestOpen}
        onClose={() => setIsLiveTestOpen(false)}
        keywords={keywords}
        settings={settings}
        whitelist={whitelist}
        onTriggerSimulation={handleTriggerSimulation}
      />

      {/* Phone Installation Modal */}
      <InstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

    </div>
  );
}
