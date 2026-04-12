"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Search, MapPin, Star, Wrench, Phone, ChevronRight, CarFront, Filter, X } from "lucide-react";
import { Dealer, subscribeToDealers } from "@/lib/firestore";
import { useDebouncedValue } from "@/hooks/useDebounce";

const CAR_TYPES = ["All", "Sedan", "SUV", "Luxury", "EV", "Hatchback"];

export default function PublicDealersPage() {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [rawSearch, setRawSearch] = useState("");
  const search = useDebouncedValue(rawSearch, 300);
  const [selectedType, setSelectedType] = useState("All");

  useEffect(() => {
    // Listen to real-time dealers
    const unsubscribe = subscribeToDealers(
      (data) => {
        // filter out inactive
        setDealers(data.filter((d) => d.status === "active"));
        setLoading(false);
      },
      (err) => {
        console.error("Error loading dealers", err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const filteredDealers = useMemo(() => {
    return dealers.filter((d) => {
      // 1. Search Query
      const q = search.toLowerCase();
      if (
        q &&
        !d.name.toLowerCase().includes(q) &&
        !d.city.toLowerCase().includes(q) &&
        !d.state.toLowerCase().includes(q)
      ) {
        return false;
      }
      
      // 2. Car Type Filter
      if (selectedType !== "All") {
        const hasType = d.carTypes.some(t => 
          t.toLowerCase().includes(selectedType.toLowerCase()) || 
          selectedType.toLowerCase().includes(t.toLowerCase()) ||
          t.toLowerCase().includes("all")
        );
        if (!hasType) return false;
      }

      return true;
    });
  }, [dealers, search, selectedType]);

  const clearFilters = () => {
    setRawSearch("");
    setSelectedType("All");
  };

  return (
    <div className="min-h-screen bg-black pt-20">
      {/* Header */}
      <div className="bg-charcoal-950 border-b border-white/5 py-16">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold-500/30 text-gold-400 text-sm font-medium mb-6">
              Certified Partners
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              Authorized <span className="gold-text">Dealer Network</span>
            </h1>
            <p className="text-charcoal-400 max-w-xl mx-auto">
              Connect with our certified network of restoration and sales partners across India. 
              Find your dream restored car from a trusted dealer near you.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container-custom py-10">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <div className="relative flex-1 max-w-xl">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400" />
            <input
              type="text"
              placeholder="Search by dealer name, city, or state..."
              value={rawSearch}
              onChange={(e) => setRawSearch(e.target.value)}
              className="input-dark w-full pl-11 pr-10 py-3 rounded-xl text-sm"
            />
            {rawSearch && (
              <button
                onClick={() => setRawSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-500 hover:text-white"
              >
                <X size={15} />
              </button>
            )}
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            {CAR_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  selectedType === type
                    ? "btn-gold"
                    : "glass text-charcoal-300 border border-white/10 hover:border-gold-500/30 hover:text-white"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-charcoal-400 text-sm">
            Showing <span className="text-white font-semibold">{filteredDealers.length}</span> active dealers
          </p>
          {(rawSearch || selectedType !== "All") && (
            <button
              onClick={clearFilters}
              className="text-xs text-charcoal-400 hover:text-red-400 flex items-center gap-1 transition-colors"
            >
              <X size={12} /> Clear filters
            </button>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 rounded-2xl border border-white/5 bg-charcoal-900/50 skeleton" />
            ))}
          </div>
        ) : filteredDealers.length === 0 ? (
          <div className="text-center py-20 glass-dark rounded-2xl border border-white/5">
            <Filter size={48} className="text-charcoal-700 mx-auto mb-4" />
            <h3 className="text-white font-semibold text-xl mb-2">No dealers found</h3>
            <p className="text-charcoal-400 mb-6 max-w-md mx-auto">
              We couldn&apos;t find any dealers matching your filters. Try adjusting your search criteria.
            </p>
            <button onClick={clearFilters} className="btn-outline-gold px-6 py-2 rounded-full text-sm">
              Clear All Filters
            </button>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredDealers.map((dealer, idx) => (
                <DealerCard key={dealer.id || idx} dealer={dealer} index={idx} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function DealerCard({ dealer, index }: { dealer: Dealer; index: number }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="glass-dark rounded-2xl p-6 border border-white/5 hover:border-gold-500/30 transition-all group flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1 group-hover:text-gold-400 transition-colors">
            {dealer.name}
          </h3>
          <div className="flex items-center gap-1.5 text-charcoal-400 text-sm">
            <MapPin size={14} className="text-gold-500" />
            {dealer.city}, {dealer.state}
          </div>
        </div>
        <div className="flex items-center gap-1 bg-gold-500/10 px-2 py-1 rounded-md border border-gold-500/20">
          <Star size={12} className="text-gold-500 fill-gold-500" />
          <span className="text-gold-400 text-xs font-bold">{dealer.rating.toFixed(1)}</span>
        </div>
      </div>

      <div className="space-y-4 mb-6 flex-grow">
        {/* Specs */}
        <div>
          <p className="text-xs text-charcoal-500 uppercase font-semibold tracking-wider mb-2 flex items-center gap-1.5">
            <Wrench size={12} /> Specialization
          </p>
          <div className="flex flex-wrap gap-1.5">
            {dealer.specialization.slice(0, 3).map((spec, i) => (
              <span key={i} className="text-xs text-charcoal-300 bg-white/5 px-2 py-1 rounded border border-white/10">
                {spec}
              </span>
            ))}
            {dealer.specialization.length > 3 && (
              <span className="text-xs text-charcoal-500 bg-white/5 px-2 py-1 rounded border border-white/5">
                +{dealer.specialization.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Cars */}
        <div>
          <p className="text-xs text-charcoal-500 uppercase font-semibold tracking-wider mb-2 flex items-center gap-1.5">
            <CarFront size={12} /> Handles Car Types
          </p>
          <p className="text-sm text-charcoal-300">
            {dealer.carTypes.join(", ")}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-white/5 mt-auto">
        <a
          href={`tel:${dealer.phone}`}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 text-charcoal-300 hover:bg-white/10 hover:text-white border border-white/10 transition-colors text-sm font-medium"
        >
          <Phone size={14} /> Contact
        </a>
        <Link
          href={`/buy?search=${encodeURIComponent(dealer.city)}`}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl btn-outline-gold text-sm font-semibold group-hover:bg-gold-500 group-hover:text-black transition-all"
        >
          View Local Cars <ChevronRight size={14} />
        </Link>
      </div>
    </motion.div>
  );
}
