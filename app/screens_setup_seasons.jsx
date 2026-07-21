/* Northstar — Seasons & teams setup: venue/team scoping so every
   season-ticket record, tier, and roster import is scoped to a season
   instead of a single overwritable status. */

const NS_SEASON_STATUS = { current: "success", past: "neutral", upcoming: "info" };

function ImportStat({ label, value, tone }) {
  if (value == null) return null;
  return (
    <div>
      <div className="ns-mono ns-strong" style={{ fontSize: 17, color: tone }}>{window.NS.fmtNum(value)}</div>
      <div className="ns-muted" style={{ fontSize: 10.5, marginTop: 2 }}>{label}</div>
    </div>
  );
}

function SeasonDetail({ season }) {
  const s = season;
  return (
    <div className="ns-card">
      <div className="ns-card__head">
        <div className="ns-card__title">{s.label}<span className="ns-muted" style={{ fontWeight: 400, marginLeft: 8, fontSize: 12 }}>{s.start} – {s.end}</span></div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Badge tone={NS_SEASON_STATUS[s.status]} dot={s.status === "current"}>{s.status === "current" ? "Current season" : s.status}</Badge>
          {s.status !== "current" && <button className="ns-btn ns-btn--secondary ns-btn--sm">Set as current</button>}
        </div>
      </div>
      <div className="ns-card__body">
        <div style={{ display: "flex", gap: 24, marginBottom: 16, flexWrap: "wrap" }}>
          <div>
            <div className="ns-eyebrow" style={{ marginBottom: 5 }}>Renewal window</div>
            <div style={{ fontSize: 12.5, color: "var(--rc-gray-900)", fontWeight: 500 }}>{s.renewal.opens} – {s.renewal.closes}</div>
          </div>
          <div>
            <div className="ns-eyebrow" style={{ marginBottom: 5 }}>Games scheduled</div>
            <div style={{ fontSize: 12.5, color: "var(--rc-gray-900)", fontWeight: 500 }}>{s.games || "Not yet scheduled"}</div>
          </div>
          <div>
            <div className="ns-eyebrow" style={{ marginBottom: 5 }}>Match key on import</div>
            <div style={{ fontSize: 12.5, color: "var(--rc-gray-900)", fontWeight: 500 }}>{s.matchKey === "account" ? "Season-ticket account number" : "Email / phone"}</div>
          </div>
        </div>

        <div className="ns-divider" style={{ marginBottom: 14 }} />

        <div className="ns-eyebrow" style={{ marginBottom: 8 }}>Season-ticket tiers</div>
        <div className="ns-table-wrap" style={{ marginBottom: 18 }}>
          <table className="ns-table">
            <thead><tr><th>Plan code</th><th>Tier</th><th>Benefit</th><th className="ns-num">Members</th></tr></thead>
            <tbody>
              {s.tiers.map((t) => (
                <tr key={t.code}>
                  <td className="ns-mono" style={{ fontSize: 11.5, color: "var(--rc-blue-600)", fontWeight: 600 }}>{t.code}</td>
                  <td className="ns-strong" style={{ fontSize: 12 }}>{t.name}</td>
                  <td style={{ fontSize: 12 }}>{t.benefit}</td>
                  <td className="ns-num ns-mono">{window.NS.fmtNum(t.members)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ns-spread" style={{ marginBottom: 8 }}>
          <div className="ns-eyebrow">Last roster import</div>
          <button className="ns-btn ns-btn--ghost ns-btn--sm"><Icon name="upload" size={13} />Import roster</button>
        </div>
        {s.lastImport ? (
          <div>
            <div className="ns-muted" style={{ fontSize: 11.5, marginBottom: 10 }}>{s.lastImport.date} · matched by {s.matchKey === "account" ? "account number" : "email/phone"}</div>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              <ImportStat label="Renewed" value={s.lastImport.renewed} tone="var(--rc-green-600)" />
              <ImportStat label="Upgraded" value={s.lastImport.upgraded} tone="var(--tier-gold-mark)" />
              <ImportStat label="Downgraded" value={s.lastImport.downgraded} tone="var(--rc-amber-600)" />
              <ImportStat label="New" value={s.lastImport.new} tone="var(--rc-blue-600)" />
              <ImportStat label="Lapsed · not renewed" value={s.lastImport.lapsed} tone="var(--rc-red-600)" />
            </div>
          </div>
        ) : <div className="ns-drop">No roster imported yet for this season.</div>}
      </div>
    </div>
  );
}

function SeasonsSetupScreen() {
  const { VENUES, TEAMS, TEAM_SEASONS } = window.NS;
  const [teamId, setTeamId] = React.useState(TEAMS[0].id);
  const team = TEAMS.find((t) => t.id === teamId);
  const venue = VENUES.find((v) => v.id === team.venue);
  const venueTeams = TEAMS.filter((t) => t.venue === venue.id);
  const seasons = TEAM_SEASONS[teamId] || [];
  const [selId, setSelId] = React.useState(() => (seasons.find((s) => s.status === "current") || seasons[0])?.id);

  const pickTeam = (id) => {
    setTeamId(id);
    const next = TEAM_SEASONS[id] || [];
    setSelId((next.find((s) => s.status === "current") || next[0])?.id);
  };

  const season = seasons.find((s) => s.id === selId);

  return (
    <div>
      <PageHead eyebrow="Setup" title="Seasons &amp; teams"
        desc="Every season-ticket record, tier, and roster import is scoped to a team and a season — a new year's import adds to a fan's history instead of overwriting it."
        actions={<button className="ns-btn ns-btn--secondary"><Icon name="plus" size={14} />Add team</button>} />

      {/* Venue + team switcher */}
      <div className="ns-card" style={{ marginBottom: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 34, height: 34, borderRadius: 8, background: "var(--rc-blue-100)", color: "var(--rc-blue-600)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="pin" size={17} /></span>
          <div>
            <div className="ns-eyebrow" style={{ marginBottom: 2 }}>Venue</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--rc-gray-900)" }}>{venue.name}</div>
          </div>
        </div>
        <div className="ns-divider" style={{ width: 1, height: 32 }} />
        <div className="ns-seg">
          {venueTeams.map((t) => (
            <button key={t.id} className={t.id === teamId ? "is-active" : ""} onClick={() => pickTeam(t.id)}>{t.name}</button>
          ))}
        </div>
        {venueTeams.length > 1 && <span className="ns-muted" style={{ fontSize: 11.5, marginLeft: "auto" }}>{venueTeams.length} teams share this venue — each keeps its own seasons and rosters</span>}
      </div>

      <div className="ns-grid" style={{ gridTemplateColumns: "1fr 1.6fr", alignItems: "flex-start" }}>
        {/* Season list */}
        <div className="ns-card">
          <div className="ns-card__head"><div className="ns-card__title">Seasons</div><button className="ns-btn ns-btn--ghost ns-btn--sm"><Icon name="plus" size={13} />Add season</button></div>
          <div className="ns-card__body" style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 12 }}>
            {seasons.map((s) => (
              <button key={s.id} className={"ns-memchip" + (s.id === selId ? " is-on" : "")} style={{ width: "100%", justifyContent: "space-between" }} onClick={() => setSelId(s.id)}>
                <span className="ns-memchip__meta">
                  <span className="ns-memchip__label">{s.label}</span>
                  <span className="ns-memchip__sub">{s.start} – {s.end}</span>
                </span>
                <Badge tone={NS_SEASON_STATUS[s.status]} dot={s.status === "current"}>{s.status}</Badge>
              </button>
            ))}
          </div>
        </div>

        {/* Season detail */}
        {season && <SeasonDetail season={season} />}
      </div>
    </div>
  );
}

window.SeasonsSetupScreen = SeasonsSetupScreen;
