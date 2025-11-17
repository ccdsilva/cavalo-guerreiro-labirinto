# 🐴 Cavalo Guerreiro: Labirinto Onírico

Um jogo de quebra-cabeça estratégico onde você guia um cavalo guerreiro através de um labirinto onírico, utilizando os movimentos clássicos do cavalo de xadrez.

## 📋 Descrição

O jogo "Cavalo Guerreiro: Labirinto Onírico" imerge o jogador na jornada de um valente cavalo guerreiro, exausto e ferido após uma batalha árdua. Em busca de refúgio, ele encontra um vale tranquilo e cai em um sono profundo. O jogador deve guiá-lo através de um labirinto onírico, onde cada movimento é crucial para sua recuperação.

## 🎮 Características Principais

### Mecânicas de Jogo
- **Movimento do Cavalo**: Movimentos em forma de "L" (duas casas em uma direção ortogonal e uma casa perpendicular)
- **Objetivo**: Percorrer o maior número possível de casas únicas no tabuleiro
- **Numeração Sequencial**: Cada casa percorrida é numerada automaticamente
- **Progressão Visual**: As cores evoluem de tons escuros (exaustão) para tons claros/vibrantes (regeneração)

### Modos de Jogo
- **Livre**: Sem limite de tempo, explore à vontade
- **Cronômetro Progressivo**: Complete o mais rápido possível para obter bônus
- **Cronômetro Regressivo**: Tempo limitado para completar o objetivo

### Itens Especiais
- 🍎 **Alimento**: Restaura energia e concede bônus de pontuação
- ⏰ **Relógio**: Adiciona tempo extra (modo regressivo)
- 🐴 **Ferradura**: Concede bônus de pontuação
- 🏜️ **Areia Movediça**: Reduz tempo disponível
- 🕳️ **Buraco**: Penaliza pontuação
- 💣 **Mina Explosiva**: Deve ser evitada! Causa perda de pontos e tempo

### Funcionalidades Implementadas
- ✅ Tabuleiros configuráveis (quadrados e retangulares)
- ✅ Sistema de pontuação progressiva com bônus de velocidade
- ✅ Histórico de movimentos com opção de desfazer (com penalidade)
- ✅ Sistema de vidas (3 vidas por partida)
- ✅ Interface responsiva e moderna
- ✅ Feedback visual e sonoro em tempo real
- ✅ **Sistema de perfis** com autenticação
- ✅ **Ranqueamento** geral e por categoria
- ✅ **Análises pós-jogo** detalhadas
- ✅ **Biblioteca de caminhos** com reprodução
- ✅ **Sistema de áudio** completo (música e efeitos)
- ✅ **6 temas visuais** diferentes
- ✅ **5 estilos de cavalo** personalizáveis
- ✅ **Controles alternativos** (teclado, digitação)
- ✅ **Audiodescrição** para acessibilidade
- ✅ **Sistema de conquistas** (10 conquistas)
- ✅ **Seleção de idiomas** (PT, EN, ES)
- ✅ **Item Cela Massageadora** (novo item especial)

## 🚀 Como Jogar

### Iniciando o Jogo

**Método Simples:**
1. Abra o arquivo `index.html` diretamente no navegador (duplo clique)

**Método Recomendado (Servidor Local):**
```bash
# Com Python
python -m http.server 8000

# Com Node.js
npx http-server

# Depois acesse: http://localhost:8000
```

### Primeiros Passos

1. **Criar Perfil ou Jogar como Convidado**
   - Crie um perfil para salvar progresso e ranqueamentos
   - Ou continue como convidado para testar

2. **Configurar Partida**
   - Escolha tamanho do tabuleiro (5x5 até 10x10 ou retangular)
   - Selecione modo: Livre, Progressivo ou Regressivo
   - Clique em "Novo Jogo"

3. **Jogar**
   - Clique nas casas verdes (movimentos válidos)
   - Percorra o máximo de casas únicas
   - Colete itens e evite minas

📖 **Guia Completo**: Veja `COMO_JOGAR.md` para instruções detalhadas

## 🎯 Objetivo

Maximizar a pontuação percorrendo o maior número de casas únicas possível, utilizando os movimentos do cavalo de xadrez. Cada casa visitada aumenta sua pontuação, e itens especiais podem ajudar ou dificultar sua jornada.

## 🛠️ Tecnologias Utilizadas

- HTML5
- CSS3 (com animações e gradientes)
- JavaScript (ES6+)
- Design responsivo

## 📱 Compatibilidade

- Navegadores modernos (Chrome, Firefox, Safari, Edge)
- Dispositivos desktop e mobile
- Interface adaptável a diferentes tamanhos de tela

## 🎨 Personalização

O jogo inclui:
- Paleta de cores progressiva que evolui conforme o progresso
- Animações suaves para feedback visual
- Temas visuais adaptáveis

## 📝 Funcionalidades Futuras

Funcionalidades planejadas para próximas versões:
- 🔄 Modo multiplayer (Jogador 2 - Batalha)
- 📚 Tutorial interativo
- 🌐 Compartilhamento online de caminhos
- 📊 Estatísticas avançadas da comunidade
- 🎨 Mais temas e customizações

## 📁 Estrutura de Arquivos

```
cavalo-guerreiro-labirinto/
├── index.html          # Interface principal
├── game.js             # Lógica do jogo
├── storage.js          # Sistema de armazenamento e perfis
├── audio.js            # Gerenciamento de áudio
├── analytics.js         # Análises pós-jogo
├── pathLibrary.js      # Biblioteca de caminhos
├── themes.js           # Gerenciamento de temas
├── controls.js         # Controles alternativos
├── achievements.js     # Sistema de conquistas
├── styles.css          # Estilos e temas
├── README.md           # Este arquivo
└── COMO_JOGAR.md      # Guia completo de como jogar
```

## 📄 Licença

Este projeto é um protótipo educacional e de demonstração.

---

**Desenvolvido com ❤️ para entusiastas de quebra-cabeças e xadrez**

