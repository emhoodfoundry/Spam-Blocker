import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Smartphone, 
  Download, 
  Copy, 
  Check, 
  ShieldCheck, 
  AlertCircle,
  ExternalLink,
  QrCode,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose }) => {
  const [copiedPre, setCopiedPre] = useState(false);
  const [copiedDev, setCopiedDev] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [selectedUrlType, setSelectedUrlType] = useState<'shared' | 'dev'>('shared');

  const sharedUrl = 'https://ais-pre-ikltjvz7ox672bthx4vtwh-502358859131.us-east1.run.app';
  const devUrl = 'https://ais-dev-ikltjvz7ox672bthx4vtwh-502358859131.us-east1.run.app';

  const activeUrl = selectedUrlType === 'shared' ? sharedUrl : devUrl;

  useEffect(() => {
    QRCode.toDataURL(activeUrl, {
      width: 240,
      margin: 2,
      color: {
        dark: '#020617',
        light: '#ffffff',
      },
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('Failed to generate QR code:', err));
  }, [activeUrl]);

  const handleCopy = (text: string, isDev: boolean) => {
    navigator.clipboard.writeText(text);
    if (isDev) {
      setCopiedDev(true);
      setTimeout(() => setCopiedDev(false), 2500);
    } else {
      setCopiedPre(true);
      setTimeout(() => setCopiedPre(false), 2500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-3xl p-5 sm:p-6 shadow-2xl relative space-y-4 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-cyan-400" />
              Install ShieldS26 to Your Samsung Phone
            </h3>
            <p className="text-xs text-slate-300">
              Fix the 404 error and install as a standalone app on your Galaxy S26.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 404 Explanation & Fix Notice */}
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/50 space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Why did you see "404 Page not found"?</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            In Google AI Studio, the public Shared URL only activates <strong>after you click the "Publish" or "Share" button</strong> in the top-right toolbar of the AI Studio window.
          </p>
          <div className="bg-slate-950/70 p-2.5 rounded-xl border border-amber-500/30 flex items-center gap-2 text-xs text-amber-200">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Action required:</strong> Look at the very top right of your screen in AI Studio &rarr; Click <strong>"Publish"</strong> (or <strong>"Share"</strong>).
            </span>
          </div>
        </div>

        {/* QR Code Scan Option */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
          {/* QR Canvas */}
          <div className="bg-white p-2 rounded-xl shrink-0 shadow-md">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Scan QR with Samsung Camera" className="w-36 h-36 rounded-lg" />
            ) : (
              <div className="w-36 h-36 flex items-center justify-center text-xs text-slate-500">
                Generating QR...
              </div>
            )}
          </div>

          {/* QR Instructions */}
          <div className="space-y-2 min-w-0 flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-cyan-300 font-bold text-xs">
              <QrCode className="w-4 h-4" />
              <span>Scan with your Samsung S26 Camera</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Open your Galaxy S26 Camera app, point it at this QR code, and tap the link pop-up to open directly in Samsung Internet or Chrome!
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-1 text-[11px] text-slate-400">
              <span>Points to:</span>
              <span className="font-mono text-cyan-400 truncate max-w-[200px]">{activeUrl}</span>
            </div>
          </div>
        </div>

        {/* URL Links with Copy Buttons */}
        <div className="space-y-2.5">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>1. Public App URL (Active once you click Publish):</span>
              <button
                onClick={() => handleCopy(sharedUrl, false)}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold"
              >
                {copiedPre ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPre ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-cyan-300 select-all truncate">
              {sharedUrl}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>2. Alternate Development URL (If logged into your Google account on phone):</span>
              <button
                onClick={() => handleCopy(devUrl, true)}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold"
              >
                {copiedDev ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedDev ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-400 select-all truncate">
              {devUrl}
            </div>
          </div>
        </div>

        {/* Step-by-Step Install in Samsung Phone */}
        <div className="space-y-2 pt-1 border-t border-slate-800 text-xs">
          <label className="font-bold text-white block">
            After the page opens on your Samsung phone:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="font-bold text-cyan-300 block">Samsung Internet</span>
              <ol className="list-decimal list-inside space-y-0.5 text-slate-300">
                <li>Tap <strong>Menu (☰)</strong> at bottom right.</li>
                <li>Tap <strong>+ Add page to</strong>.</li>
                <li>Select <strong>App screen</strong>.</li>
              </ol>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="font-bold text-cyan-300 block">Google Chrome</span>
              <ol className="list-decimal list-inside space-y-0.5 text-slate-300">
                <li>Tap <strong>Three Dots (⋮)</strong> at top right.</li>
                <li>Tap <strong>Install app</strong> or <strong>Add to Home</strong>.</li>
                <li>Tap <strong>Install</strong> to confirm.</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
