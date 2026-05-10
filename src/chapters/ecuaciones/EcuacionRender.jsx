import { formatOp, formatSide } from './EcuacionEngine'

// Renderea una fracción visual con barra horizontal apilada.
// Si viene un signo, lo dibuja a la izquierda separado.
function FracDisplay({ n, d, sign, scale = 1 }) {
  const fontSize = `${scale}em`
  return (
    <span className="inline-flex items-center gap-1.5">
      {sign && <span>{sign}</span>}
      <span
        className="inline-flex flex-col items-center leading-none"
        style={{ fontSize }}
      >
        <span className="px-1 pb-0.5 border-b-2 border-current">{n}</span>
        <span className="px-1 pt-0.5">{d}</span>
      </span>
    </span>
  )
}

export function TokenList({ tokens, scale = 0.7 }) {
  return (
    <span className="inline-flex items-center gap-2 flex-wrap justify-center">
      {tokens.map((t, i) => {
        if (t.kind === 'text') return <span key={i}>{t.s}</span>
        return <FracDisplay key={i} n={t.n} d={t.d} sign={t.sign} scale={scale} />
      })}
    </span>
  )
}

// Componente principal: renderiza el state con paréntesis azules + op si hay pendingOp.
export function ExpressionDisplay({ state, solved, pendingOp, justResolved }) {
  const leftTokens = formatSide(state.left)
  const rightTokens = state.right ? formatSide(state.right) : null

  return (
    <div
      className={`text-3xl md:text-5xl font-mono font-bold flex items-center gap-3 flex-wrap justify-center ${
        solved ? 'text-green-600' : 'text-gray-800'
      }`}
    >
      <SidePart tokens={leftTokens} pendingOp={pendingOp} justResolved={justResolved} />
      {rightTokens !== null && (
        <>
          <span>=</span>
          <SidePart tokens={rightTokens} pendingOp={pendingOp} justResolved={justResolved} />
        </>
      )}
    </div>
  )
}

function SidePart({ tokens, pendingOp, justResolved }) {
  if (pendingOp) {
    return (
      <span className="inline-flex items-center gap-2">
        <span className="text-blue-600 animate-paren-pop">(</span>
        <TokenList tokens={tokens} />
        <span className="text-blue-600 animate-paren-pop">)</span>
        <span className="text-blue-600 animate-op-slide-in">
          <TokenList tokens={formatOp(pendingOp)} />
        </span>
      </span>
    )
  }
  if (justResolved) {
    return (
      <span className="animate-resolve-pulse">
        <TokenList tokens={tokens} />
      </span>
    )
  }
  return <TokenList tokens={tokens} />
}

export function OptionButton({ op, onClick, selected, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-5 py-3 rounded-xl font-mono font-bold text-2xl border-2 transition-all
        ${
          selected
            ? 'bg-indigo-500 text-white border-indigo-600 scale-105 shadow-lg'
            : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400 hover:scale-105'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <TokenList tokens={formatOp(op)} scale={0.6} />
    </button>
  )
}
