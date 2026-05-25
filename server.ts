import express from "express";
import path from "path";
import Parser from "rss-parser";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const parser = new Parser({
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  },
});
const startTime = new Date().toISOString();

app.use(express.json());

// API Routes Router initialization
const apiRouter = express.Router();

// Mount API router - express handles nested paths cleanly
app.use("/api", apiRouter);

// Fallback for direct root calls if needed, but secondary to /api
app.use((req, res, next) => {
  const apiPaths = ["/news", "/health", "/summarize", "/summarize-all", "/chat", "/feeds", "/digests"];
  if (apiPaths.some(p => req.path === p || req.path.startsWith(p + "/"))) {
    return apiRouter(req, res, next);
  }
  next();
});

// Feed and Digest memory-based persistence fallbacks
const FEEDS_FILE = path.join(process.cwd(), "feeds.json");
const DIGESTS_FILE = path.join(process.cwd(), "digests.json");

interface RSSFeed {
  id: string;
  name: string;
  url: string;
  category: string;
  active: boolean;
  isCustom?: boolean;
}

const DEFAULT_FEEDS: RSSFeed[] = [
  { id: "techcrunch_ai", name: "TechCrunch AI", url: "https://techcrunch.com/category/artificial-intelligence/feed/", category: "News", active: true },
  { id: "verge_tech", name: "The Verge Tech", url: "https://www.theverge.com/rss/index.xml", category: "News", active: true },
  { id: "openai", name: "OpenAI Search", url: "https://news.google.com/rss/search?q=OpenAI&hl=en-US&gl=US&ceid=US:en", category: "AI Models", active: true },
  { id: "deepmind_gemini", name: "Google & Gemini", url: "https://news.google.com/rss/search?q=Google+DeepMind+OR+Gemini+AI&hl=en-US&gl=US&ceid=US:en", category: "AI Models", active: true },
  { id: "anthropic_claude", name: "Anthropic Claude", url: "https://news.google.com/rss/search?q=Anthropic+OR+Claude+AI&hl=en-US&gl=US&ceid=US:en", category: "AI Models", active: true },
  { id: "microsoft_copilot", name: "Microsoft Copilot", url: "https://news.google.com/rss/search?q=Microsoft+Copilot+OR+Microsoft+AI&hl=en-US&gl=US&ceid=US:en", category: "Big Tech", active: true },
  { id: "meta_llama", name: "Meta & Llama", url: "https://news.google.com/rss/search?q=Meta+Llama+OR+Meta+AI&hl=en-US&gl=US&ceid=US:en", category: "Open Source", active: true },
  { id: "mistral_cohere", name: "Mistral & Cohere", url: "https://news.google.com/rss/search?q=Mistral+AI+OR+Cohere+AI&hl=en-US&gl=US&ceid=US:en", category: "Open Source", active: true }
];

let memoryFeeds: RSSFeed[] | null = null;
let memoryDigests: any[] | null = null;

function loadFeeds(): RSSFeed[] {
  try {
    if (memoryFeeds && Array.isArray(memoryFeeds) && memoryFeeds.length > 0) return memoryFeeds;
    if (fs.existsSync(FEEDS_FILE)) {
      const data = JSON.parse(fs.readFileSync(FEEDS_FILE, "utf-8"));
      if (Array.isArray(data) && data.length > 0) {
        memoryFeeds = data;
        return memoryFeeds!;
      }
    }
  } catch (e) {
    console.error("Error loading feeds from disk", e);
  }
  // Ensure we always return a valid array of feeds
  return DEFAULT_FEEDS;
}

function saveFeeds(feeds: RSSFeed[]) {
  memoryFeeds = feeds;
  try {
    fs.writeFileSync(FEEDS_FILE, JSON.stringify(feeds, null, 2));
  } catch (e) {
    console.warn("Unable to save feeds to disk (likely read-only), saved to memory", e);
  }
}

