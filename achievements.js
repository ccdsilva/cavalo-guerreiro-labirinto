// Sistema de conquistas/troféus
class AchievementManager {
    constructor() {
        this.achievements = {
            firstMove: {
                id: 'firstMove',
                name: 'Primeiro Passo',
                description: 'Realize seu primeiro movimento',
                icon: '🎯',
                unlocked: false
            },
            explorer: {
                id: 'explorer',
                name: 'Explorador',
                description: 'Visite 50 casas em uma única partida',
                icon: '🗺️',
                unlocked: false
            },
            master: {
                id: 'master',
                name: 'Mestre',
                description: 'Visite todas as casas do tabuleiro',
                icon: '👑',
                unlocked: false
            },
            speedster: {
                id: 'speedster',
                name: 'Velocista',
                description: 'Complete uma partida em menos de 2 minutos',
                icon: '⚡',
                unlocked: false
            },
            collector: {
                id: 'collector',
                name: 'Colecionador',
                description: 'Colete 10 itens em uma partida',
                icon: '📦',
                unlocked: false
            },
            survivor: {
                id: 'survivor',
                name: 'Sobrevivente',
                description: 'Evite todas as minas em uma partida',
                icon: '🛡️',
                unlocked: false
            },
            perfect: {
                id: 'perfect',
                name: 'Perfeito',
                description: 'Complete uma partida sem usar desfazer',
                icon: '✨',
                unlocked: false
            },
            marathon: {
                id: 'marathon',
                name: 'Maratona',
                description: 'Jogue 10 partidas',
                icon: '🏃',
                unlocked: false
            },
            strategist: {
                id: 'strategist',
                name: 'Estrategista',
                description: 'Alcance pontuação acima de 1000',
                icon: '🧠',
                unlocked: false
            },
            legend: {
                id: 'legend',
                name: 'Lenda',
                description: 'Alcance pontuação acima de 5000',
                icon: '🌟',
                unlocked: false
            }
        };
    }

    checkAchievements(gameData) {
        const currentUser = sessionStorage.getItem('currentUser');
        if (!currentUser) return [];

        const unlocked = [];

        // Primeiro movimento
        if (gameData.moves > 0) {
            this.unlock('firstMove', currentUser, unlocked);
        }

        // Explorador
        if (gameData.visitedCells?.size >= 50) {
            this.unlock('explorer', currentUser, unlocked);
        }

        // Mestre
        const totalCells = gameData.boardSize * gameData.boardSize;
        if (gameData.visitedCells?.size >= totalCells) {
            this.unlock('master', currentUser, unlocked);
        }

        // Velocista
        if (gameData.totalTime && gameData.totalTime < 120000) { // 2 minutos
            this.unlock('speedster', currentUser, unlocked);
        }

        // Colecionador
        if (gameData.itemsCollected >= 10) {
            this.unlock('collector', currentUser, unlocked);
        }

        // Sobrevivente
        if (gameData.minesHit === 0 && gameData.minesOnBoard > 0) {
            this.unlock('survivor', currentUser, unlocked);
        }

        // Perfeito
        if (gameData.undos === 0 && gameData.moves > 10) {
            this.unlock('perfect', currentUser, unlocked);
        }

        // Estrategista
        if (gameData.score >= 1000) {
            this.unlock('strategist', currentUser, unlocked);
        }

        // Lenda
        if (gameData.score >= 5000) {
            this.unlock('legend', currentUser, unlocked);
        }

        // Maratona (verifica histórico)
        const history = storageManager.getGameHistory(currentUser);
        if (history.length >= 10) {
            this.unlock('marathon', currentUser, unlocked);
        }

        return unlocked;
    }

    unlock(achievementId, username, unlockedArray) {
        if (!this.achievements[achievementId]) return;

        const wasUnlocked = storageManager.unlockAchievement(username, achievementId);
        if (wasUnlocked) {
            unlockedArray.push(this.achievements[achievementId]);
            this.showAchievementNotification(this.achievements[achievementId]);
        }
    }

    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-content">
                <div class="achievement-title">Conquista Desbloqueada!</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.description}</div>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    getAchievements(username = null) {
        if (username) {
            const unlocked = storageManager.getAchievements(username);
            return Object.values(this.achievements).map(ach => ({
                ...ach,
                unlocked: unlocked.includes(ach.id)
            }));
        }
        return Object.values(this.achievements);
    }
}

const achievementManager = new AchievementManager();

