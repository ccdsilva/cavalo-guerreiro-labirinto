// Sistema de análises pós-jogo e estatísticas
class AnalyticsManager {
    constructor() {
        this.currentGameData = null;
    }

    startGameAnalysis(gameConfig) {
        this.currentGameData = {
            startTime: Date.now(),
            startPosition: null,
            moves: [],
            visitedCells: new Set(),
            stuckPositions: [],
            itemInteractions: [],
            directionChanges: [],
            pathSequence: [],
            undos: 0,
            config: gameConfig
        };
    }

    recordStartPosition(row, col) {
        if (this.currentGameData) {
            this.currentGameData.startPosition = { row, col };
        }
    }

    recordMove(from, to) {
        if (!this.currentGameData) return;

        const move = {
            from,
            to,
            timestamp: Date.now() - this.currentGameData.startTime,
            moveNumber: this.currentGameData.moves.length + 1
        };

        this.currentGameData.moves.push(move);
        this.currentGameData.visitedCells.add(`${to.row},${to.col}`);
        this.currentGameData.pathSequence.push(`${to.row},${to.col}`);

        // Calcula direção do movimento
        const dx = to.col - from.col;
        const dy = to.row - from.row;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        this.currentGameData.directionChanges.push(angle);
    }

    recordStuckPosition(row, col) {
        if (this.currentGameData) {
            const key = `${row},${col}`;
            this.currentGameData.stuckPositions.push(key);
        }
    }

    recordItemInteraction(itemType, row, col) {
        if (this.currentGameData) {
            this.currentGameData.itemInteractions.push({
                type: itemType,
                position: { row, col },
                timestamp: Date.now() - this.currentGameData.startTime
            });
        }
    }

    recordUndo() {
        if (this.currentGameData) {
            this.currentGameData.undos++;
        }
    }

    generateAnalysis() {
        if (!this.currentGameData || this.currentGameData.moves.length === 0) {
            return null;
        }

        const totalTime = Date.now() - this.currentGameData.startTime;
        const totalMoves = this.currentGameData.moves.length;
        const totalHouses = this.currentGameData.visitedCells.size;

        // Taxa de avanço no tempo
        const advanceRate = totalHouses / (totalTime / 1000); // casas por segundo

        // Estatística de casa inicial
        const startPos = this.currentGameData.startPosition;

        // Solução aberta/fechada
        // Analisa se o jogador explorou o tabuleiro de forma ampla (aberta) ou focada (fechada)
        const boardSize = this.currentGameData.config.boardSize;
        const totalCells = boardSize * boardSize;
        const coverageRatio = totalHouses / totalCells;
        
        // Calcula dispersão das casas visitadas
        const positions = Array.from(this.currentGameData.visitedCells).map(key => {
            const [row, col] = key.split(',').map(Number);
            return { row, col };
        });

        const avgRow = positions.reduce((sum, p) => sum + p.row, 0) / positions.length;
        const avgCol = positions.reduce((sum, p) => sum + p.col, 0) / positions.length;

        const dispersion = positions.reduce((sum, p) => {
            const dist = Math.sqrt(Math.pow(p.row - avgRow, 2) + Math.pow(p.col - avgCol, 2));
            return sum + dist;
        }, 0) / positions.length;

        const maxDispersion = Math.sqrt(Math.pow(boardSize, 2) + Math.pow(boardSize, 2)) / 2;
        const normalizedDispersion = dispersion / maxDispersion;

        let solutionStyle = 'balanced';
        if (coverageRatio > 0.7 && normalizedDispersion > 0.6) {
            solutionStyle = 'open'; // Exploração ampla
        } else if (coverageRatio < 0.5 || normalizedDispersion < 0.4) {
            solutionStyle = 'closed'; // Exploração focada
        }

        // Estatística da casa de não retorno (mais frequente em stuckPositions)
        const stuckCounts = {};
        this.currentGameData.stuckPositions.forEach(key => {
            stuckCounts[key] = (stuckCounts[key] || 0) + 1;
        });
        const mostStuckPosition = Object.keys(stuckCounts).reduce((a, b) => 
            stuckCounts[a] > stuckCounts[b] ? a : b, null
        );

        // Sentido característico
        const directions = this.currentGameData.directionChanges;
        let clockwiseMoves = 0;
        let counterclockwiseMoves = 0;

        for (let i = 1; i < directions.length; i++) {
            const prevAngle = directions[i - 1];
            const currAngle = directions[i];
            let diff = currAngle - prevAngle;
            
            // Normaliza para -180 a 180
            while (diff > 180) diff -= 360;
            while (diff < -180) diff += 360;

            if (diff > 0) clockwiseMoves++;
            else if (diff < 0) counterclockwiseMoves++;
        }

        let characteristicDirection = 'balanced';
        if (clockwiseMoves > counterclockwiseMoves * 1.5) {
            characteristicDirection = 'clockwise';
        } else if (counterclockwiseMoves > clockwiseMoves * 1.5) {
            characteristicDirection = 'counterclockwise';
        }

        // Caminhos repetidos (sequências de 3+ movimentos)
        const pathString = this.currentGameData.pathSequence.join('->');
        const repeatedPaths = this.findRepeatedSequences(this.currentGameData.pathSequence, 3);

        // Tempo médio
        const averageMoveTime = totalTime / totalMoves;

        return {
            advanceRate,
            startPosition: startPos,
            solutionStyle,
            mostStuckPosition: mostStuckPosition ? mostStuckPosition.split(',') : null,
            characteristicDirection,
            repeatedPaths,
            averageMoveTime,
            totalTime,
            totalMoves,
            totalHouses,
            coverageRatio,
            dispersion: normalizedDispersion,
            itemInteractions: this.currentGameData.itemInteractions.length,
            undos: this.currentGameData.undos
        };
    }

