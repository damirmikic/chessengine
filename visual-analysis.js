/**
 * Visual Analysis Module
 * Enhanced visual components for position evaluation and move quality
 */

class VisualAnalysisManager {
    constructor() {
        this.currentEvaluation = 0;
        this.positionInsights = null;
    }

    /**
     * Initialize visual analysis manager
     */
    initialize() {
        this.createPositionInsightsPanel();
        console.log('Visual Analysis Manager initialized');
    }

    /**
     * Update evaluation display with visual card
     */
    updateEvaluationCard(evaluation, depth = 0) {
        this.currentEvaluation = evaluation;

        const container = document.getElementById('visualEvaluationCard');
        if (!container) return;

        const evalNumber = typeof evaluation === 'number' ? evaluation :
                          evaluation.includes('#') ? (evaluation.includes('+') ? 999 : -999) :
                          parseFloat(evaluation);

        const evalBar = this.calculateEvalBar(evalNumber);
        const positionAssessment = this.getPositionAssessment(evalNumber);

        container.innerHTML = `
            <div class="eval-card">
                <div class="eval-bar-visual">
                    <div class="eval-bar-container">
                        <div class="eval-bar-fill white-advantage" style="width: ${evalBar.white}%"></div>
                        <div class="eval-bar-fill black-advantage" style="width: ${evalBar.black}%"></div>
                    </div>
                    <div class="eval-labels">
                        <span class="eval-label-white">White</span>
                        <span class="eval-label-black">Black</span>
                    </div>
                </div>

                <div class="eval-score">
                    <div class="eval-number">${this.formatEvaluation(evaluation)}</div>
                    ${depth > 0 ? `<div class="eval-depth">Depth ${depth}</div>` : ''}
                </div>

                <div class="position-assessment">
                    <div class="assessment-icon">${positionAssessment.icon}</div>
                    <div class="assessment-text">${positionAssessment.text}</div>
                </div>
            </div>
        `;
    }

    /**
     * Calculate evaluation bar percentages
     */
    calculateEvalBar(eval_num) {
        const maxEval = 5;
        const normalized = Math.max(-maxEval, Math.min(maxEval, eval_num));
        const percentage = ((normalized + maxEval) / (maxEval * 2)) * 100;

        return {
            white: percentage,
            black: 100 - percentage
        };
    }

    /**
     * Get position assessment based on evaluation
     */
    getPositionAssessment(eval_num) {
        if (Math.abs(eval_num) >= 5) {
            return {
                icon: eval_num > 0 ? '🏆' : '⚠️',
                text: eval_num > 0 ? 'Winning for White' : 'Winning for Black'
            };
        } else if (Math.abs(eval_num) >= 2) {
            return {
                icon: '📊',
                text: eval_num > 0 ? 'Clear advantage: White' : 'Clear advantage: Black'
            };
        } else if (Math.abs(eval_num) >= 0.5) {
            return {
                icon: '📈',
                text: eval_num > 0 ? 'Slight advantage: White' : 'Slight advantage: Black'
            };
        } else {
            return {
                icon: '⚖️',
                text: 'Equal position'
            };
        }
    }

    /**
     * Format evaluation for display
     */
    formatEvaluation(eval_value) {
        if (typeof eval_value === 'string' && eval_value.includes('#')) {
            return eval_value;
        }

        const num = typeof eval_value === 'number' ? eval_value : parseFloat(eval_value);
        return num > 0 ? `+${num.toFixed(2)}` : num.toFixed(2);
    }

