/* Northstar — Auto-entitlements: CSV ingest + benefit tiers. */
function EntitlementsScreen() {
  const E = window.NS.ENTITLE;

  return (
    <div>
      <PageHead
        eyebrow="Setup"
        title="STH entitlements"
        desc={`${E.season} — benefits apply automatically at the terminal the moment a fan taps. No app, no scan, no staff decision. Works fully offline.`}
        actions={<><button className="ns-btn ns-btn--secondary"><Icon name="download" size={14} />Export unlinked</button><button className="ns-btn ns-btn--primary"><Icon name="upload" size={14} />Re-upload CSV</button></>}
      />

      {/* Linking summary */}
      <div className="ns-card" style={{ marginBottom: 14 }}>
        <div className="ns-card__head">
          <div className="ns-card__title">Linking progress</div>
          <button className="ns-btn ns-btn--ghost ns-btn--sm" onClick={() => window.nsNewCampaign({ memberships: ["platinum", "gold_full", "gold_half", "silver_plan"], conditions: [] })}><Icon name="message" size={13} />Send SMS to unlinked</button>
        </div>
        <div className="ns-card__body">
          <div style={{ display: "flex", gap: 26, alignItems: "center" }}>
            <div style={{ display: "flex", gap: 26, flex: 1 }}>
              {[
                ["Uploaded", window.NS.fmtNum(E.uploaded), "records", null],
                ["Linked (Gold)", window.NS.fmtNum(E.linked), E.linkedPct + "%", "var(--tier-gold-mark)"],
                ["Unlinked", window.NS.fmtNum(E.unlinked), E.unlinkedPct + "%", "var(--rc-amber-600)"],
                ["Pending excluded", window.NS.fmtNum(E.pendingExcluded), "skipped", "var(--color-text-secondary)"],
              ].map(([l, v, sub, c]) => (
                <div key={l} style={{ borderLeft: c ? `3px solid ${c}` : "3px solid var(--rc-blue-500)", paddingLeft: 12 }}>
                  <div className="ns-eyebrow" style={{ marginBottom: 6 }}>{l}</div>
                  <div className="ns-mono" style={{ fontSize: 24, fontWeight: 600, color: "var(--rc-gray-900)", letterSpacing: "-0.02em" }}>{v}</div>
                  <div className="ns-muted" style={{ fontSize: 11, marginTop: 2 }}>{sub}</div>
                </div>
              ))}
            </div>
            <div style={{ width: 200 }}>
              <div className="ns-spread" style={{ marginBottom: 6 }}><span className="ns-eyebrow">Gold-linked</span><span className="ns-mono ns-strong" style={{ fontSize: 12.5 }}>{E.linkedPct}%</span></div>
              <Progress pct={E.linkedPct} tone="gold" />
              <div className="ns-muted" style={{ fontSize: 10.5, marginTop: 8, lineHeight: 1.45 }}>Unlinked fans resolve on first tap via email prompt → SMS fallback.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="ns-grid" style={{ gridTemplateColumns: "1.2fr 1fr", marginBottom: 14 }}>
        {/* Column mapping */}
        <div className="ns-card">
          <div className="ns-card__head"><div className="ns-card__title">Column mapping</div><Badge tone="success" dot>Saved</Badge></div>
          <div className="ns-table-wrap">
            <table className="ns-table">
              <thead><tr><th>CSV column</th><th></th><th>Northstar field</th><th>Notes</th></tr></thead>
              <tbody>
                {E.mapping.map((m) => {
                  const rejected = m.field.includes("rejected");
                  return (
                    <tr key={m.csv}>
                      <td className="ns-mono" style={{ fontSize: 11.5, color: "var(--color-text-secondary)" }}>{m.csv}</td>
                      <td style={{ width: 24, color: rejected ? "var(--rc-red-500)" : "var(--rc-gray-400)" }}><Icon name={rejected ? "x" : "arrowUpRight"} size={13} /></td>
                      <td>{rejected ? <span style={{ color: "var(--rc-red-600)", fontSize: 11.5, fontWeight: 500 }}>rejected</span> : <span className="ns-mono ns-strong" style={{ fontSize: 11.5 }}>{m.field}</span>}{!rejected && m.req && <span className="ns-muted" style={{ fontSize: 9.5, marginLeft: 6 }}>required</span>}</td>
                      <td className="ns-muted" style={{ fontSize: 11 }}>{m.note}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ingest summary */}
        <div className="ns-card">
          <div className="ns-card__head"><div className="ns-card__title">Last ingest</div><span className="ns-muted" style={{ fontSize: 11 }}>ACTIVE rows only</span></div>
          <div className="ns-card__body" style={{ paddingTop: 8 }}>
            {[
              ["Records ingested", window.NS.fmtNum(E.ingest.ingested), "success", "check"],
              ["Skipped — PENDING status", window.NS.fmtNum(E.ingest.skippedPending), "neutral", "minus"],
              ["Skipped — invalid email + no phone", window.NS.fmtNum(E.ingest.skippedInvalid), "warning", "alert"],
              ["Active entitlements created", window.NS.fmtNum(E.ingest.entitlementsCreated), "info", "zap"],
            ].map(([l, v, tone, icon], i) => (
              <div key={l} className="ns-spread" style={{ padding: "11px 0", borderBottom: i < 3 ? "1px solid var(--color-border-default)" : "none" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "var(--color-text-primary)" }}><Badge tone={tone}><Icon name={icon} size={11} /></Badge>{l}</span>
                <span className="ns-mono ns-strong" style={{ fontSize: 14 }}>{v}</span>
              </div>
            ))}
            <div className="ns-callout ns-callout--info" style={{ marginTop: 14 }}>
              <Icon name="shield" size={15} /><span>Address fields rejected on ingest — never stored. Email lowercased, phone normalised to E.164. Upsert on <span className="ns-mono">membership_id</span>.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="ns-grid" style={{ gridTemplateColumns: "1.3fr 1fr" }}>
        {/* Benefit tiers */}
        <div className="ns-card">
          <div className="ns-card__head"><div className="ns-card__title">Benefit tiers</div><button className="ns-btn ns-btn--ghost ns-btn--sm"><Icon name="plus" size={13} />Add tier</button></div>
          <div className="ns-table-wrap">
            <table className="ns-table">
              <thead><tr><th>Plan code</th><th>Tier</th><th>Benefit</th><th className="ns-num">Members</th><th></th></tr></thead>
              <tbody>
                {E.tiers.map((t) => (
                  <tr key={t.code} className="is-clickable">
                    <td className="ns-mono" style={{ fontSize: 11.5, color: "var(--rc-blue-600)", fontWeight: 600 }}>{t.code}</td>
                    <td className="ns-strong" style={{ fontSize: 12 }}>{t.name}</td>
                    <td style={{ fontSize: 12 }}>{t.benefit}<div className="ns-muted" style={{ fontSize: 10, marginTop: 2 }}>Type A · {t.type}</div></td>
                    <td className="ns-num ns-mono">{window.NS.fmtNum(t.members)}</td>
                    <td style={{ textAlign: "right" }}><span className="ns-muted"><Icon name="edit" size={13} /></span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent redemption activity */}
        <div className="ns-card">
          <div className="ns-card__head"><div className="ns-card__title">Recent activity</div><span className="ns-muted" style={{ fontSize: 11 }}>Benefit value applied</span></div>
          <div className="ns-card__body" style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 14 }}>
            {E.recent.map((r, i) => {
              const max = Math.max(...E.recent.map((x) => x.value));
              return (
                <div key={r.game}>
                  <div className="ns-spread" style={{ marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: "var(--rc-gray-900)", fontWeight: 500 }}>{r.game}</span>
                    <span style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
                      <span className="ns-mono ns-muted" style={{ fontSize: 11 }}>{window.NS.fmtNum(r.redemptions)} redemptions</span>
                      <span className="ns-mono ns-strong" style={{ fontSize: 12.5, minWidth: 64, textAlign: "right" }}>{window.NS.fmtMoney(r.value)}</span>
                    </span>
                  </div>
                  <Progress pct={(r.value / max) * 100} tone="gold" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
window.EntitlementsScreen = EntitlementsScreen;
