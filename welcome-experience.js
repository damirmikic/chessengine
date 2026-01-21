/**
 * Welcome Experience Module
 * Provides onboarding for first-time users with skill assessment and goal setting
 */

const WELCOME_STORAGE_KEY = 'chess_coach_welcome_completed';
const USER_PROFILE_KEY = 'chess_coach_user_profile';

class WelcomeExperience {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 3;
        this.userProfile = {
            skillLevel: null,
            goals: [],
            completedWelcome: false,
            startDate: null
        };
    }

    /**
     * Initialize the welcome experience
     */
    initialize() {
        // Check if user has already completed welcome
        const hasCompleted = localStorage.getItem(WELCOME_STORAGE_KEY);

        if (!hasCompleted) {
            this.showWelcome();
        } else {
            this.loadUserProfile();
        }

        console.log('Welcome Experience initialized');
    }

    /**
     * Load user profile from storage
     */
    loadUserProfile() {
        const stored = localStorage.getItem(USER_PROFILE_KEY);
        if (stored) {
            this.userProfile = JSON.parse(stored);
        }
    }

    /**
     * Save user profile to storage
     */
    saveUserProfile() {
        localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(this.userProfile));
    }

    /**
     * Show the welcome modal
     */
    showWelcome() {
        this.createWelcomeModal();
        this.showStep1();
    }

    /**
     * Create the welcome modal UI
     */
    createWelcomeModal() {
        const modal = document.createElement('div');
        modal.id = 'welcomeModal';
        modal.className = 'welcome-modal';
        modal.innerHTML = `
            <div class="welcome-backdrop"></div>
            <div class="welcome-container">
                <div class="welcome-header">
                    <h2 class="welcome-title">Welcome to AI Chess Coach! 🎉</h2>
                    <div class="welcome-progress">
                        <div class="progress-indicator">
                            <span class="progress-step active" data-step="1">1</span>
                            <div class="progress-line"></div>
                            <span class="progress-step" data-step="2">2</span>
                            <div class="progress-line"></div>
                            <span class="progress-step" data-step="3">3</span>
                        </div>
                        <div class="progress-text">Step <span id="currentStepNum">1</span> of 3</div>
                    </div>
                </div>
                <div class="welcome-content" id="welcomeContent">
                    <!-- Content will be inserted here -->
                </div>
                <div class="welcome-footer" id="welcomeFooter">
                    <!-- Action buttons will be inserted here -->
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.modal = modal;
    }

    /**
     * Update progress indicators
     */
    updateProgress() {
        const progressSteps = this.modal.querySelectorAll('.progress-step');
        progressSteps.forEach((step, index) => {
            if (index + 1 <= this.currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        const stepNum = this.modal.querySelector('#currentStepNum');
        if (stepNum) stepNum.textContent = this.currentStep;
    }

    /**
     * Step 1: Choose experience level
     */
    showStep1() {
        this.currentStep = 1;
        this.updateProgress();

        const content = this.modal.querySelector('#welcomeContent');
        const footer = this.modal.querySelector('#welcomeFooter');

        content.innerHTML = `
            <div class="welcome-step step-1">
                <h3>Choose your experience level</h3>
                <p class="step-description">This helps us tailor the coaching to your needs</p>

                <div class="skill-levels">
                    <div class="skill-level-card" data-level="beginner">
                        <div class="skill-icon">🌱</div>
                        <div class="skill-name">Beginner</div>
                        <div class="skill-description">Never played or just learning the rules</div>
                    </div>

                    <div class="skill-level-card" data-level="casual">
                        <div class="skill-icon">🎮</div>
                        <div class="skill-name">Casual</div>
                        <div class="skill-description">Know the basics, play occasionally</div>
                    </div>

                    <div class="skill-level-card" data-level="intermediate">
                        <div class="skill-icon">📈</div>
                        <div class="skill-name">Intermediate</div>
                        <div class="skill-description">Play regularly, understand tactics</div>
                    </div>

                    <div class="skill-level-card" data-level="advanced">
                        <div class="skill-icon">🏆</div>
                        <div class="skill-name">Advanced</div>
                        <div class="skill-description">Tournament player, serious about improvement</div>
                    </div>
                </div>
            </div>
        `;

        // Clear footer for step 1 (no buttons needed)
        footer.innerHTML = '';

        // Add click handlers
        const cards = content.querySelectorAll('.skill-level-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const level = card.dataset.level;
                this.userProfile.skillLevel = level;
                this.showStep2();
            });
        });
    }

    /**
     * Step 2: Choose improvement goals
     */
    showStep2() {
        this.currentStep = 2;
        this.updateProgress();

        const content = this.modal.querySelector('#welcomeContent');
        const footer = this.modal.querySelector('#welcomeFooter');

        content.innerHTML = `
            <div class="welcome-step step-2">
                <h3>What do you want to improve?</h3>
                <p class="step-description">Select all that apply (you can change these later)</p>

                <div class="goals-list">
                    <label class="goal-checkbox">
                        <input type="checkbox" value="openings" data-goal="openings">
                        <div class="goal-card">
                            <span class="goal-icon">📚</span>
                            <span class="goal-label">Opening Repertoire</span>
                        </div>
                    </label>

                    <label class="goal-checkbox">
                        <input type="checkbox" value="tactics" data-goal="tactics">
                        <div class="goal-card">
                            <span class="goal-icon">⚡</span>
                            <span class="goal-label">Tactical Vision</span>
                        </div>
                    </label>

                    <label class="goal-checkbox">
                        <input type="checkbox" value="endgames" data-goal="endgames">
                        <div class="goal-card">
                            <span class="goal-icon">♔</span>
                            <span class="goal-label">Endgame Technique</span>
                        </div>
                    </label>

                    <label class="goal-checkbox">
                        <input type="checkbox" value="positional" data-goal="positional">
                        <div class="goal-card">
                            <span class="goal-icon">🎯</span>
                            <span class="goal-label">Positional Understanding</span>
                        </div>
                    </label>

                    <label class="goal-checkbox">
                        <input type="checkbox" value="time" data-goal="time">
                        <div class="goal-card">
                            <span class="goal-icon">⏱️</span>
                            <span class="goal-label">Time Management</span>
                        </div>
                    </label>
                </div>
            </div>
        `;

        footer.innerHTML = `
            <div class="step-actions">
                <button class="btn-secondary" id="backToStep1">← Back</button>
                <button class="btn-primary" id="continueToStep3">Continue →</button>
            </div>
        `;

        // Add event handlers
        document.getElementById('backToStep1').addEventListener('click', () => this.showStep1());
        document.getElementById('continueToStep3').addEventListener('click', () => {
            const selected = Array.from(content.querySelectorAll('input[type="checkbox"]:checked'))
                .map(cb => cb.value);
            this.userProfile.goals = selected;
            this.showStep3();
        });
    }

    /**
     * Step 3: Interactive tutorial
     */
    showStep3() {
        this.currentStep = 3;
        this.updateProgress();

        const content = this.modal.querySelector('#welcomeContent');
        const footer = this.modal.querySelector('#welcomeFooter');

        content.innerHTML = `
            <div class="welcome-step step-3">
                <h3>Quick Tour 🚀</h3>
                <p class="step-description">Here's how to get the most out of AI Chess Coach</p>

                <div class="feature-highlights">
                    <div class="feature-highlight">
                        <div class="feature-icon">🎮</div>
                        <div class="feature-content">
                            <h4>Play & Learn</h4>
                            <p>Get real-time feedback as you play. The AI will pause and explain mistakes.</p>
                        </div>
                    </div>

                    <div class="feature-highlight">
                        <div class="feature-icon">📊</div>
                        <div class="feature-content">
                            <h4>Track Progress</h4>
                            <p>Monitor your accuracy, identify patterns in your mistakes, and watch yourself improve.</p>
                        </div>
                    </div>

                    <div class="feature-highlight">
                        <div class="feature-icon">🔍</div>
                        <div class="feature-content">
                            <h4>Deep Analysis</h4>
                            <p>Review your games move-by-move and understand critical moments.</p>
                        </div>
                    </div>

                    <div class="feature-highlight">
                        <div class="feature-icon">📚</div>
                        <div class="feature-content">
                            <h4>Structured Learning</h4>
                            <p>Practice openings, endgames, and tactics with guided training.</p>
                        </div>
                    </div>
                </div>

                <div class="keyboard-shortcuts-preview">
                    <h4>Quick Shortcuts</h4>
                    <div class="shortcuts-grid">
                        <div class="shortcut-item">
                            <kbd>N</kbd>
                            <span>New Game</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>A</kbd>
                            <span>Analyze</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>U</kbd>
                            <span>Undo</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>⌘K</kbd>
                            <span>Command Palette</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        footer.innerHTML = `
            <div class="step-actions">
                <button class="btn-secondary" id="backToStep2">← Back</button>
                <button class="btn-primary btn-large" id="finishWelcome">Let's Play! 🎉</button>
            </div>
        `;

        // Add event handlers
        document.getElementById('backToStep2').addEventListener('click', () => this.showStep2());
        document.getElementById('finishWelcome').addEventListener('click', () => this.finishWelcome());
    }

    /**
     * Finish welcome and save profile
     */
    finishWelcome() {
        this.userProfile.completedWelcome = true;
        this.userProfile.startDate = new Date().toISOString();

        this.saveUserProfile();
        localStorage.setItem(WELCOME_STORAGE_KEY, 'true');

        // Show completion animation
        const content = this.modal.querySelector('#welcomeContent');
        content.innerHTML = `
            <div class="welcome-complete">
                <div class="completion-icon">✨</div>
                <h3>You're all set!</h3>
                <p>Let's start your chess journey together.</p>
            </div>
        `;

        // Close modal after animation
        setTimeout(() => {
            this.closeWelcome();

            // Initialize daily goals based on user profile
            if (window.dailyGoalsManager) {
                window.dailyGoalsManager.initializeForUser(this.userProfile);
            }
        }, 2000);
    }

    /**
     * Close the welcome modal
     */
    closeWelcome() {
        if (this.modal) {
            this.modal.classList.add('fade-out');
            setTimeout(() => {
                this.modal.remove();
            }, 300);
        }
    }

    /**
     * Get user profile
     */
    getUserProfile() {
        return this.userProfile;
    }

    /**
     * Reset welcome (for testing)
     */
    reset() {
        localStorage.removeItem(WELCOME_STORAGE_KEY);
        localStorage.removeItem(USER_PROFILE_KEY);
        this.userProfile = {
            skillLevel: null,
            goals: [],
            completedWelcome: false,
            startDate: null
        };
    }
}

// Create and export singleton instance
const welcomeExperience = new WelcomeExperience();
window.welcomeExperience = welcomeExperience;

console.log('Welcome Experience module loaded');
