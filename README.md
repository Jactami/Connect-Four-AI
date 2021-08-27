# Connect Four AI
An AI playing _Connct Four_ versus a human competitor in JavaScript using [p5.js](https://p5js.org/).

## How does the AI work?
The AI is based on the minimax algorithm with alpha-beta pruning. For any given board configuration potential outcomes are simulated for all applicable user actions within a specific number of turns. This results in a game tree which stores all relevant future board configurations. The depth of this tree (and thus the number of turns the AI can look ahead) is determined dynamically by an iterative deeepening process. Each leaf configuration in the game tree is analysed in terms of every horizontal, vertical and diagonal line in size of 4. The final score associated with each configuration depends on 3 questions:
1. Has any player filled a line, i.e. the game is won/ lost?
2. How close is either side to achieving a filled line?
1. Is a filled line of 4 still possible for either side?

These questions are rated with a positive or negative score and summed up to a final evaluation score for each leaf. These scores are propagated from the bottom to the top of the tree and result in path to the optimal score. Furthermore, the score associated with a board configuration is stored in a transposition table with Zobrist hashing. This avoids to fully recompute duplicate configurations in the game tree that were already explored.

## TODOs/ ideas for possible future implementations:
- reduce complexity of problem space (improve move exploration order, mirror transposition table, ...)
- improve evaluation function of board configurations (more accurate scores, less complex calculation, ...)
