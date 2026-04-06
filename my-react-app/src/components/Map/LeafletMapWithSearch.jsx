import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import { useEffect, useState } from "react";
  
function MapWithInvalidate({ marker, onClick }) {
  const map = useMap();

  // fix map size when container becomes visible
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 200);
  }, [map]);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onClick({ lat, lng });
    },
  });

  return <Marker position={marker} />;
}

export default function LeafletMapWithSearch({ initialLocation, onLocationSelect }) {
  // initialLocation may contain { address } or { lat, lng, address }
  const defaultPos = { lat: 21.1702, lng: 72.8311 };
  const [marker, setMarker] = useState(defaultPos);

  // if initialLocation contains coords, use them; if only address, geocode it
  useEffect(() => {
    const setup = async () => {
      if (initialLocation) {
        if (initialLocation.lat && initialLocation.lng) {
          setMarker({ lat: initialLocation.lat, lng: initialLocation.lng });
        } else if (initialLocation.address) {
          // forward geocode
          try {
            const query = encodeURIComponent(initialLocation.address);
            const res = await fetch(
              `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${query}`
            );
            if (res.ok) {
              const data = await res.json();
              if (data && data.length > 0) {
                const { lat, lon } = data[0];
                setMarker({ lat: parseFloat(lat), lng: parseFloat(lon) });
              }
            }
          } catch (err) {
            console.error("Forward geocode error", err);
          }
        }
      }
    };
    setup();
  }, [initialLocation]);

  // perform reverse geocode using Nominatim (OpenStreetMap)
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      );
      if (!res.ok) throw new Error("Geocoding failed");
      const data = await res.json();
      return data.display_name;
    } catch (err) {
      console.error("Reverse geocode error", err);
      return "";
    }
  };

  const handleMapClick = async (pos) => {
    setMarker(pos);
    const address = await reverseGeocode(pos.lat, pos.lng);
    onLocationSelect({ ...pos, address });
  };

  return (
    <MapContainer
      center={[marker.lat, marker.lng]}
      zoom={13}
      style={{ height: "350px", width: "100%" }} // important!
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <MapWithInvalidate marker={marker} onClick={handleMapClick} />
    </MapContainer>
  );
}
