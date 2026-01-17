/**
 * @fileoverview Learning Tracker Module
 * Handles progress tracking, mistake database, personalized insights,
 * achievements, and ELO estimation
 */

const LEARNING_STORAGE_KEY = 'chess_coach_learning_data';
const ACHIEVEMENTS_STORAGE_KEY = 'chess_coach_achievements';

/**
 * @typedef {Object} GameSession
 * @property {string} id - Unique session ID
 * @property {string} date - ISO date string
 * @property {number} totalMoves - Total moves in the game
 * @property {number} mistakes - Number of mistakes
 * @property {number} blunders - Number of blunders
 * @property {number} inaccuracies - Number of inaccuracies
 * @property {number} goodMoves - Number of good moves
 * @property {number} accuracy - Accuracy percentage
 * @property {number} averageEvalLoss - Average evaluation loss
 * @property {number} estimatedRating - Estimated ELO for this game
 * @property {Array} mistakes_list - List of mistake details
 */

/**
 * @typedef {Object} MistakeRecord
 * @property {string} id - Unique mistake ID
 * @property {string} date - ISO date string
 * @property {string} fen - Position FEN
 * @property {string} playerMove - Move played
 * @property {string} bestMove - Best move
 * @property {number} evalLoss - Evaluation loss
 * @property {string} type - 'inaccuracy', 'mistake', or 'blunder'
 * @property {string} theme - Tactical theme (if detected)
 * @property {boolean} reviewed - Whether the mistake has been reviewed
 */

/**
 * Tactical themes for categorization
 */
const TACTICAL_THEMES = {
    HANGING_PIECE: 'Hanging Piece',
    FORK: 'Fork',
    PIN: 'Pin',
    SKEWER: 'Skewer',
    DISCOVERED_ATTACK: 'Discovered Attack',
    BACK_RANK: 'Back Rank Weakness',
    QUEEN_TRAP: 'Queen Trap',
    PAWN_STRUCTURE: 'Pawn Structure',
    KING_SAFETY: 'King Safety',
    PIECE_ACTIVITY: 'Piece Activity',
    ENDGAME: 'Endgame Technique',
    OPENING: 'Opening Error',
    TACTICAL_OVERSIGHT: 'Tactical Oversight',
    POSITIONAL: 'Positional Error'
};

/**
 * Achievement definitions
 */
