import React, { useEffect, useRef } from 'react';

interface GoogleMapProps {
  isLoaded: boolean;
  latitude: number;
  longitude: number;
  zoom?: number;
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  isLoaded,
  latitude,
  longitude,
  zoom = 15,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.google || !window.google.maps) return;

    const position = { lat: latitude, lng: longitude };

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: position,
        zoom,
      });

      markerRef.current = new window.google.maps.Marker({
        map: mapInstanceRef.current,
        position,
        draggable: true,
      });

      markerRef.current.addListener('dragend', (event:any) => {
        const newLat = event.latLng?.lat();
        const newLng = event.latLng?.lng();
        if (newLat !== undefined && newLng !== undefined) {
          console.log('New coordinates:', { lat: newLat, lng: newLng });
        }
      });
    } else {
      mapInstanceRef.current.setCenter(position);
      markerRef.current?.setPosition(position);
    }

    return () => {
      if (markerRef.current) {
        window.google.maps.event.clearInstanceListeners(markerRef.current);
        markerRef.current = null;
      }
      mapInstanceRef.current = null;
    };
  }, [isLoaded, latitude, longitude, zoom]);

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-lg"
      style={{ minHeight: '240px' }}
    />
  );
};

export default GoogleMap;
