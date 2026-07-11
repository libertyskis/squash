import { calculatePredictionStats } from './stats.js';
import { calculateBettingLines, normalizeBettingLines } from './betting.js';
import { buildPredictionPrompt } from './prompt.js';
import { renderNoData, renderPrediction, renderPredictionError, renderPredictionLoading } from './render.js';

const RESET_LABEL = '⚡ Generate';

async function requestPrediction(prompt, matchCount, out) {
  let response;
  let data;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const message = attempt > 1 ? `Retry ${attempt - 1}...` : `Analyzing ${matchCount} matches...`;
    renderPredictionLoading(out, message);
    response = await fetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    data = await response.json();
    const overloaded = data.error?.type === 'overloaded_error' ||
      (typeof data.error === 'string' && data.error.toLowerCase().includes('overload'));
    if (overloaded && attempt < 3) {
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
      continue;
    }
    break;
  }
  if (!response.ok || data.error) throw new Error(data.error?.message || data.error || `HTTP ${response.status}`);
  if (!data.content || !Array.isArray(data.content)) {
    throw new Error(`Unexpected response: ${JSON.stringify(data).substring(0, 200)}`);
  }
  return data.content.map(block => block.text || '').join('');
}

export async function generatePrediction() {
  const button = document.getElementById('predict-btn');
  const out = document.getElementById('prediction-output');
  button.disabled = true;
  button.textContent = '...thinking';

  try {
    const matches = window._matches || [];
    if (!matches.length) {
      renderNoData(out);
      return;
    }
    const stats = calculatePredictionStats(matches, window._allContests || [], window._jfFormStats || {});
    const lines = calculateBettingLines(stats);
    const prompt = buildPredictionPrompt(stats, lines);
    const responseText = await requestPrediction(prompt, stats.last20.length, out);
    renderPrediction(out, normalizeBettingLines(responseText, lines), stats, lines);
  } catch (error) {
    renderPredictionError(out, error.message);
  } finally {
    button.disabled = false;
    button.textContent = RESET_LABEL;
  }
}

window.generatePrediction = generatePrediction;
document.addEventListener('click', event => {
  if (event.target.closest('[data-action="regenerate-prediction"]')) generatePrediction();
});
