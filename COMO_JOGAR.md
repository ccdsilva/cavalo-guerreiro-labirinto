# 🎮 Como Jogar - Cavalo Guerreiro: Labirinto Onírico

## 🚀 Como Iniciar o Jogo

### Opção 1: Abrir diretamente no navegador
1. Certifique-se de que todos os arquivos estão na mesma pasta:
   - `index.html`
   - `game.js`
   - `storage.js`
   - `audio.js`
   - `analytics.js`
   - `pathLibrary.js`
   - `themes.js`
   - `controls.js`
   - `achievements.js`
   - `styles.css`

2. Clique duas vezes no arquivo `index.html` ou arraste-o para o navegador

3. O jogo abrirá automaticamente!

### Opção 2: Usar um servidor local (recomendado)
Para evitar problemas de segurança do navegador com localStorage:

**Com Python:**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**Com Node.js (http-server):**
```bash
npx http-server
```

**Com PHP:**
```bash
php -S localhost:8000
```

Depois acesse: `http://localhost:8000` no navegador

## 🎯 Primeiros Passos

### 1. Criar Perfil ou Jogar como Convidado
- **Criar Perfil**: Digite um nome (5-13 caracteres alfanuméricos) e senha (4-9 caracteres)
- **Entrar**: Se já tem perfil, faça login
- **Convidado**: Clique em "Continuar como Convidado" (sem salvar progresso)

### 2. Configurar o Jogo
- Escolha o tamanho do tabuleiro (5x5, 6x6, 8x8, 10x10)
- Ou use "Tabuleiro Retangular" para tamanhos personalizados (ex: 6x8)
- Selecione o modo de jogo:
  - **Livre**: Sem limite de tempo
  - **Cronômetro Progressivo**: Complete o mais rápido possível
  - **Cronômetro Regressivo**: Tempo limitado

### 3. Começar a Jogar
- Clique em "Novo Jogo"
- O cavalo aparecerá em uma posição aleatória
- As casas verdes são movimentos válidos

## 🎮 Controles

### Modo Toque/Clique (Padrão)
- Clique nas casas destacadas em verde para mover o cavalo

### Modo Teclado
1. Vá em Configurações (⚙️) e selecione "Teclado"
2. Use as **setas** para navegar entre casas disponíveis
3. Pressione **Enter** ou **Espaço** para confirmar o movimento
4. Pressione **ESC** para cancelar a seleção

### Modo Digitação
1. Vá em Configurações e selecione "Digitação"
2. Digite a coordenada da casa (ex: "a3", "h8")
3. Pressione **Enter** para mover

## 📋 Regras do Jogo

### Movimento do Cavalo
- O cavalo se move em forma de "L":
  - Duas casas em uma direção + uma casa perpendicular
  - Ou uma casa em uma direção + duas casas perpendicular

### Objetivo
- Percorrer o **maior número de casas únicas** possível
- Cada casa visitada aumenta sua pontuação
- Evite repetir casas já visitadas

### Itens Especiais
- 🍎 **Alimento**: +50 pontos
- ⏰ **Relógio**: +30 segundos (modo regressivo)
- 🐴 **Ferradura**: +100 pontos
- 🏜️ **Areia Movediça**: -10 segundos (modo regressivo)
- 🕳️ **Buraco**: -20 pontos
- 💣 **Mina Explosiva**: -100 pontos, -20 segundos, -1 vida
- 💆 **Cela Massageadora**: Remove obstáculos temporariamente (5 segundos)

### Sistema de Vidas
- Você começa com **3 vidas**
- Perde uma vida ao acionar uma mina
- O jogo termina quando não há mais movimentos ou vidas acabam

### Recuo (Desfazer)
- Clique em "Desfazer" para voltar um movimento
- Cada recuo reduz sua pontuação em 5 pontos

## ⚙️ Configurações

Acesse as configurações clicando no ícone ⚙️ no cabeçalho:

### Tema Visual
- Escolha entre 6 temas diferentes
- Cada tema tem cores e atmosfera única

### Estilo do Cavalo
- Personalize a aparência do cavalo (5 estilos disponíveis)

### Áudio
- Ative/desative sons
- Ajuste volume de música e efeitos sonoros

### Acessibilidade
- **Audiodescrição**: Narra os movimentos disponíveis e ações

### Idioma
- Português (BR), Inglês, Espanhol

## 📊 Análises Pós-Jogo

Após terminar uma partida, você verá:
- Pontuação final
- Casas percorridas
- Tempo total
- **Análise detalhada**:
  - Taxa de avanço
  - Estilo de solução (aberta/fechada)
  - Direção característica
  - Tempo médio por movimento

## 🏆 Conquistas

Desbloqueie conquistas ao:
- Realizar primeiro movimento
- Visitar 50 casas
- Visitar todas as casas
- Completar em menos de 2 minutos
- Coletar 10 itens
- Evitar todas as minas
- Jogar sem usar desfazer
- E muito mais!

## 📚 Biblioteca de Caminhos

- Todos os seus caminhos são salvos automaticamente
- Você pode reproduzir caminhos anteriores
- Exportar caminhos para compartilhar

## 🎯 Dicas para Jogar

1. **Planeje seus movimentos**: Tente visualizar o caminho antes de mover
2. **Evite minas**: Elas custam caro em pontos, tempo e vidas
3. **Use a Cela Massageadora**: Ela revela rotas ocultas temporariamente
4. **Modo Progressivo**: Complete rápido para bônus de pontuação
5. **Modo Regressivo**: Gerencie bem o tempo e colete relógios
6. **Explore diferentes temas**: Cada um oferece uma experiência visual única

## 🐛 Solução de Problemas

### O jogo não carrega
- Verifique se todos os arquivos estão na mesma pasta
- Use um servidor local (veja Opção 2 acima)
- Verifique o console do navegador (F12) para erros

### Sons não funcionam
- Verifique se o som está habilitado nas configurações
- Alguns navegadores bloqueiam áudio até interação do usuário (clique em qualquer lugar)

### Dados não salvam
- Certifique-se de que o navegador permite localStorage
- Não use modo anônimo/privado para salvar progresso

## 📱 Compatibilidade

- **Navegadores**: Chrome, Firefox, Safari, Edge (versões recentes)
- **Dispositivos**: Desktop, Tablet, Mobile
- **Requisitos**: JavaScript habilitado, localStorage disponível

---

**Divirta-se explorando o Labirinto Onírico!** 🐴✨

