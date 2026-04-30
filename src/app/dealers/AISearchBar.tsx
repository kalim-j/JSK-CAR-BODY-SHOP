"use client";

import { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { Dealer } from "@/types/dealer";
import DealerCard from "./DealerCard";

interface AISearchBarProps {
  allDealers: Dealer[];
  onContact: (dealer: Dealer) => void;
}

export default function AISearchBar({ allDealers, onContact }: AISearchBarProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ dealer: Dealer; reason: string; score: number }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, dealers: allDealers }),
      });

      if (!response.ok) throw new Error("Failed to get AI recommendations");
      
      const data = await response.json();
      
      // Match dealer_ids from AI response back to the full Dealer objects
      const matchedResults = data.recommendations.map((rec: any) => {
        const dealer = allDealers.find(d => d.id === rec.dealer_id);
        return dealer ? { dealer, reason: rec.reason, score: rec.confidence_score } : null;
      }).filter(Boolean);

      setResults(matchedResults);
    } catch (err) {
      console.error(err);
      setError("AI is currently unavailable. Please try our standard filters.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-12">
      <div className="bg-gradient-to-r from-gold-600/40 via-charcoal-900 to-black p-[1px] rounded-2xl mb-6 shadow-gold">
        <div className="bg-charcoal-950 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles size={120} className="text-gold-500" />
          </div>
          
          <div className="relative z-10">
            <h3 className="text-xl font-display font-bold text-white mb-2 flex items-center gap-2">
              <span className="bg-gold-500/20 p-1.5 rounded-lg text-gold-500">
                <Sparkles size={18} />
              </span>
              AI Dealer Finder
            </h3>
            <p className="text-charcoal-400 text-sm mb-4">
              Describe what you&apos;re looking for in plain English. e.g. &quot;I need a trusted Honda spare parts shop in Pune with good AC repair experience.&quot;
            </p>

            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-500" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="What are you looking for?"
                  className="w-full bg-black border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-gold-500/50 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="btn-gold px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <>Find Dealers <Sparkles size={16} /></>
                )}
              </button>
            </form>
            {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
          </div>
        </div>
      </div>

      {results.length > 0 && (
        <div className="animate-fade-up">
          <h4 className="text-lg font-bold text-gold-400 mb-4 flex items-center gap-2">
            <Sparkles size={16} /> Top AI Recommendations
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {results.map((item, idx) => (
              <div key={idx} className="relative group">
                <div className="absolute -top-3 -right-3 z-20 bg-gold-500 text-black font-bold text-xs px-2 py-1 rounded-full border-2 border-charcoal-950 shadow-lg">
                  {item.score}% Match
                </div>
                <div className="h-full border-2 border-gold-500/30 rounded-2xl overflow-hidden relative">
                  <DealerCard dealer={item.dealer} onContact={onContact} />
                  <div className="bg-charcoal-900 border-t border-gold-500/20 p-3 text-xs text-charcoal-300">
                    <strong className="text-gold-400 block mb-1">AI Reason:</strong>
                    {item.reason}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
