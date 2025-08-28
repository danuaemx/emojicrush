// js/main.js
import { initEventListeners } from './events.js';
import { setupGameMode, resetGame } from './game.js';
import { initParticleStyle } from './utils.js';

/**
 * Función de inicialización principal del juego.
 * Se ejecuta cuando la ventana ha cargado completamente.
 */
function init() {
    // Inyecta los estilos para las animaciones de partículas
    initParticleStyle();

    // Configura los manejadores de eventos para los controles del juego
    initEventListeners();

    // Establece el modo de juego inicial
    // MODIFICADO: Usa el nuevo nombre de modo de juego
    setupGameMode('easy');

    // Inicia o reinicia el juego
    resetGame();
}

// Espera a que el DOM esté completamente cargado para iniciar el juego.
window.addEventListener('load', init);
