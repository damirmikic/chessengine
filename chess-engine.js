/**
 * @fileoverview Stockfish chess engine communication module
 * Handles all interactions with the Stockfish web worker
 */

/**
 * @typedef {Object} EngineState
 * @property {Worker|null} worker - The Stockfish worker instance
 * @property {string} status - Current engine status: 'idle' | 'evaluating_current' | 'finding_hint' | 'playing' | 'error' | 'initializing'
 * @property {number} currentEval - Current position evaluation in pawns
 * @property {string} currentPv - Principal Variation (best line of moves)
 * @property {string} badMoveRefutation - Line that punishes the user's mistake
 * @property {Function|null} onBestMove - Callback when engine finds best move
 * @property {Function|null} onEvaluation - Callback when evaluation updates
 * @property {Function|null} onError - Callback when error occurs
 */

/** @type {EngineState} */
const engineState = {
    worker: null,
    status: 'initializing',
    currentEval: 0,
    currentPv: "",
    badMoveRefutation: "",
    bestMoves: [],  // Array of {move: string, eval: number, pv: string}
    onBestMove: null,
    onEvaluation: null,
    onMultiPv: null,
    onError: null
};

/**
 * Maximum retry attempts for engine initialization
 * @const {number}
 */
const MAX_INIT_RETRIES = 3;

/**
 * Current retry count
 * @type {number}
 */
let initRetryCount = 0;

/**
 * Initializes the Stockfish chess engine
 * @param {Object} callbacks - Event callbacks
 * @param {Function} callbacks.onReady - Called when engine is ready
 * @param {Function} callbacks.onBestMove - Called when best move is found
 * @param {Function} callbacks.onEvaluation - Called when evaluation updates
 * @param {Function} callbacks.onError - Called when error occurs
 * @returns {Promise<boolean>} True if initialization successful
 */
export async function initializeEngine({ onReady, onBestMove, onEvaluation, onMultiPv, onError }) {
    try {
        engineState.onBestMove = onBestMove;
        engineState.onEvaluation = onEvaluation;
        engineState.onMultiPv = onMultiPv;
        engineState.onError = onError;

        // Show loading state
        showEngineStatus('Initializing chess engine...');

        // Create Stockfish worker
        engineState.worker = new Worker('stockfish.js');

        // Set up message handler
        engineState.worker.onmessage = handleEngineMessage;

        // Set up error handler
        engineState.worker.onerror = (error) => {
            console.error('Stockfish worker error:', error);
            handleEngineError(new Error(`Worker error: ${error.message}`));
        };

        // Initialize UCI protocol
        engineState.worker.postMessage('uci');

        // Wait for uciok response
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Engine initialization timeout'));
            }, 5000);

            const originalOnMessage = engineState.worker.onmessage;
            engineState.worker.onmessage = (event) => {
                if (event.data === 'uciok') {
                    clearTimeout(timeout);
                    engineState.worker.onmessage = originalOnMessage;
                    engineState.status = 'idle';
                    showEngineStatus('Engine ready');
                    console.log('Stockfish engine initialized successfully');
                    if (onReady) onReady();
                    resolve(true);
                }
                originalOnMessage(event);
            };
        });

    } catch (error) {
        console.error('Failed to initialize Stockfish:', error);
        await handleEngineError(error);
        return false;
    }
}

/**
 * Handles incoming messages from the Stockfish worker
 * @param {MessageEvent} event - Worker message event
 */
function handleEngineMessage(event) {
    const line = event.data;

    try {
        // Parse multipv info lines
        if (line.startsWith('info') && line.includes('multipv')) {
            const parts = line.split(' ');
            const multipvIndex = parts.indexOf('multipv');
            const pvNumber = multipvIndex > 0 ? parseInt(parts[multipvIndex + 1]) : 1;

            // Extract score
            let score = 0;
            const cpIndex = parts.indexOf('cp');
            if (cpIndex > 0 && cpIndex + 1 < parts.length) {
                score = parseInt(parts[cpIndex + 1]) / 100;
            }

            // Extract PV (principal variation)
            let pv = '';
            const pvIndex = parts.indexOf('pv');
            if (pvIndex > 0) {
                pv = parts.slice(pvIndex + 1).join(' ');
            }

            // Extract first move from PV
            const firstMove = pv.split(' ')[0];

            // Store in bestMoves array
            if (pvNumber > 0 && firstMove) {
                // Ensure array is large enough
                while (engineState.bestMoves.length < pvNumber) {
                    engineState.bestMoves.push({ move: '', eval: 0, pv: '' });
                }

                engineState.bestMoves[pvNumber - 1] = {
                    move: firstMove,
                    eval: score,
                    pv: pv
                };

                // Notify multipv callback
                if (engineState.onMultiPv && pvNumber === 3) {
                    // Wait for all 3 lines
                    engineState.onMultiPv([...engineState.bestMoves]);
                }
            }
        }

        // Capture Principal Variation (best line)
        if (line.startsWith('info') && line.includes(' pv ')) {
            const pvIndex = line.indexOf(' pv ') + 4;
            engineState.currentPv = line.substring(pvIndex);

            // If evaluating user's move, store this as refutation
            if (engineState.status === 'evaluating_current') {
                engineState.badMoveRefutation = engineState.currentPv;
            }
        }

        // Parse score (centipawns)
        if (line.startsWith('info') && line.includes('score cp')) {
            const parts = line.split(' ');
            const scoreIndex = parts.indexOf('cp') + 1;
            if (scoreIndex > 0 && scoreIndex < parts.length) {
                let score = parseInt(parts[scoreIndex]) / 100;

                // Store evaluation
                engineState.currentEval = score;

                // Notify callback
                if (engineState.onEvaluation) {
                    engineState.onEvaluation(score, engineState.currentPv);
                }
            }
        }

        // Parse best move
        if (line.startsWith('bestmove')) {
            const moveStr = line.split(' ')[1];

            if (engineState.onBestMove) {
                engineState.onBestMove({
                    move: moveStr,
                    status: engineState.status,
                    pv: engineState.currentPv,
                    refutation: engineState.badMoveRefutation,
                    bestMoves: [...engineState.bestMoves]
                });
            }
        }

    } catch (error) {
        console.error('Error parsing engine message:', line, error);
        handleEngineError(error);
    }
}

