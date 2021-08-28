const COLS = 7;
const ROWS = 6;
const SIZE = 100;
let game;

let bot;

function setup() {
    createCanvas(COLS * SIZE, ROWS * SIZE);
    game = new Game(COLS, ROWS, SIZE);
    bot = new Bot(game.playerA, game.playerB, COLS, ROWS);
    game.newGame();
    // draw empty board once
    game.paused = true;
    setTimeout(() => {
        redraw();
        game.paused = false;
    }, 0);

}

function draw() {
    game.showBoard();

    if (game.over) game.showLine();

    if (game.paused || game.over) return;

    if (game.current !== bot.player) { // players turn
        game.hoverCoin(mouseX, mouseY);
    }

    if (game.current === bot.self) { // bots turn
        let move = bot.think(game);
        game.insertCoin(move.column, move.row, bot.self.val);
    }
}

// handle user input
function mousePressed() {
    if (game.paused || game.current === bot.player) {
        return;
    }

    game.makeMove(mouseX, mouseY);
}