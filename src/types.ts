export interface NewsArticle {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  source: string;
  content: string;
  summary?: string;
  highlights?: string[];
  deepDive?: string;
  category: 'AI' | 'Tech' | 'Other';
  // Advanced Analytical Fields
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number; // 0 to 100 (0 = skeptical/negative, 50 = neutral, 100 = optimistic/positive)
  technicalDensity: 'low' | 'medium' | 'high';
  technicalDensityScore: number; // 0 to 100
  keyphrases: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface RSSFeed {
  id: string;
  name: string;
  url: string;
  category: string;
  active: boolean;
  isCustom?: boolean;
}

export interface KeyphraseSegment {
  id: string;
  name: string;
  phrases: string[];
  color: string;
}

export interface CompiledDigest {
  id: string;
  title: string;
  compiledAt: string;
  scheduleType: string;
  articlesCount: number;
  overallSentiment: string;
  overallSentimentScore: number;
  averageDensityScore: number;
  markdownContent: string;
  sourceFeeds: string[];
}

export interface AppSettings {
  geminiApiKey: string;
  feeds: {
    techcrunch: boolean;
    venturebeat: boolean;
    wired: boolean;
    hackernews: boolean;
  };
}

