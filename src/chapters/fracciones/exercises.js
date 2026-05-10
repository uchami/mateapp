export const exercises = [
  // ── Suma de pizza en cuartos (3) ──
  {
    id: 1,
    operation: '+',
    shape: 'pizza',
    operands: [
      { numerator: 1, denominator: 4 },
      { numerator: 3, denominator: 4 },
    ],
    answerNumerator: 4,
    answerDenominator: 4,
    answerShapes: 1,
  },
  {
    id: 2,
    operation: '+',
    shape: 'pizza',
    operands: [
      { numerator: 2, denominator: 4 },
      { numerator: 3, denominator: 4 },
    ],
    answerNumerator: 5,
    answerDenominator: 4,
    answerShapes: 2,
  },
  {
    id: 3,
    operation: '+',
    shape: 'pizza',
    operands: [
      { numerator: 3, denominator: 4 },
      { numerator: 3, denominator: 4 },
    ],
    answerNumerator: 6,
    answerDenominator: 4,
    answerShapes: 2,
  },
  {
    id: 4,
    operation: '+',
    shape: 'pizza',
    operands: [
      { numerator: 1, denominator: 4 },
      { numerator: 2, denominator: 4 },
    ],
    answerNumerator: 3,
    answerDenominator: 4,
    answerShapes: 1,
  },

  // ── Suma de pizza en quintos (3) ──
  {
    id: 5,
    operation: '+',
    shape: 'pizza',
    operands: [
      { numerator: 2, denominator: 5 },
      { numerator: 3, denominator: 5 },
    ],
    answerNumerator: 5,
    answerDenominator: 5,
    answerShapes: 1,
  },
  {
    id: 6,
    operation: '+',
    shape: 'pizza',
    operands: [
      { numerator: 3, denominator: 5 },
      { numerator: 4, denominator: 5 },
    ],
    answerNumerator: 7,
    answerDenominator: 5,
    answerShapes: 2,
  },
  {
    id: 7,
    operation: '+',
    shape: 'pizza',
    operands: [
      { numerator: 1, denominator: 5 },
      { numerator: 2, denominator: 5 },
    ],
    answerNumerator: 3,
    answerDenominator: 5,
    answerShapes: 1,
  },

  // ── Suma de chocolate en octavos (3) ──
  {
    id: 8,
    operation: '+',
    shape: 'chocolate',
    operands: [
      { numerator: 3, denominator: 8 },
      { numerator: 5, denominator: 8 },
    ],
    answerNumerator: 8,
    answerDenominator: 8,
    answerShapes: 1,
  },
  {
    id: 9,
    operation: '+',
    shape: 'chocolate',
    operands: [
      { numerator: 5, denominator: 8 },
      { numerator: 6, denominator: 8 },
    ],
    answerNumerator: 11,
    answerDenominator: 8,
    answerShapes: 2,
  },
  {
    id: 10,
    operation: '+',
    shape: 'chocolate',
    operands: [
      { numerator: 1, denominator: 8 },
      { numerator: 4, denominator: 8 },
    ],
    answerNumerator: 5,
    answerDenominator: 8,
    answerShapes: 1,
  },

  // ── Resta de pizza en quintos (3) ──
  {
    id: 11,
    operation: '-',
    shape: 'pizza',
    operands: [
      { numerator: 4, denominator: 5 },
      { numerator: 1, denominator: 5 },
    ],
    answerNumerator: 3,
    answerDenominator: 5,
    answerShapes: 1,
  },
  {
    id: 12,
    operation: '-',
    shape: 'pizza',
    operands: [
      { numerator: 3, denominator: 5 },
      { numerator: 2, denominator: 5 },
    ],
    answerNumerator: 1,
    answerDenominator: 5,
    answerShapes: 1,
  },
  {
    id: 13,
    operation: '-',
    shape: 'pizza',
    operands: [
      { numerator: 5, denominator: 5 },
      { numerator: 3, denominator: 5 },
    ],
    answerNumerator: 2,
    answerDenominator: 5,
    answerShapes: 1,
  },

  // ── Resta de chocolate en octavos (3) ──
  {
    id: 14,
    operation: '-',
    shape: 'chocolate',
    operands: [
      { numerator: 7, denominator: 8 },
      { numerator: 3, denominator: 8 },
    ],
    answerNumerator: 4,
    answerDenominator: 8,
    answerShapes: 1,
  },
  {
    id: 15,
    operation: '-',
    shape: 'chocolate',
    operands: [
      { numerator: 6, denominator: 8 },
      { numerator: 1, denominator: 8 },
    ],
    answerNumerator: 5,
    answerDenominator: 8,
    answerShapes: 1,
  },
  {
    id: 16,
    operation: '-',
    shape: 'chocolate',
    operands: [
      { numerator: 5, denominator: 8 },
      { numerator: 4, denominator: 8 },
    ],
    answerNumerator: 1,
    answerDenominator: 8,
    answerShapes: 1,
  },
]

// Denominadores soportados por forma (limitados para que se vean bien en pantalla)
const DENOMS_BY_SHAPE = {
  pizza: [3, 4, 5, 6, 8],
  chocolate: [4, 6, 8],
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function sameOperands(a, b) {
  if (!a || !b) return false
  if (a.shape !== b.shape) return false
  if (a.operands[0].denominator !== b.operands[0].denominator) return false
  return (
    a.operands[0].numerator === b.operands[0].numerator &&
    a.operands[1].numerator === b.operands[1].numerator
  )
}

function buildSuma(id) {
  const shape = pick(['pizza', 'chocolate'])
  const denominator = pick(DENOMS_BY_SHAPE[shape])
  const n1 = randInt(1, denominator)
  const n2 = randInt(1, denominator)
  const sum = n1 + n2
  return {
    id,
    operation: '+',
    shape,
    operands: [
      { numerator: n1, denominator },
      { numerator: n2, denominator },
    ],
    answerNumerator: sum,
    answerDenominator: denominator,
    answerShapes: Math.ceil(sum / denominator),
  }
}

function buildResta(id) {
  const shape = pick(['pizza', 'chocolate'])
  const denominator = pick(DENOMS_BY_SHAPE[shape])
  const n1 = randInt(2, denominator)
  const n2 = randInt(1, n1 - 1)
  return {
    id,
    operation: '-',
    shape,
    operands: [
      { numerator: n1, denominator },
      { numerator: n2, denominator },
    ],
    answerNumerator: n1 - n2,
    answerDenominator: denominator,
    answerShapes: 1,
  }
}

export function generateExercise(operation, id, previous = null) {
  const builder = operation === '-' ? buildResta : buildSuma
  let candidate = builder(id)
  for (let i = 0; i < 5 && sameOperands(candidate, previous); i++) {
    candidate = builder(id)
  }
  return candidate
}