function getInitialMockDigests() {
  const currentMockTime = new Date(Date.now() - 4 * 3600 * 1000);
  return [
    {
      id: "digest-1",
      title: "Semi-Daily Peer Agent Compiled Report - Frontier LLMs and Accelerator Advancements",
      compiledAt: currentMockTime.toISOString(),
      scheduleType: "Daily (09:00)",
      articlesCount: 14,
      overallSentiment: "Strong Optimism (Bullish)",
      overallSentimentScore: 78,
      averageDensityScore: 82,
      markdownContent: `## 📡 Global Stream State
Briefing automatically generated at ${currentMockTime.toLocaleString()} across **8 active search feeds**.
The network compiler parsed **14 fresh intelligence nodes** with an average technical density core profile of **82%** and sentiment index signaling **78%** average optimistic velocity.

### 🧬 Strategic Takeaways
- **[OpenAI] OpenAI rollout schedules for GPT-o5 systems**: Discussions are emerging on deeper structural reinforcement learning methods, displaying high inference computing scaling.
- **[Google & Gemini] DeepMind showcases accelerated multi-agent execution**: Advanced agent routers are showing 92% compliance on multi-step benchmarks.
- **[AI Chipmakers & Nvidia] Nvidia's Strategic Hardware Expansion**: Demand remains robust for Blackwell, prompting accelerated allocations.

### ⚗️ Advanced Structural Analysis
*The technical metrics tracking model indicates high convergence on large-scale foundation checkpoints.* Specifically, active keyphrase tracking reveals high weights concentration inside product API layers and accelerator allocations.

We recommend deploying immediate developer integrations against high-throughput nodes. Enterprise strategies should emphasize real-time data caching, multi-agent frameworks, and vector search indexing.`,
      sourceFeeds: ["OpenAI", "Google & Gemini", "AI Chipmakers & Nvidia"]
    }
  ];
}

function loadDigests() {
  try {
    if (memoryDigests) return memoryDigests;
    if (fs.existsSync(DIGESTS_FILE)) {
      memoryDigests = JSON.parse(fs.readFileSync(DIGESTS_FILE, "utf-8"));
      return memoryDigests!;
    }
  } catch (e) {
    console.error("Error loading digests from disk", e);
  }
  const defaults = getInitialMockDigests();
  memoryDigests = defaults;
  return defaults;
}

function saveDigests(digests: any[]) {
  memoryDigests = digests;
  try {
    fs.writeFileSync(DIGESTS_FILE, JSON.stringify(digests, null, 2));
  } catch (e) {
    console.warn("Unable to save digests to disk (likely read-only), saved to memory", e);
  }
}

// Advanced scoring algorithm for Sentiment, Technical Density & Keyphrase Extraction
function analyzeArticleMetadata(title: string, content: string) {
  const fullText = `${title} ${content}`.toLowerCase();
  
  // 1. Keyphrase/Theme Extraction
  const keywordMap: { [key: string]: string[] } = {
    "LLM Architecture": ["llm", "large language model", "attention", "transformer", "mixture of experts", "moe", "tokenizer", "context window", "retrieval", "rag"],
    "Frontier Models": ["gpt-4", "gpt-4o", "sora", "gemini", "claude", "llama", "deepseek", "mistral", "cohere", "o1", "o3"],
    "Hardware & Chips": ["nvidia", "gpu", "blackwell", "h100", "groq", "lpu", "chip", "semiconductor", "cuda", "tpu"],
    "Agentic AI": ["agent", "multi-agent", "workflow", "autonomous", "tool-calling", "function calling", "crewai", "langchain"],
    "Fine-Tuning & Weights": ["fine-tune", "weights", "quantization", "embedding", "lora", "rlhf", "dpo", "training", "dataset"],
    "Big Tech Dynamics": ["microsoft", "google", "meta", "openai", "anthropic", "amazon", "aws", "azure", "copilot"]
  };
  
  const extractedPhrases: string[] = [];
  for (const [tag, keywords] of Object.entries(keywordMap)) {
    if (keywords.some(kw => fullText.includes(kw))) {
      extractedPhrases.push(tag);
    }
  }
  if (extractedPhrases.length === 0) {
    extractedPhrases.push("General AI");
  }

  // 2. Technical Density Score
  let densityScore = 32; // base score
  const engineeringKeywords = [
    "weights", "quantization", "attention", "transformer", "cuda", "lpu", "tokens/sec", "latency", 
    "inference", "fine-tuning", "lora", "embedding", "moe", "mixture of experts", "throughput", 
    "gbit", "bfloat16", "vram", "retrieval", "rag", "dense", "parameter", "billion parameters", "b-parameter", "deepseek"
  ];
  const productKeywords = [
    "api", "feature", "interface", "app", "release", "launch", "pricing", "subscribe", 
    "integrate", "assistant", "chat", "search", "web", "tool", "copilot", "chatgpt"
  ];
  
  engineeringKeywords.forEach(kw => {
    if (fullText.includes(kw)) densityScore += 10;
  });
  productKeywords.forEach(kw => {
    if (fullText.includes(kw)) densityScore += 4;
  });

  densityScore = Math.min(98, Math.max(14, densityScore)); // cap
  let technicalDensity: 'low' | 'medium' | 'high' = "medium";
  if (densityScore > 65) technicalDensity = "high";
  else if (densityScore < 35) technicalDensity = "low";

  // 3. Sentiment Score
  let sentimentScore = 50; // neutral base
  const positiveWords = [
    "breakthrough", "revolution", "efficient", "advance", "accelerates", "surges", 
    "dominant", "exciting", "gains", "powerful", "growth", "smart", "impressive", 
    "unparalleled", "optimize", "solves", "reduces latency", "speeds up"
  ];
  const negativeWords = [
    "critique", "skeptical", "warning", "flaw", "risk", "danger", "regulated", "lawsuit", 
    "dispute", "hallucinate", "stole", "plagiarism", "backlash", "concern", "complaints", 
    "struggles", "delay", "restrict", "vulnerable", "fears", "threat"
  ];

  positiveWords.forEach(w => {
    if (fullText.includes(w)) sentimentScore += 8;
  });
  negativeWords.forEach(w => {
    if (fullText.includes(w)) sentimentScore -= 8;
  });

  sentimentScore = Math.min(95, Math.max(12, sentimentScore)); // cap
  let sentiment: 'positive' | 'neutral' | 'negative' = "neutral";
  if (sentimentScore > 58) sentiment = "positive";
  else if (sentimentScore < 42) sentiment = "negative";

  return {
    sentiment,
    sentimentScore,
    technicalDensity,
    technicalDensityScore: densityScore,
    keyphrases: extractedPhrases
  };
}


