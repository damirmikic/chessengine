/**
 * Adaptive Layout Controller
 * Handles panel collapse/expand, bottom sheet, FAB, and responsive interactions
 */

class LayoutController {
    constructor() {
        this.leftPanel = document.getElementById('leftPanel');
        this.rightPanel = document.getElementById('rightPanel');
        this.leftPanelCollapseBtn = document.getElementById('leftPanelCollapseBtn');
        this.rightPanelCollapseBtn = document.getElementById('rightPanelCollapseBtn');
        this.leftPanelExpandBtn = document.getElementById('leftPanelExpandBtn');
        this.rightPanelExpandBtn = document.getElementById('rightPanelExpandBtn');
        this.layoutContainer = document.querySelector('.layout-container');

        // Mobile elements
        this.bottomSheet = document.getElementById('bottomSheet');
        this.bottomSheetHandle = document.querySelector('.bottom-sheet-handle');
        this.fab = document.getElementById('mobileFab');
        this.fabMenu = document.getElementById('fabMenu');

        // Header elements
        this.headerMenuBtn = document.getElementById('headerMenuBtn');
        this.headerNewGameBtn = document.getElementById('headerNewGameBtn');
        this.headerUndoBtn = document.getElementById('headerUndoBtn');
        this.headerAnalyzeBtn = document.getElementById('headerAnalyzeBtn');

        // State
        this.isLeftPanelCollapsed = false;
        this.isRightPanelCollapsed = false;
        this.isBottomSheetExpanded = false;
        this.isFabMenuOpen = false;

        this.init();
    }

    init() {
        this.setupPanelControls();
        this.setupBottomSheet();
        this.setupFAB();
        this.setupHeaderActions();
        this.setupMobileTabs();
        this.setupQuickSettings();
        this.setupResponsiveHandlers();

        // Initialize panel states based on screen size
        this.handleResize();
    }

    // ============================================
    // PANEL COLLAPSE/EXPAND
    // ============================================

    setupPanelControls() {
        // Left panel collapse
        if (this.leftPanelCollapseBtn) {
            this.leftPanelCollapseBtn.addEventListener('click', () => {
                this.toggleLeftPanel();
            });
        }

        // Left panel expand
        if (this.leftPanelExpandBtn) {
            this.leftPanelExpandBtn.addEventListener('click', () => {
                this.toggleLeftPanel();
            });
        }

        // Right panel collapse
        if (this.rightPanelCollapseBtn) {
            this.rightPanelCollapseBtn.addEventListener('click', () => {
                this.toggleRightPanel();
            });
        }

        // Right panel expand
        if (this.rightPanelExpandBtn) {
            this.rightPanelExpandBtn.addEventListener('click', () => {
                this.toggleRightPanel();
            });
        }
    }

    toggleLeftPanel() {
        this.isLeftPanelCollapsed = !this.isLeftPanelCollapsed;

        if (this.isLeftPanelCollapsed) {
            this.leftPanel.classList.add('collapsed');
            this.layoutContainer.classList.add('left-collapsed');
            this.leftPanelExpandBtn.style.display = 'block';
        } else {
            this.leftPanel.classList.remove('collapsed');
            this.layoutContainer.classList.remove('left-collapsed');
            this.leftPanelExpandBtn.style.display = 'none';
        }

        // Save preference
        localStorage.setItem('leftPanelCollapsed', this.isLeftPanelCollapsed);

        // Trigger board resize event
        window.dispatchEvent(new Event('resize'));
    }

    toggleRightPanel() {
        this.isRightPanelCollapsed = !this.isRightPanelCollapsed;

        if (this.isRightPanelCollapsed) {
            this.rightPanel.classList.add('collapsed');
            this.layoutContainer.classList.add('right-collapsed');
            this.rightPanelExpandBtn.style.display = 'block';
        } else {
            this.rightPanel.classList.remove('collapsed');
            this.layoutContainer.classList.remove('right-collapsed');
            this.rightPanelExpandBtn.style.display = 'none';
        }

        // Save preference
        localStorage.setItem('rightPanelCollapsed', this.isRightPanelCollapsed);

        // Trigger board resize event
        window.dispatchEvent(new Event('resize'));
    }

    // ============================================
    // BOTTOM SHEET (MOBILE)
    // ============================================

