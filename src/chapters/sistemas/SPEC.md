# Capítulo Sistemas de Ecuaciones · Spec

Documento de referencia para agentes futuros que vengan a iterar este capítulo.
Sigue la convención del SPEC del capítulo `ecuaciones`. Refleja el estado actual
del código; para el detalle exacto, leer la implementación.

## Visión

Capítulo para alumnos de **3er año**. Enseña a resolver sistemas de dos
ecuaciones lineales con dos incógnitas por **sustitución**, **gráfico** (solo
explicativo) y **eliminación** (matricial / cañonazos). Cierra con un módulo de
**elección de método**.

Metáfora: **búsqueda del tesoro pirata**. El menú es un mapa con 4 islas; cada
isla es un módulo. Un pirata con un loro al hombro es la mascota que acompaña
al alumno y habla en bocadillos con tono adolescente moderno ("aura", "rizz",
"skibidi", "sigma", "no cap", "fr fr"). Las recompensas son **monedas de oro**
que se acumulan y se persisten por nivel.

## Arquitectura técnica

- **Carpeta**: `src/chapters/sistemas/` (paralelo a `ecuaciones/`).
- **Reutiliza** del capítulo de ecuaciones: aritmética de fracciones del motor
  (`F`, `addF`, `subF`, `mulF`, `divF`, `negF`, `eqF`, `isInt`, `isZero`,
  `isOne`, `isNeg`) y el motor completo de despeje (`applyOperation`,
  `getOptions`, `isProgress`, `isSolved`, `getSolution`, `formatSide`,
  `formatOp`). Importamos desde `../ecuaciones/`.
- **Sin dependencias nuevas.** El módulo gráfico está hecho con **SVG inline**
  (no se usó Mafs para no agregar peso al bundle).
- **Animaciones**: CSS keyframes puras en `src/index.css` (`coin-pop`,
  `combo-pop`, `chest-glow`, `cannon-fire`, `cannon-shake`, `ship-sail`,
  `star-twinkle`, `recta-aparece`, además de las heredadas de ecuaciones).
- **Rutas** (en `src/App.jsx`):
  - `/sistemas` — menú-mapa
  - `/sistemas/sustitucion/nivel-1|2|3`
  - `/sistemas/grafico`
  - `/sistemas/eliminacion/nivel-1|2|3`
  - `/sistemas/elegir`

## Modelo de estado

```js
// Una ecuación lineal con dos variables.
Ecuacion = { a: Frac, b: Frac, c: Frac }   // a·X + b·Y = c

// Un sistema completo (los generadores incluyen también la solución exacta).
Sistema = { eq1: Ecuacion, eq2: Ecuacion, xSol: Frac, ySol: Frac, ... }
```

Para reusar el motor de ecuaciones (que sabe trabajar con una sola variable X),
después de despejar y sustituir convertimos la ecuación resultante al formato
del motor: `state = { left: {a, b}, right: {a, b} }`. Esto se hace en `Sustitucion.jsx::estadoMotor()`.

## Archivos

- `SistemaEngine.js` — generadores, `solveSystem` (Cramer), `sustituirY/X`,
  `mulEq`, `addEq`. Re-exporta los helpers de fracciones.
- `SistemaRender.jsx` — componentes y funciones de tokens para renderizar
  ecuaciones, despejadas y sustituciones (`ecuacionTokens`, `despejadaTokens`,
  `aXbcTokens`, `sustitucionTokens`, `TokensGrandes`, `Ecuacion`, `Despejada`).
- `DespejeBiVar.jsx` — motor de despeje con dos variables. Estado interno
  `{ aL, bL, cL, aR, bR, cR }` representando `aL·X + bL·Y + cL = aR·X + bR·Y + cR`.
  Opera con `subX/addX/subY/addY/sub/add/mul/div`. Calcula la op correcta y dos
  distractores plausibles. Usa `useRef` para que `onSolved` se dispare una sola
  vez (strict mode).
- `MiniDespeje.jsx` — reusa el motor de ecuaciones para despejar la única
  variable que queda tras sustituir. Acepta prop `varName` y reemplaza la `X`
  hardcodeada del motor por la variable real (X o Y) en los tokens renderizados.
- `FracInput.jsx` — input que parsea `"5"`, `"-3"`, `"3/4"`, `"-3/4"` →
  `Frac`. Función `parseFrac` exportada.
