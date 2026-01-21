/**
 * Progress Tracker Module
 * Tracks player skills with radar chart visualization
 */

class ProgressTracker {
    constructor() {
        this.skills = {
            tactics: 50,
            openings: 50,
            endgames: 50,
            accuracy: 50,
            consistency: 50
        };
        this.skillHistory = [];
    }

    /**
     * Initialize progress tracker
     */
    initialize() {
        this.loadSkills();
        console.log('Progress Tracker initialized');
    }

    /**
     * Load skills from storage
     */
    loadSkills() {
        const stored = localStorage.getItem('chess_coach_skills');
        if (stored) {
            this.skills = JSON.parse(stored);
        }
    }

    /**
     * Save skills to storage
     */
    saveSkills() {
        localStorage.setItem('chess_coach_skills', JSON.stringify(this.skills));
    }

    /**
     * Update skill rating
     */
    updateSkill(skillName, value) {
        if (this.skills.hasOwnProperty(skillName)) {
            this.skills[skillName] = Math.max(0, Math.min(100, value));
            this.saveSkills();
            this.recordSkillHistory();
        }
    }

    /**
     * Record skill history for trend analysis
     */
    recordSkillHistory() {
        const entry = {
            date: new Date().toISOString(),
            ...this.skills
        };

        this.skillHistory.push(entry);

        // Keep only last 30 entries
        if (this.skillHistory.length > 30) {
            this.skillHistory.shift();
        }

        localStorage.setItem('chess_coach_skill_history', JSON.stringify(this.skillHistory));
    }

    /**
     * Calculate overall rating
     */
    getOverallRating() {
        const values = Object.values(this.skills);
        return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    }

    /**
     * Get skill trend (improving, stable, declining)
     */
    getSkillTrend(skillName) {
        if (this.skillHistory.length < 2) return 'stable';

        const recent = this.skillHistory.slice(-5);
        const values = recent.map(entry => entry[skillName]);

        const first = values[0];
        const last = values[values.length - 1];

        if (last > first + 5) return 'improving';
        if (last < first - 5) return 'declining';
        return 'stable';
    }

    /**
     * Render radar chart
     */
    renderRadarChart(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const size = 300;
        const center = size / 2;
        const maxRadius = center - 40;
        const numSkills = Object.keys(this.skills).length;

        // Create SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);
        svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
        svg.classList.add('radar-chart');

        // Draw background circles
        for (let i = 1; i <= 5; i++) {
            const radius = (maxRadius / 5) * i;
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', center);
            circle.setAttribute('cy', center);
            circle.setAttribute('r', radius);
            circle.setAttribute('fill', 'none');
            circle.setAttribute('stroke', 'rgba(255, 255, 255, 0.1)');
            circle.setAttribute('stroke-width', '1');
            svg.appendChild(circle);
        }

        // Draw axes
        const skillNames = Object.keys(this.skills);
        const skillLabels = {
            tactics: 'Tactics',
            openings: 'Openings',
            endgames: 'Endgames',
            accuracy: 'Accuracy',
            consistency: 'Consistency'
        };

        const points = [];

        skillNames.forEach((skill, index) => {
            const angle = (Math.PI * 2 * index / numSkills) - Math.PI / 2;
            const value = this.skills[skill];

            // Draw axis line
            const x2 = center + maxRadius * Math.cos(angle);
            const y2 = center + maxRadius * Math.sin(angle);

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', center);
            line.setAttribute('y1', center);
            line.setAttribute('x2', x2);
            line.setAttribute('y2', y2);
            line.setAttribute('stroke', 'rgba(255, 255, 255, 0.1)');
            line.setAttribute('stroke-width', '1');
            svg.appendChild(line);

            // Calculate point position
            const pointRadius = maxRadius * (value / 100);
            const x = center + pointRadius * Math.cos(angle);
            const y = center + pointRadius * Math.sin(angle);
            points.push(`${x},${y}`);

            // Draw label
            const labelDistance = maxRadius + 25;
            const labelX = center + labelDistance * Math.cos(angle);
            const labelY = center + labelDistance * Math.sin(angle);

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', labelX);
            text.setAttribute('y', labelY);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'middle');
            text.setAttribute('fill', 'rgba(255, 255, 255, 0.8)');
            text.setAttribute('font-size', '12');
            text.setAttribute('font-weight', '600');
            text.textContent = skillLabels[skill];
            svg.appendChild(text);

            // Draw value label
            const valueText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            valueText.setAttribute('x', labelX);
            valueText.setAttribute('y', labelY + 14);
            valueText.setAttribute('text-anchor', 'middle');
            valueText.setAttribute('fill', 'rgba(99, 102, 241, 0.9)');
            valueText.setAttribute('font-size', '11');
            valueText.setAttribute('font-weight', '700');
            valueText.textContent = Math.round(value);
            svg.appendChild(valueText);
        });

