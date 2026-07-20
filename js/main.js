//=< punto de entrada: conecta el HTML con la lógica de los demás módulos >==

import { crearNuevaPaleta, establecerPaleta, obtenerPaletaActual, actualizarFormatoMostrado } from './paleta.js';
import { obtenerColoresGuardados, guardarEnStorage, renderizaColoresGuardados } from './almacenamiento.js';
import { mostrarToast } from './toast.js';

const generarBoton = document.getElementById('generar-paleta');
const selectorTamano = document.getElementById('tamano-paleta');
const selectorFormato = document.getElementById('formato-color');
const botonGuardarPaleta = document.getElementById('guardar-paleta');
const botonCargarPaleta = document.getElementById('cargar-paleta');

generarBoton.addEventListener('click', () => {
    const tamano = parseInt(selectorTamano.value, 10);
    crearNuevaPaleta(tamano);
    mostrarToast(`Paleta de ${tamano} colores generada`);
});

selectorFormato.addEventListener('change', () => {
    actualizarFormatoMostrado(selectorFormato.value);
});

botonGuardarPaleta.addEventListener('click', () => {
    const paletaActual = obtenerPaletaActual();

    if (paletaActual.length === 0) {
        mostrarToast('No hay ninguna paleta generada para guardar');
        return;
    };

    guardarEnStorage(paletaActual);
    renderizaColoresGuardados();
    mostrarToast('Paleta guardada');
});

botonCargarPaleta.addEventListener('click', () => {
    const paletaGuardada = obtenerColoresGuardados();

    if (paletaGuardada.length === 0) {
        mostrarToast('No hay ninguna paleta guardada');
        return;
    };

    establecerPaleta(paletaGuardada);
    selectorTamano.value = paletaGuardada.length;
    mostrarToast('Paleta cargada');
});

renderizaColoresGuardados();