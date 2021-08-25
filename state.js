/**
 * Represents a single state/ node in the Game Tree of a Connect Four game
 * heuristically evaluates the winning chances
 */
class State extends Game {

    constructor(board, hash, columns, rows, current, previous, column, row) {
        // Game variables
        super(columns, rows);
        this.board = board;
        this.current = current;
        this.previous = previous;

        // State variables
        this.hash = hash;
        this.move = { // move leading from previous to current state
            column,
            row
        };
        this.score;
        this.pickOrder = this.calcPickOrder();
        this.children = [];
    }

    /**
     * sorts all columns from the middle to the outer ones and returns them as an array
     * middle columns usually include more options to get 4 in a line
     * therefore middle insertions will be calculated and evaluated first boosting the performance of alpha-beta-pruning
     */
    calcPickOrder() {
        let order = [];
        for (let i = 0; i < this.cols; i++) {
            let pick = this.cols / 2 + (1 - 2 * (i % 2)) * (i + 1) / 2;
            pick = this.cols % 2 == 0 ? floor(pick) : ceil(pick - 1);
            order.push(pick);
        }

        return order;
    }

    /**
     * calculates all possible following states by searching for applicable actions
     */
    calcChildren(table) {
        for (let column of this.pickOrder) {
            for (let row = 0; row < this.rows; row++) {
                if (this.board[column][row] === 0) { // empty spot was found
                    // make applicable child state and add it to children array
                    let childBoard = this.board.map((arr) => arr.slice(0));
                    let val = this.current.val;
                    childBoard[column][row] = val;
                    let childHash = table.addHash(this.hash, column, row, val);
                    this.children.push(new State(childBoard, childHash, this.cols, this.rows, this.previous, this.current, column, row));
                    break;
                }
            }
        }
    }

    /**
     * checks wether the previous player won by his action leading to the current game state
     * returns true if game is won, false otherwise
     */
    isWon() {
        if (isNaN(this.move.column) || isNaN(this.move.row))
            return false;

        return super.isWon(this.move.column, this.move.row);
    }

    /**
     * evaluates the game state to a calculated score by analysing all possible lines of 4
     * (little bit of spaghetti and lots of redundancy here)
     */
    evalState() {
        let sum = 0;

        // check horizontally
        sum += this.evalLines(0, 3, 0, 0, 1, 0);
        // check vertically
        sum += this.evalLines(0, 0, 0, 3, 0, 1);
        // check diagonally (upwards)
        sum += this.evalLines(0, 3, 0, 3, 1, 1);
        // check diagonally (downwards)
        sum += this.evalLines(0, 3, 3, 0, 1, -1);

        this.score = floor(sum * pow(10, 7)) / pow(10, 7);
    }

    /**
     * evaluates lines of 4 to a calculated a score by analysing the occurrences of each coin value
     * however the evaluation is still not perfect and could be improved,
     * e.g. the amount of neutral spaces in a line could be used in the function
     * returns the calculated score
     */
    evalLines(startC, endC, startR, endR, dc, dr) {
        let sum = 0;

        // loop through board
        for (let column = startC; column < this.cols - endC; column++) {
            for (let row = startR; row < this.rows - endR; row++) {
                let counterCurrent = 0;
                let counterPrev = 0;
                // get a line of 4
                for (let i = 0; i < 4; i++) {
                    let val = this.board[column + i * dc][row + i * dr];
                    if (val === this.previous.val) {
                        counterPrev++;
                    } else if (val === this.current.val) {
                        counterCurrent++;
                    }
                }
                // evaluate counters
                if (counterPrev === 0 && counterCurrent !== 0) {
                    // only the opponent has at least one coin in a potential line
                    // scale by 10% to value bad situations more than good ones (uncertain if a good idea)
                    sum += (counterCurrent * counterCurrent) * (-1.1);
                } else if (counterPrev !== 0 && counterCurrent === 0) {
                    // only the player has at least one coin in a potential line
                    sum += counterPrev * counterPrev;
                }
                // neutral otherwise (both players have none or at least one coin in line)
            }
        }
        return sum;
    }
}