const ACHIEVEMENTS = {
    FIRST_GAME: {
        id: 'first_game',
        name: 'First Steps',
        description: 'Complete your first game',
        icon: '🎮',
        threshold: 1,
        type: 'games'
    },
    TEN_GAMES: {
        id: 'ten_games',
        name: 'Getting Started',
        description: 'Complete 10 games',
        icon: '🎯',
        threshold: 10,
        type: 'games'
    },
    FIFTY_GAMES: {
        id: 'fifty_games',
        name: 'Dedicated Player',
        description: 'Complete 50 games',
        icon: '🏃',
        threshold: 50,
        type: 'games'
    },
    HUNDRED_GAMES: {
        id: 'hundred_games',
        name: 'Veteran',
        description: 'Complete 100 games',
        icon: '🏆',
        threshold: 100,
        type: 'games'
    },
    ACCURACY_70: {
        id: 'accuracy_70',
        name: 'Solid Player',
        description: 'Achieve 70% accuracy in a game',
        icon: '📊',
        threshold: 70,
        type: 'accuracy'
    },
    ACCURACY_80: {
        id: 'accuracy_80',
        name: 'Accurate Player',
        description: 'Achieve 80% accuracy in a game',
        icon: '🎯',
        threshold: 80,
        type: 'accuracy'
    },
    ACCURACY_90: {
        id: 'accuracy_90',
        name: 'Precision Master',
        description: 'Achieve 90% accuracy in a game',
        icon: '💎',
        threshold: 90,
        type: 'accuracy'
    },
    ACCURACY_95: {
        id: 'accuracy_95',
        name: 'Near Perfect',
        description: 'Achieve 95% accuracy in a game',
        icon: '⭐',
        threshold: 95,
        type: 'accuracy'
    },
    NO_BLUNDERS: {
        id: 'no_blunders',
        name: 'Clean Game',
        description: 'Complete a game with no blunders',
        icon: '🛡️',
        threshold: 0,
        type: 'no_blunders'
    },
    NO_MISTAKES: {
        id: 'no_mistakes',
        name: 'Flawless',
        description: 'Complete a game with no mistakes or blunders',
        icon: '✨',
        threshold: 0,
        type: 'no_mistakes'
    },
    RATING_1000: {
        id: 'rating_1000',
        name: 'Club Player',
        description: 'Reach estimated rating of 1000',
        icon: '📈',
        threshold: 1000,
        type: 'rating'
    },
    RATING_1200: {
        id: 'rating_1200',
        name: 'Rising Star',
        description: 'Reach estimated rating of 1200',
        icon: '🌟',
        threshold: 1200,
        type: 'rating'
    },
    RATING_1400: {
        id: 'rating_1400',
        name: 'Intermediate',
        description: 'Reach estimated rating of 1400',
        icon: '🔥',
        threshold: 1400,
        type: 'rating'
    },
    RATING_1600: {
        id: 'rating_1600',
        name: 'Advanced',
        description: 'Reach estimated rating of 1600',
        icon: '💪',
        threshold: 1600,
        type: 'rating'
    },
    RATING_1800: {
        id: 'rating_1800',
        name: 'Expert',
        description: 'Reach estimated rating of 1800',
        icon: '👑',
        threshold: 1800,
        type: 'rating'
    },
    RATING_2000: {
        id: 'rating_2000',
        name: 'Master Class',
        description: 'Reach estimated rating of 2000',
        icon: '🏅',
        threshold: 2000,
        type: 'rating'
    },
    REVIEWED_10: {
        id: 'reviewed_10',
        name: 'Self Improver',
        description: 'Review 10 of your mistakes',
        icon: '📚',
        threshold: 10,
        type: 'reviewed'
    },
    REVIEWED_50: {
        id: 'reviewed_50',
        name: 'Dedicated Learner',
        description: 'Review 50 of your mistakes',
        icon: '🎓',
        threshold: 50,
        type: 'reviewed'
    },
    STREAK_3: {
        id: 'streak_3',
        name: 'On Fire',
        description: 'Play 3 days in a row',
        icon: '🔥',
        threshold: 3,
        type: 'streak'
    },
    STREAK_7: {
        id: 'streak_7',
        name: 'Week Warrior',
        description: 'Play 7 days in a row',
        icon: '📅',
        threshold: 7,
        type: 'streak'
    }
};

/**
 * Learning tracker state
 */
const learningState = {
    sessions: [],
    mistakes: [],
    achievements: [],
    currentStreak: 0,
    longestStreak: 0,
    lastPlayDate: null
};

/**
 * Loads learning data from localStorage
 */
export function loadLearningData() {
    try {
        const data = localStorage.getItem(LEARNING_STORAGE_KEY);
        if (data) {
            const parsed = JSON.parse(data);
            learningState.sessions = parsed.sessions || [];
            learningState.mistakes = parsed.mistakes || [];
            learningState.currentStreak = parsed.currentStreak || 0;
            learningState.longestStreak = parsed.longestStreak || 0;
            learningState.lastPlayDate = parsed.lastPlayDate || null;
        }

        const achievements = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
        if (achievements) {
            learningState.achievements = JSON.parse(achievements);
        }
    } catch (error) {
        console.error('Error loading learning data:', error);
    }
}

/**
 * Saves learning data to localStorage
 */
function saveLearningData() {
    try {
        const data = {
            sessions: learningState.sessions,
            mistakes: learningState.mistakes,
            currentStreak: learningState.currentStreak,
            longestStreak: learningState.longestStreak,
            lastPlayDate: learningState.lastPlayDate
        };
        localStorage.setItem(LEARNING_STORAGE_KEY, JSON.stringify(data));
        localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(learningState.achievements));
    } catch (error) {
        console.error('Error saving learning data:', error);
    }
}

