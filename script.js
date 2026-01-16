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
    resetEngineStatus,
    analyzeWithMultiPv
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
    getCurrentFen,
    loadPosition
} from './board-controller.js';

import {
    displayMoveAnalysis,
    showAnalyzing,
    showMessage,
    updateEvaluationBar,
    calculateEvalLoss,
    isMistake,
    uciToSan
} from './analysis.js';

import {
    updateOpeningDisplay,
    loadOpeningsDatabase
} from './openings.js';

import {
    initializeMoveHistory,
    addMove,
    annotateLastMove,
    updateLastMoveEvaluation,
    resetMoveHistory,
    getMoves,
    loadMoveHistory,
    setNavigationMode,
    isViewingHistory
} from './move-history.js';

import {
    saveGame,
    loadGame,
    exportToPGN,
    importFromPGN,
    downloadPGN,
    showLoadGameModal,
    hideLoadGameModal
} from './game-manager.js';

import {
    displayBestMoves,
    hideBestMoves,
    detectCriticalMoments,
    displayCriticalMoments,
    hideCriticalMoments,
    generatePuzzle,
    displayPuzzles,
    togglePuzzlesPanel,
    clearPuzzles,
    setAnalysisMode,
    isAnalysisMode
} from './enhanced-analysis.js';

import { themeManager } from './themes.js';

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
        // Initialize theme manager and apply saved settings
        themeManager.applyAllSettings();

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
            onMultiPv: handleMultiPvUpdate,
            onError: (error) => {
                showMessage('Engine error. Please refresh the page.');
                console.error('Engine error:', error);
            }
        });

        if (!engineInitialized) {
            showMessage('Engine initialization failed. Some features may not work.');
        }

        // Initialize move history
        initializeMoveHistory({
            onMoveClick: handleMoveNavigation
        });

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
    const saveGameBtn = document.getElementById('saveGameBtn');
    const loadGameBtn = document.getElementById('loadGameBtn');
    const exportPgnBtn = document.getElementById('exportPgnBtn');
    const importPgnBtn = document.getElementById('importPgnBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const pgnFileInput = document.getElementById('pgnFileInput');
    const hintBtn = document.getElementById('hintBtn');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const analysisModeCheckbox = document.getElementById('analysisMode');
    const showPuzzlesBtn = document.getElementById('showPuzzlesBtn');

    if (resetBtn) resetBtn.addEventListener('click', handleReset);
    if (undoBtn) undoBtn.addEventListener('click', handleUndo);
    if (flipBtn) flipBtn.addEventListener('click', handleFlip);
    if (continueBtn) continueBtn.addEventListener('click', handleContinue);
    if (saveGameBtn) saveGameBtn.addEventListener('click', handleSaveGame);
    if (loadGameBtn) loadGameBtn.addEventListener('click', handleLoadGame);
    if (exportPgnBtn) exportPgnBtn.addEventListener('click', handleExportPGN);
    if (importPgnBtn) importPgnBtn.addEventListener('click', () => pgnFileInput?.click());
    if (closeModalBtn) closeModalBtn.addEventListener('click', hideLoadGameModal);
    if (pgnFileInput) pgnFileInput.addEventListener('change', handleImportPGN);
    if (hintBtn) hintBtn.addEventListener('click', handleHint);
    if (analyzeBtn) analyzeBtn.addEventListener('click', handleAnalyze);
    if (analysisModeCheckbox) analysisModeCheckbox.addEventListener('change', handleAnalysisModeToggle);
    if (showPuzzlesBtn) showPuzzlesBtn.addEventListener('click', togglePuzzlesPanel);

    // Theme controls
    const darkModeToggle = document.getElementById('darkModeToggle');
    const boardThemeSelect = document.getElementById('boardTheme');
    const pieceSetSelect = document.getElementById('pieceSet');
    const boardSizeSlider = document.getElementById('boardSize');
    const boardSizeValue = document.getElementById('boardSizeValue');
    const animationSpeedSelect = document.getElementById('animationSpeed');
    const soundToggle = document.getElementById('soundToggle');

    if (darkModeToggle) {
        darkModeToggle.checked = themeManager.settings.darkMode;
        darkModeToggle.addEventListener('change', (e) => {
            themeManager.setDarkMode(e.target.checked);
        });
    }

    if (boardThemeSelect) {
        boardThemeSelect.value = themeManager.settings.boardTheme;
        boardThemeSelect.addEventListener('change', (e) => {
            themeManager.setBoardTheme(e.target.value);
        });
    }

    if (pieceSetSelect) {
        pieceSetSelect.value = themeManager.settings.pieceSet;
        pieceSetSelect.addEventListener('change', (e) => {
            themeManager.setPieceSet(e.target.value);
        });
    }

    if (boardSizeSlider && boardSizeValue) {
        boardSizeSlider.value = themeManager.settings.boardSize;
        boardSizeValue.textContent = `${themeManager.settings.boardSize}px`;
        boardSizeSlider.addEventListener('input', (e) => {
            const size = e.target.value;
            boardSizeValue.textContent = `${size}px`;
            themeManager.setBoardSize(parseInt(size));
        });
    }

    if (animationSpeedSelect) {
        animationSpeedSelect.value = themeManager.settings.animationSpeed;
        animationSpeedSelect.addEventListener('change', (e) => {
            themeManager.setAnimationSpeed(e.target.value);
        });
    }

    if (soundToggle) {
        soundToggle.checked = themeManager.settings.soundEnabled;
        soundToggle.addEventListener('change', (e) => {
            themeManager.setSoundEnabled(e.target.checked);
        });
    }

    // Enable audio on first user interaction
    document.addEventListener('click', () => {
        themeManager.enableAudio();
    }, { once: true });
}

