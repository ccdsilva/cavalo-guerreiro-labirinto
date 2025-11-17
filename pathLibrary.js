// Biblioteca de caminhos com reprodução
class PathLibrary {
    constructor() {
        this.savedPaths = [];
        this.loadPaths();
    }

    loadPaths() {
        const data = storageManager.getData();
        this.savedPaths = data.gameHistory || [];
    }

    savePath(gameData) {
        const pathData = {
            id: Date.now(),
            timestamp: Date.now(),
            username: sessionStorage.getItem('currentUser') || 'guest',
            boardSize: gameData.boardSize,
            gameMode: gameData.gameMode,
            path: gameData.pathSequence || [],
            moves: gameData.moves || [],
            score: gameData.score,
            houses: gameData.visitedCells?.size || 0,
            time: gameData.totalTime || 0,
            startPosition: gameData.startPosition
        };

        this.savedPaths.push(pathData);
        storageManager.saveGameHistory(pathData);
        return pathData;
    }

    getPath(pathId) {
        return this.savedPaths.find(p => p.id === pathId);
    }

    getAllPaths(username = null) {
        if (username) {
            return this.savedPaths.filter(p => p.username === username);
        }
        return this.savedPaths;
    }

    // Reproduz um caminho salvo
    async replayPath(pathId, speed = 1, onMove = null, onComplete = null) {
        const path = this.getPath(pathId);
        if (!path) {
            console.error('Caminho não encontrado');
            return;
        }

        // Pausa música para destacar os sons
        audioManager.pauseMusicForEffect(path.moves.length * (1000 / speed));

        for (let i = 0; i < path.moves.length; i++) {
            const move = path.moves[i];
            
            if (onMove) {
                onMove(move, i + 1, path.moves.length);
            }

            // Toca som de movimento
            audioManager.playMoveSound();

            // Aguarda antes do próximo movimento
            await this.sleep(1000 / speed);
        }

        if (onComplete) {
            onComplete();
        }
    }

    // Reproduz caminho otimizado (sugerido)
    async replayOptimizedPath(pathId, onMove = null, onComplete = null) {
        const path = this.getPath(pathId);
        if (!path) return;

        // Calcula velocidade variável baseada na otimização
        // Movimentos mais rápidos no início, mais lentos em decisões críticas
        const speeds = this.calculateOptimizedSpeeds(path.moves);

        for (let i = 0; i < path.moves.length; i++) {
            const move = path.moves[i];
            const speed = speeds[i] || 1;

            if (onMove) {
                onMove(move, i + 1, path.moves.length);
            }

            audioManager.playMoveSound();
            await this.sleep(1000 / speed);
        }

        if (onComplete) {
            onComplete();
        }
    }

    calculateOptimizedSpeeds(moves) {
        // Algoritmo simples: movimentos consecutivos na mesma direção são mais rápidos
        const speeds = [];
        
        for (let i = 0; i < moves.length; i++) {
            if (i === 0) {
                speeds.push(2); // Primeiro movimento rápido
            } else {
                const prevMove = moves[i - 1];
                const currMove = moves[i];
                
                // Calcula se há continuidade de direção
                const prevDx = prevMove.to.col - prevMove.from.col;
                const prevDy = prevMove.to.row - prevMove.from.row;
                const currDx = currMove.to.col - currMove.from.col;
                const currDy = currMove.to.row - currMove.from.row;
                
                const isContinuous = (prevDx === currDx && prevDy === currDy) ||
                                    (Math.abs(prevDx) === Math.abs(currDx) && Math.abs(prevDy) === Math.abs(currDy));
                
                speeds.push(isContinuous ? 3 : 1.5); // Mais rápido se contínuo
            }
        }
        
        return speeds;
    }

    // Exporta caminho como dados para compartilhamento
    exportPath(pathId, format = 'json') {
        const path = this.getPath(pathId);
        if (!path) return null;

        if (format === 'json') {
            return JSON.stringify(path, null, 2);
        } else if (format === 'csv') {
            // Formato CSV simples
            let csv = 'Move,From Row,From Col,To Row,To Col,Time\n';
            path.moves.forEach((move, index) => {
                csv += `${index + 1},${move.from.row},${move.from.col},${move.to.row},${move.to.col},${move.timestamp}\n`;
            });
            return csv;
        }
        return null;
    }

    // Gera visualização do caminho (string ASCII art simples)
    generatePathVisualization(pathId) {
        const path = this.getPath(pathId);
        if (!path) return null;

        const boardSize = path.boardSize;
        const board = Array(boardSize).fill(null).map(() => Array(boardSize).fill('.'));

        path.moves.forEach((move, index) => {
            const row = move.to.row;
            const col = move.to.col;
            board[row][col] = (index + 1).toString().padStart(2, '0');
        });

        let visualization = '\n';
        for (let row = 0; row < boardSize; row++) {
            visualization += board[row].join(' ') + '\n';
        }

        return visualization;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Download de caminho como arquivo
    downloadPath(pathId, format = 'json') {
        const data = this.exportPath(pathId, format);
        if (!data) return;

        const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `caminho_${pathId}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

const pathLibrary = new PathLibrary();

