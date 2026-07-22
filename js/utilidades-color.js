//=< conversión y generación de colores >==

export function hslARgb(h, s, l) {
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

export function rgbAHex(r, g, b) {
    const aHex = (canal) => canal.toString(16).padStart(2, '0');
    return `#${aHex(r)}${aHex(g)}${aHex(b)}`;
};

export function calcularLuminancia(r, g, b) {
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    return 0.2126 * rNorm + 0.7152 * gNorm + 0.0722 * bNorm;
};

export function generarColorAleatorio() {
    const h = Math.floor(Math.random() * 361);
    const s = Math.floor(Math.random() * 81) + 20;
    const l = Math.floor(Math.random() * 81) + 20;

    const hsl = `hsl(${h}, ${s}%, ${l}%)`;
    const [r, g, b] = hslARgb(h, s, l);
    const hex = rgbAHex(r, g, b);
    const rgb = `rgb(${r}, ${g}, ${b})`;
    const luminancia = calcularLuminancia(r, g, b);
    const colorTexto = luminancia > 0.5 ? 'var(--color-texto)' : 'var(--color-texto-claro)';

    return { hsl, hex, rgb, colorTexto };
};

export function formatoColor(color, formato) {
    switch (formato) {
        case 'HSL':
            return color.hsl;
        case 'RGB':
            return color.rgb;
        case 'HEX':
        default:
            return color.hex.toUpperCase();
    };
};