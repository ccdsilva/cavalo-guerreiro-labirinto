// Estado do jogo
class GameState {
    constructor() {
        this.boardWidth = 8;
        this.boardHeight = 8;
        this.board = [];
        this.knightPosition = null;
        this.visitedCells = new Set();
        this.moveHistory = [];
        this.score = 0;
        this.moves = 0;
        this.startTime = null;
        this.elapsedTime = 0;
        this.timerInterval = null;
        this.gameMode = 'free';
        this.gameOver = false;
        this.items = new Map(); // Mapa de itens no tabuleiro
        this.regressiveTime = 300; // 5 minutos em segundos para modo regressivo
        this.lives = 3; // Sistema de vidas
        this.undos = 0; // Contador de recuos
        this.itemsCollected = 0;
        this.minesHit = 0;
        this.minesOnBoard = 0;
        this.massageActive = false; // Cela massageadora ativa
        this.pathSequence = []; // Sequência de caminho para biblioteca
        this.multiplayerMode = false;
        this.player2State = null;
    }

    reset() {
        this.visitedCells.clear();
        this.moveHistory = [];
        this.score = 0;
        this.moves = 0;
        this.elapsedTime = 0;
        this.gameOver = false;
        this.items.clear();
        this.lives = 3;
        this.undos = 0;
        this.itemsCollected = 0;
        this.minesHit = 0;
        this.minesOnBoard = 0;
        this.massageActive = false;
        this.pathSequence = [];
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    get boardSize() {
        // Mantém compatibilidade com código antigo
        return this.boardWidth;
    }

    set boardSize(value) {
        this.boardWidth = value;
        this.boardHeight = value;
    }
}

// Instância global do estado do jogo
const gameState = new GameState();

// Inicialização do jogo
function initGame() {
    const boardSizeInput = document.getElementById('board-size');
    const boardWidthInput = document.getElementById('board-width');
    const boardHeightInput = document.getElementById('board-height');
    const gameMode = document.getElementById('game-mode')?.value || 'free';
    
    gameState.reset();
    
    // Suporte a tabuleiros retangulares
    if (boardWidthInput && boardHeightInput) {
        gameState.boardWidth = parseInt(boardWidthInput.value) || 8;
        gameState.boardHeight = parseInt(boardHeightInput.value) || 8;
    } else if (boardSizeInput) {
        gameState.boardSize = parseInt(boardSizeInput.value) || 8;
    } else {
        gameState.boardSize = 8;
    }
    
    gameState.gameMode = gameMode;
    
    // Inicia análise
    analyticsManager.startGameAnalysis({
        boardSize: gameState.boardWidth,
        boardHeight: gameState.boardHeight,
        gameMode: gameState.gameMode
    });
    
    createBoard();
    placeKnight();
    placeItems();
    updateUI();
    startTimer();
    
    // Inicia música de fundo
    audioManager.startBackgroundMusic();
    
    // Event listeners (evita duplicatas)
    const newGameBtn = document.getElementById('btn-new-game');
    const undoBtn = document.getElementById('btn-undo');
    const restartBtn = document.getElementById('btn-restart');
    
    if (newGameBtn) {
        newGameBtn.onclick = initGame;
    }
    if (undoBtn) {
        undoBtn.onclick = undoMove;
    }
    if (restartBtn) {
        restartBtn.onclick = () => {
            document.getElementById('game-over-modal')?.classList.add('hidden');
            initGame();
        };
    }
}

// Cria o tabuleiro
function createBoard() {
    const board = document.getElementById('chessboard');
    if (!board) return;
    
    board.innerHTML = '';
    board.style.gridTemplateColumns = `repeat(${gameState.boardWidth}, 1fr)`;
    board.style.gridTemplateRows = `repeat(${gameState.boardHeight}, 1fr)`;
    
    gameState.board = [];
    
    for (let row = 0; row < gameState.boardHeight; row++) {
        gameState.board[row] = [];
        for (let col = 0; col < gameState.boardWidth; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.setAttribute('aria-label', `Casa ${controlManager.toChessNotation(row, col)}`);
            
            cell.addEventListener('click', () => handleCellClick(row, col));
            
            board.appendChild(cell);
            gameState.board[row][col] = cell;
        }
    }
    
    // Aplica tema
    themeManager.updateBoardCells();
}

// Posiciona o cavalo em uma posição aleatória
function placeKnight() {
    const row = Math.floor(Math.random() * gameState.boardHeight);
    const col = Math.floor(Math.random() * gameState.boardWidth);
    
    gameState.knightPosition = { row, col };
    const cell = gameState.board[row][col];
    cell.classList.add('current');
    
    const knightStyle = themeManager.knightStyles[themeManager.currentKnightStyle];
    cell.innerHTML = `<span class="knight-icon" style="color: ${knightStyle.color}">${knightStyle.icon}</span>`;
    
    // Registra posição inicial na análise
    analyticsManager.recordStartPosition(row, col);
    
    // Marca a posição inicial como visitada
    visitCell(row, col);
    highlightAvailableMoves();
    
    // Audiodescrição
    if (storageManager.getSettings().audioDescription) {
        speakText(`Cavalo posicionado em ${controlManager.toChessNotation(row, col)}`);
    }
}

// Calcula movimentos válidos do cavalo
function getValidKnightMoves(row, col) {
    const moves = [
        { row: row - 2, col: col - 1 },
        { row: row - 2, col: col + 1 },
        { row: row - 1, col: col - 2 },
        { row: row - 1, col: col + 2 },
        { row: row + 1, col: col - 2 },
        { row: row + 1, col: col + 2 },
        { row: row + 2, col: col - 1 },
        { row: row + 2, col: col + 1 }
    ];
    
    return moves.filter(move => {
        return move.row >= 0 && 
               move.row < gameState.boardHeight && 
               move.col >= 0 && 
               move.col < gameState.boardWidth &&
               !gameState.visitedCells.has(`${move.row},${move.col}`);
    });
}

// Destaca movimentos disponíveis
function highlightAvailableMoves() {
    // Remove highlights anteriores
    gameState.board.forEach(row => {
        row.forEach(cell => {
            cell.classList.remove('available');
        });
    });
    
    if (!gameState.knightPosition) return;
    
    const validMoves = getValidKnightMoves(
        gameState.knightPosition.row, 
        gameState.knightPosition.col
    );
    
    validMoves.forEach(move => {
        const cell = gameState.board[move.row][move.col];
        cell.classList.add('available');
    });
    
    // Audiodescrição
    if (storageManager.getSettings().audioDescription && validMoves.length > 0) {
        const movesText = validMoves.map(m => controlManager.toChessNotation(m.row, m.col)).join(', ');
        speakText(`${validMoves.length} movimentos disponíveis: ${movesText}`);
    }
    
    // Se não há movimentos disponíveis, finaliza o jogo
    if (validMoves.length === 0 && !gameState.gameOver) {
        // Registra posição de não retorno
        analyticsManager.recordStuckPosition(
            gameState.knightPosition.row,
            gameState.knightPosition.col
        );
        endGame();
    }
}

// Manipula clique em uma célula
function handleCellClick(row, col) {
    if (gameState.gameOver) return;
    
    const cellKey = `${row},${col}`;
    const validMoves = getValidKnightMoves(
        gameState.knightPosition.row, 
        gameState.knightPosition.col
    );
    
    const isValidMove = validMoves.some(move => 
        move.row === row && move.col === col
    );
    
    if (!isValidMove) return;
    
    // Verifica se há item na célula
    const item = gameState.items.get(cellKey);
    if (item) {
        handleItem(item, row, col);
    }
    
    // Move o cavalo
    moveKnight(row, col);
}

// Move o cavalo para nova posição
function moveKnight(newRow, newCol) {
    const oldRow = gameState.knightPosition.row;
    const oldCol = gameState.knightPosition.col;
    
    // Salva no histórico
    gameState.moveHistory.push({
        from: { row: oldRow, col: oldCol },
        to: { row: newRow, col: newCol },
        score: gameState.score,
        visitedCount: gameState.visitedCells.size
    });
    
    // Registra movimento na análise
    analyticsManager.recordMove(
        { row: oldRow, col: oldCol },
        { row: newRow, col: newCol }
    );
    
    // Remove cavalo da posição anterior
    const oldCell = gameState.board[oldRow][oldCol];
    oldCell.classList.remove('current');
    oldCell.innerHTML = '';
    
    // Move para nova posição
    gameState.knightPosition = { row: newRow, col: newCol };
    const newCell = gameState.board[newRow][newCol];
    newCell.classList.remove('available');
    newCell.classList.add('current');
    
    const knightStyle = themeManager.knightStyles[themeManager.currentKnightStyle];
    newCell.innerHTML = `<span class="knight-icon" style="color: ${knightStyle.color}">${knightStyle.icon}</span>`;
    
    // Marca como visitada
    visitCell(newRow, newCol);
    
    // Adiciona à sequência de caminho
    gameState.pathSequence.push(`${newRow},${newCol}`);
    
    // Atualiza estatísticas
    gameState.moves++;
    updateScore();
    updateUI();
    
    // Feedback sonoro
    audioManager.pauseMusicForEffect(200);
    audioManager.playMoveSound();
    
    // Audiodescrição
    if (storageManager.getSettings().audioDescription) {
        speakText(`Movido para ${controlManager.toChessNotation(newRow, newCol)}`);
    }
    
    highlightAvailableMoves();
}

// Marca célula como visitada
function visitCell(row, col) {
    const cellKey = `${row},${col}`;
    
    if (gameState.visitedCells.has(cellKey)) return;
    
    gameState.visitedCells.add(cellKey);
    const cell = gameState.board[row][col];
    cell.classList.add('visited');
    
    // Adiciona número sequencial
    const visitNumber = gameState.visitedCells.size;
    const numberSpan = document.createElement('span');
    numberSpan.className = 'cell-number';
    numberSpan.textContent = visitNumber;
    cell.appendChild(numberSpan);
    
    // Aplica classe de progresso baseada na porcentagem
    const totalCells = gameState.boardWidth * gameState.boardHeight;
    const progress = Math.min(7, Math.floor((visitNumber / totalCells) * 7));
    cell.classList.add(`progress-${progress}`);
    
    // Atualiza música conforme progresso
    const progressRatio = visitNumber / totalCells;
    audioManager.adjustMusicByProgress(progressRatio);
    
    // Remove item se existir
    if (gameState.items.has(cellKey)) {
        const item = gameState.items.get(cellKey);
        gameState.items.delete(cellKey);
        const itemIcon = cell.querySelector('.item-icon');
        if (itemIcon) {
            itemIcon.remove();
        }
        cell.classList.remove('item-food', 'item-clock', 'item-horseshoe', 'item-sand', 'item-hole', 'item-mine', 'item-massage');
    }
}

// Atualiza pontuação
function updateScore() {
    const baseScore = gameState.visitedCells.size * 10;
    let speedBonus = 0;
    
    if (gameState.gameMode === 'progressive') {
        speedBonus = Math.max(0, 1000 - gameState.elapsedTime);
    }
    
    // Penalidade por recuos
    const undoPenalty = gameState.undos * 5;
    
    gameState.score = Math.max(0, baseScore + speedBonus - undoPenalty);
}

// Coloca itens aleatórios no tabuleiro
function placeItems() {
    const itemTypes = ['food', 'clock', 'horseshoe', 'sand', 'hole', 'mine', 'massage'];
    const totalCells = gameState.boardWidth * gameState.boardHeight;
    const itemCount = Math.floor(totalCells * 0.15); // 15% das casas
    
    gameState.minesOnBoard = 0;
    
    for (let i = 0; i < itemCount; i++) {
        let row, col, cellKey;
        do {
            row = Math.floor(Math.random() * gameState.boardHeight);
            col = Math.floor(Math.random() * gameState.boardWidth);
            cellKey = `${row},${col}`;
        } while (
            gameState.items.has(cellKey) || 
            (gameState.knightPosition && gameState.knightPosition.row === row && gameState.knightPosition.col === col)
        );
        
        const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
        gameState.items.set(cellKey, { type: itemType, row, col });
        
        if (itemType === 'mine') {
            gameState.minesOnBoard++;
        }
        
        const cell = gameState.board[row][col];
        cell.classList.add(`item-${itemType}`);
        
        // Adiciona ícone visual
        const icon = getItemIcon(itemType);
        const iconSpan = document.createElement('span');
        iconSpan.className = 'item-icon';
        iconSpan.textContent = icon;
        cell.appendChild(iconSpan);
    }
}

// Retorna ícone do item
function getItemIcon(itemType) {
    const icons = {
        food: '🍎',
        clock: '⏰',
        horseshoe: '🐴',
        sand: '🏜️',
        hole: '🕳️',
        mine: '💣',
        massage: '💆'
    };
    return icons[itemType] || '?';
}

// Manipula interação com item
function handleItem(item, row, col) {
    audioManager.playItemSound(item.type);
    analyticsManager.recordItemInteraction(item.type, row, col);
    gameState.itemsCollected++;
    
    switch (item.type) {
        case 'food':
            gameState.score += 50;
            break;
        case 'clock':
            if (gameState.gameMode === 'regressive') {
                gameState.regressiveTime += 30;
            }
            break;
        case 'horseshoe':
            gameState.score += 100;
            break;
        case 'sand':
            // Reduz velocidade (aumenta tempo)
            if (gameState.gameMode === 'regressive') {
                gameState.regressiveTime -= 10;
            }
            break;
        case 'hole':
            // Requer movimento extra (já foi movido, então apenas penaliza)
            gameState.score -= 20;
            break;
        case 'mine':
            // Perde pontos e tempo
            gameState.score -= 100;
            gameState.minesHit++;
            gameState.lives--;
            if (gameState.gameMode === 'regressive') {
                gameState.regressiveTime -= 20;
            }
            if (gameState.lives <= 0) {
                endGame();
            } else {
                alert('💣 Mina explodida! Você perdeu pontos, tempo e uma vida!');
            }
            break;
        case 'massage':
            // Cela massageadora - limpa obstáculos temporariamente
            activateMassageCell();
            break;
    }
    
    updateUI();
}

// Ativa efeito da cela massageadora
function activateMassageCell() {
    gameState.massageActive = true;
    
    // Remove temporariamente obstáculos (areia, buracos) por alguns segundos
    const obstacles = ['item-sand', 'item-hole'];
    obstacles.forEach(obstacleClass => {
        document.querySelectorAll(`.${obstacleClass}`).forEach(cell => {
            cell.style.opacity = '0.3';
        });
    });
    
    // Revela novas rotas (mostra casas não visitadas mais claramente)
    gameState.board.forEach(row => {
        row.forEach(cell => {
            if (!cell.classList.contains('visited') && !cell.classList.contains('current')) {
                cell.style.boxShadow = '0 0 10px rgba(72, 187, 120, 0.5)';
            }
        });
    });
    
    setTimeout(() => {
        gameState.massageActive = false;
        obstacles.forEach(obstacleClass => {
            document.querySelectorAll(`.${obstacleClass}`).forEach(cell => {
                cell.style.opacity = '1';
            });
        });
        gameState.board.forEach(row => {
            row.forEach(cell => {
                if (!cell.classList.contains('visited') && !cell.classList.contains('current')) {
                    cell.style.boxShadow = '';
                }
            });
        });
    }, 5000); // 5 segundos
}

// Desfaz último movimento
function undoMove() {
    if (gameState.moveHistory.length === 0 || gameState.gameOver) return;
    
    const lastMove = gameState.moveHistory.pop();
    gameState.undos++;
    analyticsManager.recordUndo();
    
    // Remove última célula visitada
    const lastKey = `${lastMove.to.row},${lastMove.to.col}`;
    gameState.visitedCells.delete(lastKey);
    
    // Remove da sequência de caminho
    if (gameState.pathSequence.length > 0) {
        gameState.pathSequence.pop();
    }
    
    const lastCell = gameState.board[lastMove.to.row][lastMove.to.col];
    lastCell.classList.remove('visited', 'current');
    lastCell.innerHTML = '';
    lastCell.querySelectorAll('.cell-number').forEach(el => el.remove());
    
    // Restaura posição anterior
    gameState.knightPosition = lastMove.from;
    const oldCell = gameState.board[lastMove.from.row][lastMove.from.col];
    oldCell.classList.add('current');
    
    const knightStyle = themeManager.knightStyles[themeManager.currentKnightStyle];
    oldCell.innerHTML = `<span class="knight-icon" style="color: ${knightStyle.color}">${knightStyle.icon}</span>`;
    
    // Restaura pontuação
    gameState.score = lastMove.score;
    gameState.moves--;
    
    updateScore(); // Recalcula com penalidade de recuo
    updateUI();
    highlightAvailableMoves();
}

// Inicia cronômetro
function startTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    gameState.startTime = Date.now();
    
