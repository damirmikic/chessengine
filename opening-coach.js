/**
 * @fileoverview Opening Coach & Trap Coach Module
 * Repetition-based opening practice until 100% accuracy (with variants)
 * Trap practice with configurable accuracy targets
 */

/**
 * Opening repertoire lines for repetition practice.
 * Each opening has a main line and variants the user must learn.
 * Moves are from the perspective of the practicing side.
 */
export const OPENING_REPERTOIRE = [
    {
        id: 'italian_game_white',
        title: 'Italian Game',
        eco: 'C50',
        side: 'white',
        difficulty: 'beginner',
        description: 'Control the center and target f7 with the bishop.',
        mainLine: [
            { move: 'e4', reply: 'e5' },
            { move: 'Nf3', reply: 'Nc6' },
            { move: 'Bc4', reply: null }
        ],
        variants: [
            {
                name: 'Giuoco Piano',
                after: 2, // after move 3 (index 2), branch
                branchReply: 'Bc5',
                continuation: [
                    { move: 'c3', reply: 'Nf6' },
                    { move: 'd4', reply: null }
                ]
            },
            {
                name: 'Two Knights Defense',
                after: 2,
                branchReply: 'Nf6',
                continuation: [
                    { move: 'd4', reply: 'exd4' },
                    { move: 'e5', reply: null }
                ]
            }
        ]
    },
    {
        id: 'ruy_lopez_white',
        title: 'Ruy Lopez',
        eco: 'C60',
        side: 'white',
        difficulty: 'intermediate',
        description: 'Put pressure on the knight defending e5.',
        mainLine: [
            { move: 'e4', reply: 'e5' },
            { move: 'Nf3', reply: 'Nc6' },
            { move: 'Bb5', reply: 'a6' },
            { move: 'Ba4', reply: null }
        ],
        variants: [
            {
                name: 'Morphy Defense - Closed',
                after: 3,
                branchReply: 'Nf6',
                continuation: [
                    { move: 'O-O', reply: 'Be7' },
                    { move: 'Re1', reply: null }
                ]
            },
            {
                name: 'Berlin Defense',
                after: 2,
                branchReply: 'Nf6',
                continuation: [
                    { move: 'O-O', reply: 'Nxe4' },
                    { move: 'd4', reply: null }
                ]
            }
        ]
    },
    {
        id: 'sicilian_open_white',
        title: 'Open Sicilian',
        eco: 'B20',
        side: 'white',
        difficulty: 'intermediate',
        description: 'The mainline approach against the Sicilian Defense.',
        mainLine: [
            { move: 'e4', reply: 'c5' },
            { move: 'Nf3', reply: 'd6' },
            { move: 'd4', reply: 'cxd4' },
            { move: 'Nxd4', reply: null }
        ],
        variants: [
            {
                name: 'Najdorf Setup',
                after: 3,
                branchReply: 'Nf6',
                continuation: [
                    { move: 'Nc3', reply: 'a6' },
                    { move: 'Be3', reply: null }
                ]
            },
            {
                name: 'Dragon Setup',
                after: 3,
                branchReply: 'g6',
                continuation: [
                    { move: 'Nc3', reply: 'Bg7' },
                    { move: 'Be3', reply: null }
                ]
            }
        ]
    },
    {
        id: 'french_defense_black',
        title: 'French Defense',
        eco: 'C00',
        side: 'black',
        difficulty: 'beginner',
        description: 'Fight for the center with e6 and d5.',
        mainLine: [
            { move: 'e6', reply: 'd4' },
            { move: 'd5', reply: null }
        ],
        variants: [
            {
                name: 'Advance Variation',
                after: 1,
                branchReply: 'e5',
                continuation: [
                    { move: 'c5', reply: 'c3' },
                    { move: 'Nc6', reply: null }
                ]
            },
            {
                name: 'Exchange Variation',
                after: 1,
                branchReply: 'exd5',
                continuation: [
                    { move: 'exd5', reply: 'Nc3' },
                    { move: 'Nf6', reply: null }
                ]
            }
        ]
    },
    {
        id: 'caro_kann_black',
        title: 'Caro-Kann Defense',
        eco: 'B10',
        side: 'black',
        difficulty: 'beginner',
        description: 'Solid defense keeping the light-squared bishop active.',
        mainLine: [
            { move: 'c6', reply: 'd4' },
            { move: 'd5', reply: null }
        ],
        variants: [
            {
                name: 'Classical - Bf5 Line',
                after: 1,
                branchReply: 'Nc3',
                continuation: [
                    { move: 'dxe4', reply: 'Nxe4' },
                    { move: 'Bf5', reply: null }
                ]
            },
            {
                name: 'Advance Variation',
                after: 1,
                branchReply: 'e5',
                continuation: [
                    { move: 'Bf5', reply: 'Nf3' },
                    { move: 'e6', reply: null }
                ]
            }
        ]
    },
    {
        id: 'queens_gambit_white',
        title: "Queen's Gambit",
        eco: 'D06',
        side: 'white',
        difficulty: 'beginner',
        description: 'Offer a pawn to control the center.',
        mainLine: [
            { move: 'd4', reply: 'd5' },
            { move: 'c4', reply: null }
        ],
        variants: [
            {
                name: 'QGD - Classical',
                after: 1,
                branchReply: 'e6',
                continuation: [
                    { move: 'Nc3', reply: 'Nf6' },
                    { move: 'Bg5', reply: null }
                ]
            },
            {
                name: 'QGA - Accepted',
                after: 1,
                branchReply: 'dxc4',
                continuation: [
                    { move: 'e3', reply: 'Nf6' },
                    { move: 'Bxc4', reply: null }
                ]
            },
            {
                name: 'Slav Defense',
                after: 1,
                branchReply: 'c6',
                continuation: [
                    { move: 'Nf3', reply: 'Nf6' },
                    { move: 'Nc3', reply: null }
                ]
            }
        ]
    },
    {
        id: 'london_system_white',
        title: 'London System',
        eco: 'D02',
        side: 'white',
        difficulty: 'beginner',
        description: 'Simple and solid system with Bf4.',
        mainLine: [
            { move: 'd4', reply: 'Nf6' },
            { move: 'Bf4', reply: 'd5' },
            { move: 'e3', reply: null }
        ],
        variants: [
            {
                name: 'vs ...c5',
                after: 1,
                branchReply: 'c5',
                continuation: [
                    { move: 'e3', reply: 'cxd4' },
                    { move: 'exd4', reply: null }
                ]
            },
            {
                name: 'vs ...e6',
                after: 2,
                branchReply: 'e6',
                continuation: [
                    { move: 'Nf3', reply: 'c5' },
                    { move: 'c3', reply: null }
                ]
            }
        ]
    },
    {
        id: 'kings_indian_black',
        title: "King's Indian Defense",
        eco: 'E60',
        side: 'black',
        difficulty: 'advanced',
        description: 'Fianchetto and counterattack the center later.',
        mainLine: [
            { move: 'Nf6', reply: 'c4' },
            { move: 'g6', reply: 'Nc3' },
            { move: 'Bg7', reply: 'e4' },
            { move: 'd6', reply: null }
        ],
        variants: [
            {
                name: 'Classical - e5 Break',
                after: 3,
                branchReply: 'Nf3',
                continuation: [
                    { move: 'O-O', reply: 'Be2' },
                    { move: 'e5', reply: null }
                ]
            },
            {
                name: 'Samisch Variation',
                after: 3,
                branchReply: 'f3',
                continuation: [
                    { move: 'O-O', reply: 'Be3' },
                    { move: 'c5', reply: null }
                ]
            }
        ]
    },
    {
        id: 'sicilian_najdorf_black',
        title: 'Sicilian Najdorf',
        eco: 'B90',
        side: 'black',
        difficulty: 'advanced',
        description: 'The sharpest and most popular Sicilian variation.',
        mainLine: [
            { move: 'c5', reply: 'Nf3' },
            { move: 'd6', reply: 'd4' },
            { move: 'cxd4', reply: 'Nxd4' },
            { move: 'Nf6', reply: 'Nc3' },
            { move: 'a6', reply: null }
        ],
        variants: [
            {
                name: 'English Attack',
                after: 4,
                branchReply: 'Be3',
                continuation: [
                    { move: 'e5', reply: 'Nb3' },
                    { move: 'Be6', reply: null }
                ]
            },
            {
                name: 'Bg5 Main Line',
                after: 4,
                branchReply: 'Bg5',
                continuation: [
                    { move: 'e6', reply: 'f4' },
                    { move: 'Be7', reply: null }
                ]
            }
        ]
    }
];

