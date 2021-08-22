class Game {

    constructor(cols, rows, size) {
        this.cols = cols;
        this.rows = rows;
        this.size = size;
        this.board;
        this.line = [];
        this.playerA = Object.freeze({
            name: "Red",
            val: 1,
            code: 'r',
            color: [255, 0, 0]
        });;
        this.playerB = Object.freeze({
            name: "Yellow",
            val: -1,
            code: 'y',
            color: [255, 255, 0]
        });
        this.current;
        this.previous;
        this.over = false;
        this.paused = false;

        this.newGame(random([this.playerA, this.playerB]));
    }

    getEmptyBoard() {
        let arr = new Array(this.cols);
        for (let i = 0; i < this.cols; i++) {
            arr[i] = new Array(this.rows);
            for (let j = 0; j < this.rows; j++) {
                arr[i][j] = 0;
            }
        }

        return arr;
    }

    newGame(currentPlayer) {
        this.over = false;
        this.paused = false;

        this.board = this.getEmptyBoard();
        this.line = [];

        if (currentPlayer) {
            this.current = currentPlayer;
        } else {
            this.current = random([this.playerA, this.playerB]);
        }
        this.previous = this.current === this.playerA ? this.playerB : this.playerA;
    }

    makeMove(x, y) {
        let pos = this.getCoinPosition(x, y);

        if (!pos)
            return;

        this.insertCoin(pos.column, pos.row, this.current.val);
    }

    insertCoin(column, row, val) {
        // place coin and eval if game is over
        this.board[column][row] = val;
        this.over = this.isGameOver(column, row);

        // switch turns
        let temp = this.current;
        this.current = this.previous;
        this.previous = temp;

        // small input delay to make placing of coins "more natural"
        this.paused = true;
        setTimeout(() => {
            this.paused = false;
        }, 200);
    }

    getCoinPosition(x, y) {
        if (x >= width || x < 0 || y >= height || y < 0)
            return null; // position not on board

        let column = floor(x / this.size);
        for (let i = 0; i < this.rows; i++) {
            if (this.board[column][i] === 0) {
                return {
                    column,
                    row: i
                };
            }
        }

        return null; // no empty spot in column
    }

    isGameOver(column, row) {
        if (this.isWon(column, row)) {
            let name = this.current.name;
            setTimeout(() => {
                alert(`Congratulations ${name}! You are the winner!`);
                this.newGame(this.current);
            }, 100);
            return true;
        } else if (this.isDraw()) {
            setTimeout(() => {
                alert("Oh no! It is a draw...");
                this.newGame(this.current);
            }, 100);
            return true;
        }

        return false;
    }

    isWon(column, row) {
        return this.checkLine(column, row, 1, 0) ||
            this.checkLine(column, row, 0, 1) ||
            this.checkLine(column, row, 1, 1) ||
            this.checkLine(column, row, 1, -1);
    }

    checkLine(column, row, dc, dr) {
        let val = this.board[column][row];
        let sum = 1;
        this.line.push({
            column,
            row
        });

        // move right
        for (let i = 1; i < 4; i++) {
            let c = column + dc * i;
            let r = row + dr * i;
            if (c >= this.cols || r >= this.rows || this.board[c][r] != val || sum >= 4) {
                break;
            } else {
                sum++;
                this.line.push({
                    column: c,
                    row: r
                });
            }
        }

        // move left
        for (let i = 1; i < 4; i++) {
            let c = column - dc * i;
            let r = row - dr * i;
            if (c < 0 || r < 0 || this.board[c][r] != val || sum >= 4) {
                break;
            } else {
                sum++;
                this.line.push({
                    column: c,
                    row: r
                });
            }
        }

        if (sum < 4) {
            this.line = [];
            return false;
        }

        return true;
    }

    isDraw() {
        // check if any empty spot in top row
        for (let i = 0; i < this.cols; i++) {
            if (this.board[i][this.rows - 1] === 0) {
                return false;
            }
        }

        return true;
    }

    showBoard() {
        background(0);

        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                let val = this.board[i][j];
                this.showCoin(i, j, val, 255, false);
            }
        }
    }

    showCoin(column, row, val, alpha, highlight) {
        if (val === this.playerA.val) {
            fill(...this.playerA.color, alpha);
        } else if (val === this.playerB.val) {
            fill(...this.playerB.color, alpha);
        } else { // empty spot
            fill(200);
        }

        if (highlight) {
            strokeWeight(this.size * 0.05);
            stroke(0, 0, 255, alpha);
        } else {
            noStroke();
        }

        let cx = this.size * column + this.size * 0.5;
        let cy = height - this.size * row - this.size * 0.5;
        circle(cx, cy, this.size * 0.7);
    }

    hoverCoin(x, y) {
        let pos = this.getCoinPosition(x, y);

        if (pos) {
            let val = this.current.val;
            this.showCoin(pos.column, pos.row, val, 100, false);
        }
    }

    showLine() {
        for (let coin of this.line) {
            let column = coin.column;
            let row = coin.row;
            let val = this.board[column][row];
            this.showCoin(column, row, val, 255, true);
        }
    }

    /*
     * builds a game from a given character sequence 
     * (similar to Forsyth-Edwards-Notation in chess) 
     * e.g.: "7/7/7/2y4/2ry3/1ryry2 r"
     */
    gameFromFEN(fen) {
        // convert fen into single rows and indication of active player
        let fenBoard, currentPlayer;
        [fenBoard, currentPlayer] = fen.split(' ');
        let fenRows = fenBoard.split('/');

        // build empty board
        let board = this.getEmptyBoard();

        // fill empty board with values
        for (let i = 0; i < fenRows.length; i++) {
            let fenRow = fenRows[i];
            let index = 0;
            for (let c in fenRow) {
                let char = fenRow[c];
                let number = parseInt(char);

                if (number) {
                    index += number;
                } else {
                    let val = this.getPlayer(char).val;
                    board[index][this.rows - i - 1] = val;
                    index++;
                }
            }
        }

        this.board = board;

        // set active player
        this.current = this.getPlayer(currentPlayer);
    }

    /*
     * converts the current game state into a string representation
     * (similar to Forsyth-Edwards-Notation in chess)
     */
    gameToFEN() {
        let fen = "";

        // convert board
        for (let i = this.rows - 1; i >= 0; i--) {
            let counter = 0;
            for (let j = 0; j < this.cols; j++) {
                let val = this.board[j][i];

                if (val === 0) {
                    counter++;
                } else {
                    if (counter > 0) {
                        fen += counter;
                        counter = 0;
                    }
                    if (val === this.playerA.val) {
                        fen += this.playerA.code;
                    } else if (val === this.playerB.val) {
                        fen += this.playerB.code;
                    }
                }
            }

            if (counter > 0) {
                fen += counter;
            }

            if (i != 0) {
                fen += '/';
            }
        }

        // convert active player
        fen += ' ' + this.current.code;

        return fen;
    }

    getPlayer(code) {
        if (code === this.playerA.code) {
            return this.playerA;
        } else if (code === this.playerB.code) {
            return this.playerB;
        }

        return null;
    }
}