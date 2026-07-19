// src/utils/rateLimiter.ts
export class RateLimiter {
  private requests: number[] = [];
  
  canMakeRequest(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter(t => now - t < 60000);
    
    if (this.requests.length >= 25) { // 25 per key per minute
      return false;
    }
    
    this.requests.push(now);
    return true;
  }
}