/**
 * Keyboard Shortcuts Manager
 * Provides keyboard navigation and command palette functionality
 */

class KeyboardShortcutsManager {
    constructor() {
        this.shortcuts = new Map();
        this.commandPalette = null;
        this.isCommandPaletteOpen = false;
        this.commands = [];
        this.filteredCommands = [];
        this.selectedIndex = 0;

        this.setupDefaultShortcuts();
    }

    /**
     * Initialize the keyboard shortcuts system
     */
    initialize() {
        this.setupEventListeners();
        this.createCommandPalette();
        console.log('Keyboard Shortcuts Manager initialized');
    }

    /**
     * Set up default keyboard shortcuts
     */
    setupDefaultShortcuts() {
        // Navigation shortcuts
        this.registerShortcut('n', 'New Game', () => {
            document.getElementById('resetBtn')?.click();
        });

        this.registerShortcut('a', 'Analyze Position', () => {
            if (window.contextManager) {
                window.contextManager.setContext('analysis');
            }
        });

        this.registerShortcut('u', 'Undo Move', () => {
            document.getElementById('undoBtn')?.click();
        });

        this.registerShortcut('f', 'Flip Board', () => {
            document.getElementById('flipBtn')?.click();
        });

        this.registerShortcut('h', 'Get Hint', () => {
            document.getElementById('hintBtn')?.click();
        });

        this.registerShortcut('l', 'Learning Dashboard', () => {
            document.getElementById('learningDashboardBtn')?.click();
        });

        this.registerShortcut('s', 'Open Settings', () => {
            if (window.contextManager) {
                window.contextManager.setContext('settings');
            }
        });

        // Command palette
        this.registerShortcut('k', 'Open Command Palette', () => {
            this.toggleCommandPalette();
        }, { meta: true }); // Cmd+K or Ctrl+K

        // Escape to close dialogs
        this.registerShortcut('Escape', 'Close Dialogs', () => {
            if (this.isCommandPaletteOpen) {
                this.closeCommandPalette();
            }
        });

        // Arrow key navigation in command palette
        this.registerShortcut('ArrowDown', 'Next Command', () => {
            if (this.isCommandPaletteOpen) {
                this.selectNextCommand();
            }
        }, { skipDefault: false });

        this.registerShortcut('ArrowUp', 'Previous Command', () => {
            if (this.isCommandPaletteOpen) {
                this.selectPreviousCommand();
            }
        }, { skipDefault: false });

        this.registerShortcut('Enter', 'Execute Command', () => {
            if (this.isCommandPaletteOpen) {
                this.executeSelectedCommand();
            }
        }, { skipDefault: false });
    }

    /**
     * Register a keyboard shortcut
     * @param {string} key - The key to listen for
     * @param {string} description - Description of what the shortcut does
     * @param {Function} handler - The function to execute
     * @param {Object} options - Options (meta, ctrl, shift, alt)
     */
    registerShortcut(key, description, handler, options = {}) {
        const shortcutKey = this.createShortcutKey(key, options);
        this.shortcuts.set(shortcutKey, {
            key,
            description,
            handler,
            options
        });

        // Add to command palette commands
        if (key !== 'Escape' && key !== 'ArrowDown' && key !== 'ArrowUp' && key !== 'Enter') {
            this.commands.push({
                id: shortcutKey,
                title: description,
                shortcut: this.getShortcutDisplay(key, options),
                handler
            });
        }
    }

    /**
     * Create a unique key for the shortcut
     */
    createShortcutKey(key, options) {
        const parts = [];
        if (options.meta) parts.push('meta');
        if (options.ctrl) parts.push('ctrl');
        if (options.shift) parts.push('shift');
        if (options.alt) parts.push('alt');
        parts.push(key.toLowerCase());
        return parts.join('+');
    }