    if (gameState.gameMode === 'free') {
        // Modo livre - apenas mostra tempo decorrido
        gameState.timerInterval = setInterval(() => {
            gameState.elapsedTime = Math.floor((Date.now() - gameState.startTime) / 1000);
            updateTimer();
        }, 1000);
    } else if (gameState.gameMode === 'progressive') {
        // Modo progressivo - tempo aumenta
        gameState.timerInterval = setInterval(() => {
            gameState.elapsedTime = Math.floor((Date.now() - gameState.startTime) / 1000);
            updateTimer();
            updateScore();
        }, 1000);
    } else if (gameState.gameMode === 'regressive') {
        // Modo regressivo - tempo diminui
        gameState.timerInterval = setInterval(() => {
            gameState.regressiveTime--;
            if (gameState.regressiveTime <= 0) {
                endGame();
                return;
            }
            updateTimer();
        }, 1000);
    }
}

// Atualiza display do cronômetro
function updateTimer() {
    const timerElement = document.getElementById('timer');
    let timeToShow;
    
    if (gameState.gameMode === 'regressive') {
        const minutes = Math.floor(gameState.regressiveTime / 60);
        const seconds = gameState.regressiveTime % 60;
        timeToShow = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    } else {
        const minutes = Math.floor(gameState.elapsedTime / 60);
        const seconds = gameState.elapsedTime % 60;
        timeToShow = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    
    timerElement.textContent = timeToShow;
}

// Finaliza o jogo
function endGame() {
    if (gameState.gameOver) return;
    
    gameState.gameOver = true;
    audioManager.stopBackgroundMusic();
    
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    // Remove highlights
    gameState.board.forEach(row => {
        row.forEach(cell => {
            cell.classList.remove('available');
        });
    });
    
    // Gera análise
    const analysis = analyticsManager.generateAnalysis();
    const totalTime = Date.now() - (analyticsManager.currentGameData?.startTime || Date.now());
    
    // Salva histórico do jogo
    const gameData = {
        boardSize: gameState.boardWidth,
        boardHeight: gameState.boardHeight,
        gameMode: gameState.gameMode,
        score: gameState.score,
        houses: gameState.visitedCells.size,
        time: totalTime,
        moves: gameState.moves,
        moveHistory: analyticsManager.currentGameData?.moves || [],
        itemsCollected: gameState.itemsCollected,
        startPosition: gameState.knightPosition,
        undos: gameState.undos,
        minesHit: gameState.minesHit,
        minesOnBoard: gameState.minesOnBoard,
        pathSequence: gameState.pathSequence,
        visitedCells: gameState.visitedCells,
        analysis: analysis
    };
    
    // Salva caminho na biblioteca
    pathLibrary.savePath(gameData);
    
    // Atualiza ranqueamento
    storageManager.updateRanking(gameData);
    
    // Salva histórico
    storageManager.saveGameHistory(gameData);
    
    // Verifica conquistas
    const unlockedAchievements = achievementManager.checkAchievements(gameData);
    
    // Toca som de vitória/derrota
    if (gameState.lives > 0 && gameState.visitedCells.size > 0) {
        audioManager.playVictorySound();
    } else {
        audioManager.playDefeatSound();
    }
    
    // Mostra modal de fim de jogo
    showGameOverModal(gameData, analysis, unlockedAchievements);
}

// Atualiza interface
function updateUI() {
    const scoreEl = document.getElementById('score');
    const housesEl = document.getElementById('houses-visited');
    const movesEl = document.getElementById('moves');
    const livesEl = document.getElementById('lives');
    
    if (scoreEl) scoreEl.textContent = gameState.score;
    if (housesEl) housesEl.textContent = gameState.visitedCells.size;
    if (movesEl) movesEl.textContent = gameState.moves;
    if (livesEl) livesEl.textContent = gameState.lives;
    
    // Atualiza botão desfazer
    const undoBtn = document.getElementById('btn-undo');
    if (undoBtn) {
        undoBtn.disabled = gameState.moveHistory.length === 0 || gameState.gameOver;
    }
}

// Mostra modal de fim de jogo com análises
function showGameOverModal(gameData, analysis, achievements) {
    const modal = document.getElementById('game-over-modal');
    if (!modal) return;
    
    document.getElementById('final-score').textContent = gameData.score;
    document.getElementById('final-houses').textContent = gameData.houses;
    document.getElementById('final-time').textContent = formatTime(gameData.time);
    
    // Adiciona análises se disponível
    const analysisSection = document.getElementById('analysis-section');
    if (analysisSection && analysis) {
        analysisSection.innerHTML = `
            <h3>Análise da Partida</h3>
            <p><strong>Taxa de Avanço:</strong> ${analysis.advanceRate.toFixed(2)} casas/segundo</p>
            <p><strong>Estilo de Solução:</strong> ${getSolutionStyleName(analysis.solutionStyle)}</p>
            <p><strong>Direção Característica:</strong> ${getDirectionName(analysis.characteristicDirection)}</p>
            <p><strong>Tempo Médio por Movimento:</strong> ${(analysis.averageMoveTime / 1000).toFixed(2)}s</p>
        `;
    }
    
    // Mostra conquistas desbloqueadas
    if (achievements && achievements.length > 0) {
        achievements.forEach(ach => {
            achievementManager.showAchievementNotification(ach);
        });
    }
    
    modal.classList.remove('hidden');
}

function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function getSolutionStyleName(style) {
    const names = {
        'open': 'Exploração Aberta',
        'closed': 'Exploração Focada',
        'balanced': 'Equilibrado'
    };
    return names[style] || style;
}

function getDirectionName(direction) {
    const names = {
        'clockwise': 'Sentido Horário',
        'counterclockwise': 'Sentido Anti-horário',
        'balanced': 'Equilibrado'
    };
    return names[direction] || direction;
}

// Função de audiodescrição
function speakText(text) {
    if ('speechSynthesis' in window && storageManager.getSettings().audioDescription) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = storageManager.getSettings().language || 'pt-BR';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        speechSynthesis.speak(utterance);
    }
}

