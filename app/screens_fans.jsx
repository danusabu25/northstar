/* Northstar — Fan profiles: list view. Rich drill-down is in fan_profile.jsx. */

function fanTierLabel(t) {return { gold: "Gold", silver: "Silver", bronze: "Bronze" }[t];}

// ---------- List ----------
function FanList({ onOpen }) {
  const FANS = window.NS.FANS;
  const HOUSEHOLDS = window.NS.HOUSEHOLDS;
  const [tab, setTab] = React.useState("all");
  const [q, setQ] = React.useState("");

  const householdList = Object.entries(HOUSEHOLDS).map(([primaryId, hh]) => ({ primaryId, ...hh }));
  const openHousehold = (id) => { window.__nsProfileTab = "household"; onOpen(id); };

  const tabs = [
  { id: "all", label: "All fans", count: "6,842" },
  { id: "gold", label: "Gold confidence", count: "2,614" },
  { id: "sth", label: "STH", count: "2,741" },
  { id: "risk", label: "At risk", count: "387" },
  { id: "households", label: "Households", count: "1,932" }];

  const isHH = tab === "households";

  const hhRows = householdList.filter((h) => {
    if (!q.trim()) return true;
    const s = q.toLowerCase();
    return h.name.toLowerCase().includes(s) || h.id.toLowerCase().includes(s) || h.members.some((m) => m.name.toLowerCase().includes(s));
  });


  const rows = FANS.filter((f) => {
    if (tab === "gold" && f.tier !== "gold") return false;
    if (tab === "sth" && !f.sth) return false;
    if (tab === "risk" && !f.flags.some((x) => /risk|declining|low benefit/i.test(x))) return false;
    if (q.trim()) {
      const s = q.toLowerCase();
      if (!f.name.toLowerCase().includes(s) && !f.id.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  return (
    <div>
      <PageHead
        eyebrow="Fan intelligence"
        title="Fan profiles"
        desc="Every profile is built automatically from payment taps — no app, no opt-in. 6,842 fans recognized this season, deepening every game."
        actions={<>
          <button className="ns-btn ns-btn--secondary"><Icon name="filter" size={14} />Segments</button>
          <button className="ns-btn ns-btn--secondary"><Icon name="download" size={14} />Export CSV</button>
        </>} />


      <div className="ns-callout ns-callout--info" style={{ marginBottom: 16 }}>
        <Icon name="database" size={16} />
        <span><strong>Self-filling CRM.</strong> No record here was typed by hand. Each profile is keyed to a hashed Payment Account Reference (PAR) and enriched on every tap. Raw card data is never stored.</span>
      </div>

      <div className="ns-card">
        <div style={{ padding: "0 4px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, borderBottom: "1px solid var(--color-border-default)" }}>
          <div className="ns-tabs" style={{ border: 0 }}>
            {tabs.map((t) =>
            <button key={t.id} className={"ns-tab" + (t.id === tab ? " is-active" : "")} onClick={() => setTab(t.id)}>
                {t.label}<span className="ns-tab__count">{t.count}</span>
              </button>
            )}
          </div>
          <div className="ns-search" style={{ width: 240, marginRight: 8 }}>
            <span className="ns-search__icon"><Icon name="search" size={14} /></span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={isHH ? "Search family or member…" : "Search name or PAR id…"} />
          </div>
        </div>
        {isHH ?
        <div className="ns-table-wrap">
          <table className="ns-table">
            <thead>
              <tr>
                <th>Household</th>
                <th>Members</th>
                <th className="ns-num">Combined value</th>
                <th className="ns-num">Pooled points</th>
                <th>Attendance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {hhRows.map((h) => {
                const active = h.members.filter((m) => m.attended > 0).length;
                const pct = Math.round(active / h.members.length * 100);
                const primary = h.members.find((m) => m.role === "primary");
                return (
                <tr key={h.id} className="is-clickable" onClick={() => openHousehold(h.primaryId)}>
                  <td>
                    <div className="ns-cell-fan">
                      <span style={{ width: 26, height: 26, borderRadius: 7, background: "var(--rc-blue-100)", color: "var(--rc-blue-600)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="users" size={15} /></span>
                      <div>
                        <div className="ns-cell-fan__name">{h.name}</div>
                        <div className="ns-cell-fan__sub">{h.account}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ display: "flex" }}>
                        {h.members.slice(0, 4).map((m, j) =>
                        <span key={m.name} style={{ marginLeft: j ? -8 : 0, border: "2px solid var(--color-surface-muted)", borderRadius: "50%", display: "inline-flex" }}><Avatar name={m.name} seed={j + 3} size={24} /></span>)}
                      </div>
                      <span className="ns-muted" style={{ fontSize: 11.5 }}>{h.members.length} · {primary.name.split(" ")[1]} +{h.members.length - 1}</span>
                    </div>
                  </td>
                  <td className="ns-num ns-mono ns-strong">{window.NS.fmtMoney(h.combinedLtv)}</td>
                  <td className="ns-num ns-mono" style={{ color: "var(--tier-gold-mark)" }}>{window.NS.fmtNum(h.pooledPoints)}</td>
                  <td style={{ minWidth: 130 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 56 }}><Progress pct={pct} tone={h.risk === "partial" ? null : "gold"} /></div>
                      <span className="ns-mono ns-muted" style={{ fontSize: 11 }}>{active}/{h.members.length}</span>
                    </div>
                  </td>
                  <td>{h.risk === "partial" ? <Badge tone="warning"><Icon name="alert" size={11} />Partially at-risk</Badge> : <Badge tone="success" dot>Engaged</Badge>}</td>
                </tr>);
              })}
            </tbody>
          </table>
        </div> :
        <div className="ns-table-wrap">
          <table className="ns-table">
            <thead>
              <tr>
                <th>Fan</th>
                <th>Confidence</th>
                <th>Membership</th>
                <th className="ns-num" data-comment-anchor="00465eced3-th-67-17">Games (season)</th>
                <th className="ns-num">Avg / game</th>
                <th className="ns-num">Total spend</th>
                <th>Benefit use</th>
                <th>Sentiment</th>
                <th>Last visit</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((f, i) =>
              <tr key={f.id} className="is-clickable" onClick={() => onOpen(f.id)}>
                  <td>
                    <div className="ns-cell-fan">
                      <Avatar name={f.name} seed={i} />
                      <div>
                        <div className="ns-cell-fan__name">{f.name}{HOUSEHOLDS[f.id] && <span title={HOUSEHOLDS[f.id].name} onClick={(e) => { e.stopPropagation(); openHousehold(f.id); }} style={{ display: "inline-flex", alignItems: "center", gap: 3, marginLeft: 7, fontSize: 10, fontWeight: 500, color: "var(--rc-blue-600)", background: "var(--rc-blue-100)", borderRadius: "var(--radius-pill)", padding: "1px 7px", verticalAlign: "middle" }}><Icon name="users" size={10} />+{HOUSEHOLDS[f.id].members.length - 1}</span>}</div>
                        <div className="ns-cell-fan__sub">#{f.id}</div>
                      </div>
                    </div>
                  </td>
                  <td><Tier tier={f.tier} /></td>
                  <td>{f.sth ? <span style={{ fontSize: 12 }}>{f.sth}</span> : <span className="ns-muted">—</span>}</td>
                  <td className="ns-num ns-mono">{f.seasonGames}</td>
                  <td className="ns-num ns-mono ns-strong">{window.NS.fmtMoney(f.avgSeason)}</td>
                  <td className="ns-num ns-mono">{window.NS.fmtMoney(f.totalSeason)}</td>
                  <td style={{ minWidth: 120 }}>
                    {f.benefitOf > 0 ?
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 56 }}><Progress pct={f.benefitGames / f.benefitOf * 100} tone="gold" /></div>
                        <span className="ns-mono ns-muted" style={{ fontSize: 11 }}>{Math.round(f.benefitGames / f.benefitOf * 100)}%</span>
                      </div> :
                  <span className="ns-muted">n/a</span>}
                  </td>
                  <td><SentTag trend={f.sentTrend} /></td>
                  <td className="ns-muted" style={{ fontSize: 11.5 }}>{f.lastVisit}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>}
      </div>
    </div>);

}

function FansScreen({ fanId, setFanId }) {
  const FANS = window.NS.FANS;
  const idx = FANS.findIndex((f) => f.id === fanId);
  if (fanId && idx >= 0 && window.FanProfile) {
    return <window.FanProfile key={fanId} fan={FANS[idx]} index={idx} onBack={() => setFanId(null)} />;
  }
  return <FanList onOpen={(id) => setFanId(id)} />;
}
window.FansScreen = FansScreen;
window.fanTierLabel = fanTierLabel;