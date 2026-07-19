// ============================================
// ADIN AI - GEMINI 2.5 FLASH + CODING MENTOR
// COMPLETE CODING ASSISTANT + TEACHER + MENTOR
// ============================================

import { createClient } from '@supabase/supabase-js';

// ============================================
// SUPABASE INITIALIZATION (Optional - for caching)
// ============================================
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// ============================================
// API KEYS FROM .ENV
// ============================================
const GEMINI_KEYS = [
  import.meta.env.VITE_GEMINI_API_KEY_1,
  import.meta.env.VITE_GEMINI_API_KEY_2,
  import.meta.env.VITE_GEMINI_API_KEY_3,
  import.meta.env.VITE_GEMINI_API_KEY_4,
].filter(Boolean);

const GROQ_KEYS = [
  import.meta.env.VITE_GROQ_API_KEY_1,
  import.meta.env.VITE_GROQ_API_KEY_2,
  import.meta.env.VITE_GROQ_API_KEY_3,
].filter(Boolean);

const OPENROUTER_KEYS = [
  import.meta.env.VITE_OPENROUTER_API_KEY_1,
  import.meta.env.VITE_OPENROUTER_API_KEY_2,
  import.meta.env.VITE_OPENROUTER_API_KEY_3,
].filter(Boolean);

let geminiIndex = 0, groqIndex = 0, openrouterIndex = 0;

// ============================================
// 1. LIVE DATE & TIME (No API Key Needed)
// ============================================
async function getLiveDateTime(query: string): Promise<string> {
  try {
    let timezone = "Asia/Karachi";
    let city = "Pakistan";
    
    const q = query.toLowerCase();
    if (q.includes("london") || q.includes("uk")) { timezone = "Europe/London"; city = "London, UK"; }
    else if (q.includes("new york") || q.includes("usa")) { timezone = "America/New_York"; city = "New York, USA"; }
    else if (q.includes("dubai") || q.includes("uae")) { timezone = "Asia/Dubai"; city = "Dubai, UAE"; }
    else if (q.includes("india") || q.includes("delhi")) { timezone = "Asia/Kolkata"; city = "Delhi, India"; }
    else if (q.includes("lahore")) { timezone = "Asia/Karachi"; city = "Lahore, Pakistan"; }
    else if (q.includes("karachi")) { timezone = "Asia/Karachi"; city = "Karachi, Pakistan"; }
    else if (q.includes("islamabad")) { timezone = "Asia/Karachi"; city = "Islamabad, Pakistan"; }
    
    if (supabase) {
      const { data: cached } = await supabase
        .from('live_data')
        .select('result')
        .eq('source', 'datetime')
        .eq('query', timezone)
        .gte('expires_at', new Date().toISOString())
        .single();
      if (cached) return cached.result;
    }
    
    const response = await fetch(`https://timeapi.io/api/timezone/zone?timeZone=${timezone}`);
    const data = await response.json();
    
    if (data && data.currentDateTime) {
      const result = `🌍 **LIVE DATE & TIME - ${city.toUpperCase()}

📅 **Date:** ${data.currentDateTime.split('T')[0]}
⏰ **Time:** ${data.currentDateTime.split('T')[1]?.split('.')[0]}
🕐 **Day:** ${data.dayOfWeek}
📍 **Timezone:** ${timezone}
🔗 **Source:** Atomic Clock (Real-time)`;
      
      if (supabase) {
        await supabase.from('live_data').insert({
          source: 'datetime',
          query: timezone,
          result: result,
          expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
        });
      }
      return result;
    }
    
    const fallbackRes = await fetch(`https://worldtimeapi.org/api/timezone/${timezone}`);
    const fallbackData = await fallbackRes.json();
    if (fallbackData && fallbackData.datetime) {
      return `🌍 **LIVE DATE & TIME - ${city.toUpperCase()}

📅 Date: ${fallbackData.datetime.split('T')[0]}
⏰ Time: ${fallbackData.datetime.split('T')[1]?.split('.')[0]}
📍 Timezone: ${fallbackData.timezone}`;
    }
    return "";
  } catch (error) {
    console.log("Time API error:", error);
    return "";
  }
}

// ============================================
// 2. LIVE WEATHER (No API Key - Open-Meteo)
// ============================================
async function getLiveWeather(query: string): Promise<string> {
  try {
    const cityCoords: Record<string, {lat: number, lon: number}> = {
      karachi: {lat: 24.8607, lon: 67.0011},
      lahore: {lat: 31.5497, lon: 74.3436},
      islamabad: {lat: 33.6844, lon: 73.0479},
      london: {lat: 51.5074, lon: -0.1278},
      dubai: {lat: 25.2048, lon: 55.2708},
      newyork: {lat: 40.7128, lon: -74.0060},
      tokyo: {lat: 35.6762, lon: 139.6503},
    };
    
    let city = "karachi";
    const q = query.toLowerCase();
    if (q.includes("lahore")) city = "lahore";
    else if (q.includes("islamabad")) city = "islamabad";
    else if (q.includes("london")) city = "london";
    else if (q.includes("dubai")) city = "dubai";
    else if (q.includes("new york")) city = "newyork";
    else if (q.includes("tokyo")) city = "tokyo";
    
    const coords = cityCoords[city] || cityCoords.karachi;
    const displayCity = city.charAt(0).toUpperCase() + city.slice(1);
    
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true`
    );
    const data = await response.json();
    
    if (data.current_weather) {
      return `🌤️ **LIVE WEATHER - ${displayCity.toUpperCase()}

🌡️ **Temperature:** ${data.current_weather.temperature}°C
💨 **Wind Speed:** ${data.current_weather.windspeed} km/h
🔄 **Condition:** ${getWeatherDesc(data.current_weather.weathercode)}

📡 **Source:** Open-Meteo (Real-time)
📈 **Updated:** ${new Date().toLocaleString()}`;
    }
    return "";
  } catch (error) {
    return "";
  }
}

function getWeatherDesc(code: number): string {
  const conditions: Record<number, string> = {
    0: "☀️ Clear sky",
    1: "🌤️ Mainly clear",
    2: "⛅ Partly cloudy",
    3: "☁️ Overcast",
    45: "🌫️ Foggy",
    51: "🌧️ Light drizzle",
    61: "🌧️ Rain",
    71: "❄️ Snow",
  };
  return conditions[code] || "🌡️ Moderate";
}

// ============================================
// 3. LIVE CRYPTO PRICE (No API Key - CoinGecko)
// ============================================
async function getLiveCrypto(coin: string): Promise<string> {
  try {
    const coinMap: Record<string, string> = {
      bitcoin: 'bitcoin', btc: 'bitcoin',
      ethereum: 'ethereum', eth: 'ethereum',
      dogecoin: 'dogecoin', doge: 'dogecoin',
      solana: 'solana', sol: 'solana',
    };
    
    const coinId = coinMap[coin.toLowerCase()] || 'bitcoin';
    const displayCoin = coin.charAt(0).toUpperCase() + coin.slice(1);
    
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`
    );
    const data = await response.json();
    
    if (data[coinId]) {
      return `🪙 **LIVE ${displayCoin.toUpperCase()} PRICE

💵 **USD:** $${data[coinId].usd?.toLocaleString()}
📈 **24h Change:** ${data[coinId].usd_24h_change?.toFixed(2) || 'N/A'}%

📡 **Source:** CoinGecko (Real-time)`;
    }
    return "";
  } catch (error) {
    return "";
  }
}

