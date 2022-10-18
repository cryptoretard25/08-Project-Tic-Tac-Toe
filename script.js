const { log } = console;
const { min, max, floor, random } = Math;
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

  const _makeDifficulty = (function (){
    const diffDiv = document.getElementById('difficulty-div');
    diffDiv.addEventListener('click', function(e){
      const diffMenu = document.querySelector('.difficulty-menu')
      const closeDiffBtn = document.querySelector('.close');
      closeDiffBtn.addEventListener('click',function(){
        if(diffMenu.classList.contains('show')){
          diffMenu.classList.remove('show');
        }
      })
      if(!diffMenu.classList.contains('show')){
        diffMenu.classList.add('show')
      }else{
        diffMenu.classList.remove('show')
      }
      const buttonNovice = document.querySelector('#novice')
      const buttonMaster = document.querySelector('#master')
      if(ai.getDifficulty() === 'master'){
        buttonMaster.classList.add('active');
      }else{
        buttonNovice.classList.add('active');
      }
      buttonNovice.addEventListener('click', function(e){
        if(!buttonNovice.classList.contains('active')){
          buttonNovice.classList.add('active')
          buttonMaster.classList.remove('active')
          ai.setDifficulty('novice');
        }
      })
      buttonMaster.addEventListener('click', function(e){
        if(!buttonMaster.classList.contains('active')){
          buttonMaster.classList.add('active')
          buttonNovice.classList.remove('active')
          ai.setDifficulty('master');
        }
      })
    })
  })()
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
        ai.AImakeMove();
        hoverMark();
        log("Setup O");
      }
    });
  }
  function _deactivateMarkInterface() {
    if (gameRules.isGameStarted()) {
      setXButton.disabled = true;
      setOButton.disabled = true;
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
    const restartDiv = document.querySelector("#restart-div");
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
      //gameRules.AITurn();
      ai.AImakeMove();
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
    _deactivateMarkInterface();
  }
  return {
    cells,
    selectEmptyField, // +
    hoverMark, // +
    clearDisplay, //+
    resetCells, // +
    deactivateCells, // +
    showEndgameMenu, // +
    startHandler, // +
    hideEndgameMenu, // +
    showWinningText, // +
    showDrawText, // +
    activateMarkInterface, // +
    setDefaultMark, // +
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
    log('Game: Started')
  };
  const nextRound = () => {
    getMark() === player.sign ? setMarkO() : setMarkX();
    displayController.hoverMark();
  };

  const endGame = () => {
    if (isWin().bool) {
      log("Game: Ended");
      displayController.deactivateCells();
      displayController.showEndgameMenu();
      displayController.showWinningText();
    } else if (isDraw()) {
      log("Game: Ended");
      displayController.deactivateCells();
      displayController.showEndgameMenu();
      displayController.showDrawText();
    }
  };
  return {
    board,
    getBoard,
    clearBoard,
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
// FACTORY: PLAYER
//------------------------------------------------------------------------
function mark(sign, player) {
  const currentMark = {};
  currentMark.sign = sign;
  currentMark.player = player;
  return currentMark;
}
//------------------------------------------------------------------------
// MODULE: AI
//------------------------------------------------------------------------
const ai = (function () {
  let AIMovesCount;
  let difficulty = 'master';
  const scores = {
    o: 10,
    x: -10,
    draw: 0,
  };
  const getDifficulty = function(){
    log(difficulty)
    return difficulty; 
  }
  const setDifficulty = function(diff){
    difficulty = diff;
    log(difficulty);
  }
  const isWin = function () {
    return gameRules.isWin().bool
      ? gameRules.isWin().mark
      : gameRules.isDraw()
      ? "draw"
      : false;
  };
  const _minimax = (board, depth, isMax) => {
    const result = isWin();
    if (result) {
      return scores[result];
    }
    if (isMax) {
      let bestScore = -Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i] === "") {
          board[i] = computer.sign;
          let score = _minimax(board, depth + 1, false);
          board[i] = "";
          bestScore = max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i] === "") {
          board[i] = player.sign;
          let score = _minimax(board, depth + 1, true);
          board[i] = "";
          bestScore = min(score, bestScore);
        }
      }
      return bestScore;
    }
  };
  const _AITurn = () => {
    if (gameRules.getMark() === player.sign) return;
    if (gameRules.isDraw() || gameRules.isWin().bool) return;
    const board = gameRules.getBoard();
    let bestScore = -Infinity;
    const moves = [];
    for (let i = 0; i < board.length; i++) {
      if (board[i] === "") {
        board[i] = computer.sign;
        let score = _minimax(board, 0, false);
        board[i] = "";
        if (score > bestScore) {
          bestScore = score;
          moves.push(i);
        }
      }
    }
    return moves;
  };

  const AImakeMove = () => {
    if (gameRules.getMark() === player.sign) return;
    if (isWin()) return;
    const actions = _AITurn();
    log(actions)
    if (difficulty === "novice") {
      let action;
      if (random() * 100 <= 20) {
        action = actions[0];
        log('Novice: Bad move')
      } else {
        actions.length >= 2 ? (action = actions[1]) : (action = actions[0]);
        log('Novice: Best move')
      }
      displayController.selectEmptyField(action);
    }
    if (difficulty === "master") {
      const action = actions[actions.length - 1];
      displayController.selectEmptyField(action);
      log('Master: Best move')
    }
  };
  return {AImakeMove, setDifficulty, getDifficulty };
})();
//------------------------------------------------------------------------
// MODULE: ON LOAD
//------------------------------------------------------------------------
const onLoad = (function () {
  gameRules.startGame();
  displayController.startHandler(gameRules.startGame);
})();