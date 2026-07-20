/* Northstar — visual journey/flow canvas.
   Shared by the Sequences tab (read-only) and the Campaign builder's
   "Journey" section (editable). One data shape, two render modes:
     { trigger, enrolled?, steps: [ { day, msg, type, branchYes, branchNo, conv?, human? } ] }
   type: "message" (default) | "wait" | "human" (mirrors step.human for legacy data). */

const FLOW_TYPE_META = {
  message: { icon: "message", label: "Message", accent: "var(--ns-accent)" },
  wait: { icon: "clock", label: "Wait", accent: "var(--rc-gray-500)" },
  human: { icon: "handshake", label: "Human handoff", accent: "var(--rc-amber-500)" },
};
function flowStepType(step) { return step.human ? "human" : (step.type || "message"); }

function FlowFork() {
  return (
    <svg className="ns-flowfork" viewBox="0 0 100 36" preserveAspectRatio="none" aria-hidden="true">
      <path d="M50 0 C 50 18, 25 16, 25 36" fill="none" stroke="var(--color-border-strong)" strokeWidth="1.5" />
      <path d="M50 0 C 50 18, 75 16, 75 36" fill="none" stroke="var(--color-border-strong)" strokeWidth="1.5" />
    </svg>
  );
}

function FlowBranch({ step, editable, onUpdate }) {
  return (
    <div className="ns-flowbranch-wrap">
      <FlowFork />
      <div className="ns-flowbranch">
        <div className="ns-flowleaf ns-flowleaf--yes">
          <span className="ns-flowleaf__tag"><Icon name="check" size={10} stroke={3} />Yes</span>
          {editable
            ? <input className="ns-flowleaf__input" value={step.branchYes || ""} placeholder="Outcome if yes…" onChange={(e) => onUpdate({ branchYes: e.target.value })} />
            : <span className="ns-flowleaf__label">{step.branchYes}</span>}
        </div>
        <div className="ns-flowleaf ns-flowleaf--no">
          <span className="ns-flowleaf__tag"><Icon name="chevRight" size={10} />No</span>
          {editable
            ? <input className="ns-flowleaf__input" value={step.branchNo || ""} placeholder="Outcome if no…" onChange={(e) => onUpdate({ branchNo: e.target.value })} />
            : <span className="ns-flowleaf__label">{step.branchNo}</span>}
        </div>
      </div>
    </div>
  );
}