// ============================================
// 4. LIVE DOLLAR RATE (No API Key)
// ============================================
async function getLiveDollarRate(): Promise<string> {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();
    
    if (data.rates) {
      return `💵 **LIVE USD EXCHANGE RATES

🇺🇸 **1 USD = ₨${data.rates.PKR?.toFixed(2)} PKR**
🇪🇺 **1 USD = €${data.rates.EUR?.toFixed(2)} EUR**
🇬🇧 **1 USD = £${data.rates.GBP?.toFixed(2)} GBP**
🇮🇳 **1 USD = ₹${data.rates.INR?.toFixed(2)} INR**

📡 **Source:** ExchangeRate-API (Real-time)`;
    }
    return "";
  } catch (error) {
    return "";
  }
}

// ============================================
// 5. LIVE GOLD RATE (No API Key)
// ============================================
async function getLiveGoldRate(): Promise<string> {
  try {
    const response = await fetch('https://api.gold-api.com/price/XAU');
    const data = await response.json();
    
    if (data && data.price) {
      return `💰 **LIVE GOLD RATE

🟡 **Gold (per ounce):** $${data.price.toLocaleString()} USD
🟢 **Silver (per ounce):** $${(data.price / 80).toFixed(2)} USD

🇵🇰 **Gold in PKR:** ₨${(data.price * 278).toLocaleString()} (approx)`;
    }
    return "";
  } catch (error) {
    return "";
  }
}

// ============================================
// 6. LIVE NEWS (RSS Fallback - No Key Needed)
// ============================================
async function getLiveNews(): Promise<string> {
  try {
    const GNEWS_API_KEY = import.meta.env.VITE_GNEWS_API_KEY;
    if (GNEWS_API_KEY) {
      const response = await fetch(
        `https://gnews.io/api/v4/top-headlines?category=general&lang=en&country=pk&max=5&apikey=${GNEWS_API_KEY}`
      );
      const data = await response.json();
      
      if (data.articles?.length) {
        let newsText = `📰 **LIVE NEWS HEADLINES (PAKISTAN)**\n\n`;
        for (const article of data.articles.slice(0, 5)) {
          newsText += `**${article.title}**\n🔗 ${article.url}\n\n`;
        }
        return newsText;
      }
    }
    
    const rssRes = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://www.dawn.com/feeds/latest');
    const rssData = await rssRes.json();
    
    if (rssData.items?.length) {
      let newsText = `📰 **LIVE NEWS (DAWN - PAKISTAN)**\n\n`;
      for (const item of rssData.items.slice(0, 5)) {
        newsText += `**${item.title}**\n🔗 ${item.link}\n\n`;
      }
      return newsText;
    }
    return "";
  } catch (error) {
    return "";
  }
}

// ============================================
// 7. MAIN LIVE SEARCH FUNCTION
// ============================================
async function liveDataSearch(query: string): Promise<string> {
  if (!query || query.length < 3) return "";
  
  console.log("🔍 Live Data Search:", query);
  const lowerQuery = query.toLowerCase();
  let results = "";
  
  if (/(date|time|aaj ki date|today date|kya date hai|aaj ka din|current time)/i.test(lowerQuery)) {
    const timeResult = await getLiveDateTime(query);
    if (timeResult) results += timeResult + "\n\n";
  }
  
  if (/(weather|mausam|temperature|barish|garmi|thand|mausam kaisa)/i.test(lowerQuery)) {
    const weatherResult = await getLiveWeather(query);
    if (weatherResult) results += weatherResult + "\n\n";
  }
  
  if (/(bitcoin|btc|crypto|ethereum|eth|dogecoin|doge|solana)/i.test(lowerQuery)) {
    let coin = "Bitcoin";
    if (lowerQuery.includes('eth')) coin = "Ethereum";
    else if (lowerQuery.includes('doge')) coin = "Dogecoin";
    else if (lowerQuery.includes('sol')) coin = "Solana";
    const cryptoResult = await getLiveCrypto(coin);
    if (cryptoResult) results += cryptoResult + "\n\n";
  }
  
  if (/(dollar|usd|pkr rate|currency rate|dollar rate)/i.test(lowerQuery)) {
    const dollarResult = await getLiveDollarRate();
    if (dollarResult) results += dollarResult + "\n\n";
  }
  
  if (/(gold|sona|sone ka rate|gold price)/i.test(lowerQuery)) {
    const goldResult = await getLiveGoldRate();
    if (goldResult) results += goldResult + "\n\n";
  }
  
  if (/(news|khabar|headlines|latest news|breaking|aaj ki khabar)/i.test(lowerQuery)) {
    const newsResult = await getLiveNews();
    if (newsResult) results += newsResult + "\n\n";
  }
  
  if (results) {
    results = `🌐 **LIVE DATA** (Real-time from external APIs)

${results}

⚠️ ALL DATA IS REAL-TIME! Use this information to answer. Include ALL LINKS in your response.`;
  }
  
  return results;
}

