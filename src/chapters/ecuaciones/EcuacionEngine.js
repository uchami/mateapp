// Modelo:
//   side = { a, b }  representa  aX + b
//   state = { left: side, right: side | null }
//
// Operaciones:
//   { type: 'add'|'sub'|'mul'|'div', value: number }     -> sobre constantes
//   { type: 'addX'|'subX', value: number }               -> sobre el coeficiente de X

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickRandom(arr, n) {
  return shuffle(arr).slice(0, n)
}

// ---------- Generadores ----------

export function generateLevel1() {
  const a = randInt(2, 9)
  const b = randInt(1, 9)
  return { left: { a, b }, right: null }
}

export function generateLevel2() {
  // garantiza b multiplo de a -> X = -b/a entero limpio
  const a = randInt(2, 9)
  const xAbs = randInt(1, 6)
  const b = xAbs * a
  return { left: { a, b }, right: { a: 0, b: 0 } }
}

export function generateLevel3() {
  // garantiza a > c, solucion entera positiva, sin negativos en pantalla
  for (let tries = 0; tries < 100; tries++) {
    const a = randInt(3, 9)
    const c = randInt(1, a - 1)
    const x = randInt(1, 6) // solucion
    const b = randInt(1, 9)
    const d = b + x * (a - c)
    if (d >= 1 && d <= 30) {
      return { left: { a, b }, right: { a: c, b: d } }
    }
  }
  // fallback
  return { left: { a: 4, b: 2 }, right: { a: 1, b: 8 } } // X=2
}

// ---------- Aplicar operacion ----------

// Si la operacion lleva un valor negativo, la convertimos en su opuesta con valor positivo
// para que el usuario nunca vea cosas como "−−3X" o "+−5".
function normalizeOp(op) {
  if (!op) return op
  if (op.value >= 0) return op
  const flip = { add: 'sub', sub: 'add', addX: 'subX', subX: 'addX' }
  if (op.type in flip) return { type: flip[op.type], value: -op.value }
  return op // mul/div con value negativo no deberia ocurrir, lo dejamos pasar
}

function applyToSide(side, op) {
  switch (op.type) {
    case 'add':  return { a: side.a, b: side.b + op.value }
    case 'sub':  return { a: side.a, b: side.b - op.value }
    case 'mul':  return { a: side.a * op.value, b: side.b * op.value }
    case 'div':  return { a: side.a / op.value, b: side.b / op.value }
    case 'addX': return { a: side.a + op.value, b: side.b }
    case 'subX': return { a: side.a - op.value, b: side.b }
    default: return side
  }
}

export function applyOperation(state, op) {
  const left = applyToSide(state.left, op)
  const right = state.right ? applyToSide(state.right, op) : null
  return { left, right }
}

// ---------- Detectar resuelto ----------

export function isSolved(state) {
  const { left, right } = state
  if (!right) {
    // nivel 1: dejar X solita -> aX+b == 1*X + 0
    return left.a === 1 && left.b === 0
  }
  // niveles 2 y 3: X de un lado, numero del otro
  return left.a === 1 && left.b === 0 && right.a === 0
}

export function getSolution(state) {
  if (!isSolved(state)) return null
  return state.right ? state.right.b : 0
}

// Cantidad de operaciones que faltan para llegar a la solucion.
export function stepsRemaining(state) {
  const L = state.left
  const R = state.right
  let s = 0
  if (R && R.a !== 0) s++
  if (L.b !== 0) s++
  if (L.a !== 1) s++
  return s
}

// ---------- Operacion correcta segun estado ----------

export function correctOp(state) {
  const L = state.left
  const R = state.right
  if (!R) {
    // nivel 1
    if (L.b !== 0) return normalizeOp({ type: 'sub', value: L.b })
    if (L.a !== 1) return normalizeOp({ type: 'div', value: L.a })
    return null
  }
  // niveles 2 y 3
  if (R.a !== 0) return normalizeOp({ type: 'subX', value: R.a })
  if (L.b !== 0) return normalizeOp({ type: 'sub', value: L.b })
  if (L.a !== 1) return normalizeOp({ type: 'div', value: L.a })
  return null
}

// ---------- Generar opciones (1 correcta + 2 distractores) ----------

function distractorPool(state) {
  const L = state.left
  const R = state.right
  const absLa = Math.abs(L.a)
  const absLb = Math.abs(L.b)
  const pool = []
  if (absLb > 0) pool.push({ type: 'add', value: absLb })
  if (absLa > 0) pool.push({ type: 'add', value: absLa })
  if (absLa > 0) pool.push({ type: 'sub', value: absLa })
  pool.push({ type: 'mul', value: 2 })
  if (absLa > 1 && L.b !== 0) pool.push({ type: 'div', value: absLa })
  if (R) {
    const absRa = Math.abs(R.a)
    const absRb = Math.abs(R.b)
    if (absRb > 0 && absRb !== absLb) pool.push({ type: 'sub', value: absRb })
    if (absRa > 0) pool.push({ type: 'addX', value: absRa })
    if (absLa > 0 && absLa !== absRa) pool.push({ type: 'subX', value: absLa })
  } else {
    pool.push({ type: 'addX', value: 1 })
  }
  return pool
}

function opEquals(a, b) {
  return a.type === b.type && a.value === b.value
}

export function getOptions(state) {
  const correct = correctOp(state)
  if (!correct) return []
  const pool = distractorPool(state).filter((op) => !opEquals(op, correct))
  // dedupe pool
  const seen = new Set()
  const dedup = pool.filter((op) => {
    const k = `${op.type}:${op.value}`
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
  const distractors = pickRandom(dedup, Math.min(2, dedup.length))
  return shuffle([correct, ...distractors])
}

// ---------- Formato visual ----------

export function formatSide(side) {
  const { a, b } = side
  const parts = []
  if (a !== 0) {
    if (a === 1) parts.push('X')
    else if (a === -1) parts.push('-X')
    else parts.push(`${a}X`)
  }
  if (b !== 0 || a === 0) {
    if (parts.length === 0) {
      parts.push(`${b}`)
    } else {
      parts.push(b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`)
    }
  }
  return parts.join(' ')
}

export function formatOp(op) {
  const sign = { add: '+', sub: '−', mul: '×', div: '÷', addX: '+', subX: '−' }[op.type]
  let tail
  if (op.type === 'addX' || op.type === 'subX') {
    tail = op.value === 1 ? 'X' : `${op.value}X`
  } else {
    tail = `${op.value}`
  }
  return `${sign}${tail}`
}
