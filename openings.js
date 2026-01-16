/**
 * @fileoverview Chess opening detection and display module
 * Provides opening name detection based on move sequences
 */

/**
 * Dictionary of chess openings mapped by move sequences
 * @type {Object.<string, string>}
 */
const OPENINGS = {
    "e4": "King's Pawn Game",
    "e4 e5": "Open Game",
    "e4 e5 Nf3": "King's Knight Opening",
    "e4 e5 Nf3 Nc6": "King's Knight Opening: Normal",
    "e4 e5 Nf3 Nc6 Bb5": "Ruy Lopez",
    "e4 e5 Nf3 Nc6 Bc4": "Italian Game",
    "e4 c5": "Sicilian Defense",
    "e4 c6": "Caro-Kann Defense",
    "e4 e6": "French Defense",
    "d4": "Queen's Pawn Game",
    "d4 d5": "Queen's Gambit Game",
    "d4 d5 c4": "Queen's Gambit",
    "d4 Nf6": "Indian Defense",
    "d4 Nf6 c4 g6": "King's Indian / Grunfeld",
    "Nf3": "Reti Opening",
    "c4": "English Opening"
};

/**
 * Detects the opening name based on the current move sequence
 * @param {Chess} chess - The chess.js game instance
 * @returns {string} The detected opening name
 */
export function detectOpening(chess) {
    const history = chess.history().join(" ");

    // Exact match
    if (OPENINGS[history]) {
        return OPENINGS[history];
    }

    // Partial match (find longest matching prefix)
    let found = "Unknown / Custom";
    let bestLen = 0;

    for (const [seq, name] of Object.entries(OPENINGS)) {
        if (history.startsWith(seq) && seq.length > bestLen) {
            found = name;
            bestLen = seq.length;
        }
    }

    // Handle starting position
    if (history === "") {
        return "Starting Position";
    }

    return found;
}

/**
 * Updates the opening name display in the UI
 * @param {Chess} chess - The chess.js game instance
 */
export function updateOpeningDisplay(chess) {
    const nameEl = document.getElementById('opening-name');
    if (!nameEl) return;

    const openingName = detectOpening(chess);
    const history = chess.history().join(" ");

    // Highlight exact matches in green
    const isExactMatch = OPENINGS[history] !== undefined;

    nameEl.innerText = openingName;
    nameEl.style.color = isExactMatch ? "#4caf50" : "#888";
}
