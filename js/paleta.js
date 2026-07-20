//=< estado de la paleta actual y su renderizado >==

import { generarColorAleatorio, formatoColor } from './utilidades-color.js';
import { mostrarToast } from './toast.js';

const contenedorPaleta = document.getElementById('contenedor-paleta');
const selectorFormato = document.getElementById('formato-color');

let paletaActual = [];

export function obtenerPaletaActual() {
    return paletaActual;
};

export function establecerPaleta(nuevaPaleta) {
    paletaActual = nuevaPaleta;
    renderizaPaleta();
};

export function crearNuevaPaleta(tamano) {
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

    paletaActual = nuevaPaleta;
    renderizaPaleta();
};

export function renderizaPaleta() {
    contenedorPaleta.innerHTML = '';

    paletaActual.forEach((color, indice) => {
        const tarjetaColor = document.createElement('div');
        tarjetaColor.classList.add('color-paleta');
        tarjetaColor.style.background = color.hsl;

        if (color.bloqueado) {
            tarjetaColor.classList.add('bloqueado');
        }

        const textoHex = document.createElement('span');
        textoHex.textContent = formatoColor(color, selectorFormato.value);
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
            };
        });
    });
};

export function alternarBloqueo(indice) {
    paletaActual[indice].bloqueado = !paletaActual[indice].bloqueado;
    renderizaPaleta();
};

export function copiarAlPortapapeles(hex) {
    navigator.clipboard.writeText(hex)
        .then(() => {
            mostrarToast(`Copiado ${hex.toUpperCase()} al portapapeles`);
        })
        .catch(() => {
            mostrarToast('No se pudo copiar el color');
        });
};

export function actualizarFormatoMostrado(formato) {
    const spansDeColor = contenedorPaleta.querySelectorAll('.color-paleta span');

    spansDeColor.forEach((span, indice) => {
        span.textContent = formatoColor(paletaActual[indice], formato);
    });
};