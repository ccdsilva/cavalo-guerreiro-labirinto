// Sistema de áudio para trilha sonora e efeitos sonoros
class AudioManager {
    constructor() {
        this.sounds = {
            move: null,
            item: null,
            mine: null,
            victory: null,
            defeat: null
        };
        this.music = null;
        this.settings = {
            soundEnabled: true,
            musicVolume: 0.7,
            sfxVolume: 0.8
        };
        this.init();
    }

    init() {
        // Carrega configurações
        const savedSettings = storageManager.getSettings();
        this.settings = { ...this.settings, ...savedSettings };

        // Cria contextos de áudio (usando Web Audio API para gerar sons)
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Gera um tom simples usando Web Audio API
    generateTone(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.settings.soundEnabled) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume * this.settings.sfxVolume, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    // Efeito sonoro de movimento
    playMoveSound() {
        // Tom ascendente suave
        this.generateTone(440, 0.1, 'sine', 0.2);
        setTimeout(() => {
            this.generateTone(523, 0.1, 'sine', 0.15);
        }, 50);
    }

    // Efeito sonoro de item coletado
    playItemSound(itemType) {
        switch(itemType) {
            case 'food':
                this.generateTone(659, 0.15, 'sine', 0.25);
                break;
            case 'clock':
                this.generateTone(523, 0.2, 'triangle', 0.3);
                break;
            case 'horseshoe':
                this.generateTone(784, 0.2, 'sine', 0.3);
                break;
            case 'mine':
                // Som de explosão (ruído)
                const bufferSize = this.audioContext.sampleRate * 0.2;
                const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }
                const source = this.audioContext.createBufferSource();
                const gainNode = this.audioContext.createGain();
                source.buffer = buffer;
                source.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                gainNode.gain.setValueAtTime(0.3 * this.settings.sfxVolume, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
                source.start();
                break;
            default:
                this.generateTone(440, 0.15, 'sine', 0.2);
        }
    }

    // Efeito sonoro de vitória
    playVictorySound() {
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, index) => {
            setTimeout(() => {
                this.generateTone(freq, 0.3, 'sine', 0.4);
            }, index * 150);
        });
    }

    // Efeito sonoro de derrota
    playDefeatSound() {
        const notes = [392, 330, 262];
        notes.forEach((freq, index) => {
            setTimeout(() => {
                this.generateTone(freq, 0.4, 'sawtooth', 0.3);
            }, index * 200);
        });
    }

    // Inicia trilha sonora de fundo (loop simples)
    startBackgroundMusic() {
        if (!this.settings.soundEnabled || this.music) return;

        // Cria uma melodia simples e suave em loop
        this.playMusicLoop();
    }

    playMusicLoop() {
        if (!this.settings.soundEnabled) return;

        const melody = [
            { freq: 261.63, duration: 0.3 }, // C
            { freq: 293.66, duration: 0.3 }, // D
            { freq: 329.63, duration: 0.3 }, // E
            { freq: 349.23, duration: 0.3 }, // F
            { freq: 392.00, duration: 0.3 }, // G
            { freq: 440.00, duration: 0.3 }, // A
            { freq: 493.88, duration: 0.3 }, // B
            { freq: 523.25, duration: 0.6 }  // C (oitava)
        ];

        let noteIndex = 0;
        const playNextNote = () => {
            if (!this.settings.soundEnabled) return;

            const note = melody[noteIndex];
            this.generateTone(note.freq, note.duration, 'sine', 0.1 * this.settings.musicVolume);
            
            noteIndex = (noteIndex + 1) % melody.length;
            this.music = setTimeout(playNextNote, note.duration * 1000 + 200);
        };

        playNextNote();
    }

    stopBackgroundMusic() {
        if (this.music) {
            clearTimeout(this.music);
            this.music = null;
        }
    }

    // Ajusta volume da música conforme progresso (cores mais claras = música mais vibrante)
    adjustMusicByProgress(progress) {
        // Progresso de 0 a 1
        // Ajusta frequência base da melodia conforme progresso
        // Implementação simplificada - em produção, usaria arquivos de áudio reais
    }

    // Pausa música momentaneamente para destacar efeito sonoro
    pauseMusicForEffect(duration = 500) {
        const wasPlaying = !!this.music;
        this.stopBackgroundMusic();
        
        if (wasPlaying) {
            setTimeout(() => {
                this.startBackgroundMusic();
            }, duration);
        }
    }

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        if (!this.settings.soundEnabled) {
            this.stopBackgroundMusic();
        } else if (!this.music) {
            this.startBackgroundMusic();
        }
    }
}

const audioManager = new AudioManager();

