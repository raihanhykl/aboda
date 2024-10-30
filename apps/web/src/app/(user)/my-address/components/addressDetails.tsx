import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Address } from '@/interfaces/branch';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';

type AddressField = 'name' | 'street' | 'city' | 'province';
const fields: AddressField[] = ['name', 'street', 'city', 'province'];
function AddressDetails({
  address,
  isEditing,
  onChange,
}: {
  address: Address;
  isEditing: boolean;
  onChange: (address: Address) => void;
}) {
  return (
    <>
      <div className="grid gap-4 mb-6">
        {fields.map((field) => (
          <div key={field}>
            <Label htmlFor={field}>
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </Label>
            {isEditing ? (
              <Input
                id={field}
                value={address[field]}
                onChange={(e) =>
                  onChange({ ...address, [field]: e.target.value })
                }
              />
            ) : (
              <p className="font-medium">{address[field]}</p>
            )}
          </div>
        ))}
        <div className="grid grid-cols-2 gap-4">
          {['city', 'province'].map((field) => (
            <div key={field}>
              <Label htmlFor={field}>
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </Label>
              {isEditing ? (
                <Input
                  id={field}
                  value={address[field]}
                  onChange={(e) =>
                    onChange({ ...address, [field]: e.target.value })
                  }
                />
              ) : (
                <p className="font-medium">{address[field]}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="h-[300px] rounded-lg overflow-hidden">
        <MapContainer
          center={address.coordinates}
          zoom={13}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            position={address.coordinates}
            draggable={isEditing}
            eventHandlers={
              isEditing
                ? {
                    dragend: (e) => {
                      const position = e.target.getLatLng();
                      onChange({
                        ...address,
                        coordinates: [position.lat, position.lng],
                      });
                    },
                  }
                : undefined
            }
          />
          {isEditing && (
            <MapEvents
              onMapClick={(e) =>
                onChange({
                  ...address,
                  coordinates: [e.latlng.lat, e.latlng.lng],
                })
              }
            />
          )}
        </MapContainer>
      </div>
    </>
  );
}
