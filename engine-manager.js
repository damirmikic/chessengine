/**
 * Engine Manager - Unified interface for local Stockfish and cloud engine
 * Handles seamless switching between engine types
 */

import {
    initializeEngine,
    evaluatePosition as localEvaluatePosition,
    findBestMove as localFindBestMove,
    analyzeWithMultiPv as localAnalyzeWithMultiPv,
    getEngineState as localGetEngineState,
    terminateEngine
} from './chess-engine.js';

import CloudEngine from './cloud-engine.js';

/**
 * Wrapper class for local Stockfish engine to match CloudEngine API
 */
class LocalEngineWrapper {
    constructor() {
        this.initialized = false;
    }

    async initializeEngine(callbacks) {
        this.initialized = await initializeEngine(callbacks);
        return this.initialized;
    }

    evaluatePosition(fen, depth, evaluationType) {
        localEvaluatePosition(fen, depth, evaluationType);
    }

    findBestMove(fen, depth) {
        localFindBestMove(fen, depth);
    }

    analyzeWithMultiPv(fen, depth, numLines) {
        localAnalyzeWithMultiPv(fen, depth, numLines);
    }

    getEngineState() {
        return localGetEngineState();
    }

    terminateEngine() {
        terminateEngine();
    }

    cleanup() {
        this.terminateEngine();
    }

    stopAnalysis() {
        // Local engine doesn't have explicit stop, status handled internally
    }

    setDepth(depth) {
        // Depth is set per-call for local engine
    }

    setVariants(variants) {
        // Variants are set per-call for local engine
    }
}

class EngineManager {
    constructor() {
        this.activeEngine = null;
        this.engineType = 'local'; // 'local' or 'cloud'
        this.callbacks = {};
        this.fallbackToLocal = true; // Auto-fallback if cloud fails
    }

    /**
     * Initialize engine with specified type
     * @param {string} type - 'local' or 'cloud'
     * @param {Object} callbacks - Event callbacks
     * @param {Object} options - Additional options {fallbackToLocal: true}
     * @returns {Promise}
     */
    async initialize(type = 'local', callbacks = {}, options = {}) {
        this.callbacks = callbacks;
        this.engineType = type;

        if (options.fallbackToLocal !== undefined) {
            this.fallbackToLocal = options.fallbackToLocal;
        }

        try {
            if (type === 'cloud') {
                console.log('Initializing cloud engine...');
                this.activeEngine = new CloudEngine();

                // Wrap callbacks to handle cloud-specific features
                const cloudCallbacks = this.wrapCloudCallbacks(callbacks);

                await this.activeEngine.initialize(cloudCallbacks);
                console.log('Cloud engine initialized successfully');

                // Save preference
                localStorage.setItem('preferred_engine', 'cloud');

            } else {
                console.log('Initializing local Stockfish engine...');
                this.activeEngine = new LocalEngineWrapper();

                await this.activeEngine.initializeEngine(callbacks);
                console.log('Local engine initialized successfully');

                // Save preference
                localStorage.setItem('preferred_engine', 'local');
            }

            return this.activeEngine;

        } catch (error) {
            console.error(`Failed to initialize ${type} engine:`, error);

            // Auto-fallback to local if cloud fails
            if (type === 'cloud' && this.fallbackToLocal) {
                console.log('Falling back to local engine...');

                if (callbacks.onError) {
                    callbacks.onError({
                        message: 'Cloud engine unavailable. Switched to local Stockfish.',
                        fallback: true
                    });
                }

                return this.initialize('local', callbacks, { fallbackToLocal: false });
            }

            throw error;
        }
    }

    /**
     * Wrap callbacks to handle cloud-specific data formats
     */
    wrapCloudCallbacks(callbacks) {
        return {
            onReady: callbacks.onReady,
            onError: callbacks.onError,

            onEvaluation: (data) => {
                // Cloud provides extra data (winChance, mate)
                if (callbacks.onEvaluation) {
                    callbacks.onEvaluation(data);
                }

                // Additional cloud-specific callback
                if (callbacks.onStreamingUpdate) {
                    callbacks.onStreamingUpdate(data);
                }
            },

            onMultiPv: (data) => {
                if (callbacks.onMultiPv) {
                    callbacks.onMultiPv(data);
                }

                // Additional cloud-specific callback
                if (callbacks.onCloudMultiPv) {
                    callbacks.onCloudMultiPv(data);
                }
            },

            onBestMove: callbacks.onBestMove
        };
    }

