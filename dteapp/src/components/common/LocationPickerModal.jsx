import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Modal from './Modal';
import { Button } from './UIComponents';
import { MapPin } from 'lucide-react';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
};

const LocationPickerModal = ({ isOpen, onClose, onSave, initialLocation }) => {
  const defaultPosition = { lat: 18.5204, lng: 73.8567 }; // Default to Pune
  const [position, setPosition] = useState(initialLocation || defaultPosition);

  const handleSave = () => {
    if (position) {
      onSave(position.lat, position.lng);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pin Location" size="lg">
      <div className="p-2 space-y-4">
        <p className="text-sm text-slate-500">
          Click on the map to pin your exact location. This will be used for attendance verification.
        </p>
        <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-slate-200">
          {isOpen && (
            <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker position={position} setPosition={setPosition} />
            </MapContainer>
          )}
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={!position}>
            <MapPin size={16} className="mr-2" />
            Lock Location
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default LocationPickerModal;
