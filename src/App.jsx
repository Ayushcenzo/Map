import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

import { setupLeafletDefaultIcon } from './utils/icons';
import { SearchBar } from './components/UI/SearchBar';
import { useGeocoding } from './hooks/useGeocoding';
import { Crosshair, Loader2 } from 'lucide-react';
import { useGeolocation } from './hooks/useGeolocation';

// Lazy load heavy components
const AdvancedMap = lazy(() => import('./components/Map/AdvancedMap').then(module => ({ default: module.AdvancedMap })));
const Sidebar = lazy(() => import('./components/UI/Sidebar').then(module => ({ default: module.Sidebar })));

setupLeafletDefaultIcon();

// Sleek loading fallback for Suspense
const MapLoader = () => (
  <div className="w-full h-screen bg-slate-100 flex flex-col items-center justify-center text-blue-500 gap-4">
    <Loader2 size={48} className="animate-spin" />
    <span className="text-slate-500 font-medium">Loading Map Data...</span>
  </div>
);

export default function App() {
  const [mapInstance, setMapInstance] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [mapLayer, setMapLayer] = useState('light');
  
  const [exploreCenter, setExploreCenter] = useState([28.6139, 77.2090]);
  const [exploreMarker, setExploreMarker] = useState(null);
  
  const [startCoords, setStartCoords] = useState(null);
  const [startName, setStartName] = useState("");
  const [endCoords, setEndCoords] = useState(null);
  const [endName, setEndName] = useState("");
  const [routeInstructions, setRouteInstructions] = useState([]);
  const [routeSummary, setRouteSummary] = useState(null);
  
  const routingControlRef = useRef(null);
  const { reverseGeocode } = useGeocoding();
  const { getCurrentLocation } = useGeolocation();

  useEffect(() => {
    if (!mapInstance) return;

    if (isNavigating && startCoords && endCoords) {
      if (routingControlRef.current) {
        mapInstance.removeControl(routingControlRef.current);
      }

      const control = L.Routing.control({
        waypoints: [
          L.latLng(startCoords[0], startCoords[1]),
          L.latLng(endCoords[0], endCoords[1])
        ],
        lineOptions: { 
          styles: [{ color: '#2563eb', weight: 6, opacity: 0.9 }] 
        },
        routeWhileDragging: true,
        addWaypoints: false,
        show: false,
      }).addTo(mapInstance);

      routingControlRef.current = control;

      control.on('routesfound', function(e) {
        const routes = e.routes;
        if (routes && routes[0]) {
          setRouteInstructions(routes[0].instructions);
          setRouteSummary(routes[0].summary);
        }
      });

      control.on('waypointschanged', async function(e) {
        const wps = e.waypoints;
        if (wps.length >= 2 && wps[0].latLng && wps[1].latLng) {
          const newStart = [wps[0].latLng.lat, wps[0].latLng.lng];
          const newEnd = [wps[1].latLng.lat, wps[1].latLng.lng];
          
          if (newStart[0] !== startCoords[0] || newStart[1] !== startCoords[1]) {
            setStartCoords(newStart);
            const data = await reverseGeocode(newStart[0], newStart[1]);
            if (data) setStartName(data.name);
          }
          if (newEnd[0] !== endCoords[0] || newEnd[1] !== endCoords[1]) {
            setEndCoords(newEnd);
            const data = await reverseGeocode(newEnd[0], newEnd[1]);
            if (data) setEndName(data.name);
          }
        }
      });

      mapInstance.flyToBounds([startCoords, endCoords], { padding: [50, 50], duration: 1.5 });
      setExploreMarker(null);
    } else {
      if (routingControlRef.current) {
        mapInstance.removeControl(routingControlRef.current);
        routingControlRef.current = null;
        setRouteInstructions([]);
        setRouteSummary(null);
      }
    }
    
    // eslint-disable-next-line
  }, [mapInstance, isNavigating, startCoords, endCoords]);

  const handleSearch = (coords, name) => {
    setExploreCenter(coords);
    setExploreMarker({ lat: coords[0], lng: coords[1], title: name });
    setEndCoords(coords);
    setEndName(name);
  };

  const handleMapClick = async (coords) => {
    if (!isNavigating) {
      const data = await reverseGeocode(coords[0], coords[1]);
      const name = data ? data.name : "Selected Location";
      handleSearch(coords, name);
    }
  };

  const handleLocateMe = async () => {
    try {
      const coords = await getCurrentLocation();
      setExploreCenter(coords);
      setExploreMarker({ lat: coords[0], lng: coords[1], title: "You are here" });
    } catch (err) {
      console.error(err);
    }
  };

  let markers = [];
  if (!isNavigating && exploreMarker) {
    markers = [exploreMarker];
  }

  return (
    <div className="relative w-full h-screen bg-slate-900 font-sans overflow-hidden text-slate-800">
      
      <Suspense fallback={<MapLoader />}>
        <AdvancedMap 
          center={exploreCenter}
          markers={markers}
          setMapInstance={setMapInstance}
          onMapClick={handleMapClick}
          currentLayer={mapLayer}
        />
      </Suspense>

      <div className={`absolute inset-0 pointer-events-none z-[1000] transition-all duration-300 ${isNavigating ? 'opacity-0 -translate-y-full' : 'opacity-100 translate-y-0'}`}>
        <SearchBar 
          onSearch={handleSearch} 
          onOpenNav={() => setIsNavigating(true)} 
          currentLayer={mapLayer}
          onLayerChange={setMapLayer}
        />
      </div>

      <Suspense fallback={null}>
        <Sidebar 
          isOpen={isNavigating}
          onClose={() => setIsNavigating(false)}
          onStartChange={(coords, name) => {
            setStartCoords(coords);
            setStartName(name);
          }}
          onEndChange={(coords, name) => {
            setEndCoords(coords);
            setEndName(name);
          }}
          startValue={startName}
          endValue={endName}
          routeInstructions={routeInstructions}
          routeSummary={routeSummary}
        />
      </Suspense>

      <button 
        onClick={handleLocateMe}
        className="absolute bottom-8 right-8 z-[1000] bg-white p-4 rounded-full shadow-xl shadow-black/10 text-slate-700 hover:text-blue-600 hover:scale-105 transition-all"
        title="Find My Location"
      >
        <Crosshair size={24} />
      </button>

    </div>
  );
}
