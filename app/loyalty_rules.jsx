/* Northstar — enterprise loyalty rule builder (full-page).
   Left component index · center config canvas · right live rail.
   Every one of the six rule components is fully configurable, plus
   engine settings (priority, conflict mode, validity). */

function rbCondText(c) {
  const d = window.RB.DIM_BY_ID[c.dim];
  if (!d) return "";
  const opSym = { gte: "≥", lte: "≤", eq: "=", is: "is", isnot: "is not" }[c.op] || "";
  let val;
  if (d.kind === "select") { const o = d.options.find((x) => x[0] === c.val); val = o ? o[1] : c.val; }
  else if (d.kind === "money") val = "$" + window.NS.fmtNum(c.val);
  else val = window.NS.fmtNum(c.val) + (d.unit || "");
  return d.label + " " + opSym + " " + val;
}

function LoyaltyRuleBuilder({ onClose }) {
  const [launched, setLaunched] = React.useState(false);
  const [openId, setOpenId] = React.useState("trigger");
  const toggle = (id) => setOpenId((cur) => (cur === id ? null : id));
  const memDefault = window.NSEG.MEMBERSHIP.map((m) => m.id);

  const [s, set] = React.useState({
    name: "Halftime double points",
    trigger: "gameday", detail: "halftime",
    condMatch: "all", conditions: [{ dim: "tier", op: "is", val: "gold" }], tierGated: true,
    action: "mult", rate: 1, mult: 1.5, bonus: 500,
    tierMatrix: { gold: 2.5, silver: 2, bronze: 2 }, maxAwardOn: false, maxAward: 500,
    scope: "individual", applyAt: "all", memberships: memDefault,
    freqCap: "game", budgetOn: true, budgetVal: 22000, invOn: false, invVal: 500,
    expiry: "season", activityDays: 180, rollingDays: 90, fixedDate: "Apr 12, 2026",
    priority: 40, conflictGroup: "sports", conflictMode: "best", stack: false,
    validity: "season",
    triggerN: 5,  // the N value for streak / milestone / lapsed triggers
  });
  const u = (patch) => set((p) => ({ ...p, ...patch }));

  React.useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const trig = window.RB.TRIGGERS.find((t) => t.id === s.trigger);
  const needsN = s.trigger === "streak" ||
    s.trigger === "milestone" ||
    (s.trigger === "behavioral" && s.detail === "lapsed");
  const nLabel = s.trigger === "streak" ? "consecutive game-day purchases"
    : s.trigger === "milestone" && s.detail === "nth_benefit" ? "benefit redemptions"
    : s.trigger === "milestone" ? "purchases this season"
    : "missed games before return";
  const nMin = s.trigger === "behavioral" ? 2 : 2;
  const nMax = s.trigger === "behavioral" ? 8 : s.trigger === "milestone" ? 20 : 10;
  const resolvedDetail = needsN
    ? ((window.RB.TRIGGER_DETAIL[s.trigger] || []).find((d) => d[0] === s.detail) || [null, ""])[1].replace("N", s.triggerN)
    : ((window.RB.TRIGGER_DETAIL[s.trigger] || []).find((d) => d[0] === s.detail) || [null, trig && trig.label])[1];
  const detailLabel = resolvedDetail || (trig && trig.label);
  const actionLabel = s.action === "rate" ? s.rate + " pts / $1" : s.action === "mult" ? s.mult + "× points" : s.action === "bonus" ? window.NS.fmtNum(s.bonus) + " bonus pts" : "Tiered bonus";
  const capLabel = { none: "No cap", game: "1 / fan / game", total: "1 / fan total", household: "1 / household / game" }[s.freqCap];
  const expLabel = { season: "Season end", activity: s.activityDays + "-day inactivity", rolling: s.rollingDays + "-day rolling", fixed: "Fixed · " + s.fixedDate }[s.expiry];
  const condSummary = s.conditions.length ? s.conditions.map(rbCondText).join(s.condMatch === "all" ? " AND " : " OR ") : "Any matching transaction";

  // projected impact
  const baseVol = trig ? (trig.group === "earn" ? 142000 : trig.group === "sports" ? 16000 : trig.group === "behavioral" ? 7000 : 3000) : 5000;
  const factor = s.action === "mult" ? (s.mult - 1) : s.action === "rate" ? s.rate : 1;
  const proj = Math.round(baseVol * Math.max(0.4, factor));

  if (launched) {
    return (
      <div className="ns-builder">
        <BuilderSuccess icon="check" title="Rule activated"
          lines={[`"${s.name}" is live and pushed to the terminal rule cache. It evaluates on every qualifying tap and reports impact after the next game.`]}
          primaryLabel="Back to loyalty" onClose={onClose} />
      </div>
    );
  }

  return (
    <div className="ns-builder" role="dialog" aria-modal="true" aria-label="New loyalty rule">
      {/* top bar */}
      <header className="ns-builder__top">
        <button className="ns-iconbtn" onClick={onClose} aria-label="Close builder"><Icon name="x" size={18} /></button>
        <div className="ns-builder__title">
          <div className="ns-eyebrow" style={{ marginBottom: 3 }}>New loyalty rule · {trig ? trig.group : ""} group</div>
          <input className="ns-builder__name" value={s.name} onChange={(e) => u({ name: e.target.value })} aria-label="Rule name" />
        </div>
        <div className="ns-builder__topactions">
          <Badge tone="neutral">Draft</Badge>
        </div>
      </header>

      <div className="ns-builder__body">
        <div className="ns-builder__inner">
          <div className="ns-accordion">

            <RBSection id="trigger" n="1" title="Trigger" desc="What event causes the rule to evaluate"
              summary={detailLabel} done
              open={openId === "trigger"} onToggle={() => toggle("trigger")}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {window.RB.TRIGGERS.map((o) => {
                  const on = s.trigger === o.id;
                  return (
                    <button key={o.id} className={"ns-memchip" + (on ? " is-on" : "")} style={{ alignItems: "flex-start" }} onClick={() => { const det = (window.RB.TRIGGER_DETAIL[o.id] || [])[0]; u({ trigger: o.id, detail: det ? det[0] : null, action: o.action, conflictGroup: o.group }); }}>
                      <span style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, background: on ? "var(--ns-accent)" : "var(--rc-gray-100)", color: on ? "#fff" : "var(--color-text-secondary)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Icon name={o.icon} size={15} /></span>
                      <span className="ns-memchip__meta"><span className="ns-memchip__label">{o.label}</span><span className="ns-memchip__sub" style={{ whiteSpace: "normal", lineHeight: 1.35 }}>{o.sub}</span></span>
                    </button>
                  );
                })}
              </div>
              {(window.RB.TRIGGER_DETAIL[s.trigger] || []).length > 0 && (
                <>
                  <div className="ns-sectlabel" style={{ marginTop: 16 }}>Specific trigger</div>
                  <div className="ns-seg" style={{ flexWrap: "wrap", height: "auto" }}>
                    {window.RB.TRIGGER_DETAIL[s.trigger].map(([id, l]) => <button key={id} className={s.detail === id ? "is-active" : ""} onClick={() => u({ detail: id })}>{l}</button>)}
                  </div>
                </>
              )}
              {needsN && (
                <div style={{ marginTop: 14 }}>
                  <div className="ns-cond">
                    <div className="ns-cond__body">
                      <div className="ns-cond__label">N — {nLabel}</div>
                      <SliderField min={nMin} max={nMax} step={1} value={s.triggerN} onChange={(v) => u({ triggerN: v })} />
                    </div>
                  </div>
                </div>
              )}
              {(s.trigger === "behavioral") && (
                <div className="ns-callout ns-callout--info" style={{ marginTop: 14 }}><Icon name="database" size={15} /><span>This trigger reads the fan’s full transaction history — unique to Northstar. General loyalty platforms can’t evaluate it.</span></div>
              )}
            </RBSection>

            <RBSection id="condition" n="2" title="Condition" desc="Whether the fan or transaction qualifies"
              summary={condSummary} done={s.conditions.length > 0}
              open={openId === "condition"} onToggle={() => toggle("condition")}>
              <ConditionBuilder s={s} u={u} />
              <div className="ns-divider" style={{ margin: "16px 0" }} />
              <RBToggle on={s.tierGated} onClick={() => u({ tierGated: !s.tierGated })} label="Tier-gate this rule" sub="One rule, a different multiplier per tier — configured in Action. Uses combined AND/OR qualification across spend and attendance." />
            </RBSection>

            <RBSection id="action" n="3" title="Action" desc="What happens when the rule fires"
              summary={s.tierGated ? actionLabel + " · tiered" : actionLabel} done
              open={openId === "action"} onToggle={() => toggle("action")}>
              <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 0 }}>
                <div style={{ paddingRight: 22 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 14 }}>
                    {window.RB.ACTIONS.map((o) => {
                      const on = s.action === o.id;
                      return (
                        <button key={o.id} className={"ns-memchip" + (on ? " is-on" : "")} style={{ alignItems: "flex-start" }} onClick={() => u({ action: o.id })}>
                          <span style={{ width: 26, height: 26, borderRadius: 6, flexShrink: 0, background: on ? "var(--ns-accent)" : "var(--rc-gray-100)", color: on ? "#fff" : "var(--color-text-secondary)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Icon name={o.icon} size={14} /></span>
                          <span className="ns-memchip__meta"><span className="ns-memchip__label">{o.label}</span><span className="ns-memchip__sub" style={{ whiteSpace: "normal", lineHeight: 1.3 }}>{o.sub}</span></span>
                        </button>
                      );
                    })}
                  </div>
                  {s.action === "rate" && <RBSlider label="Points per dollar" min={1} max={5} step={1} value={s.rate} onChange={(v) => u({ rate: v })} suffix=" pt/$1" />}
                  {s.action === "mult" && <RBSlider label="Multiplier on base points" min={1.5} max={5} step={0.5} value={s.mult} onChange={(v) => u({ mult: v })} suffix="×" />}
                  {s.action === "bonus" && <RBSlider label="Flat bonus points" min={100} max={5000} step={100} value={s.bonus} onChange={(v) => u({ bonus: v })} width={72} />}
                  {s.action === "tiered" && <div className="ns-callout ns-callout--info"><Icon name="trophy" size={15} /><span>Tiered bonus scales by milestone — e.g. <strong>500 / 1,500 / 5,000</strong> at the 3rd / 5th / 10th qualifying event.</span></div>}

                  {s.tierGated && (
                    <div style={{ marginTop: 16 }}>
                      <div className="ns-sectlabel">Tier-gated effect — multiplier per tier</div>
                      {["gold", "silver", "bronze"].map((k) => (
                        <div className="ns-cond" key={k} style={{ marginBottom: 8 }}>
                          <span className={"ns-tier ns-tier--" + k} style={{ background: "var(--tier-" + k + "-bg)", color: "var(--tier-" + k + "-fg)", flexShrink: 0 }}><span className="ns-tier__mark" style={{ background: "var(--tier-" + k + "-mark)" }} />{k[0].toUpperCase() + k.slice(1)}</span>
                          <div className="ns-cond__body"><SliderField min={1} max={5} step={0.5} value={s.tierMatrix[k]} onChange={(v) => u({ tierMatrix: { ...s.tierMatrix, [k]: v } })} suffix="×" /></div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="ns-divider" style={{ margin: "16px 0" }} />
                  <RBToggle on={s.maxAwardOn} onClick={() => u({ maxAwardOn: !s.maxAwardOn })} label="Cap award per fire" sub="Maximum points a single transaction can earn from this rule" />
                  {s.maxAwardOn && <div style={{ marginTop: 8 }}><RBSlider label="Max points per fire" min={100} max={5000} step={100} value={s.maxAward} onChange={(v) => u({ maxAward: v })} suffix=" pts" width={72} /></div>}
                </div>
                <div style={{ paddingLeft: 22, borderLeft: "1px solid var(--color-border-default)" }}>
                  <div className="ns-sectlabel">Terminal preview</div>
                  <div style={{ background: "var(--ns-navy)", borderRadius: 12, padding: "14px 16px", color: "#fff" }}>
                    <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.55)", marginBottom: 6 }}>Fan taps to pay</div>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{detailLabel} → {actionLabel}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>Applied automatically before payment</div>
                  </div>
                  <div className="ns-sectlabel" style={{ marginTop: 16 }}>Projected impact</div>
                  <div className="ns-audnum" style={{ fontSize: 26 }}>{window.NS.fmtNum(proj)}</div>
                  <div className="ns-muted" style={{ fontSize: 11, marginBottom: 4 }}>est. points / season</div>
                </div>
              </div>
            </RBSection>

            <RBSection id="scope" n="4" title="Scope" desc="Who the rule applies to, and where"
              summary={(s.scope === "household" ? "Household" : "Individual") + " · " + s.memberships.length + " groups"} done
              open={openId === "scope"} onToggle={() => toggle("scope")}>
              <div className="ns-sectlabel">Applies to</div>
              <div className="ns-seg" style={{ marginBottom: 16 }}>{[["individual", "Individual fan"], ["household", "Household"]].map(([id, l]) => <button key={id} className={s.scope === id ? "is-active" : ""} onClick={() => u({ scope: id })}>{l}</button>)}</div>
              <div className="ns-sectlabel">Applies at</div>
              <div className="ns-seg" style={{ marginBottom: 16, flexWrap: "wrap", height: "auto" }}>{[["all", "All terminals"], ["sections", "Sec 110–120"], ["club", "Club level"], ["stand12", "Stand 12"]].map(([id, l]) => <button key={id} className={s.applyAt === id ? "is-active" : ""} onClick={() => u({ applyAt: id })}>{l}</button>)}</div>
              <div className="ns-spread" style={{ marginBottom: 10 }}><span className="ns-sectlabel" style={{ margin: 0 }}>Eligible membership groups</span><button className="ns-btn ns-btn--ghost ns-btn--sm" onClick={() => u({ memberships: s.memberships.length === memDefault.length ? [] : memDefault.slice() })}>{s.memberships.length === memDefault.length ? "Clear all" : "Select all"}</button></div>
              <MembershipPicker s={s} u={u} />
            </RBSection>

            <RBSection id="constraints" n="5" title="Constraints" desc="How often the rule can fire — and the spend ceiling"
              summary={[capLabel, s.budgetOn ? "$" + window.NS.fmtNum(s.budgetVal) : null, s.invOn ? "first " + window.NS.fmtNum(s.invVal) : null].filter(Boolean).join(" · ")} done
              open={openId === "constraints"} onToggle={() => toggle("constraints")}>
              <div className="ns-sectlabel">Frequency cap</div>
              <div className="ns-seg" style={{ marginBottom: 16, flexWrap: "wrap", height: "auto" }}>{[["none", "No cap"], ["game", "1 / fan / game"], ["total", "1 / fan total"], ["household", "1 / household / game"]].map(([id, l]) => <button key={id} className={s.freqCap === id ? "is-active" : ""} onClick={() => u({ freqCap: id })}>{l}</button>)}</div>
              <RBToggle on={s.budgetOn} onClick={() => u({ budgetOn: !s.budgetOn })} label="Budget cap" sub="Stop firing once total awarded value is reached — protects against unexpected liability" />
              {s.budgetOn && <div style={{ marginTop: 8, marginBottom: 12 }}><RBSlider label="Budget ceiling (awarded value)" min={5000} max={100000} step={1000} value={s.budgetVal} onChange={(v) => u({ budgetVal: v })} prefix="$" width={80} /></div>}
              <div style={{ marginTop: 10 }}><RBToggle on={s.invOn} onClick={() => u({ invOn: !s.invOn })} label="Inventory cap" sub="First N fans only — promotion closes regardless of remaining budget" /></div>
              {s.invOn && <div style={{ marginTop: 8 }}><RBSlider label="Redemption limit" min={50} max={5000} step={50} value={s.invVal} onChange={(v) => u({ invVal: v })} prefix="first" width={72} /></div>}
              <div className="ns-callout ns-callout--info" style={{ marginTop: 14 }}><Icon name="shield" size={15} /><span>Caps are enforced locally at the terminal — even offline. Budget and inventory caps can run together; whichever is reached first closes the rule.</span></div>
            </RBSection>

            <RBSection id="expiry" n="6" title="Expiry" desc="When points from this rule stop being active"
              summary={expLabel} done
              open={openId === "expiry"} onToggle={() => toggle("expiry")}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                {window.RB.EXPIRY.map((o) => {
                  const on = s.expiry === o.id;
                  return (
                    <button key={o.id} className={"ns-memchip" + (on ? " is-on" : "")} style={{ alignItems: "flex-start" }} onClick={() => u({ expiry: o.id })}>
                      <span style={{ width: 26, height: 26, borderRadius: 6, flexShrink: 0, background: on ? "var(--ns-accent)" : "var(--rc-gray-100)", color: on ? "#fff" : "var(--color-text-secondary)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Icon name={o.icon} size={14} /></span>
                      <span className="ns-memchip__meta"><span className="ns-memchip__label">{o.label}</span><span className="ns-memchip__sub" style={{ whiteSpace: "normal", lineHeight: 1.3 }}>{o.sub}</span></span>
                    </button>
                  );
                })}
              </div>
              {s.expiry === "activity" && <RBSlider label="Inactivity window before reset" min={30} max={365} step={30} value={s.activityDays} onChange={(v) => u({ activityDays: v })} suffix=" days" />}
              {s.expiry === "rolling" && <RBSlider label="Days each point survives after earning" min={30} max={365} step={30} value={s.rollingDays} onChange={(v) => u({ rollingDays: v })} suffix=" days" />}
              {s.expiry === "fixed" && <div className="ns-callout ns-callout--info"><Icon name="calendar" size={15} /><span>Fixed-date expiry drives end-of-season urgency — points clear on <strong>{s.fixedDate}</strong>, pushing a final visit while fans are invested in the closing games.</span></div>}
              {s.expiry === "season" && <div className="ns-callout ns-callout--info"><Icon name="flag" size={15} /><span>Points clear at the season reset. Pair with a season-closer bonus to drive redemption before the balance zeroes out.</span></div>}
            </RBSection>

            <RBSection id="engine" n="7" title="Engine settings" desc="Priority and conflict resolution against other rules"
              summary={"Priority " + s.priority + " · " + s.conflictMode} done
              open={openId === "engine"} onToggle={() => toggle("engine")}>
              <RBSlider label="Evaluation priority (higher fires first)" min={1} max={100} step={1} value={s.priority} onChange={(v) => u({ priority: v })} prefix="#" />
              <div className="ns-sectlabel" style={{ marginTop: 16 }}>Conflict resolution within its group</div>
              <div className="ns-seg" style={{ marginBottom: 14 }}>{[["stackable", "Stackable"], ["first", "First wins"], ["best", "Best value"]].map(([id, l]) => <button key={id} className={s.conflictMode === id ? "is-active" : ""} onClick={() => u({ conflictMode: id })}>{l}</button>)}</div>
              <RBToggle on={s.stack} onClick={() => u({ stack: !s.stack })} label="Stack with standing entitlements" sub="Allow this rule on top of a member’s permanent benefit" />
              <div className="ns-sectlabel" style={{ marginTop: 16 }}>Active window</div>
              <div className="ns-seg" style={{ flexWrap: "wrap", height: "auto" }}>{[["tonight", "Tonight only"], ["homestand", "This homestand"], ["season", "Full season"], ["custom", "Custom dates"]].map(([id, l]) => <button key={id} className={s.validity === id ? "is-active" : ""} onClick={() => u({ validity: id })}>{l}</button>)}</div>
            </RBSection>

          </div>
        </div>
      </div>

      <footer className="ns-builder__foot">
        <span className="ns-builder__savedtag"><Icon name="check" size={13} stroke={2.6} />Draft saved</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="ns-btn ns-btn--secondary" onClick={onClose}>Save draft</button>
          <button className="ns-btn ns-btn--primary" onClick={() => setLaunched(true)}><Icon name="trophy" size={14} />Activate rule</button>
        </div>
      </footer>
    </div>
  );
}

window.LoyaltyRuleBuilder = LoyaltyRuleBuilder;
// keep the old export name working
window.LoyaltyRuleWizard = LoyaltyRuleBuilder;
