// Theme and visual customization management

const BOARD_THEMES = {
    brown: {
        name: 'Brown (Classic)',
        background: 'url("https://cdn.jsdelivr.net/npm/chessground@8.3.3/assets/images/board/brown.png")',
        lightSquare: '#f0d9b5',
        darkSquare: '#b58863'
    },
    blue: {
        name: 'Blue',
        background: 'url("https://cdn.jsdelivr.net/npm/chessground@8.3.3/assets/images/board/blue.png")',
        lightSquare: '#dee3e6',
        darkSquare: '#8ca2ad'
    },
    green: {
        name: 'Green',
        background: 'url("https://cdn.jsdelivr.net/npm/chessground@8.3.3/assets/images/board/green.png")',
        lightSquare: '#ffffdd',
        darkSquare: '#86a666'
    },
    gray: {
        name: 'Gray',
        background: 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, #eee 25%, #eee 75%, #ccc 75%, #ccc)',
        lightSquare: '#eee',
        darkSquare: '#ccc',
        backgroundSize: '25% 25%',
        backgroundPosition: '0 0, 12.5% 12.5%'
    },
    marble: {
        name: 'Marble',
        background: 'url("https://cdn.jsdelivr.net/npm/chessground@8.3.3/assets/images/board/marble.png")',
        lightSquare: '#e8e8e8',
        darkSquare: '#bfbfbf'
    }
};

const PIECE_SETS = {
    cburnett: {
        name: 'Classic (Cburnett)',
        cssUrl: 'https://cdn.jsdelivr.net/gh/lichess-org/lila@master/public/piece-css/cburnett.css'
    },
    merida: {
        name: 'Merida',
        cssUrl: 'https://cdn.jsdelivr.net/gh/lichess-org/lila@master/public/piece-css/merida.css'
    },
    alpha: {
        name: 'Alpha',
        cssUrl: 'https://cdn.jsdelivr.net/gh/lichess-org/lila@master/public/piece-css/alpha.css'
    },
    chess7: {
        name: 'Chess7',
        cssUrl: 'https://cdn.jsdelivr.net/gh/lichess-org/lila@master/public/piece-css/chess7.css'
    },
    companion: {
        name: 'Companion',
        cssUrl: 'https://cdn.jsdelivr.net/gh/lichess-org/lila@master/public/piece-css/companion.css'
    },
    fantasy: {
        name: 'Fantasy',
        cssUrl: 'https://cdn.jsdelivr.net/gh/lichess-org/lila@master/public/piece-css/fantasy.css'
    }
};