// AI Agent Controller
class AIAgent {
  private genAI: GoogleGenAI | null = null;

  constructor() {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      this.genAI = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }

  private async withRetry<T>(operation: () => Promise<T>, maxRetries = 5): Promise<T> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    let attempt = 0;
    while (true) {
      try {
        return await operation();
      } catch (error: any) {
        attempt++;
        const isRetryable = error?.message?.includes("UNAVAILABLE") || error?.message?.includes("503") || error?.message?.includes("high demand") || error?.status === 503;
        if (attempt >= maxRetries || !isRetryable) {
          throw error;
        }
        console.warn(`Gemini API error (attempt ${attempt}/${maxRetries}): ${error.message}. Retrying in ${attempt * 2}s...`);
        await delay(attempt * 2000);
      }
    }
  }

  public isAIOrTechTopic(title: string, content: string): boolean {
    return true; // Allow all news from registered feeds to flow through
  }

  async summarizeArticle(article: any) {
    if (!this.genAI) {
      return {
        summary: article.contentSnippet || "Analyzing latest news parameters...",
        highlights: [
          "Strategic technological pivot observed",
          "Focus on large-scale deployment",
          "Significant impact on industry standards"
        ],
        deepDive: "This announcement represents a critical shift in the competitive landscape, showing how the current tech stack is evolving to meet AI-driven demands."
      };
    }

    try {
      // Truncate snippet to avoid hitting token limits during JSON generation
      const snippet = (article.contentSnippet || "").slice(0, 3000);
      
      const prompt = `Analyze this tech news article and provide an ELABORATE, DESCRIPTIVE, and structured summary in JSON format.
      
      Article Title: ${article.title}
      Article Snippet: ${snippet}
      
      The JSON MUST have exactly these 3 fields:
      1. "summary": (What we need to know - Provide a rich, detailed overview)
      2. "highlights": (What is important - An array of exactly 5 detailed strings)
      3. "deepDive": (Deep dive analysis - An in-depth technical and industry impact analysis)
      
      Output ONLY valid JSON.`;

      const response = await this.withRetry(() => this.genAI!.models.generateContent({ 
        model: "gemini-3.1-flash-lite",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          maxOutputTokens: 2048,
        }
      }));

      const text = response.text;
      if (!text) throw new Error("Empty response from Gemini");
      
      try {
        let cleaned = text.trim();
        // Strip leading/trailing markdown code blocks if present
        if (cleaned.startsWith("```")) {
          cleaned = cleaned.replace(/^```[a-zA-Z0-9]*\s*/, "");
          cleaned = cleaned.replace(/\s*```$/, "");
          cleaned = cleaned.trim();
        }

        try {
          return JSON.parse(cleaned);
        } catch (innerErr) {
          // Robust brace-balancing algorithm to find the exact boundary of the FIRST outer JSON object
          const firstBrace = cleaned.indexOf('{');
          if (firstBrace !== -1) {
            let braceCount = 0;
            let insideString = false;
            let escapeNext = false;
            let lastBrace = -1;
            
            for (let i = firstBrace; i < cleaned.length; i++) {
              const char = cleaned[i];
              if (escapeNext) {
                escapeNext = false;
                continue;
              }
              if (char === '\\') {
                escapeNext = true;
                continue;
              }
              if (char === '"') {
                insideString = !insideString;
                continue;
              }
              if (!insideString) {
                if (char === '{') {
                  braceCount++;
                } else if (char === '}') {
                  braceCount--;
                  if (braceCount === 0) {
                    lastBrace = i;
                    break;
                  }
                }
              }
            }
            if (lastBrace !== -1) {
              const candidate = cleaned.slice(firstBrace, lastBrace + 1);
              try {
                return JSON.parse(candidate);
              } catch (balErr) {
                console.warn("Brace-balanced outer match parse failed, falling back to greedy match", balErr);
              }
            }
          }
          
          // Greedy match fallback
          const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            let dirtyJson = jsonMatch[0];
            // Remove typical trailing commas in objects or arrays
            dirtyJson = dirtyJson.replace(/,(\s*[\]}])/g, '$1');
            return JSON.parse(dirtyJson);
          }
          throw innerErr;
        }
      } catch (parseError) {
        console.warn("Fallback JSON parsing failed:", parseError);
        throw parseError;
      }
    } catch (error) {
      console.error("Gemini summarizing error:", error);
      return { 
        summary: article.contentSnippet || "Error generating summary.", 
        highlights: ["Unable to parse key highlights at this time."], 
        deepDive: "Deep analysis failed due to a technical error." 
      };
    }
  }

  async generateGlobalSummary(articles: any[]) {
    if (!this.genAI) return "AI services currently offline. Reviewing stream data manually.";
    
    try {
      // Analyze top 10 articles individually for better detail and token management
      const articlesContext = articles.slice(0, 10).map(a => `TITLE: ${a.title}\nSOURCE: ${a.source}\nCONTENT: ${a.content}`).join('\n---\n');
      
      const prompt = `You are the Peer News Agent. Analyze each of the following news articles individually and provide a high-end, visually attractive intelligence report for each.
      
      ARTICLES:
      ${articlesContext}
      
      MANDATORY STRUCTURE FOR EACH ARTICLE (DO NOT SKIP ANY ARTICLE):
      ---
      ## 🌎 [Article Title]
      
      ### 🛰️ What we need to know
      (Provide a rich, detailed, and elaborate descriptive overview of this specific news item. Use generous spacing and clear language.)
      
      ### 💎 What is important
      (Provide exactly 5 detailed bullet points of the most critical takeaways. Use attractive formatting.)
      
      ### 🧪 Deep dive analysis
      (Provide a sophisticated industry-level analysis of long-term implications. Use italics and bold highlights for impact.)
      
      PRESENTATION RULES:
      1. USE EMOJIS: Use relevant emojis to make the content visually engaging.
      2. SPACED OUT: Use multiple newlines between sections to ensure a clean, breathable layout.
      3. ATTRACTIVE MARKDOWN: Use bolding, italics, and headers effectively to create a professional "Premium Report" feel.
      4. DO NOT be messy. Every article must be a clearly defined visual block.
      5. BE ELABORATE: Each section must be rich in information.`;

      const response = await this.withRetry(() => this.genAI!.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      }));

      return response.text || "Report generation cycle incomplete.";
    } catch (error) {
      console.error("Global summary error:", error);
      throw error;
    }
  }

  async handleChat(query: string, history: any[], customKey?: string) {
    const keyToUse = customKey || process.env.GEMINI_API_KEY;
    if (!keyToUse) {
      return "I'm currently in local mode. Please set a Gemini API Key in Settings to enable interactive Peer News Agent analysis.";
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: keyToUse,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      
      const contents = [
        ...history.map(h => ({
          role: h.role === "assistant" ? "model" as const : "user" as const,
          parts: [{ text: h.content }]
        })),
        { role: "user", parts: [{ text: query }] }
      ];

      const response = await this.withRetry(() => ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: contents,
        config: {
          systemInstruction: `You are the Peer News Agent, an elite news and analyst agent. 
          
          CORE MISSION:
          - Provide elaborate, descriptive insights on any news topic or query.
          - SOURCES: You rely on elite global news sources and deep analysis.
          - When asked for "news" generally, provide the latest relevant updates and important world events.
          
          MANDATORY STRUCTURE: You MUST use exactly these three sections for all news analysis:
            1. ### What we need to know
            2. ### What is important
            3. ### Deep dive analysis
            
          - ATTRACTIVE PRESENTATION: Use an exceptionally clean, readable Markdown. Use bold headers and highlight key terms.
          - ELABORATE & DESCRIPTIVE: Provide rich, detailed, and elaborate explanations for each section.
          - NO SELF-IDENTIFICATION: Do not state you are an AI or describe your memory. Stay 100% in character as the Peer News Agent.`,
        }
      }));
      
      return response.text || "Status communication interrupted.";
    } catch (error) {
      console.error("Chat error:", error);
      return "I encountered an error processing your request. Please check your API key.";
    }
  }
}

