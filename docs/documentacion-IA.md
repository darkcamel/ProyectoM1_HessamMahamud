# Documentación IA proyecto M1

## 1. Fórmula HSL a HEX

### 1.1 Primer Prompt

como verás esta fórmula la saque de internet, y la tengo en este archivo script.js que estoy enviando. Tengo que generar una paleta de colore aleatoreos, no entiendo bien como hacerlo todavía, tienen que pasar de HSL a HEX. Por favor explica detalladamente ya que soy principiante. Te envio también la consigna del ejercicio que debo realizar para que veas porque necesito este código.

#### 1.1.1 Output

##### 1.1.1.1 Crear `hslAHex()` — convertir HSL a HEX

Tu código ya genera `h`, `s`, `l` (matiz, saturación, luminosidad), pero el navegador entiende directamente `hsl(...)` como color CSS — el problema es que la consigna pide mostrar el código en **HEX**, no en HSL. Entonces necesitamos matemática para convertir.

El camino más entendible (y el que verás en la documentación de MDN) es: **HSL → RGB → HEX**. Son dos conversiones encadenadas:

```js
//=< HSL a RGB >==
function hslARgb(h, s, l) {
    // 1) normalizamos todo a rango 0-1.
    // ¿Por qué? porque las fórmulas de conversión están pensadas
    // en términos de proporciones (0 a 1), no en grados ni porcentajes.
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;

    if (s === 0) {
        // 2) caso especial: si no hay saturación, el color es un gris puro.
        // gris = mismo valor en los 3 canales (r=g=b), y ese valor es la luminosidad.
        r = g = b = l;
    } else {
        // 3) función auxiliar: dado un "punto" (p), un "techo" (q) y una posición
        // relativa del matiz (t), devuelve la intensidad de UN canal de color.
        // La idea: el círculo de matices (0-360°) se puede "desplegar" en 3 franjas
        // de 1/3 cada una para R, G y B, y esta función interpola entre p y q
        // según en qué franja cae "t".
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;      // normalizamos t para que quede en 0-1
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        // 4) q y p son los límites "techo" y "piso" de brillo según la luminosidad.
        // Si l < 0.5, el color es más oscuro que medio-gris, entonces q = l * (1 + s).
        // Si l >= 0.5, el color es más claro, entonces q = l + s - l*s.
        // p siempre es el "espejo" de q respecto al centro (l).
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        // 5) llamamos a hue2rgb tres veces, desplazando "t" en +1/3 y -1/3
        // porque R, G y B están separados 120° (=1/3 del círculo) entre sí.
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    // 6) Math.round: los canales RGB son enteros de 0 a 255, no decimales.
    // multiplicamos por 255 porque hasta acá todo estaba en escala 0-1.
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

//=< RGB a HEX >==
function rgbAHex(r, g, b) {
    // toString(16) convierte un número decimal a su representación en base 16 (hexadecimal).
    // padStart(2, '0') asegura que siempre tenga 2 dígitos: si el número es "f" (15),
    // sin esto quedaría "#f0a" en vez de "#0f0a", rompiendo el formato de color.
    const aHex = (canal) => canal.toString(16).padStart(2, '0');
    return `#${aHex(r)}${aHex(g)}${aHex(b)}`;
}

//=< función que ya tenías la llama, ahora sí existe >==
function hslAHex(h, s, l) {
    const [r, g, b] = hslARgb(h, s, l);
    return rgbAHex(r, g, b);
}
```

**Por qué se separa en dos funciones (`hslARgb` y `rgbAHex`) en vez de una sola:** cada función hace una sola cosa (principio de responsabilidad única, que la guía también menciona: "separa la lógica en funciones pequeñas"). Además `rgbAHex` te puede servir después si en algún punto generás colores directamente en RGB.

##### 1.1.1.2 Usar el color real en el render

Ahora hay que modificar `renderizaPaletaVacia` para que en vez de poner texto fijo, use `generarColorAleatorio()` y pinte cada tarjeta:

```js
function renderizarPaleta(tamano) {
    contenedorPaleta.innerHTML = '';

    for (let i = 0; i < tamano; i++) {
        // generamos un color distinto en cada vuelta del for
        const color = generarColorAleatorio(); // devuelve { hsl, hex }

        const tarjetaColor = document.createElement('div');
        tarjetaColor.classList.add('color-paleta');

        // el color es DINÁMICO (cambia en cada click), por eso va como estilo
        // inline y no como clase CSS -> no podríamos anticipar en el .css
        // qué color le toca a cada tarjeta.
        tarjetaColor.style.backgroundColor = color.hsl;

        const textoHex = document.createElement('span');
        textoHex.textContent = color.hex.toUpperCase();
        // toUpperCase() es solo estético: "#a3f1c2" vs "#A3F1C2", más legible.

        tarjetaColor.appendChild(textoHex);
        contenedorPaleta.appendChild(tarjetaColor);
    }
}
```

Y actualizamos el listener para que llame a este nombre nuevo:

```js
generarBoton.addEventListener('click', () => {
    const tamano = parseInt(selectorTamano.value, 10);
    renderizarPaleta(tamano);
});
```

Renombré `renderizaPaletaVacia` → `renderizarPaleta` porque ya no genera una paleta "vacía" — el nombre viejo iba a confundirte a vos mismo en unos días. Detalle chico pero de las cosas que la guía pide: "código legible y bien organizado".

**Una cosa a decidir vos:** el texto del HEX ahora mismo va con `color: currentColor` heredado del `<p>` global, que puede tener mal contraste sobre fondos random (por ejemplo HEX oscuro escrito con letra oscura sobre fondo oscuro). Esto rompe el requisito de accesibilidad de "contraste suficiente" — lo resolvemos en el Día 2 (mañana), calculando si el texto debe ir claro u oscuro según la luminosidad del color de fondo.

¿Probás este cambio ahora en tu entorno y me contás si el render pinta bien los colores, o preferís que sigamos ya mismo con el contraste del texto antes de que lo pruebes?

### 1.2 Segundo Prompt

soy muy principiante en programación, no entiendo todavía conceptos como normalización etc. Así que necesito que seas hiper explícito con las explicaciones de cada línea de código. Te pido que vuelvas a mandarme una explicación muy detallada de que se hace en cada parte.

#### 1.2.1 Response

Totalmente entendible, y me parece bien que lo digas — así explico mejor y no doy nada por sentado. Vamos a ir muy despacio, con un ejemplo numérico real que vamos a seguir de punta a punta, para que veas los números moverse en cada línea.

##### 1.2.1.1 Antes que nada: ¿qué son HSL, RGB y HEX?

Son **tres formas distintas de describir el mismo color** — como decir tu edad en años, o en meses, o en días: es el mismo dato, escrito distinto.

- **HSL** = Matiz (Hue), Saturación (Saturation), Luminosidad (Lightness). Es la forma "humana" de pensar un color: "un azul (matiz), bastante intenso (saturación), ni claro ni oscuro (luminosidad)".
- **RGB** = Rojo, Verde, Azul (Red, Green, Blue). Cada color de pantalla se arma mezclando cantidades de luz roja, verde y azul, cada una de 0 a 255 (256 niveles posibles, porque las pantallas guardan cada canal en 8 bits).
- **HEX** = lo mismo que RGB, pero escrito en base 16 en vez de base 10, con el formato `#rrggbb`. Es solo una "traducción" de escritura, no un color distinto.

Tu función tiene que ir HSL → RGB → HEX porque no existe una fórmula directa de HSL a HEX: HEX **es** RGB, solo que escrito distinto. Por eso tenés que pasar por RGB en el medio, sí o sí.

##### 1.2.1.2 ¿Qué significa "normalizar"?

Es la palabra que usé y que te generó dudas, vamos a matarla de una vez. **Normalizar = llevar un número a una escala de 0 a 1**, para que las fórmulas matemáticas funcionen sin importar en qué unidad original venía el dato.

Pensalo así: si te pregunto "¿qué porcentaje de la barra de vida te queda en un videojuego?", da igual si la barra mide 100 puntos o 360 puntos — vos siempre podés decir "me queda el 70%", que es un número entre 0 y 1 (0.70). Eso es normalizar: sacarle la unidad original y dejarlo como una *proporción*.

En tu caso:
- `h` viene en grados (0 a 360, como los grados de un círculo)
- `s` y `l` vienen en porcentaje (0 a 100)

Las fórmulas matemáticas de conversión de color (que alguien ya inventó y nosotros solo aplicamos) están escritas asumiendo que los tres valores están en escala 0-1. Por eso las tres primeras líneas de la función hacen exactamente eso:

```js
h /= 360;   // 200 grados -> 200/360 -> 0.5556 (55.56% de la vuelta completa del círculo)
s /= 100;   // 65%        -> 65/100  -> 0.65
l /= 100;   // 55%        -> 55/100  -> 0.55
```

`/=` es un atajo: `h /= 360` es exactamente lo mismo que escribir `h = h / 360`. Solo ahorra tipeo.

Vamos a seguir **este ejemplo concreto** (`h=200, s=65, l=55`) durante toda la explicación, para que veas los números reales moverse.

##### 1.2.1.3 `hslARgb`: recorrido completo

```js
function hslARgb(h, s, l) {
    h /= 360;   // 0.5556
    s /= 100;   // 0.65
    l /= 100;   // 0.55

    let r, g, b;
```

Acá declaramos tres variables vacías (`r`, `g`, `b`) con `let` (no `const`, porque su valor todavía no existe — se lo vamos a asignar más abajo, adentro del `if`/`else`). Si usáramos `const` acá, JavaScript tiraría error, porque `const` obliga a asignar un valor en el mismo momento en que se declara la variable.

```js
    if (s === 0) {
        r = g = b = l;
    } else {
```

