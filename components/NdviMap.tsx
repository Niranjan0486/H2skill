import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Circle, CircleMarker, ZoomControl, useMap, LayerGroup } from 'react-leaflet';
import type { LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER: [number, number] = [11.1, 77.34];
const DEFAULT_RADIUS_KM = 5;

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

const getCurrentDate = () => {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
};

interface DateSelection { year: number; month: number; }

interface NdviMapProps {
  center?: LatLngTuple;
  radiusKm?: number;
  locationName?: string;
  locationCity?: string;
  locationState?: string;
  locationCountry?: string;
}

function MapUpdater({ center }: { center: LatLngTuple }) {
  const map = useMap();
  useEffect(() => { map.setView(center, map.getZoom()); }, [center, map]);
  return null;
}

// Location Header
function LocationHeader({ name, city, state, country, center }: {
  name?: string; city?: string; state?: string; country?: string; center: LatLngTuple
}) {
  const locationParts = [city, state, country].filter(Boolean);
  const locationStr = locationParts.length > 0 ? locationParts.join(', ') : 'Location';

  return (
    <div style={{
      position: 'absolute', top: 8, left: 10, zIndex: 1000,
      background: 'rgba(255,255,255,0.95)', padding: '8px 12px', borderRadius: 6,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)', maxWidth: '280px'
    }}>
      <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a1a', marginBottom: 2 }}>
        📍 {locationStr}
      </div>
      <div style={{ fontSize: '10px', color: '#666' }}>
        Coordinates: {center[0].toFixed(4)}, {center[1].toFixed(4)}
      </div>
      {name && (
        <div style={{ fontSize: '9px', color: '#888', marginTop: 2 }}>
          (Resolved from uploaded report)
        </div>
      )}
    </div>
  );
}

// Time Range Selector
function TimeRangeSelector({ startDate, endDate, onStartChange, onEndChange }: {
  startDate: DateSelection; endDate: DateSelection | 'present';
  onStartChange: (d: DateSelection) => void; onEndChange: (d: DateSelection | 'present') => void;
}) {
  const current = getCurrentDate();
  const years = [2023, 2024, 2025, 2026];
  const formatEnd = () => endDate === 'present' ? 'present' : `${endDate.year}-${endDate.month}`;
  const endOpts = [{ value: 'present', label: 'Present' }];
  for (let y = current.year; y >= 2023; y--) {
    const maxM = y === current.year ? current.month : 12;
    for (let m = maxM; m >= 1; m--) {
      if (y < startDate.year || (y === startDate.year && m < startDate.month)) continue;
      endOpts.push({ value: `${y}-${m}`, label: `${MONTHS[m - 1]} ${y}` });
    }
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '10px', color: '#333' }}>
      <span style={{ fontWeight: 500 }}>Period:</span>
      <select value={startDate.month} onChange={(e) => onStartChange({ ...startDate, month: +e.target.value })} style={{ background: '#fff', border: '1px solid #ccc', borderRadius: 3, padding: '2px 4px', fontSize: '9px' }}>
        {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m.slice(0, 3)}</option>)}
      </select>
      <select value={startDate.year} onChange={(e) => onStartChange({ ...startDate, year: +e.target.value })} style={{ background: '#fff', border: '1px solid #ccc', borderRadius: 3, padding: '2px 4px', fontSize: '9px' }}>
        {years.map(y => <option key={y} value={y}>{y}</option>)}
      </select>
      <span>→</span>
      <select value={formatEnd()} onChange={(e) => { if (e.target.value === 'present') onEndChange('present'); else { const [y, m] = e.target.value.split('-').map(Number); onEndChange({ year: y, month: m }); } }} style={{ background: '#fff', border: '1px solid #ccc', borderRadius: 3, padding: '2px 4px', fontSize: '9px' }}>
        {endOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// NDVI Toggle & Controls
function NdviControls({ showNdvi, onToggle, startDate, endDate, onStartChange, onEndChange }: {
  showNdvi: boolean; onToggle: () => void;
  startDate: DateSelection; endDate: DateSelection | 'present';
  onStartChange: (d: DateSelection) => void; onEndChange: (d: DateSelection | 'present') => void;
}) {
  return (
    <div style={{
      position: 'absolute', top: 8, right: 10, zIndex: 1000,
      background: 'rgba(255,255,255,0.95)', padding: '8px 12px', borderRadius: 6,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: '#1a1a1a' }}>
        <input type="checkbox" checked={showNdvi} onChange={onToggle} style={{ accentColor: '#22c55e' }} />
        Show NDVI Change
      </label>
      {showNdvi && (
        <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid #eee' }}>
          <TimeRangeSelector startDate={startDate} endDate={endDate} onStartChange={onStartChange} onEndChange={onEndChange} />
        </div>
      )}
    </div>
  );
}

// Minimal Legend (Google Maps style)
function NdviLegend() {
  return (
    <div style={{
      position: 'absolute', bottom: 10, right: 10, zIndex: 1000,
      background: 'rgba(255,255,255,0.9)', padding: '6px 10px', borderRadius: 4,
      boxShadow: '0 1px 4px rgba(0,0,0,0.1)', fontSize: '9px'
    }}>
      <div style={{ fontWeight: 600, marginBottom: 3, color: '#333' }}>NDVI Change</div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}><div style={{ width: 10, height: 10, backgroundColor: '#ff0000', marginRight: 5 }} /><span>Loss</span></div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}><div style={{ width: 10, height: 10, backgroundColor: '#00ff00', marginRight: 5 }} /><span>Gain</span></div>
      <div style={{ display: 'flex', alignItems: 'center', color: '#888' }}><div style={{ width: 10, height: 10, background: 'transparent', border: '1px dashed #aaa', marginRight: 5 }} /><span>No change</span></div>
    </div>
  );
}