- `Sustitucion.jsx` — máquina de estados completa del módulo de sustitución.
- `Eliminacion.jsx` — máquina de estados del módulo de eliminación.
- `Grafico.jsx` — 3 pantallas SVG con auto-escala y numeración en ejes.
- `ElegirMetodo.jsx` — 8 sistemas con elección método + razón.
- `PirataDialogo.jsx` — tutorial modal con poses del pirata (`neutral`,
  `hablando`, `pensando`, `festejando`, `triste`) + componente
  `<PirataBocadillo>` reusable.
- `SistemaLayout.jsx` — layout compartido (header, monedas, mensajes del loro
  con botón "Andá a freír churros" para cerrar).
- `SistemasMenu.jsx` — mapa-menú con las 4 islas siempre desbloqueadas.
- `MonedasContador.jsx`, `Cofre.jsx`, `useMonedas.js`, `monedasStorage.js` —
  sistema de monedas con combo `x1→x3`, persistencia por nivel en `localStorage`.

## Sistema de monedas y combo

- Cada acierto suma `baseReward * combo` (base = 10 en sustitución/eliminación,
  15 en elegir-método, 5 en gráfico).
- Combo se incrementa con cada acierto hasta `x3` (capped) y se resetea con
  un error.
- Al terminar un nivel: `guardarProgreso()` persiste el total de monedas del
  ejercicio en `localStorage` bajo `sistemas.monedas[<nivel-id>]` (sólo si es
  mejor que el anterior guardado).
- El menú-mapa muestra el total acumulado en el cofre.
- **No hay sistema de "deshacer"** activo aún en sistemas (la prop `onUndo` del
  layout existe pero ningún módulo la usa).

## Mascota y tono

El loro habla con slang adolescente moderno. Ejemplos del castellano (los
strings completos están en `src/i18n/translations.js`):

- Victoria: "Aura máxima fr fr 🔥 te llevaste el tesoro. Sigma move 🏴‍☠️"
- Acierto despeje: "W jugada, variable despejada. Imparable 💯"
- Acierto distributiva: "Distributiva resuelta como un sigma 💪"
- Casi: "Skibidi, ese despeje no checkea. Probá de nuevo."
- Esa no: "Esa no, fue un L. Volvé a probar."
- Boom cañón: "¡BOOM! 💥 La variable se fue, pura aura."
- Falta campos: "Eh capo, te falta llenar algún campo. Mid pero arreglable."
- Bienvenida menú: "¡Eh capo! Bienvenido al mapa. Tirate a cualquier isla, todas
  están open 🗺️"

Mismo registro en inglés (`Yo cap`, `fr fr`, `slay`, `bet`, `mid`, `L`, `W`,
`sigma`, `aura`, etc.).

**Respuestas random.** Las claves de feedback de acierto/fail (`bienDespeje`,
`casiDespeje`, `bienForma`, `casiForma`, `bienDistributiva`, `casiDistributiva`,
`sustitucionLista`, `ahoraOtra`, `casiOtra`, `bienMultUna`, `bienMultDos`,
`multNoCancela`, `boomCanon`, `casiSuma`, `faltanCampos`) son **arrays de
strings** en `src/i18n/translations.js`. En `Sustitucion.jsx` y `Eliminacion.jsx`
hay un helper local `pick(v)` que elige una variante al azar si recibe un array,
o devuelve el string tal cual si recibe un string. Cada call site hace
`pick(t.sistemas.X)` para que el lorito no repita siempre lo mismo. Agregar
una nueva variante = sumar un string al array, sin tocar código.

**El loro nunca canta la solución.** Las pistas con `a=…, b=…, c=…` están
removidas para que los chicos no copien la respuesta.

**Los mensajes persisten hasta que el alumno los cierre** con el botón "Andá a
freír churros" (en inglés: "Go fry some donuts"). Esto reemplazó el auto-dismiss
con timeout.

## Módulos y niveles

### Módulo 1 · Sustitución (Isla del Despeje)

Reutiliza pesado el motor de ecuaciones. Tres niveles.

**Nivel 1.1 — "Una ya está despejada"** (`sus-1`)
Sistema con `Y = mX + n` ya despejada y otra ecuación normal.
Flujo (pasos):
1. `sustituir` — botón "Sustituir ahora". El alumno ve la sustitución hecha en
   forma cruda con paréntesis: `aX + b(mX + n) = c`.
