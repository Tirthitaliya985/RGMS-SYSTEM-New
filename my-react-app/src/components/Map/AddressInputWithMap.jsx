import { useState, useEffect } from "react";
import LeafletMapWithSearch from "./LeafletMapWithSearch";
import { Input, Button, Space } from "antd";
import "./LeafletMap.css";
import "leaflet/dist/leaflet.css";

export default function AddressInputWithMap({ value, onChange, onMapLocationChange }) {
  const [showMap, setShowMap] = useState(false);
  const [mapLocation, setMapLocation] = useState(null);

  // Sync Form value to map location when modal opens or form value changes
  useEffect(() => {
    if (value) {
      setMapLocation({ address: value });
    }
  }, [value]);

  // When user picks location on map
  const handleLocationSelect = (locationData) => {
    setMapLocation(locationData);
    // update input value with address
    onChange?.(locationData.address || "");
    // also notify parent about raw lat/lng if needed
    onMapLocationChange?.({ lat: locationData.lat, lng: locationData.lng });
    setShowMap(false);
  };

  return (
    <div>
      {!showMap && (
        <Space style={{ width: "100%", marginBottom: 10 }}>
          {/* Input is fully controlled by Form */}
          <Input
            value={value || ""}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder="Enter address or pick on map"
            style={{ flex: 1 }}
          />
          <Button onClick={() => setShowMap(true)}>Pick on Map</Button>
        </Space>
      )}

      {showMap && (
        <LeafletMapWithSearch
          initialLocation={mapLocation}  // Map uses its own state
          onLocationSelect={handleLocationSelect}
        />
      )}
    </div>
  );
}