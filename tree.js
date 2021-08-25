class Tree {

    constructor(state, hash, column, row) {
        this.state = state;
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
        let cols = this.state.cols;
        for (let i = 0; i < cols; i++) {
            let pick = cols / 2 + (1 - 2 * (i % 2)) * (i + 1) / 2;
            pick = cols % 2 == 0 ? floor(pick) : ceil(pick - 1);
            order.push(pick);
        }

        return order;
    }

    /**
     * calculates all possible following states by searching for applicable actions
     */
    calcChildren(table) {
        for (let column of this.pickOrder) {
            for (let row = 0; row < this.state.rows; row++) {
                if (this.state.board[column][row] === 0) { // empty spot was found
                    // make new sub tree and add it to children array
                    let childBoard = this.state.board.map((arr) => arr.slice(0));
                    let val = this.state.current.val;
                    childBoard[column][row] = val;
                    let childHash = table.addHash(this.hash, column, row, val);
                    let childState = new Game(this.state.cols, this.state.rows);
                    childState.board = childBoard;
                    childState.current = this.state.previous;
                    childState.previous = this.state.current;
                    let child = new Tree(childState, childHash, column, row);
                    this.children.push(child);
                    break;
                }
            }
        }
    }

    isWon() {
        if (isNaN(this.move.column) || isNaN(this.move.row))
            return false;

        return this.state.isWon(this.move.column, this.move.row);
    }

    isDraw() {
        return this.state.isDraw();
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
        for (let column = startC; column < this.state.cols - endC; column++) {
            for (let row = startR; row < this.state.rows - endR; row++) {
                let counterCurrent = 0;
                let counterPrev = 0;
                // get a line of 4
                for (let i = 0; i < 4; i++) {
                    let val = this.state.board[column + i * dc][row + i * dr];
                    if (val === this.state.previous.val) {
                        counterPrev++;
                    } else if (val === this.state.current.val) {
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