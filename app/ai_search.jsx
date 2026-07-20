/* Northstar — AI search command palette. Natural-language → segment, fans, insights, actions. */

const NS_SUGGESTED = [
  "Gold STHs who haven't attended in 3 games",
  "Non-STH fans spending over $40 a game",
  "Fans with declining sentiment near renewal",
  "High-value lapsing fans to win back",
  "Who isn't using their Gold benefit?",
];

function parseQuery(qRaw) {
  const q = qRaw.toLowerCase();
  const has = (...ws) => ws.some((w) => q.includes(w));
  const memberships = [];
  const conditions = [];
  const understanding = [];

  // membership
  if (has("platinum", "courtside", "club")) { memberships.push("platinum"); understanding.push("Platinum members"); }
  if (has("gold")) { memberships.push("gold_full", "gold_half"); understanding.push("Gold STH"); }
  if (has("non-sth", "non sth", "nonsth", "occasional", "single-game", "single game", "casual")) { memberships.push("nonsth_regular", "nonsth_occasional"); understanding.push("non-STH fans"); }
  if (has("new ") || q.startsWith("new")) { if (!memberships.includes("nonsth_occasional")) memberships.push("nonsth_occasional"); understanding.push("new visitors"); }
  if (has("sth", "season-ticket", "season ticket", "member") && memberships.length === 0) { memberships.push("platinum", "gold_full", "gold_half", "silver_plan"); understanding.push("season-ticket holders"); }

  // conditions
  const spendMatch = q.match(/(?:over|above|more than|>\s*|\$)\s*\$?(\d{2,3})/);
  if (has("spend", "spending", "$", "per-cap", "high-value", "high value") && spendMatch) { conditions.push({ dim: "spend_min", val: Math.min(80, Number(spendMatch[1])) }); understanding.push("avg spend ≥ $" + Math.min(80, Number(spendMatch[1]))); }
  else if (has("high-value", "high value", "big spender", "top spender")) { conditions.push({ dim: "spend_min", val: 45 }); understanding.push("avg spend ≥ $45"); }

  const missMatch = q.match(/(\d+)\s*(?:game|games)/);
  if (has("haven't", "havent", "not attended", "missed", "absent", "lapsing", "lapsed", "away", "gone quiet", "win back", "win-back")) {
    const n = missMatch ? Number(missMatch[1]) : 3;
    conditions.push({ dim: "recency_not_last", val: Math.min(8, n) }); understanding.push("not seen in " + Math.min(8, n) + " games");
  }
  if (has("declining", "unhappy", "negative", "at risk", "at-risk", "churn", "dissatisf")) { conditions.push({ dim: "sentiment", val: "declining" }); understanding.push("declining sentiment"); }
  if (has("renewal", "renew", "expiring")) { understanding.push("renewal approaching"); }
  if (has("benefit") && has("not", "isn't", "unused", "without", "haven't")) { conditions.push({ dim: "benefit_unused", val: true }); understanding.push("benefit unused"); }
  if (has("loyalty", "points") && has("top", "high", "5000", "5,000")) { conditions.push({ dim: "points_min", val: 5000 }); understanding.push("5,000+ loyalty points"); }

  const audience = { memberships, conditions };

  // matching sample fans from the 12 detailed profiles
  let fans = window.NS.FANS.filter((f) => {
    if (memberships.length) {
      const wantGold = memberships.includes("gold_full");
      const wantNon = memberships.includes("nonsth_regular");
      const wantPlat = memberships.includes("platinum");
      const isGoldSth = f.sth && /gold/i.test(f.sth);
      const isPlat = f.sth && /platinum/i.test(f.sth);
      const isNon = !f.sth;
      if (!((wantGold && isGoldSth) || (wantNon && isNon) || (wantPlat && isPlat) || (memberships.includes("silver_plan") && f.sth && /silver/i.test(f.sth)))) {
        // allow STH-general queries
        if (!(understanding.includes("season-ticket holders") && f.sth)) return false;
      }
    }
    for (const c of conditions) {
      if (c.dim === "spend_min" && f.avgSeason < c.val) return false;
      if (c.dim === "sentiment" && c.val === "declining" && f.sentTrend !== "down") return false;
      if (c.dim === "recency_not_last" && f.seasonGames > 9) return false;
      if (c.dim === "benefit_unused" && f.benefitOf > 0 && f.benefitGames / f.benefitOf > 0.4) return false;
      if (c.dim === "points_min" && f.points < c.val) return false;
    }
    return true;
  });
  if (understanding.includes("renewal approaching")) fans = fans.filter((f) => f.renewal);

  const est = window.NSEG.estimate(audience);

  // jump-to destinations
  const jumps = [];
  if (has("sponsor", "modelo", "activation", "attribution")) jumps.push(["sponsorship", "Sponsorship activation", "handshake"]);
  if (has("loyalty", "points", "redeem")) jumps.push(["loyalty", "Loyalty program", "trophy"]);
  if (has("sentiment", "feedback", "rating", "survey")) jumps.push(["sentiment", "Sentiment & feedback", "gauge"]);
  if (has("entitlement", "csv", "upload", "benefit tier")) jumps.push(["entitlements", "STH entitlements", "database"]);
  if (has("risk", "churn", "renewal", "health")) jumps.push(["sth", "STH health", "shield"]);
  if (has("game", "tonight", "live", "stand", "per-cap")) jumps.push(["gameday", "Game-day intelligence", "activity"]);

  // insight
  let insight = "";
  if (understanding.includes("declining sentiment")) insight = `${fans.length} of these fans show a two-game weighted decline. Pair a recovery credit with a personal outreach before the renewal window.`;
  else if (conditions.some((c) => c.dim === "recency_not_last")) insight = `These fans averaged fewer visits than the same point last season. A timed SMS with their unused benefit recovers ~22% historically.`;
  else if (conditions.some((c) => c.dim === "spend_min")) insight = `This is your highest-value tier by per-cap. ${est.nonSth > 0 ? "Many are non-STH — strong season-plan upsell targets." : "Protect them with priority benefits."}`;
  else if (memberships.includes("nonsth_occasional")) insight = `New and occasional fans are already profiled by PAR — convert them with a milestone offer before they lapse.`;
  else insight = `Northstar resolved this segment from verified payment behavior — no list upload required.`;

  return { understanding, audience, est, fans: fans.slice(0, 5), jumps, insight, raw: qRaw };
}

