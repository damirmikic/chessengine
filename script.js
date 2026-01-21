/**
 * @fileoverview AI Chess Coach - Main application controller
 * Orchestrates the chess board, engine, and analysis modules
 */

import EngineManager from './engine-manager.js';

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
    loadPosition,
    drawAnalysisShapes,
    clearShapes
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
    resetCapturedPieces,
    addCapturedPiece,
    setCapturedPieces
} from './captured-pieces.js';

import {
    initializeMoveHistory,
    addMove,
    annotateLastMove,
    removeLastMove,
    updateLastMoveEvaluation,
    resetMoveHistory,
    loadMoveHistory,
    getMoves,
    isViewingHistory,
    setNavigationMode
} from './move-history.js';

import {
    saveGame,
    loadGame,
    getSavedGames,
    exportToPGN,
    importFromPGN,
    downloadPGN,
    showLoadGameModal,
    hideLoadGameModal
} from './game-manager.js';

import {
    initializeMultiplayer,
    sendMove,
    getMultiplayerState,
    recordGameResult
} from './multiplayer.js';

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

// Learning Features
import {
    initializeLearningDashboard,
    showLearningDashboard,
    recordAndNotify
} from './learning-dashboard.js';

import {
    loadLearningData,
    getAverageRating,
    getLearningState,
    getProgressData
} from './learning-tracker.js';

import {
    initializeMatchAnalysis,
    analyzeMatch,
    goToMove,
    nextMove,
    previousMove,
    firstMove,
    lastMove,
    getCurrentMove,
    getAnalyzedMoves,
    calculateAccuracy,
    getCurrentIndex,
    getTotalMoves,
    isAnalyzing,
    getProgress,
    resetAnalysis
} from './match-analysis.js';

// Chess Clock
import {
    initializeClock,
    startClock,
    pauseClock,
    resetClock,
    switchPlayer,
    setActivePlayer,
    getClockState,
    isClockEnabled,
    isClockRunning
} from './chess-clock.js';

/**
 * Engine Manager Instance
 */
const engineManager = new EngineManager();

/**
 * Application state
 */
const appState = {
    previousEval: 0.3,
    gamePaused: false,
    pendingUserMove: null,
    clockEnabled: false,
    gameRecorded: false
};

/**
 * Initializes the chess application
 */
async function initializeApp() {
    try {
        // Initialize theme manager and apply saved settings
        themeManager.applyAllSettings();

        // Initialize context-aware navigation system
        if (window.contextManager) {
            window.contextManager.initialize();
            console.log('Context Manager initialized');
        }

        // Initialize keyboard shortcuts and command palette
        if (window.keyboardShortcutsManager) {
            window.keyboardShortcutsManager.initialize();
            console.log('Keyboard Shortcuts Manager initialized');
        }

        // Load learning data
        loadLearningData();

        // Initialize learning dashboard
        initializeLearningDashboard({
            onPositionLoad: (fen) => {
                loadPosition(fen);
                updateOpeningDisplay(getChess());
            }
        });

        // Initialize chess clock
        initializeClock({
            preset: 'rapid_10',
            onTimeUpdate: handleClockUpdate,
            onTimeUp: handleTimeUp,
            onWarning: handleClockWarning
        });

        // Update rating display
        updateRatingDisplay();

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

        // Initialize engine with stored preference
        const preferredEngine = EngineManager.getStoredPreference();
        updateEngineStatusUI('connecting', preferredEngine);

        const engineInitialized = await engineManager.initialize(preferredEngine, {
            onReady: () => {
                showMessage('Make a move to get coaching...');
                updateEvaluationBar(0.3);
                updateEngineStatusUI('connected', engineManager.getEngineType());
            },
            onBestMove: handleEngineBestMove,
            onEvaluation: handleEngineEvaluation,
            onMultiPv: handleMultiPvUpdate,
            onStreamingUpdate: handleStreamingUpdate,
            onCloudMultiPv: handleCloudMultiPv,
            onError: (error) => {
                const message = error.fallback
                    ? 'Cloud engine unavailable. Using local Stockfish.'
                    : 'Engine error. Please refresh the page.';
                showMessage(message);
                console.error('Engine error:', error);
                updateEngineStatusUI(error.fallback ? 'connected' : 'disconnected', engineManager.getEngineType());
            }
        });

        if (!engineInitialized) {
            showMessage('Engine initialization failed. Some features may not work.');
        }

        // Initialize move history
        initializeMoveHistory({
            onMoveClick: handleMoveNavigation
        });

        // Initialize match analysis
        initializeMatchAnalysis({
            onUpdate: handleMatchAnalysisUpdate
        });

        // Set up UI event listeners
        setupEventListeners();
        setupTabs();

        // Initialize difficulty badge
        updateDifficultyBadge();

        // Initialize multiplayer
        initializeMultiplayer({
            onLocalModeToggle: (enabled) => {
                showMessage(enabled ? 'Local Play Enabled' : 'Single Player Enabled');
                if (!enabled && getChess().turn() !== getUserColor().charAt(0)) {
                    requestEngineMove();
                }
            },
            onConnected: (id) => showMessage(`Connected to ${id}`),
            onDisconnected: () => showMessage('Opponent disconnected'),
            onColorAssigned: (color) => {
                const flipBtn = document.getElementById('flipBtn');
                if (getUserColor() !== color) handleFlip();
                showMessage(`You are playing as ${color}`);
            },
            onRemoteMove: (move) => {
                performEngineMove(move.from + move.to + (move.promotion || ''));
                handleEngineBestMove({ move: move.from + move.to + (move.promotion || ''), evaluation: 0 });
            },
            onResetRequestAccept: () => handleReset(),
            onTabSwitch: (tabId) => switchTab(tabId)
        });

        // Update opening display
        updateOpeningDisplay(getChess());

    } catch (error) {
        console.error('Application initialization error:', error);
        showMessage('Failed to start application. Please refresh the page.');
    }
}

/**
 * Handles engine switching between local and cloud
 */
async function handleEngineSwitch(newEngine) {
    try {
        showMessage(`Switching to ${newEngine} engine...`);
        updateEngineStatusUI('connecting', newEngine);

        await engineManager.switchEngine(newEngine);

        // Update UI
        const engineText = document.getElementById('engineText');
        const engineIndicator = document.getElementById('engineIndicator');

        if (engineText) {
            engineText.textContent = newEngine === 'local' ? 'Local' : 'Cloud';
        }

        if (engineIndicator) {
            engineIndicator.classList.add('active');
        }

        updateEngineStatusUI('connected', newEngine);
        showMessage(`Switched to ${newEngine} engine`);
    } catch (error) {
        console.error('Engine switch error:', error);
        showMessage('Failed to switch engine');
        updateEngineStatusUI('disconnected', engineManager.getEngineType());
    }
}

/**
 * Sets up tab navigation for the sidebar (legacy - kept for compatibility)
 */
