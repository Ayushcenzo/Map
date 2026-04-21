import React, { useState, useEffect, useRef } from 'react';
import { useGeocoding } from '../../hooks/useGeocoding';
import { MapPin, Loader2, Navigation } from 'lucide-react';

export const LocationInput = ({ 
  placeholder, 
  icon: Icon = MapPin, 
  onLocationSelect, 
  initialValue = "",
  className = "",
  showMyLocation = false,
  onMyLocationClick
}) => {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const { searchAddress, loading } = useGeocoding();
  const wrapperRef = useRef(null);

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 3 && isOpen) {
        const data = await searchAddress(query);
        setResults(data);
      } else {
        setResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query, isOpen, searchAddress]);

  const handleSelect = (loc) => {
    setQuery(loc.name);
    setIsOpen(false);
    onLocationSelect([loc.lat, loc.lng], loc.name);
  };

  return (
    <div className={`relative w-full ${className}`} ref={wrapperRef}>
      <div className="relative flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
        <div className="pl-4 pr-2 text-slate-400">
          <Icon size={18} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full py-3 pr-4 text-sm text-slate-700 outline-none placeholder:text-slate-400"
        />
        {loading && (
          <div className="pr-4 text-slate-400">
            <Loader2 size={16} className="animate-spin" />
          </div>
        )}
      </div>

      {isOpen && (results.length > 0 || showMyLocation) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
          {showMyLocation && (
             <button 
                onClick={() => {
                  setIsOpen(false);
                  if (onMyLocationClick) onMyLocationClick();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-slate-50 border-b border-slate-100 transition-colors text-blue-600 font-medium"
              >
                <Navigation size={16} />
                Use My Current Location
             </button>
          )}
          {results.map((loc) => (
            <button
              key={loc.id}
              onClick={() => handleSelect(loc)}
              className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
            >
              <MapPin size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-700 line-clamp-1">{loc.name.split(',')[0]}</span>
                <span className="text-xs text-slate-500 line-clamp-1">{loc.name}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