2. `distributiva` — el alumno ingresa los dos valores que salen de distribuir
   (`b·m` y `b·n`). Se muestra: `aX + [_]·X + [_] = c`.
3. `ingresarForma` — el alumno ingresa `a, b, c` de la forma `a·X + b = c`
   (juntando términos similares).
4. `despejarX` — motor de ecuaciones existente (`MiniDespeje`). Opciones
   estilo Nivel 3 de ecuaciones.
5. `calcularY` — con `X` ya resuelta, recordatorio en pantalla:
   `Reemplazá en Y = -3X + 1 (X = -2)`. El alumno ingresa `Y`.
6. `done` — pantalla de "Tesoro encontrado" con `X = …, Y = …`, monedas y los
   3 botones (Otro ejercicio · Siguiente nivel · Volver al mapa).

**Nivel 1.2 — "Vos elegís"** (`sus-2`)
Ninguna ecuación viene despejada. Flujo:
0. `elegirDespeje` — 4 botones que muestran la ecuación completa, por ejemplo
   "Despejar X en `2X − 4Y = -20`", "Despejar Y en `2X − 4Y = -20`", etc. Esto
   reemplazó el formato anterior ("en 1 / en 2") que era confuso.
1. `despejarVariable` — usa `DespejeBiVar` con opciones paso a paso para
   despejar la variable elegida (mueve términos, divide, etc.).
2. `despejeCompleto` — pantalla de confirmación con "🎉 ¡Variable despejada!",
   la ecuación despejada grande en formato `varName = m·otraVar + n`, y botón
   "Continuar →" para avanzar. Esta pausa explícita evita que el alumno se
   pierda la celebración.
3. Resto idéntico a 1.1: sustituir → distributiva → ingresarForma → despejarX →
   calcularY → done.

**Nivel 1.3 — "Con fracciones"** (`sus-3`)
Igual a 1.2 pero los coeficientes son más sucios. Soluciones pueden ser
fraccionarias. El motor de despeje y los inputs aceptan fracciones (formato
`3/4` o `-3/4`).

### Módulo 2 · Gráfico (Isla del Vigía)

Sin "ganar/perder" tradicional, sólo monedas por avanzar. Tres pantallas.

**Pantalla 2.1 — "Una recta"** (`graf-1`)
El alumno ve `2X + Y = 6`, la despejada `Y = -2X + 6` y un botón "Graficar"
que dibuja la recta en SVG.

**Pantalla 2.2 — "Dos rectas, una intersección"**
Dos ecuaciones, dos rectas. Una estrella titilante marca la intersección.

**Pantalla 2.3 — Sandbox**
Inputs `a, b, c` para dos ecuaciones. Las rectas se actualizan en vivo.
Casos especiales: paralelas (sin solución), iguales (infinitas).

**Detalle gráfico (sin Mafs):**
- `calcularRango(intersec, rectas)` calcula un rango entero `>=5` que cubre
  la intersección y los extremos de las rectas. Ajusta `SCALE = 100/rango`.
- Numeración en ambos ejes en cada paso entero (paso adaptativo: 1 si rango
  ≤ 6, 2 si ≤ 12, sino `ceil(rango/6)`).
- ViewBox `-15 -15 230 230` con padding para que las etiquetas no se corten.
- `PlanoConRectas` calcula el rango común y se lo pasa a `Plano` y a cada
  `Recta` (para que el dibujo se alinee con la grilla).

### Módulo 3 · Eliminación (Isla del Cañón)

Tres niveles.

**Nivel 3.1 — "Sumar y listo"** (`eli-1`)
Sistema donde sumando directo se cancela una variable. Ej: `3X + 2Y = 7` y
`-3X + Y = 2`.
Flujo:
1. `ingresarSuma` — el alumno ingresa los coeficientes `a, b, c` de la suma.
   Si acierta, animación de cañonazo (`cannon-shake` + `cannon-fire`).
2. `despejarDirecto` — input simple para el valor de la variable que quedó
   (e.g. `Y = ?`). Se simplificó respecto al spec original: el motor de
   ecuaciones siempre muestra "X" y se confundía al alumno cuando la variable
   resultante era Y, así que pedimos directamente el valor.
3. `calcularOtra` — recordatorio explícito de la ecuación original en pantalla
   (`Reemplazá en 5X + 4Y = -2 (Y = 1)`), para que el alumno no tenga que
   buscarla. Input para la otra variable.
4. `done` — igual que sustitución.

