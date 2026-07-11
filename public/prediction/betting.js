function americanOdds(probability) {
  return probability >= 0.5
    ? `-${Math.round((probability / (1 - probability)) * 100)}`
    : `+${Math.round(((1 - probability) / probability) * 100)}`;
}

export function calculateBettingLines(stats, vigTotal = 1.10) {
  const kfWinRate = 1 - stats.jfWinRate;
  const candidateLow = Math.floor(stats.avgGames) - 0.5;
  const candidateHigh = Math.floor(stats.avgGames) + 0.5;
  const pOverLow = stats.gameTotals.filter(total => total > candidateLow).length / (stats.gameTotals.length || 1);
  const ouLine = (pOverLow >= 0.5 ? candidateLow : candidateHigh).toFixed(1);
  const pOver = stats.gameTotals.length
    ? stats.gameTotals.filter(total => total > Number(ouLine)).length / stats.gameTotals.length
    : 0.55;

  return {
    jfML: americanOdds(stats.jfWinRate * vigTotal),
    kfML: americanOdds(kfWinRate * vigTotal),
    ouLine,
    ouOverOdds: americanOdds(pOver * vigTotal),
    ouUnderOdds: americanOdds((1 - pOver) * vigTotal),
    jfConfidence: Math.round(stats.jfWinRate * 100),
    kfConfidence: 100 - Math.round(stats.jfWinRate * 100),
    vigTotal
  };
}

export function normalizeBettingLines(text, lines) {
  return text
    .replace(/JF\s+moneyline\s*\([^)]*\)/gi, `JF moneyline (${lines.jfML})`)
    .replace(/KF\s+moneyline\s*\([^)]*\)/gi, `KF moneyline (${lines.kfML})`)
    .replace(/OVER\s+[\d.]+\s*\([^)]*\)/gi, `OVER ${lines.ouLine} (${lines.ouOverOdds})`)
    .replace(/UNDER\s+[\d.]+\s*\([^)]*\)/gi, `UNDER ${lines.ouLine} (${lines.ouUnderOdds})`);
}