Esto es un **caso especial**: si la saturación es 0, el color no tiene "color" — es un gris puro (imaginate una tele en blanco y negro: solo hay brillo, sin matiz). En ese caso, no hace falta ninguna fórmula: los tres canales (r, g, b) valen exactamente lo mismo, que es la luminosidad. `r = g = b = l` es una asignación encadenada: primero le asigna `l` a `b`, después ese mismo valor a `g`, después a `r`. Como en nuestro ejemplo `s = 0.65` (no es 0), este `if` **no se ejecuta**, vamos directo al `else`.

```js
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
```

Esto es una **función adentro de otra función** (se llama función anidada). La creamos acá adentro porque solo la necesitamos en este contexto puntual, no tiene sentido que exista afuera, disponible para todo el archivo.

`(p, q, t) => {...}` es sintaxis de "arrow function" (función flecha) — una forma más corta de escribir una función. Es exactamente lo mismo que escribir `function hue2rgb(p, q, t) { ... }`, solo que más compacta.

¿Qué hace? Dado un matiz (representado acá como `t`, un valor de posición en el círculo de 0 a 1), calcula **cuánta intensidad le toca a un solo canal de color** (ya sea R, G o B, dependiendo desde dónde la llamemos). No sabe si está calculando rojo, verde o azul — simplemente calcula "intensidad según la posición t", y nosotros la vamos a llamar 3 veces con distintos valores de `t` para sacar los 3 canales.

Para explicarte por qué existen esos 4 casos (`if t<1/6`, `if t<1/2`, etc.), pensá en el círculo de colores dividido en 6 partes iguales (sextos), donde cada canal (R, G o B) sube, se mantiene arriba, y después baja, en distintos momentos del recorrido:Ese gráfico es exactamente lo que hace `hue2rgb`: es una función que sube, se aplana, baja, y se vuelve a aplanar — como una montaña con meseta. El eje horizontal es el valor `t` (posición del matiz, entre 0 y 1) y el eje vertical es la intensidad que le toca a ese canal (entre `p` y `q`, dos límites que calculamos antes).

Ahora, con nuestro ejemplo (`h=200, s=65, l=55`), ya normalizados: `h=0.5556, s=0.65, l=0.55`.

```js
const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
const p = 2 * l - q;
```

- `l < 0.5` pregunta: ¿el color es más oscuro que un gris medio? En nuestro caso `l=0.55`, que **no** es menor a 0.5 → entramos en la segunda opción del operador ternario (el `? :`, que es un `if/else` compacto: "si la condición es verdadera, usá el primer valor; si no, el segundo").
- Entonces `q = l + s - l*s = 0.55 + 0.65 - (0.55*0.65) = 1.2 - 0.3575 = 0.8425`
- `p = 2*l - q = 1.1 - 0.8425 = 0.2575`

`p` y `q` son el "piso" y el "techo" de brillo que puede alcanzar cada canal. Fijate en el gráfico: la curva siempre va entre esos dos valores, nunca los cruza.

```js
r = hue2rgb(p, q, h + 1 / 3);
g = hue2rgb(p, q, h);
b = hue2rgb(p, q, h - 1 / 3);
```

Acá está la parte más importante para entender **por qué** hay tres llamadas distintas: es la **misma función matemática** (la de la montaña), pero cada canal la mira desde un punto de partida distinto en el círculo de 0 a 1. Rojo, verde y azul están separados 120° entre sí en el círculo de color completo (360°), y como acá todo está normalizado a 0-1, 120° equivale a `1/3`. Por eso `r` usa `h + 1/3`, `g` usa `h` tal cual, y `b` usa `h - 1/3` — es desplazar el mismo dibujo hacia la izquierda o la derecha antes de leerlo.

Vamos línea por línea con los números:

**Para `g` (el más simple, `t = h = 0.5556`):**
```js
const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;   // 0.5556 no es menor a 0, no pasa nada
    if (t > 1) t -= 1;   // 0.5556 no es mayor a 1, no pasa nada
    if (t < 1 / 6) return p + (q - p) * 6 * t;   // 0.5556 < 0.1667? NO
    if (t < 1 / 2) return q;                      // 0.5556 < 0.5? NO
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;  // 0.5556 < 0.6667? SÍ -> entra acá
    return p;
};
```

Mirá el gráfico: `t=0.5556` cae justo en la zona que **baja** (entre 1/2 y 2/3). Entonces:

`g = p + (q - p) * (2/3 - t) * 6`
`g = 0.2575 + (0.8425 - 0.2575) * (0.6667 - 0.5556) * 6`
`g = 0.2575 + 0.585 * 0.1111 * 6`
`g = 0.2575 + 0.39 = 0.6475`

Esta fórmula es una **interpolación lineal**: en vez de saltar bruscamente de `q` a `p`, calcula qué tan "cerca" está `t` del final del tramo (`2/3 - t`) y usa eso como un porcentaje de mezcla entre los dos extremos. El `*6` no es magia — es simplemente para que, cuando `t` recorre el tramo entero (que dura `1/6` de ancho, como viste en el gráfico), el resultado vaya de 0 a 1 completos: `1 / (1/6) = 6`.

**Para `r` (`t = h + 1/3 = 0.5556 + 0.3333 = 0.8889`):**

`0.8889 < 1/6`? no. `< 1/2`? no. `< 2/3` (0.6667)? no, `0.8889` es mayor. Entonces cae en el último `return p` → estamos en la zona "plano en p" del gráfico (después de 2/3). Entonces `r = p = 0.2575`, directo, sin ninguna cuenta.

**Para `b` (`t = h - 1/3 = 0.5556 - 0.3333 = 0.2223`):**

`0.2223 < 1/6` (0.1667)? no, `0.2223` es mayor. `< 1/2`? sí → cae en la meseta "plano en q" del gráfico. Entonces `b = q = 0.8425`, también directo.

Entonces, al salir de `hslARgb` con nuestros números, tenemos: `r=0.2575, g=0.6475, b=0.8425` — todavía en escala 0-1.

```js
return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
```

Acá volvemos a la escala real de una pantalla: cada canal de color en una imagen digital se guarda como un número entero de 0 a 255 (por eso antes dividíamos por 255 mentalmente cuando pensábamos en "porcentaje"). Multiplicamos cada valor 0-1 por 255, y `Math.round()` redondea al entero más cercano porque no pueden existir "medios píxeles de rojo" — 255 es un número entero, siempre.

- `r: 0.2575 * 255 = 65.66 → Math.round → 66`
- `g: 0.6475 * 255 = 165.11 → 165`
- `b: 0.8425 * 255 = 214.84 → 215`

Entonces `hslARgb(200, 65, 55)` devuelve `[66, 165, 215]` — un azul medio, que tiene sentido porque 200° en el círculo de matices cae justo en la zona de los celestes/azules.

##### 1.2.1.4 `rgbAHex`: de números a texto hexadecimal

```js
function rgbAHex(r, g, b) {
    const aHex = (canal) => canal.toString(16).padStart(2, '0');
    return `#${aHex(r)}${aHex(g)}${aHex(b)}`;
}
```

Los números normales que usamos todos los días están en **base 10** (decimal): tenemos 10 símbolos (0 al 9), y cuando se acaban, sumamos una posición a la izquierda (después del 9 viene el 10). El hexadecimal es **base 16**: tiene 16 símbolos (0-9, y después a, b, c, d, e, f para representar 10, 11, 12, 13, 14, 15). Se usa para colores porque cada par de dígitos hexadecimales representa exactamente un canal de 0 a 255 (ya que 16×16 = 256), es una correspondencia perfecta y compacta.

- `canal.toString(16)`: le pide al número que se convierta a texto, pero en base 16 en vez de base 10. Ejemplo con nuestro `r=66`: `(66).toString(16)` da `"42"` (porque 4×16 + 2 = 66). Con `g=165`: `(165).toString(16)` da `"a5"` (porque 10×16 + 5 = 165, y el 10 se escribe como `a`). Con `b=215`: da `"d7"` (13×16 + 7 = 215, y 13 se escribe `d`).

- `.padStart(2, '0')`: esto es un seguro. Si el número en hexadecimal ocupa **un solo dígito** (por ejemplo, si `r` fuera 5, `(5).toString(16)` da `"5"`, no `"05"`), el color quedaría mal armado — el navegador esperaría siempre 2 dígitos por canal, y con solo uno se correría todo. `padStart(2, '0')` dice: "si este texto tiene menos de 2 caracteres, rellená por la izquierda con ceros hasta llegar a 2". Con `"5"` da `"05"`. Con `"42"` (que ya tiene 2 caracteres) no le agrega nada, queda igual.

- `const aHex = (canal) => ...`: es una función flecha corta que definimos una sola vez, para no repetir la misma lógica (`.toString(16).padStart(2, '0')`) tres veces seguidas. La llamamos con `r`, `g` y `b` por separado.

- El `` `#${aHex(r)}${aHex(g)}${aHex(b)}` `` es un **template literal** (con comillas invertidas ` `` `, no comillas normales). Permite meter variables adentro de un texto usando `${...}`, sin tener que concatenar con `+`. Con nuestros números da: `#` + `42` + `a5` + `d7` = `"#42a5d7"`.

##### 1.2.1.5 `hslAHex`: la función que conecta todo

```js
function hslAHex(h, s, l) {
    const [r, g, b] = hslARgb(h, s, l);
    return rgbAHex(r, g, b);
}
```

Esta función no hace ningún cálculo propio — solo **coordina** a las otras dos. Primero le pide a `hslARgb` los tres números RGB, y como esa función devuelve un array (`[66, 165, 215]`), acá usamos **destructuring** (`const [r, g, b] = ...`) para sacar esos tres valores del array y ponerlos en tres variables separadas de una sola vez, en vez de escribir `const r = resultado[0]; const g = resultado[1]; const b = resultado[2];` a mano. Después le pasa esos tres números a `rgbAHex`, que arma el texto final. El resultado, siguiendo todo nuestro ejemplo, es: **`hslAHex(200, 65, 55)` devuelve `"#42a5d7"`**.

Entonces cuando `generarColorAleatorio()` llama a `hslAHex(h, s, l)`, ya sabés exactamente qué pasa puertas adentro: normaliza, calcula `p` y `q`, corre la función-montaña tres veces desplazada, redondea a 0-255, y convierte a texto hexadecimal.

