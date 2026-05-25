import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Sparkles, Copy, Check, Info, ShieldCheck, Zap, RefreshCcw, Radio, Cpu, Layers, Activity, Terminal, Share2, Download, Printer } from 'lucide-react';
import Markdown from 'react-markdown';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function PeerSummarize() {
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const consoleRef = useRef<HTMLDivElement>(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (scrollHeight > 0) {
        setScrollProgress((scrollTop / scrollHeight) * 100);
      } else {
        setScrollProgress(0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [summary, activeFilter]);

  const FILTERS = [
    { label: 'All', keywords: [] },
    { label: 'OpenAI', keywords: ['openai', 'chatgpt', 'gpt-4', 'sam altman', 'altman', 'sora'] },
    { label: 'Google', keywords: ['google', 'gemini', 'deepmind', 'sundar', 'pichai'] },
    { label: 'Anthropic', keywords: ['anthropic', 'claude', 'amodei'] },
    { label: 'Meta', keywords: ['meta', 'llama', 'zuckerberg'] },
    { label: 'Hardware', keywords: ['nvidia', 'chip', 'gpu', 'groq', 'huang', 'amd', 'intel'] },
  ];

  const filteredSummary = React.useMemo(() => {
    if (activeFilter === 'All' || !summary) return summary;

    const currentFilter = FILTERS.find(f => f.label === activeFilter);
    if (!currentFilter) return summary;

    const blocks = summary.split(/---/g);
    const filteredBlocks = blocks.filter(block => {
      if (block.trim() === '') return false;
      // If it doesn't look like an article block, assume it's introductory/closing text and keep it
      if (!block.includes('## ')) return true;
      
      const lowerPart = block.toLowerCase();
      return currentFilter.keywords.some(kw => lowerPart.includes(kw));
    });

    if (filteredBlocks.length === 0 || (filteredBlocks.length === 1 && !filteredBlocks[0].includes('## '))) {
      return "_No intelligence reports match the current filter parameters._";
    }

    return filteredBlocks.join('\n\n---\n\n');
  }, [summary, activeFilter]);

  const STEPS = [
    {
      title: '📡 Fetching Feeds',
      description: 'Querying OpenAI, Anthropic, Gemini, Copilot RSS streams...',
      icon: Radio,
    },
    {
      title: '🧠 Context Cleaning',
      description: 'Isolating artificial intelligence headlines & filtering out noise...',
      icon: Cpu,
    },
    {
      title: '⚡ Formulating Prompts',
      description: 'Pre-processing articles into a dense knowledge injection prompt...',
      icon: Layers,
    },
    {
      title: '🔬 Analyzing Intelligence',
      description: 'Synthesizing takeaways and identifying long-term industry patterns...',
      icon: Activity,
    },
    {
      title: '💎 Formatting Report',
      description: 'Generating premium visual structures, emojis, and breathable sections...',
      icon: ShieldCheck,
    },
  ];

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/summarize-all');
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setSummary(data.summary);
    } catch (err: any) {
      setError(err.message || 'Failed to generate global summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [consoleLogs]);

  useEffect(() => {
    if (!loading) return;
    
    setLoadingStep(0);
    setConsoleLogs([
      '🌐 CONNECTING: Secure socket initiated with Peer Intelligence node...',
      '📡 FETCHING: Request sent to global technology feeds & developer news channels...',
    ]);

    const timer1 = setTimeout(() => {
      setLoadingStep(1);
      setConsoleLogs(prev => [
        ...prev,
        '📥 DOWNLOADED: Collected latest RSS feeds (OpenAI, DeepMind, Anthropic, etc.)',
        '🧠 CLEANING: Running regex filters to isolate core artificial intelligence content...',
        '🧠 MATCHED: Separated 10 highest-value intelligence markers based on model weight releases & industry disruption.'
      ]);
    }, 2200);

    const timer2 = setTimeout(() => {
      setLoadingStep(2);
      setConsoleLogs(prev => [
        ...prev,
        '⚡ PROCESSING: Formulating dense context injections...',
        '⚡ TOKENS: Compressing articles. Input vectors optimized for maximum attention accuracy.',
        '⚡ ENGINES: Preparing to trigger Peer Summary pipeline...'
      ]);
    }, 4500);

    const timer3 = setTimeout(() => {
      setLoadingStep(3);
      setConsoleLogs(prev => [
        ...prev,
        '🔬 SYNTHESIZING: Triggering premium Gemini-3.1-flash-lite cognitive analysis...',
        '🔬 COGNITIVE: Processing "What we need to know" summary blocks...',
        '🔮 COGNITIVE: Generating 5 precise, critical takeaway bullet points for each event...',
        '🔮 COGNITIVE: Evaluating hidden industry impacts, structural market changes, and next-gen implications.'
      ]);
    }, 7500);

    const timer4 = setTimeout(() => {
      setLoadingStep(4);
      setConsoleLogs(prev => [
        ...prev,
        '✨ RENDERING: Decoding generated markdown blocks...',
        '🎨 STYLING: Injecting breathable layouts, high-end styling headers, and thematic emojis...',
        '💎 COMPLETE: Global News Intelligence Report ready!'
      ]);
    }, 11000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [loading]);

  const handleCopy = () => {
    const plainText = filteredSummary
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/(\*\*|__)(.*?)\1/g, '$2')
      .replace(/(\*|_)(.*?)\1/g, '$2')
      .replace(/^[\*\-]\s+/gm, '')
      .replace(/^\s*---\s*$/gm, '')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    navigator.clipboard.writeText(plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const plainText = filteredSummary
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/(\*\*|__)(.*?)\1/g, '$2')
      .replace(/(\*|_)(.*?)\1/g, '$2')
      .replace(/^[\*\-]\s+/gm, '')
      .replace(/^\s*---\s*$/gm, '')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Peer News Summary',
          text: plainText,
          url: window.location.href,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error("Error sharing:", err);
        }
      }
    } else {
      // Fallback to copy
      handleCopy();
    }
  };

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    
    try {
      // Split the rendered DOM children into logical news blocks based on horizontal separators (<hr> elements)
      const childNodes = Array.from(reportRef.current.children);
      const articles: HTMLElement[][] = [];
      let currentArticle: HTMLElement[] = [];

      childNodes.forEach((child) => {
        if (child.tagName.toLowerCase() === 'hr') {
          if (currentArticle.length > 0) {
            articles.push(currentArticle);
            currentArticle = [];
          }
        } else {
          currentArticle.push(child as HTMLElement);
        }
      });
      if (currentArticle.length > 0) {
        articles.push(currentArticle);
      }

      // Create a temporary hidden iframe to render without Tailwind's global oklab styles
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.width = '800px';
      iframe.style.height = '0';
      iframe.style.left = '-9999px';
      iframe.style.top = '0';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow?.document;
      if (!iframeDoc) throw new Error("Could not create iframe document");

      const container = iframeDoc.createElement('div');
      container.style.backgroundColor = '#000000';
      container.style.padding = '40px';
      container.style.fontFamily = 'system-ui, sans-serif';
      
      const style = iframeDoc.createElement('style');
      style.innerHTML = `
        body { margin: 0; background: #000; }
        .pdf-export-body * { color: #aaaaaa; word-wrap: break-word; }
        .pdf-export-body h2 { color: #ffffff; font-size: 24px; font-weight: bold; border-bottom: 1px solid #333333; padding-bottom: 10px; margin-top: 15px; margin-bottom: 15px; }
        .pdf-export-body h3 { color: #ef233c; font-size: 16px; font-weight: bold; text-transform: uppercase; margin-top: 15px; margin-bottom: 10px; }
        .pdf-export-body p { color: #aaaaaa; line-height: 1.6; margin-bottom: 15px; }
        .pdf-export-body ul { margin-bottom: 20px; padding-left: 20px; }
        .pdf-export-body li { color: #aaaaaa; margin-bottom: 5px; list-style-type: disc; }
        .pdf-export-body hr { display: none; }
        .pdf-export-body strong { color: #ffffff; font-weight: bold; }
        .pdf-export-body em { color: #888888; font-style: italic; }
      `;
      iframeDoc.head.appendChild(style);

      const content = iframeDoc.createElement('div');
      content.className = 'pdf-export-body';
      container.appendChild(content);
      iframeDoc.body.appendChild(container);

      // Initialize the PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;

      for (let index = 0; index < articles.length; index++) {
        const articleElements = articles[index];
        if (articleElements.length === 0) continue;

        // Reset content block
        content.innerHTML = '';

        // Add header/branding watermark to the top of the page
        const watermark = iframeDoc.createElement('div');
        watermark.style.display = 'flex';
        watermark.style.justifyContent = 'space-between';
        watermark.style.alignItems = 'center';
        watermark.style.borderBottom = '1px solid #222';
        watermark.style.paddingBottom = '12px';
        watermark.style.marginBottom = '25px';
        watermark.style.fontSize = '10px';
        watermark.style.fontFamily = 'monospace';
        watermark.style.color = '#ef233c';
        watermark.style.textTransform = 'uppercase';
        watermark.style.letterSpacing = '2px';
        watermark.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 20px; height: 20px; background-color: #ef233c; border-radius: 4px; transform: rotate(45deg); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="12" 
                height="12" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="white" 
                stroke-width="2.5" 
                stroke-linecap="round" 
                stroke-linejoin="round"
                style="transform: rotate(-45deg);"
              >
                <rect width="16" height="16" x="4" y="4" rx="2"/>
                <rect width="6" height="6" x="9" y="9" rx="1"/>
                <path d="M9 1v3"/>
                <path d="M15 1v3"/>
                <path d="M9 20v3"/>
                <path d="M15 20v3"/>
                <path d="M20 9h3"/>
                <path d="M20 15h3"/>
                <path d="M1 9h3"/>
                <path d="M1 15h3"/>
              </svg>
            </div>
            <span style="font-weight: bold; margin-left: 4px; color: #ffffff; font-family: system-ui, sans-serif;">PEER INTELLIGENCE REPORT</span>
          </div>
          <span style="color: #666; font-weight: bold;">PAGE ${index + 1} OF ${articles.length}</span>
        `;
        content.appendChild(watermark);

        // Standard sub-container for news elements
        const newsBody = iframeDoc.createElement('div');
        articleElements.forEach(el => {
          const clonedEl = el.cloneNode(true) as HTMLElement;
          clonedEl.removeAttribute('class');
          const childs = clonedEl.getElementsByTagName('*');
          for (let k = 0; k < childs.length; k++) {
            childs[k].removeAttribute('class');
          }
          newsBody.appendChild(clonedEl);
        });
        content.appendChild(newsBody);

        // Add confidential footer
        const footer = iframeDoc.createElement('div');
        footer.style.borderTop = '1px solid #111';
        footer.style.paddingTop = '10px';
        footer.style.marginTop = '40px';
        footer.style.fontSize = '8px';
        footer.style.fontFamily = 'monospace';
        footer.style.color = '#444';
        footer.style.textAlign = 'center';
        footer.style.letterSpacing = '1px';
        footer.innerHTML = `CONFIDENTIAL BRIEFING // GENERATED ON ${new Date().toLocaleDateString()} // SECURE RADAR STREAM`;
        content.appendChild(footer);

        // Small timeout for layout update
        await new Promise(r => setTimeout(r, 50));

        const canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#000000',
          logging: false,
          windowWidth: 800
        });

        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const imgData = canvas.toDataURL('image/png');

        if (index > 0) {
          pdf.addPage();
        }

        if (imgHeight <= pageHeight) {
          // Center vertically for optimal look
          const yOffset = (pageHeight - imgHeight) / 3;
          pdf.addImage(imgData, 'PNG', 0, Math.max(0, yOffset), imgWidth, imgHeight);
        } else {
          // Handle overflow if the individual news article spans more than 1 single A4 page
          let heightLeft = imgHeight;
          let position = 0;
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
          while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }
        }
      }

      document.body.removeChild(iframe);
      pdf.save('PeerIntelligenceReport.pdf');
    } catch (err) {
      console.error("Failed to export PDF:", err);
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-10 py-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center space-y-3">
          <div className="relative inline-flex mb-2">
            <div className="absolute inset-0 rounded-full bg-accent-red/20 blur-xl animate-pulse" />
            <div className="relative w-16 h-16 rounded-2xl bg-accent-red flex items-center justify-center shadow-[0_0_30px_rgba(239,35,60,0.4)]">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          </div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white uppercase">SYSTEM COGNIZANCE</h2>
          <p className="text-xs text-zinc-500 uppercase tracking-[0.25em]">Synthesizing Global AI Intelligence Report</p>
          
          {/* Progress Line */}
          <div className="max-w-md mx-auto h-[3px] bg-white/5 rounded-full overflow-hidden mt-6 relative">
            <div 
              className="absolute left-0 top-0 h-full bg-accent-red shadow-[0_0_8px_rgba(239,35,60,0.8)] transition-all duration-500 rounded-full"
              style={{ width: `${(loadingStep + 1) * 20}%` }}
            />
          </div>
        </div>

        {/* Two-Column Grid for Steps & Console Logs */}
        <div className="grid md:grid-cols-5 gap-8">
          {/* Steps Column (3 cols) */}
          <div className="md:col-span-3 glass-panel p-8 space-y-6 relative overflow-hidden">
            {/* Subtle glow background */}
            <div className="absolute -top-16 -left-16 w-32 h-32 bg-accent-red/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
            
            <h3 className="text-xs font-bold text-white uppercase tracking-widest border-b border-white/5 pb-3">Synthesis Progress Pipeline</h3>
            <div className="relative space-y-8 pl-1">
              {/* Vertical joining connector */}
              <div className="absolute left-[17px] top-2 bottom-2 w-[2px] bg-white/5" />
              
              {STEPS.map((step, idx) => {
                const isCompleted = idx < loadingStep;
                const isActive = idx === loadingStep;
                const StepIcon = step.icon;

                return (
                  <div 
                    key={idx} 
                    className={`flex gap-4 transition-all duration-500 relative z-10 ${
                      isCompleted ? 'opacity-80' : isActive ? 'opacity-100' : 'opacity-30'
                    }`}
                  >
                    {/* Visual Circle Indicator */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                      isCompleted 
                        ? 'bg-green-500/10 border border-green-500/30 text-green-400' 
                        : isActive 
                          ? 'bg-accent-red/20 border-2 border-accent-red text-accent-red shadow-[0_0_15px_rgba(239,35,60,0.4)]' 
                          : 'bg-white/5 border border-white/10 text-zinc-500'
                    }`}>
                      {isCompleted ? (
                        <Check className="w-5 h-5 stroke-[2.5]" />
                      ) : (
                        <StepIcon className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />
                      )}
                    </div>

                    <div className="space-y-1">
                      <h4 className={`text-sm font-bold tracking-wide ${
                        isActive ? 'text-white' : isCompleted ? 'text-zinc-400' : 'text-zinc-600'
                      }`}>
                        {step.title}
                      </h4>
                      <p className="text-xs text-zinc-500 select-none leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Terminal Log Console Column (2 cols) */}
          <div className="md:col-span-2 flex flex-col glass-panel p-6 bg-zinc-950/40 border border-white/5 relative">
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-accent-red" />
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Live Session logs</span>
              </div>
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                <span className="w-1.5 h-1.5 rounded-full bg-accent-red animate-pulse" />
              </div>
            </div>

            {/* Console logs box */}
            <div 
              ref={consoleRef}
              className="flex-grow h-64 overflow-y-auto font-mono text-[10px] space-y-3 leading-relaxed text-zinc-400 select-none pr-1 scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent scrollbar-thumb-rounded-full"
            >
              {consoleLogs.map((log, lIdx) => (
                <div key={lIdx} className="border-l border-white/10 pl-2 opacity-90 animate-in fade-in slide-in-from-left-2 duration-300">
                  <span className="text-zinc-600 mr-1 select-none">&gt;&gt;</span> {log}
                </div>
              ))}
            </div>
            
            <div className="border-t border-white/5 pt-3 mt-4 flex items-center justify-between text-[9px] font-mono text-zinc-600">
              <span>SECURE_NODE: v4.11.0</span>
              <span className="animate-pulse">ONLINE</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 glass-panel border-red-500/20 text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-accent-red text-white rounded-full text-xs font-bold uppercase tracking-widest"
        >
          Retry Synthesis
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Subtle Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-[3.5px] z-50 bg-white/5 pointer-events-none no-print">
        <div 
          className="h-full bg-accent-red shadow-[0_0_12px_rgba(239,35,60,0.9)] transition-all duration-75 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 ease-out fill-mode-backwards">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-accent-red flex items-center justify-center shadow-[0_0_30px_rgba(239,35,60,0.4)]">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold font-display tracking-tight text-white">Peer Summarize</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold">Synthesized Global Intelligence Feed</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden md:block text-right mr-2">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Report Timestamp</p>
            <p className="text-xs text-white/60 tabular-nums">{new Date().toLocaleTimeString()} UTC</p>
          </div>
          <button
            onClick={fetchSummary}
            className="flex items-center gap-2 px-4 py-2 bg-accent-red/10 border border-accent-red/20 hover:bg-accent-red/20 rounded-full transition-all text-[10px] font-bold uppercase tracking-widest text-accent-red"
          >
            <RefreshCcw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-6 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-full transition-all text-[10px] font-bold uppercase tracking-widest group"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />}
            {copied ? "Report Copied" : "Copy Global Report"}
          </button>
          
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-2 px-6 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-full transition-all text-[10px] font-bold uppercase tracking-widest group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" /> : <Download className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />}
            {isExporting ? "Exporting..." : "Export PDF"}
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-full transition-all text-[10px] font-bold uppercase tracking-widest group cursor-pointer"
          >
            <Printer className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
            Print Report
          </button>

          {navigator.share && (
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-6 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-full transition-all text-[10px] font-bold uppercase tracking-widest group"
            >
              {shared ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />}
              {shared ? "Shared" : "Share"}
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 bg-black/40 p-3 rounded-2xl border border-white/5 backdrop-blur-md no-print">
        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mr-2 ml-2">Radar Filter:</span>
        {FILTERS.map(filter => (
          <button
            key={filter.label}
            onClick={() => setActiveFilter(filter.label)}
            className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
              activeFilter === filter.label
                ? 'bg-accent-red text-white shadow-[0_0_15px_rgba(239,35,60,0.4)] scale-105'
                : 'bg-white/5 border border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white hover:scale-105'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="glass-panel p-10 md:p-16 relative overflow-hidden group shadow-2xl">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          </div>
          
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-[0.08] transition-opacity pointer-events-none">
            <ShieldCheck className="w-64 h-64" />
          </div>
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-12">
              <span className="px-3 py-1 bg-accent-red/10 border border-accent-red/20 rounded-full text-[9px] font-bold text-accent-red uppercase tracking-widest">
                Classified Data Synthesis
              </span>
              <div className="h-[1px] flex-grow bg-white/10" />
            </div>

            {/* Elegant Print-Only Header Logo & Title for Direct Browser Print */}
            <div className="print-header">
              <div className="flex items-center gap-3">
                <div className="logo-container w-8 h-8 rounded" style={{ backgroundColor: '#ef233c', transform: 'rotate(45deg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="18" 
                    height="18" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="white" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    style={{ transform: 'rotate(-45deg)', display: 'block', margin: 'auto' }}
                  >
                    <rect width="16" height="16" x="4" y="4" rx="2"/>
                    <rect width="6" height="6" x="9" y="9" rx="1"/>
                    <path d="M9 1v3"/>
                    <path d="M15 1v3"/>
                    <path d="M9 20v3"/>
                    <path d="M15 20v3"/>
                    <path d="M20 9h3"/>
                    <path d="M20 15h3"/>
                    <path d="M1 9h3"/>
                    <path d="M1 15h3"/>
                  </svg>
                </div>
                <span className="text-2xl font-bold tracking-tight text-black ml-4" style={{ fontFamily: 'system-ui, sans-serif' }}>Peer News Agent</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-[#ef233c] uppercase tracking-widest block" style={{ fontFamily: 'monospace' }}>Intelligence Briefing</span>
                <span className="text-[10px] font-mono text-zinc-500 block">GENERATED ON {new Date().toLocaleDateString()}</span>
              </div>
            </div>

            <div className="markdown-body max-w-4xl mx-auto" ref={reportRef} style={{ backgroundColor: '#09090b', padding: '20px', borderRadius: '10px' }}>
              <Markdown>{filteredSummary}</Markdown>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-4">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
            <Info className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-1">Global Context</h4>
            <p className="text-[11px] text-zinc-500 leading-relaxed">Integrated analysis of over 30 global news streams updated in real-time.</p>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-4">
          <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-green-400" />
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-1">Verified Sources</h4>
            <p className="text-[11px] text-zinc-500 leading-relaxed">Cross-referenced intelligence from top-tier institutional and technology nodes.</p>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-4">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-1">Peer Synthesis</h4>
            <p className="text-[11px] text-zinc-500 leading-relaxed">Elite AI processing identifying non-obvious patterns and industry impacts.</p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
