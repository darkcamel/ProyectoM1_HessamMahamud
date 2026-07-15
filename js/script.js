//=< elementos clave >==
const generateButton = document.getElementById('generate-palette');
const sizeSelec = document.getElementById('palette-size');
const paletteContainer = document.getElementById('palette-container');

//=< evento click >==
generateButton.addEventListener('Click', () => {
    const size = parseInt(sizeSelect.value, 10);
    renderEmptyPalette(size);
});

