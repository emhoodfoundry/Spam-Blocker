import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Plus, 
  Trash2, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { BlockerSettings } from '../types';

interface SettingsShieldProps {
  settings: BlockerSettings;
  whitelist: string[];
  onUpdateSettings: (settings: BlockerSettings) => void;
  onAddWhitelist: (number: string) => void;
  onRemoveWhitelist: (number: string) => void;
  onResetDefaults: () => void;
  isMobileLayout?: boolean;
}

export const SettingsShield: React.FC<SettingsShieldProps> = ({
  settings,
  whitelist,
  onUpdateSettings,
  onAddWhitelist,
  onRemoveWhitelist,
  onResetDefaults,
  isMobileLayout = false,
}) => {
  const [newWhiteNum, setNewWhiteNum] = useState('');
  const [savedBanner, setSavedBanner] = useState(false);

  const handleToggle = (key: keyof BlockerSettings) => {
    const updated = {
      ...settings,
      [key]: !settings[key],
    };
    onUpdateSettings(updated);
    triggerSaved();
  };

  const handleFieldChange = (key: keyof BlockerSettings, val: any) => {
    const updated = {
      ...settings,
      [key]: val,
    };
    onUpdateSettings(updated);
    triggerSaved();
  };

  const triggerSaved = () => {
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 2500);
  };

  const handleAddWhitelist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWhiteNum.trim()) return;
    onAddWhitelist(newWhiteNum.trim());
    setNewWhiteNum('');
    triggerSaved();
  };

  return (
    <div className={`space-y-4 ${isMobileLayout ? 'p-3' : 'p-4 sm:p-6 max-w-5xl mx-auto'}`}>
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
              Samsung S26 Shield Config
            </h2>
            <span className="text-[11px] font-mono font-semibold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/60">
              Knox Online
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Hardware-level telephony interception and neighbor spoofing shield.
          </p>
        </div>

        <button
          onClick={onResetDefaults}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors self-start sm:self-auto shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {savedBanner && (
        <div className="p-3 bg-emerald-950/50 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Settings applied immediately!</span>
        </div>
      )}

      {/* Automated Telephony Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          Automated Defenses
        </h3>

        <div className="space-y-2.5">
          
          {/* Setting 1: Auto-Block Keywords */}
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="space-y-0.5 min-w-0 flex-1">
              <span className="font-bold text-white text-xs sm:text-sm block truncate">
                Keyword Interception
              </span>
              <p className="text-[11px] text-slate-300">
                Drops calls and SMS matching your phrase rules.
              </p>
            </div>
            <button
              onClick={() => handleToggle('autoBlockKeywords')}
              className={`w-10 h-5.5 rounded-full transition-colors relative flex items-center p-0.5 shrink-0 ${
                settings.autoBlockKeywords ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4.5 h-4.5 rounded-full bg-white shadow-md transform transition-transform ${
                  settings.autoBlockKeywords ? 'translate-x-4.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Setting 2: Samsung Smart Call */}
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="space-y-0.5 min-w-0 flex-1">
              <span className="font-bold text-white text-xs sm:text-sm block truncate">
                Samsung Smart Call & Hiya
              </span>
              <p className="text-[11px] text-slate-300">
                Uses carrier database to flag known telemarketers.
              </p>
            </div>
            <button
              onClick={() => handleToggle('samsungSmartCallEnabled')}
              className={`w-10 h-5.5 rounded-full transition-colors relative flex items-center p-0.5 shrink-0 ${
                settings.samsungSmartCallEnabled ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4.5 h-4.5 rounded-full bg-white shadow-md transform transition-transform ${
                  settings.samsungSmartCallEnabled ? 'translate-x-4.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Setting 3: Neighbor Spoofing Shield */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0 flex-1">
                <span className="font-bold text-white text-xs sm:text-sm block truncate">
                  Neighbor Spoofing Shield
                </span>
                <p className="text-[11px] text-slate-300">
                  Blocks numbers matching your local area code and exchange.
                </p>
              </div>
              <button
                onClick={() => handleToggle('blockNeighborSpoofing')}
                className={`w-10 h-5.5 rounded-full transition-colors relative flex items-center p-0.5 shrink-0 ${
                  settings.blockNeighborSpoofing ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4.5 h-4.5 rounded-full bg-white shadow-md transform transition-transform ${
                    settings.blockNeighborSpoofing ? 'translate-x-4.5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {settings.blockNeighborSpoofing && (
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-0.5">Area Code</label>
                  <input
                    type="text"
                    maxLength={3}
                    value={settings.userAreaCode}
                    onChange={(e) => handleFieldChange('userAreaCode', e.target.value.replace(/\D/g, ''))}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs focus:ring-1 focus:ring-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-0.5">3-Digit Prefix</label>
                  <input
                    type="text"
                    maxLength={3}
                    value={settings.userPrefix}
                    onChange={(e) => handleFieldChange('userPrefix', e.target.value.replace(/\D/g, ''))}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs focus:ring-1 focus:ring-cyan-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Setting 4: SMS Suspicious Link Quarantine */}
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="space-y-0.5 min-w-0 flex-1">
              <span className="font-bold text-white text-xs sm:text-sm block truncate">
                Quarantine SMS Links
              </span>
              <p className="text-[11px] text-slate-300">
                Silences texts with shortlinks or unverified URLs.
              </p>
            </div>
            <button
              onClick={() => handleToggle('quarantineSuspiciousLinks')}
              className={`w-10 h-5.5 rounded-full transition-colors relative flex items-center p-0.5 shrink-0 ${
                settings.quarantineSuspiciousLinks ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4.5 h-4.5 rounded-full bg-white shadow-md transform transition-transform ${
                  settings.quarantineSuspiciousLinks ? 'translate-x-4.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Setting 5: Default Action */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <span className="font-bold text-white text-xs sm:text-sm block">
              Default Auto-Block Action
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {[
                {
                  id: 'silent_drop',
                  title: 'Silent Drop',
                  desc: 'Zero ring, no screen wake',
                },
                {
                  id: 'voicemail_mute',
                  title: 'Voicemail Mute',
                  desc: 'Direct to voicemail',
                },
                {
                  id: 'screen_alert',
                  title: 'Screen & Alert',
                  desc: 'Display spam warning banner',
                },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => handleFieldChange('defaultAction', opt.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    settings.defaultAction === opt.id
                      ? 'bg-cyan-950 border-cyan-400 text-cyan-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="font-bold block text-xs text-white">{opt.title}</span>
                  <span className="text-[10px] block text-slate-300 leading-snug">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Whitelist */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-400" />
            Whitelist ({whitelist.length})
          </h3>
          <span className="text-[11px] text-slate-400">Always allowed through</span>
        </div>

        <form onSubmit={handleAddWhitelist} className="flex gap-2">
          <input
            type="text"
            value={newWhiteNum}
            onChange={(e) => setNewWhiteNum(e.target.value)}
            placeholder="Add phone e.g. +1 (512) 555-0199..."
            className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-emerald-400"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {whitelist.map(num => (
            <div
              key={num}
              className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono text-slate-200">{num}</span>
              </div>
              <button
                onClick={() => onRemoveWhitelist(num)}
                className="text-slate-400 hover:text-rose-400 p-1"
                title="Remove"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
