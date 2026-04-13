import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomeScreen from './components/HomeScreen'
import FraccionesChapter from './chapters/fracciones'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/fracciones" element={<FraccionesChapter />} />
      </Routes>
    </BrowserRouter>
  )
}