// ============================================
// ============================================
// 🚀 CODING MENTOR - COMPLETE FEATURES
// ============================================
// ============================================

// Check if user is asking for level/goal (first time interaction)
function isFirstTimeInteraction(userId: string): boolean {
  const history = getConversationHistory(userId);
  return history.length < 3;
}

function detectCodingFeature(query: string): string | null {
  const lower = query.toLowerCase();
  
  // Level detection
  if (/(beginner|new to coding|no experience|learning coding|where do i start)/i.test(lower)) {
    return "level_beginner";
  }
  if (/(intermediate|know basics|some experience|react knowledge)/i.test(lower)) {
    return "level_intermediate";
  }
  if (/(advanced|expert|senior|professional|experienced)/i.test(lower)) {
    return "level_advanced";
  }
  
  // Goal detection
  if (/(job|get hired|placement|career|job ready|job preparation)/i.test(lower)) {
    return "goal_job";
  }
  if (/(freelance|freelancing|fiverr|upwork|earn money|client)/i.test(lower)) {
    return "goal_freelancing";
  }
  if (/(startup|build product|saas|launch|business)/i.test(lower)) {
    return "goal_startup";
  }
  if (/(learn|learning|upskill|improve skills|growth)/i.test(lower)) {
    return "goal_learning";
  }
  if (/(ai development|ai developer|machine learning|ml engineer)/i.test(lower)) {
    return "goal_ai";
  }
  
  // Code Generation
  if (/(generate|create|write|build|make)\s+(code|react|component|function|api|page)/i.test(lower)) {
    return "code_generation";
  }
  
  // Debugging
  if (/(debug|fix|error|bug|issue|problem|not working|debug code)/i.test(lower)) {
    return "debugging";
  }
  
  // Code Explanation
  if (/(explain|what does|how does|understand|break down|explain code)/i.test(lower)) {
    return "explanation";
  }
  
  // Refactoring
  if (/(refactor|improve|clean|better|optimize code|code quality)/i.test(lower)) {
    return "refactoring";
  }
  
  // Security Review
  if (/(security|vulnerability|hack|sql injection|xss|secure code|security review)/i.test(lower)) {
    return "security";
  }
  
  // Code Review
  if (/(code review|review my code|rate my code|code quality score)/i.test(lower)) {
    return "code_review";
  }
  
  // Project Builder
  if (/(project|build app|create app|full stack|application|build project)/i.test(lower)) {
    return "project_builder";
  }
  
  // Learning Mode
  if (/(learn|teach|tutorial|guide|course|lesson|learn coding)/i.test(lower)) {
    return "learning";
  }
  
  // Roadmaps
  if (/(roadmap|path|journey|become a developer|learning path)/i.test(lower)) {
    return "roadmap";
  }
  
  // Interview Prep
  if (/(interview|job interview|technical interview|question|interview prep)/i.test(lower)) {
    return "interview";
  }
  
  // Mock Interview
  if (/(mock interview|practice interview|simulate interview|mock test)/i.test(lower)) {
    return "mock_interview";
  }
  
  // Career Guidance
  if (/(career|job|salary|promotion|grow|career guidance)/i.test(lower)) {
    return "career";
  }
  
  // Freelancing
  if (/(freelance|fiverr|upwork|client|earn money|freelancing tips)/i.test(lower)) {
    return "freelancing";
  }
  
  // Portfolio Planning
  if (/(portfolio|showcase|projects|personal website|portfolio projects)/i.test(lower)) {
    return "portfolio";
  }
  
  // System Design
  if (/(system design|architecture|scalable|microservices|design system)/i.test(lower)) {
    return "system_design";
  }
  
  // Database Design
  if (/(database|schema|sql|mongodb|postgresql|design db|database design)/i.test(lower)) {
    return "database";
  }
  
  // API Design
  if (/(api|rest api|graphql|endpoint|backend|api design)/i.test(lower)) {
    return "api_design";
  }
  
  // DSA Teaching
  if (/(dsa|data structure|algorithm|array|linked list|tree|sort|search|leetcode)/i.test(lower)) {
    return "dsa";
  }
  
  // Git/GitHub Teaching
  if (/(git|github|commit|push|pull|branch|merge|clone|version control)/i.test(lower)) {
    return "git";
  }
  
  return null;
}

// Get personalized welcome based on user level and goal
function getPersonalizedWelcome(level: string | null, goal: string | null, userId: string): string {
  const savedLevel = localStorage.getItem(`user_level_${userId}`) || level;
  const savedGoal = localStorage.getItem(`user_goal_${userId}`) || goal;
  
  if (savedLevel && savedGoal) {
    return `Welcome back! I see you're a **${savedLevel}** developer aiming for **${savedGoal}**. 

How can I help you today? You can ask me to:
• Generate code for your project
• Debug an issue you're facing
• Explain a concept you don't understand
• Build a complete project step by step
• Prepare for interviews
• Guide your career path

What would you like to do? 🚀`;
  }
  
  if (savedLevel) {
    return `👋 I see you're a **${savedLevel}** level developer.

Now tell me your goal:
• 💼 Get a Job
• 💰 Freelancing
• 🚀 Build a Startup
• 📚 Learning & Growth
• 🤖 AI Development

Type your goal and I'll create your personalized roadmap! 🎯`;
  }
  
  return `🌟 **Welcome to Adin AI - Your Personal Coding Mentor!**

I'm here to help you become a professional developer. 

**First, tell me your coding level:**
• 🔰 **Beginner** - No coding experience
• ⚡ **Intermediate** - Know the basics
• 🚀 **Advanced** - Experienced developer

**Or just type your level (beginner/intermediate/advanced)**`;
}

