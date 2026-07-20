/* Northstar — redemption catalog reward builder.
   Reward → Cost & eligibility → Inventory → Expiry.
   Creates or edits an entry in the loyalty redemption catalog. */

const REWARD_KINDS = [
  { id: "discount", label: "Discount", sub: "A % or $ discount at the terminal", icon: "tag" },
  { id: "item", label: "Free / physical item", sub: "A menu item, merch, or physical good", icon: "gift" },
  { id: "experience", label: "Experience", sub: "Seat upgrade, lounge access, meet & greet", icon: "sparkle" },
];

// Best-effort parse of an existing catalog reward's free-text label,
// so editing a discount-kind reward starts from its real values.
function parseDiscountText(text) {
  const applyFrom = (s) => {
    s = (s || "").toLowerCase();
    if (s.indexOf("beer") !== -1) return "beer";
    if (s.indexOf("food") !== -1) return "food";
    if (s.indexOf("f&b") !== -1 || s.indexOf("all") !== -1) return "all";
    if (s.indexOf("merch") !== -1) return "merch";
    return "any";
  };
  const pct = text.match(/^(\d+)%\s*off\s*(.*)$/i);
  if (pct) return { discType: "pct", discVal: Number(pct[1]), applyTo: applyFrom(pct[2]) };
  const amt = text.match(/^\$(\d+)\s*off\s*(.*)$/i);
  if (amt) return { discType: "amt", discVal: Number(amt[1]), applyTo: applyFrom(amt[2]) };
  return { discType: "pct", discVal: 20, applyTo: "beer" };
}

