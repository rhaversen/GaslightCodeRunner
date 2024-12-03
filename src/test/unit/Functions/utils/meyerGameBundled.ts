/* eslint-disable local/enforce-comment-order */
const stringBundle =
	`
(() => {
  // virtual:commonTypes.ts
  var PlayerError = class extends Error {
    constructor(message) {
      super(message);
      this.name = "PlayerError";
    }
  };

  // virtual:utils.ts
  function rollDice() {
    const randomDie = () => Math.floor(Math.random() * 6) + 1;
    return [randomDie(), randomDie()];
  }
  function calculateScore(dice) {
    const [die1, die2] = dice.sort((a, b) => b - a);    
    if (die1 === 2 && die2 === 1) return 1e3;
    if (die1 === 3 && die2 === 1) return 999;
    if (die1 === die2) return die1 * 100;
    return die1 * 10 + die2;
  }
  var validScores = /* @__PURE__ */ new Set([
    // Special scores
    1e3,
    999,
    // Pairs
    600,
    500,
    400,
    300,
    200,
    100,
    // Regular scores
    65,
    64,
    63,
    62,
    61,
    54,
    53,
    52,
    51,
    43,
    42,
    41,
    32
  ]);
  function isValidScore(score) {
    return validScores.has(score);
  }
  function roundUpToValidScore(score) {
    const validScoresAscending = [...validScores].sort((a, b) => a - b);
    for (const validScore of validScoresAscending) {    
      if (score <= validScore) return validScore;       
    }
    return 0;
  }
  var Scoring = class {
    scores;
    submissionIds;
    constructor(submissionIds) {
      this.submissionIds = submissionIds;
      this.scores = new Map(submissionIds.map((id) => [id, 6]));
    }
    penalize(playerIndex, subAmount) {
      const id = this.submissionIds[playerIndex];       
      const currentScore = this.scores.get(id) || 6;    
      this.scores.set(id, currentScore - subAmount);    
    }
    getScores() {
      return this.scores;
    }
  };

  // virtual:gameState.ts
  var GameState = class _GameState {
    static instance;
    previousActions = [];
    firstInRound = true;
    currentPlayerIndex = 0;
    amountOfPlayers = 0;
    hasRolled = false;
    scoring;
    turnActive = true;
    roundActive = true;
    static getInstance() {
      if (!_GameState.instance) {
        _GameState.instance = new _GameState();
      }
      return _GameState.instance;
    }
    init(ids) {
      this.amountOfPlayers = ids.length;
      this.scoring = new Scoring(ids);
    }
    addAction(action) {
      this.previousActions.unshift(action);
    }
    penalizePlayer(playerIndex) {
      this.scoring?.penalize(playerIndex, 1);
    }
    doublePenalizePlayer(playerIndex) {
      this.scoring?.penalize(playerIndex, 2);
    }
    // Getters and setters
    getPreviousActions() {
      return [...this.previousActions];
    }
    removePreviousAction() {
      this.previousActions.shift();
    }
    isFirstInRound() {
      return this.firstInRound;
    }
    getCurrentPlayerIndex() {
      return this.currentPlayerIndex;
    }
    getPrevPlayerIndex() {
      return (this.currentPlayerIndex - 1 + this.amountOfPlayers) % this.amountOfPlayers;
    }
    hasPlayerRolled() {
      return this.hasRolled;
    }
    setHasRolled(value) {
      this.hasRolled = value;
    }
    incrementCurrentPlayerIndex() {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.amountOfPlayers;
    }
    endTurn() {
      this.turnActive = false;
    }
    endRound() {
      this.turnActive = false;
      this.roundActive = false;
    }
    isTurnActive() {
      return this.turnActive;
    }
    prepareNextPlayer() {
      if (this.roundActive) {
        this.firstInRound = false;
      } else {
        this.firstInRound = true;
        this.previousActions = [];
        this.roundActive = true;
      }
      this.hasRolled = false;
      this.turnActive = true;
      this.incrementCurrentPlayerIndex();
    }
    getResults() {
      return this.scoring?.getScores() || /* @__PURE__ */ new Map();
    }
  };
  var gameState = GameState.getInstance();

  // virtual:strategyAPI.ts
  function createStrategyAPI(playerIndex) {
    const ensureTurnActive = () => {
      if (gameState.isTurnActive()) {
        throw new PlayerError("You cannot perform any more actions this turn.");
      }
    };
    return {
      calculateDieScore: (dice) => calculateScore(dice),
      getPreviousActions: () => {
        ensureTurnActive();
        return gameState.getPreviousActions().map((action) => action.announcedValue);
      },
      getPreviousAction: () => {
        ensureTurnActive();
        return gameState.getPreviousActions()[0]?.announcedValue;
      },
      roundUpToValidScore: (score) => roundUpToValidScore(score),
      isFirstInRound: () => {
        ensureTurnActive();
        return gameState.isFirstInRound();
      },
      detEllerDerover: () => {
        ensureTurnActive();
        if (!gameState.hasPlayerRolled()) {
          throw new PlayerError('Cannot do "det eller derover" before rolling the dice.');
        }
        if (gameState.isFirstInRound()) {
          throw new PlayerError('Cannot do "det eller derover" as the first action in a round.');
        }
        gameState.removePreviousAction();
        const dice = rollDice();
        const score = calculateScore(dice);
        const previousAnnouncedValue = gameState.getPreviousActions()[0]?.announcedValue || 0;
        gameState.addAction({
          type: "detEllerDerover",
          value: score,
          playerIndex,
          announcedValue: previousAnnouncedValue        
        });
        gameState.endTurn();
      },
      reveal: () => {
        ensureTurnActive();
        if (gameState.hasPlayerRolled()) {
          throw new PlayerError("Cannot reveal after rolling the dice.");
        }
        const prevPlayerIndex = gameState.getPrevPlayerIndex();
        const prevAction = gameState.getPreviousActions()[0];
        if (!prevAction) {
          throw new PlayerError("No previous action to reveal.");
        }
        const prevPlayerLied = prevAction.value !== prevAction.announcedValue;
        const prevAnnouncedValueIsMeyer = prevAction.announcedValue === 1e3;
        const prevValueIsMeyer = prevAction.value === 1e3;
        if (prevPlayerLied) {
          if (prevAnnouncedValueIsMeyer) {
            gameState.doublePenalizePlayer(prevPlayerIndex);
          } else {
            gameState.penalizePlayer(prevPlayerIndex);  
          }
        } else {
          if (prevValueIsMeyer) {
            gameState.doublePenalizePlayer(playerIndex);
          } else {
            gameState.penalizePlayer(playerIndex);      
          }
        }
        gameState.endRound();
      },
      roll: () => {
        ensureTurnActive();
        if (gameState.hasPlayerRolled()) {
          throw new PlayerError("You have already rolled the dice this turn.");
        }
        const dice = rollDice();
        const score = calculateScore(dice);
        gameState.addAction({
          type: "roll",
          value: score,
          playerIndex,
          announcedValue: score
        });
        gameState.setHasRolled(true);
        return score;
      },
      lie: (score) => {
        ensureTurnActive();
        if (!gameState.hasPlayerRolled()) {
          throw new PlayerError("You must roll before you can lie.");
        }
        const lieValue = score;
        const prevValue = gameState.getPreviousActions()[1]?.announcedValue || 0;
        const realValue = gameState.getPreviousActions()[0].value;
        if (!isValidScore(lieValue)) {
          throw new PlayerError("Invalid lie value.");  
        }
        if (lieValue <= prevValue) {
          throw new PlayerError("You must announce a higher value than the previous player.");
        }
        gameState.addAction({
          type: "lie",
          value: realValue,
          playerIndex,
          announcedValue: lieValue
        });
        gameState.endTurn();
      }
    };
  }

  // virtual:main.ts
  var MeyerGame = class {
    players = [];
    init(players) {
      gameState.init(players.map((player) => player.submissionId));
      this.players = players;
    }
    // TODO: Investigate how to handle different types of games, and how to control a game iteration. Some games are single player games and should be run until completion, while others are multiplayer games and should be run in turns.
    executePlayerTurn() {
      const playerIndex = gameState.getCurrentPlayerIndex();
      const api = createStrategyAPI(playerIndex);       
      this.players[playerIndex].strategy(api);
      if (!gameState.hasPlayerRolled()) {
        throw new PlayerError("You must roll before you can end your turn.");
      }
      const value = gameState.getPreviousActions()[0].announcedValue;
      const prevValue = gameState.getPreviousActions()[1]?.announcedValue || 0;
      if (value <= prevValue) {
        throw new PlayerError("You must announce a higher value than the previous player.");
      }
      gameState.prepareNextPlayer();
    }
    getResults() {
      return gameState.getResults();
    }
  };
})();
`

export default stringBundle