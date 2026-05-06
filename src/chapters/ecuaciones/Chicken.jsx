import { useEffect, useMemo, useState } from 'react'
import gallochad from '../../assets/ecuaciones/gallochad.png'
import gallocompleto from '../../assets/ecuaciones/gallocompleto.png'
import gallinaPocasPlumas from '../../assets/ecuaciones/gallinadesplumada.png'
import gallocorriendo from '../../assets/ecuaciones/gallocorriendo.png'
import plumaSvg from '../../assets/ecuaciones/pluma.svg'

const FEATHERS_PER_HIT = 18 // plumas que vuelan en cada acierto

function pickImage(stepsLeft, victory) {
  if (victory) return gallocorriendo
  if (stepsLeft >= 3) return gallochad
  if (stepsLeft === 2) return gallocompleto
  return gallinaPocasPlumas
}

function makeFeather() {
  return {
    id: `${Date.now()}-${Math.random()}`,
    offsetX: (Math.random() - 0.5) * 180,
    drift: (Math.random() - 0.5) * 160,
    rotateDir: Math.random() > 0.5 ? 1 : -1,
    size: 36 + Math.random() * 28, // 36-64 px
    delay: Math.random() * 0.25,
    duration: 1.6 + Math.random() * 1.0,
    topPct: 30 + Math.random() * 25,
  }
}

// Props:
//   feathersLost: contador que crece con cada acierto. En cada incremento spawneamos FEATHERS_PER_HIT plumas.
//   victory:      bool — al ganar, se llena la pantalla de plumas.
//   stepsLeft:    cuantos pasos faltan para resolver (define que imagen mostrar).
export default function Chicken({ feathersLost = 0, victory = false, stepsLeft = 1 }) {
  const [falling, setFalling] = useState([])

  useEffect(() => {
    if (feathersLost <= 0) return
    const burst = Array.from({ length: FEATHERS_PER_HIT }, makeFeather)
    setFalling((prev) => [...prev, ...burst])
    const timeout = setTimeout(() => {
      const ids = new Set(burst.map((f) => f.id))
      setFalling((prev) => prev.filter((x) => !ids.has(x.id)))
    }, 3000)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feathersLost])

  if (victory) {
    return (
      <>
        <div className="relative w-48 h-48 flex items-center justify-center">
          <img
            src={gallocorriendo}
            alt="gallina corriendo"
            className="w-full h-full object-contain animate-victory-bounce"
          />
        </div>
        <VictoryFeathers />
      </>
    )
  }

  const src = pickImage(stepsLeft, false)

  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      <img src={src} alt="gallina" className="w-full h-full object-contain" />
      {falling.map((f) => (
        <img
          key={f.id}
          src={plumaSvg}
          alt=""
          className="absolute pointer-events-none animate-feather-fall"
          style={{
            left: `calc(50% + ${f.offsetX}px)`,
            top: `${f.topPct}%`,
            width: `${f.size}px`,
            height: `${f.size}px`,
            animationDelay: `${f.delay}s`,
            animationDuration: `${f.duration}s`,
            '--drift': `${f.drift}px`,
            '--rotate-dir': f.rotateDir,
          }}
        />
      ))}
    </div>
  )
}

function VictoryFeathers() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 80 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 1.4,
        duration: 2.5 + Math.random() * 2.5,
        drift: (Math.random() - 0.5) * 320,
        size: 36 + Math.random() * 44, // 36-80 px
        rotateDir: i % 2 === 0 ? 1 : -1,
      })),
    [],
  )
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-40">
      {pieces.map((p, i) => (
        <img
          key={i}
          src={plumaSvg}
          alt=""
          className="absolute animate-feather-fall-screen"
          style={{
            left: `${p.left}%`,
            top: `-10%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            '--drift': `${p.drift}px`,
            '--rotate-dir': p.rotateDir,
          }}
        />
      ))}
    </div>
  )
}