/**
 * Records a completed game session
 * @param {Array} moves - Array of move records with evaluations
 * @returns {GameSession} The recorded session
 */
export function recordGameSession(moves) {
    if (!moves || moves.length === 0) return null;

    const stats = analyzeMoveQuality(moves);
    const estimatedRating = calculateEstimatedRating(stats);

    const session = {
        id: `session_${Date.now()}`,
        date: new Date().toISOString(),
        totalMoves: moves.length,
        mistakes: stats.mistakes,
        blunders: stats.blunders,
        inaccuracies: stats.inaccuracies,
        goodMoves: stats.goodMoves,
        accuracy: stats.accuracy,
        averageEvalLoss: stats.averageEvalLoss,
        estimatedRating: estimatedRating,
        mistakes_list: stats.mistakesList
    };

    // Add mistakes to the database
    stats.mistakesList.forEach(mistake => {
        addMistakeToDatabase(mistake);
    });

    learningState.sessions.unshift(session);

    // Keep only last 500 sessions
    if (learningState.sessions.length > 500) {
        learningState.sessions.length = 500;
    }

    // Update streak
    updateStreak();

    // Check for new achievements
    const newAchievements = checkAchievements(session);

    saveLearningData();

    return {
        session,
        newAchievements
    };
}

/**
 * Analyzes move quality from game moves
 * @param {Array} moves - Array of move records
 * @returns {Object} Statistics about move quality
 */
function analyzeMoveQuality(moves) {
    let goodMoves = 0;
    let inaccuracies = 0;
    let mistakes = 0;
    let blunders = 0;
    let totalEvalLoss = 0;
    const mistakesList = [];

    for (let i = 0; i < moves.length; i++) {
        const move = moves[i];
        
        // Skip if no evaluation data
        if (move.evaluation === null || i === 0) continue;

        const prevMove = moves[i - 1];
        if (prevMove.evaluation === null) continue;

        const evalLoss = Math.abs(prevMove.evaluation - move.evaluation);
        totalEvalLoss += evalLoss;

        if (evalLoss < 0.3) {
            goodMoves++;
        } else if (evalLoss < 1.0) {
            inaccuracies++;
            mistakesList.push({
                id: `mistake_${Date.now()}_${i}`,
                date: new Date().toISOString(),
                fen: prevMove.fen || '',
                playerMove: move.san,
                bestMove: '', // Would need engine analysis
                evalLoss: evalLoss,
                type: 'inaccuracy',
                theme: detectTacticalTheme(move, prevMove),
                reviewed: false,
                moveNumber: move.moveNumber
            });
        } else if (evalLoss < 2.5) {
            mistakes++;
            mistakesList.push({
                id: `mistake_${Date.now()}_${i}`,
                date: new Date().toISOString(),
                fen: prevMove.fen || '',
                playerMove: move.san,
                bestMove: '',
                evalLoss: evalLoss,
                type: 'mistake',
                theme: detectTacticalTheme(move, prevMove),
                reviewed: false,
                moveNumber: move.moveNumber
            });
        } else {
            blunders++;
            mistakesList.push({
                id: `mistake_${Date.now()}_${i}`,
                date: new Date().toISOString(),
                fen: prevMove.fen || '',
                playerMove: move.san,
                bestMove: '',
                evalLoss: evalLoss,
                type: 'blunder',
                theme: detectTacticalTheme(move, prevMove),
                reviewed: false,
                moveNumber: move.moveNumber
            });
        }
    }

    const totalMoves = Math.max(1, moves.length - 1);
    const accuracy = Math.max(0, Math.min(100, 
        ((goodMoves + inaccuracies * 0.5) / totalMoves) * 100
    ));

    return {
        goodMoves,
        inaccuracies,
        mistakes,
        blunders,
        accuracy: Math.round(accuracy * 10) / 10,
        averageEvalLoss: totalEvalLoss / totalMoves,
        mistakesList
    };
}

