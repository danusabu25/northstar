/* Northstar — enterprise rule builder sections.
   Each of the six rule components is fully configurable here.
   Consumed by LoyaltyRuleBuilder (loyalty_rules.jsx). */

// ---- option data -------------------------------------------------------
const RB_TRIGGERS = [
  { id: "purchase", label: "Purchase", sub: "Any purchase / F&B only / Merchandise only / Specific category", icon: "dollar", group: "earn", action: "rate" },
  { id: "gameday", label: "Game-day purchase", sub: "First purchase of the game / Halftime window / Final period / Any game-day", icon: "calendar", group: "earn", action: "mult" },
  { id: "outcome", label: "Game outcome", sub: "Team wins / Team loses / Overtime / Playoff game / Rivalry game", icon: "trophy", group: "sports", action: "mult" },
  { id: "streak", label: "Streak", sub: "N consecutive game-day purchases", icon: "trendUp", group: "earn", action: "bonus" },
  { id: "milestone", label: "Milestone", sub: "Nth purchase this season / Nth benefit redemption / First purchase ever", icon: "star", group: "earn", action: "bonus" },
  { id: "account", label: "Account event", sub: "Account linked / Renewal completed / Tier upgraded", icon: "shield", group: "earn", action: "bonus" },
  { id: "behavioral", label: "Behavioral", sub: "First purchase above personal baseline / First visit to a new stand / Return after N missed games", icon: "activity", group: "behavioral", action: "mult" },
];

const RB_TRIGGER_DETAIL = {
  purchase: [["any", "Any purchase"], ["fnb", "F&B only"], ["merch", "Merchandise only"], ["specific", "Specific category"]],
  gameday: [["first", "First purchase of the game"], ["halftime", "Halftime window"], ["final", "Final period"], ["any", "Any game-day purchase"]],
  outcome: [["win", "Team wins"], ["loss", "Team loses"], ["ot", "Overtime"], ["playoff", "Playoff game"], ["rivalry", "Rivalry game"]],
  streak: [["consecutive", "N consecutive game-day purchases"]],
  milestone: [["nth_purchase", "Nth purchase this season"], ["nth_benefit", "Nth benefit redemption"], ["first_ever", "First purchase ever"]],
  account: [["link", "Account linked"], ["renewal", "Renewal completed"], ["tier_up", "Tier upgraded"]],
  behavioral: [["baseline", "First purchase above personal baseline"], ["new_stand", "First visit to a new stand"], ["lapsed", "Return after N missed games"]],
};

const RB_ACTIONS = [
  { id: "rate", label: "Earn rate", sub: "Points per dollar", icon: "dollar" },
  { id: "mult", label: "Multiplier", sub: "Multiply base points", icon: "bolt" },
  { id: "bonus", label: "Flat bonus", sub: "Fixed points award", icon: "gift" },
  { id: "tiered", label: "Tiered bonus", sub: "Scales by milestone", icon: "trophy" },
];

const RB_EXPIRY = [
  { id: "season", label: "Season end", sub: "Clear at season reset", icon: "flag" },
  { id: "activity", label: "Activity-based", sub: "Expire after X days inactive", icon: "clock" },
  { id: "rolling", label: "Rolling", sub: "Expire X days after each earn", icon: "refresh" },
  { id: "fixed", label: "Fixed-date", sub: "All points expire on a date", icon: "calendar" },
];