        // Draw skill polygon
        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', points.join(' '));
        polygon.setAttribute('fill', 'rgba(99, 102, 241, 0.2)');
        polygon.setAttribute('stroke', 'rgba(99, 102, 241, 0.8)');
        polygon.setAttribute('stroke-width', '2');
        svg.appendChild(polygon);

        // Draw points
        points.forEach(point => {
            const [x, y] = point.split(',');
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
            circle.setAttribute('r', '4');
            circle.setAttribute('fill', '#6366f1');
            svg.appendChild(circle);
        });

        // Clear and append
        container.innerHTML = '';
        container.appendChild(svg);
    }

    /**
     * Render skill progress cards
     */
    renderSkillCards(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const skillInfo = {
            tactics: { icon: '⚡', label: 'Tactical Vision', description: 'Puzzle solving ability' },
            openings: { icon: '📚', label: 'Opening Knowledge', description: 'Repertoire coverage' },
            endgames: { icon: '♔', label: 'Endgame Technique', description: 'Endgame mastery' },
            accuracy: { icon: '🎯', label: 'Move Accuracy', description: 'Average game accuracy' },
            consistency: { icon: '📊', label: 'Consistency', description: 'Performance stability' }
        };

        const html = Object.keys(this.skills).map(skillName => {
            const value = this.skills[skillName];
            const info = skillInfo[skillName];
            const trend = this.getSkillTrend(skillName);
            const trendIcon = trend === 'improving' ? '📈' : trend === 'declining' ? '📉' : '➡️';

            return `
                <div class="skill-progress-card">
                    <div class="skill-header">
                        <div class="skill-icon">${info.icon}</div>
                        <div class="skill-info">
                            <div class="skill-label">${info.label}</div>
                            <div class="skill-description">${info.description}</div>
                        </div>
                        <div class="skill-trend ${trend}">${trendIcon}</div>
                    </div>
                    <div class="skill-progress-container">
                        <div class="skill-progress-bar">
                            <div class="skill-progress-fill" style="width: ${value}%"></div>
                        </div>
                        <div class="skill-value">${Math.round(value)}</div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    /**
     * Update skills based on game performance
     */
    updateFromGameAnalysis(gameData) {
        // Update accuracy
        if (gameData.accuracy !== undefined) {
            this.updateSkill('accuracy', gameData.accuracy);
        }

        // Update consistency (based on variance in performance)
        if (this.skillHistory.length > 5) {
            const recentAccuracy = this.skillHistory.slice(-5).map(e => e.accuracy);
            const variance = this.calculateVariance(recentAccuracy);
            const consistency = Math.max(0, 100 - variance * 2);
            this.updateSkill('consistency', consistency);
        }

        // Update tactics (based on tactical mistakes)
        if (gameData.tacticalMistakes !== undefined) {
            const tacticsScore = Math.max(0, 100 - gameData.tacticalMistakes * 10);
            const current = this.skills.tactics;
            const updated = current * 0.9 + tacticsScore * 0.1; // Weighted average
            this.updateSkill('tactics', updated);
        }

        // Update opening (based on opening phase accuracy)
        if (gameData.openingAccuracy !== undefined) {
            const current = this.skills.openings;
            const updated = current * 0.9 + gameData.openingAccuracy * 0.1;
            this.updateSkill('openings', updated);
        }

        // Update endgame (based on endgame phase accuracy)
        if (gameData.endgameAccuracy !== undefined) {
            const current = this.skills.endgames;
            const updated = current * 0.9 + gameData.endgameAccuracy * 0.1;
            this.updateSkill('endgames', updated);
        }
    }

    /**
     * Calculate variance
     */
    calculateVariance(values) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
        return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
    }

    /**
     * Get skill recommendations
     */
    getRecommendations() {
        const recommendations = [];

        // Find weakest skill
        let weakestSkill = null;
        let weakestValue = 100;

        Object.entries(this.skills).forEach(([skill, value]) => {
            if (value < weakestValue) {
                weakestValue = value;
                weakestSkill = skill;
            }
        });

        const skillAdvice = {
            tactics: {
                title: 'Improve Tactical Vision',
                advice: 'Practice daily puzzles focusing on common tactical patterns',
                action: 'Start Puzzle Training'
            },
            openings: {
                title: 'Expand Opening Repertoire',
                advice: 'Learn key opening principles and build a solid repertoire',
                action: 'Study Openings'
            },
            endgames: {
                title: 'Master Endgame Technique',
                advice: 'Practice essential endgame positions and techniques',
                action: 'Endgame Drills'
            },
            accuracy: {
                title: 'Improve Move Accuracy',
                advice: 'Take more time to calculate and verify your moves',
                action: 'Play Practice Games'
            },
            consistency: {
                title: 'Build Consistency',
                advice: 'Maintain regular practice and review your games',
                action: 'Set Daily Goals'
            }
        };

        if (weakestSkill) {
            recommendations.push(skillAdvice[weakestSkill]);
        }

        return recommendations;
    }
}

// Create and export singleton instance
const progressTracker = new ProgressTracker();
window.progressTracker = progressTracker;

console.log('Progress Tracker module loaded');
