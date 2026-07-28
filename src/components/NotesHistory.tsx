import React, { useState } from 'react';
import {
  FileText,
  Search,
  Trash2,
  Copy,
  Download,
  Calendar,
  Tag,
  ArrowUpRight,
  Sparkles,
  Check,
} from 'lucide-react';
import { TranscriptionNote } from '../types';
import { exportTextFile } from '../utils/storage';

interface NotesHistoryProps {
  notes: TranscriptionNote[];
  onDeleteNote: (id: string) => void;
  onLoadNoteToEditor: (text: string) => void;
}

export const NotesHistory: React.FC<NotesHistoryProps> = ({
  notes,
  onDeleteNote,
  onLoadNoteToEditor,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Sve');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ['Sve', 'Diktat', 'Ideja', 'Sastanak', 'Podsetnik', 'Lično'];

  const filteredNotes = notes.filter((note) => {
    const matchesCategory = selectedCategory === 'Sve' || note.category === selectedCategory;
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.rawText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.enhancedText && note.enhancedText.toLowerCase().includes(searchQuery.toLowerCase())) ||
      note.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const handleCopyNote = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadNote = (note: TranscriptionNote) => {
    const textToExport = note.enhancedText || note.rawText;
    const cleanTitle = note.title.replace(/[^a-zA-Z0-9_ -]/g, '');
    exportTextFile(textToExport, cleanTitle || 'Beleška', 'txt');
  };

  return (
    <div className="w-full bg-black border-2 border-[#262626] rounded-none p-6 shadow-2xl space-y-6">
      
      {/* Top Bar: Title & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#262626]">
        <div>
          <h2 className="text-lg font-black uppercase tracking-widest text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#CCFF00]" />
            Sačuvane Glasovne Beleške ({notes.length})
          </h2>
          <p className="text-[11px] font-mono text-zinc-400 mt-1 uppercase tracking-wider">
            Arhiva vaših misli i transkripcija
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pretraži beleške ili tagove..."
            className="w-full pl-10 pr-4 py-2 bg-[#181818] border border-[#262626] focus:border-[#CCFF00] text-white text-xs font-bold focus:outline-none transition-all placeholder:text-zinc-600"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 text-xs font-black uppercase tracking-wider transition-all border ${
              selectedCategory === cat
                ? 'bg-[#CCFF00] text-black border-[#CCFF00]'
                : 'bg-black text-zinc-400 hover:text-white border-[#262626] hover:border-[#CCFF00]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="py-16 text-center text-zinc-500 flex flex-col items-center justify-center gap-3 border border-dashed border-[#262626]">
          <FileText className="w-12 h-12 text-zinc-700 stroke-[1.5]" />
          <p className="text-sm font-black uppercase tracking-widest text-zinc-400">
            {notes.length === 0
              ? 'Nema sačuvanih beležaka'
              : 'Nijedna beleška ne odgovara pretrazi'}
          </p>
          <p className="text-xs font-mono text-zinc-600 max-w-sm uppercase">
            Izdiktirajte tekst u tabu "Diktiranje" i kliknite na "Sačuvaj belešku".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotes.map((note) => {
            const dateStr = new Date(note.createdAt).toLocaleDateString('sr-RS', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={note.id}
                className="bg-[#080808] border border-[#262626] hover:border-[#CCFF00] p-5 flex flex-col justify-between gap-4 transition-all group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest bg-[#181818] text-[#CCFF00] border border-[#262626] mb-1.5">
                        {note.category}
                      </span>
                      <h3 className="font-black text-white text-base leading-snug group-hover:text-[#CCFF00] transition-colors uppercase tracking-tight">
                        {note.title}
                      </h3>
                    </div>

                    <button
                      onClick={() => onDeleteNote(note.id)}
                      title="Obriši belešku"
                      className="p-1.5 text-zinc-500 hover:text-red-400 bg-black border border-[#262626] hover:border-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Meta info */}
                  <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-500 mb-3 uppercase">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#CCFF00]" />
                      {dateStr}
                    </span>
                    <span>•</span>
                    <span>{note.wordCount} REČI</span>
                  </div>

                  {/* Text Preview */}
                  <div className="p-3 bg-black border border-[#262626] text-zinc-200 text-xs font-bold leading-relaxed line-clamp-4 font-sans">
                    {note.enhancedText || note.rawText}
                  </div>

                  {/* Tags */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-3">
                      {note.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-[#181818] text-zinc-300 border border-[#262626] text-[10px] font-black uppercase tracking-wider flex items-center gap-1"
                        >
                          <Tag className="w-2.5 h-2.5 text-[#CCFF00]" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-[#262626] text-xs">
                  
                  <button
                    onClick={() => onLoadNoteToEditor(note.enhancedText || note.rawText)}
                    className="flex items-center gap-1 text-[#CCFF00] hover:underline text-xs font-black uppercase tracking-wider transition-colors"
                  >
                    <span>Učitaj u diktat</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#CCFF00]" />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyNote(note.id, note.enhancedText || note.rawText)}
                      title="Kopiraj tekst"
                      className="p-1.5 text-zinc-300 bg-black border border-[#262626] hover:border-[#CCFF00] transition-colors"
                    >
                      {copiedId === note.id ? (
                        <Check className="w-3.5 h-3.5 text-[#CCFF00] stroke-[3]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => handleDownloadNote(note)}
                      title="Preuzmi .txt"
                      className="p-1.5 text-zinc-300 bg-black border border-[#262626] hover:border-[#CCFF00] transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
