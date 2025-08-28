// js/game.js
import state from './state.js';
import * as config from './config.js';
import * as dom from './dom.js';
import * as utils from './utils.js';
import * as audio from './audio.js';
import * as ui from './ui.js';

// --- LÓGICA DE TEMPORIZADOR (sin cambios) ---
function startTimer() {
    stopTimer();
    state.timerInterval = setInterval(() => {
        state.timeLeft--;
        ui.updateUI();
        if (state.timeLeft <= 0) {
            stopTimer();
            checkGameState();
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
}

// --- LÓGICA DE OBSTÁCULOS ---

/**
 * Genera los nuevos obstáculos especiales (basura, bomba de hielo, etc.)
 * basándose en la configuración de config.js.
 */
function spawnSpecialObstacles() {
    const modeLimits = config.gameModes[state.gameMode].SPECIAL_OBSTACLES_LIMIT;

    for (const [type, conf] of Object.entries(config.specialObstaclesConfig)) {
        if (state.level >= conf.startLevel) {
            const currentCount = state.obstacles.filter(o => o === type).length;
            const maxAllowed = modeLimits[type] || 0;
            let toSpawn = maxAllowed - currentCount;

            for (let i = 0; i < toSpawn; i++) {
                let attempts = 0;
                while (attempts < 50) {
                    const randIdx = Math.floor(Math.random() * state.board.length);
                    // No puede aparecer en una casilla ya ocupada por otro obstáculo o especial
                    if (!state.obstacles[randIdx] && !state.special[randIdx]) {
                        state.obstacles[randIdx] = type;
                        state.obstacleHealth[randIdx] = conf.health;
                        break; // Sale del while y va a por el siguiente a spawnear
                    }
                    attempts++;
                }
            }
        }
    }
}


function spawnObstacles() {
    // Genera hielo y chocolate como antes
    let spawnedChocolates = 0;
    for (let attempt = 0; attempt < 20 && spawnedChocolates < state.chocolatesToSpawn; attempt++) {
        const i = Math.floor(Math.random() * state.board.length);
        if (!state.obstacles[i] && !state.special[i]) {
            state.obstacles[i] = 'chocolate';
            spawnedChocolates++;
        }
    }
    let spawnedIces = 0;
    for (let attempt = 0; attempt < 20 && spawnedIces < state.icesToSpawn; attempt++) {
        const i = Math.floor(Math.random() * state.board.length);
        if (!state.obstacles[i] && !state.special[i]) {
            state.obstacles[i] = 'ice';
            spawnedIces++;
        }
    }
    // Llama a la función para generar los nuevos obstáculos especiales
    spawnSpecialObstacles();
}

/**
 * Lógica para que las bombas de hielo expandan el hielo a su alrededor cada turno.
 */
function expandIce() {
    const iceBombConfig = config.specialObstaclesConfig.iceBomb;
    if (state.level < iceBombConfig.startLevel) return;

    const newIce = [];
    for (let i = 0; i < state.board.length; i++) {
        if (state.obstacles[i] === 'iceBomb') {
            const [r, c] = utils.rc(i);
            const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]].sort(() => Math.random() - 0.5);
            for (const [dr, dc] of dirs) {
                const ni = utils.idx(r + dr, c + dc);
                // Comprueba si la casilla adyacente está dentro de los límites y no es ya un obstáculo
                if (utils.inBounds(r + dr, c + dc) && !state.obstacles[ni]) {
                    // Usa la probabilidad de config.js para decidir si se expande
                    if (Math.random() * 100 < iceBombConfig.spreadRate) {
                        newIce.push(ni);
                        break; // Se expande solo a una casilla por turno para no ser demasiado agresivo
                    }
                }
            }
        }
    }

    newIce.forEach(i => {
        state.obstacles[i] = 'ice';
        if (state.special[i]) {
            state.special[i] = null;
        }
    });
}


/**
 * MODIFICADO: Lógica para que tanto el chocolate normal como los generadores se expandan.
 */
function expandChocolates() {
    const chocolateSpawnerConfig = config.specialObstaclesConfig.chocolateSpawner;
    const newChocolates = [];

    for (let i = 0; i < state.board.length; i++) {
        const obstacle = state.obstacles[i];
        let currentSpreadRate = 0;

        // Asigna la tasa de expansión correcta dependiendo del tipo de obstáculo
        if (obstacle === 'chocolate') {
            currentSpreadRate = state.chocolateSpawnRate; // Tasa de expansión para chocolate normal (depende del nivel)
        } else if (obstacle === 'chocolateSpawner' && state.level >= chocolateSpawnerConfig.startLevel) {
            currentSpreadRate = chocolateSpawnerConfig.spreadRate; // Tasa de expansión para el generador (fija desde config)
        }

        if (currentSpreadRate > 0) {
            const [r, c] = utils.rc(i);
            const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]].sort(() => Math.random() - 0.5);
            for (const [dr, dc] of dirs) {
                const ni = utils.idx(r + dr, c + dc);
                if (utils.inBounds(r + dr, c + dc) && !state.obstacles[ni]) {
                    if (Math.random() * 100 < currentSpreadRate) {
                        newChocolates.push(ni);
                        break; // Solo una expansión por turno para que no sea abrumador
                    }
                }
            }
        }
    }

    newChocolates.forEach(i => {
        state.obstacles[i] = 'chocolate';
        if (state.special[i]) {
            state.special[i] = null;
        }
    });
}


