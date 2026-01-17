/**
 * @fileoverview Multiplayer module for local and online play
 * Handles PeerJS connections and WebRTC communication
 */

import { getChess, performEngineMove } from './board-controller.js';
import { uciToSan } from './analysis.js';

let peer = null;
let conn = null;
let multiplayerState = {
    isLocalMode: false,
    isHost: false,
    opponentId: null,
    connected: false,
    myColor: 'white'
};

const LEADERBOARD_KEY = 'chess_leaderboard';

/**
 * Initializes multiplayer listeners and PeerJS
 */
export function initializeMultiplayer(callbacks) {
    const localToggle = document.getElementById('localMultiplayer');
    const connectBtn = document.getElementById('connectBtn');
    const copyIdBtn = document.getElementById('copyIdBtn');
    const disconnectBtn = document.getElementById('disconnectBtn');
    const remoteIdInput = document.getElementById('remotePeerId');

    const shareLinkBtn = document.getElementById('shareLinkBtn');

    // Local Multiplayer Toggle
    if (localToggle) {
        localToggle.addEventListener('change', (e) => {
            multiplayerState.isLocalMode = e.target.checked;
            if (callbacks.onLocalModeToggle) {
                callbacks.onLocalModeToggle(multiplayerState.isLocalMode);
            }
        });
    }

    // Share Link Handler
    if (shareLinkBtn) {
        shareLinkBtn.addEventListener('click', () => {
            const id = document.getElementById('myPeerId').textContent;
            if (id === '---') return;
            const url = `${window.location.origin}${window.location.pathname}?challenge=${id}`;
            navigator.clipboard.writeText(url).then(() => {
                const originalText = shareLinkBtn.textContent;
                shareLinkBtn.textContent = '✅ Link Copied!';
                setTimeout(() => shareLinkBtn.textContent = originalText, 2000);
            });
        });
    }

    // Initialize PeerJS
    initPeer(callbacks);

    // Connection Controls
    if (connectBtn) {
        connectBtn.addEventListener('click', () => {
            const remoteId = remoteIdInput.value.trim();
            if (remoteId) connectToPeer(remoteId, callbacks);
        });
    }

    if (copyIdBtn) {
        copyIdBtn.addEventListener('click', () => {
            const id = document.getElementById('myPeerId').textContent;
            navigator.clipboard.writeText(id).then(() => {
                const originalText = copyIdBtn.textContent;
                copyIdBtn.textContent = '✅';
                setTimeout(() => copyIdBtn.textContent = originalText, 2000);
            });
        });
    }

    if (disconnectBtn) {
        disconnectBtn.addEventListener('click', () => {
            if (conn) conn.close();
            updateConnectionUI(false);
        });
    }

    // Load Leaderboard
    loadLeaderboard();

    // Check for challenge link in URL
    const urlParams = new URLSearchParams(window.location.search);
    const challengeId = urlParams.get('challenge');
    if (challengeId) {
        setTimeout(() => {
            if (remoteIdInput) remoteIdInput.value = challengeId;
            connectToPeer(challengeId, callbacks);
            if (callbacks.onTabSwitch) callbacks.onTabSwitch('community');
        }, 3000); // Wait for PeerJS to init
    }
}

/**
 * Initializes PeerJS instance
 */
function initPeer(callbacks) {
    const statusEl = document.getElementById('onlineStatus');
    const myIdEl = document.getElementById('myPeerId');

    if (statusEl) {
        statusEl.textContent = 'Connecting to signaling server...';
        statusEl.className = 'online-status connecting';
    }

    peer = new Peer();

    peer.on('open', (id) => {
        myIdEl.textContent = id;
        statusEl.textContent = 'Online - Ready for connection';
        statusEl.className = 'online-status connected';
    });

    peer.on('connection', (connection) => {
        if (conn) {
            connection.close(); // Only one connection at a time
            return;
        }
        setupConnection(connection, callbacks);
        multiplayerState.isHost = true;
        multiplayerState.myColor = 'white'; // Host plays white by default
        updateConnectionUI(true, connection.peer);

        // Notify opponent of our name (optional enhancement)
        conn.send({ type: 'init', color: 'black' });
    });

    peer.on('error', (err) => {
        console.error('PeerJS error:', err);
        statusEl.textContent = 'Connection Error';
        statusEl.className = 'online-status disconnected';
    });
}

