import { Shield, Zap, CheckCircle, Users, Shrink, Edit, Brain, Rocket } from 'lucide-react';

// ✅ Option A: .tsx extension with JSX
export const aiEnhancerOptions = [
    { id: 'professional', icon: <Shield size={16} />, label: 'Professional Tone', desc: 'Formal & polished' },
    { id: 'persuasive', icon: <Zap size={16} />, label: 'More Persuasive', desc: 'Compelling & convincing' },
    { id: 'ats', icon: <CheckCircle size={16} />, label: 'ATS Optimized', desc: 'Keyword-rich' },
    { id: 'formal', icon: <Shield size={16} />, label: 'More Formal', desc: 'Highly professional' },
    { id: 'human', icon: <Users size={16} />, label: 'More Human', desc: 'Warm & personal' },
    { id: 'shorten', icon: <Shrink size={16} />, label: 'Shorten Content', desc: 'Concise & focused' },
    { id: 'closing', icon: <CheckCircle size={16} />, label: 'Stronger Closing', desc: 'Powerful ending' },
    { id: 'grammar', icon: <Edit size={16} />, label: 'Fix Grammar', desc: 'Perfect clarity' },
];

export const aiProviderOptions = [
    { id: 'openrouter', label: 'OpenRouter (GPT-4o)', icon: <Brain size={14} /> },
    { id: 'groq', label: 'Groq (Llama 3.2)', icon: <Rocket size={14} /> },
];