function getCodingFeaturePrompt(feature: string, query: string, skillLevel: string = "intermediate", userId?: string): string {
  // Get saved user level and goal from localStorage if available
  const savedLevel = userId ? localStorage.getItem(`user_level_${userId}`) : null;
  const userLevel = savedLevel || skillLevel;
  
  const prompts: Record<string, string> = {
    level_beginner: `## 🎓 BEGINNER DEVELOPER DETECTED

Welcome to coding! I'll teach you like you're 15 years old.

First, tell me your goal:
• 💼 Get a Job
• 💰 Freelancing  
• 🚀 Build a Startup
• 📚 Learning & Growth
• 🤖 AI Development

Once you tell me your goal, I'll create:
1. A complete learning roadmap (weekly plan)
2. Best free resources for you
3. Practice exercises after each concept
4. Mini projects to build confidence
5. Timeline based on your daily hours

What's your goal? (Type job, freelancing, startup, learning, or ai development)`,
    
    level_intermediate: `## ⚡ INTERMEDIATE DEVELOPER DETECTED

You know the basics - now let's level you up!

Tell me your goal to get a personalized plan:
• 💼 Job (crack technical interviews)
• 💰 Freelancing (start earning)
• 🚀 Startup (build your product)
• 📚 Learning (master advanced topics)
• 🤖 AI Development (enter AI field)

I'll help you with:
• Advanced concepts with best practices
• Real-world projects for your portfolio
• Performance optimization techniques
• System design fundamentals
• Interview preparation

What's your goal?`,
    
    level_advanced: `## 🚀 ADVANCED/SENIOR DEVELOPER DETECTED

Welcome! Let's dive deep into advanced topics.

What would you like to explore?
• 🏗️ System Design & Architecture
• ⚡ Performance Optimization
• 🔒 Security Deep Dive
• 🎯 Technical Leadership
• 🤖 AI/ML Engineering

Or tell me your goal:
• FAANG Interview Prep
• Technical Lead Path
• Startup CTO Skills
• Cloud Architecture

What's your focus area?`,
    
    goal_job: `## 💼 JOB PREPARATION MODE

Great! Let's get you job-ready.

I'll help you with:
1. Technical Skills Roadmap (3-6 months)
2. Interview Questions (100+ with answers)
3. Coding Challenges (LeetCode patterns)
4. System Design (for senior roles)
5. Resume Optimization (ATS-friendly)
6. Portfolio Projects (stand out)
7. Mock Interviews (practice with me)

First, tell me:
• What role? (Frontend, Backend, Full Stack, AI/ML)
• Target companies? (FAANG, Startup, Remote)
• Timeline? (1 month, 3 months, 6 months)

Type your answers and I'll create your personalized job prep plan!`,
    
    goal_freelancing: `## 💰 FREELANCING MODE

Ready to earn money with coding!

I'll teach you:
1. Platform Setup (Fiverr, Upwork, Freelancer)
2. Profile Optimization (get first client)
3. Pricing Strategy (how much to charge)
4. Proposal Templates (win projects)
5. Skills to Learn (high demand)
6. Client Management (get repeat business)
7. Payment Protection (avoid scams)

What type of freelancing?
• Web Development
• Mobile Apps
• AI Solutions
• Automation Scripts
• WordPress/CMS

Tell me your interest and I'll create your freelancing roadmap!`,
    
    goal_startup: `## 🚀 STARTUP BUILDER MODE

Building your own product? Let's make it happen!

I'll help you with:
1. Idea Validation (is it worth building?)
2. Tech Stack Selection (best tools for MVP)
3. Architecture Design (scalable from day 1)
4. MVP Development (launch fast)
5. Cost Optimization (save money)
6. Growth Strategies (get users)
7. Funding Options (if needed)

Tell me about your startup idea and I'll guide you through building it!`,
    
    goal_learning: `## 📚 LEARNING MODE

Lifelong learning - that's the spirit!

I can teach you:
• Web Development (HTML to React/Next.js)
• Backend Development (Node.js, Python, Databases)
• Mobile Development (React Native)
• Data Structures & Algorithms (crack interviews)
• System Design (scale like Google)
• DevOps (Docker, Kubernetes, Cloud)

What do you want to learn? Be specific and I'll create your learning path!`,
    
    goal_ai: `## 🤖 AI DEVELOPMENT MODE

Welcome to the future of technology!

I'll guide you through:
1. Python for AI (numpy, pandas)
2. Machine Learning (scikit-learn)
3. Deep Learning (TensorFlow, PyTorch)
4. LLMs & GPT (OpenAI API, LangChain)
5. AI Agents (autonomous systems)
6. Computer Vision (image recognition)
7. NLP (text processing)

What's your AI goal?
• Build AI chatbots
• Create AI tools
• Data science career
• Research & Development

Tell me and let's start!`,
    
    code_generation: `## 💻 CODE GENERATION REQUEST

Generate production-ready ${userLevel}-level code for: "${query}"

Requirements:
- Complete, runnable code with imports
- Error handling included
- TypeScript types (if applicable)
- JSDoc comments for each function
- Example usage with sample data
- Performance considerations
- Edge cases handled

Format:
1. Problem Analysis - What needs to be built
2. Solution Architecture - How it will work  
3. Complete Code - With proper formatting
4. Line-by-Line Explanation - For ${userLevel} level
5. Best Practices - 3-5 specific tips
6. Next Steps - How to improve or extend

Remember: Code must be copy-paste ready and actually work!`,
    
    debugging: `## 🔍 DEBUGGING REQUEST

Debug this code/issue: "${query}"

Analyze thoroughly:
1. Problem Identification - What exactly is wrong?
2. Root Cause Analysis - Why does it happen?
3. Fixed Code - The complete working solution
4. Explanation - Why the fix works (line by line if needed)
5. Prevention Tips - How to avoid this issue

For ${userLevel} level developer:
${userLevel === 'beginner' ? 'Use simple language, explain each concept' : userLevel === 'advanced' ? 'Focus on edge cases and performance implications' : 'Balance clarity with technical depth'}

Output format:
🔴 Problem: 
🔧 Root Cause:
✅ Fixed Code:
📝 Explanation:
🛡️ Prevention:`,

    explanation: `## 📖 CODE EXPLANATION REQUEST

Explain this code/concept: "${query}"

Target Level: ${userLevel}

Structure:
1. What does this do? (One sentence summary)
2. Simple Analogy (connect to daily life)
3. Line-by-Line Breakdown (every important line)
4. How It Works (flow and logic)
5. Key Concepts (terms explained simply)
6. Why This Approach? (alternatives and trade-offs)
7. Practice Task (small exercise to verify understanding)

${userLevel === 'beginner' ? 'Use chai-pani examples, no jargon' : userLevel === 'advanced' ? 'Discuss patterns and optimizations' : 'Balance simplicity with technical accuracy'}`,

    refactoring: `## ♻️ REFACTORING REQUEST

Refactor this code: "${query}"

Focus Areas for ${userLevel} level:
${userLevel === 'beginner' ? '• Readability and clear variable names\n• Removing duplicate code\n• Adding helpful comments' : userLevel === 'advanced' ? '• Design patterns implementation\n• Performance optimization (time & space)\n• SOLID principles application\n• Type safety improvements' : '• DRY principle\n• Single responsibility\n• Clean code practices'}

Provide:
- Before Code (original)
- After Code (refactored)
- Changes Made (list with explanations)
- Why Better (specific benefits)
- Performance Impact (before/after if applicable)`,

    security: `## 🔒 SECURITY REVIEW REQUEST

Review this code for security: "${query}"

Checklist (OWASP Top 10):
- SQL Injection
- XSS (Cross-Site Scripting)
- CSRF (Cross-Site Request Forgery)
- Broken Authentication
- Sensitive Data Exposure
- Path Traversal
- Security Misconfiguration

Output:
🛡️ Security Score: ___/100
🔴 Critical: (must fix immediately)
🟡 Medium: (should fix soon)
🟢 Low: (best practice)

For each issue:
• Description of vulnerability
• Code location (line if possible)
• How to exploit (if applicable)
• Fixed code version
• Prevention tip`,

    code_review: `## ⭐ CODE REVIEW REQUEST

Review this code: "${query}"

Rating Scale (1-10):
- Code Quality: __/10
- Readability: __/10
- Performance: __/10
- Security: __/10
- Maintainability: __/10

Provide:
- Overall Score: ___/100
- Strengths (2-3 things done well)
- Areas for Improvement (2-3 specific issues)
- Suggestions (with code examples)
- Priority (high/medium/low for each)

For ${userLevel} level developer:
${userLevel === 'beginner' ? 'Be encouraging, focus on learning opportunities' : 'Be direct, focus on professional standards'}`,

    project_builder: `## 🚀 PROJECT BUILDER

Build a complete project for: "${query}"

User Level: ${userLevel}

Complete Package:
1. Project Overview - What we're building, features
2. Tech Stack - Why these choices
3. Folder Structure - Complete tree with purpose of each folder
4. Step-by-Step Implementation
5. Complete Code - Every file with explanations
6. Environment Setup - Commands to copy-paste
7. Testing Strategy - How to verify it works
8. Deployment Guide - Free hosting options

Make it production-ready with error handling and best practices!`,

    learning: `## 🎓 LEARNING MODE

Teaching topic: "${query}"

Student Level: ${userLevel}

Lesson Structure:
1. Learning Objective - What you'll achieve
2. Prerequisites - What you should know first
3. Concept Explanation (with real-world analogy)
4. Code Examples (copy-paste ready, with comments)
5. Common Mistakes (with fixes)
6. Practice Exercises (3-5, increasing difficulty)
7. Mini Project (apply what you learned)
8. Quiz (5 questions to test understanding)
9. Next Topic recommendation

${userLevel === 'beginner' ? 'Be extra patient, use simple words, give lots of examples' : userLevel === 'advanced' ? 'Move fast, focus on depth and edge cases' : 'Balance clarity with technical depth'}`,

    roadmap: `## 🗺️ PERSONALIZED ROADMAP

Create roadmap for: "${query}"

Target Level: ${userLevel}

Detailed Plan:
- Month 1-2: Foundations
- Month 3-4: Core Skills
- Month 5-6: Advanced Topics
- Month 7-8: Projects

Resources:
- Free courses (with links)
- YouTube channels
- Practice platforms
- Books (free if available)

Weekly Schedule included.

Success Metrics: How to track progress`,

    interview: `## 🎯 INTERVIEW PREPARATION

Topic: "${query}"

Target Role: ${userLevel} Developer

Complete Package:
1. Common Questions (10-15 most likely)
2. Sample Answers (STAR method for behavioral)
3. Code Challenges (with solutions and explanations)
4. System Design Questions (if applicable)
5. Questions to Ask Interviewer
6. Salary Negotiation Tips
7. Follow-up Email Template

For each technical question:
• Question
• Solution approach
• Code (if applicable)
• Time/Space complexity
• Follow-up questions
• Common mistakes`,

    mock_interview: `## 🎭 MOCK INTERVIEW MODE

Role: ${userLevel} Developer
Topic: "${query}"

Simulate a real interview:

I will ask you 5 technical questions ONE BY ONE.
After each answer, I will:
• Give immediate feedback
• Point out what was good
• Suggest improvements
• Provide the model answer

At the end, I'll give you:
• Overall score (0-100)
• Strengths analysis
• Areas to improve
• Specific study recommendations

Ready? Here's your first question...`,

    career: `## 💼 CAREER GUIDANCE

Goal: "${query}"
Level: ${userLevel}

I'll provide:
1. Market Analysis - Current demand for your skills
2. Required Skills - What you need to learn
3. Salary Expectations for entry/mid/senior levels
4. Growth Path with timelines
5. Certifications - Worth getting?
6. Networking Tips - LinkedIn, GitHub, communities
7. Resume Optimization - Keywords that work
8. Company List - Where to apply`,

    freelancing: `## 💰 FREELANCING GUIDANCE

Topic: "${query}"

Complete Guide:
1. Platform Strategy (Fiverr, Upwork, Freelancer, Toptal)
2. Profile Optimization tips
3. Pricing Strategy and negotiation scripts
4. Proposal Template (copy-paste ready)
5. Client Communication best practices
6. Payment Protection methods

Want me to create a personalized freelancing plan for you?`,

    portfolio: `## 🎨 PORTFOLIO PLANNING

Build portfolio for: "${query}"
Level: ${userLevel}

Complete Guide:
1. Portfolio Website Structure
2. Must-Have Projects for ${userLevel} level
3. Project Descriptions Template
4. GitHub Profile Optimization
5. Live Demo Recommendations (Vercel, Netlify, Railway)

Want me to generate code for any of these projects?`,

    system_design: `## 🏗️ SYSTEM DESIGN GUIDE

Design system for: "${query}"
Level: ${userLevel}

Complete Analysis:
1. Requirements (functional and non-functional)
2. Capacity Estimation (traffic, storage, bandwidth)
3. High-Level Architecture4. Component Breakdown
5. Data Flow
6. Scalability Strategy
7. Potential Bottlenecks & Solutions

For ${userLevel} level: ${userLevel === 'advanced' ? 'Include microservices, event-driven patterns' : 'Focus on fundamentals, avoid over-engineering'}`,

    database: `## 🗄️ DATABASE DESIGN

Design database for: "${query}"

Complete Schema:
1. Requirements Analysis - What data to store
2. ER Diagram with relationships
3. Table Schemas with proper data types
4. Primary Keys and Foreign Keys
5. Indexes Strategy for performance
6. Sample Queries for common operations
7. Optimization Tips

Want me to generate the complete SQL/NoSQL schema?`,

    api_design: `## 🔌 API DESIGN

Design API for: "${query}"

Complete API Specification:
1. API Overview - Purpose and scope
2. Authentication (JWT, API Key, OAuth)
3. Base URL
4. Endpoints with methods
5. Request/Response Examples
6. Error Handling with status codes
7. Rate Limiting strategy
8. Pagination approach

Want me to generate OpenAPI/Swagger spec?`,

    dsa: `## 📚 DSA TEACHING

Topic: "${query}"
Level: ${userLevel}

Complete Lesson:
1. Concept Explanation (with real-world analogy)
2. Time & Space Complexity analysis
3. Implementation with complete working code
4. Visual Representation (ASCII diagram)
5. Common Operations with code
6. Practice Problems (easy, medium, hard)
7. Interview Tips and follow-up questions

Ready to practice? Let me give you a problem!`,

    git: `## 🔀 GIT & GITHUB TEACHING

Topic: "${query}"

Complete Guide:
1. Command with Examples
2. Best Practices (commit messages, branch naming)
3. Branching Strategies (Git Flow, GitHub Flow)
4. Common Workflows
5. Troubleshooting Common Errors
6. GitHub Actions Basics

Need help with a specific Git problem? Share the error!`
  };

  return prompts[feature] || prompts.learning;
}

