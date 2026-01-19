/**
 * @fileoverview Chess opening detection and display module
 * Provides opening name detection based on move sequences with ECO codes,
 * variations, typical plans, and statistics
 */

/**
 * Opening database loaded from JSON
 * @type {Array<Object>}
 */
let openingsDatabase = [];

/**
 * Loads the opening database from JSON file
 * @returns {Promise<void>}
 */
export async function loadOpeningsDatabase() {
    try {
        const response = await fetch('openings-database.json');
        const data = await response.json();
        openingsDatabase = data.openings;
        console.log(`Loaded ${openingsDatabase.length} openings`);
    } catch (error) {
        console.error('Failed to load openings database:', error);
        // Fallback to basic openings
        openingsDatabase = [
            {
                moves: "e4",
                name: "King's Pawn Game",
                eco: "B00",
                category: "Open Games",
                variations: [],
                popularity: 45.2,
                whiteWinRate: 37.8,
                drawRate: 32.1,
                blackWinRate: 30.1,
                plans: {
                    white: ["Control the center"],
                    black: ["Challenge white's center"]
                }
            }
        ];
    }
}

/**
 * Fetches opening stats from Lichess Explorer
 * @param {string} fen - Current FEN
 * @returns {Promise<Object|null>} Opening stats or null if failed
 */
