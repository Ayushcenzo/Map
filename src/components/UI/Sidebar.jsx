import React from 'react';
import { LocationInput } from './LocationInput';
import { ArrowLeft, Navigation, MapPin, ArrowUp, CornerUpLeft, CornerUpRight, Undo2, RotateCw, Flag } from 'lucide-react';
import { useGeolocation } from '../../hooks/useGeolocation';

const getInstructionIcon = (type) => {
  if (!type) return Navigation;
  const t = type.toLowerCase();
  if (t.includes('straight')) return ArrowUp;
  if (t.includes('slightleft') || t.includes('left')) return CornerUpLeft;
  if (t.includes('slightright') || t.includes('right')) return CornerUpRight;
  if (t.includes('uturn')) return Undo2;
  if (t.includes('roundabout')) return RotateCw;
  if (t.includes('destination') || t.includes('waypoint')) return Flag;
  return Navigation;
};

export const Sidebar = ({ 
  isOpen, 
  onClose, 
  onStartChange, 
  onEndChange,
  startValue,
  endValue,
  routeInstructions,
  routeSummary
}) => {
  const { getCurrentLocation } = useGeolocation();

  const handleMyLocation = async () => {
    try {
      const coords = await getCurrentLocation();
      onStartChange(coords, "My Location");
    } catch (err) {
      console.error(err);
    }
  };

  const formatDistance = (meters) => {
    if (!meters) return "";
    return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;
  };

  const formatTime = (seconds) => {
    if (!seconds) return "";
    const m = Math.round(seconds / 60);
    return m >= 60 ? `${Math.floor(m / 60)} hr ${m % 60} min` : `${m} min`;
  };

  return (
    <div 
      className={`absolute top-0 left-0 h-full w-full md:w-[400px] bg-white shadow-2xl z-[1000] transition-transform duration-300 ease-in-out flex flex-col ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="bg-blue-600 text-white p-4 pb-6 shadow-md z-10 flex-shrink-0">
        <div className="flex items-center gap-4 mb-4">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-lg font-medium">Directions</h2>
        </div>

        <div className="relative flex flex-col gap-3 px-2">
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

      <div className="flex-1 bg-slate-50 overflow-y-auto">
        {routeSummary && (
          <div className="p-4 bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm flex items-baseline gap-3">
            <h3 className="text-2xl font-bold text-green-600">
              {formatTime(routeSummary.totalTime)}
            </h3>
            <span className="text-slate-500 font-medium">
              ({formatDistance(routeSummary.totalDistance)})
            </span>
          </div>
        )}

        <div className="p-4">
          {routeInstructions && routeInstructions.length > 0 ? (
            <div className="space-y-0 relative">
              <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-blue-100 z-0"></div>
              {routeInstructions.map((instruction, idx) => {
                const Icon = getInstructionIcon(instruction.type);
                return (
                  <div key={idx} className="relative z-10 flex items-start gap-4 p-3 hover:bg-slate-100 rounded-xl transition-colors group">
                    <div className="bg-white border-2 border-blue-100 p-2 rounded-full text-blue-600 group-hover:border-blue-300 shadow-sm">
                      <Icon size={18} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col flex-1 pt-1 border-b border-slate-100 pb-4">
                      <span className="text-base text-slate-800 font-medium leading-tight mb-1" dangerouslySetInnerHTML={{ __html: instruction.text }}></span>
                      {instruction.distance > 0 && (
                        <span className="text-sm text-slate-500">{formatDistance(instruction.distance)}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-[200px] flex flex-col items-center justify-center text-slate-400">
              <Navigation size={48} className="mb-4 opacity-20" />
              <p className="text-sm font-medium">Enter locations to get directions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
