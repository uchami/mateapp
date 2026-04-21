import PizzaShape from './PizzaShape'
import ChocolateShape from './ChocolateShape'
import { useLang } from '../../i18n/LanguageContext'

const shapeMap = {
  pizza: PizzaShape,
  chocolate: ChocolateShape,
}

export default function FractionShape({ shape, onSetSelected, parts, selected = [], mode = 'display', ...props }) {
  const { t } = useLang()
  const Component = shapeMap[shape]
  if (!Component) return <div>{t.shape.notSupported(shape)}</div>

  const showFillButton = mode === 'interactive' && onSetSelected && parts > 1
  const allSelected = selected.length === parts

  return (
    <div className="flex flex-col items-center">
      <Component parts={parts} selected={selected} mode={mode} {...props} />
      {showFillButton && (
        <button
          type="button"
          onClick={() =>
            onSetSelected(allSelected ? [] : Array.from({ length: parts }, (_, i) => i))
          }
          className="mt-2 text-xs px-3 py-1 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-colors"
        >
          {allSelected ? t.shape.empty : t.shape.fillAll}
        </button>
      )}
    </div>
  )
}
