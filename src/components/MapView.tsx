import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import type { Category, Report } from '../types'
import { LocateFixed } from 'lucide-react'
import { renderToString } from 'react-dom/server'

const CIUDAD_DEL_CARMEN: L.LatLngTuple = [18.648, -91.79]
const PAN_OFFSET = 80
const DEFAULT_MARKER_COLOR = '#6b7280'

// Leaflet solo trae navegación con flechas; el diseño pide WASD.
const wasdPan: Record<string, L.PointTuple> = {
  w: [0, -PAN_OFFSET],
  a: [-PAN_OFFSET, 0],
  s: [0, PAN_OFFSET],
  d: [PAN_OFFSET, 0],
}

function MoveIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M19 9l3 3-3 3M9 19l3 3 3-3M2 12h20M12 2v20" />
    </svg>
  )
}

function markerIcon(color: string, isSelected: boolean) {
  return L.divIcon({
    html: `
      <div class="incident-marker ${isSelected ? 'selected' : ''}" style="background-color: ${color};">
        ${isSelected ? `<div class="marker-pulse-ring" style="border-color: ${color};"></div>` : ''}
      </div>
    `,
    className: 'custom-div-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

export type MapViewProps = {
  reports: Report[]
  categories: Category[]
  selectedId: string | null
  onSelectReport: (id: string) => void
  userLocation?: { lat: number, lng: number, accuracy?: number } | null
  onUserLocationFound?: (loc: { lat: number, lng: number, accuracy: number }) => void
  onGeoError?: (msg: string) => void
  showRadius?: boolean
  radiusMeters?: number
}

export function MapView({ 
  reports, 
  categories, 
  selectedId, 
  onSelectReport,
  userLocation,
  onUserLocationFound,
  onGeoError,
  showRadius,
  radiusMeters = 1500
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null)
  const selectedReport = reports.find((report) => report.id === selectedId)
  
  const userMarkerRef = useRef<L.Marker | null>(null)
  const userCircleRef = useRef<L.Circle | null>(null)
  const radiusCircleRef = useRef<L.Circle | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const map = L.map(containerRef.current, {
      zoomControl: false,
      maxZoom: 19,
    }).setView(CIUDAD_DEL_CARMEN, 14)
    mapRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map)

    L.control.zoom({ position: 'topright' }).addTo(map)

    const LocateControl = L.Control.extend({
      options: { position: 'topright' },
      onAdd: function () {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        const button = L.DomUtil.create('a', '', container);
        button.href = '#';
        button.title = 'Mi ubicación';
        button.setAttribute('role', 'button');
        button.setAttribute('aria-label', 'Mi ubicación');
        button.style.width = '44px';
        button.style.height = '44px';
        button.style.display = 'flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';
        button.style.backgroundColor = 'white';
        button.style.color = '#333';
        button.style.cursor = 'pointer';
        
        button.innerHTML = renderToString(<LocateFixed size={20} />);
        
        L.DomEvent.on(button, 'click', function (e) {
          L.DomEvent.stopPropagation(e);
          L.DomEvent.preventDefault(e);
          map.locate({ setView: true, maxZoom: 16, enableHighAccuracy: true });
        });
        
        return container;
      }
    });
    
    map.addControl(new LocateControl());

    map.on('locationfound', (e) => {
      onUserLocationFound?.({ lat: e.latlng.lat, lng: e.latlng.lng, accuracy: e.accuracy });
    });

    map.on('locationerror', (e) => {
      let msg = "Error al obtener ubicación";
      if (e.code === 1) msg = "Permiso de ubicación denegado.";
      else if (e.code === 2) msg = "Información de ubicación no disponible.";
      else if (e.code === 3) msg = "Tiempo de espera agotado al obtener ubicación.";
      onGeoError?.(msg);
    });

    const cluster = L.markerClusterGroup({ disableClusteringAtZoom: 18 })
    map.addLayer(cluster)
    clusterRef.current = cluster

    const container = map.getContainer()
    const onKeyDown = (event: KeyboardEvent) => {
      const offset = wasdPan[event.key.toLowerCase()]
      if (!offset || event.altKey || event.ctrlKey || event.metaKey) return
      event.preventDefault()
      map.panBy(offset)
    }
    container.addEventListener('keydown', onKeyDown)

    return () => {
      container.removeEventListener('keydown', onKeyDown)
      map.remove()
      mapRef.current = null
      clusterRef.current = null
    }
  }, [onGeoError, onUserLocationFound])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (userLocation) {
      const latlng = [userLocation.lat, userLocation.lng] as L.LatLngExpression;
      const accuracy = userLocation.accuracy || 50;
      
      if (!userMarkerRef.current) {
        const icon = L.divIcon({
          html: '<div style="width: 16px; height: 16px; background-color: #2563eb; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4);"></div>',
          className: 'user-location-icon',
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });
        userMarkerRef.current = L.marker(latlng, { icon }).addTo(map);
        userCircleRef.current = L.circle(latlng, { radius: accuracy, color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.2, weight: 1 }).addTo(map);
      } else {
        userMarkerRef.current.setLatLng(latlng);
        userCircleRef.current?.setLatLng(latlng);
        userCircleRef.current?.setRadius(accuracy);
      }
    }
  }, [userLocation])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (showRadius && userLocation) {
      const latlng = [userLocation.lat, userLocation.lng] as L.LatLngExpression;
      if (!radiusCircleRef.current) {
        radiusCircleRef.current = L.circle(latlng, {
          radius: radiusMeters,
          color: '#8b5cf6',
          fillColor: '#8b5cf6',
          fillOpacity: 0.1,
          weight: 2,
          dashArray: '5, 5'
        }).addTo(map);
      } else {
        radiusCircleRef.current.setLatLng(latlng);
        radiusCircleRef.current.setRadius(radiusMeters);
      }
    } else {
      if (radiusCircleRef.current) {
        map.removeLayer(radiusCircleRef.current);
        radiusCircleRef.current = null;
      }
    }
  }, [showRadius, userLocation, radiusMeters])

  useEffect(() => {
    const cluster = clusterRef.current
    if (!cluster) return

    const colorById = new Map(categories.map((category) => [category.id, category.color]))
    cluster.clearLayers()
    reports.forEach((report) => {
      const color = colorById.get(report.categoryId) ?? DEFAULT_MARKER_COLOR
      L.marker([report.latitude, report.longitude], { icon: markerIcon(color, report.id === selectedId) })
        .on('click', () => onSelectReport(report.id))
        .addTo(cluster)
    })
  }, [reports, categories, selectedId, onSelectReport])

  useEffect(() => {
    if (selectedReport) {
      mapRef.current?.flyTo([selectedReport.latitude, selectedReport.longitude], 16, { duration: 1.5 })
    }
  }, [selectedReport?.latitude, selectedReport?.longitude])

  return (
    <section className="map-view" aria-label={`Mapa de incidentes: ${reports.length} visibles`}>
      <div className="map-canvas" ref={containerRef} />
      <p className="map-hint">
        <MoveIcon />
        WASD para mover · rueda para zoom
      </p>
    </section>
  )
}
