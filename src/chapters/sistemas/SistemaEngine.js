// Motor del capítulo Sistemas.
//
// Modelo:
//   Ecuacion = { a: Frac, b: Frac, c: Frac }     // a·X + b·Y = c
//   Sistema  = { eq1: Ecuacion, eq2: Ecuacion }
//
// Reutilizamos toda la aritmética de fracciones del motor de ecuaciones.

import {
  F,
  ZERO,
  ONE,
  addF,
  subF,
  mulF,
  divF,
  negF,
  eqF,
  isInt,
  isZero,
  isOne,
  isNeg,
} from '../ecuaciones/EcuacionEngine'

// ---------- Helpers ----------

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randNonZero(min, max, allowNeg = true) {
  const sign = allowNeg && Math.random() < 0.5 ? -1 : 1
  let v = randInt(min, max)
  if (v === 0) v = min
  return sign * v
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ---------- Solución analítica ----------

// Resuelve por Cramer. Devuelve { x: Frac, y: Frac } o null si no tiene solución única.
export function solveSystem(eq1, eq2) {
  const det = subF(mulF(eq1.a, eq2.b), mulF(eq2.a, eq1.b))
  if (isZero(det)) return null
  const detX = subF(mulF(eq1.c, eq2.b), mulF(eq2.c, eq1.b))
  const detY = subF(mulF(eq1.a, eq2.c), mulF(eq2.a, eq1.c))
  return { x: divF(detX, det), y: divF(detY, det) }
}

// ---------- Generadores de sistemas ----------

// Sustitución 1.1 — una ecuación ya despejada (Y = mX + n), la otra normal.
// Devolvemos { eq1, eq2, despejada: 'y'|'x', from: 'eq1'|'eq2' }.
// La ecuación "despejada" la guardamos también como { a, b, c } pero con la
// convención: Y = mX + n  ->  -m·X + 1·Y = n  (a = -m, b = 1, c = n).
// Pero al alumno se la mostramos como "Y = mX + n".
export function generateSustitucion1() {
  for (let tries = 0; tries < 200; tries++) {
    // ecuación despejada Y = mX + n
    const m = randNonZero(1, 4)
    const n = randNonZero(1, 8)
    const eq1 = { a: F(-m), b: ONE, c: F(n) }
    // segunda: a2 X + b2 Y = c2 con solución entera limpia
    const a2 = randNonZero(2, 5)
    const b2 = randNonZero(1, 4)
    // ecuaciones equivalentes: a2 / -m = b2 / 1 ⇔ a2 = -m·b2. Las excluimos.
    if (a2 === -m * b2) continue
    const xSol = randInt(-4, 4)
    if (xSol === 0) continue
    const ySol = m * xSol + n
    const c2 = a2 * xSol + b2 * ySol
    if (Math.abs(c2) > 30) continue
    const eq2 = { a: F(a2), b: F(b2), c: F(c2) }
    return { eq1, eq2, despejada: 'y', desde: 'eq1', m: F(m), n: F(n), xSol: F(xSol), ySol: F(ySol) }
  }
  // fallback determinista
  return {
    eq1: { a: F(-2), b: ONE, c: F(3) },
    eq2: { a: F(4), b: F(1), c: F(15) },
    despejada: 'y', desde: 'eq1', m: F(2), n: F(3), xSol: F(2), ySol: F(7),
  }
}

// Sustitución 1.2 — ninguna despejada, coeficientes lindos para que cualquier
// elección sea posible. Soluciones enteras.
export function generateSustitucion2() {
  for (let tries = 0; tries < 200; tries++) {
    const xSol = randNonZero(1, 4)
    const ySol = randNonZero(1, 4)
    const a1 = randNonZero(1, 4)
    const b1 = randNonZero(1, 4)
    const a2 = randNonZero(1, 4)
    const b2 = randNonZero(1, 4)
    const det = a1 * b2 - a2 * b1
    if (det === 0) continue
    const c1 = a1 * xSol + b1 * ySol
    const c2 = a2 * xSol + b2 * ySol
    if (Math.abs(c1) > 30 || Math.abs(c2) > 30) continue
    return {
      eq1: { a: F(a1), b: F(b1), c: F(c1) },
      eq2: { a: F(a2), b: F(b2), c: F(c2) },
      xSol: F(xSol), ySol: F(ySol),
    }
  }
  return {
    eq1: { a: F(2), b: F(1), c: F(7) },
    eq2: { a: F(1), b: F(3), c: F(11) },
    xSol: F(2), ySol: F(3),
  }
}

// Sustitución 1.3 — admite soluciones fraccionarias.
export function generateSustitucion3() {
  for (let tries = 0; tries < 300; tries++) {
    const a1 = randNonZero(2, 6)
    const b1 = randNonZero(1, 5)
    const a2 = randNonZero(1, 5)
    const b2 = randNonZero(2, 6)
    const det = a1 * b2 - a2 * b1
    if (det === 0 || Math.abs(det) > 15) continue
    const c1 = randNonZero(1, 12)
    const c2 = randNonZero(1, 12)
    const sol = solveSystem(
      { a: F(a1), b: F(b1), c: F(c1) },
      { a: F(a2), b: F(b2), c: F(c2) },
    )
    if (!sol) continue
    if (Math.abs(sol.x.n) > 20 || sol.x.d > 6) continue
    if (Math.abs(sol.y.n) > 20 || sol.y.d > 6) continue
    return {
      eq1: { a: F(a1), b: F(b1), c: F(c1) },
      eq2: { a: F(a2), b: F(b2), c: F(c2) },
      xSol: sol.x, ySol: sol.y,
    }
  }
  return {
    eq1: { a: F(2), b: F(3), c: F(5) },
    eq2: { a: F(3), b: F(-1), c: F(2) },
    xSol: F(1), ySol: F(1),
  }
}

// Eliminación 3.1 — el coef de X o Y es opuesto entre eq1 y eq2 (sumar cancela).
export function generateEliminacion1() {
  for (let tries = 0; tries < 200; tries++) {
    const cancelarX = Math.random() < 0.5
    const xSol = randNonZero(1, 5)
    const ySol = randNonZero(1, 5)
    let a1, b1, a2, b2
    if (cancelarX) {
      const k = randNonZero(2, 5)
      a1 = k
      a2 = -k
      b1 = randNonZero(1, 5)
      b2 = randNonZero(1, 5)
      if (b1 + b2 === 0) continue
    } else {
      const k = randNonZero(2, 5)
      b1 = k
      b2 = -k
      a1 = randNonZero(1, 5)
      a2 = randNonZero(1, 5)
      if (a1 + a2 === 0) continue
    }
    const c1 = a1 * xSol + b1 * ySol
    const c2 = a2 * xSol + b2 * ySol
    if (Math.abs(c1) > 30 || Math.abs(c2) > 30) continue
    return {
      eq1: { a: F(a1), b: F(b1), c: F(c1) },
      eq2: { a: F(a2), b: F(b2), c: F(c2) },
      xSol: F(xSol), ySol: F(ySol),
      cancelar: cancelarX ? 'x' : 'y',
    }
  }
  return {
    eq1: { a: F(3), b: F(2), c: F(7) },
    eq2: { a: F(-3), b: F(1), c: F(2) },
    xSol: F(1), ySol: F(2), cancelar: 'x',
  }
}

// Eliminación 3.2 — hay que multiplicar UNA ecuación por un entero k para
// que al sumar se cancele una variable.
export function generateEliminacion2() {
  for (let tries = 0; tries < 200; tries++) {
    const cancelarX = Math.random() < 0.5
    const xSol = randNonZero(1, 4)
    const ySol = randNonZero(1, 4)
    // eq1 tiene el coeficiente "pequeño" que vamos a multiplicar
    const a1 = cancelarX ? randNonZero(1, 3) : randNonZero(1, 4)
    const b1 = cancelarX ? randNonZero(1, 4) : randNonZero(1, 3)
    // multiplicador k ≠ ±1
    const k = pick([2, 3, -2, -3])
    // eq2: el coeficiente que cancela vale -k·(coef de eq1)
    let a2, b2
    if (cancelarX) {
      a2 = -k * a1
      b2 = randNonZero(1, 4)
      if (b1 + b2 / Math.abs(k) === 0) continue
    } else {
      b2 = -k * b1
      a2 = randNonZero(1, 4)
    }
    if (a1 === 0 || a2 === 0 || b1 === 0 || b2 === 0) continue
    const c1 = a1 * xSol + b1 * ySol
    const c2 = a2 * xSol + b2 * ySol
    if (Math.abs(c1) > 30 || Math.abs(c2) > 30) continue
    return {
      eq1: { a: F(a1), b: F(b1), c: F(c1) },
      eq2: { a: F(a2), b: F(b2), c: F(c2) },
      xSol: F(xSol), ySol: F(ySol),
      multiplicar: 'eq1', k: F(k), cancelar: cancelarX ? 'x' : 'y',
    }
  }
  return {
    eq1: { a: F(2), b: F(3), c: F(13) },
    eq2: { a: F(-4), b: F(1), c: F(-3) },
    xSol: F(2), ySol: F(3), multiplicar: 'eq1', k: F(2), cancelar: 'x',
  }
}

// Eliminación 3.3 — hay que multiplicar AMBAS por enteros para cancelar.
// Tipico caso del MCM.
export function generateEliminacion3() {
  for (let tries = 0; tries < 200; tries++) {
    const xSol = randNonZero(1, 4)
    const ySol = randNonZero(1, 4)
    // a1, a2 coprimos no triviales (ej. 2 y 5, 3 y 4)
    const pares = [
      [2, 3], [2, 5], [3, 4], [3, 5], [2, 7], [3, 7], [4, 5], [4, 3],
    ]
    const [a1raw, a2raw] = pick(pares)
    const signA = Math.random() < 0.5 ? 1 : -1
    const a1 = signA * a1raw
    const a2 = signA * a2raw
    const b1 = randNonZero(1, 5)
    const b2 = randNonZero(1, 5)
    const c1 = a1 * xSol + b1 * ySol
    const c2 = a2 * xSol + b2 * ySol
    if (Math.abs(c1) > 40 || Math.abs(c2) > 40) continue
    // multiplicadores para cancelar X: k1 = a2 / gcd, k2 = -a1 / gcd
    const k1 = a2raw
    const k2 = -a1raw
    return {
      eq1: { a: F(a1), b: F(b1), c: F(c1) },
      eq2: { a: F(a2), b: F(b2), c: F(c2) },
      xSol: F(xSol), ySol: F(ySol),
      k1: F(k1), k2: F(k2), cancelar: 'x',
    }
  }
  return {
    eq1: { a: F(2), b: F(3), c: F(8) },
    eq2: { a: F(5), b: F(4), c: F(13) },
    xSol: F(1), ySol: F(2), k1: F(5), k2: F(-2), cancelar: 'x',
  }
}

// ---------- Operaciones sobre ecuaciones ----------

export function mulEq(eq, k) {
  return { a: mulF(eq.a, k), b: mulF(eq.b, k), c: mulF(eq.c, k) }
}

export function addEq(eq1, eq2) {
  return {
    a: addF(eq1.a, eq2.a),
    b: addF(eq1.b, eq2.b),
    c: addF(eq1.c, eq2.c),
  }
}

// Verifica si dos ecuaciones son iguales (coeficiente a coeficiente).
export function eqEq(a, b) {
  return eqF(a.a, b.a) && eqF(a.b, b.b) && eqF(a.c, b.c)
}

// ---------- Sustitución: ecuación con una variable ----------

// Reemplaza Y = mX + n en la ecuación a·X + b·Y = c, devuelve coeficientes
// de la ecuación resultante en X: (a + b·m)·X + b·n = c.
// Devuelve { aRes: Frac, bRes: Frac, cRes: Frac } donde aRes·X + bRes = cRes.
export function sustituirY(eq, m, n) {
  return {
    aRes: addF(eq.a, mulF(eq.b, m)),
    bRes: mulF(eq.b, n),
    cRes: eq.c,
  }
}

// Reemplaza X = mY + n en a·X + b·Y = c, devuelve coeficientes en Y.
export function sustituirX(eq, m, n) {
  return {
    aRes: addF(eq.b, mulF(eq.a, m)),
    bRes: mulF(eq.a, n),
    cRes: eq.c,
  }
}

// Re-exports cómodos del motor de ecuaciones.
export {
  F, ZERO, ONE, addF, subF, mulF, divF, negF, eqF,
  isInt, isZero, isOne, isNeg,
}
