/**
 * @fileoverview Openings and Endgames Learning Module
 * Comprehensive training system for chess openings and endgame patterns
 */

/**
 * Popular Chess Openings Library
 * Covers the most common and important opening positions
 */
export const OPENINGS_LIBRARY = [
    {
        id: 'italian_game',
        title: 'Italian Game',
        eco: 'C50',
        category: 'Open Games',
        difficulty: 'beginner',
        positions: [
            {
                title: 'Italian Game - Main Position',
                fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
                description: 'Control the center and develop quickly. The bishop on c4 aims at the weak f7 square.',
                keyIdeas: [
                    'Develop pieces quickly',
                    'Attack the f7 pawn',
                    'Prepare d4 pawn break'
                ],
                nextMoves: ['Bc5', 'Nf6', 'd6']
            },
            {
                title: 'Italian Game - Giuoco Piano',
                fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
                description: 'The quiet Italian Game (Giuoco Piano). Both sides develop naturally.',
                keyIdeas: [
                    'Play c3 and d4 to challenge the center',
                    'Castle kingside for safety',
                    'Develop the queen to b3 or e2'
                ],
                nextMoves: ['c3', 'd3', 'O-O']
            }
        ]
    },
    {
        id: 'spanish_opening',
        title: 'Spanish Opening (Ruy Lopez)',
        eco: 'C60',
        category: 'Open Games',
        difficulty: 'intermediate',
        positions: [
            {
                title: 'Ruy Lopez - Main Line',
                fen: 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
                description: 'The Spanish Opening puts pressure on the knight that defends e5.',
                keyIdeas: [
                    'Attack the defender of e5',
                    'Prepare to castle kingside',
                    'Build a strong pawn center with d4'
                ],
                nextMoves: ['a6', 'Nf6', 'Bc5']
            },
            {
                title: 'Ruy Lopez - Berlin Defense',
                fen: 'r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
                description: 'The solid Berlin Defense, popularized by Kramnik.',
                keyIdeas: [
                    'Very solid and defensive',
                    'Allows trading queens after Nxe4',
                    'Difficult for White to gain advantage'
                ],
                nextMoves: ['O-O', 'd3', 'Nc3']
            }
        ]
    },
    {
        id: 'french_defense',
        title: 'French Defense',
        eco: 'C00',
        category: 'Semi-Closed Games',
        difficulty: 'intermediate',
        positions: [
            {
                title: 'French Defense - Main Position',
                fen: 'rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
                description: 'Black fights for the center from move one with e6.',
                keyIdeas: [
                    'Challenge White\'s center with d5',
                    'Develop the light-squared bishop before playing e6',
                    'Counterattack on the queenside'
                ],
                nextMoves: ['d4', 'd3', 'Nc3']
            },
            {
                title: 'French Defense - Advance Variation',
                fen: 'rnbqkbnr/ppp2ppp/4p3/3pP3/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3',
                description: 'White advances in the center, gaining space but creating weaknesses.',
                keyIdeas: [
                    'Attack the pawn chain with c5',
                    'Develop pieces to pressure White\'s center',
                    'Prepare f6 to undermine e5'
                ],
                nextMoves: ['c5', 'Nc6', 'Qb6']
            }
        ]
    },
    {
        id: 'sicilian_defense',
        title: 'Sicilian Defense',
        eco: 'B20',
        category: 'Semi-Open Games',
        difficulty: 'intermediate',
        positions: [
            {
                title: 'Sicilian Defense - Open Sicilian',
                fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
                description: 'The most popular defense to 1.e4, fighting for the initiative.',
                keyIdeas: [
                    'Asymmetrical pawn structure',
                    'Black gets queenside pawn majority',
                    'Sharp tactical play expected'
                ],
                nextMoves: ['Nf3', 'd4', 'c3']
            },
            {
                title: 'Sicilian Defense - Dragon Variation',
                fen: 'rnbqkb1r/pp2pp1p/3p1np1/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6',
                description: 'The Dragon Variation - Black fianchettoes the kingside bishop.',
                keyIdeas: [
                    'Attack on opposite sides',
                    'Black\'s bishop on g7 is very powerful',
                    'Race to deliver checkmate first'
                ],
                nextMoves: ['Be3', 'Be2', 'f3']
            }
        ]
    },
    {
        id: 'queens_gambit',
        title: 'Queen\'s Gambit',
        eco: 'D06',
        category: 'Closed Games',
        difficulty: 'beginner',
        positions: [
            {
                title: 'Queen\'s Gambit - Main Position',
                fen: 'rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2',
                description: 'White offers a pawn to gain control of the center.',
                keyIdeas: [
                    'Not a real gambit - pawn can be regained',
                    'Control the center with pieces',
                    'Develop smoothly'
                ],
                nextMoves: ['e6', 'c6', 'dxc4']
            },
            {
                title: 'Queen\'s Gambit Declined',
                fen: 'rnbqkbnr/ppp2ppp/4p3/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3',
                description: 'Black declines the gambit and maintains the center.',
                keyIdeas: [
                    'Solid and classical approach',
                    'Control d5 square',
                    'Develop pieces naturally'
                ],
                nextMoves: ['Nc3', 'Nf3', 'cxd5']
            }
        ]
    },
    {
        id: 'kings_indian',
        title: 'King\'s Indian Defense',
        eco: 'E60',
        category: 'Indian Defenses',
        difficulty: 'advanced',
        positions: [
            {
                title: 'King\'s Indian - Main Setup',
                fen: 'rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR w KQkq - 0 5',
                description: 'Black allows White a big center, planning to attack it later.',
                keyIdeas: [
                    'Fianchetto the kingside bishop',
                    'Attack White\'s center with e5 or c5',
                    'Create kingside attack with f5'
                ],
                nextMoves: ['Nf3', 'Be2', 'f3']
            },
            {
                title: 'King\'s Indian - Classical Variation',
                fen: 'rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP2BPPP/R1BQK2R b KQ - 5 6',
                description: 'The Classical setup for White with e4, classical development.',
                keyIdeas: [
                    'Prepare e5 pawn break',
                    'Castle kingside',
                    'Launch attack with f5 and g5'
                ],
                nextMoves: ['e5', 'Nbd7', 'c6']
            }
        ]
    },
    {
        id: 'caro_kann',
        title: 'Caro-Kann Defense',
        eco: 'B10',
        category: 'Semi-Open Games',
        difficulty: 'beginner',
        positions: [
            {
                title: 'Caro-Kann - Main Line',
                fen: 'rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
                description: 'Solid defense, similar to French but without blocking the light bishop.',
                keyIdeas: [
                    'Challenge center with d5',
                    'Develop light-squared bishop early',
                    'Solid pawn structure'
                ],
                nextMoves: ['d4', 'Nc3', 'd3']
            },
            {
                title: 'Caro-Kann - Classical Variation',
                fen: 'rn1qkbnr/pp2pppp/2p5/3pPb2/3P4/8/PPP2PPP/RNBQKBNR w KQkq - 1 4',
                description: 'Black develops the bishop before recapturing on d5.',
                keyIdeas: [
                    'Flexible setup for Black',
                    'Good piece activity',
                    'Safe king position'
                ],
                nextMoves: ['Nf3', 'Bd3', 'c4']
            }
        ]
    },
    {
        id: 'london_system',
        title: 'London System',
        eco: 'D02',
        category: 'Queen\'s Pawn Game',
        difficulty: 'beginner',
        positions: [
            {
                title: 'London System - Setup',
                fen: 'rnbqkb1r/ppp1pppp/5n2/3p4/3P1B2/5N2/PPP1PPPP/RN1QKB1R b KQkq - 3 3',
                description: 'A solid system where White develops the bishop to f4.',
                keyIdeas: [
                    'Simple and solid setup',
                    'Control e5 square',
                    'Easy to learn and play'
                ],
                nextMoves: ['e6', 'c5', 'Bf5']
            }
        ]
    }
];

