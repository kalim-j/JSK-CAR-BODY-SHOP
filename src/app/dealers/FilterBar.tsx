import { useState } from "react";
import { Search, MapPin, Filter, X } from "lucide-react";
import { useDebouncedValue } from "@/hooks/useDebounce";

interface FilterBarProps {
  onFilterChange: (filters: DealerFilters) => void;
  states: string[];
}

export interface DealerFilters {
  search: string;
  state: string;
  type: string;
  minRating: number;
  verifiedOnly: boolean;
}

export default function FilterBar({ onFilterChange, states }: FilterBarProps) {
  const [filters, setFilters] = useState<DealerFilters>({
    search: "",
    state: "All",
    type: "All",
    minRating: 0,
    verifiedOnly: false,
  });

  const debouncedSearch = useDebouncedValue(filters.search, 300);

  // Trigger parent filter update when debounced search or other filters change
  // In a real implementation, we'd use useEffect to sync local state with parent.
  // For simplicity, we trigger the callback on change.
  
  const handleChange = (key: keyof DealerFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const cleared = {
      search: "",
      state: "All",
      type: "All",
      minRating: 0,
      verifiedOnly: false,
    };
    setFilters(cleared);
    onFilterChange(cleared);
  };

  const activeFilterCount = 
    (filters.search ? 1 : 0) + 
    (filters.state !== "All" ? 1 : 0) + 
    (filters.type !== "All" ? 1 : 0) + 
    (filters.minRating > 0 ? 1 : 0) + 
    (filters.verifiedOnly ? 1 : 0);

  return (
    <div className="bg-charcoal-900 border border-white/10 rounded-2xl p-4 md:p-6 mb-8 shadow-xl">
      <div className="flex flex-col lg:flex-row gap-4 items-end">
        {/* Search */}
        <div className="w-full lg:flex-1 relative">
          <label className="block text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-2">Search Dealers</label>
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-500" />
            <input
              type="text"
              placeholder="Search by name, city, or specializations..."
              value={filters.search}
              onChange={(e) => handleChange("search", e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-gold-500/50 transition-colors"
            />
            {filters.search && (
              <button onClick={() => handleChange("search", "")} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-500 hover:text-white">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="w-full lg:w-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* State */}
          <div>
            <label className="block text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-2">State</label>
            <select
              value={filters.state}
              onChange={(e) => handleChange("state", e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-gold-500/50 appearance-none"
            >
              <option value="All">All States</option>
              {states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-2">Type</label>
            <select
              value={filters.type}
              onChange={(e) => handleChange("type", e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-gold-500/50 appearance-none"
            >
              <option value="All">All Types</option>
              <option value="car_dealer">Car Dealers</option>
              <option value="spare_parts">Spare Parts</option>
              <option value="both">Both</option>
            </select>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-2">Rating</label>
            <select
              value={filters.minRating}
              onChange={(e) => handleChange("minRating", Number(e.target.value))}
              className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-gold-500/50 appearance-none"
            >
              <option value={0}>Any Rating</option>
              <option value={4}>4.0+ Stars</option>
              <option value={4.5}>4.5+ Stars</option>
            </select>
          </div>

          {/* Verified Toggle */}
          <div className="flex flex-col justify-center">
            <label className="block text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-3">Verified Only</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={filters.verifiedOnly} 
                onChange={(e) => handleChange("verifiedOnly", e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-black border border-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-charcoal-400 after:border-charcoal-400 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-verified-badge peer-checked:after:bg-white"></div>
            </label>
          </div>
        </div>
      </div>

      {activeFilterCount > 0 && (
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
          <p className="text-xs text-gold-400 font-medium">
            {activeFilterCount} active filter{activeFilterCount > 1 ? 's' : ''} applied
          </p>
          <button 
            onClick={clearFilters}
            className="text-xs text-charcoal-400 hover:text-white transition-colors flex items-center gap-1"
          >
            <X size={12} /> Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
