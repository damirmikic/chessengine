/**
 * @fileoverview Learning Dashboard UI Module
 * Renders learning features: progress charts, mistake reviews, insights, achievements
 */

import {
    loadLearningData,
    recordGameSession,
    getProgressData,
    getPersonalizedInsights,
    getMistakes,
    markMistakeReviewed,
    getAllAchievements,
    getEarnedAchievements,
    getTrainingExercises,
    getLearningState,
    getGameSessions,
    getAverageRating,
    getTacticalThemes
} from './learning-tracker.js';

/**
 * Dashboard state
 */
const dashboardState = {
    activeTab: 'progress',
    mistakeFilters: {
        type: null,
        theme: null
    },
    onPositionLoad: null
};

/**
 * Initializes the learning dashboard
 * @param {Object} options - Dashboard options
 * @param {Function} [options.onPositionLoad] - Callback to load a position on board
 */
export function initializeLearningDashboard(options = {}) {
    dashboardState.onPositionLoad = options.onPositionLoad || null;
    loadLearningData();
}

/**
 * Shows the learning dashboard modal
 */
export function showLearningDashboard() {
    let modal = document.getElementById('learningDashboardModal');

    if (!modal) {
        modal = createDashboardModal();
        document.body.appendChild(modal);
    }

    renderDashboard();
    modal.style.display = 'flex';
}

/**
 * Hides the learning dashboard
 */
export function hideLearningDashboard() {
    const modal = document.getElementById('learningDashboardModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Creates the dashboard modal structure
 * @returns {HTMLElement} Modal element
 */
function createDashboardModal() {
    const modal = document.createElement('div');
    modal.id = 'learningDashboardModal';
    modal.className = 'learning-modal';

    modal.innerHTML = `
        <div class="learning-modal-content">
            <div class="learning-modal-header">
                <h2>📊 Learning Dashboard</h2>
                <button id="closeLearningDashboard" class="close-btn">&times;</button>
            </div>
            
            <div class="learning-tabs">
                <button class="learning-tab active" data-tab="progress">📈 Progress</button>
                <button class="learning-tab" data-tab="mistakes">📋 Mistakes</button>
                <button class="learning-tab" data-tab="insights">💡 Insights</button>
                <button class="learning-tab" data-tab="training">🎯 Training</button>
                <button class="learning-tab" data-tab="achievements">🏆 Achievements</button>
            </div>
            
            <div class="learning-content">
                <div id="learningTabContent"></div>
            </div>
        </div>
    `;

    // Add event listeners
    modal.querySelector('#closeLearningDashboard').addEventListener('click', hideLearningDashboard);

    modal.querySelectorAll('.learning-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            dashboardState.activeTab = tab.dataset.tab;
            modal.querySelectorAll('.learning-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderTabContent();
        });
    });

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideLearningDashboard();
        }
    });

    return modal;
}

/**
 * Renders the entire dashboard
 */
function renderDashboard() {
    renderTabContent();
}

/**
 * Renders the active tab content
 */
function renderTabContent() {
    const container = document.getElementById('learningTabContent');
    if (!container) return;

    switch (dashboardState.activeTab) {
        case 'progress':
            renderProgressTab(container);
            break;
        case 'mistakes':
            renderMistakesTab(container);
            break;
        case 'insights':
            renderInsightsTab(container);
            break;
        case 'training':
            renderTrainingTab(container);
            break;
        case 'achievements':
            renderAchievementsTab(container);
            break;
    }
}

/**
 * Renders the progress tab
 * @param {HTMLElement} container - Container element
 */
