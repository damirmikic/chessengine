/**
 * @fileoverview Chess Clock Module
 * Handles time controls with multiple presets, increments, and warnings
 */

/**
 * Time control presets
 */
const TIME_PRESETS = {
    BULLET_1: {
        id: 'bullet_1',
        name: 'Bullet 1+0',
        category: 'Bullet',
        baseTime: 60,        // 1 minute in seconds
        increment: 0,
        icon: '⚡'
    },
    BULLET_2: {
        id: 'bullet_2',
        name: 'Bullet 2+1',
        category: 'Bullet',
        baseTime: 120,
        increment: 1,
        icon: '⚡'
    },
    BLITZ_3: {
        id: 'blitz_3',
        name: 'Blitz 3+0',
        category: 'Blitz',
        baseTime: 180,
        increment: 0,
        icon: '🔥'
    },
    BLITZ_3_2: {
        id: 'blitz_3_2',
        name: 'Blitz 3+2',
        category: 'Blitz',
        baseTime: 180,
        increment: 2,
        icon: '🔥'
    },
    BLITZ_5: {
        id: 'blitz_5',
        name: 'Blitz 5+0',
        category: 'Blitz',
        baseTime: 300,
        increment: 0,
        icon: '🔥'
    },
    BLITZ_5_3: {
        id: 'blitz_5_3',
        name: 'Blitz 5+3',
        category: 'Blitz',
        baseTime: 300,
        increment: 3,
        icon: '🔥'
    },
    RAPID_10: {
        id: 'rapid_10',
        name: 'Rapid 10+0',
        category: 'Rapid',
        baseTime: 600,
        increment: 0,
        icon: '⏱️'
    },
    RAPID_10_5: {
        id: 'rapid_10_5',
        name: 'Rapid 10+5',
        category: 'Rapid',
        baseTime: 600,
        increment: 5,
        icon: '⏱️'
    },
    RAPID_15_10: {
        id: 'rapid_15_10',
        name: 'Rapid 15+10',
        category: 'Rapid',
        baseTime: 900,
        increment: 10,
        icon: '⏱️'
    },
    CLASSICAL_30: {
        id: 'classical_30',
        name: 'Classical 30+0',
        category: 'Classical',
        baseTime: 1800,
        increment: 0,
        icon: '🏛️'
    },
    CLASSICAL_30_20: {
        id: 'classical_30_20',
        name: 'Classical 30+20',
        category: 'Classical',
        baseTime: 1800,
        increment: 20,
        icon: '🏛️'
    },
    UNLIMITED: {
        id: 'unlimited',
        name: 'Unlimited',
        category: 'Casual',
        baseTime: Infinity,
        increment: 0,
        icon: '♾️'
    }
};

/**
 * Warning thresholds in seconds
 */
const WARNING_THRESHOLDS = {
    LOW_TIME: 30,      // Yellow warning
    CRITICAL: 10,      // Red warning
    VERY_CRITICAL: 5   // Flashing red
};

/**
 * Clock state
 */
const clockState = {
    enabled: false,
    running: false,
    activePlayer: 'white',
    preset: null,
    whiteTime: 0,
    blackTime: 0,
    increment: 0,
    intervalId: null,
    lastTick: null,
    callbacks: {
        onTimeUpdate: null,
        onTimeUp: null,
        onWarning: null,
        onPlayerSwitch: null
    }
};

/**
 * Initializes the chess clock
 * @param {Object} options - Clock options
 * @param {string} [options.preset='rapid_10'] - Time preset ID
 * @param {Function} [options.onTimeUpdate] - Callback when time updates
 * @param {Function} [options.onTimeUp] - Callback when time runs out
 * @param {Function} [options.onWarning] - Callback for time warnings
 * @param {Function} [options.onPlayerSwitch] - Callback when active player changes
 */
