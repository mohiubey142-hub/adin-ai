// utils/config/providerConfig.ts
// ============================================
// AI PROVIDER CONFIGURATION
// ============================================

import { AIProviderManager } from '../../services/aiProvider';
import { OpenRouterProvider } from '../../services/providers/openRouterProvider';
import { GroqProvider } from '../../services/providers/groqProvider';

let aiInitialized = false;

export const initializeAI = () => {
    if (aiInitialized) return;
    
    try {
        const manager = AIProviderManager.getInstance();
        
        // OpenRouter API Key from .env.local
        const openRouterKey = import.meta.env?.VITE_OPENROUTER_API_KEY || '';
        if (openRouterKey) {
            manager.registerProvider('openrouter', new OpenRouterProvider(openRouterKey));
        }
        
        // Groq API Key from .env.local
        const groqKey = import.meta.env?.VITE_GROQ_API_KEY || '';
        if (groqKey) {
            manager.registerProvider('groq', new GroqProvider(groqKey));
        }
        
        aiInitialized = true;
        console.log('✅ AI Providers initialized');
    } catch (error) {
        console.error('❌ AI initialization failed:', error);
    }
};

export const isAIInitialized = (): boolean => {
    return aiInitialized;
};

export const resetAI = () => {
    aiInitialized = false;
};