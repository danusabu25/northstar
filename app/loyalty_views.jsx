/* Northstar — loyalty surface views: rule library, redemption catalog,
   tier qualification + RFM, conflict resolution. Consumed by LoyaltyScreen. */

function RuleStatus({ s }) {
  const map = {
    active: ["success", "Active", true], scheduled: ["info", "Scheduled", false],
    paused: ["warning", "Paused", false], ended: ["neutral", "Ended", false],
    draft: ["neutral", "Draft", false], soldout: ["danger", "Sold out", false],
  };
  const [tone, label, dot] = map[s] || map.draft;
  return <Badge tone={tone} dot={dot}>{label}</Badge>;
}

function BudgetMeter({ used, cap }) {
  // cap is a "$40,000" string; used is a number
  const capNum = Number(String(cap).replace(/[^0-9.]/g, ""));
  const pct = capNum ? Math.min(100, (used / capNum) * 100) : 0;
  const tone = pct >= 85 ? "red" : pct >= 60 ? "amber" : "green";
  return (
    <div style={{ minWidth: 120 }}>
      <div className="ns-spread" style={{ marginBottom: 4 }}>
        <span className="ns-mono" style={{ fontSize: 10.5, color: "var(--color-text-secondary)" }}>${window.NS.fmtNum(used)}</span>
        <span className="ns-mono" style={{ fontSize: 10.5, color: "var(--color-text-secondary)" }}>{cap}</span>
      </div>
      <Progress pct={pct} tone={tone} />
    </div>
  );
}

