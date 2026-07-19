import React, { useState, useRef, useEffect } from 'react';
import ChatInput from '../components/chat/ChatInput';
import MessageBubble from '../components/chat/MessageBubble';
import { sendToAI } from '../services/ai';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  text: string;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [webEnabled, setWebEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get userId (for memory)
  const userId = localStorage.getItem('adin_user_id') || 'anonymous';

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      text: text,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Prepare messages for AI
      const aiMessages = messages.concat(userMessage).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'ai',
        text: msg.text
      }));

      // Call AI
      const response = await sendToAI(
        aiMessages,
        [], // aiMemory - not using yet
        webEnabled,
        userId
      );
      
      const data = await response.json();
      const aiText = data.choices?.[0]?.message?.content || "Sorry, I couldn't process that.";
      
      // Add AI response
      const aiMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        text: aiText,
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        text: 'Sorry, something went wrong. Please try again.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/50">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Adin AI
          </h1>
          <p className="text-xs text-gray-500">Next Generation Intelligence</p>
        </div>
        
        {/* Web Search Toggle */}
        <button
          onClick={() => setWebEnabled(!webEnabled)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all
            ${webEnabled 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-700 text-gray-400'
            }`}
        >
          🌐 Web {webEnabled ? 'ON' : 'OFF'}
        </button>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-purple-600/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Welcome to Adin AI</h2>
            <p className="text-gray-400 max-w-md">
              Speak in English, Urdu, or Hindi — I understand all three! 
              Click the microphone button to start talking 🎤
            </p>
            <div className="flex gap-2 mt-4">
              <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400">🎤 Voice Input</span>
              <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400">🔊 Listen to responses</span>
              <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400">🌐 Web Search</span>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 rounded-2xl px-4 py-2.5">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="p-4 border-t border-gray-800 bg-gray-900/50">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        <p className="text-xs text-gray-600 text-center mt-2">
          🎤 Click mic and speak naturally — works with English, Urdu, and Hindi
        </p>
      </div>
    </div>
  );
};

export default Chat;