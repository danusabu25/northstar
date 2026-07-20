/* Northstar — promotion builder.
   Type → Audience → Offer → Fan preview (required) → Limits → Cost preview (required) → Review.
   Fan preview and cost preview cannot be skipped before launch. */

const PROMO_TYPE_GROUPS = ["Discount", "Product", "Spend", "Visit", "Loyalty", "Sports", "Time & location"];
const PROMO_TYPE_DEFAULT_OFFER = {
  pct: "pct", amt: "amt", free_fnb: "free", free_merch: "free", spend_reward: "amt", spend_points: "points",
  attendance: "points", playoff: "points", double: "points", lapsed: "points", expiry: "free",
  gamestate: "free", moment: "pct", clearance: "pct", happyhour: "pct", stand: "pct",
};

function PromotionBuilder({ onClose, seedAudience }) {
  const seeded = seedAudience && (seedAudience.memberships.length || seedAudience.conditions.length);
  const [openId, setOpenId] = React.useState("type");
  const [costSeen, setCostSeen] = React.useState(false);
  const [previewSeen, setPreviewSeen] = React.useState(false);
  const toggle = (id) => {
    setOpenId((cur) => (cur === id ? null : id));
    if (id === "fanpreview") setPreviewSeen(true);
    if (id === "costpreview") setCostSeen(true);
  };
  const [launched, setLaunched] = React.useState(null); // 'draft' | 'scheduled' | 'live'
  const [name, setName] = React.useState("Halftime Beer Deal");
  const [typeGrp, setTypeGrp] = React.useState("Discount");
  const [type, setType] = React.useState("pct");
  const [audience, setAudience] = React.useState(seeded ? { memberships: seedAudience.memberships.slice(), conditions: seedAudience.conditions.map((c) => ({ ...c })) } : { memberships: ["platinum", "gold_full", "gold_half"], conditions: [{ dim: "visits_min", val: 3 }] });
  const [discType, setDiscType] = React.useState("pct");
  const [discVal, setDiscVal] = React.useState(20);
  const [applyTo, setApplyTo] = React.useState("beer");
  const [applyAt, setApplyAt] = React.useState("all");
  const [freqCap, setFreqCap] = React.useState("game");
  const [budgetOn, setBudgetOn] = React.useState(true);
  const [budgetVal, setBudgetVal] = React.useState(1500);
  const [invOn, setInvOn] = React.useState(false);
  const [invVal, setInvVal] = React.useState(300);
  const [validity, setValidity] = React.useState("tonight");
  const [conflict, setConflict] = React.useState("best");
  const [stack, setStack] = React.useState(false);

  React.useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const est = window.NSEG.estimate(audience);
  const pickType = (id) => { setType(id); const dt = PROMO_TYPE_DEFAULT_OFFER[id] || "pct"; setDiscType(dt); };
  const typeMeta = window.NS.PROMO_TYPES.find((t) => t.id === type) || window.NS.PROMO_TYPES[0];
  const typeGroupKey = { Discount: "discount", Product: "product", Spend: "spend", Visit: "visit", Loyalty: "loyalty", Sports: "sports", "Time & location": "time" }[typeMeta.group];

  const offerText = (discType === "pct" ? discVal + "% off" : discType === "amt" ? "$" + discVal + " off" : discType === "free" ? "Free item" : discType === "points" ? discVal + " bonus pts" : "BOGO") + " " + ({ beer: "draft beer", food: "food", all: "all F&B", merch: "merch" }[applyTo] || "");

  // cost preview
  const bench = window.NS.PROMO_BENCH[typeGroupKey] || window.NS.PROMO_BENCH.discount;
  const perRedeem = discType === "pct" ? Math.round(discVal / 100 * 10 * 100) / 100 : discType === "amt" ? discVal : discType === "points" ? 0 : 6;
  const scen = (pct) => { const fans = Math.round(est.count * pct / 100); return { pct, fans, cost: Math.round(fans * perRedeem) }; };
  const low = scen(bench.low), exp = scen(bench.avg), high = scen(bench.high);
  const capBreached = budgetOn && high.cost > budgetVal;

  const validityLabel = { tonight: "Tonight · Game 14", homestand: "This homestand", trigger: "On trigger", custom: "Custom dates" }[validity];
  const capLabel = { game: "1 / fan / game", season: "Max 3 / season", total: "1 / fan total", none: "No cap" }[freqCap];

  const canLaunch = previewSeen && costSeen;

  if (launched) {
    const t = { draft: ["edit", "Saved as draft", ["Promotion saved — not yet scheduled.", "Duplicate, edit, or schedule it from the promotions list."]], scheduled: ["calendar", "Promotion scheduled", [`"${name}" is armed for ${validityLabel === "Tonight · Game 14" ? "tonight · Game 14" : validityLabel.toLowerCase()}.`, "It activates automatically and reports cost as it runs."]], live: ["tag", "Promotion launched", [`"${name}" is live for ${window.NS.fmtNum(est.count)} eligible fans.`, budgetOn ? `Auto-pauses at ${window.NS.fmtMoney(budgetVal)}.` : "No budget cap set."]] }[launched];
    return (
      <div className="ns-builder">
        <BuilderSuccess icon={t[0]} title={t[1]} lines={t[2]} primaryLabel="Back to promotions" onClose={onClose} />
      </div>
    );
  }

  // Fan experience preview text
  const who = audience.memberships.length === window.NSEG.MEMBERSHIP.length ? "any recognized fan" : window.NSEG.MEMBERSHIP.filter((m) => audience.memberships.includes(m.id)).map((m) => m.label).slice(0, 2).join(" or ") + " fans";
  const locPreview = { all: "any stand", "110-120": "stands in Sec 110–120", club: "the club level", stand12: "Stand 12" }[applyAt];

  return (
    <div className="ns-builder" role="dialog" aria-modal="true" aria-label="New promotion">
      <header className="ns-builder__top">
        <button className="ns-iconbtn" onClick={onClose} aria-label="Close builder"><Icon name="x" size={18} /></button>
        <div className="ns-builder__title">
          <div className="ns-eyebrow" style={{ marginBottom: 3 }}>New promotion · {typeMeta.group}</div>
          <input className="ns-builder__name" value={name} onChange={(e) => setName(e.target.value)} aria-label="Promotion name" />
        </div>
        <div className="ns-builder__topactions">
          <Badge tone="neutral">Draft</Badge>
        </div>
      </header>

      <div className="ns-builder__body">
        <div className="ns-builder__inner">
          <div className="ns-accordion">

            <RBSection id="type" n="1" title="Type" desc="What kind of promotion this is"
              summary={typeMeta.label} done
              open={openId === "type"} onToggle={() => toggle("type")}>
              <div className="ns-sectlabel">Promotion type</div>
              <div className="ns-seg" style={{ marginBottom: 12, flexWrap: "wrap", height: "auto" }}>{PROMO_TYPE_GROUPS.map((g) => <button key={g} className={typeGrp === g ? "is-active" : ""} onClick={() => setTypeGrp(g)}>{g}</button>)}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {window.NS.PROMO_TYPES.filter((t) => t.group === typeGrp).map((o) => {
                  const on = type === o.id;
                  return (
                    <button key={o.id} className={"ns-memchip" + (on ? " is-on" : "")} style={{ alignItems: "flex-start" }} onClick={() => pickType(o.id)}>
                      <span style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, background: on ? "var(--ns-accent)" : "var(--rc-gray-100)", color: on ? "#fff" : "var(--color-text-secondary)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Icon name={o.icon} size={15} /></span>
                      <span className="ns-memchip__meta"><span className="ns-memchip__label">{o.label}</span><span className="ns-memchip__sub" style={{ whiteSpace: "normal", lineHeight: 1.35 }}>{o.sub}</span></span>
                    </button>
                  );
                })}
              </div>
              {typeMeta.group === "Sports" && <div className="ns-callout ns-callout--info" style={{ marginTop: 16 }}><Icon name="activity" size={15} /><span>Sports types use game context — score feed, game state, or a manual operator trigger. They fire automatically when the condition is met.</span></div>}
            </RBSection>

            <RBSection id="audience" n="2" title="Audience" desc="Who's eligible for this promotion"
              summary={window.NS.fmtNum(est.count) + " fans"} done
              open={openId === "audience"} onToggle={() => toggle("audience")}>
              <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 0 }}>
                <div style={{ paddingRight: 22 }}><AudienceBuilder audience={audience} setAudience={setAudience} /></div>
                <div style={{ paddingLeft: 22, borderLeft: "1px solid var(--color-border-default)" }}><AudienceSummary audience={audience} /></div>
              </div>
            </RBSection>

            <RBSection id="offer" n="3" title="Offer" desc="What the fan gets, and where it applies"
              summary={offerText} done
              open={openId === "offer"} onToggle={() => toggle("offer")}>
              <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 0 }}>
                <div style={{ paddingRight: 22 }}>
                  <div className="ns-seg" style={{ marginBottom: 16, flexWrap: "wrap", height: "auto" }}>{[["pct", "% off"], ["amt", "$ off"], ["free", "Free item"], ["points", "Bonus pts"], ["bogo", "BOGO"]].map(([id, l]) => <button key={id} className={discType === id ? "is-active" : ""} onClick={() => setDiscType(id)}>{l}</button>)}</div>
                  {(discType === "pct" || discType === "amt" || discType === "points") && (
                    <div className="ns-cond" style={{ marginBottom: 16 }}>
                      <div className="ns-cond__body"><div className="ns-cond__label">{discType === "pct" ? "Percent off" : discType === "amt" ? "Amount off" : "Bonus points"}</div>
                        <SliderField min={discType === "pct" ? 5 : discType === "points" ? 100 : 1} max={discType === "pct" ? 50 : discType === "points" ? 2000 : 25} step={discType === "pct" ? 5 : discType === "points" ? 100 : 1} value={discVal} onChange={setDiscVal}
                          prefix={discType === "amt" ? "$" : null} suffix={discType === "pct" ? "%" : discType === "points" ? " pts" : null} width={discType === "points" ? 72 : 56} />
                      </div>
                    </div>
                  )}
                  <div className="ns-sectlabel">Applies to</div>
                  <div className="ns-seg" style={{ marginBottom: 16, flexWrap: "wrap", height: "auto" }}>{[["beer", "Draft beer"], ["food", "Food"], ["all", "All F&B"], ["merch", "Merch"]].map(([id, l]) => <button key={id} className={applyTo === id ? "is-active" : ""} onClick={() => setApplyTo(id)}>{l}</button>)}</div>
                  <div className="ns-sectlabel">Applies at</div>
                  <div className="ns-seg" style={{ flexWrap: "wrap", height: "auto" }}>{[["all", "All terminals"], ["110-120", "Sec 110–120"], ["club", "Club level"], ["stand12", "Stand 12"]].map(([id, l]) => <button key={id} className={applyAt === id ? "is-active" : ""} onClick={() => setApplyAt(id)}>{l}</button>)}</div>
                </div>
                <div style={{ paddingLeft: 22, borderLeft: "1px solid var(--color-border-default)" }}>
                  <div className="ns-sectlabel">Terminal preview</div>
                  <div style={{ background: "var(--ns-navy)", borderRadius: 12, padding: "16px", color: "#fff" }}>
                    <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.55)", marginBottom: 6 }}>Fan taps to pay</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{offerText}</div>
                    <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>Apply discount?</div>
                  </div>
                </div>
              </div>
            </RBSection>

            <RBSection id="fanpreview" n="4" title="Fan preview" desc="Exactly what a qualifying fan will see — this cannot be skipped before launch"
              summary={previewSeen ? "Reviewed" : "Required before launch"} done={previewSeen}
              open={openId === "fanpreview"} onToggle={() => toggle("fanpreview")}>
              <div className="ns-spread" style={{ marginBottom: 12 }}>
                <span className="ns-muted" style={{ fontSize: 11.5 }}>Scroll or jump here to review — required before Launch or Schedule unlocks.</span>
                <Badge tone={previewSeen ? "success" : "info"}>{previewSeen ? "Reviewed" : "Required"}</Badge>
              </div>
              <div className="ns-fanpreview">
                <div className="ns-fanpreview__eye"><Icon name="eye" size={13} /><span>What qualifying fans will experience</span></div>
                <div className="ns-fanpreview__body">
                  {`A ${who} makes a purchase at ${locPreview} ${validity === "tonight" ? "tonight" : validity === "homestand" ? "this homestand" : "during the active window"}. They see: "${offerText} applied." The discount applies automatically when they tap — no card to show, no code to enter.`}
                  {invOn ? `\n\nThis offer applies to the first ${window.NS.fmtNum(invVal)} qualifying fans. After ${window.NS.fmtNum(invVal)} redemptions, the promotion ends automatically.` : ""}
                  {budgetOn ? `\n\nThe promotion pauses automatically when $${window.NS.fmtNum(budgetVal)} in discounts has been applied.` : ""}
                </div>
              </div>
              <div className="ns-callout ns-callout--info" style={{ marginTop: 14 }}><Icon name="check" size={15} /><span>If this surprises you, go back and adjust. Once live, terminals sync within 5 minutes and qualifying fans see this on their next tap.</span></div>
            </RBSection>

            <RBSection id="limits" n="5" title="Limits" desc="Validity window, redemption caps, and conflict handling"
              summary={capLabel} done
              open={openId === "limits"} onToggle={() => toggle("limits")}>
              <div className="ns-sectlabel">Validity window</div>
              <div className="ns-seg" style={{ marginBottom: 16, flexWrap: "wrap", height: "auto" }}>{[["tonight", "Tonight · Game 14"], ["homestand", "This homestand"], ["trigger", "On trigger"], ["custom", "Custom dates"]].map(([id, l]) => <button key={id} className={validity === id ? "is-active" : ""} onClick={() => setValidity(id)}>{l}</button>)}</div>
              <div className="ns-sectlabel">Per-fan redemption limit</div>
              <div className="ns-seg" style={{ marginBottom: 16, flexWrap: "wrap", height: "auto" }}>{[["game", "1 / fan / game"], ["season", "Max 3 / season"], ["total", "1 / fan total"], ["none", "No cap"]].map(([id, l]) => <button key={id} className={freqCap === id ? "is-active" : ""} onClick={() => setFreqCap(id)}>{l}</button>)}</div>
              <RBToggle on={budgetOn} onClick={() => setBudgetOn((v) => !v)} label="Total budget cap" sub="Promotion pauses automatically when this discount value is reached" />
              {budgetOn && <div style={{ marginTop: 8, marginBottom: 12 }}><div className="ns-cond"><div className="ns-cond__body"><div className="ns-cond__label">Budget ceiling</div><SliderField min={500} max={10000} step={100} value={budgetVal} onChange={setBudgetVal} prefix="$" width={72} /></div></div></div>}
              <div style={{ marginTop: 10 }}><RBToggle on={invOn} onClick={() => setInvOn((v) => !v)} label="Inventory cap" sub="First N fans only — closes when reached regardless of budget" /></div>
              {invOn && <div style={{ marginTop: 8, marginBottom: 12 }}><div className="ns-cond"><div className="ns-cond__body"><div className="ns-cond__label">Redemption limit</div><SliderField min={50} max={2000} step={50} value={invVal} onChange={setInvVal} prefix="first" width={64} /></div></div></div>}
              <div className="ns-sectlabel" style={{ marginTop: 6 }}>Conflict with loyalty rules</div>
              <div className="ns-seg" style={{ marginBottom: 14 }}>{[["stackable", "Stackable"], ["first", "First wins"], ["best", "Best value"]].map(([id, l]) => <button key={id} className={conflict === id ? "is-active" : ""} onClick={() => setConflict(id)}>{l}</button>)}</div>
              <RBToggle on={stack} onClick={() => setStack((v) => !v)} label="Stack with standing entitlements" sub="Allow on top of a member's permanent benefit" />
            </RBSection>

            <RBSection id="costpreview" n="6" title="Cost preview" desc="Modeled cost exposure before you launch — this cannot be skipped before launch"
              summary={costSeen ? "Reviewed" : "Required before launch"} done={costSeen}
              open={openId === "costpreview"} onToggle={() => toggle("costpreview")}>
              <div className="ns-spread" style={{ marginBottom: 14 }}>
                <span className="ns-muted" style={{ fontSize: 11.5 }}>Based on {bench.n} similar {typeMeta.group.toLowerCase()} promotions at this venue</span>
                <Badge tone={costSeen ? "success" : "info"}>{costSeen ? "Reviewed" : "Avg " + bench.avg + "% redemption"}</Badge>
              </div>
              <div className="ns-spread" style={{ marginBottom: 14, padding: "10px 14px", background: "var(--rc-gray-050)", borderRadius: 6 }}>
                <span style={{ fontSize: 12 }}>Eligible fans</span><span className="ns-mono ns-strong" style={{ fontSize: 14 }}>{window.NS.fmtNum(est.count)}</span>
              </div>
              <div className="ns-costgrid">
                {[["Conservative", low, "var(--color-text-secondary)"], ["Expected", exp, "var(--ns-accent)"], ["High", high, "var(--rc-amber-600)"]].map(([label, sc, col]) => (
                  <div key={label} className="ns-costcard" style={{ borderColor: label === "Expected" ? "var(--ns-accent)" : "var(--color-border-default)" }}>
                    <div className="ns-spread" style={{ marginBottom: 8 }}><span className="ns-pmetric__label">{label}</span><span className="ns-mono" style={{ fontSize: 11, color: col, fontWeight: 600 }}>{sc.pct}%</span></div>
                    <div className="ns-pmetric__value" style={{ fontSize: 22 }}>{window.NS.fmtMoney(sc.cost)}</div>
                    <div className="ns-pmetric__sub">{window.NS.fmtNum(sc.fans)} redemptions · {window.NS.fmtMoney(perRedeem, 2)} ea</div>
                  </div>
                ))}
              </div>
              <div className={"ns-callout " + (capBreached ? "ns-callout--warn" : "ns-callout--info")} style={{ marginTop: 16 }}>
                <Icon name={capBreached ? "alert" : "shield"} size={15} />
                <span>{budgetOn ? <>Budget cap set: <strong>{window.NS.fmtMoney(budgetVal)}</strong>. {capBreached ? <>High scenario ({window.NS.fmtMoney(high.cost)}) exceeds the cap — the promotion will <strong>pause automatically</strong> when {window.NS.fmtMoney(budgetVal)} is reached.</> : "Within budget across all scenarios — auto-pause armed as a safeguard."}</> : <>No budget cap set. <strong>Set a cap</strong> to limit exposure if redemption runs high.</>}</span>
              </div>
              <div className="ns-muted" style={{ fontSize: 10.5, marginTop: 12, lineHeight: 1.5 }}>This preview is not a guarantee — it is based on historical patterns from this venue and similar promotion types. It exists to prevent launching a costly promotion without understanding the exposure.</div>
            </RBSection>

          </div>
        </div>
      </div>

      <footer className="ns-builder__foot">
        <span className="ns-builder__savedtag"><Icon name="check" size={13} stroke={2.6} />Draft saved</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="ns-btn ns-btn--secondary" onClick={() => setLaunched("draft")}>Save draft</button>
          {validity === "tonight" && !invOn
            ? <button className="ns-btn ns-btn--primary" onClick={() => setLaunched("live")} disabled={!canLaunch} title={!canLaunch ? "Review Fan preview and Cost preview first" : null}><Icon name="tag" size={14} />Launch now</button>
            : <button className="ns-btn ns-btn--primary" onClick={() => setLaunched("scheduled")} disabled={!canLaunch} title={!canLaunch ? "Review Fan preview and Cost preview first" : null}><Icon name="calendar" size={14} />Schedule</button>}
        </div>
      </footer>
    </div>
  );
}

window.PromotionWizard = PromotionBuilder;
