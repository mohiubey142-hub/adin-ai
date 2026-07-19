import { useState, useRef, useEffect } from "react";
import { 
  Upload, 
  FileText, 
  File, 
  Trash2, 
  Loader2,
  MessageSquare,
  Send
} from "lucide-react";
import toast from "react-hot-toast";

type UploadedFile = {
  id: number;
  name: string;
  size: number;
  type: string;
  content: string;
  createdAt: string;
};

export default function Documents({ onSendToChat }: { onSendToChat?: (text: string) => void }) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [processing, setProcessing] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("adin-uploaded-files");
    if (saved) {
      const parsed = JSON.parse(saved);
      setFiles(parsed);
      if (parsed.length > 0) setSelectedFile(parsed[0]);
    }
  }, []);

  const saveFiles = (newFiles: UploadedFile[]) => {
    setFiles(newFiles);
    localStorage.setItem("adin-uploaded-files", JSON.stringify(newFiles));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.txt')) {
      toast.error("Only .txt files are supported");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setProcessing(true);
    toast.loading("Reading file...", { id: "upload" });

    try {
      const reader = new FileReader();
      
      const content = await new Promise<string>((resolve, reject) => {
        reader.onload = (e) => {
          let text = e.target?.result as string;
          // Check if content is readable (not garbage)
          if (text && /[a-zA-Z0-9\s\.\,\!\?\-\']/.test(text.slice(0, 100))) {
            resolve(text);
          } else {
            reject(new Error("File appears to be corrupted or binary. Please use a plain text file."));
          }
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsText(file, 'UTF-8');
      });

      const newFile: UploadedFile = {
        id: Date.now(),
        name: file.name,
        size: file.size,
        type: file.type,
        content: content.slice(0, 10000),
        createdAt: new Date().toISOString(),
      };

      saveFiles([newFile, ...files]);
      toast.success("File uploaded successfully!", { id: "upload" });
      setSelectedFile(newFile);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to read file", { id: "upload" });
    } finally {
      setProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const deleteFile = (id: number) => {
    saveFiles(files.filter(f => f.id !== id));
    if (selectedFile?.id === id) {
      setSelectedFile(files.find(f => f.id !== id) || null);
    }
    toast.success("File deleted");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const sendToChat = () => {
    if (!chatInput.trim() || !selectedFile) return;
    
    const message = `📄 Document: ${selectedFile.name}\n\n❓ Question: ${chatInput}\n\n📝 Document content:\n${selectedFile.content.slice(0, 2000)}`;
    onSendToChat?.(message);
    setChatInput("");
    toast.success("Question sent to chat!");
  };

  const summarizeDocument = () => {
    if (!selectedFile) return;
    const message = `📄 Please summarize this document: ${selectedFile.name}\n\n📝 Content:\n${selectedFile.content.slice(0, 2000)}`;
    onSendToChat?.(message);
    toast.success("Summary request sent to chat!");
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Documents</h1>
          <p className="text-zinc-400">Upload .txt files and chat with them</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={processing}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 hover:opacity-90 transition disabled:opacity-50"
              >
                {processing ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                Upload .txt File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <p className="text-xs text-zinc-500 text-center mt-2">
                Only plain text (.txt) files
              </p>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
              <h3 className="font-semibold mb-3">My Documents</h3>
              {files.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">
                  <FileText size={40} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No documents yet</p>
                  <p className="text-xs">Upload a .txt file</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition ${
                        selectedFile?.id === file.id
                          ? "bg-gradient-to-r from-violet-600/20 to-blue-500/20 border border-violet-500/30"
                          : "hover:bg-zinc-800"
                      }`}
                      onClick={() => setSelectedFile(file)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <File size={20} className="text-violet-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-zinc-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteFile(file.id); }}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {selectedFile ? (
              <>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText size={20} className="text-violet-400" />
                      <h3 className="font-semibold">{selectedFile.name}</h3>
                    </div>
                    <button
                      onClick={summarizeDocument}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 text-sm hover:bg-zinc-700 transition"
                    >
                      Summarize
                    </button>
                  </div>
                  <div className="bg-black/30 rounded-xl p-4 max-h-96 overflow-y-auto">
                    <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-mono">
                      {selectedFile.content.slice(0, 3000)}
                      {selectedFile.content.length > 3000 && (
                        <span className="text-zinc-500 block mt-2">... (truncated)</span>
                      )}
                    </pre>
                  </div>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <MessageSquare size={18} />
                    Ask about this document
                  </h3>
                  
                  <div className="flex gap-3">
                    <input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendToChat()}
                      placeholder={`Ask about "${selectedFile.name}"...`}
                      className="flex-1 h-[48px] rounded-xl bg-zinc-800 border border-zinc-700 px-4 outline-none focus:border-violet-500"
                    />
                    <button
                      onClick={sendToChat}
                      className="px-5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 hover:opacity-90 transition"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-12 text-center">
                <FileText size={64} className="mx-auto mb-4 text-zinc-600" />
                <h3 className="text-lg font-semibold mb-2">No document selected</h3>
                <p className="text-zinc-400">Upload a .txt file to view and chat with it</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}