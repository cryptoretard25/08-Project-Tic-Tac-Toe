const { log } = console;


//display
const displayController = (function(){
  const cells = document.querySelectorAll("[data-cell]");
  const playfield = document.querySelector(".playfield");
  const endGameField = document.querySelector(".endgame");
  const winningText = document.querySelector(".winning-text");
  const setXButton = document.getElementById("x-button");
  const setOButton = document.getElementById("o-button");

  function setDefaultMark(){
    setXButton.classList.add("button-active");
    setOButton.classList.remove("button-active");
  }
  function activateMarkInterface() {
    setXButton.disabled = false;
    setOButton.disabled = false;
    log("Mark interface enabled");
    setXButton.addEventListener("click", function (e) {
      if (!setXButton.classList.contains("button-active")) {
        setXButton.classList.add("button-active");
        setOButton.classList.remove("button-active");
        gameRules.setMarkX();
        hoverMark();
        log("Setup X");
      }
    });
    setOButton.addEventListener("click", function (e) {
      if (!setOButton.classList.contains("button-active")) {
        setOButton.classList.add("button-active");
        setXButton.classList.remove("button-active");
        gameRules.setMarkO();
        hoverMark();
        log("Setup O");
      }
    });
  }
  function deactivateMarkInterface() {
    if (gameRules.gameStarted()) {
      setXButton.disabled = true;
      setOButton.disabled = true;
      log("Mark interface disabled");
    }
  }
  function showEndgameMenu() {
    endGameField.classList.add("show");
  }
  function hideEndgameMenu() {
    endGameField.classList.remove("show");
  }
  function showWinningText(target) {
    target === O.sign
      ? (winningText.textContent = `O wins! Congratulations!`)
      : (winningText.textContent = `X wins! Congratulations!`);
  }
  function showDrawText() {
    winningText.textContent = `It's a draw!`;
  }
  function resetCells() {
    cells.forEach((cell) => {
      cell.addEventListener("click", _handleClick, { once: true });
      cell.classList.remove("puff-in-center");
    });
  }
  function deactivateCells() {
    for (cell of cells) {
      cell.removeEventListener("click", _handleClick);
    }
    playfield.classList.remove(O.sign, X.sign);
  }
  function clearDisplay() {
    for (let cell of cells) {
      cell.classList.remove(X.sign, O.sign);
    }
  }
  function hoverMark() {
    playfield.classList.remove(X.sign, O.sign);
    playfield.classList.add(gameRules.getMark());
  }

  return {
    cells,
    hoverMark,
    clearDisplay,
    resetCells,
    deactivateCells,
    showEndgameMenu,
    startHandler,
    hideEndgameMenu,
    showWinningText,
    showDrawText,
    activateMarkInterface,
    deactivateMarkInterface,
    setDefaultMark
  }
})()

const onclickHandlers = (function(){
  function startHandler(func) {
    const restartButton = document.getElementById("restart-button");
    const restartDiv = document.querySelector(".footer");
    restartDiv.addEventListener("click", func);
    restartButton.addEventListener("click", func);
  }
  function _handleClick(e) {
    const cell = e.target;
    const currentMark = gameRules.getMark();
    _placeMark(cell, currentMark);
    gameRules.endGame();
    gameRules.nextRound();
  }
  return startHandler
})()

//click handlers 

//?
function _placeMark(cell, current) {
  cell.classList.add(current);
  cell.classList.add("puff-in-center");
  displayController.deactivateMarkInterface();
}
//game rules
let _mark;
const winningCombinations = [
  //HORIZONTAL
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  //VERTICAL
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  //DIAGONAL
  [0, 4, 8],
  [2, 4, 6],
];
// GETTERS
const getMark = () => _mark;
 // METHODS
const setMarkX = () => _mark = X.sign;
const setMarkO = () => _mark = O.sign;
const gameStarted = () => {
  const cells = [...displayController.cells];
  const started = cells.some(
    (cell) =>
      cell.classList.contains(X.sign) || cell.classList.contains(O.sign)
  );
  return started;
};
const startGame = () => {
  displayController.activateMarkInterface();
  setMarkX();
  displayController.setDefaultMark();
  displayController.hideEndgameMenu();
  displayController.resetCells();
  displayController.clearDisplay();
  displayController.hoverMark();
};
const nextRound = () => {
  if (getMark() === X.sign) {
    setMarkO();
  } else {
    setMarkX();
  }
  displayController.hoverMark();
};
const checkWin = () => {
  const currentMark = gameRules.getMark();
  return winningCombinations.some((combination) => {
    return combination.every((element) => {
      return displayController.cells[element].classList.contains(currentMark);
    });
  });
};
const checkDraw = () => {
  const cells = [...displayController.cells];
  const draw = cells.every(
    (element, index) =>
      element.classList.contains(O.sign) || element.classList.contains(X.sign)
  );
  if (!checkWin() && draw) return draw;
};
const endGame = () => {
  if (checkWin()) {
    log("game ended");
    displayController.deactivateCells();
    displayController.showEndgameMenu();
    displayController.showWinningText(getMark());
  } else if (checkDraw()) {
    displayController.deactivateCells();
    displayController.showEndgameMenu();
    displayController.showDrawText();
  }
};