function FlowNode({ step, index, editable, onUpdate, onDelete }) {
  const type = flowStepType(step);
  const meta = FLOW_TYPE_META[type];
  const hasBranch = !!(step.branchYes || step.branchNo);

  return (
    <div className={"ns-flownode ns-flownode--" + type}>
      <div className="ns-flownode__head">
        <span className="ns-flownode__num" style={{ background: meta.accent }}>{index + 1}</span>
        <span className="ns-flownode__ico"><Icon name={meta.icon} size={13} /></span>
        {editable
          ? <input className="ns-flownode__daylabel" value={step.day || ""} onChange={(e) => onUpdate({ day: e.target.value })} aria-label="Step label" />
          : <span className="ns-strong" style={{ fontSize: 12 }}>{step.day}</span>}
        {type === "human" && <Badge tone="warning">Human handoff</Badge>}
        {!editable && step.conv > 0 && <span className="ns-muted" style={{ fontSize: 10.5, marginLeft: "auto" }}>{window.NS.fmtNum(step.conv)} converted</span>}
        {editable && <button className="ns-flownode__del" onClick={onDelete} aria-label="Delete step"><Icon name="x" size={13} /></button>}
      </div>

      {type === "wait" ? (
        <div className="ns-flownode__waitrow">
          <Icon name="clock" size={13} style={{ color: "var(--color-text-secondary)" }} />
          {editable ? (
            <>
              <input className="ns-flownode__waitn" type="number" min={1} value={step.waitN || 1} onChange={(e) => onUpdate({ waitN: Math.max(1, Number(e.target.value) || 1) })} />
              <select className="rc-input" style={{ height: 28, padding: "3px 8px" }} value={step.waitUnit || "days"} onChange={(e) => onUpdate({ waitUnit: e.target.value })}>
                <option value="hours">hours</option><option value="days">days</option><option value="games">games</option>
              </select>
            </>
          ) : <span className="ns-muted" style={{ fontSize: 12 }}>Wait {step.waitN || 1} {step.waitUnit || "days"}</span>}
        </div>
      ) : editable ? (
        <textarea className="ns-flownode__msginput" value={step.msg || ""} placeholder="Message text…" onChange={(e) => onUpdate({ msg: e.target.value })} />
      ) : (
        step.msg && <div className="ns-flownode__msg">"{step.msg}"</div>
      )}

      {editable && (
        <div className="ns-flownode__toolrow">
          <div className="ns-seg ns-seg--mini">
            {[["message", "Message"], ["wait", "Wait"], ["human", "Handoff"]].map(([id, l]) => (
              <button key={id} className={type === id ? "is-active" : ""} onClick={() => onUpdate(id === "human" ? { human: true, type: "human" } : { human: false, type: id })}>{l}</button>
            ))}
          </div>
          {type !== "human" && (
            <button className="ns-btn ns-btn--ghost ns-btn--sm" onClick={() => onUpdate(hasBranch ? { branchYes: "", branchNo: "" } : { branchYes: "Continue", branchNo: "Continue" })}>
              <Icon name="filter" size={12} />{hasBranch ? "Remove branch" : "Add branch"}
            </button>
          )}
        </div>
      )}

      {hasBranch && <FlowBranch step={step} editable={editable} onUpdate={onUpdate} />}
    </div>
  );
}

function FlowCanvas({ sequence, editable, onChange }) {
  const steps = sequence.steps || [];
  const update = (i, patch) => {
    if (!editable) return;
    const next = steps.slice(); next[i] = { ...next[i], ...patch };
    onChange({ ...sequence, steps: next });
  };
  const remove = (i) => { if (!editable) return; onChange({ ...sequence, steps: steps.filter((_, j) => j !== i) }); };
  const addStep = () => {
    if (!editable) return;
    onChange({ ...sequence, steps: [...steps, { day: "Step " + (steps.length + 1), type: "message", msg: "" }] });
  };

  return (
    <div className="ns-flowcanvas">
      <div className="ns-flowcanvas__entry">
        <span className="ns-flowcanvas__entryico"><Icon name="zap" size={14} /></span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="ns-eyebrow" style={{ marginBottom: 3 }}>Entry trigger</div>
          {editable
            ? <input className="ns-flownode__daylabel" style={{ fontSize: 12.5 }} value={sequence.trigger || ""} placeholder="What starts this journey…" onChange={(e) => onChange({ ...sequence, trigger: e.target.value })} />
            : <span className="ns-strong" style={{ fontSize: 12.5 }}>{sequence.trigger}</span>}
        </div>
        {sequence.enrolled > 0 && <Badge tone="info">{window.NS.fmtNum(sequence.enrolled)} enrolled</Badge>}
      </div>

      {steps.map((step, i) => (
        <React.Fragment key={i}>
          <div className="ns-flowconnector"><Icon name="chevDown" size={12} className="ns-flowconnector__arrow" /></div>
          <FlowNode step={step} index={i} editable={editable} onUpdate={(p) => update(i, p)} onDelete={() => remove(i)} />
        </React.Fragment>
      ))}

      {editable && (
        <>
          <div className="ns-flowconnector ns-flowconnector--dashed" />
          <button className="ns-flowadd" onClick={addStep}><Icon name="plus" size={13} />Add step</button>
        </>
      )}

      {!editable && steps.length === 0 && <div className="ns-drop" style={{ marginTop: 14 }}>No steps in this journey yet.</div>}
    </div>
  );
}

window.FlowCanvas = FlowCanvas;
window.FLOW_TYPE_META = FLOW_TYPE_META;