export async function fetchOpeningStats(fen) {
    // Encode FEN for URL
    const encodedFen = encodeURIComponent(fen);
    const url = `https://explorer.lichess.ovh/masters?fen=${encodedFen}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch opening stats:', error);
        return null;
    }
}

/**
 * Detects the opening based on the current move sequence
 * @param {Chess} chess - The chess.js game instance
 * @returns {Object|null} The detected opening object or null
 */
export function detectOpening(chess) {
    const history = chess.history().join(" ");

    if (history === "") {
        return null; // Starting position
    }

    // Find exact match first
    let exactMatch = openingsDatabase.find(opening => opening.moves === history);
    if (exactMatch) {
        return { ...exactMatch, isExact: true };
    }

    // Find longest matching prefix
    let bestMatch = null;
    let bestLen = 0;

    for (const opening of openingsDatabase) {
        if (history.startsWith(opening.moves) && opening.moves.length > bestLen) {
            bestMatch = opening;
            bestLen = opening.moves.length;
        }
    }

    if (bestMatch) {
        return { ...bestMatch, isExact: false };
    }

    return null; // Unknown opening
}

/**
 * Updates the opening name display in the UI
 * @param {Chess} chess - The chess.js game instance
 */
export async function updateOpeningDisplay(chess) {
    const nameEl = document.getElementById('opening-name');
    const ecoEl = document.getElementById('opening-eco');
    const categoryEl = document.getElementById('opening-category');
    const variationsEl = document.getElementById('opening-variations');
    const statsEl = document.getElementById('opening-stats');
    const plansEl = document.getElementById('opening-plans');

    if (!nameEl) return;

    const history = chess.history().join(" ");

    // Handle starting position
    if (history === "") {
        nameEl.innerText = "Starting Position";
        nameEl.style.color = "#888";
        if (ecoEl) ecoEl.innerText = "";
        if (categoryEl) categoryEl.innerText = "";
        if (variationsEl) variationsEl.innerHTML = "";
        if (statsEl) statsEl.innerHTML = "";
        if (plansEl) plansEl.innerHTML = "";
        return;
    }

    const opening = detectOpening(chess);

    if (!opening) {
        nameEl.innerText = "Unknown / Custom";
        nameEl.style.color = "#888";
        if (ecoEl) ecoEl.innerText = "";
        if (categoryEl) categoryEl.innerText = "";
        if (variationsEl) variationsEl.innerHTML = "";
        if (statsEl) statsEl.innerHTML = "";
        if (plansEl) plansEl.innerHTML = "";
        return;
    }

    // Update opening name
    nameEl.innerText = opening.name;
    nameEl.style.color = opening.isExact ? "#4caf50" : "#888";

    // Update ECO code
    if (ecoEl) {
        ecoEl.innerText = opening.eco;
        ecoEl.style.color = opening.isExact ? "#4caf50" : "#888";
    }

    // Update category
    if (categoryEl) {
        categoryEl.innerText = opening.category;
    }

    // Update variations
    if (variationsEl && opening.variations && opening.variations.length > 0) {
        const variationsHtml = opening.variations.slice(0, 3).map(v =>
            `<div class="variation-item">• ${v}</div>`
        ).join('');
        variationsEl.innerHTML = `<div class="variations-label">Variations:</div>${variationsHtml}`;
    } else if (variationsEl) {
        variationsEl.innerHTML = "";
    }

    // Update statistics
    if (statsEl) {
        statsEl.innerHTML = `
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-label">Popularity</div>
                    <div class="stat-value">${opening.popularity.toFixed(1)}%</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">White</div>
                    <div class="stat-value stat-white">${opening.whiteWinRate.toFixed(1)}%</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Draw</div>
                    <div class="stat-value stat-draw">${opening.drawRate.toFixed(1)}%</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Black</div>
                    <div class="stat-value stat-black">${opening.blackWinRate.toFixed(1)}%</div>
                </div>
            </div>
        `;
    }

    // Update typical plans
    if (plansEl && opening.plans) {
        const turn = chess.turn();
        const currentSidePlans = turn === 'w' ? opening.plans.white : opening.plans.black;
        const sideName = turn === 'w' ? 'White' : 'Black';

        if (currentSidePlans && currentSidePlans.length > 0) {
            const plansHtml = currentSidePlans.map(plan =>
                `<div class="plan-item">• ${plan}</div>`
            ).join('');
            plansEl.innerHTML = `
                <div class="plans-label">Typical Plans for ${sideName}:</div>
                ${plansHtml}
            `;
        } else {
            plansEl.innerHTML = "";
        }
    }

    // Fetch and display live stats from Lichess API
    const liveStatsContainer = document.getElementById('opening-live-stats');
    if (liveStatsContainer) {
        try {
            const stats = await fetchOpeningStats(chess.fen());
            if (stats && stats.moves && stats.moves.length > 0) {
                // Sort moves by popularity (total games played)
                const topMoves = stats.moves
                    .sort((a, b) => (b.white + b.draws + b.black) - (a.white + a.draws + a.black))
                    .slice(0, 3);

                const statsHtml = topMoves.map(move => {
                    const totalGames = move.white + move.draws + move.black;
                    const whitePercent = (move.white / totalGames) * 100;
                    const drawPercent = (move.draws / totalGames) * 100;
                    const blackPercent = (move.black / totalGames) * 100;

                    return `
                        <div class="stat-row">
                            <div class="move-info">
                                <span class="move-san">${move.san}</span>
                                <span class="game-count">${totalGames.toLocaleString()} games</span>
                            </div>
                            <div class="win-rate-bar">
                                <div class="white-wins" style="width:${whitePercent}%" title="White: ${whitePercent.toFixed(1)}%"></div>
                                <div class="draws" style="width:${drawPercent}%" title="Draws: ${drawPercent.toFixed(1)}%"></div>
                                <div class="black-wins" style="width:${blackPercent}%" title="Black: ${blackPercent.toFixed(1)}%"></div>
                            </div>
                            <div class="win-percentages">
                                <span class="percent-white">${whitePercent.toFixed(0)}%</span>
                                <span class="percent-draw">${drawPercent.toFixed(0)}%</span>
                                <span class="percent-black">${blackPercent.toFixed(0)}%</span>
                            </div>
                        </div>
                    `;
                }).join('');

                liveStatsContainer.innerHTML = `
                    <div class="live-stats-header">
                        <span class="live-stats-title">Masters Database</span>
                        <span class="live-stats-badge">LIVE</span>
                    </div>
                    ${statsHtml}
                `;
                liveStatsContainer.style.display = 'block';
            } else {
                liveStatsContainer.innerHTML = '<div class="no-stats">No master games found for this position</div>';
                liveStatsContainer.style.display = 'block';
            }
        } catch (error) {
            console.error('Error displaying live stats:', error);
            liveStatsContainer.innerHTML = '<div class="no-stats">Unable to load live stats</div>';
            liveStatsContainer.style.display = 'block';
        }
    }
}
