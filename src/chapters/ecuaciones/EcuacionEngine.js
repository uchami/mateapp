// Modelo:
//   Frac  = { n: int, d: int }    siempre simplificada, d > 0
//   side  = { a: Frac, b: Frac }  representa  aX + b
//   state = { left: side, right: side | null }
//
// Operaciones:
//   { type: 'add'|'sub'|'mul'|'div', value: int|Frac }   -> sobre constantes
//   { type: 'addX'|'subX',           value: int|Frac }   -> sobre el coeficiente de X

// ---------- Aritmética de fracciones ----------

function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b)
  while (b) { [a, b] = [b, a % b] }
  return a || 1
}

function simplify(f) {
  let { n, d } = f
  if (d < 0) { n = -n; d = -d }
  const g = gcd(n, d)
  return { n: n / g, d: d / g }
}

export function F(n, d = 1) { return simplify({ n, d }) }
export const ZERO = F(0)
export const ONE = F(1)

function asFrac(x) {
  if (typeof x === 'number') return F(x)
  return x
}

export function addF(a, b) { return F(a.n * b.d + b.n * a.d, a.d * b.d) }
export function subF(a, b) { return F(a.n * b.d - b.n * a.d, a.d * b.d) }
export function mulF(a, b) { return F(a.n * b.n, a.d * b.d) }
export function divF(a, b) { return F(a.n * b.d, a.d * b.n) }
export function negF(a)    { return F(-a.n, a.d) }
export function absF(a)    { return F(Math.abs(a.n), a.d) }
export function eqF(a, b)  { return a.n === b.n && a.d === b.d }
export function isInt(a)   { return a.d === 1 }
export function isZero(a)  { return a.n === 0 }
export function isOne(a)   { return a.n === 1 && a.d === 1 }
export function isNeg(a)   { return a.n < 0 }

// ---------- Helpers ----------

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// entero distinto de cero en el rango [-max, max] excluyendo {-1..-min+1, 1..min-1}
function randNonZero(min, max, allowNeg = true) {
  const sign = allowNeg && Math.random() < 0.5 ? -1 : 1
  return sign * randInt(min, max)
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
  return { left: { a: F(a), b: F(b) }, right: null }
}

export function generateLevel2() {
  // garantiza b multiplo de a -> X = -b/a entero limpio
  const a = randInt(2, 9)
  const xAbs = randInt(1, 6)
  const b = xAbs * a
  return { left: { a: F(a), b: F(b) }, right: { a: ZERO, b: ZERO } }
}

export function generateLevel3() {
  // garantiza a > c, solucion entera positiva, sin negativos en pantalla
  for (let tries = 0; tries < 100; tries++) {
    const a = randInt(3, 9)
    const c = randInt(1, a - 1)
    const x = randInt(1, 6)
    const b = randInt(1, 9)
    const d = b + x * (a - c)
    if (d >= 1 && d <= 30) {
      return { left: { a: F(a), b: F(b) }, right: { a: F(c), b: F(d) } }
    }
  }
  return { left: { a: F(4), b: F(2) }, right: { a: F(1), b: F(8) } }
}

// Genera una constante: con prob `pFrac` devuelve una Frac simple
// (denominador en 2..4); si no, un entero del rango. Siempre con signo random.
function randConst(min, max, pFrac, allowNeg = true) {
  const sign = allowNeg && Math.random() < 0.5 ? -1 : 1
  const n = randInt(min, max)
  if (Math.random() < pFrac) {
    const d = randInt(2, 4)
    return F(sign * n, d)
  }
  return F(sign * n)
}

// Nivel 4: primeros 3 son aX+b=0 con negativos, despues aX+b=cX+d con negativos.
// `a` y `c` siempre enteros; `b` y `d` ocasionalmente fracciones simples (~15%).
// Solución puede ser fraccionaria (p.ej. X = 3/4 o X = -3/8).
const FRAC_PROB = 0.15