¿Esto te cierra? Si hay algún tramo puntual (por ejemplo el `hue2rgb` con los cuatro `if`, o el `padStart`) que todavía te genera dudas, decime cuál y lo desarmamos más todavía con otro ejemplo.

---

## 2. Cálculo contraste de texto

### 2.1 Prompt

necesito, con este mismo código que ya tengo, hacer que el textp hex que aparece sobre los colores sea legible, si el color es claro texto oscuro si el color es oscuro texto claro. Recuera explicar los pasos soy principiante

### 2.2 Response

Dale, sigamos con lo que quedó pendiente de la vez pasada: el **contraste del texto HEX** sobre fondos que cambian de color en cada click. Ahora que entendés bien los números RGB, esto te va a resultar mucho más fácil.

#### 2.2.1 El problema concreto

Ahora mismo, el `<span>` con el código HEX hereda el color de texto por defecto (`--color-texto`, que es un marrón oscuro definido en `variables.css`). Si el fondo generado es oscuro (por ejemplo un azul marino), un texto oscuro sobre eso es prácticamente ilegible. Esto rompe el requisito de accesibilidad de "contraste suficiente" que pide la consigna — no es un detalle estético, es un punto obligatorio a evaluar.

#### 2.2.2 La solución: medir qué tan clara u oscura es la luz de un color

La idea es: **antes de pintar el texto, calculamos qué tan "brillante" es el fondo, y elegimos texto oscuro o claro según corresponda.** A ese número que mide el brillo se lo llama **luminancia relativa**.

```js
function calcularLuminancia(r, g, b) {
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;

    return 0.2126 * rNorm + 0.7152 * gNorm + 0.0722 * bNorm;
}
```

Vamos línea por línea:

- `r / 255`, `g / 255`, `b / 255`: es el mismo concepto de "normalizar" que ya vimos — llevamos cada canal (que viene en escala 0-255) a una escala de 0 a 1, para poder combinarlos con una fórmula matemática que espera proporciones, no valores en una escala arbitraria.

- `0.2126 * rNorm + 0.7152 * gNorm + 0.0722 * bNorm`: acá está lo interesante. Uno pensaría que rojo, verde y azul contribuyen por igual al "brillo" percibido, pero **el ojo humano no ve los tres colores con la misma sensibilidad**. Somos mucho más sensibles al verde, bastante menos al rojo, y mucho menos al azul. Por eso la fórmula no es un simple promedio (que sería `0.333` para cada uno), sino que le da más "peso" al verde (`0.7152`, el 71.5%), peso medio al rojo (`0.2126`, el 21%), y casi nada al azul (`0.0722`, el 7%). Estos tres números suman `1.0` porque son un reparto de "cuánto influye cada canal en el total", como repartir el 100% de algo en tres partes.

Este cálculo es una versión simplificada de la fórmula que usa el estándar de accesibilidad web WCAG (la que también usan herramientas como Chrome DevTools para chequear contraste) — no es exactamente igual a la fórmula oficial completa (que además corrige algo llamado "gamma", un ajuste extra de percepción), pero para nuestro proyecto es más que suficiente y mucho más fácil de entender.

**Probemos con nuestro color de la vez pasada:** `r=66, g=165, b=215` (el azul medio, HEX `#42a5d7`).

```
rNorm = 66/255  = 0.2588
gNorm = 165/255 = 0.6471
bNorm = 215/255 = 0.8431

luminancia = 0.2126 × 0.2588 + 0.7152 × 0.6471 + 0.0722 × 0.8431
           = 0.0550          + 0.4628          + 0.0609
           = 0.5786
```

Ese `0.5786` es un número entre 0 (negro absoluto) y 1 (blanco absoluto). Como está bastante arriba del punto medio, ese azul es "más bien claro" en términos de percepción — entonces le conviene texto **oscuro** encima, no blanco.

#### 2.2.3 Decidir el color de texto con esa luminancia

```js
const colorTexto = luminancia > 0.5 ? 'var(--color-texto)' : 'var(--color-texto-claro)';
```

Esto es un **operador ternario** (`condición ? valorSiVerdadero : valorSiFalso`) — un `if/else` escrito en una sola línea, útil cuando la decisión es simple y da un valor, no ejecuta varias acciones. Se lee así: "si la luminancia es mayor a 0.5, usá el color de texto oscuro; si no, usá el claro". El `0.5` es el punto de corte (umbral): fondos con luminancia por encima de la mitad se consideran "claros" y necesitan texto oscuro encima; fondos con luminancia por debajo se consideran "oscuros" y necesitan texto claro.

Fijate que uso `'var(--color-texto)'` y `'var(--color-texto-claro)'` como **strings de JavaScript que contienen una función CSS**. No estamos escribiendo un color fijo (como `'#333333'`) — estamos aprovechando las variables que vos ya definiste en `variables.css`, así el color de texto sigue viniendo de un solo lugar centralizado (tu paleta de diseño), en vez de tener colores "hardcodeados" (escritos a mano, sueltos) en el JavaScript. Esto es justamente lo que la guía pide con "mantén estilos simples y consistentes".

#### 2.2.4 Ahora, conectemos esto con `generarColorAleatorio`

Acá viene un cambio importante: hasta ahora, `generarColorAleatorio` llamaba a `hslAHex(h, s, l)`, que **por dentro** volvía a llamar a `hslARgb(h, s, l)` para sacar el HEX. Pero ahora **también necesitamos** esos mismos valores `r, g, b` para calcular la luminancia. Si dejáramos el código como está, tendríamos que llamar a `hslARgb` **dos veces** con los mismos números — una вычисление repetida e innecesaria. Mejor lo llamamos **una sola vez** y reutilizamos el resultado:

```js
function generarColorAleatorio() {
    const h = Math.floor(Math.random() * 361);
    const s = Math.floor(Math.random() * 31) + 55;
    const l = Math.floor(Math.random() * 21) + 45;

    const hsl = `hsl(${h}, ${s}%, ${l}%)`;

    const [r, g, b] = hslARgb(h, s, l);
    const hex = rgbAHex(r, g, b);
    const luminancia = calcularLuminancia(r, g, b);
    const colorTexto = luminancia > 0.5 ? 'var(--color-texto)' : 'var(--color-texto-claro)';

    return { hsl, hex, colorTexto };
}
```

**Qué cambió y por qué:**
- Antes: `const hex = hslAHex(h, s, l);` (una función "caja negra" que hacía todo adentro, sin darnos acceso a los valores `r, g, b` intermedios).
- Ahora: llamamos directamente a `hslARgb` y `rgbAHex` por separado, porque necesitamos ese resultado intermedio (`r, g, b`) para dos cosas distintas: armar el HEX **y** calcular la luminancia. Esto es más eficiente (una sola conversión en vez de dos) y más claro de leer, porque ves explícitamente el paso intermedio.
- La función `hslAHex` que armamos la clase pasada queda **sin usar** en este archivo. No la borres todavía — es un ejemplo perfectamente válido y puede servirte después (por ejemplo, para una función de test), pero por ahora, avisame si querés que la dejemos como está (documentando el pipeline completo en una sola función) o si preferís que la elimine para no tener código muerto dando vueltas. Vos decidís, ambas son opciones razonables.

#### 2.2.5 Usar `colorTexto` en el render

```js
function renderizarPaleta(tamano) {
    contenedorPaleta.innerHTML = '';

    for (let i = 0; i < tamano; i++) {
        const color = generarColorAleatorio();

        const tarjetaColor = document.createElement('div');
        tarjetaColor.classList.add('color-paleta');
        tarjetaColor.style.backgroundColor = color.hsl;

        const textoHex = document.createElement('span');
        textoHex.textContent = color.hex.toUpperCase();
        textoHex.style.color = color.colorTexto;

        tarjetaColor.appendChild(textoHex);
        contenedorPaleta.appendChild(tarjetaColor);
    }
}
```

La única línea nueva acá es `textoHex.style.color = color.colorTexto;` — le decimos al `<span>` que use el color de texto que ya decidimos (oscuro o claro) según la luminancia del fondo que le tocó a esa tarjeta puntual.

¿Lo probás y me contás si en fondos oscuros aparece con texto claro y en fondos claros con texto oscuro? Y decime también qué preferís hacer con `hslAHex` (dejarla o sacarla).

---

## 3. Microfeedback

### 3.1 Prompt

listo ahora necesito hacer un toast, la verdad no sé como hacerlo así que nuevamente me gustaría una explicación dellada. Necesito que el toast que vayamos a crear este basado en esta consigna que te voy a pegar.

### 3.2 Respone

Vamos con el toast entonces — es la opción que cumple el requisito obligatorio de la consigna de la forma más directa (avisa que la paleta se generó). El tooltip para copiar el HEX lo dejamos para más adelante, cuando lleguemos al extra de "copiar al portapapeles".

Vamos a hacerlo en **3 pasos**: HTML (el elemento que va a mostrar el mensaje), CSS (cómo se ve y cómo aparece/desaparece), y JS (cuándo se muestra y por cuánto tiempo).

#### 3.2.1 Paso 1: HTML — el elemento del toast

Abrí `index.html` y agregá esto, justo antes de la etiqueta de cierre `</body>` (después del `</footer>`):

```html
<div id="toast" class="toast" role="status" aria-live="polite"></div>
```

**Por qué va acá, y por qué está vacío:**
- Creamos **un solo** elemento fijo en el HTML, en vez de crear un `<div>` nuevo cada vez que necesitemos mostrar un mensaje (como sí hacemos con las tarjetas de color, que sí cambian de cantidad). El toast siempre es "uno solo que aparece y desaparece" — no necesitamos varios al mismo tiempo, así que lo dejamos armado de una vez en el HTML, y el JS después solo le cambia el texto y lo muestra/oculta.
- Está vacío (`</div>`, sin texto adentro) porque el mensaje que va a mostrar depende de qué pasó (por ejemplo "Paleta de 6 colores generada") — ese texto lo va a poner el JavaScript dinámicamente, según el momento.

