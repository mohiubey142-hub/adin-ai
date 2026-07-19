import { useState, useEffect } from "react";
import { 
  Pin, 
  Star, 
  Bookmark, 
  Clock, 
  Trash2, 
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Image,
  File,
  Download,
  Eye,
  Plus,
  X,
  ArrowLeft,
  Send,
  Loader2,
  FileSearch,
  Bug
} from "lucide-react";
import { sendToAI } from "../services/ai";
import { useUser } from "@clerk/clerk-react";
import toast from "react-hot-toast";

type SavedPrompt = {
  id: number;
  title: string;
  prompt: string;
  category: string;
};

type SavedImage = {
  id: number;
  url: string;
  prompt: string;
  createdAt: string;
};

type SavedFile = {
  id: number;
  name: string;
  size: number;
  type: string;
  content: string;
  createdAt: string;
};

const defaultPrompts: SavedPrompt[] = [
  { id: 1, title: "Code Review", prompt: "Review this code and suggest improvements:", category: "coding" },
  { id: 2, title: "Email Writer", prompt: "Write a professional email about:", category: "business" },
  { id: 3, title: "Blog Outline", prompt: "Create an outline for a blog post about:", category: "writing" },
  { id: 4, title: "Summarizer", prompt: "Summarize the following text:", category: "productivity" },
  { id: 5, title: "Translator", prompt: "Translate this to English:", category: "productivity" },
];