// Perlin-like noise
function perlinNoise(x: number, y: number, seed: number): number {
  const n = Math.sin(x * 0.1 + seed) * Math.cos(y * 0.1 + seed) +
    Math.sin(x * 0.05 + y * 0.05 + seed * 2) * 0.5 +
    Math.sin(x * 0.02 - y * 0.02 + seed * 3) * 0.25;
  return (n + 1.75) / 3.5;
}

function bilinearSample(data: Float32Array, width: number, x: number, y: number): number {
  const x0 = Math.floor(x), y0 = Math.floor(y);
  const x1 = Math.min(x0 + 1, width - 1), y1 = Math.min(y0 + 1, width - 1);
  const fx = x - x0, fy = y - y0;
  const v00 = data[y0 * width + x0] || 0, v10 = data[y0 * width + x1] || 0;
  const v01 = data[y1 * width + x0] || 0, v11 = data[y1 * width + x1] || 0;
  return v00 * (1 - fx) * (1 - fy) + v10 * fx * (1 - fy) + v01 * (1 - fx) * fy + v11 * fx * fy;
}

function generateNdviRaster(size: number, startDate: DateSelection, endDate: DateSelection): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  canvas.width = size; canvas.height = size;

  const centerX = size / 2, centerY = size / 2, radius = size / 2, threshold = 0.05;
  const seed = startDate.year * 100 + startDate.month + endDate.year * 10 + endDate.month;

  const coarseSize = Math.ceil(size / 4);
  const coarseData = new Float32Array(coarseSize * coarseSize);
  for (let cy = 0; cy < coarseSize; cy++) {
    for (let cx = 0; cx < coarseSize; cx++) {
      coarseData[cy * coarseSize + cx] = (perlinNoise(cx, cy, seed) - 0.5) * 0.6;
    }
  }

  const imageData = ctx.createImageData(size, size);
  const pixels = imageData.data;

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const dx = px - centerX, dy = py - centerY, dist = Math.sqrt(dx * dx + dy * dy);
      const idx = (py * size + px) * 4;
      if (dist > radius) { pixels[idx + 3] = 0; continue; }

      const change = bilinearSample(coarseData, coarseSize, (px / size) * (coarseSize - 1), (py / size) * (coarseSize - 1));
      if (Math.abs(change) < threshold) { pixels[idx + 3] = 0; continue; }

      if (change < -threshold) {
        const i = Math.min(1, Math.abs(change) / 0.25);
        pixels[idx] = 255; pixels[idx + 1] = Math.floor(80 * (1 - i)); pixels[idx + 2] = Math.floor(80 * (1 - i)); pixels[idx + 3] = Math.floor(150 + i * 80);
      } else {
        const i = Math.min(1, change / 0.25);
        pixels[idx] = Math.floor(80 * (1 - i)); pixels[idx + 1] = 255; pixels[idx + 2] = Math.floor(80 * (1 - i)); pixels[idx + 3] = Math.floor(150 + i * 80);
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}

