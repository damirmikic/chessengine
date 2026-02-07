/**
 * Cloud Chess Engine - WebSocket-based analysis using chess-api.com
 * Provides 80 MNPS Stockfish 17 calculation power without local CPU usage
 */

class CloudEngine {
    constructor() {
        this.ws = null;
        this.callbacks = {};
        this.currentTaskId = null;
        this.status = 'idle';
        this.currentEval = 0;
        this.currentPv = '';
        this.bestMoves = [];
        this.depth = 12;
        this.variants = 3;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 3;
        this.reconnectDelay = 2000;
        this.pendingRequests = new Map();
    }

    /**
     * Initialize the cloud engine with WebSocket connection
     * @param {Object} callbacks - Event callbacks {onReady, onBestMove, onEvaluation, onMultiPv, onError}
     * @returns {Promise} Resolves when connection is established
     */
    initialize(callbacks) {
        return new Promise((resolve, reject) => {
            this.callbacks = callbacks || {};

            try {
                this.ws = new WebSocket('wss://chess-api.com/v1');

                this.ws.onopen = () => {
                    console.log('Cloud engine connected successfully');
                    this.status = 'idle';
                    this.reconnectAttempts = 0;

                    if (this.callbacks.onReady) {
                        this.callbacks.onReady();
                    }
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        this.handleMessage(data);
                    } catch (error) {
                        console.error('Error parsing cloud engine message:', error);
                    }
                };

                this.ws.onerror = (error) => {
                    console.error('Cloud engine WebSocket error:', error);
                    this.status = 'error';

                    if (this.callbacks.onError) {
                        this.callbacks.onError({
                            message: 'Cloud engine connection failed',
                            error: error
                        });
                    }
                    reject(error);
                };

                this.ws.onclose = () => {
                    console.log('Cloud engine connection closed');
                    this.status = 'disconnected';
                    this.attemptReconnect();
                };

            } catch (error) {
                console.error('Failed to initialize cloud engine:', error);
                this.status = 'error';
                if (this.callbacks.onError) {
                    this.callbacks.onError(error);
                }
                reject(error);
            }
        });
    }

    /**
     * Attempt to reconnect to the WebSocket server
     */
    attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            if (this.callbacks.onError) {
                this.callbacks.onError({
                    message: 'Failed to reconnect to cloud engine. Please switch to local engine or refresh the page.'
                });
            }
            return;
        }

        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms...`);

        setTimeout(() => {
            this.initialize(this.callbacks).catch(() => {
                // Reconnection failed, will retry if under max attempts
            });
        }, delay);
    }

    /**
     * Evaluate a chess position
     * @param {string} fen - Position in FEN notation
     * @param {number} depth - Search depth (1-18)
     * @param {string} evaluationType - Type of evaluation ('current', 'hint', 'play')
     */
    evaluatePosition(fen, depth = 12, evaluationType = 'current') {
        if (this.status === 'disconnected' || this.status === 'error') {
            console.warn('Cloud engine not connected');
            return;
        }

        this.status = `evaluating_${evaluationType}`;
        this.currentTaskId = this.generateTaskId();
        this.depth = Math.min(Math.max(depth, 1), 18);

        const request = {
            fen,
            depth: this.depth,
            variants: this.variants,
            maxThinkingTime: 50,
            taskId: this.currentTaskId
        };

        this.pendingRequests.set(this.currentTaskId, {
            type: evaluationType,
            timestamp: Date.now()
        });

        this.sendMessage(request);
    }

    /**
     * Find the best move for a position
     * @param {string} fen - Position in FEN notation
     * @param {number} depth - Search depth
     */
    findBestMove(fen, depth = 12) {
        this.evaluatePosition(fen, depth, 'hint');
    }

    /**
     * Analyze position with multiple principal variations
     * @param {string} fen - Position in FEN notation
     * @param {number} depth - Search depth
     * @param {number} numLines - Number of variations to analyze (1-5)
     */
    analyzeWithMultiPv(fen, depth = 12, numLines = 3) {
        this.variants = Math.min(Math.max(numLines, 1), 5);
        this.evaluatePosition(fen, depth, 'analyze');
    }

    /**
     * Handle incoming messages from the cloud engine
     * @param {Object} data - Parsed JSON data from WebSocket
     */
    handleMessage(data) {
        // Update current evaluation (keep in pawns to match local engine convention)
        if (data.eval !== undefined) {
            this.currentEval = data.eval;
        }

        // Progressive move updates
        if (data.type === 'move') {
            this.handleMoveUpdate(data);
        }

        // Final best move
        if (data.type === 'bestmove') {
            this.handleBestMove(data);
        }

        // Info messages (status, errors, etc.)
        if (data.type === 'info') {
            this.handleInfo(data);
        }
    }

    /**
     * Convert LAN (Long Algebraic Notation) to UCI format
     * Strips piece prefixes (e.g., "N", "B") and dashes from moves like "Nb1-c3" -> "b1c3"
     * @param {string} lan - Move in LAN format
     * @returns {string} Move in UCI format
     */
    lanToUci(lan) {
        if (!lan) return lan;
        // Remove piece prefix (uppercase letter at start, if followed by a file letter a-h)
        let uci = lan.replace(/^[KQRBNP](?=[a-h])/, '');
        // Remove dashes
        uci = uci.replace(/-/g, '');
        return uci;
    }

    /**
     * Handle progressive move updates during analysis
     */
    handleMoveUpdate(data) {
        // Store in best moves array
        const moveData = {
            move: this.lanToUci(data.lan) || data.move,
            san: data.san,
            eval: data.eval,
            centipawns: data.eval * 100,
            continuation: data.continuationArr || [],
            depth: data.depth,
            winChance: data.winChance,
            mate: data.mate,
            text: data.text
        };

        // Update or add to best moves
        const existingIndex = this.bestMoves.findIndex(m => m.move === moveData.move);
        if (existingIndex >= 0) {
            this.bestMoves[existingIndex] = moveData;
        } else {
            this.bestMoves.push(moveData);
        }

        // Keep only top variants, sorted by evaluation
        this.bestMoves.sort((a, b) => {
            // Handle mate scores
            if (a.mate !== null && b.mate === null) return -1;
            if (b.mate !== null && a.mate === null) return 1;
            if (a.mate !== null && b.mate !== null) {
                return a.mate > 0 ? (a.mate - b.mate) : (b.mate - a.mate);
            }
            // Normal evaluation (higher is better for white)
            return b.eval - a.eval;
        });
        this.bestMoves = this.bestMoves.slice(0, this.variants);

        // Callback for evaluation updates
        if (this.callbacks.onEvaluation) {
            this.callbacks.onEvaluation({
                score: moveData.centipawns,
                depth: data.depth,
                pv: data.continuationArr ? data.continuationArr.join(' ') : '',
                mate: data.mate,
                winChance: data.winChance
            });
        }

        // Callback for multi-PV updates - pass the complete bestMoves array
        if (this.callbacks.onMultiPv) {
            this.callbacks.onMultiPv(this.bestMoves);
        }

        // Update current PV
        if (data.continuationArr && data.continuationArr.length > 0) {
            this.currentPv = data.continuationArr.join(' ');
        }
    }

    /**
     * Handle final best move from analysis
     */
    handleBestMove(data) {
        this.status = 'idle';

        const moveData = {
            move: this.lanToUci(data.lan) || data.move,
            san: data.san,
            eval: data.eval,
            centipawns: data.eval * 100,
            depth: data.depth,
            mate: data.mate,
            pv: data.continuationArr || [],
            winChance: data.winChance,
            text: data.text
        };

        // Clean up pending request
        if (data.taskId) {
            this.pendingRequests.delete(data.taskId);
        }

        if (this.callbacks.onBestMove) {
            this.callbacks.onBestMove(moveData);
        }
    }

    /**
     * Handle info messages
     */
    handleInfo(data) {
        console.log('Cloud engine info:', data);

        if (data.error && this.callbacks.onError) {
            this.callbacks.onError({
                message: data.error,
                data: data
            });
        }
    }

    /**
     * Send a message to the cloud engine
     */
    sendMessage(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        } else {
            console.error('WebSocket not connected, cannot send message');
            if (this.callbacks.onError) {
                this.callbacks.onError({
                    message: 'Cloud engine not connected'
                });
            }
        }
    }

    /**
     * Get current engine state
     */
    getEngineState() {
        return {
            type: 'cloud',
            status: this.status,
            currentEval: this.currentEval,
            currentPv: this.currentPv,
            bestMoves: this.bestMoves,
            depth: this.depth,
            variants: this.variants,
            connected: this.ws && this.ws.readyState === WebSocket.OPEN
        };
    }

    /**
     * Stop current analysis
     */
    stopAnalysis() {
        // Cloud API doesn't support stop command, but we can update status
        this.status = 'idle';
        this.pendingRequests.clear();
    }

    /**
     * Clean up resources
     */
    cleanup() {
        console.log('Cleaning up cloud engine');
        this.stopAnalysis();

        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }

        this.status = 'idle';
        this.bestMoves = [];
        this.pendingRequests.clear();
    }

    /**
     * Generate a random task ID
     */
    generateTaskId() {
        return Math.random().toString(36).substr(2, 9);
    }

    /**
     * Set analysis depth
     */
    setDepth(depth) {
        this.depth = Math.min(Math.max(depth, 1), 18);
    }

    /**
     * Set number of variants to analyze
     */
    setVariants(variants) {
        this.variants = Math.min(Math.max(variants, 1), 5);
    }
}

export default CloudEngine;
