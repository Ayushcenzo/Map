import React from 'react';
import { LocationInput } from './LocationInput';
import { ArrowLeft, Navigation, MapPin, X } from 'lucide-react';
import { useGeolocation } from '../../hooks/useGeolocation';

export const Sidebar = ({ 
  isOpen, 
  onClose, 
  onStartChange, 
  onEndChange,
  startValue,
  endValue,
  routeInstructions
}) => {
  const { getCurrentLocation, loading } = useGeolocation();

  const handleMyLocation = async () => {
    try {
      const coords = await getCurrentLocation();
      onStartChange(coords, "My Location");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div 
      className={`absolute top-0 left-0 h-full w-full max-w-md bg-white shadow-2xl z-[1000] transition-transform duration-300 ease-in-out flex flex-col ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 pb-6 shadow-md z-10">
        <div className="flex items-center gap-4 mb-4">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-lg font-medium">Directions</h2>
        </div>

        {/* Inputs */}
        <div className="relative flex flex-col gap-3 px-2">
          {/* Visual Path Line */}
          <div className="absolute left-6 top-8 bottom-8 w-0.5 border-l-2 border-dashed border-white/40"></div>

          <LocationInput 
            placeholder="Choose starting point"
            icon={Navigation}
            onLocationSelect={onStartChange}
            initialValue={startValue}
            showMyLocation={true}
            onMyLocationClick={handleMyLocation}
            className="[&>div]:bg-blue-700 [&>div]:border-blue-500 [&>div]:text-white [&_input]:text-white [&_input]:placeholder-blue-200"
          />

          <LocationInput 
            placeholder="Choose destination"
            icon={MapPin}
            onLocationSelect={onEndChange}
            initialValue={endValue}
            className="[&>div]:bg-blue-700 [&>div]:border-blue-500 [&>div]:text-white [&_input]:text-white [&_input]:placeholder-blue-200"
          />
        </div>
      </div>

      {/* Route Details / Instructions */}
      <div className="flex-1 bg-slate-50 overflow-y-auto p-4">
        {routeInstructions && routeInstructions.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-700 mb-2 px-2 uppercase tracking-wider">Step-by-Step</h3>
            {routeInstructions.map((instruction, idx) => (
              <div key={idx} className="flex gap-3 bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                <div className="text-blue-500 mt-0.5">
                  <Navigation size={16} className={instruction.type?.includes('Left') ? '-rotate-90' : instruction.type?.includes('Right') ? 'rotate-90' : 'rotate-0'} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-slate-700 font-medium">{instruction.text}</span>
                  <span className="text-xs text-slate-400">{instruction.distance}m</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <Navigation size={48} className="mb-4 opacity-20" />
            <p className="text-sm font-medium">Enter locations to get directions</p>
          </div>
        )}
      </div>
    </div>
  );
};
