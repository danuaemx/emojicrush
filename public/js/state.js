// js/state.js

/**
 * Objeto que contiene todo el estado dinámico del juego.
 * Al centralizar el estado, es más fácil de rastrear y depurar.
 */
const state = {
    // Estado del tablero
    board: [],
    special: [],
    obstacles: [],
    obstacleHealth: [], // NUEVO: para la vida de obstáculos especiales como el Bote de Basura.

    // Estado de los objetivos
    objectiveEmojis: [],
    objectiveCounts: {},

    // Estado del jugador y nivel
    selected: null,
    score: 0,
    targetScore: 500,
    level: 1,
    moves: 20,
    scoreAtLevelStart: 0,

    // Banderas de estado del juego
    running: false,
    audioOn: true,
    processingMove: false,

    // Estado de obstáculos y combos
    chocolateSpawnRate: 0,
    chocolatesToSpawn: 0,
    icesToSpawn: 0,
    comboCount: 0,

    // Configuración actual del juego
    gameMode: 'easy', // MODIFICADO: Nombre de modo de juego actualizado
    timerInterval: null,
    timeLeft: 0,
    totalTime: 0,

    // Superpoderes
    superpowers: { bomb: 1, hammer: 1, time: 1 },
    activePower: null, // 'bomb', 'hammer'

    // Variables dinámicas que dependen del modo de juego
    WIDTH: 8,
    HEIGHT: 8,
    EMOJIS: [],
    MAX_OBJECTIVES: 0,
    OBJECTIVE_BASE_COUNT: 0,
};

// Exportamos el objeto de estado como el valor por defecto del módulo.
export default state;
