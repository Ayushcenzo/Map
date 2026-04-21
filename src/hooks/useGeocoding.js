import { useState, useCallback } from 'react';

const INDIA_BBOX = "68.1,6.5,97.4,35.5";

// Global memory cache to prevent duplicate network requests
const searchCache = new Map();
const reverseCache = new Map();

export const useGeocoding = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchAddress = useCallback(async (query) => {
    if (!query || query.trim().length < 2) return [];
    
    const cacheKey = query.trim().toLowerCase();
    if (searchCache.has(cacheKey)) {
      return searchCache.get(cacheKey);
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&bbox=${INDIA_BBOX}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch location data');
      
      const data = await response.json();
      setLoading(false);
      
      const results = data.features.map(feature => {
        const props = feature.properties;
        const coords = feature.geometry.coordinates;
        
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

      searchCache.set(cacheKey, results);
      // Keep cache from growing infinitely
      if (searchCache.size > 100) {
        const firstKey = searchCache.keys().next().value;
        searchCache.delete(firstKey);
      }

      return results;
    } catch (err) {
      setLoading(false);
      setError(err.message);
      return [];
    }
  }, []);

  const reverseGeocode = useCallback(async (lat, lng) => {
    const cacheKey = `${lat},${lng}`;
    if (reverseCache.has(cacheKey)) {
      return reverseCache.get(cacheKey);
    }

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
        
        const result = {
          name: displayName || 'Selected Location',
          lat,
          lng,
          address: props
        };

        reverseCache.set(cacheKey, result);
        if (reverseCache.size > 100) {
          const firstKey = reverseCache.keys().next().value;
          reverseCache.delete(firstKey);
        }

        return result;
      }
      return null;
    } catch (err) {
      console.error(err);
      return null;
    }
  }, []);

  return { searchAddress, reverseGeocode, loading, error };
};