// Inicializa quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    // Carrega configurações
    const settings = storageManager.getSettings();
    themeManager.applyTheme(settings.theme || 'default');
    themeManager.applyKnightStyle('default');
    audioManager.updateSettings(settings);
    
    // Verifica se há usuário logado
    const currentUser = storageManager.getCurrentProfile();
    if (!currentUser) {
        // Mostra modal de login/criação de perfil
        showLoginModal();
    } else {
        initGame();
    }
    
    // Event listeners para mudanças de configuração
    const boardSizeEl = document.getElementById('board-size');
    const boardWidthEl = document.getElementById('board-width');
    const boardHeightEl = document.getElementById('board-height');
    const gameModeEl = document.getElementById('game-mode');
    
    if (boardSizeEl) {
        boardSizeEl.addEventListener('change', initGame);
    }
    if (boardWidthEl) {
        boardWidthEl.addEventListener('change', initGame);
    }
    if (boardHeightEl) {
        boardHeightEl.addEventListener('change', initGame);
    }
    if (gameModeEl) {
        gameModeEl.addEventListener('change', initGame);
    }
});

// Modal de login/criação de perfil
function showLoginModal() {
    // Será implementado no HTML
    const loginModal = document.getElementById('login-modal');
    if (loginModal) {
        loginModal.classList.remove('hidden');
    }
}

