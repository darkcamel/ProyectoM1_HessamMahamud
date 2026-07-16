//=< elementos clave: variables definidas con elementos del html >==
const generarBoton = document.getElementById('generar-paleta');
const selectorTamano = document.getElementById('tamano-paleta');
const contenedorPaleta = document.getElementById('contenedor-paleta');

//=< evento click >==
generarBoton.addEventListener('click', () => {
    const tamano = parseInt(selectorTamano.value, 10);
    renderizaPaletaVacia(tamano);
});

//==< color aleatorio hsl >==
function generarColorAleatorio() {
    const h = Math.floor(Math.random() * 361);
    //--> matíz 360 grados
    const s = Math.floor(Math.random() * 31) + 55;
    // --> saturación de 55% a 85%
    const l = Math.floor(Math.random() * 21) + 45;
    // --> luminosidad 45% a 65%

    const hsl = `hsl(${h}, ${s}%, ${l}%)`;
    const hex = hslAHex(h, s, l);
    return { hsl, hex };
};

//=< función para vaciar y crear >==
function renderizaPaletaVacia(tamano) {
    contenedorPaleta.innerHTML = '';

    for (let i = 0; i < tamano; i++) {
        const tarjetaColor = document.createElement('div');
        tarjetaColor.classList.add('color-paleta');

        const placeholderText = document.createElement('span');
        placeholderText.textContent = `Color #${i + 1}`;

        tarjetaColor.appendChild(placeholderText);
        contenedorPaleta.appendChild(tarjetaColor);
    };
};

//=< HSL a RGB >==
function hslARgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;

    if (s === 0) {
        r = g = b = l;

    } else {

        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h  - 1 / 3);
    };

    
};
