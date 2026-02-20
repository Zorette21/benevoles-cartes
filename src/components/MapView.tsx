"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

type Mission = {
  id: string;
  title: string | null;
  city: string | null;
  lat: number | null;
  lng: number | null;
  starts_at: string | null;
};

const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function MapView({ missions }: { missions: Mission[] }) {
  const center: [number, number] = [42.6887, 2.8948];

  const withCoords = missions.filter(
    (m) => typeof m.lat === "number" && typeof m.lng === "number"
  );

  return (
    <div style={{ height: 520, width: "100%", borderRadius: 16, overflow: "hidden" }}>
      <MapContainer center={center} zoom={11} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {withCoords.map((m) => (
          <Marker key={m.id} position={[m.lat as number, m.lng as number]} icon={icon}>
            <Popup>
              <div style={{ minWidth: 220 }}>
                <div style={{ fontWeight: 700 }}>{m.title ?? "Mission"}</div>
                <div style={{ fontSize: 13, opacity: 0.8 }}>{m.city ?? ""}</div>
                {m.starts_at && (
                  <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>
                    📅 {new Date(m.starts_at).toLocaleString()}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

// Force TS to treat this file as a module even if VS Code/Windows does something weird
export {};