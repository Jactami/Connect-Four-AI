const COLUMNS = 7;
const ROWS = 6;
const SPACE = 100;

const DEPTH = 7;

let board;
let botVal;
let usrVal;
let activePlayer;
let gameFinished;
let gamePaused;
let bot;
let state;

function preload() {
    // random player starts first game
    botVal = 1;
    usrVal = -1;
    activePlayer = random([botVal, usrVal]);
}

function setup() {
    console.clear();
    createCanvas(COLUMNS * SPACE, ROWS * SPACE);
    board = new GameBoard();
    let opp;
    activePlayer == botVal ? opp = usrVal : opp = botVal;
    state = new GameState(board.grid, activePlayer, opp, NaN, NaN);
    bot = new Bot(botVal);

    gameFinished = false;
    gamePaused = false;
}

function draw() {
    board.showBoard();

    // draw winning line if game is over
    board.showLine(state.line);

    if (gamePaused)
        return;

    // hover coin under current mouse position
    if (!gameFinished && activePlayer == usrVal) {
        let pos = board.getCoinPostion();
        board.hoverCoin(pos.column, pos.row, usrVal);
    }

    // bot moves
    if (!gameFinished && activePlayer == botVal) {
        botAction();
    }



}

// handles user input
function mousePressed() {
    if (activePlayer == botVal)
        return;

    let pos = board.getCoinPostion();

    // try to insert coin and (if successful) evaluate game
    if (board.insert(pos.column, pos.row, usrVal)) {
        evalGame(pos.column, pos.row);
    }
}

function botAction() {
    // simulate next X possible turns (8 seems like a maximum regarding performance)
    let action = bot.think(state, DEPTH, botVal);
    if (board.insert(action.column, action.row, botVal)) {
        evalGame(action.column, action.row)
    }
}

function evalGame(column, row) {
    let nextPlayer;
    activePlayer == botVal ? nextPlayer = usrVal : nextPlayer = botVal;
    state = new GameState(board.grid, nextPlayer, activePlayer, column, row);

    if (state.isWon()) {
        gameFinished = true;
        let playerName = "";
        activePlayer == botVal ? playerName = "Red" : playerName = "Yellow";
        setTimeout(() => {
            alert("Congratulations, " + playerName + "! You are the winner!");
            redraw();
            setup();
        }, 100);
    } else if (state.isDraw()) {
        gameFinished = true;
        setTimeout(() => {
            alert("Oh no! It is a draw...");
            setup();
        }, 100);
    }

    // next players turn (even if new game will started!)
    activePlayer = nextPlayer;

    // small input delay to make placing of coins "more natural"
    gamePaused = true;
    setTimeout(() => {
        gamePaused = false;
    }, 300);
}