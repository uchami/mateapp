// Persistencia simple del progreso de monedas por nivel.
// Cada nivel guarda su mejor cosecha. El total del cofre es la suma.

const KEY = 'sistemas.monedas'

function readAll() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return typeof parsed === 'object' && parsed ? parsed : {}
  } catch {
    return {}
  }
}

function writeAll(obj) {
  try {
    localStorage.setItem(KEY, JSON.stringify(obj))
  } catch {
    // ignorado
  }
}

export function getMonedasNivel(nivelId) {
  return readAll()[nivelId] ?? 0
}

export function setMonedasNivel(nivelId, monedas) {
  const all = readAll()
  // sólo guardamos si es mejor que el anterior
  if (monedas > (all[nivelId] ?? 0)) {
    all[nivelId] = monedas
    writeAll(all)
  }
}

export function getMonedasTotales() {
  const all = readAll()
  return Object.values(all).reduce((a, b) => a + b, 0)
}

export function nivelCompletado(nivelId) {
  return getMonedasNivel(nivelId) > 0
}

// Devuelve el orden de islas y cuáles están desbloqueadas.
export const ORDEN_ISLAS = [
  'isla-despeje',
  'isla-vigia',
  'isla-canon',
  'isla-tesoro',
]

// Estado por isla: cuántos niveles tiene y cuántos están completados.
export function progresoIsla(islaId) {
  const niveles = NIVELES_POR_ISLA[islaId] ?? []
  const completados = niveles.filter(nivelCompletado).length
  return { total: niveles.length, completados }
}

export const NIVELES_POR_ISLA = {
  'isla-despeje': ['sus-1', 'sus-2', 'sus-3'],
  'isla-vigia': ['graf-1'],
  'isla-canon': ['eli-1', 'eli-2', 'eli-3'],
  'isla-tesoro': ['elegir'],
}
