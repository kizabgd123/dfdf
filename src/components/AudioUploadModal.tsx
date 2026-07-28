import React, { useState, useRef } from 'react';
import { Upload, Mic, Square, RefreshCw, CheckCircle2, FileAudio, X, AlertCircle } from 'lucide-react';

interface AudioUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTranscript: (text: string) => void;
}

export const AudioUploadModal: React.FC<AudioUploadModalProps> = ({
  isOpen,
  onClose,
  onApplyTranscript,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [transcriptResult, setTranscriptResult] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  if (!isOpen) return null;

  // File selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setAudioBlob(null);
      setErrorMsg(null);
    }
  };

  // Recording controls
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        setSelectedFile(null);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Mic access error:', err);
      setErrorMsg('Nije moguće pristupiti mikrofonu za snimanje zvuka.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  // Convert blob/file to base64 and send to Gemini Transcribe API
  const handleTranscribe = async () => {
    const audioSource = selectedFile || audioBlob;
    if (!audioSource) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioSource);

      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const mimeType = audioSource.type || 'audio/webm';

        const response = await fetch('/api/transcribe-audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioBase64: base64Data,
            mimeType,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Greška pri transkripciji zvučne datoteke.');
        }

        setTranscriptResult(data.transcript);
        setLoading(false);
      };
    } catch (err: any) {
      console.error('Transcribe error:', err);
      setErrorMsg(err.message || 'Greška pri obradi zvučnog snimka.');
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (transcriptResult) {
      onApplyTranscript(transcriptResult);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="bg-black border-2 border-[#CCFF00] max-w-xl w-full p-6 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#262626]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#CCFF00] text-black">
              <FileAudio className="w-6 h-6 text-black stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-widest text-white">Transkripcija Zvučnog Snimka</h3>
              <p className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Učitajte audio ili snimite poruku</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white bg-[#181818] border border-[#262626] hover:border-[#CCFF00] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Methods */}
        <div className="space-y-4">
          
          {/* File Drag & Drop Upload */}
          <div className="p-6 border-2 border-dashed border-[#262626] hover:border-[#CCFF00] bg-[#080808] text-center transition-all relative">
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <Upload className="w-8 h-8 text-[#CCFF00] mx-auto mb-2" />
            <p className="text-xs font-black uppercase tracking-wider text-white">
              {selectedFile ? selectedFile.name : 'Prevucite ili izaberite audio fajl (.mp3, .wav, .m4a, .webm)'}
            </p>
            <p className="text-[10px] font-mono text-zinc-500 mt-1 uppercase">Maksimalna veličina: do 50 MB</p>
          </div>

          <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-500 justify-center uppercase tracking-widest">
            <div className="h-px bg-[#262626] flex-1" />
            <span>ILI SNIMITE ZVUK DIREKTNO</span>
            <div className="h-px bg-[#262626] flex-1" />
          </div>

          {/* Record Audio Button */}
          <div className="flex items-center justify-center p-4 bg-[#181818] border border-[#262626] gap-4">
            {isRecording ? (
              <div className="flex items-center gap-4">
                <span className="w-3 h-3 bg-red-500 animate-ping" />
                <span className="text-xs font-black text-red-400 font-mono uppercase">
                  Snimanje: {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                </span>
                <button
                  onClick={stopRecording}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>Zaustavi</span>
                </button>
              </div>
            ) : (
              <button
                onClick={startRecording}
                className="px-4 py-2.5 bg-black hover:bg-[#181818] text-white border border-[#262626] hover:border-[#CCFF00] text-xs font-black uppercase tracking-wider flex items-center gap-2"
              >
                <Mic className="w-4 h-4 text-[#CCFF00]" />
                <span>Započni zvučno snimanje</span>
              </button>
            )}

            {audioBlob && !isRecording && (
              <span className="text-xs text-[#CCFF00] font-black uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-[#CCFF00] stroke-[2.5]" /> Snimak spreman
              </span>
            )}
          </div>

        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 bg-red-950/40 border border-red-500 text-red-400 text-xs font-bold uppercase tracking-wide flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Result Area */}
        {transcriptResult && (
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#CCFF00]">
              Rezultat Transkripcije:
            </label>
            <div className="p-4 bg-[#080808] border border-[#262626] text-white text-sm font-bold leading-relaxed max-h-40 overflow-y-auto font-sans">
              {transcriptResult}
            </div>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="pt-3 border-t border-[#262626] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-black uppercase tracking-wider text-zinc-400 hover:text-white bg-[#181818]"
          >
            Otkaži
          </button>

          {!transcriptResult ? (
            <button
              onClick={handleTranscribe}
              disabled={(!selectedFile && !audioBlob) || loading || isRecording}
              className={`px-5 py-2.5 text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
                (selectedFile || audioBlob) && !loading && !isRecording
                  ? 'bg-[#CCFF00] hover:bg-[#b8e600] text-black'
                  : 'bg-[#181818] text-zinc-600 border border-[#262626] cursor-not-allowed'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-black' : ''}`} />
              <span>{loading ? 'Transkribujem...' : 'Transkribuj sa Gemini'}</span>
            </button>
          ) : (
            <button
              onClick={handleApply}
              className="px-5 py-2.5 bg-[#CCFF00] hover:bg-[#b8e600] text-black text-xs font-black uppercase tracking-widest"
            >
              Umetni u diktat
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
