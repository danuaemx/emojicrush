// js/audio.js
import state from './state.js';

// Inicializamos el AudioContext para la Web Audio API.
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

/**
 * Función base para reproducir un sonido.
 * @param {number} freq - Frecuencia del sonido en Hz.
 * @param {number} duration - Duración en segundos.
 * @param {string} type - Tipo de onda (sine, square, sawtooth, triangle).
 * @param {number} volume - Volumen del sonido (0 a 1).
 */
function playSound(freq, duration = 0.1, type = 'sine', volume = 0.1) {
  if (!state.audioOn || !audioCtx) return;
  try {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = type;
    oscillator.frequency.value = freq;
    gainNode.gain.value = volume;
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.warn("No se pudo reproducir el sonido.", e);
  }
}

// Funciones específicas para cada evento de sonido del juego.
export function playComboSound(size) { if (size >= 10) playSound(880, 0.25, 'square', 0.2); else if (size >= 5) playSound(784, 0.2, 'square', 0.2); else if (size >= 4) playSound(660, 0.12, 'sawtooth', 0.12); else playSound(330 + size * 40, 0.06, 'triangle', 0.08); }
export function playSpecialSound(type) {
    if(type === 'BOMB') { playSound(200, 0.1, 'sawtooth', 0.2); setTimeout(() => playSound(400, 0.2, 'sawtooth', 0.2), 100); }
    else if(type === 'RAINBOW') { playSound(1047, 0.3, 'sine', 0.25); }
    else { playSound(880, 0.05, 'sine', 0.1); setTimeout(() => playSound(1320, 0.1, 'sine', 0.12), 50); }
}
export function playIceBreakSound() { playSound(600, 0.15, 'triangle', 0.15); }
export function playLevelCompleteSound() { [523, 659, 784, 1047].forEach((n, i) => setTimeout(() => playSound(n, 0.15, 'square', 0.15), i * 150)); }
export function playGameOverSound() { [440, 415, 392, 370].forEach((n, i) => setTimeout(() => playSound(n, 0.2, 'sawtooth', 0.1), i * 200)); }
export function playPowerupSound() { playSound(1200, 0.2, 'triangle', 0.15); }
export function playShuffleSound() { playSound(440, 0.1, 'sine', 0.08); }
export function playInvalidMoveSound() { playSound(220, 0.06, 'sine', 0.04); }
export function playSwapSound() { playSound(440, 0.06, 'triangle', 0.06); }
export function playBombSound() { playSound(110, 0.2, 'triangle', 0.3); }
export function playHammerSound() { playSound(150, 0.2, 'square', 0.3); }
