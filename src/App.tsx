import { useEffect, useState } from 'react'
import { IncidentPanel } from './components/IncidentPanel'
import { MapView } from './components/MapView'
import { TopBar } from './components/TopBar'
import { categories } from './data/categories'
import { initialReports } from './data/reports'
import { isActiveReport, matchesReportFilter } from './data/filters'
import type { ReportFilter } from './data/filters'
import type { Report } from './types'
import L from 'leaflet'
import { AlertCircle, X } from 'lucide-react'

const RADIUS_KM = 1.5;
const RADIUS_METERS = RADIUS_KM * 1000;

function App() {
  const [reports, setReports] = useState<Report[]>(initialReports)
  const [activeFilter, setActiveFilter] = useState<ReportFilter>('Todos')
  const [selectedId, setSelectedId] = useState<string | null>(
    initialReports.find(isActiveReport)?.id ?? null,
  )
  const [now, setNow] = useState(() => Date.now())

  // Geo states
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number, accuracy: number} | null>(null)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [alertsEnabled, setAlertsEnabled] = useState(() => {
    return localStorage.getItem('alertsEnabled') !== 'false'
  })
  const [showRadius, setShowRadius] = useState(false)
  const [newAlert, setNewAlert] = useState<{report: Report, distance: number} | null>(null)

  useEffect(() => {
    localStorage.setItem('alertsEnabled', alertsEnabled.toString())
  }, [alertsEnabled])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000)
    return () => window.clearInterval(timer)
  }, [])

  const activeReports = reports.filter(isActiveReport)
  const visibleReports = activeReports.filter((report) => matchesReportFilter(report, activeFilter))

  const incidentsInside = userLocation ? activeReports.filter(r => {
    const dist = L.latLng(userLocation.lat, userLocation.lng).distanceTo(L.latLng(r.latitude, r.longitude));
    return dist <= RADIUS_METERS;
  }) : [];

  const handleFilterChange = (filter: ReportFilter) => {
    setActiveFilter(filter)
    if (!activeReports.some((report) => report.id === selectedId && matchesReportFilter(report, filter))) {
      setSelectedId(activeReports.find((report) => matchesReportFilter(report, filter))?.id ?? null)
    }
  }

  const handleSimulateNewReport = () => {
    const centerLat = userLocation ? userLocation.lat : 18.648;
    const centerLng = userLocation ? userLocation.lng : -91.790;
    
    const newReport: Report = {
      id: `report-${Date.now()}`,
      categoryId: categories[Math.floor(Math.random() * categories.length)].id,
      description: 'Nuevo Incidente Reportado',
      location: 'Cerca de tu ubicación',
      latitude: centerLat + (Math.random() - 0.5) * 0.015,
      longitude: centerLng + (Math.random() - 0.5) * 0.015,
      createdAt: new Date().toISOString(),
      status: 'unverified',
      severity: 'medium'
    };
    
    setReports(prev => [newReport, ...prev]);

    if (userLocation && alertsEnabled) {
      const dist = L.latLng(userLocation.lat, userLocation.lng).distanceTo(L.latLng(newReport.latitude, newReport.longitude));
      if (dist <= RADIUS_METERS) {
        setNewAlert({ report: newReport, distance: dist });
        setTimeout(() => {
          setNewAlert(prev => prev?.report.id === newReport.id ? null : prev);
        }, 10000);
      }
    }
  };

  return (
    <main className="app-frame" style={{ position: 'relative' }}>
      
      {geoError && (
        <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '10px 16px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <AlertCircle size={20} />
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{geoError}</span>
          <button onClick={() => setGeoError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {newAlert && (
        <div 
          onClick={() => {
            setSelectedId(newAlert.report.id);
            setNewAlert(null);
          }}
          style={{ position: 'absolute', top: 70, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, background: 'white', borderLeft: '4px solid #3b82f6', padding: '16px', borderRadius: '0 8px 8px 0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', cursor: 'pointer', width: 320, display: 'flex', flexDirection: 'column', gap: 4 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{ margin: 0, fontWeight: 'bold', color: '#1e293b' }}>¡Alerta de Proximidad!</h3>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setNewAlert(null);
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={16} />
            </button>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569' }}>
            Nuevo reporte <strong style={{ textTransform: 'uppercase' }}>{categories.find(c => c.id === newAlert.report.categoryId)?.name}</strong> a {(newAlert.distance / 1000).toFixed(2)} km de ti.
          </p>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#2563eb', fontWeight: 500 }}>Toca para ver en el mapa →</p>
        </div>
      )}

      <TopBar reports={reports} />
      <div className="dashboard">
        <MapView
          reports={visibleReports}
          categories={categories}
          selectedId={selectedId}
          onSelectReport={setSelectedId}
          userLocation={userLocation}
          onUserLocationFound={setUserLocation}
          onGeoError={setGeoError}
          showRadius={showRadius}
          radiusMeters={RADIUS_METERS}
        />
        <IncidentPanel
          reports={visibleReports}
          activeFilter={activeFilter}
          selectedId={selectedId}
          now={now}
          onFilterChange={handleFilterChange}
          onSelectReport={setSelectedId}
          alertsEnabled={alertsEnabled}
          setAlertsEnabled={setAlertsEnabled}
          showRadius={showRadius}
          setShowRadius={setShowRadius}
          handleSimulateNewReport={handleSimulateNewReport}
          userLocation={userLocation}
          incidentsInsideCount={incidentsInside.length}
          radiusKm={RADIUS_KM}
        />
      </div>
    </main>
  )
}

export default App