// --- LÓGICA DEL TABLERO ---

function findMatches() {
    const groups = [];
    const check = (run) => { if (run.length >= 3) groups.push(run); };
    for (let r = 0; r < state.HEIGHT; r++) {
        let run = [];
        for (let c = 0; c < state.WIDTH; c++) {
            const i = utils.idx(r, c);
            if (!state.board[i] || state.obstacles[i]) { // Cualquier obstáculo bloquea combos
                check(run);
                run = [];
                continue;
            }
            if (run.length === 0 || state.board[run[0]] === state.board[i]) run.push(i);
            else { check(run); run = [i]; }
        }
        check(run);
    }
    for (let c = 0; c < state.WIDTH; c++) {
        let run = [];
        for (let r = 0; r < state.HEIGHT; r++) {
            const i = utils.idx(r, c);
            if (!state.board[i] || state.obstacles[i]) { // Cualquier obstáculo bloquea combos
                check(run);
                run = [];
                continue;
            }
            if (run.length === 0 || state.board[run[0]] === state.board[i]) run.push(i);
            else { check(run); run = [i]; }
        }
        check(run);
    }
    return groups;
}

function handleMove(swappedIndices) {
    let toRemove = new Set();
    let newSpecials = [];
    let matches = findMatches();
    if (matches.length === 0) return toRemove;

    matches.forEach(group => group.forEach(i => toRemove.add(i)));
    const allIndicesInMatches = matches.flat();
    const intersectionCounts = {};
    allIndicesInMatches.forEach(i => { intersectionCounts[i] = (intersectionCounts[i] || 0) + 1; });

    matches.forEach(group => {
        let specialIndex = -1, specialType = null;
        const crossMatchIndex = group.find(i => intersectionCounts[i] > 1);
        if (crossMatchIndex !== undefined) { specialIndex = crossMatchIndex; specialType = 'BOMB'; }
        else if (group.length >= 5) { specialIndex = group[2]; specialType = 'RAINBOW'; }
        else if (group.length === 4) {
            const isHorizontal = utils.rc(group[0])[0] === utils.rc(group[1])[0];
            specialIndex = swappedIndices.find(i => group.includes(i)) ?? group[1];
            specialType = isHorizontal ? 'H' : 'V';
        }
        if (specialIndex !== -1) newSpecials.push({ index: specialIndex, type: specialType });
    });

    let createdOn = new Set();
    newSpecials.forEach(sp => {
        if (!createdOn.has(sp.index)) {
            state.special[sp.index] = sp.type;
            audio.playSpecialSound(sp.type);
            toRemove.delete(sp.index);
            createdOn.add(sp.index);
        }
    });
    return toRemove;
}


/**
 * Gestiona el daño y la destrucción de los obstáculos especiales.
 * @param {number} index - El índice del obstáculo a dañar.
 * @param {number} damage - La cantidad de daño a infligir.
 * @returns {Promise<boolean>} - True si el obstáculo fue destruido.
 */