function renderProgressTab(container) {
    const state = getLearningState();
    const progressData = getProgressData(30);

    container.innerHTML = `
        <div class="progress-overview">
            <div class="stat-card">
                <div class="stat-icon">🎮</div>
                <div class="stat-info">
                    <div class="stat-value">${state.totalGames}</div>
                    <div class="stat-label">Games Played</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">📊</div>
                <div class="stat-info">
                    <div class="stat-value">${state.averageRating}</div>
                    <div class="stat-label">Est. Rating</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🔥</div>
                <div class="stat-info">
                    <div class="stat-value">${state.currentStreak} days</div>
                    <div class="stat-label">Current Streak</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🏆</div>
                <div class="stat-info">
                    <div class="stat-value">${state.achievementsCount}</div>
                    <div class="stat-label">Achievements</div>
                </div>
            </div>
        </div>
        
        <div class="progress-section">
            <h3>📈 Accuracy Over Time</h3>
            <div class="chart-container">
                ${renderAccuracyChart(progressData.daily)}
            </div>
        </div>
        
        <div class="progress-section">
            <h3>📊 Rating Progress</h3>
            <div class="chart-container">
                ${renderRatingChart(progressData.daily)}
            </div>
        </div>
        
        <div class="progress-section">
            <h3>🕐 Recent Games</h3>
            <div class="recent-games-list">
                ${renderRecentGames()}
            </div>
        </div>
    `;
}

/**
 * Renders an accuracy chart using CSS bars
 * @param {Array} data - Daily data
 * @returns {string} HTML string
 */
function renderAccuracyChart(data) {
    if (data.length === 0) {
        return '<div class="no-data">Play some games to see your progress!</div>';
    }

    const bars = data.slice(-14).map(day => {
        const height = Math.max(5, day.accuracy);
        const color = day.accuracy >= 80 ? '#4caf50' :
            day.accuracy >= 60 ? '#ff9800' : '#f44336';

        return `
            <div class="chart-bar-container" title="${day.date}: ${day.accuracy.toFixed(1)}%">
                <div class="chart-bar" style="height: ${height}%; background: ${color}"></div>
                <div class="chart-bar-label">${day.date.split('/').slice(0, 2).join('/')}</div>
            </div>
        `;
    }).join('');

    return `
        <div class="bar-chart">
            <div class="chart-y-axis">
                <span>100%</span>
                <span>75%</span>
                <span>50%</span>
                <span>25%</span>
                <span>0%</span>
            </div>
            <div class="chart-bars">${bars}</div>
        </div>
    `;
}

/**
 * Renders a rating chart using CSS
 * @param {Array} data - Daily data
 * @returns {string} HTML string
 */
function renderRatingChart(data) {
    if (data.length === 0) {
        return '<div class="no-data">Play some games to see your rating progress!</div>';
    }

    const maxRating = Math.max(...data.map(d => d.rating), 1600);
    const minRating = Math.min(...data.map(d => d.rating), 400);
    const range = maxRating - minRating || 200;

    const points = data.slice(-14).map((day, i, arr) => {
        const x = (i / (arr.length - 1 || 1)) * 100;
        const y = 100 - ((day.rating - minRating) / range) * 80;
        return `${x}%,${y}%`;
    }).join(' ');

    return `
        <div class="line-chart">
            <div class="chart-y-axis">
                <span>${maxRating}</span>
                <span>${Math.round((maxRating + minRating) / 2)}</span>
                <span>${minRating}</span>
            </div>
            <div class="chart-line-area">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                    <polyline
                        points="${data.slice(-14).map((day, i, arr) => {
        const x = (i / (arr.length - 1 || 1)) * 100;
        const y = 100 - ((day.rating - minRating) / range) * 80 - 10;
        return `${x},${y}`;
    }).join(' ')}"
                        fill="none"
                        stroke="#2196f3"
                        stroke-width="2"
                    />
                </svg>
                <div class="current-rating-badge">${Math.round(data[data.length - 1]?.rating || 0)}</div>
            </div>
        </div>
    `;
}

/**
 * Renders recent games list
 * @returns {string} HTML string
 */
