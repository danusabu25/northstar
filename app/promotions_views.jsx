/* Northstar — promotion comparison + analytics tabs. */

function PromoCompareTab() {
  const rows = window.NS.PROMO_COMPARE;
  const best = rows.reduce((a, b) => (b.rate > a.rate ? b : a), rows[0]);
  return (
    <div className="ns-grid" style={{ gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="ns-card">
        <div className="ns-card__head"><div><div className="ns-card__title">Beer discounts — last 8 games</div><div className="ns-card__sub">What drives higher redemption: offer size, audience, or game context?</div></div></div>
        <div className="ns-table-wrap">
          <table className="ns-table">
            <thead><tr><th>Game</th><th>Offer</th><th>Audience</th><th className="ns-num">Eligible</th><th className="ns-num">Redeemed</th><th className="ns-num">Rate</th><th className="ns-num">Cost</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.game} className={r.game === best.game ? "is-best" : ""}>
                  <td className="ns-mono ns-strong">{r.game}</td>
                  <td>{r.offer}</td>
                  <td className="ns-muted" style={{ fontSize: 11.5 }}>{r.audience}</td>
                  <td className="ns-num ns-mono">{window.NS.fmtNum(r.eligible)}</td>
                  <td className="ns-num ns-mono">{window.NS.fmtNum(r.redeemed)}</td>
                  <td className="ns-num"><span className="ns-mono ns-strong" style={{ color: r.rate >= 40 ? "var(--rc-green-600)" : "var(--rc-gray-900)" }}>{r.rate}%</span></td>
                  <td className="ns-num ns-mono">{window.NS.fmtMoney(r.cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--color-border-default)" }}>
          <div className="ns-callout ns-callout--info"><Icon name="sparkle" size={15} /><span><strong>Gold-only targeting with 20% off</strong> is the most efficient combination — higher redemption rate at lower total cost than venue-wide at the same discount.</span></div>
        </div>
      </div>

      <div className="ns-card">
        <div className="ns-card__head"><div className="ns-card__title">Redemption rate by game</div></div>
        <div className="ns-card__body">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {rows.map((r) => (
              <div key={r.game}>
                <div className="ns-spread" style={{ marginBottom: 4 }}>
                  <span style={{ fontSize: 11.5, color: "var(--rc-gray-900)" }}><span className="ns-mono ns-strong">{r.game}</span> · {r.offer} · {r.audience}</span>
                  <span className="ns-mono ns-strong" style={{ fontSize: 11.5 }}>{r.rate}%</span>
                </div>
                <Progress pct={r.rate * 2} tone={r.rate >= 40 ? "green" : r.rate >= 30 ? undefined : "amber"} />
              </div>
            ))}
          </div>
          <div className="ns-muted" style={{ fontSize: 10.5, marginTop: 14, lineHeight: 1.5 }}>Bar scaled to 50% redemption. Higher discount lifts rate but raises total cost when the audience is venue-wide — narrow the audience to keep cost-per-redemption down.</div>
        </div>
      </div>
    </div>
  );
}

function PromoMetric({ label, value, sub, tone }) {
  return (
    <div className="ns-pmetric">
      <div className="ns-pmetric__label">{label}</div>
      <div className="ns-pmetric__value" style={tone ? { color: tone } : null}>{value}</div>
      {sub && <div className="ns-pmetric__sub">{sub}</div>}
    </div>
  );
}

function PromoAnalyticsTab({ statusOf }) {
  const measurable = window.NS.PROMOS.filter((p) => p.redeemed > 0);
  const [sel, setSel] = React.useState(measurable[0].id);
  const p = window.NS.PROMOS.find((x) => x.id === sel);
  const avgVal = p.budgetUsed && p.redeemed ? p.budgetUsed / p.redeemed : 0;
  const budgetLeft = p.budgetCap ? p.budgetCap - p.budgetUsed : null;
  const pctBudget = p.budgetCap ? (p.budgetUsed / p.budgetCap) * 100 : 0;

  return (
    <div>
      <div className="ns-seg" style={{ marginBottom: 14, flexWrap: "wrap", height: "auto" }}>
        {measurable.map((m) => <button key={m.id} className={sel === m.id ? "is-active" : ""} onClick={() => setSel(m.id)}>{m.name}</button>)}
      </div>

      <div className="ns-card" style={{ marginBottom: 14 }}>
        <div className="ns-card__head"><div><div className="ns-card__title">{p.name}</div><div className="ns-card__sub">{p.offer} · {p.target} · {p.window}</div></div><PromoStatus s={statusOf ? statusOf(p) : p.status} /></div>
        <div className="ns-pmetrics">
          <PromoMetric label="Total redemptions" value={window.NS.fmtNum(p.redeemed)} sub={p.rate != null ? p.rate + "% of eligible" : null} />
          <PromoMetric label="Unique fans" value={window.NS.fmtNum(p.uniqueFans)} sub={p.redeemed - p.uniqueFans > 0 ? (p.redeemed - p.uniqueFans) + " repeat" : "no repeats"} />
          <PromoMetric label="Total offer cost" value={window.NS.fmtMoney(p.budgetUsed)} sub={"avg " + window.NS.fmtMoney(avgVal, 2) + " / redemption"} />
          <PromoMetric label="Budget remaining" value={budgetLeft != null ? window.NS.fmtMoney(budgetLeft) : "—"} sub={budgetLeft != null ? Math.round(100 - pctBudget) + "% of cap left" : "no cap"} tone={pctBudget >= 90 ? "var(--rc-red-600)" : pctBudget >= 70 ? "var(--rc-amber-600)" : null} />
          <PromoMetric label="Time to budget cap" value={statusOf && statusOf(p) === "active" ? (pctBudget >= 70 ? "~9:25 PM" : "Not at risk") : "—"} sub={statusOf && statusOf(p) === "active" ? "at current pace" : "not live"} />
        </div>
      </div>

      <div className="ns-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="ns-card">
          <div className="ns-card__head"><div className="ns-card__title">Stand-level breakdown</div><span className="ns-muted" style={{ fontSize: 11 }}>Redemption rate</span></div>
          <div className="ns-card__body">
            {p.stands.length ? p.stands.map(([name, rate]) => (
              <div key={name} style={{ marginBottom: 11 }}>
                <div className="ns-spread" style={{ marginBottom: 4 }}><span style={{ fontSize: 12, color: "var(--rc-gray-900)" }}>{name}</span><span className="ns-mono ns-strong" style={{ fontSize: 11.5 }}>{rate}%</span></div>
                <Progress pct={rate * 1.6} tone={rate >= 45 ? "green" : undefined} />
              </div>
            )) : <div className="ns-muted" style={{ fontSize: 12 }}>No stand data yet.</div>}
          </div>
        </div>
        <div className="ns-card">
          <div className="ns-card__head"><div className="ns-card__title">Segment breakdown</div><span className="ns-muted" style={{ fontSize: 11 }}>Redemption rate</span></div>
          <div className="ns-card__body">
            {p.segments.length ? p.segments.map(([name, rate]) => (
              <div key={name} style={{ marginBottom: 11 }}>
                <div className="ns-spread" style={{ marginBottom: 4 }}><span style={{ fontSize: 12, color: "var(--rc-gray-900)" }}>{name}</span><span className="ns-mono ns-strong" style={{ fontSize: 11.5 }}>{rate}%</span></div>
                <Progress pct={rate * 1.6} tone={rate >= 45 ? "green" : undefined} />
              </div>
            )) : <div className="ns-muted" style={{ fontSize: 12 }}>No segment data yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- Simulator tab ----------------
// Structured eligibility rules for the currently live/armed promotions in
// window.NS.PROMOS. Kept separate from the display data because a real
// runtime engine would evaluate structured conditions, not free text.
const SIM_RULES = [
  { id: "p-nachos", label: "Lead by 15 — free nachos", priority: 1, category: "food", stand: "3", requiresLead15: true, value: () => 3 },
  { id: "p-merchwin", label: "Bulls win — 20% merch", priority: 2, category: "merch", requiresWin: true, value: () => 6 },
  { id: "p-halftime", label: "Halftime Beer Deal", priority: 3, category: "beer", tierGroup: "gold", minVisits: 3, value: () => 2 },
  { id: "p-spend50", label: "Spend $50, get $10 back", priority: 4, category: "any", minSpend: 50, value: () => 10 },
  { id: "p-milestone", label: "10th game — beer on us", priority: 5, category: "beer", exactVisits: 10, value: () => 10 },
];

function simEvaluate(rule, promo, ctx) {
  const reasons = [];
  if (!["active", "scheduled"].includes(promo.status)) reasons.push("Not live right now (" + promo.status + ")");
  if (rule.tierGroup === "gold" && !["gold", "platinum"].includes(ctx.tier)) reasons.push("Requires Gold/Platinum tier");
  if (rule.minVisits && ctx.visits < rule.minVisits) reasons.push("Needs " + rule.minVisits + "+ visits this season");
  if (rule.exactVisits && ctx.visits !== rule.exactVisits) reasons.push("Only fires on visit #" + rule.exactVisits);
  if (rule.minSpend && ctx.spend < rule.minSpend) reasons.push("Needs $" + rule.minSpend + "+ this purchase");
  if (rule.category !== "any" && rule.category !== ctx.category) reasons.push("Applies to " + rule.category + " purchases only");
  if (rule.stand && ctx.stand !== rule.stand) reasons.push("Stand " + rule.stand + " only");
  if (rule.requiresLead15 && !ctx.leadMargin) reasons.push("Requires a 15+ point lead at half");
  if (rule.requiresWin && !ctx.teamWon) reasons.push("Requires a Bulls win");
  if (promo.budgetCap && promo.budgetUsed >= promo.budgetCap) reasons.push("Budget exhausted");
  if (promo.invCap != null && promo.invLeft <= 0) reasons.push("Inventory exhausted");
  return { ok: reasons.length === 0, reasons };
}

function PromotionSimulatorTab() {
  const [tier, setTier] = React.useState("gold");
  const [visits, setVisits] = React.useState(6);
  const [category, setCategory] = React.useState("beer");
  const [spend, setSpend] = React.useState(45);
  const [stand, setStand] = React.useState("12");
  const [leadMargin, setLeadMargin] = React.useState(false);
  const [teamWon, setTeamWon] = React.useState(false);
  const [mode, setMode] = React.useState("best");

  const ctx = { tier, visits, category, spend, stand, leadMargin, teamWon };
  const evaluated = SIM_RULES.map((rule) => {
    const promo = window.NS.PROMOS.find((p) => p.id === rule.id);
    const { ok, reasons } = simEvaluate(rule, promo, ctx);
    return { rule, promo, ok, reasons, value: rule.value(ctx) };
  });
  const eligible = evaluated.filter((e) => e.ok);
  let winners = [];
  if (eligible.length) {
    if (mode === "stackable") winners = eligible;
    else if (mode === "first") winners = [[...eligible].sort((a, b) => a.rule.priority - b.rule.priority)[0]];
    else winners = [[...eligible].sort((a, b) => b.value - a.value)[0]];
  }
  const winnerIds = new Set(winners.map((w) => w.rule.id));
  const total = winners.reduce((s, w) => s + w.value, 0);

  return (
    <div className="ns-grid" style={{ gridTemplateColumns: "1fr 1.2fr" }}>
      <div className="ns-card">
        <div className="ns-card__head"><div><div className="ns-card__title">Simulated transaction</div><div className="ns-card__sub">Change any input — eligibility recomputes live against real promotion data</div></div></div>
        <div className="ns-card__body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div className="ns-sectlabel">Fan tier</div>
            <div className="ns-seg" style={{ flexWrap: "wrap", height: "auto" }}>{[["gold", "Gold/Platinum"], ["silver", "Silver"], ["bronze", "Non-STH"]].map(([id, l]) => <button key={id} className={tier === id ? "is-active" : ""} onClick={() => setTier(id)}>{l}</button>)}</div>
          </div>
          <div className="ns-cond"><div className="ns-cond__body"><div className="ns-cond__label">Visits this season</div><SliderField min={1} max={14} step={1} value={visits} onChange={setVisits} /></div></div>
          <div>
            <div className="ns-sectlabel">Purchase category</div>
            <div className="ns-seg" style={{ flexWrap: "wrap", height: "auto" }}>{[["beer", "Beer"], ["food", "Food"], ["merch", "Merch"], ["any", "Other"]].map(([id, l]) => <button key={id} className={category === id ? "is-active" : ""} onClick={() => setCategory(id)}>{l}</button>)}</div>
          </div>
          <div className="ns-cond"><div className="ns-cond__body"><div className="ns-cond__label">Purchase amount</div><SliderField min={5} max={100} step={5} value={spend} onChange={setSpend} prefix="$" /></div></div>
          <div>
            <div className="ns-sectlabel">Stand</div>
            <div className="ns-seg" style={{ flexWrap: "wrap", height: "auto" }}>{[["12", "Stand 12"], ["3", "Stand 3"], ["4", "Stand 4"], ["other", "Elsewhere"]].map(([id, l]) => <button key={id} className={stand === id ? "is-active" : ""} onClick={() => setStand(id)}>{l}</button>)}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <RBToggle on={leadMargin} onClick={() => setLeadMargin((v) => !v)} label="Bulls leading by 15+ at half" sub="Arms the game-state nacho trigger" />
            <RBToggle on={teamWon} onClick={() => setTeamWon((v) => !v)} label="Bulls won the game" sub="Arms the win-celebration merch trigger" />
          </div>
          <div>
            <div className="ns-sectlabel">If multiple promotions match</div>
            <div className="ns-seg" style={{ flexWrap: "wrap", height: "auto" }}>{[["stackable", "Stackable"], ["first", "First wins"], ["best", "Best value"]].map(([id, l]) => <button key={id} className={mode === id ? "is-active" : ""} onClick={() => setMode(id)}>{l}</button>)}</div>
          </div>
        </div>
      </div>

      <div className="ns-card">
        <div className="ns-card__head"><div className="ns-card__title">Evaluation</div><Badge tone="neutral">Live preview</Badge></div>
        <div className="ns-card__body">
          <div className="ns-sectlabel">All promotions this transaction touches</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 16 }}>
            {evaluated.map((e) => (
              <div key={e.rule.id} className={"ns-simrow" + (e.ok ? "" : " is-suppressed")}>
                <span className="ns-simrow__state">{e.ok ? <Icon name="check" size={13} stroke={2.6} /> : <Icon name="x" size={12} stroke={2.4} />}</span>
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span className="ns-strong" style={{ fontSize: 12 }}>{e.rule.label}{winnerIds.has(e.rule.id) && <span className="ns-pilltag ns-pilltag--win" style={{ marginLeft: 6 }}>Applied</span>}</span>
                  <span className="ns-muted" style={{ fontSize: 10, display: "block", marginTop: 1 }}>{e.ok ? "Eligible · $" + e.value.toFixed(2) + " value" : e.reasons[0]}</span>
                </span>
                <span className="ns-mono ns-strong" style={{ fontSize: 12, color: e.ok ? "var(--rc-blue-600)" : "var(--color-text-tertiary)", textDecoration: e.ok ? "none" : "line-through" }}>${e.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="ns-spread" style={{ marginBottom: 10 }}>
            <span className="ns-muted" style={{ fontSize: 11.5 }}>{eligible.length} of {evaluated.length} promotions eligible · resolving via <strong>{{ stackable: "Stackable", first: "First wins", best: "Best value" }[mode]}</strong></span>
          </div>
          <div className="ns-spread" style={{ padding: "12px 14px", background: "var(--ns-navy)", borderRadius: 8, color: "#fff" }}>
            <span style={{ fontSize: 12 }}>Fan receives</span>
            <span className="ns-mono" style={{ fontSize: 18, fontWeight: 600 }}>${total.toFixed(2)} value{winners.length > 1 ? " · " + winners.length + " promotions" : ""}</span>
          </div>
          <div className="ns-muted" style={{ fontSize: 10.5, marginTop: 10, lineHeight: 1.5 }}>
            {mode === "stackable" && "Stackable applies every eligible promotion additively."}
            {mode === "first" && "First wins applies only the highest-priority eligible promotion — sports triggers outrank standing offers."}
            {mode === "best" && "Best value compares eligible promotions and applies only the single highest-value one to the fan."}
            {" "}This mirrors the same active/eligible/budget checks and conflict-resolution mode a campaign's attached promotion runs through at the terminal.
          </div>
        </div>
      </div>
    </div>
  );
}

window.PromoCompareTab = PromoCompareTab;
window.PromoAnalyticsTab = PromoAnalyticsTab;
window.PromoMetric = PromoMetric;
window.PromotionSimulatorTab = PromotionSimulatorTab;
