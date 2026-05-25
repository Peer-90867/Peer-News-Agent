import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { 
  Zap, 
  Radio, 
  Plus, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  Play, 
  Check, 
  Activity, 
  Cpu,
  TrendingUp, 
  Brain, 
  Sliders, 
  Clock, 
  Copy, 
  Sparkles,
  RefreshCcw,
  BookOpen,
  ChevronRight,
  Info,
  ExternalLink
} from "lucide-react";
import { NewsArticle, RSSFeed, KeyphraseSegment, CompiledDigest } from "../types";
import Markdown from "react-markdown";

interface PeerOperationsCenterProps {
  news: NewsArticle[];
  fetchNews: () => Promise<void>;
  onArticleClick: (article: NewsArticle) => void;
  getRelativeTime: (dateStr: string) => string;
  lastFetchTime: string | null;
}

export default function PeerOperationsCenter({ 
  news, 
  fetchNews, 
  onArticleClick, 
  getRelativeTime,
  lastFetchTime
}: PeerOperationsCenterProps) {
  const [subTab, setSubTab] = useState<'stream' | 'visuals' | 'rss' | 'segments' | 'digests'>('stream');
  const [containerWidth, setContainerWidth] = useState(500);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;                

    const observer = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    observer.observe(container);
    
    return () => observer.disconnect();
  }, [subTab]);
  
  // RSS Feeds State - Initializing with defaults for better UX and deployment robustness
  const [feeds, setFeeds] = useState<RSSFeed[]>([
    { id: "techcrunch_ai", name: "TechCrunch AI", url: "https://techcrunch.com/category/artificial-intelligence/feed/", category: "News", active: true },
    { id: "verge_tech", name: "The Verge Tech", url: "https://www.theverge.com/rss/index.xml", category: "News", active: true },
    { id: "openai", name: "OpenAI Search", url: "https://news.google.com/rss/search?q=OpenAI&hl=en-US&gl=US&ceid=US:en", category: "AI Models", active: true },
    { id: "deepmind_gemini", name: "Google & Gemini", url: "https://news.google.com/rss/search?q=Google+DeepMind+OR+Gemini+AI&hl=en-US&gl=US&ceid=US:en", category: "AI Models", active: true },
    { id: "anthropic_claude", name: "Anthropic Claude", url: "https://news.google.com/rss/search?q=Anthropic+OR+Claude+AI&hl=en-US&gl=US&ceid=US:en", category: "AI Models", active: true },
    { id: "microsoft_copilot", name: "Microsoft Copilot", url: "https://news.google.com/rss/search?q=Microsoft+Copilot+OR+Microsoft+AI&hl=en-US&gl=US&ceid=US:en", category: "Big Tech", active: true },
    { id: "meta_llama", name: "Meta & Llama", url: "https://news.google.com/rss/search?q=Meta+Llama+OR+Meta+AI&hl=en-US&gl=US&ceid=US:en", category: "Open Source", active: true },
    { id: "mistral_cohere", name: "Mistral & Cohere", url: "https://news.google.com/rss/search?q=Mistral+AI+OR+Cohere+AI&hl=en-US&gl=US&ceid=US:en", category: "Open Source", active: true }
  ]);
  const [loadingFeeds, setLoadingFeeds] = useState(false);
  const [newFeedName, setNewFeedName] = useState("");
  const [newFeedUrl, setNewFeedUrl] = useState("");
  const [newFeedCategory, setNewFeedCategory] = useState("AI General");
  const [feedMessage, setFeedMessage] = useState<{ text: string; error: boolean } | null>(null);

  // Keyphrase Tracks State
  const [segments, setSegments] = useState<KeyphraseSegment[]>([
    { id: "ft-weights", name: "Models & Weights", phrases: ["fine-tune", "weights", "parameter", "lora", "llama"], color: "#ef233c" },
    { id: "agents-rag", name: "Agent Architectures", phrases: ["agent", "rag", "retrieval", "tool-calling", "workflow"], color: "#3a86ff" },
    { id: "hard-accel", name: "Accelerator Chips", phrases: ["nvidia", "gpu", "blackwell", "h100", "groq", "lpu"], color: "#8338ec" },
    { id: "big-frontiers", name: "Frontier Hype", phrases: ["gpt-o", "sora", "gemini", "claude", "o1", "deepseek"], color: "#ff006e" }
  ]);
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);
  const [newSegmentName, setNewSegmentName] = useState("");
  const [newSegmentPhrases, setNewSegmentPhrases] = useState("");
  const [newSegmentColor, setNewSegmentColor] = useState("#3a86ff");

  // Digests State
  const [digests, setDigests] = useState<CompiledDigest[]>([]);
  const [digestConfig, setDigestConfig] = useState({ scheduleType: "Daily (09:00)", active: true, lastRun: null });
  const [loadingDigests, setLoadingDigests] = useState(false);
  const [compilingDigest, setCompilingDigest] = useState(false);
  const [selectedDigest, setSelectedDigest] = useState<CompiledDigest | null>(null);
  const [copiedDigestId, setCopiedDigestId] = useState<string | null>(null);

  // Visuals Scatter states
  const [hoveredArticle, setHoveredArticle] = useState<NewsArticle | null>(null);
  const [visualSourceFilter, setVisualSourceFilter] = useState<string>("All");
  const [visualSentimentFilter, setVisualSentimentFilter] = useState<string>("All");
  const [visualDensityFilter, setVisualDensityFilter] = useState<string>("All");
  const [visualSearchTerm, setVisualSearchTerm] = useState<string>("");
  const [activeTimelineIdx, setActiveTimelineIdx] = useState<number | null>(null);

  // Load API Data on Mount
  useEffect(() => {
    fetchFeeds();
    fetchDigests();
    
    // Load custom user segments if exist
    const savedSegments = localStorage.getItem("keyphrase_segments");
    if (savedSegments) {
      try {
        setSegments(JSON.parse(savedSegments));
      } catch (e) {
        console.error("Failed to parse saved keyphrase tracks", e);
      }
    }
  }, []);

  const fetchFeeds = async () => {
    setLoadingFeeds(true);
    try {
      const res = await fetch("/api/feeds");
      const data = await res.json();
      setFeeds(data);
    } catch (e) {
      console.error("Failed to fetch feeds list", e);
    } finally {
      setLoadingFeeds(false);
    }
  };

  const fetchDigests = async () => {
    setLoadingDigests(true);
    try {
      const res = await fetch("/api/digests");
      const data = await res.json();
      setDigests(data.digests);
      setDigestConfig(data.config);
    } catch (e) {
      console.error("Failed to fetch digests telemetry", e);
    } finally {
      setLoadingDigests(false);
    }
  };

  // RSS Feed action helpers
  const handleAddFeed = async () => {
    if (!newFeedName || !newFeedUrl) {
      setFeedMessage({ text: "Please enter name and URL.", error: true });
      return;
    }
    setFeedMessage(null);
    try {
      const res = await fetch("/api/feeds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFeedName, url: newFeedUrl, category: newFeedCategory })
      });
      const data = await res.json();
      if (res.ok) {
        setFeedMessage({ text: `Succesfully registered [${data.feed.name}] search stream.`, error: false });
        setNewFeedName("");
        setNewFeedUrl("");
        fetchFeeds();
        fetchNews(); // refresh alive news stream
      } else {
        setFeedMessage({ text: data.error || "Failed to register feed.", error: true });
      }
    } catch (e: any) {
      setFeedMessage({ text: e.message || "Network request failed.", error: true });
    }
  };

  const handleToggleFeed = async (id: string) => {
    try {
      const res = await fetch("/api/feeds/toggle", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        fetchFeeds();
        fetchNews(); // Reload news immediately
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteFeed = async (id: string) => {
    if (!confirm("Are you sure you want to decouple this feed?")) return;
    try {
      const res = await fetch("/api/feeds", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        fetchFeeds();
        fetchNews();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Tracks segment action helpers
  const handleAddSegment = () => {
    if (!newSegmentName || !newSegmentPhrases) return;
    const phrases = newSegmentPhrases
      .split(",")
      .map(p => p.trim().toLowerCase())
      .filter(p => p.length > 0);
      
    const newSeg: KeyphraseSegment = {
      id: "seg-" + Date.now(),
      name: newSegmentName,
      phrases,
      color: newSegmentColor
    };
    
    const updated = [...segments, newSeg];
    setSegments(updated);
    localStorage.setItem("keyphrase_segments", JSON.stringify(updated));
    setNewSegmentName("");
    setNewSegmentPhrases("");
  };

  const handleDeleteSegment = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = segments.filter(s => s.id !== id);
    setSegments(updated);
    localStorage.setItem("keyphrase_segments", JSON.stringify(updated));
    if (activeSegmentId === id) setActiveSegmentId(null);
  };

  // Digest Action helper
  const handleCompileDigest = async () => {
    setCompilingDigest(true);
    try {
      const res = await fetch("/api/digests/compile-now", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        fetchDigests();
        setSelectedDigest(data.digest);
      } else {
        alert(data.error || "Failed compiling digest");
      }
    } catch (e: any) {
      alert("Error compiling digest: " + e.message);
    } finally {
      setCompilingDigest(false);
    }
  };

  const handleUpdateDigestSchedule = async (scheduleType: string) => {
    try {
      const res = await fetch("/api/digests/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduleType })
      });
      if (res.ok) {
        fetchDigests();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyDigest = (digest: CompiledDigest) => {
    navigator.clipboard.writeText(digest.markdownContent);
    setCopiedDigestId(digest.id);
    setTimeout(() => setCopiedDigestId(null), 2000);
  };

  // Filter global news based on active keyphrase track
  const activeSegment = segments.find(s => s.id === activeSegmentId);
  const filteredNews = activeSegment
    ? news.filter(item => {
        const fullText = `${item.title} ${item.content}`.toLowerCase();
        return activeSegment.phrases.some(phrase => fullText.includes(phrase));
      })
    : news;

  // Global Visuals scoring parameters
  const avgSentiment = news.length > 0 
    ? Math.round(news.reduce((acc, curr) => acc + (curr.sentimentScore || 50), 0) / news.length) 
    : 50;
  const avgDensity = news.length > 0 
    ? Math.round(news.reduce((acc, curr) => acc + (curr.technicalDensityScore || 32), 0) / news.length) 
    : 32;

  return (
    <div className="w-full space-y-4 pb-20 md:pb-0 px-2 md:px-0">
      {/* PEER OPERATIONS CENTER NAV BAR */}
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-white/10 md:static md:bg-transparent md:border-b-0 pb-2 md:pb-4 -mx-4 px-4">
        <div className="flex items-center justify-start gap-2 overflow-x-auto no-scrollbar py-3">
          {([
            { id: 'stream', label: 'Alive Stream', icon: Zap, color: 'text-accent-red' },
            { id: 'visuals', label: 'Visuals', icon: Activity, color: 'text-emerald-400' },
            { id: 'rss', label: 'Streamers', icon: Radio, color: 'text-blue-400' },
            { id: 'segments', label: 'Tracks', icon: Cpu, color: 'text-purple-400' },
            { id: 'digests', label: 'Compiler', icon: BookOpen, color: 'text-amber-400' }
          ] as const).map(tab => (
            <button 
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap border ${subTab === tab.id ? 'bg-accent-red border-accent-red text-white shadow-[0_0_15px_rgba(239,35,60,0.3)]' : 'text-zinc-500 hover:text-zinc-300 bg-white/5 border-white/5'}`}
            >
              <tab.icon className={`w-3.5 h-3.5 ${subTab === tab.id ? 'text-white' : tab.color}`} />
              {tab.label}
            </button>
          ))}
        </div>
        {lastFetchTime && (
          <div className="flex items-center gap-2 text-[8px] text-zinc-500 mt-1 font-mono uppercase tracking-widest pl-1">
            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
            Synchronized: {getRelativeTime(lastFetchTime)}
          </div>
        )}
      </div>

      {/* 1. ALIVE STREAM STREAM TAB */}
      {subTab === 'stream' && (
        <div className="grid sm:grid-cols-2 gap-6">
          {news.length === 0 ? (
            <div className="col-span-2 flex flex-col items-center justify-center py-24 text-center space-y-6">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center animate-pulse">
                <Radio className="w-8 h-8 text-zinc-700" />
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Search Feed Stream Inactive</h4>
                <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest max-w-xs mx-auto">
                  The network is currently not indexing fresh intel nodes. Verify your feed registrations in the Streamers manager.
                </p>
              </div>
              <button 
                onClick={() => fetchNews()}
                className="flex items-center gap-2 px-6 py-2.5 bg-accent-red/20 hover:bg-accent-red/30 text-accent-red text-[11px] font-bold uppercase tracking-widest rounded-full border border-accent-red/30 transition-all"
              >
                <RefreshCcw className="w-3.5 h-3.5" /> Re-Initialize Sync
              </button>
            </div>
          ) : (
            news.map((item, index) => {
              const sentimentColors = {
                positive: "text-green-500 border-green-500/20 bg-green-500/5",
                neutral: "text-zinc-500 border-zinc-500/20 bg-zinc-500/5",
                negative: "text-red-400 border-red-500/20 bg-red-400/5"
              };
              const densityColors = {
                low: "text-blue-400 border-blue-500/10 bg-blue-500/5",
                medium: "text-indigo-400 border-indigo-500/10 bg-indigo-500/5",
                high: "text-purple-400 border-purple-500/20 bg-purple-500/5 shadow-[0_0_8px_rgba(131,56,236,0.2)]"
              };

              return (
                <motion.div
                  key={`${item.id}-${index}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  whileHover={{ y: -8, borderColor: "rgba(239, 35, 60, 0.4)", backgroundColor: "rgba(18, 18, 18, 0.9)" }}
                  onClick={() => onArticleClick(item)}
                  className="group glass-card p-6 cursor-pointer flex flex-col justify-between border border-white/5 bg-zinc-950/40 relative overflow-hidden h-full"
                >
                  {/* Subtle Scanline Effect */}
                  <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_2px,3px_100%] opacity-20" />
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold text-accent-red bg-accent-red/10 px-2.5 py-0.5 rounded uppercase tracking-[0.15em] self-start flex items-center gap-1.5">
                          <Radio className="w-2.5 h-2.5" />
                          {item.source}
                        </span>
                        <span className="text-[10px] text-zinc-600 font-mono flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {getRelativeTime(item.pubDate)}
                        </span>
                      </div>
                      
                      {item.link && (
                        <div className="flex items-center gap-1">
                          <a 
                            href={item.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 bg-white/5 hover:bg-accent-red/20 rounded-full text-zinc-500 hover:text-accent-red transition-all group/link border border-white/5"
                            title="Intelligence Source Link"
                          >
                            <ExternalLink className="w-3.5 h-3.5 group-hover/link:scale-110" />
                          </a>
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-md font-semibold leading-snug group-hover:text-accent-red transition-colors mb-4 line-clamp-3">
                      {item.title}
                    </h3>
                  </div>

                  <div className="relative z-10 space-y-4 pt-4 border-t border-white/5 mt-auto">
                    {/* Inline Analyticals */}
                    <div className="flex flex-wrap gap-2">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${sentimentColors[item.sentiment || 'neutral']} uppercase tracking-wider`}>
                        {item.sentiment === 'positive' ? "Bullish" : item.sentiment === 'negative' ? "Skeptical" : "Neutral"} ({item.sentimentScore || 50}%)
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${densityColors[item.technicalDensity || 'medium']} uppercase tracking-wider`}>
                        Density {item.technicalDensityScore || 32}% ({item.technicalDensity || 'medium'})
                      </span>
                    </div>

                    {/* Extracted tags */}
                    {item.keyphrases && item.keyphrases.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.keyphrases.slice(0, 3).map((kp, kIdx) => (
                          <span key={kIdx} className="text-[8px] font-mono text-zinc-500 bg-white/5 border border-white/14 px-1.5 py-0.2 rounded uppercase">
                            {kp}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* 2. VISUAL INSIGHTS TAB */}
      {subTab === 'visuals' && (() => {
        // Compute dynamically for filtered subset
        const uniqueSources = Array.from(new Set(news.map(n => n.source)));
        
        const visualFilteredNews = news.filter(item => {
          if (visualSearchTerm) {
            const query = visualSearchTerm.toLowerCase();
            const matchText = `${item.title} ${item.content} ${item.source}`.toLowerCase();
            if (!matchText.includes(query)) return false;
          }
          if (visualSourceFilter !== "All" && item.source !== visualSourceFilter) return false;
          if (visualSentimentFilter !== "All" && item.sentiment !== visualSentimentFilter) return false;
          if (visualDensityFilter !== "All" && item.technicalDensity !== visualDensityFilter) return false;
          return true;
        });

        // Compute local visual statistics
        const localAvgSentiment = visualFilteredNews.length > 0 
          ? Math.round(visualFilteredNews.reduce((acc, curr) => acc + (curr.sentimentScore || 50), 0) / visualFilteredNews.length) 
          : 0;
        
        const localAvgDensity = visualFilteredNews.length > 0
          ? Math.round(visualFilteredNews.reduce((acc, curr) => acc + (curr.technicalDensityScore || 32), 0) / visualFilteredNews.length)
          : 0;

        // Group by Source Statistics Matrix
        const sourceMatrices = uniqueSources.map(src => {
          const srcNews = news.filter(n => n.source === src);
          const vol = srcNews.length;
          const avgSent = vol > 0 ? Math.round(srcNews.reduce((a, c) => a + (c.sentimentScore || 50), 0) / vol) : 50;
          const avgDens = vol > 0 ? Math.round(srcNews.reduce((a, c) => a + (c.technicalDensityScore || 32), 0) / vol) : 32;
          return { name: src, volume: vol, sentiment: avgSent, density: avgDens };
        }).sort((a, b) => b.volume - a.volume);

        // Group timeline chronologically
        const chronNews = [...visualFilteredNews].sort((a, b) => new Date(a.pubDate).getTime() - new Date(b.pubDate).getTime());
        
        // Match standard category triggers
        const categoryCounts = {
          models: news.filter(n => /model|weights|parameter|llama|deepseek|claude|gemini|gpt/i.test(n.title + " " + n.content)).length,
          hardware: news.filter(n => /nvidia|gpu|blackwell|h100|groq|accelerator|silicon|chip/i.test(n.title + " " + n.content)).length,
          agents: news.filter(n => /agent|rag|retrieval|tool|workflow|orchestration/i.test(n.title + " " + n.content)).length,
          openSource: news.filter(n => /open-source|weights|github|repository|hf|hugging/i.test(n.title + " " + n.content)).length
        };
        const maxCatCount = Math.max(...Object.values(categoryCounts), 1);

        // SVG graphing math
        const timelineWidth = containerWidth;
        const timelineHeight = 150;
        const tPadLeft = 40;
        const tPadRight = 20;
        const tPadTop = 20;
        const tPadBottom = 30;

        const chartW = timelineWidth - tPadLeft - tPadRight;
        const chartH = timelineHeight - tPadTop - tPadBottom;

        const N = chronNews.length;
        const timelineCoordinates = chronNews.map((item, idx) => {
          const x = tPadLeft + (N > 1 ? (idx / (N - 1)) * chartW : chartW / 2);
          const ySent = tPadTop + chartH - ((item.sentimentScore || 50) / 100) * chartH;
          const yComp = tPadTop + chartH - ((item.technicalDensityScore || 32) / 100) * chartH;
          return { item, x, ySent, yComp, idx };
        });

        // Path generation
        const sentimentPath = N > 0 ? `M ${timelineCoordinates[0].x},${timelineCoordinates[0].ySent} ` + timelineCoordinates.slice(1).map(p => `L ${p.x},${p.ySent}`).join(" ") : "";
        const complexityPath = N > 0 ? `M ${timelineCoordinates[0].x},${timelineCoordinates[0].yComp} ` + timelineCoordinates.slice(1).map(p => `L ${p.x},${p.yComp}`).join(" ") : "";
        
        const sentimentArea = N > 0 
          ? `M ${timelineCoordinates[0].x},${tPadTop + chartH} ` + timelineCoordinates.map(p => `L ${p.x},${p.ySent}`).join(" ") + ` L ${timelineCoordinates[timelineCoordinates.length - 1].x},${tPadTop + chartH} Z`
          : "";
        const complexityArea = N > 0
          ? `M ${timelineCoordinates[0].x},${tPadTop + chartH} ` + timelineCoordinates.map(p => `L ${p.x},${p.yComp}`).join(" ") + ` L ${timelineCoordinates[timelineCoordinates.length - 1].x},${tPadTop + chartH} Z`
          : "";

        return (
          <div id="visual-insights-section" className="space-y-8 animate-in fade-in duration-300">
            {/* ANALYTICAL FILTER & SEARCH BAR */}
            <div id="visual-filter-matrix" className="glass-panel p-5 border-white/5 space-y-4 bg-zinc-950/60 rounded-2xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-accent-red animate-pulse" />
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-white">Interactive Research Filter Matrix</h5>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Tune criteria settings to isolate complex stream relationships</p>
                  </div>
                </div>

                {/* Reset button */}
                {(visualSourceFilter !== "All" || visualSentimentFilter !== "All" || visualDensityFilter !== "All" || visualSearchTerm !== "") && (
                  <button
                    id="reset-visual-filters-btn"
                    onClick={() => {
                      setVisualSourceFilter("All");
                      setVisualSentimentFilter("All");
                      setVisualDensityFilter("All");
                      setVisualSearchTerm("");
                      setActiveTimelineIdx(null);
                    }}
                    className="self-start md:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-accent-red/20 hover:bg-accent-red/30 text-accent-red text-[10px] font-bold uppercase tracking-wider rounded-lg border border-accent-red/30 transition-all cursor-pointer"
                  >
                    <RefreshCcw className="w-3 h-3" /> Reset Signal Filters
                  </button>
                )}
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
                {/* Search text filter */}
                <div className="space-y-1">
                  <label className="text-[8px] font-bold uppercase text-zinc-400 font-mono tracking-widest">Query Matches</label>
                  <input
                    id="visual-search-input"
                    type="text"
                    value={visualSearchTerm}
                    onChange={(e) => setVisualSearchTerm(e.target.value)}
                    placeholder="Search keywords..."
                    className="w-full bg-black/80 border border-white/10 focus:border-accent-red text-xs px-3 py-2 rounded-lg text-zinc-300 outline-none transition-all placeholder:text-zinc-650"
                  />
                </div>

                {/* Source filter */}
                <div className="space-y-1">
                  <label className="text-[8px] font-bold uppercase text-zinc-400 font-mono tracking-widest">Source Registry</label>
                  <select
                    id="visual-source-select"
                    value={visualSourceFilter}
                    onChange={(e) => setVisualSourceFilter(e.target.value)}
                    className="w-full bg-black/85 border border-white/10 focus:border-accent-red text-xs px-3 py-2 rounded-lg text-zinc-350 outline-none cursor-pointer"
                  >
                    <option value="All">All Stream Sources</option>
                    {uniqueSources.map(src => (
                      <option key={src} value={src}>{src}</option>
                    ))}
                  </select>
                </div>

                {/* Sentiment filter */}
                <div className="space-y-1">
                  <label className="text-[8px] font-bold uppercase text-zinc-400 font-mono tracking-widest">Optimism Index</label>
                  <select
                    id="visual-sentiment-select"
                    value={visualSentimentFilter}
                    onChange={(e) => setVisualSentimentFilter(e.target.value)}
                    className="w-full bg-black/85 border border-white/10 focus:border-accent-red text-xs px-3 py-2 rounded-lg text-zinc-350 outline-none cursor-pointer"
                  >
                    <option value="All">All Sentiments</option>
                    <option value="positive">Bullish (Optimistic)</option>
                    <option value="neutral">Neutral (Objective)</option>
                    <option value="negative">Skeptical (Critical)</option>
                  </select>
                </div>

                {/* Density filter */}
                <div className="space-y-1">
                  <label className="text-[8px] font-bold uppercase text-zinc-400 font-mono tracking-widest">Technical Density</label>
                  <select
                    id="visual-density-select"
                    value={visualDensityFilter}
                    onChange={(e) => setVisualDensityFilter(e.target.value)}
                    className="w-full bg-black/85 border border-white/10 focus:border-accent-red text-xs px-3 py-2 rounded-lg text-zinc-350 outline-none cursor-pointer"
                  >
                    <option value="All">All Complexities</option>
                    <option value="high">Deep Technical (High)</option>
                    <option value="medium">Standard (Medium)</option>
                    <option value="low">Commercial/General (Low)</option>
                  </select>
                </div>
              </div>

              {/* Status metrics bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-3.5 text-[10px] font-mono text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-zinc-650" /> ISOLATED SIGNALS: <b className="text-zinc-300">{visualFilteredNews.length}</b> OF <b className="text-zinc-400">{news.length}</b> INTEL NODES
                </span>
                
                {visualFilteredNews.length > 0 && (
                  <div className="flex gap-4">
                    <span>FILTERED OPTIMISM: <b className="text-emerald-400">{localAvgSentiment}%</b></span>
                    <span>FILTERED DEPTH: <b className="text-purple-400">{localAvgDensity}%</b></span>
                  </div>
                )}
              </div>
            </div>

            {visualFilteredNews.length === 0 ? (
              <div id="visual-empty-signals" className="glass-panel p-16 text-center border-dashed border-white/10">
                <Info className="w-12 h-12 text-accent-red mx-auto mb-4 animate-pulse opacity-60" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-300">No Isolated Signatures Captured</h4>
                <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">No feeds correlate with your active query criteria. Try adjusting your sidebar selectors or register more RSS channels.</p>
              </div>
            ) : (
              <>
                {/* Visual Dymamic Index Meters & Quick Insights */}
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Dial 1 */}
                  <div className="glass-panel p-6 border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden bg-zinc-950/40">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-accent-red">
                      <Brain className="w-24 h-24" />
                    </div>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">OPTIMISM COEFFICIENT</p>
                    
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90">
                        <defs>
                          <linearGradient id="optGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#34d399" />
                          </linearGradient>
                        </defs>
                        <circle cx="64" cy="64" r="52" className="stroke-white/5 fill-none" strokeWidth="7" />
                        <circle 
                          cx="64" 
                          cy="64" 
                          r="52" 
                          className="fill-none transition-all duration-1000" 
                          stroke="url(#optGrad)"
                          strokeWidth="7" 
                          strokeDasharray={326.7}
                          strokeDashoffset={326.7 - (326.7 * localAvgSentiment) / 100}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-3xl font-display font-medium text-white tabular-nums">{localAvgSentiment}%</span>
                        <span className="text-[8px] text-emerald-400 font-mono tracking-widest uppercase">
                          {localAvgSentiment > 58 ? "BULLISH" : localAvgSentiment < 42 ? "CRITICAL" : "OBJECTIVE"}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-1.5 text-[9px] font-mono text-zinc-400 bg-white/5 border border-white/5 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Range: Standard Deviation Stable
                    </div>
                  </div>

                  {/* Dial 2 */}
                  <div className="glass-panel p-6 border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden bg-zinc-950/40">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-accent-red">
                      <Activity className="w-24 h-24" />
                    </div>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">TECHNICAL DENSITY</p>
                    
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90">
                        <defs>
                          <linearGradient id="densGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#8338ec" />
                            <stop offset="100%" stopColor="#a78bfa" />
                          </linearGradient>
                        </defs>
                        <circle cx="64" cy="64" r="52" className="stroke-white/5 fill-none" strokeWidth="7" />
                        <circle 
                          cx="64" 
                          cy="64" 
                          r="52" 
                          className="fill-none transition-all duration-1000" 
                          stroke="url(#densGrad)"
                          strokeWidth="7" 
                          strokeDasharray={326.7}
                          strokeDashoffset={326.7 - (326.7 * localAvgDensity) / 100}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-3xl font-display font-medium text-white tabular-nums">{localAvgDensity}%</span>
                        <span className="text-[8px] text-purple-400 font-mono tracking-widest uppercase">
                          {localAvgDensity > 65 ? "DEEP MATH" : localAvgDensity < 35 ? "CONSUMER" : "REGULAR"}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-1.5 text-[9px] font-mono text-zinc-400 bg-white/5 border border-white/5 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" /> Accelerator Code Weighted
                    </div>
                  </div>

                  {/* High Quality Category Metrics list */}
                  <div className="glass-panel p-5 border-white/5 bg-zinc-950/30 flex flex-col justify-between">
                    <div>
                      <h6 className="text-[10px] font-bold text-white uppercase tracking-widest mb-3.5 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-accent-red" /> Category Distribution
                      </h6>
                      
                      <div className="space-y-3">
                        {/* Models */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className="text-zinc-400">🤖 Models & Architecture</span>
                            <span className="text-zinc-300 font-bold">{categoryCounts.models} matches</span>
                          </div>
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-accent-red transition-all duration-500" style={{ width: `${(categoryCounts.models / maxCatCount) * 100}%` }} />
                          </div>
                        </div>

                        {/* Hardware */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className="text-zinc-400">⚡ Chips & Hardware Accel</span>
                            <span className="text-zinc-300 font-bold">{categoryCounts.hardware} matches</span>
                          </div>
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${(categoryCounts.hardware / maxCatCount) * 100}%` }} />
                          </div>
                        </div>

                        {/* Agents */}
                        <div className="space-y-1 font-sans">
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className="text-zinc-400">🔮 Agentic RAG Systems</span>
                            <span className="text-zinc-300 font-bold">{categoryCounts.agents} matches</span>
                          </div>
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${(categoryCounts.agents / maxCatCount) * 100}%` }} />
                          </div>
                        </div>

                        {/* Open Weight */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className="text-zinc-400">🧬 Open Weight & OSS</span>
                            <span className="text-zinc-300 font-bold">{categoryCounts.openSource} matches</span>
                          </div>
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${(categoryCounts.openSource / maxCatCount) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] text-zinc-500 font-mono italic pt-3 mt-3 border-t border-white/5">
                      ✓ Relative indices auto-computed by semantic keyword density
                    </div>
                  </div>
                </div>

                {/* THE NEW MASTER TREND AREA CHART: SENTIMENT & COMPLEXITY VELOCITY TIMELINE */}
                <div id="visual-timeline-chart-panel" className="glass-panel p-6 border-white/5 bg-zinc-950/20 rounded-2xl relative">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-450 mb-0.5 font-mono">Stream Velocity timeline</h4>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-accent-red" /> Chronological Signal Sentiment & Complexity Trend
                    </h3>
                  </div>

                  {timelineCoordinates.length < 2 ? (
                    <div className="text-center py-12 text-zinc-500 font-mono text-xs">
                      ⚡ Timeline velocity analysis requires at least two points. Add or enable more feeds.
                    </div>
                  ) : (
                    <div className="grid lg:grid-cols-12 gap-6 items-center">
                      <div ref={containerRef} className="lg:col-span-8 bg-black/60 border border-white/5 p-4 rounded-xl relative">
                        {/* Area Chart Container */}
                        <div className="w-full h-[180px] relative">
                          <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${timelineWidth} ${timelineHeight}`} preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="timelineOptGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                              </linearGradient>
                              <linearGradient id="timelineDensGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#8338ec" stopOpacity="0.25" />
                                <stop offset="100%" stopColor="#8338ec" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>

                            {/* Background Guides Grid */}
                            <line x1={tPadLeft} y1={tPadTop} x2={timelineWidth - tPadRight} y2={tPadTop} className="stroke-zinc-850" strokeWidth="0.5" strokeDasharray="3 3" />
                            <line x1={tPadLeft} y1={tPadTop + chartH / 2} x2={timelineWidth - tPadRight} y2={tPadTop + chartH / 2} className="stroke-zinc-850" strokeWidth="0.5" strokeDasharray="3 3" />
                            <line x1={tPadLeft} y1={tPadTop + chartH} x2={timelineWidth - tPadRight} y2={tPadTop + chartH} className="stroke-zinc-800" strokeWidth="0.5" />

                            {/* Areas filled */}
                            {sentimentArea && <path d={sentimentArea} className="fill-url(#timelineOptGrad) transition-all duration-300" />}
                            {complexityArea && <path d={complexityArea} className="fill-url(#timelineDensGrad) transition-all duration-300" />}

                            {/* Line Paths drawn */}
                            {sentimentPath && (
                              <path 
                                d={sentimentPath} 
                                className="fill-none stroke-emerald-500 transition-all duration-300" 
                                strokeWidth="2.2" 
                                strokeLinecap="round" 
                              />
                            )}
                            {complexityPath && (
                              <path 
                                d={complexityPath} 
                                className="fill-none stroke-purple-500 transition-all duration-300" 
                                strokeWidth="2.2" 
                                strokeLinecap="round" 
                              />
                            )}

                            {/* Vertical focus bar on hover */}
                            {activeTimelineIdx !== null && timelineCoordinates[activeTimelineIdx] && (
                              <line
                                x1={timelineCoordinates[activeTimelineIdx].x}
                                y1={tPadTop}
                                x2={timelineCoordinates[activeTimelineIdx].x}
                                y2={tPadTop + chartH}
                                className="stroke-white/30"
                                strokeWidth="1"
                                strokeDasharray="2 2"
                              />
                            )}

                            {/* Hover Overlay triggers & circle points */}
                            {timelineCoordinates.map((pt, idx) => {
                              const isHovered = activeTimelineIdx === idx;
                              return (
                                <g key={`timeline-node-${idx}`}>
                                  {/* Hover Trigger Target block */}
                                  <rect
                                    x={pt.x - (chartW / N) / 2}
                                    y={tPadTop}
                                    width={chartW / N}
                                    height={chartH}
                                    className="fill-transparent cursor-pointer"
                                    onMouseEnter={() => {
                                      setActiveTimelineIdx(idx);
                                      setHoveredArticle(pt.item);
                                    }}
                                  />
                                  
                                  {/* Draw nodes */}
                                  <circle 
                                    cx={pt.x} 
                                    cy={pt.ySent} 
                                    r={isHovered ? "4" : "2"} 
                                    className="fill-zinc-950 stroke-emerald-400 cursor-pointer transition-all duration-200" 
                                    strokeWidth="1.5"
                                  />
                                  <circle 
                                    cx={pt.x} 
                                    cy={pt.yComp} 
                                    r={isHovered ? "4" : "2"} 
                                    className="fill-zinc-950 stroke-purple-400 cursor-pointer transition-all duration-200" 
                                    strokeWidth="1.5"
                                  />
                                </g>
                              );
                            })}

                            {/* Axes markers */}
                            <text x={10} y={tPadTop + 5} className="text-[7px] fill-zinc-600 font-mono text-left">100%</text>
                            <text x={10} y={tPadTop + chartH / 2 + 3} className="text-[7px] fill-zinc-600 font-mono text-left">50%</text>
                            <text x={10} y={tPadTop + chartH + 3} className="text-[7px] fill-zinc-600 font-mono text-left">0%</text>

                            {/* Date ticks */}
                            {timelineCoordinates.filter((_, i) => i === 0 || i === Math.floor(N / 2) || i === N - 1).map((pt, idx) => {
                              const date = new Date(pt.item.pubDate);
                              const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                              return (
                                <text 
                                  key={`tick-${idx}`} 
                                  x={pt.x} 
                                  y={tPadTop + chartH + 15} 
                                  className="text-[7.5px] fill-zinc-500 font-mono text-center"
                                  textAnchor="middle"
                                >
                                  {label}
                                </text>
                              );
                            })}
                          </svg>
                        </div>
                      </div>

                      {/* Timeline dynamic commentary breakdown panel */}
                      <div className="lg:col-span-4 p-5 bg-zinc-950/70 border border-white/5 rounded-2xl space-y-4">
                        <span className="text-[8px] text-accent-red font-mono font-bold tracking-widest uppercase bg-accent-red/10 border border-accent-red/15 px-2 py-0.5 rounded">
                          Velocity Synopsis
                        </span>

                        {activeTimelineIdx !== null && timelineCoordinates[activeTimelineIdx] ? (
                          <div className="space-y-3">
                            <p className="text-[9px] font-mono text-zinc-500">SELECTED TELEMETRY NODE // INDEX [{activeTimelineIdx}]</p>
                            
                            <h6 className="text-xs font-bold text-zinc-100 line-clamp-2">
                              {timelineCoordinates[activeTimelineIdx].item.title}
                            </h6>

                            <div className="space-y-1.5 pt-2 border-t border-white/5 text-[10px] font-mono">
                              <div className="flex justify-between">
                                <span className="text-zinc-500">Publication:</span>
                                <span className="text-zinc-300">{new Date(timelineCoordinates[activeTimelineIdx].item.pubDate).toLocaleDateString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-500">Source:</span>
                                <span className="text-zinc-200 font-bold">{timelineCoordinates[activeTimelineIdx].item.source}</span>
                              </div>
                              <div className="flex justify-between items-center bg-emerald-500/5 px-2 py-1 rounded">
                                <span className="text-emerald-500 font-bold">Optimism Score:</span>
                                <span className="text-emerald-400 font-bold">{timelineCoordinates[activeTimelineIdx].item.sentimentScore}%</span>
                              </div>
                              <div className="flex justify-between items-center bg-purple-500/5 px-2 py-1 rounded">
                                <span className="text-purple-500 font-bold">Density Score:</span>
                                <span className="text-purple-400 font-bold">{timelineCoordinates[activeTimelineIdx].item.technicalDensityScore}%</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2 text-zinc-400 text-xs">
                            <TrendingUp className="w-6 h-6 text-accent-red stroke-[1.5]" />
                            <p className="font-mono text-[9px] text-zinc-500 uppercase">Interactive Timeline Active</p>
                            <p className="leading-relaxed">
                              Hover your cursor along the area lines to trace chronological sentiment shifts and complex code weight transitions across individual data points.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Source Matrix spectrum comparison */}
                <div id="source-performance-comparison-panel" className="glass-panel p-6 border-white/5 bg-zinc-950/20 rounded-2xl">
                  <div className="mb-4">
                    <h4 className="text-xs font-bold text-accent-red uppercase tracking-widest font-mono">Source performance comparisons</h4>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mt-0.5">Stream Source Metrics Matrix</h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="border-b border-white/10 text-zinc-500 pb-2">
                          <th className="py-2.5 uppercase tracking-wider font-bold">Stream Source</th>
                          <th className="py-2.5 uppercase tracking-wider font-bold text-center">Node Volume</th>
                          <th className="py-2.5 uppercase tracking-wider font-bold">Avg Sentiment Index</th>
                          <th className="py-2.5 uppercase tracking-wider font-bold">Technical Complexity Ratio</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {sourceMatrices.map((matrix, mIdx) => (
                          <tr key={`matrix-item-${mIdx}`} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-3 font-semibold text-zinc-250 font-sans flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-accent-red" />
                              {matrix.name}
                            </td>
                            <td className="py-3 text-center text-zinc-400 font-bold">{matrix.volume} articles</td>
                            <td className="py-3">
                              <div className="flex items-center gap-3">
                                <span className="w-7 text-right tabular-nums font-bold" style={{ color: matrix.sentiment >= 55 ? '#10b981' : matrix.sentiment <= 45 ? '#f87171' : '#a1a1aa' }}>
                                  {matrix.sentiment}%
                                </span>
                                <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500" style={{ width: `${matrix.sentiment}%` }} />
                                </div>
                              </div>
                            </td>
                            <td className="py-3">
                              <div className="flex items-center gap-3">
                                <span className="w-7 text-right tabular-nums text-purple-400 font-bold">{matrix.density}%</span>
                                <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden">
                                  <div className="h-full bg-purple-500" style={{ width: `${matrix.density}%` }} />
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        );
      })()}

      {/* 3. RSS FEED MANAGER TAB */}
      {subTab === 'rss' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* New Feed form Panel */}
          <div className="glass-panel p-6 border-white/5 bg-accent-red/[0.01]">
            <h4 className="text-xs font-bold text-accent-red uppercase tracking-widest mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Register New RSS Intelligence Link
            </h4>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Topic Name</label>
                <input 
                  type="text" 
                  value={newFeedName}
                  onChange={(e) => setNewFeedName(e.target.value)}
                  placeholder="e.g. Nvidia Blackwell"
                  className="w-full bg-black border border-white/10 focus:border-accent-red outline-none text-xs px-3 py-2.5 rounded-lg text-zinc-300"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Search URL / Feed Query</label>
                <input 
                  type="text" 
                  value={newFeedUrl}
                  onChange={(e) => setNewFeedUrl(e.target.value)}
                  placeholder="Insert feed link URL..."
                  className="w-full bg-black border border-white/10 focus:border-accent-red outline-none text-xs px-3 py-2.5 rounded-lg text-zinc-300"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Stream Category</label>
                <div className="flex gap-2">
                  <select 
                    value={newFeedCategory}
                    onChange={(e) => setNewFeedCategory(e.target.value)}
                    className="flex-1 bg-black border border-white/10 focus:border-accent-red outline-none text-xs px-3 py-2.5 rounded-lg text-zinc-400 font-bold uppercase tracking-wider cursor-pointer"
                  >
                    <option value="AI Models">AI Models</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Open Source">Open Source</option>
                    <option value="Big Tech">Big Tech</option>
                    <option value="General AI">General AI</option>
                  </select>
                  <button
                    onClick={handleAddFeed}
                    className="px-6 py-2.5 bg-accent-red hover:bg-red-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-colors shadow-[0_0_12px_rgba(239,35,60,0.3)]"
                  >
                    Register
                  </button>
                </div>
              </div>
            </div>

            {feedMessage && (
              <p className={`text-[10px] font-bold font-mono mt-3 uppercase ${feedMessage.error ? 'text-red-400' : 'text-green-400'}`}>
                {feedMessage.error ? "⚠️ " : "✓ "} {feedMessage.text}
              </p>
            )}
          </div>

          {/* Active Feeds List */}
          <div className="lg:col-span-12 glass-panel p-6 border-white/5">
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <h4 className="text-sm font-bold font-display uppercase tracking-widest">Active Intelligence Streamers</h4>
              <button 
                onClick={fetchFeeds}
                className="p-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-zinc-400"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {loadingFeeds ? (
              <div className="py-12 flex justify-center text-zinc-600 font-mono text-xs">
                📡 DECRYPTING SECURE NODE FEEDS...
              </div>
            ) : (
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {feeds.map((feed) => (
                  <div 
                    key={feed.id}
                    className="p-3 bg-zinc-950 border border-white/5 rounded-xl flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${feed.active ? 'bg-accent-red/10 text-accent-red' : 'bg-zinc-800 text-zinc-500'}`}>
                        <Radio className="w-4 h-4 animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h6 className={`text-xs font-bold ${feed.active ? 'text-white' : 'text-zinc-500'}`}>{feed.name}</h6>
                          <span className="text-[8px] font-mono text-zinc-600 bg-white/5 border border-white/10 px-1 py-0.2 rounded uppercase">
                            {feed.category}
                          </span>
                        </div>
                        <p className="text-[9px] text-zinc-600 font-mono line-clamp-1 mt-0.5">{feed.url}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-right">
                      <button
                        onClick={() => handleToggleFeed(feed.id)}
                        className={`p-1 hover:bg-white/5 rounded-lg transition-colors ${feed.active ? 'text-accent-red' : 'text-zinc-500'}`}
                      >
                        {feed.active ? <ToggleRight className="w-6 h-6 stroke-[1.5]" /> : <ToggleLeft className="w-6 h-6 stroke-[1.5]" />}
                      </button>

                      {feed.isCustom && (
                        <button
                          onClick={() => handleDeleteFeed(feed.id)}
                          className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. KEYPHRASE TRACKS TAB */}
      {subTab === 'segments' && (
        <div className="grid lg:grid-cols-12 gap-8 animate-in fade-in duration-300">
          <div className="lg:col-span-4 space-y-6">
            {/* Create Track Form */}
            <div className="glass-panel p-5 border-white/5">
              <h5 className="text-xs font-bold uppercase tracking-widest text-white mb-4">Add Custom Segment Track</h5>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Segment Label</label>
                  <input 
                    type="text" 
                    value={newSegmentName}
                    onChange={(e) => setNewSegmentName(e.target.value)}
                    placeholder="e.g. Agentic Systems"
                    className="w-full bg-black border border-white/10 focus:border-accent-red outline-none text-xs px-3 py-2 rounded-lg"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Keyphrases (comma separated)</label>
                  <input 
                    type="text" 
                    value={newSegmentPhrases}
                    onChange={(e) => setNewSegmentPhrases(e.target.value)}
                    placeholder="e.g. agent, multi-agent, planning"
                    className="w-full bg-black border border-white/10 focus:border-accent-red outline-none text-xs px-3 py-2 rounded-lg"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Accent Theme Color</label>
                  <div className="flex gap-2">
                    {["#ef233c", "#3a86ff", "#8338ec", "#ff006e", "#f77f00", "#10b981"].map((c) => (
                      <button 
                        key={c}
                        onClick={() => setNewSegmentColor(c)}
                        className={`w-6 h-6 rounded-full transition-all border ${newSegmentColor === c ? 'scale-125 border-white' : 'border-transparent'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleAddSegment}
                  className="w-full py-2 bg-accent-red hover:bg-red-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 mt-2"
                >
                  <Plus className="w-3.5 h-3.5" /> Initialize Track
                </button>
              </div>
            </div>

            {/* List segments */}
            <div className="glass-panel p-5 border-white/5">
              <h5 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 font-mono">My active track lists</h5>
              
              <div className="space-y-2">
                <div 
                  onClick={() => setActiveSegmentId(null)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${!activeSegmentId ? 'bg-accent-red/10 border-accent-red text-white' : 'bg-transparent border-white/5 text-zinc-500 hover:text-zinc-300'}`}
                >
                  <span className="text-xs font-bold uppercase tracking-wider">🔥 Standard Global Feed</span>
                  <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded font-mono">{news.length}</span>
                </div>

                {segments.map((seg) => {
                  const isActive = activeSegmentId === seg.id;
                  const count = news.filter(item => {
                    const fullText = `${item.title} ${item.content}`.toLowerCase();
                    return seg.phrases.some(p => fullText.includes(p));
                  }).length;

                  return (
                    <div 
                      key={seg.id}
                      onClick={() => setActiveSegmentId(seg.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${isActive ? 'bg-zinc-900 text-white shadow-md' : 'bg-transparent border-white/5 text-zinc-500 hover:text-zinc-300'}`}
                      style={{ borderColor: isActive ? seg.color : "" }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
                        <span className="text-xs font-bold uppercase tracking-wider">{seg.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded font-mono">{count}</span>
                        <button 
                          onClick={(e) => handleDeleteSegment(seg.id, e)}
                          className="p-1 text-zinc-600 hover:text-red-400 rounded transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 flex flex-col justify-between">
            {activeSegment && (
              <div className="mb-6 p-4 glass-panel border shadow-lg relative overflow-hidden" style={{ borderColor: activeSegment.color + "33" }}>
                <div className="absolute right-0 top-0 p-4 opacity-[0.03]" style={{ color: activeSegment.color }}>
                  <TrendingUp className="w-20 h-20" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: activeSegment.color }} />
                  <h4 className="text-md font-bold uppercase tracking-wider text-white font-display">
                    {activeSegment.name} Track Active
                  </h4>
                </div>
                <p className="text-[10px] text-zinc-500 font-mono mt-1 uppercase">
                  Target parameters: [{activeSegment.phrases.join(", ")}]
                </p>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-6 flex-1 h-fit">
              {filteredNews.length === 0 ? (
                <div className="col-span-2 text-center py-20 text-zinc-600 font-mono text-xs">
                  🧬 NO CORRELATING DATA CAPTURED RELATING TO THE ACTIVE PHRASES METRIC.
                </div>
              ) : (
                filteredNews.map((item, index) => (
                  <motion.div
                    key={`${item.id}-${index}`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    onClick={() => onArticleClick(item)}
                    className="group glass-card p-5 cursor-pointer bg-black flex flex-col justify-between border border-white/5 hover:border-white/20 transition-all duration-300"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-bold text-accent-red bg-accent-red/5 px-2 py-0.5 rounded uppercase tracking-wider">{item.source}</span>
                        <span className="text-[9px] text-zinc-600 font-mono">{getRelativeTime(item.pubDate)}</span>
                      </div>
                      <h3 className="text-sm font-semibold leading-snug group-hover:text-accent-red transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 pt-3 mt-3 border-t border-white/5 justify-between">
                      <span className="text-[8px] text-zinc-500 font-mono uppercase tracking-widest flex items-center gap-1">
                        <Cpu className="w-3 h-3 text-accent-red" /> Ready for Analysis
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-accent-red transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. SCHEDULED DIGEST COMPILER TAB */}
      {subTab === 'digests' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {selectedDigest ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-8 border-accent-red/20 relative"
            >
              <button 
                onClick={() => setSelectedDigest(null)}
                className="absolute top-6 right-6 px-4 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors"
              >
                Close Report
              </button>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-accent-red flex items-center justify-center text-white shadow-[0_0_15px_rgba(239,35,60,0.4)]">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold bg-accent-red/10 border border-accent-red/20 text-accent-red px-2 py-0.5 rounded uppercase tracking-widest">
                      {selectedDigest.scheduleType} Compilation
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">{new Date(selectedDigest.compiledAt).toLocaleString()}</span>
                  </div>
                  <h4 className="text-lg font-bold text-white uppercase mt-1 leading-snug">{selectedDigest.title}</h4>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 py-3 bg-zinc-950 px-4 border border-white/5 rounded-xl mb-6 text-left">
                <div>
                  <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest font-mono">Consensus Sentiment</p>
                  <p className="text-xs font-bold text-emerald-400">{selectedDigest.overallSentimentScore}% {selectedDigest.overallSentiment}</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest font-mono">Average Tech Complexity</p>
                  <p className="text-xs font-bold text-purple-400">{selectedDigest.averageDensityScore}% Density</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest font-mono">Article stream compiled</p>
                  <p className="text-xs font-bold text-zinc-300">{selectedDigest.articlesCount} nodes analyzed</p>
                </div>
              </div>

              <div className="markdown-body bg-black p-6 border border-white/5 rounded-2xl max-w-4xl max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
                <Markdown>{selectedDigest.markdownContent}</Markdown>
              </div>

              <div className="flex items-center gap-4 mt-6 border-t border-white/5 pt-4">
                <button
                  onClick={() => handleCopyDigest(selectedDigest)}
                  className="flex items-center gap-2 px-6 py-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white transition-all"
                >
                  {copiedDigestId === selectedDigest.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  {copiedDigestId === selectedDigest.id ? "Coppied" : "Copy Clipboard"}
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="grid lg:grid-cols-12 gap-8">
              {/* Profile Config panel */}
              <div className="lg:col-span-5 space-y-6">
                <div className="glass-panel p-6 border-white/5 space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider font-display">Intelligence Scheduled Engine</h4>
                    <p className="text-[9px] text-zinc-500 uppercase tracking-widest mt-0.5">Configure scheduled background briefing compile-frequency</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Schedule Interval</label>
                      <select 
                        value={digestConfig.scheduleType}
                        onChange={(e) => handleUpdateDigestSchedule(e.target.value)}
                        className="w-full bg-black border border-white/10 focus:border-accent-red outline-none text-xs px-3 py-2.5 rounded-lg text-zinc-400 font-bold uppercase tracking-wider cursor-pointer"
                      >
                        <option value="Daily (09:00)">Daily (09:00)</option>
                        <option value="Every 12 Hours">Every 12 Hours</option>
                        <option value="Every 6 Hours">Every 6 Hours</option>
                        <option value="Every 1 Hour (Test Node)">Every 1 Hour (Test Node)</option>
                        <option value="Manual Dispatch Only">Manual Dispatch Only</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-zinc-950 border border-white/5 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-zinc-500 animate-pulse" />
                        <div>
                          <p className="text-[9px] font-bold text-zinc-400 uppercase">Automated Compiler State</p>
                          <p className="text-[10px] text-zinc-600 font-mono">{digestConfig.active ? "ACTIVE BACKGROUND DAEMON" : "STANDBY ENGINE"}</p>
                        </div>
                      </div>
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-ping shrink-0" />
                    </div>

                    <button
                      onClick={handleCompileDigest}
                      disabled={compilingDigest}
                      className="w-full py-4 bg-accent-red hover:bg-red-600 disabled:bg-zinc-800 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,35,60,0.4)] disabled:shadow-none"
                    >
                      {compilingDigest ? (
                        <>
                          <RefreshCcw className="w-4 h-4 animate-spin" /> COMPILING COGNITIVE DIGEST NOW...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" /> COMPILE INTEL DIGEST NOW
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-accent-red/5 border border-accent-red/10 flex items-start gap-3 text-left">
                  <Info className="w-5 h-5 text-accent-red shrink-0 mt-0.5" />
                  <div>
                    <h6 className="text-[10px] font-bold text-white uppercase tracking-wider">Automated Background Engine</h6>
                    <p className="text-[10px] text-zinc-500 leading-normal mt-0.5">
                      The server runs scheduled briefs compiling the contents of active toggled RSS entries. Standard mock data acts as secure telemetry backups when keys are absent.
                    </p>
                  </div>
                </div>
              </div>

              {/* History index column */}
              <div className="lg:col-span-7 glass-panel p-6 border-white/5">
                <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                  <h4 className="text-sm font-semibold font-display uppercase tracking-wider">Intelligence Briefing Archives</h4>
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">{digests.length} Digests</span>
                </div>

                {loadingDigests ? (
                  <div className="py-12 flex justify-center text-zinc-600 font-mono text-xs">
                    📡 DECRYPTING BRIEFINGS MATRIX...
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                    {digests.map((dig) => (
                      <div 
                        key={dig.id}
                        onClick={() => setSelectedDigest(dig)}
                        className="p-4 bg-zinc-950 border border-white/5 hover:border-white/15 rounded-xl flex flex-col justify-between cursor-pointer transition-all hover:bg-zinc-900 group"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[8px] font-bold bg-accent-red/10 text-accent-red px-1.5 py-0.2 rounded uppercase font-mono">
                                {dig.id === "digest-1" ? "STABLE CORE" : dig.scheduleType}
                              </span>
                              <span className="text-[9px] text-zinc-600 font-mono">{getRelativeTime(dig.compiledAt)}</span>
                            </div>
                            <h5 className="text-xs font-bold text-white mt-1.5 group-hover:text-accent-red transition-colors line-clamp-1 uppercase">
                              {dig.title}
                            </h5>
                          </div>
                          <ChevronRight className="w-4 h-4 text-zinc-500 transform group-hover:translate-x-1 transition-transform shrink-0 mt-1" />
                        </div>

                        <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5 text-[9px] text-zinc-500">
                          <span className="font-mono">Nodes: {dig.articlesCount} items</span>
                          <span className="font-mono">Sentiment: {dig.overallSentimentScore}%</span>
                          <span className="font-mono">Density Index: {dig.averageDensityScore}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
