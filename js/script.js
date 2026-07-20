//=< variables globales >==
const generarBoton = document.getElementById('generar-paleta');
const selectorTamano = document.getElementById('tamano-paleta');
const contenedorPaleta = document.getElementById('contenedor-paleta');
const toast = document.getElementById('toast');
let paletaActual = [];
const CLAVE_STORAGE = 'coloresGuardados';
const botonGuardarBloqueados = document.getElementById('guardar-bloqueados');
const listaColoresGuardados = document.getElementById('lista-colores-guardados');
let idTemporizadorToast = null;
const selectorFormato = document.getElementById('formato-color');

//=< eventos >==
generarBoton.addEventListener('click',  () => {
    const tamano = parseInt(selectorTamano.value, 10);
    crearNuevaPaleta(tamano);
    mostrarToast(`Paleta de ${tamano} colores generada`);
});

botonGuardarBloqueados.addEventListener('click', guardarColoresBloqueados);
renderizaColoresGuardados();

selectorFormato.addEventListener('change', () => {
    const formato = selectorFormato.value;
    const spansDeColor = contenedorPaleta.querySelectorAll('.color-paleta span');

    spansDeColor.forEach((span, indice) => {
        span.textContent = formatoColor(paletaActual[indice], formato);
    });
});

//=< funciones >==
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
    const rgb = `rgb(${r}, ${g}, ${b})`;
    const luminancia = calcularLuminancia(r, g, b);
    const colorTexto = luminancia > 0.5 ? 'var(--color-texto)' : 'var(--color-texto-claro)';
    return { hsl, hex, rgb, colorTexto };
};

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
        textoHex.textContent = formatoColor(color, selectorFormato.value); // modificado para cambiar entre hex, hsl y rgb.
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

function alternarBloqueo(indice) {
    paletaActual[indice].bloqueado = !paletaActual[indice].bloqueado;
    renderizaPaleta();
};

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

function rgbAHex(r, g, b) {
    const aHex = (canal) => canal.toString(16).padStart(2, '0');
    return `#${aHex(r)}${aHex(g)}${aHex(b)}`;
};

function hslAHex(h, s, l) {
    const [r, g, b] = hslARgb(h, s, l);
    return rgbAHex(r, g, b);
};

function calcularLuminancia(r, g, b) {
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;

    return 0.2126 * rNorm + 0.7152 * gNorm + 0.0722 * bNorm;
};

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

function copiarAlPortapapeles(hex) {
    navigator.clipboard.writeText(hex)
        .then(() => {
            mostrarToast(`Copiado ${hex.toUpperCase()} al portapapeles`);
        })
        .catch(() => {
            mostrarToast(`No se pudo copiar el color`)
        });
};

function obtenerColoresGuradados() {
    const datosGuardados = localStorage.getItem(CLAVE_STORAGE);
    return datosGuardados ? JSON.parse(datosGuardados) : [];
};

function guardarEnStorage(coloresGuardados) {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(coloresGuardados));
};

function guardarColoresBloqueados() {
    const bloqueadosActuales = paletaActual.filter((color) => color.bloqueado);

    if (bloqueadosActuales.length === 0) {
        mostrarToast('No hay colores bloqueados para guardar');
        return;
    };

    const coloresGuardados = obtenerColoresGuradados();

    bloqueadosActuales.forEach((color) => {
        const yaExiste = coloresGuardados.some((guardado) => guardado.hex === color.hex);

        if (!yaExiste) {
            coloresGuardados.push({
                hex: color.hex,
                hsl: color.hsl,
                colorTexto: color.colorTexto,
            });
        };
    });

    guardarEnStorage(coloresGuardados);
    renderizaColoresGuardados();
    mostrarToast('Colores bloqueados guardados');
};

function renderizaColoresGuardados() {
    const coloresGuardados = obtenerColoresGuradados();
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
};

function eliminarColorGuardado(hex) {
    const coloresGuardados = obtenerColoresGuradados();
    const coloresFiltrados = coloresGuardados.filter((color) => color.hex !== hex);

    guardarEnStorage(coloresFiltrados);
    renderizaColoresGuardados();
};

function formatoColor(color, formato) {
    switch (formato) {
        case 'RGB':
            return color.rgb;
        case 'HEX':
            return color.hex.toUpperCase();
    };
}; // función nueva