/**
 * Handles user moves from the board
 * @param {Object} moveData - Move information
 */
function handleUserMove(moveData) {
    const { move, previousFen, currentFen } = moveData;

    // Don't allow moves while viewing history
    if (isViewingHistory()) {
        showMessage('Return to current position to make moves');
        return;
    }

    // Hide continue button and unpause
    toggleContinueButton(false);
    appState.gamePaused = false;

    // Add move to history (evaluation will be updated later)
    const chess = getChess();
    const turn = chess.turn();
    addMove(move.san, null, currentFen, turn === 'w' ? 'b' : 'w'); // Color is previous turn

    // Update opening display
    updateOpeningDisplay(chess);

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

    // Update move history with evaluation and annotation
    updateLastMoveEvaluation(currentEval);
    annotateLastMove(evalLoss);

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

        // Make engine move if game is not over and not in analysis mode
        if (!isGameOver() && !isAnalysisMode()) {
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
            const chess = getChess();
            const beforeTurn = chess.turn();

            performEngineMove(move);

            // Add engine move to history
            const moveHistory = chess.history();
            const lastMoveSan = moveHistory[moveHistory.length - 1];
            const currentFen = getCurrentFen();
            addMove(lastMoveSan, null, currentFen, beforeTurn);

            updateOpeningDisplay(chess);

            // Evaluate new position
            evaluatePosition(currentFen, 10, 'current');

            // Store evaluation for the engine's move (will be updated when evaluation completes)
            setTimeout(() => {
                const engineState = getEngineState();
                updateLastMoveEvaluation(engineState.currentEval);
                appState.previousEval = engineState.currentEval;
            }, 500);
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

    // Generate puzzle from this mistake
    if (data.evalLoss >= 1.0 && bestMoveUci) {
        const sanMove = uciToSan(bestMoveUci, data.previousFen);
        generatePuzzle(
            {
                move: data.move,
                evalLoss: data.evalLoss
            },
            sanMove,
            data.previousFen
        );
    }

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
    resetMoveHistory();
    appState.previousEval = 0.3;
    appState.gamePaused = false;
    appState.pendingUserMove = null;
    toggleContinueButton(false);

    // Clear analysis panels
    hideBestMoves();
    hideCriticalMoments();
    clearPuzzles();

    updateOpeningDisplay(getChess());
    showMessage('Make a move...');
    updateEvaluationBar(0.3);

    // If playing as black, engine moves first (unless in analysis mode)
    if (getUserColor() === 'black' && !isAnalysisMode()) {
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

    if (!isGameOver() && !isAnalysisMode()) {
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

/**
 * Handles save game button click
 */
function handleSaveGame() {
    const moves = getMoves();
    if (moves.length === 0) {
        showMessage('No moves to save');
        return;
    }

    const chess = getChess();
    const result = chess.game_over()
        ? (chess.in_checkmate()
            ? (chess.turn() === 'w' ? '0-1' : '1-0')
            : '1/2-1/2')
        : '*';

    const success = saveGame(moves, getCurrentFen(), result);
    if (success) {
        showMessage('Game saved successfully!');
    } else {
        showMessage('Failed to save game');
    }
}

/**
 * Handles load game button click
 */
function handleLoadGame() {
    showLoadGameModal((game) => {
        // Reset board first
        resetBoard();
        resetMoveHistory();

        // Load moves from saved game
        loadMoveHistory(game.moves);

        // Replay moves on the board
        const chess = getChess();
        game.moves.forEach(moveRecord => {
            try {
                chess.move(moveRecord.san);
            } catch (error) {
                console.error('Error replaying move:', moveRecord.san, error);
            }
        });

        // Update board display
        loadPosition(game.fen);
        updateOpeningDisplay(chess);

        // Update evaluation bar with last move's eval
        if (game.moves.length > 0) {
            const lastMove = game.moves[game.moves.length - 1];
            if (lastMove.evaluation !== null) {
                updateEvaluationBar(lastMove.evaluation);
                appState.previousEval = lastMove.evaluation;
            }
        }

        showMessage('Game loaded successfully');
    });
}

/**
 * Handles export PGN button click
 */
function handleExportPGN() {
    const moves = getMoves();
    if (moves.length === 0) {
        showMessage('No moves to export');
        return;
    }

    const chess = getChess();
    const result = chess.game_over()
        ? (chess.in_checkmate()
            ? (chess.turn() === 'w' ? '0-1' : '1-0')
            : '1/2-1/2')
        : '*';

    const pgn = exportToPGN(moves, result);
    const now = new Date();
    const filename = `chess_game_${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, '0')}_${String(now.getDate()).padStart(2, '0')}.pgn`;

    downloadPGN(pgn, filename);
    showMessage('PGN exported successfully!');
}

/**
 * Handles import PGN file selection
 * @param {Event} event - File input change event
 */
function handleImportPGN(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const pgnText = e.target.result;
        const imported = importFromPGN(pgnText);

        if (!imported || imported.moves.length === 0) {
            showMessage('Failed to import PGN');
            return;
        }

        // Reset board first
        resetBoard();
        resetMoveHistory();

        // Replay moves and build move history
        const chess = getChess();
        imported.moves.forEach(moveRecord => {
            try {
                const beforeFen = chess.fen();
                const moveResult = chess.move(moveRecord.san);
                if (moveResult) {
                    const afterFen = chess.fen();
                    moveRecord.fen = afterFen;
                    addMove(moveRecord.san, moveRecord.evaluation, afterFen, moveRecord.color);
                }
            } catch (error) {
                console.error('Error replaying PGN move:', moveRecord.san, error);
            }
        });

        // Update board display
        const currentFen = getCurrentFen();
        loadPosition(currentFen);
        updateOpeningDisplay(chess);

        showMessage(`PGN imported: ${imported.moves.length} moves`);
    };

    reader.readAsText(file);

    // Reset file input
    event.target.value = '';
}

/**
 * Handles move navigation (clicking on moves in history)
 * @param {number} moveIndex - Index of the move in history
 * @param {string} fen - FEN position at that move
 */
function handleMoveNavigation(moveIndex, fen) {
    setNavigationMode(true);

    // Load the position
    loadPosition(fen);

    const moves = getMoves();
    const isLatestMove = moveIndex === moves.length - 1;

    if (isLatestMove) {
        // Return to current position - enable board
        enableBoard();
        showMessage('Current position');
    } else {
        // Viewing history - disable board
        disableBoard();
        showMessage(`Viewing move ${Math.floor(moveIndex / 2) + 1}${moveIndex % 2 === 0 ? '' : '...'}`);
    }

    setNavigationMode(false);
}

/**
 * Handles hint button click
 */
function handleHint() {
    if (!isEngineReady()) {
        showMessage('Engine not ready');
        return;
    }

    const currentFen = getCurrentFen();
    const depthSelect = document.getElementById('analysisDepth');
    const depth = depthSelect ? parseInt(depthSelect.value) : 15;

    showAnalyzing('Finding best move...');

    // Analyze with multipv to get top moves
    analyzeWithMultiPv(currentFen, depth, 3);
}

/**
 * Handles analyze button click
 */
function handleAnalyze() {
    if (!isEngineReady()) {
        showMessage('Engine not ready');
        return;
    }

    const currentFen = getCurrentFen();
    const depthSelect = document.getElementById('analysisDepth');
    const depth = depthSelect ? parseInt(depthSelect.value) : 15;

    showAnalyzing(`Analyzing position (depth ${depth})...`);

    // Analyze with multipv to show top 3 moves
    analyzeWithMultiPv(currentFen, depth, 3);

    // Also detect critical moments in the current game
    const moves = getMoves();
    if (moves.length > 1) {
        const criticalMoments = detectCriticalMoments(moves);
        displayCriticalMoments(criticalMoments, handleMoveNavigation);
    }
}

/**
 * Handles analysis mode toggle
 * @param {Event} event - Change event
 */
function handleAnalysisModeToggle(event) {
    const enabled = event.target.checked;
    setAnalysisMode(enabled);

    if (enabled) {
        showMessage('Analysis mode enabled - engine will not make moves');
    } else {
        showMessage('Analysis mode disabled - normal play resumed');
    }
}

/**
 * Handles multipv updates from engine
 * @param {Array} bestMoves - Array of best moves with evaluations
 */
function handleMultiPvUpdate(bestMoves) {
    const currentFen = getCurrentFen();
    displayBestMoves(bestMoves, currentFen);
}

// Initialize application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
