// utils/config/providerConfig.ts
// ============================================
// AI PROVIDER CONFIGURATION — 5 SEPARATE KEYS
// ============================================
//
// ✅ Each feature has its own GroqProvider instance
// ✅ Provider receives FeatureKey (not keys array) — fresh fetch on generate
// ✅ Fallback order per feature (unchanged)
// ✅ Circular rotation handled by groqKeyManager + groqProvider
// ============================================

import { AIProviderManager } from '../../services/aiProvider';
import { OpenRouterProvider } from '../../services/providers/openRouterProvider';
import { GroqProvider } from '../../services/providers/groqProvider';
import {
  hasAnyKey,
  getConfiguredKeyCount,
} from '../../services/providers/groqKeyManager';

let aiInitialized = false;

export const initializeAI = () => {
  if (aiInitialized) return;

  try {
    const manager = AIProviderManager.getInstance();

    // ============================================
    // Log total configured keys
    // ============================================
    console.log('🔑 Total configured Groq keys:', getConfiguredKeyCount());

    if (!hasAnyKey()) {
      console.warn(
        '⚠️ No Groq keys configured. Check .env — GROQ_API_KEY_EXPERIENCE, _PROJECT, _ACHIEVEMENT, _COVER_LETTER, _SUMMARY'
      );
    }

    // ============================================
    // OpenRouter (optional — single key)
    // ============================================
    const openRouterKey = import.meta.env?.VITE_OPENROUTER_API_KEY || '';
    if (openRouterKey) {
      manager.registerProvider(
        'openrouter',
        new OpenRouterProvider(openRouterKey)
      );
      console.log('✅ OpenRouter provider registered');
    } else {
      console.warn('⚠️ VITE_OPENROUTER_API_KEY not found');
    }

    // ============================================
    // Groq — SUMMARY
    // ============================================
    manager.registerProvider(
      'groq-summary',
      new GroqProvider('SUMMARY')
    );
    console.log('✅ Groq (Summary) provider registered');

    // Legacy alias: 'groq' → 'groq-summary'
    manager.registerProvider(
      'groq',
      new GroqProvider('SUMMARY')
    );
    console.log('ℹ️ Legacy "groq" provider aliased to summary keys');

    // ============================================
    // Groq — EXPERIENCE
    // ============================================
    manager.registerProvider(
      'groq-experience',
      new GroqProvider('EXPERIENCE')
    );
    console.log('✅ Groq (Experience) provider registered');

    // ============================================
    // Groq — PROJECT
    // ============================================
    manager.registerProvider(
      'groq-project',
      new GroqProvider('PROJECT')
    );
    console.log('✅ Groq (Projects) provider registered');

    // ============================================
    // Groq — ACHIEVEMENT
    // ============================================
    manager.registerProvider(
      'groq-achievement',
      new GroqProvider('ACHIEVEMENT')
    );
    console.log('✅ Groq (Achievements) provider registered');

    // ============================================
    // Groq — COVER LETTER
    // ============================================
    manager.registerProvider(
      'groq-cover-letter',
      new GroqProvider('COVER_LETTER')
    );
    console.log('✅ Groq (Cover Letter) provider registered');

    // ============================================
    // Default provider
    // ============================================
    manager.setDefaultProvider('groq-experience');

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