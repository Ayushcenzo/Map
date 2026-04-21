import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MAP_LAYERS = {
  light: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxNativeZoom: 19,
    maxZoom: 22
  },
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxNativeZoom: 19,
    maxZoom: 22
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxNativeZoom: 19,
    maxZoom: 22
  }
};

const MapController = ({ center, zoom, bounds }) => {
  const map = useMap();
  
  useEffect(() => {
    if (bounds) {
      map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
    } else if (center) {
      map.flyTo(center, zoom || 13, { duration: 1.5 });
    }
  }, [map, center, zoom, bounds]);
  
  return null;
};

const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick([e.latlng.lat, e.latlng.lng]);
      }
    },
  });
  return null;
};

export const AdvancedMap = ({ 
  center, 
  zoom = 13, 
  bounds,
  markers = [],
  setMapInstance,
  onMapClick,
  currentLayer = 'light'
}) => {
  const layerConfig = MAP_LAYERS[currentLayer] || MAP_LAYERS.light;

  return (
    <div className="w-full h-screen z-0 absolute inset-0">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        maxZoom={22}
        className="h-full w-full"
        zoomControl={false}
        ref={setMapInstance}
      >
        <TileLayer
          key={currentLayer}
          attribution={layerConfig.attribution}
          url={layerConfig.url} 
          maxZoom={layerConfig.maxZoom}
          maxNativeZoom={layerConfig.maxNativeZoom}
          keepBuffer={8}
        />
        <MapController center={center} zoom={zoom} bounds={bounds} />
        <MapClickHandler onMapClick={onMapClick} />
        
        {markers.map((marker, index) => (
          <Marker key={marker.id || index} position={[marker.lat, marker.lng]}>
            {marker.title && <Popup>{marker.title}</Popup>}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
