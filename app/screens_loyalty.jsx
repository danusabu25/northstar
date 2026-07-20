/* Northstar — Loyalty: template-first. Programs tab is primary. */
function LoyaltyScreen() {
  const L = window.NS.LOYALTY;
  const [tab, setTab] = React.useState(() => {
    try { return localStorage.getItem("ns-loyalty-tab") || "programs"; } catch (e) { return "programs"; }
  });
  const [progWiz, setProgWiz] = React.useState(null); // null | 'new' | templateId
  const go = (t) => { setTab(t); try { localStorage.setItem("ns-loyalty-tab", t); } catch (e) {} };
  React.useEffect(() => { window.nsGoLoyaltyTab = go; return () => { delete window.nsGoLoyaltyTab; }; }, []);

  const activePrograms = L.activePrograms.filter((p) => p.status === "active").length;
  const TABS = [
    { id: "programs", label: "Programs", icon: "star", count: L.activePrograms.length },
    { id: "templates", label: "Template library", icon: "gift" },
    { id: "rules", label: "Rules", icon: "sliders", count: L.rules.length },
    { id: "redeem", label: "Redemption", icon: "gift", count: L.catalog.length },
    { id: "tiers", label: "Tiers & segments", icon: "trophy" },
    { id: "conflict", label: "Conflict resolution", icon: "shield" },
  ];

  return (
    <div>
      <PageHead
        eyebrow="Engage"
        title="Loyalty"
        desc="Template-first loyalty programs — operators pick a program, set business values, and review the fan experience before anything goes live. Advanced operators can build custom rules."
        actions={<>
          <button className="ns-btn ns-btn--ghost ns-btn--sm" onClick={() => window.nsNewLoyaltyRule && window.nsNewLoyaltyRule()}><Icon name="sliders" size={13}/>Custom rule builder</button>
          <button className="ns-btn ns-btn--primary" onClick={() => setProgWiz("new")}><Icon name="plus" size={14}/>Add program</button>
        </>}
      />

      <div className="ns-kpis" style={{ gridTemplateColumns: "repeat(5, 1fr)", marginBottom: 16 }}>
        <Kpi hero icon="star" label="Active programs" value={String(activePrograms)} delta={"of " + L.activePrograms.length + " configured"} dir="flat" />
        <Kpi icon="sparkle" label="Points issued" value="4.82M" delta="this season" dir="flat" />
        <Kpi icon="gift" label="Points redeemed" value="1.24M" delta={L.redeemRate + "% redemption"} dir="up" hint="" />
        <Kpi icon="dollar" label="Outstanding liability" value={window.NS.fmtMoney(L.liability)} delta="points value owed" dir="flat" />
        <Kpi icon="trophy" label="Avg balance / member" value={window.NS.fmtNum(L.avgBalance)} delta="points" dir="flat" />
      </div>

      <div className="ns-tabs" style={{ marginBottom: 16 }}>
        {TABS.map((t) => (
          <button key={t.id} className={"ns-tab" + (tab === t.id ? " is-active" : "")} onClick={() => go(t.id)}>
            <Icon name={t.icon} size={14} />{t.label}
            {t.count != null && <span className="ns-tab__count">{t.count}</span>}
          </button>
        ))}
      </div>

      {tab === "programs" && <ProgramsTab onAdd={() => setProgWiz("new")} onAddTemplate={(id) => setProgWiz(id)} />}
      {tab === "templates" && <TemplatesTab onUse={(id) => { setProgWiz(id); go("programs"); }} />}
      {tab === "rules" && <RulesTab />}
      {tab === "redeem" && <RedeemTab />}
      {tab === "tiers" && <TiersTab />}
      {tab === "conflict" && <ConflictTab />}

      {progWiz && <LoyaltyProgramWizard onClose={() => setProgWiz(null)} presetTemplate={progWiz !== "new" ? progWiz : null} />}
    </div>
  );
}

