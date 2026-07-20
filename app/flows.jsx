/* Northstar — creation flows: modal shell, stepper, audience builder, wizards. */

// ---------- Modal shell ----------
function NSModal({ title, sub, onClose, width, children, foot }) {
  React.useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="ns-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <div className="ns-overlay__scrim" onClick={onClose} />
      <div className="ns-dialog" style={width ? { width } : null}>
        <div className="ns-dialog__head">
          <div><h2>{title}</h2>{sub && <div className="ns-muted">{sub}</div>}</div>
          <button className="ns-dialog__close" onClick={onClose} aria-label="Close"><Icon name="x" size={18} /></button>
        </div>
        <div className="ns-dialog__body">{children}</div>
        {foot && <div className="ns-dialog__foot">{foot}</div>}
      </div>
    </div>
  );
}

// ---------- Stepper ----------
function Stepper({ steps, index, maxReached, onJump }) {
  return (
    <div className="ns-stepper">
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div className={"ns-step" + (i === index ? " is-active" : i < index ? " is-done" : "")}
            onClick={() => i <= maxReached && onJump(i)} style={{ cursor: i <= maxReached ? "pointer" : "default" }}>
            <span className="ns-step__num">{i < index ? <Icon name="check" size={12} stroke={2.6} /> : i + 1}</span>
            <span className="ns-step__label">{s}</span>
          </div>
          {i < steps.length - 1 && <span className="ns-step__bar" />}
        </React.Fragment>
      ))}
    </div>
  );
}