// Tool Detail Component for Prompts
function PromptDetail({ prompt, onBack, onSendToChat }: { 
  prompt: SavedPrompt; 
  onBack: () => void; 
  onSendToChat: (text: string) => void;
}) {
  const { user } = useUser();
  const userId = user?.id || "anonymous";
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    setLoading(true);
    setResult("");
    setAnalysis("");

    try {
      const fullPrompt = `${prompt.prompt} ${topic}`;
      const response = await sendToAI(
        [{ role: "user", text: fullPrompt }],
        [],
        true,
        userId
      );
      const data = await response.json();
      const aiText = data.choices?.[0]?.message?.content || "No response generated.";
      setResult(aiText);
    } catch (err) {
      toast.error("Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  const analyzeResult = async () => {
    if (!result) {
      toast.error("Generate something first");
      return;
    }

    setAnalyzing(true);
    setAnalysis("");

    try {
      const analyzePrompt = `Analyze the following content and provide:
1. Grammar mistakes (if any)
2. Clarity score (1-10)
3. Suggestions for improvement
4. Tone analysis
5. Key takeaways

Content to analyze:
${result}`;

      const response = await sendToAI(
        [{ role: "user", text: analyzePrompt }],
        [],
        true,
        userId
      );
      const data = await response.json();
      const analysisText = data.choices?.[0]?.message?.content || "Analysis completed.";
      setAnalysis(analysisText);
    } catch (err) {
      toast.error("Failed to analyze");
    } finally {
      setAnalyzing(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) {
      toast.error("Nothing to copy");
      return;
    }
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const sendToChat = () => {
    if (result) {
      onSendToChat(`${prompt.prompt} ${topic}\n\n${result}`);
      toast.success("Sent to chat!");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <button onClick={onBack} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition">
          <ArrowLeft size={18} />
          Back to Library
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="bg-gradient-to-br from-violet-500 to-purple-500 p-3 rounded-2xl text-white">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{prompt.title}</h1>
            <p className="text-zinc-400">{prompt.prompt}</p>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 mb-6">
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Enter your topic / request
          </label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={`e.g., "artificial intelligence", "summer vacation", "healthy lifestyle"...`}
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 outline-none focus:border-violet-500 text-white resize-none"
          />
          <button
            onClick={generate}
            disabled={loading}
            className="mt-3 px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            Generate
          </button>
        </div>

        {result && (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h3 className="font-semibold text-white">Generated Result</h3>
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition flex items-center gap-2 text-sm"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={analyzeResult}
                  disabled={analyzing}
                  className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 transition flex items-center gap-2 text-sm"
                >
                  {analyzing ? <Loader2 size={14} className="animate-spin" /> : <FileSearch size={14} />}
                  Analyze
                </button>
                <button
                  onClick={sendToChat}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 transition flex items-center gap-2 text-sm"
                >
                  <Send size={14} />
                  Send to Chat
                </button>
              </div>
            </div>
            <div className="bg-black/30 rounded-xl p-4 max-h-96 overflow-y-auto">
              <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-sans">
                {result}
              </pre>
            </div>
          </div>
        )}

        {analysis && (
          <div className="bg-zinc-900/50 border border-purple-500/30 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Bug size={18} className="text-purple-400" />
              <h3 className="font-semibold text-white">Analysis Report</h3>
            </div>
            <div className="bg-black/30 rounded-xl p-4 max-h-64 overflow-y-auto">
              <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-sans">
                {analysis}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Library({ onUsePrompt, onLoadChat }: { 
  onUsePrompt?: (prompt: string) => void;
  onLoadChat?: (chatId: number) => void;
}) {
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>(defaultPrompts);
  const [pinnedChats, setPinnedChats] = useState<any[]>([]);
  const [savedImages, setSavedImages] = useState<SavedImage[]>([]);
  const [savedFiles, setSavedFiles] = useState<SavedFile[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("prompts");
  const [selectedImage, setSelectedImage] = useState<SavedImage | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<SavedPrompt | null>(null);
  
  const [showAddPrompt, setShowAddPrompt] = useState(false);
  const [newPromptTitle, setNewPromptTitle] = useState("");
  const [newPromptText, setNewPromptText] = useState("");
  const [newPromptCategory, setNewPromptCategory] = useState("custom");

  useEffect(() => {
    const images = localStorage.getItem("adin-saved-images");
    if (images) setSavedImages(JSON.parse(images));
    
    const files = localStorage.getItem("adin-saved-files");
    if (files) setSavedFiles(JSON.parse(files));
    
    const prompts = localStorage.getItem("adin-custom-prompts");
    if (prompts) {
      const customPrompts = JSON.parse(prompts);
      setSavedPrompts([...defaultPrompts, ...customPrompts]);
    }
    
    const history = localStorage.getItem("adin-history");
    if (history) {
      const chats = JSON.parse(history);
      setPinnedChats(chats.filter((c: any) => c.pinned));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("adin-saved-images", JSON.stringify(savedImages));
  }, [savedImages]);

  useEffect(() => {
    localStorage.setItem("adin-saved-files", JSON.stringify(savedFiles));
  }, [savedFiles]);

  const saveCustomPrompt = () => {
    if (!newPromptTitle.trim() || !newPromptText.trim()) {
      toast.error("Please enter both title and prompt");
      return;
    }

    const customPrompts = JSON.parse(localStorage.getItem("adin-custom-prompts") || "[]");
    const newPrompt = {
      id: Date.now(),
      title: newPromptTitle,
      prompt: newPromptText,
      category: newPromptCategory,
    };
    
    customPrompts.push(newPrompt);
    localStorage.setItem("adin-custom-prompts", JSON.stringify(customPrompts));
    
    setSavedPrompts([...savedPrompts, newPrompt]);
    setShowAddPrompt(false);
    setNewPromptTitle("");
    setNewPromptText("");
    setNewPromptCategory("custom");
    toast.success("Custom prompt added!");
  };

  const removeImage = (id: number) => {
    setSavedImages(savedImages.filter(img => img.id !== id));
    toast.success("Image removed");
  };

  const removeFile = (id: number) => {
    setSavedFiles(savedFiles.filter(f => f.id !== id));
    toast.success("File removed");
  };

  const removePrompt = (id: number) => {
    const customPrompts = JSON.parse(localStorage.getItem("adin-custom-prompts") || "[]");
    const isCustom = customPrompts.some((p: any) => p.id === id);
    
    if (isCustom) {
      const updated = customPrompts.filter((p: any) => p.id !== id);
      localStorage.setItem("adin-custom-prompts", JSON.stringify(updated));
      setSavedPrompts(savedPrompts.filter(p => p.id !== id));
      toast.success("Prompt removed");
    } else {
      toast.error("Default prompts cannot be deleted");
    }
  };

  const copyPrompt = (prompt: string, id: number) => {
    navigator.clipboard.writeText(prompt);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePromptClick = (prompt: SavedPrompt) => {
    setSelectedPrompt(prompt);
  };

  const handleSendToChat = (text: string) => {
    onUsePrompt?.(text);
    setSelectedPrompt(null);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const tabs = [
    { id: "prompts", label: "📚 Prompts", icon: <Bookmark size={16} /> },
    { id: "images", label: "🖼️ Images", icon: <Image size={16} /> },
    { id: "files", label: "📁 Files", icon: <File size={16} /> },
    { id: "pinned", label: "📌 Pinned Chats", icon: <Pin size={16} /> },
  ];

  if (selectedPrompt) {
    return (
      <PromptDetail
        prompt={selectedPrompt}
        onBack={() => setSelectedPrompt(null)}
        onSendToChat={handleSendToChat}
      />
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Library</h1>
          <p className="text-zinc-400">Your saved prompts, images, files, and pinned chats</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6 border-b border-zinc-800 pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-violet-600 to-blue-500 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Prompts Tab */}
        {activeTab === "prompts" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedPrompts.map((prompt) => (
                <button
                  key={prompt.id}
                  onClick={() => handlePromptClick(prompt)}
                  className="group text-left bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 hover:bg-zinc-900 transition hover:scale-[1.02]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">{prompt.title}</h3>
                      <p className="text-sm text-zinc-400">{prompt.prompt}</p>
                      <p className="text-xs text-violet-400 mt-2 opacity-0 group-hover:opacity-100 transition">
                        Click to use →
                      </p>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyPrompt(prompt.prompt, prompt.id);
                        }}
                        className="p-1.5 rounded-lg hover:bg-zinc-700 transition"
                      >
                        {copiedId === prompt.id ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                      </button>
                      {prompt.category === "custom" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removePrompt(prompt.id);
                          }}
                          className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowAddPrompt(true)}
                className="flex items-center gap-2 mx-auto px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 text-white text-sm hover:opacity-90 transition"
              >
                <Plus size={16} />
                Add Custom Prompt
              </button>
            </div>
          </>
        )}

        {/* Images Tab */}
        {activeTab === "images" && (
          <>
            {savedImages.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">
                <Image size={48} className="mx-auto mb-3 opacity-50" />
                <p>No saved images</p>
                <p className="text-sm">Generate images and save them here</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {savedImages.map((img) => (
                  <div key={img.id} className="group relative bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
                    <img src={img.url} alt={img.prompt} className="w-full h-40 object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                      <button
                        onClick={() => setSelectedImage(img)}
                        className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => removeImage(img.id)}
                        className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="p-2 text-xs text-zinc-500 truncate">
                      {img.prompt.slice(0, 40)}...
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Files Tab */}
        {activeTab === "files" && (
          <>
            {savedFiles.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">
                <File size={48} className="mx-auto mb-3 opacity-50" />
                <p>No saved files</p>
                <p className="text-sm">Upload documents and save them here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedFiles.map((file) => (
                  <div key={file.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-800 rounded-lg">
                          <File size={24} className="text-violet-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-white">{file.name}</h3>
                          <p className="text-xs text-zinc-500">{formatFileSize(file.size)} · {formatDate(file.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => {
                            const blob = new Blob([file.content], { type: file.type });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = file.name;
                            a.click();
                            URL.revokeObjectURL(url);
                            toast.success("Downloading...");
                          }}
                          className="p-1.5 rounded-lg hover:bg-zinc-700 transition"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => removeFile(file.id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Pinned Chats Tab */}
        {activeTab === "pinned" && (
          <>
            {pinnedChats.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">
                <Pin size={48} className="mx-auto mb-3 opacity-50" />
                <p>No pinned chats</p>
                <p className="text-sm">Pin chats from the sidebar to see them here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pinnedChats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => onLoadChat?.(chat.id)}
                    className="w-full text-left bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 hover:bg-zinc-900 transition group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Pin size={16} className="text-yellow-400" />
                        <div>
                          <h3 className="font-semibold text-white">{chat.title}</h3>
                          <p className="text-xs text-zinc-500">Click to open chat →</p>
                        </div>
                      </div>
                      <ExternalLink size={16} className="text-zinc-500 opacity-0 group-hover:opacity-100 transition" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Add Custom Prompt Modal */}
        {showAddPrompt && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowAddPrompt(false)}>
            <div className="max-w-md w-full bg-zinc-900 rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                <h2 className="text-lg font-semibold">Add Custom Prompt</h2>
                <button onClick={() => setShowAddPrompt(false)} className="p-1 rounded-lg hover:bg-zinc-800 transition">
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={newPromptTitle}
                    onChange={(e) => setNewPromptTitle(e.target.value)}
                    placeholder="e.g., Code Optimizer"
                    className="w-full px-4 py-2 rounded-xl bg-zinc-800 border border-zinc-700 outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Prompt Template</label>
                  <textarea
                    value={newPromptText}
                    onChange={(e) => setNewPromptText(e.target.value)}
                    placeholder="e.g., Optimize this code:"
                    rows={3}
                    className="w-full px-4 py-2 rounded-xl bg-zinc-800 border border-zinc-700 outline-none focus:border-violet-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={newPromptCategory}
                    onChange={(e) => setNewPromptCategory(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-zinc-800 border border-zinc-700 outline-none focus:border-violet-500"
                  >
                    <option value="custom">Custom</option>
                    <option value="coding">Coding</option>
                    <option value="writing">Writing</option>
                    <option value="business">Business</option>
                    <option value="productivity">Productivity</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 p-4 border-t border-zinc-800">
                <button
                  onClick={() => setShowAddPrompt(false)}
                  className="flex-1 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={saveCustomPrompt}
                  className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 hover:opacity-90 transition"
                >
                  Add Prompt
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Image Modal */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedImage(null)}>
            <div className="max-w-2xl w-full bg-zinc-900 rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <img src={selectedImage.url} alt={selectedImage.prompt} className="w-full" />
              <div className="p-4">
                <p className="text-sm text-zinc-300">{selectedImage.prompt}</p>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="mt-3 px-4 py-2 rounded-lg bg-zinc-800 text-sm hover:bg-zinc-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}