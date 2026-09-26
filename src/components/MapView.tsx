import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Category, Report } from '../types'

const CIUDAD_DEL_CARMEN: L.LatLngTuple = [18.648, -91.79]
const PAN_OFFSET = 80

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

export type MapViewProps = {
  reports: Report[]
  // Daniel puede usar categorías y callback al implementar los marcadores.
  categories: Category[]
  selectedId: string | null
  onSelectReport: (id: string) => void
}

export function MapView({ reports, selectedId }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const selectedReport = reports.find((report) => report.id === selectedId)

  useEffect(() => {
    if (!containerRef.current) return

    const map = L.map(containerRef.current, {
      zoomControl: false,
      maxZoom: 19,
    }).setView(CIUDAD_DEL_CARMEN, 14)
    mapRef.current = map

    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      {
        attribution:
          'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
        maxZoom: 19,
      },
    ).addTo(map)

    L.control.zoom({ position: 'topright' }).addTo(map)

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
    }
  }, [])

  useEffect(() => {
    if (selectedReport) mapRef.current?.panTo([selectedReport.latitude, selectedReport.longitude])
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