**Los dos atributos nuevos, explicados uno por uno:**
- `role="status"`: le dice a las tecnologías de asistencia (lectores de pantalla, que usan las personas ciegas o con baja visión) "este elemento es un mensaje de estado, no un párrafo cualquiera de la página". Sin esto, un lector de pantalla no tiene forma de saber que ese `<div>` es especial.
- `aria-live="polite"`: esto es clave para accesibilidad (justo lo que pide la consigna). Le dice al lector de pantalla: "cuando el contenido de este elemento cambie, anuncialo en voz alta, pero esperá a que la persona termine lo que esté leyendo" (por eso "polite" = educado, no interrumpe a los gritos). Sin este atributo, alguien que use un lector de pantalla jamás se enteraría de que apareció un mensaje, porque el toast no roba el foco del teclado ni del mouse — es puramente visual, y `aria-live` es el puente que lo hace también "audible".

#### 3.2.2 Paso 2: CSS — apariencia y animación

Abrí `layout.css` y agregá esto al final del archivo:

```css
/*==> toast (microfeedback) <== */
.toast {
    position: fixed;
    left: 50%;
    bottom: var(--espacio-lg);
    transform: translateX(-50%) translateY(150%);

    background-color: var(--color-fondo-oscuro);
    color: var(--color-texto-claro);
    padding: var(--espacio-sm) var(--espacio-md);
    border-radius: var(--borde-radio-md);
    box-shadow: var(--sombra-suave);

    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.toast.visible {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
}
```

Vamos línea por línea, porque hay conceptos nuevos importantes:

- **`position: fixed`**: saca al elemento del flujo normal de la página (no ocupa espacio entre los demás elementos) y lo posiciona en relación a la ventana del navegador, no al documento. Esto es lo que le permite "flotar" siempre visible en la misma esquina, sin importar cuánto scroll hagas.

- **`left: 50%` + `transform: translateX(-50%)`**: este es un truco clásico de CSS para centrar horizontalmente un elemento de ancho variable. `left: 50%` mueve el **borde izquierdo** del toast hasta la mitad de la pantalla — pero eso no lo centra, lo corre de más (porque el toast entero queda a la derecha del centro). `translateX(-50%)` corrige eso: mueve el elemento hacia la izquierda **la mitad de su propio ancho**, dejándolo perfectamente centrado sin importar si el texto es corto o largo.

- **`bottom: var(--espacio-lg)`**: lo separa del borde inferior de la pantalla, usando tu variable de espaciado ya definida (consistencia con el resto del diseño).

- **`transform: translateX(-50%) translateY(150%)`** (estado inicial, oculto): además de centrarlo horizontalmente, lo empuja hacia abajo un 150% de su propia altura — es decir, **lo esconde completamente debajo del borde de la pantalla**, invisible, como si estuviera "guardado" ahí abajo esperando a que lo llamen.

- **`opacity: 0`**: además de estar corrido hacia abajo, lo hacemos transparente. ¿Por qué las dos cosas (posición Y opacidad) si con una ya no se vería? Porque así logramos un efecto de "aparece deslizándose y desvaneciéndose", en vez de un salto brusco de "no está" a "está".

- **`pointer-events: none`**: mientras está oculto, esto le dice al navegador "ignorá los clics sobre este elemento, como si no existiera". Es una buena práctica: aunque esté invisible, técnicamente sigue "ahí" en el HTML, y sin esta línea, en teoría podría bloquear un clic en algo que esté debajo suyo.

- **`transition: opacity 0.3s ease, transform 0.3s ease`**: esta es la línea que convierte los cambios bruscos en una animación suave. Le dice al navegador: "cuando cambien las propiedades `opacity` o `transform` de este elemento, no lo hagas de golpe — hacelo gradualmente, a lo largo de 0.3 segundos, con una curva de aceleración `ease` (empieza más lento, se acelera, y termina más lento — la curva de movimiento más natural y estándar)".

- **`.toast.visible`**: esta es una **clase adicional** que el JavaScript le va a agregar al toast cuando queramos mostrarlo (no reemplaza a `.toast`, se suma — por eso el selector CSS es `.toast.visible`, sin espacio entre los dos puntos, que significa "un elemento que tiene AMBAS clases al mismo tiempo"). Cuando esta clase está presente, `opacity` pasa a `1` (visible) y `transform` vuelve a `translateY(0)` (en su posición normal, no escondido). Como ya le pusimos `transition` a `.toast`, el navegador anima solo el cambio entre estos dos estados.

#### 3.2.3 Paso 3: JavaScript — mostrar y ocultar el toast

Abrí `script.js`. Primero, agregá esta constante nueva junto a las otras que ya tenés arriba del archivo:

```js
const toast = document.getElementById('toast');
```

Igual que hiciste con `generarBoton` o `contenedorPaleta`: buscamos el elemento del HTML por su `id` y lo guardamos en una variable, para no tener que buscarlo de nuevo cada vez que lo necesitemos.

Ahora, agregá esta función nueva (puede ir, por ejemplo, después de `renderizaPaleta`):

```js
//=< mostrar mensaje de microfeedback >==
let idTemporizadorToast = null;

function mostrarToast(mensaje) {
    toast.textContent = mensaje;
    toast.classList.add('visible');

    if (idTemporizadorToast) {
        clearTimeout(idTemporizadorToast);
    }

    idTemporizadorToast = setTimeout(() => {
        toast.classList.remove('visible');
    }, 2500);
}
```

Desglosemos cada parte:

- **`let idTemporizadorToast = null;`** (declarada **fuera** de la función, a nivel de todo el archivo): esta variable va a guardar una referencia al temporizador activo. La necesitamos afuera de `mostrarToast` porque tiene que **persistir entre distintas llamadas** a la función — si estuviera declarada adentro, se resetearía a `null` cada vez que se llama a la función, y no cumpliría su propósito (que ahora te explico).

- **`toast.textContent = mensaje;`**: cambia el texto que se ve adentro del toast al mensaje que le pasemos como parámetro (por ejemplo, "Paleta de 6 colores generada"). Este cambio de contenido es justo lo que dispara el `aria-live="polite"` que pusimos en el HTML — el lector de pantalla detecta que el texto cambió y lo lee en voz alta.

- **`toast.classList.add('visible');`**: acá le agregamos la clase `visible` que definimos en el CSS. En el instante en que se agrega esta clase, el navegador empieza automáticamente la transición de 0.3 segundos que configuramos (porque CSS "ve" el cambio de estado y anima según la regla `transition`).

- **`setTimeout(() => {...}, 2500)`**: esto es una función nativa de JavaScript que dice "ejecutá el código de adentro (la función flecha) después de que pasen 2500 milisegundos (2.5 segundos), no antes". Es asincrónico: el código sigue corriendo normalmente después de esta línea, y recién 2.5 segundos más tarde, "en paralelo", se ejecuta lo de adentro — en este caso, `toast.classList.remove('visible')`, que le saca la clase y hace que vuelva a esconderse (con su propia animación de salida, porque seguimos teniendo `transition`).

- **`idTemporizadorToast = setTimeout(...)`**: `setTimeout` no solo programa la ejecución futura — también **devuelve un número identificador** único para ese temporizador en particular. Guardamos ese número en nuestra variable.

- **`if (idTemporizadorToast) { clearTimeout(idTemporizadorToast); }`**: acá está el motivo de guardar ese identificador. Imaginate que el usuario hace clic en "Generar paleta" dos veces seguidas, muy rápido (antes de que pasen los 2.5 segundos del primer toast). Sin esta línea, tendrías **dos temporizadores corriendo al mismo tiempo**: el primero podría ocultar el toast justo cuando recién apareció el segundo mensaje, generando un parpadeo raro. `clearTimeout(idTemporizadorToast)` cancela el temporizador anterior (si existía uno todavía esperando) antes de programar uno nuevo, así siempre hay **como máximo un temporizador activo**, y el toast se queda visible los 2.5 segundos completos desde el último clic, no desde el primero.

#### 3.2.4 Conectar todo: llamar a `mostrarToast` cuando se genera la paleta

Por último, modificá el listener del botón para que también dispare el toast:

```js
generarBoton.addEventListener('click', () => {
    const tamano = parseInt(selectorTamano.value, 10);
    renderizaPaleta(tamano);
    mostrarToast(`Paleta de ${tamano} colores generada`);
});
```

La única línea nueva es la última: después de renderizar la paleta, llamamos a `mostrarToast` pasándole un mensaje armado con **template literal** (el mismo concepto que ya usamos antes con las comillas invertidas y `${...}`) para que el número de colores generado se inserte dinámicamente en el texto.

Probalo y contame: ¿ves el mensaje deslizarse desde abajo cuando generás una paleta, y desaparece solo después de un par de segundos? Si algo no se mueve o queda pegado, decime qué ves exactamente y lo revisamos.

---

## 4. Copiar al portapapeles

### 4.1 Prompt

bien como el proyecto está luciendo ya bien, te voy a enviar los archivos con todo lo que vamos hasta ahora, la idea es según la consigna que te voy a pegar empezar con los extras, copiar al corta papeles. Necesito nuevamente que expliques bien todo soy principiante.

### 4.2 Respone

Genial, vamos avanzando bien. Como estás adelantado, saltemos al primer extra de la consigna que trae más valor con el trabajo que ya tenemos: **copiar el código HEX al portapapeles al hacer clic sobre un color**. Es perfecto para hacer ahora porque reutiliza el toast que ya armamos.

Vamos en **2 partes**: JavaScript (la lógica de copiar) y CSS (afordancia visual + foco, para que quede accesible).

#### 4.2.1 Parte 1: la función que copia al portapapeles

Agregá esta función nueva en `script.js` (por ejemplo, después de `mostrarToast`):

