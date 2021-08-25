/**
 * An AI using minimax to chose an optimal move
 */
class Bot {
    constructor(self, opponent, cols, rows) {
        this.self = self;
        this.moves = [];
        this.counter;
        this.table = new Table(cols, rows, self.val, opponent.val);
    }

    /**
     * simualates a given amount of next turns from a given state
     * returns the best possible move
     */
    think(state, depth) {
        let t0 = new Date().getTime();

        this.counter = 0;
        this.table.initTable();
        let hash = this.table.hashBoard(state.board);
        let tree = new Tree(state, hash, undefined, undefined);
        let score = this.minimax(tree, depth, depth, -Infinity, Infinity, true);

        // statistically prefer move in the middle of array which is also the middle of the game board
        let mean = (this.moves.length - 1) / 2;
        let sd = 1.5;
        let move = this.moves[constrain(round(randomGaussian(mean, sd)), 0, this.moves.length - 1)];

        let t1 = new Date().getTime();
        let dt = t1 - t0;

        console.clear();
        console.log("state score", score);
        console.log("possible moves", this.moves);
        console.log("chosen move", move);
        console.log("explored states", this.counter);
        console.log("execution time", dt);

        return move;
    }

    /**
     * an implementation of a minimax algorithm (with alpha-beta-pruning ans transposition tables)
     * explores a game tree from given starting state to a given depth
     * returns a set of the best (qually valued) moves possible
     * see: http://people.csail.mit.edu/plaat/mtdf.html#abmem
     */
    minimax(tree, depth, finalDepth, alpha, beta, maximizing) {
        // look up in transposition table
        if (this.table.lower.hasKey(tree.hash)) {
            let lower = this.table.lower.get(tree.hash);
            if (lower >= beta)
                return lower;

            alpha = max(alpha, lower);
        }

        if (this.table.upper.hasKey(tree.hash)) {
            let upper = this.table.upper.get(tree.hash);
            if (upper <= alpha)
                return upper;

            beta = min(beta, upper);
        }

        // new state is explored
        this.counter++;

        // terminal states: won and draw
        if (tree.isWon()) {
            // give faster wins a higher score
            if (tree.state.previous === this.self) {
                tree.score = 10000 * (depth + 1);
            } else { // opponent won
                tree.score = -10000 * (depth + 1);
            }
            return tree.score;
        }

        if (tree.isDraw()) {
            tree.score = 0;
            return tree.score;
        }

        // leaf state
        if (depth === 0) {
            this.testCounter++;
            tree.evalState();
            return tree.score;
        }

        // recursive step
        tree.calcChildren(this.table);
        let record;
        if (maximizing) {
            record = -Infinity;
            let a = alpha;
            for (let child of tree.children) {
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
            for (let child of tree.children) {
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
            this.table.upper.set(tree.hash, record);
        } else if (record > alpha && record < beta) {
            this.table.lower.set(tree.hash, record);
            this.table.upper.set(tree.hash, record);
        } else if (record >= beta) {
            this.table.lower.set(tree.hash, record);
        }

        tree.score = record;
        return record;
    }
}