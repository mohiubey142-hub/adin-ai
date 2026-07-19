import { AppMode } from "./types";

export interface PromptPreset {
  id: string;
  title: string;
  subtitle: string;
  prompt: string;
  mode: AppMode;
}

export const PROMPT_PRESETS: PromptPreset[] = [
  {
    id: "preset-research",
    title: "Quantum Physics",
    subtitle: "Concept deep-dive",
    prompt: "Explain quantum mechanics and entanglement to a 10 year old using simple analogies, and describe how quantum computing leverages them.",
    mode: "search"
  },
  {
    id: "preset-writing",
    title: "Premium Copywriting",
    subtitle: "Creative text draft",
    prompt: "Write a high-converting, intellectually elegant product launch copy for 'Aura Sphere', a sleek premium focus soundscape device. Highlight negative space, minimal design, and mental rejuvenation.",
    mode: "chat"
  },
  {
    id: "preset-coding",
    title: "React custom hooks",
    subtitle: "Clean code structure",
    prompt: "Write a custom React hook `useLocalStorage` in TypeScript that synchronizes state with local storage, handles serialization/deserialization details, supports custom change events across tabs, and includes clean JSDoc comments.",
    mode: "code"
  },
  {
    id: "preset-math",
    title: "Vandermonde Matrix",
    subtitle: "Symmetry solver",
    prompt: "Derive the formula for the determinant of a 3x3 Vandermonde Matrix. Show the full proof and express the result in terms of linear products of differences.",
    mode: "math"
  }
];

export interface AgentCard {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  mode: AppMode;
  iconName: string;
}

export const AGENT_CARDS: AgentCard[] = [
  {
    id: "agent-assistant",
    name: "General Intelligence",
    description: "Multi-disciplinary synthetic intelligence engine suitable for general cognitive solutions.",
    capabilities: ["Prose structuring", "Synthesizing research", "Refining vocabulary"],
    mode: "chat",
    iconName: "Sparkles"
  },
  {
    id: "agent-search",
    name: "Web Grounded Search",
    description: "Real-time search engine grounded with live Google Search index citations and indexations.",
    capabilities: ["Live indexing", "Source references", "Recent news syntheses"],
    mode: "search",
    iconName: "Globe"
  },
  {
    id: "agent-math",
    name: "Elite Math Solver",
    description: "Highly academic reasoning solver designed to derive formulas and break down equations.",
    capabilities: ["Formula proofs", "Derivative explanations", "Complex algebra"],
    mode: "math",
    iconName: "Calculator"
  },
  {
    id: "agent-code",
    name: "Oracle Developer Companion",
    description: "DevOPS specialist compiler that crafts optimized functions, comments, and structure diagrams.",
    capabilities: ["Custom hook compiler", "Complexity analyses", "Bugs refractioning"],
    mode: "code",
    iconName: "Code2"
  }
];