export function generateLevel4(exerciseIndex = 0) {
  if (exerciseIndex < 3) {
    for (let tries = 0; tries < 100; tries++) {
      const a = randNonZero(2, 7)
      const b = randConst(1, 9, FRAC_PROB)
      // X = -b/a
      const sol = divF(negF(b), F(a))
      if (sol.d <= 8 && Math.abs(sol.n) <= 20) {
        return { left: { a: F(a), b }, right: { a: ZERO, b: ZERO } }
      }
    }
    return { left: { a: F(2), b: F(3) }, right: { a: ZERO, b: ZERO } }
  }
  for (let tries = 0; tries < 200; tries++) {
    const a = randNonZero(2, 7)
    let c = randNonZero(1, 6)
    if (c === a) c = -c
    const b = randConst(1, 9, FRAC_PROB)
    const d = randConst(1, 9, FRAC_PROB)
    const denom = a - c
    if (denom === 0) continue
    // X = (d-b)/(a-c)
    const sol = divF(subF(d, b), F(denom))
    if (sol.d <= 8 && Math.abs(sol.n) <= 20) {
      return { left: { a: F(a), b }, right: { a: F(c), b: d } }
    }
  }
  return { left: { a: F(3), b: F(2) }, right: { a: F(-2), b: F(-3) } }
}

// Nivel 5: misma estructura que nivel 4 (3 ejercicios aX+b=0, despues aX+b=cX+d).
// Lo que cambia es el metodo de input (ver EcuacionGameFree).
export function generateLevel5(exerciseIndex = 0) {
  return generateLevel4(exerciseIndex)
}

// ---------- Aplicar operacion ----------

// Si la operacion lleva un valor "negativo" (entero o frac), la convertimos en su opuesta
// con valor positivo para que el usuario nunca vea cosas como "−−3X" o "+−5".
export function normalizeOp(op) {
  if (!op) return op
  const v = asFrac(op.value)
  if (v.n >= 0) return { ...op, value: typeof op.value === 'number' ? Math.abs(op.value) : absF(v) }
  const flip = { add: 'sub', sub: 'add', addX: 'subX', subX: 'addX' }
  if (op.type in flip) {
    const newVal = typeof op.value === 'number' ? -op.value : negF(v)
    return { type: flip[op.type], value: newVal }
  }
  return op
}

function applyToSide(side, op) {
  const v = asFrac(op.value)
  switch (op.type) {
    case 'add':  return { a: side.a,           b: addF(side.b, v) }
    case 'sub':  return { a: side.a,           b: subF(side.b, v) }
    case 'mul':  return { a: mulF(side.a, v),  b: mulF(side.b, v) }
    case 'div':  return { a: divF(side.a, v),  b: divF(side.b, v) }
    case 'addX': return { a: addF(side.a, v),  b: side.b }
    case 'subX': return { a: subF(side.a, v),  b: side.b }
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
    return isOne(left.a) && isZero(left.b)
  }
  // niveles 2/3/4/5: X de un lado, numero del otro
  return isOne(left.a) && isZero(left.b) && isZero(right.a)
}

export function getSolution(state) {
  if (!isSolved(state)) return null
  return state.right ? state.right.b : ZERO
}

// Métrica de "lejanía" al estado objetivo (L.a=1, L.b=0, R.a=0).
// R.b queda libre — es donde termina la solución.
function distToGoal(state) {
  const { left: L, right: R } = state
  // |L.a - 1| + |L.b|
  const la = Math.abs(L.a.n - L.a.d) / L.a.d
  const lb = Math.abs(L.b.n) / L.b.d
  let d = la + lb
  if (R) d += Math.abs(R.a.n) / R.a.d
  return d
}

// True si la op acerca al objetivo. La usamos para decidir si rompe la racha.
// Más permisivo que comparar contra correctOp: cualquier movimiento útil cuenta.
export function isProgress(state, op) {
  const before = distToGoal(state)
  const after = distToGoal(applyOperation(state, op))
  return after < before - 1e-9
}