const RB_COND_DIMS = [
  { id: "tier", label: "Fan tier", kind: "select", options: [["gold", "Gold"], ["silver", "Silver"], ["bronze", "Bronze"]], def: "gold" },
  { id: "spend_season", label: "Season spend", kind: "money", min: 0, max: 2000, step: 50, def: 500 },
  { id: "attendance", label: "Attendance", kind: "num", min: 1, max: 41, step: 1, unit: " games", def: 10 },
  { id: "visit_spend", label: "Spend this visit", kind: "money", min: 0, max: 200, step: 5, def: 50 },
  { id: "category", label: "Purchase category", kind: "select", options: [["fnb", "F&B"], ["merch", "Merch"], ["ticket", "Ticket"]], def: "fnb" },
  { id: "membership", label: "Membership", kind: "select", options: [["sth", "Season-ticket holder"], ["nonsth", "Non-STH"], ["any", "Any recognized"]], def: "sth" },
  { id: "time_window", label: "Time window", kind: "select", options: [["pregame", "Pre-game"], ["halftime", "Halftime"], ["q4", "Final period"]], def: "halftime" },
  { id: "balance", label: "Points balance", kind: "num", min: 0, max: 10000, step: 500, unit: " pts", def: 5000 },
];
const RB_DIM_BY_ID = Object.fromEntries(RB_COND_DIMS.map((d) => [d.id, d]));

// ---- small shared controls --------------------------------------------
// Accordion section used by every full-page builder (Campaign, Promotion,
// Loyalty rule). Only the open section renders its body; the rest collapse
// to a single summary line — one section open at a time.
function RBSection({ id, n, title, desc, summary, done, open, onToggle, children }) {
  return (
    <section className={"ns-accordion__item" + (open ? " is-open" : "")} data-section={id}>
      <button className="ns-accordion__head" onClick={onToggle} aria-expanded={open}>
        <span className={"ns-accordion__check" + (done ? " is-done" : "")}>{done ? <Icon name="check" size={13} stroke={3} /> : n}</span>
        <span className="ns-accordion__meta">
          <span className="ns-accordion__title">{title}</span>
          {open ? (desc && <span className="ns-accordion__desc">{desc}</span>) : (summary && <span className="ns-accordion__summary">{summary}</span>)}
        </span>
        <span className="ns-accordion__chev"><Icon name={open ? "chevDown" : "chevRight"} size={16} /></span>
      </button>
      {open && <div className="ns-accordion__body">{children}</div>}
    </section>
  );
}

function RBToggle({ on, onClick, label, sub }) {
  return (
    <button className={"ns-memchip" + (on ? " is-on" : "")} style={{ width: "100%" }} onClick={onClick}>
      <span className="ns-memchip__check">{on && <Icon name="check" size={11} stroke={3} />}</span>
      <span className="ns-memchip__meta"><span className="ns-memchip__label">{label}</span><span className="ns-memchip__sub" style={{ whiteSpace: "normal", lineHeight: 1.35 }}>{sub}</span></span>
    </button>
  );
}

function RBSlider({ label, min, max, step, value, onChange, prefix, suffix, width }) {
  return (
    <div className="ns-cond"><div className="ns-cond__body"><div className="ns-cond__label">{label}</div>
      <SliderField min={min} max={max} step={step} value={value} onChange={onChange} prefix={prefix} suffix={suffix} width={width} />
    </div></div>
  );
}

