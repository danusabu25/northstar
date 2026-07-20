/* Northstar — Game-day intelligence, scope-aware:
   live game · historic game recap · season-to-date overview. */

function deltaChip(cur, prev, money) {
  if (prev == null) return { delta: null, dir: "flat" };
  const diff = cur - prev;
  const dir = diff > 0 ? "up" : diff < 0 ? "down" : "flat";
  const txt = money ? (diff >= 0 ? "+" : "−") + "$" + Math.abs(diff).toFixed(2) : (diff >= 0 ? "+" : "−") + window.NS.fmtNum(Math.abs(diff));
  return { delta: txt, dir };
}

// ---------- Single-game view (live or historic) ----------
function GameView({ snap, isLive }) {
  const G = window.NS.GAMEDAY;
  const prev = window.NS.GAMES.find((x) => x.n === snap.n - 1);
  const tierSegs = [
    { label: "Gold", value: snap.tiers.gold, color: "var(--tier-gold-mark)" },
    { label: "Silver", value: snap.tiers.silver, color: "var(--tier-silver-mark)" },
    { label: "Bronze", value: snap.tiers.bronze, color: "var(--tier-bronze-mark)" },
  ];
  const totalRecognized = tierSegs.reduce((s, x) => s + x.value, 0);
  const maxStand = Math.max(...snap.stands.map((s) => s.sales));
  const ratio = snap.recognized / 6842;
  const pulse = G.pulse.map((p, i, arr) => ({ t: p.t, v: i === arr.length - 1 ? snap.recognized : Math.round(p.v * ratio) }));

  const rcg = deltaChip(snap.recognized, prev && prev.recognized);
  const pc = deltaChip(snap.perCap, prev && prev.perCap, true);
  const fnb = deltaChip(snap.fnb, prev && prev.fnb);

  return (
    <div>
      <PageHead
        eyebrow={isLive ? `Live · Game ${snap.n}` : `Final · Game ${snap.n}`}
        title={isLive ? "Game-day intelligence" : `Game ${snap.n} recap`}
        desc={`Chicago Bulls vs. ${snap.opp} · United Center · ${snap.date}${isLive ? " — updated on every tap, ≤ 60s lag." : ` — final, ${snap.res === "W" ? "Bulls won" : "Bulls lost"}.`}`}
        actions={<>
          <button className="ns-btn ns-btn--secondary"><Icon name="download" size={14} />Export</button>
          <button className="ns-btn ns-btn--primary" onClick={() => window.nsNewCampaign()}><Icon name="message" size={14} />Create campaign</button>
        </>}
      />

      <div className="ns-kpis" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 14 }}>
        <Kpi icon="users" label="Recognized fans" value={window.NS.fmtNum(snap.recognized)} delta={rcg.delta ? rcg.delta + " vs prior" : "first game"} dir={rcg.dir} hint="" />
        <Kpi icon="star" label="Gold STH active" value={window.NS.fmtNum(Math.round(2741 * snap.gold / 100))} delta={snap.gold + "% of 2,741"} dir="flat" />
        <Kpi icon="dollar" label="Per-cap spend" value={window.NS.fmtMoney(snap.perCap, 2)} delta={pc.delta ? pc.delta + " vs prior" : "—"} dir={pc.dir} hint="" />
        <Kpi icon="cart" label="Total F&B" value={window.NS.fmtMoney(snap.fnb)} delta={fnb.delta ? fnb.delta + " vs prior" : "—"} dir={fnb.dir} hint="" />
      </div>

      <div className="ns-grid" style={{ gridTemplateColumns: "1.9fr 1fr", marginBottom: 14 }}>
        <div className="ns-card">
          <div className="ns-card__head">
            <div>
              <div className="ns-card__title">{isLive ? "Recognized fans tonight" : "Recognized fans · this game"}</div>
              <div className="ns-card__sub">Identity resolved at tap · cumulative through the {isLive ? "night" : "game"}</div>
            </div>
            {isLive && <Badge tone="danger" dot>Live</Badge>}
          </div>
          <div className="ns-card__body"><BarChart data={pulse} valueKey="v" labelKey="t" height={236} /></div>
        </div>

        <div className="ns-card">
          <div className="ns-card__head"><div className="ns-card__title">Confidence mix</div></div>
          <div className="ns-card__body" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <Donut segments={tierSegs} centerLabel={window.NS.fmtNum(totalRecognized)} centerSub="recognized" />
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 9 }}>
              {tierSegs.map((s) => (
                <div key={s.label} className="ns-spread">
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 9, height: 9, borderRadius: "50%", background: s.color }} />
                    <span style={{ fontSize: 12, color: "var(--rc-gray-900)", fontWeight: 500 }}>{s.label}</span>
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="ns-mono ns-muted" style={{ fontSize: 11 }}>{Math.round((s.value / totalRecognized) * 100)}%</span>
                    <span className="ns-mono ns-strong" style={{ fontSize: 12.5, minWidth: 46, textAlign: "right" }}>{window.NS.fmtNum(s.value)}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="ns-grid" style={{ gridTemplateColumns: "1.4fr 1fr" }}>
        <div className="ns-card">
          <div className="ns-card__head">
            <div className="ns-card__title">Concession stand performance</div>
            <span className="ns-muted" style={{ fontSize: 11 }}>F&amp;B sales · {isLive ? "tonight" : "final"}</span>
          </div>
          <div className="ns-card__body" style={{ display: "flex", flexDirection: "column", gap: 13, paddingTop: 14 }}>
            {snap.stands.map((s) => (
              <div key={s.name}>
                <div className="ns-spread" style={{ marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: "var(--rc-gray-900)", fontWeight: 500 }}>{s.name}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {isLive && s.note && <Badge tone="danger">{s.note}</Badge>}
                    <span className="ns-mono ns-strong" style={{ fontSize: 12.5 }}>{window.NS.fmtMoney(s.sales)}</span>
                    <span style={{ color: s.dir === "up" ? "var(--rc-green-600)" : s.dir === "down" ? "var(--rc-red-600)" : "var(--color-text-secondary)" }}>
                      <Icon name={s.dir === "up" ? "trendUp" : s.dir === "down" ? "trendDown" : "minus"} size={13} stroke={2.2} />
                    </span>
                  </span>
                </div>
                <Progress pct={(s.sales / maxStand) * 100} tone={isLive && s.dir === "down" ? "red" : undefined} />
              </div>
            ))}
          </div>
        </div>

        {isLive ? (
          <div className="ns-card">
            <div className="ns-card__head"><div className="ns-card__title">Live activity</div><Badge tone="danger" dot>Live</Badge></div>
            <div className="ns-card__body" style={{ paddingTop: 6, paddingBottom: 6 }}>
              {G.feed.map((f, i) => (
                <div key={i} style={{ display: "flex", gap: 11, padding: "11px 0", borderBottom: i < G.feed.length - 1 ? "1px solid var(--color-border-default)" : "none" }}>
                  <span style={{ marginTop: 1 }}><Tier tier={f.tier} /></span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 12, color: "var(--rc-gray-900)", fontWeight: 500 }}>{f.text}</div>
                    <div className="ns-muted" style={{ fontSize: 11, marginTop: 2 }}>{f.sub}</div>
                  </div>
                  <span className="ns-mono ns-muted" style={{ fontSize: 10.5, whiteSpace: "nowrap" }}>{f.time}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="ns-card">
            <div className="ns-card__head"><div className="ns-card__title">Game summary</div><span className={"ns-gamepill__res ns-gamepill__res--" + (snap.res === "W" ? "w" : "l")}>{snap.res}</span></div>
            <div className="ns-card__body" style={{ paddingTop: 8 }}>
              {[
                ["Result", snap.res === "W" ? "Win vs. " + snap.opp : "Loss vs. " + snap.opp, "trophy"],
                ["Benefit value applied", window.NS.fmtMoney(Math.round(snap.fnb * 0.047)), "gift"],
                ["Promotions redeemed", window.NS.fmtNum(Math.round(snap.recognized * 0.12)), "tag"],
                ["New fans created", window.NS.fmtNum(Math.round(snap.recognized * 0.06)), "sparkle"],
                ["Avg sentiment", (6.8 + (snap.res === "W" ? 0.6 : -0.2)).toFixed(1), "gauge"],
              ].map(([k, v, ic], i) => (
                <div key={k} className="ns-spread" style={{ padding: "11px 0", borderBottom: i < 4 ? "1px solid var(--color-border-default)" : "none" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "var(--color-text-primary)" }}><span style={{ width: 26, height: 26, borderRadius: 6, background: "var(--rc-gray-100)", color: "var(--color-text-secondary)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Icon name={ic} size={13} /></span>{k}</span>
                  <span className="ns-mono ns-strong" style={{ fontSize: 13 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Season-to-date overview ----------
function SeasonOverview() {
  const GAMES = window.NS.GAMES;
  const S = window.NS.SEASON_SUMMARY;
  const SEASON = window.NS.SEASON;
  const [metric, setMetric] = React.useState("recognized");
  const metricMap = {
    recognized: { label: "Recognized fans", fmt: (v) => window.NS.fmtNum(v), prefix: "" },
    perCap: { label: "Per-cap spend", fmt: (v) => "$" + v.toFixed(2), prefix: "$" },
    fnb: { label: "Total F&B", fmt: (v) => window.NS.fmtMoney(v), prefix: "$" },
  };
  const data = GAMES.map((g) => ({ t: "G" + g.n, v: g[metric] }));
  const topFans = [...window.NS.FANS].sort((a, b) => b.totalSeason - a.totalSeason).slice(0, 6);
  const catColors = ["#d68f0c", "#bd7842", "#4789c5", "#0a2843"];

  return (
    <div>
      <PageHead
        eyebrow="Season to date · 2025–26"
        title="Season overview"
        desc={`Chicago Bulls · United Center — ${S.gamesPlayed} home games played (${S.recordW}–${S.recordL}). Cumulative fan intelligence across the season.`}
        actions={<>
          <button className="ns-btn ns-btn--secondary"><Icon name="download" size={14} />Export season report</button>
          <button className="ns-btn ns-btn--primary" onClick={() => window.nsNewCampaign()}><Icon name="message" size={14} />Create campaign</button>
        </>}
      />

      <div className="ns-kpis" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 14 }}>
        <Kpi hero icon="trophy" label="Home record" value={`${S.recordW}–${S.recordL}`} delta={`${S.gamesPlayed} games played`} dir="flat" />
        <Kpi icon="users" label="Unique fans recognized" value={window.NS.fmtNum(S.uniqueFans)} delta={`+${window.NS.fmtNum(S.newFansSeason)} new this season`} dir="up" hint="" />
        <Kpi icon="cart" label="Total F&B" value={"$" + (S.totalFnb / 1e6).toFixed(2) + "M"} delta="season to date" dir="flat" />
        <Kpi icon="dollar" label="Avg per-cap" value={window.NS.fmtMoney(S.avgPerCap, 2)} delta="+12.3% vs last season" dir="up" hint="" />
      </div>

      <div className="ns-card" style={{ marginBottom: 14 }}>
        <div className="ns-card__head">
          <div><div className="ns-card__title">Per-game trend</div><div className="ns-card__sub">Every home game · click the pill to drill into one</div></div>
          <div className="ns-seg">
            {Object.keys(metricMap).map((m) => <button key={m} className={metric === m ? "is-active" : ""} onClick={() => setMetric(m)}>{metricMap[m].label}</button>)}
          </div>
        </div>
        <div className="ns-card__body"><BarChart data={data} valueKey="v" labelKey="t" height={230} prefix={metricMap[metric].prefix} /></div>
      </div>

      <div className="ns-grid" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: 14 }}>
        <div className="ns-card">
          <div className="ns-card__head"><div className="ns-card__title">Per-cap vs. last season</div><span className="ns-muted" style={{ fontSize: 11 }}>Games 1–14</span></div>
          <div className="ns-table-wrap">
            <table className="ns-table">
              <thead><tr><th>Segment</th><th className="ns-num">This season</th><th className="ns-num">Last season</th><th className="ns-num">Delta</th></tr></thead>
              <tbody>
                {SEASON.perCap.map((r) => (
                  <tr key={r.seg}>
                    <td className="ns-strong">{r.seg}</td>
                    <td className="ns-num ns-mono ns-strong">{window.NS.fmtMoney(r.now, 2)}</td>
                    <td className="ns-num ns-mono ns-muted">{window.NS.fmtMoney(r.prev, 2)}</td>
                    <td className="ns-num"><Delta dir={r.dir}>{r.delta > 0 ? "+" : ""}{window.NS.fmtMoney(Math.abs(r.delta), 2)}</Delta></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="ns-card">
          <div className="ns-card__head"><div className="ns-card__title">F&amp;B category mix</div><span className="ns-muted" style={{ fontSize: 11 }}>season</span></div>
          <div className="ns-card__body" style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <Donut segments={SEASON.category.map((c, i) => ({ label: c.cat, value: c.pct, color: catColors[i] }))} centerLabel={"$" + (S.totalFnb / 1e6).toFixed(1) + "M"} centerSub="F&B" />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 9 }}>
              {SEASON.category.map((c, i) => (
                <div key={c.cat} className="ns-spread">
                  <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--rc-gray-900)" }}><span style={{ width: 9, height: 9, borderRadius: "50%", background: catColors[i] }} />{c.cat}</span>
                  <span className="ns-mono ns-strong" style={{ fontSize: 12 }}>{c.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="ns-card">
        <div className="ns-card__head"><div className="ns-card__title">Top fans by season spend</div><button className="ns-btn ns-btn--ghost ns-btn--sm" onClick={() => window.nsGo("fans")}>All fans<Icon name="chevRight" size={13} /></button></div>
        <div className="ns-table-wrap">
          <table className="ns-table">
            <thead><tr><th>Fan</th><th>Confidence</th><th>Membership</th><th className="ns-num">Games</th><th className="ns-num">Avg / game</th><th className="ns-num">Season spend</th><th>Sentiment</th></tr></thead>
            <tbody>
              {topFans.map((f) => {
                const realIdx = window.NS.FANS.findIndex((x) => x.id === f.id);
                return (
                  <tr key={f.id} className="is-clickable" onClick={() => window.nsOpenFan(f.id)}>
                    <td><div className="ns-cell-fan"><Avatar name={f.name} seed={realIdx} /><div><div className="ns-cell-fan__name">{f.name}</div><div className="ns-cell-fan__sub">#{f.id}</div></div></div></td>
                    <td><Tier tier={f.tier} /></td>
                    <td style={{ fontSize: 12 }}>{f.sth || <span className="ns-muted">Non-STH</span>}</td>
                    <td className="ns-num ns-mono">{f.seasonGames}</td>
                    <td className="ns-num ns-mono">{window.NS.fmtMoney(f.avgSeason)}</td>
                    <td className="ns-num ns-mono ns-strong">{window.NS.fmtMoney(f.totalSeason)}</td>
                    <td><SentTag trend={f.sentTrend} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function GameDayScreen({ scope }) {
  scope = scope || { type: "live", n: 14 };
  if (scope.type === "season") return <SeasonOverview />;
  const snap = window.NS.getGameSnapshot(scope.n);
  return <GameView snap={snap} isLive={scope.type === "live"} />;
}
window.GameDayScreen = GameDayScreen;
