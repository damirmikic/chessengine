import { Chess } from 'https://esm.sh/chess.js@0.13.4';
import { Chessground } from 'https://esm.sh/chessground@8.3.3';

const chess = new Chess();
let board = null;
let stockfish = null;

// State Variables
let previousEval = 0.3;
let engineStatus = 'idle'; // 'idle' | 'evaluating_current' | 'finding_hint' | 'playing'
let userColor = 'white';   
let pendingUserMove = null; 
let previousFen = "";
let gamePaused = false;
let currentPv = ""; // Store the Principal Variation (best line)
let badMoveRefutation = ""; // Store the line that punishes the user's mistake

// --- SIMPLE OPENING DICTIONARY ---
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

// --- STOCKFISH SETUP ---
try {
    stockfish = new Worker('stockfish.js');
    stockfish.onmessage = function(event) {
        const line = event.data;
        if (line === 'uciok') console.log("Stockfish Ready");

        // 0. Capture PV (Line of best moves) from info string
        // Format: "info depth 10 ... pv e2e4 e7e5 g1f3 ..."
        if (line.startsWith('info') && line.includes(' pv ')) {
            const pvIndex = line.indexOf(' pv ') + 4;
            currentPv = line.substring(pvIndex);
            
            // If we are evaluating the USER'S move, this PV is the "Refutation" 
            // (The sequence of moves the opponent will play to punish you)
            if (engineStatus === 'evaluating_current') {
                badMoveRefutation = currentPv;
            }
        }

        // 1. Score Parsing
        if (line.startsWith('info') && line.includes('score cp')) {
            const parts = line.split(' ');
            const scoreIndex = parts.indexOf('cp') + 1;
            let score = parseInt(parts[scoreIndex]) / 100;
            const turn = chess.turn();
            if (turn === 'b') score = -score;
            window.currentEval = score;
        }

        // 2. Best Move Parsing
        if (line.startsWith('bestmove')) {
            const moveStr = line.split(' ')[1];
            
            if (engineStatus === 'playing') {
                if (moveStr && moveStr !== '(none)') performEngineMove(moveStr);
                engineStatus = 'idle';
            }
            else if (engineStatus === 'finding_hint') {
                const bestMove = moveStr;
                // Note: pendingUserMove now contains the refutation from the previous step
                completeUserMoveAnalysis(pendingUserMove, bestMove, currentPv);
                engineStatus = 'idle';
            }
        }
    };
    
    stockfish.postMessage('uci');
    stockfish.postMessage('isready');

} catch (e) {
    console.error("Stockfish error:", e);
}

// --- BOARD SETUP ---
function toDests(chess) {
    const dests = new Map();
    const moves = chess.moves({ verbose: true });
    moves.forEach(m => {
        if (!dests.has(m.from)) dests.set(m.from, []);
        dests.get(m.from).push(m.to);
    });
    return dests;
}

const config = {
    fen: chess.fen(),
    orientation: 'white',
    movable: {
        color: 'white',
        free: false,
        dests: toDests(chess),
        events: { after: onUserMove }
    }
};

const boardContainer = document.getElementById('board');
if (boardContainer) board = Chessground(boardContainer, config);

// --- OPENING DETECTION ---
function updateOpeningName() {
    const history = chess.history().join(" ");
    const nameEl = document.getElementById('opening-name');
    
    if (OPENINGS[history]) {
        nameEl.innerText = OPENINGS[history];
        nameEl.style.color = "#4caf50"; 
    } else {
        let found = "Unknown / Custom";
        let bestLen = 0;
        for (const [seq, name] of Object.entries(OPENINGS)) {
            if (history.startsWith(seq) && seq.length > bestLen) {
                found = name;
                bestLen = seq.length;
            }
        }
        if (history === "") found = "Starting Position";
        nameEl.innerText = found;
        nameEl.style.color = "#888";
    }
}

