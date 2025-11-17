// Sistema de armazenamento local para perfis, ranqueamento e estatísticas
class StorageManager {
    constructor() {
        this.storageKey = 'cavalo-guerreiro-data';
        this.init();
    }

    init() {
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, JSON.stringify({
                profiles: {},
                rankings: {
                    general: [],
                    byCategory: {}
                },
                gameHistory: [],
                achievements: {},
                settings: {
                    language: 'pt-BR',
                    resolution: 'auto',
                    theme: 'default',
                    soundEnabled: true,
                    musicVolume: 0.7,
                    sfxVolume: 0.8,
                    audioDescription: false
                }
            }));
        }
    }

    getData() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : null;
    }

    saveData(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    // Perfis
    createProfile(username, password) {
        const data = this.getData();
        if (data.profiles[username]) {
            return { success: false, message: 'Nome de usuário já existe' };
        }

        if (username.length < 5 || username.length > 13 || !/^[a-zA-Z0-9]+$/.test(username)) {
            return { success: false, message: 'Nome deve ter 5-13 caracteres alfanuméricos' };
        }

        if (password.length < 4 || password.length > 9 || !/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/.test(password)) {
            return { success: false, message: 'Senha deve ter 4-9 caracteres alfanuméricos e especiais' };
        }

        data.profiles[username] = {
            password: btoa(password), // Base64 encoding (não é seguro, mas suficiente para demo)
            stats: {
                totalGames: 0,
                totalScore: 0,
                bestScore: 0,
                totalHouses: 0,
                averageTime: 0,
                favoriteStartPosition: null,
                characteristicDirection: null,
                stuckPositions: {},
                repeatedPaths: [],
                solutionStyle: 'balanced' // 'open', 'closed', 'balanced'
            },
            achievements: [],
            gameHistory: []
        };

        this.saveData(data);
        return { success: true, message: 'Perfil criado com sucesso' };
    }

    authenticateProfile(username, password) {
        const data = this.getData();
        const profile = data.profiles[username];
        
        if (!profile) {
            return { success: false, message: 'Usuário não encontrado' };
        }

        if (atob(profile.password) !== password) {
            return { success: false, message: 'Senha incorreta' };
        }

        return { success: true, profile };
    }

    getCurrentProfile() {
        const currentUser = sessionStorage.getItem('currentUser');
        if (!currentUser) return null;
        
        const data = this.getData();
        return data.profiles[currentUser] ? { username: currentUser, ...data.profiles[currentUser] } : null;
    }

    setCurrentProfile(username) {
        sessionStorage.setItem('currentUser', username);
    }

    // Ranqueamento
    updateRanking(gameResult) {
        const data = this.getData();
        const currentUser = sessionStorage.getItem('currentUser');
        if (!currentUser) return;

        const category = `${gameResult.boardSize}x${gameResult.boardSize}_${gameResult.gameMode}`;
        
        if (!data.rankings.byCategory[category]) {
            data.rankings.byCategory[category] = [];
        }

        const rankingEntry = {
            username: currentUser,
            score: gameResult.score,
            houses: gameResult.houses,
            time: gameResult.time,
            moves: gameResult.moves,
            itemsCollected: gameResult.itemsCollected || 0,
            startPosition: gameResult.startPosition,
            undos: gameResult.undos || 0,
            timestamp: Date.now()
        };

        data.rankings.byCategory[category].push(rankingEntry);
        data.rankings.byCategory[category].sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            if (a.houses !== b.houses) return b.houses - a.houses;
            return a.time - b.time;
        });

        // Manter apenas top 100
        if (data.rankings.byCategory[category].length > 100) {
            data.rankings.byCategory[category] = data.rankings.byCategory[category].slice(0, 100);
        }

        // Ranqueamento geral
        data.rankings.general.push(rankingEntry);
        data.rankings.general.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            if (a.houses !== b.houses) return b.houses - a.houses;
            return a.time - b.time;
        });

        if (data.rankings.general.length > 100) {
            data.rankings.general = data.rankings.general.slice(0, 100);
        }

        this.saveData(data);
    }

    getRankings(category = 'general') {
        const data = this.getData();
        if (category === 'general') {
            return data.rankings.general;
        }
        return data.rankings.byCategory[category] || [];
    }

    // Histórico de jogos
    saveGameHistory(gameData) {
        const data = this.getData();
        const currentUser = sessionStorage.getItem('currentUser');
        if (!currentUser) return;

        const gameRecord = {
            username: currentUser,
            timestamp: Date.now(),
            ...gameData
        };

        data.gameHistory.push(gameRecord);
        if (data.gameHistory.length > 1000) {
            data.gameHistory = data.gameHistory.slice(-1000);
        }

        // Salvar no perfil também
        if (data.profiles[currentUser]) {
            data.profiles[currentUser].gameHistory.push(gameRecord);
            if (data.profiles[currentUser].gameHistory.length > 100) {
                data.profiles[currentUser].gameHistory = data.profiles[currentUser].gameHistory.slice(-100);
            }
        }

        this.saveData(data);
    }

    getGameHistory(username = null) {
        const data = this.getData();
        if (username) {
            return data.profiles[username]?.gameHistory || [];
        }
        return data.gameHistory;
    }

    // Configurações
    getSettings() {
        const data = this.getData();
        return data.settings;
    }

    updateSettings(newSettings) {
        const data = this.getData();
        data.settings = { ...data.settings, ...newSettings };
        this.saveData(data);
    }

    // Conquistas
    unlockAchievement(username, achievementId) {
        const data = this.getData();
        if (!data.profiles[username]) return;

        if (!data.profiles[username].achievements.includes(achievementId)) {
            data.profiles[username].achievements.push(achievementId);
            this.saveData(data);
            return true;
        }
        return false;
    }

    getAchievements(username) {
        const data = this.getData();
        return data.profiles[username]?.achievements || [];
    }
}

const storageManager = new StorageManager();

