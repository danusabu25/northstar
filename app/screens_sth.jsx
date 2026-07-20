/* Northstar — Season-ticket-holder health. */
function STHScreen() {
  const S = window.NS.STH;
  const SEASON = window.NS.SEASON;
  const FANS = window.NS.FANS;
  const atRisk = FANS.filter((f) => f.sth && f.flags.some((x) => /risk|declining|low benefit/i.test(x)));

  const toneColor = { green: "var(--rc-green-500)", amber: "var(--rc-amber-500)", red: "var(--rc-red-500)" };

  return (
    <div>
      <PageHead
        eyebrow="Fan intelligence"
        title="STH health"
        desc="Engagement and churn risk across 2,741 season-ticket holders — measured against verified attendance and benefit usage, not surveys."
        actions={<>
          <button className="ns-btn ns-btn--secondary"><Icon name="download" size={14} />Export at-risk list</button>
          <button className="ns-btn ns-btn--primary" onClick={() => window.nsNewCampaign({ memberships: ["platinum", "gold_full", "gold_half", "silver_plan"], conditions: [{ dim: "sentiment", val: "declining" }, { dim: "recency_not_last", val: 3 }] })}><Icon name="message" size={14} />Campaign for at-risk</button>
        </>}
      />

      {/* Engagement bands */}
      <div className="ns-card" style={{ marginBottom: 14 }}>
        <div className="ns-card__head">
          <div className="ns-card__title">Engagement bands</div>
          <span className="ns-muted" style={{ fontSize: 11 }}>{window.NS.fmtNum(S.total)} season-ticket holders</span>
        </div>
        <div className="ns-card__body">
          {/* stacked bar */}
          <div style={{ display: "flex", height: 12, borderRadius: 999, overflow: "hidden", marginBottom: 18 }}>
            {S.buckets.map((b) => <div key={b.key} style={{ width: b.pct + "%", background: toneColor[b.tone] }} title={`${b.label} · ${b.pct}%`} />)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {S.buckets.map((b) => (
              <div key={b.key} style={{ borderLeft: `3px solid ${toneColor[b.tone]}`, paddingLeft: 12 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span className="ns-mono" style={{ fontSize: 24, fontWeight: 600, color: "var(--rc-gray-900)", letterSpacing: "-0.02em" }}>{window.NS.fmtNum(b.count)}</span>
                  <span className="ns-mono ns-muted" style={{ fontSize: 12 }}>{b.pct}%</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--rc-gray-900)", marginTop: 4 }}>{b.label}</div>
                <div className="ns-muted" style={{ fontSize: 10.5, marginTop: 3, lineHeight: 1.4 }}>{b.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* At-risk table */}
      <div className="ns-card" style={{ marginBottom: 14 }}>
        <div className="ns-card__head">
          <div>
            <div className="ns-card__title">Flagged for outreach</div>
            <div className="ns-card__sub">Acting before the renewal window — not at it</div>
          </div>
          <Badge tone="danger"><Icon name="flag" size={11} />{atRisk.length} priority fans</Badge>
        </div>
        <div className="ns-table-wrap">
          <table className="ns-table">
            <thead>
              <tr>
                <th>Fan</th><th>Membership</th><th className="ns-num">Games</th><th className="ns-num">vs last season</th>
                <th>Benefit use</th><th>Sentiment</th><th>Renewal</th><th>Why flagged</th><th></th>
              </tr>
            </thead>
            <tbody>
              {atRisk.map((f, i) => {
                const realIdx = FANS.findIndex((x) => x.id === f.id);
                return (
                  <tr key={f.id} className="is-clickable" onClick={() => window.nsOpenFan(f.id)}>
                    <td><div className="ns-cell-fan"><Avatar name={f.name} seed={realIdx} /><div><div className="ns-cell-fan__name">{f.name}</div><div className="ns-cell-fan__sub">#{f.id}</div></div></div></td>
                    <td style={{ fontSize: 12 }}>{f.sth}</td>
                    <td className="ns-num ns-mono">{f.seasonGames}</td>
                    <td className="ns-num"><Delta dir="down">−{Math.max(2, 12 - f.seasonGames)} games</Delta></td>
                    <td style={{ minWidth: 110 }}>{f.benefitOf ? <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 50 }}><Progress pct={(f.benefitGames / f.benefitOf) * 100} tone="red" /></div><span className="ns-mono ns-muted" style={{ fontSize: 11 }}>{Math.round((f.benefitGames / f.benefitOf) * 100)}%</span></div> : <span className="ns-muted">n/a</span>}</td>
                    <td><SentTag trend={f.sentTrend} /></td>
                    <td className="ns-mono" style={{ fontSize: 11.5, color: "var(--rc-red-600)" }}>{f.renewal}</td>
                    <td style={{ maxWidth: 200 }}><span className="ns-muted" style={{ fontSize: 11 }}>{f.flags[0]}</span></td>
                    <td><button className="ns-btn ns-btn--ghost ns-btn--sm" onClick={(e) => { e.stopPropagation(); window.nsNewCampaign({ memberships: ["platinum", "gold_full", "gold_half", "silver_plan"], conditions: [{ dim: "sentiment", val: "declining" }] }); }}>Reach out</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Season-over-season */}
      <div className="ns-grid" style={{ gridTemplateColumns: "1.3fr 1fr" }}>
        <div className="ns-card">
          <div className="ns-card__head"><div className="ns-card__title">Per-cap spend — this season vs last</div><span className="ns-muted" style={{ fontSize: 11 }}>Games 1–14</span></div>
          <div className="ns-table-wrap">
            <table className="ns-table">
              <thead><tr><th>Segment</th><th className="ns-num">This season</th><th className="ns-num">Last season</th><th className="ns-num">Delta</th></tr></thead>
              <tbody>
                {SEASON.perCap.map((r) => (
                  <tr key={r.seg}>
                    <td className="ns-strong">{r.seg}</td>
                    <td className="ns-num ns-mono ns-strong">{window.NS.fmtMoney(r.now, 2)}</td>
                    <td className="ns-num ns-mono ns-muted">{window.NS.fmtMoney(r.prev, 2)}</td>
                    <td className="ns-num"><Delta dir={r.dir}>{r.delta > 0 ? "+" : ""}{window.NS.fmtMoney(Math.abs(r.delta), 2)}</Delta></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="ns-card">
          <div className="ns-card__head"><div className="ns-card__title">F&amp;B category mix</div></div>
          <div className="ns-card__body" style={{ display: "flex", flexDirection: "column", gap: 13, paddingTop: 14 }}>
            {SEASON.category.map((c) => (
              <div key={c.cat}>
                <div className="ns-spread" style={{ marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: "var(--rc-gray-900)", fontWeight: 500 }}>{c.cat}</span>
                  <span style={{ display: "flex", gap: 10, alignItems: "baseline" }}><span className="ns-mono ns-strong" style={{ fontSize: 12.5 }}>${c.value.toFixed(2)}</span><span className="ns-mono ns-muted" style={{ fontSize: 11, minWidth: 32, textAlign: "right" }}>{c.pct}%</span></span>
                </div>
                <Progress pct={c.pct * 2.4} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
window.STHScreen = STHScreen;