// --- USER MOVE LOGIC ---
function onUserMove(orig, dest) {
    toggleContinueBtn(false);
    gamePaused = false;

    previousFen = chess.fen(); 

    let move = chess.move({ from: orig, to: dest });
    if (move === null) move = chess.move({ from: orig, to: dest, promotion: 'q' });
    if (move === null) { board.set({ fen: previousFen }); return; }

    board.set({ movable: { dests: new Map() } });
    updateOpeningName();

    const feedbackEl = document.getElementById('feedback');
    feedbackEl.innerHTML = "<em>Analyzing...</em>";
    feedbackEl.className = "feedback-box";
    
    // Check eval AND capture refutation
    if(stockfish) {
        engineStatus = 'evaluating_current';
        currentPv = ""; 
        badMoveRefutation = ""; // Reset refutation
        stockfish.postMessage(`position fen ${chess.fen()}`);
        stockfish.postMessage('go depth 12');
    }

    setTimeout(() => {
        const currEval = window.currentEval || 0;
        const delta = (userColor === 'white') ? (previousEval - currEval) : (currEval - previousEval);
        
        const showHints = document.getElementById('showHints').checked;
        
        // CHANGED: Lowered threshold from 0.8 to 0.3 to catch "Passive" (Inaccuracy) moves
        const isMistake = delta > 0.3; 

        if (isMistake && showHints && !chess.game_over()) {
            feedbackEl.innerHTML = "<em>Finding better move...</em>";
            
            // Pass the refutation we captured (badMoveRefutation) to the next step
            pendingUserMove = { move, delta, currEval, refutation: badMoveRefutation };
            
            // Ask engine for the best move in the PREVIOUS position
            engineStatus = 'finding_hint';
            currentPv = ""; 
            stockfish.postMessage(`position fen ${previousFen}`);
            stockfish.postMessage('go depth 12');
        } else {
            analyzeMove(delta, currEval, null, null, null);
            previousEval = currEval;
            if (!chess.game_over()) makeEngineMove();
        }
    }, 800);
}

// Callback after Hint found
function completeUserMoveAnalysis(data, bestMoveUci, bestLinePv) {
    const { delta, currEval, refutation } = data;
    analyzeMove(delta, currEval, bestMoveUci, bestLinePv, refutation);
    previousEval = currEval;
    
    gamePaused = true;
    toggleContinueBtn(true); 
}

// User clicked "Continue"
function continueGame() {
    if (!gamePaused) return;
    toggleContinueBtn(false);
    gamePaused = false;
    if (!chess.game_over()) makeEngineMove();
}

// --- ENGINE MOVE LOGIC ---
function makeEngineMove() {
    if (stockfish) {
        engineStatus = 'playing';
        const levelSelect = document.getElementById('difficulty');
        const depth = levelSelect ? levelSelect.value : 12;
        stockfish.postMessage(`position fen ${chess.fen()}`);
        stockfish.postMessage(`go depth ${depth}`);
    }
}

function performEngineMove(moveStr) {
    const from = moveStr.substring(0, 2);
    const to = moveStr.substring(2, 4);
    const promotion = moveStr.length > 4 ? moveStr.substring(4, 5) : undefined;

    chess.move({ from, to, promotion });

    board.set({ 
        fen: chess.fen(),
        lastMove: [from, to],
        check: chess.in_check(),
        turnColor: userColor,
        movable: { 
            color: userColor,
            dests: toDests(chess) 
        } 
    });
    
    updateOpeningName();

    if(stockfish) {
        stockfish.postMessage(`position fen ${chess.fen()}`);
        stockfish.postMessage('go depth 10'); 
    }
}

// --- HELPER: Convert UCI (e2e4) to readable SAN (e4) using temp game state ---
function uciToSan(uciMove, startFen) {
    if (!uciMove) return "";
    const tempChess = new Chess(startFen);
    const from = uciMove.substring(0, 2);
    const to = uciMove.substring(2, 4);
    const promotion = uciMove.length > 4 ? uciMove.substring(4, 5) : undefined;
    
    const move = tempChess.move({ from, to, promotion });
    return move ? move.san : uciMove;
}

