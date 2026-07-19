export type AppMode = 'chat' | 'search' | 'math' | 'code' | 'document';

export interface Citation {
  title: string;
  url: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  mode?: AppMode;
  timestamp: string;
  citations?: Citation[];
  isBookmarked?: boolean;
  audioSource?: string; // base64 or blob URL of simulated/real speech narration
}

export interface ChatSession {
  id: string;
  title: string;
  mode: AppMode;
  messages: Message[];
  createdAt: string;
}

export interface SettingsState {
  voice: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
  temperature: number;
  userName: string;
  premiumTheme: 'indigo-violet' | 'emerald-teal' | 'amber-orange' | 'crimson-ruby';
}
