const eloUtil = {};

eloUtil.ratingChange = function(elo, opponentElo, score, opponentScore){
  const result = this.scoreToResult(score, opponentScore);
  const winChance = 1 / (1 + (10 ** ((opponentElo - elo) / 400)));
  return Math.round(32 * (result - winChance));
};

eloUtil.scoreToResult = function(first, second){
  if (first === second) {
    return 0.5;
  }

  return first > second ? 1 : 0;
};

module.exports = eloUtil;
