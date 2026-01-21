/**
 * Daily Goals Widget Module
 * Tracks daily chess goals and maintains streaks
 */

const DAILY_GOALS_KEY = 'chess_coach_daily_goals';
const STREAK_KEY = 'chess_coach_streak_data';

class DailyGoalsManager {
    constructor() {
        this.goals = [];
        this.streakData = {
            current: 0,
            longest: 0,
            lastActiveDate: null
        };
        this.todayGoals = [];
    }

    /**
     * Initialize daily goals manager
     */
    initialize() {
        this.loadGoals();
        this.loadStreak();
        this.checkAndResetDaily();
        this.setupEventListeners();
        console.log('Daily Goals Manager initialized');
    }

    /**
     * Initialize goals for a user based on their profile
     */
    initializeForUser(userProfile) {
        const goals = [];

        // Everyone gets: Play a game
        goals.push({
            id: 'daily-game',
            type: 'game',
            label: 'Play 1 game',
            target: 1,
            current: 0,
            icon: '🎮'
        });

        // Based on user goals
        if (userProfile.goals.includes('tactics')) {
            goals.push({
                id: 'daily-puzzles',
                type: 'puzzles',
                label: 'Solve 3 puzzles',
                target: 3,
                current: 0,
                icon: '⚡'
            });
        }

        if (userProfile.goals.includes('openings')) {
            goals.push({
                id: 'daily-opening',
                type: 'opening',
                label: 'Learn 1 opening',
                target: 1,
                current: 0,
                icon: '📚'
            });
        }

        if (userProfile.goals.includes('endgames')) {
            goals.push({
                id: 'daily-endgame',
                type: 'endgame',
                label: 'Practice 1 endgame',
                target: 1,
                current: 0,
                icon: '♔'
            });
        }

        // If less than 3 goals, add accuracy goal
        if (goals.length < 3) {
            goals.push({
                id: 'daily-accuracy',
                type: 'accuracy',
                label: 'Achieve 70% accuracy',
                target: 70,
                current: 0,
                icon: '🎯'
            });
        }

        this.todayGoals = goals;
        this.saveGoals();
        this.render();
    }

    /**
     * Load goals from storage
     */
    loadGoals() {
        const stored = localStorage.getItem(DAILY_GOALS_KEY);
        if (stored) {
            const data = JSON.parse(stored);
            if (data.date === this.getTodayKey()) {
                this.todayGoals = data.goals;
            }
        }

        // If no goals, set defaults
        if (this.todayGoals.length === 0) {
            this.setDefaultGoals();
        }
    }

    /**
     * Set default goals
     */
    setDefaultGoals() {
        this.todayGoals = [
            {
                id: 'daily-game',
                type: 'game',
                label: 'Play 1 game',
                target: 1,
                current: 0,
                icon: '🎮'
            },
            {
                id: 'daily-puzzles',
                type: 'puzzles',
                label: 'Solve 3 puzzles',
                target: 3,
                current: 0,
                icon: '⚡'
            },
            {
                id: 'daily-opening',
                type: 'opening',
                label: 'Learn 1 opening',
                target: 1,
                current: 0,
                icon: '📚'
            }
        ];
        this.saveGoals();
    }

    /**
     * Save goals to storage
     */
    saveGoals() {
        const data = {
            date: this.getTodayKey(),
            goals: this.todayGoals
        };
        localStorage.setItem(DAILY_GOALS_KEY, JSON.stringify(data));
    }

    /**
     * Load streak data
     */
    loadStreak() {
        const stored = localStorage.getItem(STREAK_KEY);
        if (stored) {
            this.streakData = JSON.parse(stored);
        }
    }

    /**
     * Save streak data
     */
    saveStreak() {
        localStorage.setItem(STREAK_KEY, JSON.stringify(this.streakData));
    }

    /**
     * Get today's key (YYYY-MM-DD)
     */
    getTodayKey() {
        return new Date().toISOString().split('T')[0];
    }

    /**
     * Check if we need to reset daily goals
     */
    checkAndResetDaily() {
        const stored = localStorage.getItem(DAILY_GOALS_KEY);
        if (stored) {
            const data = JSON.parse(stored);
            if (data.date !== this.getTodayKey()) {
                // New day - check if goals were completed yesterday
                this.checkYesterdayCompletion(data);
                // Reset goals
                this.todayGoals = this.todayGoals.map(goal => ({
                    ...goal,
                    current: 0
                }));
                this.saveGoals();
            }
        }
    }

    /**
     * Check if yesterday's goals were completed
     */
    checkYesterdayCompletion(yesterdayData) {
        const allCompleted = yesterdayData.goals.every(goal => goal.current >= goal.target);

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayKey = yesterday.toISOString().split('T')[0];

        const lastActive = this.streakData.lastActiveDate;

        if (allCompleted) {
            // Goals completed yesterday
            if (lastActive === yesterdayKey || lastActive === this.getTodayKey()) {
                // Continue streak (already counted or counting today)
            } else {
                // Check if consecutive
                const lastDate = new Date(lastActive || yesterdayKey);
                const daysDiff = Math.floor((yesterday - lastDate) / (1000 * 60 * 60 * 24));

                if (daysDiff === 1) {
                    this.streakData.current++;
                } else {
                    this.streakData.current = 1;
                }
            }

            if (this.streakData.current > this.streakData.longest) {
                this.streakData.longest = this.streakData.current;
            }

            this.streakData.lastActiveDate = yesterdayKey;
            this.saveStreak();
        } else {
            // Goals not completed - check if streak broken
            if (lastActive && lastActive !== yesterdayKey && lastActive !== this.getTodayKey()) {
                const lastDate = new Date(lastActive);
                const daysDiff = Math.floor((yesterday - lastDate) / (1000 * 60 * 60 * 24));

                if (daysDiff > 1) {
                    // Streak broken
                    this.streakData.current = 0;
                    this.saveStreak();
                }
            }
        }
    }

