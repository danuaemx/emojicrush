// js/ui.js
import state from './state.js';
import * as dom from './dom.js';
import * as config from './config.js';
import { onPointerDown } from './events.js';
import { awardSuperpower } from './game.js';

/**
 * Dibuja el tablero completo en el DOM basado en el estado actual.
 * Asigna los manejadores de eventos a cada ficha.
 */
export function renderBoard() {
    dom.boardEl.innerHTML = '';
    state.board.forEach((emoji, i) => {
        const tile = document.createElement('div');
        const obstacleType = state.obstacles[i];
        tile.className = 'tile';
        tile.dataset.index = i;

        const emojiEl = document.createElement('div');
        emojiEl.className = 'emoji';
        emojiEl.textContent = emoji || '';
        tile.appendChild(emojiEl);

        if (obstacleType) {
            // Convierte nombres como 'iceBomb' a 'ice-bomb' para que coincida con la clase CSS
            const className = obstacleType.replace(/([A-Z])/g, '-$1').toLowerCase();
            tile.classList.add(className);
        }

        if (state.special[i]) {
            tile.dataset.special = state.special[i];
            const specialEl = document.createElement('div');
            specialEl.className = 'special-icon';
            tile.appendChild(specialEl);
        }

        // NUEVO: Añadir clase de daño si el obstáculo tiene vida y ha sido dañado
        if (obstacleType && state.obstacleHealth[i] && config.specialObstaclesConfig[obstacleType]) {
            const maxHealth = config.specialObstaclesConfig[obstacleType].health;
            if (state.obstacleHealth[i] < maxHealth) {
                const damageLevel = maxHealth - state.obstacleHealth[i];
                tile.classList.add(`damaged-${damageLevel}`);
            }
        }

        if (state.selected === i) tile.classList.add('selected');
        if (state.objectiveEmojis.includes(emoji) && !state.special[i]) tile.classList.add('objective');

        tile.addEventListener('pointerdown', onPointerDown);
        dom.boardEl.appendChild(tile);
    });
    updateUI();
}

/**
 * Actualiza todos los elementos de la interfaz de usuario (puntuación, nivel, etc.).
 */
export function updateUI() {
    dom.scoreEl.textContent = state.score;
    dom.levelEl.textContent = state.level;

    const scoreForProgress = state.score - state.scoreAtLevelStart;
    const progressPercentage = Math.min(100, (scoreForProgress / state.targetScore) * 100);
    dom.progressBarEl.style.width = `${progressPercentage}%`;

    if (scoreForProgress >= state.targetScore) {
        state.scoreAtLevelStart += state.targetScore;
        awardSuperpower();
        showComboText('¡Poder Obtenido!');
    }

    if (state.level >= config.TIMER_START_LEVEL) {
        const timeLeftEl = document.getElementById('time-left');
        if (timeLeftEl) timeLeftEl.textContent = state.timeLeft;
        document.getElementById('timer-display')?.classList.toggle('low', state.timeLeft <= 10);
    } else {
        const movesDisplayEl = document.getElementById('moves-display');
        if (movesDisplayEl) movesDisplayEl.textContent = state.moves;
        document.getElementById('moves-counter')?.classList.toggle('low', state.moves <= 5);
    }
    updateSuperpowersUI();
}

/**
 * Actualiza la UI de los superpoderes.
 */
function updateSuperpowersUI() {
    dom.powerBombCountEl.textContent = state.superpowers.bomb;
    dom.powerHammerCountEl.textContent = state.superpowers.hammer;
    dom.powerTimeCountEl.textContent = state.superpowers.time;
    dom.powerBombBtn.classList.toggle('active', state.activePower === 'bomb');
    dom.powerHammerBtn.classList.toggle('active', state.activePower === 'hammer');
    dom.boardWrapEl.classList.toggle('bomb-cursor', state.activePower === 'bomb');
    dom.boardWrapEl.classList.toggle('hammer-cursor', state.activePower === 'hammer');
}

/**
 * Configura y muestra los objetivos para el nivel actual.
 */
export function setupObjectives() {
    dom.objectivesContainerEl.innerHTML = '';

    if (state.level >= config.TIMER_START_LEVEL) {
        dom.objectivesContainerEl.innerHTML = `<div id="timer-display" class="objective-item timer-display"><div class="emoji">⏳</div><div class="count"><span id="time-left">${state.timeLeft}</span>s</div></div>`;
    } else {
        dom.objectivesContainerEl.innerHTML = `<div id="moves-counter" class="objective-item moves-counter"><div class="emoji">👟</div><div class="count" id="moves-display">${state.moves}</div></div>`;
    }

    state.objectiveEmojis = [];
    state.objectiveCounts = {};
    const numObjectives = Math.min(state.MAX_OBJECTIVES, 1 + Math.floor(state.level / 2));
    const available = [...state.EMOJIS];
    for (let i = 0; i < numObjectives; i++) {
        if (available.length === 0) break;
        const emoji = available.splice(Math.floor(Math.random() * available.length), 1)[0];
        state.objectiveEmojis.push(emoji);
        const target = state.OBJECTIVE_BASE_COUNT + Math.floor(state.level * 1.5);
        state.objectiveCounts[emoji] = { current: 0, target: target };
        const el = document.createElement('div');
        el.className = 'objective-item';
        el.id = `objective-${emoji}`;
        el.innerHTML = `<div class="emoji">${emoji}</div><div class="count"><span id="objective-${emoji}-current">0</span>/${target}</div>`;
        dom.objectivesContainerEl.appendChild(el);
    }
}

/**
 * Actualiza el progreso de los objetivos en la UI.
 */
export function updateObjectivesUI() {
    state.objectiveEmojis.forEach(emoji => {
        const currentEl = document.getElementById(`objective-${emoji}-current`);
        const objectiveEl = document.getElementById(`objective-${emoji}`);
        if (currentEl) {
            currentEl.textContent = state.objectiveCounts[emoji].current;
            if (state.objectiveCounts[emoji].current >= state.objectiveCounts[emoji].target) {
                objectiveEl.classList.add('complete');
            }
        }
    });
}

/**
 * Muestra un texto de combo flotante sobre el tablero.
 * @param {string} text - El texto a mostrar.
 */
export function showComboText(text) {
    const el = document.createElement('div');
    el.className = 'combo-text';
    el.textContent = text;
    dom.boardWrapEl.appendChild(el);
    setTimeout(() => el.remove(), 1500);
}

/**
 * Ajusta el tamaño del tablero y de las fichas para que quepan en la pantalla.
 */
export function resizeBoard() {
    const { clientWidth, clientHeight } = dom.boardWrapEl;
    const size = Math.min(clientWidth, clientHeight);
    dom.boardEl.style.width = `${size}px`;
    dom.boardEl.style.height = `${size}px`;
    const gap = parseFloat(getComputedStyle(dom.boardEl).gap);
    const tileSize = (size - (gap * 2) - (gap * (state.WIDTH - 1))) / state.WIDTH;
    document.documentElement.style.setProperty('--tile-font-size', `${tileSize * 0.7}px`);
}
