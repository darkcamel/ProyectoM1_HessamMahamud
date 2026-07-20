//=< lectura/escritura de localStorage y lista visual de paleta guardada >==

const CLAVE_STORAGE = 'coloresGuardados';
const listaColoresGuardados = document.getElementById('lista-colores-guardados');

export function obtenerColoresGuardados() {
    const datosGuardados = localStorage.getItem(CLAVE_STORAGE);
    return datosGuardados ? JSON.parse(datosGuardados) : [];
};

export function guardarEnStorage(coloresGuardados) {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(coloresGuardados));
};

export function renderizaColoresGuardados() {
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
};

export function eliminarColorGuardado(hex) {
    const coloresGuardados = obtenerColoresGuardados();
    const coloresFiltrados = coloresGuardados.filter((color) => color.hex !== hex);

    guardarEnStorage(coloresFiltrados);
    renderizaColoresGuardados();
};