/**
 * @fileoverview Enhanced Analysis Features Module
 * Handles multiple best moves display, critical moments, and puzzle generation
 */

import { uciToSan } from './analysis.js';

/**
 * State for enhanced analysis features
 */
const analysisState = {
    criticalMoments: [],
    generatedPuzzles: [],
    isAnalysisMode: false
};

/**
 * Displays multiple best moves in the UI
 * @param {Array} bestMoves - Array of {move: string, eval: number, pv: string}
 * @param {string} fen - Current position FEN
 */
export function displayBestMoves(bestMoves, fen) {
    const panel = document.getElementById('bestMovesPanel');
    const list = document.getElementById('bestMovesList');

    if (!panel || !list) return;

    if (!bestMoves || bestMoves.length === 0) {
        panel.style.display = 'none';
        return;
    }

    // Clear existing content
    list.innerHTML = '';

    // Display each move
    bestMoves.forEach((moveData, index) => {
        if (!moveData.move) return;

        const item = document.createElement('div');
        item.className = `best-move-item rank-${index + 1}`;

        // Convert UCI to SAN
        const sanMove = uciToSan(moveData.move, fen);

        // Create move notation
        const notation = document.createElement('span');
        notation.className = 'best-move-notation';
        notation.textContent = sanMove || moveData.move;

        // Create evaluation display
        const evalSpan = document.createElement('span');
        evalSpan.className = 'best-move-eval';

        const evalValue = moveData.eval;
        if (evalValue > 0) {
            evalSpan.classList.add('positive');
            evalSpan.textContent = `+${evalValue.toFixed(2)}`;
        } else if (evalValue < 0) {
            evalSpan.classList.add('negative');
            evalSpan.textContent = evalValue.toFixed(2);
        } else {
            evalSpan.textContent = '0.00';
        }

        item.appendChild(notation);
        item.appendChild(evalSpan);
        list.appendChild(item);
    });

    panel.style.display = 'block';
}

/**
 * Hides the best moves panel
 */
export function hideBestMoves() {
    const panel = document.getElementById('bestMovesPanel');
    if (panel) {
        panel.style.display = 'none';
    }
}

/**
 * Detects and stores critical moments from game moves
 * @param {Array} moves - Array of move records with evaluations
 * @returns {Array} Critical moments
 */
export function detectCriticalMoments(moves) {
    const CRITICAL_THRESHOLD = 1.5; // Pawns lost
    const criticalMoments = [];

    for (let i = 1; i < moves.length; i++) {
        const prevMove = moves[i - 1];
        const currentMove = moves[i];

        if (prevMove.evaluation === null || currentMove.evaluation === null) {
            continue;
        }

        // Calculate evaluation swing (from previous player's perspective)
        const evalLoss = Math.abs(prevMove.evaluation - currentMove.evaluation);

        if (evalLoss >= CRITICAL_THRESHOLD) {
            criticalMoments.push({
                moveIndex: i,
                move: currentMove,
                evalLoss: evalLoss.toFixed(2),
                type: evalLoss >= 2.5 ? 'blunder' : 'mistake'
            });
        }
    }

    analysisState.criticalMoments = criticalMoments;
    return criticalMoments;
}

/**
 * Displays critical moments in the UI
 * @param {Array} criticalMoments - Array of critical moment objects
 * @param {Function} onMomentClick - Callback when a moment is clicked
 */
export function displayCriticalMoments(criticalMoments, onMomentClick) {
    const panel = document.getElementById('criticalMomentsPanel');
    const list = document.getElementById('criticalMomentsList');

    if (!panel || !list) return;

    if (!criticalMoments || criticalMoments.length === 0) {
        panel.style.display = 'none';
        return;
    }

    // Clear existing content
    list.innerHTML = '';

    criticalMoments.forEach(moment => {
        const item = document.createElement('div');
        item.className = 'critical-moment-item';

        const header = document.createElement('div');
        header.className = 'critical-moment-header';

        const moveSpan = document.createElement('span');
        moveSpan.className = 'critical-moment-move';
        const moveNum = Math.floor(moment.moveIndex / 2) + 1;
        const moveSuffix = moment.moveIndex % 2 === 0 ? '.' : '...';
        moveSpan.textContent = `${moveNum}${moveSuffix} ${moment.move.san}`;

        const lossSpan = document.createElement('span');
        lossSpan.className = 'critical-moment-loss';
        lossSpan.textContent = `-${moment.evalLoss}`;

        header.appendChild(moveSpan);
        header.appendChild(lossSpan);

        const desc = document.createElement('div');
        desc.className = 'critical-moment-desc';
        desc.textContent = moment.type === 'blunder'
            ? 'Critical blunder - major advantage lost'
            : 'Significant mistake - position worsened';

        item.appendChild(header);
        item.appendChild(desc);

        if (onMomentClick) {
            item.addEventListener('click', () => onMomentClick(moment.moveIndex));
        }

        list.appendChild(item);
    });

    panel.style.display = 'block';
}

