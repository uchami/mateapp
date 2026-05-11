import { useEffect, useRef, useState } from 'react'
import { setMonedasNivel } from './monedasStorage'

// Hook para manejar monedas y combos dentro de un nivel.
// nivelId: string identificador del nivel (para persistir al final).
// baseReward: monedas por acierto antes del multiplicador.
export default function useMonedas(nivelId, baseReward = 10) {
  const [monedas, setMonedas] = useState(0)
  const [combo, setCombo] = useState(1)
  const [justEarned, setJustEarned] = useState(false)
  const earnedTimer = useRef(null)

  useEffect(() => () => {
    if (earnedTimer.current) clearTimeout(earnedTimer.current)
  }, [])

  function acertar() {
    const ganado = baseReward * combo
    setMonedas((m) => m + ganado)
    setCombo((c) => Math.min(c + 1, 3))
    setJustEarned(true)
    if (earnedTimer.current) clearTimeout(earnedTimer.current)
    earnedTimer.current = setTimeout(() => setJustEarned(false), 600)
    return ganado
  }

  function fallar() {
    setCombo(1)
  }

  function cobrar(precio) {
    setMonedas((m) => Math.max(0, m - precio))
  }

  function guardarProgreso() {
    if (nivelId) setMonedasNivel(nivelId, monedas)
  }

  return { monedas, combo, justEarned, acertar, fallar, cobrar, guardarProgreso, setCombo }
}
