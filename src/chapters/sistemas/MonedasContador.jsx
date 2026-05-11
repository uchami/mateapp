import monedaImg from '../../assets/sistemas/moneda-oro.png'

// Contador en la barra superior. Muestra monedas y, si combo > 1, multiplicador.
export default function MonedasContador({ monedas, combo, justEarned }) {
  return (
    <div className="flex items-center gap-2 bg-amber-100 border-2 border-amber-400 rounded-full px-3 py-1 shadow">
      <img
        src={monedaImg}
        alt="moneda"
        className={`w-6 h-6 ${justEarned ? 'animate-coin-pop' : ''}`}
      />
      <span className="font-bold text-amber-900 text-base">{monedas}</span>
      {combo > 1 && (
        <span className="text-sm font-bold text-orange-600 animate-combo-pop">
          x{combo}
        </span>
      )}
    </div>
  )
}
