import { motion } from "motion/react";
import { BookOpen, Brain, TrendingUp } from "lucide-react";
import { useState } from "react";

export default function Guidebook() {
  const [interactiveConcept, setInteractiveConcept] = useState<'sentiment' | 'density' | 'ai_tiers' | 'big_tech'>('sentiment');
  const [interactiveSentimentVal, setInteractiveSentimentVal] = useState<number>(50);
  const [interactiveDensitySelection, setInteractiveDensitySelection] = useState<'low' | 'med' | 'high'>('high');

  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="glass-panel border-[#2277ff]/20 bg-blue-500/[0.01] p-6 rounded-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-6 opacity-[0.02] text-blue-500 pointer-events-none">
        <BookOpen className="w-48 h-48" />
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-white/5 mb-6">
        <div>
          <h3 className="text-md font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" /> Operational Intelligence Guidebook
          </h3>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Interactive sandbox demonstrating the algorithmic parameters of the Summarized News Hub.
          </p>
        </div>

        <div className="flex flex-wrap gap-1 bg-black/60 border border-white/5 p-1 rounded-xl">
          <button
            onClick={() => setInteractiveConcept('sentiment')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${interactiveConcept === 'sentiment' ? 'bg-[#2277ff] text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            🎯 Neutral Mean
          </button>
          <button
            onClick={() => setInteractiveConcept('density')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${interactiveConcept === 'density' ? 'bg-[#2277ff] text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            ⚡ density
          </button>
          <button
            onClick={() => setInteractiveConcept('ai_tiers')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${interactiveConcept === 'ai_tiers' ? 'bg-[#2277ff] text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            🧠 ai tiers
          </button>
          <button
            onClick={() => setInteractiveConcept('big_tech')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${interactiveConcept === 'big_tech' ? 'bg-[#2277ff] text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            📈 big tech & models
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        <div className="md:col-span-7 space-y-4 flex flex-col justify-center">
          {interactiveConcept === 'sentiment' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#2277ff] font-mono tracking-wider">Concept 01 // Sentiment & Neutrality Mean</span>
                <h4 className="text-md font-bold text-white uppercase font-display">Semantic Sentiment Balancing</h4>
              </div>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Our AI processes every feed. Emotional keywords, PR marketing exaggerations, or market announcements generate a score from <b>0% (Highly Skeptical)</b> to <b>100% (Ultra Bullish)</b>.
              </p>
              <p className="text-zinc-400 text-xs leading-relaxed">
                A score of <b>50%</b> is the <b>Neutral Mean</b>—signifying pure factual documentation/clean releases lacking hyperbole.
              </p>
            </div>
          )}

          {interactiveConcept === 'density' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#2277ff] font-mono tracking-wider">Concept 02 // Engineering Indexing</span>
                <h4 className="text-md font-bold text-white uppercase font-display">Technical Density Metric</h4>
              </div>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Commercial tech blogs often launch SaaS "wrappers" with generic commercial fluff. Technical Density isolates concrete programming terms, performance benchmarks, parameters, floating point metrics, and model-weight releases to prevent commercial noise.
              </p>
            </div>
          )}

          {interactiveConcept === 'ai_tiers' && (
            <div className="space-y-3 flex-grow flex flex-col justify-center">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#2277ff] font-mono tracking-wider">Concept 03 // Performance Tiers</span>
                <h4 className="text-md font-bold text-white uppercase font-display">General AI vs. Frontier AI</h4>
              </div>
              <p className="text-zinc-400 text-xs leading-relaxed mb-1">
                We triage machine intelligence into two foundational tiers based on technical scope and compute envelope boundaries.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="p-3 bg-black border border-white/5 rounded-xl space-y-1">
                  <span className="text-[9px] font-bold text-[#f39c12] uppercase font-mono">General AI</span>
                  <p className="text-[10px] text-zinc-500 leading-relaxed">
                    Proven commodity technologies; SaaS layouts, straightforward chatbot interfaces, business database operations.
                  </p>
                </div>
                <div className="p-3 bg-accent-red/5 border border-accent-red/10 rounded-xl space-y-1">
                  <span className="text-[9px] font-bold text-accent-red uppercase font-mono">Frontier AI</span>
                  <p className="text-[10px] text-zinc-500 leading-relaxed">
                    Multi-step agent logic, dynamic self-improving networks, complex mathematical kernels, custom parameters.
                  </p>
                </div>
              </div>
            </div>
          )}

          {interactiveConcept === 'big_tech' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#2277ff] font-mono tracking-wider">Concept 04 // Market Dynamics</span>
                <h4 className="text-md font-bold text-white uppercase font-display">Big Tech Dynamics & Frontier Models</h4>
              </div>
              <p className="text-zinc-400 text-xs leading-relaxed">
                AI's future roadmap is forged by infrastructure capital and architectural breakthrough categories:
              </p>
              <div className="space-y-2 pt-1 text-[11px]">
                <div className="flex gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-1.5" />
                  <p className="text-zinc-500"><span className="text-white font-bold font-sans">Big Tech Dynamics:</span> Mergers, hyperscaler cloud licensing arrangements, and Nvidia Blackwell cluster GPU acquisitions.</p>
                </div>
                <div className="flex gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0 mt-1.5" />
                  <p className="text-zinc-500"><span className="text-white font-bold font-sans">Frontier Models:</span> underlying neural architectures defined by trillions of parameters, massive scaling window matrices, and deep-reasoning integration.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-5 bg-black/60 border border-white/5 p-5 rounded-2xl flex flex-col justify-between">
          {interactiveConcept === 'sentiment' && (
            <div className="space-y-3 h-full flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between text-[11px] font-mono font-bold uppercase">
                  <span className="text-zinc-500">Sentiment Dial</span>
                  <span className={interactiveSentimentVal < 45 ? 'text-red-400' : interactiveSentimentVal <= 55 ? 'text-emerald-400 font-bold' : 'text-blue-400'}>
                    {interactiveSentimentVal}% {interactiveSentimentVal < 45 ? '(Skeptical)' : interactiveSentimentVal <= 55 ? '(Neutral Mean)' : '(Bullish)'}
                  </span>
                </div>

                <input 
                  type="range"
                  min="0"
                  max="100"
                  value={interactiveSentimentVal}
                  onChange={(e) => setInteractiveSentimentVal(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#2277ff] focus:outline-none"
                />
              </div>

              <div className="p-3.5 rounded-xl border border-white/5 bg-zinc-950/60 text-[10px] space-y-1.5 leading-relaxed text-zinc-400 mt-2">
                {interactiveSentimentVal < 45 ? (
                  <>
                    <p className="font-semibold text-red-400 uppercase tracking-widest font-mono text-[9px]">Skeptical Range Event Triggered</p>
                    <p>Our analyzer triggers warning flags for security incidents, regulatory lawsuits, critical vulnerability disclosures, or GPU train delays.</p>
                  </>
                ) : interactiveSentimentVal <= 55 ? (
                  <>
                    <p className="font-semibold text-emerald-400 uppercase tracking-widest font-mono text-[9px]">Factual Neutral Mean Balance</p>
                    <p>Perfect factual reporting. This represents dry academic code repository updates, API document files, and balanced reports completely free of PR fluff.</p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-blue-400 uppercase tracking-widest font-mono text-[9px]">Bullish Growth Triggered</p>
                    <p>Exponential benchmark gains, massive inference cost reductions, open-weight model parameter sets, or major capital injections.</p>
                  </>
                )}
              </div>
            </div>
          )}

          {interactiveConcept === 'density' && (
            <div className="space-y-3 h-full flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between text-[11px] font-mono font-bold uppercase">
                  <span className="text-zinc-500">Density Filter Matrix</span>
                  <span className="text-[#2277ff]">{interactiveDensitySelection.toUpperCase()}</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'med', 'high'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setInteractiveDensitySelection(level)}
                      className={`py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all ${
                        interactiveDensitySelection === level 
                          ? 'bg-[#2277ff]/10 border-[#2277ff] text-[#2277ff]' 
                          : 'bg-transparent border-white/5 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-white/5 bg-zinc-950/60 text-[10px] space-y-1.5 leading-relaxed text-zinc-400 mt-2">
                {interactiveDensitySelection === 'low' && (
                  <>
                    <p className="font-semibold text-white uppercase tracking-widest font-mono text-[9px]">Low Density (&lt;35%)</p>
                    <p>Filters primarily marketing press releases, generic high-level partnership letters, or VC capital seed news devoid of raw technological architecture files and descriptors.</p>
                  </>
                )}
                {interactiveDensitySelection === 'med' && (
                  <>
                    <p className="font-semibold text-white uppercase tracking-widest font-mono text-[9px]">Balanced standard (35% - 65%)</p>
                    <p>Addresses normal system integrations, developer portal announcements, interface configurations, and general technical tutorials.</p>
                  </>
                )}
                {interactiveDensitySelection === 'high' && (
                  <>
                    <p className="font-semibold text-red-400 uppercase tracking-widest font-mono text-[9px]">Deep Technical (&gt;65%)</p>
                    <p>Triggers intense parsing for: raw float values, quantization logic, weight matrices, training configurations, GPU scaling, hardware optimizations, or neural pipeline mathematics.</p>
                  </>
                )}
              </div>
            </div>
          )}

          {interactiveConcept === 'ai_tiers' && (
            <div className="p-3.5 rounded-xl border border-[#f39c12]/20 bg-[#f39c12]/[0.02] text-[10px] space-y-2 leading-relaxed text-zinc-400 h-full flex flex-col justify-center">
              <div className="flex items-center gap-2 text-white font-bold font-sans mb-1 uppercase tracking-wider">
                <Brain className="w-4 h-4 text-[#f39c12]" />
                Dynamic Allocation Rules
              </div>
              <p>Our algorithms calculate the ratio of structural parameters. Any node with direct weight indicators, neural transformers, custom parameters, or dynamic context limits is triaged into <b>Frontier AI</b>, while other standard releases default to <b>General AI</b>.</p>
            </div>
          )}

          {interactiveConcept === 'big_tech' && (
            <div className="p-3.5 rounded-xl border border-blue-500/20 bg-blue-550/[0.02] text-[10px] space-y-2 leading-relaxed text-zinc-400 h-full flex flex-col justify-center">
              <div className="flex items-center gap-2 text-white font-bold font-sans mb-1 uppercase tracking-wider">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                Roadmap Intel Metric
              </div>
              <p>We weigh institutional cloud spendings versus open source commitments. This provides immediate signals to compute-constrained developer pools wishing to run high-density local weights.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
