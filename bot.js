/**
 * An AI using minimax to chose an optimal action
 */
class Bot {
    constructor(val) {
        this.val = val;
        this.actions = [];
        this.dict = new p5.TypedDict();
        this.counter;
    }

    /**
     * simualates a given amount of next turns from a given state
     * returns the best possible action
     */
    think(state, depth) {
        let t0 = new Date().getTime();
        this.dict.clear();
        this.counter = 0;

        let finalScore = this.minimax(state, depth, depth, -Infinity, Infinity, true);
        // statistically prefer action in the middle of array which is also the middle of the game board
        let mean = (this.actions.length - 1) / 2;
        let sd = 1.5;
        let chosenAction = this.actions[constrain(round(randomGaussian(mean, sd)), 0, this.actions.length - 1)];

        let t1 = new Date().getTime();
        let deltaT = t1 - t0;

        console.clear();
        console.log("state score", finalScore);
        console.log("possible actions", this.actions);
        console.log("chosen action", chosenAction);
        console.log("explored states", this.counter);
        console.log("unique states", this.dict.size());
        console.log("execution time", deltaT);

        return chosenAction;
    }

    /**
     * an implementation of a minimax algorithm (with alpha-beta-pruning)
     * explores a game tree from given starting state to a given depth
     * returns a set of the best, equally valued actions possible
     */
    minimax(state, depth, finalDepth, alpha, beta, maximizing) {
        this.counter++;
        let key = state.grid.toString();
        // check if state was explored before
        if (this.dict.hasKey(key)) {
            let val = this.dict.get(key);
            if (maximizing) {
                alpha = val;
                if (alpha > beta)
                    return alpha;
            } else { // minimizing
                beta = val;
                if (alpha > beta)
                    return beta;
            }
        }

        let score;
        if (state.isWon()) {
            // not sure if giving closer wins (/losses) a higher (/lower) score has noticeable influence
            if (state.prevPlayer == this.val) {
                state.score = 10000 * (depth + 1);
            } else { // opponent won
                state.score = -10000 * (depth + 1);
            }
            score = state.score;
        } else if (state.isDraw()) {
            state.score = 0;
            score = state.score;
        } else if (depth == 0) {
            state.evalState();
            score = state.score;
        } else { // recursive part
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
                score = maxScore;
            } else { // minimizing
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
                score = minScore;
            }
        }
        this.dict.set(key, score);
        return score;
    }
}