/**
 * Common chess traps to practice recognizing and executing/avoiding.
 * Each trap has the setup moves and the critical trap move.
 */
export const TRAP_DATABASE = [
    {
        id: 'scholars_mate',
        title: "Scholar's Mate",
        difficulty: 'beginner',
        side: 'white',
        description: 'The 4-move checkmate targeting f7. Learn it to avoid falling for it!',
        category: 'Checkmate Traps',
        setupMoves: [
            { move: 'e4', reply: 'e5' },
            { move: 'Bc4', reply: 'Nc6' },
            { move: 'Qh5', reply: 'Nf6' }
        ],
        trapMove: 'Qxf7#',
        refutation: null,
        explanation: "Scholar's Mate attacks f7 with queen and bishop. Black's Nf6 blunders into mate. The correct defense is ...g6 or ...Qe7."
    },
    {
        id: 'scholars_mate_defense',
        title: "Scholar's Mate Defense",
        difficulty: 'beginner',
        side: 'black',
        description: 'Learn the correct way to defend against the Scholar\'s Mate attempt.',
        category: 'Defense Traps',
        setupMoves: [
            { move: 'e5', reply: 'Bc4' },
            { move: 'Nc6', reply: 'Qh5' }
        ],
        trapMove: 'g6',
        refutation: 'Qf3',
        explanation: 'Defend with ...g6 to block the queen. After Qf3, play ...Nf6 to develop with tempo while defending f7.'
    },
    {
        id: 'legal_trap',
        title: "Legal's Mate Trap",
        difficulty: 'intermediate',
        side: 'white',
        description: 'A famous knight sacrifice leading to checkmate.',
        category: 'Sacrifice Traps',
        setupMoves: [
            { move: 'e4', reply: 'e5' },
            { move: 'Nf3', reply: 'd6' },
            { move: 'Bc4', reply: 'Bg4' },
            { move: 'Nc3', reply: 'g6' }
        ],
        trapMove: 'Nxe5',
        refutation: null,
        explanation: "Legal's Trap: After Nxe5, if Black plays ...Bxd1?? then Bxf7+ Ke7, Nd5# is checkmate. Black should play ...dxe5 instead."
    },
    {
        id: 'fried_liver',
        title: 'Fried Liver Attack',
        difficulty: 'intermediate',
        side: 'white',
        description: 'A devastating knight sacrifice on f7 in the Italian Game.',
        category: 'Sacrifice Traps',
        setupMoves: [
            { move: 'e4', reply: 'e5' },
            { move: 'Nf3', reply: 'Nc6' },
            { move: 'Bc4', reply: 'Nf6' },
            { move: 'Ng5', reply: 'd5' },
            { move: 'exd5', reply: 'Nxd5' }
        ],
        trapMove: 'Nxf7',
        refutation: null,
        explanation: 'The Fried Liver sacrifices a knight on f7 to expose the black king. After ...Kxf7, Qf3+ leads to a fierce attack. Black should play ...Na5 or ...b5 instead of ...Nxd5.'
    },
    {
        id: 'stafford_gambit',
        title: 'Stafford Gambit Trap',
        difficulty: 'intermediate',
        side: 'black',
        description: 'A tricky gambit that punishes greedy play by White.',
        category: 'Gambit Traps',
        setupMoves: [
            { move: 'e5', reply: 'Nf3' },
            { move: 'Nf6', reply: 'Nxe5' },
            { move: 'Nc6', reply: 'Nxc6' },
            { move: 'dxc6', reply: 'd3' }
        ],
        trapMove: 'Bc5',
        refutation: null,
        explanation: 'After ...Bc5, Black has dangerous threats on f2. If White plays carelessly, ...Ng4 and ...Qh4 create unstoppable attacks.'
    },
    {
        id: 'elephant_trap',
        title: 'Elephant Trap (QGD)',
        difficulty: 'intermediate',
        side: 'black',
        description: "A classic trap in the Queen's Gambit Declined.",
        category: 'Positional Traps',
        setupMoves: [
            { move: 'e6', reply: 'Nc3' },
            { move: 'Nf6', reply: 'Bg5' },
            { move: 'Nbd7', reply: 'cxd5' },
            { move: 'exd5', reply: 'Nxd5' }
        ],
        trapMove: 'Nxd5',
        refutation: null,
        explanation: 'The Elephant Trap: After White captures ...Nxd5??, Black plays ...Bb4+ winning the pinned piece. If Nxd7, Bxd1 wins the queen.'
    },
    {
        id: 'lasker_trap',
        title: 'Lasker Trap',
        difficulty: 'intermediate',
        side: 'black',
        description: "Emanuel Lasker's famous trap in the Queen's Gambit Accepted.",
        category: 'Sacrifice Traps',
        setupMoves: [
            { move: 'dxc4', reply: 'e3' },
            { move: 'b5', reply: 'a4' },
            { move: 'c6', reply: 'axb5' },
            { move: 'cxb5', reply: 'Qf3' }
        ],
        trapMove: 'Nc6',
        refutation: null,
        explanation: "Lasker's trap threatens ...Nd4 forking the queen and c2. If Qxb5?? then ...Nd4 wins the queen. White must be careful."
    },
    {
        id: 'blackburne_shilling',
        title: 'Blackburne Shilling Gambit',
        difficulty: 'intermediate',
        side: 'black',
        description: 'A sneaky gambit that punishes Nxe5.',
        category: 'Gambit Traps',
        setupMoves: [
            { move: 'e5', reply: 'Nf3' },
            { move: 'Nd4', reply: 'Nxe5' }
        ],
        trapMove: 'Qg5',
        refutation: null,
        explanation: 'After ...Qg5, Black attacks both g2 and e5. If Nxf7?? Qxg2 threatens Qxe4+ with devastating effect. White must return the knight.'
    },
    {
        id: 'fishing_pole',
        title: 'Fishing Pole Trap',
        difficulty: 'advanced',
        side: 'black',
        description: 'A subtle h5-h4 pawn thrust in the Ruy Lopez.',
        category: 'Pawn Traps',
        setupMoves: [
            { move: 'e5', reply: 'Nf3' },
            { move: 'Nc6', reply: 'Bb5' },
            { move: 'Nf6', reply: 'O-O' },
            { move: 'Ng4', reply: 'h3' }
        ],
        trapMove: 'h5',
        refutation: null,
        explanation: 'The Fishing Pole sets up ...h4 next, opening the h-file. After hxg4 hxg4, the h-file becomes a highway to White\'s king.'
    },
    {
        id: 'noah_ark_trap',
        title: "Noah's Ark Trap",
        difficulty: 'advanced',
        side: 'black',
        description: 'Trap the Ruy Lopez bishop with a pawn net.',
        category: 'Positional Traps',
        setupMoves: [
            { move: 'e5', reply: 'Nf3' },
            { move: 'Nc6', reply: 'Bb5' },
            { move: 'a6', reply: 'Ba4' },
            { move: 'd6', reply: 'd4' },
            { move: 'b5', reply: 'Bb3' }
        ],
        trapMove: 'Na5',
        refutation: null,
        explanation: "Noah's Ark Trap: The knight goes to a5, and after ...c4 the bishop on b3 is trapped by the pawns. One of the oldest known traps in chess."
    },
    {
        id: 'englund_gambit_trap',
        title: 'Englund Gambit Trap',
        difficulty: 'intermediate',
        side: 'black',
        description: 'A sneaky queen trap after 1.d4 e5.',
        category: 'Gambit Traps',
        setupMoves: [
            { move: 'e5', reply: 'dxe5' },
            { move: 'Nc6', reply: 'Nf3' },
            { move: 'Qe7', reply: 'Bf4' }
        ],
        trapMove: 'Qb4+',
        refutation: null,
        explanation: 'After ...Qb4+, White must block and Black wins back the pawn with a better position. If Bd2?? Qxb2 attacks the rook and is winning.'
    },
    {
        id: 'budapest_trap',
        title: 'Budapest Gambit Trap',
        difficulty: 'advanced',
        side: 'black',
        description: 'A sharp gambit trap against 1.d4.',
        category: 'Gambit Traps',
        setupMoves: [
            { move: 'Nf6', reply: 'c4' },
            { move: 'e5', reply: 'dxe5' },
            { move: 'Ng4', reply: 'Bf4' }
        ],
        trapMove: 'Nc6',
        refutation: null,
        explanation: 'Black develops with tempo. The threat is ...Bb4+ followed by ...Qe7 regaining the pawn. If White is careless, ...Nxe5 or ...Qh4 creates big problems.'
    }
];

