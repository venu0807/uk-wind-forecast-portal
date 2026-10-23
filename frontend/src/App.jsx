import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import ForecastView from './pages/ForecastView'
import AccuracyView from './pages/AccuracyView'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <main>
          <Routes>
            <Route path="/" element={<ForecastView />} />
            <Route path="/accuracy" element={<AccuracyView />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
