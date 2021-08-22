/**
 * An AI using minimax to chose an optimal move
 */
class Bot {
    constructor(player) {
        this.player = player;
        this.moves = [];
        this.counter;
    }

    /**
     * simualates a given amount of next turns from a given state
     * returns the best possible move
     */
    think(state, depth) {
        let t0 = new Date().getTime();
        this.counter = 0;
        let tree = new Tree(state, undefined, undefined);

        let finalScore = this.minimax(tree, 0, depth, -Infinity, Infinity, true);
        // statistically prefer move in the middle of array which is also the middle of the game board
        let mean = (this.moves.length - 1) / 2;
        let sd = 1.5;
        let chosenMove = this.moves[constrain(round(randomGaussian(mean, sd)), 0, this.moves.length - 1)];

        let t1 = new Date().getTime();
        let dt = t1 - t0;

        console.clear();
        console.log("state score", finalScore);
        console.log("possible moves", this.moves);
        console.log("chosen move", chosenMove);
        console.log("explored states", this.counter);
        console.log("execution time", dt);

        return chosenMove;
    }

    /**
     * an implementation of a minimax algorithm (with alpha-beta-pruning)
     * explores a game tree from given starting state to a given depth
     * returns a set of the best, equally valued moves possible
     */
    minimax(tree, depth, finalDepth, alpha, beta, maximizing) {
        this.counter++;

        if (tree.isWon()) {
            // give closer wins a higher score
            if (tree.state.previous === this.player) {
                tree.score = 10000 * (finalDepth - depth + 1);
            } else { // opponent won
                tree.score = -10000 * (finalDepth - depth + 1);
            }
            return tree.score;
        }

        if (tree.isDraw()) {
            tree.score = 0;
            return tree.score;
        }

        if (depth === finalDepth) {
            tree.evalState();
            return tree.score;
        }

        tree.calcChildren();

        if (maximizing) {
            let maxScore = -Infinity;
            for (let child of tree.children) {
                let evalScore = this.minimax(child, depth + 1, finalDepth, alpha, beta, false);
                if (evalScore >= maxScore) {
                    if (evalScore === maxScore && depth === 0) {
                        this.moves.push(child.move);
                    } else if (evalScore > maxScore && depth === 0) {
                        this.moves = [child.move];
                    }
                    maxScore = evalScore;
                }
                tree.score = maxScore;
                alpha = max(alpha, evalScore);
                if (beta < alpha)
                    break;
            }
            return maxScore;
        } else {
            let minScore = Infinity;
            for (let child of tree.children) {
                let evalScore = this.minimax(child, depth + 1, finalDepth, alpha, beta, true);
                if (evalScore <= minScore) {
                    if (evalScore === minScore && depth === 0) {
                        this.moves.push(child.move);
                    } else if (evalScore < minScore && depth === 0) {
                        this.moves = [child.move];
                    }
                    minScore = evalScore;
                }
                tree.score = minScore;
                beta = min(beta, evalScore);
                if (beta < alpha)
                    break;
            }
            return minScore;
        }
    }
}