/**
 * Hides the critical moments panel
 */
export function hideCriticalMoments() {
    const panel = document.getElementById('criticalMomentsPanel');
    if (panel) {
        panel.style.display = 'none';
    }
}

/**
 * Generates a tactical puzzle from a mistake
 * @param {Object} moveData - Data about the mistake
 * @param {string} bestMove - The best move in the position
 * @param {string} fen - Position before the mistake
 * @returns {Object} Puzzle object
 */
export function generatePuzzle(moveData, bestMove, fen) {
    const puzzle = {
        id: Date.now(),
        fen: fen,
        playerMove: moveData.move.san,
        bestMove: bestMove,
        evalLoss: moveData.evalLoss,
        difficulty: moveData.evalLoss >= 2.5 ? 'Hard' : moveData.evalLoss >= 1.5 ? 'Medium' : 'Easy',
        description: `Find the best move. You played ${moveData.move.san}, which lost ${moveData.evalLoss.toFixed(2)} pawns.`,
        solution: bestMove,
        timestamp: new Date().toISOString()
    };

    analysisState.generatedPuzzles.push(puzzle);
    updatePuzzlesButton();

    return puzzle;
}

/**
 * Displays all generated puzzles
 * @param {Function} onPuzzleClick - Callback when puzzle is clicked
 */
export function displayPuzzles(onPuzzleClick) {
    const panel = document.getElementById('puzzlesPanel');
    const list = document.getElementById('puzzlesList');

    if (!panel || !list) return;

    const puzzles = analysisState.generatedPuzzles;

    if (puzzles.length === 0) {
        panel.style.display = 'none';
        return;
    }

    // Clear existing content
    list.innerHTML = '';

    puzzles.forEach((puzzle, index) => {
        const item = document.createElement('div');
        item.className = 'puzzle-item';

        const header = document.createElement('div');
        header.className = 'puzzle-header';

        const title = document.createElement('span');
        title.className = 'puzzle-title';
        title.textContent = `Puzzle ${puzzles.length - index}`;

        const difficulty = document.createElement('span');
        difficulty.className = 'puzzle-difficulty';
        difficulty.textContent = puzzle.difficulty;

        header.appendChild(title);
        header.appendChild(difficulty);

        const desc = document.createElement('div');
        desc.className = 'puzzle-desc';
        desc.textContent = puzzle.description;

        const solution = document.createElement('div');
        solution.className = 'puzzle-solution';
        solution.textContent = `Solution: ${puzzle.solution}`;

        item.appendChild(header);
        item.appendChild(desc);
        item.appendChild(solution);

        if (onPuzzleClick) {
            item.addEventListener('click', () => onPuzzleClick(puzzle));
        }

        list.appendChild(item);
    });

    panel.style.display = 'block';
}

/**
 * Updates the puzzles button with count
 */
function updatePuzzlesButton() {
    const btn = document.getElementById('showPuzzlesBtn');
    if (btn) {
        const count = analysisState.generatedPuzzles.length;
        btn.textContent = `View Puzzles (${count})`;
        btn.style.display = count > 0 ? 'block' : 'none';
    }
}

/**
 * Toggles puzzle panel visibility
 */
export function togglePuzzlesPanel() {
    const panel = document.getElementById('puzzlesPanel');
    if (panel) {
        const isVisible = panel.style.display !== 'none';
        panel.style.display = isVisible ? 'none' : 'block';
    }
}

/**
 * Gets all generated puzzles
 * @returns {Array} Array of puzzle objects
 */
export function getPuzzles() {
    return analysisState.generatedPuzzles;
}

/**
 * Clears all generated puzzles
 */
export function clearPuzzles() {
    analysisState.generatedPuzzles = [];
    updatePuzzlesButton();
    hidePuzzles();
}

/**
 * Hides the puzzles panel
 */
export function hidePuzzles() {
    const panel = document.getElementById('puzzlesPanel');
    if (panel) {
        panel.style.display = 'none';
    }
}

/**
 * Sets analysis mode state
 * @param {boolean} enabled - Whether analysis mode is enabled
 */
export function setAnalysisMode(enabled) {
    analysisState.isAnalysisMode = enabled;
}

/**
 * Checks if analysis mode is enabled
 * @returns {boolean} True if analysis mode is enabled
 */
export function isAnalysisMode() {
    return analysisState.isAnalysisMode;
}

/**
 * Gets the analysis state
 * @returns {Object} Current analysis state
 */
export function getAnalysisState() {
    return { ...analysisState };
}
