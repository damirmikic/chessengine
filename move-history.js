/**
 * @fileoverview Move History module
 * Manages move tracking, display, and navigation
 */

/**
 * @typedef {Object} MoveRecord
 * @property {number} moveNumber - Move number (1, 2, 3...)
 * @property {string} san - Move in Standard Algebraic Notation
 * @property {number|null} evaluation - Position evaluation after move (in pawns)
 * @property {string|null} annotation - Move annotation (!, !!, ?, ??, !?)
 * @property {string} fen - FEN position after this move
 * @property {string} color - Color that made the move ('w' or 'b')
 */

/**
 * Move history state
 */
const historyState = {
    moves: [], // Array of MoveRecord objects
    currentMoveIndex: -1, // -1 means at latest position, 0+ means viewing history
    onMoveClick: null, // Callback when a move is clicked
    isNavigating: false // Flag to prevent conflicts during navigation
};

/**
 * Initializes the move history module
 * @param {Object} options - Initialization options
 * @param {Function} options.onMoveClick - Callback when user clicks a move (receives moveIndex)
 */
export function initializeMoveHistory({ onMoveClick }) {
    historyState.onMoveClick = onMoveClick;
    historyState.moves = [];
    historyState.currentMoveIndex = -1;
    historyState.isNavigating = false;

    renderMoveList();
    console.log('Move history initialized');
}

/**
 * Adds a move to the history
 * @param {string} san - Move in Standard Algebraic Notation
 * @param {number|null} evaluation - Position evaluation after move
 * @param {string} fen - FEN position after this move
 * @param {string} color - Color that made the move ('w' or 'b')
 */
export function addMove(san, evaluation, fen, color) {
    // If we're viewing history and make a new move, truncate future moves
    if (historyState.currentMoveIndex !== -1 && historyState.currentMoveIndex < historyState.moves.length - 1) {
        historyState.moves = historyState.moves.slice(0, historyState.currentMoveIndex + 1);
    }

    // Calculate move number (increments on white's move)
    const moveNumber = color === 'w'
        ? Math.floor(historyState.moves.length / 2) + 1
        : Math.floor((historyState.moves.length + 1) / 2);

    // Add the move
    historyState.moves.push({
        moveNumber,
        san,
        evaluation,
        annotation: null,
        fen,
        color
    });

    // Reset to latest position
    historyState.currentMoveIndex = -1;

    renderMoveList();
}

/**
 * Annotates the last move based on evaluation loss
 * @param {number} evalLoss - Evaluation loss in pawns
 */
export function annotateLastMove(evalLoss) {
    if (historyState.moves.length === 0) return;

    const lastMove = historyState.moves[historyState.moves.length - 1];

    // Determine annotation based on eval loss
    if (evalLoss < 0.1) {
        lastMove.annotation = '!!'; // Excellent move (actually improved position)
    } else if (evalLoss < 0.3) {
        lastMove.annotation = '!';  // Good move
    } else if (evalLoss >= 0.3 && evalLoss < 1.0) {
        lastMove.annotation = '!?'; // Inaccuracy
    } else if (evalLoss >= 1.0 && evalLoss < 2.5) {
        lastMove.annotation = '?';  // Mistake
    } else if (evalLoss >= 2.5) {
        lastMove.annotation = '??'; // Blunder
    }

    renderMoveList();
}

/**
 * Removes the last move from history (used for undo)
 * @param {boolean} [singleMove=false] - If true, remove only one move, otherwise remove two (user + engine)
 */
export function removeLastMove(singleMove = false) {
    if (historyState.moves.length === 0) return;

    if (singleMove) {
        historyState.moves.pop();
    } else {
        // Remove user move + engine response
        historyState.moves.pop();
        if (historyState.moves.length > 0) {
            historyState.moves.pop();
        }
    }

    historyState.currentMoveIndex = -1;
    renderMoveList();
}

/**
 * Resets the move history
 */
export function resetMoveHistory() {
    historyState.moves = [];
    historyState.currentMoveIndex = -1;
    renderMoveList();
}

/**
 * Updates the evaluation of the last move
 * @param {number} evaluation - Evaluation score in pawns
 */
export function updateLastMoveEvaluation(evaluation) {
    if (historyState.moves.length === 0) return;

    historyState.moves[historyState.moves.length - 1].evaluation = evaluation;
    renderMoveList();
}

/**
 * Renders the move list in the UI
 */