export function initializeClock(options = {}) {
    const presetId = options.preset || 'rapid_10';
    const preset = TIME_PRESETS[presetId.toUpperCase().replace(/-/g, '_')]
        || Object.values(TIME_PRESETS).find(p => p.id === presetId)
        || TIME_PRESETS.RAPID_10;

    clockState.preset = preset;
    clockState.whiteTime = preset.baseTime;
    clockState.blackTime = preset.baseTime;
    clockState.increment = preset.increment;
    clockState.activePlayer = 'white';
    clockState.running = false;
    clockState.enabled = preset.baseTime !== Infinity;

    clockState.callbacks = {
        onTimeUpdate: options.onTimeUpdate || null,
        onTimeUp: options.onTimeUp || null,
        onWarning: options.onWarning || null,
        onPlayerSwitch: options.onPlayerSwitch || null
    };

    // Stop any existing interval
    if (clockState.intervalId) {
        clearInterval(clockState.intervalId);
        clockState.intervalId = null;
    }

    return getClockState();
}

/**
 * Starts the clock
 */
export function startClock() {
    if (!clockState.enabled || clockState.running) return;

    clockState.running = true;
    clockState.lastTick = Date.now();

    // Use precise interval for accurate timing
    clockState.intervalId = setInterval(tick, 100);

    notifyUpdate();
}

/**
 * Pauses the clock
 */
export function pauseClock() {
    if (!clockState.running) return;

    clockState.running = false;

    if (clockState.intervalId) {
        clearInterval(clockState.intervalId);
        clockState.intervalId = null;
    }

    notifyUpdate();
}

/**
 * Stops the clock completely
 */
export function stopClock() {
    pauseClock();
    clockState.enabled = false;
}

/**
 * Switches the active player (after a move)
 * @param {string} [player] - Player who just moved (will switch to opponent)
 */
export function switchPlayer(player) {
    if (!clockState.enabled) return;

    // Add increment to the player who just moved
    if (clockState.running) {
        if (clockState.activePlayer === 'white') {
            clockState.whiteTime += clockState.increment;
        } else {
            clockState.blackTime += clockState.increment;
        }
    }

    // Switch active player
    clockState.activePlayer = clockState.activePlayer === 'white' ? 'black' : 'white';
    clockState.lastTick = Date.now();

    if (clockState.callbacks.onPlayerSwitch) {
        clockState.callbacks.onPlayerSwitch(clockState.activePlayer);
    }

    notifyUpdate();
}

/**
 * Sets the active player without adding increment
 * @param {string} player - 'white' or 'black'
 */
export function setActivePlayer(player) {
    if (player !== 'white' && player !== 'black') return;

    clockState.activePlayer = player;
    clockState.lastTick = Date.now();

    notifyUpdate();
}

/**
 * Clock tick - decrements active player's time
 */
function tick() {
    if (!clockState.running || !clockState.enabled) return;

    const now = Date.now();
    const elapsed = (now - clockState.lastTick) / 1000;
    clockState.lastTick = now;

    // Decrement active player's time
    if (clockState.activePlayer === 'white') {
        clockState.whiteTime = Math.max(0, clockState.whiteTime - elapsed);
    } else {
        clockState.blackTime = Math.max(0, clockState.blackTime - elapsed);
    }

    // Check for time up
    const currentTime = clockState.activePlayer === 'white'
        ? clockState.whiteTime
        : clockState.blackTime;

    if (currentTime <= 0) {
        handleTimeUp();
        return;
    }

    // Check for warnings
    checkWarnings(currentTime);

    notifyUpdate();
}

/**
 * Checks and triggers time warnings
 * @param {number} timeRemaining - Time remaining in seconds
 */
function checkWarnings(timeRemaining) {
    if (!clockState.callbacks.onWarning) return;

    let warningLevel = null;

    if (timeRemaining <= WARNING_THRESHOLDS.VERY_CRITICAL) {
        warningLevel = 'critical';
    } else if (timeRemaining <= WARNING_THRESHOLDS.CRITICAL) {
        warningLevel = 'danger';
    } else if (timeRemaining <= WARNING_THRESHOLDS.LOW_TIME) {
        warningLevel = 'low';
    }

    if (warningLevel) {
        clockState.callbacks.onWarning({
            player: clockState.activePlayer,
            level: warningLevel,
            timeRemaining
        });
    }
}

/**
 * Handles when a player runs out of time
 */
function handleTimeUp() {
    pauseClock();

    if (clockState.callbacks.onTimeUp) {
        clockState.callbacks.onTimeUp({
            loser: clockState.activePlayer,
            winner: clockState.activePlayer === 'white' ? 'black' : 'white'
        });
    }
}

/**
 * Notifies callbacks of clock state update
 */
