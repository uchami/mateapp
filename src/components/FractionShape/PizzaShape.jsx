export default function PizzaShape({ parts, selected = [], onToggle, mode = 'display' }) {
  const size = 200
  const center = size / 2
  const radius = 85
  const crustWidth = 12

  function getSlicePath(index) {
    const startAngle = (2 * Math.PI * index) / parts - Math.PI / 2
    const endAngle = (2 * Math.PI * (index + 1)) / parts - Math.PI / 2
    const x1 = center + radius * Math.cos(startAngle)
    const y1 = center + radius * Math.sin(startAngle)
    const x2 = center + radius * Math.cos(endAngle)
    const y2 = center + radius * Math.sin(endAngle)
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0
    return `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`
  }

  function getCrustPath(index) {
    const startAngle = (2 * Math.PI * index) / parts - Math.PI / 2
    const endAngle = (2 * Math.PI * (index + 1)) / parts - Math.PI / 2
    const outerR = radius + crustWidth
    const x1 = center + radius * Math.cos(startAngle)
    const y1 = center + radius * Math.sin(startAngle)
    const x2 = center + radius * Math.cos(endAngle)
    const y2 = center + radius * Math.sin(endAngle)
    const ox1 = center + outerR * Math.cos(startAngle)
    const oy1 = center + outerR * Math.sin(startAngle)
    const ox2 = center + outerR * Math.cos(endAngle)
    const oy2 = center + outerR * Math.sin(endAngle)
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${ox2} ${oy2} A ${outerR} ${outerR} 0 ${largeArc} 0 ${ox1} ${oy1} Z`
  }

  function getToppings(index) {
    const midAngle = (2 * Math.PI * (index + 0.5)) / parts - Math.PI / 2
    const r = radius * 0.55
    const cx = center + r * Math.cos(midAngle)
    const cy = center + r * Math.sin(midAngle)
    return { cx, cy }
  }

  const isInteractive = mode === 'interactive'

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-36 h-36 md:w-44 md:h-44">
      {Array.from({ length: parts }).map((_, i) => {
        const isSelected = selected.includes(i)
        const { cx, cy } = getToppings(i)
        return (
          <g
            key={i}
            onClick={isInteractive ? () => onToggle(i) : undefined}
            className={isInteractive ? 'cursor-pointer' : ''}
          >
            {/* Slice */}
            <path
              d={getSlicePath(i)}
              fill={isSelected ? '#FDE68A' : '#f3f4f6'}
              stroke={isSelected ? '#D97706' : '#9CA3AF'}
              strokeWidth={isSelected ? 0.5 : 1}
              strokeDasharray={isSelected ? 'none' : '4 3'}
            />
            {/* Crust */}
            <path
              d={getCrustPath(i)}
              fill={isSelected ? '#D97706' : 'none'}
              stroke={isSelected ? '#B45309' : '#9CA3AF'}
              strokeWidth={isSelected ? 0.5 : 1}
              strokeDasharray={isSelected ? 'none' : '4 3'}
            />
            {/* Pepperoni */}
            {isSelected && (
              <circle cx={cx} cy={cy} r={6} fill="#DC2626" opacity={0.85} />
            )}
            {/* Divider lines */}
            {parts > 1 && (
              <line
                x1={center}
                y1={center}
                x2={center + (radius + crustWidth) * Math.cos((2 * Math.PI * i) / parts - Math.PI / 2)}
                y2={center + (radius + crustWidth) * Math.sin((2 * Math.PI * i) / parts - Math.PI / 2)}
                stroke="#92400E"
                strokeWidth={0.5}
                opacity={0.4}
              />
            )}
          </g>
        )
      })}
    </svg>
  )
}