**Nivel 3.2 — "Multiplicá una"** (`eli-2`)
Hay que multiplicar **una** ecuación por un entero k para cancelar al sumar.
- Paso `multUna` — el sistema arriba muestra la ecuación con un **preview en
  azul**: `(eq1) · k = (c) · k` con `k` en gris atenuado. Al tipear el número,
  pasa a ser `(eq1) · 3 = (c) · 3` en azul brillante.
- Si el k aplicado no cancela ninguna variable, **no** se modifica la ecuación
  (la ecuación original queda intacta y se muestra el mensaje del loro). El
  alumno puede seguir probando.
- Si el k cancela, la ecuación se aplica, se agrega al historial con el factor
  en azul (`eq original · k → eq resultante`) y se avanza a `ingresarSuma`.

**Nivel 3.3 — "Multiplicá las dos"** (`eli-3`)
Idem 3.2 pero ambas necesitan multiplicador. Casos del MCM (`2X+3Y` y `5X+4Y`).
Mismo preview en azul a ambas ecuaciones.

### Módulo 4 · Elegir el método (Isla del Tesoro)

8 sistemas. Para cada uno, dos botones con icono (Sustitución o Eliminación)
y luego una razón de una lista corta:
- "Porque una variable ya está despejada."
- "Porque sumando se cancela una variable."
- "Porque los coeficientes son chicos y multiplicar es fácil."
- "Porque hay un coeficiente que vale 1 (despejar es directo)."

Calificación:
- **Método correcto + razón correcta** → "¡Excelente elección! 🎯" + monedas
- **Método correcto + razón equivocada** → "Servía, pero había otra razón
  mejor."
- **Método equivocado** → "Ese método se complica acá. Mirá los coeficientes!"

## Mapa-menú

`SistemasMenu.jsx`. Pantalla:
- Fondo: pergamino estilo mapa pirata (`mapa-fondo.jpg`).
- 4 islas dispuestas a lo largo de un camino punteado SVG inline.
- Barco pirata como marcador "vos estás acá", se posiciona en la última isla
  completada + 1 (animación `ship-sail`).
- Cofre del tesoro abajo, abierto cuando se completaron las 4 islas, con el
  contador total.
- **Todas las islas están siempre desbloqueadas**: el alumno puede saltearlas y
  hacer el orden que quiera. Cada isla muestra su progreso (`3/3 ⭐`, `1/3 ⭐`,
  etc.).

## Tutorial: pirata hablando

`PirataDialogo.jsx`:
- Pirata grande arriba a la izquierda del modal, bocadillo con texto al lado.
- Texto con sintaxis `**bold mono**` que se parsea como `<span>` con fuente
  monoespaciada en color ámbar.
- Indicadores de paso (dots), botón Atrás/Siguiente, y "¡A navegar!" en la
  última slide.
- Cada slide puede llevar `pose: 'neutral' | 'hablando' | 'pensando' | 'festejando' | 'triste'`.

El mismo módulo exporta `<PirataBocadillo>` para mensajes inline (usado en el
menú-mapa y en los mensajes durante el juego).

## Historial de pasos ("Tus pasos")

Tanto en sustitución como en eliminación, abajo del área activa hay un panel
"Tus pasos" que va acumulando lo que el alumno hizo. Cada entrada tiene un
label en mayúsculas + el contenido renderizado:

**Sustitución:**
- `SISTEMA ORIGINAL` — las dos ecuaciones del sistema (o la despejada + la otra
  en nivel 1.1).
- `DESPEJASTE` — la forma despejada (`X = -3/4·Y - 11/4`).
- `SUSTITUISTE` — la sustitución cruda con paréntesis (`-2Y + 4(-3/4·Y - 11/4) = -6`).
- `DISTRIBUISTE` — la ecuación con la distributiva ya resuelta
  (`-2Y - 3Y - 11 = -6`).
- `QUEDÓ` — la ecuación en forma `a·var + b = c` (`-5Y - 11 = -6`).
- `X =`, `Y =` — los valores encontrados.

**Eliminación:**
- `SISTEMA ORIGINAL` — las dos ecuaciones.
- `MULTIPLICASTE EQ1` / `EQ2` — ecuación original `× k` (en azul) → ecuación
  resultante.
- `SUMASTE` — la ecuación que queda al sumar.
- `X =`, `Y =` — los valores finales.

## Layout: header y mensajes

