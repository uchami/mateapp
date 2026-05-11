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
import Nivel4 from './chapters/ecuaciones/Nivel4'
import Nivel5 from './chapters/ecuaciones/Nivel5'
import SistemasMenu from './chapters/sistemas/SistemasMenu'
import Sustitucion from './chapters/sistemas/Sustitucion'
import Eliminacion from './chapters/sistemas/Eliminacion'
import Grafico from './chapters/sistemas/Grafico'
import ElegirMetodo from './chapters/sistemas/ElegirMetodo'
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
          <Route path="/ecuaciones/nivel-4" element={<Nivel4 />} />
          <Route path="/ecuaciones/nivel-5" element={<Nivel5 />} />
          <Route path="/sistemas" element={<SistemasMenu />} />
          <Route path="/sistemas/sustitucion/nivel-1" element={<Sustitucion key="sus-1" nivel="nivel-1" />} />
          <Route path="/sistemas/sustitucion/nivel-2" element={<Sustitucion key="sus-2" nivel="nivel-2" />} />
          <Route path="/sistemas/sustitucion/nivel-3" element={<Sustitucion key="sus-3" nivel="nivel-3" />} />
          <Route path="/sistemas/eliminacion/nivel-1" element={<Eliminacion key="eli-1" nivel="nivel-1" />} />
          <Route path="/sistemas/eliminacion/nivel-2" element={<Eliminacion key="eli-2" nivel="nivel-2" />} />
          <Route path="/sistemas/eliminacion/nivel-3" element={<Eliminacion key="eli-3" nivel="nivel-3" />} />
          <Route path="/sistemas/grafico" element={<Grafico />} />
          <Route path="/sistemas/elegir" element={<ElegirMetodo />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  )
}
