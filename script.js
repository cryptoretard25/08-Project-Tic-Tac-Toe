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
  function restartHandler(handler) {
    const restartButton = document.getElementById("restart-button");
    const restartDiv = document.querySelector('.footer');
    restartDiv.addEventListener('click', handler)
    restartButton.addEventListener("click", handler);
  }

  function resetCells() {
    cells.forEach((cell) => {
      cell.addEventListener("click", _handleClick, { once: true });
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
    hoverMark(currentMark);
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
  function hoverMark(current) {
    playfield.classList.remove(X.sign, O.sign);
    current === O.sign
      ? playfield.classList.add(X.sign)
      : playfield.classList.add(O.sign);
  }

  //internal functions
  function _placeMark(cell, current) {
    cell.classList.add(current);
  }
  return {
    cells,
    hoverMark,
    clearDisplay,
    resetCells,
    deactivateCells,
    showEndgameMenu,
    restartHandler,
    hideEndgameMenu,
    showWinningText,
    showDrawText,
  };
})();
//------------------------------------------------------------------------
// MODULE: GAME RULES
//------------------------------------------------------------------------
const gameRules = (function () {
  let _round;
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
  const getRound = () => _round;
  // METHODS
  const restartGame = () => {
    displayController.hideEndgameMenu();
    _round = 0;
    _mark = X.sign;
    displayController.resetCells();
    displayController.clearDisplay();
    displayController.hoverMark(O.sign);
  };
  const nextRound = () => {
    _round++;
    _mark = _round % 2 === 0 ? X.sign : O.sign;
  };
  const checkWin = () => {
    const currentMark = gameRules.getMark();
    return winningCombinations.some((combination) => {
      return combination.every((index) => {
        return displayController.cells[index].classList.contains(currentMark);
      });
    });
  };
  const checkDraw = () => {
    const cells = [...displayController.cells];
    const flag = cells.every(
      (element, index) =>
        cells[index].classList.contains(O.sign) ||
        cells[index].classList.contains(X.sign)
    );
    if (!checkWin() && flag) return flag;
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
  return { getMark, getRound, restartGame, nextRound, endGame, checkDraw };
})();
gameRules.restartGame();
displayController.restartHandler(gameRules.restartGame);
//------------------------------------------------------------------------
// FACTORY: PLAYER
//------------------------------------------------------------------------
function mark(sign) {
  const currentMark = {};
  currentMark.sign = sign;
  return currentMark;
}
