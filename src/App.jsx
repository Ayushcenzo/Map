import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

import { setupLeafletDefaultIcon } from './utils/icons';
import { AdvancedMap } from './components/Map/AdvancedMap';
import { SearchBar } from './components/UI/SearchBar';
import { Sidebar } from './components/UI/Sidebar';
import { useGeocoding } from './hooks/useGeocoding';
import { Crosshair } from 'lucide-react';
import { useGeolocation } from './hooks/useGeolocation';

setupLeafletDefaultIcon();

export default function App() {
  const [mapInstance, setMapInstance] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [mapLayer, setMapLayer] = useState('light');
  
  // State for explore mode
  const [exploreCenter, setExploreCenter] = useState([28.6139, 77.2090]); // Delhi
  const [exploreMarker, setExploreMarker] = useState(null);
  
  // State for navigation mode
  const [startCoords, setStartCoords] = useState(null);
  const [startName, setStartName] = useState("");
  const [endCoords, setEndCoords] = useState(null);
  const [endName, setEndName] = useState("");
  const [routeInstructions, setRouteInstructions] = useState([]);
  
  const routingControlRef = useRef(null);
  const { reverseGeocode } = useGeocoding();
  const { getCurrentLocation } = useGeolocation();

  // Handle routing logic
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
        routeWhileDragging: true, // Allow user to drag markers to adjust route
        addWaypoints: false,      // Prevent adding waypoints by clicking line
        show: false,              // Hide default routing box, we use Sidebar
      }).addTo(mapInstance);

      routingControlRef.current = control;

      // Intercept routing instructions
      control.on('routesfound', function(e) {
        const routes = e.routes;
        if (routes && routes[0]) {
          setRouteInstructions(routes[0].instructions);
        }
      });

      // Update addresses if markers are dragged
      control.on('waypointschanged', async function(e) {
        const wps = e.waypoints;
        if (wps.length >= 2 && wps[0].latLng && wps[1].latLng) {
          const newStart = [wps[0].latLng.lat, wps[0].latLng.lng];
          const newEnd = [wps[1].latLng.lat, wps[1].latLng.lng];
          
          // Only update if coords actually changed
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
      setExploreMarker(null); // Clear explore marker when routing
    } else {
      // Clean up route if we stop navigating
      if (routingControlRef.current) {
        mapInstance.removeControl(routingControlRef.current);
        routingControlRef.current = null;
        setRouteInstructions([]);
      }
    }
    
    // eslint-disable-next-line
  }, [mapInstance, isNavigating, startCoords, endCoords]); // intentionally omitted reverseGeocode to prevent loops

  // Handle general search from the top bar
  const handleSearch = (coords, name) => {
    setExploreCenter(coords);
    setExploreMarker({ lat: coords[0], lng: coords[1], title: name });
    // Pre-fill destination just in case user clicks Directions next
    setEndCoords(coords);
    setEndName(name);
  };

  // Handle clicking on map
  const handleMapClick = async (coords) => {
    if (!isNavigating) {
      const data = await reverseGeocode(coords[0], coords[1]);
      const name = data ? data.name : "Selected Location";
      handleSearch(coords, name);
    }
  };

  // FAB for current location
  const handleLocateMe = async () => {
    try {
      const coords = await getCurrentLocation();
      setExploreCenter(coords);
      setExploreMarker({ lat: coords[0], lng: coords[1], title: "You are here" });
    } catch (err) {
      console.error(err);
    }
  };

  // Compute what markers to show
  let markers = [];
  if (!isNavigating && exploreMarker) {
    markers = [exploreMarker];
  }

  return (
    <div className="relative w-full h-screen bg-slate-900 font-sans overflow-hidden text-slate-800">
      
      {/* Map Layer - Render first so it stays at bottom */}
      <AdvancedMap 
        center={exploreCenter}
        markers={markers}
        setMapInstance={setMapInstance}
        onMapClick={handleMapClick}
        currentLayer={mapLayer}
      />

      {/* Top Search Bar (Only visible when not navigating) */}
      <div className={`absolute inset-0 pointer-events-none z-[1000] transition-all duration-300 ${isNavigating ? 'opacity-0 -translate-y-full' : 'opacity-100 translate-y-0'}`}>
        <SearchBar 
          onSearch={handleSearch} 
          onOpenNav={() => setIsNavigating(true)} 
          currentLayer={mapLayer}
          onLayerChange={setMapLayer}
        />
      </div>

      {/* Side Navigation Panel */}
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
      />

      {/* Locate Me FAB */}
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
