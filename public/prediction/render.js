export function renderPredictionLoading(out, message) {
  out.innerHTML = `<div style="display:flex;align-items:center;gap:10px;font-size:12px;color:var(--muted)"><div class="spinner"></div>${message}</div>`;
}

export function renderPredictionError(out, message) {
  out.innerHTML = `<div style="font-size:12px;color:#E8593C">Error: ${message}</div>`;
}

export function renderNoData(out) {
  out.innerHTML = '<div style="font-size:12px;color:var(--muted)">No match data loaded yet — refresh the page first.</div>';
}

export function renderBettingCard(text) {
  try {
    const cardIndex = text.toUpperCase().indexOf('BETTING CARD');
    if (cardIndex === -1) return '';
    const cardText = text.substring(cardIndex);
    const ranks = [
      { label: 'Best bet', color: '#E8A020' },
      { label: 'Second bet', color: '#8899AA' },
      { label: 'Third bet', color: '#CD7F32' },
      { label: 'Worst bet', color: '#884444' }
    ];
    const lines = cardText.split('\n').filter(line => line.trim());
    const cards = lines.slice(1).filter(line => /BEST|SECOND|THIRD|WORST/i.test(line)).slice(0, 4);
    if (!cards.length) {
      return `<div style="font-size:12px;color:rgba(240,237,232,0.75);line-height:1.8;white-space:pre-wrap">${cardText}</div>`;
    }
    return '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:16px">' +
      cards.map((line, index) => {
        const rank = ranks[index] || ranks[3];
        const clean = line.replace(/\*+/g, '').replace(/BEST BET:|SECOND BET:|SECOND BEST:|THIRD BET:|WORST BET:/gi, '').trim();
        const parts = clean.split(/\s+\u2014\s+|\s+-\s+/);
        return '<div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:8px;padding:12px">' +
          `<div style="font-size:10px;color:${rank.color};text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px">${rank.label}</div>` +
          `<div style="font-size:13px;font-weight:500;color:#f0ede8;margin-bottom:4px">${(parts[0] || '').trim()}</div>` +
          `<div style="font-size:11px;color:rgba(240,237,232,0.45);line-height:1.5">${(parts[1] || '').trim()}</div>` +
          '</div>';
      }).join('') + '</div>';
  } catch (error) {
    console.error('renderBettingCard error:', error);
    return '';
  }
}

export function renderPrediction(out, text, stats, lines) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const analysis = text.split('BETTING CARD:')[0].split('BETTING CARD')[0];
  out.innerHTML = `
    <div style="width:100%">
      <div style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:12px">${today}</div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
        <div style="font-size:10px;color:var(--jf);text-transform:uppercase;letter-spacing:0.08em;width:20px">JF</div>
        <div style="flex:1;height:8px;background:rgba(255,255,255,0.06);border-radius:4px;overflow:hidden;display:flex">
          <div style="width:${lines.jfConfidence}%;background:var(--jf);border-radius:4px 0 0 4px"></div>
          <div style="width:${lines.kfConfidence}%;background:var(--kf);border-radius:0 4px 4px 0"></div>
        </div>
        <div style="font-size:10px;color:var(--kf);text-transform:uppercase;letter-spacing:0.08em;width:20px;text-align:right">KF</div>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:16px;font-size:13px;font-family:var(--display);font-weight:800">
        <span style="color:var(--jf)">${lines.jfConfidence}%</span><span style="color:var(--kf)">${lines.kfConfidence}%</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:20px">
        <div style="background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:8px;padding:12px;text-align:center">
          <div style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px">JF moneyline</div>
          <div style="font-family:var(--display);font-size:22px;font-weight:800;color:var(--jf)">${lines.jfML}</div>
        </div>
        <div style="background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:8px;padding:12px;text-align:center">
          <div style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px">Total games O/U</div>
          <div style="font-family:var(--display);font-size:22px;font-weight:800;color:var(--text)">${lines.ouLine}</div>
          <div style="font-size:10px;color:var(--muted);margin-top:4px">Over ${lines.ouOverOdds} / Under ${lines.ouUnderOdds}</div>
        </div>
        <div style="background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:8px;padding:12px;text-align:center">
          <div style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px">KF moneyline</div>
          <div style="font-family:var(--display);font-size:22px;font-weight:800;color:var(--kf)">${lines.kfML}</div>
        </div>
      </div>
      <div style="font-size:12px;color:rgba(240,237,232,0.75);line-height:1.8;white-space:pre-wrap">${analysis}</div>
      ${renderBettingCard(text)}
      <div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:10px;color:var(--muted)">Based on last ${stats.last20.length} H2H · 10% vig · O/U from avg ${stats.avgGames.toFixed(1)} games</span>
        <button data-action="regenerate-prediction" style="padding:4px 10px;background:transparent;border:1px solid var(--border);border-radius:4px;color:var(--muted);font-family:var(--mono);font-size:10px;cursor:pointer">↻ Regenerate</button>
      </div>
    </div>`;
}
