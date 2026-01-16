/**
 * @fileoverview Game Manager module
 * Handles saving, loading, exporting, and importing chess games
 */

const STORAGE_KEY = 'chess_coach_saved_games';

/**
 * @typedef {Object} SavedGame
 * @property {string} id - Unique game ID
 * @property {string} date - ISO date string
 * @property {string} timestamp - Display timestamp
 * @property {Array} moves - Array of move records
 * @property {string} result - Game result (1-0, 0-1, 1/2-1/2, *)
 * @property {string} fen - Final FEN position
 */

/**
 * Saves the current game to localStorage
 * @param {Array} moves - Array of move records from move-history
 * @param {string} fen - Current FEN position
 * @param {string} [result='*'] - Game result
 * @returns {boolean} True if save was successful
 */
export function saveGame(moves, fen, result = '*') {
    try {
        const savedGames = getSavedGames();

        const now = new Date();
        const game = {
            id: `game_${now.getTime()}`,
            date: now.toISOString(),
            timestamp: formatTimestamp(now),
            moves: moves,
            result: result,
            fen: fen
        };

        savedGames.unshift(game); // Add to beginning of array

        // Keep only last 50 games
        if (savedGames.length > 50) {
            savedGames.length = 50;
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedGames));
        console.log('Game saved successfully');
        return true;

    } catch (error) {
        console.error('Error saving game:', error);
        return false;
    }
}

/**
 * Retrieves all saved games from localStorage
 * @returns {SavedGame[]} Array of saved games
 */
export function getSavedGames() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error loading saved games:', error);
        return [];
    }
}

/**
 * Loads a specific game by ID
 * @param {string} gameId - Game ID
 * @returns {SavedGame|null} Saved game object or null if not found
 */
export function loadGame(gameId) {
    const savedGames = getSavedGames();
    return savedGames.find(game => game.id === gameId) || null;
}

/**
 * Deletes a saved game
 * @param {string} gameId - Game ID to delete
 * @returns {boolean} True if deletion was successful
 */
export function deleteGame(gameId) {
    try {
        const savedGames = getSavedGames();
        const filtered = savedGames.filter(game => game.id !== gameId);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        console.log('Game deleted successfully');
        return true;

    } catch (error) {
        console.error('Error deleting game:', error);
        return false;
    }
}

/**
 * Exports a game to PGN format
 * @param {Array} moves - Array of move records
 * @param {string} [result='*'] - Game result
 * @param {Object} [metadata={}] - Additional PGN metadata
 * @returns {string} PGN string
 */
export function exportToPGN(moves, result = '*', metadata = {}) {
    const now = new Date();

    // PGN Headers
    const headers = {
        Event: metadata.event || 'AI Chess Coach Game',
        Site: metadata.site || 'Chess Coach',
        Date: metadata.date || formatPGNDate(now),
        Round: metadata.round || '?',
        White: metadata.white || 'Player',
        Black: metadata.black || 'AI',
        Result: result
    };

    // Build header section
    let pgn = '';
    for (const [key, value] of Object.entries(headers)) {
        pgn += `[${key} "${value}"]\n`;
    }
    pgn += '\n';

    // Build moves section
    if (moves.length === 0) {
        pgn += result;
    } else {
        let moveText = '';
        for (let i = 0; i < moves.length; i++) {
            const move = moves[i];

            // Add move number for white's moves
            if (move.color === 'w') {
                if (moveText) moveText += ' ';
                moveText += `${move.moveNumber}.`;
            }

            // Add the move
            moveText += ' ' + move.san;

            // Add annotation if present
            if (move.annotation) {
                moveText += move.annotation;
            }

            // Add line breaks for readability (every 8 plies)
            if ((i + 1) % 8 === 0) {
                moveText += '\n';
            }
        }

        pgn += moveText.trim() + ' ' + result;
    }

    return pgn;
}

/**
 * Imports a game from PGN format
 * @param {string} pgnText - PGN string
 * @returns {Object|null} Object with moves array and metadata, or null if parsing fails
 */