/**
 * Connects to a remote peer
 */
function connectToPeer(remoteId, callbacks) {
    const statusEl = document.getElementById('onlineStatus');
    statusEl.textContent = 'Connecting to friend...';
    statusEl.className = 'online-status connecting';

    const connection = peer.connect(remoteId);
    setupConnection(connection, callbacks);
    multiplayerState.isHost = false;
    // Color will be assigned by host
}

/**
 * Sets up a DataConnection
 */
function setupConnection(connection, callbacks) {
    conn = connection;

    conn.on('open', () => {
        updateConnectionUI(true, conn.peer);
        multiplayerState.connected = true;
        if (callbacks.onConnected) callbacks.onConnected(conn.peer);
    });

    conn.on('data', (data) => {
        handleReceivedData(data, callbacks);
    });

    conn.on('close', () => {
        updateConnectionUI(false);
        multiplayerState.connected = false;
        if (callbacks.onDisconnected) callbacks.onDisconnected();
        conn = null;
    });
}

/**
 * Handles incoming WebRTC data
 */
function handleReceivedData(data, callbacks) {
    switch (data.type) {
        case 'init':
            multiplayerState.myColor = data.color;
            if (callbacks.onColorAssigned) callbacks.onColorAssigned(data.color);
            break;
        case 'move':
            if (callbacks.onRemoteMove) {
                callbacks.onRemoteMove(data.move);
            }
            break;
        case 'chat':
            // Future feature
            break;
        case 'reset':
            if (confirm('Opponent wants to restart the game. Accept?')) {
                callbacks.onResetRequestAccept();
            }
            break;
    }
}

/**
 * Sends a move to the opponent
 */
export function sendMove(move) {
    if (conn && conn.open) {
        conn.send({ type: 'move', move: move });
    }
}

/**
 * Updates UI based on connection status
 */
function updateConnectionUI(connected, peerId = null) {
    const connPanel = document.getElementById('connectionPanel');
    const activePanel = document.getElementById('activeConnectionPanel');
    const connectedIdEl = document.getElementById('connectedPeerId');
    const statusEl = document.getElementById('onlineStatus');

    if (connected) {
        connPanel.style.display = 'none';
        activePanel.style.display = 'block';
        connectedIdEl.textContent = peerId;
        statusEl.textContent = 'Connected to Opponent';
        statusEl.className = 'online-status connected';
    } else {
        connPanel.style.display = 'block';
        activePanel.style.display = 'none';
        statusEl.textContent = 'Online - Ready for connection';
        statusEl.className = 'online-status connected';
    }
}

/**
 * Leaderboard Logic
 */
export function recordGameResult(accuracy) {
    const leaderboard = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || '[]');
    const date = new Date().toLocaleDateString();
    leaderboard.push({ accuracy, date });
    leaderboard.sort((a, b) => b.accuracy - a.accuracy);
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard.slice(0, 10)));
    loadLeaderboard();
}

function loadLeaderboard() {
    const listEl = document.getElementById('leaderboardList');
    if (!listEl) return;

    const leaderboard = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || '[]');
    if (leaderboard.length === 0) {
        listEl.innerHTML = '<div class="leaderboard-empty">No games recorded yet</div>';
        return;
    }

    listEl.innerHTML = leaderboard.map((item, index) => `
        <div class="leaderboard-item">
            <span class="leaderboard-rank">#${index + 1}</span>
            <span class="leaderboard-name">Game on ${item.date}</span>
            <span class="leaderboard-score">${item.accuracy}%</span>
        </div>
    `).join('');
}

export function getMultiplayerState() {
    return multiplayerState;
}
