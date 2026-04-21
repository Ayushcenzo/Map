import { useState } from 'react';

export const useGeolocation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser');
        reject(new Error('Not supported'));
        return;
      }

      setLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLoading(false);
          const coords = [position.coords.latitude, position.coords.longitude];
          resolve(coords);
        },
        (err) => {
          setLoading(false);
          setError('Unable to retrieve your location');
          reject(err);
        }
      );
    });
  };

  return { getCurrentLocation, loading, error };
};
