/**
 * @fileoverview AI Chess Coach - Main application controller
 * Orchestrates the chess board, engine, and analysis modules
 */

import {
    initializeEngine,
    evaluatePosition,
    findBestMove,
    getEngineState,
    isEngineReady,
    resetEngineStatus
} from './chess-engine.js';

import {
    initializeBoard,
    performEngineMove,
    disableBoard,
    enableBoard,
    resetBoard,
    undoMove,
    flipBoard,
    getChess,
    getUserColor,
    isGameOver,
    getCurrentFen
} from './board-controller.js';

import {
    displayMoveAnalysis,
    showAnalyzing,
    showMessage,
    updateEvaluationBar,
    calculateEvalLoss,
    isMistake
} from './analysis.js';

import {
    updateOpeningDisplay,
    loadOpeningsDatabase
} from './openings.js';

/**
 * Application state
 */
const appState = {
    previousEval: 0.3,
    gamePaused: false,
    pendingUserMove: null
};

/**
 * Initializes the chess application
 */
async function initializeApp() {
    try {
        // Load opening database
        await loadOpeningsDatabase();

        // Initialize board
        const boardInitialized = initializeBoard({
            containerId: 'board',
            orientation: 'white',
            onUserMove: handleUserMove
        });

        if (!boardInitialized) {
            showMessage('Failed to initialize board. Please refresh the page.');
            return;
        }

        // Initialize engine
        const engineInitialized = await initializeEngine({
            onReady: () => {
                showMessage('Make a move to get coaching...');
                updateEvaluationBar(0.3);
            },
            onBestMove: handleEngineBestMove,
            onEvaluation: handleEngineEvaluation,
            onError: (error) => {
                showMessage('Engine error. Please refresh the page.');
                console.error('Engine error:', error);
            }
        });

        if (!engineInitialized) {
            showMessage('Engine initialization failed. Some features may not work.');
        }

        // Set up UI event listeners
        setupEventListeners();

        // Update opening display
        updateOpeningDisplay(getChess());

    } catch (error) {
        console.error('Application initialization error:', error);
        showMessage('Failed to start application. Please refresh the page.');
    }
}

/**
 * Sets up event listeners for UI controls
 */
function setupEventListeners() {
    const resetBtn = document.getElementById('resetBtn');
    const undoBtn = document.getElementById('undoBtn');
    const flipBtn = document.getElementById('flipBtn');
    const continueBtn = document.getElementById('continueBtn');

    if (resetBtn) resetBtn.addEventListener('click', handleReset);
    if (undoBtn) undoBtn.addEventListener('click', handleUndo);
    if (flipBtn) flipBtn.addEventListener('click', handleFlip);
    if (continueBtn) continueBtn.addEventListener('click', handleContinue);
}

/**
 * Handles user moves from the board
 * @param {Object} moveData - Move information
 */
function handleUserMove(moveData) {
    const { move, previousFen, currentFen } = moveData;

    // Hide continue button and unpause
    toggleContinueButton(false);
    appState.gamePaused = false;

    // Update opening display
    updateOpeningDisplay(getChess());

    // Show analyzing message
    showAnalyzing('Analyzing...');

    // Request evaluation of the new position
    evaluatePosition(currentFen, 12, 'current');

    // After engine has time to evaluate, analyze the move
    setTimeout(() => {
        analyzeUserMove(move, previousFen, currentFen);
    }, 800);
}

/**
 * Analyzes a user's move
 * @param {Object} move - Chess.js move object
 * @param {string} previousFen - FEN before the move
 * @param {string} currentFen - FEN after the move
 */
function analyzeUserMove(move, previousFen, currentFen) {
    const engineState = getEngineState();
    const currentEval = engineState.currentEval;

    // Calculate evaluation loss
    const evalLoss = calculateEvalLoss(appState.previousEval, currentEval, getUserColor());

    // Check if hints are enabled
    const showHints = document.getElementById('showHints')?.checked ?? true;

    // Determine if this is a mistake
    const isMistakeMove = isMistake(evalLoss);

    if (isMistakeMove && showHints && !isGameOver()) {
        // Mistake detected - find better move
        showAnalyzing('Finding better move...');

        // Store pending analysis data
        appState.pendingUserMove = {
            move,
            evalLoss,
            currentEval,
            refutation: engineState.badMoveRefutation,
            previousFen,
            currentFen
        };

        // Find best move in the previous position
        evaluatePosition(previousFen, 12, 'hint');

    } else {
        // Good move or hints disabled - show analysis and continue
        displayMoveAnalysis({
            evalLoss,
            currentEval,
            bestMoveUci: null,
            bestLinePv: null,
            refutationPv: null,
            previousFen,
            currentFen
        });

        appState.previousEval = currentEval;

        // Make engine move if game is not over
        if (!isGameOver()) {
            requestEngineMove();
        }
    }
}

