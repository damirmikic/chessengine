/**
 * Enhanced Features Initialization
 * Initializes all new enhanced features modules
 */

(function() {
    'use strict';

    /**
     * Initialize all enhanced features
     */
    function initializeEnhancedFeatures() {
        console.log('Initializing enhanced features...');

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
    }

    /**
     * Initialize all modules
     */
    function init() {
        // Initialize core systems first
        initializeContextManager();
        initializeKeyboardShortcuts();

        // Initialize new enhanced features
        initializeWelcomeExperience();
        initializeDailyGoals();
        initializeProgressTracker();
        initializeVisualAnalysis();
        initializeAchievementVisuals();

        // Set up integration hooks
        setupIntegrationHooks();

        console.log('Enhanced features initialized successfully');
    }

    /**
     * Initialize context manager
     */
    function initializeContextManager() {
        if (window.contextManager) {
            window.contextManager.initialize();

            // Add listener for context changes
            window.contextManager.addListener((newContext, oldContext) => {
                console.log(`Context changed: ${oldContext} → ${newContext}`);

                // Update UI based on context
                updateUIForContext(newContext);
            });
        }
    }

    /**
     * Initialize keyboard shortcuts
     */
    function initializeKeyboardShortcuts() {
        if (window.keyboardShortcutsManager) {
            window.keyboardShortcutsManager.initialize();

            // Connect command palette button
            const commandPaletteBtn = document.getElementById('commandPaletteBtn');
            if (commandPaletteBtn) {
                commandPaletteBtn.addEventListener('click', () => {
                    window.keyboardShortcutsManager.toggleCommandPalette();
                });
            }
        }
    }

    /**
     * Initialize welcome experience
     */
    function initializeWelcomeExperience() {
        if (window.welcomeExperience) {
            window.welcomeExperience.initialize();
        }
    }

    /**
     * Initialize daily goals
     */
    function initializeDailyGoals() {
        if (window.dailyGoalsManager) {
            window.dailyGoalsManager.initialize();
            window.dailyGoalsManager.render();
        }
    }

    /**
     * Initialize progress tracker
     */
    function initializeProgressTracker() {
        if (window.progressTracker) {
            window.progressTracker.initialize();

            // Render radar chart
            setTimeout(() => {
                window.progressTracker.renderRadarChart('skillsRadarChart');
                window.progressTracker.renderSkillCards('skillProgressCards');
            }, 100);
        }
    }

    /**
     * Initialize visual analysis
     */
    function initializeVisualAnalysis() {
        if (window.visualAnalysisManager) {
            window.visualAnalysisManager.initialize();
        }
    }

    /**
     * Initialize achievement visuals
     */
    function initializeAchievementVisuals() {
        if (window.achievementVisualsManager) {
            window.achievementVisualsManager.initialize();
        }
    }

    /**
     * Set up integration hooks between modules
     */
    function setupIntegrationHooks() {
        // Hook game end events to update progress
        document.addEventListener('game:ended', (event) => {
            handleGameEnded(event.detail);
        });

        // Hook move events to update visual analysis
        document.addEventListener('move:made', (event) => {
            handleMoveMade(event.detail);
        });

        // Hook achievement unlocks
        document.addEventListener('achievement:unlocked', (event) => {
            handleAchievementUnlocked(event.detail);
        });
    }

    /**
     * Handle game ended event
     */
    function handleGameEnded(gameData) {
        console.log('Game ended, updating systems...');

        // Update daily goals
        if (window.dailyGoalsManager) {
            window.dailyGoalsManager.updateGoal('daily-game');

            // Update accuracy goal if achieved
            if (gameData && gameData.accuracy >= 70) {
                window.dailyGoalsManager.setGoalProgress('daily-accuracy', gameData.accuracy);
            }
        }

        // Update progress tracker
        if (window.progressTracker && gameData) {
            window.progressTracker.updateFromGameAnalysis(gameData);

            // Re-render charts
            setTimeout(() => {
                window.progressTracker.renderRadarChart('skillsRadarChart');
                window.progressTracker.renderSkillCards('skillProgressCards');
            }, 100);
        }
    }

    /**
     * Handle move made event
     */
    function handleMoveMade(moveData) {
        // Update visual analysis if available
        if (window.visualAnalysisManager && moveData) {
            // Update evaluation card if evaluation is available
            if (moveData.evaluation !== undefined) {
                window.visualAnalysisManager.updateEvaluationCard(
                    moveData.evaluation,
                    moveData.depth || 0
                );
            }

            // Analyze position if chess instance is available
            if (window.getChess && moveData.evaluation !== undefined) {
                const chess = window.getChess();
                if (chess) {
                    window.visualAnalysisManager.analyzePosition(
                        chess,
                        typeof moveData.evaluation === 'number' ? moveData.evaluation : 0
                    );
                }
            }
        }
    }

    /**
     * Handle achievement unlocked event
     */
    function handleAchievementUnlocked(achievement) {
        console.log('Achievement unlocked:', achievement);

        if (window.achievementVisualsManager) {
            window.achievementVisualsManager.showAchievementUnlock(achievement);
        }
    }

    /**
     * Update UI based on context
     */
    function updateUIForContext(context) {
        // Update learning context specific features
        if (context === 'learning') {
            // Refresh progress visualizations
            if (window.progressTracker) {
                window.progressTracker.renderRadarChart('skillsRadarChart');
                window.progressTracker.renderSkillCards('skillProgressCards');
            }

            // Refresh daily goals
            if (window.dailyGoalsManager) {
                window.dailyGoalsManager.render();
            }
        }

        // Update analysis context specific features
        if (context === 'analysis') {
            // Ensure visual analysis components are ready
            if (window.visualAnalysisManager) {
                const chess = window.getChess ? window.getChess() : null;
                if (chess) {
                    window.visualAnalysisManager.analyzePosition(chess, 0);
                }
            }
        }
    }

    /**
     * Expose utility functions
     */
    window.enhancedFeatures = {
        refresh: () => {
            initializeDailyGoals();
            initializeProgressTracker();
        },

        resetWelcome: () => {
            if (window.welcomeExperience) {
                window.welcomeExperience.reset();
                window.welcomeExperience.initialize();
            }
        },

        showAchievement: (achievement) => {
            handleAchievementUnlocked(achievement);
        }
    };

    // Start initialization
    initializeEnhancedFeatures();
})();