async function damageObstacle(index, damage = 1) {
    if (!state.obstacleHealth[index]) return false;

    state.obstacleHealth[index] -= damage;

    if (state.obstacleHealth[index] <= 0) {
        const obstacleType = state.obstacles[index];
        state.obstacles[index] = null;
        state.obstacleHealth[index] = null;

        switch (obstacleType) {
            case 'iceBomb':
                const [r, c] = utils.rc(index);
                dom.containerEl.classList.add('shake-hard'); // Efecto visual más fuerte
                setTimeout(() => dom.containerEl.classList.remove('shake-hard'), 500);
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        if (utils.inBounds(r + dr, c + dc)) {
                            const ni = utils.idx(r + dr, c + dc);
                            const existingObstacle = state.obstacles[ni];
                            if (!existingObstacle || existingObstacle === 'ice' || existingObstacle === 'chocolate') {
                                state.obstacles[ni] = 'ice';
                            }
                        }
                    }
                }
                audio.playIceBreakSound();
                break;
            case 'trash':
            case 'chocolateSpawner':
                audio.playBombSound();
                break;
        }
        return true;
    }
    return false;
}

async function removeAndRefill(toRemoveSet) {
    if (toRemoveSet.size === 0) return 0;

    let toRemove = Array.from(toRemoveSet);
    let activatedSpecials = new Set();
    let toBreakIce = new Set();
    let toRemoveChocolate = new Set();
    let toDamageSpecialObstacles = new Map();

    function addDamage(index, damage) {
        if (config.specialObstaclesConfig.hasOwnProperty(state.obstacles[index])) {
            toDamageSpecialObstacles.set(index, (toDamageSpecialObstacles.get(index) || 0) + damage);
        }
    }

    function checkAdjacents(index) {
        const [r, c] = utils.rc(index);
        [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].forEach(([nr, nc]) => {
            if (utils.inBounds(nr, nc)) {
                const ni = utils.idx(nr, nc);
                if (state.obstacles[ni] === 'ice') toBreakIce.add(ni);
                if (state.obstacles[ni] === 'chocolate') toRemoveChocolate.add(ni);
            }
        });
    }

    function activateSpecials(indices) {
        let newTilesToRemove = new Set();
        indices.forEach(i => {
            if (state.special[i] && !activatedSpecials.has(i)) {
                activatedSpecials.add(i);
                checkAdjacents(i);
                const [r, c] = utils.rc(i);
                let blastZone = [];
                switch (state.special[i]) {
                    case 'H': for (let cc = 0; cc < state.WIDTH; cc++) blastZone.push(utils.idx(r, cc)); break;
                    case 'V': for (let rr = 0; rr < state.HEIGHT; rr++) blastZone.push(utils.idx(rr, c)); break;
                    case 'BOMB':
                        audio.playBombSound();
                        dom.containerEl.classList.add('shake');
                        setTimeout(() => dom.containerEl.classList.remove('shake'), 400);
                        for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) if (utils.inBounds(r + dr, c + dc)) blastZone.push(utils.idx(r + dr, c + dc));
                        break;
                    case 'RAINBOW':
                        const colorToClear = state.board[i];
                        if (colorToClear) for (let j = 0; j < state.board.length; j++) if (state.board[j] === colorToClear) newTilesToRemove.add(j);
                        audio.playSpecialSound('RAINBOW');
                        break;
                }
                blastZone.forEach(bi => {
                    newTilesToRemove.add(bi);
                    addDamage(bi, 1);
                });
                state.special[i] = null;
            }
        });
        if (newTilesToRemove.size > 0) {
            newTilesToRemove.forEach(i => toRemoveSet.add(i));
            let newlyActivated = Array.from(newTilesToRemove).filter(i => state.special[i] && !activatedSpecials.has(i));
            if (newlyActivated.length > 0) activateSpecials(newlyActivated);
        }
    }

    activateSpecials(toRemove);
    toRemove = Array.from(toRemoveSet);
    toRemove.forEach(i => checkAdjacents(i));

    if (toDamageSpecialObstacles.size > 0) {
        audio.playHammerSound();
        for (const [i, dmg] of toDamageSpecialObstacles.entries()) {
            const destroyed = await damageObstacle(i, dmg);
            if (destroyed) {
                toRemoveSet.add(i);
            }
        }
    }

    if (toBreakIce.size > 0) {
        audio.playIceBreakSound();
        toBreakIce.forEach(i => { state.obstacles[i] = null; });
    }
    if (toRemoveChocolate.size > 0) {
        toRemoveChocolate.forEach(i => {
            state.obstacles[i] = null;
            toRemoveSet.add(i);
        });
    }

    toRemove = Array.from(toRemoveSet);
    const wrapRect = dom.boardWrapEl.getBoundingClientRect();
    toRemove.forEach(i => {
        const emoji = state.board[i];
        if (state.objectiveEmojis.includes(emoji)) state.objectiveCounts[emoji].current++;
        state.board[i] = null;
        state.special[i] = null;
        const tileEl = utils.getTileEl(i);
        if (tileEl) {
            tileEl.classList.add('pop');
            const tileRect = tileEl.getBoundingClientRect();
            const x = tileRect.left - wrapRect.left + tileRect.width / 2;
            const y = tileRect.top - wrapRect.top + tileRect.height / 2;
            utils.createParticles(x, y);
        }
    });

    state.score += toRemove.length * (10 + state.level + state.comboCount * 5);
    audio.playComboSound(toRemove.length);
    ui.updateObjectivesUI();

    if (state.running && areObjectivesComplete()) {
        stopTimer();
    }

    await new Promise(r => setTimeout(r, 300));
    ui.renderBoard();
    await new Promise(r => setTimeout(r, 200));
    collapse();
    ui.renderBoard();
    await new Promise(r => setTimeout(r, 200));
    refill();
    ui.renderBoard();
    return toRemove.length;
}

