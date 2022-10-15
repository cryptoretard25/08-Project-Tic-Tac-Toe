const { log } = console;
const X = mark("x");
const O = mark("o");
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
  //EVENT LISTENERS
  function startHandler(func) {
    const restartButton = document.getElementById("restart-button");
    const restartDiv = document.querySelector(".footer");
    restartDiv.addEventListener("click", func);
    restartButton.addEventListener("click", func);
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
  //CLICK HANDLER
  function _handleClick(e) {
    const cell = e.target;
    const currentMark = gameRules.getMark();
    _placeMark(cell, currentMark);
    gameRules.endGame();
    gameRules.nextRound();
  }
  //CLEAR DISPLAY
  function clearDisplay() {
    for (cell of cells) {
      cell.classList.remove(X.sign, O.sign);
    }
  }
  //HOVER HANDLER
  function hoverMark() {
    playfield.classList.remove(X.sign, O.sign);
    playfield.classList.add(gameRules.getMark());
  }

  //internal functions
  function _placeMark(cell, current) {
    cell.classList.add(current);
    cell.classList.add("puff-in-center");
    displayController.deactivateMarkInterface();
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
  };
})();
//------------------------------------------------------------------------
// MODULE: GAME RULES
//------------------------------------------------------------------------
const gameRules = (function () {
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
  return {
    getMark,
    startGame,
    nextRound,
    endGame,
    checkDraw,
    gameStarted,
    setMarkX,
    setMarkO,
  };
})();
const onLoad = (function () {
  gameRules.startGame();
  displayController.startHandler(gameRules.startGame);
})();
//------------------------------------------------------------------------
// FACTORY: PLAYER
//------------------------------------------------------------------------
function mark(sign) {
  const currentMark = {};
  currentMark.sign = sign;
  return currentMark;
}
