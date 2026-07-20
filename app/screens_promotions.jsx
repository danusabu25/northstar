/* Northstar — Promotions: lifecycle, cost-aware, measured. */
function PromoStatus({ s }) {
  const map = {
    active: ["success", "Active", true], scheduled: ["info", "Scheduled", false],
    paused: ["warning", "Paused", false], ended: ["neutral", "Ended", false], draft: ["neutral", "Draft", false],
  };
  const [tone, label, dot] = map[s] || map.draft;
  return <Badge tone={tone} dot={dot}>{label}</Badge>;
}

function PromoBudget({ used, cap, status }) {
  const pct = cap ? Math.min(100, (used / cap) * 100) : 0;
  const tone = pct >= 90 ? "red" : pct >= 70 ? "amber" : "green";
  // crude time-to-cap: assume current pace exhausts remaining over the night
  const left = cap - used;
  const tcap = status === "active" && pct < 100 ? (pct >= 70 ? "~9:25 PM at pace" : "on pace") : null;
  return (
    <div style={{ minWidth: 140 }}>
      <div className="ns-spread" style={{ marginBottom: 4 }}>
        <span className="ns-mono" style={{ fontSize: 10.5, color: "var(--color-text-secondary)" }}>${window.NS.fmtNum(used)}</span>
        <span className="ns-mono" style={{ fontSize: 10.5, color: pct >= 90 ? "var(--rc-red-600)" : "var(--color-text-secondary)" }}>${window.NS.fmtNum(cap)}</span>
      </div>
      <Progress pct={pct} tone={tone} />
      {tcap && <div className="ns-mono" style={{ fontSize: 9.5, color: "var(--color-text-secondary)", marginTop: 3 }}>${window.NS.fmtNum(left)} left · {tcap}</div>}
    </div>
  );
}

