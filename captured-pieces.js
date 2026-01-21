/**
 * Captured Pieces Module
 * Tracks and displays captured pieces for both players
 */

// Piece values for material calculation (standard chess values)
const PIECE_VALUES = {
    'p': 1,  // Pawn
    'n': 3,  // Knight
    'b': 3,  // Bishop
    'r': 5,  // Rook
    'q': 9,  // Queen
    'k': 0   // King (never captured in normal games)
};

// Unicode chess piece symbols
const PIECE_SYMBOLS = {
    'white': {
        'p': '♙',
        'n': '♘',
        'b': '♗',
        'r': '♖',
        'q': '♕',
        'k': '♔'
    },
    'black': {
        'p': '♟',
        'n': '♞',
        'b': '♝',
        'r': '♜',
        'q': '♛',
        'k': '♚'
    }
};

// State to track captured pieces
const capturedState = {
    white: [],  // Pieces captured by white (black pieces)
    black: []   // Pieces captured by black (white pieces)
};

/**
 * Reset captured pieces state
 */
export function resetCapturedPieces() {
    capturedState.white = [];
    capturedState.black = [];
    updateDisplay();
}

/**
 * Add a captured piece
 * @param {string} piece - Piece type ('p', 'n', 'b', 'r', 'q', 'k')
 * @param {string} capturedBy - Color that captured the piece ('white' or 'black')
 */
export function addCapturedPiece(piece, capturedBy) {
    if (capturedBy === 'white' || capturedBy === 'black') {
        capturedState[capturedBy].push(piece);
        updateDisplay();
    }
}

/**
 * Remove the last captured piece (for undo/navigation)
 * @param {string} capturedBy - Color that captured the piece
 */
export function removeLastCapturedPiece(capturedBy) {
    if (capturedState[capturedBy].length > 0) {
        capturedState[capturedBy].pop();
        updateDisplay();
    }
}

/**
 * Set captured pieces from a list (for game navigation)
 * @param {Array} whiteCaptured - Array of piece types captured by white
 * @param {Array} blackCaptured - Array of piece types captured by black
 */
export function setCapturedPieces(whiteCaptured, blackCaptured) {
    capturedState.white = [...whiteCaptured];
    capturedState.black = [...blackCaptured];
    updateDisplay();
}

/**
 * Calculate material value for a list of pieces
 * @param {Array} pieces - Array of piece types
 * @returns {number} Total material value
 */
function calculateMaterialValue(pieces) {
    return pieces.reduce((total, piece) => total + (PIECE_VALUES[piece] || 0), 0);
}

/**
 * Get material advantage
 * @returns {Object} Material advantage info
 */
function getMaterialAdvantage() {
    const whiteValue = calculateMaterialValue(capturedState.white);
    const blackValue = calculateMaterialValue(capturedState.black);
    const advantage = whiteValue - blackValue;

    return {
        white: whiteValue,
        black: blackValue,
        advantage: advantage,
        leader: advantage > 0 ? 'white' : advantage < 0 ? 'black' : 'equal'
    };
}

/**
 * Generate HTML for displaying captured pieces
 * @param {Array} pieces - Array of piece types
 * @param {string} pieceColor - Color of the pieces ('white' or 'black')
 * @returns {string} HTML string
 */
function generatePiecesHTML(pieces, pieceColor) {
    if (pieces.length === 0) {
        return '<span class="no-captures">—</span>';
    }

    // Sort pieces by value (highest to lowest)
    const sortedPieces = [...pieces].sort((a, b) => PIECE_VALUES[b] - PIECE_VALUES[a]);

    return sortedPieces
        .map(piece => `<span class="captured-piece">${PIECE_SYMBOLS[pieceColor][piece]}</span>`)
        .join('');
}

/**
 * Update the display of captured pieces
 */
function updateDisplay() {
    const whiteContainer = document.getElementById('white-captured-pieces');
    const blackContainer = document.getElementById('black-captured-pieces');
    const whiteMaterial = document.getElementById('white-material-value');
    const blackMaterial = document.getElementById('black-material-value');
    const advantageDisplay = document.getElementById('material-advantage');

    if (!whiteContainer || !blackContainer) {
        return;  // Elements not in DOM yet
    }

    // Update captured pieces display
    // White captures black pieces, so show black piece symbols
    whiteContainer.innerHTML = generatePiecesHTML(capturedState.white, 'black');
    // Black captures white pieces, so show white piece symbols
    blackContainer.innerHTML = generatePiecesHTML(capturedState.black, 'white');

    // Calculate and display material values
    const materialInfo = getMaterialAdvantage();

    if (whiteMaterial) {
        whiteMaterial.textContent = materialInfo.white;
    }
    if (blackMaterial) {
        blackMaterial.textContent = materialInfo.black;
    }

    // Display material advantage
    if (advantageDisplay) {
        const absAdvantage = Math.abs(materialInfo.advantage);
        if (materialInfo.leader === 'equal') {
            advantageDisplay.textContent = 'Equal material';
            advantageDisplay.className = 'material-advantage equal';
        } else {
            const leaderText = materialInfo.leader === 'white' ? 'White' : 'Black';
            advantageDisplay.textContent = `${leaderText} +${absAdvantage}`;
            advantageDisplay.className = `material-advantage ${materialInfo.leader}`;
        }
    }
}

/**
 * Get current captured pieces state (for debugging or save/load)
 * @returns {Object} Current state
 */
export function getCapturedState() {
    return {
        white: [...capturedState.white],
        black: [...capturedState.black]
    };
}

// Initialize display when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateDisplay);
} else {
    updateDisplay();
}