    /**
     * Get display string for shortcut
     */
    getShortcutDisplay(key, options) {
        const parts = [];
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

        if (options.meta) parts.push(isMac ? '⌘' : 'Ctrl');
        if (options.ctrl) parts.push('Ctrl');
        if (options.shift) parts.push('⇧');
        if (options.alt) parts.push(isMac ? '⌥' : 'Alt');
        parts.push(key.length === 1 ? key.toUpperCase() : key);

        return parts.join('+');
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });
    }

    /**
     * Handle keydown events
     */
    handleKeyDown(e) {
        // Don't interfere with input fields
        if (e.target.matches('input, textarea')) {
            // Allow Cmd+K even in input fields
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                this.toggleCommandPalette();
            }
            return;
        }

        // Create shortcut key from event
        const shortcutKey = this.createShortcutKey(e.key, {
            meta: e.metaKey,
            ctrl: e.ctrlKey,
            shift: e.shiftKey,
            alt: e.altKey
        });

        // Find and execute matching shortcut
        const shortcut = this.shortcuts.get(shortcutKey);
        if (shortcut) {
            if (shortcut.options.skipDefault === false) {
                // Allow for specific keys like arrows
                if (this.isCommandPaletteOpen) {
                    e.preventDefault();
                    shortcut.handler(e);
                }
            } else {
                e.preventDefault();
                shortcut.handler(e);
            }
        }
    }

    /**
     * Create the command palette UI
     */
    createCommandPalette() {
        const palette = document.createElement('div');
        palette.id = 'commandPalette';
        palette.className = 'command-palette';
        palette.innerHTML = `
            <div class="command-palette-backdrop"></div>
            <div class="command-palette-container">
                <div class="command-palette-header">
                    <span class="command-palette-icon">⌘</span>
                    <input type="text"
                           id="commandPaletteInput"
                           class="command-palette-input"
                           placeholder="Type a command or search..."
                           autocomplete="off"
                           spellcheck="false">
                    <button class="command-palette-close" id="commandPaletteClose">×</button>
                </div>
                <div class="command-palette-results" id="commandPaletteResults">
                    <!-- Results will be inserted here -->
                </div>
                <div class="command-palette-footer">
                    <div class="command-palette-hint">
                        <kbd>↑↓</kbd> Navigate
                        <kbd>↵</kbd> Execute
                        <kbd>Esc</kbd> Close
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(palette);
        this.commandPalette = palette;

        // Set up command palette event listeners
        const input = document.getElementById('commandPaletteInput');
        const closeBtn = document.getElementById('commandPaletteClose');
        const backdrop = palette.querySelector('.command-palette-backdrop');

        input.addEventListener('input', (e) => {
            this.filterCommands(e.target.value);
        });

        closeBtn.addEventListener('click', () => {
            this.closeCommandPalette();
        });

        backdrop.addEventListener('click', () => {
            this.closeCommandPalette();
        });

        // Add additional commands
        this.addAdditionalCommands();
    }

    /**
     * Add additional commands that aren't keyboard shortcuts
     */
    addAdditionalCommands() {
        this.commands.push(
            { id: 'save-game', title: 'Save Game', shortcut: '', handler: () => {
                document.getElementById('saveGameBtn')?.click();
            }},
            { id: 'load-game', title: 'Load Game', shortcut: '', handler: () => {
                document.getElementById('loadGameBtn')?.click();
            }},
            { id: 'export-pgn', title: 'Export PGN', shortcut: '', handler: () => {
                document.getElementById('exportPgnBtn')?.click();
            }},
            { id: 'import-pgn', title: 'Import PGN', shortcut: '', handler: () => {
                document.getElementById('importPgnBtn')?.click();
            }},
            { id: 'resign', title: 'Resign Game', shortcut: '', handler: () => {
                document.getElementById('resignBtn')?.click();
            }},
            { id: 'analyze-game', title: 'Analyze Complete Game', shortcut: '', handler: () => {
                document.getElementById('analyzeGameBtn')?.click();
            }},
            { id: 'toggle-left-panel', title: 'Toggle Left Panel', shortcut: '', handler: () => {
                document.getElementById('leftPanelCollapseBtn')?.click();
            }},
            { id: 'toggle-right-panel', title: 'Toggle Right Panel', shortcut: '', handler: () => {
                document.getElementById('rightPanelCollapseBtn')?.click();
            }}
        );
    }

    /**
     * Toggle command palette visibility
     */
    toggleCommandPalette() {
        if (this.isCommandPaletteOpen) {
            this.closeCommandPalette();
        } else {
            this.openCommandPalette();
        }
    }

    /**
     * Open command palette
     */
    openCommandPalette() {
        this.isCommandPaletteOpen = true;
        this.commandPalette.classList.add('active');

        // Focus input
        const input = document.getElementById('commandPaletteInput');
        setTimeout(() => {
            input.focus();
            input.value = '';
        }, 50);

        // Show all commands
        this.filterCommands('');
    }

    /**
     * Close command palette
     */
    closeCommandPalette() {
        this.isCommandPaletteOpen = false;
        this.commandPalette.classList.remove('active');
        this.selectedIndex = 0;
    }

    /**
     * Filter commands based on search query
     */
    filterCommands(query) {
        const lowerQuery = query.toLowerCase();

        if (!query) {
            this.filteredCommands = [...this.commands];
        } else {
            this.filteredCommands = this.commands.filter(cmd =>
                cmd.title.toLowerCase().includes(lowerQuery) ||
                cmd.id.toLowerCase().includes(lowerQuery)
            );
        }

        this.selectedIndex = 0;
        this.renderCommandResults();
    }

    /**
     * Render command results
     */
    renderCommandResults() {
        const resultsContainer = document.getElementById('commandPaletteResults');

        if (this.filteredCommands.length === 0) {
            resultsContainer.innerHTML = '<div class="command-palette-empty">No commands found</div>';
            return;
        }

        resultsContainer.innerHTML = this.filteredCommands.map((cmd, index) => `
            <div class="command-palette-item ${index === this.selectedIndex ? 'selected' : ''}"
                 data-index="${index}"
                 onclick="window.keyboardShortcutsManager.executeCommand('${cmd.id}')">
                <div class="command-palette-item-title">${cmd.title}</div>
                ${cmd.shortcut ? `<div class="command-palette-item-shortcut">${cmd.shortcut}</div>` : ''}
            </div>
        `).join('');
    }

    /**
     * Select next command
     */
    selectNextCommand() {
        this.selectedIndex = (this.selectedIndex + 1) % this.filteredCommands.length;
        this.renderCommandResults();
    }

    /**
     * Select previous command
     */
    selectPreviousCommand() {
        this.selectedIndex = (this.selectedIndex - 1 + this.filteredCommands.length) % this.filteredCommands.length;
        this.renderCommandResults();
    }

    /**
     * Execute selected command
     */
    executeSelectedCommand() {
        if (this.filteredCommands.length > 0) {
            const cmd = this.filteredCommands[this.selectedIndex];
            this.executeCommand(cmd.id);
        }
    }

    /**
     * Execute command by ID
     */
    executeCommand(commandId) {
        const cmd = this.commands.find(c => c.id === commandId);
        if (cmd && cmd.handler) {
            this.closeCommandPalette();
            setTimeout(() => {
                cmd.handler();
            }, 100);
        }
    }

    /**
     * Get all registered shortcuts (for display in settings)
     */
    getShortcuts() {
        return Array.from(this.shortcuts.values()).map(shortcut => ({
            key: shortcut.key,
            description: shortcut.description,
            display: this.getShortcutDisplay(shortcut.key, shortcut.options)
        }));
    }
}

// Create and export singleton instance
const keyboardShortcutsManager = new KeyboardShortcutsManager();

// Make available globally
window.keyboardShortcutsManager = keyboardShortcutsManager;

console.log('Keyboard Shortcuts Manager module loaded');
