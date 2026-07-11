function percent(value) {
  return value === undefined ? 'N/A' : `${Math.round(value * 100)}%`;
}

function decimal(value) {
  return value === undefined ? 'N/A' : value.toFixed(1);
}

export function buildPredictionPrompt(stats, lines) {
  const form = stats.formStats;
  return `You are a professional sports betting analyst specializing in squash. Write today's match preview using the deterministic calculations below. Do not perform or revise any arithmetic; interpret the supplied figures and explain what they mean.

MODEL SNAPSHOT (calculated in JavaScript):
- Favorite: ${lines.favorite}
- Model line: ${lines.favorite} ${lines.favoriteLine}
- Win probability: JF ${lines.jfConfidence}% | KF ${lines.kfConfidence}%
- Model-price implied probability after vig: JF ${percent(lines.jfImpliedProbability)} | KF ${percent(lines.kfImpliedProbability)}
- Predicted score: ${stats.predictedScore}
- Model confidence: ${stats.confidenceScore}/100
- Momentum: ${stats.momentum.arrow} ${stats.momentum.label} (${stats.momentum.score}/100)
- Last 6 match lengths: ${stats.last6GameTotals.join(', ') || 'N/A'}
- OVER ${lines.ouLine}: ${lines.overHits}-${lines.underHits} over the last ${stats.gameTotals.length}
- Last 6 OVER ${lines.ouLine}: ${lines.last6OverHits}-${lines.last6UnderHits}
- Fair total probability: OVER ${percent(lines.pOver)} | UNDER ${percent(lines.pUnder)}

MATCH HISTORY (oldest to most recent):
${stats.matchSummary}

LAST 6 MATCHES (use these exact results — do not deviate):
${stats.last6Summary}
JF won ${stats.last6JF} of the last 6, KF won ${stats.last6KF}.

JF RECENT FORM (last 6 sessions, ALL opponents):
${stats.formSummary}
JF win rate last 6 sessions: ${percent(form.jfWinRateLast6)} vs prior 6: ${percent(form.jfWinRatePrior6)}
Games/session last 6: ${decimal(form.avgGamesLast6)} vs season avg: ${decimal(form.avgGamesAll)}
Form trend: ${form.trend || 'N/A'}

OVERALL: Across ${stats.decidedMatches} decided matches in the sample, JF has won ${stats.jfWins} (${Math.round(stats.jfWinRate * 100)}%) and KF has won ${stats.kfWins} (${Math.round((1 - stats.jfWinRate) * 100)}%).

BETTING LINES (already calculated — do NOT recalculate or change these numbers):
- JF moneyline: ${lines.jfML} | KF moneyline: ${lines.kfML}
- Total games O/U: ${lines.ouLine} | OVER pays ${lines.ouOverOdds} | UNDER pays ${lines.ouUnderOdds}
- Games in a match can only be 3, 4, or 5 (best of 5 format)

Provide a concise analysis:
1. Current form (last 6 matches)
2. Key patterns and trends
3. Physical/contextual factors from the notes
4. Why the predicted score and favorite make sense

Then end with exactly this betting card format — evaluate all 4 bets and rank them:

BETTING CARD:
🥇 BEST BET: [bet name] ([odds]) — [one sentence why]
🥈 SECOND BEST: [bet name] ([odds]) — [one sentence why]
🥉 THIRD BET: [bet name] ([odds]) — [one sentence why]
❌ WORST BET: [bet name] ([odds]) — [one sentence why]

The 4 bets to rank are:
- JF moneyline (${lines.jfML})
- KF moneyline (${lines.kfML})
- OVER ${lines.ouLine} (${lines.ouOverOdds})
- UNDER ${lines.ouLine} (${lines.ouUnderOdds})

Treat the supplied calculations as fixed model outputs. Explain them; do not invent new statistics, odds, or sample sizes. These are model prices rather than external sportsbook quotes. Max 300 words.`;
}
