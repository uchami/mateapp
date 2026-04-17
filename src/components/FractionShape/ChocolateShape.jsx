export default function ChocolateShape({ parts, selected = [], onToggle, mode = 'display' }) {
  const cols = parts
  const rows = 1
  const cellW = 40
  const cellH = 50
  const gap = 2
  const padding = 4
  const totalW = cols * (cellW + gap) - gap + padding * 2
  const totalH = rows * (cellH + gap) - gap + padding * 2

  const isInteractive = mode === 'interactive'

  function getCellIndex(row, col) {
    return row * cols + col
  }

  const cells = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = getCellIndex(r, c)
      if (idx >= parts) continue
      cells.push({ r, c, idx })
    }
  }

  return (
    <svg viewBox={`0 0 ${totalW} ${totalH}`} className="w-44 h-28 md:w-52 md:h-32">
      {/* Background bar */}
      <rect
        x={0} y={0}
        width={totalW} height={totalH}
        rx={4}
        fill="#5B3A1A"
      />
      {cells.map(({ r, c, idx }) => {
        const isSelected = selected.includes(idx)
        const x = padding + c * (cellW + gap)
        const y = padding + r * (cellH + gap)
        return (
          <g
            key={idx}
            onClick={isInteractive ? () => onToggle(idx) : undefined}
            className={isInteractive ? 'cursor-pointer' : ''}
          >
            <rect
              x={x} y={y}
              width={cellW} height={cellH}
              rx={3}
              fill={isSelected ? '#7B4F2A' : '#D4C5B0'}
              stroke={isSelected ? '#5B3A1A' : '#9CA3AF'}
              strokeWidth={0.5}
              strokeDasharray={isSelected ? 'none' : '4 3'}
            />
            {isSelected && (
              <>
                <line x1={x + 8} y1={y + cellH / 2} x2={x + cellW - 8} y2={y + cellH / 2}
                  stroke="#5B3A1A" strokeWidth={1} opacity={0.4} />
                <line x1={x + cellW / 2} y1={y + 8} x2={x + cellW / 2} y2={y + cellH - 8}
                  stroke="#5B3A1A" strokeWidth={1} opacity={0.4} />
              </>
            )}
          </g>
        )
      })}
    </svg>
  )
}