// Cantidad de operaciones que faltan para llegar a la solucion.
export function stepsRemaining(state) {
  const L = state.left
  const R = state.right
  let s = 0
  if (R && !isZero(R.a)) s++
  if (!isZero(L.b)) s++
  if (!isOne(L.a)) s++
  return s
}

// ---------- Operacion correcta segun estado ----------

// Operación natural para despejar X dado L.a (su coeficiente):
//   - si L.a es entero >1 (o <-1): dividir por L.a
//   - si L.a es fracción: multiplicar por su recíproco (más intuitivo que "÷ 1/2")
function clearLaOp(la) {
  if (isInt(la)) return normalizeOp({ type: 'div', value: la.n })
  return normalizeOp({ type: 'mul', value: F(la.d, la.n) })
}

export function correctOp(state) {
  const L = state.left
  const R = state.right
  if (!R) {
    if (!isZero(L.b)) return normalizeOp({ type: 'sub', value: L.b })
    if (!isOne(L.a))  return clearLaOp(L.a)
    return null
  }
  if (!isZero(R.a)) return normalizeOp({ type: 'subX', value: R.a })
  if (!isZero(L.b)) return normalizeOp({ type: 'sub',  value: L.b })
  if (!isOne(L.a))  return clearLaOp(L.a)
  return null
}

// ---------- Generar opciones (1 correcta + 2 distractores) ----------
// Filosofía clave: NUNCA ofrecer un distractor que produzca una fracción,
// salvo que el estado actual ya tenga fracciones (lo cual sólo pasa en nivel 4/5).

function fracEquals(a, b) {
  const af = asFrac(a)
  const bf = asFrac(b)
  return eqF(af, bf)
}

function opEquals(a, b) {
  return a && b && a.type === b.type && fracEquals(a.value, b.value)
}

// Devuelve true si la op aplicada al estado deja todos los coeficientes enteros (cuando ya lo eran).
function opPreservesIntegers(state, op) {
  const sides = state.right ? [state.left, state.right] : [state.left]
  // si el estado ya tiene fracciones, no hace falta filtrar (no podemos hacer peor)
  const allInts = sides.every((s) => isInt(s.a) && isInt(s.b))
  if (!allInts) return true
  const next = applyOperation(state, op)
  const nextSides = next.right ? [next.left, next.right] : [next.left]
  return nextSides.every((s) => isInt(s.a) && isInt(s.b))
}

function distractorPool(state) {
  const L = state.left
  const R = state.right
  const absLa = isZero(L.a) ? 0 : Math.abs(L.a.n)
  const absLb = isZero(L.b) ? 0 : Math.abs(L.b.n)
  const pool = []
  // sumas y restas siempre son seguras (no producen fracciones)
  if (absLb > 0 && isInt(L.b)) {
    pool.push({ type: 'add', value: absLb })
    pool.push({ type: 'sub', value: absLb })
  }
  if (absLa > 0 && isInt(L.a)) {
    pool.push({ type: 'add', value: absLa })
    pool.push({ type: 'sub', value: absLa })
  }
  // div sólo si L.a es entero >1 y mantiene enteros
  if (absLa > 1 && isInt(L.a) && (!isZero(L.b) ? isInt(L.b) : true)) {
    pool.push({ type: 'div', value: absLa })
  }
  if (R) {
    const absRa = isZero(R.a) ? 0 : Math.abs(R.a.n)
    const absRb = isZero(R.b) ? 0 : Math.abs(R.b.n)
    if (absRb > 0 && absRb !== absLb && isInt(R.b)) {
      pool.push({ type: 'sub', value: absRb })
      pool.push({ type: 'add', value: absRb })
    }
    if (absRa > 0 && isInt(R.a)) {
      pool.push({ type: 'addX', value: absRa })
      pool.push({ type: 'subX', value: absRa })
    }
    if (absLa > 0 && absLa !== absRa && isInt(L.a)) {
      pool.push({ type: 'subX', value: absLa })
      pool.push({ type: 'addX', value: absLa })
    }
  } else {
    pool.push({ type: 'addX', value: 1 })
    pool.push({ type: 'subX', value: 1 })
  }
  // filtrar los que romperían enteros
  return pool.filter((op) => opPreservesIntegers(state, op))
}

