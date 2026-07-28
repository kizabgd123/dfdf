import React, { useState, useEffect, useRef } from 'react';
import {
  Copy,
  Check,
  Download,
  Sparkles,
  Save,
  Volume2,
  VolumeX,
  Clock,
  FileText,
  Type,
  Edit3,
  CheckCircle2,
  Tag,
} from 'lucide-react';
import { countWordsAndChars, exportTextFile } from '../utils/storage';

interface TranscriptAreaProps {
  transcript: string;
  interimTranscript: string;
  isListening: boolean;
  onTranscriptChange: (text: string) => void;
  onOpenAiTools: () => void;
  onSaveNote: (title: string, category: 'Diktat' | 'Ideja' | 'Sastanak' | 'Podsetnik' | 'Lično', tags: string[]) => void;
}

export const TranscriptArea: React.FC<TranscriptAreaProps> = ({
  transcript,
  interimTranscript,
  isListening,
  onTranscriptChange,
  onOpenAiTools,
  onSaveNote,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteCategory, setNoteCategory] = useState<'Diktat' | 'Ideja' | 'Sastanak' | 'Podsetnik' | 'Lično'>('Diktat');
  const [noteTags, setNoteTags] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const combinedText = transcript + (interimTranscript ? (transcript ? ' ' : '') + interimTranscript : '');
  const { characterCount, wordCount, estimatedReadingMinutes } = countWordsAndChars(combinedText);

  // Initialize Speech Synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Auto scroll to bottom during active listening
  useEffect(() => {
    if (isListening && textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  }, [combinedText, isListening]);

  const handleCopy = () => {
    if (!combinedText) return;
    navigator.clipboard.writeText(combinedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleToggleSpeak = () => {
    if (!synthRef.current || !combinedText) return;

    if (isSpeaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    } else {
      synthRef.current.cancel(); // Stop ongoing
      const utterance = new SpeechSynthesisUtterance(combinedText);
      utterance.lang = 'sr-RS';
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      synthRef.current.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleDownload = (format: 'txt' | 'md') => {
    if (!combinedText) return;
    const defaultTitle = `Diktat_${new Date().toISOString().slice(0, 10)}`;
    exportTextFile(combinedText, defaultTitle, format);
  };

  const handleConfirmSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!combinedText) return;

    const titleToSave = noteTitle.trim() || `Diktat - ${new Date().toLocaleDateString('sr-RS')} ${new Date().toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })}`;
    const tagsArray = noteTags.split(',').map(t => t.trim()).filter(Boolean);

    onSaveNote(titleToSave, noteCategory, tagsArray);
    
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setShowSaveModal(false);
      setNoteTitle('');
      setNoteTags('');
    }, 1500);
  };

  return (
    <div className="w-full bg-black border-2 border-[#262626] rounded-none p-5 shadow-2xl flex flex-col gap-4">
      
      {/* Top Header & Metrics */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#262626]">
        
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#CCFF00]" />
          <h2 className="text-sm font-black uppercase tracking-widest text-white">Transkript / Diktirani Tekst</h2>
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1 bg-[#181818] border border-[#262626] px-2 py-0.5">
            <Edit3 className="w-3 h-3 text-[#CCFF00]" /> Ručni unos aktivan
          </span>
        </div>

        {/* Text Metrics */}
        <div className="flex items-center gap-4 text-xs font-mono text-zinc-400 bg-[#181818] px-3 py-1.5 border border-[#262626]">
          <div className="flex items-center gap-1">
            <Type className="w-3.5 h-3.5 text-[#CCFF00]" />
            <span>REČI: <strong className="text-white font-bold">{wordCount}</strong></span>
          </div>
          <div className="w-px h-3 bg-[#262626]" />
          <div className="flex items-center gap-1">
            <span>KARAKTERI: <strong className="text-white font-bold">{characterCount}</strong></span>
          </div>
          <div className="w-px h-3 bg-[#262626]" />
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#CCFF00]" />
            <span>VREME: <strong className="text-white font-bold">~{estimatedReadingMinutes} min</strong></span>
          </div>
        </div>

      </div>

      {/* Main Textarea Container */}
      <div className="relative min-h-[280px] flex flex-col">
        <textarea
          ref={textareaRef}
          value={transcript}
          onChange={(e) => onTranscriptChange(e.target.value)}
          placeholder={
            isListening
              ? "Slušam vaš govor u realnom vremenu... Reči će se pojavljivati ovde."
              : "Kliknite na dugme mikrofona iznad da započnete diktiranje, ili ukucajte tekst direktno ovde..."
          }
          className="w-full flex-grow min-h-[260px] p-4 bg-[#080808] border border-[#262626] focus:border-[#CCFF00] rounded-none text-white placeholder:text-zinc-600 text-lg md:text-xl font-bold leading-relaxed resize-y focus:outline-none transition-all font-sans"
        />

        {/* Live Interim Result Highlight Banner */}
        {interimTranscript && (
          <div className="mt-2 p-3 bg-[#181818] border border-[#CCFF00] text-[#CCFF00] text-sm font-black uppercase tracking-wider flex items-center gap-2 animate-pulse">
            <span className="w-2.5 h-2.5 bg-[#CCFF00] animate-ping flex-shrink-0" />
            <span>INPUT_STREAM: <strong>"{interimTranscript}"</strong></span>
          </div>
        )}
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#262626]">
        
        {/* Left Side: AI Tools */}
        <div className="flex items-center gap-2">
          <button
            id="open-ai-tools-btn"
            onClick={onOpenAiTools}
            disabled={!combinedText}
            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-all ${
              combinedText
                ? 'bg-[#CCFF00] text-black hover:bg-[#b8e600] shadow-[0_0_15px_rgba(204,255,0,0.3)] active:scale-95'
                : 'bg-[#181818] text-zinc-600 border border-[#262626] cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-4 h-4 text-black stroke-[2.5]" />
            <span>AI Obrada & Sređivanje</span>
          </button>
        </div>

        {/* Right Side: Copy, TTS, Save, Download */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Read Aloud (TTS) */}
          <button
            id="tts-speak-btn"
            onClick={handleToggleSpeak}
            disabled={!combinedText}
            title={isSpeaking ? "Zaustavi čitanje" : "Preslušaj tekst glasovno"}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-black uppercase tracking-wider border transition-all ${
              isSpeaking
                ? 'bg-red-500/20 text-red-400 border-red-500 animate-pulse'
                : 'bg-black hover:bg-[#181818] text-white border-[#262626] hover:border-[#CCFF00]'
            } ${!combinedText ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-[#CCFF00]" />}
            <span className="hidden sm:inline">{isSpeaking ? "Stop" : "Preslušaj"}</span>
          </button>

          {/* Copy Text */}
          <button
            id="copy-transcript-btn"
            onClick={handleCopy}
            disabled={!combinedText}
            title="Kopiraj tekst u međuspremnik"
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wider border transition-all ${
              copied
                ? 'bg-[#CCFF00] text-black border-[#CCFF00]'
                : 'bg-black hover:bg-[#181818] text-white border-[#262626] hover:border-[#CCFF00]'
            } ${!combinedText ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-black stroke-[3]" />
                <span>Kopirano!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[#CCFF00]" />
                <span>Kopiraj</span>
              </>
            )}
          </button>

          {/* Download Text */}
          <button
            id="download-transcript-btn"
            onClick={() => handleDownload('txt')}
            disabled={!combinedText}
            title="Preuzmi kao tekstualnu datoteku (.txt)"
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-black uppercase tracking-wider bg-black hover:bg-[#181818] text-white border border-[#262626] hover:border-[#CCFF00] transition-all ${
              !combinedText ? 'opacity-40 cursor-not-allowed' : ''
            }`}
          >
            <Download className="w-4 h-4 text-[#CCFF00]" />
            <span className="hidden sm:inline">Preuzmi .TXT</span>
          </button>

          {/* Save Note */}
          <button
            id="save-note-modal-btn"
            onClick={() => setShowSaveModal(true)}
            disabled={!combinedText}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wider bg-[#181818] text-[#CCFF00] border border-[#CCFF00] hover:bg-[#CCFF00] hover:text-black transition-all ${
              !combinedText ? 'opacity-40 cursor-not-allowed' : ''
            }`}
          >
            <Save className="w-4 h-4" />
            <span>Sačuvaj</span>
          </button>

        </div>

      </div>

      {/* Save Note Modal Dialog */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="bg-black border-2 border-[#CCFF00] max-w-md w-full p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-[#262626] pb-3">
              <h3 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                <Save className="w-5 h-5 text-[#CCFF00]" />
                Sačuvaj diktat u beleške
              </h3>
              <button
                onClick={() => setShowSaveModal(false)}
                className="text-zinc-400 hover:text-white text-base font-black px-2"
              >
                ✕
              </button>
            </div>

            {saveSuccess ? (
              <div className="p-4 bg-[#CCFF00] text-black font-black uppercase tracking-wider text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-black stroke-[3]" />
                <span>Beleška je uspešno sačuvana!</span>
              </div>
            ) : (
              <form onSubmit={handleConfirmSave} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[#CCFF00] mb-1">
                    Naziv beleške:
                  </label>
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder={`npr. Diktacija ${new Date().toLocaleDateString('sr-RS')}`}
                    className="w-full px-3 py-2 bg-[#181818] border border-[#262626] text-white text-sm font-bold focus:outline-none focus:border-[#CCFF00]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[#CCFF00] mb-1">
                    Kategorija:
                  </label>
                  <select
                    value={noteCategory}
                    onChange={(e) => setNoteCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#181818] border border-[#262626] text-white text-sm font-bold focus:outline-none focus:border-[#CCFF00]"
                  >
                    <option value="Diktat">Diktat</option>
                    <option value="Ideja">Ideja</option>
                    <option value="Sastanak">Sastanak</option>
                    <option value="Podsetnik">Podsetnik</option>
                    <option value="Lično">Lično</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[#CCFF00] mb-1 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-[#CCFF00]" />
                    Oznake / Tagovi (razdvojite zarezom):
                  </label>
                  <input
                    type="text"
                    value={noteTags}
                    onChange={(e) => setNoteTags(e.target.value)}
                    placeholder="npr. posao, nacrt, misli"
                    className="w-full px-3 py-2 bg-[#181818] border border-[#262626] text-white text-sm font-bold focus:outline-none focus:border-[#CCFF00]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#262626]">
                  <button
                    type="button"
                    onClick={() => setShowSaveModal(false)}
                    className="px-4 py-2 text-xs font-black uppercase tracking-wider text-zinc-400 hover:text-white bg-[#181818]"
                  >
                    Otkaži
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-black uppercase tracking-wider text-black bg-[#CCFF00] hover:bg-[#b8e600]"
                  >
                    Potvrdi i sačuvaj
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
