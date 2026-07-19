import { useState } from "react";
import { 
  Sparkles, 
  Code, 
  PenTool, 
  Briefcase, 
  Heart, 
  TrendingUp,
  BookOpen,
  Music,
  Video,
  Zap,
  Star,
  Mail,
  FileText,
  Lightbulb,
  Rocket,
  Globe,
  ArrowLeft,
  Send,
  Loader2,
  Copy,
  Check,
  FileSearch,
  Bug
} from "lucide-react";
import { sendToAI } from "../services/ai";
import { useUser } from "@clerk/clerk-react";
import toast from "react-hot-toast";

const categories = [
  { id: "all", name: "All", icon: <Sparkles size={16} /> },
  { id: "coding", name: "Coding", icon: <Code size={16} /> },
  { id: "writing", name: "Writing", icon: <PenTool size={16} /> },
  { id: "business", name: "Business", icon: <Briefcase size={16} /> },
  { id: "creative", name: "Creative", icon: <Heart size={16} /> },
  { id: "trending", name: "Trending", icon: <TrendingUp size={16} /> },
];

const trendingTools = [
  {
    id: "trending1",
    name: "Viral Tweet Generator",
    description: "Write viral tweets about any topic",
    icon: <Rocket size={24} />,
    prompt: "Write a viral tweet about ",
    color: "from-yellow-500 to-orange-500",
    popular: true,
  },
  {
    id: "trending2",
    name: "LinkedIn Post Creator",
    description: "Create engaging LinkedIn posts",
    icon: <Briefcase size={24} />,
    prompt: "Create a LinkedIn post about ",
    color: "from-blue-500 to-cyan-500",
    popular: true,
  },
  {
    id: "trending3",
    name: "Instagram Caption Generator",
    description: "Generate catchy Instagram captions",
    icon: <Heart size={24} />,
    prompt: "Generate Instagram caption for ",
    color: "from-pink-500 to-rose-500",
    popular: true,
  },
  {
    id: "trending4",
    name: "YouTube Description Writer",
    description: "Write SEO-friendly YouTube descriptions",
    icon: <Video size={24} />,
    prompt: "Write a YouTube description for ",
    color: "from-red-500 to-orange-500",
    popular: true,
  },
  {
    id: "trending5",
    name: "Pinterest Pin Creator",
    description: "Create engaging Pinterest pin descriptions",
    icon: <Sparkles size={24} />,
    prompt: "Create a Pinterest pin description about ",
    color: "from-rose-500 to-pink-500",
    popular: true,
  },
];

const trendingPrompts = [
  "Write a viral tweet about AI",
  "Create a LinkedIn post about coding",
  "Generate Instagram caption for tech product",
  "Write a YouTube description for tutorial",
  "Create a Pinterest pin description",
];

const tools = [
  {
    id: 1,
    name: "Code Assistant",
    description: "Write, debug, and optimize code in any language",
    category: "coding",
    icon: <Code size={24} />,
    prompt: "Write code for ",
    color: "from-blue-500 to-cyan-500",
    popular: true,
  },
  {
    id: 2,
    name: "Blog Writer",
    description: "Generate engaging blog posts and articles",
    category: "writing",
    icon: <PenTool size={24} />,
    prompt: "Write a blog post about ",
    color: "from-emerald-500 to-teal-500",
    popular: true,
  },
  {
    id: 3,
    name: "Email Composer",
    description: "Professional emails for any situation",
    category: "business",
    icon: <Mail size={24} />,
    prompt: "Write a professional email about ",
    color: "from-violet-500 to-purple-500",
    popular: false,
  },
  {
    id: 4,
    name: "Storyteller",
    description: "Create captivating stories and narratives",
    category: "creative",
    icon: <BookOpen size={24} />,
    prompt: "Tell me a story about ",
    color: "from-amber-500 to-orange-500",
    popular: true,
  },
  {
    id: 5,
    name: "Song Lyricist",
    description: "Write song lyrics in any genre",
    category: "creative",
    icon: <Music size={24} />,
    prompt: "Write song lyrics about ",
    color: "from-pink-500 to-rose-500",
    popular: false,
  },
  {
    id: 6,
    name: "Video Script",
    description: "Scripts for YouTube, TikTok, and reels",
    category: "creative",
    icon: <Video size={24} />,
    prompt: "Write a video script about ",
    color: "from-red-500 to-orange-500",
    popular: true,
  },
  {
    id: 7,
    name: "Summarizer",
    description: "Summarize any text, article, or document",
    category: "writing",
    icon: <FileText size={24} />,
    prompt: "Summarize this: ",
    color: "from-indigo-500 to-purple-500",
    popular: true,
  },
  {
    id: 8,
    name: "Quick Answer",
    description: "Get instant answers to any question",
    category: "all",
    icon: <Zap size={24} />,
    prompt: "",
    color: "from-yellow-500 to-amber-500",
    popular: true,
  },
  {
    id: 9,
    name: "SEO Optimizer",
    description: "Optimize content for search engines",
    category: "business",
    icon: <Globe size={24} />,
    prompt: "Write SEO optimized content about ",
    color: "from-green-500 to-teal-500",
    popular: true,
  },
  {
    id: 10,
    name: "Idea Generator",
    description: "Generate creative ideas for any topic",
    category: "creative",
    icon: <Lightbulb size={24} />,
    prompt: "Generate 10 creative ideas about ",
    color: "from-yellow-500 to-orange-500",
    popular: true,
  },
];