/**
 * Lógica de colapso para manejar los nuevos obstáculos.
 * - El bote de basura destruye las fichas que caen sobre él.
 * - Los otros obstáculos especiales actúan como barreras sólidas.
 */
function collapse() {
    for (let c = 0; c < state.WIDTH; c++) {
        let writePos = state.HEIGHT - 1;
        for (let r = state.HEIGHT - 1; r >= 0; r--) {
            const i = utils.idx(r, c);
            const obstacleType = state.obstacles[i];

            if (obstacleType === 'chocolate' || config.specialObstaclesConfig.hasOwnProperty(obstacleType)) {
                writePos = r - 1;
                continue;
            }

            if (state.board[i] !== null) {
                const belowWritePosIdx = utils.idx(writePos + 1, c);
                if (writePos < state.HEIGHT - 1 && state.obstacles[belowWritePosIdx] === 'trash') {
                    state.board[i] = null;
                    state.special[i] = null;
                    state.obstacles[i] = null;
                    utils.createParticlesForTile(i, '#888');
                    audio.playShuffleSound();
                    continue;
                }

                const targetIdx = utils.idx(writePos, c);
                if (i !== targetIdx) {
                    [state.board[targetIdx], state.board[i]] = [state.board[i], null];
                    [state.special[targetIdx], state.special[i]] = [state.special[i], null];
                    [state.obstacles[targetIdx], state.obstacles[i]] = [state.obstacles[i], null];
                }
                writePos--;
            }
        }
    }
}


function refill() {
    for (let i = 0; i < state.board.length; i++) {
        if (state.board[i] === null && !state.obstacles[i]) state.board[i] = utils.randEmoji();
    }
}

function hasValidMoves() {
    for (let r = 0; r < state.HEIGHT; r++) {
        for (let c = 0; c < state.WIDTH; c++) {
            const i = utils.idx(r, c);
            if (state.obstacles[i]) continue;
            if (c < state.WIDTH - 1) {
                const j = utils.idx(r, c + 1);
                if (!state.obstacles[j]) {
                    if (state.special[i] || state.special[j]) return true;
                    [state.board[i], state.board[j]] = [state.board[j], state.board[i]];
                    const hasMatch = findMatches().length > 0;
                    [state.board[i], state.board[j]] = [state.board[j], state.board[i]];
                    if (hasMatch) return true;
                }
            }
            if (r < state.HEIGHT - 1) {
                const j = utils.idx(r + 1, c);
                if (!state.obstacles[j]) {
                    if (state.special[i] || state.special[j]) return true;
                    [state.board[i], state.board[j]] = [state.board[j], state.board[i]];
                    const hasMatch = findMatches().length > 0;
                    [state.board[i], state.board[j]] = [state.board[j], state.board[i]];
                    if (hasMatch) return true;
                }
            }
        }
    }
    return false;
}

