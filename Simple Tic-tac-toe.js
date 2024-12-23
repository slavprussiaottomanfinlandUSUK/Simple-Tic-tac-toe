class CreditsScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'CreditsScene'
        });
    }
    create() {
        this.cameras.main.setBackgroundColor(this.registry.get('paperMode') ? '#f0e6d2' : '#000000');

        // Title
        this.add.text(400, 100, 'Credits', {
            fontSize: '48px',
            fill: this.registry.get('paperMode') ? '#2b2b2b' : '#ffffff'
        }).setOrigin(0.5);
        // Credits text
        this.add.text(400, 200, 'Developed by RoseBud AI', {
            fontSize: '32px',
            fill: this.registry.get('paperMode') ? '#2b2b2b' : '#ffffff'
        }).setOrigin(0.5);
        // License text
        const licenseText = this.add.text(400, 300, 'This is free and unencumbered software released into the public domain.\n\n' +
            'Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, ' +
            'either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, ' +
            'and by any means.\n\n' +
            'For more information, please refer to <http://unlicense.org>', {
                fontSize: '16px',
                fill: this.registry.get('paperMode') ? '#2b2b2b' : '#ffffff',
                align: 'center',
                wordWrap: {
                    width: 600
                }
            }).setOrigin(0.5);
        // Back button
        const backButton = this.add.text(400, 500, 'Back to Menu', {
            fontSize: '32px',
            fill: this.registry.get('paperMode') ? '#2b2b2b' : '#ffffff'
        }).setOrigin(0.5);
        backButton.setInteractive({
                useHandCursor: true
            })
            .on('pointerover', () => backButton.setStyle({
                fill: '#00ff00'
            }))
            .on('pointerout', () => backButton.setStyle({
                fill: this.registry.get('paperMode') ? '#2b2b2b' : '#ffffff'
            }))
            .on('pointerdown', () => this.scene.start('MenuScene'));
    }
}
class MenuScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'MenuScene'
        });
    }
    create() {
        // Set the background color to black
        this.cameras.main.setBackgroundColor(this.registry.get('paperMode') ? '#f0e6d2' : '#000000');
        const centerX = this.cameras.main.centerX;

        // Add title
        this.add.text(centerX, 100, 'Simple Tic-tac-toe', {
            fontSize: '48px',
            fill: this.registry.get('paperMode') ? '#2b2b2b' : '#ffffff'
        }).setOrigin(0.5);

        const menuItems = ['1 Player', '2 Players', this.registry.get('paperMode') ? 'Dark Mode' : 'Paper Mode', 'Credits'];
        const startY = 250;
        const spacing = 70;
        menuItems.forEach((item, index) => {
            const y = startY + (spacing * index);
            const text = this.add.text(centerX, y, item, {
                fontSize: '32px',
                fill: this.registry.get('paperMode') ? '#2b2b2b' : '#ffffff'
            }).setOrigin(0.5);
            text.setInteractive({
                    useHandCursor: true
                })
                .on('pointerover', () => text.setStyle({
                    fill: '#00ff00'
                }))
                .on('pointerout', () => text.setStyle({
                    fill: this.registry.get('paperMode') ? '#2b2b2b' : '#ffffff'
                }))
                .on('pointerdown', () => {
                    if (item === '1 Player') {
                        this.scene.start('GameScene', {
                            isAIGame: true
                        });
                    } else if (item === '2 Players') {
                        this.scene.start('GameScene', {
                            isAIGame: false
                        });
                    } else if (item === 'Paper Mode' || item === 'Dark Mode') {
                        this.registry.set('paperMode', !this.registry.get('paperMode'));
                        this.scene.restart();
                    } else if (item === 'Credits') {
                        this.scene.start('CreditsScene');
                    }
                });
        });
    }
}
class GameScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'GameScene'
        });
        this.cellSize = 100;
        this.boardX = 300;
        this.boardY = 150;
        this.gameState = Array(9).fill('');
        this.currentPlayer = '';
        this.isAIGame = true;
        this.gameActive = true;
        this.scoreX = 0;
        this.scoreO = 0;
        this.winLine = null;
    }
    init(data) {
        // Reset game state
        this.gameState = Array(9).fill('');
        this.gameActive = true;
        this.currentPlayer = Math.random() < 0.5 ? 'X' : 'O';
        this.isAIGame = data.isAIGame;
        // Reset scores when starting new game mode
        this.scoreX = 0;
        this.scoreO = 0;

        if (this.isAIGame) {
            // Randomly assign X or O to player and AI
            this.playerSymbol = Math.random() < 0.5 ? 'X' : 'O';
            this.aiSymbol = this.playerSymbol === 'X' ? 'O' : 'X';
        }
    }
    create() {
        // Set the background color based on mode
        const isPaperMode = this.registry.get('paperMode');
        this.cameras.main.setBackgroundColor(isPaperMode ? '#f0e6d2' : '#000000');
        // Add score displays
        this.scoreTextX = this.add.text(50, 50, 'X: 0', {
            fontSize: '28px',
            fill: this.registry.get('paperMode') ? '#2b2b2b' : '#ffffff'
        });
        this.scoreTextO = this.add.text(750, 50, 'O: 0', {
            fontSize: '28px',
            fill: this.registry.get('paperMode') ? '#2b2b2b' : '#ffffff'
        }).setOrigin(1, 0);
        // Add space key for restart and ESC for menu
        this.input.keyboard.on('keydown-SPACE', () => {
            if (!this.gameActive) {
                this.resetGame();
            }
        });

        // Add ESC key for returning to menu
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('MenuScene');
        });
        // Current player was already set in init()
        // Create turn text
        this.turnText = this.add.text(this.boardX + (this.cellSize * 1.5), this.boardY - 50, '', {
            fontSize: '24px',
            fill: this.registry.get('paperMode') ? '#2b2b2b' : '#ffffff',
            align: 'center',
            wordWrap: {
                width: 400
            }
        }).setOrigin(0.5);
        this.updateTurnText();
        // Create graphics object for drawing the grid
        const graphics = this.add.graphics();
        // Set line style (thickness and color)
        graphics.lineStyle(2, this.registry.get('paperMode') ? 0x2b2b2b : 0xFFFFFF);
        // Draw vertical lines
        graphics.beginPath();
        graphics.moveTo(this.boardX + this.cellSize, this.boardY);
        graphics.lineTo(this.boardX + this.cellSize, this.boardY + this.cellSize * 3);
        graphics.moveTo(this.boardX + this.cellSize * 2, this.boardY);
        graphics.lineTo(this.boardX + this.cellSize * 2, this.boardY + this.cellSize * 3);
        graphics.strokePath();
        // Draw horizontal lines
        graphics.beginPath();
        graphics.moveTo(this.boardX, this.boardY + this.cellSize);
        graphics.lineTo(this.boardX + this.cellSize * 3, this.boardY + this.cellSize);
        graphics.moveTo(this.boardX, this.boardY + this.cellSize * 2);
        graphics.lineTo(this.boardX + this.cellSize * 3, this.boardY + this.cellSize * 2);
        graphics.strokePath();
        // Create invisible rectangles for each cell
        this.cells = [];
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const cellX = this.boardX + (col * this.cellSize);
                const cellY = this.boardY + (row * this.cellSize);

                const cell = this.add.rectangle(
                    cellX + this.cellSize / 2,
                    cellY + this.cellSize / 2,
                    this.cellSize,
                    this.cellSize
                );
                cell.setInteractive();
                cell.setData('row', row);
                cell.setData('col', col);
                cell.setData('index', row * 3 + col);
                this.cells.push(cell);
                // Add click handler
                cell.on('pointerdown', () => this.handleCellClick(cell));
            }
        }
        // Create text objects for X's and O's
        this.marks = this.add.group();
        // If it's AI's turn first, make a move
        if (this.isAIGame && this.currentPlayer === this.aiSymbol) {
            this.time.delayedCall(500, this.makeAIMove, [], this);
        }
    }
    updateTurnText() {
        if (this.isAIGame) {
            const currentPlayerText = this.currentPlayer === this.playerSymbol ? 'Your' : "AI's";
            this.turnText.setText(`${currentPlayerText} turn (${this.currentPlayer})`);
        } else {
            this.turnText.setText(`Player ${this.currentPlayer}'s turn`);
        }
    }
    handleCellClick(cell) {
        if (!this.gameActive) return;

        const index = cell.getData('index');

        // Check if cell is empty
        if (this.gameState[index] === '') {
            if (this.isAIGame) {
                // In AI game, only allow moves when it's player's turn
                if (this.currentPlayer === this.playerSymbol) {
                    this.makeMove(index);
                    if (this.gameActive) {
                        // Add slight delay before AI moves
                        this.time.delayedCall(500, this.makeAIMove, [], this);
                    }
                }
            } else {
                // In 2 player game, allow moves on either turn
                this.makeMove(index);
            }
        }
    }
    makeMove(index) {
        if (this.gameState[index] === '') {
            // Update game state
            this.gameState[index] = this.currentPlayer;

            // Create X or O text
            const row = Math.floor(index / 3);
            const col = index % 3;
            const x = this.boardX + (col * this.cellSize) + this.cellSize / 2;
            const y = this.boardY + (row * this.cellSize) + this.cellSize / 2;

            const mark = this.add.text(x, y, this.currentPlayer, {
                fontSize: '64px',
                fill: this.registry.get('paperMode') ? '#2b2b2b' : '#ffffff'
            }).setOrigin(0.5);

            this.marks.add(mark);

            // Check for win or draw
            const winningLine = this.checkWin();
            if (winningLine) {
                this.drawWinningLine(winningLine);
                // Update score
                if (this.currentPlayer === 'X') {
                    this.scoreX++;
                    this.scoreTextX.setText(`X: ${this.scoreX}`);
                } else {
                    this.scoreO++;
                    this.scoreTextO.setText(`O: ${this.scoreO}`);
                }
                this.turnText.setText(`${this.currentPlayer} wins!\n\nPress SPACE to play again\nPress ESC for menu`);
                this.gameActive = false;
            } else if (!this.gameState.includes('')) {
                this.turnText.setText("It's a draw!\n\nPress SPACE to play again\nPress ESC for menu");
                this.gameActive = false;
            } else {
                // Switch turns
                this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
                this.updateTurnText();
            }
        }
    }
    makeAIMove() {
        if (!this.gameActive) return;

        // Find empty cells
        const emptyCells = this.gameState
            .map((cell, index) => cell === '' ? index : null)
            .filter(cell => cell !== null);

        if (emptyCells.length > 0) {
            // Make random move
            const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.makeMove(randomIndex);
        }
    }
    checkWin() {
        const winConditions = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8], // Rows
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8], // Columns
            [0, 4, 8],
            [2, 4, 6] // Diagonals
        ];

        for (let condition of winConditions) {
            if (condition.every(index => this.gameState[index] === this.currentPlayer)) {
                return condition;
            }
        }
        return null;
    }
    drawWinningLine(winningLine) {
        this.winLine = this.add.graphics();
        this.winLine.lineStyle(5, this.registry.get('paperMode') ? 0x2b2b2b : 0x00ff00);
        const startIndex = winningLine[0];
        const endIndex = winningLine[2];
        const startRow = Math.floor(startIndex / 3);
        const startCol = startIndex % 3;
        const endRow = Math.floor(endIndex / 3);
        const endCol = endIndex % 3;
        // Calculate the center points of the start and end cells
        let startX = this.boardX + (startCol * this.cellSize) + (this.cellSize / 2);
        let startY = this.boardY + (startRow * this.cellSize) + (this.cellSize / 2);
        let endX = this.boardX + (endCol * this.cellSize) + (this.cellSize / 2);
        let endY = this.boardY + (endRow * this.cellSize) + (this.cellSize / 2);
        // Calculate the direction vector
        const dirX = endX - startX;
        const dirY = endY - startY;

        // Normalize and extend the line
        const length = Math.sqrt(dirX * dirX + dirY * dirY);
        const EXTENSION = 40;

        if (length > 0) {
            const normalizedDirX = dirX / length;
            const normalizedDirY = dirY / length;

            // Extend both start and end points
            startX -= normalizedDirX * EXTENSION;
            startY -= normalizedDirY * EXTENSION;
            endX += normalizedDirX * EXTENSION;
            endY += normalizedDirY * EXTENSION;
        }
        // Draw the line
        this.winLine.beginPath();
        this.winLine.moveTo(startX, startY);
        this.winLine.lineTo(endX, endY);
        this.winLine.strokePath();
    }
    resetGame() {
        // Clear the board
        this.gameState = Array(9).fill('');

        // Remove all marks and winning line
        this.marks.clear(true, true);
        if (this.winLine) {
            this.winLine.destroy();
            this.winLine = null;
        }

        // Reset game state
        this.gameActive = true;
        // Reset player/AI symbols and starting player
        // Only randomize current player, keep player/AI symbols the same
        this.currentPlayer = Math.random() < 0.5 ? 'X' : 'O';
        // Update turn text
        this.updateTurnText();
        // If AI game and AI goes first (O), make its move
        if (this.isAIGame && this.currentPlayer === this.aiSymbol) {
            this.time.delayedCall(500, this.makeAIMove, [], this);
        }
    }
}

const config = {
    type: Phaser.AUTO,
    parent: 'renderDiv',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    width: 800,
    height: 600,
    scene: [MenuScene, GameScene, CreditsScene],
    callbacks: {
        preBoot: function(game) {
            // Initialize paper mode setting
            game.registry.set('paperMode', false);
        }
    }
};

window.phaserGame = new Phaser.Game(config);