`SistemaLayout.jsx`:
- En el header (en flujo, no fixed) van: `← Volver` + `¿Cómo se juega?` (que
  reabre el tutorial) + opcional botón Deshacer + `MonedasContador`.
- El `LanguageSwitcher` global está fixed top-right; el header del layout
  reserva `pr-24` para no chocarse con él.
- Los mensajes del loro aparecen en el bocadillo fixed bottom-left. Cada
  mensaje tiene un botón "Andá a freír churros" que llama a `onCloseMensaje`
  para cerrarlo. No hay auto-dismiss.

## i18n

Todo en `src/i18n/translations.js`, bajo `t.sistemas`. Mismas claves en ES y EN.
Estructura:
- Strings de UI (`pickIsland`, `tutorialBack`, `verificar`, etc.).
- Mensajes del loro (con slang).
- Array `menu` con las 4 tarjetas/islas.
- Por módulo: `{ title, slides: [...] }` + strings específicos.
- `juntaTerminos: (v) => …` es una función para que el subtítulo use la
  variable correcta (X o Y según el caso).

## Convenciones del proyecto (heredadas)

- Stack: React 19, React Router 7, Tailwind 4, Vite 8.
- **Sin nuevas dependencias.**
- Animaciones: CSS keyframes puras (no Framer Motion).
- Estado de ejercicio: local al componente. Progreso de monedas/niveles:
  `localStorage`.
- Idioma del código y comentarios: castellano informal rioplatense.

## Cambios respecto al spec original (no exhaustivo)

- **Mafs descartada** — se usó SVG inline. El gráfico es más simple pero
  cumple con los objetivos pedagógicos. Auto-escala y numeración en ejes son
  más útiles que la sofisticación de Mafs.
- **Despeje en eliminación con input directo** — el motor de ecuaciones siempre
  muestra "X" y se confundía cuando la variable resultante era Y. Se pide
  directamente el valor (`Y = ?`) en vez de usar el motor para un único paso
  trivial.
- **Mini-rebrand de variable en MiniDespeje** — para que cuando el motor de
  ecuaciones se use con una ecuación en Y (típico tras despejar X en sustitución),
  los tokens muestren Y en vez de X. Se hace post-procesando los tokens y
  reemplazando 'X' por el `varName` recibido por prop.
- **Pausa "Variable despejada"** — pantalla de confirmación tras completar el
  despeje en `DespejeBiVar`, con botón "Continuar →". Sin esta pausa el alumno
  no veía la celebración.
- **Paso "Resolvé la distributiva"** intermedio entre `sustituir` e
  `ingresarForma`. Divide la dificultad: primero distribuir, después juntar.
- **Preview de × k en azul a ambos lados del igual** — `(eq1) · k = (c) · k`
  con `k` en gris si no hay valor, en azul si sí. La ecuación NO se modifica si
  el k no cancela.
- **Islas siempre desbloqueadas** — quité el sistema de desbloqueo progresivo
  para no obligar a un orden.
- **Loro persistente con botón de cerrar** — los mensajes no tienen auto-dismiss
  para que el alumno pueda leerlos sin apuro.
- **Loro nunca da la solución** — quité las "pistas" que mostraban la respuesta
  numérica.
- **Tono slang del loro** — "aura", "rizz", "skibidi", "sigma", "no cap",
  "fr fr", "W jugada", "L", "mid", etc.

## Notas de implementación

- **StrictMode + onSolved doble disparo**: `MiniDespeje` y `DespejeBiVar` usan
  `useEffect` + `useRef` para guardar un flag de "ya disparé" y evitar que
  `onSolved` se llame dos veces en strict mode. Sin esto, las entradas del
  historial se duplicaban.
- **Centrado de ecuaciones grandes**: `TokensGrandes` envuelve su contenido en
  un `<div className="flex justify-center w-full">` exterior + un
  `inline-flex flex-wrap items-center gap-2 justify-center` interior. Atención
  con wrappers tipo `animate-resolve-pulse` que tienen `display: inline-block`
  — pueden romper el centrado si están afuera de un flex. Patrón seguro:
  ```jsx
  <div className="flex justify-center">
    <div className="animate-resolve-pulse">
      <TokensGrandes … />
    </div>
  </div>
  ```
- **Validación de sistemas equivalentes**: el generador `generateSustitucion1`
  filtra explícitamente los casos donde la segunda ecuación es un múltiplo de
  la primera (infinitas soluciones), con el check `a2 === -m * b2`.
