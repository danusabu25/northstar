/* Northstar — Campaigns: 4-tab redesign.
   Campaigns | Sequences | Audiences | Suppression */

function CampStatus({ s }) {
  const map = {
    complete: ["success", "Complete"], scheduled: ["info", "Scheduled"],
    active: ["success", "Active", true], draft: ["warning", "Draft"], paused: ["neutral", "Paused"],
  };
  const [tone, label, dot] = map[s] || ["neutral", s];
  return <Badge tone={tone} dot={!!dot}>{label}</Badge>;
}

function CampaignsScreen() {
  const [tab, setTab] = React.useState(() => {
    try { return localStorage.getItem("ns-camp-tab") || "campaigns"; } catch (e) { return "campaigns"; }
  });
  const go = (t) => { setTab(t); try { localStorage.setItem("ns-camp-tab", t); } catch (e) {} };
  const C = window.NS.CAMPAIGNS;
  const sent = C.filter((c) => c.sent).reduce((s, c) => s + c.sent, 0);
  const TABS = [
    { id: "campaigns", label: "Campaigns", icon: "message", count: C.length },
    { id: "sequences", label: "Sequences", icon: "activity", count: window.NS.SEQUENCES.length },
    { id: "audiences", label: "Audiences", icon: "users" },
    { id: "suppression", label: "Suppression", icon: "shield" },
  ];

  return (
    <div>
      <PageHead
        eyebrow="Engage"
        title="Campaigns"
        desc="Every campaign in Northstar is tied to a real fan profile and a behavioral signal. One-time, triggered, or multi-step sequences — each with control-group measurement, suppression, and a mandatory fan preview."
        actions={<><button className="ns-btn ns-btn--secondary" onClick={() => go("sequences")}><Icon name="activity" size={14} />Sequences</button><button className="ns-btn ns-btn--primary" onClick={() => window.nsNewCampaign()}><Icon name="plus" size={14} />New campaign</button></>}
      />

      <div className="ns-kpis" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 14 }}>
        <Kpi hero icon="message" label="Messages sent" value={window.NS.fmtNum(sent)} delta="this season" dir="flat" />
        <Kpi icon="check" label="Delivery rate" value="98.2%" delta="+0.4pp" dir="up" hint="" />
        <Kpi icon="trendUp" label="Avg incremental lift" value="+4.5pp" delta="vs control group" dir="up" hint="" />
        <Kpi icon="shield" label="Opt-out rate" value="0.6%" delta="TCPA compliant" dir="flat" />
      </div>

      <div className="ns-tabs" style={{ marginBottom: 16 }}>
        {TABS.map((t) => (
          <button key={t.id} className={"ns-tab" + (tab === t.id ? " is-active" : "")} onClick={() => go(t.id)}>
            <Icon name={t.icon} size={14} />{t.label}
            {t.count != null && <span className="ns-tab__count">{t.count}</span>}
          </button>
        ))}
      </div>

      {tab === "campaigns" && <CampaignsTab />}
      {tab === "sequences" && <SequencesTab />}
      {tab === "audiences" && <AudiencesTab />}
      {tab === "suppression" && <SuppressionTab />}
    </div>
  );
}