// ============================================
// Coach State
// ============================================

const STORAGE_KEY_OPENING = 'chess_coach_opening_progress';
const STORAGE_KEY_TRAP = 'chess_coach_trap_progress';

/**
 * Internal state for the opening coach
 */
const openingCoachState = {
    active: false,
    currentOpening: null,
    currentPath: null,       // 'main' or variant name
    moveIndex: 0,
    userSide: 'white',
    attempts: 0,
    correctMoves: 0,
    wrongMoves: 0,
    completedPaths: [],      // track which lines are done this session
    waitingForReply: false,
    onPositionLoad: null,
    onMoveValidation: null
};

/**
 * Internal state for the trap coach
 */
const trapCoachState = {
    active: false,
    currentTrap: null,
    moveIndex: 0,
    userSide: 'white',
    attempts: 0,
    correctMoves: 0,
    wrongMoves: 0,
    waitingForReply: false,
    targetAccuracy: 90,
    onPositionLoad: null,
    onMoveValidation: null
};

// ============================================
// Progress Persistence
// ============================================

function loadOpeningProgress() {
    try {
        const data = localStorage.getItem(STORAGE_KEY_OPENING);
        return data ? JSON.parse(data) : {};
    } catch {
        return {};
    }
}

function saveOpeningProgress(progress) {
    try {
        localStorage.setItem(STORAGE_KEY_OPENING, JSON.stringify(progress));
    } catch (e) {
        console.warn('Failed to save opening progress:', e);
    }
}

