import { useEffect, useState } from 'react'
import {
  F,
  addF, subF, mulF, divF,
  isZero, isOne, isInt, isNeg,
} from './SistemaEngine'
import { TokenList } from '../ecuaciones/EcuacionRender'
import ManualOpInput from './ManualOpInput'

// Motor de despeje con dos variables.
// Estado: { aL, bL, cL, aR, bR, cR }
//   representa  aL·X + bL·Y + cL  =  aR·X + bR·Y + cR
// Objetivo (despejar Y): aL=0, bL=1, cL=0 (y bR=0). Queda Y = aR·X + cR.
// Objetivo (despejar X): bL=0, aL=1, cL=0 (y aR=0). Queda X = bR·Y + cR.

const APPLY_DELAY = 600
const PULSE_MS = 350

function applyOp(s, op) {
  // op.value puede venir como entero (number) cuando el alumno ingresa la op
  // a mano; las funciones aritméticas esperan Frac, así que convertimos.
  const v = typeof op.value === 'number' ? F(op.value) : op.value
  switch (op.type) {
    case 'subX': return { ...s, aL: subF(s.aL, v), aR: subF(s.aR, v) }
    case 'addX': return { ...s, aL: addF(s.aL, v), aR: addF(s.aR, v) }
    case 'subY': return { ...s, bL: subF(s.bL, v), bR: subF(s.bR, v) }
    case 'addY': return { ...s, bL: addF(s.bL, v), bR: addF(s.bR, v) }
    case 'sub':  return { ...s, cL: subF(s.cL, v), cR: subF(s.cR, v) }
    case 'add':  return { ...s, cL: addF(s.cL, v), cR: addF(s.cR, v) }
    case 'mul':  return {
      aL: mulF(s.aL, v), bL: mulF(s.bL, v), cL: mulF(s.cL, v),
      aR: mulF(s.aR, v), bR: mulF(s.bR, v), cR: mulF(s.cR, v),
    }
    case 'div':  return {
      aL: divF(s.aL, v), bL: divF(s.bL, v), cL: divF(s.cL, v),
      aR: divF(s.aR, v), bR: divF(s.bR, v), cR: divF(s.cR, v),
    }
    default: return s
  }
}

function isSolvedFor(s, v) {
  if (v === 'Y') return isZero(s.aL) && isOne(s.bL) && isZero(s.cL) && isZero(s.bR)
  return isZero(s.bL) && isOne(s.aL) && isZero(s.cL) && isZero(s.aR)
}

// Distancia al objetivo — sirve para detectar si la op aporta progreso.
function distToGoal(s, v) {
  if (v === 'Y') {
    return Math.abs(s.aL.n) + Math.abs(s.cL.n) + Math.abs(s.bR.n) +
      Math.abs(s.bL.n - s.bL.d) / s.bL.d
  }
  return Math.abs(s.bL.n) + Math.abs(s.cL.n) + Math.abs(s.aR.n) +
    Math.abs(s.aL.n - s.aL.d) / s.aL.d
}

function isProgressOp(s, op, v) {
  const before = distToGoal(s, v)
  const after = distToGoal(applyOp(s, op), v)
  return after < before - 1e-9
}

// ---------- Render ----------

function varTermTokens(k, V) {
  if (isZero(k)) return null
  if (isOne(k)) return [{ kind: 'text', s: V }]
  if (k.n === -1 && k.d === 1) return [{ kind: 'text', s: `-${V}` }]
  if (isInt(k)) return [{ kind: 'text', s: `${k.n}${V}` }]
  const sign = isNeg(k) ? '−' : null
  return [{ kind: 'frac', n: Math.abs(k.n), d: k.d, sign }, { kind: 'text', s: V }]
}

function nextTermTokens(k, V) {
  if (isZero(k)) return null
  const sign = isNeg(k) ? '−' : '+'
  const abs = isNeg(k) ? { n: -k.n, d: k.d } : k
  if (V == null) {
    if (isInt(abs)) return [{ kind: 'text', s: `${sign} ${abs.n}` }]
    return [{ kind: 'text', s: sign }, { kind: 'frac', n: abs.n, d: abs.d, sign: null }]
  }
  if (isOne(abs)) return [{ kind: 'text', s: `${sign} ${V}` }]
  if (isInt(abs)) return [{ kind: 'text', s: `${sign} ${abs.n}${V}` }]
  return [{ kind: 'text', s: sign }, { kind: 'frac', n: abs.n, d: abs.d, sign: null }, { kind: 'text', s: V }]
}