function NdviRasterOverlay({ center, radiusKm, startDate, endDate }: {
  center: LatLngTuple; radiusKm: number; startDate: DateSelection; endDate: DateSelection;
}) {
  const map = useMap();
  useEffect(() => {
    const L = (window as any).L;
    if (!L) return;
    const rasterUrl = generateNdviRaster(800, startDate, endDate);
    if (!rasterUrl) return;

    const radiusMeters = radiusKm * 1000;
    const latOffset = radiusMeters / 111320;
    const lngOffset = radiusMeters / (111320 * Math.cos(center[0] * Math.PI / 180));
    const bounds: [[number, number], [number, number]] = [
      [center[0] - latOffset, center[1] - lngOffset],
      [center[0] + latOffset, center[1] + lngOffset]
    ];

    const overlay = L.imageOverlay(rasterUrl, bounds, { opacity: 0.55, interactive: false });
    overlay.addTo(map);
    return () => { map.removeLayer(overlay); };
  }, [center, radiusKm, startDate, endDate, map]);
  return null;
}

export function NdviMap({ center = DEFAULT_CENTER, radiusKm = DEFAULT_RADIUS_KM, locationName, locationCity, locationState, locationCountry }: NdviMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [showNdvi, setShowNdvi] = useState(true);
  const [startDate, setStartDate] = useState<DateSelection>({ year: 2025, month: 8 });
  const [endDate, setEndDate] = useState<DateSelection | 'present'>('present');

  const getActualEnd = useCallback((): DateSelection => endDate === 'present' ? getCurrentDate() : endDate, [endDate]);

  useEffect(() => { setIsClient(true); }, []);

  if (!isClient) return <div style={{ height: '80vh', width: '100%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>Loading map...</div>;

  return (
    <div style={{ position: 'relative', height: '80vh', width: '100%' }}>
      {/* Location Header (left) */}
      <LocationHeader name={locationName} city={locationCity} state={locationState} country={locationCountry} center={center} />

      {/* NDVI Controls (right) */}
      <NdviControls showNdvi={showNdvi} onToggle={() => setShowNdvi(!showNdvi)} startDate={startDate} endDate={endDate} onStartChange={setStartDate} onEndChange={setEndDate} />

      {/* Legend (bottom right) */}
      {showNdvi && <NdviLegend />}

      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
        <MapUpdater center={center} />
        <ZoomControl position="bottomleft" />

        {/* Satellite + Labels (Google Maps style) */}
        <LayerGroup>
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Esri" maxZoom={19}
          />
          <TileLayer
            url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
            maxZoom={19}
          />
        </LayerGroup>

        {/* NDVI Overlay (toggleable) */}
        {showNdvi && <NdviRasterOverlay center={center} radiusKm={radiusKm} startDate={startDate} endDate={getActualEnd()} />}

        {/* Subtle AOI boundary */}
        <Circle center={center} radius={radiusKm * 1000} pathOptions={{ color: '#ffffff', dashArray: '6,6', weight: 2, opacity: 0.6, fillOpacity: 0 }} />

        {/* Factory marker */}
        <CircleMarker center={center} radius={6} pathOptions={{ color: '#fff', weight: 2, fillColor: '#dc2626', fillOpacity: 1 }} />
      </MapContainer>
    </div>
  );
}
