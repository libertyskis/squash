export function calculatePredictionStats(matches, allContests = [], formStats = {}) {
  const last20 = matches.slice(-20);
  const last6 = last20.slice(-6);
  const last6All = allContests.slice(-6);
  const jfWins = last20.filter(match => match.winner === 'JF').length;
  const kfWins = last20.filter(match => match.winner === 'KF').length;
  const gameTotals = last20
    .filter(match => match.bestJF !== null && match.bestKF !== null)
    .map(match => match.bestJF + match.bestKF);

  return {
    last20,
    last6,
    jfWins,
    kfWins,
    jfWinRate: last20.length ? jfWins / last20.length : 0,
    last6JF: last6.filter(match => match.winner === 'JF').length,
    last6KF: last6.filter(match => match.winner === 'KF').length,
    gameTotals,
    avgGames: gameTotals.length
      ? gameTotals.reduce((sum, games) => sum + games, 0) / gameTotals.length
      : 4,
    formStats,
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