/**
 * Handles best move from engine
 * @param {Object} result - Engine result
 */
function handleEngineBestMove(result) {
    const { move, status, pv, refutation } = result;

    if (status === 'playing') {
        // Engine is making its move
        if (move && move !== '(none)') {
            performEngineMove(move);
            updateOpeningDisplay(getChess());

            // Evaluate new position
            const currentFen = getCurrentFen();
            evaluatePosition(currentFen, 10, 'current');
        }
        resetEngineStatus();

    } else if (status === 'finding_hint') {
        // Engine found the best move (hint)
        if (appState.pendingUserMove) {
            completeUserMoveAnalysis(move, pv);
        }
        resetEngineStatus();
    }
}

/**
 * Completes user move analysis with hint
 * @param {string} bestMoveUci - Best move in UCI format
 * @param {string} bestLinePv - Best line Principal Variation
 */
function completeUserMoveAnalysis(bestMoveUci, bestLinePv) {
    const data = appState.pendingUserMove;
    if (!data) return;

    // Display full analysis with hint
    displayMoveAnalysis({
        evalLoss: data.evalLoss,
        currentEval: data.currentEval,
        bestMoveUci: bestMoveUci,
        bestLinePv: bestLinePv,
        refutationPv: data.refutation,
        previousFen: data.previousFen,
        currentFen: data.currentFen
    });

    appState.previousEval = data.currentEval;

    // Pause game and show continue button
    appState.gamePaused = true;
    toggleContinueButton(true);

    // Clear pending move
    appState.pendingUserMove = null;
}

/**
 * Handles engine evaluation updates
 * @param {number} score - Evaluation score
 * @param {string} pv - Principal Variation
 */
function handleEngineEvaluation(score, pv) {
    // Update evaluation bar in real-time
    const turn = getChess().turn();
    const adjustedScore = turn === 'b' ? -score : score;
    updateEvaluationBar(adjustedScore);
}

/**
 * Requests the engine to make a move
 */
function requestEngineMove() {
    if (!isEngineReady()) {
        console.error('Engine not ready');
        return;
    }

    const levelSelect = document.getElementById('difficulty');
    const depth = levelSelect ? parseInt(levelSelect.value) : 12;
    const currentFen = getCurrentFen();

    findBestMove(currentFen, depth);
}

/**
 * Handles reset button click
 */
function handleReset() {
    resetBoard();
    appState.previousEval = 0.3;
    appState.gamePaused = false;
    appState.pendingUserMove = null;
    toggleContinueButton(false);

    updateOpeningDisplay(getChess());
    showMessage('Make a move...');
    updateEvaluationBar(0.3);

    // If playing as black, engine moves first
    if (getUserColor() === 'black') {
        setTimeout(requestEngineMove, 500);
    }
}

/**
 * Handles undo button click
 */
function handleUndo() {
    const engineState = getEngineState();

    // Don't allow undo during engine processing
    if (engineState.status === 'playing' || engineState.status === 'evaluating_current') {
        return;
    }

    // If game is paused, just undo the user's bad move
    if (appState.gamePaused) {
        undoMove(true);
        appState.gamePaused = false;
        toggleContinueButton(false);
    } else {
        // Undo both user and engine moves
        undoMove(false);
    }

    updateOpeningDisplay(getChess());
    showMessage('Move undone.');

    // Re-evaluate position
    const currentFen = getCurrentFen();
    evaluatePosition(currentFen, 10, 'current');
}

/**
 * Handles flip/switch sides button click
 */
function handleFlip() {
    const btn = document.getElementById('flipBtn');
    const newColor = flipBoard();

    if (btn) {
        btn.innerText = newColor === 'white' ? 'Play as Black' : 'Play as White';
    }

    handleReset();
}

/**
 * Handles continue button click
 */
function handleContinue() {
    if (!appState.gamePaused) return;

    toggleContinueButton(false);
    appState.gamePaused = false;

    if (!isGameOver()) {
        requestEngineMove();
    }
}

/**
 * Toggles the continue button visibility
 * @param {boolean} show - Whether to show the button
 */
function toggleContinueButton(show) {
    const btn = document.getElementById('continueBtn');
    if (btn) {
        btn.style.display = show ? 'block' : 'none';
    }
}

// Initialize application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