function loadTrapProgress() {
    try {
        const data = localStorage.getItem(STORAGE_KEY_TRAP);
        return data ? JSON.parse(data) : {};
    } catch {
        return {};
    }
}

function saveTrapProgress(progress) {
    try {
        localStorage.setItem(STORAGE_KEY_TRAP, JSON.stringify(progress));
    } catch (e) {
        console.warn('Failed to save trap progress:', e);
    }
}

/**
 * Gets the accuracy percentage for an opening (across all paths)
 */
function getOpeningAccuracy(openingId) {
    const progress = loadOpeningProgress();
    const data = progress[openingId];
    if (!data || !data.totalAttempts) return 0;
    return Math.round((data.correctMoves / data.totalAttempts) * 100);
}

/**
 * Gets the accuracy for a specific trap
 */
function getTrapAccuracy(trapId) {
    const progress = loadTrapProgress();
    const data = progress[trapId];
    if (!data || !data.totalAttempts) return 0;
    return Math.round((data.correct / data.totalAttempts) * 100);
}

/**
 * Records an opening practice result
 */
function recordOpeningResult(openingId, pathName, correct, total) {
    const progress = loadOpeningProgress();
    if (!progress[openingId]) {
        progress[openingId] = {
            correctMoves: 0,
            totalAttempts: 0,
            paths: {},
            lastPracticed: null,
            perfectRuns: 0
        };
    }

    progress[openingId].correctMoves += correct;
    progress[openingId].totalAttempts += total;
    progress[openingId].lastPracticed = new Date().toISOString();

    if (!progress[openingId].paths[pathName]) {
        progress[openingId].paths[pathName] = { correct: 0, total: 0, perfect: false };
    }
    progress[openingId].paths[pathName].correct += correct;
    progress[openingId].paths[pathName].total += total;

    if (correct === total) {
        progress[openingId].paths[pathName].perfect = true;
        // Check if all paths are perfect
        const opening = OPENING_REPERTOIRE.find(o => o.id === openingId);
        if (opening) {
            const allPaths = ['main', ...opening.variants.map(v => v.name)];
            const allPerfect = allPaths.every(p =>
                progress[openingId].paths[p] && progress[openingId].paths[p].perfect
            );
            if (allPerfect) {
                progress[openingId].perfectRuns++;
            }
        }
    }

    saveOpeningProgress(progress);
}

/**
 * Records a trap practice result
 */
function recordTrapResult(trapId, correct) {
    const progress = loadTrapProgress();
    if (!progress[trapId]) {
        progress[trapId] = {
            correct: 0,
            totalAttempts: 0,
            lastPracticed: null
        };
    }

    progress[trapId].totalAttempts++;
    if (correct) progress[trapId].correct++;
    progress[trapId].lastPracticed = new Date().toISOString();

    saveTrapProgress(progress);
}

// ============================================
// Opening Coach Logic
// ============================================

/**
 * Gets the current move sequence for the active path
 */
function getCurrentMoveSequence() {
    const { currentOpening, currentPath } = openingCoachState;
    if (!currentOpening) return [];

    if (currentPath === 'main') {
        return currentOpening.mainLine;
    }

    const variant = currentOpening.variants.find(v => v.name === currentPath);
    if (!variant) return [];

    // Return main line up to branch point, then variant continuation
    const prefix = currentOpening.mainLine.slice(0, variant.after);
    // Add the branch reply as part of the last prefix move
    const lastPrefixMove = { ...prefix[prefix.length - 1], reply: variant.branchReply };
    return [...prefix.slice(0, -1), lastPrefixMove, ...variant.continuation];
}

/**
 * Gets the expected user move at the current index
 */
function getExpectedMove() {
    const sequence = getCurrentMoveSequence();
    const { moveIndex, userSide } = openingCoachState;

    if (moveIndex >= sequence.length) return null;

    const step = sequence[moveIndex];
    if (userSide === 'white') {
        return step.move;
    } else {
        return step.reply;
    }
}

/**
 * Gets the opponent's reply at the current index
 */
function getOpponentReply() {
    const sequence = getCurrentMoveSequence();
    const { moveIndex, userSide } = openingCoachState;

    if (moveIndex >= sequence.length) return null;

    const step = sequence[moveIndex];
    if (userSide === 'white') {
        return step.reply;
    } else {
        return step.move;
    }
}

/**
 * Starts the opening coach for a specific opening
 */
export function startOpeningCoach(openingId, callbacks = {}) {
    const opening = OPENING_REPERTOIRE.find(o => o.id === openingId);
    if (!opening) return false;

    openingCoachState.active = true;
    openingCoachState.currentOpening = opening;
    openingCoachState.currentPath = 'main';
    openingCoachState.moveIndex = 0;
    openingCoachState.userSide = opening.side;
    openingCoachState.attempts = 0;
    openingCoachState.correctMoves = 0;
    openingCoachState.wrongMoves = 0;
    openingCoachState.completedPaths = [];
    openingCoachState.waitingForReply = false;
    openingCoachState.onPositionLoad = callbacks.onPositionLoad || null;
    openingCoachState.onMoveValidation = callbacks.onMoveValidation || null;

    // If user plays black, the opponent (white) moves first
    if (opening.side === 'black') {
        openingCoachState.waitingForReply = true;
    }

    return true;
}

