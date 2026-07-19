import { useState } from "react";
import { Search as SearchIcon, MessageSquare, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

type SearchResult = {
  title: string;
  snippet: string;
  chatId: number;
  messageIndex: number;
};

export default function Search({ 
  chatMessages, 
  chatHistory, 
  onOpenChat 
}: { 
  chatMessages: Record<number, any[]>;
  chatHistory: any[];
  onOpenChat: (chatId: number) => void;
}) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  const searchChat = () => {
    if (!query.trim()) {
      toast.error("Please enter something to search in chats");
      return;
    }

    setLoading(true);
    const found: SearchResult[] = [];

    for (const chat of chatHistory) {
      const messages = chatMessages[chat.id] || [];
      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        if (msg.text.toLowerCase().includes(query.toLowerCase())) {
          found.push({
            title: chat.title,
            snippet: msg.text.slice(0, 200),
            chatId: chat.id,
            messageIndex: i,
          });
          if (found.length >= 20) break;
        }
      }
      if (found.length >= 20) break;
    }

    setResults(found);
    setLoading(false);
    
    if (found.length === 0) {
      toast.info("No matching messages found in your chats");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-2">Chat Search</h1>
        <p className="text-zinc-400 mb-6">Search inside your chat history</p>

        <div className="flex gap-3 mb-6">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchChat()}
            placeholder="Search your chats..."
            className="flex-1 h-[52px] rounded-2xl bg-zinc-950 border border-zinc-800 px-5 outline-none focus:border-violet-500 text-base"
          />
          <button
            onClick={searchChat}
            disabled={loading}
            className="px-6 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-500 disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <SearchIcon size={18} />}
          </button>
        </div>

        {loading && (
          <div className="text-center py-12">
            <Loader2 size={32} className="animate-spin mx-auto mb-3 text-violet-400" />
            <p className="text-zinc-500">Searching your chats...</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-3">
            {results.map((res, i) => (
              <div
                key={i}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 hover:bg-zinc-900 transition cursor-pointer group"
                onClick={() => onOpenChat(res.chatId)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-violet-400 group-hover:underline">
                    📋 {res.title}
                  </h3>
                  <span className="text-xs text-zinc-500">Click to open →</span>
                </div>
                <p className="text-sm text-zinc-400 line-clamp-3">{res.snippet}</p>
              </div>
            ))}
          </div>
        )}

        {!loading && results.length === 0 && (
          <div className="text-center py-12 text-zinc-500">
            <MessageSquare size={48} className="mx-auto mb-3 opacity-50" />
            <p>No messages found in your chats</p>
            <p className="text-sm mt-2">Try searching for something you've discussed before</p>
          </div>
        )}
      </div>
    </div>
  );
}