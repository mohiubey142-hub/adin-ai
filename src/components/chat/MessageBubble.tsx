import React from 'react';
import SpeakButton from '../SpeakButton';

interface Message {
  id: string | number;
  role: 'user' | 'assistant' | 'ai';
  text: string;
}

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-end gap-2 max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`
          w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
          ${isUser ? 'bg-purple-600' : 'bg-gray-700'}
        `}>
          {isUser ? 'U' : 'AI'}
        </div>
        
        {/* Message Content */}
        <div className={`
          rounded-2xl px-4 py-2.5
          ${isUser 
            ? 'bg-purple-600 text-white rounded-br-sm' 
            : 'bg-gray-800 text-gray-100 rounded-bl-sm'
          }
        `}>
          <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
        </div>
        
        {/* Speaker Button (only for AI messages) */}
        {!isUser && (
          <div className="flex-shrink-0">
            <SpeakButton text={message.text} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;