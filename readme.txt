Building the AI.
--------------------------------------------------------------------------------------------
State
--------------------------------------------------------------------------------------------
1. Know the board configuration.
2. Know who’s turn is it.
3. What the result of the game at this state is (whether it’s still running, somebody won, or it’s a draw).
4. Know how many moves the O player (AI player) have made till this state (you would think that we’ll need to keep track of X player moves too, but no, and we’ll see soon why). --------------------------------------------------------------------------------------------
The easiest way to represent the state is to make a class named State from which all the specific states will be instantiated.
- As we’ll need to read and modify all the information associated with a state at some points, we’ll make all the information public.
- modifying X moves count, the result of the state, and the board can be done with a simple assignment operation;
- modifying the turn would require a comparison first to determine if it’s X or O before updating it’s value. So for modifying the turn, we’ll use a little public function that would do this whole process for us.
- empty cells in the board of this state. This can be easily done with a function that loops over the board, checks if a cell has the value “E” (Empty) and returns the indices of these cells in an array.
- if this state is terminal or not (the terminal test function). This also can be easily done with a function that checks if there are matching rows, columns, or diagonals. If there is such a configuration, then it updates the result of the state with the winning player and returns true. If there is no such thing, it checks if the board is full. If it’s full, then it’s a draw and returns true, otherwise it returns false.
- For the board, it would be simpler to represent it as a 9-elements one-dimensional array instead of a 3x3 two-dimensional one. The 1st three elements would represent the 1st row, the 2nd three for the 2nd row, and the 3rd three for the 3rd row. 
- One last thing to worry about is how we can construct a state. Instead of at each time we construct a state form scratch and fill its information one by one (think about filling the board array element by element), it would be convenient if we have a copy-constructor ability to construct a new state from an old one and have minimal information to modify.