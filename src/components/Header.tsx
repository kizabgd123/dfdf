import React from 'react';
import { Mic, Radio, Sparkles, FileText, Upload, Volume2 } from 'lucide-react';

interface HeaderProps {
  isListening: boolean;
  activeTab: 'dictate' | 'history';
  setActiveTab: (tab: 'dictate' | 'history') => void;
  onOpenAudioUpload: () => void;
  savedNotesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  isListening,
  activeTab,
  setActiveTab,
  onOpenAudioUpload,
  savedNotesCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-black/95 backdrop-blur-md border-b-2 border-[#CCFF00] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-none bg-[#CCFF00] text-black font-black shadow-[0_0_15px_rgba(204,255,0,0.4)]">
            <Mic className="w-5 h-5 text-black stroke-[2.5]" />
            {isListening && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full bg-[#CCFF00] opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 bg-[#CCFF00]"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-lg uppercase tracking-widest text-white">
                Govor <span className="text-[#CCFF00]">u</span> Tekst
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-[#181818] text-[#CCFF00] border border-[#262626]">
                Neural Sync
              </span>
            </div>
            <p className="text-[11px] font-mono text-zinc-400 hidden md:block uppercase tracking-wider">
              Direktan prenos misli • Bez filozofije
            </p>
          </div>
        </div>

        {/* Center Live Indicator badge */}
        {isListening && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#181818] border border-[#CCFF00] text-[#CCFF00] text-xs font-black uppercase tracking-wider animate-pulse">
            <Radio className="w-4 h-4 text-[#CCFF00] animate-spin" />
            <span>Slušam vaše reči...</span>
          </div>
        )}

        {/* Navigation Tabs & Actions */}
        <div className="flex items-center gap-2">
          {/* Dictate Tab */}
          <button
            id="tab-dictate-btn"
            onClick={() => setActiveTab('dictate')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-wider transition-all border ${
              activeTab === 'dictate'
                ? 'bg-[#CCFF00] text-black border-[#CCFF00] shadow-[0_0_12px_rgba(204,255,0,0.3)]'
                : 'bg-black text-zinc-300 border-[#262626] hover:border-[#CCFF00] hover:text-[#CCFF00]'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>Diktiranje</span>
          </button>

          {/* History / Notes Tab */}
          <button
            id="tab-history-btn"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-wider transition-all relative border ${
              activeTab === 'history'
                ? 'bg-[#CCFF00] text-black border-[#CCFF00] shadow-[0_0_12px_rgba(204,255,0,0.3)]'
                : 'bg-black text-zinc-300 border-[#262626] hover:border-[#CCFF00] hover:text-[#CCFF00]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Beleške</span>
            {savedNotesCount > 0 && (
              <span className={`ml-0.5 px-1.5 py-0.2 text-[10px] font-black border ${
                activeTab === 'history' ? 'bg-black text-[#CCFF00] border-black' : 'bg-[#CCFF00] text-black border-[#CCFF00]'
              }`}>
                {savedNotesCount}
              </span>
            )}
          </button>

          {/* Upload Audio Option */}
          <button
            id="upload-audio-header-btn"
            onClick={onOpenAudioUpload}
            title="Transkribuj zvučni snimak"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-black uppercase tracking-wider text-zinc-300 bg-black border border-[#262626] hover:border-[#CCFF00] hover:text-[#CCFF00] transition-all hidden lg:flex"
          >
            <Upload className="w-4 h-4 text-[#CCFF00]" />
            <span>Snimak</span>
          </button>
        </div>

      </div>
    </header>
  );
};
