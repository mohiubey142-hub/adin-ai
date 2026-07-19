// services/providers/groqProvider.ts
// ============================================
// GROQ PROVIDER
// ============================================

import { AIProvider, AIOptions } from '../aiProvider';

export class GroqProvider implements AIProvider {
    private apiKey: string;
    private model: string;
    private baseUrl: string = 'https://api.groq.com/openai/v1/chat/completions';

    constructor(apiKey: string, model: string = 'llama-3.2-90b-text-preview') {
        this.apiKey = apiKey;
        this.model = model;
    }

    async generate(prompt: string, options?: AIOptions): Promise<string> {
        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: this.model,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: options?.temperature || 0.7,
                max_tokens: options?.maxTokens || 500,
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Groq API error: ${response.status} - ${error}`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || '';
    }

    async generateJSON<T>(prompt: string, schema?: any): Promise<T> {
        const jsonPrompt = `${prompt}\n\nRespond with valid JSON only. Do not include any other text.`;
        const result = await this.generate(jsonPrompt, { temperature: 0.3 });
        return JSON.parse(result);
    }
}