/**
 * Validates a user move in the opening coach
 * Returns: { correct, expectedMove, isComplete, nextPath }
 */
export function validateOpeningMove(moveSan) {
    if (!openingCoachState.active) return null;

    const expected = getExpectedMove();
    if (!expected) {
        return { correct: true, isComplete: true };
    }

    const isCorrect = moveSan === expected;
    openingCoachState.attempts++;

    if (isCorrect) {
        openingCoachState.correctMoves++;

        // Check if there's an opponent reply
        const reply = getOpponentReply();
        if (reply) {
            openingCoachState.waitingForReply = true;
        }

        // Advance
        openingCoachState.moveIndex++;

        const sequence = getCurrentMoveSequence();
        const isPathComplete = openingCoachState.moveIndex >= sequence.length;

        if (isPathComplete) {
            return handlePathComplete();
        }

        return {
            correct: true,
            expectedMove: expected,
            opponentReply: reply,
            isComplete: false,
            moveIndex: openingCoachState.moveIndex,
            path: openingCoachState.currentPath
        };
    } else {
        openingCoachState.wrongMoves++;
        return {
            correct: false,
            expectedMove: expected,
            played: moveSan,
            isComplete: false,
            hint: `The correct move is ${expected}`,
            moveIndex: openingCoachState.moveIndex,
            path: openingCoachState.currentPath
        };
    }
}

/**
 * Handles completion of a path (main line or variant)
 */
function handlePathComplete() {
    const { currentOpening, currentPath, correctMoves, attempts } = openingCoachState;

    openingCoachState.completedPaths.push(currentPath);

    // Record result
    const pathMoveCount = getCurrentMoveSequence().length;
    const pathCorrect = openingCoachState.correctMoves;
    recordOpeningResult(currentOpening.id, currentPath, pathCorrect, openingCoachState.attempts);

    // Check for next uncompleted variant
    const allPaths = ['main', ...currentOpening.variants.map(v => v.name)];
    const nextPath = allPaths.find(p => !openingCoachState.completedPaths.includes(p));

    if (nextPath) {
        // Move to next variant
        openingCoachState.currentPath = nextPath;
        openingCoachState.moveIndex = 0;
        openingCoachState.attempts = 0;
        openingCoachState.correctMoves = 0;
        openingCoachState.waitingForReply = currentOpening.side === 'black';

        return {
            correct: true,
            isComplete: false,
            pathComplete: true,
            completedPath: currentPath,
            nextPath: nextPath,
            accuracy: attempts > 0 ? Math.round((correctMoves / attempts) * 100) : 100,
            moveIndex: 0,
            path: nextPath
        };
    }

    // All paths completed
    const overallAccuracy = getOpeningAccuracy(currentOpening.id);
    openingCoachState.active = false;

    return {
        correct: true,
        isComplete: true,
        pathComplete: true,
        completedPath: currentPath,
        allPathsComplete: true,
        overallAccuracy,
        mastered: overallAccuracy === 100
    };
}

/**
 * Signals that the opponent reply has been played on the board
 */
export function openingCoachReplyPlayed() {
    openingCoachState.waitingForReply = false;
}

/**
 * Gets the opponent's next reply (for auto-playing)
 */
export function getOpeningCoachReply() {
    if (!openingCoachState.active || !openingCoachState.waitingForReply) return null;
    return getOpponentReply();
}

/**
 * Gets the first move for the opponent when user plays black
 */
export function getOpeningCoachFirstMove() {
    if (!openingCoachState.active) return null;

    const sequence = getCurrentMoveSequence();
    if (sequence.length === 0) return null;

    if (openingCoachState.userSide === 'black') {
        // White moves first - return the "reply" field which is white's move
        return sequence[0].reply;
    } else if (openingCoachState.userSide === 'white') {
        return null; // User moves first
    }
    return null;
}

/**
 * Checks if the opening coach is active
 */
export function isOpeningCoachActive() {
    return openingCoachState.active;
}

/**
 * Stops the opening coach
 */
export function stopOpeningCoach() {
    openingCoachState.active = false;
    openingCoachState.currentOpening = null;
    openingCoachState.currentPath = null;
}

/**
 * Gets the current opening coach status for UI display
 */
export function getOpeningCoachStatus() {
    if (!openingCoachState.active) return null;

    const { currentOpening, currentPath, moveIndex, attempts, correctMoves, completedPaths } = openingCoachState;
    const sequence = getCurrentMoveSequence();
    const allPaths = ['main', ...currentOpening.variants.map(v => v.name)];

    return {
        opening: currentOpening.title,
        currentPath,
        moveIndex,
        totalMoves: sequence.length,
        attempts,
        correctMoves,
        accuracy: attempts > 0 ? Math.round((correctMoves / attempts) * 100) : 100,
        completedPaths: completedPaths.length,
        totalPaths: allPaths.length,
        pathNames: allPaths,
        side: currentOpening.side,
        waitingForReply: openingCoachState.waitingForReply
    };
}

// ============================================
// Trap Coach Logic
// ============================================

/**
 * Gets the move sequence for the current trap
 */
function getTrapMoveSequence() {
    const { currentTrap, userSide } = trapCoachState;
    if (!currentTrap) return [];
    return currentTrap.setupMoves;
}

/**
 * Gets the expected user move in the trap at current index
 */
