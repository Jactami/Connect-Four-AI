/**
 * An AI using minimax to chose an optimal move
 */
class Bot {
    constructor(self, opponent, cols, rows) {
        this.self = self;
        this.opponent = opponent;
        this.moves = [];
        this.counter;
        this.tree;
        this.table = new Table(cols, rows, self.val, opponent.val);
    }

    /**
     * simualates a given amount of next turns from a given state
     * returns the best possible move
     */
    think(game) {
        let t0 = new Date().getTime();

        // build initial state
        let hash = this.table.hashBoard(game.board);
        this.tree = new State(game.board, hash, game.cols, game.rows, game.current, game.previous, undefined, undefined);

        // iterative deepening with fixed time window of 400 ms
        let depth = 1;
        let score = -Infinity;
        let t1 = t0;
        while (t1 - t0 < 400 && depth < game.cols * game.rows) {
            // reset variables
            this.counter = 0;
            this.table.initTable();
            // calculate score and best move(s)
            score = this.minimax(this.tree, depth, depth, -Infinity, Infinity, game.current === this.self);
            // increase depth and calc execution time
            depth++;
            t1 = new Date().getTime();
        }

        // statistically prefer move in the middle of array which is also the middle of the game board
        let mean = (this.moves.length - 1) / 2;
        let sd = 1.5;
        let move = this.moves[constrain(round(randomGaussian(mean, sd)), 0, this.moves.length - 1)];

        console.clear();
        console.log("execution time", t1 - t0);
        console.log("game tree depth", depth - 1);
        console.log("explored states", this.counter);
        console.log("state score", score);
        console.log("possible moves", this.moves);
        console.log("chosen move", move);
        console.log("game tree", this.tree);

        return move;
    }

    /**
     * an implementation of a minimax algorithm (with alpha-beta-pruning ans transposition tables)
     * explores a game tree from given starting state to a given depth
     * returns a set of the best (qually valued) moves possible
     * see: http://people.csail.mit.edu/plaat/mtdf.html#abmem
     */
    minimax(state, depth, finalDepth, alpha, beta, maximizing) {
        // look up in transposition table
        if (this.table.lower.hasKey(state.hash)) {
            let lower = this.table.lower.get(state.hash);
            if (lower >= beta)
                return lower;

            alpha = max(alpha, lower);
        }

        if (this.table.upper.hasKey(state.hash)) {
            let upper = this.table.upper.get(state.hash);
            if (upper <= alpha)
                return upper;

            beta = min(beta, upper);
        }

        // new state is explored
        this.counter++;

        // terminal states: won and draw
        if (state.isWon()) {
            // give faster wins a higher score
            if (state.previous === this.self) {
                state.score = 10000 * (depth + 1);
            } else { // opponent won
                state.score = -10000 * (depth + 1);
            }
            return state.score;
        }

        if (state.isDraw()) {
            state.score = 0;
            return state.score;
        }

        // leaf state
        if (depth === 0) {
            state.evalState(this.self, this.opponent);
            return state.score;
        }

        // recursive step
        if (state.children.length === 0) {
            state.calcChildren(this.table);
        }

        let record;
        if (maximizing) {
            record = -Infinity;
            let a = alpha;
            for (let child of state.children) {
                let score = this.minimax(child, depth - 1, finalDepth, a, beta, false);
                if (score >= record) {
                    if (score === record && depth === finalDepth) {
                        this.moves.push(child.move);
                    } else if (score > record && depth === finalDepth) {
                        this.moves = [child.move];
                    }
                    record = score;
                }

                if (record > beta)
                    break;

                a = max(a, record);
            }
        } else {
            record = Infinity;
            let b = beta;
            for (let child of state.children) {
                let score = this.minimax(child, depth - 1, finalDepth, alpha, b, true);
                if (score <= record) {
                    if (score === record && depth === finalDepth) {
                        this.moves.push(child.move);
                    } else if (score < record && depth === finalDepth) {
                        this.moves = [child.move];
                    }
                    record = score;
                }

                if (record < alpha)
                    break;

                b = min(b, record);
            }
        }

        // add record score to transposition table
        if (record <= alpha) {
            this.table.upper.set(state.hash, record);
        } else if (record > alpha && record < beta) {
            this.table.lower.set(state.hash, record);
            this.table.upper.set(state.hash, record);
        } else if (record >= beta) {
            this.table.lower.set(state.hash, record);
        }

        state.score = record;
        return record;
    }
}