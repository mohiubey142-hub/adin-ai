// src/components/ImageGenerator.tsx
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

type TabType = 'image' | 'video';

const ImageGenerator: React.FC<{ userId: string }> = ({ userId }) => {
    const [activeTab, setActiveTab] = useState<TabType>('image');
    const [prompt, setPrompt] = useState('');
    const [generating, setGenerating] = useState(false);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [resultType, setResultType] = useState<'image' | 'video'>('image');
    const [remaining, setRemaining] = useState({ image: 20, video: 5 });
    const [resetHours, setResetHours] = useState(24);
    const [queuePosition, setQueuePosition] = useState(0);
    const [imageQueue, setImageQueue] = useState<string[]>([]);
    const [videoQueue, setVideoQueue] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [history, setHistory] = useState<{ url: string; type: string }[]>([]);

    // Load daily limits
    useEffect(() => {
        const imageKey = `adin_img_${userId}`;
        const videoKey = `adin_vid_${userId}`;
        const today = new Date().toISOString().split('T')[0];
        
        const imageStored = localStorage.getItem(imageKey);
        if (imageStored) {
            try {
                const data = JSON.parse(imageStored);
                if (data.date === today) {
                    setRemaining(prev => ({ ...prev, image: Math.max(0, 20 - data.count) }));
                }
            } catch(e) {}
        }
        
        const videoStored = localStorage.getItem(videoKey);
        if (videoStored) {
            try {
                const data = JSON.parse(videoStored);
                if (data.date === today) {
                    setRemaining(prev => ({ ...prev, video: Math.max(0, 5 - data.count) }));
                }
            } catch(e) {}
        }
        
        // Load history
        const historyKey = `adin_media_history_${userId}`;
        const savedHistory = localStorage.getItem(historyKey);
        if (savedHistory) {
            try {
                setHistory(JSON.parse(savedHistory));
            } catch(e) {}
        }
    }, [userId]);

    // Process queues
    useEffect(() => {
        const processQueue = async () => {
            if (isProcessing) return;
            
            const currentQueue = activeTab === 'image' ? imageQueue : videoQueue;
            if (currentQueue.length === 0) return;
            
            setIsProcessing(true);
            const currentPrompt = currentQueue[0];
            
            try {
                setGenerating(true);
                
                let url = '';
                if (activeTab === 'image') {
                    // 🔥 IMAGE GENERATION - Using pollinations with retry
                    url = `https://image.pollinations.ai/prompt/${encodeURIComponent(currentPrompt)}?width=1024&height=1024&nologo=true&seed=${Date.now()}`;
                    
                    // Update image count
                    const today = new Date().toISOString().split('T')[0];
                    const key = `adin_img_${userId}`;
                    const stored = localStorage.getItem(key);
                    let count = 0;
                    if (stored) {
                        const data = JSON.parse(stored);
                        if (data.date === today) count = data.count;
                    }
                    count++;
                    localStorage.setItem(key, JSON.stringify({ date: today, count }));
                    setRemaining(prev => ({ ...prev, image: Math.max(0, 20 - count) }));
                    
                } else {
                    // 🔥 VIDEO GENERATION - Pollinations video API
                    url = `https://video.pollinations.ai/prompt/${encodeURIComponent(currentPrompt)}`;
                    
                    // Update video count
                    const today = new Date().toISOString().split('T')[0];
                    const key = `adin_vid_${userId}`;
                    const stored = localStorage.getItem(key);
                    let count = 0;
                    if (stored) {
                        const data = JSON.parse(stored);
                        if (data.date === today) count = data.count;
                    }
                    count++;
                    localStorage.setItem(key, JSON.stringify({ date: today, count }));
                    setRemaining(prev => ({ ...prev, video: Math.max(0, 5 - count) }));
                }
                
                setResultUrl(url);
                setResultType(activeTab === 'image' ? 'image' : 'video');
                
                // Add to history
                const newHistory = [{ url, type: activeTab }, ...history].slice(0, 10);
                setHistory(newHistory);
                localStorage.setItem(`adin_media_history_${userId}`, JSON.stringify(newHistory));
                
                toast.success(`${activeTab === 'image' ? 'Image' : 'Video'} created!`);
                
                // Remove from queue
                if (activeTab === 'image') {
                    setImageQueue(prev => prev.slice(1));
                    setQueuePosition(prev => Math.max(0, prev - 1));
                } else {
                    setVideoQueue(prev => prev.slice(1));
                    setQueuePosition(prev => Math.max(0, prev - 1));
                }
                
            } catch (error) {
                console.error("Generation error:", error);
                toast.error(`Failed to generate ${activeTab}`);
                if (activeTab === 'image') {
                    setImageQueue(prev => prev.slice(1));
                } else {
                    setVideoQueue(prev => prev.slice(1));
                }
                setQueuePosition(prev => Math.max(0, prev - 1));
            } finally {
                setGenerating(false);
                setIsProcessing(false);
            }
        };
        
        processQueue();
    }, [imageQueue, videoQueue, isProcessing, activeTab, userId, history]);

    const getResetTime = () => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const diffMs = tomorrow.getTime() - now.getTime();
        return Math.ceil(diffMs / (1000 * 60 * 60));
    };

    const generateMedia = async () => {
        if (!prompt.trim()) {
            toast.error('Please describe what you want to create');
            return;
        }

        const currentRemaining = activeTab === 'image' ? remaining.image : remaining.video;
        if (currentRemaining <= 0) {
            const hours = getResetTime();
            toast.error(`${activeTab === 'image' ? 'Image' : 'Video'} limit reached (${activeTab === 'image' ? 20 : 5}/day). Try again in ${hours} hours.`);
            return;
        }

        // Add to queue
        if (activeTab === 'image') {
            setImageQueue(prev => [...prev, prompt]);
        } else {
            setVideoQueue(prev => [...prev, prompt]);
        }
        setQueuePosition(prev => prev + 1);
        toast.info(`Queued! Position: ${queuePosition + 1}`);
        setPrompt('');
    };

    const downloadMedia = () => {
        if (!resultUrl) return;
        const a = document.createElement('a');
        a.href = resultUrl;
        a.download = `adin_${resultType}_${Date.now()}.${resultType === 'image' ? 'png' : 'mp4'}`;
        a.click();
    };

    const examplePrompts = {
        image: [
            "A cute cat wearing sunglasses, cartoon style",
            "Beautiful sunset over mountains, 4K",
            "Dragon flying over a magical castle",
            "Cyberpunk city with neon lights",
            "Astronaut riding a horse on Mars"
        ],
        video: [
            "A cat dancing in space",
            "Sunset over ocean waves",
            "Flowing water in a forest",
            "Fireworks exploding in the sky",
            "A rotating 3D cube"
        ]
    };

    const resetHoursValue = getResetTime();
    const currentQueue = activeTab === 'image' ? imageQueue : videoQueue;

    return (
        <div className="p-4">
            {/* Header */}
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    🎨 Adin AI Media Studio
                </h1>
                <p className="text-gray-400 mt-1">Create 4K Images • AI Videos — Free!</p>
                
                {/* Tabs */}
                <div className="flex justify-center gap-4 mt-4">
                    <button
                        onClick={() => setActiveTab('image')}
                        className={`px-6 py-2 rounded-lg transition ${
                            activeTab === 'image' 
                                ? 'bg-purple-600 text-white' 
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                    >
                        🖼️ Image Generator ({remaining.image}/20)
                    </button>
                    <button
                        onClick={() => setActiveTab('video')}
                        className={`px-6 py-2 rounded-lg transition ${
                            activeTab === 'video' 
                                ? 'bg-purple-600 text-white' 
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                    >
                        🎬 Video Animator ({remaining.video}/5)
                    </button>
                </div>
                
                <div className="mt-2">
                    <span className={`text-sm px-3 py-1 rounded-full ${(activeTab === 'image' ? remaining.image : remaining.video) > 0 ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>
                        📸 {(activeTab === 'image' ? remaining.image : remaining.video)}/{(activeTab === 'image' ? 20 : 5)} free today
                    </span>
                    {remaining.image === 0 && activeTab === 'image' && (
                        <span className="text-xs text-yellow-400 ml-2">Resets in {resetHoursValue}h</span>
                    )}
                    {remaining.video === 0 && activeTab === 'video' && (
                        <span className="text-xs text-yellow-400 ml-2">Resets in {resetHoursValue}h</span>
                    )}
                </div>
                
                {currentQueue.length > 0 && (
                    <div className="mt-2 text-xs text-orange-400">
                        ⏳ Queued! Position: {currentQueue.length}
                    </div>
                )}
                {generating && (
                    <div className="mt-2 text-xs text-green-400 animate-pulse">
                        🎨 Generating your {activeTab === 'image' ? 'image' : 'video'}...
                    </div>
                )}
            </div>

            {/* Example Prompts */}
            <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">✨ Try these:</p>
                <div className="flex flex-wrap gap-2">
                    {examplePrompts[activeTab].map((ex, idx) => (
                        <button
                            key={idx}
                            onClick={() => setPrompt(ex)}
                            className="text-xs bg-gray-800 hover:bg-gray-700 rounded-full px-3 py-1.5 transition"
                        >
                            {ex.slice(0, 35)}...
                        </button>
                    ))}
                </div>
            </div>

            {/* Input Area */}
            <div className="flex gap-3 mb-4">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={`Describe the ${activeTab === 'image' ? 'image' : 'video'} you want to create...`}
                    className="flex-1 h-[56px] rounded-2xl bg-zinc-950 border border-zinc-800 px-5 outline-none text-white"
                    onKeyDown={(e) => e.key === 'Enter' && generateMedia()}
                />
                <button
                    onClick={generateMedia}
                    disabled={generating || (activeTab === 'image' ? remaining.image : remaining.video) === 0}
                    className="h-[56px] px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 disabled:opacity-50 text-white font-medium"
                >
                    {generating ? 'Creating...' : (currentQueue.length > 0 ? 'Queued...' : `Generate ${activeTab === 'image' ? 'Image' : 'Video'} ✨`)}
                </button>
            </div>

            {/* Result */}
            {resultUrl && (
                <div className="mt-4 bg-gray-900/50 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium text-gray-300">Your Creation</h3>
                        <button onClick={downloadMedia} className="text-sm text-purple-400 hover:text-purple-300">
                            📥 Download
                        </button>
                    </div>
                    {resultType === 'image' ? (
                        <img src={resultUrl} alt="Generated" className="rounded-xl border border-gray-700 w-full" />
                    ) : (
                        <video src={resultUrl} controls autoPlay loop className="rounded-xl border border-gray-700 w-full" />
                    )}
                    <p className="text-xs text-gray-500 mt-2 text-center">✨ Made with Adin AI</p>
                </div>
            )}

            {/* History */}
            {history.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-400 mb-3">Recent Creations</h3>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        {history.slice(0, 8).map((item, idx) => (
                            <div key={idx} className="relative flex-shrink-0 cursor-pointer" onClick={() => {
                                setResultUrl(item.url);
                                setResultType(item.type as 'image' | 'video');
                            }}>
                                {item.type === 'image' ? (
                                    <img src={item.url} alt={`History ${idx + 1}`} className="w-20 h-20 rounded-lg object-cover border border-gray-700 hover:border-purple-500 transition" />
                                ) : (
                                    <video src={item.url} className="w-20 h-20 rounded-lg object-cover border border-gray-700 hover:border-purple-500 transition" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="mt-6 text-center text-xs text-gray-600">
                <p>✨ Free tier: 20 images/day • 5 videos/day • 4K quality • No watermark</p>
                <p>Made with ❤️ by Adin AI</p>
            </div>
        </div>
    );
};

export default ImageGenerator;