// ---------- Condition control ----------
function CondControl({ cond, onChange }) {
  const d = window.NSEG.DIM_BY_ID[cond.dim];
  if (!d) return null;
  if (d.kind === "slider") {
    return <SliderField min={d.min} max={d.max} step={d.step} value={cond.val} onChange={onChange} prefix={d.prefix || null} suffix={d.unit || null} width={80} />;
  }
  if (d.kind === "select") {
    return (
      <div className="ns-cond__control">
        <select className="rc-input" style={{ height: 30, padding: "4px 10px" }} value={cond.val} onChange={(e) => onChange(e.target.value)}>
          {d.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
    );
  }
  return null; // bool: presence = true
}

// ---------- Audience builder ----------
function AudienceBuilder({ audience, setAudience }) {
  const [addOpen, setAddOpen] = React.useState(false);
  const MEM = window.NSEG.MEMBERSHIP;
  const usedDims = new Set((audience.conditions || []).map((c) => c.dim));
  const available = window.NSEG.DIMENSIONS.filter((d) => !usedDims.has(d.dim));

  const toggleMem = (id) => {
    const has = audience.memberships.includes(id);
    setAudience({ ...audience, memberships: has ? audience.memberships.filter((m) => m !== id) : [...audience.memberships, id] });
  };
  const addCond = (dim) => {
    const d = window.NSEG.DIM_BY_ID[dim];
    setAudience({ ...audience, conditions: [...(audience.conditions || []), { dim, val: d.def }] });
    setAddOpen(false);
  };
  const updateCond = (i, val) => {
    const next = audience.conditions.slice(); next[i] = { ...next[i], val };
    setAudience({ ...audience, conditions: next });
  };
  const rmCond = (i) => setAudience({ ...audience, conditions: audience.conditions.filter((_, j) => j !== i) });

  const sthCount = MEM.filter((m) => m.sth && audience.memberships.includes(m.id)).length;
  const nonSthCount = MEM.filter((m) => !m.sth && audience.memberships.includes(m.id)).length;

  return (
    <div>
      {/* presets */}
      <div className="ns-sectlabel">Start from a preset</div>
      <div className="ns-chips" style={{ marginBottom: 18 }}>
        {window.NSEG.PRESETS.map((p) => (
          <button key={p.id} className="ns-preset" onClick={() => setAudience({ memberships: p.memberships.slice(), conditions: p.conditions.map((c) => ({ ...c })) })}>{p.label}</button>
        ))}
      </div>

      {/* who */}
      <div className="ns-spread" style={{ marginBottom: 10 }}>
        <span className="ns-sectlabel" style={{ margin: 0 }}>Who's in the audience</span>
        <span className="ns-muted" style={{ fontSize: 10.5 }}>{sthCount} STH group{sthCount !== 1 ? "s" : ""} · {nonSthCount} non-STH group{nonSthCount !== 1 ? "s" : ""}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
        {MEM.map((m) => {
          const on = audience.memberships.includes(m.id);
          return (
            <button key={m.id} className={"ns-memchip" + (on ? " is-on" : "")} onClick={() => toggleMem(m.id)}>
              <span className="ns-memchip__check">{on && <Icon name="check" size={11} stroke={3} />}</span>
              <span className="ns-memchip__meta">
                <span className="ns-memchip__label">{m.label}{!m.sth && <span style={{ fontSize: 9, fontWeight: 600, color: "var(--color-text-secondary)", marginLeft: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>non-STH</span>}</span>
                <span className="ns-memchip__sub">{m.sub}</span>
              </span>
              <span className="ns-memchip__base">{window.NS.fmtNum(m.base)}</span>
            </button>
          );
        })}
      </div>
      <div className="ns-muted" style={{ fontSize: 10.5, marginBottom: 20 }}>Non-STH fans are recognized by PAR and segmentable just like members — they simply lack a Ticketmaster record.</div>

      {/* conditions */}
      <div className="ns-sectlabel">Narrow with conditions <span style={{ color: "var(--color-text-tertiary)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>· all must match</span></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
        {(audience.conditions || []).map((c, i) => (
          <div className="ns-cond" key={c.dim}>
            <span className="ns-cond__op">{i === 0 ? "WHERE" : "AND"}</span>
            <div className="ns-cond__body">
              <div className="ns-cond__label">{window.NSEG.DIM_BY_ID[c.dim].label.replace(/ ≥ N| ≤ N|N |\$$/g, (m) => m.includes("N") ? "" : m)}</div>
              <CondControl cond={c} onChange={(v) => updateCond(i, v)} />
            </div>
            <button className="ns-cond__rm" onClick={() => rmCond(i)} aria-label="Remove condition"><Icon name="x" size={14} /></button>
          </div>
        ))}
        {(audience.conditions || []).length === 0 && <div className="ns-muted" style={{ fontSize: 11.5, padding: "2px 0" }}>No conditions — the whole selected audience qualifies.</div>}
      </div>
      <div className="ns-addcond">
        <button className="ns-btn ns-btn--secondary ns-btn--sm" onClick={() => setAddOpen((v) => !v)} disabled={available.length === 0}><Icon name="plus" size={13} />Add condition</button>
        {addOpen && (
          <div className="ns-addmenu">
            {available.map((d) => <button key={d.dim} onClick={() => addCond(d.dim)}>{d.label.replace(" ≥ $", "").replace(" ≤ $", "").replace(" ≥ N", "").replace(" N ", " ")}</button>)}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Audience summary rail ----------
function AudienceSummary({ audience, channel }) {
  const est = window.NSEG.estimate(audience);
  const pct = Math.round((est.count / window.NSEG.TOTAL) * 100);
  const tierColors = { gold: "var(--tier-gold-mark)", silver: "var(--tier-silver-mark)", bronze: "var(--tier-bronze-mark)" };
  const sampleFans = window.NS.FANS.slice(0, 4);
  return (
    <div>
      <div className="ns-sectlabel">Estimated audience</div>
      <div className="ns-audnum">{window.NS.fmtNum(est.count)}</div>
      <div className="ns-muted" style={{ fontSize: 11.5, marginBottom: 16 }}>{pct}% of {window.NS.fmtNum(window.NSEG.TOTAL)} recognized fans</div>

      <div className="ns-sectlabel">Member vs. non-member</div>
      <div className="ns-splitbar" style={{ marginBottom: 8 }}>
        <div style={{ width: (est.count ? (est.sth / est.count) * 100 : 0) + "%", background: "var(--ns-accent)" }} />
        <div style={{ width: (est.count ? (est.nonSth / est.count) * 100 : 0) + "%", background: "var(--rc-gray-400)" }} />
      </div>
      <div className="ns-legend-row" style={{ padding: "2px 0" }}><span><span className="ns-legend-dot" style={{ background: "var(--ns-accent)" }} />Season-ticket holders</span><span className="ns-mono ns-strong">{window.NS.fmtNum(est.sth)}</span></div>
      <div className="ns-legend-row" style={{ padding: "2px 0", marginBottom: 14 }}><span><span className="ns-legend-dot" style={{ background: "var(--rc-gray-400)" }} />Non-STH fans</span><span className="ns-mono ns-strong">{window.NS.fmtNum(est.nonSth)}</span></div>

      <div className="ns-sectlabel">Confidence mix</div>
      <div style={{ marginBottom: 14 }}>
        {["gold", "silver", "bronze"].map((k) => (
          <div className="ns-legend-row" key={k} style={{ padding: "3px 0" }}>
            <span style={{ textTransform: "capitalize" }}><span className="ns-legend-dot" style={{ background: tierColors[k] }} />{k}</span>
            <span className="ns-mono ns-muted">{window.NS.fmtNum(est.tierMix[k])}</span>
          </div>
        ))}
      </div>

      {channel === "sms" && (
        <div className="ns-callout ns-callout--info" style={{ marginBottom: 12, padding: "10px 12px" }}>
          <Icon name="message" size={14} /><span><strong>{window.NS.fmtNum(est.smsReachable)}</strong> are SMS-reachable (phone on file, not opted out).</span>
        </div>
      )}

      <div className="ns-sectlabel">Sample matches</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {sampleFans.map((f, i) => (
          <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <Avatar name={f.name} seed={i} size={22} />
            <span style={{ fontSize: 11.5, color: "var(--rc-gray-900)" }}>{f.name}</span>
            <span style={{ marginLeft: "auto" }}><Tier tier={f.tier} /></span>
          </div>
        ))}
      </div>
    </div>
  );
}
// ---------- Full-page builder success state ----------
function BuilderSuccess({ icon, title, lines, primaryLabel, onClose }) {
  return (
    <div className="ns-builder__success">
      <div style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--rc-green-100)", color: "var(--rc-green-600)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}><Icon name={icon || "check"} size={30} stroke={2.4} /></div>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--rc-gray-900)", marginBottom: 8 }}>{title}</h2>
      {lines.map((l, i) => <div key={i} className="ns-muted" style={{ fontSize: 13, lineHeight: 1.6, maxWidth: 420, textAlign: "center" }}>{l}</div>)}
      <button className="ns-btn ns-btn--primary" style={{ marginTop: 24 }} onClick={onClose}>{primaryLabel || "Done"}</button>
    </div>
  );
}

window.NSModal = NSModal;
window.Stepper = Stepper;
window.AudienceBuilder = AudienceBuilder;
window.AudienceSummary = AudienceSummary;
window.BuilderSuccess = BuilderSuccess;
