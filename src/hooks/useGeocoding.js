import { useState, useCallback } from 'react';

// Bounding box for India roughly (minLon, minLat, maxLon, maxLat)
const INDIA_BBOX = "68.1,6.5,97.4,35.5";

export const useGeocoding = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchAddress = useCallback(async (query) => {
    if (!query || query.trim().length < 2) return [];
    
    setLoading(true);
    setError(null);
    try {
      // Use Photon API with bounding box restricted to India
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&bbox=${INDIA_BBOX}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch location data');
      
      const data = await response.json();
      setLoading(false);
      
      return data.features.map(feature => {
        const props = feature.properties;
        const coords = feature.geometry.coordinates; // [lon, lat]
        
        // Construct a clean display name
        const parts = [props.name, props.district, props.city, props.state].filter(Boolean);
        const displayName = Array.from(new Set(parts)).join(', ');

        return {
          id: props.osm_id || `${coords[1]}-${coords[0]}`,
          name: displayName || 'Unknown Location',
          lat: coords[1],
          lng: coords[0],
          address: props
        };
      });
    } catch (err) {
      setLoading(false);
      setError(err.message);
      return [];
    }
  }, []);

  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const response = await fetch(
        `https://photon.komoot.io/reverse?lon=${lng}&lat=${lat}`
      );
      if (!response.ok) throw new Error('Failed to reverse geocode');
      
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const props = data.features[0].properties;
        const parts = [props.name, props.street, props.district, props.city, props.state].filter(Boolean);
        const displayName = Array.from(new Set(parts)).join(', ');
        
        return {
          name: displayName || 'Selected Location',
          lat,
          lng,
          address: props
        };
      }
      return null;
    } catch (err) {
      console.error(err);
      return null;
    }
  }, []);

  return { searchAddress, reverseGeocode, loading, error };
};
