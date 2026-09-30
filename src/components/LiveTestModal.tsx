import React, { useState } from 'react';
import { 
  X, 
  PhoneCall, 
  MessageSquare, 
  Play, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles
} from 'lucide-react';
import { CommunicationType, KeywordRule, BlockerSettings, BlockedItem } from '../types';
import { evaluateIncomingCommunication } from '../services/blockerEngine';

interface LiveTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  keywords: KeywordRule[];
  settings: BlockerSettings;
  whitelist: string[];
  onTriggerSimulation: (item: BlockedItem, isBlocked: boolean) => void;
}

export const LiveTestModal: React.FC<LiveTestModalProps> = ({
  isOpen,
  onClose,
  keywords,
  settings,
  whitelist,
  onTriggerSimulation,
}) => {
  const [testType, setTestType] = useState<CommunicationType>('call');
  const [senderNumber, setSenderNumber] = useState('+1 (800) 412-9844');
  const [senderName, setSenderName] = useState('Automated Lending Network');
  const [location, setLocation] = useState('Toll-Free USA');
  const [content, setContent] = useState(
    'Hello, this is our automated verification center regarding your loan approval of up to $45,000. Your application has cleared underwriting with zero down payment financing. Press 1 to speak with an agent.'
  );

  if (!isOpen) return null;

  const handlePresetSelect = (presetKey: string) => {
    if (presetKey === 'loan_call') {
      setTestType('call');
      setSenderNumber('+1 (800) 792-3811');
      setSenderName('FastTrack Underwriting');
      setLocation('Toll-Free USA');
      setContent(
        'Urgent notice: Status update on your loan approval for an unsecured personal loan. We have pre-approved funding up to $50,000 ready for electronic transfer today. Press 1 to accept funds.'
      );
    } else if (presetKey === 'loan_sms') {
      setTestType('sms');
      setSenderNumber('+1 (512) 849-0199');
      setSenderName('5128490199');
      setLocation('Austin, TX (Neighbor Spoof)');
      setContent(
        'FINAL NOTICE: Your loan approval code #TX-8812 expires at 5PM. Confirm disbursement details here: https://quick-cash-fund26.com/claim'
      );
    } else if (presetKey === 'legit_call') {
      setTestType('call');
      setSenderNumber('+1 (512) 555-0100');
      setSenderName('Mom');
      setLocation('Austin, TX');
      setContent('Hi honey, just calling to see if we are still on for dinner this Sunday. Give me a call back when you are free!');
    } else if (presetKey === 'irs_scam') {
      setTestType('call');
      setSenderNumber('+1 (202) 555-0143');
      setSenderName('Internal Revenue Service Legal Action');
      setLocation('Washington, DC');
      setContent('This is officer Ryan from the Internal Revenue Service legal action bureau. Failure to reply immediately will result in local authorities dispatching an arrest warrant.');
    }
  };

  const handleRunSimulation = (e: React.FormEvent) => {
    e.preventDefault();

    const evaluation = evaluateIncomingCommunication(
      testType,
      senderNumber,
      senderName,
      content,
      keywords,
      settings,
      whitelist
    );

    const newItem: BlockedItem = {
      id: `sim-${Date.now()}`,
      type: testType,
      senderNumber,
      senderName,
      location,
      timestamp: new Date().toISOString(),
      category: evaluation.category,
      threatLevel: evaluation.threatLevel,
      triggerReason: evaluation.reason || 'Simulated incoming communication',
      matchedKeywords: evaluation.matchedKeywords,
      messageContent: testType === 'sms' ? content : undefined,
      voicemailTranscript: testType === 'call' ? content : undefined,
      audioSampleDuration: 15,
      actionTaken: evaluation.action,
      reportedToSamsung: false,
      whitelisted: false,
      notes: 'Generated via Live S26 Telephony Simulator',
    };

    onTriggerSimulation(newItem, evaluation.shouldBlock);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-3xl p-6 shadow-2xl relative space-y-5 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-cyan-400" />
              Simulate Incoming Call or Text
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Verify how your Samsung Galaxy S26 automatically evaluates and drops incoming spam.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Choose a Scenario Preset:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handlePresetSelect('loan_call')}
              className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/40 text-left hover:bg-amber-900/30 transition-colors"
            >
              <span className="font-bold text-amber-300 block text-sm">📞 Loan Approval Call</span>
              <span className="text-xs text-slate-300 mt-0.5 block">Robocall pitching pre-approved loan</span>
            </button>

            <button
              type="button"
              onClick={() => handlePresetSelect('loan_sms')}
              className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/40 text-left hover:bg-amber-900/30 transition-colors"
            >
              <span className="font-bold text-amber-300 block text-sm">💬 Loan Scam SMS</span>
              <span className="text-xs text-slate-300 mt-0.5 block">Text claiming escrow funds deposited</span>
            </button>

            <button
              type="button"
              onClick={() => handlePresetSelect('irs_scam')}
              className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/40 text-left hover:bg-rose-900/30 transition-colors"
            >
              <span className="font-bold text-rose-300 block text-sm">📞 IRS Fraud Threat</span>
              <span className="text-xs text-slate-300 mt-0.5 block">Automated legal action robocall</span>
            </button>

            <button
              type="button"
              onClick={() => handlePresetSelect('legit_call')}
              className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/40 text-left hover:bg-emerald-900/30 transition-colors"
            >
              <span className="font-bold text-emerald-300 block text-sm">💚 Legitimate Contact</span>
              <span className="text-xs text-slate-300 mt-0.5 block">Mom (Whitelist allowed)</span>
            </button>
          </div>
        </div>

        {/* Form fields */}
        <form onSubmit={handleRunSimulation} className="space-y-4 pt-2 border-t border-slate-800">
          {/* Type Toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTestType('call')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                testType === 'call'
                  ? 'bg-cyan-400 text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <PhoneCall className="w-4 h-4" />
              <span>Incoming Voice Call</span>
            </button>
            <button
              type="button"
              onClick={() => setTestType('sms')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                testType === 'sms'
                  ? 'bg-cyan-400 text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Incoming SMS Text</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Sender Number
              </label>
              <input
                type="text"
                value={senderNumber}
                onChange={(e) => setSenderNumber(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Caller ID Name
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {testType === 'call' ? 'Call Audio Transcript / Robocall Script' : 'SMS Text Body'}
            </label>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Simulate Transmission</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