// --- ANALYSIS UI ---
function analyzeMove(delta, currEval, bestMoveUci, bestLinePv, refutationPv) {
    const feedbackEl = document.getElementById('feedback');
    let title = "", desc = "", css = "";

    if (delta < 0.3) {
        title = "Good Move"; desc = "Solid play."; css = "good";
    } else if (delta < 1.0) {
        title = "Inaccuracy"; desc = "Passive."; css = "inaccuracy";
    } else if (delta < 2.5) {
        title = "Mistake"; desc = "Tactical error."; css = "mistake";
    } else {
        title = "BLUNDER"; desc = "Major error."; css = "blunder";
    }

    let html = `<strong>${title}</strong> <small>(Loss: ${delta.toFixed(2)})</small><br>${desc}`;
    
    // If we have a hint (mistake was made)
    if (bestMoveUci) {
        // 1. Show Best Move
        const sanBest = uciToSan(bestMoveUci, previousFen);
        html += `<div style="margin-top:10px; padding-top:10px; border-top:1px solid rgba(255,255,255,0.2)">
                 <strong>Better was:</strong> <span style="color:#4caf50; font-size:1.1em">${sanBest}</span>`;
        
        // 2. Explain WHY it is bad (Refutation)
        if (refutationPv) {
            // Get the first move of the refutation (The opponent's reply)
            const moves = refutationPv.split(" ");
            const oppReplyUci = moves[0];
            
            // We need to convert this reply to SAN. 
            // Note: The board is currently AT the bad position, so we can use current chess instance or fen.
            const sanReply = uciToSan(oppReplyUci, chess.fen());
            
            html += `<div style="margin-top:8px; font-size:0.95em; color:#ffccbc;">
                     <strong>Why?</strong> This allows <b>${sanReply}</b>...
                     </div>`;
        }

        html += `</div>`;
    }

    feedbackEl.innerHTML = html;
    feedbackEl.className = `feedback-box ${css}`;
    
    const clampedScore = Math.max(-5, Math.min(5, currEval));
    const percent = 50 + (clampedScore * 10);
    const bar = document.getElementById('eval-fill');
    if (bar) bar.style.width = `${percent}%`;
}

// --- CONTROLS ---

function toggleContinueBtn(show) {
    const btn = document.getElementById('continueBtn');
    if (btn) btn.style.display = show ? 'block' : 'none';
}

function resetGame() {
    chess.reset();
    engineStatus = 'idle';
    gamePaused = false;
    toggleContinueBtn(false);
    updateOpeningName();
    
    board.set({ 
        fen: chess.fen(),
        lastMove: undefined, 
        check: undefined,
        turnColor: 'white',
        orientation: userColor,
        movable: { 
            color: userColor === 'white' ? 'white' : null,
            dests: (userColor === 'white') ? toDests(chess) : new Map()
        } 
    });
    previousEval = 0.3;
    document.getElementById('feedback').innerHTML = "Make a move...";
    document.getElementById('feedback').className = "feedback-box";
    document.getElementById('eval-fill').style.width = "50%";

    if (userColor === 'black') {
        setTimeout(makeEngineMove, 500);
    }
}

function undoMove() {
    if (engineStatus === 'playing' || engineStatus === 'evaluating_current') return;

    if (gamePaused) {
        chess.undo(); 
        gamePaused = false;
        toggleContinueBtn(false);
    } else {
        if (chess.history().length >= 2) {
            chess.undo(); 
            chess.undo(); 
        } else if (chess.history().length === 1 && userColor === 'black') {
             chess.undo(); 
        }
    }

    board.set({ 
        fen: chess.fen(),
        lastMove: undefined,
        check: undefined,
        turnColor: userColor,
        movable: { 
            color: userColor,
            dests: toDests(chess) 
        } 
    });
    
    updateOpeningName();
    
    document.getElementById('feedback').innerHTML = "Move undone.";
    document.getElementById('feedback').className = "feedback-box";
    
    if (stockfish) {
        stockfish.postMessage(`position fen ${chess.fen()}`);
        stockfish.postMessage('go depth 10');
    }
}

function switchSides() {
    const btn = document.getElementById('flipBtn');
    if (userColor === 'white') {
        userColor = 'black';
        btn.innerText = "Play as White";
    } else {
        userColor = 'white';
        btn.innerText = "Play as Black";
    }
    resetGame();
}

// Event Listeners
document.getElementById('resetBtn').addEventListener('click', resetGame);
document.getElementById('undoBtn').addEventListener('click', undoMove);
document.getElementById('flipBtn').addEventListener('click', switchSides);
document.getElementById('continueBtn').addEventListener('click', continueGame);