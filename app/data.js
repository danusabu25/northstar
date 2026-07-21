/* Northstar — shared mock dataset (Chicago Bulls 2025-26 @ United Center).
   Plain JS, attached to window.NS. Numbers track the PRD where it gives them. */
(function () {
  // avatar palette — restrained, harmonised with brand
  const AV = ["#0a2843", "#1a6ab2", "#114b86", "#56616e", "#8a532b", "#1f7a3a"];
  const avatarColor = (seed) => AV[seed % AV.length];

  const initials = (name) =>
    name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  // ---- Fans (drives profiles list + drill-down + tables) ----
  const FANS = [
    { id: "TM-00482917", name: "Marcus Delgado", tier: "gold", sth: "Gold · Full season", seat: "Sec 114 · Row 8", seasonGames: 14, allGames: 47, avgSeason: 38, avgAll: 34, totalSeason: 532, totalAll: 1598, benefitGames: 12, benefitOf: 14, lastVisit: "Game 14 · $44", points: 5320, sentiment: [8.2, 7.8, 4.1, 3.6, null], sentTrend: "down", flags: ["Renewal in 47 days", "Sentiment declining"], renewal: "Jul 2026", topItems: ["Draft beer", "Loaded nachos", "Team cap"], joined: "2019" },
    { id: "TM-00118044", name: "Priya Raman", tier: "gold", sth: "Platinum · Courtside", seat: "Sec 102 · Row 2", seasonGames: 16, allGames: 38, avgSeason: 61, avgAll: 58, totalSeason: 976, totalAll: 2204, benefitGames: 15, benefitOf: 16, lastVisit: "Game 14 · $72", points: 9120, sentiment: [8.6, 8.9, 9.1, 8.8, null], sentTrend: "up", flags: [], renewal: "Aug 2026", topItems: ["Premium seating F&B", "Merchandise", "Wine"], joined: "2021" },
    { id: "TM-00903371", name: "Devin Brooks", tier: "gold", sth: "Gold · Full season", seat: "Sec 118 · Row 14", seasonGames: 9, allGames: 22, avgSeason: 29, avgAll: 31, totalSeason: 261, totalAll: 682, benefitGames: 4, benefitOf: 9, lastVisit: "Game 12 · $26", points: 2610, sentiment: [6.4, 5.9, 6.1, 5.2, null], sentTrend: "down", flags: ["Low benefit usage"], renewal: "Jul 2026", topItems: ["Hot dog", "Soda"], joined: "2022" },
    { id: "TM-00551209", name: "Alana Foster", tier: "silver", sth: null, seat: null, seasonGames: 6, allGames: 11, avgSeason: 24, avgAll: 23, totalSeason: 144, totalAll: 253, benefitGames: 0, benefitOf: 0, lastVisit: "Game 13 · $19", points: 1440, sentiment: [7.1, 7.4, 7.0, 7.6, null], sentTrend: "flat", flags: [], renewal: null, topItems: ["Popcorn", "Soda"], joined: "2024" },
    { id: "TM-00772658", name: "Jerome Pickett", tier: "gold", sth: "Gold · Half season", seat: "Sec 110 · Row 22", seasonGames: 11, allGames: 29, avgSeason: 42, avgAll: 39, totalSeason: 462, totalAll: 1131, benefitGames: 9, benefitOf: 11, lastVisit: "Game 14 · $51", points: 4620, sentiment: [7.8, 8.0, 8.3, 8.1, null], sentTrend: "up", flags: [], renewal: "Sep 2026", topItems: ["Draft beer", "Brisket sandwich", "Cap"], joined: "2020" },
    { id: "TM-00339418", name: "Sofia Marchetti", tier: "silver", sth: null, seat: null, seasonGames: 5, allGames: 8, avgSeason: 27, avgAll: 26, totalSeason: 135, totalAll: 208, benefitGames: 0, benefitOf: 0, lastVisit: "Game 11 · $22", points: 1350, sentiment: [6.8, 6.2, 5.4, null, null], sentTrend: "down", flags: [], renewal: null, topItems: ["Nachos", "Margarita"], joined: "2024" },
    { id: "TM-00640122", name: "Tyrese Okafor", tier: "gold", sth: "Gold · Full season", seat: "Sec 116 · Row 6", seasonGames: 13, allGames: 41, avgSeason: 47, avgAll: 44, totalSeason: 611, totalAll: 1804, benefitGames: 12, benefitOf: 13, lastVisit: "Game 14 · $55", points: 6110, sentiment: [8.4, 8.6, 8.2, 8.8, null], sentTrend: "up", flags: [], renewal: "Jul 2026", topItems: ["Craft beer", "Wings", "Jersey"], joined: "2018" },
    { id: "TM-00210877", name: "Hannah Whitlock", tier: "bronze", sth: null, seat: null, seasonGames: 2, allGames: 2, avgSeason: 18, avgAll: 18, totalSeason: 36, totalAll: 36, benefitGames: 0, benefitOf: 0, lastVisit: "Game 13 · $21", points: 0, sentiment: [null, 6.0, null, null, null], sentTrend: "flat", flags: ["New visitor"], renewal: null, topItems: ["Soda"], joined: "2025" },
    { id: "TM-00488123", name: "Leon Vasquez", tier: "gold", sth: "Gold · Full season", seat: "Sec 112 · Row 11", seasonGames: 3, allGames: 34, avgSeason: 22, avgAll: 41, totalSeason: 66, totalAll: 1394, benefitGames: 1, benefitOf: 3, lastVisit: "Game 8 · $19", points: 660, sentiment: [3.9, 4.2, null, null, null], sentTrend: "down", flags: ["At risk — 3 games vs 12 last season", "Renewal in 54 days"], renewal: "Jul 2026", topItems: ["Draft beer", "Pretzel"], joined: "2017" },
    { id: "TM-00901556", name: "Grace Yoon", tier: "gold", sth: "Platinum · Club level", seat: "Sec 104 · Row 4", seasonGames: 15, allGames: 52, avgSeason: 58, avgAll: 53, totalSeason: 870, totalAll: 2756, benefitGames: 14, benefitOf: 15, lastVisit: "Game 14 · $63", points: 8700, sentiment: [8.9, 9.0, 8.7, 9.2, null], sentTrend: "up", flags: [], renewal: "Aug 2026", topItems: ["Club F&B", "Wine", "Merchandise"], joined: "2016" },
    { id: "TM-00667301", name: "Carl Nwosu", tier: "silver", sth: null, seat: null, seasonGames: 7, allGames: 14, avgSeason: 31, avgAll: 29, totalSeason: 217, totalAll: 406, benefitGames: 0, benefitOf: 0, lastVisit: "Game 14 · $33", points: 2170, sentiment: [7.2, 7.0, 7.5, 7.1, null], sentTrend: "flat", flags: [], renewal: null, topItems: ["Beer", "Burger"], joined: "2023" },
    { id: "TM-00773910", name: "Bianca Russo", tier: "gold", sth: "Gold · Half season", seat: "Sec 120 · Row 9", seasonGames: 8, allGames: 19, avgSeason: 36, avgAll: 35, totalSeason: 288, totalAll: 665, benefitGames: 6, benefitOf: 8, lastVisit: "Game 13 · $40", points: 2880, sentiment: [7.6, 7.8, 8.0, 7.4, null], sentTrend: "flat", flags: [], renewal: "Sep 2026", topItems: ["Wine", "Flatbread"], joined: "2021" },
  ];

  // ---- Game-day overview ----
  const GAMEDAY = {
    game: "Game 14", matchup: "Chicago Bulls vs. Miami Heat", venue: "United Center",
    gatesOpen: "5:30 PM", tipoff: "7:00 PM", date: "Jan 18, 2026",
    kpis: [
      { label: "Recognized fans", value: "6,842", delta: "+3.2%", dir: "up", hint: "vs. Game 13", icon: "users" },
      { label: "Gold STH active", value: "2,614", delta: "95% of 2,741", dir: "flat", hint: "linked & present", icon: "star" },
      { label: "Per-cap spend", value: "$38.40", delta: "+$2.10", dir: "up", hint: "vs. Game 13", icon: "dollar" },
      { label: "Total F&B", value: "$262.8K", delta: "+$14.3K", dir: "up", hint: "vs. Game 13", icon: "cart" },
    ],
    // recognized fans across the night (by hour)
    pulse: [
      { t: "5:30", v: 820 }, { t: "6:00", v: 2140 }, { t: "6:30", v: 3680 },
      { t: "7:00", v: 4920 }, { t: "7:30", v: 5610 }, { t: "8:00", v: 6240 },
      { t: "8:30", v: 6842 }, { t: "9:00", v: 6720 },
    ],
    tiers: { gold: 2614, silver: 2480, bronze: 1748 },
    stands: [
      { name: "Stand 3 · Main concourse", sales: 41800, dir: "up", note: null },
      { name: "Stand 12 · Sec 114", sales: 24200, dir: "up", note: null },
      { name: "Stand 18 · Club level", sales: 19400, dir: "up", note: null },
      { name: "Stand 7 · Sec 212", sales: 9400, dir: "down", note: "Below baseline — investigate" },
      { name: "Stand 22 · Upper east", sales: 7600, dir: "flat", note: null },
    ],
    feed: [
      { time: "8:42 PM", tier: "gold", text: "Recovery credit auto-applied", sub: "Fan TM-00482917 · rating ≤ 2 at Stand 7", tone: "warning" },
      { time: "8:31 PM", tier: "gold", text: "Halftime Beer Deal redeemed", sub: "20% off draft · Stand 12", tone: "info" },
      { time: "8:19 PM", tier: "silver", text: "PAR upgraded Silver → Gold", sub: "Email linked at Stand 3", tone: "success" },
      { time: "8:04 PM", tier: "bronze", text: "New fan profile created", sub: "First tap · Stand 18", tone: "neutral" },
    ],
  };

  // ---- STH health ----
  const STH = {
    total: 2741,
    buckets: [
      { key: "high", label: "High engagement", count: 1204, pct: 44, note: "10+ games · benefit usage > 70%", tone: "green" },
      { key: "medium", label: "Medium engagement", count: 891, pct: 32, note: "5–9 games · some benefit usage", tone: "amber" },
      { key: "risk", label: "At risk", count: 387, pct: 14, note: "Fewer games than last season + low benefit use", tone: "red" },
      { key: "flag", label: "Flagged for outreach", count: 259, pct: 9, note: "≤ 3 games · renewal in < 60 days", tone: "red" },
    ],
  };

  // ---- Loyalty (enterprise rule engine) ----
  // Rule groups mirror the loyalty-rules spec: core earn, sports-specific,
  // behavioral (per-fan history), household/social, cross-venue/league.
  const RULE_GROUPS = [
    { id: "earn", label: "Core earn", icon: "dollar", desc: "Spend & attendance base rates" },
    { id: "sports", label: "Sports-specific", icon: "trophy", desc: "Game outcome, type & timing" },
    { id: "behavioral", label: "Behavioral", icon: "activity", desc: "Per-fan transaction history" },
    { id: "household", label: "Household & social", icon: "users", desc: "Group attendance" },
    { id: "crossvenue", label: "Cross-venue", icon: "link", desc: "Network & cross-league" },
  ];

  // Every rule carries the six-component anatomy: trigger / condition / action /
  // scope / constraints / expiry — plus engine metadata (priority, status, impact).
  const LOYALTY_RULES = [
    // ---- Core earn ----
    { id: "earn-ticket", name: "Ticket purchase earn", group: "earn", status: "active", priority: 90, tierGated: false,
      trigger: "Ticket purchase", condition: "Any tender", action: "3 pts / $1", actionKind: "rate", scope: "individual",
      caps: "No cap", budget: null, expiry: "Season end", fired: 18420, value: 612000, baseline: true },
    { id: "earn-merch", name: "Merchandise earn", group: "earn", status: "active", priority: 89, tierGated: false,
      trigger: "Merchandise purchase", condition: "Category = Merch", action: "2 pts / $1", actionKind: "rate", scope: "individual",
      caps: "No cap", budget: null, expiry: "Season end", fired: 7240, value: 188000, baseline: true },
    { id: "earn-fnb", name: "Food & beverage earn", group: "earn", status: "active", priority: 88, tierGated: false,
      trigger: "F&B purchase", condition: "Category = F&B", action: "1 pt / $1", actionKind: "rate", scope: "individual",
      caps: "No cap", budget: null, expiry: "Season end", fired: 142800, value: 1240000, baseline: true },
    { id: "earn-firstgame", name: "First game-day purchase", group: "earn", status: "active", priority: 70, tierGated: false,
      trigger: "First F&B on any game day, ever", condition: "No prior game-day txn", action: "1,000 bonus", actionKind: "bonus", scope: "individual",
      caps: "1 / fan total", budget: null, expiry: "n/a — one-time", fired: 2204, value: 220400 },
    { id: "earn-streak", name: "Attendance streak bonus", group: "earn", status: "active", priority: 64, tierGated: false,
      trigger: "Purchase on 3 / 5 / 10 consecutive game days", condition: "Streak unbroken", action: "500 / 1,500 / 5,000", actionKind: "tiered", scope: "individual",
      caps: "Resets on a missed game", budget: null, expiry: "Season end", fired: 1880, value: 312000 },
    { id: "earn-renewal", name: "Season-ticket early renewal", group: "earn", status: "scheduled", priority: 60, tierGated: false,
      trigger: "Renewal completed in early window", condition: "Within renewal dates", action: "2× on renewal value", actionKind: "mult", scope: "individual",
      caps: "1 / fan / season", budget: "$40,000", budgetUsed: 0, expiry: "Renewal window close", fired: 0, value: 0 },
    { id: "earn-link", name: "Account link bonus", group: "earn", status: "active", priority: 58, tierGated: false,
      trigger: "Fan links Fortress / Fan Maker at POS", condition: "Not previously linked", action: "750 bonus", actionKind: "bonus", scope: "individual",
      caps: "1 / fan total", budget: null, expiry: "n/a — one-time", fired: 1612, value: 120900 },

    // ---- Sports-specific ----
    { id: "sport-win", name: "Win bonus", group: "sports", status: "active", priority: 50, tierGated: true,
      trigger: "Home team wins — fires post-game", condition: "Made an F&B purchase tonight", action: "2× points", actionKind: "mult", scope: "individual",
      tierEffect: { gold: "2.5×", silver: "2×", bronze: "2×" },
      caps: "1 / fan / game", budget: "$25,000", budgetUsed: 14200, expiry: "Per game", fired: 9420, value: 188000 },
    { id: "sport-loss", name: "Loss consolation", group: "sports", status: "active", priority: 49, tierGated: false,
      trigger: "Home team loses — fires post-game", condition: "Attended (game-day purchase)", action: "“Come back” 500 pt credit", actionKind: "bonus", scope: "individual",
      caps: "1 / fan / game", budget: "$8,000", budgetUsed: 3100, expiry: "Next visit", fired: 4180, value: 41800 },
    { id: "sport-playoff", name: "Playoff multiplier", group: "sports", status: "scheduled", priority: 48, tierGated: false,
      trigger: "Game tagged as playoff", condition: "F&B purchase", action: "3× points", actionKind: "mult", scope: "individual",
      caps: "No cap", budget: "$60,000", budgetUsed: 0, expiry: "Playoff run", fired: 0, value: 0 },
    { id: "sport-opener", name: "Season opener bonus", group: "sports", status: "ended", priority: 47, tierGated: false,
      trigger: "First home game of the season", condition: "Any F&B purchase", action: "1,000 bonus", actionKind: "bonus", scope: "individual",
      caps: "1 / fan / game", budget: null, expiry: "Opener only", fired: 5120, value: 512000 },
    { id: "sport-rivalry", name: "Derby / rivalry game", group: "sports", status: "active", priority: 46, tierGated: false,
      trigger: "Game vs. designated rival", condition: "F&B purchase", action: "2× points", actionKind: "mult", scope: "individual",
      caps: "No cap", budget: "$18,000", budgetUsed: 6400, expiry: "Per game", fired: 3280, value: 64000 },
    { id: "sport-halftime", name: "Halftime purchase bonus", group: "sports", status: "active", priority: 40, tierGated: false,
      trigger: "Purchase in the halftime window", condition: "Between H1 end and H2 start", action: "1.5× points", actionKind: "mult", scope: "individual",
      caps: "No cap", budget: "$22,000", budgetUsed: 11800, expiry: "Per game", fired: 16240, value: 118000 },
    { id: "sport-orderahead", name: "Pre-game order-ahead bonus", group: "sports", status: "active", priority: 39, tierGated: false,
      trigger: "Order-ahead purchase before arrival", condition: "Order-ahead F&B", action: "1.5× points", actionKind: "mult", scope: "individual",
      caps: "No cap", budget: null, expiry: "Per game", fired: 2940, value: 38000 },
    { id: "sport-lastq", name: "Last-quarter purchase", group: "sports", status: "paused", priority: 38, tierGated: false,
      trigger: "Purchase in final period of a close game", condition: "Margin ≤ 8 in Q4", action: "750 bonus", actionKind: "bonus", scope: "individual",
      caps: "1 / fan / game", budget: "$10,000", budgetUsed: 2200, expiry: "Per game", fired: 1140, value: 11400 },

    // ---- Behavioral (per-fan history) ----
    { id: "beh-baseline", name: "Spend-above-baseline reward", group: "behavioral", status: "active", priority: 34, tierGated: false,
      trigger: "Spend exceeds fan’s personal F&B average", condition: "Tonight’s spend > rolling avg", action: "2× on amount above baseline", actionKind: "mult", scope: "individual",
      caps: "1 / fan / game", budget: "$30,000", budgetUsed: 16700, expiry: "Season end", fired: 5860, value: 167000, signature: true },
    { id: "beh-newstand", name: "New-to-stand bonus", group: "behavioral", status: "active", priority: 33, tierGated: false,
      trigger: "First-ever purchase at a stand", condition: "No prior txn at this stand", action: "500 bonus", actionKind: "bonus", scope: "individual",
      caps: "1 / fan / stand", budget: "$15,000", budgetUsed: 8900, expiry: "Season end", fired: 3120, value: 156000, signature: true },
    { id: "beh-repeat", name: "Same-category repeat purchase", group: "behavioral", status: "active", priority: 32, tierGated: false,
      trigger: "Second purchase in same category, one game", condition: "Category repeat within game", action: "2× on second purchase", actionKind: "mult", scope: "individual",
      caps: "No cap", budget: null, expiry: "Per game", fired: 7420, value: 84000, signature: true },
    { id: "beh-lapsed", name: "Lapsed-fan return reward", group: "behavioral", status: "active", priority: 31, tierGated: false,
      trigger: "Return after 4 games with no purchase", condition: "Last game-day txn > 4 games ago", action: "3× on first purchase back", actionKind: "mult", scope: "individual",
      caps: "1 / fan / return", budget: "$12,000", budgetUsed: 4400, expiry: "Season end", fired: 1240, value: 44000, signature: true },
    { id: "beh-benefit", name: "Benefit utilization milestone", group: "behavioral", status: "active", priority: 30, tierGated: false,
      trigger: "STH uses food benefit for the Nth time", condition: "Redemption count = 10", action: "1,000 bonus", actionKind: "bonus", scope: "individual",
      caps: "Per milestone", budget: null, expiry: "Season end", fired: 880, value: 88000, signature: true },

    // ---- Household & social ----
    { id: "hh-gameday", name: "Household game-day multiplier", group: "household", status: "active", priority: 24, tierGated: false,
      trigger: "2+ household members purchase same game day", condition: "Linked household", action: "1.5× household F&B", actionKind: "mult", scope: "household",
      caps: "1 / household / game", budget: "$14,000", budgetUsed: 5200, expiry: "Per game", fired: 2360, value: 70000 },
    { id: "hh-streak", name: "Household streak bonus", group: "household", status: "scheduled", priority: 23, tierGated: false,
      trigger: "Household attends 3+ consecutive games", condition: "Linked household, unbroken", action: "2,500 bonus", actionKind: "bonus", scope: "household",
      caps: "Resets on a missed game", budget: "$9,000", budgetUsed: 0, expiry: "Season end", fired: 0, value: 0 },

    // ---- Cross-venue ----
    { id: "cv-discovery", name: "Cross-venue discovery", group: "crossvenue", status: "active", priority: 14, tierGated: false,
      trigger: "First purchase at a new venue in network", condition: "No prior txn at venue", action: "500 bonus", actionKind: "bonus", scope: "individual",
      caps: "1 / fan / venue", budget: "$20,000", budgetUsed: 7300, expiry: "Season end", fired: 1460, value: 73000, platform: true },
    { id: "cv-league", name: "Cross-league loyalty", group: "crossvenue", status: "draft", priority: 13, tierGated: false,
      trigger: "Purchases across 2+ leagues in a season", condition: "NFL + NBA venue same season", action: "2,000 bonus", actionKind: "bonus", scope: "individual",
      caps: "1 / fan / season", budget: "$16,000", budgetUsed: 0, expiry: "Season end", fired: 0, value: 0, platform: true },
  ];

  // Redemption catalog — enterprise: cost, tier gate, eligibility, inventory, expiry.
  const REDEEM_CATALOG = [
    { id: "r-free", reward: "Free item (up to $12)", cost: 1000, kind: "item", tier: "all", eligibility: "Any recognized fan", inventory: null, redeemed: 5120 + 8420, status: "active", expiry: "Season end" },
    { id: "r-merch20", reward: "20% off merchandise", cost: 2500, kind: "discount", tier: "silver", eligibility: "Silver tier or higher", inventory: null, redeemed: 2240, status: "active", expiry: "Season end" },
    { id: "r-seat", reward: "Seat upgrade offer", cost: 5000, kind: "experience", tier: "silver", eligibility: "Silver tier or higher", inventory: { cap: 400, left: 268 }, redeemed: 132, status: "active", expiry: "Per game" },
    { id: "r-club", reward: "Club lounge access", cost: 7500, kind: "experience", tier: "gold", eligibility: "Gold tier only", inventory: { cap: 120, left: 71 }, redeemed: 49, status: "active", expiry: "Per game" },
    { id: "r-meet", reward: "Meet & greet experience", cost: 10000, kind: "experience", tier: "gold", eligibility: "Gold tier · 10+ games", inventory: { cap: 20, left: 6 }, redeemed: 14, status: "active", expiry: "Fixed — Mar 30" },
    { id: "r-jersey", reward: "Signed jersey", cost: 15000, kind: "item", tier: "gold", eligibility: "Gold tier only", inventory: { cap: 10, left: 0 }, redeemed: 10, status: "soldout", expiry: "Fixed — Feb 28" },
  ];

  // Tier qualification — combined AND/OR logic across spend + attendance.
  const LOYALTY_TIERS = [
    { id: "gold", label: "Gold", count: 312, mark: "var(--tier-gold-mark)",
      logic: "AND", rules: ["Season spend ≥ $500", "Attendance ≥ 10 game days"], multiplier: "1.25×", benefit: "All catalog · priority experiences" },
    { id: "silver", label: "Silver", count: 891, mark: "var(--tier-silver-mark)",
      logic: "OR", rules: ["Season spend ≥ $250", "Attendance ≥ 5 game days"], multiplier: "1.1×", benefit: "Merch & seat-upgrade catalog" },
    { id: "bronze", label: "Bronze", count: 1538, mark: "var(--tier-bronze-mark)",
      logic: "—", rules: ["Default — any recognized fan"], multiplier: "1×", benefit: "Base catalog" },
  ];

  // RFM lifecycle segments — auto-computed (Recency / Frequency / Monetary).
  const RFM_SEGMENTS = [
    { id: "champions", label: "Champions", count: 486, tone: "success", r: 5, f: 5, m: 5, desc: "Recent, frequent, high F&B spend", trend: "up" },
    { id: "loyal", label: "Loyal", count: 712, tone: "info", r: 4, f: 4, m: 4, desc: "Consistent across the season", trend: "flat" },
    { id: "returning", label: "Returning", count: 348, tone: "info", r: 4, f: 2, m: 3, desc: "Back after a gap — re-engaging", trend: "up" },
    { id: "atrisk", label: "At-risk", count: 524, tone: "warning", r: 2, f: 4, m: 4, desc: "Were frequent, now slowing", trend: "down" },
    { id: "lapsed", label: "Lapsed", count: 671, tone: "danger", r: 1, f: 2, m: 2, desc: "No game-day purchase in 4+ games", trend: "down" },
  ];

  // Conflict resolution — set per campaign group. Plus a worked example of a
  // single transaction evaluated against every eligible rule.
  const CONFLICT_GROUPS = [
    { id: "earn", label: "Core earn", mode: "stackable", desc: "Base rates always apply additively" },
    { id: "sports", label: "Sports promotions", mode: "best", desc: "Fan gets the single best multiplier" },
    { id: "behavioral", label: "Behavioral bonuses", mode: "stackable", desc: "Layer on top of earn + sports" },
    { id: "household", label: "Household & social", mode: "first", desc: "Highest-priority household rule wins" },
  ];

  const CONFLICT_SIM = {
    txn: { label: "Marcus — 2 draft beers", amount: 28.0, context: "Halftime · Bulls winning · rivalry game" },
    eligible: [
      { rule: "Food & beverage earn", group: "earn", award: "28 pts", basis: "$28 × 1 pt", fires: true },
      { rule: "Halftime purchase bonus", group: "sports", award: "+14 pts", basis: "1.5× window", fires: true },
      { rule: "Win bonus (Gold 2.5×)", group: "sports", award: "+42 pts", basis: "2.5× post-game", fires: true, winner: true },
      { rule: "Derby / rivalry game", group: "sports", award: "+28 pts", basis: "2× rivalry", fires: false },
      { rule: "Same-category repeat", group: "behavioral", award: "+28 pts", basis: "2nd beer 2×", fires: true },
    ],
    note: "Sports group is set to best-value — Win bonus (2.5×) beats rivalry (2×), so only Win fires within that group. Earn and behavioral stack on top.",
  };

  const LOYALTY_ACTIVE_PROGRAMS = [
    { id: "prog-fnb", name: "Season F&B loyalty", template: "season-fnb", status: "active", group: "F&B loyalty",
      desc: "1 pt / $1 · Gold 1.5× · streak bonus at 5 & 10 games", members: 2741, pointsIssued: 3120000, redemptions: 8420, cost: 62400, costCap: 80000,
      pointsToday: 48200, redemptionsToday: 312, costToday: 964 },
    { id: "prog-win", name: "Win bonus nights", template: "win-bonus", status: "active", group: "Game-day",
      desc: "2× F&B when the Bulls win · fires post-game automatically", members: 6842, pointsIssued: 188000, redemptions: 9420, cost: 14200, costCap: 25000,
      pointsToday: 28400, redemptionsToday: 1420, costToday: 1840 },
    { id: "prog-halftime", name: "Halftime bonus", template: "halftime", status: "active", group: "F&B loyalty",
      desc: "1.5× F&B in the halftime window · highest-volume period", members: 6842, pointsIssued: 118000, redemptions: 16240, cost: 11800, costCap: 22000,
      pointsToday: 18600, redemptionsToday: 1024, costToday: 860 },
    { id: "prog-lapsed", name: "Lapsed fan return", template: "lapsed-return", status: "active", group: "Re-engagement",
      desc: "3× on first purchase after 4 missed games · re-anchors the relationship", members: 462, pointsIssued: 44000, redemptions: 1240, cost: 4400, costCap: 12000,
      pointsToday: 3200, redemptionsToday: 84, costToday: 320 },
    { id: "prog-playoff", name: "Playoff multiplier", template: "playoff", status: "scheduled", group: "Game-day",
      desc: "3× F&B during playoff games · fires automatically on playoff-tagged games", members: 6842, pointsIssued: 0, redemptions: 0, cost: 0, costCap: 60000,
      pointsToday: 0, redemptionsToday: 0, costToday: 0 },
  ];

  const LOYALTY = {
    activeMembers: 2741, pointsIssued: 4820000, pointsRedeemed: 1240000, redeemRate: 26, avgBalance: 1312,
    liability: 358000,
    activePrograms: LOYALTY_ACTIVE_PROGRAMS, // outstanding points value in $
    dist: [
      { label: "Gold (5,000+ pts)", count: 312, pct: 11 },
      { label: "Silver (1,000+ pts)", count: 891, pct: 32 },
      { label: "Bronze (< 1,000 pts)", count: 1538, pct: 57 },
    ],
    groups: RULE_GROUPS,
    rules: LOYALTY_RULES,
    catalog: REDEEM_CATALOG,
    tiers: LOYALTY_TIERS,
    rfm: RFM_SEGMENTS,
    conflictGroups: CONFLICT_GROUPS,
    conflictSim: CONFLICT_SIM,
    // legacy shape kept for any other consumers
    earn: LOYALTY_RULES.filter((r) => r.group === "earn").slice(0, 4).map((r) => ({ rule: r.trigger, reward: r.action, scope: r.condition })),
    redeem: REDEEM_CATALOG.slice(0, 3).map((r) => ({ cost: r.cost + " pts", reward: r.reward })),
  };

  // ---- Promotions (lifecycle: draft → scheduled → active → paused → ended) ----
  // Each promotion carries eligibility, redemption limits (freq + budget +
  // inventory caps), a budget meter, and stand/segment redemption breakdowns.
  const PROMOS = [
    { id: "p-halftime", name: "Halftime Beer Deal", type: "Percentage off", typeGroup: "discount", offer: "20% off all draft beer", target: "Gold + 3+ games", status: "active", channel: "Terminal + SMS",
      redeemed: 628, uniqueFans: 581, eligible: 1847, rate: 34.0, freqCap: "1 / fan / game", budgetCap: 1500, budgetUsed: 1256, invCap: null, invLeft: null, window: "Tonight · Game 14 · halftime", gameTag: "live",
      stands: [["Stand 12", 41], ["Sec 110–120", 38], ["Club level", 29], ["Stand 7", 22]],
      segments: [["Gold STH", 42], ["Silver STH", 31], ["Non-STH regular", 24]] },
    { id: "p-spend50", name: "Spend $50, get $10 back", type: "Spend threshold reward", typeGroup: "spend", offer: "$10 credit next visit", target: "Single-visit spend ≥ $50", status: "active", channel: "Terminal",
      redeemed: 268, uniqueFans: 268, eligible: 920, rate: 29.1, freqCap: "1 / fan / game", budgetCap: 3500, budgetUsed: 2680, invCap: null, invLeft: null, window: "Tonight · Game 14", gameTag: "live",
      stands: [["Club level", 36], ["Sec 110–120", 28], ["Stand 12", 21]],
      segments: [["Gold STH", 38], ["High-value non-STH", 33], ["Silver STH", 19]] },
    { id: "p-nachos", name: "Lead by 15 — free nachos", type: "Game-state triggered", typeGroup: "sports", offer: "Free nachos · first 300", target: "All fans · Stand 3", status: "scheduled", channel: "Terminal",
      redeemed: 0, uniqueFans: 0, eligible: 6842, rate: null, freqCap: "1 / fan total", budgetCap: 2400, budgetUsed: 0, invCap: 300, invLeft: 300, window: "Fires if lead ≥ 15 at half", gameTag: "armed",
      stands: [], segments: [] },
    { id: "p-merchwin", name: "Bulls win — 20% merch", type: "Win celebration", typeGroup: "loyalty", offer: "20% off merchandise", target: "All recognized fans", status: "scheduled", channel: "Terminal + SMS",
      redeemed: 0, uniqueFans: 0, eligible: 6842, rate: null, freqCap: "1 / fan / game", budgetCap: 5000, budgetUsed: 0, invCap: null, invLeft: null, window: "On win trigger · post-game", gameTag: "armed",
      stands: [], segments: [] },
    { id: "p-milestone", name: "10th game — beer on us", type: "Streak continuation", typeGroup: "visit", offer: "Free draft beer", target: "Visit count = 10", status: "active", channel: "Terminal",
      redeemed: 112, uniqueFans: 112, eligible: 168, rate: 66.7, freqCap: "1 / fan total", budgetCap: 2000, budgetUsed: 1344, invCap: null, invLeft: null, window: "Ongoing", gameTag: null,
      stands: [["Sec 110–120", 52], ["Club level", 38]], segments: [["Gold STH", 71], ["Silver STH", 48]] },
    { id: "p-clearance", name: "Post-game pizza clearance", type: "Inventory clearance", typeGroup: "sports", offer: "50% off · Stand 4", target: "Fans in venue · post-buzzer", status: "paused", channel: "Terminal",
      redeemed: 47, uniqueFans: 47, eligible: 1200, rate: 3.9, freqCap: "No cap", budgetCap: 600, budgetUsed: 188, invCap: null, invLeft: null, window: "Final 20 min · Stand 4", gameTag: null,
      stands: [["Stand 4", 100]], segments: [["Non-STH regular", 54], ["Gold STH", 31]] },
    { id: "p-happyhour", name: "Stand 12 happy hour", type: "Happy hour", typeGroup: "time", offer: "15% off · 30 mins", target: "Stand 12 · 6:30–7:00", status: "ended", channel: "Terminal",
      redeemed: 391, uniqueFans: 363, eligible: 1420, rate: 27.5, freqCap: "No cap", budgetCap: 900, budgetUsed: 880, invCap: null, invLeft: null, window: "Ended 7:00 PM · Game 13", gameTag: null,
      stands: [["Stand 12", 100]], segments: [["Non-STH regular", 47], ["Silver STH", 32]] },
    { id: "p-missyou", name: "We miss you — $5 back", type: "Bonus for lapsed fans", typeGroup: "loyalty", offer: "$5 F&B credit", target: "Not seen in 3+ games", status: "draft", channel: "SMS",
      redeemed: 0, uniqueFans: 0, eligible: 462, rate: null, freqCap: "1 / fan / season", budgetCap: 2300, budgetUsed: 0, invCap: null, invLeft: null, window: "Not launched", gameTag: null,
      stands: [], segments: [] },
  ];

  // Promotion type taxonomy for the builder / playbook
  const PROMO_TYPES = [
    { id: "pct", label: "Percentage off", group: "Discount", sub: "20% off all draft beer", icon: "tag" },
    { id: "amt", label: "Fixed amount off", group: "Discount", sub: "$5 off any food", icon: "dollar" },
    { id: "free_fnb", label: "Free F&B item", group: "Product", sub: "Free hot dog with merch", icon: "gift" },
    { id: "free_merch", label: "Free merch item", group: "Product", sub: "Free scarf · first 200", icon: "gift" },
    { id: "spend_reward", label: "Spend threshold reward", group: "Spend", sub: "Spend $50, get $10 back", icon: "dollar" },
    { id: "spend_points", label: "Spend → bonus points", group: "Spend", sub: "Spend $40, earn 500 pts", icon: "trophy" },
    { id: "attendance", label: "Attendance reward", group: "Visit", sub: "Attend 3 games, earn reward", icon: "calendar" },
    { id: "playoff", label: "Playoff multiplier", group: "Visit", sub: "Playoff day → 3× points", icon: "zap" },
    { id: "double", label: "Double points event", group: "Loyalty", sub: "2× F&B this Saturday", icon: "bolt" },
    { id: "lapsed", label: "Lapsed-fan bonus", group: "Loyalty", sub: "Away 3 games → first buy 3×", icon: "refresh" },
    { id: "expiry", label: "Points expiry drive", group: "Loyalty", sub: "Redeem before points expire", icon: "clock" },
    { id: "gamestate", label: "Game-state triggered", group: "Sports", sub: "Lead ≥ 15 → free nachos", icon: "activity" },
    { id: "moment", label: "In-game moment", group: "Sports", sub: "Operator taps “Celebrate”", icon: "sparkle" },
    { id: "clearance", label: "Inventory clearance", group: "Sports", sub: "Post-buzzer 50% off", icon: "cart" },
    { id: "happyhour", label: "Happy hour", group: "Time & location", sub: "15% off · 6–7 PM", icon: "clock" },
    { id: "stand", label: "Stand-specific", group: "Time & location", sub: "Stand 7 only", icon: "pin" },
  ];

  // Historical redemption benchmarks for cost preview (per promotion type)
  const PROMO_BENCH = { discount: { avg: 34, low: 22, high: 48, n: 8 }, spend: { avg: 29, low: 18, high: 41, n: 6 }, loyalty: { avg: 31, low: 20, high: 45, n: 5 }, visit: { avg: 44, low: 30, high: 58, n: 4 }, sports: { avg: 26, low: 14, high: 40, n: 3 }, time: { avg: 28, low: 16, high: 42, n: 5 }, product: { avg: 38, low: 24, high: 52, n: 4 } };

  // Promotion comparison — beer discounts across last games
  const PROMO_COMPARE = [
    { game: "G9", offer: "15% off", audience: "All STHs", eligible: 2741, redeemed: 623, rate: 22.7, cost: 1247 },
    { game: "G10", offer: "15% off", audience: "Gold only", eligible: 1204, redeemed: 398, rate: 33.1, cost: 796 },
    { game: "G11", offer: "20% off", audience: "Gold only", eligible: 1204, redeemed: 512, rate: 42.5, cost: 1024 },
    { game: "G12", offer: "20% off", audience: "All STHs", eligible: 2741, redeemed: 831, rate: 30.3, cost: 1662 },
    { game: "G14", offer: "20% off", audience: "Gold + 3+ games", eligible: 1847, redeemed: 628, rate: 34.0, cost: 1256 },
  ];

  // ---- Campaigns ----
  // status: active | scheduled | complete | draft | paused
  // kind: onetime | triggered  ·  channel: SMS | Email | Terminal
  // Attribution carries a holdout control group for incremental-lift reporting.
  const CAMPAIGNS = [
    { id: "c-reengage", name: "Mid-season re-engagement", kind: "onetime", channel: "SMS", audience: "Gold STH · not seen last 3 games", when: "Before Game 13", status: "complete",
      sent: 183, delivered: 179, undelivered: 4, optOut: 2, attended: 41, attendedPct: 22.4, avgSpend: 36, offerCost: 915,
      control: { size: 28, attended: 5, attendedPct: 17.9, avgSpend: 31 }, lift: 4.5, incVisits: 8, costPerVisit: 12.5, roas: 3.1 },
    { id: "c-pregame", name: "Pre-game activation · Game 14", kind: "onetime", channel: "SMS", audience: "All Gold STH", when: "2h before Game 14", status: "complete",
      sent: 2741, delivered: 2698, undelivered: 43, optOut: 6, attended: 2614, attendedPct: 95.4, avgSpend: 41, offerCost: 0,
      control: { size: 280, attended: 261, attendedPct: 93.2, avgSpend: 39 }, lift: 2.2, incVisits: 58, costPerVisit: 0, roas: null },
    { id: "c-benefit", name: "Benefit reminder — unused", kind: "triggered", channel: "Terminal", audience: "Gold STH · 0 redemptions in 3 games", when: "Pre-game on game 4", status: "active",
      sent: 312, delivered: 305, undelivered: 7, optOut: 1, attended: 88, attendedPct: 28.2, avgSpend: 29, offerCost: 610,
      control: { size: 48, attended: 9, attendedPct: 18.8, avgSpend: 24 }, lift: 9.4, incVisits: 29, costPerVisit: 21.0, roas: 2.4 },
    { id: "c-renewal", name: "Renewal nudge — healthy signals", kind: "triggered", channel: "Email", audience: "STH · renewal < 60d · healthy F&B", when: "60d before renewal", status: "scheduled",
      sent: 259, delivered: 254, undelivered: 5, optOut: 0, attended: null, attendedPct: null, avgSpend: null, offerCost: 0,
      control: { size: 40, attended: null, attendedPct: null, avgSpend: null }, lift: null, incVisits: null, costPerVisit: null, roas: null },
    { id: "c-winreact", name: "Win reaction — merch drop", kind: "triggered", channel: "Terminal + SMS", audience: "All recognized fans in venue", when: "On win trigger", status: "draft",
      sent: null, delivered: null, undelivered: null, optOut: null, attended: null, attendedPct: null, avgSpend: null, offerCost: null,
      control: { size: null, attended: null, attendedPct: null, avgSpend: null }, lift: null, incVisits: null, costPerVisit: null, roas: null },
  ];

  // Triggered campaign library (auto-fire on a behavioral condition)
  const TRIGGERED = [
    { trigger: "F&B spend drop", cond: "Spend down 30%+ vs baseline, 2+ games", msg: "Something off recently? Here's $5 back on your next visit.", timing: "Within 24h of 2nd low game", channel: "SMS", live: true },
    { trigger: "Benefit unused", cond: "STH · 0 F&B redemptions after 3 games", msg: "Your Gold benefit covers 20% off all food — applies when you tap.", timing: "Pre-game on game 4", channel: "Terminal", live: true },
    { trigger: "F&B milestone", cond: "Fan's Nth F&B purchase this season", msg: "10 games in — you've earned 1,200 points. Redeem for a free beer.", timing: "Within 2h post-game", channel: "SMS", live: true },
    { trigger: "Attendance lapse", cond: "No game-day purchase in last 3 games", msg: "We miss you. Here's $10 off F&B on your next visit.", timing: "Day before next home game", channel: "SMS", live: true },
    { trigger: "Points expiry", cond: "Points expiring within 7 days", msg: "You have 800 points expiring soon — that's a free beer.", timing: "7 days before expiry", channel: "SMS", live: true },
    { trigger: "Tier upgrade", cond: "Fan crosses a tier threshold", msg: "You've just reached Gold tier. Here's what's now available.", timing: "Within 1h of qualifying txn", channel: "Terminal", live: true },
    { trigger: "Service recovery", cond: "Rating 1–2 at terminal, or spend ≪ baseline", msg: "Sorry things weren't great. Here's a credit toward your next visit.", timing: "Within 2h post-game", channel: "SMS", live: true },
    { trigger: "First visit", cond: "First recognized game-day purchase ever", msg: "Welcome — your loyalty is now tracked every time you tap.", timing: "Within 1h post-game", channel: "Terminal", live: false },
    { trigger: "Lapsed return", cond: "Returns after missing 4+ games", msg: "Good to see you back. Here's a bonus for coming back.", timing: "Within 2h post-game", channel: "SMS", live: true },
  ];

  // Campaign sequences (multi-step, branch logic)
  const SEQUENCES = [
    { id: "seq-lapsed", name: "Lapsed-fan re-engagement", status: "active", trigger: "No game-day F&B in last 3 home games", enrolled: 142, active: 38, converted: 61, handoff: 9,
      steps: [
        { day: "Day 1 · Pre-Game 4", msg: "We haven't seen you lately. Your Gold benefits are waiting — 20% off all food tonight.", branchYes: { action: "points", points: 300 }, branchNo: { action: "continue" }, conv: 34 },
        { day: "Day 2 · Pre-Game 5", msg: "Miss you. Here's $10 off F&B if you come back for the next game.", branchYes: { action: "points", points: 500 }, branchNo: { action: "human", team: "Ticket sales" }, conv: 27 },
        { day: "Handoff", msg: "Fan has missed 5 consecutive games. At-risk for non-renewal.", branchYes: null, branchNo: null, conv: 9, human: true },
      ] },
    { id: "seq-onboard", name: "New-fan onboarding", status: "active", trigger: "First recognized game-day purchase", enrolled: 308, active: 121, converted: 164, handoff: 0,
      steps: [
        { day: "Game 1", msg: "Welcome — your loyalty is tracked automatically every time you tap.", branchYes: { action: "continue" }, branchNo: { action: "continue" }, conv: 0 },
        { day: "Game 2", msg: "You've earned 240 points. Here's how to redeem at any stand.", branchYes: { action: "continue" }, branchNo: { action: "continue" }, conv: 0 },
        { day: "Game 3", msg: "You're a regular now — here's a bonus 500 points to keep going.", branchYes: { action: "points", points: 500 }, branchNo: { action: "end" }, conv: 164 },
      ] },
    { id: "seq-tier", name: "Tier-upgrade journey", status: "draft", trigger: "Silver · within $50 of Gold", enrolled: 0, active: 0, converted: 0, handoff: 0,
      steps: [
        { day: "Step 1", msg: "You're $50 of spend from Gold. Here's what unlocks.", branchYes: { action: "end" }, branchNo: { action: "continue" }, conv: 0 },
        { day: "Step 2", msg: "Halfway there — spend $25 tonight and you're Gold.", branchYes: { action: "end" }, branchNo: { action: "hold" }, conv: 0 },
      ] },
    { id: "seq-renewal", name: "Pre-renewal nurture", status: "scheduled", trigger: "90 days before renewal window · healthy signals", enrolled: 0, active: 0, converted: 0, handoff: 0,
      steps: [
        { day: "Day 90", msg: "Your season's been strong — 11 benefit uses so far. Renewal opens soon.", branchYes: { action: "continue" }, branchNo: { action: "continue" }, conv: 0 },
        { day: "Day 45", msg: "Lock in your seats — early renewal earns 2× points on the renewal.", branchYes: { action: "end" }, branchNo: { action: "continue" }, conv: 0 },
        { day: "Day 14", msg: "Last chance for the early-renewal bonus. Here's your usage recap.", branchYes: { action: "end" }, branchNo: { action: "human", team: "Ticket sales" }, conv: 0, human: true },
      ] },
  ];

  // Pre-built audience templates
  const AUDIENCE_TEMPLATES = [
    { id: "at-risk", name: "At-risk STHs", def: "Gold/Silver + F&B spend declining + renewal < 90d", size: 287, icon: "alert" },
    { id: "lapsed", name: "Lapsed fans", def: "Any tier + no game-day purchase in last 4 games", size: 671, icon: "refresh" },
    { id: "benefit-non", name: "Benefit non-users", def: "STH + 0 benefit redemptions this season", size: 194, icon: "gift" },
    { id: "high-value", name: "High-value fans", def: "Top 20% F&B spend + attended 8+ games", size: 486, icon: "trophy" },
    { id: "first-time", name: "First-time visitors", def: "First recognized game-day purchase this season", size: 1621, icon: "star" },
    { id: "expiring", name: "Points about to expire", def: "Any tier + points expiring within 14 days", size: 312, icon: "clock" },
    { id: "winback", name: "Win-back candidates", def: "Previously active + no purchase in last 6 games", size: 408, icon: "heart" },
    { id: "tier-up", name: "Tier-upgrade candidates", def: "Silver + within $50 of Gold threshold", size: 233, icon: "trendUp" },
  ];

  const SAVED_AUDIENCES = [
    { name: "Gold STH · halftime buyers", size: 1204, usedIn: 6, updated: "live" },
    { name: "Declining sentiment · 3 games", size: 178, usedIn: 3, updated: "live" },
    { name: "Households 2+ active", size: 940, usedIn: 4, updated: "live" },
  ];

  // Suppression & fatigue
  const FREQ_CAPS = [
    { label: "Max messages / fan / week", value: 2, unit: "" },
    { label: "Max messages / fan / game day", value: 1, unit: "" },
    { label: "Min hours between messages", value: 12, unit: "h" },
  ];
  const SUPPRESSION_RULES = [
    { cond: "Fan has opted out of SMS", action: "Never send — no exception", severity: "block" },
    { cond: "Fan has not opened last 5 messages", action: "Suppress from non-triggered campaigns", severity: "warn" },
    { cond: "Fan purchased within the last hour", action: "Suppress service-recovery message", severity: "warn" },
    { cond: "Fan is in an active sequence", action: "Suppress one-offs unless priority override", severity: "warn" },
  ];

  // ---- Sponsorship ----
  // Each entry is one sponsor activation report. catWord/sectionLabel feed the
  // comparison eyebrows; mark* drive the brand chip in the report header.
  const SPONSORS = [
    {
      sponsor: "Modelo", game: "Bulls vs. Heat · Game 14", gameShort: "Game 14", baselineShort: "Game 13",
      activation: "Branded concession stand (Sections 110–120)",
      category: "beer category", catWord: "beer", sectionLabel: "Sec 110–120",
      mark: "M", markBg: "#0a3d2a", markFg: "#f4d35e",
      redeemed: 847, attributedSpend: 14200, sections: [110, 112, 114, 116, 118, 120],
      profile: { avgGames: 11.2, sthShare: 68, avgSpend: 52.4 },
      baseline: { fans: 612, spend: 9800 },
      incremental: { fans: 235, spend: 4400, pct: 45 },
    },
    {
      sponsor: "Gatorade", game: "Bulls vs. Heat · Game 14", gameShort: "Game 14", baselineShort: "Game 13",
      activation: "Hydration zone giveaway (Sections 200–212)",
      category: "sports-drink category", catWord: "sports drinks", sectionLabel: "Sec 200–212",
      mark: "G", markBg: "#0a2e57", markFg: "#ff7a00",
      redeemed: 1034, attributedSpend: 9400, sections: [200, 202, 204, 206, 208, 210, 212],
      profile: { avgGames: 8.6, sthShare: 41, avgSpend: 38.2 },
      baseline: { fans: 720, spend: 6900 },
      incremental: { fans: 314, spend: 2500, pct: 36 },
    },
    {
      sponsor: "State Farm", game: "Bulls vs. Heat · Game 14", gameShort: "Game 14", baselineShort: "Game 13",
      activation: "Assist-of-the-game merch drop (Sections 100–108)",
      category: "merch category", catWord: "merch", sectionLabel: "Sec 100–108",
      mark: "S", markBg: "#8c1d1d", markFg: "#ffffff",
      redeemed: 506, attributedSpend: 22800, sections: [100, 102, 104, 106, 108],
      profile: { avgGames: 13.4, sthShare: 74, avgSpend: 61.5 },
      baseline: { fans: 388, spend: 16400 },
      incremental: { fans: 118, spend: 6400, pct: 39 },
    },
    {
      sponsor: "Chipotle", game: "Bulls vs. Heat · Game 14", gameShort: "Game 14", baselineShort: "Game 13",
      activation: "Free chips with entrée (Sections 300–320, upper bowl)",
      category: "food category", catWord: "food", sectionLabel: "Sec 300–320",
      mark: "C", markBg: "#451a12", markFg: "#e6b800",
      redeemed: 1612, attributedSpend: 18900, sections: [300, 304, 308, 312, 316, 320],
      profile: { avgGames: 6.2, sthShare: 28, avgSpend: 29.8 },
      baseline: { fans: 1190, spend: 13200 },
      incremental: { fans: 422, spend: 5700, pct: 43 },
    },
    {
      sponsor: "Nike", game: "Bulls vs. Heat · Game 14", gameShort: "Game 14", baselineShort: "Game 13",
      activation: "City Edition jersey launch pop-up (Atrium · all sections)",
      category: "merch category", catWord: "merch", sectionLabel: "Atrium",
      mark: "N", markBg: "#111111", markFg: "#ffffff",
      redeemed: 318, attributedSpend: 41500, sections: [],
      profile: { avgGames: 12.1, sthShare: 63, avgSpend: 88.4 },
      baseline: { fans: 205, spend: 24600 },
      incremental: { fans: 113, spend: 16900, pct: 69 },
    },
  ];
  const SPONSOR = SPONSORS[0]; // back-compat default

  // ---- Households / family units (keyed by primary holder fan id) ----
  // Scenario: a healthy STH family with one disengaged member who has never
  // scanned their linked seat — the PRD's key "partially at-risk" signal.
  const HOUSEHOLDS = {
    "TM-00482917": {
      id: "HH-2041", name: "The Delgado Family", account: "STA-114-8841",
      poolingMode: "pooled", // pooled | individual
      pooledPoints: 12410, redeemedSeason: 3000,
      combinedLtv: 8940, combinedSeasonSpend: 2114, renewalValue: 2400,
      seasonGames: 14, risk: "partial",
      members: [
        { name: "Marcus Delgado", fanId: "TM-00482917", role: "primary", seat: "Sec 114 · Row 8", attended: 14, points: 5320, lastGame: "G14", status: "engaged" },
        { name: "Elena Delgado", role: "full", seat: "Sec 114 · Row 9", attended: 12, points: 4180, lastGame: "G14", status: "engaged" },
        { name: "Diego Delgado", role: "earn", seat: "Sec 114 · Row 10", attended: 9, points: 2910, lastGame: "G13", status: "building" },
        { name: "Mateo Delgado", role: "view", seat: "Sec 114 · Row 11", attended: 0, points: 0, lastGame: "—", status: "at-risk" },
      ],
    },
    "TM-00901556": {
      id: "HH-2088", name: "The Yoon Family", account: "STA-104-5520",
      poolingMode: "pooled", pooledPoints: 14530, redeemedSeason: 2200,
      combinedLtv: 11200, combinedSeasonSpend: 2640, renewalValue: 3600,
      seasonGames: 15, risk: "none",
      members: [
        { name: "Grace Yoon", fanId: "TM-00901556", role: "primary", seat: "Sec 104 · Row 4", attended: 15, points: 6400, lastGame: "G14", status: "engaged" },
        { name: "Daniel Yoon", role: "full", seat: "Sec 104 · Row 5", attended: 13, points: 4920, lastGame: "G14", status: "engaged" },
        { name: "Mia Yoon", role: "earn", seat: "Sec 104 · Row 6", attended: 11, points: 3210, lastGame: "G13", status: "building" },
      ],
    },
    "TM-00640122": {
      id: "HH-2103", name: "The Okafor Family", account: "STA-116-6014",
      poolingMode: "pooled", pooledPoints: 8580, redeemedSeason: 1500,
      combinedLtv: 6720, combinedSeasonSpend: 1510, renewalValue: 1800,
      seasonGames: 13, risk: "none",
      members: [
        { name: "Tyrese Okafor", fanId: "TM-00640122", role: "primary", seat: "Sec 116 · Row 6", attended: 13, points: 5100, lastGame: "G14", status: "engaged" },
        { name: "Nia Okafor", role: "full", seat: "Sec 116 · Row 7", attended: 10, points: 3480, lastGame: "G14", status: "engaged" },
      ],
    },
    "TM-00772658": {
      id: "HH-2117", name: "The Pickett Household", account: "STA-110-7733",
      poolingMode: "pooled", pooledPoints: 7100, redeemedSeason: 1000,
      combinedLtv: 5400, combinedSeasonSpend: 1180, renewalValue: 1400,
      seasonGames: 11, risk: "partial",
      members: [
        { name: "Jerome Pickett", fanId: "TM-00772658", role: "primary", seat: "Sec 110 · Row 22", attended: 11, points: 4200, lastGame: "G14", status: "engaged" },
        { name: "Carla Pickett", role: "full", seat: "Sec 110 · Row 23", attended: 8, points: 2900, lastGame: "G12", status: "building" },
        { name: "Tariq Pickett", role: "view", seat: "Sec 110 · Row 24", attended: 0, points: 0, lastGame: "—", status: "at-risk" },
      ],
    },
  };

  // ---- Entitlements / CSV ingest ----
  const ENTITLE = {
    season: "Chicago Bulls 2025–26",
    uploaded: 3200, linked: 2741, linkedPct: 86, unlinked: 459, unlinkedPct: 14, pendingExcluded: 38,
    ingest: { ingested: 3153, skippedPending: 38, skippedInvalid: 12, entitlementsCreated: 2741 },
    tiers: [
      { code: "PLAT-CL", name: "Platinum · Club level", benefit: "25% off all F&B + merch", members: 312, type: "Flat discount" },
      { code: "GOLD-FL", name: "Gold · Full season", benefit: "20% off all F&B", members: 1486, type: "Flat discount" },
      { code: "GOLD-HF", name: "Gold · Half season", benefit: "15% off all F&B", members: 612, type: "Flat discount" },
      { code: "SLVR-FL", name: "Silver · Full season", benefit: "10% off concessions", members: 331, type: "Flat discount" },
    ],
    recent: [
      { game: "Game 14", redemptions: 847, value: 12430 },
      { game: "Game 13", redemptions: 831, value: 11980 },
      { game: "Game 12", redemptions: 794, value: 11340 },
      { game: "Game 11", redemptions: 768, value: 10920 },
    ],
    mapping: [
      { csv: "ACCT_ID", field: "membership_id", req: true, note: "Upsert key" },
      { csv: "EMAIL_ADDRESS", field: "email", req: true, note: "Lowercased on ingest" },
      { csv: "PLAN_CODE", field: "benefit_tier", req: true, note: "Maps to rule set" },
      { csv: "SEASON_YEAR", field: "valid_from", req: true, note: "Eligibility start" },
      { csv: "RENEWAL_DATE", field: "valid_until", req: true, note: "Self-expires offline" },
      { csv: "FIRST_NAME", field: "first_name", req: false, note: "Personalises message" },
      { csv: "PHONE_PRIMARY", field: "phone", req: false, note: "E.164 · SMS fallback" },
      { csv: "ADDR_LINE1", field: "— rejected —", req: false, note: "PII · never stored" },
    ],
  };

  // ---- Season-over-season ----
  const SEASON = {
    perCap: [
      { seg: "Gold STH", now: 38.4, prev: 34.2, delta: 4.2, dir: "up" },
      { seg: "Silver STH", now: 28.1, prev: 26.8, delta: 1.3, dir: "up" },
      { seg: "Single game", now: 22.3, prev: 23.1, delta: -0.8, dir: "down" },
    ],
    category: [
      { cat: "Beer", value: 14.2, pct: 37 },
      { cat: "Food", value: 11.8, pct: 31 },
      { cat: "Non-alcohol", value: 6.4, pct: 17 },
      { cat: "Merchandise", value: 6.0, pct: 16 },
    ],
  };

  // ---- Season schedule + per-game trend (Games 1–14) ----
  // Game 14 is live/today; 1–13 are final. Numbers track the live KPIs at G14.
  const GAMES = [
    { n: 1, opp: "Detroit Pistons", abbr: "DET", res: "W", date: "Oct 24", recognized: 5180, perCap: 33.10, gold: 88 },
    { n: 2, opp: "Indiana Pacers", abbr: "IND", res: "L", date: "Oct 29", recognized: 5360, perCap: 33.80, gold: 89 },
    { n: 3, opp: "Cleveland Cavaliers", abbr: "CLE", res: "W", date: "Nov 3", recognized: 5620, perCap: 34.40, gold: 90 },
    { n: 4, opp: "Boston Celtics", abbr: "BOS", res: "L", date: "Nov 8", recognized: 6240, perCap: 36.90, gold: 92 },
    { n: 5, opp: "Milwaukee Bucks", abbr: "MIL", res: "W", date: "Nov 14", recognized: 6410, perCap: 37.20, gold: 93 },
    { n: 6, opp: "Atlanta Hawks", abbr: "ATL", res: "W", date: "Nov 19", recognized: 5980, perCap: 35.10, gold: 91 },
    { n: 7, opp: "New York Knicks", abbr: "NYK", res: "L", date: "Nov 26", recognized: 6520, perCap: 37.80, gold: 93 },
    { n: 8, opp: "Toronto Raptors", abbr: "TOR", res: "W", date: "Dec 2", recognized: 5740, perCap: 34.60, gold: 90 },
    { n: 9, opp: "Philadelphia 76ers", abbr: "PHI", res: "L", date: "Dec 9", recognized: 6380, perCap: 36.40, gold: 92 },
    { n: 10, opp: "Brooklyn Nets", abbr: "BKN", res: "W", date: "Dec 16", recognized: 6090, perCap: 35.80, gold: 91 },
    { n: 11, opp: "Orlando Magic", abbr: "ORL", res: "W", date: "Dec 23", recognized: 5910, perCap: 35.20, gold: 90 },
    { n: 12, opp: "Charlotte Hornets", abbr: "CHA", res: "W", date: "Jan 4", recognized: 6280, perCap: 36.30, gold: 92 },
    { n: 13, opp: "Washington Wizards", abbr: "WAS", res: "L", date: "Jan 11", recognized: 6630, perCap: 36.30, gold: 94 },
    { n: 14, opp: "Miami Heat", abbr: "MIA", res: "live", date: "Jan 18", recognized: 6842, perCap: 38.40, gold: 95 },
  ];
  GAMES.forEach((g) => (g.fnb = Math.round((g.recognized * g.perCap) / 1000) * 1000));

  // season-to-date roll-up
  const seasonFnb = GAMES.reduce((s, g) => s + g.fnb, 0);
  const SEASON_SUMMARY = {
    gamesPlayed: 14,
    uniqueFans: 12847,
    totalFnb: seasonFnb,
    avgPerCap: +(GAMES.reduce((s, g) => s + g.perCap, 0) / GAMES.length).toFixed(2),
    recordW: GAMES.filter((g) => g.res === "W").length,
    recordL: GAMES.filter((g) => g.res === "L").length,
    sthLinked: 2741, sthLinkRate: 86,
    newFansSeason: 4106,
    benefitValue: 168400,
  };

  // snapshot for a single past/live game (scaled from the live G14 structure)
  function getGameSnapshot(n) {
    const g = GAMES.find((x) => x.n === n) || GAMES[GAMES.length - 1];
    const ratio = g.fnb / GAMES[GAMES.length - 1].fnb;
    const stands = GAMEDAY.stands.map((s) => ({ ...s, sales: Math.round(s.sales * ratio) }));
    const tiers = {
      gold: Math.round(GAMEDAY.tiers.gold * (g.recognized / GAMEDAY.tiers.gold / 2.6) * 2.6 * (g.recognized / 6842)),
      silver: Math.round(GAMEDAY.tiers.silver * (g.recognized / 6842)),
      bronze: Math.round(GAMEDAY.tiers.bronze * (g.recognized / 6842)),
    };
    tiers.gold = Math.round(2614 * (g.recognized / 6842));
    return { ...g, stands, tiers };
  }

  // ---- Venues, teams & seasons (season/team-scoped STH setup) ----
  const VENUES = [
    { id: "uc", name: "United Center", city: "Chicago, IL" },
  ];

  const TEAMS = [
    { id: "bulls", name: "Chicago Bulls", sport: "NBA", venue: "uc" },
    { id: "blackhawks", name: "Chicago Blackhawks", sport: "NHL", venue: "uc" },
  ];

  const TEAM_SEASONS = {
    bulls: [
      {
        id: "bulls-2026-27", label: "2026–27", status: "upcoming",
        start: "Oct 2026", end: "Apr 2027", games: 0,
        renewal: { opens: "Jun 1, 2027", closes: "Jul 31, 2027" },
        tiers: [
          { code: "PLAT-CL", name: "Platinum · Club level", benefit: "25% off all F&B + merch", members: 0 },
          { code: "GOLD-FL", name: "Gold · Full season", benefit: "20% off all F&B", members: 0 },
          { code: "GOLD-HF", name: "Gold · Half season", benefit: "15% off all F&B", members: 0 },
          { code: "SLVR-FL", name: "Silver · Full season", benefit: "10% off concessions", members: 0 },
        ],
        matchKey: "account", lastImport: null,
      },
      {
        id: "bulls-2025-26", label: "2025–26", status: "current",
        start: "Oct 21, 2025", end: "Apr 2026", games: 14,
        renewal: { opens: "Jun 1, 2026", closes: "Jul 31, 2026" },
        tiers: [
          { code: "PLAT-CL", name: "Platinum · Club level", benefit: "25% off all F&B + merch", members: 312 },
          { code: "GOLD-FL", name: "Gold · Full season", benefit: "20% off all F&B", members: 1486 },
          { code: "GOLD-HF", name: "Gold · Half season", benefit: "15% off all F&B", members: 612 },
          { code: "SLVR-FL", name: "Silver · Full season", benefit: "10% off concessions", members: 331 },
        ],
        matchKey: "account",
        lastImport: { date: "Sep 28, 2025", renewed: 2201, upgraded: 89, downgraded: 41, new: 233, lapsed: 187 },
      },
      {
        id: "bulls-2024-25", label: "2024–25", status: "past",
        start: "Oct 22, 2024", end: "Apr 2025", games: 41,
        renewal: { opens: "Jun 1, 2025", closes: "Jul 31, 2025" },
        tiers: [
          { code: "PLAT-CL", name: "Platinum · Club level", benefit: "25% off all F&B + merch", members: 298 },
          { code: "GOLD-FL", name: "Gold · Full season", benefit: "20% off all F&B", members: 1402 },
          { code: "GOLD-HF", name: "Gold · Half season", benefit: "15% off all F&B", members: 587 },
          { code: "SLVR-FL", name: "Silver · Full season", benefit: "10% off concessions", members: 356 },
        ],
        matchKey: "account",
        lastImport: { date: "Sep 30, 2024", renewed: 2088, upgraded: 62, downgraded: 35, new: 245, lapsed: 164 },
      },
    ],
    blackhawks: [
      {
        id: "hawks-2025-26", label: "2025–26", status: "current",
        start: "Oct 9, 2025", end: "Apr 2026", games: 41,
        renewal: { opens: "Mar 1, 2026", closes: "May 31, 2026" },
        tiers: [
          { code: "BH-PLAT", name: "Platinum · Club level", benefit: "20% off all F&B", members: 184 },
          { code: "BH-GOLD", name: "Gold · Full season", benefit: "15% off all F&B", members: 940 },
          { code: "BH-SLVR", name: "Silver · Full season", benefit: "10% off concessions", members: 402 },
        ],
        matchKey: "email",
        lastImport: { date: "Sep 15, 2025", renewed: 1210, upgraded: 34, downgraded: 22, new: 128, lapsed: 96 },
      },
    ],
  };

  window.NS = { FANS, GAMEDAY, STH, LOYALTY, PROMOS, PROMO_TYPES, PROMO_BENCH, PROMO_COMPARE, CAMPAIGNS, TRIGGERED, SEQUENCES, AUDIENCE_TEMPLATES, SAVED_AUDIENCES, FREQ_CAPS, SUPPRESSION_RULES, CAMPAIGNS_LEGACY: CAMPAIGNS, SPONSOR, SPONSORS, HOUSEHOLDS, ENTITLE, SEASON, GAMES, SEASON_SUMMARY, VENUES, TEAMS, TEAM_SEASONS, getGameSnapshot, avatarColor, initials, fmtMoney, fmtNum, enrichFan };

  function fmtMoney(n, dec) { return "$" + Number(n).toLocaleString(undefined, { minimumFractionDigits: dec ?? 0, maximumFractionDigits: dec ?? 0 }); }
  function fmtNum(n) { return Number(n).toLocaleString(); }

  // ---- Venue SKU catalog (for transaction + basket detail) ----
  const SKUS = {
    beer: [
      { name: "Goose Island IPA · 24oz", price: 14.5 }, { name: "Modelo draft · 24oz", price: 13.0 },
      { name: "Bud Light · 16oz", price: 11.0 }, { name: "Craft beer flight", price: 18.0 },
    ],
    food: [
      { name: "Loaded nachos", price: 13.5 }, { name: "Chicago-style dog", price: 8.5 },
      { name: "Brisket sandwich", price: 16.0 }, { name: "Chicken tenders & fries", price: 14.0 },
      { name: "Soft pretzel bites", price: 9.0 }, { name: "Cheeseburger", price: 13.0 },
    ],
    nonalc: [
      { name: "Fountain soda · 32oz", price: 7.5 }, { name: "Bottled water", price: 5.0 },
      { name: "Frozen lemonade", price: 8.0 }, { name: "Hot cocoa", price: 5.5 },
    ],
    merch: [
      { name: "Bulls fitted cap", price: 32.0 }, { name: "Player tee", price: 38.0 },
      { name: "Replica jersey", price: 120.0 }, { name: "Rally towel", price: 12.0 },
    ],
  };
  const CAT_LABEL = { beer: "Beer", food: "Food", nonalc: "Non-alcohol", merch: "Merch" };
  const STANDS = ["Stand 12 · Sec 114", "Stand 3 · Main concourse", "Stand 7 · Sec 212", "Stand 18 · Club level"];

  // deterministic PRNG so a fan's rich detail is stable across renders
  function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function mulberry(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  function enrichFan(fan) {
    const rnd = mulberry(hashStr(fan.id));
    const tierPct = fan.sth ? (/platinum/i.test(fan.sth) ? 0.25 : /half/i.test(fan.sth) ? 0.15 : 0.20) : 0;

    // spend by category — base ratios nudged by the fan's known top items
    let ratio = { beer: 0.37, food: 0.31, nonalc: 0.17, merch: 0.15 };
    const ti = (fan.topItems || []).join(" ").toLowerCase();
    if (/merch|cap|jersey|tee/.test(ti)) { ratio.merch += 0.12; ratio.food -= 0.06; ratio.nonalc -= 0.06; }
    if (/wine|margarita/.test(ti)) { ratio.beer += 0.06; }
    if (/soda|popcorn|pretzel/.test(ti)) { ratio.nonalc += 0.08; ratio.beer -= 0.08; }
    const rsum = ratio.beer + ratio.food + ratio.nonalc + ratio.merch;
    Object.keys(ratio).forEach((k) => (ratio[k] = ratio[k] / rsum));
    const spendByCategory = Object.keys(ratio).map((k) => ({ cat: k, label: CAT_LABEL[k], value: Math.round(fan.totalSeason * ratio[k]) }));

    // spend per attended game (ending at the most recent game number)
    const startGame = 14 - fan.seasonGames + 1;
    let raw = [];
    for (let i = 0; i < fan.seasonGames; i++) raw.push(0.7 + rnd() * 0.7);
    const rawSum = raw.reduce((s, x) => s + x, 0) || 1;
    const lastAmt = parseFloat((fan.lastVisit.match(/\$(\d+)/) || [0, fan.avgSeason])[1]);
    const spendByGame = raw.map((x, i) => ({ game: "G" + (startGame + i), v: Math.round((x / rawSum) * fan.totalSeason) }));
    if (spendByGame.length) spendByGame[spendByGame.length - 1].v = lastAmt;

    // top SKUs derived from category spend
    const topSKUs = [];
    spendByCategory.forEach((c) => {
      const list = SKUS[c.cat];
      const pick = list[Math.floor(rnd() * list.length)];
      const qty = Math.max(1, Math.round(c.value / pick.price));
      topSKUs.push({ name: pick.name, cat: c.cat, label: c.label, qty, total: Math.round(qty * pick.price) });
      if (c.value > pick.price * 4) {
        const p2 = list[(list.indexOf(pick) + 1) % list.length];
        const q2 = Math.max(1, Math.round((c.value * 0.4) / p2.price));
        topSKUs.push({ name: p2.name, cat: c.cat, label: c.label, qty: q2, total: Math.round(q2 * p2.price) });
      }
    });
    topSKUs.sort((a, b) => b.total - a.total);

    // recent transactions (most recent attended games, newest first)
    const recent = spendByGame.slice(-6).reverse();
    const transactions = recent.map((g, idx) => {
      const items = [];
      const beer = SKUS.beer[Math.floor(rnd() * SKUS.beer.length)];
      const food = SKUS.food[Math.floor(rnd() * SKUS.food.length)];
      if (ratio.beer > 0.2 && rnd() > 0.15) items.push({ name: beer.name, qty: 1 + Math.round(rnd()), price: beer.price });
      items.push({ name: food.name, qty: 1, price: food.price });
      if (rnd() > 0.5) { const n = SKUS.nonalc[Math.floor(rnd() * SKUS.nonalc.length)]; items.push({ name: n.name, qty: 1 + Math.round(rnd()), price: n.price }); }
      if (ratio.merch > 0.2 && rnd() > 0.7) { const m = SKUS.merch[Math.floor(rnd() * SKUS.merch.length)]; items.push({ name: m.name, qty: 1, price: m.price }); }
      const subtotal = items.reduce((s, it) => s + it.qty * it.price, 0);
      const benefit = +(subtotal * tierPct).toFixed(2);
      const total = +(subtotal - benefit).toFixed(2);
      const points = Math.round(total * 10);
      const gameNum = parseInt(g.game.slice(1), 10);
      const sentIdx = gameNum - 10;
      const sent = fan.sentiment[sentIdx];
      return { game: g.game, gameNum, date: gameDate(gameNum), stand: STANDS[Math.floor(rnd() * STANDS.length)], items, subtotal: +subtotal.toFixed(2), benefit, total, points, sent: sent ?? null };
    });

    // attendance split
    const homeShare = 0.72 + rnd() * 0.12;
    const attendance = {
      home: Math.round(fan.allGames * homeShare),
      away: Math.round(fan.allGames * (1 - homeShare) * 0.7),
      playoff: Math.round(fan.allGames * (1 - homeShare) * 0.3),
      streak: Math.min(fan.seasonGames, 1 + Math.floor(rnd() * 6)),
    };

    // bridged devices
    const devices = [{ type: "Physical card", brand: "Visa ••4417", since: fan.joined, primary: true }];
    if (fan.tier === "gold") devices.push({ type: fan.allGames > 30 ? "Apple Pay" : "Google Pay", brand: "Wallet token", since: "2024", primary: false });

    // campaigns received
    const campaigns = [
      { name: "Pre-game activation · Game 14", channel: "SMS", status: "delivered", responded: spendByGame.some((g) => g.game === "G14") },
      { name: "Benefit reminder", channel: "SMS", status: "delivered", responded: fan.benefitGames > fan.benefitOf * 0.5 },
    ];
    if (fan.flags.some((f) => /risk|declining/i.test(f))) campaigns.unshift({ name: "Mid-season re-engagement", channel: "SMS", status: "delivered", responded: false });

    // loyalty ledger
    const ledger = [
      { label: "Game 14 purchase", delta: Math.round(lastAmt * 10), type: "earn" },
      { label: "Merch bonus · 15×", delta: 300, type: "earn" },
      { label: "Redeemed $10 off", delta: -1000, type: "redeem" },
      { label: "5th-visit milestone", delta: 500, type: "bonus" },
    ];

    // derived intelligence
    const ltv = fan.totalAll;
    const churnRisk = fan.sentTrend === "down" ? (fan.flags.some((f) => /risk/i.test(f)) ? "High" : "Elevated") : fan.sentTrend === "flat" ? "Low" : "Minimal";
    const favoriteCat = [...spendByCategory].sort((a, b) => b.value - a.value)[0];
    const favoriteStand = transactions.length ? mode(transactions.map((t) => t.stand)) : STANDS[0];
    const nextBest = fan.sentTrend === "down" && fan.renewal ? "Priority outreach + recovery credit before renewal"
      : fan.benefitOf && fan.benefitGames / fan.benefitOf < 0.5 ? "Benefit-reminder SMS — usage is below tier average"
      : !fan.sth ? "Season-plan upsell — high per-cap for a non-member"
      : "Healthy — include in win-celebration promotions";

    return { tierPct, spendByCategory, spendByGame, topSKUs, transactions, attendance, devices, campaigns, ledger, ltv, churnRisk, favoriteCat, favoriteStand, nextBest };
  }

  function gameDate(n) { const d = new Date(2025, 9, 24); d.setDate(d.getDate() + n * 5); return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }); }
  function mode(arr) { const m = {}; let best = arr[0], bc = 0; arr.forEach((x) => { m[x] = (m[x] || 0) + 1; if (m[x] > bc) { bc = m[x]; best = x; } }); return best; }
})();