function getTrapExpectedMove() {
    const { currentTrap, moveIndex, userSide } = trapCoachState;
    if (!currentTrap) return null;

    const sequence = currentTrap.setupMoves;

    // During setup moves
    if (moveIndex < sequence.length) {
        const step = sequence[moveIndex];
        return userSide === currentTrap.side ? step.move : step.reply;
    }

    // At the trap move
    if (moveIndex === sequence.length) {
        if (userSide === currentTrap.side) {
            return currentTrap.trapMove;
        }
        return null;
    }

    return null;
}

/**
 * Gets opponent reply during trap setup
 */
function getTrapOpponentReply() {
    const { currentTrap, moveIndex, userSide } = trapCoachState;
    if (!currentTrap) return null;

    const sequence = currentTrap.setupMoves;

    if (moveIndex < sequence.length) {
        const step = sequence[moveIndex];
        return userSide === currentTrap.side ? step.reply : step.move;
    }

    return null;
}

/**
 * Starts the trap coach for a specific trap
 */
export function startTrapCoach(trapId, callbacks = {}) {
    const trap = TRAP_DATABASE.find(t => t.id === trapId);
    if (!trap) return false;

    trapCoachState.active = true;
    trapCoachState.currentTrap = trap;
    trapCoachState.moveIndex = 0;
    trapCoachState.userSide = trap.side;
    trapCoachState.attempts = 0;
    trapCoachState.correctMoves = 0;
    trapCoachState.wrongMoves = 0;
    trapCoachState.waitingForReply = false;
    trapCoachState.onPositionLoad = callbacks.onPositionLoad || null;
    trapCoachState.onMoveValidation = callbacks.onMoveValidation || null;

    // If user plays black and it's a white-first opening context
    if (trap.side === 'black') {
        trapCoachState.waitingForReply = true;
    }

    return true;
}

/**
 * Validates a user move in the trap coach
 */
export function validateTrapMove(moveSan) {
    if (!trapCoachState.active) return null;

    const expected = getTrapExpectedMove();
    if (!expected) {
        return { correct: true, isComplete: true };
    }

    const isCorrect = moveSan === expected;
    trapCoachState.attempts++;

    if (isCorrect) {
        trapCoachState.correctMoves++;

        const reply = getTrapOpponentReply();
        if (reply) {
            trapCoachState.waitingForReply = true;
        }

        trapCoachState.moveIndex++;

        const { currentTrap, moveIndex } = trapCoachState;
        // Check if we just played the trap move (setup length + 1)
        const isTrapComplete = moveIndex > currentTrap.setupMoves.length;

        if (isTrapComplete) {
            const accuracy = trapCoachState.attempts > 0
                ? Math.round((trapCoachState.correctMoves / trapCoachState.attempts) * 100)
                : 100;

            recordTrapResult(currentTrap.id, true);
            trapCoachState.active = false;

            return {
                correct: true,
                isComplete: true,
                trapExecuted: true,
                accuracy,
                explanation: currentTrap.explanation,
                overallAccuracy: getTrapAccuracy(currentTrap.id)
            };
        }

        // Check if next expected is the trap move
        const nextExpected = getTrapExpectedMove();
        const isApproachingTrap = moveIndex === currentTrap.setupMoves.length;

        return {
            correct: true,
            expectedMove: expected,
            opponentReply: reply,
            isComplete: false,
            moveIndex,
            isApproachingTrap,
            trapHint: isApproachingTrap ? `Now find the trap move!` : null
        };
    } else {
        trapCoachState.wrongMoves++;
        recordTrapResult(trapCoachState.currentTrap.id, false);

        return {
            correct: false,
            expectedMove: expected,
            played: moveSan,
            isComplete: false,
            hint: `The correct move is ${expected}`,
            moveIndex: trapCoachState.moveIndex
        };
    }
}

/**
 * Signals the opponent reply was played on the board
 */
export function trapCoachReplyPlayed() {
    trapCoachState.waitingForReply = false;
}

/**
 * Gets opponent's next reply for auto-play
 */
export function getTrapCoachReply() {
    if (!trapCoachState.active || !trapCoachState.waitingForReply) return null;
    return getTrapOpponentReply();
}

/**
 * Gets the first move for the opponent when user plays the non-first-move side
 */
export function getTrapCoachFirstMove() {
    if (!trapCoachState.active) return null;

    const sequence = trapCoachState.currentTrap.setupMoves;
    if (sequence.length === 0) return null;

    if (trapCoachState.userSide === 'black') {
        return sequence[0].reply;
    }
    return null;
}

/**
 * Checks if the trap coach is active
 */
export function isTrapCoachActive() {
    return trapCoachState.active;
}

/**
 * Stops the trap coach
 */
export function stopTrapCoach() {
    trapCoachState.active = false;
    trapCoachState.currentTrap = null;
}

/**
 * Gets the current trap coach status
 */
export function getTrapCoachStatus() {
    if (!trapCoachState.active) return null;

    const { currentTrap, moveIndex, attempts, correctMoves } = trapCoachState;

    return {
        trap: currentTrap.title,
        moveIndex,
        totalMoves: currentTrap.setupMoves.length + 1,
        attempts,
        correctMoves,
        accuracy: attempts > 0 ? Math.round((correctMoves / attempts) * 100) : 100,
        side: currentTrap.side,
        waitingForReply: trapCoachState.waitingForReply,
        isAtTrapMove: moveIndex === currentTrap.setupMoves.length
    };
}

/**
 * Gets the target accuracy for trap coach
 */
export function getTrapTargetAccuracy() {
    return trapCoachState.targetAccuracy;
}

/**
 * Sets the target accuracy for trap coach
 */
export function setTrapTargetAccuracy(accuracy) {
    trapCoachState.targetAccuracy = Math.max(50, Math.min(100, accuracy));
}

// ============================================
// UI Rendering
// ============================================

/**
 * Renders the Opening Coach panel
 */
