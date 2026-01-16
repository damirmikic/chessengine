/**
 * @fileoverview Chess move analysis and evaluation module
 * Provides move quality assessment and feedback display
 */

import { Chess } from 'https://esm.sh/chess.js@0.13.4';

/**
 * @typedef {Object} MoveQuality
 * @property {string} title - Quality title (e.g., "Good Move", "Blunder")
 * @property {string} description - Brief description
 * @property {string} cssClass - CSS class for styling
 */

/**
 * Thresholds for move quality classification (in pawns)
 * @const {Object}
 */
const QUALITY_THRESHOLDS = {
    GOOD: 0.3,
    INACCURACY: 1.0,
    MISTAKE: 2.5
};

/**
 * Converts UCI move notation to SAN (Standard Algebraic Notation)
 * @param {string} uciMove - Move in UCI format (e.g., "e2e4")
 * @param {string} startFen - FEN string of the starting position
 * @returns {string} Move in SAN format (e.g., "e4") or original UCI if conversion fails
 */
export function uciToSan(uciMove, startFen) {
    if (!uciMove) return "";

    try {
        const tempChess = new Chess(startFen);
        const from = uciMove.substring(0, 2);
        const to = uciMove.substring(2, 4);
        const promotion = uciMove.length > 4 ? uciMove.substring(4, 5) : undefined;

        const move = tempChess.move({ from, to, promotion });
        return move ? move.san : uciMove;
    } catch (error) {
        console.error('Error converting UCI to SAN:', error);
        return uciMove;
    }
}

/**
 * Classifies move quality based on evaluation loss
 * @param {number} evalLoss - Evaluation loss in pawns
 * @returns {MoveQuality} Move quality classification
 */
export function classifyMoveQuality(evalLoss) {
    if (evalLoss < QUALITY_THRESHOLDS.GOOD) {
        return {
            title: "Good Move",
            description: "Solid play.",
            cssClass: "good"
        };
    } else if (evalLoss < QUALITY_THRESHOLDS.INACCURACY) {
        return {
            title: "Inaccuracy",
            description: "Passive.",
            cssClass: "inaccuracy"
        };
    } else if (evalLoss < QUALITY_THRESHOLDS.MISTAKE) {
        return {
            title: "Mistake",
            description: "Tactical error.",
            cssClass: "mistake"
        };
    } else {
        return {
            title: "BLUNDER",
            description: "Major error.",
            cssClass: "blunder"
        };
    }
}

/**
 * Analyzes a move and displays feedback to the user
 * @param {Object} analysisData - Analysis data
 * @param {number} analysisData.evalLoss - Evaluation loss in pawns
 * @param {number} analysisData.currentEval - Current position evaluation
 * @param {string} [analysisData.bestMoveUci] - Best move in UCI format
 * @param {string} [analysisData.bestLinePv] - Best line Principal Variation
 * @param {string} [analysisData.refutationPv] - Refutation line
 * @param {string} [analysisData.previousFen] - FEN before the move
 * @param {string} [analysisData.currentFen] - FEN after the move
 */
export function displayMoveAnalysis(analysisData) {
    const {
        evalLoss,
        currentEval,
        bestMoveUci,
        bestLinePv,
        refutationPv,
        previousFen,
        currentFen
    } = analysisData;

    const feedbackEl = document.getElementById('feedback');
    if (!feedbackEl) return;

    // Classify move quality
    const quality = classifyMoveQuality(evalLoss);

    // Build feedback HTML
    let html = `<strong>${quality.title}</strong> <small>(Loss: ${evalLoss.toFixed(2)})</small><br>${quality.description}`;

    // Add hint if a better move exists
    if (bestMoveUci && previousFen) {
        const sanBest = uciToSan(bestMoveUci, previousFen);
        html += `<div style="margin-top:10px; padding-top:10px; border-top:1px solid rgba(255,255,255,0.2)">
                 <strong>Better was:</strong> <span style="color:#4caf50; font-size:1.1em">${sanBest}</span>`;

        // Explain why the move was bad (show refutation)
        if (refutationPv && currentFen) {
            const moves = refutationPv.split(" ");
            const oppReplyUci = moves[0];

            if (oppReplyUci) {
                const sanReply = uciToSan(oppReplyUci, currentFen);
                html += `<div style="margin-top:8px; font-size:0.95em; color:#ffccbc;">
                         <strong>Why?</strong> This allows <b>${sanReply}</b>...
                         </div>`;
            }
        }

        html += `</div>`;
    }

    // Update feedback display
    feedbackEl.innerHTML = html;
    feedbackEl.className = `feedback-box ${quality.cssClass}`;

    // Update evaluation bar
    updateEvaluationBar(currentEval);
}

/**
 * Updates the visual evaluation bar
 * @param {number} evaluation - Position evaluation in pawns
 */
export function updateEvaluationBar(evaluation) {
    const bar = document.getElementById('eval-fill');
    if (!bar) return;

    // Clamp evaluation to reasonable range
    const clampedScore = Math.max(-5, Math.min(5, evaluation));

    // Convert to percentage (0-100)
    // -5 = 0%, 0 = 50%, +5 = 100%
    const percent = 50 + (clampedScore * 10);

    bar.style.width = `${percent}%`;
}

/**
 * Displays a loading/analyzing message
 * @param {string} [message='Analyzing...'] - Message to display
 */
export function showAnalyzing(message = 'Analyzing...') {
    const feedbackEl = document.getElementById('feedback');
    if (!feedbackEl) return;

    feedbackEl.innerHTML = `<em>${message}</em>`;
    feedbackEl.className = 'feedback-box';
}

/**
 * Displays a simple message in the feedback area
 * @param {string} message - Message to display
 */
export function showMessage(message) {
    const feedbackEl = document.getElementById('feedback');
    if (!feedbackEl) return;

    feedbackEl.innerHTML = message;
    feedbackEl.className = 'feedback-box';
}

/**
 * Calculates evaluation loss based on player color
 * @param {number} previousEval - Evaluation before the move
 * @param {number} currentEval - Evaluation after the move
 * @param {string} userColor - User's color ('white' or 'black')
 * @returns {number} Evaluation loss in pawns
 */
export function calculateEvalLoss(previousEval, currentEval, userColor) {
    // For white, a decrease in eval is bad
    // For black, an increase in eval is bad (since eval is from white's perspective)
    if (userColor === 'white') {
        return previousEval - currentEval;
    } else {
        return currentEval - previousEval;
    }
}

/**
 * Determines if a move should be flagged as a mistake
 * @param {number} evalLoss - Evaluation loss in pawns
 * @returns {boolean} True if move is a mistake or worse
 */
export function isMistake(evalLoss) {
    return evalLoss > QUALITY_THRESHOLDS.GOOD;
}

/**
 * Gets quality threshold values
 * @returns {Object} Quality thresholds
 */
export function getQualityThresholds() {
    return { ...QUALITY_THRESHOLDS };
}
