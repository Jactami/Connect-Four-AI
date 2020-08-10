/**
 * An AI
 */
class Bot {
    constructor(val, wH, wV, wD, wLP, wLA) {
        this.val = val;
        this.actions = [];
        // weights for evalFunction
        this.wH = wH;
        this.wV = wV;
        this.wD = wD;
        this.wLP = wLP;
        this.wLA = wLA;
    }

    /**
     * simualates a given amount of next turns from a given state
     * returns the best possible action
     */
    think(state, depth) {
        let finalScore = this.minimax(state, depth, depth, -Infinity, Infinity, true);
        // statistically prefer action in the middle of array which is also the middle of the game board
        let mean = (this.actions.length - 1) / 2;
        let sd = 1.5;
        let chosenAction = this.actions[constrain(round(randomGaussian(mean, sd)), 0, this.actions.length - 1)];
        return chosenAction;
    }

    /**
     * an implementation of a minimax algorithm (with alpha-beta-pruning)
     * explores a game tree from given starting state to a given depth
     * returns a set of the best, equally valued actions possible
     */
    minimax(state, depth, finalDepth, alpha, beta, maximizing) {
        if (state.isWon()) {
            // not sure if giving closer wins (/losses) a higher (/lower) score has noticeable influence
            if (state.prevPlayer == this.val) {
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

        if (depth == 0) {
            state.evalState(this.wH, this.wV, this.wD, this.wLP, this.wLA);
            return state.score;
        }

        state.calcChildren();

        if (maximizing) {
            let maxScore = -Infinity;
            for (let child of state.children) {
                let evalScore = this.minimax(child, depth - 1, depth, alpha, beta, false);
                if (evalScore >= maxScore) {
                    if (evalScore == maxScore && depth == finalDepth) {
                        this.actions.push(child.action);
                    } else if (evalScore > maxScore && depth == finalDepth) {
                        this.actions = [child.action];
                    }
                    maxScore = evalScore;
                }
                state.score = maxScore;
                alpha = max(alpha, evalScore);
                if (beta < alpha)
                    break;
            }
            return maxScore;
        } else {
            let minScore = Infinity;
            for (let child of state.children) {
                let evalScore = this.minimax(child, depth - 1, depth, alpha, beta, true);
                if (evalScore <= minScore) {
                    if (evalScore == minScore && depth == finalDepth) {
                        this.actions.push(child.action);
                    } else if (evalScore < minScore && depth == finalDepth) {
                        this.actions = [child.action];
                    }
                    minScore = evalScore;
                }
                state.score = minScore;
                beta = min(beta, evalScore);
                if (beta < alpha)
                    break;
            }
            return minScore;
        }
    }

    mutateWeights() {
        this.wH = this.wH + randomGaussian(0, 0.2);
        this.wV = this.wV + randomGaussian(0, 0.2);
        this.wD = this.wD + randomGaussian(0, 0.2);
        this.wLP = this.wLP + randomGaussian(0, 0.2);
        this.wLA = this.wLA + randomGaussian(0, 0.2);
    }
}