```js
//=< copiar código hex al portapapeles >==
function copiarAlPortapapeles(hex) {
    navigator.clipboard.writeText(hex)
        .then(() => {
            mostrarToast(`Copiado ${hex.toUpperCase()} al portapapeles`);
        })
        .catch(() => {
            mostrarToast('No se pudo copiar el color');
        });
}
```

Acá aparece un concepto nuevo importante: **las Promesas (Promises)**.

- **`navigator.clipboard`**: es un objeto que el navegador te da automáticamente (no lo creamos nosotros), que te da acceso a funciones relacionadas con el portapapeles del sistema operativo (esto es, el "copiar y pegar" de tu computadora, compartido entre todas las aplicaciones, no solo el navegador).

- **`.writeText(hex)`**: le pide al navegador "escribí este texto en el portapapeles". Ahora, ¿por qué no es tan simple como `contenedor.textContent = algo`, que hicimos antes de forma inmediata? Porque escribir en el portapapeles del sistema operativo **no es instantáneo ni 100% seguro** — el navegador tiene que pedirle permiso al sistema operativo, y en teoría podría fallar (por ejemplo, si la página no está en un contexto seguro, algo que te explico más abajo). Por eso, en vez de devolver el resultado de una, `writeText()` devuelve una **Promesa**: un objeto que representa "un resultado que todavía no tenemos, pero lo vamos a tener en algún momento cercano, ya sea con éxito o con un error".

- **`.then(() => {...})`**: esto le dice a la Promesa "cuando termines **con éxito**, ejecutá esta función". Es la parte de "todo salió bien" — acá mostramos el toast confirmando que se copió.

- **`.catch(() => {...})`**: esto le dice a la Promesa "si algo salió **mal** en el proceso, ejecutá esta otra función en su lugar". Es tu red de seguridad: si por algún motivo el navegador no pudo copiar (por ejemplo, el usuario le negó el permiso, o la página no cumple los requisitos de seguridad), en vez de que la página se rompa en silencio o tire un error en la consola sin que el usuario se entere, le mostramos un mensaje honesto avisando que no se pudo.

Este patrón (`.then().catch()`) es la forma más básica y clásica de trabajar con Promesas en JavaScript — es útil que lo veas ahora, porque te lo vas a encontrar todo el tiempo apenas tu código empiece a hablar con cosas externas (el portapapeles, un servidor, un archivo, etc.), que es justo lo que hace este método.

**Un detalle técnico importante para cuando pruebes esto:** `navigator.clipboard` solo funciona en lo que se llama un "contexto seguro" — es decir, la página tiene que estar servida por `https://` o por `http://localhost`, **no** funciona si abrís el `index.html` directamente haciendo doble clic desde tu carpeta (eso se abre como `file://...`, y ese protocolo no cuenta como seguro). Si estás probando así y ves que no copia nada, no es un error tuyo de código — te recomiendo instalar la extensión "Live Server" en VS Code (clic derecho sobre `index.html` → "Open with Live Server"), que te sirve la página en `http://localhost` y ahí sí va a funcionar. Cuando subas el proyecto a GitHub Pages tampoco vas a tener problema, porque GitHub Pages siempre sirve todo por `https://`.

#### 4.2.2 Parte 2: conectar la función al hacer clic en una tarjeta

Ahora hay que modificar `renderizaPaleta` para que cada tarjeta de color, al hacer clic, llame a esta función. Pero como también nos importa la **accesibilidad** (alguien que navegue solo con teclado tiene que poder copiar el color también, no solo quien usa mouse), vamos a agregar unos atributos extra:

```js
function renderizaPaleta(tamano) {
    contenedorPaleta.innerHTML = '';

    for (let i = 0; i < tamano; i++) {
        const color = generarColorAleatorio();

        const tarjetaColor = document.createElement('div');
        tarjetaColor.classList.add('color-paleta');
        tarjetaColor.style.backgroundColor = color.hsl;
        tarjetaColor.setAttribute('tabindex', '0');
        tarjetaColor.setAttribute('role', 'button');
        tarjetaColor.setAttribute('aria-label', `Copiar código ${color.hex.toUpperCase()} al portapapeles`);

        const textoHex = document.createElement('span');
        textoHex.textContent = color.hex.toUpperCase();
        textoHex.style.color = color.colorTexto;

        tarjetaColor.appendChild(textoHex);
        contenedorPaleta.appendChild(tarjetaColor);

        tarjetaColor.addEventListener('click', () => copiarAlPortapapeles(color.hex));

        tarjetaColor.addEventListener('keydown', (evento) => {
            if (evento.key === 'Enter' || evento.key === ' ') {
                evento.preventDefault();
                copiarAlPortapapeles(color.hex);
            }
        });
    };   
};
```

Repasemos qué agregamos y por qué, porque hay bastante detalle de accesibilidad acá:

- **`tarjetaColor.setAttribute('tabindex', '0')`**: por defecto, un `<div>` **no es alcanzable** apretando `Tab` en el teclado — solo lo son elementos naturalmente interactivos, como `<button>`, `<a>`, o `<input>`. Como decidimos que toda la tarjeta (no un botón real) sea la zona clickeable, tenemos que decirle explícitamente al navegador "este `<div>` también puede recibir foco por teclado". El valor `"0"` significa "incluilo en el orden natural de tabulación de la página" (siguiendo el orden en que aparece en el HTML) — otros valores son posibles pero mucho menos comunes y no los necesitás acá.

- **`tarjetaColor.setAttribute('role', 'button')`**: le avisa a un lector de pantalla "este elemento, aunque técnicamente es un `<div>`, se comporta como un botón — anuncialo como tal". Sin esto, un lector de pantalla diría simplemente "elemento genérico" al llegar acá, sin ninguna pista de que se puede interactuar con él.

- **`tarjetaColor.setAttribute('aria-label', ...)`**: le da al lector de pantalla un texto descriptivo de qué hace este botón, ya que el contenido visual (un cuadrado de color con un código HEX adentro) no explica por sí solo la acción "al apretar esto, copio el color". Es buena práctica explicar la acción, no solo describir lo que se ve.

- **El segundo `addEventListener`, con `'keydown'`**: acá está el motivo más importante de todo este bloque. Un `<button>` de verdad, al apretar `Enter` o `Espacio` estando enfocado, dispara su evento `click` automáticamente — el navegador lo hace solo. Pero **un `<div>`, aunque le pongamos `role="button"` y `tabindex="0"`, NO tiene ese comportamiento automático** — el rol y el tabindex son solo para que los lectores de pantalla y la navegación por teclado lo "vean" como interactivo, pero el disparo real del evento hay que programarlo nosotros a mano. Por eso escuchamos el evento `keydown` (se dispara al apretar cualquier tecla) y revisamos manualmente si la tecla apretada fue `Enter` o `' '` (barra espaciadora, representada como un espacio literal en el string).

- **`evento.preventDefault()`**: esto es necesario específicamente para la barra espaciadora. Por defecto, apretar espacio en una página web hace que la ventana haga scroll hacia abajo (es el comportamiento nativo del navegador). Como acá la barra espaciadora significa "activar este botón", no "hacer scroll", le decimos al navegador "cancelá tu comportamiento por defecto para esta tecla en este momento".

#### 4.2.3 CSS: afordancia visual y foco

Un mouse-user necesita una pista visual de que algo es clickeable (el `role="button"` no sirve de nada si no lo usás con lector de pantalla). Agregá esto en `layout.css`, dentro de la sección donde ya está `.color-paleta` (o al final, como prefieras):

```css
.color-paleta {
    cursor: pointer;
}

.color-paleta:focus-visible {
    outline: 3px solid var(--color-primario);
    outline-offset: 2px;
}
```

- **`cursor: pointer;`**: cambia el ícono del mouse a la manito cuando pasás por encima de una tarjeta — la señal visual universal de "esto se puede clickear", para quien usa mouse y nunca va a leer un `aria-label`.

- **`.color-paleta:focus-visible`**: repetimos la misma regla de foco que ya armamos para `button` y `select`, pero apuntada a `.color-paleta`. ¿Por qué no alcanza con la regla genérica `button:focus-visible, select:focus-visible` que ya tenías? Porque esa regla selecciona por **etiqueta HTML** (`button`, `select`), y nuestra tarjeta sigue siendo, técnicamente, un `<div>` — el navegador no la incluye en ese selector aunque tenga `role="button"`. Por eso hace falta esta línea aparte, apuntando a la clase `.color-paleta`.

Probalo así: hacé clic en cualquier color de la paleta generada, y fijate si aparece el toast confirmando el código copiado — después pegalo en cualquier lado (un bloc de notas, la barra de direcciones) para confirmar que efectivamente se copió el HEX correcto. También probá con teclado: hacé `Tab` hasta llegar a una tarjeta, y apretá `Enter` o `Espacio` en vez de clickear. Contame cómo te fue.

---

## 5. Bloqueo de colores

### 5.1 Prompt

perfefcto, el código está corriendo sin ningún problema. Hora de cambiar el código para que se puedan bloquear colores en la paleta y generar nuevos sin que esos bloqueados se pierdan.

### 5.2 Response

Este es un cambio de nivel distinto a los anteriores — hasta ahora, cada vez que generabas una paleta, tirabas todo el HTML viejo (`contenedorPaleta.innerHTML = ''`) y creabas todo de cero, sin guardar memoria de nada. Para poder "bloquear" colores, **necesitamos que el JavaScript recuerde qué paleta se está mostrando ahora mismo**, no solo pintarla y olvidarla. A esto se le llama tener un **estado** — una variable que representa "la situación actual de la aplicación", que persiste entre clics.

Vamos en **4 pasos**: la variable de estado, separar "calcular la paleta" de "pintarla en pantalla", el botón de bloqueo, y el CSS.

#### 5.2.1 Paso 1: la variable de estado

Arriba de todo en `script.js`, junto a tus otras constantes, agregá:

```js
let paletaActual = [];
```

