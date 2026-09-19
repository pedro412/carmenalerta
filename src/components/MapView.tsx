import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

export interface Report {
  id: string;
  lat: number;
  lng: number;
  title: string;
  category: string;
}

interface MapViewProps {
  reports: Report[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  fire: '#ef4444',     // red
  police: '#3b82f6',   // blue
  medical: '#10b981',  // green
  traffic: '#f59e0b',  // amber
  default: '#6b7280',  // gray
};

export default function MapView({ reports, selectedId, onSelect }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerClusterGroup = useRef<L.MarkerClusterGroup | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Create map once
    const map = L.map(mapRef.current, {
      zoomControl: false,
      maxZoom: 19
    }).setView([18.648, -91.790], 14);

    // Using OpenStreetMap instead of Esri per requirement
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    mapInstance.current = map;
    markerClusterGroup.current = L.markerClusterGroup({
      // Configure markercluster to not cluster at high zoom levels if we want
      disableClusteringAtZoom: 18,
    });
    map.addLayer(markerClusterGroup.current);

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Effect to update markers when reports or selectedId change
  useEffect(() => {
    if (!mapInstance.current || !markerClusterGroup.current) return;

    const clusterGroup = markerClusterGroup.current;
    clusterGroup.clearLayers();
    markersRef.current = {};

    reports.forEach((report) => {
      const color = CATEGORY_COLORS[report.category] || CATEGORY_COLORS.default;
      const isSelected = report.id === selectedId;
      
      const html = `
        <div class="incident-marker ${isSelected ? 'selected' : ''}" style="background-color: ${color};">
          ${isSelected ? `<div class="pulse-ring" style="border-color: ${color};"></div>` : ''}
        </div>
      `;

      const icon = L.divIcon({
        html,
        className: 'custom-div-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([report.lat, report.lng], { icon })
        .on('click', () => {
          onSelect(report.id);
        });

      markersRef.current[report.id] = marker;
      clusterGroup.addLayer(marker);
    });
  }, [reports, selectedId, onSelect]);

  // Effect to fly to selected marker
  useEffect(() => {
    if (selectedId && mapInstance.current && markersRef.current[selectedId]) {
      const marker = markersRef.current[selectedId];
      const latLng = marker.getLatLng();
      mapInstance.current.flyTo(latLng, 16, {
        duration: 1.5
      });
    }
  }, [selectedId]);

  return <div ref={mapRef} className="absolute inset-0 z-0" />;
}
