import { TranscriptionNote } from '../types';

const STORAGE_KEY = 'speech_notes_v1';

export function loadNotes(): TranscriptionNote[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load notes from localStorage:', error);
    return [];
  }
}

export function saveNote(note: Omit<TranscriptionNote, 'id' | 'createdAt'>): TranscriptionNote {
  const notes = loadNotes();
  const newNote: TranscriptionNote = {
    ...note,
    id: 'note_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    createdAt: Date.now(),
  };

  const updatedNotes = [newNote, ...notes];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes));
  } catch (error) {
    console.error('Failed to save note to localStorage:', error);
  }
  return newNote;
}

export function updateNote(updatedNote: TranscriptionNote): void {
  const notes = loadNotes();
  const index = notes.findIndex((n) => n.id === updatedNote.id);
  if (index !== -1) {
    notes[index] = updatedNote;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (error) {
      console.error('Failed to update note in localStorage:', error);
    }
  }
}

export function deleteNote(id: string): void {
  const notes = loadNotes();
  const filtered = notes.filter((n) => n.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete note from localStorage:', error);
  }
}

export function exportTextFile(content: string, filename: string, extension: 'txt' | 'md' | 'doc' = 'txt') {
  const mimeTypes = {
    txt: 'text/plain;charset=utf-8',
    md: 'text/markdown;charset=utf-8',
    doc: 'application/msword;charset=utf-8',
  };

  const blob = new Blob([content], { type: mimeTypes[extension] });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.${extension}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function countWordsAndChars(text: string) {
  const cleanText = text.trim();
  const characterCount = text.length;
  const wordCount = cleanText ? cleanText.split(/\s+/).length : 0;
  const estimatedReadingMinutes = Math.ceil(wordCount / 180); // ~180 words per min
  return { characterCount, wordCount, estimatedReadingMinutes };
}
