import React, { useState } from 'react';
import { 
  Download, 
  ShieldCheck, 
  FileSpreadsheet, 
  CheckCircle2
} from 'lucide-react';
import { SpamStats, BlockedItem, KeywordRule } from '../types';

interface ReportsViewProps {
  stats: SpamStats;
  items: BlockedItem[];
  keywords: KeywordRule[];
  isMobileLayout?: boolean;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  stats,
  items,
  keywords,
  isMobileLayout = false,
}) => {
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Timestamp',
      'Type',
      'Sender Number',
      'Caller Name',
      'Location',
      'Category',
      'Threat Level',
      'Trigger Reason',
      'Matched Keywords',
      'Message / Voicemail Transcript',
      'Action Taken',
    ];

    const rows = items.map(item => [
      item.id,
      item.timestamp,
      item.type,
      `"${item.senderNumber}"`,
      `"${item.senderName || ''}"`,
      `"${item.location || ''}"`,
      item.category,
      item.threatLevel,
      `"${item.triggerReason}"`,
      `"${item.matchedKeywords.join(', ')}"`,
      `"${(item.messageContent || item.voicemailTranscript || '').replace(/"/g, '""')}"`,
      item.actionTaken,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `samsung_s26_blocked_spam_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice('Exported CSV audit report to your downloads folder!');
    setTimeout(() => setExportNotice(null), 4000);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ stats, items, keywords }, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `samsung_s26_spam_intelligence_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice('Exported full JSON threat dataset!');
    setTimeout(() => setExportNotice(null), 4000);
  };

  const maxKeywordCount = Math.max(...stats.topBlockedKeywords.map(k => k.count), 1);
  const maxTrendDay = Math.max(...stats.dailyTrend.map(d => d.calls + d.sms), 1);

  const loanScamPercentage = stats.totalBlocked > 0 
    ? Math.round((stats.loanSpamBlocked / stats.totalBlocked) * 100) 
    : 0;

  const timeBuckets = [
    { label: 'Late Night (12am-4am)', count: 0 },
    { label: 'Early Morning (4am-8am)', count: 0 },
    { label: 'Morning Peak (8am-12pm)', count: 0, isPeak: true },
    { label: 'Mid-Day Surge (12pm-4pm)', count: 0, isPeak: true },
    { label: 'Late Afternoon (4pm-8pm)', count: 0 },
    { label: 'Evening (8pm-12am)', count: 0 },
  ];

  stats.hourlyDistribution.forEach(h => {
    const bucketIndex = Math.min(Math.floor(h.hour / 4), 5);
    timeBuckets[bucketIndex].count += h.count;
  });

  const maxBucketCount = Math.max(...timeBuckets.map(b => b.count), 1);

  return (
    <div className={`space-y-4 ${isMobileLayout ? 'p-3' : 'p-4 sm:p-6 max-w-5xl mx-auto'}`}>
      
      {/* Header and Export Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
              Blocked Spam Analytics
            </h2>
            <span className="text-[11px] font-mono font-semibold text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/60">
              S26 Knox
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            Audit of blocked robocalls, loan schemes, and spam SMS.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 bg-emerald-950/50 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Top 4 Key Metric Cards */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        
        {/* Card 1: Total Intercepted */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 space-y-1">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider block truncate">
            Total Intercepted
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white tabular-nums">
            {stats.totalBlocked}
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <ShieldCheck className="w-3 h-3 shrink-0" />
            <span className="truncate">100% Dropped Silently</span>
          </div>
        </div>

        {/* Card 2: Loan Approval Spam */}
        <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-3 sm:p-4 space-y-1">
          <span className="text-[11px] sm:text-xs font-semibold text-amber-300 uppercase tracking-wider block truncate">
            Loan Scams Blocked
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-300 tabular-nums">
            {stats.loanSpamBlocked}
          </div>
          <div className="text-[11px] text-slate-300 truncate">
            <strong className="text-amber-400 font-mono">{loanScamPercentage}%</strong> of all spam
          </div>
        </div>

        {/* Card 3: Robocalls Dropped */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 space-y-1">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider block truncate">
            Robocalls Silenced
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-cyan-300 tabular-nums">
            {stats.callsBlocked}
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            Zero screen wakeups
          </div>
        </div>

        {/* Card 4: Quiet Time Saved */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 space-y-1">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider block truncate">
            Est. Time Saved
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-300 tabular-nums">
            {stats.timeSavedMinutes}m
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            Disruptions prevented
          </div>
        </div>

      </div>

      {/* Main Charts */}
      <div className={`grid gap-3.5 ${isMobileLayout ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
        
        {/* Daily Interception Trend */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white">Daily Threat Volume</h3>
              <p className="text-[11px] text-slate-400">Past 7 days</p>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-semibold">
              <span className="flex items-center gap-1 text-cyan-300">
                <span className="w-2.5 h-2.5 rounded bg-cyan-400" /> Calls
              </span>
              <span className="flex items-center gap-1 text-amber-300">
                <span className="w-2.5 h-2.5 rounded bg-amber-400" /> Texts
              </span>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="h-40 flex items-end justify-between gap-2 pt-4 px-1 border-b border-slate-800">
            {stats.dailyTrend.map((day, idx) => {
              const callHeight = (day.calls / maxTrendDay) * 90;
              const smsHeight = (day.sms / maxTrendDay) * 90;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <div className="w-full max-w-[24px] flex flex-col justify-end gap-0.5">
                    <div
                      style={{ height: `${Math.max(4, smsHeight)}px` }}
                      className="w-full bg-amber-400 rounded-t-sm"
                      title={`${day.date}: ${day.sms} Texts`}
                    />
                    <div
                      style={{ height: `${Math.max(6, callHeight)}px` }}
                      className="w-full bg-cyan-400 rounded-b-sm"
                      title={`${day.date}: ${day.calls} Calls`}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                    {day.date.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Triggered Keywords Ranking */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-white">Top Blocked Keywords</h3>
            <span className="text-[11px] text-cyan-400 font-mono font-semibold">Ranked</span>
          </div>

          <div className="space-y-2.5">
            {stats.topBlockedKeywords.slice(0, 5).map((item, idx) => {
              const percentage = Math.round((item.count / maxKeywordCount) * 100);
              const isLoan = item.keyword.toLowerCase().includes('loan') || item.keyword.toLowerCase().includes('debt');

              return (
                <div key={item.keyword} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-slate-500 font-mono text-[11px] w-3.5">#{idx + 1}</span>
                      <span className="font-bold text-white font-mono truncate">
                        "{item.keyword}"
                      </span>
                      {isLoan && (
                        <span className="text-[10px] text-amber-300 font-semibold px-1 rounded bg-amber-400/20 shrink-0">
                          Loan
                        </span>
                      )}
                    </div>
                    <span className="text-slate-200 font-mono font-bold shrink-0 ml-1">
                      {item.count}
                    </span>
                  </div>

                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      style={{ width: `${percentage}%` }}
                      className={`h-full rounded-full ${isLoan ? 'bg-amber-400' : 'bg-cyan-400'}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Hourly Spammer Activity Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-4 space-y-2.5">
        <h3 className="text-xs sm:text-sm font-bold text-white">Spammer Timing Windows (Peak Hours)</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
          {timeBuckets.slice(0, 4).map(bucket => {
            const barWidth = Math.round((bucket.count / maxBucketCount) * 100);
            return (
              <div
                key={bucket.label}
                className={`p-2.5 rounded-xl border text-xs ${
                  bucket.isPeak
                    ? 'bg-amber-950/20 border-amber-500/40'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-slate-200 truncate">
                    {bucket.label}
                  </span>
                  <span className="font-mono font-bold text-white shrink-0 ml-1">
                    {bucket.count} hits
                  </span>
                </div>

                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${barWidth}%` }}
                    className={`h-full rounded-full ${bucket.isPeak ? 'bg-amber-400' : 'bg-cyan-500'}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
