// src/services/voiceService.ts
// ============================================
// VOICE SERVICE - All Languages Unlimited
// Urdu | Hindi | English | Arabic
// Speech-to-Text + Text-to-Speech both work
// ============================================

class VoiceService {
  private recognition: any = null;
  private isListening = false;
  private onResultCallback: ((text: string) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;

  // 🔥 All supported languages - will auto-cycle
  private readonly languages = [
    { code: 'ur-PK', name: 'Urdu', script: /[\u0600-\u06FF]/ },
    { code: 'ur-IN', name: 'Urdu', script: /[\u0600-\u06FF]/ },
    { code: 'hi-IN', name: 'Hindi', script: /[\u0900-\u097F]/ },
    { code: 'en-US', name: 'English', script: /[a-zA-Z]/ },
    { code: 'en-GB', name: 'English', script: /[a-zA-Z]/ },
    { code: 'ar-SA', name: 'Arabic', script: /[\u0621-\u064A]/ },
    { code: 'ar-EG', name: 'Arabic', script: /[\u0621-\u064A]/ }
  ];

  private currentLangIndex = 0;

  // 🔥 Detect language from text
  detectLanguageFromText(text: string): string {
    if (/[\u0600-\u06FF]/.test(text)) return 'ur-PK';
    if (/[\u0900-\u097F]/.test(text)) return 'hi-IN';
    if (/[\u0621-\u064A]/.test(text)) return 'ar-SA';
    return 'en-US';
  }

  startListening(onResult: (text: string) => void, onError?: (error: string) => void) {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      onError?.('Please use Chrome browser for voice input');
      return;
    }

    this.onResultCallback = onResult;
    this.onErrorCallback = onError;
    this.currentLangIndex = 0;
    this.startRecognition();
  }

  private startRecognition() {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 3;
    
    // Set current language
    this.recognition.lang = this.languages[this.currentLangIndex].code;
    console.log(`🎤 Listening in: ${this.languages[this.currentLangIndex].name}`);

    this.recognition.onstart = () => {
      this.isListening = true;
    };

    this.recognition.onresult = (event: any) => {
      let finalText = '';
      let interimText = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        
        if (result.isFinal) {
          finalText += text;
        } else {
          interimText += text;
        }
      }
      
      // Send partial results immediately
      if (interimText && this.onResultCallback) {
        this.onResultCallback(interimText);
      }
      
      // Send final result
      if (finalText && this.onResultCallback) {
        this.onResultCallback(finalText);
      }
    };

    this.recognition.onerror = (event: any) => {
      console.log(`Error with ${this.languages[this.currentLangIndex].name}:`, event.error);
      
      // Try next language
      if (this.currentLangIndex < this.languages.length - 1) {
        this.currentLangIndex++;
        this.recognition?.stop();
        this.startRecognition();
      } else {
        this.onErrorCallback?.('Could not recognize. Please speak clearly.');
        this.isListening = false;
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    this.recognition.start();
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  // 🔥 TEXT TO SPEECH - Works for ALL languages
  speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      const detectedLang = this.detectLanguageFromText(text);
      utterance.lang = detectedLang;
      
      // Get proper voice for the language
      const voices = window.speechSynthesis.getVoices();
      let selectedVoice = null;
      
      if (detectedLang === 'ur-PK') {
        selectedVoice = voices.find(v => v.lang === 'ur-PK' || v.name.includes('Urdu'));
      } else if (detectedLang === 'hi-IN') {
        selectedVoice = voices.find(v => v.lang === 'hi-IN' || v.name.includes('Hindi'));
      } else if (detectedLang === 'ar-SA') {
        selectedVoice = voices.find(v => v.lang === 'ar-SA' || v.lang.startsWith('ar-'));
      } else {
        selectedVoice = voices.find(v => v.lang === 'en-US');
      }
      
      if (selectedVoice) utterance.voice = selectedVoice;
      
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1;
      
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      
      window.speechSynthesis.speak(utterance);
    });
  }

  stopSpeaking() {
    window.speechSynthesis.cancel();
  }

  getIsListening() {
    return this.isListening;
  }
}

export const voiceService = new VoiceService();

// Load voices on page load
if (typeof window !== 'undefined') {
  window.speechSynthesis.getVoices();
}