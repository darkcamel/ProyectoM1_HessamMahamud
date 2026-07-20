//=< punto de entrada: conecta el HTML con la lógica de los demás módulos >==

import { crearNuevaPaleta, establecerPaleta, obtenerPaletaActual, actualizarFormatoMostrado } from './paleta.js';
import { guardarNuevaPaleta, renderizaPaletasGuardadas } from './almacenamiento.js';
import { mostrarToast } from './toast.js';

const generarBoton = document.getElementById('generar-paleta');
const selectorTamano = document.getElementById('tamano-paleta');
const selectorFormato = document.getElementById('formato-color');
const botonGuardarPaleta = document.getElementById('guardar-paleta');
const inputNombrePaleta = document.getElementById('input-nombre-paleta');

generarBoton.addEventListener('click', () => {
    const tamano = parseInt(selectorTamano.value, 10);
    crearNuevaPaleta(tamano);
    mostrarToast(`Paleta de ${tamano} colores generada`);
});

selectorFormato.addEventListener('change', () => {
    actualizarFormatoMostrado(selectorFormato.value);
});

//=< guarda la paleta actual con el nombre escrito en el input >==
botonGuardarPaleta.addEventListener('click', () => {
    const paletaActual = obtenerPaletaActual();

    if (paletaActual.length === 0) {
        mostrarToast('No hay ninguna paleta generada para guardar');
        return;
    };

    const nombre = inputNombrePaleta.value.trim();

    if (!nombre) {
        mostrarToast('Ingresá un nombre para la paleta');
        return;
    };

    guardarNuevaPaleta(paletaActual, nombre);
    renderizaPaletasGuardadas(cargarPaleta);
    mostrarToast('Paleta guardada');
    inputNombrePaleta.value = '';
});

//=< permitir guardar con Enter en vez de tener que tocar el botón >==
inputNombrePaleta.addEventListener('keydown', (evento) => {
    if (evento.key === 'Enter') {
        evento.preventDefault();
        botonGuardarPaleta.click();
    };
});

//=< qué hacer cuando se toca "Cargar" en una paleta guardada específica >==
function cargarPaleta(colores) {
    establecerPaleta(colores);
    selectorTamano.value = colores.length;
    mostrarToast('Paleta cargada');
};

renderizaPaletasGuardadas(cargarPaleta);