function setupTabs() {
    const tabs = document.querySelectorAll('.sidebar-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            switchTab(target);
        });
    });
}

/**
 * Switches the sidebar to a specific tab
 * @param {string} tabId - 'play' | 'analysis' | 'settings'
 */
function switchTab(tabId) {
    const tabs = document.querySelectorAll('.sidebar-tab');
    const panels = document.querySelectorAll('.tab-panel');

    tabs.forEach(tab => {
        if (tab.dataset.tab === tabId) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    panels.forEach(panel => {
        if (panel.id === `tab-${tabId}`) {
            panel.classList.add('active');
        } else {
            panel.classList.remove('active');
        }
    });
}

/**
 * Sets up event listeners for UI controls
 */
function setupEventListeners() {
    // Header navigation buttons
    const navPlayBtn = document.getElementById('navPlayBtn');
    const navAnalysisBtn = document.getElementById('navAnalysisBtn');
    const navLearnBtn = document.getElementById('navLearnBtn');
    const navSettingsBtn = document.getElementById('navSettingsBtn');
    const engineToggleBtn = document.getElementById('engineToggleBtn');
    const commandPaletteBtn = document.getElementById('commandPaletteBtn');
    const newGameFromEndBtn = document.getElementById('newGameFromEndBtn');
    const reviewGameBtn = document.getElementById('reviewGameBtn');
    const saveCompletedGameBtn = document.getElementById('saveCompletedGameBtn');
    const openLearningBtn = document.getElementById('openLearningBtn');

    // Header navigation handlers
    if (navPlayBtn) {
        navPlayBtn.addEventListener('click', () => {
            handleReset();
            if (window.contextManager) {
                window.contextManager.setContext('game-active');
            }
        });
    }

    if (navAnalysisBtn) {
        navAnalysisBtn.addEventListener('click', () => {
            if (window.contextManager) {
                window.contextManager.setContext('analysis');
            }
        });
    }

    if (navLearnBtn) {
        navLearnBtn.addEventListener('click', () => {
            if (window.contextManager) {
                window.contextManager.setContext('learning');
            }
        });
    }

    if (navSettingsBtn) {
        navSettingsBtn.addEventListener('click', () => {
            if (window.contextManager) {
                window.contextManager.setContext('settings');
            }
        });
    }

    if (engineToggleBtn) {
        engineToggleBtn.addEventListener('click', () => {
            const currentEngine = engineManager.getEngineType();
            const newEngine = currentEngine === 'local' ? 'cloud' : 'local';
            handleEngineSwitch(newEngine);
        });
    }

    if (commandPaletteBtn) {
        commandPaletteBtn.addEventListener('click', () => {
            if (window.keyboardShortcutsManager) {
                window.keyboardShortcutsManager.openCommandPalette();
            }
        });
    }

    // Game ended context buttons
    if (newGameFromEndBtn) {
        newGameFromEndBtn.addEventListener('click', () => {
            handleReset();
            if (window.contextManager) {
                window.contextManager.setContext('game-active');
            }
        });
    }

    if (reviewGameBtn) {
        reviewGameBtn.addEventListener('click', () => {
            handleAnalyzeCompleteGame();
            if (window.contextManager) {
                window.contextManager.setContext('analysis');
            }
        });
    }

    if (saveCompletedGameBtn) {
        saveCompletedGameBtn.addEventListener('click', handleSaveGame);
    }

    // Learning context buttons
    if (openLearningBtn) {
        openLearningBtn.addEventListener('click', showLearningDashboard);
    }

    const resetBtn = document.getElementById('resetBtn');
    const undoBtn = document.getElementById('undoBtn');
    const flipBtn = document.getElementById('flipBtn');
    const resignBtn = document.getElementById('resignBtn');
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
    const learningDashboardBtn = document.getElementById('learningDashboardBtn');
    const analyzeGameBtn = document.getElementById('analyzeGameBtn');
    const difficultySelect = document.getElementById('difficulty');
    const clockEnabledToggle = document.getElementById('clockEnabled');
    const clockPresetSelect = document.getElementById('clockPreset');

    // Match Analysis buttons
    const loadMatchAnalysisBtn = document.getElementById('loadMatchAnalysisBtn');
    const closeMatchAnalysisBtn = document.getElementById('closeMatchAnalysisBtn');
    const firstMoveBtn = document.getElementById('firstMoveBtn');
    const prevMoveBtn = document.getElementById('prevMoveBtn');
    const nextMoveBtn = document.getElementById('nextMoveBtn');
    const lastMoveBtn = document.getElementById('lastMoveBtn');

    if (resetBtn) resetBtn.addEventListener('click', handleReset);
    if (undoBtn) undoBtn.addEventListener('click', handleUndo);
    if (flipBtn) flipBtn.addEventListener('click', handleFlip);
    if (resignBtn) resignBtn.addEventListener('click', handleResign);
    if (continueBtn) continueBtn.addEventListener('click', handleContinue);
    if (saveGameBtn) saveGameBtn.addEventListener('click', handleSaveGame);
    if (loadGameBtn) loadGameBtn.addEventListener('click', handleLoadGame);
    if (exportPgnBtn) exportPgnBtn.addEventListener('click', handleExportPGN);
    if (importPgnBtn) importPgnBtn.addEventListener('click', () => pgnFileInput?.click());
    if (closeModalBtn) closeModalBtn.addEventListener('click', hideLoadGameModal);
    if (pgnFileInput) pgnFileInput.addEventListener('change', handleImportPGN);
    if (hintBtn) hintBtn.addEventListener('click', () => {
        handleHint();
        switchTab('analysis');
    });
    if (analyzeBtn) analyzeBtn.addEventListener('click', () => {
        handleAnalyze();
        switchTab('analysis');
    });
    if (analysisModeCheckbox) analysisModeCheckbox.addEventListener('change', handleAnalysisModeToggle);
    if (showPuzzlesBtn) showPuzzlesBtn.addEventListener('click', togglePuzzlesPanel);
    if (learningDashboardBtn) learningDashboardBtn.addEventListener('click', showLearningDashboard);
    if (analyzeGameBtn) analyzeGameBtn.addEventListener('click', handleAnalyzeCompleteGame);
    if (difficultySelect) difficultySelect.addEventListener('change', updateDifficultyBadge);

    // Match Analysis event listeners
    if (loadMatchAnalysisBtn) loadMatchAnalysisBtn.addEventListener('click', handleLoadMatchAnalysis);
    if (closeMatchAnalysisBtn) closeMatchAnalysisBtn.addEventListener('click', handleCloseMatchAnalysis);
    if (firstMoveBtn) firstMoveBtn.addEventListener('click', () => {
        firstMove();
    });
    if (prevMoveBtn) prevMoveBtn.addEventListener('click', () => {
        previousMove();
    });
    if (nextMoveBtn) nextMoveBtn.addEventListener('click', () => {
        nextMove();
    });
    if (lastMoveBtn) lastMoveBtn.addEventListener('click', () => {
        lastMove();
    });

    // Chess Clock controls
    if (clockEnabledToggle) {
        clockEnabledToggle.addEventListener('change', handleClockToggle);
    }

    if (clockPresetSelect) {
        clockPresetSelect.addEventListener('change', handleClockPresetChange);
    }

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

    // Engine selector controls
    const engineLocalRadio = document.getElementById('engineLocal');
    const engineCloudRadio = document.getElementById('engineCloud');
    const cloudSettings = document.getElementById('cloudSettings');
    const cloudDepthSlider = document.getElementById('cloudDepth');
    const cloudDepthValue = document.getElementById('cloudDepthValue');
    const cloudVariantsSlider = document.getElementById('cloudVariants');
    const cloudVariantsValue = document.getElementById('cloudVariantsValue');

    // Set initial state based on current engine
    const currentEngineType = engineManager.getEngineType();
    if (engineLocalRadio && engineCloudRadio) {
        if (currentEngineType === 'cloud') {
            engineCloudRadio.checked = true;
            if (cloudSettings) cloudSettings.style.display = 'block';
        } else {
            engineLocalRadio.checked = true;
            if (cloudSettings) cloudSettings.style.display = 'none';
        }
    }

    // Handle engine switching
    if (engineLocalRadio) {
        engineLocalRadio.addEventListener('change', (e) => {
            if (e.target.checked) {
                handleEngineSwitching('local');
                if (cloudSettings) cloudSettings.style.display = 'none';
            }
        });
    }

    if (engineCloudRadio) {
        engineCloudRadio.addEventListener('change', (e) => {
            if (e.target.checked) {
                handleEngineSwitching('cloud');
                if (cloudSettings) cloudSettings.style.display = 'block';
            }
        });
    }

    // Cloud engine depth control
    if (cloudDepthSlider && cloudDepthValue) {
        cloudDepthSlider.addEventListener('input', (e) => {
            const depth = e.target.value;
            cloudDepthValue.textContent = depth;
            engineManager.setDepth(parseInt(depth));
        });
    }

    // Cloud engine variants control
    if (cloudVariantsSlider && cloudVariantsValue) {
        cloudVariantsSlider.addEventListener('input', (e) => {
            const variants = e.target.value;
            cloudVariantsValue.textContent = variants;
            engineManager.setVariants(parseInt(variants));
        });
    }

    // Enable audio on first user interaction
    document.addEventListener('click', () => {
        themeManager.enableAudio();
    }, { once: true });
}

function handleUserMove(moveData) {
    const { move, previousFen, currentFen } = moveData;

    // Don't allow moves while viewing history
    if (isViewingHistory()) {
        showMessage('Return to current position to make moves');
        return;
    }

    // If in multiplayer mode, send move to peer
    const multiState = getMultiplayerState();
    if (multiState.connected) {
        sendMove(moveData.move);
    }

    // Handle clock
    if (isClockEnabled()) {
        if (!isClockRunning()) {
            startClock();
        }
        switchPlayer();
    }

    // Hide continue button and unpause
    toggleContinueButton(false);
    appState.gamePaused = false;

    // Clear any existing arrows
    clearShapes();

    // Add move to history
    const chess = getChess();
    const turn = chess.turn();
    addMove(move.san, null, currentFen, turn === 'w' ? 'b' : 'w');

    // Track captured pieces
    if (move.captured) {
        // The player who moved captured the piece
        // turn is now the opposite color after the move
        const capturedBy = turn === 'w' ? 'black' : 'white';
        addCapturedPiece(move.captured, capturedBy);
    }

    // Update opening display
    updateOpeningDisplay(chess);

    // Don't request engine move if in local multiplayer or online multiplayer
    if (multiState.isLocalMode || multiState.connected) {
        enableBoard();
        return;
    }

    // Show analyzing message
    showAnalyzing('Analyzing...');

    // Request evaluation of the new position
    engineManager.evaluatePosition(currentFen, 12, 'current');

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
    const engineState = engineManager.getEngineState();
    const currentEval = engineState.currentEval;

    // Calculate evaluation loss
    const evalLoss = calculateEvalLoss(appState.previousEval, currentEval, getUserColor());

    // Update move history with evaluation and annotation
    updateLastMoveEvaluation(currentEval);
    annotateLastMove(evalLoss);

    // Check if hints are enabled
    const showHints = document.getElementById('showHints')?.checked ?? true;
    const noHintsMode = document.getElementById('noHintsMode')?.checked ?? false;

    // Determine if this is a mistake
    const isMistakeMove = isMistake(evalLoss);

    if (isMistakeMove && showHints && !noHintsMode && !isGameOver()) {
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
        engineManager.evaluatePosition(previousFen, 12, 'hint');

    } else {
        // Good move or hints disabled - show analysis and continue
        if (!noHintsMode) {
            displayMoveAnalysis({
                evalLoss,
                currentEval,
                bestMoveUci: null,
                bestLinePv: null,
                refutationPv: null,
                previousFen,
                currentFen
            });
        } else {
            // In no hints mode, just show a simple message
            showMessage('Move played');
        }

        appState.previousEval = currentEval;

        // Make engine move if game is not over and not in analysis mode
        if (!isGameOver() && !isAnalysisMode()) {
            requestEngineMove();
        } else if (isGameOver()) {
            handleGameOver();
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

            // Track captured pieces
            const verboseMoveHistory = chess.history({ verbose: true });
            const lastMoveVerbose = verboseMoveHistory[verboseMoveHistory.length - 1];
            if (lastMoveVerbose && lastMoveVerbose.captured) {
                // beforeTurn is the color that just moved
                const capturedBy = beforeTurn === 'w' ? 'white' : 'black';
                addCapturedPiece(lastMoveVerbose.captured, capturedBy);
            }

            updateOpeningDisplay(chess);

            // Handle clock
            if (isClockEnabled()) {
                switchPlayer();
            }

            // Check if game is over
            if (isGameOver()) {
                handleGameOver();
            }

            // Evaluate new position
            engineManager.evaluatePosition(currentFen, 10, 'current');

            // Store evaluation for the engine's move (will be updated when evaluation completes)
            setTimeout(() => {
                const engineState = engineManager.getEngineState();
                updateLastMoveEvaluation(engineState.currentEval);
                appState.previousEval = engineState.currentEval;
            }, 500);
        }
        engineManager.stopAnalysis();

    } else if (status === 'finding_hint') {
        // Engine found the best move (hint)
        if (appState.pendingUserMove) {
            completeUserMoveAnalysis(move, pv);
        }
        engineManager.stopAnalysis();
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

    // Draw best move arrow (green) and threat arrow (red) if available
    // Load the previous position to draw the arrow
    loadPosition(data.previousFen);
    if (bestMoveUci) {
        const threatMove = data.refutation ? data.refutation.split(' ')[0] : null;
        drawAnalysisShapes(bestMoveUci, threatMove);
    }

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

function handleEngineEvaluation(score, pv) {
    // Update evaluation bar in real-time
    // score is now auto-normalized to White's perspective by the engine module
    updateEvaluationBar(score);
}

/**
 * Requests the engine to make a move
 */
function requestEngineMove() {
    if (!engineManager.getEngineState() || engineManager.getEngineState().status === 'error') {
        console.error('Engine not ready');
        return;
    }

    const levelSelect = document.getElementById('difficulty');
    const depth = levelSelect ? parseInt(levelSelect.value) : 12;
    const currentFen = getCurrentFen();

    // Log the selected depth for debugging
    console.log(`🎯 Engine move requested at depth: ${depth}`);

    // Show depth indicator in the UI
    const status = document.getElementById('status');
    if (status && depth) {
        const levelNames = {
            1: 'Beginner', 3: 'Easy', 5: 'Intermediate', 8: 'Medium',
            10: 'Challenging', 13: 'Hard', 16: 'Expert', 20: 'Master', 25: 'Grandmaster'
        };
        const levelName = levelNames[depth] || `Custom (${depth})`;
        status.setAttribute('title', `Opponent: ${levelName} (Depth ${depth})`);
    }

    engineManager.findBestMove(currentFen, depth);
}


/**
 * Handles player resignation
 */
function handleResign() {
    const chess = getChess();

    // Check if game is already over
    if (chess.game_over()) {
        showMessage('Game is already over!');
        return;
    }

    // Confirm resignation
    if (!confirm('Are you sure you want to resign?')) {
        return;
    }

    // Determine winner (opponent wins)
    const userColor = getUserColor();
    const winner = userColor === 'white' ? 'Black' : 'White';

    // Display resignation message
    showMessage(`You resigned. ${winner} wins! 🏳️`);

    // Disable board
    disableBoard();
    pauseClock();

    // Handle game over logic (recording, etc.)
    handleGameOver();
}

/**
 * Handles game over state
 */
function handleGameOver() {
    pauseClock();

    // Display winner or draw message
    const chess = getChess();
    let message = '';

    if (chess.in_checkmate()) {
        // Determine winner based on whose turn it is (loser)
        const winner = chess.turn() === 'w' ? 'Black' : 'White';
        message = `Checkmate! ${winner} wins! 🏆`;
    } else if (chess.in_stalemate()) {
        message = 'Game Over - Stalemate! ½-½';
    } else if (chess.in_threefold_repetition()) {
        message = 'Game Over - Draw by threefold repetition! ½-½';
    } else if (chess.insufficient_material()) {
        message = 'Game Over - Draw by insufficient material! ½-½';
    } else if (chess.in_draw()) {
        message = 'Game Over - Draw! ½-½';
    } else if (chess.game_over()) {
        message = 'Game Over!';
    }

    if (message) {
        showMessage(message);
        disableBoard();
    }

    // Record game session for learning
    if (!appState.gameRecorded) {
        const moves = getMoves();
        if (moves.length > 5) {
            const result = recordAndNotify(moves);
            updateRatingDisplay();

            // Record in leaderboard
            if (result && result.session) {
                recordGameResult(result.session.accuracy);
            }

            appState.gameRecorded = true;
        }
    }

    // Switch to game-ended context
    if (window.contextManager) {
        window.contextManager.setContext('game-ended');

        // Update game result in UI
        const gameResult = document.getElementById('gameResult');
        if (gameResult) {
            gameResult.textContent = message;
        }

        // Trigger game ended event for other listeners
        document.dispatchEvent(new CustomEvent('game:ended', { detail: { message } }));
    }

    // Show analyze game button if in no hints mode
    const noHintsMode = document.getElementById('noHintsMode')?.checked ?? false;
    if (noHintsMode) {
        const analyzeGameBtn = document.getElementById('analyzeGameBtn');
        if (analyzeGameBtn) {
            analyzeGameBtn.style.display = 'block';
        }
    }
}

/**
 * Handles clock state updates
 * @param {Object} state - Current clock state
 */
function handleClockUpdate(state) {
    const whiteClock = document.getElementById('whiteClock');
    const blackClock = document.getElementById('blackClock');
    const whitePlayer = document.getElementById('whiteClockPlayer');
    const blackPlayer = document.getElementById('blackClockPlayer');

    if (whiteClock) {
        whiteClock.textContent = state.whiteTimeFormatted;
        whiteClock.className = `clock-time ${state.whiteWarning || ''}`;
    }

    if (blackClock) {
        blackClock.textContent = state.blackTimeFormatted;
        blackClock.className = `clock-time ${state.blackWarning || ''}`;
    }

    if (whitePlayer) {
        whitePlayer.classList.toggle('active', state.activePlayer === 'white' && state.running);
        whitePlayer.className = `clock-player ${state.activePlayer === 'white' && state.running ? 'active' : ''} ${state.whiteWarning ? 'warning-' + state.whiteWarning : ''}`;
    }

    if (blackPlayer) {
        blackPlayer.classList.toggle('active', state.activePlayer === 'black' && state.running);
        blackPlayer.className = `clock-player ${state.activePlayer === 'black' && state.running ? 'active' : ''} ${state.blackWarning ? 'warning-' + state.blackWarning : ''}`;
    }
}

/**
 * Handles when a player's time runs out
 * @param {Object} result - Win/loss information
 */
function handleTimeUp(result) {
    const winner = result.winner === 'white' ? 'White' : 'Black';
    const loser = result.loser === 'white' ? 'White' : 'Black';

    showMessage(`Time's up! ${winner} wins on time.`);
    disableBoard();

    handleGameOver();
}

/**
 * Handles clock warnings
 * @param {Object} warning - Warning details
 */
function handleClockWarning(warning) {
    // We can add audio warnings here if needed
}

/**
 * Handles clock toggle
 * @param {Event} event - Toggle event
 */
function handleClockToggle(event) {
    const enabled = event.target.checked;
    if (enabled) {
        initializeClock({
            preset: document.getElementById('clockPreset')?.value || 'rapid_10',
            onTimeUpdate: handleClockUpdate,
            onTimeUp: handleTimeUp,
            onWarning: handleClockWarning
        });
    } else {
        pauseClock();
    }
}

/**
 * Handles clock preset change
 * @param {Event} event - Selection event
 */
function handleClockPresetChange(event) {
    initializeClock({
        preset: event.target.value,
        onTimeUpdate: handleClockUpdate,
        onTimeUp: handleTimeUp,
        onWarning: handleClockWarning
    });
}

/**
 * Updates the rating display in the UI
 */
function updateRatingDisplay() {
    const ratingBadge = document.getElementById('ratingBadge');
    const ratingValue = document.getElementById('ratingValue');

    if (ratingBadge && ratingValue) {
        const rating = getAverageRating();
        ratingValue.textContent = `~${rating}`;
        ratingBadge.style.display = 'inline-flex';
    }
}

/**
 * Updates the difficulty badge display
 */
function updateDifficultyBadge() {
    const difficultyBadge = document.getElementById('difficultyBadge');
    const difficultyValue = document.getElementById('difficultyValue');
    const difficultySelect = document.getElementById('difficulty');

    if (difficultyBadge && difficultyValue && difficultySelect) {
        const depth = parseInt(difficultySelect.value);
        const levelNames = {
            1: 'Beginner',
            3: 'Easy',
            5: 'Intermediate',
            8: 'Medium',
            10: 'Challenging',
            13: 'Hard',
            16: 'Expert',
            20: 'Master',
            25: 'Grandmaster'
        };
        const levelName = levelNames[depth] || `Custom (${depth})`;

        difficultyValue.textContent = levelName;
        difficultyBadge.style.display = 'inline-flex';

        console.log(`📊 Difficulty badge updated: ${levelName} (depth ${depth})`);
    }
}

/**
 * Handles reset button click
 */
function handleReset() {
    resetBoard();
    resetMoveHistory();
    resetClock();
    resetCapturedPieces();

    appState.previousEval = 0.3;
    appState.gamePaused = false;
    appState.pendingUserMove = null;
    appState.gameRecorded = false;
    toggleContinueButton(false);

    // Hide analyze game button
    const analyzeGameBtn = document.getElementById('analyzeGameBtn');
    if (analyzeGameBtn) {
        analyzeGameBtn.style.display = 'none';
    }

    // Clear analysis panels
    hideBestMoves();
    hideCriticalMoments();
    clearPuzzles();

    // Clear arrows from the board
    clearShapes();

    updateOpeningDisplay(getChess());
    showMessage('Make a move...');
    updateEvaluationBar(0.3);
    updateDifficultyBadge();

    // Switch to game-active context
    if (window.contextManager) {
        window.contextManager.setContext('game-active');
        // Trigger game started event
        document.dispatchEvent(new CustomEvent('game:started'));
    }

    // Sync clock toggle UI
    const clockEnabledToggle = document.getElementById('clockEnabled');
    if (clockEnabledToggle && clockEnabledToggle.checked) {
        setActivePlayer(getUserColor());
    }

    // If playing as black, engine moves first (unless in analysis mode)
    if (getUserColor() === 'black' && !isAnalysisMode()) {
        setTimeout(requestEngineMove, 500);
    }
}

/**
 * Handles undo button click
 */
function handleUndo() {
    const engineState = engineManager.getEngineState();

    // Don't allow undo during engine processing
    if (engineState.status === 'playing' || engineState.status === 'evaluating_current') {
        return;
    }

    // If game is paused, just undo the user's bad move
    if (appState.gamePaused) {
        undoMove(true);
        removeLastMove(true);
        appState.gamePaused = false;
        toggleContinueButton(false);
    } else {
        // Undo both user and engine moves
        undoMove(false);
        removeLastMove(false);
    }

    updateOpeningDisplay(getChess());
    showMessage('Move undone.');

    // Update captured pieces display
    const moves = getMoves();
    if (moves.length > 0) {
        updateCapturedPiecesForMoveIndex(moves.length - 1);
    } else {
        resetCapturedPieces();
    }

    // Re-evaluate position
    const currentFen = getCurrentFen();
    engineManager.evaluatePosition(currentFen, 10, 'current');
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

    // Clear arrows when continuing after a hint
    clearShapes();

    // Load the current position back (after showing the hint position)
    const moves = getMoves();
    if (moves.length > 0) {
        const lastMove = moves[moves.length - 1];
        if (lastMove.fen) {
            loadPosition(lastMove.fen);
        }
    }

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
            // Update captured pieces display
            updateCapturedPiecesForMoveIndex(game.moves.length - 1);
        } else {
            resetCapturedPieces();
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

        // Update captured pieces display
        const moves = getMoves();
        if (moves.length > 0) {
            updateCapturedPiecesForMoveIndex(moves.length - 1);
        } else {
            resetCapturedPieces();
        }

        showMessage(`PGN imported: ${imported.moves.length} moves`);
    };

    reader.readAsText(file);

    // Reset file input
    event.target.value = '';
}

function handleMoveNavigation(moveIndex, fen) {
    setNavigationMode(true);

    const moves = getMoves();

    // If fen is not provided, get it from history
    if (!fen && moves[moveIndex]) {
        fen = moves[moveIndex].fen;
    }

    // Load the position
    loadPosition(fen);

    // Update captured pieces for this position
    updateCapturedPiecesForMoveIndex(moveIndex);

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
 * Updates captured pieces display for a specific move index
 * @param {number} moveIndex - The move index to display captures up to
 */
function updateCapturedPiecesForMoveIndex(moveIndex) {
    const moves = getMoves();

    // Replay moves from the start to count captures
    const Chess = getChess().constructor;
    const tempChess = new Chess();

    const whiteCaptured = [];
    const blackCaptured = [];

    // Replay moves up to and including the current index
    for (let i = 0; i <= moveIndex && i < moves.length; i++) {
        const moveRecord = moves[i];

        // Make the move and check if it was a capture
        try {
            const move = tempChess.move(moveRecord.san);
            if (move && move.captured) {
                // The player who moved captured the piece
                const capturedBy = move.color === 'w' ? 'white' : 'black';
                if (capturedBy === 'white') {
                    whiteCaptured.push(move.captured);
                } else {
                    blackCaptured.push(move.captured);
                }
            }
        } catch (error) {
            console.error('Error replaying move for capture tracking:', moveRecord.san, error);
        }
    }

    // Update the display
    setCapturedPieces(whiteCaptured, blackCaptured);
}

/**
 * Handles hint button click
 */
function handleHint() {
    if (!engineManager.getEngineState() || engineManager.getEngineState().status === 'error') {
        showMessage('Engine not ready');
        return;
    }

    const currentFen = getCurrentFen();
    const depthSelect = document.getElementById('analysisDepth');
    const depth = depthSelect ? parseInt(depthSelect.value) : 15;

    // Clear old arrows before analyzing
    clearShapes();

    showAnalyzing('Finding best move...');

    // Analyze with multipv to get top moves
    engineManager.analyzeWithMultiPv(currentFen, depth, 3);
}

/**
 * Handles analyze button click
 */
function handleAnalyze() {
    if (!engineManager.getEngineState() || engineManager.getEngineState().status === 'error') {
        showMessage('Engine not ready');
        return;
    }

    const currentFen = getCurrentFen();
    const depthSelect = document.getElementById('analysisDepth');
    const depth = depthSelect ? parseInt(depthSelect.value) : 15;

    // Clear old arrows before analyzing
    clearShapes();

    showAnalyzing(`Analyzing position (depth ${depth})...`);

    // Analyze with multipv to show top 3 moves
    engineManager.analyzeWithMultiPv(currentFen, depth, 3);

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
 * Handles complete game analysis after playing without hints
 */
function handleAnalyzeCompleteGame() {
    const moves = getMoves();

    if (moves.length === 0) {
        showMessage('No moves to analyze');
        return;
    }

    // Hide the analyze button
    const analyzeGameBtn = document.getElementById('analyzeGameBtn');
    if (analyzeGameBtn) {
        analyzeGameBtn.style.display = 'none';
    }

    // Switch to analysis tab
    switchTab('analysis');

    // Show analyzing message
    showAnalyzing(`Analyzing complete game (${moves.length} moves)...`);

    // Detect and display critical moments
    const criticalMoments = detectCriticalMoments(moves);
    displayCriticalMoments(criticalMoments, handleMoveNavigation);

    // Generate puzzles from mistakes
    const mistakes = moves.filter(m => {
        const annotation = m.annotation;
        return annotation === '?' || annotation === '??' || annotation === '!?';
    });

    if (mistakes.length > 0) {
        // Generate puzzles from the mistakes
        mistakes.forEach(mistake => {
            if (mistake.fen && mistake.evaluation !== undefined) {
                generatePuzzle(mistake.fen, mistake.evaluation);
            }
        });
        displayPuzzles(handleMoveNavigation);
    }

    // Create a detailed summary
    let inaccuracies = 0;
    let mistakes_count = 0;
    let blunders = 0;
    let goodMoves = 0;

    moves.forEach(move => {
        const annotation = move.annotation;
        if (annotation === '??' || annotation === '⁇') blunders++;
        else if (annotation === '?' || annotation === '⁈') mistakes_count++;
        else if (annotation === '!?') inaccuracies++;
        else if (annotation === '!' || annotation === '!!') goodMoves++;
    });

    // Display summary message
    const userMoves = moves.filter(m => m.color === getUserColor());
    const totalUserMoves = userMoves.length;
    const userBlunders = userMoves.filter(m => m.annotation === '??' || m.annotation === '⁇').length;
    const userMistakes = userMoves.filter(m => m.annotation === '?' || m.annotation === '⁈').length;
    const userInaccuracies = userMoves.filter(m => m.annotation === '!?').length;
    const userGoodMoves = userMoves.filter(m => m.annotation === '!' || m.annotation === '!!' || !m.annotation || m.annotation === '').length;

    const accuracy = totalUserMoves > 0 ? Math.round((userGoodMoves / totalUserMoves) * 100) : 0;

    let summaryHtml = `<div style="padding: 10px; background: var(--bg-primary); border-radius: 6px; margin-bottom: 10px;">`;
    summaryHtml += `<h4 style="margin: 0 0 10px 0; color: var(--accent);">📊 Game Analysis Complete</h4>`;
    summaryHtml += `<p style="margin: 5px 0;"><strong>Total moves:</strong> ${totalUserMoves}</p>`;
    summaryHtml += `<p style="margin: 5px 0;"><strong>Accuracy:</strong> ${accuracy}%</p>`;
    summaryHtml += `<p style="margin: 5px 0;"><strong>Good moves:</strong> ${userGoodMoves}</p>`;
    summaryHtml += `<p style="margin: 5px 0;"><strong>Inaccuracies:</strong> ${userInaccuracies}</p>`;
    summaryHtml += `<p style="margin: 5px 0;"><strong>Mistakes:</strong> ${userMistakes}</p>`;
    summaryHtml += `<p style="margin: 5px 0;"><strong>Blunders:</strong> ${userBlunders}</p>`;
    summaryHtml += `</div>`;

    if (criticalMoments.length > 0) {
        summaryHtml += `<p style="margin: 10px 0; color: var(--text-secondary);">📍 Found ${criticalMoments.length} critical moment(s) - check below for details.</p>`;
    }

    if (mistakes.length > 0) {
        summaryHtml += `<p style="margin: 10px 0; color: var(--text-secondary);">🧩 Generated ${mistakes.length} puzzle(s) from your mistakes.</p>`;
    }

    const feedback = document.getElementById('feedback');
    if (feedback) {
        feedback.innerHTML = summaryHtml;
    }
}

/**
 * Handles multipv updates from engine
 * @param {Array} bestMoves - Array of best moves with evaluations
 */
function handleMultiPvUpdate(bestMoves) {
    const currentFen = getCurrentFen();
    displayBestMoves(bestMoves, currentFen);

    // Draw the best move arrow on the board
    if (bestMoves && bestMoves.length > 0 && bestMoves[0].move) {
        drawAnalysisShapes(bestMoves[0].move);
    }
}

/**
 * Handles streaming analysis updates (cloud engine only)
 * @param {Object} data - Streaming analysis data
 */
function handleStreamingUpdate(data) {
    if (!engineManager.isCloudEngine()) {
        return;
    }

    // Show streaming panel
    const streamingPanel = document.getElementById('streamingAnalysis');
    if (streamingPanel) {
        streamingPanel.style.display = 'block';
    }

    // Update depth progress
    const currentDepthEl = document.getElementById('currentDepth');
    const maxDepthEl = document.getElementById('maxDepth');
    const depthProgressEl = document.getElementById('depthProgress');

    if (currentDepthEl && data.depth) {
        currentDepthEl.textContent = data.depth;
    }
    if (maxDepthEl) {
        const maxDepth = engineManager.getEngineState().depth || 18;
        maxDepthEl.textContent = maxDepth;
    }
    if (depthProgressEl && data.depth) {
        const maxDepth = engineManager.getEngineState().depth || 18;
        const progress = (data.depth / maxDepth) * 100;
        depthProgressEl.style.width = `${progress}%`;
    }

    // Update evaluation
    const streamingEvalEl = document.getElementById('streamingEval');
    if (streamingEvalEl && data.score !== undefined) {
        const evalValue = (data.score / 100).toFixed(2);
        const sign = data.score > 0 ? '+' : '';
        streamingEvalEl.textContent = `${sign}${evalValue}`;

        // Add color class
        streamingEvalEl.className = 'eval-value';
        if (data.score > 30) {
            streamingEvalEl.classList.add('positive');
        } else if (data.score < -30) {
            streamingEvalEl.classList.add('negative');
        } else {
            streamingEvalEl.classList.add('neutral');
        }
    }

    // Update continuation
    const streamingContinuationEl = document.getElementById('streamingContinuation');
    if (streamingContinuationEl && data.pv) {
        const moves = data.pv.split(' ').slice(0, 6); // Show first 6 moves
        streamingContinuationEl.innerHTML = moves
            .map(move => `<span class="continuation-move">${move}</span>`)
            .join(' ');
    }

    // Update win probability if available
    if (data.winChance !== undefined) {
        updateWinProbability(data.winChance);
    }

    // Check for mate
    if (data.mate !== null && data.mate !== undefined) {
        displayMateAlert(data.mate);
    }
}

/**
 * Handles cloud engine multi-PV updates with extended data
 * @param {Object} data - Cloud multi-PV data
 */
function handleCloudMultiPv(data) {
    if (!engineManager.isCloudEngine()) {
        return;
    }

    // Update win probability
    if (data.winChance !== undefined) {
        updateWinProbability(data.winChance);
    }

    // Check for mate
    if (data.mate !== null && data.mate !== undefined) {
        displayMateAlert(data.mate);
    }
}

/**
 * Updates win probability display
 * @param {number} winChance - Win chance percentage (0-100, white's perspective)
 */
function updateWinProbability(winChance) {
    const winProbPanel = document.getElementById('winProbability');
    if (!winProbPanel) {
        return;
    }

    // Show panel
    winProbPanel.style.display = 'block';

    // Update percentages
    const whitePercent = winChance.toFixed(1);
    const blackPercent = (100 - winChance).toFixed(1);

    const whitePercentEl = document.getElementById('whiteWinPercent');
    const blackPercentEl = document.getElementById('blackWinPercent');
    const whiteBarEl = document.getElementById('whiteWinBar');
    const blackBarEl = document.getElementById('blackWinBar');

    if (whitePercentEl) whitePercentEl.textContent = `${whitePercent}%`;
    if (blackPercentEl) blackPercentEl.textContent = `${blackPercent}%`;
    if (whiteBarEl) whiteBarEl.style.width = `${whitePercent}%`;
    if (blackBarEl) blackBarEl.style.width = `${blackPercent}%`;
}

/**
 * Displays mate alert
 * @param {number} mateInMoves - Moves until mate (positive for white, negative for black)
 */
function displayMateAlert(mateInMoves) {
    const mateAlert = document.getElementById('mateAlert');
    if (!mateAlert || mateInMoves === null) {
        return;
    }

    const moves = Math.abs(mateInMoves);
    const side = mateInMoves > 0 ? 'White' : 'Black';

    const mateInMovesEl = document.getElementById('mateInMoves');
    const mateSideEl = document.getElementById('mateSide');

    if (mateInMovesEl) mateInMovesEl.textContent = moves;
    if (mateSideEl) mateSideEl.textContent = `${side} is winning`;

    mateAlert.style.display = 'flex';

    // Hide after 10 seconds
    setTimeout(() => {
        mateAlert.style.display = 'none';
    }, 10000);
}

/**
 * Updates engine status UI
 * @param {string} status - Status ('connected', 'disconnected', 'connecting')
 * @param {string} type - Engine type ('local' or 'cloud')
 */
function updateEngineStatusUI(status, type) {
    const statusEl = document.getElementById('engineStatus');
    if (!statusEl) {
        return;
    }

    const indicator = statusEl.querySelector('.status-indicator');
    const text = statusEl.querySelector('.status-text');

    if (indicator) {
        indicator.className = `status-indicator ${status}`;
        if (status === 'connected') {
            indicator.textContent = '🟢';
        } else if (status === 'connecting') {
            indicator.textContent = '🟡';
        } else {
            indicator.textContent = '🔴';
        }
    }

    if (text) {
        const engineName = type === 'cloud' ? 'Cloud API' : 'Local Stockfish';
        const statusText = status === 'connected' ? 'Ready' :
                          status === 'connecting' ? 'Connecting...' : 'Disconnected';
        text.textContent = `Engine: ${engineName} (${statusText})`;
    }
}

/**
 * Handles engine switching
 * @param {string} newType - New engine type ('local' or 'cloud')
 */
async function handleEngineSwitching(newType) {
    try {
        updateEngineStatusUI('connecting', newType);
        showMessage(`Switching to ${newType} engine...`);

        await engineManager.switchEngine(newType);

        updateEngineStatusUI('connected', newType);
        showMessage(`${newType === 'cloud' ? 'Cloud' : 'Local'} engine ready!`);

        // Hide/show streaming panel based on engine type
        const streamingPanel = document.getElementById('streamingAnalysis');
        if (streamingPanel) {
            streamingPanel.style.display = newType === 'cloud' ? 'block' : 'none';
        }

        // Hide win probability if switching to local
        if (newType === 'local') {
            const winProbPanel = document.getElementById('winProbability');
            if (winProbPanel) {
                winProbPanel.style.display = 'none';
            }
            const mateAlert = document.getElementById('mateAlert');
            if (mateAlert) {
                mateAlert.style.display = 'none';
            }
        }

    } catch (error) {
        console.error('Failed to switch engine:', error);
        showMessage('Failed to switch engine. Please try again.');
        updateEngineStatusUI('disconnected', newType);
    }
}

/**
 * Handles loading a saved game for match analysis
 */
function handleLoadMatchAnalysis() {
    // Show load game modal
    showLoadGameModal((game) => {
        startMatchAnalysis(game);
    });
}

/**
 * Starts analyzing a loaded game
 * @param {Object} game - Saved game object
 */
async function startMatchAnalysis(game) {
    if (!game || !game.moves || game.moves.length === 0) {
        showMessage('No moves to analyze');
        return;
    }

    // Switch to analysis tab
    switchTab('analysis');

    // Show the match analysis panel
    const panel = document.getElementById('matchAnalysisPanel');
    if (panel) {
        panel.style.display = 'block';
    }

    // Hide other analysis panels
    hideCriticalMoments();
    hideBestMoves();
    const puzzlesPanel = document.getElementById('puzzlesPanel');
    if (puzzlesPanel) puzzlesPanel.style.display = 'none';

    // Show progress
    const progressDiv = document.getElementById('analysisProgress');
    if (progressDiv) progressDiv.style.display = 'block';

    // Create engine analysis function
    const analyzePosition = async (fen) => {
        try {
            // Request analysis from engine (depth 12 for reasonable speed/accuracy balance)
            engineManager.evaluatePosition(fen, 12, 'analysis');

            // Wait for evaluation result with timeout
            return await new Promise((resolve) => {
                let timeoutId;
                let resolved = false;

                const handler = (data) => {
                    if (!resolved && data.evaluation !== undefined && data.bestMove) {
                        resolved = true;
                        clearTimeout(timeoutId);
                        resolve({
                            bestMove: data.bestMove,
                            evaluation: data.evaluation
                        });
                    }
                };

                // Set up temporary listener
                const originalHandler = engineManager.callbacks.onEvaluation;
                engineManager.callbacks.onEvaluation = handler;

                // Timeout after 2 seconds (faster for batch analysis)
                timeoutId = setTimeout(() => {
                    if (!resolved) {
                        resolved = true;
                        engineManager.callbacks.onEvaluation = originalHandler;
                        // Return previous evaluation if available
                        const engineState = engineManager.getEngineState();
                        resolve({
                            bestMove: engineState.bestMove || null,
                            evaluation: engineState.currentEval || 0
                        });
                    }
                }, 2000);

                // Cleanup function
                setTimeout(() => {
                    engineManager.callbacks.onEvaluation = originalHandler;
                }, 2500);
            });
        } catch (error) {
            console.error('Error analyzing position:', error);
            return { bestMove: null, evaluation: 0 };
        }
    };

    // Start the analysis
    try {
        await analyzeMatch(game.moves, analyzePosition, 'white');
    } catch (error) {
        console.error('Error during match analysis:', error);
        showMessage('Error analyzing match');
    }
}

/**
 * Handles match analysis state updates
 * @param {Object} update - Update data from match analysis
 */
function handleMatchAnalysisUpdate(update) {
    const { type, currentMove, currentIndex, totalMoves, accuracy, progress, isAnalyzing } = update;

    if (type === 'analyzing' || type === 'progress') {
        // Update progress bar
        const progressText = document.getElementById('analysisProgressText');
        const progressBar = document.getElementById('matchAnalysisProgressBar');
        if (progressText && progress) {
            progressText.textContent = `${progress.percentage}%`;
        }
        if (progressBar && progress) {
            progressBar.style.width = `${progress.percentage}%`;
        }
    }

    if (type === 'complete' || type === 'navigate') {
        // Hide progress
        const progressDiv = document.getElementById('analysisProgress');
        if (progressDiv && type === 'complete') {
            progressDiv.style.display = 'none';
        }

        // Update accuracy summary
        if (accuracy) {
            const accuracyValue = document.getElementById('accuracyValue');
            const bestMovesCount = document.getElementById('bestMovesCount');
            const goodMovesCount = document.getElementById('goodMovesCount');
            const inaccuraciesCount = document.getElementById('inaccuraciesCount');
            const mistakesCount = document.getElementById('mistakesCount');
            const blundersCount = document.getElementById('blundersCount');

            if (accuracyValue) accuracyValue.textContent = `${accuracy.accuracy}%`;
            if (bestMovesCount) bestMovesCount.textContent = accuracy.bestMoves || 0;
            if (goodMovesCount) goodMovesCount.textContent = accuracy.goodMoves;
            if (inaccuraciesCount) inaccuraciesCount.textContent = accuracy.inaccuracies;
            if (mistakesCount) mistakesCount.textContent = accuracy.mistakes;
            if (blundersCount) blundersCount.textContent = accuracy.blunders;
        }

        // Update current move display
        if (currentMove) {
            const moveProgressText = document.getElementById('moveProgressText');
            const playedMove = document.getElementById('playedMove');
            const playedAnnotation = document.getElementById('playedAnnotation');
            const playedQuality = document.getElementById('playedQuality');
            const bestMove = document.getElementById('bestMove');
            const bestMoveSection = document.getElementById('bestMoveSection');
            const evalLoss = document.getElementById('evalLoss');
            const evalBefore = document.getElementById('evalBefore');
            const evalAfter = document.getElementById('evalAfter');

            if (moveProgressText) {
                moveProgressText.textContent = `Move ${currentIndex + 1} of ${totalMoves}`;
            }

            if (playedMove) {
                playedMove.textContent = currentMove.san;
            }

            if (playedAnnotation) {
                playedAnnotation.textContent = currentMove.annotation || '';
                playedAnnotation.className = 'move-annotation';
                if (currentMove.annotation === '⭐') {
                    playedAnnotation.classList.add('best');
                } else if (currentMove.annotation === '!!' || currentMove.annotation === '!') {
                    playedAnnotation.classList.add('good');
                } else if (currentMove.annotation === '!?') {
                    playedAnnotation.classList.add('inaccuracy');
                } else if (currentMove.annotation === '?') {
                    playedAnnotation.classList.add('mistake');
                } else if (currentMove.annotation === '??') {
                    playedAnnotation.classList.add('blunder');
                }
            }

            if (playedQuality) {
                playedQuality.textContent = currentMove.quality;
                playedQuality.className = 'move-quality';
                if (currentMove.quality === 'Best Move') {
                    playedQuality.classList.add('best');
                } else if (currentMove.quality === 'Good Move' || currentMove.quality === 'Excellent') {
                    playedQuality.classList.add('good');
                } else if (currentMove.quality === 'Inaccuracy') {
                    playedQuality.classList.add('inaccuracy');
                } else if (currentMove.quality === 'Mistake') {
                    playedQuality.classList.add('mistake');
                } else if (currentMove.quality === 'BLUNDER') {
                    playedQuality.classList.add('blunder');
                }
            }

            // Show/hide best move section
            if (bestMoveSection) {
                if (currentMove.isBestMove || currentMove.quality === 'Best Move') {
                    // Hide best move section when player played the best move
                    bestMoveSection.style.display = 'none';
                } else if (currentMove.bestMove && currentMove.bestMove !== currentMove.san) {
                    // Show alternative best move
                    bestMoveSection.style.display = 'block';
                    if (bestMove) bestMove.textContent = currentMove.bestMove;
                    if (evalLoss) evalLoss.textContent = `Loss: ${currentMove.evalLoss.toFixed(2)} pawns`;
                } else {
                    bestMoveSection.style.display = 'none';
                }
            }

            if (evalBefore) {
                const prevEval = currentMove.previousEvaluation || 0;
                evalBefore.textContent = prevEval > 0 ? `+${prevEval.toFixed(1)}` : prevEval.toFixed(1);
                evalBefore.className = 'eval-value';
                if (prevEval > 0.5) evalBefore.classList.add('positive');
                else if (prevEval < -0.5) evalBefore.classList.add('negative');
            }

            if (evalAfter) {
                const currEval = currentMove.evaluation || 0;
                evalAfter.textContent = currEval > 0 ? `+${currEval.toFixed(1)}` : currEval.toFixed(1);
                evalAfter.className = 'eval-value';
                if (currEval > 0.5) evalAfter.classList.add('positive');
                else if (currEval < -0.5) evalAfter.classList.add('negative');
            }

            // Load position on board
            loadPosition(currentMove.fen);
            updateEvaluationBar(currentMove.evaluation || 0);

            // Draw best move arrow if different from played move
            if (currentMove.bestMoveUci && currentMove.bestMove !== currentMove.san) {
                drawAnalysisShapes(currentMove.bestMoveUci);
            } else {
                clearShapes();
            }
        }

        // Update navigation button states
        const firstBtn = document.getElementById('firstMoveBtn');
        const prevBtn = document.getElementById('prevMoveBtn');
        const nextBtn = document.getElementById('nextMoveBtn');
        const lastBtn = document.getElementById('lastMoveBtn');

        if (firstBtn) firstBtn.disabled = currentIndex === 0;
        if (prevBtn) prevBtn.disabled = currentIndex === 0;
        if (nextBtn) nextBtn.disabled = currentIndex >= totalMoves - 1;
        if (lastBtn) lastBtn.disabled = currentIndex >= totalMoves - 1;
    }
}

/**
 * Closes the match analysis panel
 */
function handleCloseMatchAnalysis() {
    const panel = document.getElementById('matchAnalysisPanel');
    if (panel) {
        panel.style.display = 'none';
    }

    // Reset analysis state
    resetAnalysis();

    // Return to current game position
    const moves = getMoves();
    if (moves.length > 0) {
        const lastMove = moves[moves.length - 1];
        loadPosition(lastMove.fen);
    } else {
        loadPosition('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    }

    clearShapes();
}

// Initialize application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
