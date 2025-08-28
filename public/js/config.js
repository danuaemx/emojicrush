// js/config.js

/**
 * Contiene la configuración para los diferentes modos de juego.
 * Cada modo define el tamaño del tablero, los emojis disponibles y
 * los parámetros base para objetivos, movimientos y tiempo.
 */
export const gameModes = {
    // Modo fácil
    'easy': {
        WIDTH: 8,
        HEIGHT: 8,
        EMOJIS: ['🍑', '🍇', '🍋', '🍓'],
        EXTRA_EMOJIS: ['🍊','🍎'],
        MAX_OBJECTIVES: 7,
        OBJECTIVE_BASE_COUNT: 14,
        MOVES_BASE: 30,
        TIMER_BASE: 75,
        // Máximo de obstáculos especiales en el tablero a la vez
        SPECIAL_OBSTACLES_LIMIT: {
            trash: 1,
            iceBomb: 1,
            chocolateSpawner: 1,
        }
    },
    // Modo completo/difícil
    'hard': {
        WIDTH: 10,
        HEIGHT: 10,
        EMOJIS: ['🍉', '🥝', '🥥', '🥭',  '🥑'],
        EXTRA_EMOJIS: ['🍒', '🍍','🍑'],
        MAX_OBJECTIVES: 9,
        OBJECTIVE_BASE_COUNT: 20,
        MOVES_BASE: 40,
        TIMER_BASE: 90,
        // Máximo de obstáculos especiales en el tablero a la vez
        SPECIAL_OBSTACLES_LIMIT: {
            trash: 2,
            iceBomb: 2,
            chocolateSpawner: 2,
        }
    }
};

/**
 * Configuración de los obstáculos especiales.
 * Define a partir de qué nivel aparecen, su "vida" (golpes de poder para romperlos)
 * y el emoji que los representa.
 */
export const specialObstaclesConfig = {
    trash: {
        startLevel: 8,
        health: 2,
        emoji: '🗑️'
    },
    iceBomb: {
        startLevel: 12,
        health: 2,
        emoji: '❄️',
        spreadRate: 30 // Probabilidad (en %) de que se expanda a una casilla adyacente cada turno.
    },
    chocolateSpawner: {
        startLevel: 16,
        health: 2,
        emoji: '🏭',
        spreadRate: 35 // NUEVO: Probabilidad (en %) de que el generador expanda chocolate cada turno.
    }
};


/**
 * Constantes globales que definen en qué nivel aparecen ciertos
 * obstáculos o mecánicas de juego.
 */
export const ICE_START_LEVEL = 5;
export const CHOCOLATE_START_LEVEL = 10;
export const TIMER_START_LEVEL = 15;
export const EXTRA_EMOJI_START_LEVEL = 20; // Nivel para nuevos emojis
export const MAX_ICE = 12; // Límite máximo de hielo en el tablero
export const MAX_CHOCOLATE = 12; // Límite máximo de chocolate en el tablero
