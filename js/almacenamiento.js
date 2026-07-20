//=< lectura/escritura de localStorage y lista visual de paleta guardada >==

const CLAVE_STORAGE = 'paletasGuardadas';
const listaColoresGuardados = document.getElementById('lista-colores-guardados');

export function obtenerPaletasGuardadas() {
    const datosGuardados = localStorage.getItem(CLAVE_STORAGE);
    return datosGuardados ? JSON.parse(datosGuardados) : [];
};

export function guardarEnStorage(paletas) {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(paletas));
};

//=> agrega paleta nueva a la colección
export function guardarNuevaPaleta(colores, nombre) {
    const paletas = obtenerPaletasGuardadas();

    const paletaNueva = {
        id: Date.now().toString(),
        nombre,
        colores,
    };

    paletas.push(paletaNueva);
    guardarEnStorage(paletas);
};

//=> elimina una paleta
export function eliminarPaletaGuardada(id) {
    const paletas = obtenerPaletasGuardadas();
    const paletasFiiltradas = paletas.filter((paleta) => paleta.id !== id);

    guardarEnStorage(paletasFiiltradas);
};

//=> carga paleta guardada
export function renderizaPaletasGuardadas(onCargar) {
    const paletas = obtenerPaletasGuardadas();
    listaColoresGuardados.innerHTML = '';

    paletas.forEach((paleta) => {
        const item = document.createElement('div');
        item.classList.add('paleta-guardada-item');

        //--> mini franjas de color, una por cada color de esa paleta
        const swatches = document.createElement('div');
        swatches.classList.add('paleta-guardada-swatches');

        paleta.colores.forEach((color) => {
            const miniSwatch = document.createElement('span');
            miniSwatch.classList.add('mini-swatch');
            miniSwatch.style.background = color.hsl;
            swatches.appendChild(miniSwatch);
        });

        const botonCargar = document.createElement('button');
        botonCargar.type = 'button';
        botonCargar.classList.add('boton-cargar-guardada');
        botonCargar.textContent = paleta.nombre;
        botonCargar.setAttribute('aria-label', `Cargar paleta guardada de ${paleta.colores.length} colores`);
        botonCargar.addEventListener('click', () => onCargar(paleta.colores));

        const botonEliminar = document.createElement('button');
        botonEliminar.type = 'button';
        botonEliminar.classList.add('boton-eliminar-guardado');
        botonEliminar.textContent = '×';
        botonEliminar.setAttribute('aria-label', 'Eliminar esta paleta guardada');
        botonEliminar.addEventListener('click', () => {
            eliminarPaletaGuardada(paleta.id);
            renderizaPaletasGuardadas(onCargar);
        });

        item.appendChild(swatches);
        item.appendChild(botonCargar);
        item.appendChild(botonEliminar);
        listaColoresGuardados.appendChild(item);
    });
};