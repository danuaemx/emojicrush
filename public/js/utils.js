// js/utils.js
import state from './state.js';
import * as dom from './dom.js';

/**
 * Convierte coordenadas de fila y columna a un índice de array.
 * @param {number} r - Fila.
 * @param {number} c - Columna.
 * @returns {number} El índice en el array plano.
 */
export function idx(r, c) { return r * state.WIDTH + c; }

/**
 * Convierte un índice de array a coordenadas de fila y columna.
 * @param {number} i - El índice en el array.
 * @returns {[number, number]} Un array con [fila, columna].
 */
export function rc(i) { return [Math.floor(i / state.WIDTH), i % state.WIDTH]; }

/**
 * Comprueba si las coordenadas dadas están dentro de los límites del tablero.
 * @param {number} r - Fila.
 * @param {number} c - Columna.
 * @returns {boolean} True si está dentro de los límites.
 */
export function inBounds(r, c) { return r >= 0 && r < state.HEIGHT && c >= 0 && c < state.WIDTH; }

/**
 * Devuelve un emoji aleatorio de la lista de emojis del modo de juego actual.
 * @returns {string} Un emoji.
 */
export function randEmoji() { return state.EMOJIS[Math.floor(Math.random() * state.EMOJIS.length)]; }

/**
 * Crea partículas para efectos visuales en una coordenada específica.
 * @param {number} x - Coordenada X.
 * @param {number} y - Coordenada Y.
 * @param {number} count - Número de partículas a crear.
 * @param {string} color - Color de las partículas.
 */
export function createParticles(x, y, count = 8, color = '#ff6b6b') {
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:6px;height:6px;background:${color};border-radius:50%;animation:p-anim 1s ease-out forwards;--tx:${Math.random()*120-60}px;`;
        dom.particlesEl.appendChild(p);
        setTimeout(() => p.remove(), 1000);
    }
}

/**
 * NUEVO: Helper para crear partículas en la posición de una ficha.
 * @param {number} i - Índice de la ficha.
 * @param {string} color - Color de las partículas.
 */
export function createParticlesForTile(i, color = '#ff6b6b') {
    const tileEl = getTileEl(i);
    if (tileEl) {
        const wrapRect = dom.boardWrapEl.getBoundingClientRect();
        const tileRect = tileEl.getBoundingClientRect();
        const x = tileRect.left - wrapRect.left + tileRect.width / 2;
        const y = tileRect.top - wrapRect.top + tileRect.height / 2;
        createParticles(x, y, 8, color);
    }
}


/**
 * Inyecta los estilos CSS necesarios para la animación de partículas.
 */
export function initParticleStyle() {
    const pStyle = document.createElement("style");
    pStyle.innerText = `@keyframes p-anim{0%{transform:scale(1);opacity:1}100%{transform:scale(0) translateY(100px) translateX(var(--tx));opacity:0}}`;
    document.head.appendChild(pStyle);
}

/**
 * Obtiene el elemento DOM de una ficha por su índice.
 * @param {number} i - El índice de la ficha.
 * @returns {Element|null} El elemento de la ficha.
 */
export function getTileEl(i) { return dom.boardEl.querySelector(`.tile[data-index="${i}"]`); }
