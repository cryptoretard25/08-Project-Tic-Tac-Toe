const { log } = console;
const { min, max, floor, random } = Math;

// OOP refactoring
//------------------------------------------------------------------------
//------------------------------------------------------------------------
class Player {
  constructor(mark, human) {
    this.mark = mark;
    this.human = human;
  }
  chooseMark(value) {
    this.mark = value;
    return this.mark;
  }
}

class AI extends Player {
  enemy;
  difficulty;
  constructor(mark, human) {
    super(mark, human);
    this.difficulty = 'master';
    this.enemy = (() => {
      return this.mark === "x" ? "o" : "x";
    })();
  }
  novice() {
    this.difficulty = "novice";
  }
  master() {
    this.difficulty = "master";
  }
  scores(comb = field.combinations()) {
    if (comb === undefined) return;
    if (!comb) return 0;
    return comb === this.mark ? 10 : -10;
  }
  minimax(board = field.board, depth, isMax) {
    if (this.scores() !== undefined) {
      return this.scores();
    }
    if (isMax) {
      let bestScore = -Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i] === "") {
          board[i] = this.mark;
          let score = this.minimax(board, depth + 1, false);
          board[i] = "";
          bestScore = max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i] === "") {
          board[i] = this.enemy;
          let score = this.minimax(board, depth + 1, true);
          board[i] = "";
          bestScore = min(score, bestScore);
        }
      }
      return bestScore;
    }
  }
  turn( currentTurn = gameState.getCurrentTurn(), currentState = gameState.getCurrentState(), board = field.board ) {
    if (currentTurn === this.enemy) return;
    if (currentState !== "started") return;
    let bestScore = -Infinity;
    const moves = [];
    for (let i = 0; i < board.length; i++) {
      if (board[i] === "") {
        board[i] = this.mark;
        let score = this.minimax(board, 0, false);
        board[i] = "";
        if (score > bestScore) {
          bestScore = score;
          moves.push(i);
        }
      }
    }
    return moves;
  }
  aiMove(){
    if(this.turn() === undefined) return;
    const actions = this.turn();
    log(actions);
    if(this.difficulty ==='novice'){
      let action;
      if(random()*100<=20){
        action = actions[0];
        log('Novice: Bad move')
      }else{
        actions.length >= 2 ? (action = actions[1]) : (action = actions[0]);
        log('Novice: Best move')
      }
      return action;
    }else if(this.difficulty === 'master'){
      let action = actions[actions.length - 1];
      log(actions.length-1)
      log('Master: Best move');
      return action;
    }
  }
}

const field = (function () {
  const board = ["", "", "", "", "", "", "", "", ""];
  const clearBoard = () => {
    for (let i = 0; i < board.length; i++) {
      board[i] = "";
    }
  };
  function emptyCells() {
    const indexes = [];
    for (let i = 0; i < board.length; i++) {
      if (!board[i]) {
        indexes.push(i);
      }
    }
    return indexes;
  }
  function combinations() {
    // Horizontal
    for (let i = 0; i <= 6; i += 3) {
      if (
        board[i] !== "" &&
        board[i] === board[i + 1] &&
        board[i + 1] === board[i + 2]
      ) {
        return board[i];
      }
    }
    // Vertical
    for (let i = 0; i <= 2; i++) {
      if (
        board[i] !== "" &&
        board[i] === board[i + 3] &&
        board[i + 3] === board[i + 6]
      ) {
        return board[i];
      }
    }
    // Diagonal
    for (let i = 0, j = 4; i <= 2; i = i + 2, j = j - 2) {
      if (
        board[i] !== "" &&
        board[i] === board[i + j] &&
        board[i + j] === board[i + 2 * j]
      ) {
        return board[i];
      }
    }
    if (emptyCells().length === 0) {
      return false;
    } else {
      return;
    }
  }

  return { combinations, clearBoard, board };
})();

const gameState = (function () {
  const state = ["none", "started", "win", "draw"];
  let currentTurn;
  let currentState = state[0];
  let endgame;

  const setCurrentTurn = (player = "") => { currentTurn = player; };
  const setCurrentState = (parameter = state[0]) => { currentState = parameter; };
  const setEndgame = (parameter = "") => { endgame = parameter; };

  const getCurrentTurn = () => currentTurn;
  const getCurrentState = () => currentState;
  const getEndgame = () => endgame;

  function start(player = human) {
    if (currentState !== state[0]) return;
    setCurrentTurn(player);
    setCurrentState(state[1]);
    if (getCurrentTurn()===computer){
      aiTurn();
    }
    }

  function reset(){
    setEndgame();
    setCurrentTurn();
    setCurrentState();
    field.clearBoard();
  }

  function next(player1 = human, player2 = computer) {
   return currentTurn === player1
      ? (currentTurn = player2)
      : (currentTurn = player1);
  }

  function end( player1 = human, player2 = computer, combinations = field.combinations() ) {
    if (combinations === player1.mark || combinations === player2.mark) {
      currentState = state[2];
      endgame = `${combinations} wins`;
      return true;
    }
    if (combinations === false) {
      currentState = state[3];
      endgame = `It's a draw`;
      return true;
    } else return;
  }

  function playerTurn(cell, board = field.board) {
    const player = getCurrentTurn();
    const state = getCurrentState();
    if (end()) return;
    if (state !== "started") return;
    if (player !== human) return;
    if (board[cell] !== "") return;
    board[cell] = player.mark;
    next();
  }
  function aiTurn(board = field.board) {
    const state = getCurrentState();
    const player = getCurrentTurn();
    if (end()) return;
    if (state !== "started") return;
    if (player !== computer) return;
    board[computer.aiMove()] = player.mark;
    next();
  }
  return {
    start,
    reset,
    end,
    aiTurn,
    playerTurn,
    getCurrentState,
    getCurrentTurn,
    getEndgame,
  };
})();

function move(cell){
  if(gameState.end()) return;
  gameState.playerTurn(cell);
  gameState.aiTurn();
  if(gameState.end()) log(gameState.getEndgame());
}

const human = new Player("x", true);
const computer = new AI("o", false);

gameState.start(human);
move(0)
move(1)
move(6)
move(5)
move(8)
log(field.board)
log(gameState.getCurrentTurn())
gameState.reset();
gameState.start(computer)
move(1); //x
move(6);
move(8);

log(field.board)
// gameState.reset();
// gameState.start();

// gameFlow.firstMove(5); //x
// gameFlow.firstMove(7); //x
// gameFlow.firstMove(8); //x