// ============================================
// UPDATED SYSTEM PROMPT - COMPLETE CODING MENTOR
// ============================================
function getProfessionalSystemPrompt(
  userLanguage: string, 
  isEducational: boolean, 
  wordLimit: number,
  userText: string,
  liveContext: string,
  webEnabled: boolean,
  codingFeature: string | null,
  userSkillLevel: string = "intermediate",
  userId?: string
): string {
  
  // Get saved user preferences
  const savedLevel = userId ? localStorage.getItem(`user_level_${userId}`) : null;
  const savedGoal = userId ? localStorage.getItem(`user_goal_${userId}`) : null;
  const effectiveLevel = savedLevel || userSkillLevel;
  
  const languageInstruction = userLanguage === "Urdu" 
    ? "⚠️ Respond in PURE URDU script (اردو) with complete sentences and rich vocabulary."
    : userLanguage === "RomanUrdu"
    ? "⚠️ Respond in ROMAN URDU (English letters, Urdu words). Use 'bhai', 'yaar' naturally."
    : "⚠️ Respond in PROFESSIONAL ENGLISH. Be helpful, thorough, and engaging.";

  const liveInstruction = liveContext 
    ? `🌐 **LIVE DATA AVAILABLE - USE THIS EXACTLY:**

${liveContext}

⚠️ CRITICAL INSTRUCTIONS:
1. User asked for LIVE/REAL-TIME information
2. Use ONLY the data above
3. DO NOT say "I don't have live data" or "my knowledge cut-off is"
4. Include ALL links from the live data
5. If numbers are given, use them EXACTLY as shown`
    : (webEnabled 
        ? `🌐 Web search is ON but no results found. Tell user to be more specific.` 
        : `🌐 Web search is OFF. Ask user to turn ON the "Web ON" button.`);

  const codingInstruction = codingFeature 
    ? getCodingFeaturePrompt(codingFeature, userText, effectiveLevel, userId)
    : "";

  // If first time and no coding feature detected, ask for level
  const isFirstTime = userId && !savedLevel && !savedGoal && !codingFeature;
  const welcomeMessage = isFirstTime ? getPersonalizedWelcome(null, null, userId || "") : "";

  return `**🤖 You are ADIN AI - Professional Coding Mentor + Senior Developer + Career Coach**

Created by Ghulam Mohiyudin (David).

**🎯 YOUR CORE MISSION:**
You are a COMPLETE CODING TEACHER + MENTOR + PROJECT ARCHITECT + CAREER GUIDE.
You help everyone from absolute beginners to senior developers.

**📋 YOUR PERSONALITY:**
- Patient and encouraging with beginners
- Technical and precise with advanced developers
- Always explain the "WHY", not just the "HOW"
- Provide COMPLETE, RUNNABLE code
- Use real-world examples and analogies
- NEVER say "as an AI" or "I cannot"

**🎓 YOUR TEACHING METHOD:**
1. First, identify user's level (if not known)
2. Then, identify user's goal
3. Based on level + goal, provide personalized roadmap

**💻 YOUR CAPABILITIES:**
- Code Generation, Debugging, Explanation, Refactoring
- Security Review, Code Review
- Project Builder, Learning Mode, Roadmap Generation
- Interview Prep, Career Guidance, Freelancing Guide
- Portfolio Planning, System Design, Database Design
- API Design, DSA Teaching, Git/GitHub

**📋 RESPONSE QUALITY STANDARDS:**
1. LENGTH: ${wordLimit} words minimum
2. STRUCTURE: Use headings, bullet points, numbered lists
3. EXAMPLES: Always provide 2-3 practical examples
4. CODE: Always include complete, runnable code with comments

${languageInstruction}

${liveInstruction}

${welcomeMessage ? `\n**🎯 FIRST TIME USER - WELCOME MESSAGE:**\n${welcomeMessage}\n` : ""}

${codingInstruction ? `\n**🎯 CODING ASSISTANT MODE ACTIVE:**\n${codingInstruction}\n` : ""}

${savedLevel && savedGoal ? `\n**📌 USER CONTEXT (Remember this):**
- Level: ${savedLevel}
- Goal: ${savedGoal}

Tailor ALL responses to this user's level and goal.` : ""}

**🚫 NEVER DO:**
- One-line or short responses
- "As an AI model" or "I cannot"
- Incomplete code
- Technical jargon without explanation for beginners

**✅ ALWAYS DO:**
- Give complete, thorough, valuable answers
- Provide FULL code (imports, error handling, comments)
- Adapt explanation depth to user's level
- Summarize key points at the end
- Ask clarifying questions when needed

Now provide a detailed, well-structured, valuable response to the user.`;
}

// ============================================
// WORD LIMIT & LANGUAGE DETECTION
// ============================================
function getWordLimit(userMessage: string): number {
  if (/(explain|detail|elaborate|what is|how does|tell me about|roadmap|project|build)/i.test(userMessage)) return 4000;
  if (/(code|program|function|script|write|create|generate)/i.test(userMessage)) return 3500;
  if (/(brief|short|summary|quick|one line)/i.test(userMessage)) return 400;
  return 2000;
}

function detectLanguage(text: string): string {
  if (!text) return "English";
  if (/[\u0600-\u06FF]/.test(text)) return "Urdu";
  if (/(hai|kya|kaise|acha|bhai|yaar|mera|tera|karo|jao)/i.test(text)) return "RomanUrdu";
  return "English";
}

function detectSkillLevel(text: string): string {
  const lower = text.toLowerCase();
  if (/(advanced|expert|senior|professional)/i.test(lower)) return "advanced";
  if (/(intermediate|medium|moderate)/i.test(lower)) return "intermediate";
  if (/(beginner|new|starter|basic|learning)/i.test(lower)) return "beginner";
  return "intermediate";
}

// ============================================
// MATH SOLVER
// ============================================
function solveMath(text: string): string | null {
  const clean = text.replace(/\s/g, '');
  if (/^[\d\+\-\*\/\(\)\.\^\%]+$/.test(clean)) {
    try {
      const result = Function('"use strict";return (' + clean.replace(/\^/g, '**') + ')')();
      if (typeof result === 'number' && isFinite(result)) {
        return `**📐 Math Solution**

**Problem:** ${clean}
**Final Answer:** ${result.toFixed(4)}`;
      }
    } catch (e) {}
  }
  
  const percentMatch = text.match(/(\d+)\s*percent\s*of\s*(\d+)/i);
  if (percentMatch) {
    const percent = parseFloat(percentMatch[1]);
    const number = parseFloat(percentMatch[2]);
    const result = (percent / 100) * number;
    return `**📊 Percentage Calculator**

**${percent}% of ${number} = ${result}**`;
  }
  
  return null;
}

// ============================================
// GEMINI 2.5 FLASH API CALL (Primary)
// ============================================
async function callGemini25Flash(messages: any[], wordLimit: number): Promise<Response | null> {
  for (let i = 0; i < GEMINI_KEYS.length; i++) {
    const key = GEMINI_KEYS[(geminiIndex + i) % GEMINI_KEYS.length];
    if (!key) continue;
    try {
      const formattedMessages = messages.map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: formattedMessages,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: Math.min(8192, wordLimit * 2),
            topP: 0.95,
            topK: 40,
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
          ]
        }),
      });
      
      if (response.ok) {
        geminiIndex = (geminiIndex + 1) % GEMINI_KEYS.length;
        const data = await response.json();
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
        
        console.log("✅ Gemini 2.5 Flash response received");
        
        return new Response(JSON.stringify({ 
          choices: [{ message: { content: aiText, role: "assistant" } }] 
        }), {
          status: 200, 
          headers: { "Content-Type": "application/json" }
        });
      } else {
        const errorText = await response.text();
        console.log(`Gemini API error (${response.status}):`, errorText);
      }
    } catch (e) {
      console.log("Gemini 2.5 Flash error:", e);
    }
  }
  return null;
}

// ============================================
// FALLBACK: Groq Llama 3.3
// ============================================
async function callGroq(messages: any[], wordLimit: number): Promise<Response | null> {
  for (let i = 0; i < GROQ_KEYS.length; i++) {
    const key = GROQ_KEYS[(groqIndex + i) % GROQ_KEYS.length];
    if (!key) continue;
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          stream: false,
          max_tokens: Math.min(8192, wordLimit * 2),
          temperature: 0.7,
          messages: messages
        }),
      });
      if (response.ok) {
        groqIndex = (groqIndex + 1) % GROQ_KEYS.length;
        console.log("✅ Groq fallback used");
        return response;
      }
    } catch (e) {}
  }
  return null;
}

// ============================================
// FALLBACK 2: OpenRouter
// ============================================
async function callOpenRouter(messages: any[], wordLimit: number): Promise<Response | null> {
  for (let i = 0; i < OPENROUTER_KEYS.length; i++) {
    const key = OPENROUTER_KEYS[(openrouterIndex + i) % OPENROUTER_KEYS.length];
    if (!key) continue;
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-001",
          stream: false,
          max_tokens: Math.min(8192, wordLimit * 2),
          temperature: 0.7,
          messages: messages
        }),
      });
      if (response.ok) {
        openrouterIndex = (openrouterIndex + 1) % OPENROUTER_KEYS.length;
        console.log("✅ OpenRouter fallback used");
        return response;
      }
    } catch (e) {}
  }
  return null;
}

// ============================================
// MAIN sendToAI FUNCTION (UPDATED)
// ============================================
export async function sendToAI(
  messages: any[],
  aiMemory: any[],
  webEnabled: boolean,
  userId?: string
) {
  const lastMsg = messages.filter(m => m.role === "user").pop();
  const userText = lastMsg?.text || "";
  
  console.log("📨 Message received:", userText);
  console.log("🌐 Web enabled:", webEnabled);
  console.log("👤 User ID:", userId);
  
  // Check if user is setting their level
  const levelMatch = userText.toLowerCase().match(/(beginner|intermediate|advanced)/i);
  if (levelMatch && userId && !localStorage.getItem(`user_level_${userId}`)) {
    const level = levelMatch[1].toLowerCase();
    localStorage.setItem(`user_level_${userId}`, level);
    console.log(`📝 User level saved: ${level}`);
  }
  
  // Check if user is setting their goal
  const goalMatch = userText.toLowerCase().match(/(job|freelancing|startup|learning|ai development|ai)/i);
  if (goalMatch && userId && !localStorage.getItem(`user_goal_${userId}`)) {
    let goal = goalMatch[1].toLowerCase();
    if (goal === 'ai') goal = 'ai development';
    localStorage.setItem(`user_goal_${userId}`, goal);
    console.log(`📝 User goal saved: ${goal}`);
  }
  
  // 1. Check for math problem
  const mathResult = solveMath(userText);
  if (mathResult) {
    console.log("✅ Math problem solved");
    return new Response(JSON.stringify({ choices: [{ message: { content: mathResult, role: "assistant" } }] }), {
      status: 200, headers: { "Content-Type": "application/json" }
    });
  }
  
  // 2. Get live data if web is enabled
  let liveContext = "";
  if (webEnabled) {
    liveContext = await liveDataSearch(userText);
    console.log("🌐 Live data found:", liveContext ? "✅ YES" : "❌ NO");
  }
  
  // 3. Detect parameters
  const wordLimit = getWordLimit(userText);
  const userLanguage = detectLanguage(userText);
  const userSkillLevel = detectSkillLevel(userText);
  const isEducational = /(explain|what is|how does|define|concept|theory|science|physics|chemistry|biology|math|history|code|program|learn|teach)/i.test(userText);
  const codingFeature = detectCodingFeature(userText);
  
  if (codingFeature) {
    console.log("🎯 Coding Feature Detected:", codingFeature);
  }
  
  // 4. Create enhanced system prompt with user context
  const systemPrompt = getProfessionalSystemPrompt(
    userLanguage, isEducational, wordLimit, userText, liveContext, webEnabled, codingFeature, userSkillLevel, userId
  );
  
  // 5. Prepare API messages
  const apiMessages = [
    { role: "system", content: systemPrompt },
    ...messages.slice(-15).map(m => ({ 
      role: m.role === "ai" ? "assistant" : "user", 
      content: m.text 
    }))
  ];
  
  console.log(`🎯 Model: Gemini/Groq | Language: ${userLanguage} | Word limit: ${wordLimit} | Live: ${!!liveContext} | Feature: ${codingFeature || "none"}`);
  
  // 6. Try Gemini 2.5 Flash FIRST
  const geminiResponse = await callGemini25Flash(apiMessages, wordLimit);
  if (geminiResponse) return geminiResponse;
  
  // 7. Try Groq SECOND (Fallback)
  console.log("⚠️ Gemini failed, trying Groq fallback...");
  const groqResponse = await callGroq(apiMessages, wordLimit);
  if (groqResponse) return groqResponse;
  
  // 8. Try OpenRouter THIRD (Final Fallback)
  console.log("⚠️ Groq failed, trying OpenRouter fallback...");
  const openRouterResponse = await callOpenRouter(apiMessages, wordLimit);
  if (openRouterResponse) return openRouterResponse;
  
  // 9. Ultimate fallback with offline coding help
  console.log("❌ All APIs failed - providing offline coding help");
  return new Response(JSON.stringify({
    choices: [{ message: { 
      content: `## 💻 Adin AI - Coding Mentor (Working Offline)

I'm having connection issues, but I'm still here to help!

**What you can ask me:**
• "What should I learn as a beginner?"
• "Give me a roadmap for ${userSkillLevel}"
• "Suggest projects for my portfolio"
• "Explain what [concept] is"
• "Debug this code (paste your code)"

**Try these commands:**
/roadmap frontend
/project ecommerce
/learn react
/interview javascript

**Or just tell me:**
• Your level (beginner/intermediate/advanced)
• Your goal (job/freelancing/startup/learning)
• What you want to build/learn

I'll respond as soon as the connection is back! Meanwhile, try turning ON the Web button for better responses.`, 
      role: "assistant" 
    } }]
  }), { status: 200 });
}

// ============================================
// EXPORTS
// ============================================
export async function saveMemoryFromResponse(userId: string, userMessage: string, aiResponse: string) {
  const memoryKey = `adin_conversation_${userId}`;
  const existing = localStorage.getItem(memoryKey);
  let conversations = existing ? JSON.parse(existing) : [];
  conversations.push({ timestamp: new Date().toISOString(), user: userMessage.slice(0, 500), ai: aiResponse.slice(0, 500) });
  if (conversations.length > 100) conversations = conversations.slice(-100);
  localStorage.setItem(memoryKey, JSON.stringify(conversations));
}

export function getConversationHistory(userId: string): any[] {
  const saved = localStorage.getItem(`adin_conversation_${userId}`);
  return saved ? JSON.parse(saved) : [];
}

export function clearConversationHistory(userId: string): void {
  localStorage.removeItem(`adin_conversation_${userId}`);
}