function sideTokens(a, b, c) {
  const tokens = []
  if (!isZero(a)) {
    tokens.push(...varTermTokens(a, 'X'))
  }
  if (!isZero(b)) {
    if (tokens.length === 0) tokens.push(...varTermTokens(b, 'Y'))
    else tokens.push(...nextTermTokens(b, 'Y'))
  }
  if (!isZero(c) || tokens.length === 0) {
    if (tokens.length === 0) {
      if (isInt(c)) tokens.push({ kind: 'text', s: `${c.n}` })
      else {
        const sign = isNeg(c) ? '−' : null
        tokens.push({ kind: 'frac', n: Math.abs(c.n), d: c.d, sign })
      }
    } else {
      tokens.push(...nextTermTokens(c, null))
    }
  }
  return tokens
}

function opToTokens(op) {
  const v = op.value
  const sign = { add: '+', sub: '−', mul: '×', div: '÷', addX: '+', subX: '−', addY: '+', subY: '−' }[op.type]
  const variable = op.type.endsWith('X') ? 'X' : op.type.endsWith('Y') ? 'Y' : null
  if (variable) {
    if (isInt(v)) {
      const tail = v.n === 1 ? variable : `${v.n}${variable}`
      return [{ kind: 'text', s: `${sign}${tail}` }]
    }
    return [{ kind: 'text', s: sign }, { kind: 'frac', n: v.n, d: v.d, sign: null }, { kind: 'text', s: variable }]
  }
  if (isInt(v)) return [{ kind: 'text', s: `${sign}${v.n}` }]
  return [{ kind: 'text', s: sign }, { kind: 'frac', n: v.n, d: v.d, sign: null }]
}

function SidePart({ tokens, opTokens }) {
  if (opTokens) {
    return (
      <span className="inline-flex items-center gap-2">
        <span className="text-blue-600 animate-paren-pop">(</span>
        <TokenList tokens={tokens} />
        <span className="text-blue-600 animate-paren-pop">)</span>
        <span className="text-blue-600 animate-op-slide-in">
          <TokenList tokens={opTokens} />
        </span>
      </span>
    )
  }
  return <TokenList tokens={tokens} />
}

function StateDisplay({ s, pendingOp, justResolved }) {
  const leftTokens = sideTokens(s.aL, s.bL, s.cL)
  const rightTokens = sideTokens(s.aR, s.bR, s.cR)
  const opTokens = pendingOp ? opToTokens(pendingOp) : null
  return (
    <div className={`text-2xl md:text-4xl font-mono font-bold flex items-center gap-3 flex-wrap justify-center text-gray-800 ${justResolved ? 'animate-resolve-pulse' : ''}`}>
      <SidePart tokens={leftTokens} opTokens={opTokens} />
      <span>=</span>
      <SidePart tokens={rightTokens} opTokens={opTokens} />
    </div>
  )
}

// Componente principal.
// Props:
//   eq: { a, b, c } — ecuación inicial a·X + b·Y = c
//   variable: 'X' | 'Y' — variable a despejar
//   onSolved({ m, n }): callback al llegar a la forma despejada
//     (variable = m · otraVar + n).
//   onCorrect, onWrong: callbacks para monedas.
export default function DespejeBiVar({ eq, variable, onSolved, onCorrect, onWrong }) {
  const [state, setState] = useState(() => ({
    aL: eq.a, bL: eq.b, cL: F(0),
    aR: F(0), bR: F(0), cR: eq.c,
  }))
  const [pending, setPending] = useState(null)
  const [preview, setPreview] = useState(null)
  const [pulse, setPulse] = useState(false)
  const solved = isSolvedFor(state, variable)
  const locked = !!pending

  useEffect(() => {
    if (!solved) return
    const m = variable === 'Y' ? state.aR : state.bR
    const n = state.cR
    const tt = setTimeout(() => onSolved({ m, n }), 350)
    return () => clearTimeout(tt)
  }, [solved]) // eslint-disable-line

  function applyManualOp(op) {
    if (pending || solved) return
    const good = isProgressOp(state, op, variable)
    setPending(op)
    setPreview(null)
    setTimeout(() => {
      setState((s) => applyOp(s, op))
      setPending(null)
      setPulse(true)
      setTimeout(() => setPulse(false), PULSE_MS)
      if (good) onCorrect && onCorrect()
      else onWrong && onWrong()
    }, APPLY_DELAY)
  }

  const displayPending = pending || preview

  const opTypes = [
    { type: 'addX', label: '+X' },
    { type: 'subX', label: '−X' },
    { type: 'addY', label: '+Y' },
    { type: 'subY', label: '−Y' },
    { type: 'add', label: '+' },
    { type: 'sub', label: '−' },
    { type: 'mul', label: '×' },
    { type: 'div', label: '÷' },
  ]

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="bg-white rounded-2xl shadow-md px-6 py-4 min-h-[80px] flex items-center justify-center w-full">
        <StateDisplay s={state} pendingOp={displayPending} justResolved={pulse} />
      </div>
      {!solved && (
        <ManualOpInput
          opTypes={opTypes}
          disabled={locked}
          onApply={applyManualOp}
          onPreviewChange={setPreview}
        />
      )}
    </div>
  )
}