function forceValidMove() {
    const nonObstacleIndices = [];
    for (let i = 0; i < state.board.length; i++) {
        if (!state.obstacles[i]) {
            nonObstacleIndices.push(i);
        }
    }
    if (nonObstacleIndices.length < 3) return;

    let attempts = 0;
    while(attempts < 50) {
        const randIdx = nonObstacleIndices[Math.floor(Math.random() * nonObstacleIndices.length)];
        const [r, c] = utils.rc(randIdx);

        if (c < state.WIDTH - 2 && !state.obstacles[utils.idx(r, c + 1)] && !state.obstacles[utils.idx(r, c + 2)]) {
            state.board[utils.idx(r, c + 1)] = state.board[randIdx];
            state.board[utils.idx(r, c + 2)] = state.board[randIdx];
            state.special[utils.idx(r, c + 1)] = null;
            state.special[utils.idx(r, c + 2)] = null;
            if (hasValidMoves()) return;
        }
        if (r < state.HEIGHT - 2 && !state.obstacles[utils.idx(r + 1, c)] && !state.obstacles[utils.idx(r + 2, c)]) {
            state.board[utils.idx(r + 1, c)] = state.board[randIdx];
            state.board[utils.idx(r + 2, c)] = state.board[randIdx];
            state.special[utils.idx(r + 1, c)] = null;
            state.special[utils.idx(r + 2, c)] = null;
            if (hasValidMoves()) return;
        }
        attempts++;
    }
}

async function autoShuffle() {
    ui.showComboText('¡Mezclando!');
    audio.playShuffleSound();

    const nonObstacles = [];
    for (let i = 0; i < state.board.length; i++) {
        if (!state.obstacles[i]) {
            nonObstacles.push({ i, v: state.board[i], s: state.special[i] });
        }
    }

    const values = nonObstacles.map(o => ({ v: o.v, s: o.s }));

    let attempts = 0;
    do {
        values.sort(() => Math.random() - 0.5);
        nonObstacles.forEach((o, idx) => {
            state.board[o.i] = values[idx].v;
            state.special[o.i] = values[idx].s;
        });
        attempts++;
    } while (!hasValidMoves() && attempts < 10);

    if (!hasValidMoves()) {
        forceValidMove();
    }

    ui.renderBoard();
    await new Promise(r => setTimeout(r, 300));
    await processMatches([]);
}

async function processMatches(swappedIndices) {
    state.comboCount = 0;
    while (true) {
        const toRemove = handleMove(swappedIndices);
        const removedCount = await removeAndRefill(toRemove);
        if (removedCount === 0) break;
        state.comboCount++;
        if (state.comboCount > 1) {
            const comboMessages = ["¡Genial!", "¡Súper!", "¡Increíble!", "¡Wow!", "¡Imparable!"];
            ui.showComboText(comboMessages[Math.min(state.comboCount - 2, comboMessages.length - 1)]);
        }
        swappedIndices = [];
    }
    if (state.running) {
        // Se llaman a las funciones de expansión de obstáculos al final del turno.
        expandChocolates();
        expandIce();
        ui.renderBoard();
        if (!hasValidMoves()) await autoShuffle();
    }
}

// --- LÓGICA DE SUPERPODERES Y MOVIMIENTOS ---

export function awardSuperpower() {
    const powers = ['bomb', 'hammer', 'time'];
    const randomPower = powers[Math.floor(Math.random() * powers.length)];
    state.superpowers[randomPower]++;
    audio.playPowerupSound();
    ui.updateUI();
}

