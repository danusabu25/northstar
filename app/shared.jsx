/* Northstar — shared UI primitives. Exported to window for cross-file use. */

// ---------- Icon (Lucide-style stroke set) ----------
const NS_ICON_PATHS = {
  star: <path d="M12 3l2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.8-5.4 2.8 1-6L4.3 9.4l6-.9z" />,
  users: <><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20c0-3.3 2.5-5.5 5.5-5.5s5.5 2.2 5.5 5.5" /><path d="M16 5.2a3 3 0 0 1 0 5.6" /><path d="M17 14.6c2.3.5 4 2.4 4 5.4" /></>,
  user: <><circle cx="12" cy="8" r="3.6" /><path d="M5 20c0-3.6 3-6 7-6s7 2.4 7 6" /></>,
  gauge: <><path d="M3 13a9 9 0 0 1 18 0" /><path d="M12 13l4-3" /><circle cx="12" cy="13" r="1.4" /></>,
  activity: <path d="M3 12h4l3 8 4-16 3 8h4" />,
  heart: <path d="M12 20s-7-4.3-7-9.3A3.7 3.7 0 0 1 12 8a3.7 3.7 0 0 1 7-2.3c0 5-7 9.3-7 9.3z" />,
  gift: <><rect x="4" y="9" width="16" height="11" rx="1" /><path d="M4 12h16M12 9v11" /><path d="M12 9S10.5 4 8 5s.5 4 4 4M12 9s1.5-5 4-4-.5 4-4 4" /></>,
  tag: <><path d="M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9z" /><circle cx="8" cy="8" r="1.4" /></>,
  message: <path d="M5 4h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-4 4V6a2 2 0 0 1 2-2z" />,
  handshake: <><path d="M11 17l-3-3 3.5-3.5a2 2 0 0 1 2.8 0L21 14" /><path d="M3 10l4-4 5 5" /><path d="M14 14l2 2M11 17l2 2" /></>,
  upload: <><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 20h16" /></>,
  trendUp: <><path d="M3 17l6-6 4 4 8-8" /><path d="M15 7h6v6" /></>,
  trendDown: <><path d="M3 7l6 6 4-4 8 8" /><path d="M15 17h6v-6" /></>,
  minus: <path d="M5 12h14" />,
  dollar: <><path d="M12 3v18" /><path d="M16 7.5a3 3 0 0 0-4-2.5c-2 .6-3 3.5-.5 4.5l3 1.2c2.5 1 1.5 3.9-.5 4.5a3 3 0 0 1-4-2.5" /></>,
  cart: <><circle cx="9" cy="20" r="1.4" /><circle cx="17" cy="20" r="1.4" /><path d="M3 4h2l2.2 11.4a1 1 0 0 0 1 .8h8.4a1 1 0 0 0 1-.8L20 8H6" /></>,
  chevDown: <path d="M6 9l6 6 6-6" />,
  chevRight: <path d="M9 6l6 6-6 6" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.5-4.5" /></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M10 21a2 2 0 0 0 4 0" /></>,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2.2-2.5 4" /><circle cx="12" cy="17.2" r=".6" fill="currentColor" /></>,
  download: <><path d="M12 3v12M7 10l5 5 5-5" /><path d="M4 21h16" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  check: <path d="M5 12l5 5 9-11" />,
  alert: <><path d="M12 3l9 16H3z" /><path d="M12 10v4M12 17.2v.1" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8.2v.1" /></>,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  filter: <path d="M4 6h16M7 12h10M10 18h4" />,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="1.5" /><path d="M3 9h18M8 3v4M16 3v4" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  pin: <><path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10z" /><circle cx="12" cy="11" r="2" /></>,
  zap: <path d="M13 3L5 14h6l-1 7 8-11h-6z" />,
  card: <><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 10h18" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M4 7l8 6 8-6" /></>,
  arrowUpRight: <path d="M7 17L17 7M9 7h8v8" />,
  sparkle: <><path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6z" /><path d="M18 15l.7 1.8L20.5 18l-1.8.7L18 20.5l-.7-1.8L15.5 18l1.8-.7z" /></>,
  flag: <><path d="M5 21V4M5 4h11l-2 4 2 4H5" /></>,
  edit: <><path d="M4 20h4l10-10-4-4L4 16z" /><path d="M13.5 6.5l4 4" /></>,
  more: <><circle cx="5" cy="12" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="19" cy="12" r="1.4" /></>,
  sliders: <><path d="M4 8h10M18 8h2M4 16h2M10 16h10" /><circle cx="16" cy="8" r="2" /><circle cx="8" cy="16" r="2" /></>,
  link: <><path d="M9 15l6-6" /><path d="M11 6l1-1a3.5 3.5 0 0 1 5 5l-1 1" /><path d="M13 18l-1 1a3.5 3.5 0 0 1-5-5l1-1" /></>,
  shield: <><path d="M12 3l8 3v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6z" /><path d="M9 12l2 2 4-4" /></>,
  refresh: <><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M21 4v4h-4" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /><path d="M3 20v-4h4" /></>,
  database: <><ellipse cx="12" cy="5.5" rx="8" ry="3" /><path d="M4 5.5v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" /><path d="M4 11.5v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" /></>,
  bolt: <path d="M13 3L5 14h6l-1 7 8-11h-6z" />,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></>,
  trophy: <><path d="M7 4h10v4a5 5 0 0 1-10 0z" /><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3" /><path d="M10 14h4M9 20h6M12 14v6" /></>,
};

