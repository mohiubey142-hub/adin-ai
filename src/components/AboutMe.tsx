import { useState, useEffect } from "react";
import { Save, Lock, Unlock, User, Users, Info, Trash2, Edit2 } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import toast from "react-hot-toast";

export default function AboutMe() {
  const { user } = useUser();
  const userId = user?.id || "anonymous";
  const [name, setName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [customInfo, setCustomInfo] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // Load data from localStorage
  const loadData = () => {
    if (userId === "anonymous") {
      setLoading(false);
      return;
    }

    const storageKey = `adin_aboutme_${userId}`;
    const saved = localStorage.getItem(storageKey);
    
    console.log("🔵 Loading from localStorage:", storageKey, saved);
    
    if (saved) {
      const data = JSON.parse(saved);
      setName(data.name || "");
      setFatherName(data.father_name || "");
      setCustomInfo(data.custom_info || "");
      
      const hasData = data.name || data.father_name || data.custom_info;
      setIsLocked(hasData);
    } else {
      setName("");
      setFatherName("");
      setCustomInfo("");
      setIsLocked(false);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  // Save data to localStorage
  const saveAll = () => {
    if (userId === "anonymous") {
      toast.error("Please sign in");
      return;
    }

    if (!name.trim() && !fatherName.trim() && !customInfo.trim()) {
      toast.error("Please enter at least one field");
      return;
    }

    setSaving(true);
    
    const storageKey = `adin_aboutme_${userId}`;
    const dataToSave = {
      name: name.trim(),
      father_name: fatherName.trim(),
      custom_info: customInfo.trim(),
    };
    
    localStorage.setItem(storageKey, JSON.stringify(dataToSave));
    console.log("💾 Saved to localStorage:", storageKey, dataToSave);
    
    toast.success("Information saved!");
    setIsLocked(true);
    setSaving(false);
  };

  const deleteField = (key: string) => {
    if (!confirm(`Delete this information?`)) return;
    
    const storageKey = `adin_aboutme_${userId}`;
    let dataToSave = { name, father_name: fatherName, custom_info: customInfo };
    
    if (key === "name") { setName(""); dataToSave.name = ""; }
    if (key === "father_name") { setFatherName(""); dataToSave.father_name = ""; }
    if (key === "custom_info") { setCustomInfo(""); dataToSave.custom_info = ""; }
    
    localStorage.setItem(storageKey, JSON.stringify(dataToSave));
    
    toast.success("Deleted");
    
    const hasRemaining = dataToSave.name || dataToSave.father_name || dataToSave.custom_info;
    setIsLocked(hasRemaining);
  };

  const startEdit = (key: string, value: string) => {
    if (isLocked) {
      toast.error("Page is locked. Click 'Unlock' first.");
      return;
    }
    setEditing(key);
    setEditValue(value);
  };

  const saveEdit = (key: string) => {
    if (!editValue.trim()) return;
    
    const storageKey = `adin_aboutme_${userId}`;
    let dataToSave = { name, father_name: fatherName, custom_info: customInfo };
    
    if (key === "name") { setName(editValue); dataToSave.name = editValue; }
    if (key === "father_name") { setFatherName(editValue); dataToSave.father_name = editValue; }
    if (key === "custom_info") { setCustomInfo(editValue); dataToSave.custom_info = editValue; }
    
    localStorage.setItem(storageKey, JSON.stringify(dataToSave));
    
    setEditing(null);
    toast.success("Updated");
    setIsLocked(true);
  };

  if (userId === "anonymous") {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center p-8">
          <Lock size={48} className="mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Sign in to save your data</h2>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const hasAnyData = name || fatherName || customInfo;

  const renderField = (
    key: string,
    label: string,
    icon: React.ReactNode,
    value: string,
    setValue: (v: string) => void,
    placeholder: string,
    isTextarea: boolean = false
  ) => (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-semibold text-white">{label}</h3>
        </div>
        {value && !isLocked && (
          <div className="flex gap-1">
            <button onClick={() => startEdit(key, value)} className="p-1 hover:bg-zinc-700 rounded">
              <Edit2 size={14} className="text-zinc-400" />
            </button>
            <button onClick={() => deleteField(key)} className="p-1 hover:bg-red-500/20 rounded">
              <Trash2 size={14} className="text-red-400" />
            </button>
          </div>
        )}
      </div>
      {editing === key ? (
        <div className="flex gap-2">
          {isTextarea ? (
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              rows={3}
              className="flex-1 px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 outline-none focus:border-violet-500"
              autoFocus
            />
          ) : (
            <input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 outline-none focus:border-violet-500"
              autoFocus
            />
          )}
          <button onClick={() => saveEdit(key)} className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700">Save</button>
          <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600">Cancel</button>
        </div>
      ) : isTextarea ? (
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 outline-none focus:border-violet-500 resize-none"
          disabled={isLocked}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 outline-none focus:border-violet-500"
          disabled={isLocked}
        />
      )}
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
            About Me
          </h1>
          {hasAnyData && (
            <button
              onClick={() => setIsLocked(!isLocked)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
                isLocked ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"
              }`}
            >
              {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
              {isLocked ? "Locked" : "Unlocked"}
            </button>
          )}
        </div>
        <p className="text-center text-zinc-500 mb-6">Tell me about yourself – I'll remember forever</p>

        {hasAnyData && (
          <div className={`rounded-xl p-3 mb-6 text-center ${
            isLocked ? "bg-yellow-500/10 border border-yellow-500/20" : "bg-green-500/10 border border-green-500/20"
          }`}>
            <p className="text-xs">
              {isLocked ? "🔒 Page is locked. Click 'Unlock' to edit." : "🔓 Page is unlocked. You can edit now."}
            </p>
          </div>
        )}

        {renderField("name", "Your Full Name", <User size={16} className="text-violet-400" />, name, setName, "e.g., David")}
        {renderField("father_name", "Father's Name", <Users size={16} className="text-emerald-400" />, fatherName, setFatherName, "e.g., David")}
        {renderField("custom_info", "Additional Info", <Info size={16} className="text-blue-400" />, customInfo, setCustomInfo, "e.g., I love coding...", true)}

        <button
          onClick={saveAll}
          disabled={saving}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 hover:opacity-90 transition font-medium disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save All Information"}
        </button>
      </div>
    </div>
  );
}