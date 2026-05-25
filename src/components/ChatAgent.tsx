import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Bot, User, Loader2, Info } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ChatMessage } from "../types";

interface ChatProps {
  apiKey: string;
}

export default function ChatAgent({ apiKey }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: input,
          history: messages,
          apiKey: apiKey,
        }),
      });

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] md:h-[600px] glass-panel border-white/5 overflow-hidden">
      <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-red flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-display">Peer News Agent</h3>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Peer Analysis Active
            </span>
          </div>
        </div>
        <div className="group relative">
           <Info className="w-4 h-4 text-zinc-600 cursor-help" />
           <div className="absolute right-0 top-6 w-48 p-2 bg-zinc-800 border border-white/10 rounded-lg text-[10px] text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity z-10">
             Specialized AI technology stream.
           </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 p-8">
            <Bot className="w-12 h-12 text-zinc-800" />
            <p className="text-sm text-zinc-500">
              Your direct channel to elite tech reconnaissance. <br/>Ask about OpenAI, Gemini, or Perplexity.
            </p>
          </div>
        )}
        <AnimatePresence>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[90%] p-4 rounded-2xl text-sm ${
                  m.role === "user"
                    ? "bg-accent-red text-white font-medium"
                    : "bg-white/5 border border-white/10 text-zinc-300 markdown-body ProseMirror prose prose-invert prose-sm"
                }`}
              >
                {m.role === "assistant" ? (
                  <div className="space-y-3 relative group">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(m.content);
                        const btn = document.getElementById(`copy-${m.id}`);
                        if (btn) btn.innerHTML = "Copied!";
                        setTimeout(() => { if (btn) btn.innerHTML = "Copy All"; }, 2000);
                      }}
                      id={`copy-${m.id}`}
                      className="absolute -top-10 right-0 bg-accent-red/90 text-white text-[10px] font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-accent-red shadow-lg active:scale-95"
                    >
                      Copy All
                    </button>
                    <ReactMarkdown
                      components={{
                        h1: ({ ...props }) => <h1 className="text-lg font-bold text-white mb-2" {...props} />,
                        h2: ({ ...props }) => <h2 className="text-base font-bold text-white mb-2" {...props} />,
                        h3: ({ ...props }) => <h3 className="text-sm font-bold text-accent-red mb-1 uppercase tracking-wider" {...props} />,
                        p: ({ ...props }) => <p className="mb-3 leading-relaxed" {...props} />,
                        ul: ({ ...props }) => <ul className="list-disc pl-4 mb-3 space-y-1" {...props} />,
                        li: ({ ...props }) => <li className="text-zinc-300" {...props} />,
                        strong: ({ ...props }) => <strong className="text-white font-bold" {...props} />,
                        code: ({ ...props }) => <code className="bg-white/10 px-1 rounded text-xs font-mono" {...props} />,
                      }}
                    >
                      {m.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  m.content
                )}
                <div className="text-[8px] opacity-40 mt-2 text-right">
                  {m.timestamp}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
              <Loader2 className="w-4 h-4 animate-spin text-accent-red" />
            </div>
          </motion.div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 bg-white/[0.02] border-t border-white/5">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Query the Agent..."
            className="w-full bg-black/50 border border-white/10 rounded-full py-3 px-6 pr-12 text-sm focus:outline-none focus:border-accent-red transition-all placeholder:text-zinc-700"
          />
          <button
            type="submit"
            className="absolute right-2 top-1.5 p-2 bg-accent-red hover:bg-red-600 rounded-full transition-colors disabled:opacity-50 shadow-lg shadow-accent-red/20"
            disabled={!input.trim() || isLoading}
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </form>
    </div>
  );
}