/**
 * Detects tactical theme of a mistake
 * @param {Object} move - Current move
 * @param {Object} prevMove - Previous move
 * @returns {string} Detected theme
 */
function detectTacticalTheme(move, prevMove) {
    // Basic heuristic detection - in a real implementation,
    // this would use engine analysis
    const san = move.san.toLowerCase();
    const moveNum = move.moveNumber || 1;

    if (moveNum <= 10) {
        return TACTICAL_THEMES.OPENING;
    }
    
    if (san.includes('x') && move.evalLoss > 2) {
        return TACTICAL_THEMES.HANGING_PIECE;
    }

    if (san.includes('+') || san.includes('#')) {
        return TACTICAL_THEMES.KING_SAFETY;
    }

    // Default to tactical oversight for significant mistakes
    if (move.evalLoss > 1.5) {
        return TACTICAL_THEMES.TACTICAL_OVERSIGHT;
    }

    return TACTICAL_THEMES.POSITIONAL;
}

/**
 * Adds a mistake to the database
 * @param {MistakeRecord} mistake - Mistake record
 */
function addMistakeToDatabase(mistake) {
    learningState.mistakes.unshift(mistake);

    // Keep only last 1000 mistakes
    if (learningState.mistakes.length > 1000) {
        learningState.mistakes.length = 1000;
    }
}

/**
 * Calculates estimated ELO rating based on game statistics
 * @param {Object} stats - Game statistics
 * @returns {number} Estimated ELO rating
 */
function calculateEstimatedRating(stats) {
    // ELO estimation formula based on accuracy and mistake rates
    // Base rating starts at 800
    let rating = 800;

    // Accuracy contribution (up to +800)
    rating += (stats.accuracy / 100) * 800;

    // Penalty for blunders (-50 each)
    rating -= stats.blunders * 50;

    // Penalty for mistakes (-25 each)
    rating -= stats.mistakes * 25;

    // Penalty for inaccuracies (-10 each)
    rating -= stats.inaccuracies * 10;

    // Average eval loss factor
    const evalPenalty = Math.min(200, stats.averageEvalLoss * 40);
    rating -= evalPenalty;

    // Clamp to reasonable range
    return Math.max(400, Math.min(2400, Math.round(rating)));
}

/**
 * Updates the play streak
 */