function Icon({ name, size = 16, stroke = 1.6, fill = false, style, className }) {
  const p = NS_ICON_PATHS[name];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? "currentColor" : "none"}
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      style={style} className={className} aria-hidden="true">
      {p || null}
    </svg>
  );
}

// ---------- Delta chip ----------
function Delta({ dir, children }) {
  const icon = dir === "up" ? "trendUp" : dir === "down" ? "trendDown" : "minus";
  return (
    <span className={"ns-delta ns-delta--" + dir}>
      <Icon name={icon} size={12} stroke={2.2} />{children}
    </span>
  );
}

// ---------- KPI tile ----------
function Kpi({ label, value, delta, dir, hint, icon, hero }) {
  return (
    <div className={"ns-kpi" + (hero ? " ns-kpi--hero" : "")}>
      <div className="ns-kpi__head">
        {icon && <Icon name={icon} size={14} />}
        <span className="ns-kpi__label">{label}</span>
      </div>
      <div className="ns-kpi__value">{value}</div>
      <div className="ns-kpi__foot">
        {delta != null && (dir === "flat" ? <span className="ns-kpi__hint">{delta}</span> : <Delta dir={dir}>{delta}</Delta>)}
        {hint && dir !== "flat" && <span className="ns-kpi__hint">{hint}</span>}
        {hint && dir === "flat" && delta == null && <span className="ns-kpi__hint">{hint}</span>}
      </div>
    </div>
  );
}

// ---------- Tier badge ----------
function Tier({ tier, label }) {
  const text = label || (tier.charAt(0).toUpperCase() + tier.slice(1));
  return <span className={"ns-tier ns-tier--" + tier}><span className="ns-tier__mark" />{text}</span>;
}

// ---------- Status badge ----------
function Badge({ tone = "neutral", dot, children }) {
  return <span className={"ns-badge ns-badge--" + tone}>{dot && <span className="ns-badge__dot" style={{ background: "currentColor" }} />}{children}</span>;
}

// ---------- Avatar ----------
function Avatar({ name, seed = 0, size = 26 }) {
  return <span className="ns-avatar" style={{ width: size, height: size, background: window.NS.avatarColor(seed), fontSize: size * 0.38 }}>{window.NS.initials(name)}</span>;
}

// ---------- Progress bar ----------
function Progress({ pct, tone }) {
  return <div className="ns-progress"><div className={"ns-progress__fill" + (tone ? " ns-progress__fill--" + tone : "")} style={{ width: Math.max(0, Math.min(100, pct)) + "%" }} /></div>;
}

// ---------- Sparkline (area) ----------
function Sparkline({ data, w = 120, h = 32, color = "var(--ns-accent)", fillOpacity = 0.12 }) {
  const max = Math.max(...data), min = Math.min(...data);
  const rng = max - min || 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - ((v - min) / rng) * (h - 4) - 2]);
  const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const area = line + ` L${w} ${h} L0 ${h} Z`;
  return (
    <svg className="ns-spark" width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <path d={area} fill={color} fillOpacity={fillOpacity} stroke="none" />
      <path d={line} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ---------- Bar chart (grouped current vs prior) ----------
function BarChart({ data, height = 220, valueKey = "v", labelKey = "t", prefix = "" }) {
  const [hover, setHover] = React.useState(null);
  const max = Math.max(...data.map(d => d[valueKey])) * 1.12;
  const W = 760, padL = 8, padB = 26, padT = 8;
  const innerH = height - padB - padT;
  const bw = (W - padL) / data.length;
  return (
    <svg className="ns-spark" viewBox={`0 0 ${W} ${height}`} width="100%" height={height} preserveAspectRatio="none"
      style={{ overflow: "visible" }}>
      {[0.25, 0.5, 0.75, 1].map(g => (
        <line key={g} x1={padL} x2={W} y1={padT + innerH * (1 - g)} y2={padT + innerH * (1 - g)} stroke="var(--rc-gray-200)" strokeWidth="1" />
      ))}
      {data.map((d, i) => {
        const bh = (d[valueKey] / max) * innerH;
        const x = padL + i * bw + bw * 0.22;
        const w = bw * 0.56;
        const y = padT + innerH - bh;
        const on = hover === i;
        return (
          <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            <rect x={padL + i * bw} y={padT} width={bw} height={innerH} fill="transparent" />
            <rect x={x} y={y} width={w} height={bh} rx="2.5" fill={on ? "var(--rc-blue-600)" : "var(--ns-accent)"} />
            <text x={padL + i * bw + bw / 2} y={height - 8} textAnchor="middle" fontSize="10" fontFamily="var(--font-family-mono)" fill="var(--color-text-secondary)">{d[labelKey]}</text>
            {on && <text x={padL + i * bw + bw / 2} y={y - 6} textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="var(--font-family-mono)" fill="var(--rc-gray-900)">{prefix}{window.NS.fmtNum(d[valueKey])}</text>}
          </g>
        );
      })}
    </svg>
  );
}

// ---------- Donut (tier mix) ----------
function Donut({ segments, size = 132, thickness = 18, centerLabel, centerSub }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const r = (size - thickness) / 2;
  const cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--rc-gray-200)" strokeWidth={thickness} />
      {segments.map((s, i) => {
        const frac = s.value / total;
        const dash = frac * circ;
        const el = (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={thickness}
            strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={-offset}
            transform={`rotate(-90 ${cx} ${cy})`} strokeLinecap="butt" />
        );
        offset += dash;
        return el;
      })}
      {centerLabel && <text x={cx} y={cy - 2} textAnchor="middle" fontSize="20" fontWeight="600" fontFamily="var(--font-family-primary)" fill="var(--rc-gray-900)" style={{ letterSpacing: "-0.02em" }}>{centerLabel}</text>}
      {centerSub && <text x={cx} y={cy + 14} textAnchor="middle" fontSize="9.5" fontFamily="var(--font-family-primary)" fill="var(--color-text-secondary)">{centerSub}</text>}
    </svg>
  );
}