/* ---- Campaign detail drawer ---- */
function CampaignDetail({ c, statusOf, set, onClose }) {
  const st = statusOf(c);
  const hasData = c.sent != null;
  return (
    <NSModal title={c.name} sub={c.audience} onClose={onClose}
      foot={
        <>
          <span className="ns-muted" style={{ fontSize: 11.5 }}>{c.when}</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="ns-btn ns-btn--secondary" onClick={() => window.nsNewCampaign()}><Icon name="edit" size={13} />Duplicate</button>
            {st === "active" && <button className="ns-btn ns-btn--secondary" onClick={() => set(c.id, "paused")}>Pause</button>}
            {st === "paused" && <button className="ns-btn ns-btn--secondary" onClick={() => set(c.id, "active")}>Resume</button>}
            {(st === "active" || st === "paused" || st === "scheduled") && <button className="ns-btn ns-btn--secondary" style={{ color: "var(--rc-red-600)" }} onClick={() => set(c.id, "complete")}>Archive</button>}
          </div>
        </>
      }>
      <div style={{ padding: 20 }}>
        <div className="ns-spread" style={{ marginBottom: 16 }}>
          <CampStatus s={st} />
          <span className="ns-pilltag" style={{ background: "var(--rc-blue-100)", color: "var(--rc-blue-700)" }}>{c.channel}</span>
        </div>
        {hasData ? (
          <div className="ns-pmetrics" style={{ border: "1px solid var(--color-border-default)", borderRadius: "var(--radius-md)", marginBottom: 16 }}>
            <PromoMetric label="Sent" value={window.NS.fmtNum(c.sent)} sub={window.NS.fmtNum(c.delivered) + " delivered · " + window.NS.fmtNum(c.optOut) + " opted out"} />
            <PromoMetric label="Attended" value={c.attendedPct != null ? c.attendedPct + "%" : "—"} sub={c.attended != null ? window.NS.fmtNum(c.attended) + " fans" : null} />
            <PromoMetric label="Control group" value={c.control.attendedPct != null ? c.control.attendedPct + "%" : "—"} sub={c.control.size ? window.NS.fmtNum(c.control.size) + " held back" : null} />
            <PromoMetric label="Incremental lift" value={c.lift != null ? "+" + c.lift + "pp" : "—"} tone={c.lift != null ? "var(--rc-green-600)" : null} sub={c.incVisits != null ? window.NS.fmtNum(c.incVisits) + " inc. visits" : null} />
            <PromoMetric label="ROAS" value={c.roas != null ? c.roas + "×" : "—"} sub={c.costPerVisit != null ? "$" + c.costPerVisit + " / visit" : null} />
          </div>
        ) : <div className="ns-drop" style={{ marginBottom: 16 }}>No send data yet — this campaign hasn't gone out.</div>}
        <div className="ns-callout ns-callout--info"><Icon name="shield" size={15} /><span>{c.control.size ? window.NS.fmtNum(c.control.size) + " fans were held back as a control group to measure incremental lift." : "A control group will be held back automatically once this campaign sends."}</span></div>
      </div>
    </NSModal>
  );
}

/* ---- Campaigns tab ---- */
function CampaignsTab() {
  const C = window.NS.CAMPAIGNS;
  const T = window.NS.TRIGGERED;
  const [view, setView] = React.useState("onetime");
  const [over, setOver] = React.useState({});
  const [selected, setSelected] = React.useState(null);
  const statusOf = (c) => over[c.id] || c.status;
  const set = (id, st) => setOver((o) => ({ ...o, [id]: st }));

  const STAGES = [["draft", "Draft"], ["scheduled", "Scheduled"], ["active", "Active"], ["complete", "Complete"]];
  const counts = Object.fromEntries(STAGES.map(([k]) => [k, C.filter((c) => statusOf(c) === k).length]));
  const chartData = C.filter((c) => c.sent != null).map((c) => ({ t: c.name.split(" ")[0], v: c.sent }));
  const selectedCampaign = selected && C.find((c) => c.id === selected);

  return (
    <div>
      <div className="ns-pipeline" style={{ marginBottom: 16 }}>
        {STAGES.map(([k, label], i) => (
          <React.Fragment key={k}>
            <div className={"ns-pipe" + (counts[k] ? " has" : "")}>
              <div className="ns-pipe__count">{counts[k]}</div>
              <div className="ns-pipe__label">{label}</div>
            </div>
            {i < STAGES.length - 1 && <span className="ns-pipe__arrow"><Icon name="chevRight" size={14} /></span>}
          </React.Fragment>
        ))}
      </div>

      <div className="ns-seg" style={{ marginBottom: 14 }}>
        {[["onetime", "One-time"], ["triggered", "Triggered"]].map(([id, l]) => (
          <button key={id} className={view === id ? "is-active" : ""} onClick={() => setView(id)}>{l}</button>
        ))}
      </div>
      {view === "onetime" && (
        <div className="ns-grid" style={{ gridTemplateColumns: "1.7fr 1fr" }}>
          <div className="ns-card">
            <div className="ns-card__head">
              <div><div className="ns-card__title">Campaign attribution</div><div className="ns-card__sub">Control-group measurement — click a row for detail, sends, and lifecycle actions</div></div>
              <button className="ns-btn ns-btn--primary ns-btn--sm" onClick={() => window.nsNewCampaign()}><Icon name="plus" size={13} />New campaign</button>
            </div>
            <div className="ns-table-wrap">
              <table className="ns-table">
                <thead><tr><th>Campaign</th><th>Channel</th><th>Status</th><th className="ns-num">Sent</th><th className="ns-num">Attended %</th><th className="ns-num">Control %</th><th className="ns-num">Lift</th><th className="ns-num">ROAS</th></tr></thead>
                <tbody>
                  {C.map((c) => (
                    <tr key={c.id} className="is-clickable" onClick={() => setSelected(c.id)}>
                      <td><div className="ns-strong" style={{ fontSize: 12.5 }}>{c.name}</div><div className="ns-muted" style={{ fontSize: 10.5, marginTop: 2 }}>{c.audience}</div><div className="ns-muted" style={{ fontSize: 10, marginTop: 2 }}>{c.when}</div></td>
                      <td><span className="ns-pilltag" style={{ background: "var(--rc-blue-100)", color: "var(--rc-blue-700)" }}>{c.channel}</span></td>
                      <td><CampStatus s={statusOf(c)} /></td>
                      <td className="ns-num ns-mono">{c.sent ? window.NS.fmtNum(c.sent) : "—"}</td>
                      <td className="ns-num">{c.attendedPct != null ? <span className="ns-mono ns-strong">{c.attendedPct}%</span> : <span className="ns-muted">—</span>}</td>
                      <td className="ns-num">{c.control.attendedPct != null ? <span className="ns-mono ns-muted">{c.control.attendedPct}%</span> : <span className="ns-muted">—</span>}</td>
                      <td className="ns-num">{c.lift != null ? <Delta dir="up">+{c.lift}pp</Delta> : <span className="ns-muted">—</span>}</td>
                      <td className="ns-num ns-mono">{c.roas != null ? c.roas + "×" : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: "10px 16px", borderTop: "1px solid var(--color-border-default)" }}>
              <div className="ns-callout ns-callout--info"><Icon name="shield" size={15} /><span>Each campaign automatically holds back <strong>10–15%</strong> of eligible fans as a control group. The incremental lift column shows the true campaign effect — not raw attendance rate.</span></div>
            </div>
          </div>

          <div className="ns-card">
            <div className="ns-card__head"><div className="ns-card__title">Messages sent</div><span className="ns-muted" style={{ fontSize: 11 }}>By campaign</span></div>
            <div className="ns-card__body">
              {chartData.length ? <BarChart data={chartData} height={180} /> : <div className="ns-muted" style={{ fontSize: 12 }}>No sends yet.</div>}
            </div>
          </div>
        </div>
      )}
      {selectedCampaign && <CampaignDetail c={selectedCampaign} statusOf={statusOf} set={set} onClose={() => setSelected(null)} />}
      {view === "triggered" && (
        <div className="ns-card">
          <div className="ns-card__head"><div className="ns-card__title">Triggered campaigns</div><span className="ns-muted" style={{ fontSize: 11 }}>Fire automatically when a behavioral condition is met</span></div>
          <div className="ns-table-wrap">
            <table className="ns-table">
              <thead><tr><th>Trigger condition</th><th>Message</th><th>Channel</th><th>Timing</th><th></th></tr></thead>
              <tbody>
                {T.map((t) => (
                  <tr key={t.trigger} className="is-clickable">
                    <td><div className="ns-strong" style={{ fontSize: 12.5 }}>{t.trigger}</div><div className="ns-muted" style={{ fontSize: 10.5, marginTop: 2 }}>{t.cond}</div></td>
                    <td style={{ maxWidth: 280 }}><div style={{ fontSize: 12, color: "var(--rc-gray-900)", lineHeight: 1.45 }}>"{t.msg}"</div></td>
                    <td><span className="ns-pilltag" style={{ background: "var(--rc-blue-100)", color: "var(--rc-blue-700)" }}>{t.channel}</span></td>
                    <td className="ns-muted" style={{ fontSize: 11.5 }}>{t.timing}</td>
                    <td style={{ textAlign: "right" }}><Badge tone={t.live ? "success" : "neutral"} dot={t.live}>{t.live ? "Live" : "Off"}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---- Sequences tab ---- */
function SequencesTab() {
  const S = window.NS.SEQUENCES;
  const [sel, setSel] = React.useState(S[0].id);
  const seq = S.find((s) => s.id === sel);

  return (
    <div className="ns-grid" style={{ gridTemplateColumns: "300px 1fr" }}>
      {/* sequence list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="ns-spread" style={{ marginBottom: 4 }}>
          <span className="ns-sectlabel" style={{ margin: 0 }}>Sequences</span>
          <button className="ns-btn ns-btn--ghost ns-btn--sm" onClick={() => window.nsNewCampaign()}><Icon name="plus" size={13} /></button>
        </div>
        {S.map((s) => (
          <button key={s.id} className={"ns-seqcard" + (sel === s.id ? " is-active" : "")} onClick={() => setSel(s.id)}>
            <div className="ns-spread" style={{ marginBottom: 4 }}>
              <span className="ns-strong" style={{ fontSize: 12.5 }}>{s.name}</span>
              <Badge tone={s.status === "active" ? "success" : s.status === "scheduled" ? "info" : "neutral"} dot={s.status === "active"}>{s.status}</Badge>
            </div>
            <div className="ns-muted" style={{ fontSize: 10.5, marginBottom: 6 }}>{s.trigger}</div>
            {s.enrolled > 0 && (
              <div style={{ display: "flex", gap: 12 }}>
                {[["users", s.enrolled, "enrolled"], ["check", s.converted, "converted"], ["alert", s.handoff, "handed off"]].map(([ic, v, l]) => (
                  <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, color: "var(--color-text-secondary)" }}>
                    <Icon name={ic} size={11} />{window.NS.fmtNum(v)} {l}
                  </span>
                ))}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* sequence flow */}
      <div className="ns-card">
        <div className="ns-card__head">
          <div><div className="ns-card__title">{seq.name}</div><div className="ns-card__sub">Visual journey · click Edit to open it in the campaign builder</div></div>
          <button className="ns-btn ns-btn--secondary ns-btn--sm" onClick={() => window.nsNewCampaign()}><Icon name="edit" size={13} />Edit</button>
        </div>
        <div className="ns-card__body" style={{ padding: 0 }}>
          <FlowCanvas sequence={seq} editable={false} />
        </div>
      </div>
    </div>
  );
}

/* ---- Audiences tab ---- */
function AudiencesTab() {
  const AT = window.NS.AUDIENCE_TEMPLATES;
  const SA = window.NS.SAVED_AUDIENCES;
  return (
    <div className="ns-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
      <div className="ns-card">
        <div className="ns-card__head"><div className="ns-card__title">Pre-built audience templates</div><span className="ns-muted" style={{ fontSize: 11 }}>Dynamic — update automatically as fan behavior changes</span></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {AT.map((a, i) => (
            <button key={a.id} className="is-clickable" onClick={() => window.nsNewCampaign()}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "transparent", border: "none", borderTop: i > 0 ? "1px solid var(--color-border-default)" : "none", cursor: "pointer", textAlign: "left" }}>
              <span style={{ width: 30, height: 30, borderRadius: 7, background: "var(--rc-gray-100)", color: "var(--color-text-secondary)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name={a.icon} size={14} /></span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <div className="ns-strong" style={{ fontSize: 12.5 }}>{a.name}</div>
                <div className="ns-muted" style={{ fontSize: 10.5, marginTop: 2 }}>{a.def}</div>
              </span>
              <span className="ns-mono ns-strong" style={{ fontSize: 12 }}>{window.NS.fmtNum(a.size)}</span>
              <Icon name="chevRight" size={14} style={{ color: "var(--rc-gray-400)" }} />
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="ns-card" style={{ marginBottom: 14 }}>
          <div className="ns-card__head"><div className="ns-card__title">Saved audiences</div><button className="ns-btn ns-btn--ghost ns-btn--sm"><Icon name="plus" size={13} />Save audience</button></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {SA.map((a, i) => (
              <div key={a.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderTop: i > 0 ? "1px solid var(--color-border-default)" : "none" }}>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <div className="ns-strong" style={{ fontSize: 12.5 }}>{a.name}</div>
                  <div className="ns-muted" style={{ fontSize: 10.5, marginTop: 2 }}>Used in {a.usedIn} campaigns</div>
                </span>
                <span className="ns-mono ns-strong">{window.NS.fmtNum(a.size)}</span>
                <Badge tone={a.updated === "live" ? "success" : "neutral"} dot={a.updated === "live"}>{a.updated === "live" ? "Live" : a.updated}</Badge>
              </div>
            ))}
          </div>
        </div>
        <div className="ns-callout ns-callout--info">
          <Icon name="refresh" size={15} /><span>Saved audiences are dynamic. A fan enters or exits the moment their behavior crosses the threshold — you never need to rebuild before a send.</span>
        </div>
      </div>
    </div>
  );
}

/* ---- Suppression tab ---- */
function SuppressionTab() {
  const CAPS = window.NS.FREQ_CAPS;
  const RULES = window.NS.SUPPRESSION_RULES;
  const [caps, setCaps] = React.useState(Object.fromEntries(CAPS.map((c) => [c.label, c.value])));

  return (
    <div className="ns-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
      <div className="ns-card">
        <div className="ns-card__head"><div className="ns-card__title">Frequency caps</div><span className="ns-muted" style={{ fontSize: 11 }}>Default caps — configurable per venue</span></div>
        <div className="ns-card__body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="ns-muted" style={{ fontSize: 11.5, lineHeight: 1.5, marginBottom: 4 }}>A fan who receives three messages in seven days is being over-communicated with. Caps are enforced on every send — a campaign that would breach a cap is held, not dropped.</div>
          {CAPS.map((c) => (
            <div className="ns-cond" key={c.label}>
              <div className="ns-cond__body">
                <div className="ns-cond__label">{c.label}</div>
                <SliderField min={1} max={c.label.includes("hours") ? 48 : 5} step={1}
                  value={caps[c.label]} onChange={(v) => setCaps((p) => ({ ...p, [c.label]: v }))} suffix={c.unit || null} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="ns-card">
        <div className="ns-card__head"><div className="ns-card__title">Suppression rules</div><span className="ns-muted" style={{ fontSize: 11 }}>Applied before every send</span></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {RULES.map((r, i) => (
            <div key={r.cond} style={{ padding: "14px 16px", borderTop: i > 0 ? "1px solid var(--color-border-default)" : "none" }}>
              <div className="ns-spread" style={{ marginBottom: 4 }}>
                <span className="ns-strong" style={{ fontSize: 12.5 }}>{r.cond}</span>
                <Badge tone={r.severity === "block" ? "danger" : "warning"}>{r.severity === "block" ? "Block" : "Suppress"}</Badge>
              </div>
              <div className="ns-muted" style={{ fontSize: 11.5 }}>{r.action}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--color-border-default)" }}>
          <div className="ns-callout ns-callout--info"><Icon name="shield" size={15} /><span>Suppression rules are not optional. Every campaign runs through this check before any message is sent. Overrides are logged with the operator's reason.</span></div>
        </div>
      </div>
    </div>
  );
}

window.CampaignsScreen = CampaignsScreen;
window.CampStatus = CampStatus;
