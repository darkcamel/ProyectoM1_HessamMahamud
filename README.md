# 🎨 Generador de Paleta de Colores

Aplicación web estática e interactiva que genera paletas de colores aleatorias, con opciones de personalización y persistencia local. Proyecto integrador del Módulo 1 — Full Stack (Henry).

**Demo en vivo:** _agregar acá el link de GitHub Pages una vez desplegado_

## Índice

- [Funcionalidades](#funcionalidades)
- [Tech stack](#tech-stack)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Cómo usar la aplicación](#cómo-usar-la-aplicación)
- [Cómo correrlo localmente](#cómo-correrlo-localmente)
- [Cómo desplegarlo en GitHub Pages](#cómo-desplegarlo-en-github-pages)
- [Accesibilidad](#accesibilidad)
- [Uso de herramientas de IA](#uso-de-herramientas-de-ia)

## Funcionalidades

### Obligatorias (MVP)

- Generación de paletas aleatorias de 6, 8 o 9 colores mediante un botón principal.
- Cada color se genera en formato **HSL** y se muestra su equivalente en **HEX**.
- Render dinámico según el tamaño de paleta elegido.
- Microfeedback visible (toast) al generar una paleta y al copiar un color.
- HTML semántico (`header`, `main`, `section`, `footer`).
- Accesibilidad básica: labels asociados a sus controles, contraste de texto calculado dinámicamente según la luminancia de cada color de fondo, y foco visible por teclado.
- Diseño responsive (desktop, tablet y mobile).

### Extra credit

- 🔒 **Bloqueo de colores**: cada color de la paleta se puede bloquear individualmente; al generar una paleta nueva, los colores bloqueados se mantienen y solo se randomizan los demás.
- 💾 **Guardado en `localStorage`**: los colores bloqueados se pueden guardar en una colección persistente, visible en el panel de configuración, que sobrevive a recargar o cerrar el navegador.
- 📋 **Copiar al portapapeles**: un clic sobre cualquier color de la paleta copia su código HEX.
- ✨ **Animaciones sutiles**: entrada en cascada de las tarjetas de color, microinteracciones en botones (hover/active), y respeto de la preferencia del sistema operativo `prefers-reduced-motion` para quienes prefieren menos movimiento en pantalla.

## Tech stack

- HTML5
- CSS3 (variables CSS, Grid, Flexbox, media queries, `@keyframes`)
- JavaScript (vanilla, sin frameworks ni librerías)
- Git / GitHub
- GitHub Pages (deploy)

## Estructura del proyecto

```
├── index.html
├── css/
│   ├── styles.css              # entry point, importa el resto
│   ├── reset.css                # normaliza estilos por defecto del navegador
│   ├── variables.css            # colores, espaciados, radios, sombras
│   ├── base.css                  # tipografía y estilos base de texto
│   └── layout.css                # layout, componentes, responsive, animaciones
├── js/
│   └── script.js                 # toda la lógica de la aplicación
└── README.md
```

## Cómo usar la aplicación

1. Elegí el tamaño de paleta deseado (6, 8 o 9 colores) en el selector.
2. Presioná **"Generar paleta de colores"**.
3. Hacé clic sobre cualquier color para copiar su código HEX al portapapeles.
4. Presioná el ícono de candado (🔓/🔒) sobre un color para bloquearlo — ese color se va a mantener en las próximas paletas que generes.
5. Presioná **"Guardar colores bloqueados"** para agregarlos a tu colección persistente en el panel izquierdo. Esa colección se mantiene aunque recargues o cierres el navegador.
6. Para eliminar un color guardado, presioná la "×" sobre su miniatura.

Toda la aplicación es navegable por teclado (tecla `Tab` para moverte entre controles, `Enter`/`Espacio` para activar botones y tarjetas de color).

## Cómo correrlo localmente

1. Cloná el repositorio:
   ```bash
   git clone <url-de-tu-repositorio>
   cd <nombre-de-la-carpeta>
   ```
2. **Importante:** la función de copiar al portapapeles requiere un contexto seguro (`https://` o `http://localhost`) — no funciona si abrís `index.html` directamente con doble clic (`file://`).
3. La forma más simple de levantarlo es con la extensión **Live Server** de VS Code: clic derecho sobre `index.html` → **"Open with Live Server"**.
   - Alternativa sin VS Code: desde la carpeta del proyecto, correr `python -m http.server` y abrir `http://localhost:8000` en el navegador.

## Cómo desplegarlo en GitHub Pages

1. Subí el proyecto a un repositorio público de GitHub.
2. Andá a **Settings → Pages** en el repositorio.
3. En "Source", elegí la rama `main` (o la que corresponda) y la carpeta raíz (`/`).
4. Guardá los cambios. GitHub va a generar una URL del estilo `https://<usuario>.github.io/<repositorio>/` en unos minutos.
5. Actualizá el link de "Demo en vivo" al principio de este README con esa URL.

## Accesibilidad

- Labels (`<label for="...">`) asociados correctamente a sus controles.
- Contraste de texto calculado dinámicamente: se mide la luminancia relativa de cada color de fondo generado y se elige texto claro u oscuro según corresponda, evitando combinaciones ilegibles.
- Foco visible (`:focus-visible`) en todos los elementos interactivos: botones, select, y tarjetas de color.
- Tarjetas de color y botones de bloqueo operables por teclado (`tabindex`, manejo de `Enter`/`Espacio`, atributos `role`, `aria-label` y `aria-pressed` donde corresponde).
- Mensajes de estado (toast, colecciones guardadas) con `aria-live="polite"` para que sean anunciados por lectores de pantalla.
- Las animaciones se desactivan automáticamente si el sistema operativo del usuario tiene activada la preferencia `prefers-reduced-motion: reduce`.

## Uso de herramientas de IA

Durante el desarrollo utilicé **Claude (Anthropic)** como apoyo para entender conceptos y validar decisiones técnicas, no para que escribiera el proyecto por mí sin supervisión. Trabajé pidiendo explicaciones detalladas, paso a paso, de cada pieza de código antes de incorporarla, dado que estoy empezando en programación.

**Temas en los que usé asistencia de IA, y qué influencia tuvieron:**

- **Conversión de color HSL → RGB → HEX**: pedí que me explicara la matemática detrás de la conversión (normalización de valores, interpolación de matices) porque JavaScript no tiene una función nativa directa de HSL a HEX. Entendí el porqué de cada paso antes de escribirlo.
- **Cálculo de contraste de texto**: consulté cómo determinar automáticamente si un texto debe ir claro u oscuro según el color de fondo, lo que derivó en implementar una fórmula de luminancia relativa (con los pesos perceptuales de rojo, verde y azul) en vez de confiar únicamente en rangos "seguros" de saturación/luminosidad.
- **Microfeedback (toast)**: pedí ayuda para estructurar un mensaje temporal accesible (`aria-live`), incluyendo el manejo de `setTimeout`/`clearTimeout` para evitar solapamientos si se generan paletas rápido.
- **Copiar al portapapeles**: consulté el uso de la API `navigator.clipboard` y el manejo de promesas (`.then`/`.catch`), además de los requisitos de accesibilidad para que la copia funcione también por teclado.
- **Bloqueo de colores y estado de la aplicación**: discutí cómo pasar de "generar y descartar" a mantener un estado (`paletaActual`) que permitiera preservar colores bloqueados entre generaciones.
- **Persistencia con `localStorage`**: pedí explicación de por qué localStorage solo maneja texto y cómo `JSON.stringify`/`JSON.parse` resuelven eso, aplicado a guardar y recuperar colores bloqueados.
- **Animaciones y `prefers-reduced-motion`**: consulté cómo agregar animaciones de entrada sutiles sin perjudicar a usuarios con sensibilidad al movimiento.
- **Organización y priorización del trabajo**: usé la IA también para planificar los días de trabajo restantes hasta la entrega, priorizando el MVP obligatorio antes que los extras, siguiendo la guía del proyecto.

En todos los casos, revisé, probé y en varios casos ajusté el código sugerido antes de incorporarlo (por ejemplo, corregí un bug donde el color de texto calculado no se estaba aplicando al DOM). El código final fue escrito, probado y corregido por mí en cada paso.
