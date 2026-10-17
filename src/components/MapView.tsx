import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import type { Category, Report, ReportLocation } from '../types'

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
  onSelectLocation?: (location: ReportLocation) => void
  selectedLocation?: ReportLocation | null
}

export function MapView({ reports, categories, selectedId, onSelectReport, onSelectLocation, selectedLocation }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null)
  const selectedReport = reports.find((report) => report.id === selectedId)

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
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !onSelectLocation) return
    const selectPoint = (event: L.LeafletMouseEvent) => {
      const point = event.latlng.wrap()
      onSelectLocation({ latitude: point.lat, longitude: point.lng })
    }
    map.on('click', selectPoint)
    return () => { map.off('click', selectPoint) }
  }, [onSelectLocation])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !selectedLocation) return
    const point: L.LatLngTuple = [selectedLocation.latitude, selectedLocation.longitude]
    const marker = L.marker(point, {
      icon: L.divIcon({
        className: 'location-pin',
        html: '<span aria-hidden="true"></span>',
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      }),
      keyboard: false,
    }).addTo(map)
    if (!map.getBounds().contains(point)) map.setView(point, 16)
    return () => { marker.remove() }
  }, [selectedLocation])

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
    <section className={onSelectLocation ? 'map-view map-view--picker' : 'map-view'} aria-label={onSelectLocation ? 'Seleccionar ubicación del reporte' : `Mapa de incidentes: ${reports.length} visibles`}>
      <div className="map-canvas" ref={containerRef} />
      {onSelectLocation && <>
        <span className="map-center-crosshair" aria-hidden="true">＋</span>
        <button className="map-center-button" type="button" onClick={() => {
          const center = mapRef.current?.getCenter().wrap()
          if (center) onSelectLocation({ latitude: center.lat, longitude: center.lng })
        }}>Usar el centro del mapa</button>
      </>}
      {!onSelectLocation && <p className="map-hint">
        <MoveIcon />
        WASD para mover · rueda para zoom
      </p>}
    </section>
  )
}
