// src/services/freeImageGen.ts
// ============================================
// FREE IMAGE GENERATOR - 100% FREE FOR USERS
// No payment required, just use the AI
// ============================================

declare global {
    interface Window {
        puter: any;
    }
}

let puterReady = false;

async function waitForPuter() {
    while (!window.puter) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    puterReady = true;
}

// Call this on app start
export async function initPuter() {
    await waitForPuter();
    console.log("✅ Puter ready for free image generation!");
}

// Daily limit per user (10 images free per day)
const IMAGE_LIMIT = 10;

function getDailyKey(userId: string): string {
    return `adin_free_img_${userId}`;
}

function getToday(): string {
    return new Date().toISOString().split('T')[0];
}

function getRemainingImages(userId: string): number {
    const key = getDailyKey(userId);
    const today = getToday();
    const stored = localStorage.getItem(key);
    
    if (!stored) return IMAGE_LIMIT;
    try {
        const data = JSON.parse(stored);
        if (data.date !== today) return IMAGE_LIMIT;
        return Math.max(0, IMAGE_LIMIT - (data.count || 0));
    } catch {
        return IMAGE_LIMIT;
    }
}

function incrementCount(userId: string): number {
    const key = getDailyKey(userId);
    const today = getToday();
    const currentCount = IMAGE_LIMIT - getRemainingImages(userId);
    const newCount = currentCount + 1;
    localStorage.setItem(key, JSON.stringify({ date: today, count: newCount }));
    return IMAGE_LIMIT - newCount;
}

export function getResetTime(): number {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const diffMs = tomorrow.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60));
}

// 🔥 FREE IMAGE GENERATION - No user payment
export async function generateFreeImage(
    prompt: string,
    userId: string
): Promise<{ imageUrl: string; remaining: number; resetHours: number }> {
    
    await waitForPuter();
    
    // Check daily limit
    const remaining = getRemainingImages(userId);
    if (remaining <= 0) {
        const resetHours = getResetTime();
        throw new Error(`Free limit reached (${IMAGE_LIMIT}/day). Try again in ${resetHours} hours.`);
    }
    
    try {
        // 🔥 Using free tier models via Puter
        const result = await window.puter.ai.txt2img(prompt, {
            model: 'rundiffusion/juggernaut-lightning-flux', // Best free quality model
            width: 1024,
            height: 1024
        });
        
        const imageUrl = result.src || URL.createObjectURL(result);
        const newRemaining = incrementCount(userId);
        const resetHours = getResetTime();
        
        return { imageUrl, remaining: newRemaining, resetHours };
        
    } catch (error) {
        console.error("Image generation error:", error);
        throw new Error("Failed to generate image. Please try again.");
    }
}

export function getUserImageStats(userId: string): { remaining: number; limit: number; resetHours: number } {
    return {
        remaining: getRemainingImages(userId),
        limit: IMAGE_LIMIT,
        resetHours: getResetTime()
    };
}