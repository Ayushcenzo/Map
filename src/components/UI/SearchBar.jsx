import React, { useState, useRef, useEffect } from 'react';
import { LocationInput } from './LocationInput';
import { Search, CornerUpRight, Menu, Map, Moon, Satellite } from 'lucide-react';

export const SearchBar = ({ onSearch, onOpenNav, currentLayer, onLayerChange }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="absolute top-6 left-6 z-[1000] w-full max-w-sm flex items-center gap-2 pointer-events-none">
      {/* Floating Search Container */}
      <div className="flex-1 bg-white rounded-2xl shadow-lg shadow-black/5 pointer-events-auto flex items-center border border-slate-200 relative">
        <div ref={menuRef} className="relative">
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-4 text-slate-400 hover:text-blue-600 transition-colors"
          >
            <Menu size={20} />
          </button>
          
          {menuOpen && (
            <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden w-48 z-50">
              <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                Map Type
              </div>
              <button 
                onClick={() => { onLayerChange('light'); setMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-slate-50 transition-colors ${currentLayer === 'light' ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-700'}`}
              >
                <Map size={16} /> Default
              </button>
              <button 
                onClick={() => { onLayerChange('dark'); setMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-slate-50 transition-colors ${currentLayer === 'dark' ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-700'}`}
              >
                <Moon size={16} /> Dark Mode
              </button>
              <button 
                onClick={() => { onLayerChange('satellite'); setMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-slate-50 transition-colors ${currentLayer === 'satellite' ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-700'}`}
              >
                <Satellite size={16} /> Satellite
              </button>
            </div>
          )}
        </div>

        <div className="flex-1">
          <LocationInput 
            placeholder="Search Google Maps" 
            icon={Search}
            onLocationSelect={onSearch}
            className="border-none shadow-none rounded-none [&>div]:border-none [&>div]:shadow-none focus-within:ring-0 focus-within:border-transparent bg-transparent"
          />
        </div>
        <button 
          onClick={onOpenNav}
          className="p-3 mr-1 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-center"
          title="Directions"
        >
          <CornerUpRight size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};
