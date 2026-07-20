/* Northstar — Sponsorship activation report (Phase 3). */
function SponsorshipScreen() {
  const SPONSORS = window.NS.SPONSORS;
  const [sel, setSel] = React.useState(0);
  const S = SPONSORS[sel];

  const Stat = ({ label, value, sub, tone }) => (
    <div style={{ flex: 1 }}>
      <div className="ns-eyebrow" style={{ marginBottom: 8 }}>{label}</div>
      <div className="ns-mono" style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.02em", color: tone || "var(--rc-gray-900)" }}>{value}</div>
      {sub && <div className="ns-muted" style={{ fontSize: 11, marginTop: 4 }}>{sub}</div>}
    </div>
  );

  const cmpMaxFans = Math.max(S.redeemed, S.baseline.fans);
  const cmpMaxSpend = Math.max(S.attributedSpend, S.baseline.spend);

  return (
    <div>
      <PageHead
        eyebrow="Engage · Phase 3"
        title="Sponsorship activation"
        desc="In-venue activations tied to verified fan purchases — a real count of identified fans who bought, with a measured baseline. Not an impression estimate."
        actions={<><button className="ns-btn ns-btn--secondary"><Icon name="download" size={14} />Export for sponsor</button><button className="ns-btn ns-btn--primary"><Icon name="trophy" size={14} />Add to renewal deck</button></>}
      />

      {/* Sponsor selector */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        {SPONSORS.map((sp, i) => (
          <button
            key={sp.sponsor}
            onClick={() => setSel(i)}
            className={"ns-memchip" + (i === sel ? " is-on" : "")}
            style={{ width: "auto", padding: "7px 12px 7px 8px" }}
          >
            <span style={{ width: 26, height: 26, borderRadius: 6, background: sp.markBg, color: sp.markFg, display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{sp.mark}</span>
            <span className="ns-memchip__meta">
              <span className="ns-memchip__label" style={{ fontWeight: i === sel ? 600 : 500 }}>{sp.sponsor}</span>
              <span className="ns-memchip__sub ns-mono" style={{ color: "var(--rc-green-600)" }}>+{sp.incremental.pct}% lift</span>
            </span>
          </button>
        ))}
      </div>

      {/* Report header */}
      <div className="ns-card" style={{ marginBottom: 14, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", background: "var(--ns-navy)", color: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: 9, background: S.markBg, color: S.markFg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15, letterSpacing: "0.02em" }}>{S.mark}</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.01em" }}>{S.sponsor} — activation report</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 3 }}>{S.game} · {S.activation}</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="ns-eyebrow" style={{ color: "rgba(255,255,255,0.6)" }}>Sections covered</div>
            <div className="ns-mono" style={{ fontSize: 13, marginTop: 5 }}>{S.sections.length ? S.sections.join(" · ") : "All sections"}</div>
          </div>
        </div>
        <div style={{ display: "flex", padding: "20px 22px", gap: 22 }}>
          <Stat label="Offers redeemed" value={window.NS.fmtNum(S.redeemed)} sub="unique identified fans" />
          <div className="ns-divider" style={{ width: 1, height: "auto", alignSelf: "stretch" }} />
          <Stat label="Attributed spend" value={window.NS.fmtMoney(S.attributedSpend)} sub={S.category} />
          <div className="ns-divider" style={{ width: 1, height: "auto", alignSelf: "stretch" }} />
          <Stat label="Incremental lift" value={"+" + S.incremental.pct + "%"} sub={`+${S.incremental.fans} fans · +${window.NS.fmtMoney(S.incremental.spend)} vs baseline`} tone="var(--rc-green-600)" />
        </div>
      </div>

      <div className="ns-grid" style={{ gridTemplateColumns: "1.3fr 1fr", marginBottom: 14 }}>
        {/* Comparison */}
        <div className="ns-card">
          <div className="ns-card__head"><div className="ns-card__title">Activation vs. baseline</div><span className="ns-muted" style={{ fontSize: 11 }}>{S.baselineShort} · same sections, no activation</span></div>
          <div className="ns-card__body" style={{ display: "flex", flexDirection: "column", gap: 20, paddingTop: 18 }}>
            <div>
              <div className="ns-spread" style={{ marginBottom: 8 }}><span className="ns-eyebrow">Unique fans purchasing {S.catWord} ({S.sectionLabel})</span></div>
              {[[`${S.gameShort} · with ${S.sponsor} activation`, S.redeemed, "var(--rc-blue-500)"], [`${S.baselineShort} · baseline`, S.baseline.fans, "var(--rc-gray-400)"]].map(([l, v, c]) => (
                <div key={l} style={{ marginBottom: 11 }}>
                  <div className="ns-spread" style={{ marginBottom: 4 }}><span style={{ fontSize: 11.5, color: "var(--rc-gray-900)" }}>{l}</span><span className="ns-mono ns-strong" style={{ fontSize: 12.5 }}>{window.NS.fmtNum(v)}</span></div>
                  <div className="ns-progress" style={{ height: 10 }}><div className="ns-progress__fill" style={{ width: (v / cmpMaxFans) * 100 + "%", background: c }} /></div>
                </div>
              ))}
            </div>
            <div className="ns-divider" />
            <div>
              <div className="ns-spread" style={{ marginBottom: 8 }}><span className="ns-eyebrow" style={{ textTransform: "capitalize" }}>{S.catWord} spend ({S.sectionLabel})</span></div>
              {[[`${S.gameShort} · with activation`, S.attributedSpend, "var(--rc-blue-500)"], [`${S.baselineShort} · baseline`, S.baseline.spend, "var(--rc-gray-400)"]].map(([l, v, c]) => (
                <div key={l} style={{ marginBottom: 11 }}>
                  <div className="ns-spread" style={{ marginBottom: 4 }}><span style={{ fontSize: 11.5, color: "var(--rc-gray-900)" }}>{l}</span><span className="ns-mono ns-strong" style={{ fontSize: 12.5 }}>{window.NS.fmtMoney(v)}</span></div>
                  <div className="ns-progress" style={{ height: 10 }}><div className="ns-progress__fill" style={{ width: (v / cmpMaxSpend) * 100 + "%", background: c }} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Profile of redeemers */}
        <div className="ns-card">
          <div className="ns-card__head"><div className="ns-card__title">Profile of redeemers</div></div>
          <div className="ns-card__body" style={{ display: "flex", flexDirection: "column", gap: 0, paddingTop: 6, paddingBottom: 6 }}>
            {[
              ["Avg games attended this season", S.profile.avgGames.toFixed(1), "activity"],
              ["Season-ticket-holder share", S.profile.sthShare + "%", "star"],
              ["Avg household spend this game", window.NS.fmtMoney(S.profile.avgSpend, 2), "dollar"],
            ].map(([l, v, icon], i) => (
              <div key={l} className="ns-spread" style={{ padding: "14px 0", borderBottom: i < 2 ? "1px solid var(--color-border-default)" : "none" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "var(--color-text-primary)" }}><span style={{ width: 28, height: 28, borderRadius: 6, background: "var(--rc-gray-100)", color: "var(--color-text-secondary)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Icon name={icon} size={14} /></span>{l}</span>
                <span className="ns-mono ns-strong" style={{ fontSize: 16 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ns-callout ns-callout--info">
        <Icon name="shield" size={16} /><span><strong>Attribution is tied to PAR</strong> — not a coupon code or show-of-phone. The baseline uses the same venue, same sections, and a comparable game. Report exports as PDF and CSV with unique-fan and total-transaction counts clearly separated.</span>
      </div>
    </div>
  );
}
window.SponsorshipScreen = SponsorshipScreen;
