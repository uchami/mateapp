import PizzaShape from './PizzaShape'
import ChocolateShape from './ChocolateShape'

const shapeMap = {
  pizza: PizzaShape,
  chocolate: ChocolateShape,
}

export default function FractionShape({ shape, ...props }) {
  const Component = shapeMap[shape]
  if (!Component) return <div>Shape "{shape}" no soportada</div>
  return <Component {...props} />
}
