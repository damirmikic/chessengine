/**
 * @fileoverview Match Analysis module
 * Provides step-by-step analysis of completed matches with best move suggestions,
 * mistake notation, and accuracy tracking
 */

import { Chess } from 'https://esm.sh/chess.js@0.13.4';
import { classifyMoveQuality, calculateEvalLoss } from './analysis.js';

/**
 * @typedef {Object} AnalyzedMove
 * @property {number} moveNumber - Move number
 * @property {string} san - Move played in SAN notation
 * @property {string} color - Color that made the move ('w' or 'b')
 * @property {string} fen - FEN position after the move
 * @property {string} previousFen - FEN position before the move
 * @property {number|null} evaluation - Position evaluation after move
 * @property {number|null} previousEvaluation - Position evaluation before move
 * @property {string|null} bestMove - Best move in SAN notation
 * @property {string|null} bestMoveUci - Best move in UCI notation
 * @property {number|null} bestEvaluation - Evaluation after best move
 * @property {number} evalLoss - Evaluation loss in pawns
 * @property {string} quality - Move quality (Good Move, Inaccuracy, Mistake, Blunder)
 * @property {string} annotation - Move annotation (!, !!, ?, ??, !?)
 */

/**
 * Match analysis state
 */
const analysisState = {
    moves: [], // Array of AnalyzedMove objects
    currentIndex: 0, // Current move being viewed
    chess: null, // Chess.js instance for position validation
    isAnalyzing: false,
    onUpdate: null, // Callback when state updates
    userColor: 'white', // Color being analyzed for accuracy
    totalMoves: 0,
    analyzedMoves: 0
};

/**
 * Initializes the match analysis module
 * @param {Object} options - Initialization options
 * @param {Function} options.onUpdate - Callback when analysis state updates
 */
export function initializeMatchAnalysis({ onUpdate }) {
    analysisState.onUpdate = onUpdate;
    analysisState.chess = new Chess();
    console.log('Match analysis initialized');
}

/**
 * Starts analyzing a game move by move
 * @param {Array} moves - Array of move records from game history
 * @param {Function} engineAnalyzeFn - Function to analyze position and get best move
 * @param {string} userColor - User's color for accuracy calculation ('white' or 'black')
 * @returns {Promise<void>}
 */
export async function analyzeMatch(moves, engineAnalyzeFn, userColor = 'white') {
    if (analysisState.isAnalyzing) {
        console.warn('Analysis already in progress');
        return;
    }

    analysisState.isAnalyzing = true;
    analysisState.moves = [];
    analysisState.currentIndex = 0;
    analysisState.userColor = userColor;
    analysisState.totalMoves = moves.length;
    analysisState.analyzedMoves = 0;

    // Initialize chess position
    const chess = new Chess();
    let previousEval = 0;

    // Notify start of analysis
    notifyUpdate('analyzing');

    try {
        for (let i = 0; i < moves.length; i++) {
            const move = moves[i];
            const previousFen = chess.fen();

            // Get best move for this position
            const analysis = await engineAnalyzeFn(previousFen);
            const bestMoveUci = analysis?.bestMove || null;
            const bestEvaluation = analysis?.evaluation || null;

            // Make the actual move
            const madeMove = chess.move(move.san);
            if (!madeMove) {
                console.error(`Invalid move at index ${i}:`, move.san);
                continue;
            }

            const currentFen = chess.fen();
            const currentEval = move.evaluation !== null ? move.evaluation : bestEvaluation;

            // Convert best move UCI to SAN
            let bestMoveSan = null;
            if (bestMoveUci) {
                const tempChess = new Chess(previousFen);
                const from = bestMoveUci.substring(0, 2);
                const to = bestMoveUci.substring(2, 4);
                const promotion = bestMoveUci.length > 4 ? bestMoveUci.substring(4, 5) : undefined;
                const bestMoveObj = tempChess.move({ from, to, promotion });
                bestMoveSan = bestMoveObj ? bestMoveObj.san : bestMoveUci;
            }

            // Calculate evaluation loss
            const evalLoss = calculateEvalLoss(previousEval, currentEval, move.color === 'w' ? 'white' : 'black');
            const quality = classifyMoveQuality(Math.abs(evalLoss));

            // Determine annotation
            let annotation = move.annotation;
            if (!annotation) {
                if (evalLoss < 0.1) {
                    annotation = '!!';
                } else if (evalLoss < 0.3) {
                    annotation = '!';
                } else if (evalLoss >= 0.3 && evalLoss < 1.0) {
                    annotation = '!?';
                } else if (evalLoss >= 1.0 && evalLoss < 2.5) {
                    annotation = '?';
                } else if (evalLoss >= 2.5) {
                    annotation = '??';
                }
            }

            // Store analyzed move
            analysisState.moves.push({
                moveNumber: move.moveNumber,
                san: move.san,
                color: move.color,
                fen: currentFen,
                previousFen: previousFen,
                evaluation: currentEval,
                previousEvaluation: previousEval,
                bestMove: bestMoveSan,
                bestMoveUci: bestMoveUci,
                bestEvaluation: bestEvaluation,
                evalLoss: Math.abs(evalLoss),
                quality: quality.title,
                annotation: annotation
            });

            previousEval = currentEval;
            analysisState.analyzedMoves = i + 1;

            // Notify progress
            if ((i + 1) % 5 === 0 || i === moves.length - 1) {
                notifyUpdate('progress');
            }
        }

        analysisState.isAnalyzing = false;
        analysisState.currentIndex = 0;
        notifyUpdate('complete');

    } catch (error) {
        console.error('Error during match analysis:', error);
        analysisState.isAnalyzing = false;
        notifyUpdate('error');
    }
}