/**
 * Essential Endgames Library
 * Fundamental endgame positions every player must know
 */
export const ENDGAMES_LIBRARY = [
    {
        id: 'basic_checkmates',
        title: 'Basic Checkmates',
        category: 'Elementary Checkmates',
        difficulty: 'beginner',
        positions: [
            {
                title: 'King and Queen vs King',
                fen: '7k/8/6K1/8/8/8/8/Q7 w - - 0 1',
                description: 'The fundamental queen checkmate. Push the king to the edge.',
                goal: 'Checkmate in under 10 moves',
                keyIdeas: [
                    'Use your king to cut off squares',
                    'Don\'t stalemate - give the king a square',
                    'Drive the king to the edge of the board'
                ],
                solution: ['Qa1+', 'Kg8', 'Qg7#']
            },
            {
                title: 'King and Rook vs King',
                fen: '7k/8/6K1/8/8/8/8/R7 w - - 0 1',
                description: 'The fundamental rook endgame. Use the rook to cut off ranks.',
                goal: 'Checkmate in under 16 moves',
                keyIdeas: [
                    'Use your king to support',
                    'Rook cuts off files or ranks',
                    'Push king to the edge systematically'
                ],
                solution: ['Ra8+', 'Kh7', 'Kf7', 'Kh6', 'Ra6+']
            },
            {
                title: 'Two Rooks Checkmate',
                fen: '6k1/8/6K1/8/8/8/R7/R7 w - - 0 1',
                description: 'The ladder mate. Easiest checkmate pattern with two rooks.',
                goal: 'Checkmate quickly',
                keyIdeas: [
                    'Alternate rook moves',
                    'Drive king to the edge like a ladder',
                    'Very systematic and simple'
                ],
                solution: ['Ra8+', 'Kh7', 'Rh1#']
            },
            {
                title: 'King and Two Bishops vs King',
                fen: '7k/8/6K1/8/5B2/8/8/B7 w - - 0 1',
                description: 'Two bishops work together to deliver checkmate in the corner.',
                goal: 'Checkmate in under 20 moves',
                keyIdeas: [
                    'Push king to corner',
                    'Bishops control diagonal barriers',
                    'King supports to prevent escape'
                ],
                solution: ['Bg5', 'Kg8', 'Bc4+', 'Kh8', 'Bf6#']
            },
            {
                title: 'Bishop and Knight Checkmate',
                fen: '7k/8/5N1K/8/8/8/8/B7 w - - 0 1',
                description: 'The most difficult basic checkmate. Force king to corner of bishop\'s color.',
                goal: 'Checkmate (hardest elementary mate)',
                keyIdeas: [
                    'Force king to corner matching bishop color',
                    'Use knight for key squares',
                    'Requires precise technique'
                ],
                solution: ['Bg7', 'Kg8', 'Nh5']
            }
        ]
    },
    {
        id: 'pawn_endgames',
        title: 'Pawn Endgames',
        category: 'Fundamental Endgames',
        difficulty: 'beginner',
        positions: [
            {
                title: 'Opposition - Basic',
                fen: '8/8/4k3/8/8/4K3/4P3/8 w - - 0 1',
                description: 'Take the opposition to advance your king and promote the pawn.',
                goal: 'Promote the pawn',
                keyIdeas: [
                    'Opposition = kings face each other with one square between',
                    'Who moves loses the opposition',
                    'Critical concept in all endgames'
                ],
                solution: ['Kd4', 'Kd6', 'e4', 'Ke6', 'e5']
            },
            {
                title: 'Square of the Pawn',
                fen: '8/8/8/8/3p4/8/8/4K3 b - - 0 1',
                description: 'Can the king catch the pawn? Use the square rule!',
                goal: 'Understand if the king can catch the pawn',
                keyIdeas: [
                    'Draw a square from pawn to promotion',
                    'If king is inside square, it catches the pawn',
                    'Critical calculation skill'
                ],
                solution: ['d3', 'Kd2', 'd2', 'Kd1']
            },
            {
                title: 'Outside Passed Pawn',
                fen: '8/5pk1/5p2/5P2/8/2P3PP/6K1/8 w - - 0 1',
                description: 'The outside passed pawn is a powerful advantage.',
                goal: 'Win with the outside passed pawn',
                keyIdeas: [
                    'Outside pawn diverts enemy king',
                    'Allows your king to capture pawns',
                    'Usually winning advantage'
                ],
                solution: ['h4', 'Kf8', 'h5', 'Ke7', 'h6']
            },
            {
                title: 'Triangulation',
                fen: '8/8/4k3/8/4PK2/8/8/8 w - - 0 1',
                description: 'Use triangulation to lose a tempo and put opponent in zugzwang.',
                goal: 'Put Black in zugzwang',
                keyIdeas: [
                    'King moves in triangle',
                    'Returns to same square with opponent to move',
                    'Advanced opposition technique'
                ],
                solution: ['Kf3', 'Kd6', 'Ke3', 'Ke5', 'Kf3']
            }
        ]
    },
    {
        id: 'rook_endgames',
        title: 'Rook Endgames',
        category: 'Essential Rook Play',
        difficulty: 'intermediate',
        positions: [
            {
                title: 'Lucena Position',
                fen: '1K1k4/1P6/8/8/8/8/r7/2R5 w - - 0 1',
                description: 'The most important winning position in rook endgames.',
                goal: 'Build the bridge and promote',
                keyIdeas: [
                    'Build a bridge with your rook',
                    'Shield your king from checks',
                    'Systematic winning technique'
                ],
                solution: ['Rc4', 'Ra1+', 'Kb7', 'Rb1+', 'Rb4']
            },
            {
                title: 'Philidor Position',
                fen: '3k4/R7/3K4/8/8/8/r7/8 b - - 0 1',
                description: 'The key defensive technique - passive rook on 6th rank.',
                goal: 'Draw with proper defense',
                keyIdeas: [
                    'Keep rook on 6th rank (3rd for Black)',
                    'Only move rook to give checks when needed',
                    'Prevents king from advancing'
                ],
                solution: ['Ke8', 'Ra8+', 'Kf7', 'Ra7+', 'Kg8']
            },
            {
                title: 'Back Rank Defense',
                fen: '5k2/6p1/8/8/8/8/6P1/4R1K1 b - - 0 1',
                description: 'Rook on the 1st/8th rank prevents pawn promotion.',
                goal: 'Understand back rank defense',
                keyIdeas: [
                    'Rook cuts off king from advancing',
                    'King cannot cross rook\'s rank',
                    'Usually leads to a draw'
                ],
                solution: ['Ke7', 'Re2', 'Kd6', 'Kf2']
            },
            {
                title: 'Rook vs Pawn on 7th',
                fen: '8/1k6/8/8/8/8/1p6/1K2R3 w - - 0 1',
                description: 'Can White stop the advanced pawn?',
                goal: 'Stop and capture the pawn',
                keyIdeas: [
                    'Cut off the king',
                    'Use checks to prevent promotion',
                    'Timing is critical'
                ],
                solution: ['Re7+', 'Kc6', 'Re2', 'Kd5', 'Rxb2']
            }
        ]
    },
    {
        id: 'queen_endgames',
        title: 'Queen Endgames',
        category: 'Queen Techniques',
        difficulty: 'intermediate',
        positions: [
            {
                title: 'Queen vs Pawn on 7th',
                fen: '8/1k6/8/8/8/8/1p6/1K2Q3 w - - 0 1',
                description: 'Stop the pawn and deliver checkmate.',
                goal: 'Stop pawn and win',
                keyIdeas: [
                    'Check the king away from pawn',
                    'Control the promotion square',
                    'Deliver checkmate'
                ],
                solution: ['Qe7+', 'Kb6', 'Qd8+', 'Kc5', 'Qc7+']
            },
            {
                title: 'Queen vs Rook',
                fen: '7k/8/6K1/8/8/8/8/Q6r w - - 0 1',
                description: 'Queen usually wins against rook, but technique is needed.',
                goal: 'Win the rook or deliver checkmate',
                keyIdeas: [
                    'Push king to edge',
                    'Avoid perpetual check',
                    'Queen is much stronger than rook'
                ],
                solution: ['Qa8+', 'Rh8', 'Qf7']
            }
        ]
    },
    {
        id: 'minor_piece_endgames',
        title: 'Minor Piece Endgames',
        category: 'Bishops & Knights',
        difficulty: 'intermediate',
        positions: [
            {
                title: 'Bishop vs Knight - Bishop Advantage',
                fen: '8/5pk1/5p2/5P2/2B3PP/6K1/3n4/8 w - - 0 1',
                description: 'Bishop is usually better in open positions with pawns on both sides.',
                goal: 'Demonstrate bishop superiority',
                keyIdeas: [
                    'Bishop controls both colors in open position',
                    'Knight struggles in open board',
                    'Bishop can attack multiple pawns'
                ],
                solution: ['h5', 'Nf1', 'Bd5']
            },
            {
                title: 'Wrong Color Bishop',
                fen: '8/5B2/8/8/8/8/1k6/1K6 w - - 0 1',
                description: 'Even with an extra bishop, this is a draw!',
                goal: 'Understand wrong colored bishop draw',
                keyIdeas: [
                    'Bishop doesn\'t control promotion square',
                    'Black king controls dark squares',
                    'Famous drawing pattern'
                ],
                solution: ['Bc4', 'Kc1', 'Bd3', 'Kd1']
            },
            {
                title: 'Knight Endgame - Outpost',
                fen: '8/5pk1/8/3N1p2/5P2/6PP/6K1/3n4 w - - 0 1',
                description: 'A well-placed knight on an outpost is very powerful.',
                goal: 'Use knight outpost to win',
                keyIdeas: [
                    'Centralized knight is strong',
                    'Controls key squares',
                    'Supports pawn advances'
                ],
                solution: ['Ne7', 'Kf6', 'Nd5+']
            }
        ]
    },
    {
        id: 'practical_endgames',
        title: 'Practical Endgames',
        category: 'Must-Know Positions',
        difficulty: 'advanced',
        positions: [
            {
                title: 'Rook and Pawn vs Rook - Defending',
                fen: '8/8/4k3/4p3/4K3/8/3R4/5r2 b - - 0 1',
                description: 'Learn how to defend rook endgames with proper technique.',
                goal: 'Hold the draw',
                keyIdeas: [
                    'Keep rook active',
                    'Check from behind passed pawns',
                    'Don\'t let enemy king advance freely'
                ],
                solution: ['Re1+', 'Kf5', 'Rf1+', 'Kg5', 'Rg1+']
            },
            {
                title: 'Bishop and Pawn vs Bishop (Same Color)',
                fen: '8/5k2/5p2/8/5PB1/6K1/8/6b1 w - - 0 1',
                description: 'Same colored bishop endgames with pawns.',
                goal: 'Understand key defensive ideas',
                keyIdeas: [
                    'Control key diagonal',
                    'Block enemy pawns',
                    'King activity is crucial'
                ],
                solution: ['Kf3', 'Bh2', 'Ke4']
            },
            {
                title: 'Fortress Defense',
                fen: '8/8/8/3k4/3p4/2pK4/2B5/8 w - - 0 1',
                description: 'Sometimes you can hold a draw even when down material.',
                goal: 'Understand fortress concepts',
                keyIdeas: [
                    'Create impenetrable position',
                    'Sacrifice material if needed',
                    'Block all entry squares'
                ],
                solution: ['Kc2', 'Ke4', 'Kd2']
            }
        ]
    }
];

