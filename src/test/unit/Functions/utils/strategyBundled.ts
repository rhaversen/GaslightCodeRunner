/* eslint-disable local/enforce-comment-order */
const stringBundle =
    `
(() => {
  // virtual:main.ts
  var main = (api) => {
    if (api.isFirstInRound()) {
      api.roll();
      return;
    }
    const lastScore = api.getPreviousAction();
    const currentScore = api.roll();
    if (currentScore >= lastScore) {
      return;
    }
    if (Math.random() > 0.5) {
      api.lie(api.roundUpToValidScore(lastScore + 1));  
    } else {
      api.detEllerDerover();
    }
  };
  var main_default = main;
})();
`

export default stringBundle