const SOUND_URLS = {
    move: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACAgoSGiIqMjpCSk5SWl5iZmpucnZ6foKGio6SlpqeoqaqrrK2ur7CxsrO0tba3uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHS09TV1tfY2drb3N3e3+Dh4uPk5ebn6Onq6+zt7u/w8fLz9PX29/j5+vv8/f7/AP/+/fz7+vn4+Pf29fTz8vHw7+7t7Ovq6ejn5uXk4+Lh4N/e3dzb2tnY19bV1NPSz83My8rJyMfGxcTDwsHAv769vLu6ubi3trW0s7KxsK+urayrqqmop6alpKOioaCfnp2cm5qZmJeWlZSTkpCOjIqIhoSCgH58enl3dXRycXBvbmxrajlpaGdmZWRjYmBfXlxbWllYV1ZVVFNSUVBPTk1MS0pJSEdGRURDQkFAPz49PDo5ODc2NTQzMjEvLi0sKyopKCcmJSQjIiEgHx4dHBsaGRgXFhUUExIREA8ODQwLCgkIBwYFBAMCAQD/fnt5d3V0cnBubW xramhnZmVjYmFgXl1cW1pZWFdWVVRTUk9OTUtKSUhHRkRDQkFAPz48Ozo5ODc2NTQzMjEvLi0sKyopKCcmJSQjIiEgHx4dHBsaGRgXFhUUExIREA8ODQwLCgkIBwYFBAMCAQD/',
    capture: 'data:audio/wav;base64,UklGRmQJAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YUAJAACPkJGSlJWWl5manJ2en6ChoqOlpqeoqqusra6vsLGys7S1tre4ubq7vL2+v8DBwsPExcbHyMnKy8zNzs/Q0dLT1NXW19jZ2tvc3d7f4OHi4+Tl5ufo6err7O3u7/Dx8vP09fb3+Pn6+/z9/v8A/v39/Pv6+ff39vX08/Lx8O/u7ezr6uno5+bl5OPi4eDf3t3c29rZ2NfW1dTT0tHQz87NzMvKycjHxsXEw8LBwL++vby7urm4t7a1tLOysbCvrq2sq6qpqKelpKOioJ+enZybmpmYl5aVlJORkJCPjo2Mi4qJiIeGhYSDgoGAf359fHt6eXh3dnV0c3JxcG9ubWxramlpaGdmZWRjYmFgX15dXFtaWVhXVlVUU1JRTk5NTEtKSUdHRkVEQ0JBPz8+PTw7Ojk3NjU0MzIxMC8uLSwr KikoJyYlJCMiIR8fHh0cGxoZGBcWFRQTEhEQDw4NDAsKCQgHBgUEAwIBAP/+/fz7+vn49/b19PTz8vHw7+7t7Ovq6ejo5+bm5eTj4uHg397d3Nva2djY19bV1NPT0tHQz87OzczLysnJyMfGxcTEw8LBwL+/vr27urq5uLe2tbW0s7KxsLCvrq2sq6qqqa inpqWko6KioKCfnp2cm5uamJiXlpWUk5KSkZCPjo2NjIuKiYiIh4aFhIODgoGAf35+fXx7enp5eHd2dXV0c3JxcHBvbm1sa2tqaWhnZ2ZlZGNjYmFgX19eXVxbW1pZWFdXVlVUU1NTUlFQT09OTU1MSEhHRkZFRENCQkFAPz8+PT08Ozo6OTg3Njc2NTU0MzMyMTAvLy4tLCwrKikoKCc mJSUkIyIiISAfHx4dHBwbGhkZGBcWFhUUExMSEREQDw4ODQwMCwoKCQgHBwYFBQQDAwIBAQAA//7+/f38+/v6+fj4+Pf29fT08/Ly8fDw7+7t7ezt7Ovq6unp6Ojo5+bm5eTk4+Lh4eHg397e3dza2trZ2NjX1tbV1NTT0tHR0M/Pzs3Ny8vKyMjHxsbFxMPCwsHBwL++vr28vLu6urm4uLe2trW0tLOzs rGxsK+vrq6trKyrqqqqqaino6alpaSko6Kioein56embm5lZGRjY2JhYWBfX15eXV1cXFtbWllaWVhYV1dXVlZVVFRTU1NTUlFRUFBPT05OTU1MTEtLSkpKSUlISEZGRUVEREREQ0JCQkFBQEA/Pz4+Pj08PD07Ozs7Ojk5OTk4ODc3NjY2NTU1NDQzMzMzMjEyMTExMDAvLy8vLi4tLS0sLCwrKysqKikpKSkoKCgnJycmJiUlJSQkIyMjIyIhISEhIB8fHx8eHh0dHRwcHBsbGhobGxoaGRkZGBgYFxcXFxYVFRUVFBQUExMTEhISERERERAPDw8PDw4ODQ0NDQwMCwoLCwsKCgoJCQkJCAgIBwcHBwYGBQUFBQQEBAMDAwMDAgICAQEBAQAAAAAA//8A//7+/v7+/f39/f38/Pz8+/v7+/r6+vr6+fn5+fj4+Pj39/f39vb29vb19fX19PTz8/Pz8vLy8vHx8fHw8PDw8O/v7+7u7u7t7e3t7Ozs7Ovr6+rq6urp6enp6Ojo6Ofn5+fm5ubm5eXl5eTk5OPj4+Pi4uLi4eHh4ODg4N/f397e3t7d3d3d3Nzc3Nvb29vb2trZ2dna2dnZ2NjY19fX19fW1tbV1dXV1dTU09PT09PS0tLR0dHR0NDQz8/Pz87Ozs7Nzc3NzMzMzMvLysrKysrJycnIyMjIx8fHxsb GxsXFxcXExMTEw8PDw8LCwsLBwcHBwMDAwL+/v7+/vr6+vb29vby8vLy7u7u7urq6urm5ubm5uLi4uLe3t7e2tra2tra1tbW0tLS0tLOzs7KysrKysrGxsbGxsLCvsK+vr6+urq6trK2tra2srKysq6qrq6urqqqqqqmpqampqKioqKenp6empqampqWlpKSkpKSjo6OjoqKioqKhoaChoKCgoKCfn5+fnp6enp6dnZ2dnJycnJubm5ubmpqampqZmZmZmJiYmJiXl5eXl5aWlpaVlZWVlZSUlJSUk5OTk5OSkpKSkpGRkZGRkJCQkJCPj4+Pj46Ojo6OjY2NjY2MjIyMjIyLi4uLi4qKioqKiYmJiYmJiImIiIiIh4eHh4eHhoaGhoaGhYWFhYWFhISDhIODg4ODgoKCgoKCgYGBgYGBgICAgICAgH9/f39/f35+fn5+fn19fX19fX19fHx8fHx8e3t7e3t7enp6enp6eXl5eXl5eXh4eHh4eHh3d3d3d3d3dnZ2dnZ2dnV1dXV1dXV0dHR0dHR0c3Nzc3Nzc3JycnJycnJycXFxcXFx cXFwcHBwcHBwcG9vb29vb29vbm5ubm5ubm5tbW1tbW1tbWxsbGxsbGxsa2tray==',
    check: 'data:audio/wav;base64,UklGRmQFAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YUAFAACgoaKjpKWmp6ipqqusra6vsLGys7S1tre4ubq7vL2+v8DBwsPExcbHyMnKy8zNzs/Q0dLT1NXW19jZ2tvc3d7f4OHi4+Tl5ufo6err7O3u7/Dx8vP09fb3+Pn6+/z9/v8A//79/Pv6+fj39vX08/Lx8O/u7ezr6uno5+bl5OPi4eDf3t3c29rZ2NfW1dTT0tHQz87NzMvKycjHxsXEw8LBwL++vby7urm4t7a1tLOysbCvrq2sq6qpqKelpKOioJ+enZybmpmYl5aVlJORkJCPjo2Mi4qJiIeGhYSDgoGAf359fHt6eXh3dnV0c3JxcG9ubWxramlpaGdmZWRjYmFgX15dXFtaWVhXVlVUU1JRTk5NTEtKSUdHRkVEQ0JBPz8+PTw7Ojk3NjU0MzIxMC8uLSwr KikoJyYlJCMiIR8fHh0cGxoZGBcWFRQTEhEQDw4NDAsKCQgHBgUEAwIBAP/+/fz7+vn49/b19PTz8vHw7+7t7Ovq6ejo5+bm5eTj4uHg397d3Nva2djY19bV1NPT0tHQz87OzczLysnJyMfGxcTEw8LBwL+/vr27urq5uLe2tbW0s7KxsLCvrq2sq6qqpainoKakpKOioqCgn56dnJubmpiYl5aVlJOSkZCPjo2NjIuKiYiIh4aFhIODgoGAf35+fXx7enp5eHd2dXV0c3JxcHBvbm1sa2tqaWhnZ2ZlZGNjYmFgX19eXVxbW1pZWFdXVlVUU1NTUlFQT09OTU1MSEhHRkZFRENCQkFAPz8+PTw8Ozo6OTg3Njc2NTU0MzMyMTAvLy4tLCwrKikoKCcmJSUkIyIiISAfHx4dHBwbGhkZGBcWFhUUExMSEREQDw4ODQwMCwoKCQgHBwYFBQQDAwIBAQAA//7+/f38+/v6+fj4+Pf29fT08/Ly8fDw7+7t7ezt7Ovq6unp6Ojo5+bm5eTk4+Li4eHg397e3dza2trZ2NjX1tbV1NTT0tHR0M/Pzs3Ny8vKyMjHxsbFxMPCwsHBwL++vr28vLu6urm4uLe2trW0tLOzsrGxsK+vrq6trKyrqqqqpainp6alpaSko6Kioain56embm5lZGRjY2JhYWBfX15eXV1cXFtbWllaWVhYV1dXVlZVVFRTU1NTUlFRUFBPT05OTU1MTEtLSkpKSUlISEZGRUVEREREQ0JCQkFBQEA/Pz4+Pj08PDw7Ozs7Ojk5OTk4ODc3NjY2NTU1NDQzMzMzMjEyMTExMDAvLy8vLi4tLS0sLCwrKysqKikpKSkoKCgnJycmJiUlJSQkIyMjIyIhISEhIB8fHx8eHh0dHRwcHBsbGhobGxoaGRkZGBgYFxcXFxYVFRUVFBQUExMTEhISERERERAPDw8PDw4ODQ0NDQwMCwoLCwsKCgoJCQkJCAgIBwcHBwYGBQUFBQQEBAMDAwMDAgICAQEBAQAAAAAA//8A//7+/v7+/f39/f38/Pz8+/v7+/r6+vr6+fn5+fj4+Pj39/f39vb29vb19fX19PTz8/Pz8vLy8vHx8fHw8PDw8O/v7+7u7u7t7e3t7Ozs7Ovr6+rq6urp6enp6Ojo6Ofn5+fm5ubm5eXl5eTk5OPj4+Pi4uLi4eHh4ODg4N/f397e3t7d3d3d3Nzc3Nvb29vb2trZ2dna2dnZ2NjY19fX19fW1tbV1dXV1dTU09PT09PS0tLR0dHR0NDQz8/Pz87Ozs7Nzc3NzMzMzMvLysrKysrJycnIyMjIx8fHxsbGxsXFxcXExMTEw8PDw8LCwsLBwcHBwMDAwL+/v7+/vr6+vb29vby8vLy7u7u7urq6urm5ubm5uLi4uLe3t7e2tra2tra1tbW0tLS0tLOzs7KysrKysrGxsbGxsLCvsK+vr6+urq6trK2tra2srKysq6qrq6urqqqqqqmpqampqKioqKenp6empqampqWlpKSkpKSjo6OjoqKioqKhoaChoKCgoKCfn5+fnp6enp6dnZ2dnJycnJubm5ubmpqampqZmZmZmJiYmJiXl5eXl5aWlpaVlZWVlZSUlJSUk5OTk5OSkpKSkpGRkZGRkJCQkJCPj4+Pj46Ojo6OjY2NjY2MjIyMjIyLi4uLi4qKioqKiYmJiYmJiImIiIiIh4eHh4eHhoaGhoaGhYWFhYWFhISDhIODg4ODgoKCgoKCgYGBgYGBgICAgICAgH9/f39/f35+fn5+fn19fX19fX19fHx8fHx8e3t7e3t7enp6enp6eXl5eXl5eXh4eHh4eHh3d3d3d3d3dnZ2dnZ2dnV1dXV1dXV0dHR0dHR0c3Nzc3Nzc3JycnJycnJycXFxcXFxcXFwcHBwcHBwcG9vb29vb29vbm5ubm5ubm5tbW1tbW1tbWxsbGxsbGxsa2tray=='
};

