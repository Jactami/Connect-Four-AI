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

        let column = this.action.column;
        let row = this.action.row;
        let sum;

        // check horizontally
        sum = 1;
        for (let i = 1; i < 4; i++) {
            if ((column + i) >= this.grid.length || this.grid[column + i][row] != this.prevPlayer) {
                break;
            } else {
                sum++;
            }
        }
        for (let i = 1; i < 4 && i >= 0; i++) {
            if ((column - i) < 0 || this.grid[column - i][row] != this.prevPlayer) {
                break;
            } else {
                sum++;
            }
        }
        if (sum >= 4)
            return true;

        // check vertically
        sum = 1;
        for (let i = 1; i < 4; i++) {
            if ((row + i) >= this.grid[column].length || this.grid[column][row + i] != this.prevPlayer) {
                break;
            } else {
                sum++;
            }
        }
        for (let i = 1; i < 4; i++) {
            if ((row - i) < 0 || this.grid[column][row - i] != this.prevPlayer) {
                break;
            } else {
                sum++;
            }
        }
        if (sum >= 4)
            return true;

        // check diagonally (upwards)
        sum = 1;
        for (let i = 1; i < 4; i++) {
            if ((column + i) >= this.grid.length ||
                (row + i) >= this.grid[column].length ||
                this.grid[column + i][row + i] != this.prevPlayer) {
                break;
            } else {
                sum++;
            }
        }
        for (let i = 1; i < 4; i++) {
            if ((column - i) < 0 || (row - i) < 0 || this.grid[column - i][row - i] != this.prevPlayer) {
                break;
            } else {
                sum++;
            }
        }
        if (sum >= 4)
            return true;

        // check diagonally (downwards)
        sum = 1;
        for (let i = 1; i < 4; i++) {
            if ((column + i) >= this.grid.length ||
                (row - i) < 0 ||
                this.grid[column + i][row - i] != this.prevPlayer) {
                break;
            } else {
                sum++;
            }
        }
        for (let i = 1; i < 4; i++) {
            if ((column - i) < 0 ||
                (row + i) >= this.grid[column].length ||
                this.grid[column - i][row + i] != this.prevPlayer) {
                break;
            } else {
                sum++;
            }
        }
        if (sum >= 4)
            return true;

        return false;
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

        // check horizontally (do not check last 3 columns in each row)
        for (let column = 0; column < this.grid.length - 3; column++) {
            for (let row = 0; row < this.grid[column].length; row++) {
                let counterActive = 0;
                let counterPrev = 0;
                for (let i = 0; i < 4; i++) {
                    let val = this.grid[column + i][row];
                    if (val == this.prevPlayer) {
                        counterPrev++;
                    } else if (val == this.activePlayer) {
                        counterActive++;
                    }
                }
                sum += this.evalLine(counterActive, counterPrev);
            }
        }

        // check vertically (do not check last 3 rows in each column)
        // not sure at all if a vertical line is useful as it can be easily countered and almost never wins
        // maybe factor resutling value or remove it completly
        for (let column = 0; column < this.grid.length; column++) {
            for (let row = 0; row < this.grid[column].length - 3; row++) {
                let counterActive = 0;
                let counterPrev = 0;
                for (let i = 0; i < 4; i++) {
                    let val = this.grid[column][row + i];
                    if (val == this.prevPlayer) {
                        counterPrev++;
                    } else if (val == this.activePlayer) {
                        counterActive++;
                    }
                }
                sum += this.evalLine(counterActive, counterPrev);
            }
        }

        // check diagonally (upwards) (do not check last 3 rows or columns)
        for (let column = 0; column < this.grid.length - 3; column++) {
            for (let row = 0; row < this.grid[column].length - 3; row++) {
                let counterActive = 0;
                let counterPrev = 0;
                for (let i = 0; i < 4; i++) {
                    let val = this.grid[column + i][row + i];
                    if (val == this.prevPlayer) {
                        counterPrev++;
                    } else if (val == this.activePlayer) {
                        counterActive++;
                    }
                }
                sum += this.evalLine(counterActive, counterPrev);
            }
        }

        // check diagonally (downwards) (do not check last 3 columns and first 3 rows)
        for (let column = 0; column < this.grid.length - 3; column++) {
            for (let row = 3; row < this.grid[column].length; row++) {
                let counterActive = 0;
                let counterPrev = 0;
                for (let i = 0; i < 4; i++) {
                    let val = this.grid[column + i][row - i];
                    if (val == this.prevPlayer) {
                        counterPrev++;
                    } else if (val == this.activePlayer) {
                        counterActive++;
                    }
                }
                sum += this.evalLine(counterActive, counterPrev);
            }
        }

        this.score = sum;
    }

    /**
     * evaluates a line of 4 to a calculated score by analysing the occurrences of each coin value
     * however the evaluation is still not perfect and could be improved,
     * e.g. the amount of neutral spaces in a line could be used in the function
     * returns the calculated score
     */
    evalLine(counterActive, counterPrev) {
        if (counterPrev == 0 && counterActive != 0) {
            // only the opponent has at least one coin in a potential line
            // scale by 10% to value bad situations more than good ones (uncertain if a good idea)
            return (counterActive * counterActive) * (-1.1);
        } else if (counterPrev != 0 && counterActive == 0) {
            // only the player has at least one coin in a potential line
            return counterPrev * counterPrev;
        }
        // return 0 otherwise (both players have none or at least one coin in line)
        return 0;
    }
}