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
        print(JSON.stringify(state.grid))

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
    // simulate next X possible turns (9 seems like a maximum regarding performance)
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


/*
 * builds a game from a given character sequence 
 * (similar to Forsyth-Edwards-Notation in chess) 
 * e.g.: "7/7/7/2y4/2ry3/1ryry2 r"
 */
function buildGameFromFEN(fen) {
    // convert fen into single rows and indication of active player
    let fenGrid, active;
    [fenGrid, active] = fen.split(' ');
    let rows = fenGrid.split('/');

    // build empty board
    let grid = new Array(COLUMNS);
    for (let i = 0; i < COLUMNS; i++) {
        grid[i] = new Array(ROWS);
        for (let j = 0; j < ROWS; j++) {
            grid[i][j] = 0;
        }
    }

    // fill empty grid with coins according to fen
    for (let i = 0; i < rows.length; i++) {
        let row = rows[i];
        let index = 0;
        for (let c in row) {
            let char = row[c];
            let number = parseInt(char);
            if (number) {
                index += number;
            } else {
                let val = 0;
                if (char === 'r') {
                    val = botVal;
                } else if (char === 'y') {
                    val = usrVal;
                }

                grid[index][ROWS - i - 1] = val;
                index++;
            }
        }
    }

    board.grid = grid;
    state.grid = board.grid;

    // set active player
    if (active === 'r') {
        activePlayer = botVal;
    } else if (char === 'y') {
        activePlayer = usrVal;
    }
}

/*
 * converts the current game state into a string representation
 * (similar to Forsyth-Edwards-Notation in chess)
 */
function getFEN() {
    let fen = "";

    for (let i = ROWS - 1; i >= 0; i--) {
        let sequence = 0;
        for (let j = 0; j < COLUMNS; j++) {
            let val = board.grid[j][i];

            if (val === 0) {
                sequence++;
            } else {
                if (sequence > 0) {
                    fen += sequence;
                    sequence = 0;
                }
                if (val === botVal) {
                    fen += 'r';
                } else if (val === usrVal) {
                    fen += 'y';
                }
            }
        }

        if (sequence > 0) {
            fen += sequence;
        }

        if (i !== 0) {
            fen += '/'
        }
    }

    if (activePlayer === botVal) {
        fen += " r";
    } else if (activePlayer === usrVal) {
        fen += " y";
    }

    return fen;
}