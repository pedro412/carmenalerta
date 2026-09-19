import { IncidentPanel } from './components/IncidentPanel'
import { MapPlaceholder } from './components/MapPlaceholder'
import { TopBar } from './components/TopBar'

function App() {
  return (
    <main className="app-frame">
      <TopBar />
      <div className="dashboard">
        <MapPlaceholder />
        <IncidentPanel />
      </div>
    </main>
  )
}

export default App