function updateStreak() {
    const today = new Date().toDateString();
    const lastPlay = learningState.lastPlayDate 
        ? new Date(learningState.lastPlayDate).toDateString() 
        : null;

    if (lastPlay === today) {
        // Already played today, streak unchanged
        return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    if (lastPlay === yesterdayStr) {
        // Played yesterday, extend streak
        learningState.currentStreak++;
    } else if (lastPlay !== today) {
        // Streak broken
        learningState.currentStreak = 1;
    }

    if (learningState.currentStreak > learningState.longestStreak) {
        learningState.longestStreak = learningState.currentStreak;
    }

    learningState.lastPlayDate = new Date().toISOString();
}

/**
 * Checks for newly earned achievements
 * @param {GameSession} session - Current session
 * @returns {Array} Array of newly earned achievements
 */
function checkAchievements(session) {
    const newAchievements = [];
    const earned = new Set(learningState.achievements.map(a => a.id));

    // Check games achievements
    const totalGames = learningState.sessions.length;
    Object.values(ACHIEVEMENTS).filter(a => a.type === 'games').forEach(achievement => {
        if (!earned.has(achievement.id) && totalGames >= achievement.threshold) {
            newAchievements.push(achievement);
            learningState.achievements.push({
                ...achievement,
                earnedDate: new Date().toISOString()
            });
        }
    });

    // Check accuracy achievements
    Object.values(ACHIEVEMENTS).filter(a => a.type === 'accuracy').forEach(achievement => {
        if (!earned.has(achievement.id) && session.accuracy >= achievement.threshold) {
            newAchievements.push(achievement);
            learningState.achievements.push({
                ...achievement,
                earnedDate: new Date().toISOString()
            });
        }
    });

    // Check no blunders achievement
    if (!earned.has('no_blunders') && session.blunders === 0 && session.totalMoves >= 20) {
        const achievement = ACHIEVEMENTS.NO_BLUNDERS;
        newAchievements.push(achievement);
        learningState.achievements.push({
            ...achievement,
            earnedDate: new Date().toISOString()
        });
    }

    // Check no mistakes achievement
    if (!earned.has('no_mistakes') && session.blunders === 0 && session.mistakes === 0 && session.totalMoves >= 20) {
        const achievement = ACHIEVEMENTS.NO_MISTAKES;
        newAchievements.push(achievement);
        learningState.achievements.push({
            ...achievement,
            earnedDate: new Date().toISOString()
        });
    }

    // Check rating achievements
    Object.values(ACHIEVEMENTS).filter(a => a.type === 'rating').forEach(achievement => {
        if (!earned.has(achievement.id)) {
            const avgRating = getAverageRating();
            if (avgRating >= achievement.threshold) {
                newAchievements.push(achievement);
                learningState.achievements.push({
                    ...achievement,
                    earnedDate: new Date().toISOString()
                });
            }
        }
    });

    // Check streak achievements
    Object.values(ACHIEVEMENTS).filter(a => a.type === 'streak').forEach(achievement => {
        if (!earned.has(achievement.id) && learningState.currentStreak >= achievement.threshold) {
            newAchievements.push(achievement);
            learningState.achievements.push({
                ...achievement,
                earnedDate: new Date().toISOString()
            });
        }
    });

    // Check reviewed achievements
    const reviewedCount = learningState.mistakes.filter(m => m.reviewed).length;
    Object.values(ACHIEVEMENTS).filter(a => a.type === 'reviewed').forEach(achievement => {
        if (!earned.has(achievement.id) && reviewedCount >= achievement.threshold) {
            newAchievements.push(achievement);
            learningState.achievements.push({
                ...achievement,
                earnedDate: new Date().toISOString()
            });
        }
    });

    return newAchievements;
}

/**
 * Gets average estimated rating from recent games
 * @param {number} [numGames=10] - Number of recent games to average
 * @returns {number} Average rating
 */
export function getAverageRating(numGames = 10) {
    const recentSessions = learningState.sessions.slice(0, numGames);
    if (recentSessions.length === 0) return 800;

    const sum = recentSessions.reduce((acc, s) => acc + s.estimatedRating, 0);
    return Math.round(sum / recentSessions.length);
}

/**
 * Gets progress data for charting
 * @param {number} [days=30] - Number of days to include
 * @returns {Object} Progress data
 */
export function getProgressData(days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const filteredSessions = learningState.sessions.filter(
        s => new Date(s.date) >= cutoffDate
    );

    // Group by date
    const byDate = {};
    filteredSessions.forEach(session => {
        const dateKey = new Date(session.date).toLocaleDateString();
        if (!byDate[dateKey]) {
            byDate[dateKey] = {
                date: dateKey,
                sessions: [],
                accuracy: 0,
                rating: 0,
                games: 0
            };
        }
        byDate[dateKey].sessions.push(session);
        byDate[dateKey].games++;
    });

    // Calculate averages
    Object.values(byDate).forEach(day => {
        day.accuracy = day.sessions.reduce((sum, s) => sum + s.accuracy, 0) / day.games;
        day.rating = day.sessions.reduce((sum, s) => sum + s.estimatedRating, 0) / day.games;
    });

    return {
        daily: Object.values(byDate).sort((a, b) => new Date(a.date) - new Date(b.date)),
        totalGames: learningState.sessions.length,
        averageRating: getAverageRating(),
        currentStreak: learningState.currentStreak,
        longestStreak: learningState.longestStreak
    };
}

/**
 * Gets personalized insights based on mistake patterns
 * @returns {Object} Insights data
 */
export function getPersonalizedInsights() {
    const mistakes = learningState.mistakes;
    
    // Count themes
    const themeCounts = {};
    mistakes.forEach(m => {
        if (m.theme) {
            themeCounts[m.theme] = (themeCounts[m.theme] || 0) + 1;
        }
    });

    // Sort by frequency
    const sortedThemes = Object.entries(themeCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([theme, count]) => ({ theme, count }));

    // Calculate improvement areas
    const recentMistakes = mistakes.slice(0, 50);
    const recentThemes = {};
    recentMistakes.forEach(m => {
        if (m.theme) {
            recentThemes[m.theme] = (recentThemes[m.theme] || 0) + 1;
        }
    });

    // Calculate recent accuracy trend
    const recentSessions = learningState.sessions.slice(0, 10);
    const olderSessions = learningState.sessions.slice(10, 20);
    
    const recentAvgAccuracy = recentSessions.length > 0
        ? recentSessions.reduce((sum, s) => sum + s.accuracy, 0) / recentSessions.length
        : 0;
    const olderAvgAccuracy = olderSessions.length > 0
        ? olderSessions.reduce((sum, s) => sum + s.accuracy, 0) / olderSessions.length
        : 0;

    const accuracyTrend = recentAvgAccuracy - olderAvgAccuracy;

    return {
        weaknesses: sortedThemes.slice(0, 5),
        recentWeaknesses: Object.entries(recentThemes)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([theme, count]) => ({ theme, count })),
        accuracyTrend: Math.round(accuracyTrend * 10) / 10,
        totalMistakes: mistakes.length,
        reviewedMistakes: mistakes.filter(m => m.reviewed).length,
        recommendations: generateRecommendations(sortedThemes)
    };
}