export function importFromPGN(pgnText) {
    try {
        // Parse PGN headers
        const metadata = {};
        const headerRegex = /\[(\w+)\s+"([^"]*)"\]/g;
        let match;
        while ((match = headerRegex.exec(pgnText)) !== null) {
            metadata[match[1]] = match[2];
        }

        // Extract move text (everything after headers)
        const moveTextStart = pgnText.lastIndexOf(']') + 1;
        let moveText = pgnText.substring(moveTextStart).trim();

        // Remove comments, variations, and NAGs
        moveText = moveText.replace(/\{[^}]*\}/g, ''); // Remove comments
        moveText = moveText.replace(/\([^)]*\)/g, ''); // Remove variations
        moveText = moveText.replace(/\$\d+/g, ''); // Remove NAGs

        // Extract result
        const resultMatch = moveText.match(/(1-0|0-1|1\/2-1\/2|\*)\s*$/);
        const result = resultMatch ? resultMatch[1] : '*';

        // Remove result from move text
        if (resultMatch) {
            moveText = moveText.substring(0, resultMatch.index).trim();
        }

        // Parse moves
        // Split by move numbers and clean up
        const moveTokens = moveText
            .replace(/\d+\.\.\./g, '') // Remove black move numbers (1... format)
            .split(/\d+\./) // Split by white move numbers
            .filter(s => s.trim().length > 0);

        const moves = [];
        let moveNumber = 1;

        for (const token of moveTokens) {
            // Split into individual moves and clean
            const movesInToken = token.trim().split(/\s+/).filter(m => m.length > 0);

            for (const moveStr of movesInToken) {
                // Extract annotation symbols
                let san = moveStr;
                let annotation = null;

                // Check for annotations
                if (san.includes('!!')) {
                    annotation = '!!';
                    san = san.replace('!!', '');
                } else if (san.includes('!?')) {
                    annotation = '!?';
                    san = san.replace('!?', '');
                } else if (san.includes('?!')) {
                    annotation = '!?';
                    san = san.replace('?!', '');
                } else if (san.includes('??')) {
                    annotation = '??';
                    san = san.replace('??', '');
                } else if (san.includes('!')) {
                    annotation = '!';
                    san = san.replace('!', '');
                } else if (san.includes('?')) {
                    annotation = '?';
                    san = san.replace('?', '');
                }

                // Clean up any remaining symbols
                san = san.replace(/[+#]/g, match => match); // Keep check/mate symbols

                const color = moves.length % 2 === 0 ? 'w' : 'b';

                moves.push({
                    moveNumber: color === 'w' ? moveNumber : moveNumber,
                    san: san,
                    evaluation: null,
                    annotation: annotation,
                    fen: null, // Will be calculated when loaded
                    color: color
                });

                if (color === 'b') {
                    moveNumber++;
                }
            }
        }

        return {
            moves: moves,
            metadata: metadata,
            result: result
        };

    } catch (error) {
        console.error('Error parsing PGN:', error);
        return null;
    }
}

/**
 * Downloads a PGN file
 * @param {string} pgn - PGN string
 * @param {string} [filename='game.pgn'] - Filename for download
 */
export function downloadPGN(pgn, filename = 'game.pgn') {
    try {
        const blob = new Blob([pgn], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();

        // Cleanup
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);

        console.log('PGN downloaded successfully');
        return true;

    } catch (error) {
        console.error('Error downloading PGN:', error);
        return false;
    }
}

/**
 * Formats a timestamp for display
 * @param {Date} date - Date object
 * @returns {string} Formatted timestamp
 */
function formatTimestamp(date) {
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Formats a date for PGN format (YYYY.MM.DD)
 * @param {Date} date - Date object
 * @returns {string} PGN formatted date
 */
function formatPGNDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
}

/**
 * Displays the load game modal with saved games
 * @param {Function} onGameLoad - Callback when a game is selected
 */
export function showLoadGameModal(onGameLoad) {
    const modal = document.getElementById('loadGameModal');
    const savedGamesList = document.getElementById('savedGamesList');
    if (!modal || !savedGamesList) return;

    const savedGames = getSavedGames();

    // Clear list
    savedGamesList.innerHTML = '';

    if (savedGames.length === 0) {
        savedGamesList.innerHTML = '<div class="no-games">No saved games found</div>';
    } else {
        savedGames.forEach(game => {
            const gameDiv = document.createElement('div');
            gameDiv.className = 'saved-game-item';

            const headerDiv = document.createElement('div');
            headerDiv.className = 'saved-game-header';

            const dateSpan = document.createElement('span');
            dateSpan.className = 'saved-game-date';
            dateSpan.textContent = game.timestamp;
            headerDiv.appendChild(dateSpan);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-game-btn';
            deleteBtn.textContent = 'Delete';
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                if (confirm('Delete this game?')) {
                    deleteGame(game.id);
                    showLoadGameModal(onGameLoad); // Refresh list
                }
            };
            headerDiv.appendChild(deleteBtn);

            const infoDiv = document.createElement('div');
            infoDiv.className = 'saved-game-info';
            infoDiv.textContent = `${game.moves.length} moves - ${game.result}`;

            gameDiv.appendChild(headerDiv);
            gameDiv.appendChild(infoDiv);

            // Click to load
            gameDiv.onclick = () => {
                modal.style.display = 'none';
                onGameLoad(game);
            };

            savedGamesList.appendChild(gameDiv);
        });
    }

    modal.style.display = 'flex';
}

/**
 * Hides the load game modal
 */
export function hideLoadGameModal() {
    const modal = document.getElementById('loadGameModal');
    if (modal) {
        modal.style.display = 'none';
    }
}
