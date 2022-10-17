const { log } = console;
const { min, max } = Math;
//------------------------------------------------------------------------
const player = mark("x", "human");
const computer = mark("o", "computer");
//------------------------------------------------------------------------
// MODULE: DISPLAY CONTROLLER
//------------------------------------------------------------------------
const displayController = (function () {
  //RESET CELLS
  const cells = document.querySelectorAll("[data-cell]");
  const playfield = document.querySelector(".playfield");
  const endGameField = document.querySelector(".endgame");
  const winningText = document.querySelector(".winning-text");
  const setXButton = document.getElementById("x-button");
  const setOButton = document.getElementById("o-button");

  function selectEmptyField(item) {
    for (let cell of cells) {
      if (cell.dataset.cell === `${item}`) {
        cell.click();
      }
    }
  }
  function setDefaultMark() {
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
        gameRules.AITurn();
        //gameRules.randomTurn();
        hoverMark();
        log("Setup O");
      }
    });
  }
  function deactivateMarkInterface() {
    if (gameRules.isGameStarted()) {
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
  function showWinningText() {
    winningText.textContent = `${gameRules
      .isWin()
      .mark.toUpperCase()} wins! Congratulations!`;
  }
  function showDrawText() {
    winningText.textContent = `It's a draw!`;
  }
  function startHandler(func) {
    const restartButton = document.getElementById("restart-button");
    const restartDiv = document.querySelector(".footer");
    restartDiv.addEventListener("click", func);
    restartButton.addEventListener("click", func);
  }
  function resetCells() {
    for (let cell of cells) {
      cell.addEventListener("click", _handleClick, { once: true });
      cell.classList.remove("puff-in-center");
    }
  }
  function deactivateCells() {
    for (let cell of cells) {
      cell.removeEventListener("click", _handleClick);
    }
    if (gameRules.isWin().bool || gameRules.isDraw())
      playfield.classList.remove(computer.sign, player.sign);
    log("cells deactivated");
  }
  function activateCells() {
    for (let cell of cells) {
      cell.addEventListener("click", _handleClick);
    }
  }
  //CLICK HANDLER
  function _handleClick(e) {
    const cell = e.target;
    const currentMark = gameRules.getMark();
    _makeTurn(cell, currentMark);
    deactivateCells();
    gameRules.endGame();
    gameRules.nextRound();
    setTimeout(() => {
      activateCells();
      //gameRules.randomTurn();
      gameRules.AITurn();
    }, 500);
  }
  //CLEAR DISPLAY
  function clearDisplay() {
    for (let cell of cells) {
      cell.classList.remove(player.sign, computer.sign);
    }
  }
  //HOVER HANDLER
  function hoverMark() {
    playfield.classList.remove(player.sign, computer.sign);
    playfield.classList.add(gameRules.getMark());
  }
  //internal functions
  function _makeTurn(cell, current) {
    const item = cell.dataset.cell;
    gameRules.board[item] = current;
    cell.classList.add(current);
    cell.classList.add("puff-in-center");
    displayController.deactivateMarkInterface();
  }
  return {
    cells,
    selectEmptyField,
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
    setDefaultMark,
  };
})();
//------------------------------------------------------------------------
// MODULE: GAME RULES
//------------------------------------------------------------------------
const gameRules = (function () {
  let _mark;
  const board = ["", "", "", "", "", "", "", "", ""];
  // GETTERS
  const getBoard = () => board;
  const getMark = () => _mark;
  const setMarkX = () => (_mark = player.sign);
  const setMarkO = () => (_mark = computer.sign);
  // GAME
  const clearBoard = () => {
    for (let i = 0; i < board.length; i++) {
      board[i] = "";
    }
  };
  const emptyCells = () => {
    const indexes = [];
    for (let i = 0; i < board.length; i++) {
      if (!board[i]) {
        indexes.push(i);
      }
    }
    return indexes;
  };
  const randomTurn = () => {
    if (getMark() === player.sign) return;
    if (isDraw() || isWin().bool) return;
    const empty = emptyCells();
    const random = Math.floor(Math.random() * (empty.length - 1));
    const turn = empty[random];
    displayController.selectEmptyField(turn);
    log(board);
  };
  const AITurn = () => {
    if (getMark() === player.sign) return;
    if (isDraw() || isWin().bool) return;
    let bestScore = -Infinity;
    let turn;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === "") {
        board[i] = computer.sign;
        let score = ai.minimax(board, 0, false);
        board[i] = "";
        if (score > bestScore) {
          bestScore = score;
          turn = i;
          log({ turn });
        }
      }
    }
    displayController.selectEmptyField(turn);
  };
  const isGameStarted = () => {
    return board.some((item) => item === player.sign || item === computer.sign);
  };
  const isWin = () => {
    const board = getBoard();
    //Horizontal
    for (let i = 0; i <= 6; i += 3) {
      if (
        board[i] !== "" &&
        board[i] === board[i + 1] &&
        board[i + 1] === board[i + 2]
      ) {
        const mark = board[i];
        return { bool: true, mark };
      }
    }
    //Vertical
    for (let i = 0; i <= 2; i++) {
      if (
        board[i] !== "" &&
        board[i] === board[i + 3] &&
        board[i + 3] === board[i + 6]
      ) {
        const mark = board[i];
        return { bool: true, mark };
      }
    }
    //Diagonal
    for (let i = 0, j = 4; i <= 2; i = i + 2, j = j - 2) {
      if (
        board[i] !== "" &&
        board[i] === board[i + j] &&
        board[i + j] === board[i + 2 * j]
      ) {
        const mark = board[i];
        return { bool: true, mark };
      }
    }
    return { bool: false };
  };
  const isDraw = () => {
    return emptyCells().length === 0 ? true : false;
  };
  const startGame = () => {
    clearBoard();
    displayController.activateMarkInterface();
    setMarkX();
    displayController.setDefaultMark();
    displayController.hideEndgameMenu();
    displayController.resetCells();
    displayController.clearDisplay();
    displayController.hoverMark();
  };
  const nextRound = () => {
    getMark() === player.sign ? setMarkO() : setMarkX();
    displayController.hoverMark();
  };

  const endGame = () => {
    if (isWin().bool) {
      log("game ended");
      displayController.deactivateCells();
      displayController.showEndgameMenu();
      displayController.showWinningText();
    } else if (isDraw()) {
      displayController.deactivateCells();
      displayController.showEndgameMenu();
      displayController.showDrawText();
    }
  };
  return {
    board,
    getBoard,
    clearBoard,
    AITurn,
    getMark,
    startGame,
    nextRound,
    endGame,
    isWin,
    isDraw,
    isGameStarted,
    setMarkX,
    setMarkO,
  };
})();
//------------------------------------------------------------------------
// MODULE: ON LOAD
//------------------------------------------------------------------------
const onLoad = (function () {
  gameRules.startGame();
  displayController.startHandler(gameRules.startGame);
})();
//------------------------------------------------------------------------
// FACTORY: PLAYER
//------------------------------------------------------------------------
function mark(sign, player) {
  const currentMark = {};
  currentMark.sign = sign;
  currentMark.player = player;
  return currentMark;
}
//------------------------------------------------------------------------
// AI
//------------------------------------------------------------------------
const ai = (function () {
  let AIMovesCount;
  let scores = {
    o: 10,
    x: -10,
    draw: 0,
  };
  const isWin = function () {
    return gameRules.isWin().bool
      ? gameRules.isWin().mark
      : gameRules.isDraw()
      ? "draw"
      : false;
  }
  const minimax = (board, depth, isMax) => {
    const result = isWin();
    if (result) {
      return scores[result];
    }
    if (isMax) {
      let bestScore = -Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i] === "") {
          board[i] = computer.sign;
          let score = minimax(board, depth + 1, false);
          board[i] = "";
          bestScore = max(score, bestScore)
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i] === "") {
          board[i] = player.sign;
          let score = minimax(board, depth + 1, true);
          board[i] = "";
          bestScore = min(score, bestScore);
        }
      }
      return bestScore;
    }
  };
  return { minimax };
})();
