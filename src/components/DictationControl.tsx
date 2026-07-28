import React, { useEffect, useState } from 'react';
import { Mic, MicOff, Pause, Play, Globe, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../utils/speechRecognition';
import { LanguageOption } from '../types';

interface DictationControlProps {
  isListening: boolean;
  isPaused: boolean;
  selectedLanguage: string;
  onToggleListen: () => void;
  onPauseResume: () => void;
  onLanguageChange: (langCode: string) => void;
  onClearText: () => void;
  hasText: boolean;
  errorMessage: string | null;
  isSupported: boolean;
}

export const DictationControl: React.FC<DictationControlProps> = ({
  isListening,
  isPaused,
  selectedLanguage,
  onToggleListen,
  onPauseResume,
  onLanguageChange,
  onClearText,
  hasText,
  errorMessage,
  isSupported,
}) => {
  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];

  // Visualizer audio level simulation
  const [audioBars, setAudioBars] = useState<number[]>([20, 40, 60, 30, 80, 50, 30, 70, 40, 20]);

  useEffect(() => {
    let interval: any;
    if (isListening && !isPaused) {
      interval = setInterval(() => {
        setAudioBars(
          Array.from({ length: 14 }, () => Math.floor(Math.random() * 75) + 15)
        );
      }, 100);
    } else {
      setAudioBars(Array.from({ length: 14 }, () => 10));
    }
    return () => clearInterval(interval);
  }, [isListening, isPaused]);

  return (
    <div className="w-full bg-black border-2 border-[#262626] rounded-none p-6 shadow-2xl relative overflow-hidden">
      {/* Background Accent glow */}
      {isListening && !isPaused && (
        <div className="absolute inset-0 bg-[#CCFF00]/5 pointer-events-none animate-pulse" />
      )}

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left: Language Selector & Status */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          {/* Language Selector */}
          <div className="relative group w-full sm:w-auto">
            <label className="text-[10px] text-[#CCFF00] font-black uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-[#CCFF00]" />
              <span>Jezik govora:</span>
            </label>
            <div className="flex items-center gap-2 bg-[#181818] border border-[#262626] rounded-none px-3 py-2 text-xs text-white hover:border-[#CCFF00] transition-colors">
              <span className="text-base">{currentLangObj.flag}</span>
              <select
                id="language-select"
                value={selectedLanguage}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="bg-transparent text-white font-black text-xs uppercase tracking-wide focus:outline-none cursor-pointer pr-2"
              >
                {SUPPORTED_LANGUAGES.map((lang: LanguageOption) => (
                  <option key={lang.code} value={lang.code} className="bg-black text-white font-sans">
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Audio Wave Visualizer */}
          <div className="flex items-center gap-1 h-9 px-4 py-1 bg-[#181818] border border-[#262626] w-full sm:w-auto justify-center">
            {audioBars.map((height, i) => (
              <div
                key={i}
                className={`w-1 rounded-none transition-all duration-100 ${
                  isListening && !isPaused
                    ? 'bg-[#CCFF00] shadow-[0_0_8px_#CCFF00]'
                    : 'bg-zinc-700'
                }`}
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>

        {/* Center: Big Microphone Button */}
        <div className="flex flex-col items-center justify-center my-2 md:my-0">
          <div className="relative flex items-center justify-center">
            
            {/* Pulse Rings */}
            {isListening && !isPaused && (
              <>
                <span className="absolute w-28 h-28 rounded-full bg-[#CCFF00]/20 animate-ping" />
                <span className="absolute w-24 h-24 rounded-full bg-[#CCFF00]/30 animate-pulse" />
              </>
            )}

            {/* Main Microphone Button */}
            <button
              id="main-microphone-btn"
              onClick={onToggleListen}
              disabled={!isSupported}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 transform active:scale-95 ${
                !isSupported
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                  : isListening
                  ? isPaused
                    ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.5)] border-2 border-white'
                    : 'bg-[#CCFF00] hover:bg-[#b8e600] text-black shadow-[0_0_25px_#CCFF00] border-2 border-white scale-105'
                  : 'bg-[#CCFF00] hover:bg-[#b8e600] text-black shadow-[0_0_20px_rgba(204,255,0,0.4)] hover:scale-105'
              }`}
            >
              {isListening ? (
                isPaused ? (
                  <Play className="w-8 h-8 ml-1 text-black stroke-[3]" />
                ) : (
                  <Mic className="w-9 h-9 text-black stroke-[3] animate-bounce" />
                )
              ) : (
                <Mic className="w-9 h-9 text-black stroke-[3]" />
              )}
            </button>
          </div>

          {/* Status Hint */}
          <div className="mt-3 text-center">
            <span className="text-xs font-black uppercase tracking-widest">
              {isListening ? (
                isPaused ? (
                  <span className="text-amber-400 flex items-center gap-1.5 justify-center">
                    <Pause className="w-4 h-4" /> Diktiranje pauzirano
                  </span>
                ) : (
                  <span className="text-[#CCFF00] flex items-center gap-1.5 justify-center">
                    <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-ping" />
                    Direktan prenos misli aktivan
                  </span>
                )
              ) : (
                <span className="text-zinc-400">Kliknite mikrofon i govorite slobodno</span>
              )}
            </span>
          </div>
        </div>

        {/* Right: Pause & Secondary Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {isListening && (
            <button
              id="pause-resume-btn"
              onClick={onPauseResume}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#181818] hover:bg-black text-white border border-[#262626] hover:border-[#CCFF00] text-xs font-black uppercase tracking-wider transition-all"
            >
              {isPaused ? (
                <>
                  <Play className="w-4 h-4 text-[#CCFF00]" />
                  <span>Nastavi</span>
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4 text-[#CCFF00]" />
                  <span>Pauziraj</span>
                </>
              )}
            </button>
          )}

          {hasText && (
            <button
              id="clear-text-btn"
              onClick={onClearText}
              title="Očisti trenutni tekst"
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#181818] hover:bg-[#262626] text-zinc-300 hover:text-[#CCFF00] border border-[#262626] text-xs font-black uppercase tracking-wider transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Očisti</span>
            </button>
          )}
        </div>

      </div>

      {/* Unsupported Browser Warning */}
      {!isSupported && (
        <div className="mt-4 p-3 bg-[#181818] border-2 border-red-500 text-red-400 text-xs font-bold uppercase tracking-wide flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
          <span>
            Vaš pregledač ne podržava Web Speech API. Preporučujemo Google Chrome ili Edge, ili koristite dugme "Snimak" gore.
          </span>
        </div>
      )}

      {/* Error Message Banner */}
      {errorMessage && (
        <div className="mt-4 p-3 bg-[#181818] border-2 border-[#CCFF00] text-[#CCFF00] text-xs font-bold uppercase tracking-wide flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-[#CCFF00]" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