// Tool Detail Component
function ToolDetail({ tool, onBack, onSendToChat }: { 
  tool: any; 
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
      const fullPrompt = `${tool.prompt} ${topic}`;
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
      onSendToChat(`${tool.prompt} ${topic}\n\n${result}`);
      toast.success("Sent to chat!");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <button onClick={onBack} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition">
          <ArrowLeft size={18} />
          Back to Explore
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className={`bg-gradient-to-br ${tool.color} p-3 rounded-2xl text-white`}>
            {tool.icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{tool.name}</h1>
            <p className="text-zinc-400">{tool.description}</p>
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

export default function Explore({ onSelectTool }: { onSelectTool?: (prompt: string, toolName: string) => void }) {
  const { user } = useUser();
  const userId = user?.id || "anonymous";
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTool, setSelectedTool] = useState<any>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const filteredTools = selectedCategory === "all" 
    ? tools 
    : tools.filter(tool => tool.category === selectedCategory);

  const handleToolClick = (tool: any) => {
    setSelectedTool(tool);
  };

  const handleTrendingClick = (tool: any) => {
    setSelectedTool(tool);
  };

  const handleSendToChat = (text: string) => {
    onSelectTool?.(text, selectedTool?.name || "Tool");
    setSelectedTool(null);
  };

  if (selectedTool) {
    return (
      <ToolDetail
        tool={selectedTool}
        onBack={() => setSelectedTool(null)}
        onSendToChat={handleSendToChat}
      />
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Adin AI Tools</h1>
          <p className="text-zinc-400">Discover powerful AI assistants for any task</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setShowSuggestions(true);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition ${
                selectedCategory === cat.id
                  ? "bg-gradient-to-r from-violet-600 to-blue-500 text-white"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              {cat.icon}
              {cat.name}
            </button>
          ))}
        </div>

        {/* Trending Suggestions Section - Now opens ToolDetail */}
        {showSuggestions && selectedCategory === "trending" && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-yellow-400" />
              <h2 className="font-semibold text-white">🔥 Trending This Week</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {trendingTools.map((tool, idx) => (
                <button
                  key={idx}
                  onClick={() => handleTrendingClick(tool)}
                  className="text-left bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-3 hover:bg-yellow-500/20 transition group"
                >
                  <div className="flex items-center gap-2">
                    {tool.icon}
                    <div>
                      <div className="text-sm font-medium text-white group-hover:text-yellow-400 transition">
                        {tool.name}
                      </div>
                      <p className="text-xs text-zinc-400">{tool.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Idea Generator Banner */}
        {showSuggestions && selectedCategory === "creative" && (
          <div className="mb-8 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb size={18} className="text-purple-400" />
              <h3 className="font-semibold text-white">Need inspiration?</h3>
            </div>
            <p className="text-sm text-zinc-400 mb-3">
              Try: "birthday party ideas", "tech startup names", "romantic date ideas"
            </p>
            <div className="flex flex-wrap gap-2">
              {["Birthday party", "Tech startup", "Romantic date", "Gift ideas"].map((idea) => (
                <button
                  key={idea}
                  onClick={() => handleToolClick({ ...tools[9], prompt: `Generate 10 creative ideas about ${idea}` })}
                  className="px-3 py-1 rounded-full bg-zinc-800 text-xs hover:bg-zinc-700 transition"
                >
                  {idea}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => handleToolClick(tool)}
              className="group text-left bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 hover:bg-zinc-900 transition-all hover:scale-[1.02]"
            >
              <div className="flex items-start gap-4">
                <div className={`bg-gradient-to-br ${tool.color} p-2 rounded-xl text-white`}>
                  {tool.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{tool.name}</h3>
                    {tool.popular && (
                      <span className="flex items-center gap-1 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                        <Star size={10} /> Popular
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-400 mt-1">{tool.description}</p>
                  <p className="text-xs text-violet-400 mt-3 opacity-0 group-hover:opacity-100 transition">
                    Click to use →
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 bg-gradient-to-r from-violet-600/20 to-blue-500/20 border border-violet-500/30 rounded-2xl p-5 text-center">
          <p className="text-sm text-zinc-300">✨ More tools coming soon! ✨</p>
        </div>
      </div>
    </div>
  );
}