function RewardBuilder({ onClose, initial }) {
  const [openId, setOpenId] = React.useState("reward");
  const toggle = (id) => setOpenId((cur) => (cur === id ? null : id));
  const [launched, setLaunched] = React.useState(false);

  const [name, setName] = React.useState(initial ? initial.reward : "New reward");
  const [kind, setKind] = React.useState(initial ? initial.kind : "discount");
  const parsedDiscount = initial && initial.kind === "discount" ? parseDiscountText(initial.reward) : { discType: "pct", discVal: 20, applyTo: "beer" };
  const [discType, setDiscType] = React.useState(parsedDiscount.discType);
  const [discVal, setDiscVal] = React.useState(parsedDiscount.discVal);
  const [applyTo, setApplyTo] = React.useState(parsedDiscount.applyTo);
  const [itemDesc, setItemDesc] = React.useState(initial && initial.kind !== "discount" ? initial.reward : "Free item (up to $12)");
  const [cost, setCost] = React.useState(initial ? initial.cost : 1000);
  const [tier, setTier] = React.useState(initial ? initial.tier : "all");
  const [invOn, setInvOn] = React.useState(initial ? !!initial.inventory : false);
  const [invCap, setInvCap] = React.useState(initial && initial.inventory ? initial.inventory.cap : 200);
  const [expiry, setExpiry] = React.useState(initial ? (initial.expiry === "Season end" ? "season" : initial.expiry === "Per game" ? "pergame" : "fixed") : "season");
  const [fixedDate, setFixedDate] = React.useState(initial && initial.expiry && initial.expiry.indexOf("Fixed") === 0 ? initial.expiry.replace("Fixed — ", "") : "Mar 30");

  React.useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const kindMeta = REWARD_KINDS.find((k) => k.id === kind);
  const offerText = kind === "discount"
    ? (discType === "pct" ? discVal + "% off" : "$" + discVal + " off") + " " + ({ beer: "draft beer", food: "food", all: "all F&B", merch: "merchandise", any: "your next purchase" }[applyTo] || "")
    : itemDesc;
  const eligibilityLabel = tier === "all" ? "Any recognized fan" : tier === "silver" ? "Silver tier or higher" : "Gold tier only";
  const expiryLabel = expiry === "season" ? "Season end" : expiry === "pergame" ? "Per game" : "Fixed — " + fixedDate;

  const qualifying = window.NSEG.MEMBERSHIP
    .filter((m) => tier === "all" ? true : tier === "silver" ? (m.tier === "silver" || m.tier === "gold") : m.tier === "gold")
    .reduce((s, m) => s + m.base, 0);

  if (launched) {
    return (
      <div className="ns-builder">
        <BuilderSuccess icon="gift" title={initial ? "Reward updated" : "Reward added to catalog"}
          lines={[`"${name}" is now live in the redemption catalog — eligible fans can redeem it for ${window.NS.fmtNum(cost)} pts at the terminal.`]}
          primaryLabel="Back to loyalty" onClose={onClose} />
      </div>
    );
  }

  return (
    <div className="ns-builder" role="dialog" aria-modal="true" aria-label="New reward">
      <header className="ns-builder__top">
        <button className="ns-iconbtn" onClick={onClose} aria-label="Close builder"><Icon name="x" size={18} /></button>
        <div className="ns-builder__title">
          <div className="ns-eyebrow" style={{ marginBottom: 3 }}>{initial ? "Edit reward" : "New reward"} · {kindMeta.label}</div>
          <input className="ns-builder__name" value={name} onChange={(e) => setName(e.target.value)} aria-label="Reward name" />
        </div>
        <div className="ns-builder__topactions">
          <Badge tone="neutral">Draft</Badge>
        </div>
      </header>

      <div className="ns-builder__body">
        <div className="ns-builder__inner">
          <div className="ns-accordion">

            <RBSection id="reward" n="1" title="Reward" desc="What the fan gets"
              summary={offerText} done
              open={openId === "reward"} onToggle={() => toggle("reward")}>
              <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 0 }}>
                <div style={{ paddingRight: 22 }}>
                  <div className="ns-sectlabel">Reward type</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 18 }}>
                    {REWARD_KINDS.map((k) => {
                      const on = kind === k.id;
                      return (
                        <button key={k.id} className={"ns-memchip" + (on ? " is-on" : "")} style={{ alignItems: "flex-start" }} onClick={() => setKind(k.id)}>
                          <span style={{ width: 26, height: 26, borderRadius: 6, flexShrink: 0, background: on ? "var(--ns-accent)" : "var(--rc-gray-100)", color: on ? "#fff" : "var(--color-text-secondary)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Icon name={k.icon} size={14} /></span>
                          <span className="ns-memchip__meta"><span className="ns-memchip__label">{k.label}</span><span className="ns-memchip__sub" style={{ whiteSpace: "normal", lineHeight: 1.3 }}>{k.sub}</span></span>
                        </button>
                      );
                    })}
                  </div>

                  {kind === "discount" ? (
                    <>
                      <div className="ns-sectlabel">Discount</div>
                      <div className="ns-seg" style={{ marginBottom: 16 }}>{[["pct", "% off"], ["amt", "$ off"]].map(([id, l]) => <button key={id} className={discType === id ? "is-active" : ""} onClick={() => setDiscType(id)}>{l}</button>)}</div>
                      <div className="ns-cond" style={{ marginBottom: 16 }}>
                        <div className="ns-cond__body"><div className="ns-cond__label">{discType === "pct" ? "Percent off" : "Amount off"}</div>
                          <SliderField min={discType === "pct" ? 5 : 1} max={discType === "pct" ? 50 : 25} step={discType === "pct" ? 5 : 1} value={discVal} onChange={setDiscVal}
                            prefix={discType === "pct" ? null : "$"} suffix={discType === "pct" ? "%" : null} />
                        </div>
                      </div>
                      <div className="ns-sectlabel">Applies to</div>
                      <div className="ns-seg" style={{ flexWrap: "wrap", height: "auto" }}>{[["beer", "Draft beer"], ["food", "Food"], ["all", "All F&B"], ["merch", "Merchandise"], ["any", "Any purchase"]].map(([id, l]) => <button key={id} className={applyTo === id ? "is-active" : ""} onClick={() => setApplyTo(id)}>{l}</button>)}</div>
                    </>
                  ) : (
                    <div className="ns-field"><label>{kind === "item" ? "Item description" : "Experience description"}</label>
                      <input className="rc-input" value={itemDesc} onChange={(e) => setItemDesc(e.target.value)} />
                    </div>
                  )}
                </div>
                <div style={{ paddingLeft: 22, borderLeft: "1px solid var(--color-border-default)" }}>
                  <div className="ns-sectlabel">Terminal preview</div>
                  <div style={{ background: "var(--ns-navy)", borderRadius: 12, padding: "16px", color: "#fff" }}>
                    <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.55)", marginBottom: 8 }}>Fan taps to pay</div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>You have {window.NS.fmtNum(cost)}+ points</div>
                    <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.8)" }}>Redeem {offerText}?</div>
                  </div>
                </div>
              </div>
            </RBSection>

            <RBSection id="eligibility" n="2" title="Cost & eligibility" desc="What it costs, and who can redeem it"
              summary={window.NS.fmtNum(cost) + " pts · " + eligibilityLabel} done
              open={openId === "eligibility"} onToggle={() => toggle("eligibility")}>
              <div className="ns-cond" style={{ marginBottom: 18 }}>
                <div className="ns-cond__body"><div className="ns-cond__label">Points cost</div>
                  <SliderField min={100} max={20000} step={100} value={cost} onChange={setCost} suffix=" pts" width={80} />
                </div>
              </div>
              <div className="ns-sectlabel">Tier gate</div>
              <div className="ns-seg" style={{ marginBottom: 14 }}>{[["all", "All fans"], ["silver", "Silver +"], ["gold", "Gold only"]].map(([id, l]) => <button key={id} className={tier === id ? "is-active" : ""} onClick={() => setTier(id)}>{l}</button>)}</div>
              <div className="ns-callout ns-callout--info"><Icon name="users" size={15} /><span><strong>{window.NS.fmtNum(qualifying)} fans</strong> currently qualify at this tier gate.</span></div>
            </RBSection>

            <RBSection id="inventory" n="3" title="Inventory" desc="Whether this reward can run out"
              summary={invOn ? "Capped at " + window.NS.fmtNum(invCap) : "Unlimited"} done
              open={openId === "inventory"} onToggle={() => toggle("inventory")}>
              <RBToggle on={invOn} onClick={() => setInvOn((v) => !v)} label="Limited inventory" sub="Closes once the cap is reached, regardless of points available" />
              {invOn && <div style={{ marginTop: 12 }}><div className="ns-cond"><div className="ns-cond__body"><div className="ns-cond__label">Redemption cap</div><SliderField min={10} max={1000} step={10} value={invCap} onChange={setInvCap} width={72} /></div></div></div>}
            </RBSection>

            <RBSection id="expiry" n="4" title="Expiry" desc="When this reward stops being redeemable"
              summary={expiryLabel} done
              open={openId === "expiry"} onToggle={() => toggle("expiry")}>
              <div className="ns-seg" style={{ marginBottom: 14 }}>{[["season", "Season end"], ["pergame", "Per game"], ["fixed", "Fixed date"]].map(([id, l]) => <button key={id} className={expiry === id ? "is-active" : ""} onClick={() => setExpiry(id)}>{l}</button>)}</div>
              {expiry === "fixed" && <div className="ns-field" style={{ maxWidth: 240 }}><label>Expiry date</label><input className="rc-input" value={fixedDate} onChange={(e) => setFixedDate(e.target.value)} /></div>}
            </RBSection>

          </div>
        </div>
      </div>

      <footer className="ns-builder__foot">
        <span className="ns-builder__savedtag"><Icon name="check" size={13} stroke={2.6} />Draft saved</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="ns-btn ns-btn--secondary" onClick={onClose}>Save draft</button>
          <button className="ns-btn ns-btn--primary" onClick={() => setLaunched(true)}><Icon name="gift" size={14} />{initial ? "Save changes" : "Add to catalog"}</button>
        </div>
      </footer>
    </div>
  );
}

window.RewardBuilder = RewardBuilder;