function PromotionsScreen() {
  const P = window.NS.PROMOS;
  const [tab, setTab] = React.useState("all");
  const [over, setOver] = React.useState({}); // id -> status override
  const statusOf = (p) => over[p.id] || p.status;
  const set = (id, s) => setOver((o) => ({ ...o, [id]: s }));

  const STAGES = [["draft", "Draft"], ["scheduled", "Scheduled"], ["active", "Active"], ["paused", "Paused"], ["ended", "Ended"]];
  const counts = Object.fromEntries(STAGES.map(([k]) => [k, P.filter((p) => statusOf(p) === k).length]));
  const activeCount = counts.active;
  const redeemed = P.reduce((s, p) => s + (p.redeemed || 0), 0);
  const budgetUsed = P.filter((p) => statusOf(p) === "active").reduce((s, p) => s + (p.budgetUsed || 0), 0);
  const budgetCap = P.filter((p) => statusOf(p) === "active").reduce((s, p) => s + (p.budgetCap || 0), 0);
  const atRisk = P.filter((p) => statusOf(p) === "active" && p.budgetCap && p.budgetUsed / p.budgetCap >= 0.7).length;

  return (
    <div>
      <PageHead
        eyebrow="Engage"
        title="Promotions"
        desc="Temporary, operator-initiated incentives layered on the loyalty program. Every promotion has a lifecycle, a budget cap that pauses it automatically, a cost preview before launch, and stand- and segment-level measurement after."
        actions={<><button className="ns-btn ns-btn--secondary" onClick={() => setTab("compare")}><Icon name="activity" size={14} />Compare</button><button className="ns-btn ns-btn--primary" onClick={() => window.nsNewPromotion()}><Icon name="plus" size={14} />New promotion</button></>}
      />

      <div className="ns-kpis" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 14 }}>
        <Kpi hero icon="tag" label="Active promotions" value={String(activeCount)} delta="running tonight" dir="flat" />
        <Kpi icon="zap" label="Redeemed tonight" value={window.NS.fmtNum(redeemed)} delta="across all offers" dir="flat" />
        <Kpi icon="dollar" label="Budget consumed" value={window.NS.fmtMoney(budgetUsed)} delta={"of " + window.NS.fmtMoney(budgetCap) + " capped"} dir="flat" />
        <Kpi icon="alert" label="Near budget cap" value={String(atRisk)} delta={atRisk ? "auto-pause armed" : "all healthy"} dir={atRisk ? "down" : "flat"} hint="" />
      </div>

      {/* lifecycle pipeline */}
      <div className="ns-pipeline" style={{ marginBottom: 16 }}>
        {STAGES.map(([k, label], i) => (
          <React.Fragment key={k}>
            <div className={"ns-pipe" + (counts[k] ? " has" : "")}>
              <div className="ns-pipe__count">{counts[k]}</div>
              <div className="ns-pipe__label">{label}</div>
            </div>
            {i < STAGES.length - 1 && <span className="ns-pipe__arrow"><Icon name="chevRight" size={14} /></span>}
          </React.Fragment>
        ))}
      </div>

      <div className="ns-tabs" style={{ marginBottom: 16 }}>
        {[["all", "Promotions", "tag", P.length], ["compare", "Comparison", "activity", null], ["analytics", "Analytics", "gauge", null], ["simulator", "Simulator", "zap", null]].map(([id, l, ic, ct]) => (
          <button key={id} className={"ns-tab" + (tab === id ? " is-active" : "")} onClick={() => setTab(id)}><Icon name={ic} size={14} />{l}{ct != null && <span className="ns-tab__count">{ct}</span>}</button>
        ))}
      </div>

      {tab === "all" && (
        <div className="ns-grid" style={{ gridTemplateColumns: "1.7fr 1fr" }}>
          <div className="ns-card">
            <div className="ns-card__head"><div className="ns-card__title">All promotions</div><span className="ns-muted" style={{ fontSize: 11 }}>Pause or end any live promotion mid-game</span></div>
            <div className="ns-table-wrap">
              <table className="ns-table">
                <thead><tr><th>Promotion</th><th>Status</th><th className="ns-num">Redeemed</th><th>Budget</th><th></th></tr></thead>
                <tbody>
                  {P.map((p) => {
                    const st = statusOf(p);
                    return (
                      <tr key={p.id}>
                        <td>
                          <div className="ns-strong" style={{ fontSize: 12.5 }}>{p.name}</div>
                          <div className="ns-muted" style={{ fontSize: 10.5, marginTop: 2 }}>{p.offer} · {p.target}</div>
                          <div style={{ marginTop: 4, display: "flex", gap: 6, flexWrap: "wrap" }}><span className="ns-pilltag">{p.type}</span><span className="ns-pilltag" style={{ background: "var(--rc-blue-100)", color: "var(--rc-blue-700)" }}>{p.channel}</span></div>
                        </td>
                        <td><PromoStatus s={st} /><div className="ns-muted" style={{ fontSize: 10, marginTop: 4 }}>{p.window}</div></td>
                        <td className="ns-num ns-mono ns-strong">{p.redeemed > 0 ? window.NS.fmtNum(p.redeemed) : "—"}{p.rate != null ? <div className="ns-muted" style={{ fontSize: 10, fontWeight: 400 }}>{p.rate}% of {window.NS.fmtNum(p.eligible)}</div> : p.eligible ? <div className="ns-muted" style={{ fontSize: 10, fontWeight: 400 }}>{window.NS.fmtNum(p.eligible)} eligible</div> : null}{p.invCap ? <div className="ns-muted" style={{ fontSize: 10, fontWeight: 400 }}>{window.NS.fmtNum(p.invLeft)}/{window.NS.fmtNum(p.invCap)} left</div> : null}</td>
                        <td>{p.budgetCap ? <PromoBudget used={p.budgetUsed} cap={p.budgetCap} status={st} /> : <span className="ns-muted" style={{ fontSize: 11 }}>No cap</span>}</td>
                        <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                          {st === "active" && <><button className="ns-btn ns-btn--ghost ns-btn--sm" onClick={() => set(p.id, "paused")}>Pause</button><button className="ns-btn ns-btn--ghost ns-btn--sm" onClick={() => set(p.id, "ended")} style={{ color: "var(--rc-red-600)" }}>End</button></>}
                          {st === "paused" && <button className="ns-btn ns-btn--ghost ns-btn--sm" onClick={() => set(p.id, "active")}>Resume</button>}
                          {st === "scheduled" && <span className="ns-muted" style={{ fontSize: 10.5 }}>{p.gameTag === "armed" ? "Armed" : "Scheduled"}</span>}
                          {st === "draft" && <button className="ns-btn ns-btn--ghost ns-btn--sm" onClick={() => window.nsNewPromotion()}>Edit</button>}
                          {st === "ended" && <span className="ns-muted" style={{ fontSize: 10.5 }}>Record</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* playbook by type group */}
          <div className="ns-card">
            <div className="ns-card__head"><div className="ns-card__title">Promotion types</div></div>
            <div className="ns-card__body" style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 12, maxHeight: 520, overflowY: "auto" }}>
              {["Discount", "Product", "Spend", "Visit", "Loyalty", "Sports", "Time & location"].map((grp) => (
                <div key={grp}>
                  <div className="ns-sectlabel" style={{ marginBottom: 7 }}>{grp}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {window.NS.PROMO_TYPES.filter((t) => t.group === grp).map((t) => (
                      <button key={t.id} className="ns-memchip" style={{ width: "100%" }} onClick={() => window.nsNewPromotion()}>
                        <span style={{ width: 28, height: 28, borderRadius: 7, background: "var(--rc-gray-100)", color: "var(--color-text-secondary)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name={t.icon} size={14} /></span>
                        <span className="ns-memchip__meta"><span className="ns-memchip__label">{t.label}</span><span className="ns-memchip__sub">{t.sub}</span></span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "compare" && <PromoCompareTab />}
      {tab === "analytics" && <PromoAnalyticsTab statusOf={statusOf} />}
      {tab === "simulator" && <PromotionSimulatorTab />}
    </div>
  );
}
window.PromotionsScreen = PromotionsScreen;
window.PromoStatus = PromoStatus;
window.PromoBudget = PromoBudget;
