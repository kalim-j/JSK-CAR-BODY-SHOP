"use client";

import { useState, useEffect } from "react";
import { Dealer } from "@/types/dealer";
import DealerCard from "./DealerCard";
import DealerMap from "@/components/dealers/DealerMap";
import AISearchBar from "./AISearchBar";
import InquiryModal from "./InquiryModal";
import { CarFront, Map as MapIcon, Grid, Search } from "lucide-react";

const INDIAN_STATES = [
  "Tamil Nadu", "Delhi", "Maharashtra", "Karnataka", "Gujarat", "Rajasthan",
  "Uttar Pradesh", "West Bengal", "Telangana", "Andhra Pradesh", "Kerala",
  "Madhya Pradesh", "Punjab", "Haryana", "Bihar", "Odisha", "Jharkhand",
  "Assam", "Chhattisgarh", "Uttarakhand", "Himachal Pradesh", "Goa",
  "Tripura", "Meghalaya", "Manipur", "Nagaland", "Arunachal Pradesh",
  "Mizoram", "Sikkim", "Jammu and Kashmir", "Ladakh", "Puducherry", "Chandigarh"
];

const SEARCH_TYPES = [
  "car dealer", "car spare parts", "car repair",
  "car body shop", "tyre shop", "car accessories", "auto parts"
];

export default function DealersPage() {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);

  const [selectedCity, setSelectedCity] = useState("");
  const [selectedState, setSelectedState] = useState("Tamil Nadu");
  const [selectedType, setSelectedType] = useState("car dealer");

  const fetchFoursquareDealers = async (city: string, state: string, type: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (city) params.set("city", city);
      params.set("state", state);
      params.set("type", type);
      const res = await fetch(`/api/nearby-dealers?${params.toString()}`);
      const data = await res.json();
      if (data.error) {
        console.error("API error:", data.error);
        setDealers([]);
      } else {
        setDealers(data.dealers || []);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setDealers([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-load on page mount
  useEffect(() => {
    fetchFoursquareDealers("", "Tamil Nadu", "car dealer");
  }, []);

  const handleContact = (dealer: Dealer) => {
    setSelectedDealer(dealer);
  };

  return (
    <div className="min-h-screen bg-black font-sans text-white pt-20 pb-20">
      {/* Hero Banner */}
      <div className="relative border-b border-white/10 overflow-hidden bg-gradient-to-b from-[#111] to-black py-16 mb-10">
        <div className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.15) 0%, transparent 70%)" }}
        />
        <div className="container-custom relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4 tracking-tight">
            India&apos;s Trusted <span className="gold-text">Auto Dealer Network</span>
          </h1>
          <p className="text-charcoal-300 text-lg md:text-xl max-w-2xl mx-auto mb-8">
            Find verified car dealers &amp; spare parts suppliers near you — powered by AI
          </p>
          <div className="inline-flex items-center gap-6 glass border border-white/10 rounded-full px-6 py-3 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-semibold text-white">{dealers.length} Active Dealers</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2 text-sm text-charcoal-400">
              <CarFront size={16} /> Pan India
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom">
        {/* AI Search Bar */}
        <AISearchBar allDealers={dealers} onContact={handleContact} />

        {/* Foursquare Location Search */}
        <div className="flex flex-col md:flex-row gap-3 p-4 bg-charcoal-950 rounded-xl border border-white/10 mb-8">
          <input
            value={selectedCity}
            onChange={e => setSelectedCity(e.target.value)}
            onKeyDown={e => e.key === "Enter" && fetchFoursquareDealers(selectedCity, selectedState, selectedType)}
            placeholder="City (e.g. Chennai, Coimbatore, Delhi)"
            className="flex-1 bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:border-gold-500 focus:outline-none text-sm"
          />
          <select
            value={selectedState}
            onChange={e => setSelectedState(e.target.value)}
            className="bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:border-gold-500 focus:outline-none text-sm"
          >
            {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:border-gold-500 focus:outline-none text-sm"
          >
            {SEARCH_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <button
            onClick={() => fetchFoursquareDealers(selectedCity, selectedState, selectedType)}
            className="btn-gold px-8 py-3 rounded-lg font-bold whitespace-nowrap flex items-center gap-2 justify-center"
          >
            <Search size={16} /> Search
          </button>
        </div>

        {/* Results Header & View Toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-xl font-display font-bold text-white">
            Results <span className="text-gold-500">({dealers.length})</span>
          </h2>
          <div className="flex bg-charcoal-950 border border-white/10 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${viewMode === "grid" ? "bg-white/10 text-white" : "text-charcoal-400 hover:text-white"}`}
            >
              <Grid size={16} /> Grid
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${viewMode === "map" ? "bg-white/10 text-white" : "text-charcoal-400 hover:text-white"}`}
            >
              <MapIcon size={16} /> Map
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-charcoal-900 rounded-xl h-64 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : dealers.length === 0 ? (
          <div className="text-center py-20 glass-dark border border-white/5 rounded-2xl">
            <p className="text-5xl mb-4">🔍</p>
            <h3 className="text-xl font-bold text-white mb-2">No Dealers Found</h3>
            <p className="text-charcoal-400">Try searching a different city or type</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {dealers.map((dealer, idx) => (
              <DealerCard key={(dealer as any).id || idx} dealer={dealer} onContact={handleContact} />
            ))}
          </div>
        ) : (
          <div className="animate-fade-in">
            <div className="mb-4 text-charcoal-300 font-medium text-sm">
              📍 Showing {dealers.filter(d => (d as any).lat || d.latitude).length} dealers with location data on the map
            </div>
            <DealerMap dealers={dealers as any} />
          </div>
        )}

        {/* Attribution */}
        {!loading && dealers.length > 0 && (
          <div className="mt-12 text-center text-charcoal-500 text-xs font-semibold uppercase tracking-wider">
            Real dealer data powered by Foursquare Places API
          </div>
        )}
      </div>

      {selectedDealer && (
        <InquiryModal
          dealer={selectedDealer}
          onClose={() => setSelectedDealer(null)}
        />
      )}
    </div>
  );
}
