//=< elementos clave: variables definidas con elementos del html >==
const generateButton = document.getElementById('generate-palette');
const sizeSelect = document.getElementById('palette-size');
const paletteContainer = document.getElementById('palette-container');

//=< evento click >==
generateButton.addEventListener('click', () => {
    const size = parseInt(sizeSelect.value, 10);
    renderEmptyPalette(size);
});

//=< función para vaciar y crear >==
function renderEmptyPalette(size) {
    paletteContainer.innerHTML = '';

    for (let i = 0; i < size; i++) {
        const colorCard = document.createElement('div');
        colorCard.classList.add('palette-color');
        
        const placeholderText = document.createElement('span');
        placeholderText.textContent = `Color #${i + 1}`;
        
        colorCard.appendChild(placeholderText);
        paletteContainer.appendChild(colorCard);
    };
};