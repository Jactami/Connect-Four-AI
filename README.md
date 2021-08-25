# Connect Four AI
An AI playing _Connct Four_ versus a human competitor in JavaScript using [p5.js](https://p5js.org/).

## How does the AI work?
The AI is based on the minimax algorithm with alpha-beta pruning and transposition tables. It calculates possible outcomes for every possible user action within the next 9 turns (as long as this step is not terminated by alpha-beta pruning). Each of these calculated game states is analysed in terms of every horizontal, vertical and diagonal line in size of 4. The final score associated with each game state depends on 3 questions:
1. Has any player filled a line, i.e. is the game won or lost?
2. How close is either side to achieving a filled line?
1. Is a filled line of 4 still possible for either side?

Each of these questions is rated with a positive or negative score and summed up to a final evaluation score for each game state which forms the basis for the minimax algorithm.

## TODOs/ ideas for possible future implementations:
- further reduce complexity of problem space to increase amount of predicted turns.
- explore new ways to improve game state assessment
