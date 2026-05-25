import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Zap, 
  MessageSquare, 
  Settings as SettingsIcon, 
  RefreshCcw, 
  ChevronRight,
  Plus,
  Cpu,
  Globe,
  Clock,
  Activity,
  Copy,
  Check,
  Printer,
  BookOpen,
  HelpCircle,
  Brain,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Menu,
  X
} from "lucide-react";
import { NewsArticle } from "./types";
import ArticleModal from "./components/ArticleModal";
import ChatAgent from "./components/ChatAgent";
import PeerSummarize from "./components/PeerSummarize";
import PeerOperationsCenter from "./components/PeerOperationsCenter";
import Guidebook from "./components/Guidebook";

export default function App() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [activeTab, setActiveTab] = useState<'hub' | 'chat' | 'summarize' | 'operations' | 'guidebook'>('hub');

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<string | null>(null);
  const [serverStartTime, setServerStartTime] = useState<string | null>(null);
  const [copyingId, setCopyingId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Interactive operational intelligence concept guide states
  const [interactiveConcept, setInteractiveConcept] = useState<'sentiment' | 'density' | 'ai_tiers' | 'big_tech'>('sentiment');
  const [interactiveSentimentVal, setInteractiveSentimentVal] = useState<number>(50);
  const [interactiveDensitySelection, setInteractiveDensitySelection] = useState<'low' | 'med' | 'high'>('high');

  useEffect(() => {
    fetchNews();
    const savedKey = localStorage.getItem("gemini_api_key");
    if (savedKey) setApiKey(savedKey);
    
    const timer = setInterval(() => setCurrentTime(new Date()), 1000); // Update every second
    return () => clearInterval(timer);
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      // Direct call to /api/news
      const res = await fetch("/api/news");
      
      if (!res.ok) {
        throw new Error(`API: ${res.status}`);
      }

      const data = await res.json();
      console.log("Fetched news signal buffer:", data);
      
      if (data.articles && Array.isArray(data.articles)) {
        setNews(data.articles);
      } else {
        throw new Error("Payload mismatch");
      }

      setLastFetchTime(data.fetchTime || new Date().toISOString());
      setServerStartTime(data.serverStartTime || new Date().toISOString());
    } catch (e: any) {
      console.error("News Synchronizer Failure:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleArticleClick = async (article: NewsArticle) => {
    setSelectedArticle(article);
    setAnalysisLoading(true);
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ article }),
      });
      const data = await res.json();
      setAnalysis(data);
    } catch (e) {
      console.error(e);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const saveSettings = () => {
    localStorage.setItem("gemini_api_key", apiKey);
    setShowSettings(false);
  };

  const getRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  const calculateUptime = () => {
    if (!serverStartTime) return "Calculating...";
    const start = new Date(serverStartTime);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours > 0 ? hours + 'h ' : ''}${mins}m ago`;
  };

  const handleCopy = (e: React.MouseEvent, text: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopyingId(id);
    setTimeout(() => setCopyingId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-accent-red selection:text-white">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/5 rounded-full blur-[120px]" />
      </div>

      <nav className="fixed top-0 left-0 w-full z-40 px-6 py-4 flex items-center justify-between glass-panel !rounded-none border-t-0 border-x-0 bg-black/60 no-print">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent-red rounded shadow-[0_0_15px_rgba(239,35,60,0.4)] rotate-45 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-white -rotate-45" />
          </div>
          <span className="text-xl font-bold font-display tracking-tight text-white">Peer News Agent</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex bg-white/5 border border-white/10 rounded-full p-0.5 md:p-1">
            <button 
              onClick={() => setActiveTab('guidebook')}
              className={`px-3 md:px-6 py-1 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-bold transition-all ${activeTab === 'guidebook' ? 'bg-accent-red text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              GUIDEBOOK
            </button>
            <button 
              onClick={() => setActiveTab('hub')}
              className={`px-3 md:px-6 py-1 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-bold transition-all ${activeTab === 'hub' ? 'bg-accent-red text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              ALIVE STREAM
            </button>
            <button 
              onClick={() => setActiveTab('operations')}
              className={`px-3 md:px-6 py-1 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-bold transition-all ${activeTab === 'operations' ? 'bg-accent-red text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              OPERATIONS CENTER
            </button>
            <button 
              onClick={() => setActiveTab('summarize')}
              className={`px-3 md:px-6 py-1 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-bold transition-all ${activeTab === 'summarize' ? 'bg-accent-red text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              PEER SUMMARIZE
            </button>
            <button 
              onClick={() => setActiveTab('chat')}
              className={`px-3 md:px-6 py-1 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-bold transition-all ${activeTab === 'chat' ? 'bg-accent-red text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              PEER AGENT
            </button>
          </div>
          
          <button
            className="md:hidden p-2.5 rounded-full bg-white/5 border border-white/10 text-zinc-400"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5" />}
          </button>
          
          <button 
            onClick={fetchNews}
            className="p-2.5 rounded-full bg-accent-red/10 border border-accent-red/20 hover:bg-accent-red/20 transition-all text-accent-red animate-in fade-in duration-300"
            title="Refresh intel feed"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button 
            onClick={() => window.print()}
            title="Print Intelligence report"
            className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer animate-in fade-in duration-300"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-20 right-6 left-6 z-40 bg-black/90 border border-white/10 p-6 rounded-2xl glass-panel md:hidden"
        >
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => { setActiveTab('guidebook'); setIsMobileMenuOpen(false); }}
              className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-3"
            >
              <BookOpen className="w-5 h-5 text-blue-400" /> GUIDEBOOK
            </button>
            <button 
              onClick={() => { setActiveTab('hub'); setIsMobileMenuOpen(false); }}
              className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-3"
            >
              <Globe className="w-5 h-5 text-green-400" /> ALIVE STREAM
            </button>
            <button 
              onClick={() => { setActiveTab('summarize'); setIsMobileMenuOpen(false); }}
              className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-3"
            >
              <Copy className="w-5 h-5 text-purple-400" /> PEER SUMMARIZE
            </button>
            <button 
              onClick={() => { setActiveTab('chat'); setIsMobileMenuOpen(false); }}
              className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-3"
            >
              <MessageSquare className="w-5 h-5 text-accent-red" /> PEER AGENT
            </button>
            <button 
              onClick={() => { setActiveTab('operations'); setIsMobileMenuOpen(false); }}
              className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-3"
            >
              <Cpu className="w-5 h-5 text-blue-400" /> OPERATIONS CENTER
            </button>
          </div>
        </motion.div>
      )}
      
      <main className="relative z-10 pt-28 pb-12 px-6 max-w-7xl mx-auto">
        <div className="md:hidden grid grid-cols-2 gap-3 mb-8 no-print">
          <div className="p-3 glass-panel border-white/5 flex flex-col gap-1 items-start bg-zinc-950/40">
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-accent-red" />
              <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Turned On</span>
            </div>
            <span className="text-[11px] font-bold font-display">{calculateUptime()}</span>
          </div>
          <div className="p-3 glass-panel border-white/5 flex flex-col gap-1 items-start bg-zinc-950/40">
            <div className="flex items-center gap-2">
              <RefreshCcw className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Last Intel</span>
            </div>
            <span className="text-[11px] font-bold font-display">{lastFetchTime ? getRelativeTime(lastFetchTime) : 'Never'}</span>
          </div>
          <div className="p-3 glass-panel border-white/5 flex flex-col gap-1 items-start bg-zinc-950/40">
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-green-400" />
              <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Live Stream</span>
            </div>
            <span className="text-[11px] font-bold font-display">Active 24/7</span>
          </div>
          <div className="p-3 glass-panel border-white/5 flex flex-col gap-1 items-start bg-zinc-100/5">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Local Time</span>
            </div>
            <span className="text-[11px] font-bold font-display">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>
        </div>

        <div className="hidden md:grid grid-cols-1 lg:grid-cols-4 gap-4 mb-10 no-print">
          <div className="p-4 glass-panel border-white/5 flex items-center gap-4">
            <div className="p-2 bg-accent-red/10 text-accent-red rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Turned On</p>
              <p className="text-sm font-bold font-display">{calculateUptime()}</p>
            </div>
          </div>
          <div className="p-4 glass-panel border-white/5 flex items-center gap-4">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <RefreshCcw className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Last Updated</p>
              <p className="text-sm font-bold font-display">{lastFetchTime ? getRelativeTime(lastFetchTime) : 'Never'}</p>
            </div>
          </div>
          <div className="p-4 glass-panel border-white/5 flex items-center gap-4">
            <div className="p-2 bg-green-500/10 text-green-400 rounded-lg">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Live Stream</p>
              <p className="text-sm font-bold font-display">Active 24/7</p>
            </div>
          </div>
          <div className="p-4 glass-panel border-white/5 flex items-center gap-4">
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Local Time</p>
              <p className="text-sm font-bold font-display">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
            </div>
          </div>
        </div>

        {showSettings && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 glass-panel p-8 border-accent-red/20"
          >
            <h2 className="text-2xl font-bold font-display mb-6">Agent Settings</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest">Gemini API Key</label>
                <div className="flex gap-2">
                  <input 
                    type="password" 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter key for advanced mode..."
                    className="flex-1 bg-black border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-accent-red outline-none transition-all"
                  />
                  <button 
                    onClick={saveSettings}
                    className="px-6 py-3 bg-accent-red rounded-lg font-bold text-sm hover:bg-red-600 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'guidebook' && (
          <div className="mb-10">
            <Guidebook />
          </div>
        )}
          {activeTab === 'summarize' ? (
            <div className="lg:col-span-12">
              <PeerSummarize />
            </div>
          ) : (
            <>
              <div className={`lg:col-span-8 ${activeTab === 'chat' ? 'hidden md:block' : ''}`}>
            <header className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2 text-accent-red text-xs font-bold uppercase tracking-[0.2em]">
                  <span className="w-8 h-[1px] bg-accent-red" />
                  General AI Big Tech Dynamics & Frontier Models
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight mb-2">
                Today's <span className="text-transparent bg-clip-text bg-gradient-to-br from-white to-white/40 italic">Global Pulse</span>
              </h1>
              <p className="text-xs text-zinc-500 uppercase tracking-widest leading-relaxed">
                A Summarized Intelligence Speed-Hub Tracking Generative Architecture Changes
              </p>
            </header>

            {loading ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-64 glass-card animate-pulse" />
                ))}
              </div>
            ) : (
              <div className={(activeTab !== 'operations' && activeTab !== 'hub') ? 'hidden' : 'lg:col-span-12'}>
              <PeerOperationsCenter 
                news={news}
                fetchNews={fetchNews}
                onArticleClick={handleArticleClick}
                getRelativeTime={getRelativeTime}
                lastFetchTime={lastFetchTime}
              />
            </div>
            )}
          </div>

          <div className={`lg:col-span-4 sticky top-28 h-fit ${activeTab === 'hub' ? 'hidden md:block' : ''}`}>
            <ChatAgent apiKey={apiKey} />
            
            <div className="mt-8 glass-panel p-6 border-white/5 bg-accent-red/[0.02]">
              <h4 className="text-xs font-bold text-accent-red uppercase tracking-widest mb-4">Peer Insights</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-black border border-white/10 rounded-xl">
                  <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-accent-red">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold">Deep Research</h5>
                    <p className="text-[10px] text-zinc-500">Peer agent analysis activated.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
</main>

      {/* Footer Branding */}
      <footer className="relative mt-20 pt-20 pb-10 border-t border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="opacity-10 pointer-events-none select-none">
            <h1 className="text-[12vw] font-bold font-display tracking-tighter leading-none" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.2)', color: 'transparent' }}>
              PEER AGENT
            </h1>
          </div>
          <p className="text-[10px] text-zinc-700 uppercase tracking-[0.5em] mt-8">Peer Intelligence Synthesis • 2026</p>
        </div>
      </footer>

      <ArticleModal 
        article={selectedArticle} 
        onClose={() => setSelectedArticle(null)} 
        analysis={analysis}
        loading={analysisLoading}
      />
    </div>
  );
}