/**
 * Generates training recommendations
 * @param {Array} sortedThemes - Sorted weakness themes
 * @returns {Array} Recommendations
 */
function generateRecommendations(sortedThemes) {
    const recommendations = [];

    if (sortedThemes.length === 0) {
        recommendations.push({
            title: 'Play More Games',
            description: 'Complete more games to get personalized recommendations.',
            icon: '🎮'
        });
        return recommendations;
    }

    const topWeakness = sortedThemes[0];

    switch (topWeakness.theme) {
        case TACTICAL_THEMES.HANGING_PIECE:
            recommendations.push({
                title: 'Piece Safety Training',
                description: 'Practice checking if your pieces are protected before each move.',
                icon: '♟️'
            });
            break;
        case TACTICAL_THEMES.KING_SAFETY:
            recommendations.push({
                title: 'King Safety Awareness',
                description: 'Focus on keeping your king safe. Practice mating patterns.',
                icon: '♚'
            });
            break;
        case TACTICAL_THEMES.TACTICAL_OVERSIGHT:
            recommendations.push({
                title: 'Tactical Training',
                description: 'Solve more tactical puzzles to improve pattern recognition.',
                icon: '⚔️'
            });
            break;
        case TACTICAL_THEMES.OPENING:
            recommendations.push({
                title: 'Opening Study',
                description: 'Study opening principles and common opening traps.',
                icon: '📖'
            });
            break;
        case TACTICAL_THEMES.POSITIONAL:
            recommendations.push({
                title: 'Positional Understanding',
                description: 'Work on pawn structure and piece coordination.',
                icon: '🎯'
            });
            break;
        default:
            recommendations.push({
                title: 'General Improvement',
                description: 'Continue playing and reviewing your games.',
                icon: '📈'
            });
    }

    // Always add review recommendation
    const unreviewedCount = learningState.mistakes.filter(m => !m.reviewed).length;
    if (unreviewedCount > 0) {
        recommendations.push({
            title: 'Review Your Mistakes',
            description: `You have ${unreviewedCount} unreviewed mistakes. Learning from them will help you improve.`,
            icon: '📚'
        });
    }

    return recommendations;
}

/**
 * Gets all mistakes from the database
 * @param {Object} [filters] - Optional filters
 * @returns {Array} Filtered mistakes
 */
