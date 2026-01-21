/**
 * Context Manager
 * Manages the application context and intelligently switches the right panel
 * based on what the user is currently doing.
 */

/**
 * Application contexts
 */
const AppContext = {
    GAME_ACTIVE: 'game-active',      // During an active game
    GAME_ENDED: 'game-ended',        // After game finishes (checkmate, stalemate, resign)
    ANALYSIS: 'analysis',            // Analyzing a position or complete game
    LEARNING: 'learning',            // Learning dashboard, trainer, or puzzles
    SETTINGS: 'settings'             // Viewing/changing settings
};

/**
 * Context Manager Class
 * Handles context detection and right panel content switching
 */
class ContextManager {
    constructor() {
        this.currentContext = AppContext.GAME_ACTIVE;
        this.previousContext = null;
        this.listeners = [];
        this.transitionDuration = 300; // ms
        this.initialized = false;
    }

    /**
     * Initialize the context manager
     */
    initialize() {
        if (this.initialized) {
            console.log('Context Manager already initialized, skipping');
            return;
        }

        console.log('Context Manager initialized');
        this.detectAndSetContext();
        this.setupEventListeners();
        this.initialized = true;
    }

    /**
     * Set up event listeners for context changes
     */
    setupEventListeners() {
        // Listen for game state changes
        document.addEventListener('game:started', () => {
            this.setContext(AppContext.GAME_ACTIVE);
        });

        document.addEventListener('game:ended', () => {
            this.setContext(AppContext.GAME_ENDED);
        });

        document.addEventListener('analysis:started', () => {
            this.setContext(AppContext.ANALYSIS);
        });

        document.addEventListener('learning:opened', () => {
            this.setContext(AppContext.LEARNING);
        });

        document.addEventListener('settings:opened', () => {
            this.setContext(AppContext.SETTINGS);
        });
    }

    /**
     * Detect the current context based on app state
     */
    detectAndSetContext() {
        const chess = window.getChess ? window.getChess() : null;

        if (!chess) {
            this.setContext(AppContext.GAME_ACTIVE);
            return;
        }

        // Check if game has ended
        if (chess.isGameOver()) {
            this.setContext(AppContext.GAME_ENDED);
        }
        // Check if in analysis mode
        else if (window.appState?.analysisMode) {
            this.setContext(AppContext.ANALYSIS);
        }
        // Default to active game
        else {
            this.setContext(AppContext.GAME_ACTIVE);
        }
    }

    /**
     * Set the current context
     * @param {string} context - The context to set
     * @param {boolean} force - Force the context change even if it's the same
     */
    setContext(context, force = false) {
        if (!force && this.currentContext === context) {
            return;
        }

        this.previousContext = this.currentContext;
        this.currentContext = context;

        console.log(`Context changed: ${this.previousContext} → ${this.currentContext}`);

        // Update UI
        this.updateRightPanel();
        this.updateNavigationState();

        // Notify listeners
        this.notifyListeners(context, this.previousContext);

        // Add context class to body for CSS targeting
        document.body.dataset.context = context;
    }

    /**
     * Get the current context
     * @returns {string} The current context
     */
    getContext() {
        return this.currentContext;
    }

    /**
     * Check if currently in a specific context
     * @param {string} context - The context to check
     * @returns {boolean}
     */
    isContext(context) {
        return this.currentContext === context;
    }

    /**
     * Update the right panel based on current context
     */
    updateRightPanel() {
        const rightPanel = document.getElementById('rightPanel');
        if (!rightPanel) {
            console.error('Right panel not found!');
            return;
        }

        console.log('Updating right panel for context:', this.currentContext);

        // Add transition class
        rightPanel.classList.add('transitioning');

        // Update panel title
        const panelTitle = rightPanel.querySelector('.panel-header h3');
        if (panelTitle) {
            panelTitle.textContent = this.getPanelTitle();
        }

        // Hide all context panels
        const allPanels = document.querySelectorAll('.context-panel');
        console.log('Found context panels:', allPanels.length);
        allPanels.forEach(panel => {
            panel.classList.remove('active');
            console.log('Hiding panel:', panel.id);
        });

        // Show the appropriate context panel
        const targetPanel = document.getElementById(`context-${this.currentContext}`);
        if (targetPanel) {
            console.log('Showing target panel:', targetPanel.id);
            setTimeout(() => {
                targetPanel.classList.add('active');
                rightPanel.classList.remove('transitioning');
                console.log('Panel activated:', targetPanel.id);
            }, this.transitionDuration);
        } else {
            console.error('Target panel not found:', `context-${this.currentContext}`);
            rightPanel.classList.remove('transitioning');
        }

        // Update panel classes for styling
        rightPanel.dataset.context = this.currentContext;
    }