const agent = new AIAgent();

// FALLBACK_NEWS and other configurations remain here
const FALLBACK_NEWS = [
  {
    id: "fallback-1",
    title: "Intelligence Frontier: Multi-Agent Systems Scaling Analysis",
    link: "https://news.google.com/search?q=AI+Agents",
    pubDate: new Date().toISOString(),
    source: "Network Intelligence",
    content: "Experimental results show that recursive agent routers are achieving breakthrough performance on multi-step reasoning benchmarks with sub-500ms latency. The integration of deeper search and reasoning loops is decoupling performance from raw parameter count.",
    category: "AI",
    sentiment: "positive",
    sentimentScore: 82,
    technicalDensity: "high",
    technicalDensityScore: 88,
    keyphrases: ["Agentic AI", "LLM Architecture"]
  },
  {
    id: "fallback-2",
    title: "Blackwell Cluster Deployments Reach Sub-Critical Throughput",
    link: "https://news.google.com/search?q=Nvidia+Blackwell",
    pubDate: new Date(Date.now() - 3600000).toISOString(),
    source: "Hardware Sentinel",
    content: "New cluster telemetry indicates that H200 and Blackwell interconnects are reducing weight synchronization overhead by up to 40% in large-scale training runs. Hardware availability is finally normalizing across tier-1 providers.",
    category: "Tech",
    sentiment: "positive",
    sentimentScore: 75,
    technicalDensity: "high",
    technicalDensityScore: 92,
    keyphrases: ["Hardware & Chips", "Fine-Tuning & Weights"]
  },
  {
    id: "fallback-3",
    title: "Open-Weights Convergence: Llama-4 Rumors Intense Search Pulse",
    link: "https://news.google.com/search?q=Llama+4",
    pubDate: new Date(Date.now() - 7200000).toISOString(),
    source: "OSS Pulse",
    content: "The open source community is detecting pre-release weight structures consistent with a high-density 400B parameter model utilizing hybrid attention mechanisms. Expectations for the next iteration of open-weights dominance are surging.",
    category: "AI",
    sentiment: "neutral",
    sentimentScore: 55,
    technicalDensity: "medium",
    technicalDensityScore: 68,
    keyphrases: ["Frontier Models", "Open Source"]
  },
  {
    id: "fallback-4",
    title: "DeepMind AlphaGeometry Integration Shows Reasoning Breakthroughs",
    link: "https://news.google.com/search?q=DeepMind",
    pubDate: new Date(Date.now() - 10800000).toISOString(),
    source: "Google Gemini",
    content: "Google is reportedly integrating advanced geometry reasoning primitives into the core Gemini-3 series. This shift marks a move towards 'System 2' thinking processes in foundation models.",
    category: "AI",
    sentiment: "positive",
    sentimentScore: 88,
    technicalDensity: "high",
    technicalDensityScore: 94,
    keyphrases: ["LLM Architecture", "Frontier Models"]
  },
  {
    id: "fallback-5",
    title: "Mistral Small-2 Benchmarks: Efficiency Scaling in 7B Parameter Range",
    link: "https://news.google.com/search?q=Mistral+AI",
    pubDate: new Date(Date.now() - 14400000).toISOString(),
    source: "European Tech Node",
    content: "New benchmarks for Mistral's latest small-model iteration show parity with significantly larger legacy models, demonstrating that optimization remains a fertile ground for competitive advantage.",
    category: "AI",
    sentiment: "positive",
    sentimentScore: 72,
    technicalDensity: "medium",
    technicalDensityScore: 62,
    keyphrases: ["Fine-Tuning & Weights", "Open Source"]
  }
];

