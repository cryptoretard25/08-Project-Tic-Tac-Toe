const { log } = console;

// MODULE: GameBoard
gameBoard = (function () {
  const _board = new Array(9);

  const getCell = (num) => _board[num];

  const setCell = (num, player) => {
    const htmlCell = document.querySelector(`.cell:nth-child(${num + 1})`);
    htmlCell.textContent = getCell(num);
    return htmlCell;
  };
  const emptyCell = () => {
    const emptyCells = [];
    _board.forEach((element, index) => {
      if (element === undefined) {
        emptyCells.push(index);
      }
    });
    return emptyCells;
  };

  const clear = () => {
    for (i = 0; i < _board.length; i++) {
      _board[i] = undefined;
      setCell(i);
    }
  };

  return { getCell, setCell, clear, emptyCell };
})();
//------------------------------------------------------------------------
// MODULE: DisplayController
//------------------------------------------------------------------------
const displayController = (function () {
  const cells = document.querySelectorAll(".cell");

  log(cells);
})();
//------------------------------------------------------------------------
// MODULE: GameRules
//------------------------------------------------------------------------
const gameRules = (function () {
  let _round = 0;
  const incrementRound = () => _round++;
  const oddRound = () => (_round % 2 === 0 ? true : false);

  return { incrementRound, oddRound };
})();
//------------------------------------------------------------------------
// FACTORY: PLAYER
//------------------------------------------------------------------------
function player(sign) {
  const playerSign = {};
  playerSign.sign = sign;

  return playerSign;
}

const o = player("o");
const x = player("x");
//------------------------------------------------------------------------

// const cell = gameBoard.setCell(0);
// log(cell)

gameBoard.clear();
const cells = gameBoard.emptyCell();
