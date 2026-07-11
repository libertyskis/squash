export function calculatePredictionStats(matches, allContests = [], formStats = {}) {
  const last20 = matches.slice(-20);
  const last6 = last20.slice(-6);
  const last6All = allContests.slice(-6);
  const jfWins = last20.filter(match => match.winner === 'JF').length;
  const kfWins = last20.filter(match => match.winner === 'KF').length;
  const gameTotals = last20
    .filter(match => match.bestJF !== null && match.bestKF !== null)
    .map(match => match.bestJF + match.bestKF);
  const last6GameTotals = last6
    .filter(match => match.bestJF !== null && match.bestKF !== null)
    .map(match => match.bestJF + match.bestKF);
  const validLast6 = last6.filter(match => match.winner === 'JF' || match.winner === 'KF');
  const decidedMatches = jfWins + kfWins;
  const jfWinRate = decidedMatches ? jfWins / decidedMatches : 0.5;
  const jfRecentWinRate = validLast6.length
    ? validLast6.filter(match => match.winner === 'JF').length / validLast6.length
    : jfWinRate;
  // Mild Bayesian smoothing prevents small samples and short streaks from
  // producing unrealistically extreme probabilities.
  const smoothedOverallRate = (jfWins + 2) / (decidedMatches + 4);
  const recentJfWins = validLast6.filter(match => match.winner === 'JF').length;
  const smoothedRecentRate = (recentJfWins + 1) / (validLast6.length + 2);
  const jfWinProbability = (smoothedOverallRate * 0.65) + (smoothedRecentRate * 0.35);
  const favorite = jfWinProbability >= 0.5 ? 'JF' : 'KF';
  const favoriteWins = last20.filter(match => match.winner === favorite);
  const averageLoserGames = favoriteWins.length
    ? favoriteWins.reduce((sum, match) => sum + (favorite === 'JF' ? match.bestKF : match.bestJF), 0) / favoriteWins.length
    : 1;
  const predictedScore = `${favorite} 3-${Math.max(0, Math.min(2, Math.round(averageLoserGames)))}`;
  const recentFavorite = jfRecentWinRate >= 0.5 ? 'JF' : 'KF';
  const momentumDelta = jfRecentWinRate - jfWinRate;
  const momentum = Math.abs(momentumDelta) < 0.08
    ? { player: 'EVEN', arrow: '→', label: 'steady', score: 50 }
    : {
        player: momentumDelta > 0 ? 'JF' : 'KF',
        arrow: '↑',
        label: momentumDelta > 0 ? 'JF gaining' : 'KF gaining',
        score: Math.min(100, Math.round(50 + Math.abs(momentumDelta) * 100))
      };
  const sampleScore = Math.min(20, last20.length) / 20 * 25;
  const edgeScore = Math.min(25, Math.abs(jfWinProbability - 0.5) * 100);
  const agreementScore = favorite === recentFavorite ? 15 : 0;
  const confidenceScore = Math.round(Math.min(95, 35 + sampleScore + edgeScore + agreementScore));
  const fiveGameMatches = gameTotals.filter(total => total === 5).length;
  const injuryNotes = last20.filter(match => /injur|hurt|fracture|ankle|knee|wrist|shoulder|strain|sprain|recover/i.test(match.notes || ''));
  const fadeReasons = [];
  if (favorite !== recentFavorite) fadeReasons.push('Recent form and the longer-term favorite disagree.');
  if (Math.max(jfWinProbability, 1 - jfWinProbability) < 0.62) fadeReasons.push('The projected win-probability edge is modest.');
  if (fiveGameMatches >= Math.ceil(gameTotals.length * 0.3)) fadeReasons.push(`${fiveGameMatches} of ${gameTotals.length} recent matches reached five games, signaling volatility.`);
  if (injuryNotes.length) fadeReasons.push('Recent notes mention injury or recovery context that historical scores may not capture.');
  if (last20.length < 20) fadeReasons.push(`Only ${last20.length} head-to-head matches are available.`);
  fadeReasons.push('These are model-generated prices, not independent sportsbook market odds.');

  return {
    last20,
    last6,
    jfWins,
    kfWins,
    decidedMatches,
    jfWinRate,
    jfRecentWinRate,
    jfWinProbability,
    kfWinProbability: 1 - jfWinProbability,
    last6JF: last6.filter(match => match.winner === 'JF').length,
    last6KF: last6.filter(match => match.winner === 'KF').length,
    gameTotals,
    last6GameTotals,
    avgGames: gameTotals.length
      ? gameTotals.reduce((sum, games) => sum + games, 0) / gameTotals.length
      : 4,
    formStats,
    favorite,
    predictedScore,
    momentum,
    confidenceScore,
    fadeReasons,
    matchSummary: last20.map((match, index) => {
      const notes = match.notes ? ` (${match.notes})` : '';
      return `${index + 1}. ${match.date}: JF ${match.bestJF} - KF ${match.bestKF}, winner: ${match.winner || 'no result'}${notes}`;
    }).join('\n'),
    last6Summary: last6.map((match, index) =>
      `${index + 1}. ${match.date}: ${match.bestJF}-${match.bestKF}, winner: ${match.winner || 'none'}`
    ).join('\n'),
    formSummary: last6All.length ? last6All.map(contest => {
      const total = contest.winJF + contest.winKF + contest.winAG;
      return `${contest.date}: JF ${contest.winJF}-${total - contest.winJF} (${contest.gamesJF} games)`;
    }).join('\n') : 'No recent session data'
  };
}
