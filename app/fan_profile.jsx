/* Northstar — rich fan profile drill-down. Tabs: Overview · Transactions · Engagement. */

const NS_CAT_COLOR = { beer: "#d68f0c", food: "#bd7842", nonalc: "#4789c5", merch: "#0a2843" };
const NS_CAT_ICON = { beer: "dollar", food: "cart", nonalc: "cart", merch: "tag" };

function ProfileStat({ label, value, sub, tone }) {
  return (
    <div style={{ flex: 1, minWidth: 0, padding: "0 16px", borderLeft: "1px solid var(--color-border-default)" }}>
      <div className="ns-eyebrow" style={{ marginBottom: 7 }}>{label}</div>
      <div className="ns-mono" style={{ fontSize: 19, fontWeight: 600, letterSpacing: "-0.02em", color: tone || "var(--rc-gray-900)" }}>{value}</div>
      {sub && <div className="ns-muted" style={{ fontSize: 10.5, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function ChurnBadge({ risk }) {
  const map = { High: "danger", Elevated: "warning", Low: "success", Minimal: "success" };
  return <Badge tone={map[risk] || "neutral"}><Icon name="shield" size={11} />{risk} churn risk</Badge>;
}

function FanProfile({ fan, onBack, index }) {
  const [tab, setTab] = React.useState(() => { const t = window.__nsProfileTab; window.__nsProfileTab = null; return t || "overview"; });
  const d = React.useMemo(() => window.NS.enrichFan(fan), [fan.id]);
  const hh = window.NS.HOUSEHOLDS[fan.id];
  const benefitPct = fan.benefitOf ? Math.round((fan.benefitGames / fan.benefitOf) * 100) : 0;
  const catSegs = d.spendByCategory.map((c) => ({ label: c.label, value: c.value, color: NS_CAT_COLOR[c.cat] }));
  const txTotal = d.transactions.reduce((s, t) => s + t.total, 0);
  const avgBasket = d.transactions.length ? txTotal / d.transactions.length : 0;

  const seedAud = { memberships: fan.sth ? (/platinum/i.test(fan.sth) ? ["platinum"] : ["gold_full", "gold_half"]) : ["nonsth_regular"], conditions: [] };

  return (
    <div>
      <button className="ns-btn ns-btn--ghost ns-btn--sm" style={{ marginBottom: 14, paddingLeft: 6 }} onClick={onBack}>
        <span style={{ transform: "rotate(180deg)", display: "inline-flex" }}><Icon name="chevRight" size={14} /></span>Fan profiles
      </button>

      {/* Header */}
      <div className="ns-card ns-card--pad" style={{ marginBottom: 14 }}>
        <div className="ns-spread" style={{ alignItems: "flex-start", marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <Avatar name={fan.name} seed={index} size={52} />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                <h1 style={{ fontSize: 21, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--rc-gray-900)" }}>{fan.name}</h1>
                <Tier tier={fan.tier} />
                <ChurnBadge risk={d.churnRisk} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <span className="ns-fan-id">#{fan.id}</span>
                {fan.sth ? <span className="ns-muted" style={{ fontSize: 12 }}><Icon name="star" size={12} style={{ verticalAlign: "-2px", marginRight: 4 }} />{fan.sth}</span>
                  : <span className="ns-muted" style={{ fontSize: 12 }}>Non-STH · recognized fan</span>}
                {fan.renewal && <span className="ns-muted" style={{ fontSize: 12 }}>Renewal {fan.renewal}</span>}
                <span className="ns-muted" style={{ fontSize: 12 }}>Fan since {fan.joined}</span>
                {hh && <button className="ns-fan-hh" onClick={() => setTab("household")} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--rc-blue-600)", background: "var(--rc-blue-100)", border: "none", borderRadius: "var(--radius-pill)", padding: "3px 10px", cursor: "pointer", fontWeight: 500 }}><Icon name="users" size={12} />{hh.name} · Primary holder</button>}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="ns-btn ns-btn--secondary" onClick={() => window.nsNewCampaign(seedAud)}><Icon name="message" size={14} />Send SMS</button>
            <button className="ns-btn ns-btn--secondary"><Icon name="gift" size={14} />Adjust points</button>
            <button className="ns-btn ns-btn--primary"><Icon name="download" size={14} />Export</button>
          </div>
        </div>
        {/* venue stat strip */}
        <div style={{ display: "flex", borderTop: "1px solid var(--color-border-default)", paddingTop: 16 }}>
          <div style={{ flex: 1, minWidth: 0, paddingRight: 16 }}>
            <div className="ns-eyebrow" style={{ marginBottom: 7 }}>Lifetime value</div>
            <div className="ns-mono" style={{ fontSize: 19, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--rc-blue-600)" }}>{window.NS.fmtMoney(d.ltv)}</div>
            <div className="ns-muted" style={{ fontSize: 10.5, marginTop: 3 }}>{fan.allGames} games all-time</div>
          </div>
          <ProfileStat label="This season" value={window.NS.fmtMoney(fan.totalSeason)} sub={`${fan.seasonGames} games`} />
          <ProfileStat label="Avg / game" value={window.NS.fmtMoney(fan.avgSeason)} sub={`all-time ${window.NS.fmtMoney(fan.avgAll)}`} />
          <ProfileStat label="Loyalty" value={window.NS.fmtNum(fan.points) + " pts"} sub={fan.points >= 5000 ? "Gold rewards" : "building"} />
          <ProfileStat label="Benefit use" value={fan.benefitOf ? benefitPct + "%" : "n/a"} sub={fan.benefitOf ? `${fan.benefitGames}/${fan.benefitOf} games` : "non-member"} />
          <ProfileStat label="Top category" value={d.favoriteCat.label} sub={window.NS.fmtMoney(d.favoriteCat.value) + " season"} />
        </div>
      </div>

      {/* tabs */}
      <div className="ns-tabs" style={{ marginBottom: 16 }}>
        {[["overview", "Overview"], ["transactions", "Transactions", d.transactions.length], ["engagement", "Engagement"], ...(hh ? [["household", "Household", hh.members.length]] : [])].map(([id, label, count]) => (
          <button key={id} className={"ns-tab" + (tab === id ? " is-active" : "")} onClick={() => setTab(id)}>{label}{count != null && <span className="ns-tab__count">{count}</span>}</button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab fan={fan} d={d} catSegs={catSegs} benefitPct={benefitPct} onSeeTx={() => setTab("transactions")} />}
      {tab === "transactions" && <TransactionsTab fan={fan} d={d} txTotal={txTotal} avgBasket={avgBasket} />}
      {tab === "engagement" && <EngagementTab fan={fan} d={d} benefitPct={benefitPct} />}
      {tab === "household" && hh && <window.HouseholdTab fan={fan} hh={hh} />}
    </div>
  );
}

// ---------------- Overview ----------------
function OverviewTab({ fan, d, catSegs, benefitPct, onSeeTx }) {
  const catTotal = catSegs.reduce((s, c) => s + c.value, 0);
  return (
    <div>
      {/* Next best action */}
      <div className="ns-card" style={{ marginBottom: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, borderLeft: "3px solid var(--ns-accent)" }}>
        <span style={{ width: 34, height: 34, borderRadius: 8, background: "var(--rc-blue-100)", color: "var(--rc-blue-600)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="sparkle" size={17} /></span>
        <div style={{ flex: 1 }}>
          <div className="ns-eyebrow" style={{ marginBottom: 3 }}>Recommended next action</div>
          <div style={{ fontSize: 13, color: "var(--rc-gray-900)", fontWeight: 500 }}>{d.nextBest}</div>
        </div>
        <button className="ns-btn ns-btn--primary ns-btn--sm" onClick={() => window.nsNewCampaign({ memberships: fan.sth ? ["gold_full", "gold_half"] : ["nonsth_regular"], conditions: [] })}>Act on this</button>
      </div>

      {fan.flags.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          {fan.flags.map((fl, i) => <Badge key={i} tone="danger"><Icon name="flag" size={11} />{fl}</Badge>)}
        </div>
      )}

      {/* spend over time + by category */}
      <div className="ns-grid" style={{ gridTemplateColumns: "1.6fr 1fr", marginBottom: 14 }}>
        <div className="ns-card">
          <div className="ns-card__head"><div className="ns-card__title">Spend per game</div><span className="ns-muted" style={{ fontSize: 11 }}>this season · {fan.seasonGames} attended</span></div>
          <div className="ns-card__body"><BarChart data={d.spendByGame} valueKey="v" labelKey="game" height={210} prefix="$" /></div>
        </div>
        <div className="ns-card">
          <div className="ns-card__head"><div className="ns-card__title">Spend by category</div></div>
          <div className="ns-card__body" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <Donut segments={catSegs} centerLabel={window.NS.fmtMoney(catTotal)} centerSub="season" />
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 7 }}>
              {catSegs.map((c) => (
                <div key={c.label} className="ns-spread">
                  <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--rc-gray-900)" }}><span style={{ width: 9, height: 9, borderRadius: "50%", background: c.color }} />{c.label}</span>
                  <span style={{ display: "flex", gap: 10, alignItems: "baseline" }}><span className="ns-mono ns-muted" style={{ fontSize: 10.5 }}>{Math.round((c.value / catTotal) * 100)}%</span><span className="ns-mono ns-strong" style={{ fontSize: 12 }}>{window.NS.fmtMoney(c.value)}</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* most purchased + recent tx */}
      <div className="ns-grid" style={{ gridTemplateColumns: "1fr 1.3fr" }}>
        <div className="ns-card">
          <div className="ns-card__head"><div className="ns-card__title">Most purchased</div></div>
          <div className="ns-card__body" style={{ display: "flex", flexDirection: "column", gap: 11, paddingTop: 14 }}>
            {d.topSKUs.slice(0, 6).map((it, i) => (
              <div key={i} className="ns-spread">
                <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <span style={{ width: 24, height: 24, borderRadius: 6, background: NS_CAT_COLOR[it.cat] + "22", color: NS_CAT_COLOR[it.cat], display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name={NS_CAT_ICON[it.cat]} size={13} /></span>
                  <span style={{ minWidth: 0 }}><span style={{ display: "block", fontSize: 12, color: "var(--rc-gray-900)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.name}</span><span className="ns-muted" style={{ fontSize: 10 }}>{it.label} · {it.qty}× this season</span></span>
                </span>
                <span className="ns-mono ns-strong" style={{ fontSize: 12 }}>{window.NS.fmtMoney(it.total)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="ns-card">
          <div className="ns-card__head"><div className="ns-card__title">Recent transactions</div><button className="ns-btn ns-btn--ghost ns-btn--sm" onClick={onSeeTx}>View all<Icon name="chevRight" size={13} /></button></div>
          <div className="ns-card__body" style={{ paddingTop: 6, paddingBottom: 6 }}>
            {d.transactions.slice(0, 4).map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: i < 3 ? "1px solid var(--color-border-default)" : "none", alignItems: "center" }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 12, color: "var(--rc-gray-900)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.items.map((it) => (it.qty > 1 ? it.qty + "× " : "") + it.name.split(" · ")[0]).join(", ")}</div>
                  <div className="ns-muted" style={{ fontSize: 10.5, marginTop: 2 }}>{t.game} · {t.date} · {t.stand.split(" · ")[0]}</div>
                </div>
                {t.benefit > 0 && <span className="ns-mono" style={{ fontSize: 10.5, color: "var(--rc-green-600)" }}>−{window.NS.fmtMoney(t.benefit, 2)}</span>}
                <span className="ns-mono ns-strong" style={{ fontSize: 12.5, minWidth: 52, textAlign: "right" }}>{window.NS.fmtMoney(t.total, 2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- Transactions ----------------
function TransactionsTab({ fan, d, txTotal, avgBasket }) {
  return (
    <div>
      <div className="ns-kpis" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 14 }}>
        <Kpi icon="cart" label="Transactions (shown)" value={String(d.transactions.length)} delta="recent games" dir="flat" />
        <Kpi icon="dollar" label="Spend (shown)" value={window.NS.fmtMoney(txTotal, 2)} delta="net of benefits" dir="flat" />
        <Kpi icon="tag" label="Avg basket" value={window.NS.fmtMoney(avgBasket, 2)} delta="per visit" dir="flat" />
        <Kpi icon="gift" label="Benefit saved" value={window.NS.fmtMoney(d.transactions.reduce((s, t) => s + t.benefit, 0), 2)} delta="this season" dir="flat" />
      </div>
      <div className="ns-card">
        <div className="ns-card__head"><div className="ns-card__title">Transaction history</div><button className="ns-btn ns-btn--secondary ns-btn--sm"><Icon name="download" size={13} />Export</button></div>
        <div className="ns-table-wrap">
          <table className="ns-table">
            <thead><tr><th>Game</th><th>Date</th><th>Stand</th><th>Items</th><th className="ns-num">Subtotal</th><th className="ns-num">Benefit</th><th className="ns-num">Points</th><th className="ns-num">Total</th><th>Rating</th></tr></thead>
            <tbody>
              {d.transactions.map((t, i) => (
                <tr key={i}>
                  <td className="ns-strong ns-mono">{t.game}</td>
                  <td className="ns-muted" style={{ fontSize: 11.5 }}>{t.date}</td>
                  <td className="ns-muted" style={{ fontSize: 11.5 }}>{t.stand.split(" · ")[0]}</td>
                  <td style={{ maxWidth: 240 }}>
                    {t.items.map((it, j) => <div key={j} style={{ fontSize: 11.5, color: "var(--rc-gray-900)" }}>{it.qty}× {it.name}</div>)}
                  </td>
                  <td className="ns-num ns-mono ns-muted">{window.NS.fmtMoney(t.subtotal, 2)}</td>
                  <td className="ns-num ns-mono" style={{ color: t.benefit > 0 ? "var(--rc-green-600)" : "var(--color-text-secondary)" }}>{t.benefit > 0 ? "−" + window.NS.fmtMoney(t.benefit, 2) : "—"}</td>
                  <td className="ns-num ns-mono" style={{ color: "var(--rc-blue-600)" }}>+{t.points}</td>
                  <td className="ns-num ns-mono ns-strong">{window.NS.fmtMoney(t.total, 2)}</td>
                  <td>{t.sent != null ? <span className="ns-mono" style={{ fontSize: 11.5, color: t.sent >= 7 ? "var(--rc-green-600)" : t.sent >= 5 ? "var(--rc-amber-600)" : "var(--rc-red-600)" }}>{t.sent.toFixed(1)}</span> : <span className="ns-muted">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---------------- Engagement ----------------
function EngagementTab({ fan, d, benefitPct }) {
  return (
    <div>
      <div className="ns-grid" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: 14 }}>
        {/* benefit + loyalty */}
        <div className="ns-card ns-card--pad">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 16 }}>
            <div>
              <div className="ns-eyebrow" style={{ marginBottom: 8 }}>Benefit utilization</div>
              {fan.benefitOf ? <>
                <div className="ns-mono ns-strong" style={{ fontSize: 20, color: "var(--rc-gray-900)" }}>{benefitPct}%</div>
                <div className="ns-muted" style={{ fontSize: 11, margin: "3px 0 8px" }}>{fan.benefitGames} of {fan.benefitOf} games</div>
                <Progress pct={benefitPct} tone="gold" />
              </> : <div className="ns-muted" style={{ fontSize: 12 }}>Non-member — no entitlement</div>}
            </div>
            <div>
              <div className="ns-eyebrow" style={{ marginBottom: 8 }}>Loyalty balance</div>
              <div className="ns-mono ns-strong" style={{ fontSize: 20, color: "var(--tier-gold-mark)" }}>{window.NS.fmtNum(fan.points)}</div>
              <div className="ns-muted" style={{ fontSize: 11, margin: "3px 0 8px" }}>points</div>
              <Progress pct={Math.min(100, (fan.points / 10000) * 100)} />
            </div>
          </div>
          <div className="ns-divider" style={{ marginBottom: 12 }} />
          <div className="ns-eyebrow" style={{ marginBottom: 10 }}>Points ledger</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {d.ledger.map((l, i) => (
              <div key={i} className="ns-spread">
                <span style={{ fontSize: 12, color: "var(--rc-gray-900)", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 18, height: 18, borderRadius: 5, display: "inline-flex", alignItems: "center", justifyContent: "center", background: l.delta > 0 ? "var(--rc-green-100)" : "var(--rc-blue-100)", color: l.delta > 0 ? "var(--rc-green-600)" : "var(--rc-blue-600)" }}><Icon name={l.delta > 0 ? "plus" : "gift"} size={11} /></span>
                  {l.label}
                </span>
                <span className="ns-mono ns-strong" style={{ fontSize: 12, color: l.delta > 0 ? "var(--rc-green-600)" : "var(--rc-red-600)" }}>{l.delta > 0 ? "+" : ""}{window.NS.fmtNum(l.delta)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* sentiment history */}
        <div className="ns-card">
          <div className="ns-card__head"><div className="ns-card__title">Sentiment history</div><SentTag trend={fan.sentTrend} /></div>
          <div className="ns-card__body" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <SentLine data={fan.sentiment} w={300} h={80} />
            {fan.sentTrend === "down" && <div className="ns-callout ns-callout--info" style={{ width: "100%", padding: "10px 12px", background: "var(--rc-red-100)", color: "var(--rc-red-600)" }}><Icon name="alert" size={14} /><span>Two-game weighted decline. Recovery credit auto-issued at last visit.</span></div>}
          </div>
        </div>
      </div>

      <div className="ns-grid" style={{ gridTemplateColumns: "1.4fr 1fr" }}>
        {/* campaigns received */}
        <div className="ns-card">
          <div className="ns-card__head"><div className="ns-card__title">Messages &amp; campaigns</div></div>
          <div className="ns-table-wrap">
            <table className="ns-table">
              <thead><tr><th>Campaign</th><th>Channel</th><th>Status</th><th>Response</th></tr></thead>
              <tbody>
                {d.campaigns.map((c, i) => (
                  <tr key={i}>
                    <td className="ns-strong" style={{ fontSize: 12 }}>{c.name}</td>
                    <td><Badge tone="neutral">{c.channel}</Badge></td>
                    <td className="ns-muted" style={{ fontSize: 11.5 }}>{c.status}</td>
                    <td>{c.responded ? <Badge tone="success" dot>Transacted</Badge> : <span className="ns-muted" style={{ fontSize: 11.5 }}>No visit</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* attendance + devices */}
        <div className="ns-card ns-card--pad">
          <div className="ns-eyebrow" style={{ marginBottom: 10 }}>Attendance · all-time</div>
          <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
            {[["Home", d.attendance.home], ["Away", d.attendance.away], ["Playoff", d.attendance.playoff]].map(([l, v]) => (
              <div key={l}><div className="ns-mono ns-strong" style={{ fontSize: 18, color: "var(--rc-gray-900)" }}>{v}</div><div className="ns-muted" style={{ fontSize: 10.5 }}>{l}</div></div>
            ))}
            <div style={{ marginLeft: "auto", textAlign: "right" }}><div className="ns-mono ns-strong" style={{ fontSize: 18, color: "var(--rc-blue-600)" }}>{d.attendance.streak}</div><div className="ns-muted" style={{ fontSize: 10.5 }}>game streak</div></div>
          </div>
          <div className="ns-spread">
            <span className="ns-muted" style={{ fontSize: 11.5 }}>Favorite stand</span>
            <span style={{ fontSize: 12, color: "var(--rc-gray-900)", fontWeight: 500 }}>{d.favoriteStand}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

window.FanProfile = FanProfile;
