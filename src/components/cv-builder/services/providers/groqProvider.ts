// src/components/cv-builder/services/providers/groqProvider.ts
// ============================================
// GROQ PROVIDER — Backend Proxy Version
// ============================================
// ✅ Browser se direct Groq call NAHI hoti
// ✅ Backend /api/ai/generate call hota hai
// ✅ Keys server-side rehti hain (secure)
// ✅ Server handles fallback + cooldown
// ============================================

import { AIProvider, AIOptions } from '../aiProvider';
import { FeatureKey } from './groqKeyManager';
import { enqueue } from '../../../../services/aiQueueService';

export class GroqProvider implements AIProvider {
  private feature: FeatureKey;
  private model: string;

  constructor(
    feature: FeatureKey,
    model: string = 'openai/gpt-oss-120b'
  ) {
    this.feature = feature;
    this.model = model;

    console.log(
      `✅ GroqProvider initialized for [${feature}] using model: ${this.model}`
    );
    console.log(`   Mode: BACKEND PROXY (server-side keys)`);
  }

  async generate(prompt: string, options?: AIOptions): Promise<string> {
    return enqueue(() => this.runGenerate(prompt, options));
  }

  private async runGenerate(
    prompt: string,
    options?: AIOptions
  ): Promise<string> {
    console.log(`📤 [${this.feature}] Sending to /api/ai/generate`);

    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        feature: this.feature,
        prompt,
        options: {
          temperature: options?.temperature ?? 0.7,
          maxTokens: options?.maxTokens ?? 4000,
        },
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg =
        err?.error ||
        `Backend proxy failed: HTTP ${res.status}`;
      console.error(`❌ [${this.feature}] ${msg}`, err?.details || '');
      throw new Error(msg);
    }

    const data = await res.json();
    if (!data?.ok || !data?.text) {
      throw new Error(data?.error || 'Backend returned no text');
    }

    const words = data.text.split(/\s+/).filter(Boolean).length;
    console.log(
      `✅ [${this.feature}] Success via [${data.source}/${data.model}] — ${words} words`
    );

    return data.text;
  }

  async generateJSON<T>(prompt: string, _schema?: any): Promise<T> {
    const jsonPrompt = `${prompt}\n\nRespond with valid JSON only. Do not include any other text.`;
    const result = await this.generate(jsonPrompt, { temperature: 0.3 });
    return JSON.parse(result);
  }
}