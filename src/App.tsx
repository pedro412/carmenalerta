import { useState } from 'react';
import { Bell } from 'lucide-react';
import MapView from './components/MapView';
import type { Report } from './components/MapView';

// Mock data generation or hardcoded data
const MOCK_REPORTS: Report[] = [
  { id: '1', lat: 18.6351953, lng: -91.8331322, title: 'Incendio en Iglesia', category: 'fire' },
  { id: '2', lat: 18.6314642, lng: -91.829715, title: 'Robo cerca del Guanal', category: 'police' },
  { id: '3', lat: 18.6479308, lng: -91.8148958, title: 'Accidente de tráfico', category: 'traffic' },
  { id: '4', lat: 18.6400702, lng: -91.8385731, title: 'Emergencia médica Mercado', category: 'medical' },
  { id: '5', lat: 18.6405785, lng: -91.8389165, title: 'Disturbio en La Campesina', category: 'police' },
  { id: '6', lat: 18.6384447, lng: -91.8345226, title: 'Vehículo averiado', category: 'traffic' },
  { id: '7', lat: 18.6450893, lng: -91.8182704, title: 'Incendio en Glorieta', category: 'fire' },
];

function App() {
  const [reports] = useState<Report[]>(MOCK_REPORTS);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // You can also add filtering state if requested (visible reports), but for now we just pass reports
  const visibleReports = reports;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white text-slate-900 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white relative z-10">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-slate-600" />
          <h1 className="text-xl font-bold">Alertas Carmen</h1>
          <span className="text-slate-500 text-lg">en vivo</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        
        {/* Sidebar Panel */}
        <aside className="w-80 bg-slate-50 border-r border-slate-200 overflow-y-auto flex flex-col z-10">
          <div className="p-4 border-b border-slate-200">
            <h2 className="font-semibold">Incidentes Recientes</h2>
            <p className="text-sm text-slate-500">Selecciona un incidente para verlo en el mapa</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {visibleReports.map((report) => (
              <div 
                key={report.id}
                onClick={() => setSelectedId(report.id)}
                className={`p-3 mb-2 rounded cursor-pointer border ${
                  selectedId === report.id 
                    ? 'bg-blue-50 border-blue-200 shadow-sm' 
                    : 'bg-white border-slate-100 hover:bg-slate-50'
                }`}
              >
                <div className="font-medium">{report.title}</div>
                <div className="text-xs text-slate-500 uppercase mt-1">{report.category}</div>
              </div>
            ))}
          </div>
        </aside>

        {/* Map Area */}
        <div className="flex-1 relative">
          <MapView 
            reports={visibleReports}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          
          {/* Map Overlay Controls */}
          <div className="absolute bottom-4 left-4 z-[400] bg-white px-3 py-2 rounded-lg shadow-sm border border-slate-200 flex items-center gap-2 text-sm text-slate-600">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 9l-3 3 3 3M9 5l3-3 3 3M19 9l3 3-3 3M9 19l3 3-3 3M2 12h20M12 2v20"/></svg>
            WASD para mover · rueda para zoom
          </div>
        </div>

      </main>
    </div>
  );
}

export default App;
