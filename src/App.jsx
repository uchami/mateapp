import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomeScreen from './components/HomeScreen'
import FraccionesMenu from './chapters/fracciones/FraccionesMenu'
import FraccionesChapter from './chapters/fracciones'
import IdentificarFraccion from './chapters/fracciones/IdentificarFraccion'
import Explicacion from './chapters/fracciones/Explicacion'
import EcuacionesMenu from './chapters/ecuaciones/EcuacionesMenu'
import Nivel1 from './chapters/ecuaciones/Nivel1'
import Nivel2 from './chapters/ecuaciones/Nivel2'
import Nivel3 from './chapters/ecuaciones/Nivel3'
import LanguageSwitcher from './components/LanguageSwitcher'
import { LanguageProvider } from './i18n/LanguageContext'

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <LanguageSwitcher />
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/fracciones" element={<FraccionesMenu />} />
          <Route path="/fracciones/sumas" element={<FraccionesChapter mode="sumas" />} />
          <Route path="/fracciones/restas" element={<FraccionesChapter mode="restas" />} />
          <Route path="/fracciones/identificar" element={<IdentificarFraccion />} />
          <Route path="/fracciones/explicacion" element={<Explicacion />} />
          <Route path="/ecuaciones" element={<EcuacionesMenu />} />
          <Route path="/ecuaciones/nivel-1" element={<Nivel1 />} />
          <Route path="/ecuaciones/nivel-2" element={<Nivel2 />} />
          <Route path="/ecuaciones/nivel-3" element={<Nivel3 />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  )
}
