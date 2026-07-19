import React, { useState } from 'react';
import { voiceService } from '../services/voiceService';

interface SpeakButtonProps {
  text: string;
}

const SpeakButton: React.FC<SpeakButtonProps> = ({ text }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = async () => {
    if (isSpeaking) {
      voiceService.stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      await voiceService.speak(text);
      setIsSpeaking(false);
    }
  };

  return (
    <button
      onClick={handleSpeak}
      className={`
        p-1.5 rounded-full transition-all duration-200
        ${isSpeaking 
          ? 'bg-blue-500 text-white animate-pulse' 
          : 'text-gray-400 hover:text-white hover:bg-gray-800'
        }
      `}
      title={isSpeaking ? 'Stop speaking' : 'Listen to response (Urdu/Hindi/English)'}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {isSpeaking ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" 
          />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 010-7.072m-2.828 9.9a9 9 0 010-12.728M12 15a3 3 0 110-6 3 3 0 010 6z" 
          />
        )}
      </svg>
    </button>
  );
};

export default SpeakButton;