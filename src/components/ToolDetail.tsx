import { useState } from "react";
import { ArrowLeft, Send, Loader2, Sparkles } from "lucide-react";
import { sendToAI } from "../services/ai";
import { useUser } from "@clerk/clerk-react";
import toast from "react-hot-toast";

export default function ToolDetail({ tool, onBack, onSendToChat }: { 
  tool: { name: string; prompt: string; description: string; color: string; icon: React.ReactNode };
  onBack: () => void;
  onSendToChat: (text: string) => void;
}) {
  const { user } = useUser();
  const userId = user?.id || "anonymous";
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const generate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    setLoading(true);
    setResult("");

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

  const sendToChat = () => {
    if (result) {
      onSendToChat(`${tool.prompt} ${topic}\n\n${result}`);
      toast.success("Sent to chat!");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft size={18} />
          Back to Explore
        </button>

        {/* Tool Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className={`bg-gradient-to-br ${tool.color} p-3 rounded-2xl text-white`}>
            {tool.icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{tool.name}</h1>
            <p className="text-zinc-400">{tool.description}</p>
          </div>
        </div>

        {/* Input Section */}
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

        {/* Result Section */}
        {result && (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white">Generated Result</h3>
              <button
                onClick={sendToChat}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-90 transition flex items-center gap-2 text-sm"
              >
                <Send size={14} />
                Send to Chat
              </button>
            </div>
            <div className="bg-black/30 rounded-xl p-4 max-h-96 overflow-y-auto">
              <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-sans">
                {result}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}