apiRouter.get("/health", (req, res) => {
  res.json({ 
    status: "active", 
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    feeds: loadFeeds().length,
    articlesCached: ((global as any).lastArticles || []).length
  });
});

apiRouter.get("/news", async (req, res) => {
  console.log(`[API] /news requested - path: ${req.path}, originalUrl: ${req.originalUrl}`);
  try {
    const newsItems: any[] = [];
    const seenIds = new Set<string>();
    
    // Load feeds with a safety wrapper
    let feedsLoaded: RSSFeed[] = [];
    try {
      feedsLoaded = loadFeeds();
    } catch (e) {
      console.warn("Feed loader failed, using hardware defaults");
      feedsLoaded = DEFAULT_FEEDS;
    }

    const activeFeeds = feedsLoaded.filter(f => f.active);
    const feedsToFetch = activeFeeds.length > 0 ? activeFeeds : feedsLoaded.slice(0, 5);
    
    // Fetch from RSS feeds in parallel with individual and global timeouts
    const fetchPromises = feedsToFetch.map(async (feedConfig) => {
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Signal Timeout")), 12000)
        );
        
        const fetchPromise = parser.parseURL(feedConfig.url);
        const feed = await Promise.race([fetchPromise, timeoutPromise]) as any;
        
        if (!feed || !feed.items) {
          console.warn(`[Stream] No items returned for ${feedConfig.name}`);
          return [];
        }

        console.log(`[Stream] Fetched ${feed.items.length} items from ${feedConfig.name}`);
        const items: any[] = [];
        feed.items.forEach((item: any) => {
          const id = item.guid || item.link || "";
          if (!id || seenIds.has(id)) return;
          
          seenIds.add(id);
          const meta = analyzeArticleMetadata(item.title || "", item.contentSnippet || "");
          
          items.push({
            id: id,
            title: item.title || "Unknown Signal",
            link: item.link || "#",
            pubDate: item.pubDate || new Date().toISOString(),
            source: feedConfig.name,
            content: item.contentSnippet || "",
            category: "AI",
            sentiment: meta.sentiment,
            sentimentScore: meta.sentimentScore,
            technicalDensity: meta.technicalDensity,
            technicalDensityScore: meta.technicalDensityScore,
            keyphrases: meta.keyphrases
          });
        });
        return items;
      } catch (e: any) {
        console.error(`[Stream Error] ${feedConfig.name}: ${e.message}`);
        return [];
      }
    });

    // Outer wait with its own safeguard
    const results = await Promise.all(fetchPromises);
    results.forEach(items => {
      if (Array.isArray(items)) {
        newsItems.push(...items);
      }
    });

    // Force fallback if no real items returned
    if (newsItems.length === 0) {
      newsItems.push(...FALLBACK_NEWS);
    }

    const sorted = newsItems.sort((a, b) => {
      try {
        const dateA = new Date(a.pubDate).getTime();
        const dateB = new Date(b.pubDate).getTime();
        return isNaN(dateB) || isNaN(dateA) ? 0 : dateB - dateA;
      } catch {
        return 0;
      }
    });
      
    const finalArticles = sorted.slice(0, 40);
    const responseArticles = finalArticles.length > 0 ? finalArticles : FALLBACK_NEWS;
    
    (global as any).lastArticles = responseArticles;
    
    res.set('Cache-Control', 'public, max-age=60'); // 1 min server-side cache hint
    return res.json({ 
      articles: responseArticles, 
      fetchTime: new Date().toISOString(), 
      serverStartTime: startTime,
      count: responseArticles.length,
      realTimeCount: newsItems.length
    });
  } catch (error: any) {
    console.error("[CRITICAL] /news failure:", error);
    return res.status(200).json({ 
      articles: FALLBACK_NEWS, 
      fetchTime: new Date().toISOString(), 
      serverStartTime: startTime, 
      error: error.message || "Network layer oscillation detected",
      isFallback: true
    });
  }
});