/**
 * Gets all openings grouped by category
 * @returns {Object} Openings grouped by category
 */
export function getOpeningsByCategory() {
    const categories = {};
    OPENINGS_LIBRARY.forEach(opening => {
        if (!categories[opening.category]) {
            categories[opening.category] = [];
        }
        categories[opening.category].push(opening);
    });
    return categories;
}

/**
 * Gets all endgames grouped by category
 * @returns {Object} Endgames grouped by category
 */
export function getEndgamesByCategory() {
    const categories = {};
    ENDGAMES_LIBRARY.forEach(endgame => {
        if (!categories[endgame.category]) {
            categories[endgame.category] = [];
        }
        categories[endgame.category].push(endgame);
    });
    return categories;
}

/**
 * Gets openings by difficulty level
 * @param {string} difficulty - 'beginner', 'intermediate', or 'advanced'
 * @returns {Array} Filtered openings
 */
export function getOpeningsByDifficulty(difficulty) {
    return OPENINGS_LIBRARY.filter(opening => opening.difficulty === difficulty);
}

/**
 * Gets endgames by difficulty level
 * @param {string} difficulty - 'beginner', 'intermediate', or 'advanced'
 * @returns {Array} Filtered endgames
 */
export function getEndgamesByDifficulty(difficulty) {
    const endgames = [];
    ENDGAMES_LIBRARY.forEach(category => {
        if (category.difficulty === difficulty) {
            endgames.push(category);
        }
    });
    return endgames;
}

/**
 * Gets total count of opening positions
 * @returns {number} Total positions
 */
export function getTotalOpeningPositions() {
    return OPENINGS_LIBRARY.reduce((sum, opening) => sum + opening.positions.length, 0);
}

/**
 * Gets total count of endgame positions
 * @returns {number} Total positions
 */
export function getTotalEndgamePositions() {
    return ENDGAMES_LIBRARY.reduce((sum, endgame) => sum + endgame.positions.length, 0);
}

/**
 * Finds an opening by ID
 * @param {string} id - Opening ID
 * @returns {Object|null} Opening object or null
 */
export function findOpening(id) {
    return OPENINGS_LIBRARY.find(opening => opening.id === id) || null;
}

/**
 * Finds an endgame by ID
 * @param {string} id - Endgame ID
 * @returns {Object|null} Endgame object or null
 */
export function findEndgame(id) {
    return ENDGAMES_LIBRARY.find(endgame => endgame.id === id) || null;
}
