/**
 * @fileoverview Chess board UI controller module
 * Manages board display, user moves, and visual updates
 */

import { Chess } from 'https://esm.sh/chess.js@0.13.4';
import { Chessground } from 'https://esm.sh/chessground@8.3.3';
import { themeManager } from './themes.js';

/**
 * @typedef {Object} BoardState
 * @property {Chess} chess - Chess.js game instance
 * @property {Object} board - Chessground board instance
 * @property {string} userColor - User's color ('white' or 'black')
 * @property {Function|null} onUserMove - Callback when user makes a move
 */

/** @type {BoardState} */
const boardState = {
    chess: null,
    board: null,
    userColor: 'white',
    onUserMove: null
};

/**
 * Calculates legal move destinations for the current position
 * @param {Chess} chess - Chess.js instance
 * @returns {Map<string, string[]>} Map of piece positions to legal destinations
 */
function calculateDestinations(chess) {
    const dests = new Map();
    const moves = chess.moves({ verbose: true });

    moves.forEach(m => {
        if (!dests.has(m.from)) {
            dests.set(m.from, []);
        }
        dests.get(m.from).push(m.to);
    });

    return dests;
}

/**
 * Initializes the chess board
 * @param {Object} options - Initialization options
 * @param {string} options.containerId - DOM element ID for the board
 * @param {string} [options.orientation='white'] - Board orientation
 * @param {Function} options.onUserMove - Callback when user makes a move
 * @returns {boolean} True if initialization successful
 */
export function initializeBoard({ containerId, orientation = 'white', onUserMove }) {
    try {
        // Initialize chess.js
        boardState.chess = new Chess();
        boardState.userColor = orientation;
        boardState.onUserMove = onUserMove;

        // Get board container
        const boardContainer = document.getElementById(containerId);
        if (!boardContainer) {
            throw new Error(`Board container '${containerId}' not found`);
        }

        // Configure Chessground
        const config = {
            fen: boardState.chess.fen(),
            orientation: orientation,
            movable: {
                color: orientation,
                free: false,
                dests: calculateDestinations(boardState.chess),
                events: { after: handleUserMove }
            },
            drawable: {
                enabled: true,
                visible: true
            }
        };

        // Create board instance
        boardState.board = Chessground(boardContainer, config);

        console.log('Board initialized successfully');
        return true;

    } catch (error) {
        console.error('Failed to initialize board:', error);
        return false;
    }
}

/**
 * Handles user move on the board
 * @param {string} from - Source square (e.g., 'e2')
 * @param {string} to - Destination square (e.g., 'e4')
 */
function handleUserMove(from, to) {
    if (!boardState.chess || !boardState.board) return;

    // Store current position for potential undo
    const previousFen = boardState.chess.fen();

    // Attempt move (try normal move first, then promotion to queen)
    let move = boardState.chess.move({ from, to });
    if (move === null) {
        move = boardState.chess.move({ from, to, promotion: 'q' });
    }

    // Invalid move - revert board
    if (move === null) {
        boardState.board.set({ fen: previousFen });
        return;
    }

    // Play sound effect
    if (boardState.chess.in_check()) {
        themeManager.playSound('check');
    } else if (move.captured) {
        themeManager.playSound('capture');
    } else {
        themeManager.playSound('move');
    }

    // Disable board while processing
    disableBoard();

    // Notify callback
    if (boardState.onUserMove) {
        boardState.onUserMove({ move, previousFen, currentFen: boardState.chess.fen() });
    }
}

/**
 * Performs an engine move on the board
 * @param {string} moveStr - Move in UCI format (e.g., 'e2e4')
 * @returns {boolean} True if move was successful
 */
export function performEngineMove(moveStr) {
    if (!boardState.chess || !boardState.board) return false;

    try {
        const from = moveStr.substring(0, 2);
        const to = moveStr.substring(2, 4);
        const promotion = moveStr.length > 4 ? moveStr.substring(4, 5) : undefined;

        // Make move on chess instance
        const move = boardState.chess.move({ from, to, promotion });
        if (!move) {
            console.error('Invalid engine move:', moveStr);
            return false;
        }

        // Play sound effect
        if (boardState.chess.in_check()) {
            themeManager.playSound('check');
        } else if (move.captured) {
            themeManager.playSound('capture');
        } else {
            themeManager.playSound('move');
        }

        // Update board display
        boardState.board.set({
            fen: boardState.chess.fen(),
            lastMove: [from, to],
            check: boardState.chess.in_check(),
            turnColor: boardState.userColor,
            movable: {
                color: boardState.userColor,
                dests: calculateDestinations(boardState.chess)
            }
        });

        return true;

    } catch (error) {
        console.error('Error performing engine move:', error);
        return false;
    }
}

/**
 * Disables user interaction with the board
 */
export function disableBoard() {
    if (!boardState.board) return;

    boardState.board.set({
        movable: { dests: new Map() }
    });
}

/**
 * Enables user interaction with the board
 */
export function enableBoard() {
    if (!boardState.board || !boardState.chess) return;

    boardState.board.set({
        movable: {
            color: boardState.userColor,
            dests: calculateDestinations(boardState.chess)
        }
    });
}

