import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function PropertyMap({ latitude, longitude, title, location }) {
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (!lat || !lng) {
    return (
      <div className="rounded-2xl border bg-slate-50 p-5">
        <h2 className="text-xl font-bold text-slate-900">Property Location</h2>
        <p className="mt-2 text-slate-600">
          Map location is not available for this property yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-slate-50 p-5">
      <h2 className="text-xl font-bold text-slate-900">Property Location</h2>

      <div className="mt-4 overflow-hidden rounded-xl">
        <MapContainer
          center={[lat, lng]}
          zoom={14}
          scrollWheelZoom={false}
          className="h-80 w-full"
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker position={[lat, lng]}>
            <Popup>
              <strong>{title}</strong>
              <br />
              {location || "Property location"}
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}