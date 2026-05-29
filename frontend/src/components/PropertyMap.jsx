import { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '12px',
};

const PropertyMap = ({ address }) => {
  const [center, setCenter] = useState(null);
  const [error, setError] = useState('');

  // Combine address fields into a single string
  const fullAddress = `${address?.street || ''}, ${address?.locality || ''}, ${address?.city || ''}, ${address?.state || ''}, ${address?.pincode || ''}`;

  useEffect(() => {
    if (!fullAddress.trim()) return;

    const geocode = async () => {
      try {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${apiKey}`
        );
        const data = await response.json();
        if (data.status === 'OK') {
          const { lat, lng } = data.results[0].geometry.location;
          setCenter({ lat, lng });
        } else {
          setError('Could not find this address on the map.');
        }
      } catch (err) {
        setError('Failed to load map location.');
      }
    };

    geocode();
  }, [fullAddress]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (!center) {
    return (
      <div className="bg-gray-100 rounded-xl h-[300px] flex items-center justify-center text-gray-400">
        Loading map…
      </div>
    );
  }

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={15}
      >
        <Marker position={center} />
      </GoogleMap>
    </LoadScript>
  );
};

export default PropertyMap;