// ---- condition clause builder -----------------------------------------
function RBCondControl({ cond, onChange }) {
  const d = RB_DIM_BY_ID[cond.dim];
  if (!d) return null;
  if (d.kind === "select") {
    return (
      <select className="rc-input" style={{ height: 30, padding: "4px 10px", maxWidth: 220 }} value={cond.val} onChange={(e) => onChange({ val: e.target.value })}>
        {d.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    );
  }
  return (
    <div style={{ marginTop: 0, flex: 1 }}>
      <SliderField min={d.min} max={d.max} step={d.step} value={cond.val} onChange={(v) => onChange({ val: v })}
        prefix={d.kind === "money" ? "$" : null} suffix={d.kind === "money" ? null : (d.unit || null)} width={80} />
    </div>
  );
}

function ConditionBuilder({ s, u }) {
  const [addOpen, setAddOpen] = React.useState(false);
  const used = new Set(s.conditions.map((c) => c.dim));
  const avail = RB_COND_DIMS.filter((d) => !used.has(d.id));
  const numericOps = [["gte", "≥"], ["lte", "≤"], ["eq", "="]];
  const selOps = [["is", "is"], ["isnot", "is not"]];

  const add = (dim) => { const d = RB_DIM_BY_ID[dim]; u({ conditions: [...s.conditions, { dim, op: d.kind === "select" ? "is" : "gte", val: d.def }] }); setAddOpen(false); };
  const upd = (i, patch) => { const next = s.conditions.slice(); next[i] = { ...next[i], ...patch }; u({ conditions: next }); };
  const rm = (i) => u({ conditions: s.conditions.filter((_, j) => j !== i) });

  return (
    <div>
      <div className="ns-spread" style={{ marginBottom: 10 }}>
        <span className="ns-sectlabel" style={{ margin: 0 }}>Match logic</span>
        <div className="ns-seg">
          {[["all", "Match ALL (AND)"], ["any", "Match ANY (OR)"]].map(([id, l]) => <button key={id} className={s.condMatch === id ? "is-active" : ""} onClick={() => u({ condMatch: id })}>{l}</button>)}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
        {s.conditions.length === 0 && <div className="ns-muted" style={{ fontSize: 11.5, padding: "6px 0" }}>No conditions — every transaction matching the trigger qualifies. Add a condition to narrow it.</div>}
        {s.conditions.map((c, i) => {
          const d = RB_DIM_BY_ID[c.dim];
          const ops = d.kind === "select" ? selOps : numericOps;
          return (
            <div className="ns-cond" key={c.dim} style={{ flexWrap: "wrap" }}>
              <span className="ns-cond__op">{i === 0 ? "WHERE" : s.condMatch === "all" ? "AND" : "OR"}</span>
              <div className="ns-cond__body" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span className="ns-cond__label" style={{ minWidth: 110 }}>{d.label}</span>
                <div className="ns-seg ns-seg--mini">{ops.map(([id, l]) => <button key={id} className={c.op === id ? "is-active" : ""} onClick={() => upd(i, { op: id })}>{l}</button>)}</div>
                <RBCondControl cond={c} onChange={(patch) => upd(i, patch)} />
              </div>
              <button className="ns-cond__rm" onClick={() => rm(i)} aria-label="Remove"><Icon name="x" size={14} /></button>
            </div>
          );
        })}
      </div>
      <div className="ns-addcond">
        <button className="ns-btn ns-btn--secondary ns-btn--sm" onClick={() => setAddOpen((v) => !v)} disabled={avail.length === 0}><Icon name="plus" size={13} />Add condition</button>
        {addOpen && <div className="ns-addmenu">{avail.map((d) => <button key={d.id} onClick={() => add(d.id)}>{d.label}</button>)}</div>}
      </div>
    </div>
  );
}

// ---- membership eligibility picker ------------------------------------
function MembershipPicker({ s, u }) {
  const MEM = window.NSEG.MEMBERSHIP;
  const toggle = (id) => { const has = s.memberships.includes(id); u({ memberships: has ? s.memberships.filter((m) => m !== id) : [...s.memberships, id] }); };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {MEM.map((m) => {
        const on = s.memberships.includes(m.id);
        return (
          <button key={m.id} className={"ns-memchip" + (on ? " is-on" : "")} onClick={() => toggle(m.id)}>
            <span className="ns-memchip__check">{on && <Icon name="check" size={11} stroke={3} />}</span>
            <span className="ns-memchip__meta"><span className="ns-memchip__label">{m.label}{!m.sth && <span style={{ fontSize: 9, fontWeight: 600, color: "var(--color-text-secondary)", marginLeft: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>non-STH</span>}</span><span className="ns-memchip__sub">{m.sub}</span></span>
            <span className="ns-memchip__base">{window.NS.fmtNum(m.base)}</span>
          </button>
        );
      })}
    </div>
  );
}

window.RB = {
  TRIGGERS: RB_TRIGGERS, TRIGGER_DETAIL: RB_TRIGGER_DETAIL, ACTIONS: RB_ACTIONS, EXPIRY: RB_EXPIRY,
  COND_DIMS: RB_COND_DIMS, DIM_BY_ID: RB_DIM_BY_ID,
};
Object.assign(window, { RBSection, RBToggle, RBSlider, ConditionBuilder, MembershipPicker });