// ---------------- Rules tab ----------------
function RulesTab() {
  const L = window.NS.LOYALTY;
  const [group, setGroup] = React.useState("all");
  const groups = L.groups;
  const shown = group === "all" ? L.rules : L.rules.filter((r) => r.group === group);
  const scopeIcon = (s) => (s === "household" ? "users" : "user");

  return (
    <div>
      <div className="ns-spread" style={{ marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <div className="ns-seg" style={{ flexWrap: "wrap", height: "auto" }}>
          <button className={group === "all" ? "is-active" : ""} onClick={() => setGroup("all")}>All ({L.rules.length})</button>
          {groups.map((g) => {
            const n = L.rules.filter((r) => r.group === g.id).length;
            return <button key={g.id} className={group === g.id ? "is-active" : ""} onClick={() => setGroup(g.id)}>{g.label} ({n})</button>;
          })}
        </div>
        <span className="ns-muted" style={{ fontSize: 11.5 }}>{L.rules.filter((r) => r.status === "active").length} active · evaluated in priority order, per-group conflict mode</span>
      </div>

      <div className="ns-card">
        <div className="ns-table-wrap">
          <table className="ns-table ns-ruletable">
            <thead>
              <tr>
                <th style={{ width: 36 }} className="ns-num">Pri</th>
                <th>Rule &amp; trigger</th>
                <th>Action</th>
                <th>Scope</th>
                <th>Constraints</th>
                <th className="ns-num">Issued YTD</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id} className="is-clickable" onClick={() => window.nsNewLoyaltyRule && window.nsNewLoyaltyRule()}>
                  <td className="ns-num ns-mono ns-muted" style={{ fontSize: 11 }}>{r.priority}</td>
                  <td>
                    <div className="ns-strong" style={{ fontSize: 12.5, display: "flex", alignItems: "center", gap: 7 }}>
                      {r.name}
                      {r.signature && <span className="ns-pilltag ns-pilltag--sig">Northstar-only</span>}
                      {r.platform && <span className="ns-pilltag ns-pilltag--plat">Network</span>}
                      {r.baseline && <span className="ns-pilltag">Base rate</span>}
                    </div>
                    <div className="ns-muted" style={{ fontSize: 10.5, marginTop: 2 }}>{r.trigger}</div>
                  </td>
                  <td>
                    <span className="ns-mono ns-strong" style={{ color: "var(--rc-blue-600)", fontSize: 12 }}>{r.action}</span>
                    {r.tierGated && <div style={{ marginTop: 3 }}><span className="ns-pilltag ns-pilltag--tier">Tier-gated</span></div>}
                  </td>
                  <td className="ns-muted"><span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5 }}><Icon name={scopeIcon(r.scope)} size={13} />{r.scope === "household" ? "Household" : "Individual"}</span></td>
                  <td style={{ fontSize: 11 }}>
                    <div className="ns-muted">{r.caps}</div>
                    {r.budget ? <div style={{ marginTop: 5 }}><BudgetMeter used={r.budgetUsed || 0} cap={r.budget} /></div> : null}
                  </td>
                  <td className="ns-num ns-mono ns-strong" style={{ fontSize: 11.5 }}>{r.fired ? window.NS.fmtNum(r.fired) : "—"}</td>
                  <td><RuleStatus s={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---------------- Redemption tab ----------------
function RedeemTab() {
  const L = window.NS.LOYALTY;
  const tierBadge = (t) => {
    if (t === "all") return <span className="ns-pilltag">All fans</span>;
    return <span className={"ns-tier ns-tier--" + t} style={{ background: "var(--tier-" + t + "-bg)", color: "var(--tier-" + t + "-fg)", padding: "3px 8px 3px 6px" }}><span className="ns-tier__mark" style={{ background: "var(--tier-" + t + "-mark)" }} />{t[0].toUpperCase() + t.slice(1)}+</span>;
  };
  return (
    <div className="ns-grid" style={{ gridTemplateColumns: "1.5fr 1fr" }}>
      <div className="ns-card">
        <div className="ns-card__head"><div><div className="ns-card__title">Redemption catalog</div><div className="ns-card__sub">Applied before payment auth</div></div><button className="ns-btn ns-btn--primary ns-btn--sm" onClick={() => window.nsNewReward()}><Icon name="plus" size={13} />New reward</button></div>
        <div className="ns-table-wrap">
          <table className="ns-table">
            <thead><tr><th>Reward</th><th className="ns-num">Cost</th><th>Eligibility</th><th>Inventory</th><th className="ns-num">Redeemed</th><th></th></tr></thead>
            <tbody>
              {L.catalog.map((c) => (
                <tr key={c.id} className="is-clickable" onClick={() => window.nsNewReward(c)}>
                  <td>
                    <div className="ns-strong" style={{ fontSize: 12.5 }}>{c.reward}</div>
                    <div className="ns-muted" style={{ fontSize: 10.5, marginTop: 2 }}>Expiry: {c.expiry}</div>
                  </td>
                  <td className="ns-num ns-mono ns-strong" style={{ color: "var(--tier-gold-fg)" }}>{window.NS.fmtNum(c.cost)}</td>
                  <td>{tierBadge(c.tier)}</td>
                  <td style={{ fontSize: 11 }}>
                    {c.inventory ? (
                      <div style={{ minWidth: 96 }}>
                        <div className="ns-spread" style={{ marginBottom: 4 }}><span className="ns-mono ns-muted" style={{ fontSize: 10.5 }}>{c.inventory.left} left</span><span className="ns-mono ns-muted" style={{ fontSize: 10.5 }}>of {c.inventory.cap}</span></div>
                        <Progress pct={(1 - c.inventory.left / c.inventory.cap) * 100} tone={c.inventory.left === 0 ? "red" : c.inventory.left / c.inventory.cap < 0.25 ? "amber" : undefined} />
                      </div>
                    ) : <span className="ns-muted">Unlimited</span>}
                  </td>
                  <td className="ns-num ns-mono">{window.NS.fmtNum(c.redeemed)}</td>
                  <td style={{ textAlign: "right" }}>{c.status === "soldout" ? <Badge tone="danger">Sold out</Badge> : <span className="ns-muted"><Icon name="chevRight" size={13} /></span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Terminal redemption */}
      <div className="ns-card">
        <div className="ns-card__head"><div className="ns-card__title">Terminal redemption</div><span className="ns-muted" style={{ fontSize: 11 }}>Zero login · zero barcode</span></div>
        <div className="ns-card__body">
          <div style={{ background: "var(--ns-navy)", borderRadius: 12, padding: "20px", color: "#fff", marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>Marcus tapped to pay</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>You have 5,320 points</div>
            <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.8)", marginBottom: 16 }}>Redeem $10 off this purchase?</div>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1, background: "var(--rc-blue-500)", borderRadius: 6, padding: "9px 0", textAlign: "center", fontSize: 12.5, fontWeight: 600 }}>Yes</div>
              <div style={{ flex: 1, background: "rgba(255,255,255,0.12)", borderRadius: 6, padding: "9px 0", textAlign: "center", fontSize: 12.5, fontWeight: 500 }}>No</div>
            </div>
          </div>
          <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
            {["Eligible rewards filtered by tier + balance locally", "Best-value reward surfaced at terminal", "Fan taps Yes / No — transaction completes", "Inventory & budget decremented, synced to cloud"].map((t, i) => (
              <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--rc-blue-100)", color: "var(--rc-blue-600)", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
                <span style={{ fontSize: 12, color: "var(--color-text-primary)", lineHeight: 1.45 }}>{t}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

// ---------------- Tiers + RFM tab ----------------
function TiersTab() {
  const L = window.NS.LOYALTY;
  return (
    <div>
      <div className="ns-card" style={{ marginBottom: 14 }}>
        <div className="ns-card__head"><div className="ns-card__title">Tier qualification</div><span className="ns-muted" style={{ fontSize: 11 }}>Combined AND / OR logic across spend + attendance</span></div>
        <div className="ns-card__body">
          <div className="ns-tiergrid">
            {L.tiers.map((t) => (
              <div key={t.id} className="ns-tiercard">
                <div className="ns-spread" style={{ marginBottom: 12 }}>
                  <span className="ns-tier" style={{ background: "var(--tier-" + t.id + "-bg)", color: "var(--tier-" + t.id + "-fg)" }}><span className="ns-tier__mark" style={{ background: t.mark }} />{t.label}</span>
                  <span className="ns-mono ns-strong" style={{ fontSize: 13 }}>{window.NS.fmtNum(t.count)}</span>
                </div>
                <div className="ns-tierlogic">
                  {t.rules.map((r, i) => (
                    <React.Fragment key={i}>
                      <div className="ns-tierlogic__cond">{r}</div>
                      {i < t.rules.length - 1 && <div className="ns-tierlogic__op">{t.logic}</div>}
                    </React.Fragment>
                  ))}
                </div>
                <div className="ns-divider" style={{ margin: "12px 0" }} />
                <div className="ns-spread" style={{ fontSize: 11.5 }}><span className="ns-muted">Earn multiplier</span><span className="ns-mono ns-strong" style={{ color: "var(--rc-blue-600)" }}>{t.multiplier}</span></div>
                <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 8, lineHeight: 1.4 }}>{t.benefit}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ns-card">
        <div className="ns-card__head"><div className="ns-card__title">RFM lifecycle segments</div><Badge tone="info" dot>Auto-computed · updates in real time</Badge></div>
        <div className="ns-card__body">
          <div className="ns-muted" style={{ fontSize: 11.5, marginBottom: 14, lineHeight: 1.5, maxWidth: "70ch" }}>Recency = days since last game-day F&amp;B purchase · Frequency = game days with a purchase this season · Monetary = average F&amp;B spend per game day. Use these labels directly as campaign audiences — no thresholds to define.</div>
          <div className="ns-rfmgrid">
            {L.rfm.map((seg) => (
              <button key={seg.id} className="ns-rfmcard" onClick={() => window.nsNewCampaign && window.nsNewCampaign()}>
                <div className="ns-spread" style={{ marginBottom: 10 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span className={"ns-rfmdot ns-rfmdot--" + seg.tone} />
                    <span className="ns-strong" style={{ fontSize: 12.5 }}>{seg.label}</span>
                  </span>
                  <SentTag trend={seg.trend} />
                </div>
                <div className="ns-audnum" style={{ fontSize: 24, marginBottom: 2 }}>{window.NS.fmtNum(seg.count)}</div>
                <div className="ns-muted" style={{ fontSize: 10.5, marginBottom: 12 }}>fans</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
                  {[["R", seg.r], ["F", seg.f], ["M", seg.m]].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="ns-mono" style={{ fontSize: 10, color: "var(--color-text-secondary)", width: 10 }}>{k}</span>
                      <div style={{ flex: 1 }}><Progress pct={v * 20} tone={seg.tone === "danger" ? "red" : seg.tone === "warning" ? "amber" : seg.tone === "success" ? "green" : undefined} /></div>
                      <span className="ns-mono" style={{ fontSize: 10, color: "var(--color-text-secondary)", width: 14, textAlign: "right" }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 10.5, color: "var(--color-text-secondary)", lineHeight: 1.4 }}>{seg.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- Conflict resolution tab ----------------
function ConflictTab() {
  const L = window.NS.LOYALTY;
  const MODES = [["stackable", "Stackable"], ["first", "First wins"], ["best", "Best value"]];
  const [modes, setModes] = React.useState(() => Object.fromEntries(L.conflictGroups.map((g) => [g.id, g.mode])));
  const sim = L.conflictSim;
  const fired = sim.eligible.filter((e) => e.fires);
  const total = fired.reduce((s, e) => s + Number(String(e.award).replace(/[^0-9.]/g, "")), 0);

  return (
    <div className="ns-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
      <div className="ns-card">
        <div className="ns-card__head"><div className="ns-card__title">Conflict resolution</div><span className="ns-muted" style={{ fontSize: 11 }}>Set per campaign group</span></div>
        <div className="ns-card__body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="ns-muted" style={{ fontSize: 11.5, lineHeight: 1.5, maxWidth: "60ch" }}>When two rules fire on the same transaction, the group’s resolution mode decides the outcome. Configure this before any promotion goes live.</div>
          {L.conflictGroups.map((g) => (
            <div key={g.id} className="ns-cfgrow">
              <div style={{ minWidth: 0 }}>
                <div className="ns-strong" style={{ fontSize: 12.5 }}>{g.label}</div>
                <div className="ns-muted" style={{ fontSize: 10.5, marginTop: 2 }}>{g.desc}</div>
              </div>
              <div className="ns-seg" style={{ flexShrink: 0 }}>
                {MODES.map(([id, l]) => <button key={id} className={modes[g.id] === id ? "is-active" : ""} onClick={() => setModes((m) => ({ ...m, [g.id]: id }))}>{l}</button>)}
              </div>
            </div>
          ))}
          <div className="ns-callout ns-callout--info"><Icon name="shield" size={15} /><span><strong>Stackable</strong> applies all rules additively · <strong>First wins</strong> fires the highest-priority rule only · <strong>Best value</strong> gives the fan the single highest award.</span></div>
        </div>
      </div>

      <div className="ns-card">
        <div className="ns-card__head"><div className="ns-card__title">Transaction simulator</div><Badge tone="neutral">Live preview</Badge></div>
        <div className="ns-card__body">
          <div style={{ background: "var(--rc-gray-050)", border: "1px solid var(--color-border-default)", borderRadius: 8, padding: "12px 14px", marginBottom: 14 }}>
            <div className="ns-spread"><span className="ns-strong" style={{ fontSize: 12.5 }}>{sim.txn.label}</span><span className="ns-mono ns-strong">{window.NS.fmtMoney(sim.txn.amount, 2)}</span></div>
            <div className="ns-muted" style={{ fontSize: 10.5, marginTop: 3 }}>{sim.txn.context}</div>
          </div>
          <div className="ns-sectlabel">Eligible rules this transaction</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 14 }}>
            {sim.eligible.map((e, i) => (
              <div key={i} className={"ns-simrow" + (e.fires ? "" : " is-suppressed")}>
                <span className="ns-simrow__state">{e.fires ? <Icon name="check" size={13} stroke={2.6} /> : <Icon name="x" size={12} stroke={2.4} />}</span>
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span className="ns-strong" style={{ fontSize: 12 }}>{e.rule}{e.winner && <span className="ns-pilltag ns-pilltag--win" style={{ marginLeft: 6 }}>Best value</span>}</span>
                  <span className="ns-muted" style={{ fontSize: 10, display: "block", marginTop: 1 }}>{e.basis} · {e.group}</span>
                </span>
                <span className="ns-mono ns-strong" style={{ fontSize: 12, color: e.fires ? "var(--rc-blue-600)" : "var(--color-text-tertiary)", textDecoration: e.fires ? "none" : "line-through" }}>{e.award}</span>
              </div>
            ))}
          </div>
          <div className="ns-spread" style={{ padding: "12px 14px", background: "var(--ns-navy)", borderRadius: 8, color: "#fff" }}>
            <span style={{ fontSize: 12 }}>Marcus earns</span>
            <span className="ns-mono" style={{ fontSize: 18, fontWeight: 600 }}>{window.NS.fmtNum(total)} pts</span>
          </div>
          <div className="ns-muted" style={{ fontSize: 10.5, marginTop: 10, lineHeight: 1.5 }}>{sim.note}</div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { RulesTab, RedeemTab, TiersTab, ConflictTab, RuleStatus, BudgetMeter });