    /**
     * Update goal progress
     */
    updateGoal(goalId, increment = 1) {
        const goal = this.todayGoals.find(g => g.id === goalId);
        if (goal) {
            goal.current = Math.min(goal.current + increment, goal.target);
            this.saveGoals();
            this.render();

            // Check if all goals completed
            this.checkAllGoalsCompleted();
        }
    }

    /**
     * Set goal progress directly
     */
    setGoalProgress(goalId, value) {
        const goal = this.todayGoals.find(g => g.id === goalId);
        if (goal) {
            goal.current = Math.min(value, goal.target);
            this.saveGoals();
            this.render();
            this.checkAllGoalsCompleted();
        }
    }

    /**
     * Check if all goals are completed
     */
    checkAllGoalsCompleted() {
        const allCompleted = this.todayGoals.every(goal => goal.current >= goal.target);

        if (allCompleted && this.streakData.lastActiveDate !== this.getTodayKey()) {
            // All goals completed for the first time today
            this.streakData.current++;
            if (this.streakData.current > this.streakData.longest) {
                this.streakData.longest = this.streakData.current;
            }
            this.streakData.lastActiveDate = this.getTodayKey();
            this.saveStreak();

            // Show celebration
            this.showCompletionCelebration();
        }
    }

    /**
     * Show celebration when all goals completed
     */
    showCompletionCelebration() {
        const celebration = document.createElement('div');
        celebration.className = 'goals-celebration';
        celebration.innerHTML = `
            <div class="celebration-content">
                <div class="celebration-icon">🎉</div>
                <h3>Daily Goals Complete!</h3>
                <p>Streak: ${this.streakData.current} day${this.streakData.current !== 1 ? 's' : ''}!</p>
            </div>
        `;

        document.body.appendChild(celebration);

        setTimeout(() => {
            celebration.classList.add('show');
        }, 100);

        setTimeout(() => {
            celebration.classList.remove('show');
            setTimeout(() => celebration.remove(), 300);
        }, 3000);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for game completion
        document.addEventListener('game:ended', () => {
            this.updateGoal('daily-game');
        });

        // Listen for puzzle completion (if implemented)
        document.addEventListener('puzzle:solved', () => {
            this.updateGoal('daily-puzzles');
        });

        // Listen for opening training
        document.addEventListener('opening:learned', () => {
            this.updateGoal('daily-opening');
        });

        // Listen for endgame training
        document.addEventListener('endgame:practiced', () => {
            this.updateGoal('daily-endgame');
        });
    }

    /**
     * Render the daily goals widget
     */
    render() {
        const container = document.getElementById('dailyGoalsWidget');
        if (!container) return;

        const completedCount = this.todayGoals.filter(g => g.current >= g.target).length;
        const totalCount = this.todayGoals.length;

        container.innerHTML = `
            <div class="daily-goals-header">
                <h4>Today's Goals</h4>
                <div class="goals-progress-summary">${completedCount}/${totalCount}</div>
            </div>

            <div class="daily-goals-list">
                ${this.todayGoals.map(goal => this.renderGoal(goal)).join('')}
            </div>

            <div class="streak-display">
                <div class="streak-icon">🔥</div>
                <div class="streak-info">
                    <div class="streak-label">Streak</div>
                    <div class="streak-value">${this.streakData.current} day${this.streakData.current !== 1 ? 's' : ''}</div>
                </div>
                ${this.streakData.longest > this.streakData.current ?
                    `<div class="streak-best">Best: ${this.streakData.longest}</div>` : ''}
            </div>
        `;
    }

    /**
     * Render a single goal
     */
    renderGoal(goal) {
        const isCompleted = goal.current >= goal.target;
        const progress = (goal.current / goal.target) * 100;

        return `
            <div class="daily-goal-item ${isCompleted ? 'completed' : ''}">
                <div class="goal-checkbox">
                    ${isCompleted ? '✅' : '⬜'}
                </div>
                <div class="goal-content">
                    <div class="goal-label">
                        <span class="goal-icon">${goal.icon}</span>
                        <span class="goal-text">${goal.label}</span>
                    </div>
                    <div class="goal-progress-bar">
                        <div class="goal-progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <div class="goal-progress-text">${goal.current}/${goal.target}</div>
                </div>
            </div>
        `;
    }

    /**
     * Get current streak
     */
    getCurrentStreak() {
        return this.streakData.current;
    }

    /**
     * Get longest streak
     */
    getLongestStreak() {
        return this.streakData.longest;
    }

    /**
     * Get today's goals
     */
    getTodayGoals() {
        return this.todayGoals;
    }
}

// Create and export singleton instance
const dailyGoalsManager = new DailyGoalsManager();
window.dailyGoalsManager = dailyGoalsManager;

console.log('Daily Goals Manager module loaded');
