/**
 * A class representing the structure of a Connect Four game
 * also implemetns functionalities for visualisation
 */
class GameBoard {

    constructor() { // TODO: Chance [] to new Array(COLUMS)
        this.grid = [];

        for (let i = 0; i < COLUMNS; i++) {
            this.grid[i] = [];
            for (let j = 0; j < ROWS; j++) {
                this.grid[i][j] = 0;
            }
        }
    }

    showBoard() {
        background(0);

        for (let i = 0; i < COLUMNS; i++) {
            for (let j = 0; j < ROWS; j++) {
                this.drawCoin(i, j, this.grid[i][j], 255, false);
            }
        }
    }

    hoverCoin(column, row, val) {
        if (row == -1)
            return;

        this.drawCoin(column, row, val, 100, false);
    }

    showLine(line) {
        for (let coin of line) {
            this.drawCoin(coin.column, coin.row, this.grid[coin.column][coin.row], 255, true);
        }
    }

    drawCoin(column, row, val, alpha, highlight) {
        if (val == 0) {
            fill(200);
        } else if (val == 1) {
            fill(255, 0, 0, alpha);
        } else {
            fill(255, 255, 0, alpha);
        }
        if (highlight) {
            strokeWeight(SPACE * 0.05);
            stroke(0, 0, 255, alpha);
        } else {
            noStroke();
        }
        let cx = SPACE * column + SPACE * 0.5;
        let cy = height - SPACE * row - SPACE * 0.5;
        circle(cx, cy, SPACE * 0.7);
    }

    /**
     * inserts a coin into a grid with the given position
     * returns true if insertion was successful, false otherwise
     */
    insert(column, row, val) {
        if (row == -1)
            return false;

        this.grid[column][row] = val;
        return true;
    }

    /**
     * returns the column and row under current mouse position
     * returns -1 if mouse position is outside of board
     */
    getCoinPosition() {
        if (mouseX >= width || mouseX < 0 || mouseY >= height || mouseY < 0)
            return {
                row: -1,
                column: -1
            };

        let column = floor(mouseX / SPACE);
        let row = -1;
        for (let i = 0; i < ROWS; i++) {
            if (board.grid[column][i] == 0) {
                row = i;
                break;
            }
        }
        return {
            row: row,
            column: column
        }
    }
}