/**
 * Resets the board to starting position
 */
export function resetBoard() {
    if (!boardState.chess || !boardState.board) return;

    boardState.chess.reset();

    boardState.board.set({
        fen: boardState.chess.fen(),
        lastMove: undefined,
        check: undefined,
        turnColor: 'white',
        orientation: boardState.userColor,
        movable: {
            color: boardState.userColor === 'white' ? 'white' : null,
            dests: (boardState.userColor === 'white') ? calculateDestinations(boardState.chess) : new Map()
        }
    });
}

/**
 * Undoes the last move (or two moves for user turn)
 * @param {boolean} [singleMove=false] - If true, undo only one move
 * @returns {boolean} True if undo was successful
 */
export function undoMove(singleMove = false) {
    if (!boardState.chess || !boardState.board) return false;

    try {
        if (singleMove) {
            boardState.chess.undo();
        } else {
            // Undo both user and engine moves
            if (boardState.chess.history().length >= 2) {
                boardState.chess.undo();
                boardState.chess.undo();
            } else if (boardState.chess.history().length === 1 && boardState.userColor === 'black') {
                boardState.chess.undo();
            }
        }

        // Update board display
        boardState.board.set({
            fen: boardState.chess.fen(),
            lastMove: undefined,
            check: undefined,
            turnColor: boardState.userColor,
            movable: {
                color: boardState.userColor,
                dests: calculateDestinations(boardState.chess)
            }
        });

        return true;

    } catch (error) {
        console.error('Error undoing move:', error);
        return false;
    }
}

/**
 * Flips the board orientation and switches user color
 * @returns {string} New user color
 */
export function flipBoard() {
    if (!boardState.board) return boardState.userColor;

    boardState.userColor = boardState.userColor === 'white' ? 'black' : 'white';
    boardState.board.set({ orientation: boardState.userColor });

    return boardState.userColor;
}

/**
 * Gets the current chess game instance
 * @returns {Chess} Chess.js instance
 */
export function getChess() {
    return boardState.chess;
}

/**
 * Gets the current board instance
 * @returns {Object} Chessground instance
 */
export function getBoard() {
    return boardState.board;
}

/**
 * Gets the user's current color
 * @returns {string} User color ('white' or 'black')
 */
export function getUserColor() {
    return boardState.userColor;
}

/**
 * Checks if the game is over
 * @returns {boolean} True if game is over
 */
export function isGameOver() {
    return boardState.chess ? boardState.chess.game_over() : false;
}

/**
 * Checks if the current position is in check
 * @returns {boolean} True if in check
 */
export function isInCheck() {
    return boardState.chess ? boardState.chess.in_check() : false;
}

/**
 * Gets the current FEN position
 * @returns {string} FEN string
 */
export function getCurrentFen() {
    return boardState.chess ? boardState.chess.fen() : '';
}

/**
 * Gets the move history
 * @returns {string[]} Array of moves in SAN notation
 */
export function getMoveHistory() {
    return boardState.chess ? boardState.chess.history() : [];
}

/**
 * Loads a position from FEN
 * @param {string} fen - FEN string
 * @returns {boolean} True if position loaded successfully
 */
export function loadPosition(fen) {
    if (!boardState.chess || !boardState.board) return false;

    try {
        const success = boardState.chess.load(fen);
        if (!success) {
            console.error('Invalid FEN:', fen);
            return false;
        }

        // Update board display
        boardState.board.set({
            fen: fen,
            lastMove: undefined,
            check: boardState.chess.in_check(),
            turnColor: boardState.chess.turn() === 'w' ? 'white' : 'black',
            movable: {
                color: boardState.userColor,
                dests: calculateDestinations(boardState.chess)
            }
        });

        return true;

    } catch (error) {
        console.error('Error loading position:', error);
        return false;
    }
}

/**
 * Draws analysis arrows on the board
 * @param {string} bestMoveUci - Best move in UCI format (e.g. 'e2e4')
 * @param {string} [threatUci] - Optional threat move to draw in red
 */
export function drawAnalysisShapes(bestMoveUci, threatUci = null) {
    if (!boardState.board) return;

    const shapes = [];

    // Draw Best Move Arrow (Green)
    if (bestMoveUci) {
        const from = bestMoveUci.substring(0, 2);
        const to = bestMoveUci.substring(2, 4);
        shapes.push({
            orig: from,
            dest: to,
            brush: 'green',
            modifiers: { lineWidth: 4 }
        });
    }

    // Draw Threat Arrow (Red) - Optional
    if (threatUci) {
        const from = threatUci.substring(0, 2);
        const to = threatUci.substring(2, 4);
        shapes.push({
            orig: from,
            dest: to,
            brush: 'red'
        });
    }

    // Apply shapes to the board
    boardState.board.set({
        drawable: {
            shapes: shapes,
            autoShapes: shapes
        }
    });
}

/**
 * Clears all shapes from the board
 */
export function clearShapes() {
    if (!boardState.board) return;
    boardState.board.set({ drawable: { shapes: [], autoShapes: [] } });
}
