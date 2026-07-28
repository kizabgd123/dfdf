import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { DictationControl } from './components/DictationControl';
import { TranscriptArea } from './components/TranscriptArea';
import { NotesHistory } from './components/NotesHistory';
import { AiToolsModal } from './components/AiToolsModal';
import { AudioUploadModal } from './components/AudioUploadModal';
import {
  SpeechRecognitionService,
  isSpeechRecognitionSupported,
} from './utils/speechRecognition';
import {
  loadNotes,
  saveNote,
  deleteNote,
} from './utils/storage';
import { TranscriptionNote } from './types';
import { Sparkles, Mic, FileText, CheckCircle2, MessageSquareText, ShieldAlert } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dictate' | 'history'>('dictate');
  const [isListening, setIsListening] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('sr-RS');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Saved Notes state
  const [notes, setNotes] = useState<TranscriptionNote[]>([]);

  // Modals state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isAudioUploadOpen, setIsAudioUploadOpen] = useState(false);

  const speechServiceRef = useRef<SpeechRecognitionService | null>(null);
  const isSupported = isSpeechRecognitionSupported();

  // Load saved notes on mount
  useEffect(() => {
    setNotes(loadNotes());
  }, []);

  // Initialize Speech Recognition service
  useEffect(() => {
    speechServiceRef.current = new SpeechRecognitionService({
      onResult: (finalText, interimText) => {
        setTranscript(finalText);
        setInterimTranscript(interimText);
      },
      onError: (err) => {
        setErrorMessage(err);
        setIsListening(false);
        setIsPaused(false);
      },
      onStatusChange: (listening) => {
        setIsListening(listening);
        if (!listening) {
          setIsPaused(false);
        }
      },
    });

    return () => {
      if (speechServiceRef.current) {
        speechServiceRef.current.stop();
      }
    };
  }, []);

  // Handle language change
  const handleLanguageChange = (newLangCode: string) => {
    setSelectedLanguage(newLangCode);
    if (speechServiceRef.current) {
      speechServiceRef.current.setLanguage(newLangCode);
    }
  };

  // Toggle Dictation Start / Stop
  const handleToggleListen = () => {
    setErrorMessage(null);
    if (!speechServiceRef.current) return;

    if (isListening) {
      speechServiceRef.current.stop();
      setIsListening(false);
      setIsPaused(false);
    } else {
      speechServiceRef.current.start(transcript);
      setIsListening(true);
      setIsPaused(false);
    }
  };

  // Toggle Pause / Resume
  const handlePauseResume = () => {
    if (!speechServiceRef.current || !isListening) return;

    if (isPaused) {
      speechServiceRef.current.start(transcript);
      setIsPaused(false);
    } else {
      speechServiceRef.current.stop();
      setIsPaused(true);
    }
  };

  // Clear current transcript text
  const handleClearText = () => {
    if (speechServiceRef.current) {
      speechServiceRef.current.clearText();
    }
    setTranscript('');
    setInterimTranscript('');
  };

  // Save Note callback
  const handleSaveNote = (
    title: string,
    category: 'Diktat' | 'Ideja' | 'Sastanak' | 'Podsetnik' | 'Lično',
    tags: string[]
  ) => {
    const fullText = transcript + (interimTranscript ? ' ' + interimTranscript : '');
    if (!fullText.trim()) return;

    const saved = saveNote({
      title,
      rawText: fullText,
      wordCount: fullText.trim().split(/\s+/).length,
      characterCount: fullText.length,
      category,
      tags,
      language: selectedLanguage,
    });

    setNotes(loadNotes());
  };

  // Delete note from history
  const handleDeleteNote = (id: string) => {
    deleteNote(id);
    setNotes(loadNotes());
  };

  // Load a note into main editor
  const handleLoadNoteToEditor = (text: string) => {
    setTranscript(text);
    setInterimTranscript('');
    setActiveTab('dictate');
  };

  // Apply AI Enhanced text
  const handleApplyEnhancedText = (newText: string) => {
    setTranscript(newText);
    setInterimTranscript('');
    if (speechServiceRef.current) {
      speechServiceRef.current.clearText();
      // Set accumulated text
      speechServiceRef.current.start(newText);
      speechServiceRef.current.stop();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-[#CCFF00] selection:text-black bg-grid-pattern">
      
      {/* Top Header */}
      <Header
        isListening={isListening && !isPaused}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAudioUpload={() => setIsAudioUploadOpen(true)}
        savedNotesCount={notes.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
        
        {/* Tab 1: Live Dictation Mode */}
        {activeTab === 'dictate' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Direct Quick Hint Card */}
            <div className="bg-[#181818] border border-[#262626] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#CCFF00] text-black font-black">
                  <MessageSquareText className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-white">Pretvaranje misli i govora u tekst</h3>
                  <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                    Samo govorite prirodno — diktat se u realnom vremenu pretvara u reči na ekranu.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => setIsAudioUploadOpen(true)}
                  className="text-xs text-[#CCFF00] font-black uppercase tracking-wider bg-black hover:bg-[#CCFF00] hover:text-black px-3.5 py-2 border border-[#262626] hover:border-[#CCFF00] transition-colors"
                >
                  Učitaj zvučni snimak
                </button>
              </div>
            </div>

            {/* Dictation Control & Big Mic */}
            <DictationControl
              isListening={isListening}
              isPaused={isPaused}
              selectedLanguage={selectedLanguage}
              onToggleListen={handleToggleListen}
              onPauseResume={handlePauseResume}
              onLanguageChange={handleLanguageChange}
              onClearText={handleClearText}
              hasText={!!transcript || !!interimTranscript}
              errorMessage={errorMessage}
              isSupported={isSupported}
            />

            {/* Transcript & Editor Area */}
            <TranscriptArea
              transcript={transcript}
              interimTranscript={interimTranscript}
              isListening={isListening}
              onTranscriptChange={setTranscript}
              onOpenAiTools={() => setIsAiModalOpen(true)}
              onSaveNote={handleSaveNote}
            />

          </div>
        )}

        {/* Tab 2: Saved Notes / History */}
        {activeTab === 'history' && (
          <div className="animate-fadeIn">
            <NotesHistory
              notes={notes}
              onDeleteNote={handleDeleteNote}
              onLoadNoteToEditor={handleLoadNoteToEditor}
            />
          </div>
        )}

      </main>

      {/* AI Enhancement Modal */}
      <AiToolsModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        originalText={transcript + (interimTranscript ? ' ' + interimTranscript : '')}
        onApplyEnhancedText={handleApplyEnhancedText}
      />

      {/* Audio Upload Modal */}
      <AudioUploadModal
        isOpen={isAudioUploadOpen}
        onClose={() => setIsAudioUploadOpen(false)}
        onApplyTranscript={(text) => {
          setTranscript(text);
          setActiveTab('dictate');
        }}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-[#262626] bg-[#181818] py-4 text-center text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
        <p>Govor u Tekst • Aplikacija za trenutno diktiranje i obradu govora u tekst</p>
      </footer>

    </div>
  );
}