    /**
     * Create visual move quality indicator
     */
    createMoveQualityIndicator(move, quality, evalLoss = 0) {
        const indicators = {
            excellent: {
                symbol: '🌟',
                text: 'Excellent',
                class: 'move-excellent',
                color: '#10b981'
            },
            good: {
                symbol: '✓',
                text: 'Good',
                class: 'move-good',
                color: '#3b82f6'
            },
            inaccuracy: {
                symbol: '!?',
                text: 'Inaccuracy',
                class: 'move-inaccuracy',
                color: '#f59e0b'
            },
            mistake: {
                symbol: '?',
                text: 'Mistake',
                class: 'move-mistake',
                color: '#f97316'
            },
            blunder: {
                symbol: '??',
                text: 'Blunder',
                class: 'move-blunder',
                color: '#ef4444'
            }
        };

        const indicator = indicators[quality] || indicators.good;

        return `
            <div class="move-quality-indicator ${indicator.class}">
                <div class="quality-badge" style="background-color: ${indicator.color}">
                    <span class="quality-symbol">${indicator.symbol}</span>
                    <span class="quality-text">${indicator.text}</span>
                </div>
                ${evalLoss > 0 ? `
                    <div class="eval-loss-display">
                        Loss: -${evalLoss.toFixed(2)}
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Create position insights panel
     */
    createPositionInsightsPanel() {
        const container = document.getElementById('positionInsightsPanel');
        if (!container) return;

        container.innerHTML = `
            <div class="position-insights">
                <h4>📊 Position Insights</h4>
                <div id="positionInsightsContent" class="insights-content">
                    <p class="insights-placeholder">Make a move to see position analysis</p>
                </div>
            </div>
        `;
    }

    /**
     * Update position insights
     */
    updatePositionInsights(insights) {
        this.positionInsights = insights;

        const content = document.getElementById('positionInsightsContent');
        if (!content) return;

        if (!insights) {
            content.innerHTML = '<p class="insights-placeholder">Make a move to see position analysis</p>';
            return;
        }

        content.innerHTML = `
            <div class="insight-item">
                <span class="insight-icon">📊</span>
                <div class="insight-text">
                    <div class="insight-label">Material</div>
                    <div class="insight-value">${insights.material || 'Equal'}</div>
                </div>
            </div>

            <div class="insight-item">
                <span class="insight-icon">👑</span>
                <div class="insight-text">
                    <div class="insight-label">King Safety</div>
                    <div class="insight-value">${insights.kingSafety || 'Normal'}</div>
                </div>
            </div>

            <div class="insight-item">
                <span class="insight-icon">🎯</span>
                <div class="insight-text">
                    <div class="insight-label">Center Control</div>
                    <div class="insight-value">${insights.centerControl || 'Contested'}</div>
                </div>
            </div>

            <div class="insight-item">
                <span class="insight-icon">⚡</span>
                <div class="insight-text">
                    <div class="insight-label">Activity</div>
                    <div class="insight-value">${insights.activity || 'Equal'}</div>
                </div>
            </div>

            ${insights.keySquare ? `
                <div class="insight-highlight">
                    <span class="insight-icon">💡</span>
                    <div class="insight-text">
                        <div class="insight-label">Key Square</div>
                        <div class="insight-value">${insights.keySquare}</div>
                    </div>
                </div>
            ` : ''}

            ${insights.weakness ? `
                <div class="insight-highlight warning">
                    <span class="insight-icon">🎯</span>
                    <div class="insight-text">
                        <div class="insight-label">Weakness</div>
                        <div class="insight-value">${insights.weakness}</div>
                    </div>
                </div>
            ` : ''}

            ${insights.planSuggestions && insights.planSuggestions.length > 0 ? `
                <div class="plan-suggestions">
                    <div class="plan-header">💡 Plan Suggestions:</div>
                    <ol class="plan-list">
                        ${insights.planSuggestions.map(plan => `
                            <li class="plan-item">${plan}</li>
                        `).join('')}
                    </ol>
                </div>
            ` : ''}
        `;
    }

    /**
     * Analyze position and generate insights
     */
    analyzePosition(chess, evaluation) {
        const insights = {
            material: this.analyzeMaterial(chess),
            kingSafety: this.analyzeKingSafety(chess),
            centerControl: this.analyzeCenterControl(chess),
            activity: this.analyzeActivity(chess),
            keySquare: null,
            weakness: null,
            planSuggestions: []
        };

        // Add plan suggestions based on position
        insights.planSuggestions = this.generatePlanSuggestions(chess, evaluation);

        this.updatePositionInsights(insights);
        return insights;
    }

    /**
     * Analyze material balance
     */
    analyzeMaterial(chess) {
        const board = chess.board();
        let whiteMaterial = 0;
        let blackMaterial = 0;

        const pieceValues = {
            'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9
        };

        board.forEach(row => {
            row.forEach(square => {
                if (square) {
                    const value = pieceValues[square.type] || 0;
                    if (square.color === 'w') {
                        whiteMaterial += value;
                    } else {
                        blackMaterial += value;
                    }
                }
            });
        });

        const diff = whiteMaterial - blackMaterial;
        if (diff > 3) return `White +${diff}`;
        if (diff < -3) return `Black +${Math.abs(diff)}`;
        return 'Equal';
    }

    /**
     * Analyze king safety
     */
    analyzeKingSafety(chess) {
        // Simple heuristic based on king position and castling
        const turn = chess.turn();
        const castling = chess.getCastlingRights(turn);

        if (castling.kingSide || castling.queenSide) {
            return 'Safe (castled)';
        }

        return 'Normal';
    }

    /**
     * Analyze center control
     */
    analyzeCenterControl(chess) {
        const board = chess.board();
        const centerSquares = [
            board[3][3], board[3][4],  // d4, e4
            board[4][3], board[4][4]   // d5, e5
        ];

        let whiteControl = 0;
        let blackControl = 0;

        centerSquares.forEach(square => {
            if (square) {
                if (square.color === 'w') whiteControl++;
                else blackControl++;
            }
        });

        if (whiteControl > blackControl) return 'White controls';
        if (blackControl > whiteControl) return 'Black controls';
        return 'Contested';
    }

    /**
     * Analyze piece activity
     */
    analyzeActivity(chess) {
        const moves = chess.moves({ verbose: true });
        return moves.length > 30 ? 'High activity' : moves.length > 20 ? 'Good activity' : 'Limited';
    }

    /**
     * Generate plan suggestions
     */
    generatePlanSuggestions(chess, evaluation) {
        const suggestions = [];
        const turn = chess.turn();

        // Basic suggestions based on position
        if (Math.abs(evaluation) < 1) {
            suggestions.push('Improve piece positions');
            suggestions.push('Control key squares');
        } else if (evaluation > 1 && turn === 'w' || evaluation < -1 && turn === 'b') {
            suggestions.push('Consolidate advantage');
            suggestions.push('Look for tactical opportunities');
        } else {
            suggestions.push('Create counterplay');
            suggestions.push('Improve worst piece');
        }

        return suggestions.slice(0, 3);
    }

    /**
     * Create timeline-style move history item
     */
    createTimelineMoveItem(moveNumber, whiteMove, blackMove, whiteQuality, blackQuality) {
        return `
            <div class="timeline-move-item">
                <div class="move-number">${moveNumber}.</div>
                <div class="moves-container">
                    ${whiteMove ? `
                        <div class="move-entry white-move ${whiteQuality}">
                            <span class="move-notation">${whiteMove}</span>
                            <span class="move-quality-dot ${whiteQuality}"></span>
                        </div>
                    ` : ''}
                    ${blackMove ? `
                        <div class="move-entry black-move ${blackQuality}">
                            <span class="move-notation">${blackMove}</span>
                            <span class="move-quality-dot ${blackQuality}"></span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Render complete timeline move history
     */
    renderTimelineMoveHistory(moveHistory) {
        const container = document.getElementById('timelineMoveHistory');
        if (!container) return;

        let html = '<div class="timeline-move-history">';

        for (let i = 0; i < moveHistory.length; i += 2) {
            const moveNumber = Math.floor(i / 2) + 1;
            const whiteMove = moveHistory[i];
            const blackMove = moveHistory[i + 1];

            html += this.createTimelineMoveItem(
                moveNumber,
                whiteMove?.san,
                blackMove?.san,
                whiteMove?.quality || 'good',
                blackMove?.quality || 'good'
            );
        }

        html += '</div>';
        container.innerHTML = html;
    }

    /**
     * Add material advantage graph
     */
    createMaterialGraph(moveHistory) {
        const container = document.getElementById('materialGraph');
        if (!container) return;

        const evaluations = moveHistory.map(m => m.evaluation || 0);
        const width = 100;
        const height = 50;

        // Create SVG path
        const points = evaluations.map((eval_val, index) => {
            const x = (index / (evaluations.length - 1)) * width;
            const normalized = Math.max(-5, Math.min(5, eval_val));
            const y = height - ((normalized + 5) / 10) * height;
            return `${x},${y}`;
        }).join(' ');

        container.innerHTML = `
            <svg class="material-graph-svg" viewBox="0 0 ${width} ${height}">
                <line x1="0" y1="${height/2}" x2="${width}" y2="${height/2}"
                      stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/>
                <polyline points="${points}"
                          fill="none"
                          stroke="#6366f1"
                          stroke-width="1.5"/>
            </svg>
        `;
    }
}

// Create and export singleton instance
const visualAnalysisManager = new VisualAnalysisManager();
window.visualAnalysisManager = visualAnalysisManager;

console.log('Visual Analysis Manager module loaded');
