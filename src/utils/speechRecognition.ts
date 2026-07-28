import { LanguageOption } from '../types';

// Supported languages list
export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'sr-RS', name: 'Srpski (Ćirilica/Latinica)', nativeName: 'Srpski', flag: '🇷🇸' },
  { code: 'hr-HR', name: 'Hrvatski', nativeName: 'Hrvatski', flag: '🇭🇷' },
  { code: 'bs-BA', name: 'Bosanski', nativeName: 'Bosanski', flag: '🇧🇦' },
  { code: 'en-US', name: 'Engleski (SAD)', nativeName: 'English (US)', flag: '🇺🇸' },
  { code: 'en-GB', name: 'Engleski (UK)', nativeName: 'English (UK)', flag: '🇬🇧' },
  { code: 'de-DE', name: 'Nemački', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr-FR', name: 'Francuski', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es-ES', name: 'Španski', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'it-IT', name: 'Italijanski', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'ru-RU', name: 'Ruski', nativeName: 'Русский', flag: '🇷🇺' },
];

export interface SpeechRecognitionCallbacks {
  onResult: (finalTranscript: string, interimTranscript: string) => void;
  onError: (error: string) => void;
  onStatusChange: (isListening: boolean) => void;
  onAudioLevel?: (level: number) => void;
}

// Window interface extension for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export class SpeechRecognitionService {
  private recognition: any = null;
  private isListeningInternal = false;
  private shouldKeepListening = false;
  private language = 'sr-RS';
  private callbacks: SpeechRecognitionCallbacks;
  private accumulatedText = '';
  private currentInterim = '';

  constructor(callbacks: SpeechRecognitionCallbacks) {
    this.callbacks = callbacks;
    this.initRecognition();
  }

  private initRecognition() {
    if (!isSpeechRecognitionSupported()) {
      return;
    }

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognitionClass();
    
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = this.language;
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => {
      this.isListeningInternal = true;
      this.callbacks.onStatusChange(true);
    };

    this.recognition.onresult = (event: any) => {
      let newFinal = '';
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          newFinal += transcriptPart + ' ';
        } else {
          interim += transcriptPart;
        }
      }

      if (newFinal) {
        this.accumulatedText += newFinal;
      }
      this.currentInterim = interim;

      this.callbacks.onResult(this.accumulatedText, this.currentInterim);
    };

    this.recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      
      if (event.error === 'no-speech') {
        // Ignore silent intervals, continuous mode will handle or restart
        return;
      }

      let errorMsg = 'Greška pri prepoznavanju govora.';
      if (event.error === 'not-allowed' || event.error === 'permission-denied') {
        errorMsg = 'Pristup mikrofonu je odbijen. Molimo vas da omogućite mikrofon u podešavanjima pregledača.';
        this.shouldKeepListening = false;
      } else if (event.error === 'network') {
        errorMsg = 'Mrežna greška pri povezivanju na servis za prepoznavanje govora.';
      } else if (event.error === 'aborted') {
        // User stopped or aborted
        return;
      }

      this.callbacks.onError(errorMsg);
    };

    this.recognition.onend = () => {
      this.isListeningInternal = false;

      // Auto-restart if user intends to keep dictating (continuous stream robustness)
      if (this.shouldKeepListening) {
        try {
          setTimeout(() => {
            if (this.shouldKeepListening && !this.isListeningInternal && this.recognition) {
              this.recognition.start();
            }
          }, 200);
        } catch (e) {
          console.error('Failed to restart speech recognition', e);
          this.callbacks.onStatusChange(false);
        }
      } else {
        this.callbacks.onStatusChange(false);
      }
    };
  }

  public setLanguage(langCode: string) {
    this.language = langCode;
    if (this.recognition) {
      const wasListening = this.isListeningInternal;
      if (wasListening) {
        this.stop();
      }
      this.recognition.lang = langCode;
      if (wasListening) {
        this.start(this.accumulatedText);
      }
    }
  }

  public start(existingText = '') {
    if (!this.recognition) {
      this.initRecognition();
      if (!this.recognition) {
        this.callbacks.onError('Vaš veb pregledač ne podržava ugrađeno prepoznavanje govora. Možete koristiti opciju za snimanje zvuka.');
        return;
      }
    }

    this.accumulatedText = existingText;
    this.currentInterim = '';
    this.shouldKeepListening = true;

    try {
      this.recognition.start();
    } catch (e) {
      // Already running or starting
      console.log('Recognition already active or starting', e);
    }
  }

  public stop() {
    this.shouldKeepListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn('Error stopping recognition:', e);
      }
    }
    this.isListeningInternal = false;
    this.callbacks.onStatusChange(false);
  }

  public clearText() {
    this.accumulatedText = '';
    this.currentInterim = '';
    this.callbacks.onResult('', '');
  }

  public getAccumulatedText() {
    return this.accumulatedText;
  }
}
