# Capítulo Ecuaciones · Spec

Documento de contexto para agentes futuros que vengan a iterar este capítulo.
No es exhaustivo: para el detalle, leer el código.

## Idea pedagógica

El capítulo enseña a despejar X en ecuaciones lineales. La metáfora central es
**"desplumar a la X"**: cada operación que aplica el alumno le saca una pluma a
una gallina. Más que una metáfora cosmética, es un loop de juego: aciertos →
plumas vuelan → al final la gallina queda pelada y huyendo.

El énfasis está en que el alumno **ve la operación que elige y ve cómo cambia
la expresión**, paso a paso. No se "verifica al final" como en Fracciones — acá
cada movimiento muta el estado en pantalla. Equivocarse es válido (no hay
penalización dura), porque ver la expresión ponerse fea es pedagógicamente
útil. Sí se rompe la racha 🔥 al equivocarse.

Y si te equivocaste y querés volver atrás, podés **deshacer** (te cuesta 4 🔥
si tenés racha, gratis si no).

## Niveles

| Nivel | Forma                          | Ejemplo                | Foco                                   |
|-------|--------------------------------|------------------------|----------------------------------------|
| 1     | `aX + b`                       | `9X + 7`               | Aislar X (1 columna)                   |
| 2     | `aX + b = 0`                   | `5X + 5 = 0`           | Mismo movimiento a ambos lados (2 col) |
| 3     | `aX + b = cX + d`              | `5X + 1 = X + 21`      | Mover X + resolver (2 col)             |
| 4     | Mezcla con negativos           | `−3X + 5 = 0`, `2X − 4 = −X + 1` | Negativos + soluciones fraccionarias |
| 5     | Igual que 4 pero **input libre** | idem                  | Vos ingresás la operación              |

**Nivel 4**: los primeros 3 ejercicios son `aX+b=0`, después `aX+b=cX+d`. El
contador de ejercicios vive en `EcuacionGame` (`exerciseIndexRef`) y se pasa
al generator (`generator(idx)`). La solución puede ser fraccionaria (X = 3/4).

**Nivel 5**: misma estructura de ecuaciones que nivel 4 pero el alumno no
recibe opciones — ingresa la operación con botones de tipo + input numérico.
Ver sección "Nivel 5 · Input libre" abajo.

## Modelo de estado

```js
Frac  = { n: int, d: int }                  // siempre simplificada, d > 0
side  = { a: Frac, b: Frac }                // representa  aX + b
state = { left: side, right: side | null }
op    = { type: 'add'|'sub'|'mul'|'div'|'addX'|'subX', value: int|Frac }
```

`right === null` solo en Nivel 1 (no hay igualdad).

Todos los coeficientes son `Frac` siempre (incluso cuando son enteros, internamente
son `{n: k, d: 1}`). Esto da exactitud — no aparecen decimales bizarros nunca.

**Operaciones disponibles**:
- `add k` / `sub k` → suma/resta una constante
- `mul k` / `div k` → multiplica/divide ambos términos
- `addX k` / `subX k` → modifica solo el coeficiente de X

`applyOperation(state, op)` aplica la op al lado izquierdo y, si hay derecho,
también al derecho. `op.value` puede ser `int` (común) o `Frac` (poco común,
para casos donde la op correcta requiere multiplicar por una fracción).

### Normalización (importante)

Cuando un coeficiente se vuelve negativo, **nunca emitimos ops con valor
negativo** porque generaba labels feos como `−−3X`. La función `normalizeOp`
flipea automáticamente: `subX(-3)` → `addX(3)`, `sub(-5)` → `add(5)`. Se aplica
en `correctOp` antes de devolver. Si tocás `correctOp` o agregás generadores de
ops, mantené esa invariante.

### `stepsRemaining(state)`

Devuelve cuántos pasos faltan para resolver:
- `R.a !== 0` cuenta 1 (mover X)
- `L.b !== 0` cuenta 1 (mover constante)
- `L.a !== 1` cuenta 1 (dividir)

Se usa para elegir qué imagen de gallina mostrar.

## Distractores (filosofía: "no malvados")

`distractorPool(state)` devuelve operaciones candidatas a ser ofrecidas como
distractores junto a la correcta. **Filtros que aplicamos para no martirizar
al alumno**:

1. **Nada de `mul:k`** en el pool. Multiplicar como distractor agranda los
   números y no aporta pedagógicamente.
2. **`div:k` sólo si divide enteramente** todos los coeficientes del estado
   actual. Es decir, sólo se ofrece dividir si el resultado mantiene enteros.
3. Si el estado **ya tiene fracciones** (porque venimos de un mal movimiento
   en niveles 4/5), el filtro se relaja — no podemos hacerlo peor.

Esto se implementa con `opPreservesIntegers(state, op)` al final de `distractorPool`.
Si tocás esto, validá manualmente que los niveles 1-3 nunca exhiban un
distractor que produzca una fracción.

## Mapa de archivos

