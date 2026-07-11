function americanOdds(probability) {
  return probability >= 0.5
    ? `-${Math.round((probability / (1 - probability)) * 100)}`
    : `+${Math.round(((1 - probability) / probability) * 100)}`;
}

function addVig(probability, vigTotal) {
  return Math.max(0.01, Math.min(0.99, probability + (vigTotal - 1) / 2));
}

function impliedProbability(odds) {
  const value = Number(odds);
  return value < 0 ? Math.abs(value) / (Math.abs(value) + 100) : 100 / (value + 100);
}

export function calculateBettingLines(stats, vigTotal = 1.10) {
  const candidateLow = Math.floor(stats.avgGames) - 0.5;
  const candidateHigh = Math.floor(stats.avgGames) + 0.5;
  const pOverLow = stats.gameTotals.filter(total => total > candidateLow).length / (stats.gameTotals.length || 1);
  const ouLine = (pOverLow >= 0.5 ? candidateLow : candidateHigh).toFixed(1);
  const pOver = stats.gameTotals.length
    ? stats.gameTotals.filter(total => total > Number(ouLine)).length / stats.gameTotals.length
    : 0.55;
  const pUnder = 1 - pOver;
  const jfML = americanOdds(addVig(stats.jfWinProbability, vigTotal));
  const kfML = americanOdds(addVig(stats.kfWinProbability, vigTotal));
  const ouOverOdds = americanOdds(addVig(pOver, vigTotal));
  const ouUnderOdds = americanOdds(addVig(pUnder, vigTotal));
  const last6OverHits = stats.last6GameTotals.filter(total => total > Number(ouLine)).length;

  return {
    jfML,
    kfML,
    ouLine,
    ouOverOdds,
    ouUnderOdds,
    jfConfidence: Math.round(stats.jfWinProbability * 100),
    kfConfidence: Math.round(stats.kfWinProbability * 100),
    favorite: stats.favorite,
    favoriteLine: stats.favorite === 'JF' ? jfML : kfML,
    jfImpliedProbability: impliedProbability(jfML),
    kfImpliedProbability: impliedProbability(kfML),
    pOver,
    pUnder,
    overHits: stats.gameTotals.filter(total => total > Number(ouLine)).length,
    underHits: stats.gameTotals.filter(total => total < Number(ouLine)).length,
    last6OverHits,
    last6UnderHits: stats.last6GameTotals.length - last6OverHits,
    vigTotal
  };
}
