// src/components/ImageGenerator.tsx
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface ImageGeneratorProps {
    userId: string;
}

declare global {
    interface Window {
        puter: any;
    }
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ userId }) => {
    const [prompt, setPrompt] = useState('');
    const [generating, setGenerating] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [remaining, setRemaining] = useState(10);
    const [resetHours, setResetHours] = useState(24);
    const [history, setHistory] = useState<string[]>([]);
    const [puterReady, setPuterReady] = useState(false);

    useEffect(() => {
        // Check if Puter is loaded
        const checkPuter = setInterval(() => {
            if (window.puter) {
                setPuterReady(true);
                clearInterval(checkPuter);
                console.log("✅ Puter ready!");
            }
        }, 500);
        
        // Load daily limit
        const key = `adin_img_${userId}`;
        const today = new Date().toISOString().split('T')[0];
        const stored = localStorage.getItem(key);
        if (stored) {
            try {
                const data = JSON.parse(stored);
                if (data.date === today) {
                    setRemaining(Math.max(0, 10 - data.count));
                }
            } catch(e) {}
        }
        
        return () => clearInterval(checkPuter);
    }, [userId]);

    const getResetTime = (): number => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const diffMs = tomorrow.getTime() - now.getTime();
        return Math.ceil(diffMs / (1000 * 60 * 60));
    };

    const incrementCount = () => {
        const key = `adin_img_${userId}`;
        const today = new Date().toISOString().split('T')[0];
        const currentCount = 10 - remaining;
        const newCount = currentCount + 1;
        localStorage.setItem(key, JSON.stringify({ date: today, count: newCount }));
        setRemaining(10 - newCount);
        setResetHours(getResetTime());
    };

    const generateImage = async () => {
        if (!prompt.trim()) {
            toast.error('Please describe the image you want to create');
            return;
        }

        if (!puterReady) {
            toast.error('AI model is still loading. Please wait 5 seconds.');
            return;
        }

        if (remaining <= 0) {
            const hours = getResetTime();
            toast.error(`Free limit reached (10 images/day). Try again in ${hours} hours.`);
            return;
        }

        setGenerating(true);
        toast.loading('🎨 Creating your 4K image... (15-30 seconds)', { id: 'img' });

        try {
            // 🔥 WORKING PUTER IMAGE GENERATION
            const result = await window.puter.ai.txt2img(prompt, {
                model: 'openai/gpt-image-1.5'
            });
            
            let imgUrl;
            if (typeof result === 'string') {
                imgUrl = result;
            } else if (result instanceof HTMLImageElement) {
                imgUrl = result.src;
            } else if (result.url) {
                imgUrl = result.url;
            } else if (result.src) {
                imgUrl = result.src;
            } else {
                imgUrl = URL.createObjectURL(result);
            }
            
            setImageUrl(imgUrl);
            setHistory(prev => [imgUrl, ...prev].slice(0, 10));
            incrementCount();
            toast.success(`✨ Image created! ${remaining - 1} left today`, { id: 'img' });
            
        } catch (error: any) {
            console.error("Generation error:", error);
            toast.error(error.message || 'Failed to generate image. Please try again.');
        } finally {
            setGenerating(false);
        }
    };

    const downloadImage = () => {
        if (!imageUrl) return;
        const a = document.createElement('a');
        a.href = imageUrl;
        a.download = `adin_image_${Date.now()}.png`;
        a.click();
    };

    const examplePrompts = [
        "A cute cat wearing sunglasses, cartoon style",
        "Beautiful sunset over mountains, 4K",
        "Robot cooking food in a futuristic kitchen",
        "Dragon flying over a magical castle, fantasy art",
        "Cyberpunk city with neon lights, rainy night",
        "Astronaut riding a horse on Mars, surreal"
    ];

    return (
        <div className="p-4">
            {/* Header */}
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    🎨 Adin AI Image Studio
                </h1>
                <p className="text-gray-400 mt-1">Create amazing images with AI — Free!</p>
                <div className="mt-2">
                    <span className={`text-sm px-3 py-1 rounded-full ${remaining > 0 ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>
                        📸 {remaining}/10 free images today
                    </span>
                    {remaining === 0 && (
                        <span className="text-xs text-yellow-400 ml-2">Resets in {resetHours}h</span>
                    )}
                </div>
                {!puterReady && (
                    <div className="mt-2 text-xs text-yellow-400 animate-pulse">
                        ⏳ Loading AI model... Please wait
                    </div>
                )}
            </div>

            {/* Example Prompts */}
            <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">✨ Try these ideas:</p>
                <div className="flex flex-wrap gap-2">
                    {examplePrompts.map((ex, idx) => (
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
                    placeholder="Describe your image... (e.g., 'A beautiful sunset over mountains')"
                    className="flex-1 h-[56px] rounded-2xl bg-zinc-950 border border-zinc-800 px-5 outline-none text-white"
                    onKeyDown={(e) => e.key === 'Enter' && generateImage()}
                />
                <button
                    onClick={generateImage}
                    disabled={generating || remaining === 0 || !puterReady}
                    className="h-[56px] px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 disabled:opacity-50 text-white font-medium"
                >
                    {generating ? (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Creating...
                        </div>
                    ) : (
                        'Generate ✨'
                    )}
                </button>
            </div>

            {/* Result */}
            {imageUrl && (
                <div className="mt-4 bg-gray-900/50 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium text-gray-300">Your Creation</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={downloadImage}
                                className="text-sm text-purple-400 hover:text-purple-300"
                            >
                                📥 Download
                            </button>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(prompt);
                                    toast.success('Prompt copied!');
                                }}
                                className="text-sm text-gray-400 hover:text-gray-300"
                            >
                                📋 Copy Prompt
                            </button>
                        </div>
                    </div>
                    <img 
                        src={imageUrl} 
                        alt="Generated" 
                        className="rounded-xl border border-gray-700 w-full max-h-[512px] object-contain" 
                    />
                    <p className="text-xs text-gray-500 mt-2 text-center">
                        ✨ Made with Adin AI — Share on social media!
                    </p>
                </div>
            )}

            {/* History */}
            {history.length > 1 && (
                <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-400 mb-3">Recent Creations</h3>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        {history.slice(1).map((url, idx) => (
                            <div 
                                key={idx} 
                                className="relative flex-shrink-0 cursor-pointer" 
                                onClick={() => setImageUrl(url)}
                            >
                                <img 
                                    src={url} 
                                    alt={`History ${idx + 1}`} 
                                    className="w-20 h-20 rounded-lg object-cover border border-gray-700 hover:border-purple-500 transition" 
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="mt-6 text-center text-xs text-gray-600">
                <p>✨ Free tier: 10 images/day • 4K quality • No watermark</p>
                <p>Made with ❤️ by Adin AI</p>
            </div>
        </div>
    );
};

export default ImageGenerator;