function notifyUpdate() {
    if (clockState.callbacks.onTimeUpdate) {
        clockState.callbacks.onTimeUpdate(getClockState());
    }
}

/**
 * Formats time for display
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
export function formatTime(seconds) {
    if (seconds === Infinity) return '∞';
    if (seconds <= 0) return '0:00';

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const tenths = Math.floor((seconds % 1) * 10);

    if (seconds < 10) {
        // Show tenths when under 10 seconds
        return `${mins}:${secs.toString().padStart(2, '0')}.${tenths}`;
    }

    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Gets the current clock state
 * @returns {Object} Current clock state
 */
export function getClockState() {
    return {
        enabled: clockState.enabled,
        running: clockState.running,
        activePlayer: clockState.activePlayer,
        preset: clockState.preset,
        whiteTime: clockState.whiteTime,
        blackTime: clockState.blackTime,
        whiteTimeFormatted: formatTime(clockState.whiteTime),
        blackTimeFormatted: formatTime(clockState.blackTime),
        increment: clockState.increment,
        whiteWarning: getWarningLevel(clockState.whiteTime),
        blackWarning: getWarningLevel(clockState.blackTime)
    };
}

/**
 * Gets warning level for a time value
 * @param {number} time - Time in seconds
 * @returns {string|null} Warning level
 */
function getWarningLevel(time) {
    if (time === Infinity) return null;
    if (time <= WARNING_THRESHOLDS.VERY_CRITICAL) return 'critical';
    if (time <= WARNING_THRESHOLDS.CRITICAL) return 'danger';
    if (time <= WARNING_THRESHOLDS.LOW_TIME) return 'low';
    return null;
}

/**
 * Gets all available time presets
 * @returns {Object} Time presets grouped by category
 */
export function getTimePresets() {
    const byCategory = {};

    Object.values(TIME_PRESETS).forEach(preset => {
        if (!byCategory[preset.category]) {
            byCategory[preset.category] = [];
        }
        byCategory[preset.category].push(preset);
    });

    return {
        all: Object.values(TIME_PRESETS),
        byCategory
    };
}

/**
 * Gets a specific preset by ID
 * @param {string} presetId - Preset ID
 * @returns {Object|null} Preset or null
 */
export function getPreset(presetId) {
    return Object.values(TIME_PRESETS).find(p => p.id === presetId) || null;
}

/**
 * Sets custom time control
 * @param {number} baseTimeMinutes - Base time in minutes
 * @param {number} incrementSeconds - Increment in seconds
 */
export function setCustomTimeControl(baseTimeMinutes, incrementSeconds) {
    const customPreset = {
        id: 'custom',
        name: `Custom ${baseTimeMinutes}+${incrementSeconds}`,
        category: 'Custom',
        baseTime: baseTimeMinutes * 60,
        increment: incrementSeconds,
        icon: '⚙️'
    };

    initializeClock({
        preset: 'custom',
        ...clockState.callbacks
    });

    // Override with custom preset
    clockState.preset = customPreset;
    clockState.whiteTime = customPreset.baseTime;
    clockState.blackTime = customPreset.baseTime;
    clockState.increment = customPreset.increment;
    clockState.enabled = customPreset.baseTime !== Infinity;

    return getClockState();
}

/**
 * Resets the clock to initial state
 */
export function resetClock() {
    pauseClock();

    if (clockState.preset) {
        clockState.whiteTime = clockState.preset.baseTime;
        clockState.blackTime = clockState.preset.baseTime;
        clockState.increment = clockState.preset.increment;
        clockState.activePlayer = 'white';
        clockState.enabled = clockState.preset.baseTime !== Infinity;
    }

    notifyUpdate();
}

/**
 * Adds bonus time to a player
 * @param {string} player - 'white' or 'black'
 * @param {number} seconds - Seconds to add
 */
export function addTime(player, seconds) {
    if (player === 'white') {
        clockState.whiteTime += seconds;
    } else if (player === 'black') {
        clockState.blackTime += seconds;
    }

    notifyUpdate();
}

/**
 * Checks if the clock is enabled
 * @returns {boolean} True if clock is enabled
 */
export function isClockEnabled() {
    return clockState.enabled;
}

/**
 * Checks if the clock is running
 * @returns {boolean} True if clock is running
 */
export function isClockRunning() {
    return clockState.running;
}