    findRepeatedSequences(sequence, minLength) {
        const sequences = [];
        for (let i = 0; i <= sequence.length - minLength; i++) {
            const subseq = sequence.slice(i, i + minLength);
            const subseqStr = subseq.join('->');
            
            // Procura por ocorrências dessa subsequência
            let count = 0;
            for (let j = 0; j <= sequence.length - minLength; j++) {
                const candidate = sequence.slice(j, j + minLength).join('->');
                if (candidate === subseqStr) {
                    count++;
                }
            }
            
            if (count > 1) {
                sequences.push({ sequence: subseqStr, count, length: minLength });
            }
        }
        
        // Remove duplicatas
        const unique = [];
        const seen = new Set();
        sequences.forEach(seq => {
            if (!seen.has(seq.sequence)) {
                seen.add(seq.sequence);
                unique.push(seq);
            }
        });
        
        return unique;
    }

    // Compara com estatísticas da comunidade
    compareWithCommunity(analysis) {
        const allHistory = storageManager.getGameHistory();
        if (allHistory.length === 0) return null;

        const sameCategory = allHistory.filter(game => 
            game.config?.boardSize === analysis.config?.boardSize &&
            game.config?.gameMode === analysis.config?.gameMode
        );

        if (sameCategory.length === 0) return null;

        const avgAdvanceRate = sameCategory.reduce((sum, g) => sum + (g.analysis?.advanceRate || 0), 0) / sameCategory.length;
        const avgHouses = sameCategory.reduce((sum, g) => sum + (g.totalHouses || 0), 0) / sameCategory.length;
        const avgTime = sameCategory.reduce((sum, g) => sum + (g.totalTime || 0), 0) / sameCategory.length;

        return {
            advanceRate: {
                player: analysis.advanceRate,
                community: avgAdvanceRate,
                difference: analysis.advanceRate - avgAdvanceRate,
                percentile: this.calculatePercentile(analysis.advanceRate, sameCategory.map(g => g.analysis?.advanceRate || 0))
            },
            houses: {
                player: analysis.totalHouses,
                community: avgHouses,
                difference: analysis.totalHouses - avgHouses,
                percentile: this.calculatePercentile(analysis.totalHouses, sameCategory.map(g => g.totalHouses || 0))
            },
            time: {
                player: analysis.totalTime,
                community: avgTime,
                difference: analysis.totalTime - avgTime,
                percentile: this.calculatePercentile(analysis.totalTime, sameCategory.map(g => g.totalTime || 0), true) // menor é melhor
            }
        };
    }

    calculatePercentile(value, array, reverse = false) {
        if (array.length === 0) return 50;
        const sorted = [...array].sort((a, b) => reverse ? b - a : a - b);
        const index = sorted.findIndex(v => (reverse ? v <= value : v >= value));
        return index === -1 ? 100 : (index / sorted.length) * 100;
    }

    reset() {
        this.currentGameData = null;
    }
}

const analyticsManager = new AnalyticsManager();