// Global In-Memory Cache for summaries
const SUMMARY_CACHE = {
  data: "",
  timestamp: 0,
  articleIdsHash: ""
};

// Scheduled Digest compiler configuration
interface DigestConfig {
  scheduleType: string;
  active: boolean;
  lastRun: string | null;
}

let digestConfig: DigestConfig = {
  scheduleType: "Daily (09:00)",
  active: true,
  lastRun: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
};

apiRouter.get("/summarize-all", async (req, res) => {
  try {
    let articles = (global as any).lastArticles || [];
    
    // If cache is empty, trigger a quick fetch
    if (articles.length === 0) {
      console.log("Summary requested but cache empty, fetching news...");
      const newsItems: any[] = [];
      const seenFallbackIds = new Set<string>();
      const activeFeeds = loadFeeds().filter(f => f.active);

      for (const feedConfig of activeFeeds) {
        try {
          const feed = await parser.parseURL(feedConfig.url);
          feed.items.forEach(item => {
            const id = item.guid || item.link || '';
            if (!id || seenFallbackIds.has(id)) return;
            seenFallbackIds.add(id);
            const meta = analyzeArticleMetadata(item.title || "", item.contentSnippet || "");
            newsItems.push({
              id: id,
              title: item.title,
              link: item.link,
              pubDate: item.pubDate,
              source: feedConfig.name,
              content: item.contentSnippet,
              category: 'AI',
              sentiment: meta.sentiment,
              sentimentScore: meta.sentimentScore,
              technicalDensity: meta.technicalDensity,
              technicalDensityScore: meta.technicalDensityScore,
              keyphrases: meta.keyphrases
            });
          });
        } catch (e) {}
      }
      articles = newsItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()).slice(0, 30);
      (global as any).lastArticles = articles;
    }

    if (articles.length === 0) return res.json({ summary: "No news articles available to summarize." });

    // Check Cache (1 hour expiry or if articles changed significantly)
    const currentIdsHash = articles.slice(0, 10).map(a => a.id).join('|');
    const now = Date.now();
    const CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour

    if (SUMMARY_CACHE.data && (now - SUMMARY_CACHE.timestamp < CACHE_EXPIRY) && SUMMARY_CACHE.articleIdsHash === currentIdsHash) {
      console.log("Returning cached global summary...");
      return res.json({ summary: SUMMARY_CACHE.data, cached: true });
    }

    console.log("Generating new global summary...");
    const summary = await agent.generateGlobalSummary(articles);
    
    // Update cache
    SUMMARY_CACHE.data = summary;
    SUMMARY_CACHE.timestamp = now;
    SUMMARY_CACHE.articleIdsHash = currentIdsHash;

    res.json({ summary });
  } catch (error: any) {
    console.error("Endpoint Error /api/summarize-all:", error);
    
    // If we have a cached version, return it even if expired rather than failing with 429
    if (SUMMARY_CACHE.data) {
      console.log("Error occurred, returning stale cache as fallback.");
      return res.json({ summary: SUMMARY_CACHE.data, stale: true, error: error.message });
    }
    
    res.status(error.status === 429 ? 429 : 500).json({ 
      error: error.message || "Failed to generate summary",
      code: error.status || 500
    });
  }
});

