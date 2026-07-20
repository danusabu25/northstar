/* Northstar — Household / Family Unit view inside the fan profile.
   Surfaces members & roles, pooled points + pooling mode, per-member
   engagement / at-risk, per-seat attendance, and combined household value. */

const NS_ROLE = {
  primary: { label: "Primary holder", icon: "star", perms: { earn: 1, redeem: 1, manage: 1, campaigns: 1 } },
  full:    { label: "Member · full", icon: "user", perms: { earn: 1, redeem: 1, manage: 0, campaigns: 1 } },
  earn:    { label: "Member · earn only", icon: "user", perms: { earn: 1, redeem: 0, manage: 0, campaigns: 1 } },
  view:    { label: "View only", icon: "eye", perms: { earn: 0, redeem: 0, manage: 0, campaigns: 1 } },
};
const NS_HH_STATUS = { engaged: "success", building: "info", "at-risk": "danger" };
const NS_POOL_MODES = [
  { id: "pooled", label: "Pooled", sub: "All member activity contributes to one shared balance" },
  { id: "split", label: "Individual + pool", sub: "Each member keeps a sub-balance; 10% flows up to the household pool" },
  { id: "individual", label: "Individual only", sub: "Members earn and redeem separately — household is for reporting only" },
];

function HouseholdStat({ label, value, sub, tone, first }) {
  return (
    <div style={{ flex: 1, minWidth: 0, padding: first ? "0 16px 0 0" : "0 16px", borderLeft: first ? "none" : "1px solid var(--color-border-default)" }}>
      <div className="ns-eyebrow" style={{ marginBottom: 7 }}>{label}</div>
      <div className="ns-mono" style={{ fontSize: 19, fontWeight: 600, letterSpacing: "-0.02em", color: tone || "var(--rc-gray-900)" }}>{value}</div>
      {sub && <div className="ns-muted" style={{ fontSize: 10.5, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function HouseholdTab({ fan, hh }) {
  const [mode, setMode] = React.useState(hh.poolingMode);
  const atRisk = hh.members.filter((m) => m.status === "at-risk");
  const activeMembers = hh.members.filter((m) => m.attended > 0).length;

  return (
    <div>
      {/* Summary banner */}
      <div className="ns-card ns-card--pad" style={{ marginBottom: 14 }}>
        <div className="ns-spread" style={{ alignItems: "flex-start", marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <span style={{ width: 46, height: 46, borderRadius: 10, background: "var(--rc-blue-100)", color: "var(--rc-blue-600)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="users" size={24} /></span>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                <h2 style={{ fontSize: 19, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--rc-gray-900)" }}>{hh.name}</h2>
                <Badge tone="info"><Icon name="gift" size={11} />{NS_POOL_MODES.find((p) => p.id === mode).label}</Badge>
                {hh.risk === "partial" && <Badge tone="warning"><Icon name="alert" size={11} />Partially at-risk</Badge>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <span className="ns-fan-id">{hh.id}</span>
                <span className="ns-muted" style={{ fontSize: 12 }}><Icon name="link" size={12} style={{ verticalAlign: "-2px", marginRight: 4 }} />Season-ticket account {hh.account}</span>
                <span className="ns-muted" style={{ fontSize: 12 }}>{hh.members.length} linked members · {activeMembers} attending</span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="ns-btn ns-btn--secondary"><Icon name="plus" size={14} />Invite member</button>
            <button className="ns-btn ns-btn--secondary"><Icon name="sliders" size={14} />Manage household</button>
          </div>
        </div>
        <div style={{ display: "flex", borderTop: "1px solid var(--color-border-default)", paddingTop: 16 }}>
          <HouseholdStat first label="Combined lifetime value" value={window.NS.fmtMoney(hh.combinedLtv)} sub="all members · all-time" tone="var(--rc-blue-600)" />
          <HouseholdStat label="This season spend" value={window.NS.fmtMoney(hh.combinedSeasonSpend)} sub={`+ ${window.NS.fmtMoney(hh.renewalValue)} renewal`} />
          <HouseholdStat label="Pooled points" value={window.NS.fmtNum(hh.pooledPoints)} sub={`${window.NS.fmtNum(hh.redeemedSeason)} redeemed this season`} tone="var(--tier-gold-mark)" />
          <HouseholdStat label="Members attending" value={`${activeMembers} / ${hh.members.length}`} sub={atRisk.length ? `${atRisk.length} never scanned` : "all active"} tone={atRisk.length ? "var(--rc-red-600)" : "var(--rc-gray-900)"} />
        </div>
      </div>

      {/* At-risk callout */}
      {atRisk.length > 0 && (
        <div className="ns-card" style={{ marginBottom: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, borderLeft: "3px solid var(--rc-red-500)" }}>
          <span style={{ width: 34, height: 34, borderRadius: 8, background: "var(--rc-red-100)", color: "var(--rc-red-600)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="alert" size={17} /></span>
          <div style={{ flex: 1 }}>
            <div className="ns-eyebrow" style={{ marginBottom: 3 }}>At-risk member detected</div>
            <div style={{ fontSize: 13, color: "var(--rc-gray-900)", fontWeight: 500 }}>{atRisk.map((m) => m.name).join(", ")} holds seat {atRisk[0].seat} but hasn't scanned a ticket this season — invisible to attendance inside an otherwise active household.</div>
          </div>
          <button className="ns-btn ns-btn--primary ns-btn--sm" onClick={() => window.nsNewCampaign({ memberships: ["gold_full", "gold_half"], conditions: [{ dim: "recency_not_last", val: 4 }] })}>Re-engage</button>
        </div>
      )}

      {/* Members table */}
      <div className="ns-card" style={{ marginBottom: 14 }}>
        <div className="ns-card__head"><div className="ns-card__title">Household members</div><span className="ns-muted" style={{ fontSize: 11 }}>Roles set by the primary holder · per-seat attendance</span></div>
        <div className="ns-table-wrap">
          <table className="ns-table">
            <thead><tr><th>Member</th><th>Role</th><th>Linked seat</th><th>Attendance · season</th><th className="ns-num">Points contributed</th><th>Status</th></tr></thead>
            <tbody>
              {hh.members.map((m, i) => {
                const role = NS_ROLE[m.role];
                const pct = hh.seasonGames ? Math.round((m.attended / hh.seasonGames) * 100) : 0;
                const isSelf = m.fanId === fan.id;
                const linkable = m.fanId && !isSelf;
                return (
                  <tr key={m.name} className={linkable ? "is-clickable" : ""} onClick={linkable ? () => window.nsOpenFan(m.fanId) : undefined} style={m.status === "at-risk" ? { background: "var(--rc-red-100)" } : undefined}>
                    <td>
                      <div className="ns-cell-fan">
                        <Avatar name={m.name} seed={i + 3} />
                        <div><div className="ns-cell-fan__name">{m.name}{isSelf && <span className="ns-muted" style={{ fontWeight: 400, marginLeft: 6 }}>· this profile</span>}</div><div className="ns-cell-fan__sub">{m.lastGame === "—" ? "Never scanned" : "Last seen " + m.lastGame}</div></div>
                      </div>
                    </td>
                    <td><span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: m.role === "primary" ? "var(--rc-gray-900)" : "var(--color-text-primary)", fontWeight: m.role === "primary" ? 600 : 400 }}><Icon name={role.icon} size={13} style={{ color: m.role === "primary" ? "var(--tier-gold-mark)" : "var(--color-text-secondary)" }} />{role.label}</span></td>
                    <td className="ns-mono" style={{ fontSize: 11.5, color: "var(--color-text-secondary)" }}>{m.seat}</td>
                    <td style={{ minWidth: 150 }}>
                      <div className="ns-spread" style={{ marginBottom: 4 }}><span className="ns-mono" style={{ fontSize: 11.5, color: m.attended ? "var(--rc-gray-900)" : "var(--rc-red-600)" }}>{m.attended} / {hh.seasonGames} games</span><span className="ns-mono ns-muted" style={{ fontSize: 10.5 }}>{pct}%</span></div>
                      <Progress pct={pct} tone={m.status === "at-risk" ? null : "gold"} />
                    </td>
                    <td className="ns-num ns-mono ns-strong" style={{ color: m.points ? "var(--rc-gray-900)" : "var(--color-text-tertiary)" }}>{m.points ? window.NS.fmtNum(m.points) : "—"}</td>
                    <td><Badge tone={NS_HH_STATUS[m.status]} dot={m.status !== "at-risk"}>{m.status}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="ns-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {/* Pooling mode */}
        <div className="ns-card ns-card--pad">
          <div className="ns-spread" style={{ marginBottom: 14, alignItems: "baseline" }}>
            <div className="ns-eyebrow">Points pooling</div>
            <div style={{ textAlign: "right" }}><span className="ns-mono ns-strong" style={{ fontSize: 22, color: "var(--tier-gold-mark)" }}>{window.NS.fmtNum(hh.pooledPoints)}</span><span className="ns-muted" style={{ fontSize: 11, marginLeft: 5 }}>pts pooled</span></div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {NS_POOL_MODES.map((p) => (
              <button key={p.id} className={"ns-memchip" + (mode === p.id ? " is-on" : "")} style={{ width: "100%", alignItems: "flex-start", padding: 12 }} onClick={() => setMode(p.id)}>
                <span style={{ width: 18, height: 18, borderRadius: "50%", border: "1.5px solid " + (mode === p.id ? "var(--ns-accent)" : "var(--rc-gray-400)"), background: mode === p.id ? "var(--ns-accent)" : "transparent", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{mode === p.id && <Icon name="check" size={11} stroke={2.6} />}</span>
                <span className="ns-memchip__meta">
                  <span className="ns-memchip__label">{p.label}{p.id === hh.poolingMode && <span className="ns-muted" style={{ fontWeight: 400, marginLeft: 6 }}>· program default</span>}</span>
                  <span className="ns-memchip__sub" style={{ whiteSpace: "normal", lineHeight: 1.4 }}>{p.sub}</span>
                </span>
              </button>
            ))}
          </div>
          <div className="ns-muted" style={{ fontSize: 10.5, marginTop: 12, lineHeight: 1.5 }}>Set at the program level by the merchant. Any authorised member can redeem from the shared balance within their role limits.</div>
        </div>

        {/* Roles & permissions */}
        <div className="ns-card">
          <div className="ns-card__head"><div className="ns-card__title">Roles &amp; permissions</div><Icon name="shield" size={15} style={{ color: "var(--color-text-secondary)" }} /></div>
          <div className="ns-table-wrap">
            <table className="ns-table">
              <thead><tr><th>Role</th><th style={{ textAlign: "center" }}>Earn</th><th style={{ textAlign: "center" }}>Redeem</th><th style={{ textAlign: "center" }}>Manage</th><th style={{ textAlign: "center" }}>Campaigns</th></tr></thead>
              <tbody>
                {Object.keys(NS_ROLE).map((k) => {
                  const r = NS_ROLE[k];
                  const used = hh.members.some((m) => m.role === k);
                  return (
                    <tr key={k} style={used ? undefined : { opacity: 0.45 }}>
                      <td style={{ fontSize: 12, color: "var(--rc-gray-900)", whiteSpace: "nowrap" }}><Icon name={r.icon} size={12} style={{ verticalAlign: "-1px", marginRight: 6, color: "var(--color-text-secondary)" }} />{r.label}</td>
                      {["earn", "redeem", "manage", "campaigns"].map((perm) => (
                        <td key={perm} style={{ textAlign: "center" }}>
                          {r.perms[perm]
                            ? <Icon name="check" size={14} stroke={2.4} style={{ color: "var(--rc-green-600)" }} />
                            : <Icon name="x" size={13} stroke={2} style={{ color: "var(--rc-gray-300)" }} />}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="ns-muted" style={{ fontSize: 10.5, padding: "10px 16px 0", lineHeight: 1.5 }}>The merchant may cap the maximum permissions per role — e.g. disallow redemption by non-primary members.</div>
        </div>
      </div>
    </div>
  );
}

window.HouseholdTab = HouseholdTab;
