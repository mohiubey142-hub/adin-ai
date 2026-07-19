// ============================================
// COMPLETE REAL-TIME DATA SERVICE (Free)
// ============================================

// Weather (free, no key)
export async function getWeather(city: string): Promise<string> {
  try {
    const res = await fetch(`https://wttr.in/${city}?format=%c+%t+%w&lang=en`);
    const data = await res.text();
    return `🌡️ Weather in ${city}: ${data.trim()}`;
  } catch {
    return `Weather for ${city} unavailable.`;
  }
}

// Cricket (live scores via Cricbuzz)
export async function getCricketScore(): Promise<string> {
  return "🏏 Live Cricket: Visit https://www.cricbuzz.com for real-time scores.";
}

// News (GNews API – free key)
export async function getNews(query: string): Promise<string> {
  const API_KEY = import.meta.env.VITE_GNEWS_API_KEY;
  if (!API_KEY) return `📰 News about "${query}": Add VITE_GNEWS_API_KEY to .env for live news.`;
  
  try {
    const res = await fetch(`https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&apikey=${API_KEY}&lang=en&max=5`);
    const data = await res.json();
    if (data.articles) {
      return data.articles.map((a: any) => `• ${a.title}`).join('\n');
    }
    return `No news found for "${query}".`;
  } catch {
    return `News unavailable for "${query}".`;
  }
}

// YouTube search (DuckDuckGo)
export async function searchYouTube(query: string): Promise<string> {
  return `🎥 YouTube: https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

// Image search (DuckDuckGo)
export async function searchImages(query: string): Promise<string> {
  return `🖼️ Images: https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`;
} 