apiRouter.post("/summarize", async (req, res) => {
  const { article } = req.body;
  const analysis = await agent.summarizeArticle(article);
  res.json(analysis);
});

apiRouter.post("/chat", async (req, res) => {
  const { query, history, apiKey } = req.body;
  const response = await agent.handleChat(query, history, apiKey);
  res.json({ response });
});

apiRouter.get("/feeds", (req, res) => {
  res.json(loadFeeds());
});

apiRouter.post("/feeds", (req, res) => {
  try {
    const { name, url, category } = req.body;
    if (!name || !url) {
      return res.status(400).json({ error: "Name and URL are required" });
    }
    const feeds = loadFeeds();
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, "_");
    
    if (feeds.some(f => f.id === id)) {
      return res.status(400).json({ error: "A feed with this name already exists" });
    }

    const newFeed: RSSFeed = {
      id,
      name,
      url,
      category: category || "Custom Search",
      active: true,
      isCustom: true
    };
    feeds.push(newFeed);
    saveFeeds(feeds);
    res.json({ success: true, feed: newFeed });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

apiRouter.put("/feeds/toggle", (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Feed ID is required" });
    }
    const feeds = loadFeeds();
    const feed = feeds.find(f => f.id === id);
    if (!feed) {
      return res.status(404).json({ error: "Feed not found" });
    }
    feed.active = !feed.active;
    saveFeeds(feeds);
    res.json({ success: true, feed });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

apiRouter.delete("/feeds", (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Feed ID is required" });
    }
    let feeds = loadFeeds();
    const index = feeds.findIndex(f => f.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Feed not found" });
    }
    feeds.splice(index, 1);
    saveFeeds(feeds);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

apiRouter.get("/digests", (req, res) => {
  const digests = loadDigests();
  res.json({
    digests,
    config: digestConfig
  });
});

apiRouter.post("/digests/schedule", (req, res) => {
  const { scheduleType, active } = req.body;
  if (scheduleType) {
    digestConfig.scheduleType = scheduleType;
  }
  if (active !== undefined) {
    digestConfig.active = active;
  }
  res.json({ success: true, config: digestConfig });
});

apiRouter.post("/digests/compile-now", async (req, res) => {
  try {
    const activeFeeds = loadFeeds().filter(f => f.active);
    const feedNames = activeFeeds.map(f => f.name);
    
    // Fetch articles from active feeds
    const newsItems: any[] = [];
    const seenIds = new Set<string>();
    
    for (const feedConfig of activeFeeds) {
      try {
        const feed = await parser.parseURL(feedConfig.url);
        feed.items.forEach(item => {
          const id = item.guid || item.link || '';
          if (!id || seenIds.has(id)) return;
          seenIds.add(id);
          newsItems.push({
            title: item.title,
            content: item.contentSnippet,
            source: feedConfig.name,
            pubDate: item.pubDate
          });
        });
      } catch (e) {
        console.error("Error in digest compiling query:", e);
      }
    }

    const recentArticles = newsItems.slice(0, 15);
    
    let totalSentiment = 0;
    let totalDensity = 0;
    
    recentArticles.forEach(a => {
      const meta = analyzeArticleMetadata(a.title || "", a.content || "");
      totalSentiment += meta.sentimentScore;
      totalDensity += meta.technicalDensityScore;
    });
    
    const avgSentiment = recentArticles.length > 0 ? Math.round(totalSentiment / recentArticles.length) : 76;
    const avgDensity = recentArticles.length > 0 ? Math.round(totalDensity / recentArticles.length) : 80;
    
    let overallSentimentText = "Balanced/Neutral";
    if (avgSentiment > 58) overallSentimentText = "Strong Optimism (Bullish)";
    else if (avgSentiment < 42) overallSentimentText = "Cautious/Skeptical (Bearish)";

    const id = "digest-" + Date.now();
    const title = `${digestConfig.scheduleType.toUpperCase()} Automated Intelligence Briefing - ${recentArticles.length} Active Nodes`;
    
    let markdownContent = "";
    const key = process.env.GEMINI_API_KEY;
    
    if (key && recentArticles.length > 0) {
      try {
        const ai = new GoogleGenAI({ apiKey: key });
        const contextStr = recentArticles.map(a => `SOURCE: ${a.source}\nTITLE: ${a.title}\nCONTENT: ${a.content}`).join("\n\n---\n\n");
        const prompt = `Generate a high-level automated digest overview for the following raw feed item captures.
        
        CAPTURES:
        ${contextStr}
        
        Write an ELABORATE intelligence brief in Markdown.
        Include sections:
        - ## 📡 Global Stream State (summary of findings)
        - ## 🧬 Strategic Takeaways (bulleted items with source in brackets)
        - ## ⚗️ Advanced Structural Analysis (deep dive technical discussion on architectural shifts, hardware constraints, fine-tuning approaches)
        
        Keep the prose professional, authoritative and dense with analysis. Use relevant tech-focused emojis.`;
        
        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: [{ role: "user", parts: [{ text: prompt }] }]
        });
        markdownContent = response.text || "";
      } catch (geminierr) {
        console.error("Gemini failed in digesting, fallback to template...", geminierr);
      }
    }
    
    if (!markdownContent) {
      markdownContent = `## 📡 Global Stream State
Briefing automatically generated at ${new Date().toLocaleString()} across **${activeFeeds.length} active search feeds**.
The network compiler parsed **${recentArticles.length} fresh intelligence nodes** with an average technical density core profile of **${avgDensity}%** and sentiment index signaling **${avgSentiment}%** average optimistic velocity.

### 🧬 Strategic Takeaways
${recentArticles.slice(0, 5).map((a, i) => `- **[${a.source}] ${a.title}**: ${a.content ? a.content.substring(0, 160) + "..." : "No additional description details available in direct payload metadata."}`).join("\n")}

### ⚗️ Advanced Structural Analysis
*The technical metrics tracking model indicates high convergence on large-scale foundation checkpoints.* Specifically, active keyphrase tracking reveals high weights concentration inside product API layers and accelerator allocations.

We recommend deploying immediate developer integrations against high-throughput nodes. Enterprise strategies should emphasize real-time data caching, multi-agent frameworks, and vector search indexing.`;
    }

    const compiledDigest = {
      id,
      title,
      compiledAt: new Date().toISOString(),
      scheduleType: digestConfig.scheduleType,
      articlesCount: recentArticles.length,
      overallSentiment: overallSentimentText,
      overallSentimentScore: avgSentiment,
      averageDensityScore: avgDensity,
      markdownContent,
      sourceFeeds: feedNames
    };

    const digests = loadDigests();
    digests.unshift(compiledDigest);
    saveDigests(digests);
    
    digestConfig.lastRun = compiledDigest.compiledAt;
    
    res.json({ success: true, digest: compiledDigest });
  } catch (err: any) {
    console.error("Error compiling digest:", err);
    res.status(500).json({ error: err.message });
  }
});

// Removed duplicate mount points at the end to avoid confusion
// Routing is now handled at the top of the middleware stack

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production" && process.env.VERCEL !== "1") {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.warn("Vite dev server failed to load, falling back to static (if available)");
    }
  } else if (process.env.VERCEL !== "1") {
    // Standard production serving (not Vercel)
    const distPath = path.join(process.cwd(), "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  }

  // Only listen if not in a serverless environment (like Vercel)
  if (process.env.VERCEL !== "1") {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;