export async function trySwap(a, b) {
    const isSpecialObstacleA = config.specialObstaclesConfig.hasOwnProperty(state.obstacles[a]);
    const isSpecialObstacleB = config.specialObstaclesConfig.hasOwnProperty(state.obstacles[b]);

    if (a === b || state.processingMove || state.obstacles[a] === 'chocolate' || state.obstacles[a] === 'ice' || isSpecialObstacleA || state.obstacles[b] === 'chocolate' || state.obstacles[b] === 'ice' || isSpecialObstacleB) {
        if (state.obstacles[a] || state.obstacles[b]) audio.playInvalidMoveSound();
        return false;
    }

    const [ra, ca] = utils.rc(a), [rb, cb] = utils.rc(b);
    if (Math.abs(ra - rb) + Math.abs(ca - cb) !== 1) return false;

    state.processingMove = true;
    let swapped = true;

    if (state.special[a] && state.special[b]) {
        if (state.level < config.TIMER_START_LEVEL) state.moves--; else state.timeLeft++;
        let toRemove = new Set([a, b]);
        await removeAndRefill(toRemove);
    } else if (state.special[a] === 'RAINBOW' || state.special[b] === 'RAINBOW') {
        if (state.level < config.TIMER_START_LEVEL) state.moves--; else state.timeLeft++;
        const rainbowIndex = state.special[a] === 'RAINBOW' ? a : b;
        const otherIndex = rainbowIndex === a ? b : a;
        const colorToClear = state.board[otherIndex];
        let toRemove = new Set([rainbowIndex]);
        for (let i = 0; i < state.board.length; i++) if (state.board[i] === colorToClear) toRemove.add(i);
        audio.playSpecialSound('RAINBOW');
        await removeAndRefill(toRemove);
    } else {
        [state.board[a], state.board[b]] = [state.board[b], state.board[a]];
        [state.special[a], state.special[b]] = [state.special[b], state.special[a]];
        ui.renderBoard();

        if (findMatches().length === 0) {
            await new Promise(r => setTimeout(r, 200));
            [state.board[a], state.board[b]] = [state.board[b], state.board[a]];
            [state.special[a], state.special[b]] = [state.special[b], state.special[a]];
            audio.playInvalidMoveSound();
            ui.renderBoard();
            swapped = false;
        } else {
            if (state.level < config.TIMER_START_LEVEL) state.moves--; else state.timeLeft++;
            audio.playSwapSound();
            await processMatches([a, b]);
        }
    }
    state.processingMove = false;
    if (swapped) await checkGameState();
    return swapped;
}

export async function usePower(powerType, index) {
    if (state.superpowers[powerType] <= 0) return;
    state.processingMove = true;
    state.superpowers[powerType]--;
    state.activePower = null;
    ui.updateUI();

    let toRemove = new Set();
    const [r, c] = utils.rc(index);

    // Si el poder se usa en un obstáculo especial, lo daña directamente
    if (config.specialObstaclesConfig.hasOwnProperty(state.obstacles[index])) {
        const destroyed = await damageObstacle(index, 1);
        if (destroyed) {
            toRemove.add(index);
        }
    } else {
        if (powerType === 'hammer') {
            toRemove.add(index);
            audio.playHammerSound();
        } else if (powerType === 'bomb') {
            dom.containerEl.classList.add('shake');
            setTimeout(() => dom.containerEl.classList.remove('shake'), 400);
            audio.playBombSound();
            for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) if (utils.inBounds(r + dr, c + dc)) toRemove.add(utils.idx(r + dr, c + dc));
        }
    }

    await removeAndRefill(toRemove);
    await processMatches([]);
    state.processingMove = false;
    await checkGameState();
}

// --- LÓGICA DE ESTADO DEL JUEGO (NIVELES, GAME OVER) ---

function areObjectivesComplete() {
    if (state.objectiveEmojis.length === 0) return true;
    return state.objectiveEmojis.every(e => state.objectiveCounts[e].current >= state.objectiveCounts[e].target);
}

async function checkGameState() {
    if (!state.running) return;
    if (areObjectivesComplete()) {
        await completeLevel();
    } else if ((state.level < config.TIMER_START_LEVEL && state.moves <= 0) || (state.level >= config.TIMER_START_LEVEL && state.timeLeft <= 0)) {
        await gameOver();
    }
}

async function completeLevel() {
    state.running = false;
    stopTimer();
    const bonus = (state.level < config.TIMER_START_LEVEL ? state.moves * 25 : state.timeLeft * 15) * state.level;
    state.score += bonus;
    if (state.level % 3 === 0) { awardSuperpower(); ui.showComboText('¡Poder de Bonificación!'); }
    dom.overlayTitleEl.textContent = '🎉 ¡NIVEL COMPLETADO!';
    dom.levelScoreEl.textContent = state.score;
    dom.levelBonusEl.textContent = bonus;
    dom.nextLevelBtn.textContent = 'SIGUIENTE NIVEL ➡️';
    dom.levelOverlayEl.classList.add('show');
    audio.playLevelCompleteSound();
    dom.nextLevelBtn.onclick = () => { dom.levelOverlayEl.classList.remove('show'); levelUp(); };
}