export function renderOpeningCoachPanel(container) {
    const progress = loadOpeningProgress();

    const openingsByDifficulty = {
        beginner: OPENING_REPERTOIRE.filter(o => o.difficulty === 'beginner'),
        intermediate: OPENING_REPERTOIRE.filter(o => o.difficulty === 'intermediate'),
        advanced: OPENING_REPERTOIRE.filter(o => o.difficulty === 'advanced')
    };

    let html = `
        <div class="coach-panel opening-coach-panel">
            <div class="coach-header">
                <h3>Opening Coach</h3>
                <p class="coach-description">Practice openings through repetition until you reach 100% accuracy on all lines and variants.</p>
            </div>
    `;

    // Active session display
    if (openingCoachState.active) {
        const status = getOpeningCoachStatus();
        html += renderActiveOpeningSession(status);
    } else {
        // Opening list grouped by difficulty
        for (const [level, openings] of Object.entries(openingsByDifficulty)) {
            if (openings.length === 0) continue;

            const levelLabel = level.charAt(0).toUpperCase() + level.slice(1);
            html += `<div class="coach-difficulty-group">
                <h4 class="difficulty-label difficulty-${level}">${levelLabel}</h4>
                <div class="coach-opening-list">`;

            for (const opening of openings) {
                const accuracy = getOpeningAccuracy(opening.id);
                const data = progress[opening.id];
                const pathCount = 1 + opening.variants.length;
                const masteredPaths = data ? Object.values(data.paths || {}).filter(p => p.perfect).length : 0;
                const isMastered = accuracy === 100 && masteredPaths === pathCount;

                html += `
                    <div class="coach-opening-card ${isMastered ? 'mastered' : ''}" data-opening-id="${opening.id}">
                        <div class="opening-card-header">
                            <span class="opening-eco">${opening.eco}</span>
                            <span class="opening-side ${opening.side}">${opening.side === 'white' ? 'White' : 'Black'}</span>
                        </div>
                        <div class="opening-card-title">${opening.title}</div>
                        <div class="opening-card-desc">${opening.description}</div>
                        <div class="opening-card-stats">
                            <div class="accuracy-bar-container">
                                <div class="accuracy-bar" style="width: ${accuracy}%"></div>
                            </div>
                            <span class="accuracy-text ${accuracy === 100 ? 'perfect' : ''}">${accuracy}%</span>
                        </div>
                        <div class="opening-card-paths">
                            ${masteredPaths}/${pathCount} lines mastered
                        </div>
                        <button class="coach-start-btn" data-opening-id="${opening.id}">
                            ${isMastered ? 'Review' : 'Practice'}
                        </button>
                    </div>`;
            }

            html += `</div></div>`;
        }
    }

    html += `</div>`;
    container.innerHTML = html;

    // Bind event listeners
    container.querySelectorAll('.coach-start-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.openingId;
            if (id) {
                const event = new CustomEvent('openingCoachStart', { detail: { openingId: id } });
                document.dispatchEvent(event);
            }
        });
    });

    const stopBtn = container.querySelector('.coach-stop-btn');
    if (stopBtn) {
        stopBtn.addEventListener('click', () => {
            stopOpeningCoach();
            renderOpeningCoachPanel(container);
            document.dispatchEvent(new CustomEvent('openingCoachStop'));
        });
    }
}

/**
 * Renders the active opening practice session
 */
function renderActiveOpeningSession(status) {
    const progressPct = status.totalMoves > 0
        ? Math.round((status.moveIndex / status.totalMoves) * 100) : 0;

    return `
        <div class="coach-active-session">
            <div class="session-header">
                <span class="session-opening">${status.opening}</span>
                <span class="session-path">${status.currentPath === 'main' ? 'Main Line' : status.currentPath}</span>
            </div>
            <div class="session-progress">
                <div class="session-progress-bar">
                    <div class="session-progress-fill" style="width: ${progressPct}%"></div>
                </div>
                <span class="session-progress-text">Move ${status.moveIndex + 1} of ${status.totalMoves}</span>
            </div>
            <div class="session-stats-row">
                <div class="session-stat">
                    <span class="stat-number">${status.accuracy}%</span>
                    <span class="stat-desc">Accuracy</span>
                </div>
                <div class="session-stat">
                    <span class="stat-number">${status.completedPaths}/${status.totalPaths}</span>
                    <span class="stat-desc">Lines Done</span>
                </div>
            </div>
            <div class="session-side-indicator">
                Playing as <strong>${status.side}</strong>
                ${status.waitingForReply ? '<span class="waiting-badge">Opponent moving...</span>' : '<span class="your-turn-badge">Your turn</span>'}
            </div>
            <button class="coach-stop-btn">Stop Practice</button>
        </div>`;
}

/**
 * Renders the Trap Coach panel
 */
