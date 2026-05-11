import cofreCerrado from '../../assets/sistemas/cofre-cerrado.png'
import cofreAbierto from '../../assets/sistemas/cofre-abierto.png'

export default function Cofre({ abierto, total, size = 'md' }) {
  const cls = { sm: 'w-16 h-16', md: 'w-24 h-24', lg: 'w-32 h-32' }[size]
  return (
    <div className="flex flex-col items-center">
      <img
        src={abierto ? cofreAbierto : cofreCerrado}
        alt="cofre"
        className={`${cls} object-contain ${abierto ? 'animate-chest-glow' : ''}`}
      />
      {total !== undefined && (
        <div className="mt-1 px-3 py-0.5 bg-amber-200 rounded-full border border-amber-400 font-bold text-amber-900 text-sm">
          {total} 🪙
        </div>
      )}
    </div>
  )
}