export function getOptions(state) {
  const correct = correctOp(state)
  if (!correct) return []
  const pool = distractorPool(state).filter((op) => !opEquals(op, correct))
  // dedupe pool
  const seen = new Set()
  const dedup = pool.filter((op) => {
    const v = asFrac(op.value)
    const k = `${op.type}:${v.n}/${v.d}`
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
  const distractors = pickRandom(dedup, Math.min(2, dedup.length))
  return shuffle([correct, ...distractors])
}

// ---------- Formato visual (tokens) ----------
//
// Devolvemos arrays de tokens para que el renderer pueda dibujar fracciones
// con barra horizontal en lugar de "3/4".
//
//   token = { kind: 'text', s: string }
//         | { kind: 'frac', n: int, d: int, sign: '+' | '−' | null }

function fracToken(frac, withSign) {
  if (isInt(frac)) {
    if (withSign) {
      const s = frac.n >= 0 ? `+ ${frac.n}` : `− ${Math.abs(frac.n)}`
      return { kind: 'text', s }
    }
    return { kind: 'text', s: `${frac.n}` }
  }
  const sign = withSign ? (frac.n >= 0 ? '+' : '−') : (frac.n < 0 ? '−' : null)
  return { kind: 'frac', n: Math.abs(frac.n), d: frac.d, sign }
}

// Token para el coeficiente de X. Si es 1 -> "X"; si es -1 -> "-X"; si es Frac -> "(n/d)X"
function xTermToken(a) {
  if (isOne(a)) return [{ kind: 'text', s: 'X' }]
  if (a.n === -1 && a.d === 1) return [{ kind: 'text', s: '-X' }]
  if (isInt(a)) return [{ kind: 'text', s: `${a.n}X` }]
  // fraccion como coeficiente
  const sign = a.n < 0 ? '−' : null
  return [
    { kind: 'frac', n: Math.abs(a.n), d: a.d, sign },
    { kind: 'text', s: 'X' },
  ]
}

export function formatSide(side) {
  const { a, b } = side
  const tokens = []
  if (!isZero(a)) {
    tokens.push(...xTermToken(a))
  }
  if (!isZero(b) || isZero(a)) {
    if (tokens.length === 0) {
      tokens.push(fracToken(b, false))
    } else {
      tokens.push(fracToken(b, true))
    }
  }
  return tokens
}

// formatOp -> tokens con el simbolo de operacion al inicio.
// Para mul/div con value=1 mostramos igual el "x1" / "÷1" para que el alumno
// no se confunda al ingresar opciones libres.
export function formatOp(op) {
  const v = asFrac(op.value)
  const sign = { add: '+', sub: '−', mul: '×', div: '÷', addX: '+', subX: '−' }[op.type]
  if (op.type === 'addX' || op.type === 'subX') {
    if (isInt(v)) {
      const tail = v.n === 1 ? 'X' : `${v.n}X`
      return [{ kind: 'text', s: `${sign}${tail}` }]
    }
    return [
      { kind: 'text', s: sign },
      { kind: 'frac', n: v.n, d: v.d, sign: null },
      { kind: 'text', s: 'X' },
    ]
  }
  if (isInt(v)) {
    return [{ kind: 'text', s: `${sign}${v.n}` }]
  }
  return [
    { kind: 'text', s: sign },
    { kind: 'frac', n: v.n, d: v.d, sign: null },
  ]
}
