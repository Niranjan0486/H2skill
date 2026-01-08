import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, CircleMarker, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const CENTER: [number, number] = [11.1, 77.34];

// Earth Engine NDVI change tiles (Jan → May 2024)
// Red = loss, White = no change, Green = gain
const EE_TILE_URL =
  'https://earthengine.googleapis.com/v1/projects/h2skill-483707/maps/75ca6ba7dbefbea865e15c2ef2fac98e-bc69a6d2511f357e23a80d3e60f5928d/tiles/{z}/{x}/{y}';

export function NdviMap() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Only render map on client side to avoid SSR issues
    setIsClient(true);
  }, []);

  return (
    <div style={{ position: 'relative', height: '80vh', width: '100%' }}>
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.75)',
          color: '#fff',
          padding: '10px 14px',
          borderRadius: 8,
          zIndex: 1000,
          fontWeight: 700,
          boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
        }}
      >
        NDVI Change (Jan → May 2024)
      </div>

      <div id="ndvi-map-wrapper" style={{ height: '100%', width: '100%' }}>
        <MapContainer
          center={CENTER}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
        <ZoomControl position="topleft" />

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
          maxZoom={19}
        />

        <TileLayer
          url={EE_TILE_URL}
          opacity={0.85}
          attribution="Sentinel-2 NDVI Change | Google Earth Engine"
        />

        <Circle
          center={CENTER}
          radius={3000}
          pathOptions={{ color: '#ff7800', weight: 3, fillColor: '#ff7800', fillOpacity: 0.1 }}
        />

        {/* Simple marker without external icon assets */}
        <CircleMarker center={CENTER} radius={8} pathOptions={{ color: '#1d4ed8', fillColor: '#1d4ed8', fillOpacity: 0.9 }} />
      </MapContainer>
      </div>
    </div>
  );
}

