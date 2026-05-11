import {
  F,
  isInt,
  isOne,
  isZero,
  isNeg,
  addF,
  mulF,
} from '../ecuaciones/EcuacionEngine'
import { TokenList } from '../ecuaciones/EcuacionRender'

// Devuelve tokens para "k·V" donde V es 'X'|'Y'. Si k=1 → V, si k=-1 → -V,
// si k=0 → vacío (devuelve []).
function varTermTokens(k, V) {
  if (isZero(k)) return []
  if (isOne(k)) return [{ kind: 'text', s: V }]
  if (k.n === -1 && k.d === 1) return [{ kind: 'text', s: `-${V}` }]
  if (isInt(k)) return [{ kind: 'text', s: `${k.n}${V}` }]
  const sign = isNeg(k) ? '−' : null
  return [
    { kind: 'frac', n: Math.abs(k.n), d: k.d, sign },
    { kind: 'text', s: V },
  ]
}

// Tokens para el término siguiente (en una expresión), con + / − antepuesto.
function nextTermTokens(k, V) {
  if (isZero(k)) return []
  const sign = isNeg(k) ? '−' : '+'
  const abs = isNeg(k) ? { n: -k.n, d: k.d } : k
  if (V == null) {
    // constante
    if (isInt(abs)) return [{ kind: 'text', s: `${sign} ${abs.n}` }]
    return [{ kind: 'text', s: sign }, { kind: 'frac', n: abs.n, d: abs.d, sign: null }]
  }
  if (isOne(abs)) return [{ kind: 'text', s: `${sign} ${V}` }]
  if (isInt(abs)) return [{ kind: 'text', s: `${sign} ${abs.n}${V}` }]
  return [
    { kind: 'text', s: sign },
    { kind: 'frac', n: abs.n, d: abs.d, sign: null },
    { kind: 'text', s: V },
  ]
}

// Tokens para a·X + b·Y = c (lado izquierdo + signo igual + c).
// Si a o b son 0 los omitimos (mostramos lo que queda).
export function ecuacionTokens(eq) {
  const tokens = []
  if (!isZero(eq.a)) {
    tokens.push(...varTermTokens(eq.a, 'X'))
    if (!isZero(eq.b)) tokens.push(...nextTermTokens(eq.b, 'Y'))
  } else if (!isZero(eq.b)) {
    tokens.push(...varTermTokens(eq.b, 'Y'))
  } else {
    tokens.push({ kind: 'text', s: '0' })
  }
  tokens.push({ kind: 'text', s: '=' })
  // lado derecho: constante c
  if (isInt(eq.c)) tokens.push({ kind: 'text', s: `${eq.c.n}` })
  else {
    const sign = isNeg(eq.c) ? '−' : null
    tokens.push({ kind: 'frac', n: Math.abs(eq.c.n), d: eq.c.d, sign })
  }
  return tokens
}

// Forma despejada: Y = mX + n (la mostramos como "Y = m·X + n").
export function despejadaTokens(varName, m, n) {
  const otra = varName === 'Y' ? 'X' : 'Y'
  const tokens = [{ kind: 'text', s: `${varName} =` }]
  if (isZero(m) && isZero(n)) {
    tokens.push({ kind: 'text', s: '0' })
    return tokens
  }
  if (!isZero(m)) {
    tokens.push(...varTermTokens(m, otra))
    if (!isZero(n)) tokens.push(...nextTermTokens(n, null))
  } else {
    if (isInt(n)) tokens.push({ kind: 'text', s: `${n.n}` })
    else {
      const sign = isNeg(n) ? '−' : null
      tokens.push({ kind: 'frac', n: Math.abs(n.n), d: n.d, sign })
    }
  }
  return tokens
}

// Renderizador básico.
export function Ecuacion({ eq, highlight = false, dim = false, scale = 'lg' }) {
  const cls = {
    sm: 'text-xl md:text-2xl',
    md: 'text-2xl md:text-3xl',
    lg: 'text-3xl md:text-4xl',
    xl: 'text-4xl md:text-5xl',
  }[scale]
  return (
    <div
      className={`font-mono font-bold ${cls} ${
        highlight ? 'text-amber-700' : dim ? 'text-gray-400' : 'text-gray-800'
      }`}
    >
      <TokenList tokens={ecuacionTokens(eq)} />
    </div>
  )
}

// Tokens para "a·X + b = c" donde la variable lleva un nombre específico (X o Y).
export function aXbcTokens(a, b, c, V) {
  const tokens = []
  if (!isZero(a)) {
    if (isOne(a)) tokens.push({ kind: 'text', s: V })
    else if (a.n === -1 && a.d === 1) tokens.push({ kind: 'text', s: `-${V}` })
    else if (isInt(a)) tokens.push({ kind: 'text', s: `${a.n}${V}` })
    else {
      const sign = isNeg(a) ? '−' : null
      tokens.push({ kind: 'frac', n: Math.abs(a.n), d: a.d, sign })
      tokens.push({ kind: 'text', s: V })
    }
  }
  if (!isZero(b)) {
    const sign = isNeg(b) ? '−' : '+'
    const abs = isNeg(b) ? { n: -b.n, d: b.d } : b
    if (isInt(abs)) tokens.push({ kind: 'text', s: `${sign} ${abs.n}` })
    else {
      tokens.push({ kind: 'text', s: sign })
      tokens.push({ kind: 'frac', n: abs.n, d: abs.d, sign: null })
    }
  }
  if (tokens.length === 0) tokens.push({ kind: 'text', s: '0' })
  tokens.push({ kind: 'text', s: '=' })
  if (isInt(c)) tokens.push({ kind: 'text', s: `${c.n}` })
  else {
    const sign = isNeg(c) ? '−' : null
    tokens.push({ kind: 'frac', n: Math.abs(c.n), d: c.d, sign })
  }
  return tokens
}