- Uso `let`, no `const`, porque **esta variable va a cambiar de contenido** todo el tiempo (cada vez que generás una paleta nueva, o bloqueás/desbloqueás un color). `const` no lo permitiría.
- Es un array vacío al principio, porque todavía no generaste ninguna paleta. Cada elemento de este array, más adelante, va a ser un objeto como el que ya devuelve `generarColorAleatorio()` (`{ hsl, hex, colorTexto }`), pero le vamos a agregar una propiedad nueva: `bloqueado` (`true` o `false`).

#### 5.2.2 Paso 2: separar "decidir qué colores van" de "pintarlos"

Hasta ahora tenías una sola función (`renderizaPaleta`) que hacía todo junto: generaba colores nuevos Y los pintaba en el DOM al mismo tiempo. Ahora necesitamos **separar esas dos responsabilidades**, porque bloquear un color va a necesitar "repintar" sin generar nada nuevo, y generar una paleta nueva va a necesitar revisar, color por color, si hay que respetar uno bloqueado o generar uno random.

Reemplazá tu función `renderizaPaleta` por estas **dos** funciones:

```js
//=< decide qué colores van en la paleta nueva (respetando bloqueados) >==
function crearNuevaPaleta(tamano) {
    const nuevaPaleta = [];

    for (let i = 0; i < tamano; i++) {
        const colorAnterior = paletaActual[i];

        if (colorAnterior && colorAnterior.bloqueado) {
            nuevaPaleta.push(colorAnterior);
        } else {
            const colorNuevo = generarColorAleatorio();
            colorNuevo.bloqueado = false;
            nuevaPaleta.push(colorNuevo);
        }
    }

    paletaActual = nuevaPaleta;
    renderizarPaleta();
}
```

Desglosemos esto con cuidado, porque es el corazón de la funcionalidad:

- **`const colorAnterior = paletaActual[i];`**: en cada vuelta del `for`, miramos qué color había **en esa misma posición** la vez anterior. `paletaActual[i]` accede al elemento del array en el índice `i` — si `paletaActual` está vacío (primera vez que generás algo) o si `i` es una posición que no existía antes (por ejemplo, pasaste de 6 a 9 colores), esto da `undefined`, no un error.

- **`if (colorAnterior && colorAnterior.bloqueado)`**: acá hay dos condiciones unidas con `&&` (Y lógico) — ambas tienen que ser verdaderas para entrar. Primero chequeamos `colorAnterior` solo (sin nada más): en JavaScript, `undefined` se comporta como "falso" dentro de un `if`, así que esta parte responde a "¿existía un color en esta posición?". Recién si eso es cierto, evaluamos `colorAnterior.bloqueado` — y este orden **no es casual**: si escribieras `if (colorAnterior.bloqueado && colorAnterior)` al revés, e intentaras leer `.bloqueado` de un `colorAnterior` que es `undefined`, JavaScript tiraría un error ("no se puede leer una propiedad de undefined"). Por eso siempre se chequea primero que algo "exista", y recién después se accede a sus propiedades — este patrón se llama **short-circuit evaluation** (evaluación de cortocircuito): si la primera condición del `&&` ya es falsa, JavaScript ni siquiera mira la segunda, porque el resultado final ya está decidido.

- **`nuevaPaleta.push(colorAnterior);`** (si estaba bloqueado): reutilizamos el mismo objeto de color de antes, sin tocarlo — por eso el color bloqueado se mantiene exactamente igual, HSL, HEX y todo, en la paleta nueva.

- **`else { ... }`** (si no estaba bloqueado, o no existía): generamos un color completamente nuevo con la función que ya tenías, y le agregamos manualmente `colorNuevo.bloqueado = false;` — porque `generarColorAleatorio()` no sabe nada de bloqueos, esa propiedad se la agregamos nosotros acá afuera, después de recibir el objeto.

- **`paletaActual = nuevaPaleta;`**: recién al final del `for`, reemplazamos el estado viejo por el nuevo array completo. Es importante no ir modificando `paletaActual` color por color **durante** el loop, porque adentro del loop todavía estamos **leyendo** de `paletaActual` (`paletaActual[i]`) para decidir qué hacer — si la modificáramos a mitad de camino, podríamos leer datos ya alterados sin querer.

Ahora, la función que solo pinta (sin decidir nada, solo lee `paletaActual` y arma el HTML):

```js
//=< pinta en el DOM lo que hay guardado en paletaActual >==
function renderizarPaleta() {
    contenedorPaleta.innerHTML = '';

    paletaActual.forEach((color, indice) => {
        const tarjetaColor = document.createElement('div');
        tarjetaColor.classList.add('color-paleta');
        tarjetaColor.style.backgroundColor = color.hsl;
        tarjetaColor.setAttribute('tabindex', '0');
        tarjetaColor.setAttribute('role', 'button');
        tarjetaColor.setAttribute('aria-label', `Copiar código ${color.hex.toUpperCase()} al portapapeles`);

        if (color.bloqueado) {
            tarjetaColor.classList.add('bloqueado');
        }

        const textoHex = document.createElement('span');
        textoHex.textContent = color.hex.toUpperCase();
        textoHex.style.color = color.colorTexto;

        const botonBloqueo = document.createElement('button');
        botonBloqueo.type = 'button';
        botonBloqueo.classList.add('boton-bloqueo');
        botonBloqueo.textContent = color.bloqueado ? '🔒' : '🔓';
        botonBloqueo.setAttribute('aria-pressed', color.bloqueado ? 'true' : 'false');
        botonBloqueo.setAttribute('aria-label', color.bloqueado ? 'Desbloquear color' : 'Bloquear color');

        botonBloqueo.addEventListener('click', (evento) => {
            evento.stopPropagation();
            alternarBloqueo(indice);
        });

        tarjetaColor.appendChild(textoHex);
        tarjetaColor.appendChild(botonBloqueo);
        contenedorPaleta.appendChild(tarjetaColor);

        tarjetaColor.addEventListener('click', () => copiarAlPortapapeles(color.hex));

        tarjetaColor.addEventListener('keydown', (evento) => {
            if (evento.key === 'Enter' || evento.key === ' ') {
                evento.preventDefault();
                copiarAlPortapapeles(color.hex);
            }
        });
    });
}
```

Qué cambió respecto a lo que ya tenías:

- **`paletaActual.forEach((color, indice) => {...})`** en vez del `for` de siempre: `forEach` es un método que ya viene incorporado en todos los arrays, y hace exactamente lo mismo que un `for` clásico (recorrer cada elemento), pero con una sintaxis distinta: le pasás una función, y esa función se ejecuta **una vez por cada elemento** del array. El elemento en sí te lo da como primer parámetro (acá lo llamo `color`), y el índice (la posición, 0, 1, 2...) como segundo parámetro (`indice`) — que vamos a necesitar para saber **qué posición exacta** bloquear o desbloquear.

- **El botón de bloqueo** (`botonBloqueo`): a diferencia de la tarjeta completa (que es un `<div>` al que le agregamos `role="button"` a mano, ¿te acordás?), acá uso un `<button>` de verdad. ¿Por qué la diferencia? Porque un `<button>` real ya viene con **todo el comportamiento de accesibilidad incluido de fábrica** (foco por teclado, se activa con Enter/Espacio automáticamente, se anuncia como botón) — no hace falta simularlo a mano como sí tuvimos que hacer con la tarjeta completa (que tenía que ser un `<div>` porque adentro contiene más elementos, como el texto del HEX).

- **`botonBloqueo.textContent = color.bloqueado ? '🔒' : '🔓'`**: mismo operador ternario de siempre — si está bloqueado, muestra el ícono de candado cerrado; si no, el de candado abierto. Es feedback visual inmediato de qué estado tiene cada color.

- **`aria-pressed`**: este es un atributo específico para **botones de tipo interruptor** (toggle) — le dice a un lector de pantalla si el botón está actualmente "activado" o no, como el estado de un switch de luz. Es distinto de `aria-label` (que describe qué hace el botón) — `aria-pressed` describe **en qué estado está ahora mismo**.

- **`evento.stopPropagation();`** — esta es la línea más importante para que todo funcione bien, y quiero que entiendas exactamente el problema que resuelve. En el navegador, cuando hacés clic en un elemento que está **adentro** de otro elemento (acá: el botón de candado está adentro de la tarjeta de color), el clic no solo dispara el evento del elemento que tocaste — también "burbujea" hacia arriba y dispara los eventos de clic de todos sus elementos contenedores, como ondas en el agua. Esto se llama **event bubbling** (burbujeo de eventos). Sin `stopPropagation()`, al hacer clic en el botón de candado pasarían **dos cosas a la vez**: se ejecutaría `alternarBloqueo` (lo que queremos) Y también se ejecutaría `copiarAlPortapapeles` de la tarjeta contenedora (porque el clic "burbujeó" hasta ella) — copiando el color al portapapeles cada vez que solo querías bloquearlo, algo confuso e indeseado. `evento.stopPropagation()` le dice al navegador "frená la burbuja acá, no dejes que este clic siga subiendo a los elementos de arriba".

- **`alternarBloqueo(indice)`**: le pasamos el índice (la posición en el array) del color que corresponde a este botón puntual, para que la función sepa exactamente cuál cambiar.

#### 5.2.3 Paso 3: la función que alterna el bloqueo

```js
//=< cambia el estado de bloqueo de un color y vuelve a pintar >==
function alternarBloqueo(indice) {
    paletaActual[indice].bloqueado = !paletaActual[indice].bloqueado;
    renderizarPaleta();
}
```

- **`!paletaActual[indice].bloqueado`**: el signo `!` es el operador de **negación lógica** — invierte un valor booleano: si era `true`, `!true` da `false`, y viceversa. Entonces esta línea dice "el nuevo valor de `bloqueado` es lo opuesto al que tenía antes" — así es como se implementa un interruptor (toggle): cada clic invierte el estado anterior, no lo fija a un valor fijo.
- Después de cambiar el estado en el array, llamamos de nuevo a `renderizarPaleta()` para que el DOM se actualice y refleje el nuevo ícono (candado abierto/cerrado) y el estilo visual del bloqueo (que armamos en el CSS ahora).

