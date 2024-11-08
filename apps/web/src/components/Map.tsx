'use client';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface MapProps {
  center: [number, number];
  zoom: number;
  onLocationSelect: (lat: number, lon: number) => void;
  markerPosition: [number, number] | null;
}

function LocationMarker({
  onLocationSelect,
  markerPosition,
}: Pick<MapProps, 'onLocationSelect' | 'markerPosition'>) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return markerPosition ? <Marker position={markerPosition} /> : null;
}

export default function Map({
  center,
  zoom,
  onLocationSelect,
  markerPosition,
}: MapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ width: '100%', height: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <LocationMarker
        onLocationSelect={onLocationSelect}
        markerPosition={markerPosition}
      />
    </MapContainer>
  );
}
