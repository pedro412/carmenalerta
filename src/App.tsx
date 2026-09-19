import { IncidentPanel } from './components/IncidentPanel'
import { MapView } from './components/MapView'
import { TopBar } from './components/TopBar'

function App() {
  return (
    <main className="app-frame">
      <TopBar />
      <div className="dashboard">
        <MapView />
        <IncidentPanel />
      </div>
    </main>
  )
}

export default App