function renderMoveList() {
    const moveList = document.getElementById('move-list');
    if (!moveList) return;

    // Clear current display
    moveList.innerHTML = '';

    if (historyState.moves.length === 0) {
        moveList.innerHTML = '<div class="move-list-empty">No moves yet</div>';
        return;
    }

    // Group moves into pairs (white + black)
    const movePairs = [];
    for (let i = 0; i < historyState.moves.length; i += 2) {
        const whiteMove = historyState.moves[i];
        const blackMove = i + 1 < historyState.moves.length ? historyState.moves[i + 1] : null;
        movePairs.push({ white: whiteMove, black: blackMove });
    }

    // Render each pair
    movePairs.forEach((pair, pairIndex) => {
        const pairDiv = document.createElement('div');
        pairDiv.className = 'move-pair';

        // Move number
        const numberDiv = document.createElement('div');
        numberDiv.className = 'move-number';
        numberDiv.textContent = `${pair.white.moveNumber}.`;
        pairDiv.appendChild(numberDiv);

        // White's move
        pairDiv.appendChild(createMoveElement(pair.white, pairIndex * 2));

        // Black's move (if exists)
        if (pair.black) {
            pairDiv.appendChild(createMoveElement(pair.black, pairIndex * 2 + 1));
        }

        moveList.appendChild(pairDiv);
    });

    // Scroll to the current move or last move
    scrollToCurrentMove();
}

/**
 * Creates a DOM element for a single move
 * @param {MoveRecord} move - Move record
 * @param {number} index - Index in the moves array
 * @returns {HTMLElement} Move element
 */
function createMoveElement(move, index) {
    const moveDiv = document.createElement('div');
    moveDiv.className = 'move-item';
    moveDiv.dataset.index = index;

    // Highlight current move
    const isCurrent = historyState.currentMoveIndex === index ||
        (historyState.currentMoveIndex === -1 && index === historyState.moves.length - 1);
    if (isCurrent) {
        moveDiv.classList.add('current');
    }

    // Move notation
    const notationSpan = document.createElement('span');
    notationSpan.className = 'move-notation';
    notationSpan.textContent = move.san;
    moveDiv.appendChild(notationSpan);

    // Annotation
    if (move.annotation) {
        const annotationSpan = document.createElement('span');
        annotationSpan.className = 'move-annotation';

        // Add color class based on annotation
        if (move.annotation === '!!' || move.annotation === '!') {
            annotationSpan.classList.add(move.annotation === '!!' ? 'excellent' : 'good');
        } else if (move.annotation === '!?') {
            annotationSpan.classList.add('inaccuracy');
        } else if (move.annotation === '?') {
            annotationSpan.classList.add('mistake');
        } else if (move.annotation === '??') {
            annotationSpan.classList.add('blunder');
        }

        annotationSpan.textContent = move.annotation;
        moveDiv.appendChild(annotationSpan);
    }

    // Evaluation
    if (move.evaluation !== null && move.evaluation !== undefined) {
        const evalSpan = document.createElement('span');
        evalSpan.className = 'move-eval';

        // Format evaluation
        const evalValue = move.evaluation;
        const evalStr = evalValue > 0 ? `+${evalValue.toFixed(1)}` : evalValue.toFixed(1);
        evalSpan.textContent = evalStr;

        // Color code
        if (evalValue > 0.5) {
            evalSpan.classList.add('positive');
        } else if (evalValue < -0.5) {
            evalSpan.classList.add('negative');
        }

        moveDiv.appendChild(evalSpan);
    }

    // Click handler
    moveDiv.addEventListener('click', () => handleMoveClick(index));

    return moveDiv;
}

/**
 * Handles click on a move in the history
 * @param {number} index - Index of the clicked move
 */
function handleMoveClick(index) {
    if (historyState.isNavigating) return;

    historyState.currentMoveIndex = index;
    renderMoveList();

    // Notify callback
    if (historyState.onMoveClick) {
        const move = historyState.moves[index];
        historyState.onMoveClick(index, move.fen);
    }
}

/**
 * Scrolls to the current move in the list
 */
function scrollToCurrentMove() {
    const moveList = document.getElementById('move-list');
    if (!moveList) return;

    const currentMove = moveList.querySelector('.move-item.current');
    if (currentMove) {
        currentMove.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

/**
 * Gets all moves in the history
 * @returns {MoveRecord[]} Array of move records
 */
export function getMoves() {
    return historyState.moves;
}

/**
 * Gets the current move index (-1 = latest position)
 * @returns {number} Current move index
 */
export function getCurrentMoveIndex() {
    return historyState.currentMoveIndex;
}

/**
 * Sets the current move index and updates the display
 * @param {number} index - Move index (-1 for latest)
 */
export function setCurrentMoveIndex(index) {
    historyState.currentMoveIndex = index;
    renderMoveList();
}

/**
 * Sets navigation mode (prevents conflicts)
 * @param {boolean} isNavigating - Whether navigation is in progress
 */
export function setNavigationMode(isNavigating) {
    historyState.isNavigating = isNavigating;
}

/**
 * Loads move history from an array of move objects
 * @param {MoveRecord[]} moves - Array of move records
 */
export function loadMoveHistory(moves) {
    historyState.moves = moves;
    historyState.currentMoveIndex = -1;
    renderMoveList();
}

/**
 * Returns whether currently viewing history (not at latest position)
 * @returns {boolean} True if viewing history
 */
export function isViewingHistory() {
    return historyState.currentMoveIndex !== -1;
}