//ONLOAD
const onLoad = (function () {
  gameRules.startGame();
  displayController.startHandler(gameRules.startGame);
})();


//STATE
function state(old){
  const state = Object.create(stateProto);
  // The player who has the turn to player
  state.turn = "x";
  // The number of moves of the AI player
  state.AIMovesCount = 0;
  // The result of the game in this State
  state.result = "";
  // The board configuration in this state
  state.board = ["", "", "", "", "", "", "", "", ""];
  // Object Construction
  if(typeof old !== 'undefined'){
    let len = old.board.length;
    log(old.board.len)
    state.turn = new Array(len);
    for(let i=0; i<len; i++){
      state.board[i] = old.board[i];
    }
    state.AIMovesCount = old.AIMovesCount;
    state.result = old.result;
    state.turn = old.turn;
  }
  return state;
}
const stateProto = {
  nextTurn: function () {
    this.turn = this.turn === "x" ? "o" : "x";
  },
  emptyCells: function () {
    const indexes = [];
    const board = this.board;
    for (let i = 0; i < board.length; i++) {
      if (!board[i]) {
        indexes.push(i);
      }
    }
    return indexes;
  },
  isWin: function () {
    const board = this.board;
    //Horizontal
    for (let i = 0; i <= 6; i += 3) {
      if (
        board[i] !== "" &&
        board[i] === board[i + 1] &&
        board[i + 1] === board[i + 2]
      ) {
        state.result = board[i];
        return true;
      }
    }
    //Vertical
    for (let i = 0; i <= 2; i++) {
      if (
        board[i] !== "" &&
        board[i] === board[i + 3] &&
        board[i + 3] === board[i + 6]
      ) {
        state.result = board[i];
        return true;
      }
    }
    //Diagonal
    for (let i = 0, j = 4; i <= 2; i = i + 2, j = j - 2) {
      if (
        board[i] !== "" &&
        board[i] === board[i + j] &&
        board[i + j] === board[i + 2 * j]
      ) {
        state.result = board[i];
        return true;
      }
    }
    log(this)
    return false;
  },
};




function AI(level) {
  const ai = {};
  //private attribute: level of intelligence the player has
  ai._intelectLevel = level;
  //private attribute: the game the player is playing
  ai._game = {};
  /*
   * private recursive function that computes the minimax value of a game state
   * @param state [State] : the state to calculate its minimax value
   * @returns [Number]: the minimax value of the state
   */
  ai._minimaxValue = function (state) {};
  /*
   * private function: make the ai player take a blind move
   * that is: choose the cell to place its symbol randomly
   * @param turn [String]: the player to play, either X or O
   */
  ai._takeBlindMove = function (turn) {};
  /*
   * private function: make the ai player take a novice move,
   * that is: mix between choosing the optimal and suboptimal minimax decisions
   * @param turn [String]: the player to play, either X or O
   */
  ai._takeNoviceMove = function (turn) {};
  /*
   * private function: make the ai player take a master move,
   * that is: choose the optimal minimax decision
   * @param turn [String]: the player to play, either X or O
   */
  ai._takeMasterMove = function (turn) {};
  /*
   * public method to specify the game the ai player will play
   * @param _game [Game] : the game the ai will play
   */
  ai.plays = function (game) {
    ai._game = game;
  };
  /*
   * public function: notify the ai player that it's its turn
   * @param turn [String]: the player to play, either X or O
   */
  ai.notify = function (turn) {
    switch (ai._intelectLevel) {
      case "blind":
        ai._takeBlindMove(turn);
        break;
      case "novice":
        ai._takeNoviceMove(turn);
        break;
      case "master":
        ai._takeMasterMove(turn);
        break;
    }
  };
  return ai;
}
function AIAction(pos){
  const aiaction = {};
  aiaction.movePosition = pos;
  aiaction.minimaxVal = 0;
}