/**
 * Handles engine errors with retry logic
 * @param {Error} error - The error that occurred
 */
async function handleEngineError(error) {
    console.error('Engine error:', error);

    if (initRetryCount < MAX_INIT_RETRIES) {
        initRetryCount++;
        showEngineStatus(`Engine error. Retrying (${initRetryCount}/${MAX_INIT_RETRIES})...`);

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * initRetryCount));

        // Attempt to reinitialize
        try {
            if (engineState.worker) {
                engineState.worker.terminate();
            }
            await initializeEngine({
                onReady: () => showEngineStatus('Engine recovered'),
                onBestMove: engineState.onBestMove,
                onEvaluation: engineState.onEvaluation,
                onError: engineState.onError
            });
        } catch (retryError) {
            if (initRetryCount >= MAX_INIT_RETRIES) {
                engineState.status = 'error';
                showEngineStatus('Engine failed. Please refresh the page.');
                if (engineState.onError) {
                    engineState.onError(retryError);
                }
            }
        }
    } else {
        engineState.status = 'error';
        showEngineStatus('Engine failed. Please refresh the page.');
        if (engineState.onError) {
            engineState.onError(error);
        }
    }
}

/**
 * Requests the engine to evaluate a position
 * @param {string} fen - FEN string of the position to evaluate
 * @param {number} depth - Search depth (default: 12)
 * @param {string} evaluationType - Type of evaluation: 'current' | 'hint' | 'play'
 */
export function evaluatePosition(fen, depth = 12, evaluationType = 'current') {
    if (!engineState.worker || engineState.status === 'error') {
        console.error('Engine not available');
        return;
    }

    // Reset state for new evaluation
    engineState.currentPv = "";
    if (evaluationType === 'current') {
        engineState.badMoveRefutation = "";
    }

    // Update status
    if (evaluationType === 'current') {
        engineState.status = 'evaluating_current';
    } else if (evaluationType === 'hint') {
        engineState.status = 'finding_hint';
    } else if (evaluationType === 'play') {
        engineState.status = 'playing';
    }

    // Send position and evaluation request
    engineState.worker.postMessage(`position fen ${fen}`);
    engineState.worker.postMessage(`go depth ${depth}`);
}

/**
 * Requests the engine to find the best move
 * @param {string} fen - FEN string of the position
 * @param {number} depth - Search depth
 */
export function findBestMove(fen, depth = 12) {
    evaluatePosition(fen, depth, 'play');
}

/**
 * Analyzes a position with multiple principal variations
 * @param {string} fen - FEN string of the position
 * @param {number} depth - Search depth
 * @param {number} numLines - Number of lines to analyze (default 3)
 */
export function analyzeWithMultiPv(fen, depth = 15, numLines = 3) {
    if (!engineState.worker || engineState.status === 'error') {
        console.error('Engine not available');
        return;
    }

    // Reset best moves array
    engineState.bestMoves = [];
    engineState.status = 'analyzing';

    // Configure multipv
    engineState.worker.postMessage(`setoption name MultiPV value ${numLines}`);

    // Send position and analysis request
    engineState.worker.postMessage(`position fen ${fen}`);
    engineState.worker.postMessage(`go depth ${depth}`);
}

/**
 * Gets the current engine state
 * @returns {EngineState} Current engine state
 */
export function getEngineState() {
    return { ...engineState };
}

/**
 * Checks if the engine is ready
 * @returns {boolean} True if engine is ready
 */
export function isEngineReady() {
    return engineState.status !== 'error' &&
           engineState.status !== 'initializing' &&
           engineState.worker !== null;
}

/**
 * Displays engine status to the user
 * @param {string} message - Status message to display
 */
function showEngineStatus(message) {
    const feedbackEl = document.getElementById('feedback');
    if (feedbackEl) {
        feedbackEl.innerHTML = `<em>${message}</em>`;
        feedbackEl.className = 'feedback-box';
    }
}

/**
 * Resets the engine state to idle
 */
export function resetEngineStatus() {
    if (engineState.status !== 'error') {
        engineState.status = 'idle';
    }
}

/**
 * Terminates the engine worker
 */
export function terminateEngine() {
    if (engineState.worker) {
        engineState.worker.terminate();
        engineState.worker = null;
        engineState.status = 'idle';
    }
}