class ThemeManager {
    constructor() {
        this.settings = this.loadSettings();
        this.audioEnabled = true;
        this.sounds = {};
        this.initializeSounds();
    }

    loadSettings() {
        const defaults = {
            boardTheme: 'brown',
            pieceSet: 'cburnett',
            darkMode: true,
            boardSize: 600,
            soundEnabled: true,
            animationSpeed: 'normal'
        };

        try {
            const saved = localStorage.getItem('chessThemeSettings');
            return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
        } catch (e) {
            return defaults;
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('chessThemeSettings', JSON.stringify(this.settings));
        } catch (e) {
            console.error('Failed to save theme settings:', e);
        }
    }

    initializeSounds() {
        Object.keys(SOUND_URLS).forEach(soundName => {
            const audio = new Audio(SOUND_URLS[soundName]);
            audio.preload = 'auto';
            this.sounds[soundName] = audio;
        });
    }

    playSound(soundType) {
        if (!this.settings.soundEnabled || !this.audioEnabled) return;

        const sound = this.sounds[soundType];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(err => {
                console.log('Audio play failed:', err);
                this.audioEnabled = false;
            });
        }
    }

    enableAudio() {
        this.audioEnabled = true;
    }

    setBoardTheme(themeName) {
        if (!BOARD_THEMES[themeName]) return;

        this.settings.boardTheme = themeName;
        this.saveSettings();
        this.applyBoardTheme();
    }

    applyBoardTheme() {
        const theme = BOARD_THEMES[this.settings.boardTheme];
        const boardElement = document.querySelector('.board');

        if (boardElement) {
            boardElement.style.backgroundImage = theme.background;
            if (theme.backgroundSize) {
                boardElement.style.backgroundSize = theme.backgroundSize;
            } else {
                boardElement.style.backgroundSize = '100% 100%';
            }
            if (theme.backgroundPosition) {
                boardElement.style.backgroundPosition = theme.backgroundPosition;
            }
        }
    }

    setPieceSet(setName) {
        if (!PIECE_SETS[setName]) return;

        this.settings.pieceSet = setName;
        this.saveSettings();
        this.applyPieceSet();
    }

    applyPieceSet() {
        const setConfig = PIECE_SETS[this.settings.pieceSet];
        const boardElement = document.getElementById('board');

        // Remove old piece set link
        const oldLink = document.getElementById('piece-set-css');
        if (oldLink) {
            oldLink.remove();
        }

        // Add new piece set link
        const link = document.createElement('link');
        link.id = 'piece-set-css';
        link.rel = 'stylesheet';
        link.href = setConfig.cssUrl;
        document.head.appendChild(link);

        // Update board class for piece set
        if (boardElement) {
            // Remove any existing piece set classes
            Object.keys(PIECE_SETS).forEach(setName => {
                boardElement.classList.remove(setName);
            });
            // Add the new one
            boardElement.classList.add(this.settings.pieceSet);
        }
    }

    setDarkMode(enabled) {
        this.settings.darkMode = enabled;
        this.saveSettings();
        this.applyDarkMode();
    }

    applyDarkMode() {
        const body = document.body;

        if (this.settings.darkMode) {
            body.classList.add('dark-mode');
            body.classList.remove('light-mode');
        } else {
            body.classList.add('light-mode');
            body.classList.remove('dark-mode');
        }
    }

    setBoardSize(size) {
        // Clamp size between 300 and 800
        size = Math.max(300, Math.min(800, size));
        this.settings.boardSize = size;
        this.saveSettings();
        this.applyBoardSize();
    }

    applyBoardSize() {
        const boardElement = document.querySelector('.board');
        if (boardElement) {
            boardElement.style.width = `${this.settings.boardSize}px`;
            boardElement.style.height = `${this.settings.boardSize}px`;
        }
    }

    setSoundEnabled(enabled) {
        this.settings.soundEnabled = enabled;
        this.saveSettings();
    }

    setAnimationSpeed(speed) {
        this.settings.animationSpeed = speed;
        this.saveSettings();
        this.applyAnimationSpeed();
    }

    applyAnimationSpeed() {
        const root = document.documentElement;
        const speeds = {
            'slow': '500ms',
            'normal': '300ms',
            'fast': '150ms',
            'instant': '0ms'
        };
        root.style.setProperty('--animation-duration', speeds[this.settings.animationSpeed] || speeds.normal);
    }

    applyAllSettings() {
        this.applyBoardTheme();
        this.applyPieceSet();
        this.applyDarkMode();
        this.applyBoardSize();
        this.applyAnimationSpeed();
    }

    getBoardThemes() {
        return Object.keys(BOARD_THEMES).map(key => ({
            value: key,
            label: BOARD_THEMES[key].name
        }));
    }

    getPieceSets() {
        return Object.keys(PIECE_SETS).map(key => ({
            value: key,
            label: PIECE_SETS[key].name
        }));
    }
}

export const themeManager = new ThemeManager();
export { BOARD_THEMES, PIECE_SETS };
