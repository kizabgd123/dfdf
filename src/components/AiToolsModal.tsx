import React, { useState } from 'react';
import { Sparkles, Check, Copy, RefreshCw, ArrowRight, X, Wand2, FileCheck, Languages, ListOrdered, Send } from 'lucide-react';
import { AiActionType } from '../types';

interface AiToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalText: string;
  onApplyEnhancedText: (newText: string) => void;
}

export const AiToolsModal: React.FC<AiToolsModalProps> = ({
  isOpen,
  onClose,
  originalText,
  onApplyEnhancedText,
}) => {
  const [selectedAction, setSelectedAction] = useState<AiActionType>('cleanup');
  const [targetLanguage, setTargetLanguage] = useState('Engleski');
  const [customPrompt, setCustomPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleRunAi = async (actionOverride?: AiActionType) => {
    const actionToRun = actionOverride || selectedAction;
    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/ai-enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: originalText,
          action: actionToRun,
          targetLanguage,
          customPrompt,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Greška pri obradi AI zahteva.');
      }

      setAiResult(data.result);
    } catch (err: any) {
      console.error('AI error:', err);
      setErrorMsg(err.message || 'Došlo je do greške pri radu sa AI asistentom.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAiResult = () => {
    if (!aiResult) return;
    navigator.clipboard.writeText(aiResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (aiResult) {
      onApplyEnhancedText(aiResult);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="bg-black border-2 border-[#CCFF00] max-w-4xl w-full p-6 sm:p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#262626]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#CCFF00] text-black font-black">
              <Sparkles className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-widest text-white">AI Asistent za Obradu Govora</h3>
              <p className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                Poboljšajte, sažmite ili prevedite izdiktirani tekst uz pomoć Gemini AI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white bg-[#181818] border border-[#262626] hover:border-[#CCFF00] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Action Selector Toolbar */}
        <div className="py-4 grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-[#262626]">
          
          <button
            onClick={() => { setSelectedAction('cleanup'); handleRunAi('cleanup'); }}
            className={`p-3 border text-left transition-all flex flex-col gap-1 ${
              selectedAction === 'cleanup'
                ? 'bg-[#CCFF00] text-black border-[#CCFF00]'
                : 'bg-[#181818] border-[#262626] text-zinc-300 hover:border-[#CCFF00] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-wider">
              <Wand2 className="w-4 h-4 text-[#CCFF00] group-hover:text-black" />
              <span>Očisti & Gramatika</span>
            </div>
            <span className="text-[10px] opacity-80 uppercase tracking-wide">Uklanja poštapalice</span>
          </button>

          <button
            onClick={() => { setSelectedAction('summarize'); handleRunAi('summarize'); }}
            className={`p-3 border text-left transition-all flex flex-col gap-1 ${
              selectedAction === 'summarize'
                ? 'bg-[#CCFF00] text-black border-[#CCFF00]'
                : 'bg-[#181818] border-[#262626] text-zinc-300 hover:border-[#CCFF00] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-wider">
              <ListOrdered className="w-4 h-4 text-[#CCFF00]" />
              <span>Sažmi u teze</span>
            </div>
            <span className="text-[10px] opacity-80 uppercase tracking-wide">Kratak rezime</span>
          </button>

          <button
            onClick={() => { setSelectedAction('structure'); handleRunAi('structure'); }}
            className={`p-3 border text-left transition-all flex flex-col gap-1 ${
              selectedAction === 'structure'
                ? 'bg-[#CCFF00] text-black border-[#CCFF00]'
                : 'bg-[#181818] border-[#262626] text-zinc-300 hover:border-[#CCFF00] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-wider">
              <FileCheck className="w-4 h-4 text-[#CCFF00]" />
              <span>Struktura</span>
            </div>
            <span className="text-[10px] opacity-80 uppercase tracking-wide">Naslovi i pasusi</span>
          </button>

          <button
            onClick={() => { setSelectedAction('translate'); }}
            className={`p-3 border text-left transition-all flex flex-col gap-1 ${
              selectedAction === 'translate'
                ? 'bg-[#CCFF00] text-black border-[#CCFF00]'
                : 'bg-[#181818] border-[#262626] text-zinc-300 hover:border-[#CCFF00] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-wider">
              <Languages className="w-4 h-4 text-[#CCFF00]" />
              <span>Prevedi</span>
            </div>
            <span className="text-[10px] opacity-80 uppercase tracking-wide">Više jezika</span>
          </button>

        </div>

        {/* Translation Option Controls if selected */}
        {selectedAction === 'translate' && (
          <div className="py-3 flex flex-wrap items-center gap-3 bg-[#181818] p-3 border border-[#262626] my-2">
            <span className="text-xs text-[#CCFF00] font-black uppercase tracking-wider">Ciljni jezik:</span>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="px-3 py-1.5 bg-black border border-[#262626] text-white text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-[#CCFF00]"
            >
              <option value="Engleski">Engleski (English)</option>
              <option value="Nemački">Nemački (Deutsch)</option>
              <option value="Francuski">Francuski (Français)</option>
              <option value="Španski">Španski (Español)</option>
              <option value="Ruski">Ruski (Русский)</option>
              <option value="Italijanski">Italijanski (Italiano)</option>
              <option value="Srpski">Srpski (Ćirilica/Latinica)</option>
            </select>
            <button
              onClick={() => handleRunAi('translate')}
              disabled={loading}
              className="px-4 py-1.5 bg-[#CCFF00] text-black text-xs font-black uppercase tracking-wider hover:bg-[#b8e600] transition-all flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5 text-black stroke-[2.5]" />
              <span>Pokreni prevod</span>
            </button>
          </div>
        )}

        {/* Main Content Side-by-Side View */}
        <div className="flex-1 my-4 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-1">
          
          {/* Left: Original Transcript */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              Originalni Diktat:
            </label>
            <div className="flex-1 p-4 bg-[#080808] border border-[#262626] text-zinc-300 text-sm font-bold leading-relaxed overflow-y-auto max-h-[280px]">
              {originalText || <span className="text-zinc-600 italic">Nema teksta za obradu.</span>}
            </div>
          </div>

          {/* Right: AI Result */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#CCFF00] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                AI Poboljšana Verzija:
              </label>
              {aiResult && (
                <button
                  onClick={handleCopyAiResult}
                  className="text-xs font-black uppercase tracking-wider text-zinc-300 hover:text-[#CCFF00] flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#CCFF00] stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Kopirano" : "Kopiraj"}</span>
                </button>
              )}
            </div>

            <div className="flex-1 p-4 bg-[#080808] border border-[#262626] text-white text-sm font-bold leading-relaxed overflow-y-auto max-h-[280px] relative">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center gap-3 text-[#CCFF00] py-12">
                  <RefreshCw className="w-8 h-8 animate-spin text-[#CCFF00]" />
                  <span className="text-xs font-black uppercase tracking-widest">Gemini AI obrađuje tekst...</span>
                </div>
              ) : errorMsg ? (
                <div className="text-red-400 text-xs font-bold p-3 bg-red-950/40 border border-red-500">
                  {errorMsg}
                </div>
              ) : aiResult ? (
                <div className="whitespace-pre-wrap font-sans">{aiResult}</div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-center py-12 gap-2">
                  <Wand2 className="w-8 h-8 text-zinc-600 mb-1" />
                  <p className="text-xs font-mono uppercase">Izaberite akciju iznad da započnete obradu.</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="pt-4 border-t border-[#262626] flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => handleRunAi()}
            disabled={loading || !originalText}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#181818] text-white hover:text-[#CCFF00] border border-[#262626] text-xs font-black uppercase tracking-wider transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Regeneriši</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-black uppercase tracking-wider text-zinc-400 hover:text-white bg-[#181818]"
            >
              Zatvori
            </button>

            <button
              onClick={handleApply}
              disabled={!aiResult || loading}
              className={`flex items-center gap-2 px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-all ${
                aiResult && !loading
                  ? 'bg-[#CCFF00] text-black hover:bg-[#b8e600]'
                  : 'bg-[#181818] text-zinc-600 border border-[#262626] cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4 text-black stroke-[3]" />
              <span>Primeni i zameni tekst</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
