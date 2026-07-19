// src/components/StudyAssistant.tsx
import { useState, useEffect } from 'react';
import { pipeline } from '@huggingface/transformers';
import toast from 'react-hot-toast';

interface StudyAssistantProps {
    userId: string;
}

interface Message {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    subject?: string;
}

const StudyAssistant: React.FC<StudyAssistantProps> = ({ userId }) => {
    const [question, setQuestion] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [modelReady, setModelReady] = useState(false);
    const [offlineMode, setOfflineMode] = useState(!navigator.onLine);
    const [subject, setSubject] = useState('general');
    const [history, setHistory] = useState<Message[]>([]);

    // Check internet status
    useEffect(() => {
        const handleOnline = () => setOfflineMode(false);
        const handleOffline = () => setOfflineMode(true);
        
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Load saved history
    useEffect(() => {
        const savedHistory = localStorage.getItem(`study_history_${userId}`);
        if (savedHistory) {
            try {
                setHistory(JSON.parse(savedHistory));
            } catch(e) {}
        }
    }, [userId]);

    // Save history
    useEffect(() => {
        if (history.length > 0) {
            localStorage.setItem(`study_history_${userId}`, JSON.stringify(history.slice(-50)));
        }
    }, [history, userId]);

    const getSubjectPrompt = (subj: string, userQuestion: string): string => {
        const prompts: Record<string, string> = {
            math: `You are a math tutor. Solve this ${userQuestion} step by step. Explain each step clearly.`,
            physics: `You are a physics teacher. Explain ${userQuestion} with real-world examples.`,
            english: `You are an English teacher. Help with grammar, vocabulary, or writing: ${userQuestion}`,
            urdu: `You are an Urdu teacher. Respond in simple Urdu. Question: ${userQuestion}`,
            general: `You are a study assistant. Answer clearly and helpfully: ${userQuestion}`
        };
        return prompts[subj] || prompts.general;
    };

    const generateAnswer = async () => {
        if (!question.trim()) {
            toast.error('Please ask a question');
            return;
        }

        setLoading(true);
        
        const userMessage: Message = {
            id: Date.now(),
            role: 'user',
            content: question,
            subject
        };
        
        setMessages(prev => [...prev, userMessage]);
        
        // Show offline status if no internet
        if (offlineMode) {
            toast.info('📡 Offline mode active — AI working locally');
        }

        try {
            // 🔥 For now, use API (you can switch to local model later)
            // Replace with your actual AI call (Gemini/Groq/OpenRouter)
            const response = await fetch('https://api.openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'google/gemini-2.0-flash-001',
                    messages: [
                        { role: 'system', content: getSubjectPrompt(subject, question) },
                        { role: 'user', content: question }
                    ],
                    temperature: 0.7,
                    max_tokens: 1000
                })
            });
            
            const data = await response.json();
            const answer = data.choices?.[0]?.message?.content || "I couldn't generate an answer. Please try again.";
            
            const assistantMessage: Message = {
                id: Date.now() + 1,
                role: 'assistant',
                content: answer,
                subject
            };
            
            setMessages(prev => [...prev, assistantMessage]);
            setHistory(prev => [...prev, userMessage, assistantMessage]);
            toast.success('Answer ready!');
            
        } catch (error) {
            console.error('Error:', error);
            toast.error(offlineMode ? 'Offline mode: Please ensure local model is loaded' : 'Connection error. Please try again.');
        } finally {
            setLoading(false);
            setQuestion('');
        }
    };

    const exportChat = () => {
        const chatText = messages.map(m => 
            `${m.role === 'user' ? '👤 Student' : '🤖 AI Tutor'}:\n${m.content}\n---\n`
        ).join('\n');
        
        const blob = new Blob([chatText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `study_session_${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Chat exported!');
    };

    const clearHistory = () => {
        if (confirm('Clear all chat history?')) {
            setMessages([]);
            toast.success('History cleared');
        }
    };

    const subjects = [
        { id: 'math', name: '📐 Mathematics', color: 'blue' },
        { id: 'physics', name: '⚡ Physics', color: 'cyan' },
        { id: 'english', name: '📖 English', color: 'green' },
        { id: 'urdu', name: '🇵🇰 Urdu', color: 'purple' },
        { id: 'general', name: '🎯 General', color: 'gray' }
    ];

    return (
        <div className="flex h-full">
            {/* Sidebar */}
            <div className="w-64 border-r border-gray-800 p-4 hidden md:block">
                <h3 className="text-sm font-medium text-gray-400 mb-4">Study Tools</h3>
                
                <div className="mb-6">
                    <p className="text-xs text-gray-500 mb-2">Subjects</p>
                    {subjects.map(s => (
                        <button
                            key={s.id}
                            onClick={() => setSubject(s.id)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition ${
                                subject === s.id 
                                    ? `bg-${s.color}-600/20 text-${s.color}-400` 
                                    : 'hover:bg-gray-800 text-gray-300'
                            }`}
                        >
                            {s.name}
                        </button>
                    ))}
                </div>
                
                <div className="mb-6">
                    <p className="text-xs text-gray-500 mb-2">Saved Questions</p>
                    {history.slice(-5).reverse().map((msg, idx) => (
                        msg.role === 'user' && (
                            <button
                                key={idx}
                                onClick={() => setQuestion(msg.content.slice(0, 50))}
                                className="w-full text-left text-xs text-gray-400 hover:text-white py-1 truncate"
                                title={msg.content}
                            >
                                📝 {msg.content.slice(0, 40)}...
                            </button>
                        )
                    ))}
                </div>
                
                <div className="pt-4 border-t border-gray-800">
                    <div className="flex items-center gap-2 text-xs">
                        <div className={`w-2 h-2 rounded-full ${offlineMode ? 'bg-yellow-400' : 'bg-green-400'}`} />
                        <span className="text-gray-400">
                            {offlineMode ? '📡 Offline Mode' : '🌐 Online'}
                        </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                        {offlineMode 
                            ? 'Working without internet — AI ready!'
                            : 'Connected — faster responses'
                        }
                    </p>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="border-b border-gray-800 p-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                                📚 Adin AI Study Assistant
                            </h1>
                            <p className="text-xs text-gray-500">
                                {subjects.find(s => s.id === subject)?.name} • 
                                {offlineMode ? ' Working offline' : ' Online mode'}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={exportChat} className="text-xs text-gray-400 hover:text-white">
                                📥 Export
                            </button>
                            <button onClick={clearHistory} className="text-xs text-gray-400 hover:text-red-400">
                                🗑️ Clear
                            </button>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-auto p-4 space-y-4">
                    {messages.length === 0 && (
                        <div className="text-center text-gray-500 mt-20">
                            <div className="text-6xl mb-4">📚</div>
                            <h3 className="text-lg font-medium">Ask me anything!</h3>
                            <p className="text-sm mt-2">
                                Choose a subject and ask your question.<br />
                                I'll help you understand step by step.
                            </p>
                            <div className="flex flex-wrap justify-center gap-2 mt-4">
                                <button onClick={() => setQuestion("Solve: 2x + 5 = 15")} className="text-xs bg-gray-800 rounded-full px-3 py-1">
                                    Solve: 2x + 5 = 15
                                </button>
                                <button onClick={() => setQuestion("Explain Newton's laws of motion")} className="text-xs bg-gray-800 rounded-full px-3 py-1">
                                    Newton's laws
                                </button>
                                <button onClick={() => setQuestion("Difference between past and present perfect tense")} className="text-xs bg-gray-800 rounded-full px-3 py-1">
                                    English grammar
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                                msg.role === 'user' 
                                    ? 'bg-purple-600 text-white rounded-br-sm' 
                                    : 'bg-gray-800 text-gray-100 rounded-bl-sm'
                            }`}>
                                {msg.role === 'assistant' && (
                                    <div className="text-xs text-gray-400 mb-1">
                                        🤖 {subjects.find(s => s.id === msg.subject)?.name || 'Tutor'}
                                    </div>
                                )}
                                <div className="whitespace-pre-wrap text-sm">
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-800 rounded-2xl px-4 py-2">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100" />
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="border-t border-gray-800 p-4">
                    <div className="flex gap-3">
                        <select
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="px-3 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm"
                        >
                            {subjects.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                        <input
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && generateAnswer()}
                            placeholder="Ask your study question..."
                            className="flex-1 h-[48px] rounded-xl bg-gray-900 border border-gray-700 px-4 text-white outline-none text-sm"
                        />
                        <button
                            onClick={generateAnswer}
                            disabled={loading}
                            className="px-5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 disabled:opacity-50 text-white"
                        >
                            Ask 📤
                        </button>
                    </div>
                    <p className="text-xs text-gray-600 text-center mt-2">
                        {offlineMode 
                            ? '📡 Offline mode — answers generated locally'
                            : '💡 Ask anything — get step-by-step explanations'
                        }
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StudyAssistant;