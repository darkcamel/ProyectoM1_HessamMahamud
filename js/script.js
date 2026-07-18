//=< elementos clave: variables globales definidas >==
const generarBoton = document.getElementById('generar-paleta');
const selectorTamano = document.getElementById('tamano-paleta');
const contenedorPaleta = document.getElementById('contenedor-paleta');
const toast = document.getElementById('toast');
let paletaActual = [];

/* console.log(generarBoton, selectorTamano, contenedorPaleta, toast), paletaActual; */

//=< evento click >==
generarBoton.addEventListener('click',  () => {
    const tamano = parseInt(selectorTamano.value, 10);
    crearNuevaPaleta(tamano);
    mostrarToast(`Paleta de ${tamano} colores generada`);
});

//==< color aleatorio hsl >==
function generarColorAleatorio() {
    const h = Math.floor(Math.random() * 361);
    //--> matíz 360 grados
    const s = Math.floor(Math.random() * 81) + 20;
    // --> saturación de 55% a 85%
    const l = Math.floor(Math.random() * 81) + 20;
    // --> luminosidad 45% a 65%

    const hsl = `hsl(${h}, ${s}%, ${l}%)`;

    const [r, g, b] = hslARgb(h, s, l);
    const hex = rgbAHex(r, g, b);
    const luminancia = calcularLuminancia(r, g, b);
    const colorTexto = luminancia > 0.5 ? 'var(--color-texto)' : 'var(--color-texto-claro)';
    return { hsl, hex, colorTexto };
};

//=< función para vaciar y crear >==
/* function renderizaPaleta(tamano) {
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

        tarjetaColor.addEventListener('click', () => copiarAlPortapapeles(color.hex));

        tarjetaColor.addEventListener('keydown', (evento) => {
            if (evento.key === 'Enter' || evento.key === ' ') {
                evento.preventDefault();
                copiarAlPortapapeles(color.hex);
            };
        });
    };   
}; */

//=< colores paleta nueva respetando bloqueo >==
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
        };
    };

    paletaActual = nuevaPaleta
    renderizaPaleta();
};

//=< renderiza colores en pantalla >==
function renderizaPaleta() {
    contenedorPaleta.innerHTML = '';

    paletaActual.forEach((color, indice) => {
        const tarjetaColor = document.createElement('div');
        tarjetaColor.classList.add('color-paleta');
        tarjetaColor.style.background = color.hsl;

        if (color.bloqueado) {
            tarjetaColor.classList.add('bloqueado');
        }

        const textoHex = document.createElement('span');
        textoHex.textContent = color.hex.toUpperCase();
        textoHex.style.color = color.colorTexto;

        const botonBloqueo = document.createElement('button');
        botonBloqueo.type ='button';
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
            };
        });
    });
};

//=< cambia a estado de boqueo >==
function alternarBloqueo(indice) {
    paletaActual[indice].bloqueado = !paletaActual[indice].bloqueado;
    renderizaPaleta();
};

//=< hsl a rgb >==
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
        b = hue2rgb(p, q, h - 1 / 3);
    };

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

//=< rgb a hex >==
function rgbAHex(r, g, b) {
    const aHex = (canal) => canal.toString(16).padStart(2, '0');
    return `#${aHex(r)}${aHex(g)}${aHex(b)}`;
};

//=< hsl a hex >==
function hslAHex(h, s, l) {
    const [r, g, b] = hslARgb(h, s, l);
    return rgbAHex(r, g, b);
};

//=< calcular luminancia para texto >==
function calcularLuminancia(r, g, b) {
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;

    return 0.2126 * rNorm + 0.7152 * gNorm + 0.0722 * bNorm;
};

//=< mostrat toast >==
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
};

//=< copiar hex al portapapeles >==
function copiarAlPortapapeles(hex) {
    navigator.clipboard.writeText(hex)
        .then(() => {
            mostrarToast(`Copiado ${hex.toUpperCase()} al portapapeles`);
        })
        .catch(() => {
            mostrarToast(`No se pudo copiar el color`)
        });
};