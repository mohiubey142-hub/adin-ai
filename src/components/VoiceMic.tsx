// src/components/VoiceMic.tsx
import React, { useState, useEffect, useRef } from 'react';
import { voiceService } from '../services/voiceService';

interface VoiceMicProps {
  onTranscript: (text: string, language: string) => void;
  isDisabled?: boolean;
}

const VoiceMic: React.FC<VoiceMicProps> = ({ onTranscript, isDisabled = false }) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        // Use existing voice service for transcription
        voiceService.startListening(
          (text, language) => {
            onTranscript(text, language);
          },
          (err) => {
            setError(err);
          }
        );
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsListening(true);
      
      // Auto stop after 5 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current && isListening) {
          mediaRecorderRef.current.stop();
          setIsListening(false);
        }
      }, 5000);
      
    } catch (err) {
      console.error("Microphone error:", err);
      setError("Please allow microphone access.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  const handleClick = () => {
    if (isDisabled) return;
    
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="relative">
      {/* WhatsApp Style Voice Bar */}
      {isListening && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 animate-slide-up">
          <div className="bg-gray-900 rounded-2xl px-6 py-4 shadow-2xl border border-gray-700 min-w-[280px]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="voice-wave-bar"></div>
                <div className="voice-wave-bar"></div>
                <div className="voice-wave-bar"></div>
                <div className="voice-wave-bar"></div>
                <div className="voice-wave-bar"></div>
              </div>
              <div className="text-white text-sm recording-text">
                Listening... Speak now
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-2 text-center">
              🎤 English • اردو • Click to stop
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleClick}
        disabled={isDisabled}
        className={`
          p-3 rounded-full transition-all duration-200 transform hover:scale-105
          ${isListening 
            ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50' 
            : 'bg-purple-600 hover:bg-purple-700'
          }
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        title={isListening ? "Stop listening" : "Click to speak"}
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isListening ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" 
            />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m-4 0h8M12 4a3 3 0 00-3 3v4a3 3 0 006 0V7a3 3 0 00-3-3z" 
            />
          )}
        </svg>
      </button>
      
      {error && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 
                      bg-red-500 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap z-50">
          {error}
        </div>
      )}
    </div>
  );
};

export default VoiceMic;