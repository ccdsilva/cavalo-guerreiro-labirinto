// Sistema de temas visuais
class ThemeManager {
    constructor() {
        this.themes = {
            default: {
                name: 'Padrão',
                boardColors: {
                    light: '#f0d9b5',
                    dark: '#b58863'
                },
                visitedGradient: ['#667eea', '#764ba2'],
                currentColor: '#f6ad55',
                availableColor: '#48bb78',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            },
            serene: {
                name: 'Sonho Sereno',
                boardColors: {
                    light: '#e8f4f8',
                    dark: '#b8d4e3'
                },
                visitedGradient: ['#a8d5e2', '#7fb3c8'],
                currentColor: '#ffd89b',
                availableColor: '#95e1d3',
                background: 'linear-gradient(135deg, #a8d5e2 0%, #7fb3c8 100%)'
            },
            mystical: {
                name: 'Crepúsculo Místico',
                boardColors: {
                    light: '#2d1b3d',
                    dark: '#1a0f26'
                },
                visitedGradient: ['#6b46c1', '#9333ea'],
                currentColor: '#f59e0b',
                availableColor: '#10b981',
                background: 'linear-gradient(135deg, #1a0f26 0%, #2d1b3d 100%)'
            },
            aurora: {
                name: 'Aurora Revigorante',
                boardColors: {
                    light: '#fff5e6',
                    dark: '#ffe0b3'
                },
                visitedGradient: ['#ff9a56', '#ff6a88'],
                currentColor: '#ffd93d',
                availableColor: '#6bcf7f',
                background: 'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)'
            },
            forest: {
                name: 'Floresta Encantada',
                boardColors: {
                    light: '#e8f5e9',
                    dark: '#a5d6a7'
                },
                visitedGradient: ['#4caf50', '#66bb6a'],
                currentColor: '#ffb74d',
                availableColor: '#81c784',
                background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)'
            },
            crystal: {
                name: 'Cânions Cristalinos',
                boardColors: {
                    light: '#e3f2fd',
                    dark: '#90caf9'
                },
                visitedGradient: ['#42a5f5', '#1e88e5'],
                currentColor: '#ffb74d',
                availableColor: '#64b5f6',
                background: 'linear-gradient(135deg, #1565c0 0%, #42a5f5 100%)'
            }
        };

        this.knightStyles = {
            default: { icon: '♞', color: '#2d3748' },
            golden: { icon: '♞', color: '#f6ad55' },
            silver: { icon: '♞', color: '#cbd5e0' },
            dark: { icon: '♞', color: '#1a202c' },
            vibrant: { icon: '♞', color: '#667eea' }
        };

        this.currentTheme = 'default';
        this.currentKnightStyle = 'default';
    }

    applyTheme(themeName) {
        if (!this.themes[themeName]) {
            themeName = 'default';
        }

        this.currentTheme = themeName;
        const theme = this.themes[themeName];

        // Aplica cores do tabuleiro
        document.documentElement.style.setProperty('--board-light', theme.boardColors.light);
        document.documentElement.style.setProperty('--board-dark', theme.boardColors.dark);
        document.documentElement.style.setProperty('--visited-start', theme.visitedGradient[0]);
        document.documentElement.style.setProperty('--visited-end', theme.visitedGradient[1]);
        document.documentElement.style.setProperty('--current-color', theme.currentColor);
        document.documentElement.style.setProperty('--available-color', theme.availableColor);
        document.documentElement.style.setProperty('--bg-gradient', theme.background);

        // Aplica background ao body
        document.body.style.background = theme.background;

        // Atualiza células do tabuleiro
        this.updateBoardCells();
    }

    updateBoardCells() {
        const theme = this.themes[this.currentTheme];
        const cells = document.querySelectorAll('.cell');
        
        cells.forEach(cell => {
            if (cell.classList.contains('light')) {
                cell.style.background = theme.boardColors.light;
            } else if (cell.classList.contains('dark')) {
                cell.style.background = theme.boardColors.dark;
            }
        });
    }

    applyKnightStyle(styleName) {
        if (!this.knightStyles[styleName]) {
            styleName = 'default';
        }

        this.currentKnightStyle = styleName;
        const style = this.knightStyles[styleName];

        // Atualiza ícones do cavalo
        const knightIcons = document.querySelectorAll('.knight-icon');
        knightIcons.forEach(icon => {
            icon.textContent = style.icon;
            icon.style.color = style.color;
        });
    }

    getTheme(themeName) {
        return this.themes[themeName] || this.themes.default;
    }

    getAllThemes() {
        return Object.keys(this.themes).map(key => ({
            id: key,
            ...this.themes[key]
        }));
    }

    getAllKnightStyles() {
        return Object.keys(this.knightStyles).map(key => ({
            id: key,
            ...this.knightStyles[key]
        }));
    }
}

const themeManager = new ThemeManager();