export function renderTrapCoachPanel(container) {
    const progress = loadTrapProgress();
    const targetAccuracy = trapCoachState.targetAccuracy;

    const trapsByCategory = {};
    TRAP_DATABASE.forEach(trap => {
        if (!trapsByCategory[trap.category]) {
            trapsByCategory[trap.category] = [];
        }
        trapsByCategory[trap.category].push(trap);
    });

    let html = `
        <div class="coach-panel trap-coach-panel">
            <div class="coach-header">
                <h3>Trap Coach</h3>
                <p class="coach-description">Learn and practice common chess traps. Set your target accuracy goal.</p>
                <div class="trap-target-setting">
                    <label>Target Accuracy:</label>
                    <select id="trapTargetAccuracy" class="trap-accuracy-select">
                        <option value="70" ${targetAccuracy === 70 ? 'selected' : ''}>70%</option>
                        <option value="80" ${targetAccuracy === 80 ? 'selected' : ''}>80%</option>
                        <option value="90" ${targetAccuracy === 90 ? 'selected' : ''}>90%</option>
                        <option value="95" ${targetAccuracy === 95 ? 'selected' : ''}>95%</option>
                        <option value="100" ${targetAccuracy === 100 ? 'selected' : ''}>100%</option>
                    </select>
                </div>
            </div>
    `;

    if (trapCoachState.active) {
        const status = getTrapCoachStatus();
        html += renderActiveTrapSession(status);
    } else {
        for (const [category, traps] of Object.entries(trapsByCategory)) {
            html += `<div class="coach-trap-category">
                <h4 class="trap-category-label">${category}</h4>
                <div class="coach-trap-list">`;

            for (const trap of traps) {
                const accuracy = getTrapAccuracy(trap.id);
                const data = progress[trap.id];
                const totalAttempts = data ? data.totalAttempts : 0;
                const meetsTarget = accuracy >= targetAccuracy && totalAttempts > 0;

                html += `
                    <div class="coach-trap-card ${meetsTarget ? 'mastered' : ''}" data-trap-id="${trap.id}">
                        <div class="trap-card-header">
                            <span class="trap-difficulty difficulty-${trap.difficulty}">${trap.difficulty}</span>
                            <span class="trap-side ${trap.side}">${trap.side === 'white' ? 'White' : 'Black'}</span>
                        </div>
                        <div class="trap-card-title">${trap.title}</div>
                        <div class="trap-card-desc">${trap.description}</div>
                        <div class="trap-card-stats">
                            <div class="accuracy-bar-container">
                                <div class="accuracy-bar ${meetsTarget ? 'target-met' : ''}" style="width: ${accuracy}%"></div>
                            </div>
                            <span class="accuracy-text ${meetsTarget ? 'perfect' : ''}">${accuracy}%</span>
                        </div>
                        <div class="trap-card-attempts">
                            ${totalAttempts} attempt${totalAttempts !== 1 ? 's' : ''}
                            ${meetsTarget ? ' - Target reached!' : ''}
                        </div>
                        <button class="coach-start-btn" data-trap-id="${trap.id}">
                            ${meetsTarget ? 'Review' : 'Practice'}
                        </button>
                    </div>`;
            }

            html += `</div></div>`;
        }
    }

    html += `</div>`;
    container.innerHTML = html;

    // Bind events
    const targetSelect = container.querySelector('#trapTargetAccuracy');
    if (targetSelect) {
        targetSelect.addEventListener('change', (e) => {
            setTrapTargetAccuracy(parseInt(e.target.value));
            if (!trapCoachState.active) {
                renderTrapCoachPanel(container);
            }
        });
    }

    container.querySelectorAll('.coach-start-btn[data-trap-id]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.trapId;
            if (id) {
                const event = new CustomEvent('trapCoachStart', { detail: { trapId: id } });
                document.dispatchEvent(event);
            }
        });
    });

    const stopBtn = container.querySelector('.coach-stop-btn');
    if (stopBtn) {
        stopBtn.addEventListener('click', () => {
            stopTrapCoach();
            renderTrapCoachPanel(container);
            document.dispatchEvent(new CustomEvent('trapCoachStop'));
        });
    }
}

/**
 * Renders the active trap practice session
 */
function renderActiveTrapSession(status) {
    const progressPct = status.totalMoves > 0
        ? Math.round((status.moveIndex / status.totalMoves) * 100) : 0;

    return `
        <div class="coach-active-session trap-session">
            <div class="session-header">
                <span class="session-opening">${status.trap}</span>
                ${status.isAtTrapMove ? '<span class="trap-move-badge">Find the trap!</span>' : ''}
            </div>
            <div class="session-progress">
                <div class="session-progress-bar">
                    <div class="session-progress-fill" style="width: ${progressPct}%"></div>
                </div>
                <span class="session-progress-text">Move ${status.moveIndex + 1} of ${status.totalMoves}</span>
            </div>
            <div class="session-stats-row">
                <div class="session-stat">
                    <span class="stat-number">${status.accuracy}%</span>
                    <span class="stat-desc">Accuracy</span>
                </div>
            </div>
            <div class="session-side-indicator">
                Playing as <strong>${status.side}</strong>
                ${status.waitingForReply ? '<span class="waiting-badge">Opponent moving...</span>' : '<span class="your-turn-badge">Your turn</span>'}
            </div>
            <button class="coach-stop-btn">Stop Practice</button>
        </div>`;
}

/**
 * Gets overall opening coach statistics
 */
export function getOpeningCoachStats() {
    const progress = loadOpeningProgress();
    let totalMastered = 0;
    let totalOpenings = OPENING_REPERTOIRE.length;
    let totalAccuracy = 0;
    let practicedCount = 0;

    OPENING_REPERTOIRE.forEach(opening => {
        const acc = getOpeningAccuracy(opening.id);
        if (progress[opening.id]) {
            practicedCount++;
            totalAccuracy += acc;
            const pathCount = 1 + opening.variants.length;
            const masteredPaths = Object.values(progress[opening.id].paths || {}).filter(p => p.perfect).length;
            if (acc === 100 && masteredPaths === pathCount) {
                totalMastered++;
            }
        }
    });

    return {
        totalOpenings,
        totalMastered,
        averageAccuracy: practicedCount > 0 ? Math.round(totalAccuracy / practicedCount) : 0,
        practicedCount
    };
}

/**
 * Gets overall trap coach statistics
 */
export function getTrapCoachStats() {
    const progress = loadTrapProgress();
    const targetAccuracy = trapCoachState.targetAccuracy;
    let totalTraps = TRAP_DATABASE.length;
    let metTarget = 0;
    let totalAccuracy = 0;
    let practicedCount = 0;

    TRAP_DATABASE.forEach(trap => {
        const acc = getTrapAccuracy(trap.id);
        const data = progress[trap.id];
        if (data && data.totalAttempts > 0) {
            practicedCount++;
            totalAccuracy += acc;
            if (acc >= targetAccuracy) {
                metTarget++;
            }
        }
    });

    return {
        totalTraps,
        metTarget,
        targetAccuracy,
        averageAccuracy: practicedCount > 0 ? Math.round(totalAccuracy / practicedCount) : 0,
        practicedCount
    };
}
