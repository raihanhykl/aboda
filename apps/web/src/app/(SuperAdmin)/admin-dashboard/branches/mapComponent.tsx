'use client';

import { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issue
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface MapComponentProps {
  position: [number, number];
  isEditing: boolean;
  onPositionChange?: (newPosition: [number, number]) => void;
}

function MapUpdater({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, 13);
  }, [position, map]);
  return null;
}

function LocationMarker({
  isEditing,
  onPositionChange,
}: {
  isEditing: boolean;
  onPositionChange?: (newPosition: [number, number]) => void;
}) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const map = useMapEvents({
    click(e) {
      if (isEditing) {
        setPosition([e.latlng.lat, e.latlng.lng]);
        onPositionChange?.([e.latlng.lat, e.latlng.lng]);
      }
    },
  });

  return position === null ? null : <Marker position={position} />;
}

export default function MapComponent({
  position,
  isEditing,
  onPositionChange,
}: MapComponentProps) {
  return (
    <div>
      <div className="mt-1 h-64 rounded-md overflow-hidden w-full">
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: '100%', width: '100%', zIndex: 1 }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <Marker position={position} />
          <LocationMarker
            isEditing={isEditing}
            onPositionChange={onPositionChange}
          />
          <MapUpdater position={position} />
        </MapContainer>
      </div>
      {isEditing && (
        <p className="mt-2 text-sm text-gray-500">
          Click on the map to set the branch location.
        </p>
      )}
    </div>
  );
}
