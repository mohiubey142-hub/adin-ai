// services/providers/groqProvider.ts
// ============================================
// GROQ PROVIDER — Fresh Keys + Circular Rotation + Queue
// ============================================
//
// ✅ Constructor takes FeatureKey (e.g. 'SUMMARY')
// ✅ Every generate() call fetches FRESH keys via getKeysForFeature()
// ✅ Queue-based concurrency control (max 10 concurrent)
// ✅ include_reasoning: false — GPT-OSS ke liye
// ✅ rotateNext() on success
// ============================================

import { AIProvider, AIOptions } from '../aiProvider';
import {
  FeatureKey,
  clearKeyCooldown,
  setKeyCooldown,
  rotateNext,
  getRotationIndex,
  getKeysForFeature,
} from './groqKeyManager';
import { enqueue } from '../../../../services/aiQueueService';

export class GroqProvider implements AIProvider {
  private feature: FeatureKey;
  private model: string;
  private fallbackModels: string[];
  private baseUrl: string = 'https://api.groq.com/openai/v1/chat/completions';
  private workingModel: string | null = null;

  constructor(
    feature: FeatureKey,
    model: string = 'openai/gpt-oss-120b'
  ) {
    this.feature = feature;
    this.model = model;
    this.fallbackModels = [
      'openai/gpt-oss-120b',
      'openai/gpt-oss-20b',
    ].filter((m) => m !== model);

    console.log(
      `✅ GroqProvider initialized for [${feature}] using model: ${this.model}`
    );
    console.log(`   Model fallbacks: ${this.fallbackModels.join(', ')}`);
  }

  private getModelsToTry(): string[] {
    if (this.workingModel) return [this.workingModel];
    return [this.model, ...this.fallbackModels];
  }

  // ============================================
  // Generate — queued + fresh keys per call
  // ============================================
  async generate(prompt: string, options?: AIOptions): Promise<string> {
    return enqueue(() => this.runGenerate(prompt, options));
  }

  private async runGenerate(
    prompt: string,
    options?: AIOptions
  ): Promise<string> {
    let lastError: Error | null = null;
    const modelsToTry = this.getModelsToTry();

    for (const model of modelsToTry) {
      const keys = getKeysForFeature(this.feature);

      if (keys.length === 0) {
        console.warn(
          `⚠️ No available keys for [${this.feature}] on model ${model} (all in cooldown?)`
        );
        lastError = new Error(
          `No available keys for [${this.feature}] (all in cooldown)`
        );
        continue;
      }

      console.log(
        `🔑 [${this.feature}] Trying ${keys.length} key(s): ${keys
          .map((k) => k.source)
          .join(' → ')}`
      );

      for (const { apiKey, source } of keys) {
        try {
          const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model,
              messages: [{ role: 'user', content: prompt }],
              temperature: options?.temperature ?? 0.7,
              max_tokens: options?.maxTokens ?? 4000,
              reasoning_effort: 'low',
              include_reasoning: false,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const usage = data.usage || {};
            const finishReason = data.choices?.[0]?.finish_reason;
            const reasoningTokens =
              usage.completion_tokens_details?.reasoning_tokens || 0;

            console.log(
              `📊 Groq [${source}] usage: prompt=${usage.prompt_tokens}, completion=${usage.completion_tokens}, reasoning=${reasoningTokens}, finish=${finishReason}`
            );

            if (finishReason === 'length') {
              console.warn(
                `⚠️ [${source}] hit token limit (finish_reason: length). Trying next key...`
              );
              lastError = new Error(
                `Token limit reached on [${source}] (${usage.completion_tokens} tokens)`
              );
              continue;
            }

            if (this.workingModel !== model) {
              this.workingModel = model;
              console.log(`✅ Groq working model locked: ${model}`);
            }

            clearKeyCooldown(source);

            const message = data.choices?.[0]?.message || {};
            const content = (message.content || '').trim();
            const contentWords = content.split(/\s+/).filter(Boolean).length;
            console.log(`📊 Groq [${source}] response: ${contentWords} words`);

            if (content) {
              console.log(
                `🔄 [groqProvider] Success on [${source}]. Rotation before: ${getRotationIndex()}`
              );
              rotateNext();
              console.log(
                `🔄 [groqProvider] Rotation after: ${getRotationIndex()}`
              );
              return content;
            }

            console.warn(`⚠️ [${source}] returned empty content`);
            lastError = new Error(`Groq [${source}] returned empty content`);
            continue;
          }

          if (response.status === 404) {
            console.warn(
              `⚠️ Model ${model} not available (404). Trying next model...`
            );
            lastError = new Error(`Model ${model} not found`);
            break;
          }

          if (response.status === 400) {
            const errorText = await response.text();
            console.warn(
              `⚠️ Model ${model} error (400). Trying next model...`
            );
            lastError = new Error(`Groq API model error: 400 - ${errorText}`);
            break;
          }

          if (response.status === 429) {
            const errorText = await response.text();
            console.warn(
              `⚠️ Groq key [${source}] rate limited (429). Cooldown 60s, trying next key...`
            );
            setKeyCooldown(source);
            lastError = new Error(`Groq [${source}] rate limit: ${errorText}`);
            continue;
          }

          if (response.status === 401 || response.status === 403) {
            const errorText = await response.text();
            console.warn(
              `⚠️ Groq key [${source}] invalid (${response.status}). Cooldown 60s, trying next key...`
            );
            setKeyCooldown(source);
            lastError = new Error(
              `Groq [${source}] invalid key (${response.status}): ${errorText}`
            );
            continue;
          }

          const errorText = await response.text();
          console.warn(
            `⚠️ Groq key [${source}] failed (${response.status}). Trying next key...`
          );
          lastError = new Error(
            `Groq [${source}] error ${response.status}: ${errorText}`
          );
          continue;
        } catch (error) {
          console.warn(`⚠️ Groq key [${source}] network error:`, error);
          lastError =
            error instanceof Error ? error : new Error(String(error));
          continue;
        }
      }
    }

    console.error('❌ All Groq keys and models failed');
    throw lastError || new Error('All Groq API keys and models failed');
  }

  async generateJSON<T>(prompt: string, schema?: any): Promise<T> {
    const jsonPrompt = `${prompt}\n\nRespond with valid JSON only. Do not include any other text.`;
    const result = await this.generate(jsonPrompt, { temperature: 0.3 });
    return JSON.parse(result);
  }
}