/**
 * Achievement Visuals Module
 * Enhanced visual display for achievements and badges
 */

class AchievementVisualsManager {
    constructor() {
        this.animationDuration = 2000;
    }

    /**
     * Initialize achievement visuals
     */
    initialize() {
        console.log('Achievement Visuals Manager initialized');
    }

    /**
     * Show achievement unlock animation
     */
    showAchievementUnlock(achievement) {
        const modal = document.createElement('div');
        modal.className = 'achievement-unlock-modal';
        modal.innerHTML = `
            <div class="achievement-unlock-backdrop"></div>
            <div class="achievement-unlock-container">
                <div class="achievement-unlock-glow"></div>
                <div class="achievement-badge-large">
                    <div class="badge-shine"></div>
                    <div class="badge-icon">${achievement.icon}</div>
                </div>
                <h2 class="achievement-title">Achievement Unlocked!</h2>
                <h3 class="achievement-name">${achievement.name}</h3>
                <p class="achievement-description">${achievement.description}</p>
                <div class="achievement-confetti"></div>
            </div>
        `;

        document.body.appendChild(modal);

        // Trigger animation
        setTimeout(() => {
            modal.classList.add('show');
        }, 100);

        // Auto-close
        setTimeout(() => {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }, this.animationDuration);

        // Create confetti
        this.createConfetti(modal.querySelector('.achievement-confetti'));
    }

    /**
     * Create confetti animation
     */
    createConfetti(container) {
        const colors = ['#6366f1', '#a855f7', '#10b981', '#f59e0b', '#ef4444'];
        const confettiCount = 50;

        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            confetti.style.animationDuration = (Math.random() * 2 + 1) + 's';
            container.appendChild(confetti);
        }
    }

    /**
     * Render achievement badge
     */
    renderAchievementBadge(achievement, unlocked = false) {
        const badge = document.createElement('div');
        badge.className = `achievement-badge ${unlocked ? 'unlocked' : 'locked'}`;
        badge.innerHTML = `
            <div class="badge-container">
                <div class="badge-icon-wrapper">
                    ${unlocked ? '' : '<div class="badge-lock">🔒</div>'}
                    <div class="badge-icon ${unlocked ? '' : 'grayscale'}">${achievement.icon}</div>
                </div>
                <div class="badge-info">
                    <div class="badge-name">${achievement.name}</div>
                    <div class="badge-description">${achievement.description}</div>
                    ${achievement.progress !== undefined ? `
                        <div class="badge-progress">
                            <div class="badge-progress-bar">
                                <div class="badge-progress-fill" style="width: ${achievement.progress}%"></div>
                            </div>
                            <div class="badge-progress-text">${achievement.current}/${achievement.target}</div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        return badge;
    }

    /**
     * Render achievements grid
     */
    renderAchievementsGrid(achievements, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';

        achievements.forEach(achievement => {
            const badge = this.renderAchievementBadge(achievement, achievement.unlocked);
            container.appendChild(badge);
        });
    }

    /**
     * Update achievement progress
     */
    updateAchievementProgress(achievementId, current, target) {
        const badge = document.querySelector(`[data-achievement-id="${achievementId}"]`);
        if (!badge) return;

        const progress = (current / target) * 100;
        const progressBar = badge.querySelector('.badge-progress-fill');
        const progressText = badge.querySelector('.badge-progress-text');

        if (progressBar) {
            progressBar.style.width = progress + '%';
        }

        if (progressText) {
            progressText.textContent = `${current}/${target}`;
        }
    }

    /**
     * Show toast notification for achievement progress
     */
    showProgressToast(message) {
        const toast = document.createElement('div');
        toast.className = 'achievement-toast';
        toast.innerHTML = `
            <div class="toast-icon">🏆</div>
            <div class="toast-message">${message}</div>
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    /**
     * Render achievement showcase
     */
    renderAchievementShowcase(recentAchievements, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (recentAchievements.length === 0) {
            container.innerHTML = `
                <div class="showcase-empty">
                    <div class="showcase-empty-icon">🏆</div>
                    <p>Complete games to unlock achievements!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="achievement-showcase-header">
                <h4>🏆 Recent Achievements</h4>
            </div>
            <div class="achievement-showcase-grid">
                ${recentAchievements.map(achievement => `
                    <div class="showcase-badge">
                        <div class="showcase-badge-icon">${achievement.icon}</div>
                        <div class="showcase-badge-name">${achievement.name}</div>
                        <div class="showcase-badge-date">${this.formatDate(achievement.unlockedDate)}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Format date for display
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    }

    /**
     * Create achievement card with animation
     */
    createAnimatedAchievementCard(achievement) {
        const card = document.createElement('div');
        card.className = 'animated-achievement-card';
        card.innerHTML = `
            <div class="achievement-card-glow"></div>
            <div class="achievement-card-content">
                <div class="achievement-card-icon">${achievement.icon}</div>
                <h4 class="achievement-card-name">${achievement.name}</h4>
                <p class="achievement-card-description">${achievement.description}</p>
            </div>
        `;

        return card;
    }
}

// Create and export singleton instance
const achievementVisualsManager = new AchievementVisualsManager();
window.achievementVisualsManager = achievementVisualsManager;

console.log('Achievement Visuals Manager module loaded');
