import {
  MessageSquare,
  Search,
  Compass,
  Library,
  Globe,
  FileText,
  Settings,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";

const menuItems = [
  {
    name: "Chats",
    icon: <MessageSquare size={16} />,
  },
  {
    name: "Search",
    icon: <Search size={16} />,
  },
  {
    name: "Explore",
    icon: <Compass size={16} />,
  },
  {
    name: "Library",
    icon: <Library size={16} />,
  },
  {
    name: "Web Search",
    icon: <Globe size={16} />,
  },
  {
    name: "Documents",
    icon: <FileText size={16} />,
  },
  {
    name: "Settings",
    icon: <Settings size={16} />,
  },
];

interface SidebarProps {
  active: string;
  setActive: (value: string) => void;

  newChat: () => void;

  chatHistory: {
    id: number;
    title: string;
  }[];

  currentChatId: number | null;

  setCurrentChatId: (
    id: number
  ) => void;

  setMessages: (messages: any) => void;

  chatMessages: Record<
    number,
    {
      role: string;
      text: string;
    }[]
  >;

  editingChatId: number | null;

  setEditingChatId: (
    id: number | null
  ) => void;

  renameValue: string;

  setRenameValue: (
    value: string
  ) => void;

  saveRename: (
    id: number
  ) => void;

  deleteChat: (
    id: number
  ) => void;
}

const Sidebar = ({
  active,
  setActive,
  newChat,
  chatHistory,
  currentChatId,
  setCurrentChatId,
  setMessages,
  chatMessages,
  editingChatId,
  setEditingChatId,
  renameValue,
  setRenameValue,
  saveRename,
  deleteChat,
}: SidebarProps) => {
  return (
    <div className="w-[250px] border-r border-zinc-900 bg-black overflow-y-auto">

      {/* LOGO */}

      <div className="p-5 border-b border-zinc-900 sticky top-0 bg-black z-10">

        <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
          Adin AI
        </h1>

        <p className="text-zinc-500 text-xs mt-1">
          Next Generation Intelligence
        </p>

      </div>

      {/* NEW CHAT */}

      <div className="p-3">

        <button
          onClick={newChat}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-500"
        >
          <Plus size={16} />
          New Chat
        </button>

      </div>

      {/* MENU */}

      <div className="px-2">

        {menuItems.map((item) => {

          const isActive =
            active === item.name;

          return (
            <button
              key={item.name}
              onClick={() =>
                setActive(item.name)
              }
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm mb-1 transition ${
                isActive
                  ? "bg-zinc-800"
                  : "hover:bg-zinc-900"
              }`}
            >
              {item.icon}
              {item.name}
            </button>
          );

        })}

      </div>

      {/* HISTORY */}

      <div className="px-4 pt-5 pb-2 border-t border-zinc-900 mt-4">

        <h2 className="text-xs uppercase tracking-widest text-zinc-500">
          Recent Chats
        </h2>

      </div>

      <div className="px-2 pb-4 space-y-1">

        {chatHistory.map(
          (chat) => {

            const isCurrent =
              currentChatId ===
              chat.id;

            return (
              <div
                key={chat.id}
                className={`group rounded-xl ${
                  isCurrent
                    ? "bg-zinc-800"
                    : "hover:bg-zinc-900"
                }`}
              >

                <div className="flex items-center justify-between">

                  {editingChatId ===
                  chat.id ? (

                    <input
                      value={renameValue}
                      onChange={(e) =>
                        setRenameValue(
                          e.target.value
                        )
                      }
                      onBlur={() =>
                        saveRename(
                          chat.id
                        )
                      }
                      autoFocus
                      className="bg-transparent px-3 py-2 text-sm outline-none w-full"
                    />

                  ) : (

                    <button
                      onClick={() => {

                        setCurrentChatId(
                          chat.id
                        );

                        setMessages(
                          chatMessages[
                            chat.id
                          ] || []
                        );

                      }}
                      className="flex-1 text-left px-3 py-2 text-sm truncate"
                    >
                      {chat.title}
                    </button>

                  )}

                  <div className="hidden group-hover:flex items-center gap-1 pr-2">

                    <button
                      onClick={() => {

                        setEditingChatId(
                          chat.id
                        );

                        setRenameValue(
                          chat.title
                        );

                      }}
                      className="text-zinc-400 hover:text-white"
                    >
                      <Pencil size={14} />
                    </button>

                    <button
                      onClick={() =>
                        deleteChat(
                          chat.id
                        )
                      }
                      className="text-zinc-400 hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>

                  </div>

                </div>

              </div>
            );

          }
        )}

      </div>

    </div>
  );
};