#### 5.2.4 Paso 4: actualizar el listener del botón principal

```js
generarBoton.addEventListener('click', () => {
    const tamano = parseInt(selectorTamano.value, 10);
    crearNuevaPaleta(tamano);
    mostrarToast(`Paleta de ${tamano} colores generada`);
});
```

Único cambio: donde antes llamábamos a `renderizaPaleta(tamano)`, ahora llamamos a `crearNuevaPaleta(tamano)` — la función que **decide** qué colores van (respetando bloqueos) y que internamente ya llama a `renderizarPaleta()` al final.

#### 5.2.5 CSS: estilo del botón y del estado bloqueado

Agregá esto en `layout.css`:

```css
/*==> botón de bloqueo <== */
.boton-bloqueo {
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    padding: var(--espacio-xs);
    line-height: 1;
}

.boton-bloqueo:focus-visible {
    outline: 3px solid var(--color-primario);
    outline-offset: 2px;
    border-radius: var(--borde-radio-sm);
}

/*==> tarjeta bloqueada <== */
.color-paleta.bloqueado {
    outline: 3px solid var(--color-primario-oscuro);
    outline-offset: -3px;
}
```

- **`.boton-bloqueo { background: none; border: none; }`**: un `<button>` normal viene con un fondo grisáceo y un borde por defecto del navegador — como acá el ícono de candado ya es visualmente claro por sí solo, le sacamos esos estilos para que se vea como un ícono flotando, no como un botón de formulario tradicional.

- **`.color-paleta.bloqueado`**: recordá el mismo patrón de antes (`.toast.visible`) — esto selecciona una tarjeta que tiene **ambas** clases (`color-paleta` Y `bloqueado`) al mismo tiempo. Le agregamos un contorno bien visible para que, de un vistazo, sepas qué colores están protegidos de cambiar.

- **`outline-offset: -3px;`** (nota el signo **negativo**, distinto a los casos anteriores): un valor negativo mete el contorno **hacia adentro** de la tarjeta en vez de expandirlo hacia afuera — así el marco de "bloqueado" queda contenido dentro del cuadrado de color, sin invadir el espacio de las tarjetas vecinas en la cuadrícula.

Probalo así: generá una paleta, bloqueá dos o tres colores (clic en el candado, no en el color en sí), generá de nuevo con el botón principal, y confirmá que **solo los bloqueados** se mantienen iguales mientras el resto cambia. Contame cómo te fue.

---

## 6. Guardado de paletas, localStorage

### 6.1 Prompt

ya con el código funcionando correctamente, había un pequeño bug que corregí. Ayúdame a implementar el local storage. Sería bueno, y me tocaría empezar por ahí, crear la estructura en el HTML original para almacenar los colores. Ya que puedo bloquear los colores, y esos colres bloquedos pasan a los siguientes array que se crean usando las funciones generarColorAleatorio() y creaPaletaNueva(), esos mismos colores bloqueados poder guardarlos en el local storage. El <div> donde quedarían almacenados sería al lado izquierdo. En configuración de paleta.

### 6.2 Response

Me gusta la idea, y es justo el approach correcto: en vez de guardar "una paleta completa", guardamos **cada color bloqueado individualmente** en una colección que vive aparte, en el panel de configuración. Antes de tirarte código, necesito que entendamos un concepto nuevo central: **qué es `localStorage` y por qué necesita un paso extra que no vimos hasta ahora**.

#### 6.2.1 Concepto nuevo: `localStorage`

Hasta ahora, todo lo que guardábamos (como `paletaActual`) vivía **en la memoria RAM del navegador**, dentro de la pestaña abierta — apenas recargás la página (F5) o la cerrás, esa variable desaparece por completo, porque JavaScript se reinicia de cero.

`localStorage` es distinto: es un **espacio de almacenamiento que el navegador reserva en el disco**, asociado a tu sitio web (`archivo.html` o tu dominio de GitHub Pages), que **sobrevive** a que cierres la pestaña, cierres el navegador, o hasta reinicies la computadora. Es la herramienta correcta acá, porque justamente el extra que pide la consigna es "que la paleta se guarde", implicando que siga estando ahí la próxima vez que abras la página.

**La limitación clave de `localStorage`:** solo puede guardar **texto** (strings) — nada de arrays, ni objetos, ni números directamente. Si vos intentás guardar un array de objetos tal cual, `localStorage` lo va a convertir automáticamente (y mal) en el string `"[object Object]"`, perdiendo toda la información real. Por eso necesitamos dos funciones que ya vienen con JavaScript:

- **`JSON.stringify(algo)`**: convierte cualquier objeto o array de JavaScript en un **texto** que representa fielmente esa estructura (por ejemplo, `[{hex: "#ff0000"}]` se convierte en el string literal `'[{"hex":"#ff0000"}]'`).
- **`JSON.parse(texto)`**: hace el camino inverso — agarra ese texto y lo reconstruye como un array/objeto real de JavaScript, con el que podés volver a trabajar normalmente (acceder a `.hex`, hacer `.forEach`, etc.).

Con esto en claro, vamos a los 3 pasos: HTML, CSS, JS.

#### 6.2.2 Paso 1: HTML — el espacio para los colores guardados

Abrí `index.html` y agregá esto **dentro** de `<section class="panel-control">`, justo después del `<button id="generar-paleta">` (todavía adentro de esa misma sección, antes del `</section>` de cierre):

```html
<div class="colores-guardados-panel">
    <h3>Colores guardados</h3>
    <button class="boton boton-secundario" id="guardar-bloqueados" type="button">
        Guardar colores bloqueados
    </button>
    <div class="lista-colores-guardados" id="lista-colores-guardados" aria-live="polite">
        <!-- acá JS va a pintar los colores guardados -->
    </div>
</div>
```

- **`<h3>`, no `<h2>` de nuevo**: ya tenés un `<h2>Configuración de paleta</h2>` como título de toda la sección. Este nuevo bloque es una **subsección** dentro de esa misma sección, así que semánticamente le corresponde un nivel más abajo en la jerarquía (`h3`) — HTML espera que los títulos bajen de nivel de forma ordenada (`h1` → `h2` → `h3`), no que saltes ni que repitas el mismo nivel para cosas de distinta jerarquía.
- **`type="button"`**: se lo agrego explícito (buena práctica) para que este botón, al estar potencialmente cerca de otros controles de formulario, nunca intente comportarse como un botón de "submit" por accidente (algo que puede pasar si en algún momento envolvés esto en un `<form>`).
- **`aria-live="polite"`** en el contenedor: mismo concepto que ya usamos en el toast — cuando agreguemos o saquemos colores guardados dinámicamente, un lector de pantalla va a anunciar el cambio.

#### 6.2.3 Paso 2: CSS — cómo se ven los colores guardados

Agregá esto en `layout.css`:

```css
/*==> panel de colores guardados <== */
.colores-guardados-panel {
    border-top: 1px solid var(--color-fondo-secundario);
    padding-top: var(--espacio-md);
    margin-top: var(--espacio-sm);
}

.lista-colores-guardados {
    display: flex;
    flex-wrap: wrap;
    gap: var(--espacio-sm);
    margin-top: var(--espacio-sm);
    min-height: 2.5rem;
}

.color-guardado {
    position: relative;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: var(--borde-radio-sm);
    box-shadow: var(--sombra-suave);
}

.boton-eliminar-guardado {
    position: absolute;
    top: -6px;
    right: -6px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: none;
    background-color: var(--color-fondo-oscuro);
    color: var(--color-texto-claro);
    font-size: 0.75rem;
    line-height: 1;
    cursor: pointer;
}
```

- **`flex-wrap: wrap`**: a diferencia de la cuadrícula de paleta (que usa `grid`), acá uso `flex` porque no sabemos de antemano cuántos colores va a haber guardados (puede ser 1 o puede ser 30) — con `flex-wrap: wrap`, los cuadraditos simplemente van llenando la fila y **saltan a la siguiente línea solo cuando ya no entran más**, sin necesidad de definir columnas fijas como sí necesita `grid`.
- **`min-height: 2.5rem`**: sin esto, cuando el contenedor está vacío (recién abriste la página y no guardaste nada todavía), ocuparía 0 píxeles de alto y "colapsaría" visualmente — con esto, siempre reserva un espacio mínimo, aunque esté vacío, evitando que el layout "salte" cuando aparece el primer color guardado.
- **`.color-guardado { position: relative; }`**: esto es necesario para que el botón de eliminar (que es `position: absolute`) se posicione **en relación a este cuadradito puntual**, y no en relación a toda la página. `position: absolute` siempre se ubica respecto al ancestro más cercano que tenga `position` distinto de `static` (el valor por defecto) — por eso hay que marcar explícitamente `relative` acá.
- **`top: -6px; right: -6px;`** en el botón de eliminar: valores negativos lo corren **hacia afuera** del cuadradito, generando el clásico efecto de "botoncito de eliminar flotando en la esquina superior derecha", una convención visual muy común en chips/tags.

#### 6.2.4 Paso 3: JavaScript — la lógica completa

Primero, agregá estas constantes nuevas junto a las que ya tenés arriba del archivo:

```js
const CLAVE_STORAGE = 'coloresGuardados';
const botonGuardarBloqueados = document.getElementById('guardar-bloqueados');
const listaColoresGuardados = document.getElementById('lista-colores-guardados');
```

`CLAVE_STORAGE` es simplemente el **nombre** bajo el cual vamos a guardar nuestros datos dentro de `localStorage` (que en el fondo funciona como un diccionario gigante de pares clave-valor, todo en texto). Usar una constante para este nombre, en vez de escribir el string `'coloresGuardados'` suelto cada vez que lo necesitemos, evita errores de tipeo (si en un lugar escribís `'coloresGuardados'` y en otro `'ColoresGuardados'`, con mayúscula distinta, ¡son dos claves totalmente distintas para `localStorage`, y tu código se rompe en silencio!).

