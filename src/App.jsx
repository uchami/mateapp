import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomeScreen from './components/HomeScreen'
import FraccionesMenu from './chapters/fracciones/FraccionesMenu'
import FraccionesChapter from './chapters/fracciones'
import IdentificarFraccion from './chapters/fracciones/IdentificarFraccion'
import Explicacion from './chapters/fracciones/Explicacion'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/fracciones" element={<FraccionesMenu />} />
        <Route path="/fracciones/sumas" element={<FraccionesChapter mode="sumas" />} />
        <Route path="/fracciones/restas" element={<FraccionesChapter mode="restas" />} />
        <Route path="/fracciones/identificar" element={<IdentificarFraccion />} />
        <Route path="/fracciones/explicacion" element={<Explicacion />} />
      </Routes>
    </BrowserRouter>
  )
}