    setupBottomSheet() {
        if (!this.bottomSheet) return;

        // Handle drag/swipe
        this.bottomSheetHandle.addEventListener('click', () => {
            this.toggleBottomSheet();
        });

        // Touch support for swipe
        let startY = 0;
        let currentY = 0;

        this.bottomSheetHandle.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
        });

        this.bottomSheetHandle.addEventListener('touchmove', (e) => {
            currentY = e.touches[0].clientY;
        });

        this.bottomSheetHandle.addEventListener('touchend', () => {
            const diff = currentY - startY;
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    // Swipe down - collapse
                    this.collapseBottomSheet();
                } else {
                    // Swipe up - expand
                    this.expandBottomSheet();
                }
            }
        });
    }

    toggleBottomSheet() {
        if (this.isBottomSheetExpanded) {
            this.collapseBottomSheet();
        } else {
            this.expandBottomSheet();
        }
    }

    expandBottomSheet() {
        this.bottomSheet.classList.add('expanded');
        this.isBottomSheetExpanded = true;
    }

    collapseBottomSheet() {
        this.bottomSheet.classList.remove('expanded');
        this.isBottomSheetExpanded = false;
    }

    // ============================================
    // FLOATING ACTION BUTTON (FAB)
    // ============================================

    setupFAB() {
        if (!this.fab) return;

        this.fab.addEventListener('click', () => {
            this.toggleFABMenu();
        });

        // Setup FAB menu items
        const fabNewGame = document.getElementById('fabNewGame');
        const fabUndo = document.getElementById('fabUndo');
        const fabAnalyze = document.getElementById('fabAnalyze');
        const fabFlip = document.getElementById('fabFlip');

        if (fabNewGame) {
            fabNewGame.addEventListener('click', () => {
                document.getElementById('resetBtn')?.click();
                this.closeFABMenu();
            });
        }

        if (fabUndo) {
            fabUndo.addEventListener('click', () => {
                document.getElementById('undoBtn')?.click();
                this.closeFABMenu();
            });
        }

        if (fabAnalyze) {
            fabAnalyze.addEventListener('click', () => {
                document.getElementById('analyzeBtn')?.click();
                this.closeFABMenu();
            });
        }

        if (fabFlip) {
            fabFlip.addEventListener('click', () => {
                document.getElementById('flipBtn')?.click();
                this.closeFABMenu();
            });
        }

        // Close FAB menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isFabMenuOpen &&
                !this.fab.contains(e.target) &&
                !this.fabMenu.contains(e.target)) {
                this.closeFABMenu();
            }
        });
    }

    toggleFABMenu() {
        if (this.isFabMenuOpen) {
            this.closeFABMenu();
        } else {
            this.openFABMenu();
        }
    }

    openFABMenu() {
        this.fabMenu.style.display = 'flex';
        this.fab.classList.add('active');
        this.isFabMenuOpen = true;
    }

    closeFABMenu() {
        this.fabMenu.style.display = 'none';
        this.fab.classList.remove('active');
        this.isFabMenuOpen = false;
    }

    // ============================================
    // HEADER QUICK ACTIONS
    // ============================================

    setupHeaderActions() {
        if (this.headerNewGameBtn) {
            this.headerNewGameBtn.addEventListener('click', () => {
                document.getElementById('resetBtn')?.click();
            });
        }

        if (this.headerUndoBtn) {
            this.headerUndoBtn.addEventListener('click', () => {
                document.getElementById('undoBtn')?.click();
            });
        }

        if (this.headerAnalyzeBtn) {
            this.headerAnalyzeBtn.addEventListener('click', () => {
                document.getElementById('analyzeBtn')?.click();
            });
        }

        if (this.headerMenuBtn) {
            this.headerMenuBtn.addEventListener('click', () => {
                this.expandBottomSheet();
            });
        }
    }

    // ============================================
    // MOBILE TABS (BOTTOM SHEET)
    // ============================================

    setupMobileTabs() {
        const bottomTabs = document.querySelectorAll('.bottom-tab');
        const sidebarTabs = document.querySelectorAll('.sidebar-tab');

        // Sync bottom tabs with sidebar tabs
        bottomTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;

                // Update bottom tabs
                bottomTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Update sidebar tabs
                const correspondingSidebarTab = document.querySelector(`.sidebar-tab[data-tab="${tabName}"]`);
                if (correspondingSidebarTab) {
                    correspondingSidebarTab.click();
                }

                // Expand bottom sheet
                this.expandBottomSheet();
            });
        });

        // Sync sidebar tabs with bottom tabs
        sidebarTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;

                // Update bottom tabs
                const correspondingBottomTab = document.querySelector(`.bottom-tab[data-tab="${tabName}"]`);
                if (correspondingBottomTab) {
                    bottomTabs.forEach(t => t.classList.remove('active'));
                    correspondingBottomTab.classList.add('active');
                }
            });
        });
    }

    // ============================================
    // QUICK SETTINGS SYNC
    // ============================================

    setupQuickSettings() {
        // Sync left panel quick settings with main settings
        const leftShowHints = document.getElementById('leftShowHints');
        const mainShowHints = document.getElementById('showHints');

        const leftAnalysisMode = document.getElementById('leftAnalysisMode');
        const mainAnalysisMode = document.getElementById('analysisMode');

        const leftClockEnabled = document.getElementById('leftClockEnabled');
        const mainClockEnabled = document.getElementById('clockEnabled');

        if (leftShowHints && mainShowHints) {
            leftShowHints.addEventListener('change', () => {
                mainShowHints.checked = leftShowHints.checked;
                mainShowHints.dispatchEvent(new Event('change'));
            });

            mainShowHints.addEventListener('change', () => {
                leftShowHints.checked = mainShowHints.checked;
            });
        }

        if (leftAnalysisMode && mainAnalysisMode) {
            leftAnalysisMode.addEventListener('change', () => {
                mainAnalysisMode.checked = leftAnalysisMode.checked;
                mainAnalysisMode.dispatchEvent(new Event('change'));
            });

            mainAnalysisMode.addEventListener('change', () => {
                leftAnalysisMode.checked = mainAnalysisMode.checked;
            });
        }

        if (leftClockEnabled && mainClockEnabled) {
            leftClockEnabled.addEventListener('change', () => {
                mainClockEnabled.checked = leftClockEnabled.checked;
                mainClockEnabled.dispatchEvent(new Event('change'));
            });

            mainClockEnabled.addEventListener('change', () => {
                leftClockEnabled.checked = mainClockEnabled.checked;
            });
        }

        // Setup left panel game management buttons
        const leftSaveBtn = document.getElementById('leftSaveGameBtn');
        const mainSaveBtn = document.getElementById('saveGameBtn');

        const leftLoadBtn = document.getElementById('leftLoadGameBtn');
        const mainLoadBtn = document.getElementById('loadGameBtn');

        const leftExportBtn = document.getElementById('leftExportPgnBtn');
        const mainExportBtn = document.getElementById('exportPgnBtn');

        const leftImportBtn = document.getElementById('leftImportPgnBtn');
        const mainImportBtn = document.getElementById('importPgnBtn');

        const leftLearningBtn = document.getElementById('leftLearningDashboardBtn');
        const mainLearningBtn = document.getElementById('learningDashboardBtn');

        if (leftSaveBtn && mainSaveBtn) {
            leftSaveBtn.addEventListener('click', () => mainSaveBtn.click());
        }

        if (leftLoadBtn && mainLoadBtn) {
            leftLoadBtn.addEventListener('click', () => mainLoadBtn.click());
        }

        if (leftExportBtn && mainExportBtn) {
            leftExportBtn.addEventListener('click', () => mainExportBtn.click());
        }

        if (leftImportBtn && mainImportBtn) {
            leftImportBtn.addEventListener('click', () => mainImportBtn.click());
        }

        if (leftLearningBtn && mainLearningBtn) {
            leftLearningBtn.addEventListener('click', () => mainLearningBtn.click());
        }
    }

    // ============================================
    // RESPONSIVE HANDLERS
    // ============================================

    setupResponsiveHandlers() {
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    handleResize() {
        const width = window.innerWidth;

        // Hide left panel on smaller screens
        if (width < 1400) {
            this.leftPanel.style.display = 'none';
            this.leftPanelExpandBtn.style.display = 'none';
        } else {
            this.leftPanel.style.display = 'flex';
            if (this.isLeftPanelCollapsed) {
                this.leftPanelExpandBtn.style.display = 'block';
            }
        }

        // Restore saved panel states
        const savedLeftCollapsed = localStorage.getItem('leftPanelCollapsed');
        const savedRightCollapsed = localStorage.getItem('rightPanelCollapsed');

        if (savedLeftCollapsed === 'true' && width >= 1400) {
            this.isLeftPanelCollapsed = false;
            this.toggleLeftPanel();
        }

        if (savedRightCollapsed === 'true' && width >= 1024) {
            this.isRightPanelCollapsed = false;
            this.toggleRightPanel();
        }
    }

    // ============================================
    // PUBLIC API
    // ============================================

    updateEngineStatus(status, text) {
        const engineIndicator = document.querySelector('.engine-indicator');
        const engineText = document.querySelector('.engine-text');
        const headerIndicator = document.querySelector('.header-engine-status .engine-indicator');
        const headerText = document.querySelector('.header-engine-status .engine-text');

        if (engineIndicator) {
            engineIndicator.classList.toggle('active', status === 'active');
        }

        if (headerIndicator) {
            headerIndicator.classList.toggle('active', status === 'active');
        }

        if (engineText) {
            engineText.textContent = text;
        }

        if (headerText) {
            headerText.textContent = text;
        }
    }
}

// Initialize layout controller when DOM is ready
let layoutController;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        layoutController = new LayoutController();
    });
} else {
    layoutController = new LayoutController();
}

// Export for use in other modules
export { layoutController, LayoutController };
