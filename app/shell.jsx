/* Northstar — app shell: sidebar nav + top bar. */

const NS_NAV = [
  {
    label: "Fan intelligence",
    items: [
      { id: "gameday", label: "Game day", icon: "activity" },
      { id: "fans", label: "Fan profiles", icon: "users", count: "6.8K" },
      { id: "sth", label: "STH health", icon: "shield" },
      { id: "sentiment", label: "Sentiment", icon: "gauge" },
    ],
  },
  {
    label: "Engage",
    items: [
      { id: "loyalty", label: "Loyalty", icon: "trophy" },
      { id: "promotions", label: "Promotions", icon: "tag", count: 6 },
      { id: "campaigns", label: "Campaigns", icon: "message" },
      { id: "sponsorship", label: "Sponsorship", icon: "handshake" },
    ],
  },
  {
    label: "Setup",
    items: [
      { id: "entitlements", label: "Entitlements", icon: "database" },
    ],
  },
];

function NSMark({ size = 28 }) {
  return (
    <span className="ns-mark" style={{ width: size, height: size }}>
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2.5l2 6.4 6.5.3-5.2 4 1.9 6.3L12 16.1 6.8 19.5l1.9-6.3-5.2-4 6.5-.3z"
          fill="#fff" stroke="#fff" strokeWidth="0.6" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function NSSidebar({ active, onNav }) {
  return (
    <aside className="ns-sidebar" aria-label="Primary">
      <div className="ns-sidebar__brand">
        <NSMark />
        <span className="ns-wordmark">
          <span className="ns-wordmark__name">Northstar</span>
          <span className="ns-wordmark__sub">Fan CRM</span>
        </span>
      </div>
      <nav>
        {NS_NAV.map((group) => (
          <div className="ns-navgroup" key={group.label}>
            <div className="ns-navgroup__label">{group.label}</div>
            {group.items.map((it) => (
              <button key={it.id}
                className={"ns-navitem" + (it.id === active ? " is-active" : "")}
                onClick={() => onNav(it.id)} aria-current={it.id === active ? "page" : undefined}>
                <Icon name={it.icon} size={16} />
                <span>{it.label}</span>
                {it.count != null && <span className="ns-navitem__count">{it.count}</span>}
              </button>
            ))}
          </div>
        ))}
      </nav>
      <div className="ns-sidebar__foot">
        <div className="ns-venuecard">
          <span className="ns-venuecard__logo">CHI</span>
          <span className="ns-venuecard__meta">
            <span className="ns-venuecard__name">Chicago Bulls</span>
            <span className="ns-venuecard__sub">United Center · 2025–26</span>
          </span>
        </div>
      </div>
    </aside>
  );
}

function NSTopBar({ onSearch, scope, setScope }) {
  const [open, setOpen] = React.useState(false);
  const GAMES = window.NS.GAMES;
  const cur = scope.type === "game" || scope.type === "live" ? GAMES.find((g) => g.n === scope.n) : null;
  const ref = React.useRef(null);
  React.useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const pick = (s) => { setScope(s); setOpen(false); };

  return (
    <header className="ns-topbar">
      <div className="ns-topbar__left">
        <div className="ns-gamepick" ref={ref}>
          <button className={"ns-gamepill" + (open ? " is-open" : "")} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            {scope.type === "season" ? (
              <>
                <span className="ns-gamepill__season"><Icon name="calendar" size={16} /></span>
                <span className="ns-gamepill__meta">
                  <span className="ns-gamepill__title">Season to date</span>
                  <span className="ns-gamepill__sub">2025–26 · {window.NS.SEASON_SUMMARY.gamesPlayed} games</span>
                </span>
              </>
            ) : (
              <>
                <span className="ns-gamepill__vs">
                  <span className="ns-gamepill__team">CHI</span>
                  <span className="ns-gamepill__at">vs</span>
                  <span className="ns-gamepill__team ns-gamepill__team--away">{cur.abbr}</span>
                </span>
                <span className="ns-gamepill__meta">
                  <span className="ns-gamepill__title">Bulls vs. {cur.opp.split(" ").slice(-1)[0]}</span>
                  <span className="ns-gamepill__sub">Game {cur.n} · {scope.type === "live" ? "Tip-off 7:00 PM" : cur.date}</span>
                </span>
                {scope.type === "live"
                  ? <span className="ns-gamepill__live"><span className="ns-livedot" aria-hidden="true" />Live</span>
                  : <span className={"ns-gamepill__res ns-gamepill__res--" + (cur.res === "W" ? "w" : "l")}>{cur.res}</span>}
              </>
            )}
            <span className="ns-gamepill__chev"><Icon name="chevDown" size={14} /></span>
          </button>
          {open && (
            <div className="ns-gamemenu" role="listbox">
              <button className={"ns-gamemenu__item" + (scope.type === "season" ? " is-active" : "")} onClick={() => pick({ type: "season", n: 14 })}>
                <span className="ns-gamemenu__ico"><Icon name="calendar" size={15} /></span>
                <span className="ns-gamemenu__body"><span className="ns-gamemenu__t">Season to date</span><span className="ns-gamemenu__s">Cumulative · 2025–26</span></span>
                <span className="ns-mono ns-muted" style={{ fontSize: 10.5 }}>14 GP</span>
              </button>
              <div className="ns-gamemenu__label">Games</div>
              <div className="ns-gamemenu__scroll">
                {[...GAMES].reverse().map((g) => {
                  const isLive = g.res === "live";
                  const sel = (isLive ? scope.type === "live" : scope.type === "game") && scope.n === g.n;
                  return (
                    <button key={g.n} className={"ns-gamemenu__item" + (sel ? " is-active" : "")} onClick={() => pick({ type: isLive ? "live" : "game", n: g.n })}>
                      <span className="ns-gamemenu__ico ns-gamemenu__ico--team">{g.abbr}</span>
                      <span className="ns-gamemenu__body"><span className="ns-gamemenu__t">Game {g.n} · vs. {g.opp.split(" ").slice(-1)[0]}</span><span className="ns-gamemenu__s">{g.date}</span></span>
                      {isLive ? <span className="ns-gamepill__live" style={{ padding: "3px 7px" }}><span className="ns-livedot" />Live</span>
                        : <span className={"ns-gamepill__res ns-gamepill__res--" + (g.res === "W" ? "w" : "l")}>{g.res}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <button className="ns-search is-ai" onClick={onSearch} style={{ border: 0, textAlign: "left" }} aria-label="Open AI search">
          <span className="ns-search__icon"><Icon name="sparkle" size={15} /></span>
          <span style={{ flex: 1, color: "var(--color-text-secondary)", fontSize: 12.5 }}>Ask Northstar AI…</span>
          <span className="ns-search__kbd" style={{ font: "500 10px/1 var(--font-family-mono)", color: "var(--color-text-secondary)", background: "var(--rc-gray-100)", padding: "3px 6px", borderRadius: 3 }}>⌘K</span>
        </button>
      </div>
      <div className="ns-topbar__right">
        <button className="ns-iconbtn" aria-label="Notifications"><Icon name="bell" size={17} /><span className="ns-iconbtn__dot" /></button>
        <button className="ns-iconbtn" aria-label="Help"><Icon name="help" size={17} /></button>
        <div className="ns-user">
          <span className="ns-user__avatar">RA</span>
          <span className="ns-user__meta">
            <span className="ns-user__name">Renee Alvarez</span>
            <span className="ns-user__role">Venue GM</span>
          </span>
          <span className="ns-muted"><Icon name="chevDown" size={13} /></span>
        </div>
      </div>
    </header>
  );
}

Object.assign(window, { NSSidebar, NSTopBar });