function ProgramsTab({ onAdd, onAddTemplate }) {
  const L = window.NS.LOYALTY;
  const [over, setOver] = React.useState({});
  const [confirmPause, setConfirmPause] = React.useState(null);
  const statusOf = (p) => over[p.id] || p.status;
  const setS = (id, s) => setOver((o) => ({ ...o, [id]: s }));

  return (
    <div>
      <div className="ns-grid" style={{ gridTemplateColumns: "1.6fr 1fr" }}>
        {/* Active programs */}
        <div className="ns-card">
          <div className="ns-card__head">
            <div><div className="ns-card__title">Active programs</div><div className="ns-card__sub">Each program is built from a template — click to edit values or review fan preview</div></div>
            <div style={{ display:"flex", gap:8 }}>
              <button className="ns-btn ns-btn--ghost ns-btn--sm" onClick={() => window.nsGoLoyaltyTab && window.nsGoLoyaltyTab("rules")}><Icon name="sliders" size={13}/>View all rules</button>
              <button className="ns-btn ns-btn--primary ns-btn--sm" onClick={onAdd}><Icon name="plus" size={13}/>Add program</button>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {L.activePrograms.map((p, i) => {
              const st = statusOf(p);
              const pct = p.costCap ? Math.min(100, (p.cost / p.costCap) * 100) : 0;
              return (
                <div key={p.id} className="ns-progrow" style={{ borderTop: i > 0 ? "1px solid var(--color-border-default)" : "none" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="ns-spread" style={{ marginBottom: 6 }}>
                      <span className="ns-strong" style={{ fontSize: 13 }}>{p.name}</span>
                      <span className={"ns-badge ns-badge--" + (st === "active" ? "success" : st === "scheduled" ? "info" : "neutral")} style={{ fontSize: 10 }}>{st === "active" ? <span className="ns-badge__dot" style={{ background: "currentColor" }} /> : null}{st}</span>
                    </div>
                    <div className="ns-muted" style={{ fontSize: 10.5, marginBottom: 10 }}>{p.desc}</div>

                    {/* Today / season stats — PRD Step 8 */}
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom: p.costCap ? 10 : 0 }}>
                      {[
                        ["sparkle","Points", p.pointsToday!=null ? window.NS.fmtNum(p.pointsToday)+" today" : null, window.NS.fmtNum(p.pointsIssued)+" season"],
                        ["gift","Redemptions", p.redemptionsToday!=null ? window.NS.fmtNum(p.redemptionsToday)+" today" : null, window.NS.fmtNum(p.redemptions)+" season"],
                        ["dollar","Cost", p.costToday!=null ? window.NS.fmtMoney(p.costToday)+" today" : null, window.NS.fmtMoney(p.cost)+" season"],
                      ].map(([ic, lbl, today, season]) => (
                        <div key={lbl} style={{ background:"var(--rc-gray-050)", border:"1px solid var(--color-border-default)", borderRadius:5, padding:"8px 10px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:4 }}>
                            <Icon name={ic} size={11} style={{ color:"var(--color-text-secondary)" }}/>
                            <span style={{ fontSize:9.5, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"var(--color-text-secondary)" }}>{lbl}</span>
                          </div>
                          {today && st === "active" && <div className="ns-mono" style={{ fontSize:11.5, fontWeight:600, color:"var(--color-text-primary)", marginBottom:2 }}>{today}</div>}
                          <div className="ns-mono" style={{ fontSize:st==="active" && today ? 10 : 11.5, color: st==="active" && today ? "var(--color-text-secondary)" : "var(--color-text-primary)", fontWeight: st==="active" && today ? 400 : 600 }}>{season}</div>
                        </div>
                      ))}
                    </div>

                    {p.costCap && (
                      <div style={{ marginTop: 0 }}>
                        <div className="ns-spread" style={{ marginBottom: 3 }}>
                          <span className="ns-mono" style={{ fontSize: 9.5, color: "var(--color-text-secondary)" }}>{window.NS.fmtMoney(p.cost)} of {window.NS.fmtMoney(p.costCap)} budget</span>
                          <span className="ns-mono" style={{ fontSize: 9.5, color: pct >= 80 ? "var(--rc-amber-600)" : "var(--color-text-secondary)" }}>{Math.round(pct)}%{pct >= 80 ? " ⚠︎" : ""}</span>
                        </div>
                        <Progress pct={pct} tone={pct >= 90 ? "red" : pct >= 75 ? "amber" : "green"} />
                        {p.costCap - p.cost > 0 && <div className="ns-muted" style={{ fontSize:9.5, marginTop:4 }}>{window.NS.fmtMoney(p.costCap - p.cost)} remaining</div>}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end", paddingLeft: 12, flexShrink:0 }}>
                    {st === "active" && (
                      <>
                        <button className="ns-btn ns-btn--ghost ns-btn--sm" onClick={() => setConfirmPause(p.id)}>Pause</button>
                        <button className="ns-btn ns-btn--ghost ns-btn--sm" style={{ color:"var(--rc-red-600)", borderColor:"var(--rc-red-200)" }} onClick={() => setS(p.id, "ended")}>End early</button>
                      </>
                    )}
                    {st === "paused" && <button className="ns-btn ns-btn--ghost ns-btn--sm" onClick={() => setS(p.id, "active")}>Resume</button>}
                    {st === "scheduled" && <span className="ns-muted" style={{ fontSize: 10.5 }}>Scheduled</span>}
                    {st === "ended" && <span className="ns-muted" style={{ fontSize: 10.5 }}>Ended</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick-add from popular templates */}
        <div className="ns-card">
          <div className="ns-card__head"><div className="ns-card__title">Quick-add programs</div><span className="ns-muted" style={{ fontSize: 11 }}>Most used at Bulls · United Center</span></div>
          <div className="ns-card__body" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {window.LP_TEMPLATES.filter((t) => !t.badge || t.badge === "Most used").slice(0, 8).map((t) => (
              <button key={t.id} className="ns-memchip" style={{ width: "100%" }} onClick={() => onAddTemplate(t.id)}>
                <span style={{ width: 28, height: 28, borderRadius: 7, background: "var(--rc-gray-100)", color: "var(--color-text-secondary)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name={t.icon} size={14} /></span>
                <span className="ns-memchip__meta">
                  <span className="ns-memchip__label">{t.label}</span>
                  <span className="ns-memchip__sub">{t.earnDisplay || t.group}</span>
                </span>
                <span style={{ marginLeft: "auto", color: "var(--rc-gray-400)" }}><Icon name="chevRight" size={14} /></span>
              </button>
            ))}
            <button className="ns-btn ns-btn--ghost ns-btn--sm" style={{ alignSelf: "flex-start" }} onClick={() => window.nsGoLoyaltyTab && window.nsGoLoyaltyTab("templates")}>View all templates →</button>
          </div>
        </div>
      </div>

      {/* Pause confirmation */}
      {confirmPause && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:"#fff", borderRadius:8, padding:"24px 28px", maxWidth:380, border:"1px solid var(--color-border-strong)" }}>
            <div className="ns-strong" style={{ fontSize:14, marginBottom:8 }}>Pause program?</div>
            <div className="ns-muted" style={{ fontSize:12.5, lineHeight:1.5, marginBottom:18 }}>The program will stop firing on new transactions. Active fans keep their earned points. You can resume at any time.</div>
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
              <button className="ns-btn ns-btn--secondary" onClick={() => setConfirmPause(null)}>Cancel</button>
              <button className="ns-btn ns-btn--primary" onClick={() => { setS(confirmPause, "paused"); setConfirmPause(null); }}>Confirm pause</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TemplatesTab({ onUse }) {
  const [grp, setGrp] = React.useState("F&B loyalty");
  const groups = [...new Set(window.LP_TEMPLATES.map((t) => t.group))];
  const shown = window.LP_TEMPLATES.filter((t) => t.group === grp);
  return (
    <div>
      <div className="ns-seg" style={{ marginBottom: 14, flexWrap: "wrap", height: "auto" }}>
        {groups.map((g) => {
          const n = window.LP_TEMPLATES.filter((t) => t.group === g).length;
          return <button key={g} className={grp === g ? "is-active" : ""} onClick={() => setGrp(g)}>{g} ({n})</button>;
        })}
      </div>
      <div className="ns-grid" style={{ gridTemplateColumns: "1.4fr 1fr" }}>
        <div className="ns-card">
          <div className="ns-card__head"><div className="ns-card__title">{grp} templates</div></div>
          <div className="ns-card__body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {shown.map((t) => (
              <div key={t.id} className="ns-tplcard">
                <div className="ns-spread" style={{ marginBottom: 6 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 28, height: 28, borderRadius: 7, background: "var(--rc-gray-100)", color: "var(--color-text-secondary)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name={t.icon} size={14} /></span>
                    <span className="ns-strong" style={{ fontSize: 13 }}>{t.label}</span>
                    {t.badge && <span className="ns-pilltag ns-pilltag--sig">{t.badge}</span>}
                  </span>
                  <button className="ns-btn ns-btn--primary ns-btn--sm" onClick={() => onUse(t.id)}><Icon name="plus" size={12} />Use template</button>
                </div>
                <div className="ns-muted" style={{ fontSize: 11.5, marginBottom: 8 }}>{t.desc}</div>
                <div className="ns-fanpreview" style={{ padding: "10px 12px" }}>
                  <div className="ns-fanpreview__eye" style={{ fontSize: 10 }}><Icon name="eye" size={11} /><span>Fan experience</span></div>
                  <div className="ns-fanpreview__body" style={{ fontSize: 11.5 }}>{t.fan.replace(/\{[^}]+\}/g, "…")}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="ns-card">
          <div className="ns-card__head"><div className="ns-card__title">How templates work</div></div>
          <div className="ns-card__body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              ["zap", "Pick a template", "Browse the library and pick the program closest to what you want. Templates are pre-configured with proven defaults for sports venues."],
              ["edit", "Set the values", "Answer a small set of business questions — earn rate, who qualifies, expiry. The rule logic and conflict mode are handled for you."],
              ["eye", "Review the fan experience", "A mandatory plain-English preview shows exactly what a qualifying fan will see. If it surprises you, adjust before launch."],
              ["dollar", "See the cost", "A season cost projection with low / expected / high scenarios before you commit. Set a budget cap and the program pauses automatically."],
              ["trophy", "Launch", "One click. Terminals sync within 5 minutes."],
            ].map(([ic, t, s]) => (
              <div key={t} style={{ display: "flex", gap: 12 }}>
                <span style={{ width: 28, height: 28, borderRadius: 7, background: "var(--rc-blue-100)", color: "var(--ns-accent)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name={ic} size={14} /></span>
                <div><div className="ns-strong" style={{ fontSize: 12 }}>{t}</div><div className="ns-muted" style={{ fontSize: 11, marginTop: 3, lineHeight: 1.5 }}>{s}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.LoyaltyScreen = LoyaltyScreen;
window.ProgramsTab = ProgramsTab;
window.TemplatesTab = TemplatesTab;
