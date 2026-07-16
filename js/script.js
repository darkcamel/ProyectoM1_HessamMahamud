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
    
    const hsl = `hsl(${h}), ${s}%, ${l}%`;
    const hex =
    return { hsl, hex }
}

//=< función para vaciar y crear >==
function renderizaPaletaVacia(tamano) {
    contenedorPaleta.innerHTML = '';

    for (let i = 0; i < size; i++) {
        const tarjetaColor = document.createElement('div');
        tarjetaColor.classList.add('color-paleta');
        
        const placeholderText = document.createElement('span');
        placeholderText.textContent = `Color #${i + 1}`;
        
        tarjetaColor.appendChild(placeholderText);
        contenedorPaleta.appendChild(tarjetaColor);
    };
};