/*
 * A transposion table for storing evaluation scores via zobrist hashing
 */
class Table {

    constructor(cols, rows, valA, valB) {
        // transposition table
        this.lower;
        this.upper;
        this.initTable();

        // Zobrist hashing
        this.cols = cols;
        this.rows = rows;
        this.playerA = {
            val: valA,
            index: 0
        };
        this.playerB = {
            val: valB,
            index: 1
        };

        this.zobrist = [];
        this.initZobrist();
    }

    initTable() {
        this.lower = createNumberDict();
        this.upper = createNumberDict();
    }

    /*
     * generates a list of zobrist hashes
     */
    initZobrist() {
        let len = this.cols * this.rows;
        this.zobrist = new Array(len);
        for (let i = 0; i < len; i++) {
            this.zobrist[i] = new Uint32Array(2);
            window.crypto.getRandomValues(this.zobrist[i]); // not unique, but unlikely to get duplicates
        }

        this.zobrist;
    }

    /*
     * turns a board configuration into a unique hashcode
     */
    hashBoard(board) {
        let hash = 0;
        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                let val = board[i][j];
                if (val !== 0) {
                    hash = this.addHash(hash, i, j, val)
                }
            }
        }

        return hash;
    }

    /*
     * retrives a hash value for a given coin in the board
     */
    hashValue(column, row, val) {
        let index = this.rows * column + row;
        let player = this.getPlayer(val);

        return this.zobrist[index][player.index];
    }

    /*
     * adds to hash values by XOR operation 
     */
    addHash(hash, column, row, val) {
        return hash ^= this.hashValue(column, row, val);
    }

    getPlayer(val) {
        if (val === this.playerA.val) {
            return this.playerA;
        } else if (val === this.playerB.val) {
            return this.playerB;
        }

        return null;
    }
}