    /**
     * Switch to a different engine type
     * @param {string} newType - 'local' or 'cloud'
     * @returns {Promise}
     */
    async switchEngine(newType) {
        if (newType === this.engineType) {
            console.log(`Already using ${newType} engine`);
            return;
        }

        console.log(`Switching from ${this.engineType} to ${newType} engine...`);

        // Cleanup old engine
        if (this.activeEngine) {
            if (this.activeEngine.cleanup) {
                this.activeEngine.cleanup();
            } else if (this.activeEngine.terminateEngine) {
                this.activeEngine.terminateEngine();
            }
        }

        // Initialize new engine
        await this.initialize(newType, this.callbacks, { fallbackToLocal: this.fallbackToLocal });

        console.log(`Successfully switched to ${newType} engine`);
    }

    /**
     * Evaluate a position
     */
    evaluatePosition(fen, depth, evaluationType) {
        if (!this.activeEngine) {
            console.error('No active engine');
            return;
        }

        if (this.engineType === 'cloud') {
            this.activeEngine.evaluatePosition(fen, depth, evaluationType);
        } else {
            this.activeEngine.evaluatePosition(fen, depth, evaluationType);
        }
    }

    /**
     * Find best move
     */
    findBestMove(fen, depth) {
        if (!this.activeEngine) {
            console.error('No active engine');
            return;
        }

        if (this.engineType === 'cloud') {
            this.activeEngine.findBestMove(fen, depth);
        } else {
            this.activeEngine.findBestMove(fen, depth);
        }
    }

    /**
     * Analyze with multiple principal variations
     */
    analyzeWithMultiPv(fen, depth, numLines) {
        if (!this.activeEngine) {
            console.error('No active engine');
            return;
        }

        if (this.engineType === 'cloud') {
            this.activeEngine.analyzeWithMultiPv(fen, depth, numLines);
        } else {
            this.activeEngine.analyzeWithMultiPv(fen, depth, numLines);
        }
    }

    /**
     * Stop current analysis
     */
    stopAnalysis() {
        if (!this.activeEngine) {
            return;
        }

        if (this.activeEngine.stopAnalysis) {
            this.activeEngine.stopAnalysis();
        }
    }

    /**
     * Get current engine state
     */
    getEngineState() {
        if (!this.activeEngine) {
            return {
                type: this.engineType,
                status: 'not_initialized'
            };
        }

        if (this.engineType === 'cloud') {
            return this.activeEngine.getEngineState();
        } else {
            return {
                type: 'local',
                ...this.activeEngine.getEngineState()
            };
        }
    }

    /**
     * Get current engine type
     */
    getEngineType() {
        return this.engineType;
    }

    /**
     * Check if engine is cloud-based
     */
    isCloudEngine() {
        return this.engineType === 'cloud';
    }

    /**
     * Check if engine is local
     */
    isLocalEngine() {
        return this.engineType === 'local';
    }

    /**
     * Set engine depth (for cloud engine)
     */
    setDepth(depth) {
        if (this.activeEngine && this.activeEngine.setDepth) {
            this.activeEngine.setDepth(depth);
        }
    }

    /**
     * Set number of variants (for cloud engine)
     */
    setVariants(variants) {
        if (this.activeEngine && this.activeEngine.setVariants) {
            this.activeEngine.setVariants(variants);
        }
    }

    /**
     * Get stored engine preference
     */
    static getStoredPreference() {
        return localStorage.getItem('preferred_engine') || 'local';
    }

    /**
     * Clean up resources
     */
    cleanup() {
        if (this.activeEngine) {
            if (this.activeEngine.cleanup) {
                this.activeEngine.cleanup();
            } else if (this.activeEngine.terminateEngine) {
                this.activeEngine.terminateEngine();
            }
        }
        this.activeEngine = null;
    }
}

export default EngineManager;