    /**
     * Get the panel title for the current context
     * @returns {string}
     */
    getPanelTitle() {
        const titles = {
            [AppContext.GAME_ACTIVE]: 'Live Game',
            [AppContext.GAME_ENDED]: 'Game Summary',
            [AppContext.ANALYSIS]: 'Analysis',
            [AppContext.LEARNING]: 'Learning',
            [AppContext.SETTINGS]: 'Settings'
        };
        return titles[this.currentContext] || 'Analysis';
    }

    /**
     * Update navigation state (header buttons, etc.)
     */
    updateNavigationState() {
        // Update header navigation active states
        const navButtons = document.querySelectorAll('.nav-btn, .settings-btn');
        navButtons.forEach(btn => {
            const btnContext = btn.dataset.context;
            if (btnContext === this.currentContext) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    /**
     * Register a context change listener
     * @param {Function} callback - Callback function(newContext, oldContext)
     */
    addListener(callback) {
        this.listeners.push(callback);
    }

    /**
     * Unregister a context change listener
     * @param {Function} callback - The callback to remove
     */
    removeListener(callback) {
        this.listeners = this.listeners.filter(cb => cb !== callback);
    }

    /**
     * Notify all listeners of context change
     * @param {string} newContext
     * @param {string} oldContext
     */
    notifyListeners(newContext, oldContext) {
        this.listeners.forEach(callback => {
            try {
                callback(newContext, oldContext);
            } catch (error) {
                console.error('Error in context listener:', error);
            }
        });
    }

    /**
     * Go back to previous context
     */
    goBack() {
        if (this.previousContext) {
            this.setContext(this.previousContext, true);
        }
    }

    /**
     * Get context-specific features/tools
     * @returns {Array} Array of available features in current context
     */
    getContextFeatures() {
        const features = {
            [AppContext.GAME_ACTIVE]: [
                { id: 'live-eval', label: 'Live Evaluation', available: true },
                { id: 'move-history', label: 'Move History', available: true },
                { id: 'feedback', label: 'Real-time Feedback', available: true },
                { id: 'opening-info', label: 'Opening Info', available: true },
                { id: 'hints', label: 'Get Hint', available: true }
            ],
            [AppContext.GAME_ENDED]: [
                { id: 'game-summary', label: 'Game Summary', available: true },
                { id: 'accuracy-report', label: 'Accuracy Report', available: true },
                { id: 'critical-moments', label: 'Critical Moments', available: true },
                { id: 'review', label: 'Review Game', available: true },
                { id: 'save-game', label: 'Save Game', available: true }
            ],
            [AppContext.ANALYSIS]: [
                { id: 'engine-lines', label: 'Engine Lines', available: true },
                { id: 'best-moves', label: 'Best Moves', available: true },
                { id: 'position-eval', label: 'Position Evaluation', available: true },
                { id: 'opening-db', label: 'Opening Database', available: true },
                { id: 'endgame-tb', label: 'Endgame Tablebase', available: false }
            ],
            [AppContext.LEARNING]: [
                { id: 'progress', label: 'Your Progress', available: true },
                { id: 'lessons', label: 'Lessons', available: true },
                { id: 'puzzles', label: 'Puzzles', available: true },
                { id: 'drills', label: 'Drills', available: true }
            ],
            [AppContext.SETTINGS]: [
                { id: 'engine-settings', label: 'Engine Settings', available: true },
                { id: 'game-settings', label: 'Game Settings', available: true },
                { id: 'visual-settings', label: 'Visual Settings', available: true },
                { id: 'clock-settings', label: 'Clock Settings', available: true }
            ]
        };

        return features[this.currentContext] || [];
    }
}

// Create and export singleton instance
const contextManager = new ContextManager();

// Make available globally
window.contextManager = contextManager;

console.log('Context Manager module loaded');
