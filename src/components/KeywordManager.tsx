import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  X, 
  Search, 
  ShieldAlert, 
  Flame, 
  CheckCircle2,
  Play
} from 'lucide-react';
import { KeywordRule, SpamCategory, BlockAction } from '../types';
import { POPULAR_KEYWORD_PACKS } from '../data/initialData';
import { evaluateIncomingCommunication, getHighlightedSegments } from '../services/blockerEngine';
import { INITIAL_SETTINGS } from '../data/initialData';

interface KeywordManagerProps {
  keywords: KeywordRule[];
  onAddKeyword: (rule: Omit<KeywordRule, 'id' | 'matchCount' | 'dateAdded'>) => void;
  onUpdateKeyword: (id: string, updates: Partial<KeywordRule>) => void;
  onDeleteKeyword: (id: string) => void;
  onImportPack: (packKeywords: string[], category: SpamCategory) => void;
  prefillKeyword?: string;
  onClearPrefill?: () => void;
  isMobileLayout?: boolean;
}

export const KeywordManager: React.FC<KeywordManagerProps> = ({
  keywords,
  onAddKeyword,
  onUpdateKeyword,
  onDeleteKeyword,
  onImportPack,
  prefillKeyword,
  onClearPrefill,
  isMobileLayout = false,
}) => {
  const [newKeyword, setNewKeyword] = useState(prefillKeyword || '');
  const [newCategory, setNewCategory] = useState<SpamCategory>('loan_scam');
  const [newMatchType, setNewMatchType] = useState<'contains' | 'exact' | 'regex'>('contains');
  const [newTarget, setNewTarget] = useState<'all' | 'calls_only' | 'sms_only'>('all');
  const [newAction, setNewAction] = useState<BlockAction>('silent_drop');
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(!!prefillKeyword);

  const [testText, setTestText] = useState(
    'Congratulations, your pre-approved loan approval for $35,000 is ready for deposit today. Press 1 to speak with underwriting.'
  );

  const [importedPackName, setImportedPackName] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;

    onAddKeyword({
      keyword: newKeyword.trim().toLowerCase(),
      category: newCategory,
      matchType: newMatchType,
      target: newTarget,
      action: newAction,
      enabled: true,
      notes: `Custom rule added on ${new Date().toLocaleDateString()}`,
    });

    setNewKeyword('');
    setShowAddForm(false);
    if (onClearPrefill) onClearPrefill();
  };

  const testEvaluation = React.useMemo(() => {
    return evaluateIncomingCommunication(
      'call',
      '+1 (800) 555-0199',
      'Test Caller',
      testText,
      keywords,
      INITIAL_SETTINGS,
      []
    );
  }, [testText, keywords]);

  const filteredKeywords = keywords.filter(k => {
    if (categoryFilter !== 'all' && k.category !== categoryFilter) return false;
    if (searchFilter.trim() && !k.keyword.toLowerCase().includes(searchFilter.toLowerCase())) return false;
    return true;
  });

  const loanRulesCount = keywords.filter(k => k.category === 'loan_scam').length;

  return (
    <div className={`space-y-4 ${isMobileLayout ? 'p-3' : 'p-4 sm:p-6 max-w-5xl mx-auto'}`}>
      
      {/* Top Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
              Keyword Interception Rules
            </h2>
            <span className="text-xs font-mono font-semibold text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/60">
              {loanRulesCount} Loan Filters
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            ShieldS26 intercepts calls and SMS matching your keywords, dropping them silently.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold transition-all self-start sm:self-auto shrink-0"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showAddForm ? 'Hide Form' : 'Add Keyword'}</span>
        </button>
      </div>

      {/* Add Keyword Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreate}
          className="bg-slate-900 border border-cyan-500/40 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h3 className="text-sm font-bold text-white">Create New Interception Rule</h3>
            <span className="text-[11px] text-cyan-300 font-mono">Knox Active</span>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">
                Keyword or Phrase <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="e.g. loan approval, unsecured personal loan..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as SpamCategory)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                >
                  <option value="loan_scam">Loan & Financing Scams</option>
                  <option value="telemarketing">Telemarketing</option>
                  <option value="phishing">Phishing Links</option>
                  <option value="warranty_scam">Vehicle Warranty</option>
                  <option value="impersonation">IRS / Legal Fraud</option>
                  <option value="other">Other Spam</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Match Mode</label>
                <select
                  value={newMatchType}
                  onChange={(e) => setNewMatchType(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                >
                  <option value="contains">Contains Phrase</option>
                  <option value="exact">Exact Whole Word</option>
                  <option value="regex">Regex Expression</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Target</label>
                <select
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                >
                  <option value="all">Calls and Texts</option>
                  <option value="calls_only">Voice Calls Only</option>
                  <option value="sms_only">Text Messages Only</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Action</label>
                <select
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value as BlockAction)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                >
                  <option value="silent_drop">Silent Drop (Zero Ring)</option>
                  <option value="voicemail_mute">Direct to Voicemail</option>
                  <option value="screen_alert">Screen & Warn</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold transition-all"
            >
              Save Rule
            </button>
          </div>
        </form>
      )}

      {/* Pre-Built Spam Packs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wide">
              Quick 1-Click Rule Packs
            </h3>
          </div>
          {importedPackName && (
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Imported!
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {POPULAR_KEYWORD_PACKS.map(pack => {
            const isLoanPack = pack.category === 'loan_scam';
            return (
              <div
                key={pack.name}
                className={`p-3 rounded-xl border flex flex-col justify-between gap-2 ${
                  isLoanPack
                    ? 'bg-amber-950/20 border-amber-500/40'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      {pack.name}
                      {isLoanPack && (
                        <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded font-mono font-semibold">
                          Recommended
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      {pack.description}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onImportPack(pack.keywords, pack.category);
                      setImportedPackName(pack.name);
                      setTimeout(() => setImportedPackName(null), 3000);
                    }}
                    className="px-2.5 py-1 text-[11px] font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shrink-0"
                  >
                    + Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1 pt-0.5">
                  {pack.keywords.slice(0, 4).map((kw, i) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-900 border border-slate-700/80 rounded text-slate-300"
                    >
                      "{kw}"
                    </span>
                  ))}
                  {pack.keywords.length > 4 && (
                    <span className="text-[10px] text-slate-400 self-center">
                      +{pack.keywords.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Keyword Rule Tester */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Play className="w-3.5 h-3.5 text-cyan-400 fill-current" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Keyword Tester
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Paste text to test rules
          </span>
        </div>

        <textarea
          rows={2}
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          placeholder="Paste sample message..."
          className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
        />

        {/* Evaluation Output */}
        <div
          className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-2 ${
            testEvaluation.shouldBlock
              ? 'bg-rose-950/20 border-rose-500/40 text-rose-200'
              : 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
          }`}
        >
          <div className="space-y-0.5 min-w-0 flex-1">
            <div className="flex items-center gap-1.5 font-bold">
              {testEvaluation.shouldBlock ? (
                <>
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="text-rose-300 truncate">BLOCKED BY SHIELD</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-emerald-300">ALLOWED THROUGH</span>
                </>
              )}
            </div>
            <p className="text-[11px] text-slate-300 truncate">
              {testEvaluation.reason}
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="font-bold text-[11px] text-white">
              {testEvaluation.shouldBlock ? 'Silent Drop' : 'Rings Normally'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Keywords */}
      <div className="flex gap-2 pt-1">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search active keywords..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
          />
        </div>
      </div>

      {/* Keywords List */}
      <div className="space-y-2">
        {filteredKeywords.length === 0 ? (
          <div className="text-center py-6 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
            No keywords matching "{searchFilter}".
          </div>
        ) : (
          filteredKeywords.map(rule => {
            const isLoanRule = rule.category === 'loan_scam';
            return (
              <div
                key={rule.id}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                  rule.enabled
                    ? isLoanRule
                      ? 'bg-slate-900 border-amber-500/30'
                      : 'bg-slate-900 border-slate-800'
                    : 'bg-slate-950/60 border-slate-800/80 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {/* Enable switch */}
                  <button
                    onClick={() => onUpdateKeyword(rule.id, { enabled: !rule.enabled })}
                    className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 shrink-0 ${
                      rule.enabled ? 'bg-cyan-500' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
                        rule.enabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white text-xs sm:text-sm font-mono truncate">
                        "{rule.keyword}"
                      </span>
                      {isLoanRule && (
                        <span className="text-[10px] text-amber-300 font-semibold px-1.5 py-0.2 bg-amber-400/15 rounded border border-amber-400/30 shrink-0">
                          Loan
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5 whitespace-nowrap overflow-hidden">
                      <span className="capitalize">{rule.matchType}</span>
                      <span>·</span>
                      <span className="text-cyan-300 font-mono font-semibold">
                        {rule.matchCount} blocked
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteKeyword(rule.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 shrink-0"
                  title="Delete rule"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
