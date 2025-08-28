// js/events.js
import state from './state.js';
import * as dom from './dom.js';
import * as ui from './ui.js';
import * as audio from './audio.js';
import { trySwap, usePower, resetGame, setupGameMode } from './game.js';

/**
 * Manejador para el evento 'pointerdown' en una ficha.
 * Gestiona la selección, el intercambio por clic o por deslizamiento.
 * @param {PointerEvent} e - El objeto del evento.
 */
export function onPointerDown(e) {
    if (!state.running || state.processingMove) return;
    const tileEl = e.target.closest('.tile');
    if (!tileEl) return;
    const index = parseInt(tileEl.dataset.index, 10);

    if (state.activePower) {
        usePower(state.activePower, index);
        return;
    }

    if (state.selected !== null) {
        const tempSelected = state.selected;
        state.selected = null;
        ui.renderBoard();
        trySwap(tempSelected, index);
    } else {
        state.selected = index;
        ui.renderBoard();
        let startX = e.clientX, startY = e.clientY;
        const onPointerMove = (moveE) => {
            const dx = moveE.clientX - startX, dy = moveE.clientY - startY;
            const boardSize = parseFloat(dom.boardEl.style.width);
            const tileSize = boardSize / state.WIDTH;
            if (Math.sqrt(dx * dx + dy * dy) < tileSize * 0.4) return;

            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerUp);
            const [r, c] = [Math.floor(index / state.WIDTH), index % state.WIDTH];
            let targetIndex;
            if (Math.abs(dx) > Math.abs(dy)) targetIndex = (r * state.WIDTH) + c + (dx > 0 ? 1 : -1);
            else targetIndex = (r + (dy > 0 ? 1 : -1)) * state.WIDTH + c;

            if (targetIndex >= 0 && targetIndex < state.WIDTH * state.HEIGHT) trySwap(index, targetIndex);
            state.selected = null;
            ui.renderBoard();
        };
        const onPointerUp = () => {
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerUp);
            state.selected = null;
            ui.renderBoard();
        };
        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
    }
}

/**
 * Inicializa todos los manejadores de eventos para los botones y la ventana.
 */
export function initEventListeners() {
    dom.btnToggleDifficulty.addEventListener('click', () => {
        // MODIFICADO: Cambia entre los nuevos modos de juego
        const newMode = state.gameMode === 'easy' ? 'hard' : 'easy';
        setupGameMode(newMode);
        resetGame();
    });

    dom.btnRestart.addEventListener('click', () => {
        resetGame();
        dom.settingsMenu.classList.remove('show');
    });

    dom.btnSound.addEventListener('click', () => {
        state.audioOn = !state.audioOn;
        dom.btnSound.textContent = state.audioOn ? '🔊' : '🔇';
        dom.btnSound.title = state.audioOn ? 'Silenciar' : 'Activar Sonido';
    });

    dom.btnSettings.addEventListener('click', (e) => {
        e.stopPropagation();
        dom.settingsMenu.classList.toggle('show');
    });

    dom.powerBombBtn.addEventListener('click', () => {
        if (state.superpowers.bomb > 0) {
            state.activePower = state.activePower === 'bomb' ? null : 'bomb';
            ui.updateUI();
        }
    });

    dom.powerHammerBtn.addEventListener('click', () => {
        if (state.superpowers.hammer > 0) {
            state.activePower = state.activePower === 'hammer' ? null : 'hammer';
            ui.updateUI();
        }
    });

    dom.powerTimeBtn.addEventListener('click', () => {
        if (state.superpowers.time > 0 && state.level >= 4) {
            state.superpowers.time--;
            state.timeLeft += 10;
            audio.playPowerupSound();
            ui.updateUI();
        }
    });

    document.body.addEventListener('click', (e) => {
        if (dom.settingsMenu.classList.contains('show') && !dom.settingsMenu.contains(e.target) && e.target !== dom.btnSettings) {
            dom.settingsMenu.classList.remove('show');
        }
    });

    window.addEventListener('resize', ui.resizeBoard);
}