```
src/chapters/ecuaciones/
├── EcuacionEngine.js     Lógica pura: aritmética de Frac, generadores 1-5,
│                         applyOp, correctOp, getOptions, isSolved,
│                         stepsRemaining, formatSide/formatOp (tokens),
│                         normalizeOp, distractorPool.
├── EcuacionRender.jsx    Componentes de render visuales:
│                         - FracDisplay (barra horizontal apilada)
│                         - TokenList (renderiza array de tokens)
│                         - ExpressionDisplay (state + pendingOp en azul)
│                         - OptionButton (botón con tokens dentro)
├── EcuacionGame.jsx      Niveles 1-4: opciones + columnas + UndoButton.
├── EcuacionGameFree.jsx  Nivel 5: input libre (tipo + número) con preview azul.
├── EcuacionesMenu.jsx    Menú de 5 tarjetas (todos habilitados).
├── Nivel1.jsx … Nivel5.jsx  Wrappers que pasan generator + slides.
├── Tutorial.jsx          Overlay de slides paso-a-paso (sintaxis **bold-mono**).
├── Chicken.jsx           Imagen apropiada según stepsLeft + plumas que vuelan.
└── SPEC.md               Este archivo.

src/assets/ecuaciones/
├── gallochad.png         3+ pasos restantes
├── gallocompleto.png     2 pasos restantes
├── gallinadesplumada.png 1 paso restante
├── gallocorriendo.png    Victoria
└── pluma.svg             Vector blanco con outline gris.
```

Rutas (en `src/App.jsx`): `/ecuaciones`, `/ecuaciones/nivel-1|2|3|4|5`.

## Render de fracciones

`formatSide` y `formatOp` devuelven **arrays de tokens** en lugar de strings:

```js
token = { kind: 'text', s: string }
      | { kind: 'frac', n: int, d: int, sign: '+' | '−' | null }
```

`TokenList` (en `EcuacionRender.jsx`) los renderiza, dibujando las fracciones
con `FracDisplay` (numerador, `border-b`, denominador apilado verticalmente).
Esto evita inventar HTML en strings y mantiene el render limpio para enteros
**y** para fracciones.

## Deshacer

En `EcuacionGame` y `EcuacionGameFree`:

- Estado `history`: array de `{state, errorThisExercise}`. Push antes de cada
  `applyOperation`.
- `UndoButton` (exportado desde `EcuacionGame.jsx` y reutilizado por
  `EcuacionGameFree`) habilitado si `history.length > 0` y no hay
  `pendingOp`/animación corriendo.
- Click → pop del último, restaura state + errorThisExercise.
- Coste: `Math.max(0, streak - UNDO_COST)`. `UNDO_COST = 4`.
  Si tu racha era ≥4 te resta 4. Si era <4 caes a 0 (gratis efectivo, no penaliza más).
- `nextExercise` resetea `history`.
- Deshacer **no** restaura una racha ya rota.

## Nivel 5 · Input libre

`EcuacionGameFree.jsx`. UI:

```
[+X] [-X] [+] [-] [×] [÷]   [input num]
        ↓ preview en vivo ↓
   Expresión con paréntesis azules
   y la op a ambos lados (oculto si no hay op)
   [Cambiar]   [Aplicar →]
```

**Estado del input**:
- `opType` (uno de `addX|subX|add|sub|mul|div`) — radio entre los 6 botones.
- `opValueStr` (string del input, sólo dígitos).

**Preview**: si `opType` está seteado y `opValueStr` parsea a entero ≥1, el
componente arma `previewOp = { type, value }` y se lo pasa a `ExpressionDisplay`
como `pendingOp`. La expresión se ve "bloqueada" en preview (azul).

- **Cambiar**: limpia tipo + número, oculta preview.
- **Aplicar**: dispara `scheduleApply` (igual que en `EcuacionGame`), corre la
  animación de paréntesis durante `APPLY_DELAY_MS`, después muta el estado.
  Compara con `correctOp(state)` para racha/error/feathers. El input se
  limpia tras aplicar.

## Animación

### Plumas por acierto
- 18 plumas por respuesta correcta (`FEATHERS_PER_HIT` en Chicken.jsx).
- Tamaños 36–64 px, posiciones random alrededor de la gallina.
- Animación CSS `feather-fall` (1.6–2.6s), translate 240px + rotate.

### Lluvia de victoria
- 80 plumas con `position: fixed inset-0`, `z-40`.
- Caen 110vh con `feather-fall-screen` (2.5–5s), delays escalonados (0–1.4s).

### Aplicación de operación
- Tras un click correcto (o tras Aplicar en nivel 5), hay `APPLY_DELAY_MS`
  (2000ms) durante los cuales se muestra la operación elegida con paréntesis
  azules + op antes de mutar el estado.
- Keyframes en `src/index.css`: `paren-pop`, `op-slide-in`, `resolve-pulse`,
  `vibrate`, `victory-bounce`, `feather-fall`, `feather-fall-screen`.

## i18n

Todo el capítulo está bajo `t.ecuaciones` en `src/i18n/translations.js`, en
ES y EN. Incluye:
- Strings de UI (botones, warnings, mensajes de victoria, deshacer, input libre).
- Array `menu` con las 5 tarjetas (id, title, subtitle, desc).
- `level1/2/3/4/5` con `{ title, slides: [{ title, body }] }`.
- Slides usan markers `**texto**` que `Tutorial.jsx` renderiza como mono-bold.

## Convenciones del proyecto

- Stack: React 19, React Router 7, Tailwind 4, Vite 8 (sin librerías extra).
- Animaciones: CSS keyframes puras (no Framer Motion).
- Estado de ejercicio: local al componente, no se persiste entre ejercicios.
- Idioma del código y comentarios: castellano informal rioplatense.