function AISearch({ onClose }) {
  const [q, setQ] = React.useState("");
  const inputRef = React.useRef(null);
  React.useEffect(() => { inputRef.current && inputRef.current.focus(); }, []);
  React.useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const r = q.trim().length > 2 ? parseQuery(q) : null;

  return (
    <div className="ns-cmd" role="dialog" aria-modal="true" aria-label="AI search">
      <div className="ns-cmd__scrim" onClick={onClose} />
      <div className="ns-cmd__panel">
        <div className="ns-cmd__input">
          <span className="ns-cmd__sparkle"><Icon name="sparkle" size={20} fill /></span>
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask anything — “Gold STHs who haven't attended in 3 games”" />
          <span className="ns-cmd__kbd">ESC</span>
        </div>

        {!r && (
          <div className="ns-cmd__hint">
            <div className="ns-cmd__grouplabel">Try asking</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {NS_SUGGESTED.map((s) => (
                <button key={s} className="ns-cmd__item" onClick={() => setQ(s)}>
                  <span className="ns-cmd__ico" style={{ background: "var(--rc-blue-100)", color: "var(--rc-blue-600)" }}><Icon name="sparkle" size={15} /></span>
                  <span style={{ fontSize: 13, color: "var(--rc-gray-900)" }}>{s}</span>
                  <span style={{ marginLeft: "auto", color: "var(--rc-gray-400)" }}><Icon name="chevRight" size={14} /></span>
                </button>
              ))}
            </div>
          </div>
        )}

        {r && (
          <div className="ns-cmd__results">
            {/* AI answer */}
            <div className="ns-answer">
              <div className="ns-answer__eyebrow"><Icon name="sparkle" size={12} fill />Northstar AI · understood</div>
              <div style={{ fontSize: 13.5, lineHeight: 1.5, marginBottom: 12 }}>
                {r.understanding.length ? <>Showing <strong>{r.understanding.join(" · ")}</strong>.</> : <>Searching across all recognized fans.</>}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>{window.NS.fmtNum(r.est.count)}</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>matching fans · {window.NS.fmtNum(r.est.sth)} STH · {window.NS.fmtNum(r.est.nonSth)} non-STH</span>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                <button className="ns-btn ns-btn--sm" style={{ background: "rgba(255,255,255,0.16)", color: "#fff" }} onClick={() => { onClose(); window.nsNewCampaign(r.audience); }}><Icon name="message" size={13} />Create campaign</button>
                <button className="ns-btn ns-btn--sm" style={{ background: "rgba(255,255,255,0.16)", color: "#fff" }} onClick={() => { onClose(); window.nsNewPromotion(r.audience); }}><Icon name="tag" size={13} />Create promotion</button>
                <button className="ns-btn ns-btn--sm" style={{ background: "rgba(255,255,255,0.16)", color: "#fff" }}><Icon name="download" size={13} />Export segment</button>
              </div>
            </div>

            {/* insight */}
            <div className="ns-callout ns-callout--info" style={{ margin: "0 8px 6px" }}>
              <Icon name="sparkle" size={15} /><span>{r.insight}</span>
            </div>

            {/* matching fans */}
            {r.fans.length > 0 && (
              <div className="ns-cmd__group">
                <div className="ns-cmd__grouplabel">Matching fans · sample</div>
                {r.fans.map((f, i) => (
                  <button key={f.id} className="ns-cmd__item" onClick={() => { onClose(); window.nsOpenFan(f.id); }}>
                    <Avatar name={f.name} seed={window.NS.FANS.findIndex((x) => x.id === f.id)} size={30} />
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: 12.5, fontWeight: 500, color: "var(--rc-gray-900)" }}>{f.name}</span>
                      <span style={{ display: "block", fontSize: 10.5, color: "var(--color-text-secondary)", fontFamily: "var(--font-family-mono)" }}>#{f.id} · {f.sth || "Non-STH"}</span>
                    </span>
                    <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
                      <span className="ns-mono ns-strong" style={{ fontSize: 11.5 }}>{window.NS.fmtMoney(f.avgSeason)}/g</span>
                      <Tier tier={f.tier} />
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* jump to */}
            {r.jumps.length > 0 && (
              <div className="ns-cmd__group">
                <div className="ns-cmd__grouplabel">Jump to</div>
                {r.jumps.map(([id, label, icon]) => (
                  <button key={id} className="ns-cmd__item" onClick={() => { onClose(); window.nsGo(id); }}>
                    <span className="ns-cmd__ico"><Icon name={icon} size={15} /></span>
                    <span style={{ fontSize: 12.5, color: "var(--rc-gray-900)" }}>{label}</span>
                    <span style={{ marginLeft: "auto", color: "var(--rc-gray-400)" }}><Icon name="arrowUpRight" size={14} /></span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="ns-cmd__foot">
          <span><Icon name="sparkle" size={12} style={{ verticalAlign: "-2px" }} /> Northstar AI searches verified fan behavior</span>
          <span style={{ marginLeft: "auto" }}>↵ to run · ESC to close</span>
        </div>
      </div>
    </div>
  );
}
window.AISearch = AISearch;