Ahora, dos funciones "de bajo nivel" que van a ser la base de todo lo demás:

```js
//=< leer colores guardados desde localStorage >==
function obtenerColoresGuardados() {
    const datosGuardados = localStorage.getItem(CLAVE_STORAGE);
    return datosGuardados ? JSON.parse(datosGuardados) : [];
}

//=< escribir colores guardados en localStorage >==
function guardarEnStorage(coloresGuardados) {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(coloresGuardados));
}
```

- **`localStorage.getItem(CLAVE_STORAGE)`**: le pide al navegador "dame el texto guardado bajo esta clave". Si **nunca** guardaste nada con esa clave (por ejemplo, la primera vez que alguien abre tu página), esto devuelve `null`, no un error.
- **`datosGuardados ? JSON.parse(datosGuardados) : []`**: operador ternario de siempre. Si `datosGuardados` es un string real (algo se guardó antes), lo convertimos de texto a array real con `JSON.parse`. Si es `null` (nunca se guardó nada), devolvemos directamente un **array vacío** — esto es importante como "valor por defecto seguro": si no hiciéramos este chequeo e intentáramos usar `null` como si fuera un array más adelante (por ejemplo, con `.forEach` o `.filter`), el código explotaría con un error.
- **`localStorage.setItem(CLAVE_STORAGE, JSON.stringify(coloresGuardados))`**: al revés — convertimos nuestro array de JavaScript a texto con `JSON.stringify`, y se lo guardamos al navegador bajo esa clave. Esto sobreescribe completamente lo que hubiera antes bajo esa misma clave (no lo suma, lo reemplaza entero) — por eso, cada vez que llamamos a esta función, tenemos que pasarle el array **completo y actualizado**, no solo lo nuevo.

Ahora, la función que efectivamente guarda los colores bloqueados actuales:

```js
//=< guardar los colores bloqueados de la paleta actual >==
function guardarColoresBloqueados() {
    const bloqueadosActuales = paletaActual.filter((color) => color.bloqueado);

    if (bloqueadosActuales.length === 0) {
        mostrarToast('No hay colores bloqueados para guardar');
        return;
    }

    const coloresGuardados = obtenerColoresGuardados();

    bloqueadosActuales.forEach((color) => {
        const yaExiste = coloresGuardados.some((guardado) => guardado.hex === color.hex);

        if (!yaExiste) {
            coloresGuardados.push({
                hex: color.hex,
                hsl: color.hsl,
                colorTexto: color.colorTexto
            });
        }
    });

    guardarEnStorage(coloresGuardados);
    renderizarColoresGuardados();
    mostrarToast('Colores bloqueados guardados');
}
```

- **`paletaActual.filter((color) => color.bloqueado)`**: `.filter` es otro método de array (como `.forEach`, que ya conocés) — recorre todo el array, y por cada elemento evalúa la función que le pasás: si esa función devuelve `true`, ese elemento **queda** en un array nuevo que `.filter` arma y devuelve; si devuelve `false`, ese elemento se descarta. Acá, la condición es simplemente `color.bloqueado` (que ya es `true` o `false`), así que el resultado es: "todos los colores de la paleta actual que están bloqueados, y nada más".

- **El chequeo de `bloqueadosActuales.length === 0`**: si no hay ningún color bloqueado, no tiene sentido seguir — avisamos con un toast y **`return`** corta la ejecución de la función ahí mismo, sin llegar a las líneas de abajo. Esto es una buena práctica que se llama "guard clause" (cláusula de guardia): resolver primero el caso "raro" o inválido y salir temprano, para que el resto de la función pueda asumir que ese problema ya no existe.

- **`coloresGuardados.some((guardado) => guardado.hex === color.hex)`**: `.some()` es otro método de array — pregunta "¿existe **al menos un** elemento en este array que cumpla esta condición?", y devuelve directamente `true` o `false` (a diferencia de `.filter`, que devuelve un array completo). Acá lo usamos para chequear si ese color puntual (por su `hex`) **ya estaba guardado antes** — así evitamos duplicados: si guardás el mismo color bloqueado dos veces en distintos momentos, no vas a terminar con dos copias idénticas en tu lista.

- **`coloresGuardados.push({...})`**: si no existía, lo agregamos al final del array `coloresGuardados` (que, recordá, es el array que ya traíamos de `localStorage` con `obtenerColoresGuardados()`, no uno nuevo vacío) — guardamos solo `hex`, `hsl` y `colorTexto`, no la propiedad `bloqueado` (no tiene sentido acá, porque este es un color "guardado" en una lista aparte, no un color activo en la paleta que se esté generando).

Ahora, pintar esos colores guardados en el DOM:

```js
//=< pintar los colores guardados en el panel >==
function renderizarColoresGuardados() {
    const coloresGuardados = obtenerColoresGuardados();
    listaColoresGuardados.innerHTML = '';

    coloresGuardados.forEach((color) => {
        const item = document.createElement('div');
        item.classList.add('color-guardado');
        item.style.background = color.hsl;
        item.title = color.hex.toUpperCase();

        const botonEliminar = document.createElement('button');
        botonEliminar.type = 'button';
        botonEliminar.classList.add('boton-eliminar-guardado');
        botonEliminar.textContent = '×';
        botonEliminar.setAttribute('aria-label', `Eliminar color guardado ${color.hex.toUpperCase()}`);

        botonEliminar.addEventListener('click', () => eliminarColorGuardado(color.hex));

        item.appendChild(botonEliminar);
        listaColoresGuardados.appendChild(item);
    });
}
```

- **`item.title = color.hex.toUpperCase();`**: `title` es un atributo HTML nativo que, al pasar el mouse por encima de cualquier elemento durante un par de segundos, el navegador muestra automáticamente un pequeño tooltip nativo con ese texto — gratis, sin código adicional. Es un lindo mini-detalle: al pasar el mouse por un color guardado, ves su código HEX sin hacer nada extra.
- El resto sigue el mismo patrón que ya conocés de `renderizarPaleta`: crear elemento, ponerle clase, ponerle estilo, agregar un botón con su propio listener, y adjuntarlo todo al contenedor.

Y la función que elimina uno puntual:

```js
//=< eliminar un color guardado específico >==
function eliminarColorGuardado(hex) {
    const coloresGuardados = obtenerColoresGuardados();
    const coloresFiltrados = coloresGuardados.filter((color) => color.hex !== hex);

    guardarEnStorage(coloresFiltrados);
    renderizarColoresGuardados();
}
```

Acá `.filter` se usa con la condición **inversa** a un chequeo de existencia: "quedate con todos los colores cuyo `hex` **no** sea igual al que quiero eliminar" (`!==`, distinto de) — el resultado es un array idéntico al original, pero sin ese color puntual. Guardamos ese array recortado, y volvemos a pintar.

#### 6.2.5 Conectar todo

Al final del archivo, agregá el listener del nuevo botón:

```js
botonGuardarBloqueados.addEventListener('click', guardarColoresBloqueados);
```

Y esta línea, **suelta, al final de todo el archivo** (no dentro de ninguna función):

```js
//=< al cargar la página, mostrar lo que ya estaba guardado de antes >==
renderizarColoresGuardados();
```

Esta última línea es clave y fácil de pasar por alto: sin ella, aunque tengas colores guardados de una sesión anterior en `localStorage`, **no aparecerían en pantalla** hasta que hicieras alguna acción — porque `renderizarColoresGuardados()` solo se ejecutaría cuando alguien guarda o elimina un color, nunca al abrir la página por primera vez. Esta línea corre **una sola vez**, apenas se carga el script, y "recupera" visualmente lo que ya existía guardado de antes.

#### 6.2.6 Cómo probarlo

1. Generá una paleta, bloqueá un par de colores.
2. Clic en "Guardar colores bloqueados" → deberían aparecer como cuadraditos chicos en el panel izquierdo, con el toast confirmando.
3. **Recargá la página completa (F5)** → los cuadraditos guardados tienen que seguir ahí, aunque la paleta principal se haya reseteado (porque `paletaActual` sí es memoria RAM que se pierde, pero lo guardado en `localStorage` no).
4. Clic en la "×" de un color guardado → tiene que desaparecer, y si volvés a recargar, seguir sin aparecer (confirmando que realmente se borró del storage, no solo de la pantalla).

Contame cómo te fue, y si querés, el siguiente paso natural sería hacer que **clickear un color guardado también lo copie al portapapeles** (reutilizando la función que ya tenés) — pero eso lo vemos después de que confirmes que esto funciona.

---

## 7. Organización y priorización del trabajo

### 7.1 Prompt

tengo que hacer un proyecto, te copio la consigna para que veas que es lo que hay que hacer y como organizarlo. La entrega es el día jueves 23 de este mes pero quiero tener el proyecto listo el martes 21. Igual tengo pensado meterle unas 4 horas, cómo mínimo por día. El sábado y domingo mínimo trabajaría unas 5 horas en proyecto. Mándame un cronograma con las actividades en orden de prioridad.

### 7.2 Output

- **Jue 16 (hoy, ~4h):** Generación real de color (HSL→HEX) conectada al render → el corazón del MVP.
- **Vie 17 (~4h):** Microfeedback (toast) + accesibilidad básica (foco visible, contraste, `aria-live`).
- **Sáb 18 (~5h):** Responsive (mobile/tablet) + arranque de un extra (copiar HEX al portapapeles).
- **Dom 19 (~5h):** Bloqueo de colores + guardado en `localStorage`.
- **Lun 20 (~4h):** Animaciones sutiles, pulido de UI, README completo.
- **Mar 21 (~4h):** Revisión final, pruebas cruzadas, deploy en GitHub Pages, entrega.

Con esto ya tenés margen incluso para un colchón de imprevistos. Arrancamos entonces por lo más urgente: **conectar `generarColorAleatorio()` con el render real**, porque ahora mismo eso no pasa (repasá: `renderizaPaletaVacia()` solo pone texto `"Color #1"`, nunca llama a la función de color) y además falta `hslAHex()`, que ni siquiera existe todavía.