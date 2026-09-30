import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2 } from 'lucide-react';

interface AudioPlayerWaveformProps {
  transcript: string;
  durationSeconds?: number;
  callerName?: string;
}

export const AudioPlayerWaveform: React.FC<AudioPlayerWaveformProps> = ({
  transcript,
  durationSeconds = 15,
  callerName = 'Automated Robocall',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Generate deterministic bar heights for authentic audio waveform
  const bars = React.useMemo(() => {
    const list: number[] = [];
    let seed = 42;
    for (let i = 0; i < 28; i++) {
      seed = (seed * 9301 + 49297) % 233280;
      const rnd = seed / 233280;
      const envelope = Math.sin((i / 28) * Math.PI);
      const height = Math.max(20, Math.floor((rnd * 65 + 25) * (0.4 + envelope * 0.7)));
      list.push(height);
    }
    return list;
  }, []);

  const stopPlayback = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    setIsPlaying(false);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopPlayback();
      return;
    }

    setIsPlaying(true);
    startTimeRef.current = performance.now() - (progress * durationSeconds * 1000);

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(transcript);
      utterance.rate = 1.05;
      utterance.pitch = 0.95;
      utterance.onend = () => {
        setIsPlaying(false);
        setProgress(1);
        setCurrentTime(durationSeconds);
      };
      utterance.onerror = () => {
        setIsPlaying(false);
      };
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }

    const updateProgress = (now: number) => {
      if (!startTimeRef.current) return;
      const elapsed = (now - startTimeRef.current) / 1000;
      if (elapsed >= durationSeconds) {
        setIsPlaying(false);
        setProgress(1);
        setCurrentTime(durationSeconds);
        return;
      }
      setProgress(elapsed / durationSeconds);
      setCurrentTime(elapsed);
      animFrameRef.current = requestAnimationFrame(updateProgress);
    };

    animFrameRef.current = requestAnimationFrame(updateProgress);
  };

  const handleReset = () => {
    stopPlayback();
    setProgress(0);
    setCurrentTime(0);
  };

  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, []);

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-3">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-amber-300 font-medium">
          <Volume2 className="w-4 h-4 shrink-0" />
          <span>Intercepted Robocall Audio Recording</span>
        </div>
        <div className="text-slate-300 font-mono text-xs tabular-nums bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
          {formatSeconds(currentTime)} / {formatSeconds(durationSeconds)}
        </div>
      </div>

      {/* Waveform graphic */}
      <div className="flex items-center justify-between h-10 gap-1.5 px-2 bg-slate-950 rounded-lg border border-slate-800/80">
        {bars.map((barHeight, idx) => {
          const barFraction = idx / bars.length;
          const isPassed = barFraction <= progress;
          const isCurrent = Math.abs(barFraction - progress) < 0.05 && isPlaying;
          return (
            <div
              key={idx}
              className={`flex-1 rounded-full transition-all duration-100 ${
                isCurrent
                  ? 'bg-amber-400 scale-y-110'
                  : isPassed
                  ? 'bg-amber-500'
                  : 'bg-slate-800'
              }`}
              style={{
                height: `${isCurrent ? Math.min(100, barHeight * 1.25) : barHeight}%`,
              }}
            />
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between pt-0.5">
        <div className="flex items-center gap-2">
          <button
            onClick={handleTogglePlay}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 text-xs font-semibold transition-colors active:scale-95"
            aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play Voice</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Replay from start"
            aria-label="Replay"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <span className="text-xs text-slate-400">
          Samsung Call Assist Audio
        </span>
      </div>
    </div>
  );
};