// ---------- Sentiment trend line ----------
function SentLine({ data, w = 200, h = 56 }) {
  const vals = data.map((d, i) => ({ v: d, i })).filter(d => d.v != null);
  if (vals.length === 0) return <span className="ns-muted">No data</span>;
  const max = 10, min = 0;
  const pts = vals.map(d => [(d.i / (data.length - 1)) * (w - 8) + 4, h - (d.v / max) * (h - 10) - 5]);
  const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const last = vals[vals.length - 1].v;
  const color = last >= 7 ? "var(--ns-pos)" : last >= 5 ? "var(--rc-amber-500)" : "var(--ns-neg)";
  return (
    <svg className="ns-spark" width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <line x1="4" x2={w - 4} y1={h - (5 / max) * (h - 10) - 5} y2={h - (5 / max) * (h - 10) - 5} stroke="var(--rc-gray-200)" strokeWidth="1" strokeDasharray="3 3" />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="2.6" fill={color} />)}
    </svg>
  );
}

function SentTag({ trend }) {
  const map = { up: ["success", "Positive", "trendUp"], flat: ["neutral", "Stable", "minus"], down: ["danger", "Declining", "trendDown"] };
  const [tone, label, icon] = map[trend] || map.flat;
  return <span className={"ns-sent"} style={{ color: tone === "success" ? "var(--rc-green-600)" : tone === "danger" ? "var(--rc-red-600)" : "var(--color-text-secondary)" }}><Icon name={icon} size={13} stroke={2.2} />{label}</span>;
}

// ---------- Page header ----------
function PageHead({ eyebrow, title, desc, actions }) {
  return (
    <div className="ns-pagehead">
      <div>
        {eyebrow && <div className="ns-pagehead__eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {desc && <p>{desc}</p>}
      </div>
      {actions && <div className="ns-pagehead__actions">{actions}</div>}
    </div>
  );
}

// ---------- Slider + editable number field ----------
// Every numeric slider in the app pairs with a real, typeable number input
// (not a read-only formatted label) — free typing while focused, clamped
// to [min, max] on blur/Enter, synced back to the slider.
function SliderField({ min, max, step, value, onChange, prefix, suffix, width }) {
  const [text, setText] = React.useState(String(value));
  React.useEffect(() => { setText(String(value)); }, [value]);
  const commit = (raw) => {
    let v = Number(raw);
    if (raw === "" || isNaN(v)) v = value;
    v = Math.max(min, Math.min(max, v));
    setText(String(v));
    onChange(v);
  };
  return (
    <div className="ns-cond__control">
      <input className="ns-range" type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      <span className="ns-numfield">
        {prefix && <span className="ns-numfield__affix">{prefix}</span>}
        <input
          className="ns-numfield__input" type="number" min={min} max={max} step={step}
          value={text} style={width ? { width } : null}
          onChange={(e) => setText(e.target.value)}
          onBlur={(e) => commit(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { commit(e.target.value); e.target.blur(); } }}
        />
        {suffix && <span className="ns-numfield__affix">{suffix}</span>}
      </span>
    </div>
  );
}

Object.assign(window, { Icon, Delta, Kpi, Tier, Badge, Avatar, Progress, Sparkline, BarChart, Donut, SentLine, SentTag, PageHead, SliderField });
