// Sistema de controles alternativos (teclado, digitação de quadrante)
class ControlManager {
    constructor() {
        this.controlMode = 'touch'; // 'touch', 'keyboard', 'text'
        this.selectedCell = null;
        this.availableMoves = [];
        this.init();
    }

    init() {
        this.setupKeyboardControls();
        this.setupTextInput();
    }

    setControlMode(mode) {
        this.controlMode = mode;
        this.updateControlUI();
    }

    setupKeyboardControls() {
        let selectedIndex = 0;

        document.addEventListener('keydown', (e) => {
            if (this.controlMode !== 'keyboard' || !gameState.knightPosition) return;

            const validMoves = getValidKnightMoves(
                gameState.knightPosition.row,
                gameState.knightPosition.col
            );

            if (validMoves.length === 0) return;

            switch(e.key) {
                case 'ArrowUp':
                case 'ArrowDown':
                case 'ArrowLeft':
                case 'ArrowRight':
                    e.preventDefault();
                    // Navegação 2D nas casas disponíveis
                    const cols = Math.ceil(Math.sqrt(validMoves.length));
                    const rows = Math.ceil(validMoves.length / cols);

                    if (e.key === 'ArrowUp') {
                        selectedIndex = Math.max(0, selectedIndex - cols);
                    } else if (e.key === 'ArrowDown') {
                        selectedIndex = Math.min(validMoves.length - 1, selectedIndex + cols);
                    } else if (e.key === 'ArrowLeft') {
                        selectedIndex = Math.max(0, selectedIndex - 1);
                    } else if (e.key === 'ArrowRight') {
                        selectedIndex = Math.min(validMoves.length - 1, selectedIndex + 1);
                    }

                    this.highlightKeyboardSelection(validMoves, selectedIndex);
                    break;

                case 'Enter':
                case ' ':
                    e.preventDefault();
                    if (validMoves[selectedIndex]) {
                        const move = validMoves[selectedIndex];
                        handleCellClick(move.row, move.col);
                        selectedIndex = 0;
                    }
                    break;

                case 'Escape':
                    this.clearKeyboardSelection();
                    break;
            }
        });
    }

    highlightKeyboardSelection(validMoves, index) {
        // Remove seleção anterior
        this.clearKeyboardSelection();

        if (validMoves[index]) {
            const move = validMoves[index];
            const cell = gameState.board[move.row][move.col];
            cell.classList.add('keyboard-selected');
            this.selectedCell = { row: move.row, col: move.col };
        }
    }

    clearKeyboardSelection() {
        document.querySelectorAll('.keyboard-selected').forEach(cell => {
            cell.classList.remove('keyboard-selected');
        });
        this.selectedCell = null;
    }

    setupTextInput() {
        const textInput = document.getElementById('coordinate-input');
        if (!textInput) return;

        textInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && this.controlMode === 'text') {
                const value = textInput.value.trim().toLowerCase();
                this.handleCoordinateInput(value);
                textInput.value = '';
            }
        });
    }

    handleCoordinateInput(input) {
        // Formato esperado: a1, b2, h8, etc.
        if (input.length < 2) return;

        const colChar = input[0];
        const rowChar = input[1];

        // Converte letra para coluna (a=0, b=1, etc.)
        const col = colChar.charCodeAt(0) - 'a'.charCodeAt(0);
        const row = parseInt(rowChar) - 1;

        if (isNaN(row) || row < 0 || row >= gameState.boardSize ||
            col < 0 || col >= gameState.boardSize) {
            this.showInputError('Coordenada inválida');
            return;
        }

        // Verifica se é um movimento válido
        const validMoves = getValidKnightMoves(
            gameState.knightPosition.row,
            gameState.knightPosition.col
        );

        const isValidMove = validMoves.some(move => 
            move.row === row && move.col === col
        );

        if (!isValidMove) {
            this.showInputError('Movimento inválido');
            return;
        }

        handleCellClick(row, col);
    }

    showInputError(message) {
        const errorDiv = document.getElementById('input-error');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 2000);
        }
    }

    updateControlUI() {
        const touchControls = document.getElementById('touch-controls');
        const keyboardControls = document.getElementById('keyboard-controls');
        const textControls = document.getElementById('text-controls');

        if (touchControls) touchControls.style.display = this.controlMode === 'touch' ? 'block' : 'none';
        if (keyboardControls) keyboardControls.style.display = this.controlMode === 'keyboard' ? 'block' : 'none';
        if (textControls) textControls.style.display = this.controlMode === 'text' ? 'block' : 'none';
    }

    // Converte coordenadas de linha/coluna para notação de xadrez
    toChessNotation(row, col) {
        const colChar = String.fromCharCode('a'.charCodeAt(0) + col);
        const rowNum = row + 1;
        return `${colChar}${rowNum}`;
    }

    // Converte notação de xadrez para linha/coluna
    fromChessNotation(notation) {
        const colChar = notation[0].toLowerCase();
        const rowChar = notation[1];

        const col = colChar.charCodeAt(0) - 'a'.charCodeAt(0);
        const row = parseInt(rowChar) - 1;

        return { row, col };
    }
}

const controlManager = new ControlManager();