export function getMistakes(filters = {}) {
    let mistakes = [...learningState.mistakes];

    if (filters.type) {
        mistakes = mistakes.filter(m => m.type === filters.type);
    }

    if (filters.theme) {
        mistakes = mistakes.filter(m => m.theme === filters.theme);
    }

    if (filters.reviewed !== undefined) {
        mistakes = mistakes.filter(m => m.reviewed === filters.reviewed);
    }

    if (filters.limit) {
        mistakes = mistakes.slice(0, filters.limit);
    }

    return mistakes;
}

/**
 * Marks a mistake as reviewed
 * @param {string} mistakeId - Mistake ID
 */
export function markMistakeReviewed(mistakeId) {
    const mistake = learningState.mistakes.find(m => m.id === mistakeId);
    if (mistake) {
        mistake.reviewed = true;
        saveLearningData();

        // Check for review achievements
        checkAchievements({});
    }
}

/**
 * Gets all earned achievements
 * @returns {Array} Earned achievements
 */
export function getEarnedAchievements() {
    return learningState.achievements;
}

/**
 * Gets all available achievements with progress
 * @returns {Array} All achievements with progress
 */
export function getAllAchievements() {
    const earned = new Set(learningState.achievements.map(a => a.id));
    
    return Object.values(ACHIEVEMENTS).map(achievement => {
        const earnedData = learningState.achievements.find(a => a.id === achievement.id);
        let progress = 0;

        switch (achievement.type) {
            case 'games':
                progress = Math.min(100, (learningState.sessions.length / achievement.threshold) * 100);
                break;
            case 'rating':
                progress = Math.min(100, (getAverageRating() / achievement.threshold) * 100);
                break;
            case 'streak':
                progress = Math.min(100, (learningState.currentStreak / achievement.threshold) * 100);
                break;
            case 'reviewed':
                const reviewed = learningState.mistakes.filter(m => m.reviewed).length;
                progress = Math.min(100, (reviewed / achievement.threshold) * 100);
                break;
            default:
                progress = earned.has(achievement.id) ? 100 : 0;
        }

        return {
            ...achievement,
            earned: earned.has(achievement.id),
            earnedDate: earnedData?.earnedDate || null,
            progress: Math.round(progress)
        };
    });
}

/**
 * Gets training mode exercises based on weaknesses
 * @returns {Array} Training exercises
 */
export function getTrainingExercises() {
    const insights = getPersonalizedInsights();
    const exercises = [];

    insights.weaknesses.slice(0, 3).forEach(weakness => {
        const relevantMistakes = getMistakes({ 
            theme: weakness.theme, 
            reviewed: false,
            limit: 5 
        });

        if (relevantMistakes.length > 0) {
            exercises.push({
                theme: weakness.theme,
                description: `Practice positions where you made ${weakness.theme.toLowerCase()} errors`,
                positions: relevantMistakes.map(m => ({
                    fen: m.fen,
                    yourMove: m.playerMove,
                    bestMove: m.bestMove,
                    evalLoss: m.evalLoss
                }))
            });
        }
    });

    return exercises;
}

/**
 * Gets the learning state
 * @returns {Object} Current learning state
 */
export function getLearningState() {
    return {
        totalGames: learningState.sessions.length,
        totalMistakes: learningState.mistakes.length,
        averageRating: getAverageRating(),
        currentStreak: learningState.currentStreak,
        longestStreak: learningState.longestStreak,
        achievementsCount: learningState.achievements.length
    };
}

/**
 * Gets game sessions
 * @param {number} [limit=50] - Maximum number of sessions to return
 * @returns {Array} Game sessions
 */
export function getGameSessions(limit = 50) {
    return learningState.sessions.slice(0, limit);
}

/**
 * Exports all tactical themes
 * @returns {Object} Tactical themes
 */
export function getTacticalThemes() {
    return { ...TACTICAL_THEMES };
}

// Initialize on load
loadLearningData();
