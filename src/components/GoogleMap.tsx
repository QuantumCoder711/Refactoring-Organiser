import React, { useEffect, useRef, useState } from 'react';
import { googleMapsApiKey } from '../constants';

interface GoogleMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  latitude,
  longitude,
  zoom = 15,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [position, setPosition] = useState({ lat: latitude, lng: longitude });

  useEffect(() => {
    // Load Google Maps API script
    const loadGoogleMapsApi = () => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&callback=initMap`;
      script.async = true;
      script.defer = true;
      window.initMap = initializeMap;
      document.head.appendChild(script);

      return () => {
        window.initMap = () => {};
        document.head.removeChild(script);
      };
    };

    // Initialize the map
    const initializeMap = () => {
      if (mapRef.current && !mapInstanceRef.current) {
        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center: position,
          zoom: zoom,
          draggable: true,
        });

        // Add a draggable marker at the specified location
        markerRef.current = new google.maps.Marker({
          position: position,
          map: mapInstanceRef.current,
          draggable: true,
          animation: google.maps.Animation.DROP,
          title: 'Drag me!'
        });

        // Add event listener for marker drag end
        google.maps.event.addListener(markerRef.current, 'dragend', (event: any) => {
          const newPosition = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
          };
          setPosition(newPosition);
        });
      }
    };

    // If the Google Maps API is already loaded, initialize the map directly
    if (window.google && window.google.maps) {
      initializeMap();
    } else {
      loadGoogleMapsApi();
    }

    // Update map when props change
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(position);
      mapInstanceRef.current.setZoom(zoom);
    }

    // Update marker when position changes
    if (markerRef.current) {
      markerRef.current.setPosition(position);
    }

    // Cleanup function
    return () => {
      if (window.google && mapInstanceRef.current) {
        // Clean up map instance if needed
        if (markerRef.current) {
          google.maps.event.clearListeners(markerRef.current, 'dragend');
          markerRef.current = null;
        }
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, zoom, position]);

  return (
    <div 
      ref={mapRef} 
      className={`w-full h-full rounded-lg`}
      aria-label="Google Map"
    />
  );
};

// Add the global window type for TypeScript
declare global {
  interface Window {
    initMap: () => void;
    google: any;
  }
}

export default GoogleMap;
