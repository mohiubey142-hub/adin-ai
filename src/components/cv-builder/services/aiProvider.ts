// services/aiProvider.ts
// ============================================
// AI PROVIDER - Main Interface (UPDATED)
// ============================================

export interface AIOptions {
    temperature?: number;
    maxTokens?: number;
    retryCount?: number;
    timeout?: number;
}

export interface AIProvider {
    generate(prompt: string, options?: AIOptions): Promise<string>;
    generateJSON<T>(prompt: string, schema?: any): Promise<T>;
}

export class AIProviderManager {
    private static instance: AIProviderManager;
    private providers: Map<string, AIProvider> = new Map();
    private defaultProvider: string = 'openrouter';

    private constructor() {}

    static getInstance(): AIProviderManager {
        if (!AIProviderManager.instance) {
            AIProviderManager.instance = new AIProviderManager();
        }
        return AIProviderManager.instance;
    }

    registerProvider(name: string, provider: AIProvider): void {
        this.providers.set(name, provider);
    }

    setDefaultProvider(name: string): void {
        if (this.providers.has(name)) {
            this.defaultProvider = name;
        }
    }

    getDefaultProvider(): string {
        return this.defaultProvider;
    }

    getProviders(): string[] {
        return Array.from(this.providers.keys());
    }

    async generate(
        prompt: string,
        providerName?: string,
        options?: AIOptions
    ): Promise<string> {
        const name = providerName || this.defaultProvider;
        const provider = this.providers.get(name);
        
        if (!provider) {
            throw new Error(`Provider "${name}" not found`);
        }

        const finalOptions: AIOptions = {
            temperature: 0.7,
            maxTokens: 500,
            retryCount: 3,
            timeout: 30000,
            ...options
        };

        let lastError: Error | null = null;
        
        // ✅ FIX: Try primary provider with retries
        for (let attempt = 1; attempt <= (finalOptions.retryCount || 3); attempt++) {
            try {
                const timeoutPromise = new Promise<never>((_, reject) => {
                    setTimeout(() => reject(new Error('Request timeout')), finalOptions.timeout || 30000);
                });
                
                const generatePromise = provider.generate(prompt, finalOptions);
                const result = await Promise.race([generatePromise, timeoutPromise]);
                return result;
            } catch (error) {
                lastError = error as Error;
                
                // ✅ FIX: Check if it's a 402 (insufficient credits) error
                const errorMessage = error instanceof Error ? error.message : String(error);
                const is402Error = errorMessage.includes('402') || errorMessage.includes('insufficient');
                
                // ✅ FIX: If 402 error and provider is openrouter, try Groq fallback
                if (is402Error && name === 'openrouter' && this.providers.has('groq')) {
                    console.warn('⚠️ OpenRouter credits insufficient. Falling back to Groq...');
                    
                    try {
                        const groqProvider = this.providers.get('groq');
                        if (groqProvider) {
                            // Try Groq with same options
                            const groqResult = await groqProvider.generate(prompt, {
                                ...finalOptions,
                                maxTokens: Math.min(finalOptions.maxTokens || 500, 300) // Groq can handle less
                            });
                            return groqResult;
                        }
                    } catch (groqError) {
                        console.error('❌ Groq fallback also failed:', groqError);
                        // Continue to retry logic
                    }
                }
                
                if (attempt < (finalOptions.retryCount || 3)) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                }
            }
        }

        // ✅ FIX: User-friendly error message for 402 errors
        if (lastError) {
            const errorMessage = lastError.message || String(lastError);
            if (errorMessage.includes('402') || errorMessage.includes('insufficient')) {
                throw new Error(
                    '💳 OpenRouter credits are insufficient. Please recharge your OpenRouter account or reduce token usage.\n' +
                    'ℹ️ Alternatively, add Groq API key as a fallback provider.\n' +
                    '🔗 Visit: https://openrouter.ai/settings/credits'
                );
            }
        }

        throw lastError || new Error('All retry attempts failed');
    }

    async generateJSON<T>(
        prompt: string,
        providerName?: string,
        options?: AIOptions
    ): Promise<T> {
        const result = await this.generate(prompt, providerName, options);
        try {
            return JSON.parse(result);
        } catch {
            throw new Error('Invalid JSON response from AI');
        }
    }
}