async function gameOver() {
    state.running = false;
    stopTimer();
    dom.overlayTitleEl.textContent = '💀 GAME OVER';
    dom.levelScoreEl.textContent = state.score;
    dom.levelBonusEl.textContent = '0';
    dom.nextLevelBtn.textContent = '🔄 REINTENTAR';
    dom.levelOverlayEl.classList.add('show');
    audio.playGameOverSound();
    dom.nextLevelBtn.onclick = () => { dom.levelOverlayEl.classList.remove('show'); resetGame(); };
}

function levelUp() {
    state.level++;
    setupLevel();
    initBoard();
    ui.renderBoard();
    ui.resizeBoard();
    state.running = true;
    audio.playSwapSound();
}

export function setupGameMode(mode) {
    state.gameMode = mode;
    const modeConfig = config.gameModes[mode];
    state.WIDTH = modeConfig.WIDTH;
    state.HEIGHT = modeConfig.HEIGHT;
    state.EMOJIS = modeConfig.EMOJIS;
    state.MAX_OBJECTIVES = modeConfig.MAX_OBJECTIVES;
    state.OBJECTIVE_BASE_COUNT = modeConfig.OBJECTIVE_BASE_COUNT;
    document.documentElement.style.setProperty('--board-size', state.WIDTH);
    dom.btnToggleDifficulty.classList.toggle('active', mode === 'hard');
}

function setupLevel() {
    const modeConfig = config.gameModes[state.gameMode];

    if (state.level >= config.EXTRA_EMOJI_START_LEVEL) {
        state.EMOJIS = [...modeConfig.EMOJIS, ...modeConfig.EXTRA_EMOJIS];
    } else {
        state.EMOJIS = [...modeConfig.EMOJIS];
    }

    state.targetScore = Math.ceil(((500 * (state.WIDTH / 8)) * Math.pow(1.2, state.level - 1)) / 100) * 100;
    state.moves = Math.max(15, modeConfig.MOVES_BASE - state.level);

    if (state.level >= config.TIMER_START_LEVEL) {
        state.totalTime = Math.max(30, modeConfig.TIMER_BASE - (state.level - config.TIMER_START_LEVEL) * 5);
        state.timeLeft = state.totalTime;
        startTimer();
    } else {
        stopTimer();
    }

    state.chocolateSpawnRate = (state.level >= config.CHOCOLATE_START_LEVEL) ? Math.min(25, 5 + (state.level - config.CHOCOLATE_START_LEVEL) * 2) : 0;
    state.chocolatesToSpawn = (state.level >= config.CHOCOLATE_START_LEVEL) ? Math.min(config.MAX_CHOCOLATE, 1 + Math.floor((state.level - config.CHOCOLATE_START_LEVEL) / 2)) : 0;
    state.icesToSpawn = (state.level >= config.ICE_START_LEVEL) ? Math.min(config.MAX_ICE, 1 + Math.floor((state.level - config.ICE_START_LEVEL) / 2)) : 0;
    ui.setupObjectives();
}

async function initBoard() {
    state.board = new Array(state.WIDTH * state.HEIGHT).fill(null);
    state.special = new Array(state.WIDTH * state.HEIGHT).fill(null);
    state.obstacles = new Array(state.WIDTH * state.HEIGHT).fill(null);
    state.obstacleHealth = new Array(state.WIDTH * state.HEIGHT).fill(null);
    for (let i = 0; i < state.board.length; i++) state.board[i] = utils.randEmoji();

    spawnObstacles();

    let attempts = 0;
    while (findMatches().length > 0 && attempts < 20) {
        findMatches().forEach(group => group.forEach(i => { state.board[i] = utils.randEmoji(); }));
        attempts++;
    }

    if (!hasValidMoves()) {
        await autoShuffle();
    }
}

export function resetGame() {
    state.level = 1;
    state.score = 0;
    state.scoreAtLevelStart = 0;
    state.superpowers = {bomb: 1, hammer: 1, time: 1};
    setupLevel();
    initBoard().then(() => {
        ui.renderBoard();
        ui.resizeBoard();
        state.running = true;
    });
}