function renderRecentGames() {
    const sessions = getGameSessions(10);

    if (sessions.length === 0) {
        return '<div class="no-data">No games played yet</div>';
    }

    return sessions.map(session => {
        const date = new Date(session.date).toLocaleDateString();
        const accuracy = session.accuracy.toFixed(1);
        const rating = session.estimatedRating;

        let accuracyClass = 'good';
        if (session.accuracy < 60) accuracyClass = 'bad';
        else if (session.accuracy < 75) accuracyClass = 'average';

        return `
            <div class="recent-game-item">
                <div class="game-date">${date}</div>
                <div class="game-stats">
                    <span class="game-moves">${session.totalMoves} moves</span>
                    <span class="game-accuracy ${accuracyClass}">${accuracy}%</span>
                    <span class="game-rating">~${rating}</span>
                </div>
                <div class="game-breakdown">
                    <span class="good-count" title="Good moves">✓${session.goodMoves}</span>
                    <span class="inaccuracy-count" title="Inaccuracies">?!${session.inaccuracies}</span>
                    <span class="mistake-count" title="Mistakes">?${session.mistakes}</span>
                    <span class="blunder-count" title="Blunders">??${session.blunders}</span>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Renders the mistakes tab
 * @param {HTMLElement} container - Container element
 */
function renderMistakesTab(container) {
    const themes = getTacticalThemes();
    const mistakes = getMistakes(dashboardState.mistakeFilters);
    const unreviewedCount = getMistakes({ reviewed: false }).length;

    container.innerHTML = `
        <div class="mistakes-header">
            <h3>📋 Mistake Database</h3>
            <div class="mistakes-summary">
                <span class="unreview-count">${unreviewedCount} unreviewed</span>
            </div>
        </div>
        
        <div class="mistakes-filters">
            <select id="mistakeTypeFilter" class="filter-select">
                <option value="">All Types</option>
                <option value="inaccuracy" ${dashboardState.mistakeFilters.type === 'inaccuracy' ? 'selected' : ''}>Inaccuracies</option>
                <option value="mistake" ${dashboardState.mistakeFilters.type === 'mistake' ? 'selected' : ''}>Mistakes</option>
                <option value="blunder" ${dashboardState.mistakeFilters.type === 'blunder' ? 'selected' : ''}>Blunders</option>
            </select>
            <select id="mistakeThemeFilter" class="filter-select">
                <option value="">All Themes</option>
                ${Object.entries(themes).map(([key, value]) =>
        `<option value="${value}" ${dashboardState.mistakeFilters.theme === value ? 'selected' : ''}>${value}</option>`
    ).join('')}
            </select>
        </div>
        
        <div class="mistakes-list">
            ${renderMistakesList(mistakes)}
        </div>
    `;

    // Add filter listeners
    container.querySelector('#mistakeTypeFilter').addEventListener('change', (e) => {
        dashboardState.mistakeFilters.type = e.target.value || null;
        renderTabContent();
    });

    container.querySelector('#mistakeThemeFilter').addEventListener('change', (e) => {
        dashboardState.mistakeFilters.theme = e.target.value || null;
        renderTabContent();
    });
}

/**
 * Renders the mistakes list
 * @param {Array} mistakes - Mistakes array
 * @returns {string} HTML string
 */
function renderMistakesList(mistakes) {
    if (mistakes.length === 0) {
        return '<div class="no-data">No mistakes matching filters</div>';
    }

    return mistakes.slice(0, 50).map(mistake => {
        const date = new Date(mistake.date).toLocaleDateString();
        const typeClass = mistake.type;
        const reviewedClass = mistake.reviewed ? 'reviewed' : '';

        return `
            <div class="mistake-item ${typeClass} ${reviewedClass}" data-id="${mistake.id}">
                <div class="mistake-header">
                    <span class="mistake-type">${mistake.type.toUpperCase()}</span>
                    <span class="mistake-date">${date}</span>
                    ${mistake.reviewed ? '<span class="reviewed-badge">✓ Reviewed</span>' : ''}
                </div>
                <div class="mistake-body">
                    <div class="mistake-move">
                        <span class="move-number">Move ${mistake.moveNumber || '?'}:</span>
                        <span class="player-move">${mistake.playerMove}</span>
                        <span class="eval-loss">(-${mistake.evalLoss.toFixed(2)})</span>
                    </div>
                    ${mistake.bestMove ? `<div class="best-move">Better: <strong>${mistake.bestMove}</strong></div>` : ''}
                    <div class="mistake-theme">${mistake.theme}</div>
                </div>
                <div class="mistake-actions">
                    <button class="review-btn" data-id="${mistake.id}" ${mistake.reviewed ? 'disabled' : ''}>
                        ${mistake.reviewed ? 'Reviewed' : 'Mark Reviewed'}
                    </button>
                    ${mistake.fen ? `<button class="load-position-btn" data-fen="${mistake.fen}">Load Position</button>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Renders the insights tab
 * @param {HTMLElement} container - Container element
 */
function renderInsightsTab(container) {
    const insights = getPersonalizedInsights();

    container.innerHTML = `
        <div class="insights-header">
            <h3>💡 Personalized Insights</h3>
        </div>
        
        <div class="insights-section">
            <h4>📊 Accuracy Trend</h4>
            <div class="trend-indicator ${insights.accuracyTrend >= 0 ? 'positive' : 'negative'}">
                ${insights.accuracyTrend >= 0 ? '📈' : '📉'}
                ${insights.accuracyTrend >= 0 ? '+' : ''}${insights.accuracyTrend}% 
                <span class="trend-label">vs last 10 games</span>
            </div>
        </div>
        
        <div class="insights-section">
            <h4>🎯 Your Weaknesses</h4>
            <div class="weakness-list">
                ${insights.weaknesses.length > 0 ? insights.weaknesses.map((w, i) => `
                    <div class="weakness-item">
                        <span class="weakness-rank">#${i + 1}</span>
                        <span class="weakness-theme">${w.theme}</span>
                        <span class="weakness-count">${w.count} mistakes</span>
                    </div>
                `).join('') : '<div class="no-data">Play more games to identify weaknesses</div>'}
            </div>
        </div>
        
        <div class="insights-section">
            <h4>🔥 Recent Patterns</h4>
            <div class="recent-patterns">
                ${insights.recentWeaknesses.length > 0 ? insights.recentWeaknesses.map(w => `
                    <div class="pattern-badge">${w.theme} (${w.count})</div>
                `).join('') : '<div class="no-data">Recent patterns will appear as you play</div>'}
            </div>
        </div>
        
        <div class="insights-section">
            <h4>📚 Recommendations</h4>
            <div class="recommendations-list">
                ${insights.recommendations.map(rec => `
                    <div class="recommendation-item">
                        <span class="rec-icon">${rec.icon}</span>
                        <div class="rec-content">
                            <div class="rec-title">${rec.title}</div>
                            <div class="rec-description">${rec.description}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="insights-stats">
            <div class="insight-stat">
                <span class="insight-stat-value">${insights.totalMistakes}</span>
                <span class="insight-stat-label">Total Mistakes</span>
            </div>
            <div class="insight-stat">
                <span class="insight-stat-value">${insights.reviewedMistakes}</span>
                <span class="insight-stat-label">Reviewed</span>
            </div>
            <div class="insight-stat">
                <span class="insight-stat-value">${Math.round((insights.reviewedMistakes / (insights.totalMistakes || 1)) * 100)}%</span>
                <span class="insight-stat-label">Review Rate</span>
            </div>
        </div>
    `;
}

/**
 * Renders the training tab
 * @param {HTMLElement} container - Container element
 */
function renderTrainingTab(container) {
    const exercises = getTrainingExercises();

    container.innerHTML = `
        <div class="training-header">
            <h3>🎯 Training Mode</h3>
            <p class="training-intro">Practice positions where you've made mistakes to improve your weak areas.</p>
        </div>
        
        <div class="training-exercises">
            ${exercises.length > 0 ? exercises.map(exercise => `
                <div class="exercise-card">
                    <div class="exercise-header">
                        <span class="exercise-theme">${exercise.theme}</span>
                        <span class="exercise-count">${exercise.positions.length} positions</span>
                    </div>
                    <div class="exercise-description">${exercise.description}</div>
                    <div class="exercise-positions">
                        ${exercise.positions.map((pos, i) => `
                            <div class="position-item" data-fen="${pos.fen}">
                                <span class="position-number">#${i + 1}</span>
                                <span class="position-move">You played: ${pos.yourMove}</span>
                                <span class="position-loss">-${pos.evalLoss.toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('') : `
                <div class="no-exercises">
                    <div class="no-exercises-icon">🎓</div>
                    <h4>No Training Exercises Yet</h4>
                    <p>Play some games and make mistakes to generate personalized training exercises!</p>
                </div>
            `}
        </div>
    `;

    // Add position load listeners
    container.querySelectorAll('.position-item').forEach(item => {
        item.addEventListener('click', () => {
            const fen = item.dataset.fen;
            if (fen && dashboardState.onPositionLoad) {
                dashboardState.onPositionLoad(fen);
                hideLearningDashboard();
            }
        });
    });
}

/**
 * Renders the achievements tab
 * @param {HTMLElement} container - Container element
 */
function renderAchievementsTab(container) {
    const achievements = getAllAchievements();
    const earnedCount = achievements.filter(a => a.earned).length;

    // Group by category
    const categories = {
        games: achievements.filter(a => a.type === 'games'),
        accuracy: achievements.filter(a => a.type === 'accuracy' || a.type === 'no_blunders' || a.type === 'no_mistakes'),
        rating: achievements.filter(a => a.type === 'rating'),
        other: achievements.filter(a => a.type === 'streak' || a.type === 'reviewed')
    };

    container.innerHTML = `
        <div class="achievements-header">
            <h3>🏆 Achievements</h3>
            <div class="achievements-progress">
                <span class="earned-count">${earnedCount} / ${achievements.length}</span>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(earnedCount / achievements.length) * 100}%"></div>
                </div>
            </div>
        </div>
        
        <div class="achievements-categories">
            ${Object.entries(categories).map(([category, achs]) => `
                <div class="achievement-category">
                    <h4 class="category-title">${getCategoryTitle(category)}</h4>
                    <div class="achievement-grid">
                        ${achs.map(achievement => `
                            <div class="achievement-card ${achievement.earned ? 'earned' : 'locked'}">
                                <div class="achievement-icon">${achievement.icon}</div>
                                <div class="achievement-info">
                                    <div class="achievement-name">${achievement.name}</div>
                                    <div class="achievement-desc">${achievement.description}</div>
                                    ${!achievement.earned ? `
                                        <div class="achievement-progress">
                                            <div class="progress-bar small">
                                                <div class="progress-fill" style="width: ${achievement.progress}%"></div>
                                            </div>
                                            <span class="progress-text">${achievement.progress}%</span>
                                        </div>
                                    ` : `
                                        <div class="earned-date">Earned: ${new Date(achievement.earnedDate).toLocaleDateString()}</div>
                                    `}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

/**
 * Gets category display title
 * @param {string} category - Category key
 * @returns {string} Display title
 */
function getCategoryTitle(category) {
    const titles = {
        games: '🎮 Games Milestones',
        accuracy: '🎯 Accuracy & Quality',
        rating: '📈 Rating Goals',
        other: '⭐ Special Achievements'
    };
    return titles[category] || category;
}

/**
 * Shows a new achievement notification
 * @param {Object} achievement - Achievement object
 */
export function showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-notification-content">
            <div class="notification-icon">${achievement.icon}</div>
            <div class="notification-text">
                <div class="notification-title">Achievement Unlocked!</div>
                <div class="notification-name">${achievement.name}</div>
                <div class="notification-desc">${achievement.description}</div>
            </div>
        </div>
    `;

    document.body.appendChild(notification);

    // Animate in
    requestAnimationFrame(() => {
        notification.classList.add('show');
    });

    // Remove after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    }, 4000);
}

/**
 * Records a game and shows any new achievements
 * @param {Array} moves - Game moves
 */
export function recordAndNotify(moves) {
    const result = recordGameSession(moves);

    if (result && result.newAchievements) {
        result.newAchievements.forEach((achievement, index) => {
            setTimeout(() => {
                showAchievementNotification(achievement);
            }, index * 1500);
        });
    }

    return result;
}