// Renderiza la sustitución hecha visualmente, con la expresión despejada entre
// paréntesis ocupando el lugar de la variable sustituida. Devuelve tokens.
//   eqOtra: { a, b, c }   ecuación que recibe la sustitución
//   variableSustituida: 'X' | 'Y'   variable que se reemplaza
//   m, n: Frac            coeficientes de la despejada (var = m·otra + n)
export function sustitucionTokens(eqOtra, variableSustituida, m, n) {
  const otraVar = variableSustituida === 'Y' ? 'X' : 'Y'
  const tokens = []
  // Primer término (el que NO se sustituye)
  const aPrimero = variableSustituida === 'Y' ? eqOtra.a : eqOtra.b
  const varPrimero = variableSustituida === 'Y' ? 'X' : 'Y'
  const coefSust = variableSustituida === 'Y' ? eqOtra.b : eqOtra.a
  if (!isZero(aPrimero)) {
    if (isOne(aPrimero)) tokens.push({ kind: 'text', s: varPrimero })
    else if (aPrimero.n === -1 && aPrimero.d === 1) tokens.push({ kind: 'text', s: `-${varPrimero}` })
    else if (isInt(aPrimero)) tokens.push({ kind: 'text', s: `${aPrimero.n}${varPrimero}` })
    else {
      const sign = isNeg(aPrimero) ? '−' : null
      tokens.push({ kind: 'frac', n: Math.abs(aPrimero.n), d: aPrimero.d, sign })
      tokens.push({ kind: 'text', s: varPrimero })
    }
  }
  // Segundo término: coef · (m·otra + n)
  if (!isZero(coefSust)) {
    const sign = isNeg(coefSust) ? '−' : '+'
    const abs = isNeg(coefSust) ? { n: -coefSust.n, d: coefSust.d } : coefSust
    if (tokens.length > 0) tokens.push({ kind: 'text', s: sign })
    else if (isNeg(coefSust)) tokens.push({ kind: 'text', s: '−' })
    // coef en sí (sin signo, ya pusimos arriba)
    if (!isOne(abs)) {
      if (isInt(abs)) tokens.push({ kind: 'text', s: `${abs.n}` })
      else tokens.push({ kind: 'frac', n: abs.n, d: abs.d, sign: null })
    }
    // expresión entre paréntesis: m·otra + n
    tokens.push({ kind: 'text', s: '(' })
    // m·otraVar
    if (!isZero(m)) {
      if (isOne(m)) tokens.push({ kind: 'text', s: otraVar })
      else if (m.n === -1 && m.d === 1) tokens.push({ kind: 'text', s: `-${otraVar}` })
      else if (isInt(m)) tokens.push({ kind: 'text', s: `${m.n}${otraVar}` })
      else {
        const sg = isNeg(m) ? '−' : null
        tokens.push({ kind: 'frac', n: Math.abs(m.n), d: m.d, sign: sg })
        tokens.push({ kind: 'text', s: otraVar })
      }
    }
    // + n
    if (!isZero(n)) {
      const sg = isNeg(n) ? '−' : '+'
      const absN = isNeg(n) ? { n: -n.n, d: n.d } : n
      if (tokens[tokens.length - 1].s === '(') {
        // n solo
        if (isNeg(n)) tokens.push({ kind: 'text', s: '−' })
        if (isInt(absN)) tokens.push({ kind: 'text', s: `${absN.n}` })
        else tokens.push({ kind: 'frac', n: absN.n, d: absN.d, sign: null })
      } else {
        tokens.push({ kind: 'text', s: sg })
        if (isInt(absN)) tokens.push({ kind: 'text', s: `${absN.n}` })
        else tokens.push({ kind: 'frac', n: absN.n, d: absN.d, sign: null })
      }
    }
    tokens.push({ kind: 'text', s: ')' })
  }
  tokens.push({ kind: 'text', s: '=' })
  // lado derecho
  if (isInt(eqOtra.c)) tokens.push({ kind: 'text', s: `${eqOtra.c.n}` })
  else {
    const sign = isNeg(eqOtra.c) ? '−' : null
    tokens.push({ kind: 'frac', n: Math.abs(eqOtra.c.n), d: eqOtra.c.d, sign })
  }
  return tokens
}

// Componente para renderizar tokens centrados grandes.
export function TokensGrandes({ tokens, scale = 'lg', highlight = false }) {
  const cls = {
    sm: 'text-xl md:text-2xl',
    md: 'text-2xl md:text-3xl',
    lg: 'text-3xl md:text-4xl',
    xl: 'text-4xl md:text-5xl',
  }[scale]
  return (
    <div className="flex justify-center w-full">
      <div
        className={`font-mono font-bold ${cls} text-center inline-flex flex-wrap items-center gap-2 justify-center
          ${highlight ? 'text-amber-700' : 'text-gray-800'}`}
      >
        <TokenList tokens={tokens} />
      </div>
    </div>
  )
}

export function Despejada({ varName, m, n, scale = 'lg' }) {
  const cls = {
    sm: 'text-xl md:text-2xl',
    md: 'text-2xl md:text-3xl',
    lg: 'text-3xl md:text-4xl',
    xl: 'text-4xl md:text-5xl',
  }[scale]
  return (
    <div className={`font-mono font-bold ${cls} text-amber-700`}>
      <TokenList tokens={despejadaTokens(varName, m, n)} />
    </div>
  )
}
