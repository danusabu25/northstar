/* Northstar — campaign + promotion creation wizards. */

function OptionCards({ options, value, onChange, cols }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols || 2}, 1fr)`, gap: 8 }}>
      {options.map((o) => {
        const on = value === o.id;
        return (
          <button key={o.id} className={"ns-memchip" + (on ? " is-on" : "")} style={{ alignItems: "flex-start" }} onClick={() => onChange(o.id)}>
            <span style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, background: on ? "var(--ns-accent)" : "var(--rc-gray-100)", color: on ? "#fff" : "var(--color-text-secondary)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Icon name={o.icon} size={15} /></span>
            <span className="ns-memchip__meta">
              <span className="ns-memchip__label">{o.label}</span>
              <span className="ns-memchip__sub" style={{ whiteSpace: "normal", lineHeight: 1.35 }}>{o.sub}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function SuccessPanel({ icon, title, lines, primaryLabel, onClose }) {
  return (
    <div className="ns-wiz" style={{ textAlign: "center", padding: "44px 20px" }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--rc-green-100)", color: "var(--rc-green-600)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}><Icon name={icon || "check"} size={28} stroke={2.4} /></div>
      <h2 style={{ fontSize: 19, fontWeight: 600, color: "var(--rc-gray-900)", marginBottom: 8 }}>{title}</h2>
      {lines.map((l, i) => <div key={i} className="ns-muted" style={{ fontSize: 12.5, lineHeight: 1.6 }}>{l}</div>)}
      <button className="ns-btn ns-btn--primary" style={{ marginTop: 22 }} onClick={onClose}>{primaryLabel || "Done"}</button>
    </div>
  );
}

const CAMP_OBJECTIVES = [
  { id: "reengage", label: "Re-engagement", sub: "Win back fans who've gone quiet", icon: "refresh", preset: "lapsing", tmpl: "Hey [first_name], we haven't seen you lately. 20% off all food is waiting at every home game. See you soon." },
  { id: "activation", label: "Pre-game activation", sub: "Drive attendance & spend tonight", icon: "zap", preset: "all_sth", tmpl: "See you tonight, [first_name]! Your [benefit_tier] benefit is active at all stands." },
  { id: "winback", label: "Benefit win-back", sub: "Nudge unused-benefit members", icon: "gift", preset: "win_back_benefit", tmpl: "Did you know your [benefit_tier] membership includes 20% off all food? It applies automatically when you tap." },
  { id: "renewal", label: "Renewal nudge", sub: "Reach STHs before the window", icon: "clock", preset: "at_risk", tmpl: "Your seasonal benefits renew soon, [first_name]. Here's what you've used this season — let's keep it going." },
  { id: "highvalue", label: "Convert non-STH", sub: "Upsell high-value occasional fans", icon: "trophy", preset: "non_sth_high", tmpl: "You're one of our most frequent guests, [first_name]. Ask about a season plan — your benefits would pay for themselves." },
  { id: "announce", label: "Announcement", sub: "Broadcast to a broad audience", icon: "message", preset: "all_recognized", tmpl: "[first_name], big news at tonight's game — show this text at any stand for a surprise." },
];

const CAMP_CHANNELS = [
  { id: "sms", label: "SMS", icon: "message", sub: "Reaches every fan with a number on file — not just app installs." },
  { id: "email", label: "Email", icon: "mail", sub: "Richer layout and detail, lower urgency than SMS." },
  { id: "push", label: "Push", icon: "bell", sub: "Instant and free, but reaches app installs only." },
];

function campSeedJourney(obj) {
  return {
    trigger: obj.sub,
    enrolled: 0,
    steps: [
      { day: "Step 1", type: "message", msg: obj.tmpl },
      { day: "Step 2", type: "wait", waitN: 3, waitUnit: "days" },
      { day: "Handoff", type: "human", human: true, msg: "Fan hasn't responded — flag for manual outreach." },
    ],
  };
}

function CampaignBuilder({ onClose, seedAudience }) {
  const seeded = seedAudience && (seedAudience.memberships.length || seedAudience.conditions.length);
  const [openId, setOpenId] = React.useState("type");
  const toggle = (id) => setOpenId((cur) => (cur === id ? null : id));
  const [launched, setLaunched] = React.useState(false);

  const [s, set] = React.useState({
    name: "Mid-season re-engagement",
    campType: "onetime", // 'onetime' | 'journey'
    obj: "reengage",
    channel: "sms",
    audience: seeded ? { memberships: seedAudience.memberships.slice(), conditions: seedAudience.conditions.map((c) => ({ ...c })) } : { memberships: ["platinum", "gold_full", "gold_half", "silver_plan"], conditions: [{ dim: "recency_not_last", val: 3 }] },
    msg: CAMP_OBJECTIVES[0].tmpl,
    journey: campSeedJourney(CAMP_OBJECTIVES[0]),
    sendTime: "pre2",
    cap: "1day",
    promo: {
      attach: false,
      typeGrp: "Discount", type: "pct", discType: "pct", discVal: 20, applyTo: "beer",
      inherit: true, validity: "tonight", audienceOverride: { memberships: [], conditions: [] },
      freqCap: "game", budgetOn: true, budgetVal: 1500,
      conflict: "best",
    },
  });
  const u = (patch) => set((p) => ({ ...p, ...patch }));
  const up = (patch) => set((p) => ({ ...p, promo: { ...p.promo, ...patch } }));

  React.useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const est = window.NSEG.estimate(s.audience);
  const objMeta = CAMP_OBJECTIVES.find((x) => x.id === s.obj);
  const channelMeta = CAMP_CHANNELS.find((c) => c.id === s.channel);
  const pickObj = (id) => {
    const o = CAMP_OBJECTIVES.find((x) => x.id === id);
    const p = window.NSEG.PRESETS.find((x) => x.id === o.preset);
    u({ obj: id, msg: o.tmpl, journey: campSeedJourney(o), audience: p ? { memberships: p.memberships.slice(), conditions: p.conditions.map((c) => ({ ...c })) } : s.audience });
  };

  const segCount = Math.ceil(s.msg.length / 160);
  const mergeFields = ["[first_name]", "[benefit_tier]", "[points_balance]", "[last_visit]"];
  const sendTimeLabel = { pre2: "2h before Game 15", pregame: "Gates open · Game 15", win: "On win trigger", now: "Send now" }[s.sendTime];
  const capLabel = { "1day": "1 / fan / day", "1game": "1 / fan / game", none: "No cap" }[s.cap];
  const msgSectionId = s.campType === "journey" ? "journey" : "message";
  const msgSummary = s.campType === "journey" ? s.journey.steps.length + " steps" : segCount + " SMS segment" + (segCount !== 1 ? "s" : "");

  const promoOfferText = s.promo.attach ? (s.promo.discType === "pct" ? s.promo.discVal + "% off" : s.promo.discType === "amt" ? "$" + s.promo.discVal + " off" : s.promo.discType === "points" ? s.promo.discVal + " bonus pts" : "Free item") + " " + ({ beer: "draft beer", food: "food", all: "all F&B", merch: "merch" }[s.promo.applyTo] || "") : null;
  const promoConflictLabel = { stackable: "Stackable", first: "First wins", best: "Best value" }[s.promo.conflict];

  if (launched) {
    return (
      <div className="ns-builder">
        <BuilderSuccess icon={s.campType === "journey" ? "activity" : "message"} title={s.campType === "journey" ? "Journey activated" : "Campaign scheduled"}
          lines={[
            ...(s.campType === "journey"
              ? [`"${s.name}" will enroll ${window.NS.fmtNum(est.count)} matching fans and run its ${s.journey.steps.length}-step journey automatically.`]
              : [`"${s.name}" will send to ${window.NS.fmtNum(est.smsReachable)} reachable fans.`, "Attribution will populate after the next game."]),
            ...(s.promo.attach ? [`Attached promotion: ${promoOfferText} — resolved against overlapping promotions via ${promoConflictLabel.toLowerCase()}.`] : []),
          ]}
          primaryLabel="Back to campaigns" onClose={onClose} />
      </div>
    );
  }

  return (
    <div className="ns-builder" role="dialog" aria-modal="true" aria-label="New campaign">
      <header className="ns-builder__top">
        <button className="ns-iconbtn" onClick={onClose} aria-label="Close builder"><Icon name="x" size={18} /></button>
        <div className="ns-builder__title">
          <div className="ns-eyebrow" style={{ marginBottom: 3 }}>New campaign · {channelMeta.label}{s.campType === "journey" ? " · journey" : ""}</div>
          <input className="ns-builder__name" value={s.name} onChange={(e) => u({ name: e.target.value })} aria-label="Campaign name" />
        </div>
        <div className="ns-builder__topactions">
          <Badge tone="neutral">Draft</Badge>
        </div>
      </header>

      <div className="ns-builder__body">
        <div className="ns-builder__inner">
          <div className="ns-accordion">

            <RBSection id="type" n="1" title="Type & objective" desc="What kind of campaign, and why"
              summary={(s.campType === "journey" ? "Journey" : "One-time") + " · " + objMeta.label} done
              open={openId === "type"} onToggle={() => toggle("type")}>
              <div className="ns-sectlabel">Campaign type</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 18 }}>
                {[["onetime", "One-time blast", "message", "A single message sent once to the matching audience"], ["journey", "Multi-step journey", "activity", "A branching sequence of messages, waits, and handoffs — enrolls fans automatically"]].map(([id, l, ic, sub]) => {
                  const on = s.campType === id;
                  return (
                    <button key={id} className={"ns-memchip" + (on ? " is-on" : "")} style={{ alignItems: "flex-start" }} onClick={() => u({ campType: id })}>
                      <span style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, background: on ? "var(--ns-accent)" : "var(--rc-gray-100)", color: on ? "#fff" : "var(--color-text-secondary)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Icon name={ic} size={15} /></span>
                      <span className="ns-memchip__meta"><span className="ns-memchip__label">{l}</span><span className="ns-memchip__sub" style={{ whiteSpace: "normal", lineHeight: 1.35 }}>{sub}</span></span>
                    </button>
                  );
                })}
              </div>
              <div className="ns-sectlabel">Objective</div>
              <OptionCards options={CAMP_OBJECTIVES} value={s.obj} onChange={pickObj} cols={3} />
              <div className="ns-sectlabel" style={{ marginTop: 18 }}>Channel</div>
              <div className="ns-seg" style={{ marginBottom: 4 }}>
                {CAMP_CHANNELS.map((c) => <button key={c.id} className={s.channel === c.id ? "is-active" : ""} onClick={() => u({ channel: c.id })}><Icon name={c.icon} size={12} />{c.label}</button>)}
              </div>
              <div className="ns-muted" style={{ fontSize: 10.5 }}>{channelMeta.sub}</div>
            </RBSection>

            <RBSection id="audience" n="2" title="Audience" desc="Who qualifies for this campaign"
              summary={window.NS.fmtNum(est.count) + " fans"} done
              open={openId === "audience"} onToggle={() => toggle("audience")}>
              <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 0 }}>
                <div style={{ paddingRight: 22 }}><AudienceBuilder audience={s.audience} setAudience={(a) => u({ audience: a })} /></div>
                <div style={{ paddingLeft: 22, borderLeft: "1px solid var(--color-border-default)" }}><AudienceSummary audience={s.audience} channel={s.channel === "sms" ? "sms" : null} /></div>
              </div>
            </RBSection>

            {s.campType === "journey" ? (
              <RBSection id="journey" n="3" title="Journey" desc="Build the branching sequence — add steps, waits, and a human handoff"
                summary={msgSummary} done
                open={openId === "journey"} onToggle={() => toggle("journey")}>
                <FlowCanvas sequence={s.journey} editable onChange={(j) => u({ journey: j })} />
              </RBSection>
            ) : (
              <RBSection id="message" n="3" title="Message" desc="What the fan receives"
                summary={msgSummary} done
                open={openId === "message"} onToggle={() => toggle("message")}>
                <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 0 }}>
                  <div style={{ paddingRight: 22 }}>
                    <div className="ns-field" style={{ marginBottom: 12 }}><label>Message</label>
                      <textarea className="rc-input" style={{ height: 110, paddingTop: 9, resize: "none", fontFamily: "var(--font-family-primary)", lineHeight: 1.5 }} value={s.msg} onChange={(e) => u({ msg: e.target.value })} />
                    </div>
                    <div className="ns-sectlabel">Insert merge field</div>
                    <div className="ns-chips" style={{ marginBottom: 16 }}>{mergeFields.map((f) => <button key={f} className="ns-preset ns-mono" style={{ fontSize: 11 }} onClick={() => u({ msg: s.msg + " " + f })}>{f}</button>)}</div>
                    {s.channel === "sms" && (
                      <div className="ns-spread" style={{ fontSize: 11 }}>
                        <span className="ns-muted">{s.msg.length} chars · {segCount} SMS segment{segCount !== 1 ? "s" : ""}</span>
                        <Badge tone="neutral"><Icon name="shield" size={11} />STOP appended automatically</Badge>
                      </div>
                    )}
                  </div>
                  <div style={{ paddingLeft: 22, borderLeft: "1px solid var(--color-border-default)" }}>
                    <div className="ns-sectlabel">Preview</div>
                    <div style={{ background: "var(--ns-navy)", borderRadius: 12, padding: "16px", color: "#fff" }}>
                      <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.55)", marginBottom: 8 }}>Northstar · United Center</div>
                      <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "11px 13px", fontSize: 12.5, lineHeight: 1.5 }}>{s.msg.replace(/\[first_name\]/g, "Marcus").replace(/\[benefit_tier\]/g, "Gold").replace(/\[points_balance\]/g, "5,320").replace(/\[last_visit\]/g, "Game 14")}<div style={{ marginTop: 8, color: "rgba(255,255,255,0.5)", fontSize: 10.5 }}>Reply STOP to unsubscribe</div></div>
                    </div>
                  </div>
                </div>
              </RBSection>
            )}

            <RBSection id="promotion" n="4" title="Promotion" desc="Optionally attach an incentive to this campaign"
              summary={s.promo.attach ? promoOfferText : "None attached"} done={s.promo.attach}
              open={openId === "promotion"} onToggle={() => toggle("promotion")}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: s.promo.attach ? 18 : 0 }}>
                {[[false, "No promotion", "message", "This campaign is communication only — no discount or reward attached"], [true, "Attach a promotion", "tag", "Layer a discount, bonus points, or reward on top of this campaign"]].map(([val, l, ic, sub]) => {
                  const on = s.promo.attach === val;
                  return (
                    <button key={String(val)} className={"ns-memchip" + (on ? " is-on" : "")} style={{ alignItems: "flex-start" }} onClick={() => up({ attach: val })}>
                      <span style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, background: on ? "var(--ns-accent)" : "var(--rc-gray-100)", color: on ? "#fff" : "var(--color-text-secondary)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Icon name={ic} size={15} /></span>
                      <span className="ns-memchip__meta"><span className="ns-memchip__label">{l}</span><span className="ns-memchip__sub" style={{ whiteSpace: "normal", lineHeight: 1.35 }}>{sub}</span></span>
                    </button>
                  );
                })}
              </div>

              {s.promo.attach && (
                <>
                  <div className="ns-sectlabel">Promotion type</div>
                  <div className="ns-seg" style={{ marginBottom: 12, flexWrap: "wrap", height: "auto" }}>{PROMO_TYPE_GROUPS.map((g) => <button key={g} className={s.promo.typeGrp === g ? "is-active" : ""} onClick={() => up({ typeGrp: g })}>{g}</button>)}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                    {window.NS.PROMO_TYPES.filter((t) => t.group === s.promo.typeGrp).map((o) => {
                      const on = s.promo.type === o.id;
                      return (
                        <button key={o.id} className={"ns-memchip" + (on ? " is-on" : "")} style={{ alignItems: "flex-start" }} onClick={() => up({ type: o.id, discType: PROMO_TYPE_DEFAULT_OFFER[o.id] || "pct" })}>
                          <span style={{ width: 26, height: 26, borderRadius: 6, flexShrink: 0, background: on ? "var(--ns-accent)" : "var(--rc-gray-100)", color: on ? "#fff" : "var(--color-text-secondary)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Icon name={o.icon} size={14} /></span>
                          <span className="ns-memchip__meta"><span className="ns-memchip__label">{o.label}</span><span className="ns-memchip__sub" style={{ whiteSpace: "normal", lineHeight: 1.3 }}>{o.sub}</span></span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="ns-sectlabel">Offer</div>
                  <div className="ns-seg" style={{ marginBottom: 16, flexWrap: "wrap", height: "auto" }}>{[["pct", "% off"], ["amt", "$ off"], ["free", "Free item"], ["points", "Bonus pts"]].map(([id, l]) => <button key={id} className={s.promo.discType === id ? "is-active" : ""} onClick={() => up({ discType: id })}>{l}</button>)}</div>
                  {(s.promo.discType === "pct" || s.promo.discType === "amt" || s.promo.discType === "points") && (
                    <div className="ns-cond" style={{ marginBottom: 16 }}>
                      <div className="ns-cond__body"><div className="ns-cond__label">{s.promo.discType === "pct" ? "Percent off" : s.promo.discType === "amt" ? "Amount off" : "Bonus points"}</div>
                        <SliderField min={s.promo.discType === "pct" ? 5 : s.promo.discType === "points" ? 100 : 1} max={s.promo.discType === "pct" ? 50 : s.promo.discType === "points" ? 2000 : 25} step={s.promo.discType === "pct" ? 5 : s.promo.discType === "points" ? 100 : 1} value={s.promo.discVal} onChange={(v) => up({ discVal: v })}
                          prefix={s.promo.discType === "amt" ? "$" : null} suffix={s.promo.discType === "pct" ? "%" : s.promo.discType === "points" ? " pts" : null} width={s.promo.discType === "points" ? 72 : 56} />
                      </div>
                    </div>
                  )}
                  <div className="ns-sectlabel">Applies to</div>
                  <div className="ns-seg" style={{ marginBottom: 18, flexWrap: "wrap", height: "auto" }}>{[["beer", "Draft beer"], ["food", "Food"], ["all", "All F&B"], ["merch", "Merch"]].map(([id, l]) => <button key={id} className={s.promo.applyTo === id ? "is-active" : ""} onClick={() => up({ applyTo: id })}>{l}</button>)}</div>

                  <div className="ns-divider" style={{ margin: "16px 0" }} />
                  <RBToggle on={s.promo.inherit} onClick={() => up({ inherit: !s.promo.inherit })} label="Inherit campaign audience & validity" sub="Use the same audience and schedule as this campaign, rather than defining new ones" />
                  {s.promo.inherit ? (
                    <div className="ns-callout ns-callout--info" style={{ marginTop: 12 }}><Icon name="link" size={15} /><span>This promotion applies to the same <strong>{window.NS.fmtNum(est.count)} fans</strong> and runs on the same schedule as the campaign above.</span></div>
                  ) : (
                    <div style={{ marginTop: 14 }}>
                      <div className="ns-sectlabel">Promotion validity window</div>
                      <div className="ns-seg" style={{ marginBottom: 16, flexWrap: "wrap", height: "auto" }}>{[["tonight", "Tonight · Game 15"], ["homestand", "This homestand"], ["trigger", "On trigger"], ["custom", "Custom dates"]].map(([id, l]) => <button key={id} className={s.promo.validity === id ? "is-active" : ""} onClick={() => up({ validity: id })}>{l}</button>)}</div>
                      <div className="ns-sectlabel">Narrow the audience further</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 0 }}>
                        <div style={{ paddingRight: 22 }}><AudienceBuilder audience={s.promo.audienceOverride} setAudience={(a) => up({ audienceOverride: a })} /></div>
                        <div style={{ paddingLeft: 22, borderLeft: "1px solid var(--color-border-default)" }}><AudienceSummary audience={s.promo.audienceOverride} /></div>
                      </div>
                    </div>
                  )}

                  <div className="ns-divider" style={{ margin: "18px 0" }} />
                  <div className="ns-sectlabel">Redemption limits</div>
                  <div className="ns-seg" style={{ marginBottom: 16, flexWrap: "wrap", height: "auto" }}>{[["game", "1 / fan / game"], ["season", "Max 3 / season"], ["total", "1 / fan total"], ["none", "No cap"]].map(([id, l]) => <button key={id} className={s.promo.freqCap === id ? "is-active" : ""} onClick={() => up({ freqCap: id })}>{l}</button>)}</div>
                  <RBToggle on={s.promo.budgetOn} onClick={() => up({ budgetOn: !s.promo.budgetOn })} label="Budget cap" sub="Pause the promotion automatically when this discount value is reached" />
                  {s.promo.budgetOn && <div style={{ marginTop: 8, marginBottom: 12 }}><div className="ns-cond"><div className="ns-cond__body"><div className="ns-cond__label">Budget ceiling</div><SliderField min={500} max={10000} step={100} value={s.promo.budgetVal} onChange={(v) => up({ budgetVal: v })} prefix="$" width={72} /></div></div></div>}

                  <div className="ns-divider" style={{ margin: "18px 0" }} />
                  <div className="ns-sectlabel">If this overlaps another active promotion</div>
                  <div className="ns-seg" style={{ marginBottom: 6 }}>{[["stackable", "Stackable"], ["first", "First wins"], ["best", "Best value"]].map(([id, l]) => <button key={id} className={s.promo.conflict === id ? "is-active" : ""} onClick={() => up({ conflict: id })}>{l}</button>)}</div>
                  <div className="ns-muted" style={{ fontSize: 10.5 }}>Resolved automatically at the terminal — see Promotions → Simulator to test this against other live promotions.</div>
                </>
              )}
            </RBSection>

            <RBSection id="schedule" n="5" title="Schedule & limits" desc="When it sends, and how often a fan can receive it"
              summary={sendTimeLabel + " · " + capLabel} done
              open={openId === "schedule"} onToggle={() => toggle("schedule")}>
              <div className="ns-sectlabel">When to send</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
                {[["pre2", "2 hours before Game 15", "Lands as fans plan their evening"], ["pregame", "Gates open · Game 15", "Catch them on arrival"], ["win", "On win trigger", "Fires automatically if the Bulls win"], ["now", "Send now", "Immediate broadcast"]].map(([id, l, sub]) => (
                  <button key={id} className={"ns-memchip" + (s.sendTime === id ? " is-on" : "")} onClick={() => u({ sendTime: id })}>
                    <span className="ns-memchip__check" style={{ borderRadius: "50%" }}>{s.sendTime === id && <Icon name="check" size={11} stroke={3} />}</span>
                    <span className="ns-memchip__meta"><span className="ns-memchip__label">{l}</span><span className="ns-memchip__sub">{sub}</span></span>
                  </button>
                ))}
              </div>
              <div className="ns-sectlabel">Frequency cap</div>
              <div className="ns-seg" style={{ marginBottom: 4 }}>
                {[["1day", "1 / fan / day"], ["1game", "1 / fan / game"], ["none", "No cap"]].map(([id, l]) => <button key={id} className={s.cap === id ? "is-active" : ""} onClick={() => u({ cap: id })}>{l}</button>)}
              </div>
              <div className="ns-callout ns-callout--info" style={{ marginTop: 14 }}><Icon name="clock" size={15} /><span>Sends respect carrier quiet hours and opt-out status. Delivery failures are logged and not retried without your action.</span></div>
            </RBSection>

          </div>
        </div>
      </div>

      <footer className="ns-builder__foot">
        <span className="ns-builder__savedtag"><Icon name="check" size={13} stroke={2.6} />Draft saved</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="ns-btn ns-btn--secondary" onClick={onClose}>Save draft</button>
          <button className="ns-btn ns-btn--primary" onClick={() => setLaunched(true)}>
            <Icon name={s.campType === "journey" ? "activity" : "message"} size={14} />
            {s.campType === "journey" ? "Activate journey" : s.sendTime === "now" ? "Send now" : "Schedule campaign"}
          </button>
        </div>
      </footer>
    </div>
  );
}

window.CampaignWizard = CampaignBuilder;
