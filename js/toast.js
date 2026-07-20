//=< mensaje flotante de feedback >==

const toast = document.getElementById('toast');
let idTemporizadorToast = null;

export function mostrarToast(mensaje) {
    toast.textContent = mensaje;
    toast.classList.add('visible');

    if (idTemporizadorToast) {
        clearTimeout(idTemporizadorToast);
    }

    idTemporizadorToast = setTimeout(() => {
        toast.classList.remove('visible');
    }, 2500);
};