/**
 * Navigates to a specific move
 * @param {number} index - Move index (0-based)
 */
export function goToMove(index) {
    if (index < 0 || index >= analysisState.moves.length) {
        return;
    }
    analysisState.currentIndex = index;
    notifyUpdate('navigate');
}

/**
 * Navigates to the next move
 */
export function nextMove() {
    if (analysisState.currentIndex < analysisState.moves.length - 1) {
        analysisState.currentIndex++;
        notifyUpdate('navigate');
    }
}

/**
 * Navigates to the previous move
 */
export function previousMove() {
    if (analysisState.currentIndex > 0) {
        analysisState.currentIndex--;
        notifyUpdate('navigate');
    }
}

/**
 * Navigates to the first move
 */
export function firstMove() {
    if (analysisState.moves.length > 0) {
        analysisState.currentIndex = 0;
        notifyUpdate('navigate');
    }
}

/**
 * Navigates to the last move
 */
export function lastMove() {
    if (analysisState.moves.length > 0) {
        analysisState.currentIndex = analysisState.moves.length - 1;
        notifyUpdate('navigate');
    }
}

/**
 * Gets the current move being analyzed
 * @returns {AnalyzedMove|null} Current analyzed move or null
 */
export function getCurrentMove() {
    if (analysisState.currentIndex >= 0 && analysisState.currentIndex < analysisState.moves.length) {
        return analysisState.moves[analysisState.currentIndex];
    }
    return null;
}

/**
 * Gets all analyzed moves
 * @returns {AnalyzedMove[]} Array of analyzed moves
 */
export function getAnalyzedMoves() {
    return analysisState.moves;
}

/**
 * Calculates accuracy for the player being analyzed
 * @returns {Object} Accuracy statistics
 */
export function calculateAccuracy() {
    const userMoves = analysisState.moves.filter(m => {
        return (analysisState.userColor === 'white' && m.color === 'w') ||
               (analysisState.userColor === 'black' && m.color === 'b');
    });

    const totalMoves = userMoves.length;
    if (totalMoves === 0) {
        return {
            accuracy: 0,
            totalMoves: 0,
            goodMoves: 0,
            inaccuracies: 0,
            mistakes: 0,
            blunders: 0
        };
    }

    let goodMoves = 0;
    let inaccuracies = 0;
    let mistakes = 0;
    let blunders = 0;

    userMoves.forEach(move => {
        if (move.annotation === '!!' || move.annotation === '!' || !move.annotation) {
            goodMoves++;
        } else if (move.annotation === '!?') {
            inaccuracies++;
        } else if (move.annotation === '?') {
            mistakes++;
        } else if (move.annotation === '??') {
            blunders++;
        }
    });

    const accuracy = Math.round((goodMoves / totalMoves) * 100);

    return {
        accuracy,
        totalMoves,
        goodMoves,
        inaccuracies,
        mistakes,
        blunders
    };
}

/**
 * Gets the current move index
 * @returns {number} Current index
 */
export function getCurrentIndex() {
    return analysisState.currentIndex;
}

/**
 * Gets the total number of moves
 * @returns {number} Total moves
 */
export function getTotalMoves() {
    return analysisState.moves.length;
}

/**
 * Checks if analysis is in progress
 * @returns {boolean} True if analyzing
 */
export function isAnalyzing() {
    return analysisState.isAnalyzing;
}

/**
 * Gets analysis progress
 * @returns {Object} Progress info
 */
export function getProgress() {
    return {
        total: analysisState.totalMoves,
        analyzed: analysisState.analyzedMoves,
        percentage: analysisState.totalMoves > 0
            ? Math.round((analysisState.analyzedMoves / analysisState.totalMoves) * 100)
            : 0
    };
}

/**
 * Resets the match analysis state
 */
export function resetAnalysis() {
    analysisState.moves = [];
    analysisState.currentIndex = 0;
    analysisState.isAnalyzing = false;
    analysisState.totalMoves = 0;
    analysisState.analyzedMoves = 0;
    notifyUpdate('reset');
}

/**
 * Notifies listeners of state updates
 * @param {string} type - Update type
 */
function notifyUpdate(type) {
    if (analysisState.onUpdate) {
        analysisState.onUpdate({
            type,
            currentMove: getCurrentMove(),
            currentIndex: analysisState.currentIndex,
            totalMoves: analysisState.moves.length,
            accuracy: calculateAccuracy(),
            progress: getProgress(),
            isAnalyzing: analysisState.isAnalyzing
        });
    }
}
