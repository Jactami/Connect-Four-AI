const COLUMNS = 7;
const ROWS = 6;
const SPACE = 100;

let board;
let bot1Val = 1;
let bot2Val = -1;
let activePlayer;
let gameFinished;
let bot1, bot2;
let state;
let counter = 0;

function preload() {
    bot1 = new Bot(bot1Val, 1, 1, 1, 1, 1);
    bot2 = new Bot(bot2Val, 1, 1, 1, 1, 1);
    bot2.mutateWeights();
}

function setup() {
    // frameRate(1);
    createCanvas(COLUMNS * SPACE, ROWS * SPACE);
    board = new GameBoard();
    activePlayer = bot1Val;
    state = new GameState(board.grid, bot1Val, bot2Val, NaN, NaN);

    gameFinished = false;
}

function draw() {
    for (let i = 0; i < 10; i++) {
        // board.showBoard();

        // bot moves
        if (!gameFinished && activePlayer == bot1Val) {
            botAction(bot1Val);
        } else if (!gameFinished && activePlayer == bot2Val) {
            botAction(bot2Val);
        }
    }
}

function botAction(val) {
    // simulate next X possible turns (8 seems like a maximum regarding performance)
    let action;
    if (val == bot1Val) {
        action = bot1.think(state, 7, val);
    } else {
        action = bot2.think(state, 7, val);
    }
    if (board.insert(action.column, action.row, val)) {
        evalGame(action.column, action.row)
    }
}

function evalGame(column, row) {
    let nextPlayer;
    activePlayer == bot1Val ? nextPlayer = bot2Val : nextPlayer = bot1Val;
    state = new GameState(board.grid, nextPlayer, activePlayer, column, row);

    if (state.isWon()) {
        gameFinished = true;
    } else if (state.isDraw()) {
        gameFinished = true;
    }

    if (gameFinished) {
        if (activePlayer == bot1Val) {
            // challenger failed, copy and mutate champ as a new challenger
            bot2 = new Bot(bot2Val, bot1.wH, bot1.wV, bot1.wD, bot1.wLP, bot1.wLA);
            bot2.mutateWeights();
        } else {
            // declare challenger to new champion
            console.log("new champ");
            bot1 = new Bot(bot1Val, bot2.wH, bot2.wV, bot2.wD, bot2.wLP, bot2.wLA);
            bot2 = new Bot(bot2Val, bot1.wH, bot1.wV, bot1.wD, bot1.wLP, bot1.wLA);
            bot2.mutateWeights();
        }

        counter++;
        console.log(counter);
        if (counter < 200) {
            setup();
        } else {
            if (activePlayer == bot1Val) {
                console.log(bot1);
            } else {
                console.log(bot2);
            }
        }
    }

    // next players turn (even if new game will started!)
    activePlayer = nextPlayer;
}