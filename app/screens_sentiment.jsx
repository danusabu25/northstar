/* Northstar — Sentiment & feedback engine (Phase 2). */

// stroke "mood" face — 1 (sad) … 5 (delighted). Iconography, not emoji.
function MoodFace({ level, size = 30, active }) {
  // mouth curve control point: negative = frown, positive = smile
  const curve = [-5, -2.5, 0, 3, 6][level - 1];
  const my = 16;
  const d = `M8 ${my} Q12 ${my + curve} 16 ${my}`;
  const tones = ["var(--rc-red-500)", "var(--rc-amber-500)", "var(--rc-gray-500)", "var(--rc-green-500)", "var(--rc-green-600)"];
  const c = active ? tones[level - 1] : "var(--rc-gray-400)";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round">
      <circle cx="12" cy="12" r="9.2" />
      <circle cx="9" cy="10" r="0.5" fill={c} stroke={c} />
      <circle cx="15" cy="10" r="0.5" fill={c} stroke={c} />
      <path d={d} />
    </svg>
  );
}

function SentimentScreen() {
  const FANS = window.NS.FANS;
  const declining = FANS.filter((f) => f.sentTrend === "down");
  const venueTrend = [7.9, 8.1, 7.6, 7.8, 7.4, 7.0, 6.8, 7.1];

  const signals = [
    { name: "Post-tap rating (1–5)", type: "Explicit", weight: "High", note: "3-second micro-survey after payment", icon: "star" },
    { name: "Spend below personal baseline", type: "Implicit", weight: "Medium", note: "Spent less than their typical game", icon: "trendDown" },
    { name: "Early departure", type: "Implicit", weight: "Medium", note: "No 4th-quarter tap", icon: "clock" },
    { name: "Visit-frequency drop", type: "Implicit", weight: "Medium", note: "Fewer games vs same period last year", icon: "activity" },
    { name: "Queue proxy", type: "Implicit", weight: "Low", note: "Longer gap between taps at a stand", icon: "users" },
    { name: "Survey no-response", type: "Implicit", weight: "Low", note: "Too busy or disengaged to respond", icon: "x" },
  ];

  const actions = [
    { trigger: "Rating ≤ 2 at terminal", action: "Recovery credit to next transaction", timing: "During game", tone: "danger" },
    { trigger: "Spend < 50% of baseline", action: "Post-game re-engagement SMS", timing: "Within 24h", tone: "warning" },
    { trigger: "Two consecutive low-score games", action: "Flag to ticket-sales dashboard", timing: "Immediate", tone: "warning" },
    { trigger: "Decline + renewal < 60 days", action: "Priority flag + suggested outreach", timing: "Immediate", tone: "danger" },
    { trigger: "Venue-wide score drop", action: "Alert to operations manager", timing: "During game", tone: "info" },
  ];

  return (
    <div>
      <PageHead
        eyebrow="Fan intelligence · Phase 2"
        title="Sentiment & feedback"
        desc="Per-game experience scores from explicit micro-surveys and implicit behavioral signals — triggering in-game recovery, re-engagement, and pre-renewal churn alerts."
        actions={<><button className="ns-btn ns-btn--secondary"><Icon name="sliders" size={14} />Configure thresholds</button></>}
      />

      <div className="ns-kpis" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 14 }}>
        <Kpi icon="gauge" label="Venue sentiment" value="7.1" delta="−0.3 vs Game 13" dir="down" hint="weighted 1–10" />
        <Kpi icon="message" label="Survey response rate" value="31%" delta="+2pp" dir="up" hint="shown 1-in-3 taps" />
        <Kpi icon="zap" label="Recovery credits" value="48" delta="auto-issued tonight" dir="flat" />
        <Kpi icon="flag" label="Flagged for outreach" value={String(declining.length * 21)} delta="declining trend" dir="flat" />
      </div>

      <div className="ns-grid" style={{ gridTemplateColumns: "1.6fr 1fr", marginBottom: 14 }}>
        <div className="ns-card">
          <div className="ns-card__head"><div className="ns-card__title">Venue-wide sentiment</div><span className="ns-muted" style={{ fontSize: 11 }}>Games 7–14 · post-game scored</span></div>
          <div className="ns-card__body">
            <BarChart data={venueTrend.map((v, i) => ({ t: "G" + (7 + i), v }))} valueKey="v" labelKey="t" height={216} />
          </div>
        </div>

        {/* micro-survey terminal preview */}
        <div className="ns-card">
          <div className="ns-card__head"><div className="ns-card__title">Terminal micro-survey</div><Badge tone="neutral">1-in-3 taps</Badge></div>
          <div className="ns-card__body" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{ width: "100%", maxWidth: 280, background: "var(--ns-navy)", borderRadius: 12, padding: "22px 20px", color: "#fff", textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 18 }}>How was your experience?</div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 4, marginBottom: 8 }}>
                {[1, 2, 3, 4, 5].map((l) => (
                  <div key={l} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                    <MoodFace level={l} size={34} active={l === 4} />
                    <span className="ns-mono" style={{ fontSize: 10, color: l === 4 ? "#fff" : "rgba(255,255,255,0.5)" }}>{l}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14, fontSize: 11, color: "rgba(255,255,255,0.55)" }}>Skip</div>
            </div>
            <div className="ns-muted" style={{ fontSize: 11, textAlign: "center", lineHeight: 1.5 }}>Never shown at the primary register during tip-off or halftime rush.</div>
          </div>
        </div>
      </div>

      <div className="ns-grid" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: 14 }}>
        <div className="ns-card">
          <div className="ns-card__head"><div className="ns-card__title">Signal types</div></div>
          <div className="ns-card__body" style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 14 }}>
            {signals.map((s) => (
              <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <span style={{ width: 30, height: 30, borderRadius: 7, background: s.type === "Explicit" ? "var(--rc-blue-100)" : "var(--rc-gray-100)", color: s.type === "Explicit" ? "var(--rc-blue-600)" : "var(--color-text-secondary)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name={s.icon} size={15} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "var(--rc-gray-900)" }}>{s.name}</div>
                  <div className="ns-muted" style={{ fontSize: 10.5 }}>{s.note}</div>
                </div>
                <Badge tone={s.type === "Explicit" ? "info" : "neutral"}>{s.type}</Badge>
                <span className="ns-muted ns-mono" style={{ fontSize: 10.5, minWidth: 52, textAlign: "right" }}>{s.weight} wt</span>
              </div>
            ))}
          </div>
        </div>

        <div className="ns-card">
          <div className="ns-card__head"><div className="ns-card__title">Triggered actions</div></div>
          <div className="ns-card__body" style={{ paddingTop: 6, paddingBottom: 6 }}>
            {actions.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "11px 0", borderBottom: i < actions.length - 1 ? "1px solid var(--color-border-default)" : "none" }}>
                <span style={{ marginTop: 2 }}><Badge tone={a.tone}><Icon name="bolt" size={11} /></Badge></span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "var(--rc-gray-900)" }}>{a.action}</div>
                  <div className="ns-muted" style={{ fontSize: 11, marginTop: 2 }}>When: {a.trigger}</div>
                </div>
                <span className="ns-muted ns-mono" style={{ fontSize: 10.5, whiteSpace: "nowrap" }}>{a.timing}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ns-card">
        <div className="ns-card__head"><div className="ns-card__title">Declining sentiment — flagged fans</div><span className="ns-muted" style={{ fontSize: 11 }}>Two-game weighted decline</span></div>
        <div className="ns-table-wrap">
          <table className="ns-table">
            <thead><tr><th>Fan</th><th>Membership</th><th>Trend</th><th className="ns-num">Latest score</th><th>History</th><th>Suggested action</th><th></th></tr></thead>
            <tbody>
              {declining.map((f) => {
                const realIdx = FANS.findIndex((x) => x.id === f.id);
                const latest = [...f.sentiment].reverse().find((s) => s != null);
                return (
                  <tr key={f.id} className="is-clickable" onClick={() => window.nsOpenFan(f.id)}>
                    <td><div className="ns-cell-fan"><Avatar name={f.name} seed={realIdx} /><div><div className="ns-cell-fan__name">{f.name}</div><div className="ns-cell-fan__sub">#{f.id}</div></div></div></td>
                    <td style={{ fontSize: 12 }}>{f.sth || <span className="ns-muted">Non-STH</span>}</td>
                    <td><SentTag trend="down" /></td>
                    <td className="ns-num ns-mono" style={{ color: latest >= 5 ? "var(--rc-amber-600)" : "var(--rc-red-600)", fontWeight: 600 }}>{latest != null ? latest.toFixed(1) : "—"}</td>
                    <td><SentLine data={f.sentiment} w={120} h={34} /></td>
                    <td><span className="ns-muted" style={{ fontSize: 11 }}>{f.renewal ? "Priority outreach + credit" : "Re-engagement SMS"}</span></td>
                    <td><button className="ns-btn ns-btn--ghost ns-btn--sm" onClick={(e) => { e.stopPropagation(); window.nsNewCampaign({ memberships: ["platinum", "gold_full", "gold_half", "silver_plan"], conditions: [{ dim: "sentiment", val: "declining" }] }); }}>Act</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
window.SentimentScreen = SentimentScreen;
