/**
 * A class representing a single state of a Connect Four game
 * heuristically evaluates the winning chances
 */
class GameState {
    // holds information about current grid, the last move and the player which led to this grid
    constructor(root, activePlayer, prevPlayer, column, row) {
        this.grid = root;
        this.activePlayer = activePlayer;
        this.prevPlayer = prevPlayer;
        this.score;
        this.line = [];
        this.action = {
            column: column,
            row: row
        };
        this.children = [];
    }

    /**
     * calculates all possible following states by searching for applicable actions
     */
    calcChildren() {
        for (let column = 0; column < this.grid.length; column++) {
            for (let row = 0; row < this.grid[column].length; row++) {
                if (this.grid[column][row] == 0) { // empty spot was found
                    // make new gameState and add it to children array
                    let child = this.grid.map((arr) => arr.slice(0));
                    child[column][row] = this.activePlayer;
                    this.children.push(new GameState(child, this.prevPlayer, this.activePlayer, column, row));
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
        if (isNaN(this.action.column) || isNaN(this.action.row))
            return false;

        // check horizontally, vertically, diagonally (upwards + downwards)
        return this.checkLine(1, 0) || this.checkLine(0, 1) || this.checkLine(1, 1) || this.checkLine(1, -1);
    }

    /**
     * checks wether a line of four is filled by a player
     * returns true if line is filled, e.g. game is won, false otherwise
     */
    checkLine(dc, dr) {
        let column = this.action.column;
        let row = this.action.row;
        let val = this.grid[column][row];
        let sum = 1;
        this.line.push({
            column: column,
            row: row
        });

        // move "right"
        for (let i = 1; i < 4; i++) {
            if (column + dc * i >= this.grid.length || row + dr * i >= this.grid[column].length || this.grid[column + dc * i][row + dr * i] != val || sum >= 4) {
                break;
            } else {
                sum++;
                this.line.push({
                    column: column + dc * i,
                    row: row + dr * i
                });
            }
        }

        // move "left"
        for (let i = 1; i < 4; i++) {
            if (column - dc * i < 0 || row - dr * i < 0 || this.grid[column - dc * i][row - dr * i] != val || sum >= 4) {
                break;
            } else {
                sum++;
                this.line.push({
                    column: column - dc * i,
                    row: row - dr * i
                });
            }
        }

        if (sum < 4) {
            this.line = [];
            return false;
        }

        return true;
    }

    /**
     * checks whether the game is drawn by searching for empty spaces
     * returns true if the game is drawn, false otherwise
     */
    isDraw() {
        for (let i = 0; i < this.grid.length; i++) {
            for (let j = 0; j < this.grid[i].length; j++) {
                if (this.grid[i][j] == 0) {
                    return false;
                }
            }
        }
        return true;
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

        // loop through grid
        for (let column = startC; column < this.grid.length - endC; column++) {
            for (let row = startR; row < this.grid[column].length - endR; row++) {
                let counterActive = 0;
                let counterPrev = 0;
                // get a line of 4
                for (let i = 0; i < 4; i++) {
                    let val = this.grid[column + i * dc][row + i * dr];
                    if (val == this.prevPlayer) {
                        counterPrev++;
                    } else if (val == this.activePlayer) {
                        counterActive++;
                    }
                }
                // evaluate counters
                if (counterPrev == 0 && counterActive != 0) {
                    // only the opponent has at least one coin in a potential line
                    // scale by 10% to value bad situations more than good ones (uncertain if a good idea)
                    sum += (counterActive * counterActive) * (-1.1);
                } else if (counterPrev != 0 && counterActive == 0) {
                    // only the player has at least one coin in a potential line
                    sum += counterPrev * counterPrev;
                }
                // neutral otherwise (both players have none or at least one coin in line)
            }
        }
        return sum;
    }
}