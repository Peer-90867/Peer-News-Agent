import { motion, AnimatePresence } from "motion/react";
import { X, ExternalLink, Share2, Copy, Check } from "lucide-react";
import { NewsArticle } from "../types";
import { useState } from "react";

interface ModalProps {
  article: NewsArticle | null;
  onClose: () => void;
  analysis: { summary: string; highlights: string[]; deepDive: string } | null;
  loading: boolean;
}

export default function ArticleModal({ article, onClose, analysis, loading }: ModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedAnalysis, setCopiedAnalysis] = useState(false);

  if (!article) return null;

  const handleShare = () => {
    navigator.clipboard.writeText(article.link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyFull = () => {
    if (!analysis) return;
    const text = `
HEADLINE: ${article.title}
SOURCE: ${article.source}
LINK: ${article.link}

What we need to know:
${analysis.summary}

What is important:
${analysis.highlights.map(h => `• ${h}`).join('\n')}

Deep dive analysis:
${analysis.deepDive}
    `.trim();
    navigator.clipboard.writeText(text);
    setCopiedAnalysis(true);
    setTimeout(() => setCopiedAnalysis(false), 2000);
  };

  return (
    <AnimatePresence>
      {article && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="p-6 md:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-accent-red tracking-widest uppercase">{article.source}</span>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-5 h-5 text-zinc-500" />
                </button>
              </div>

              <h2 className="text-2xl md:text-3xl font-semibold leading-tight">{article.title}</h2>

              <div className="flex items-center gap-4 py-2 border-y border-white/5">
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  <ExternalLink className="w-4 h-4" /> Original Article
                </a>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
                  {copiedLink ? "Copied Link!" : "Share Link"}
                </button>
                {analysis && !loading && (
                  <button
                    onClick={handleCopyFull}
                    className="flex items-center gap-2 text-sm text-accent-red hover:text-red-400 transition-colors font-bold"
                  >
                    {copiedAnalysis ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    {copiedAnalysis ? "Copied Analysis!" : "Copy Analysis"}
                  </button>
                )}
              </div>

              {loading ? (
                <div className="space-y-4 py-8">
                  <div className="h-4 bg-white/5 animate-pulse rounded w-3/4"></div>
                  <div className="h-4 bg-white/5 animate-pulse rounded w-1/2"></div>
                  <div className="h-4 bg-white/5 animate-pulse rounded w-2/3"></div>
                </div>
              ) : analysis ? (
                <div className="space-y-8">
                  <section>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">What we need to know</h3>
                    <p className="text-zinc-400 leading-relaxed">{analysis.summary}</p>
                  </section>

                  <section>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">What is important</h3>
                    <ul className="space-y-2">
                      {analysis.highlights.map((h, i) => (
                        <li key={i} className="flex gap-3 text-zinc-400 leading-relaxed">
                          <span className="text-accent-red font-bold mt-0.5">•</span>
                          {h}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="p-6 bg-accent-red/5 rounded-2xl border border-accent-red/20">
                    <h3 className="text-sm font-bold text-accent-red uppercase tracking-wider mb-3">Deep dive analysis</h3>
                    <p className="text-zinc-300 leading-relaxed italic">{analysis.deepDive}</p>
                  </section>
                </div>
              ) : (
                <p className="text-zinc-500 italic">No analysis available for this article.</p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
