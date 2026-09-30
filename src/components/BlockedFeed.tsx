import React, { useState } from 'react';
import { 
  PhoneMissed, 
  MessageSquareOff, 
  ShieldAlert, 
  CheckCircle, 
  Search, 
  Trash2, 
  Copy, 
  PlusCircle, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { BlockedItem, SpamCategory } from '../types';
import { getHighlightedSegments } from '../services/blockerEngine';
import { AudioPlayerWaveform } from './AudioPlayerWaveform';

interface BlockedFeedProps {
  items: BlockedItem[];
  onWhitelist: (id: string, number: string) => void;
  onDelete: (id: string) => void;
  onReport: (id: string) => void;
  onAddKeywordFromText: (phrase: string) => void;
  onClearAll: () => void;
  isMobileLayout?: boolean;
}

export const BlockedFeed: React.FC<BlockedFeedProps> = ({
  items,
  onWhitelist,
  onDelete,
  onReport,
  onAddKeywordFromText,
  onClearAll,
  isMobileLayout = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(items[0]?.id || null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter items
  const filteredItems = items.filter(item => {
    if (selectedType !== 'all' && item.type !== selectedType) return false;

    if (selectedCategory !== 'all') {
      if (selectedCategory === 'loan_scam' && item.category !== 'loan_scam') return false;
      if (selectedCategory !== 'loan_scam' && item.category !== selectedCategory) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNumber = item.senderNumber.toLowerCase().includes(q);
      const matchName = item.senderName?.toLowerCase().includes(q) || false;
      const matchContent = item.messageContent?.toLowerCase().includes(q) || false;
      const matchTranscript = item.voicemailTranscript?.toLowerCase().includes(q) || false;
      const matchReason = item.triggerReason.toLowerCase().includes(q);
      const matchKw = item.matchedKeywords.some(k => k.toLowerCase().includes(q));
      if (!matchNumber && !matchName && !matchContent && !matchTranscript && !matchReason && !matchKw) {
        return false;
      }
    }

    return true;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCategoryBadge = (category: SpamCategory) => {
    switch (category) {
      case 'loan_scam':
        return { label: 'Loan Scam', bg: 'bg-amber-400/20 text-amber-300 border-amber-400/40' };
      case 'telemarketing':
        return { label: 'Telemarketer', bg: 'bg-sky-400/20 text-sky-300 border-sky-400/40' };
      case 'phishing':
        return { label: 'Phishing', bg: 'bg-rose-400/20 text-rose-300 border-rose-400/40' };
      case 'warranty_scam':
        return { label: 'Warranty', bg: 'bg-orange-400/20 text-orange-300 border-orange-400/40' };
      case 'impersonation':
        return { label: 'IRS / Fraud', bg: 'bg-red-400/20 text-red-300 border-red-400/40' };
      case 'spoofed_number':
        return { label: 'Neighbor Spoof', bg: 'bg-purple-400/20 text-purple-300 border-purple-400/40' };
      default:
        return { label: 'Spam', bg: 'bg-slate-700/40 text-slate-300 border-slate-700' };
    }
  };

  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (isToday) {
        return timeStr;
      }
      return `${d.toLocaleDateString([], { month: 'numeric', day: 'numeric' })} ${timeStr}`;
    } catch {
      return iso;
    }
  };

  const loanItemsCount = items.filter(i => i.category === 'loan_scam').length;

  return (
    <div className={`space-y-3.5 ${isMobileLayout ? 'p-3' : 'p-4 sm:p-6 max-w-5xl mx-auto'}`}>
      
      {/* Top Banner Alert (Shown only in desktop console mode to save mobile vertical height) */}
      {!isMobileLayout && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <h2 className="text-sm font-bold text-white tracking-wide uppercase">
                Samsung Galaxy S26 Shield Telephony Activity
              </h2>
              <span className="text-xs text-slate-400 font-mono">· Automated Filter</span>
            </div>
            <p className="text-sm text-slate-200">
              <strong className="text-amber-400 font-bold font-mono">{loanItemsCount} loan approval calls & messages</strong> dropped silently without waking your screen or ringing your phone.
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedCategory(selectedCategory === 'loan_scam' ? 'all' : 'loan_scam');
              setSearchQuery('');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              selectedCategory === 'loan_scam'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30'
            }`}
          >
            {selectedCategory === 'loan_scam' ? 'Show All Spam' : 'Filter Loan Scams Only'}
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="space-y-2">
        <div className={`flex gap-2 ${isMobileLayout ? 'flex-col' : 'flex-col md:flex-row'}`}>
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search number, transcript, keyword..."
              className="w-full pl-9 pr-10 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-700/80 rounded-xl shrink-0">
            <button
              onClick={() => setSelectedType('all')}
              className={`flex-1 sm:flex-none px-3 py-1 text-xs rounded-lg font-semibold transition-colors ${
                selectedType === 'all'
                  ? 'bg-cyan-500 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              All ({items.length})
            </button>
            <button
              onClick={() => setSelectedType('call')}
              className={`flex-1 sm:flex-none px-2.5 py-1 text-xs rounded-lg font-semibold transition-colors flex items-center justify-center gap-1 ${
                selectedType === 'call'
                  ? 'bg-cyan-500 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <PhoneMissed className="w-3 h-3" />
              <span>Calls ({items.filter(i => i.type === 'call').length})</span>
            </button>
            <button
              onClick={() => setSelectedType('sms')}
              className={`flex-1 sm:flex-none px-2.5 py-1 text-xs rounded-lg font-semibold transition-colors flex items-center justify-center gap-1 ${
                selectedType === 'sms'
                  ? 'bg-cyan-500 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <MessageSquareOff className="w-3 h-3" />
              <span>Texts ({items.filter(i => i.type === 'sms').length})</span>
            </button>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {[
            { id: 'all', label: 'All' },
            { id: 'loan_scam', label: 'Loan Approval' },
            { id: 'telemarketing', label: 'Telemarketer' },
            { id: 'phishing', label: 'Phishing' },
            { id: 'warranty_scam', label: 'Warranty' },
            { id: 'impersonation', label: 'IRS / Fraud' },
            { id: 'spoofed_number', label: 'Neighbor Spoof' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors border text-[11px] sm:text-xs shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-cyan-950 text-cyan-200 border-cyan-500 font-bold'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Blocked Items Feed */}
      <div className="space-y-2.5">
        {filteredItems.length === 0 ? (
          <div className="text-center py-10 px-3 rounded-2xl bg-slate-900 border border-slate-800">
            <CheckCircle className="w-9 h-9 text-emerald-400 mx-auto mb-2 opacity-90" />
            <h3 className="text-sm font-semibold text-white">No Blocked Records Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
              {searchQuery || selectedCategory !== 'all' || selectedType !== 'all'
                ? 'Try adjusting your search criteria or resetting filters.'
                : 'ShieldS26 is active. Any spam calls or texts will be dropped silently.'}
            </p>
            {(searchQuery || selectedCategory !== 'all' || selectedType !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedType('all');
                }}
                className="mt-3 px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-white font-semibold"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          filteredItems.map(item => {
            const isExpanded = expandedItemId === item.id;
            const content = item.type === 'call' ? item.voicemailTranscript : item.messageContent;
            const highlightedSegments = content
              ? getHighlightedSegments(content, item.matchedKeywords)
              : [];
            const badge = getCategoryBadge(item.category);

            return (
              <div
                key={item.id}
                className={`rounded-2xl transition-all border overflow-hidden ${
                  item.category === 'loan_scam'
                    ? 'bg-slate-900 border-amber-500/40'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                {/* Clean, Non-wrapping Header Row */}
                <div
                  onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                  className="p-3 sm:p-4 cursor-pointer select-none hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2.5">
                    
                    {/* Left: Icon + Number + Metadata */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {/* Icon */}
                      <div
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                          item.type === 'call'
                            ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                            : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {item.type === 'call' ? (
                          <PhoneMissed className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                          <MessageSquareOff className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </div>

                      {/* Number and Subtitle (Properly flex-1 and truncated, never wrapped into vertical letters!) */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white font-mono text-sm sm:text-base whitespace-nowrap tracking-tight">
                            {item.senderNumber}
                          </span>
                          {item.senderName && item.senderName !== item.senderNumber && (
                            <span className="text-xs text-slate-400 font-medium truncate max-w-[120px] hidden xs:inline">
                              ({item.senderName})
                            </span>
                          )}
                        </div>

                        {/* Clean Metadata Line (Single-line, no vertical wrapping) */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5 whitespace-nowrap overflow-hidden">
                          <span className={`px-1.5 py-0.2 rounded font-semibold text-[10px] sm:text-[11px] border shrink-0 ${badge.bg}`}>
                            {badge.label}
                          </span>
                          <span className="text-slate-600">·</span>
                          <span className="truncate text-slate-300 text-[11px] sm:text-xs">
                            {item.location || 'Unknown'}
                          </span>
                          <span className="text-slate-600">·</span>
                          <span className="text-slate-400 font-mono text-[10px] sm:text-[11px] shrink-0">
                            {formatTimestamp(item.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Expand Chevron */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* On wide desktop console, show reason badge; on mobile frame, keep header clean */}
                      {!isMobileLayout && (
                        <span className="hidden md:inline-block text-xs font-semibold px-2 py-0.5 rounded-lg bg-amber-400/10 text-amber-300 border border-amber-500/30 max-w-[160px] truncate">
                          {item.triggerReason}
                        </span>
                      )}
                      <div className="p-1 text-slate-400 hover:text-white">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Mobile-Friendly Subtitle Reason (Shown under the row in a neat line) */}
                  <div className="mt-1.5 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate text-amber-300 font-medium">
                      🛡️ {item.triggerReason}
                    </span>
                    <span className="text-rose-400 font-semibold shrink-0 ml-1">
                      Silent Drop
                    </span>
                  </div>
                </div>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div className="px-3.5 pb-4 pt-2 space-y-3 border-t border-slate-800 bg-slate-950/60">
                    
                    {/* Reason Detail Box */}
                    <div className="text-xs text-slate-200 bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <div className="space-y-1 min-w-0 flex-1">
                        <div>
                          <span className="font-bold text-white">Block Reason: </span>
                          <span className="text-slate-300">{item.triggerReason}</span>
                        </div>
                        {item.matchedKeywords.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                            <span className="text-slate-400 text-[11px]">Matched:</span>
                            {item.matchedKeywords.map((kw, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 text-xs font-mono font-bold rounded-md bg-amber-400/20 text-amber-200 border border-amber-400/40"
                              >
                                "{kw}"
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content / Transcript with Highlighted Keywords */}
                    {content && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span className="font-semibold text-slate-200">
                            {item.type === 'call' ? 'Call Audio Transcript:' : 'Blocked Text Body:'}
                          </span>
                          <button
                            onClick={() => handleCopy(item.id, content)}
                            className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{copiedId === item.id ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed break-words select-text">
                          {highlightedSegments.map((segment, idx) => (
                            <span
                              key={idx}
                              className={
                                segment.isMatch
                                  ? 'bg-amber-400/30 text-amber-100 font-bold px-1 py-0.5 rounded border border-amber-400/50'
                                  : ''
                              }
                            >
                              {segment.text}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Audio Player for Robocall Recording */}
                    {item.type === 'call' && item.voicemailTranscript && (
                      <AudioPlayerWaveform
                        transcript={item.voicemailTranscript}
                        durationSeconds={item.audioSampleDuration || 15}
                        callerName={item.senderName}
                      />
                    )}

                    {/* Action buttons row */}
                    <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => {
                            const firstKw = item.matchedKeywords[0] || 'loan approval';
                            onAddKeywordFromText(firstKw);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
                        >
                          <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Add Keyword</span>
                        </button>

                        <button
                          onClick={() => onWhitelist(item.id, item.senderNumber)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Whitelist</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onReport(item.id)}
                          disabled={item.reportedToSamsung}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
                            item.reportedToSamsung
                              ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30'
                              : 'text-slate-300 hover:text-white bg-slate-800'
                          }`}
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>{item.reportedToSamsung ? 'Reported' : 'Report'}</span>
                        </button>

                        <button
                          onClick={() => onDelete(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Clear All Footer */}
      {items.length > 0 && (
        <div className="flex items-center justify-between pt-2 text-xs text-slate-400 border-t border-slate-800">
          <span>{filteredItems.length} of {items.length} records</span>
          <button
            onClick={onClearAll}
            className="text-slate-400 hover:text-rose-400 font-medium"
          >
            Clear History
          </button>
        </div>
      )}

    </div>
  );
};
