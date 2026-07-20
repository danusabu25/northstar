/* Northstar — Loyalty program wizard.
   Template-first flow: entry path → template selection → configure
   (business Q&As) → fan experience preview (mandatory) → cost
   projection → conflict check → launch. */

// ---- Template library -------------------------------------------------
const LP_TEMPLATES = [
  // F&B Loyalty
  { id:"season-fnb", group:"F&B loyalty", icon:"dollar", label:"Season F&B loyalty",
    badge:"Most used", desc:"Fans earn points on every F&B purchase all season.",
    earnDisplay:"1 pt / $1 · Gold 1.5× · streak bonus at 5 & 10 games",
    fan:"A fan buys a $14 beer. They earn {earnRate}. Gold members earn {mult} on every F&B purchase. Streaks reward fans who come back — {streakBonus} bonus pts at {streakAt} consecutive games. Points expire at {expiry}.",
    questions:["who","earnRate","mult","streakAt","streakBonus","expiry","budget"],
    defaults:{ who:"all", earnRate:1, mult:1.5, streakAt:5, streakBonus:500, expiry:"season", budget:false, budgetAmt:80000 },
    cost:{ base:4200000, rate:0.02 } },
  { id:"halftime", group:"F&B loyalty", icon:"clock", label:"Halftime bonus",
    desc:"F&B in the halftime window earns more — targets the highest-volume period.",
    earnDisplay:"1.5× during halftime window",
    fan:"Any fan who buys at a stand during halftime earns {mult} on their points. A $14 beer earns {mult} the usual rate. Outside halftime, standard earn rates apply.",
    questions:["who","mult","budget"],
    defaults:{ who:"all", mult:1.5, budget:true, budgetAmt:22000 },
    cost:{ base:118000, rate:0.10 } },
  { id:"repeat-category", group:"F&B loyalty", icon:"refresh", label:"Same-category repeat",
    desc:"Second purchase in the same category earns more — rewards the fans who buy twice.",
    earnDisplay:"2× on 2nd purchase in same category per game",
    fan:"A fan who buys a beer in Q1 and again in Q3 earns {mult} on the second beer. First purchase earns at the standard rate.",
    questions:["who","mult","budget"],
    defaults:{ who:"all", mult:2, budget:false, budgetAmt:18000 },
    cost:{ base:84000, rate:0.09 } },
  { id:"above-baseline", group:"F&B loyalty", icon:"trendUp", label:"Spend-above-baseline",
    badge:"Phase 2 — requires 1 season history",
    desc:"Bonus points on the amount above a fan's personal F&B average.",
    earnDisplay:"2× on amount above fan's avg · baseline from prior season",
    fan:"A fan whose average F&B spend is $22 spends $38 tonight. The $16 above their baseline earns at {mult}. The first $22 earns at the standard rate.",
    questions:["who","mult","budget"],
    defaults:{ who:"all", mult:2, budget:true, budgetAmt:30000 },
    cost:{ base:167000, rate:0.11 } },

  // STH Programs
  { id:"benefit-milestone", group:"STH programs", icon:"trophy", label:"Benefit utilization milestone",
    desc:"STHs who use their food benefit for the Nth time earn a milestone bonus.",
    earnDisplay:"1,000 bonus pts at 5th, 10th, 15th benefit redemption",
    fan:"A season-ticket holder who uses their food benefit for the {streakAt}th time this season earns {streakBonus} bonus points. Milestones stack at {streakAt}, 10, and 15 redemptions.",
    questions:["streakAt","streakBonus","budget"],
    defaults:{ streakAt:5, streakBonus:1000, budget:false, budgetAmt:20000 },
    cost:{ base:88000, rate:0.08 } },
  { id:"renewal-multiplier", group:"STH programs", icon:"calendar", label:"Early renewal multiplier",
    desc:"2× points on the renewal value when renewed within the early window.",
    earnDisplay:"2× pts on renewal value · early-window only",
    fan:"A season-ticket holder who renews within the early-window dates earns {mult} on the renewal value. Renewal completed after the window earns at the standard rate.",
    questions:["mult","expiry","budget"],
    defaults:{ mult:2, expiry:"season", budget:true, budgetAmt:40000 },
    cost:{ base:0, rate:0 } },
  { id:"new-stand", group:"STH programs", icon:"pin", label:"New-to-stand discovery",
    desc:"First purchase at any stand earns a one-time bonus — drives venue exploration.",
    earnDisplay:"500 bonus pts · one-time per new stand",
    fan:"A fan who makes their first-ever purchase at a stand they have not visited before earns a {streakBonus} point bonus. One-time per stand.",
    questions:["who","streakBonus","budget"],
    defaults:{ who:"all", streakBonus:500, budget:true, budgetAmt:15000 },
    cost:{ base:156000, rate:0.12 } },

  // Game-day
  { id:"win-bonus", group:"Game-day", icon:"trophy", badge:"Sports-specific",
    label:"Win bonus nights",
    desc:"Fans who purchased during the game earn more when the team wins.",
    earnDisplay:"2× F&B points · fires automatically post-game on a win",
    fan:"When the Bulls win, every fan who made an F&B purchase tonight earns {mult} on their points. The multiplier fires automatically post-game — no operator action required.",
    questions:["who","mult","budget"],
    defaults:{ who:"all", mult:2, budget:true, budgetAmt:25000 },
    cost:{ base:188000, rate:0.09 } },
  { id:"loss-consolation", group:"Game-day", icon:"heart", badge:"Sports-specific",
    label:"Loss consolation",
    desc:"A come-back credit for fans who attended a loss — reason to return.",
    earnDisplay:"500 pt credit toward next visit · fires post-game on a loss",
    fan:"When the Bulls lose, fans who made an F&B purchase earn a {streakBonus} point credit toward their next visit. Fires automatically post-game.",
    questions:["who","streakBonus","budget"],
    defaults:{ who:"all", streakBonus:500, budget:true, budgetAmt:8000 },
    cost:{ base:41800, rate:0.07 } },
  { id:"playoff", group:"Game-day", icon:"zap", badge:"Sports-specific",
    label:"Playoff multiplier",
    desc:"Every F&B purchase on a playoff game earns more — rewards attendance at what matters.",
    earnDisplay:"3× F&B during any playoff-tagged game",
    fan:"During any game tagged as a playoff game, every F&B purchase earns {mult}. The tag fires automatically from the schedule.",
    questions:["who","mult","budget"],
    defaults:{ who:"all", mult:3, budget:false, budgetAmt:60000 },
    cost:{ base:0, rate:0 } },
  { id:"season-opener", group:"Game-day", icon:"flag", badge:"Sports-specific",
    label:"Season opener & closer",
    desc:"Bonus points on the first and last home game of the season.",
    earnDisplay:"1,000 bonus pts on season opener and season finale",
    fan:"A fan who makes any F&B purchase on the first or last home game earns a {streakBonus} point bonus. Marks the emotional bookends of the season.",
    questions:["who","streakBonus","budget"],
    defaults:{ who:"all", streakBonus:1000, budget:false, budgetAmt:25000 },
    cost:{ base:90000, rate:0.09 } },
  { id:"overtime-walkoff", group:"Game-day", icon:"clock", badge:"Sports-specific",
    label:"Overtime / walkoff",
    desc:"Bonus points for fans still purchasing in the final period of a close game.",
    earnDisplay:"750 bonus pts · final period of a close game",
    fan:"A fan who buys in the final period when the margin is 8 points or fewer earns a {streakBonus} point bonus. Rewards the fans who stayed until the end.",
    questions:["who","streakBonus","budget"],
    defaults:{ who:"all", streakBonus:750, budget:true, budgetAmt:10000 },
    cost:{ base:50000, rate:0.08 } },
  { id:"rivalry-game", group:"Game-day", icon:"bolt", badge:"Sports-specific",
    label:"Rivalry game",
    desc:"Elevated earn rate for designated rival matchups.",
    earnDisplay:"2× F&B · operator-tagged rivalry games only",
    fan:"During a game against a designated rival, every F&B purchase earns {mult}. Operator tags which opponents are rivals.",
    questions:["who","mult","budget"],
    defaults:{ who:"all", mult:2, budget:true, budgetAmt:18000 },
    cost:{ base:64000, rate:0.08 } },

  // Re-engagement
  { id:"lapsed-return", group:"Re-engagement", icon:"refresh",
    label:"Lapsed fan return",
    desc:"First purchase after 4 missed games earns 3× — re-anchors the loyalty relationship.",
    earnDisplay:"3× on first purchase after 4 missed games",
    fan:"A fan who has not made a game-day F&B purchase in the last {streakAt} games returns and buys. That purchase earns {mult}. This is the most important moment to re-anchor loyalty.",
    questions:["who","streakAt","mult","budget"],
    defaults:{ who:"all", streakAt:4, mult:3, budget:true, budgetAmt:12000 },
    cost:{ base:44000, rate:0.08 } },
  { id:"streak-continuation", group:"Re-engagement", icon:"trendUp",
    label:"Streak continuation",
    desc:"Bonus points at 3, 5, and 10 consecutive game-day purchases — resets on a miss.",
    earnDisplay:"500 / 1,500 / 5,000 bonus pts at 3 / 5 / 10 consecutive games",
    fan:"Fans earn a {streakBonus} point bonus at {streakAt} consecutive game-day purchases. The streak resets if they miss a game day. Higher milestones award more.",
    questions:["who","streakAt","streakBonus","budget"],
    defaults:{ who:"all", streakAt:3, streakBonus:500, budget:false, budgetAmt:20000 },
    cost:{ base:312000, rate:0.07 } },

  { id:"attendance-comeback", group:"Re-engagement", icon:"heart",
    label:"Attendance comeback",
    desc:"Fan who missed 3+ games and returns earns a one-time bonus on the return itself.",
    earnDisplay:"1,000 bonus pts · fires on the return visit, not first purchase",
    fan:"A fan who missed {streakAt}+ games returns for tonight's game. They earn a {streakBonus} point bonus when they make their first purchase back — rewarding the return itself.",
    questions:["who","streakAt","streakBonus","budget"],
    defaults:{ who:"all", streakAt:3, streakBonus:1000, budget:true, budgetAmt:15000 },
    cost:{ base:60000, rate:0.08 } },

  // Household
  { id:"household-gameday", group:"Household", icon:"users",
    label:"Household game-day multiplier",
    desc:"When 2+ household members purchase on the same game day, all earn more.",
    earnDisplay:"1.5× all household F&B · 2+ members active same game day",
    fan:"When two or more members of a linked household purchase on the same game day, every household F&B purchase earns {mult} for that game.",
    questions:["mult","budget"],
    defaults:{ mult:1.5, budget:true, budgetAmt:14000 },
    cost:{ base:70000, rate:0.08 } },
  { id:"household-streak", group:"Household", icon:"trendUp",
    label:"Household streak",
    desc:"Bonus when the household attends together for 3+ consecutive game days.",
    earnDisplay:"2,500 bonus pts · household together 3+ consecutive games",
    fan:"When a linked household attends together for {streakAt} or more consecutive game days, all members earn a {streakBonus} point bonus. Resets on a missed game.",
    questions:["streakAt","streakBonus","budget"],
    defaults:{ streakAt:3, streakBonus:2500, budget:true, budgetAmt:9000 },
    cost:{ base:40000, rate:0.07 } },
];

const LP_GROUPS = [...new Set(LP_TEMPLATES.map((t) => t.group))];

// ---- Configure questions -----------------------------------------------
const LP_QUESTIONS = {
  who: { label:"Who does this apply to?", kind:"seg", options:[["all","All recognized fans"],["gold","Gold tier only"],["silver_up","Silver and above"],["sth","Season-ticket holders"]] },
  earnRate: { label:"Points per dollar (F&B)", kind:"slider", min:1, max:5, step:1, suffix:" pt/$1" },
  mult: { label:"Multiplier for qualifying transactions", kind:"slider", min:1.5, max:5, step:0.5, suffix:"×" },
  streakAt: { label:"After how many consecutive games?", kind:"slider", min:2, max:10, step:1, suffix:" games" },
  streakBonus: { label:"Bonus points awarded", kind:"slider", min:100, max:2000, step:100, suffix:" pts", width:72 },
  expiry: { label:"When do points expire?", kind:"seg", options:[["season","Season end"],["apr30","Apr 30"],["never","Never"]] },
  budget: { label:"Set a season budget cap?", kind:"toggle", sub:"Pause automatically when this value in discounts/points is awarded" },
  budgetAmt: { label:"Budget ceiling", kind:"slider", min:5000, max:100000, step:1000, prefix:"$", width:80 },
};

// Per-question icon + color identity — gives each config section a
// distinct visual anchor instead of a flat list of identical rows.
const LP_Q_META = {
  who:         { icon: "users",   color: "#2563eb", bg: "#eaf1fd" },
  earnRate:    { icon: "dollar",  color: "#15803d", bg: "#e7f6ec" },
  mult:        { icon: "bolt",    color: "#7c3aed", bg: "#f0eafd" },
  streakAt:    { icon: "trendUp", color: "#c2660a", bg: "#fcefdf" },
  streakBonus: { icon: "gift",    color: "#be185d", bg: "#fceaf1" },
  expiry:      { icon: "calendar",color: "#0e7490", bg: "#e2f4f8" },
  budget:      { icon: "shield",  color: "#b91c1c", bg: "#fbe9e8" },
};

function LPQuestion({ qid, val, onChange }) {
  const q = LP_QUESTIONS[qid];
  if (!q) return null;
  const meta = LP_Q_META[qid] || { icon: "sliders", color: "var(--ns-accent)", bg: "var(--rc-blue-100)" };
  return (
    <div className="ns-lpq">
      <div className="ns-lpq__head">
        <span className="ns-lpq__ico" style={{ background: meta.bg, color: meta.color }}><Icon name={meta.icon} size={15} /></span>
        <div className="ns-lpq__meta">
          <div className="ns-lpq__label">{q.label}</div>
          {q.sub && <div className="ns-lpq__sub">{q.sub}</div>}
        </div>
      </div>
      <div className="ns-lpq__body">
        {q.kind === "slider" && <SliderField min={q.min} max={q.max} step={q.step} value={val} onChange={onChange} prefix={q.prefix} suffix={q.suffix} width={q.width} />}
        {q.kind === "seg" && <div className="ns-seg" style={{ flexWrap:"wrap", height:"auto" }}>{q.options.map(([id,l])=><button key={id} className={val===id?"is-active":""} onClick={()=>onChange(id)}>{l}</button>)}</div>}
        {q.kind === "toggle" && <div className="ns-seg">{[["Yes",true],["No",false]].map(([l,v])=><button key={l} className={val===v?"is-active":""} onClick={()=>onChange(v)}>{l}</button>)}</div>}
      </div>
    </div>
  );
}

// Build plain-English narrative paragraphs (PRD Step 5 spec).
// Returns { terminal, scenes, narrative: Array<{sentences: string[]}> }
function buildFanNarrative(tmplId, cfg) {
  const r = cfg.earnRate || 1;
  const m = cfg.mult || 2;
  const sb = cfg.streakBonus || 500;
  const sa = cfg.streakAt || 5;
  const expLabel = { season:"June 30 at the end of the season", apr30:"April 30", never:"never" }[cfg.expiry] || "end of season";
  const beer = 14, beerPts = Math.round(beer * r), goldPts = Math.round(beer * r * m);

  if (tmplId === "season-fnb") return [
    { sentences: [`A fan buys a $${beer} beer at Stand 12.`, `They earn ${beerPts} ${beerPts===1?"point":"points"} (${r} point per $1 on F&B).`] },
    { sentences: [`If they are a Gold member, they earn ${goldPts} points (${m}\u00d7 multiplier).`] },
    { sentences: [`After buying at ${sa} consecutive home games, they earn a ${sb.toLocaleString()} point bonus.`, `After 10 consecutive games, they earn a 1,000 point bonus.`, `Their streak resets if they miss a game day.`] },
    { sentences: [`All points expire on ${expLabel}.`] },
  ];
  if (tmplId === "halftime") return [
    { sentences: [`A fan buys a $${beer} beer during the halftime window.`, `They earn ${goldPts} points \u2014 the standard ${beerPts} pts plus the ${m}\u00d7 halftime multiplier.`] },
    { sentences: [`The multiplier applies automatically to all F&B in the halftime window. Outside halftime, the standard rate applies.`] },
    { sentences: [`All points expire on ${expLabel}.`] },
  ];
  if (tmplId === "repeat-category") return [
    { sentences: [`A fan buys a beer in Q1. That purchase earns ${beerPts} points at the standard rate.`] },
    { sentences: [`The same fan buys a second beer in Q3. The second beer in the same category earns ${goldPts} points \u2014 the ${m}\u00d7 same-category multiplier.`] },
    { sentences: [`Only the second purchase earns the multiplier. The first purchase always earns the standard rate.`] },
  ];
  if (tmplId === "above-baseline") return [
    { sentences: [`A fan whose average F&B spend is $22 spends $38 tonight.`] },
    { sentences: [`The first $22 earns ${Math.round(22*r)} points at the standard rate (1 pt / $1).`, `The $16 above their average earns ${Math.round(16*r*m)} bonus points (${m}\u00d7 on the amount above baseline).`] },
    { sentences: [`This only works because Northstar holds each fan's transaction history. General loyalty platforms can't do this.`] },
  ];
  if (tmplId === "benefit-milestone") return [
    { sentences: [`A season-ticket holder uses their food benefit for the ${sa}th time this season.`, `They earn a ${sb.toLocaleString()} point milestone bonus automatically.`] },
    { sentences: [`Further milestones at 10 and 15 benefit uses award additional bonuses.`, `The milestone fires automatically \u2014 no operator action required.`] },
  ];
  if (tmplId === "renewal-multiplier") return [
    { sentences: [`A season-ticket holder renews within the early-window dates.`, `Their renewal value earns ${m}\u00d7 points instead of the standard rate.`] },
    { sentences: [`Renewal after the window earns at the standard rate.`, `The multiplier fires automatically on renewal confirmation.`] },
  ];
  if (tmplId === "new-stand") return [
    { sentences: [`A fan makes their first-ever purchase at a stand they have never visited before.`, `They earn a ${sb.toLocaleString()} point bonus \u2014 one-time per stand.`] },
    { sentences: [`Only possible because Northstar holds per-stand transaction history for every fan.`, `Each new stand earns the bonus once, driving venue exploration all season.`] },
  ];
  if (tmplId === "win-bonus") return [
    { sentences: [`The Bulls win tonight.`, `Every fan who made an F&B purchase during the game earns ${m}\u00d7 points \u2014 applied automatically post-game.`] },
    { sentences: [`A fan who spent $${beer} on a beer earns ${goldPts} points instead of the standard ${beerPts}.`] },
    { sentences: [`The multiplier fires automatically. No operator action required.`] },
  ];
  if (tmplId === "loss-consolation") return [
    { sentences: [`The Bulls lose tonight.`, `Every fan who made an F&B purchase during the game earns a ${sb.toLocaleString()} point credit toward their next visit.`] },
    { sentences: [`The credit is applied to the fan's next purchase automatically \u2014 no card to show, no code to enter.`] },
    { sentences: [`Fires automatically post-game on a loss.`] },
  ];
  if (tmplId === "playoff") return [
    { sentences: [`The game is tagged as a playoff game in the schedule.`, `Every F&B purchase tonight earns ${m}\u00d7 points automatically.`] },
    { sentences: [`A fan who spends $${beer} earns ${goldPts} points instead of the standard ${beerPts}.`] },
    { sentences: [`No operator action required \u2014 the rule fires automatically on any game tagged as playoff.`] },
  ];
  if (tmplId === "season-opener") return [
    { sentences: [`A fan makes any F&B purchase on the first home game of the season.`, `They earn a ${sb.toLocaleString()} point bonus on top of standard points.`] },
    { sentences: [`The same bonus fires on the last home game of the season.`, `Marks the emotional bookends of the fan's season.`] },
  ];
  if (tmplId === "overtime-walkoff") return [
    { sentences: [`The game goes to overtime with the Bulls trailing by fewer than 8 points.`, `A fan who buys at a stand in the final period earns a ${sb.toLocaleString()} point bonus.`] },
    { sentences: [`Rewards fans who stayed until the end.`, `Fires automatically when the game-state condition is met.`] },
  ];
  if (tmplId === "rivalry-game") return [
    { sentences: [`Tonight's game is against a designated rival.`, `Every F&B purchase earns ${m}\u00d7 points for the duration of the game.`] },
    { sentences: [`A fan who spends $${beer} earns ${goldPts} points instead of ${beerPts}.`] },
    { sentences: [`The operator tags which opponents are rivals. The multiplier fires automatically on those games.`] },
  ];
  if (tmplId === "lapsed-return") return [
    { sentences: [`A fan who has not made a game-day F&B purchase in the last ${sa} games returns tonight.`] },
    { sentences: [`Their first purchase back earns ${m}\u00d7 points \u2014 a $${beer} purchase earns ${goldPts} points instead of ${beerPts}.`] },
    { sentences: [`This is the most important moment to re-anchor the loyalty relationship.`, `The multiplier applies on the first purchase of the return visit only.`] },
  ];
  if (tmplId === "streak-continuation") return [
    { sentences: [`A fan makes a game-day F&B purchase for the ${sa}th consecutive home game.`, `They earn a ${sb.toLocaleString()} point streak bonus automatically.`] },
    { sentences: [`The streak resets if they miss a game day.`, `Higher milestones (10 games) award larger bonuses.`] },
  ];
  if (tmplId === "attendance-comeback") return [
    { sentences: [`A fan who missed ${sa}+ games returns for tonight's game.`, `When they make their first purchase, they earn a ${sb.toLocaleString()} point comeback bonus.`] },
    { sentences: [`This fires on the return itself \u2014 different from the lapsed-return rule, which requires a purchase threshold. This one rewards just showing up.`] },
  ];
  if (tmplId === "household-gameday") return [
    { sentences: [`Two members of the Delgado household both purchase F&B tonight.`] },
    { sentences: [`Every F&B purchase from either household member earns ${m}\u00d7 points for the game.`, `A $${beer} purchase earns ${goldPts} points instead of ${beerPts}.`] },
    { sentences: [`Fires when 2 or more linked household members make a purchase on the same game day.`] },
  ];
  if (tmplId === "household-streak") return [
    { sentences: [`The Delgado household has attended together for ${sa} consecutive home games.`, `All household members earn a ${sb.toLocaleString()} point streak bonus.`] },
    { sentences: [`The streak resets if the household misses a game.`, `Rewards the group attendance habit.`] },
  ];
  return [
    { sentences: [`A qualifying fan earns the reward on a $${beer} purchase.`] },
    { sentences: [`All points expire on ${expLabel}.`] },
  ];
}

// Build a structured fan experience preview.
// Returns { terminal: {msg1, msg2, amount, pts}, scenes: [{lines}] }
function buildFanPreview(tmplId, cfg) {
  const r = cfg.earnRate || 1;
  const m = cfg.mult || 2;
  const sb = cfg.streakBonus || 500;
  const sa = cfg.streakAt || 5;
  const expLabel = { season:"end of season (June 30)", apr30:"Apr 30", never:"never" }[cfg.expiry] || "end of season";
  const beerAmt = 14.00;
  const beerPts = Math.round(beerAmt * r);
  const goldPts = Math.round(beerAmt * r * m);
  const mult = m;

  let terminal = { msg1:"", msg2:"", amount: beerAmt, pts: beerPts };
  let scenes = [];

  if (tmplId === "season-fnb") {
    terminal = { msg1: `You've earned ${beerPts} points`, msg2: `1 pt per $1 · F&B purchase`, amount: beerAmt, pts: beerPts };
    scenes = [
      { lines: [ `Gold members earn ${goldPts} points on this purchase (${mult}× multiplier).` ] },
      { lines: [ `After ${sa} consecutive home games, a ${sb.toLocaleString()} point streak bonus fires.`, "Streak resets if they miss a game day." ] },
      { lines: [ `All points expire at ${expLabel}.` ] },
    ];
  } else if (tmplId === "halftime") {
    const discAmt = beerAmt; const pts = goldPts;
    terminal = { msg1: `Halftime bonus — ${mult}× points applied`, msg2: `You earned ${pts} points on this purchase`, amount: discAmt, pts };
    scenes = [
      { lines: [ "The multiplier applies automatically during the halftime window — no card to show.", `Outside halftime, the standard earn rate applies (${beerPts} points on this purchase).` ] },
    ];
  } else if (tmplId === "repeat-category") {
    terminal = { msg1: `Same-category bonus — ${mult}× applied`, msg2: `2nd beer tonight · you earned ${goldPts} points`, amount: beerAmt, pts: goldPts };
    scenes = [
      { lines: [ `First beer: ${beerPts} points. Second beer in the same game: ${goldPts} points.`, "Only the second purchase earns the multiplier." ] },
    ];
  } else if (tmplId === "above-baseline") {
    const baseline = 22, spend = 38, above = spend - baseline;
    const basePts = Math.round(baseline * r), abovePts = Math.round(above * r * mult);
    terminal = { msg1: `Spend-above-baseline bonus applied`, msg2: `You earned ${basePts + abovePts} points · $${above} above your average`, amount: spend, pts: basePts + abovePts };
    scenes = [
      { lines: [ `Fan average: $${baseline}/game. Tonight's spend: $${spend}.`, `First $${baseline} earns ${basePts} pts (1×). $${above} above baseline earns ${abovePts} pts (${mult}×).` ] },
    ];
  } else if (tmplId === "benefit-milestone") {
    terminal = { msg1: `Milestone reached — ${sb.toLocaleString()} bonus points awarded`, msg2: `${sa}th benefit redemption this season`, amount: beerAmt, pts: sb };
    scenes = [
      { lines: [ "Further milestones at 10 and 15 benefit uses award additional bonuses.", "The milestone fires automatically." ] },
    ];
  } else if (tmplId === "renewal-multiplier") {
    terminal = { msg1: `Early renewal bonus — ${mult}× points applied`, msg2: `Renewal value × ${mult}× earn rate`, amount: 0, pts: 0 };
    scenes = [
      { lines: [ `Season-ticket holder renews in the early window. Renewal earns ${mult}× points on the full renewal value.`, "Renewal after the window earns at the standard rate." ] },
    ];
  } else if (tmplId === "new-stand") {
    terminal = { msg1: `New stand discovered — ${sb.toLocaleString()} bonus points`, msg2: `First-ever purchase at this stand`, amount: beerAmt, pts: sb };
    scenes = [
      { lines: [ "One-time per stand. Each new stand earns the bonus once.", "Only possible because Northstar holds each fan's transaction history by stand." ] },
    ];
  } else if (tmplId === "win-bonus") {
    terminal = { msg1: `Bulls win — ${mult}× points applied`, msg2: `You earned ${goldPts} points on this purchase`, amount: beerAmt, pts: goldPts };
    scenes = [
      { lines: [ "The multiplier fires automatically post-game — no operator action required.", `If the Bulls lose, standard rate applies (${beerPts} points on this purchase).` ] },
    ];
  } else if (tmplId === "loss-consolation") {
    terminal = { msg1: `${sb.toLocaleString()} point credit added to your account`, msg2: `Come back next game · credit applied at next visit`, amount: beerAmt, pts: sb };
    scenes = [
      { lines: [ "Fires automatically post-game on a loss.", "The credit is applied to the fan's next visit automatically." ] },
    ];
  } else if (tmplId === "playoff") {
    terminal = { msg1: `Playoff game — ${mult}× points applied`, msg2: `You earned ${goldPts} points on this purchase`, amount: beerAmt, pts: goldPts };
    scenes = [
      { lines: [ "Game tagged as playoff automatically from the schedule.", `Regular season: ${beerPts} points on this purchase. Playoffs: ${goldPts} points.` ] },
    ];
  } else if (tmplId === "rivalry-game") {
    terminal = { msg1: `Rivalry game bonus — ${mult}× applied`, msg2: `You earned ${goldPts} points on this purchase`, amount: beerAmt, pts: goldPts };
    scenes = [
      { lines: [ "Fires on games tagged as rivalry matchups by the operator.", `Standard game: ${beerPts} points. Rivalry game: ${goldPts} points.` ] },
    ];
  } else if (tmplId === "lapsed-return") {
    terminal = { msg1: `Welcome back — ${mult}× return bonus applied`, msg2: `You earned ${goldPts} points on your first purchase back`, amount: beerAmt, pts: goldPts };
    scenes = [
      { lines: [ `Fan returns after missing ${sa} games.`, "The multiplier applies on the first purchase of the return visit only." ] },
    ];
  } else if (tmplId === "streak-continuation") {
    terminal = { msg1: `${sa}-game streak — ${sb.toLocaleString()} bonus points awarded`, msg2: `Attending ${sa} consecutive home games`, amount: beerAmt, pts: sb };
    scenes = [
      { lines: [ "Streak resets if they miss a game day.", "Higher milestones (10 games) award larger bonuses." ] },
    ];
  } else if (tmplId === "household-gameday") {
    terminal = { msg1: `Household bonus — ${mult}× applied`, msg2: `2 household members active tonight`, amount: beerAmt, pts: goldPts };
    scenes = [
      { lines: [ `Both household members earned ${goldPts} points on a $${beerAmt} purchase (${mult}×).`, "Fires when 2 or more linked household members purchase on the same game day." ] },
    ];
  } else {
    terminal = { msg1:"Loyalty reward applied", msg2:"Points earned on this purchase", amount: beerAmt, pts: beerPts };
    scenes = [{ lines: [`Points expire at ${expLabel}.`] }];
  }
  return { terminal, scenes };
}
// Legacy single-string version for the rail summary
// Legacy single-string version for the rail summary
function fanPreviewText(tmpl, cfg) {
  const scenes = buildFanPreview(tmpl.id, cfg);
  return scenes.map(s=>s.lines.join(' ')).join(' ');
}

// ---- Template library card ---------------------------------------------
function LPTemplateCard({ t, selected, onSelect }) {
  return (
    <button className={"ns-lpcard"+(selected?" is-on":"")} onClick={()=>onSelect(t.id)}>
      <div className="ns-lpcard__head">
        <span className={"ns-lpcard__ico"+(selected?" is-on":"")}>
          <Icon name={t.icon} size={16} />
        </span>
        <div style={{ flex:1, minWidth:0 }}>
          <div className="ns-lpcard__name">{t.label}{t.badge&&<span className="ns-pilltag ns-pilltag--sig" style={{ marginLeft:6, verticalAlign:"middle" }}>{t.badge}</span>}</div>
          <div className="ns-lpcard__desc">{t.desc}</div>
          {t.earnDisplay && (
            <div style={{ marginTop:6, display:"inline-flex", alignItems:"center", gap:5, background:selected?"rgba(26,106,178,0.15)":"var(--rc-gray-100)", borderRadius:4, padding:"3px 8px", fontSize:10.5, fontWeight:600, color:selected?"var(--ns-accent)":"var(--color-text-secondary)", fontFamily:"var(--font-family-mono)" }}>
              <Icon name="dollar" size={11}/>{t.earnDisplay}
            </div>
          )}
        </div>
        {selected&&<span className="ns-lpcard__check"><Icon name="check" size={13} stroke={2.6}/></span>}
      </div>
    </button>
  );
}

function LoyaltyTemplateLibrary({ onSelect }) {
  const [grp, setGrp] = React.useState("F&B loyalty");
  const [hover, setHover] = React.useState(null);
  const shown = LP_TEMPLATES.filter((t)=>t.group===grp);
  return (
    <div>
      <div className="ns-seg" style={{ marginBottom:14, flexWrap:"wrap", height:"auto" }}>
        {LP_GROUPS.map((g)=><button key={g} className={grp===g?"is-active":""} onClick={()=>setGrp(g)}>{g}</button>)}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {shown.map((t)=>(
          <button key={t.id} className="ns-memchip" style={{ alignItems:"flex-start", width:"100%" }}
            onMouseEnter={()=>setHover(t.id)} onMouseLeave={()=>setHover(null)} onClick={()=>onSelect&&onSelect(t)}>
            <span style={{ width:30,height:30,borderRadius:7,background:"var(--rc-gray-100)",color:"var(--color-text-secondary)",display:"inline-flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><Icon name={t.icon} size={15}/></span>
            <span className="ns-memchip__meta">
              <span className="ns-memchip__label">{t.label}{t.badge&&<span className="ns-pilltag ns-pilltag--sig" style={{ marginLeft:6 }}>{t.badge}</span>}</span>
              <span className="ns-memchip__sub">{t.desc}</span>
            </span>
            <span style={{ marginLeft:"auto",color:"var(--rc-gray-400)" }}><Icon name="chevRight" size={14}/></span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---- Main wizard -------------------------------------------------------
function LoyaltyProgramWizard({ onClose, presetTemplate }) {
  const STEPS = ["Entry path","Choose template","Configure","Fan preview","Cost","Launch"];
  const [step, setStep] = React.useState(presetTemplate ? 2 : 0);
  const [maxR, setMaxR] = React.useState(presetTemplate ? 2 : 0);
  const [launched, setLaunched] = React.useState(null);
  const [path, setPath] = React.useState("quick");
  const [tmplId, setTmplId] = React.useState(presetTemplate || "season-fnb");
  const [previewSeen, setPreviewSeen] = React.useState(false);
  const [capChoice, setCapChoice] = React.useState("yes");

  const tmpl = LP_TEMPLATES.find((t)=>t.id===tmplId) || LP_TEMPLATES[0];
  const [cfg, setCfg] = React.useState(()=>{
    if (presetTemplate) {
      const t = LP_TEMPLATES.find((x)=>x.id===presetTemplate);
      return { ...LP_TEMPLATES[0].defaults, ...(t?t.defaults:{}) };
    }
    return { ...tmpl.defaults };
  });
  const setC = (k,v) => setCfg((p)=>({...p,[k]:v}));

  const go = (i) => { setStep(i); setMaxR((m)=>Math.max(m,i)); if(i===3) setPreviewSeen(true); };
  const next = () => go(Math.min(step+1, STEPS.length-1));

  // cost estimate
  const estFans = tmpl.id==="season-fnb" ? 2741 : tmpl.id==="lapsed-return" ? 462 : tmpl.group==="Household" ? 940 : 6842;
  const estPts  = Math.round(tmpl.cost.base * (cfg.mult||1) / 2);
  const estCost = Math.round(estPts * tmpl.cost.rate);
  const capAmt  = cfg.budget ? cfg.budgetAmt : null;

  // conflict check — simplified: flag if active program in same group
  const conflicts = window.NS.LOYALTY.activePrograms.filter((p)=>p.group===tmpl.group && p.status==="active");
  const hasConflict = conflicts.length > 0;
  const totalSteps = hasConflict ? STEPS.length : STEPS.length - 0; // same, conflict shown inline in launch step

  if (launched) {
    const icon = launched==="draft" ? "edit" : launched==="scheduled" ? "calendar" : "trophy";
    const title = launched==="draft" ? "Saved as draft" : launched==="scheduled" ? "Program scheduled" : "Program launched";
    const lines = launched==="draft"
      ? [`"${tmpl.label}" saved — not yet active.`, "A second person can review and schedule it from the template library."]
      : launched==="scheduled"
      ? [`"${tmpl.label}" will activate at the next eligible game.`, "Terminals sync within 5 minutes of the activation time."]
      : [`"${tmpl.label}" is live.`, `${window.NS.fmtNum(estFans)} fans are now eligible. First redemptions will appear in the dashboard within minutes.`];
    return (
      <NSModal title="Add program" sub="Template-first · fan-preview required · cost-capped" onClose={onClose}>
        <SuccessPanel icon={icon} title={title} lines={lines} primaryLabel="Back to loyalty" onClose={onClose} />
      </NSModal>
    );
  }

  let body;

  if (step === 0) {
    body = (
      <div className="ns-wiz" style={{ maxWidth:680 }}>
        <div className="ns-sectlabel">How do you want to get started?</div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {[
            ["quick","Quick start","Pick a pre-built template, set the values, launch. No rule logic to configure. Recommended for new operators.","zap","#2563eb","#eaf1fd"],
            ["customize","Customize a template","Start from a template and modify the earn rates, tiers, or expiry. For operators with specific requirements close to a standard template.","edit","#7c3aed","#f0eafd"],
            ["scratch","Build from scratch","Full rule builder — define every component manually. Phase 2 capability for advanced operators.","sliders","#0e7490","#e2f4f8"],
          ].map(([id,label,sub,icon,color,bg])=>(
            <button key={id} className={"ns-memchip"+(path===id?" is-on":"")} style={{ alignItems:"flex-start" }} onClick={()=>{setPath(id);if(id==="scratch"){onClose();window.nsNewLoyaltyRule&&window.nsNewLoyaltyRule();}}}>
              <span style={{ width:32,height:32,borderRadius:8,flexShrink:0,background:bg,color:color,display:"inline-flex",alignItems:"center",justifyContent:"center" }}><Icon name={icon} size={16}/></span>
              <span className="ns-memchip__meta"><span className="ns-memchip__label" style={{ fontSize:13 }}>{label}</span><span className="ns-memchip__sub" style={{ whiteSpace:"normal",lineHeight:1.4,marginTop:3 }}>{sub}</span></span>
            </button>
          ))}
        </div>
      </div>
    );
  } else if (step === 1) {
    body = (
      <div className="ns-wiz">
        <div className="ns-sectlabel">Template library</div>
        <div className="ns-seg" style={{ marginBottom:14, flexWrap:"wrap", height:"auto" }}>
          {LP_GROUPS.map((g)=>{const n=LP_TEMPLATES.filter((t)=>t.group===g).length; return <button key={g} className={tmpl.group===g?"is-active":""} onClick={()=>{const first=LP_TEMPLATES.find((t)=>t.group===g);if(first){setTmplId(first.id);setCfg({...first.defaults});}}}>{g} ({n})</button>;})}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {LP_TEMPLATES.filter((t)=>t.group===tmpl.group).map((t)=>(
            <LPTemplateCard key={t.id} t={t} selected={tmplId===t.id} onSelect={(id)=>{setTmplId(id);const tdef=LP_TEMPLATES.find((x)=>x.id===id);if(tdef) setCfg({...tdef.defaults});}} />
          ))}
        </div>
      </div>
    );
  } else if (step === 2) {
    const configQs = tmpl.questions.filter((q)=>!( q==="budget" && path==="quick" && !cfg.budget) );
    body = (
      <div className="ns-wiz"><div className="ns-wiz__grid">
        <div className="ns-wiz__main">
          <div className="ns-sectlabel">Configure "{tmpl.label}"</div>
          <div className="ns-muted" style={{ fontSize:11.5, marginBottom:16, lineHeight:1.5, maxWidth:"60ch" }}>These are business decisions — the rule logic and conflict mode are handled by the template. You're setting intent, not configuration.</div>
          {tmpl.questions.map((qid)=>(
            <React.Fragment key={qid}>
              <LPQuestion qid={qid} val={cfg[qid]} onChange={(v)=>setC(qid,v)} />
              {qid==="budget" && cfg.budget && <LPQuestion qid="budgetAmt" val={cfg.budgetAmt} onChange={(v)=>setC("budgetAmt",v)} />}
            </React.Fragment>
          ))}
        </div>
        <div className="ns-wiz__rail">
          <div className="ns-sectlabel">Template</div>
          <div className="ns-lpcard is-preview" style={{ marginBottom:14 }}>
            <div className="ns-lpcard__name">{tmpl.label}</div>
            <div className="ns-lpcard__desc" style={{ marginTop:4 }}>{tmpl.desc}</div>
          </div>
          <div className="ns-sectlabel">Fields set by template</div>
          <div className="ns-muted" style={{ fontSize:11, lineHeight:1.7 }}>Rule structure<br/>Trigger logic<br/>Conflict resolution mode<br/>Point calculation method</div>
          <div className="ns-callout ns-callout--info" style={{ marginTop:14 }}><Icon name="shield" size={14}/><span>White fields are yours to set. Gray fields are locked by the template and can be unlocked in advanced mode.</span></div>
        </div>
      </div></div>
    );
  } else if (step === 3) {
    const { terminal, scenes } = buildFanPreview(tmplId, cfg);
    const narrative = buildFanNarrative(tmplId, cfg);
    body = (
      <div className="ns-wiz" style={{ maxWidth:700 }}>
        <div className="ns-spread" style={{ marginBottom:18 }}>
          <div>
            <div className="ns-card__title" style={{ fontSize:15 }}>Fan experience preview</div>
            <div className="ns-muted" style={{ fontSize:11.5, marginTop:3 }}>A plain-English description of exactly what a qualifying fan will experience. This step cannot be skipped.</div>
          </div>
          <Badge tone="info">Required</Badge>
        </div>

        {/* PRD-spec plain-English narrative */}
        <div className="ns-fan-narrative">
          <div className="ns-fan-narrative__head">
            <Icon name="eye" size={13}/>
            <span>What fans will experience</span>
          </div>
          <div className="ns-fan-narrative__body">
            {narrative.map((para, i) => (
              <div key={i} className="ns-fan-narrative__para">
                {para.sentences.map((s, j) => (
                  <span key={j} className={j===0 ? "ns-fan-narrative__lead" : "ns-fan-narrative__sent"}>{s}</span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Terminal mock — secondary: what fans see at the register */}
        <div style={{ marginTop:16 }}>
          <div className="ns-fanscenes__eye" style={{ padding:"10px 14px", background:"var(--rc-gray-050)", borderRadius:"var(--radius-md) var(--radius-md) 0 0", borderBottom:"1px solid var(--color-border-default)", border:"1px solid var(--color-border-default)" }}>
            <Icon name="card" size={13}/><span>What fans see at the terminal</span>
          </div>
          <div style={{ border:"1px solid var(--color-border-default)", borderTop:0, borderRadius:"0 0 var(--radius-md) var(--radius-md)", overflow:"hidden" }}>
            <div className="ns-fanscene ns-fanscene--primary" style={{ borderBottom: scenes.length ? "1px solid rgba(255,255,255,0.1)" : 0 }}>
              <div style={{ fontSize:11,color:"rgba(255,255,255,0.5)",marginBottom:6 }}>Fan taps to pay</div>
              <div style={{ fontSize:15,fontWeight:600,color:"#fff",marginBottom:4 }}>{terminal.msg1}</div>
              <div style={{ fontSize:12.5,color:"rgba(255,255,255,0.8)",marginBottom:14 }}>{terminal.msg2}</div>
              <div style={{ display:"flex",gap:10 }}>
                <div style={{ flex:1,background:"var(--rc-blue-500)",borderRadius:6,padding:"8px 0",textAlign:"center",fontSize:12,fontWeight:600,color:"#fff" }}>Confirm</div>
                <div style={{ flex:1,background:"rgba(255,255,255,0.12)",borderRadius:6,padding:"8px 0",textAlign:"center",fontSize:12,color:"rgba(255,255,255,0.7)" }}>View balance</div>
              </div>
            </div>
          </div>
        </div>

        <div className="ns-callout ns-callout--info" style={{ marginTop:12 }}>
          <Icon name="check" size={15}/><span>If this surprises you, go back and adjust. Once launched, fans see exactly this at every terminal within 5 minutes.</span>
        </div>
        <div style={{ marginTop:16, display:"flex", flexDirection:"column", gap:8 }}>
          <div className="ns-sectlabel">Applies to</div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {[["users","Eligible fans",window.NS.fmtNum(estFans)],["dollar","Est. points / season",window.NS.fmtNum(estPts)],["trophy","Redemption value","~"+window.NS.fmtMoney(estCost)]].map(([ic,l,v])=>(
              <div key={l} style={{ background:"var(--rc-gray-050)",border:"1px solid var(--color-border-default)",borderRadius:6,padding:"10px 14px",display:"flex",alignItems:"center",gap:10 }}>
                <Icon name={ic} size={14} style={{ color:"var(--color-text-secondary)" }}/><span className="ns-muted" style={{ fontSize:11.5 }}>{l}</span><span className="ns-mono ns-strong" style={{ fontSize:12.5 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  } else if (step === 4) {
    const low = Math.round(estCost * 0.8), high = Math.round(estCost * 1.2);
    body = (
      <div className="ns-wiz" style={{ maxWidth:640 }}>
        <div className="ns-spread" style={{ marginBottom:14 }}>
          <div><div className="ns-card__title" style={{ fontSize:15 }}>Cost projection — this season</div><div className="ns-muted" style={{ fontSize:11.5, marginTop:2 }}>Based on the last 2 seasons at United Center</div></div>
        </div>
        <div style={{ padding:"12px 14px",background:"var(--rc-gray-050)",borderRadius:6,marginBottom:14 }}>
          <div className="ns-spread"><span style={{ fontSize:12 }}>Estimated eligible fans</span><span className="ns-mono ns-strong">{window.NS.fmtNum(estFans)}</span></div>
          <div className="ns-spread" style={{ marginTop:6 }}><span style={{ fontSize:12 }}>Estimated points awarded</span><span className="ns-mono ns-strong">{window.NS.fmtNum(estPts)}</span></div>
        </div>
        <div className="ns-costgrid">
          {[["Low estimate","80% of projection",window.NS.fmtMoney(low),"var(--color-text-secondary)"],["Expected","100% of projection",window.NS.fmtMoney(estCost),"var(--ns-accent)"],["High estimate","120% of projection",window.NS.fmtMoney(high),"var(--rc-amber-600)"]].map(([lbl,sub,val,col])=>(
            <div key={lbl} className="ns-costcard" style={{ borderColor:lbl==="Expected"?"var(--ns-accent)":"var(--color-border-default)" }}>
              <div className="ns-pmetric__label">{lbl}</div>
              <div className="ns-pmetric__value" style={{ fontSize:22,color:col }}>{val}</div>
              <div className="ns-pmetric__sub">{sub}</div>
            </div>
          ))}
        </div>
        <div className="ns-sectlabel" style={{ marginTop:18 }}>Season budget cap</div>
        <div className="ns-seg" style={{ marginBottom: capChoice==="yes"?12:0 }}>{[["yes","Yes — set a cap"],["no","No — launch without cap"]].map(([id,l])=><button key={id} className={capChoice===id?"is-active":""} onClick={()=>setCapChoice(id)}>{l}</button>)}</div>
        {capChoice==="yes" && <div className="ns-cond"><div className="ns-cond__body"><div className="ns-cond__label">Budget ceiling — program pauses when this is reached</div><SliderField min={5000} max={150000} step={1000} value={cfg.budgetAmt} onChange={(v)=>setC("budgetAmt",v)} prefix="$" width={84} /></div></div>}
        <div className="ns-muted" style={{ fontSize:10.5,marginTop:12,lineHeight:1.5 }}>For new venues with no history, this estimate uses league-level benchmarks. Actual cost depends on attendance, F&B volume, and redemption behavior.</div>
      </div>
    );
  } else {
    body = (
      <div className="ns-wiz"><div className="ns-wiz__grid">
        <div className="ns-wiz__main">
          {hasConflict && (
            <div style={{ marginBottom:18 }}>
              <div className="ns-sectlabel" style={{ color:"var(--rc-amber-600)" }}>Conflict detected</div>
              <div style={{ padding:"12px 14px",background:"var(--color-status-warning-bg)",border:"1px solid var(--rc-amber-300,#fcd34d)",borderRadius:6,marginBottom:12 }}>
                <div className="ns-strong" style={{ fontSize:12.5,marginBottom:4 }}>This program overlaps with "{conflicts[0].name}" on F&B purchases</div>
                <div className="ns-muted" style={{ fontSize:11.5 }}>When both apply on the same transaction, what should happen?</div>
              </div>
              {[["stackable","Stackable — fan earns from both programs (recommended)"],["best","Best value wins — fan earns whichever gives more points"],["priority","This program takes priority — {existing} does not apply when this fires"]].map(([id,l])=>(
                <button key={id} className={"ns-memchip"+(cfg._conflict===id?" is-on":"")} style={{ width:"100%",marginBottom:6 }} onClick={()=>setC("_conflict",id)}>
                  <span className="ns-memchip__check">{cfg._conflict===id&&<Icon name="check" size={11} stroke={3}/>}</span>
                  <span className="ns-memchip__meta"><span className="ns-memchip__label">{l.replace("{existing}",conflicts[0].name)}</span></span>
                </button>
              ))}
              <div className="ns-divider" style={{ margin:"14px 0" }}/>
            </div>
          )}
          <div className="ns-sectlabel">Review</div>
          {[["Program",tmpl.label],["Template group",tmpl.group],["Applies to",{all:"All recognized fans",gold:"Gold tier",silver_up:"Silver+",sth:"STH only"}[cfg.who]||"All fans"],["Earn / multiplier",`${cfg.earnRate||"—"} pt / $1 · ${cfg.mult||"—"}× multiplier`],["Budget cap",capChoice==="yes"?window.NS.fmtMoney(cfg.budgetAmt):"None — no cap set"],["Expiry",{season:"Season end",apr30:"Apr 30",never:"Never"}[cfg.expiry]||"Season end"]].map(([k,v])=>(
            <div key={k} className="ns-spread" style={{ padding:"10px 0",borderBottom:"1px solid var(--color-border-default)",alignItems:"flex-start" }}>
              <span className="ns-muted" style={{ fontSize:11.5,minWidth:110 }}>{k}</span>
              <span style={{ fontSize:12.5,color:"var(--rc-gray-900)",textAlign:"right",fontWeight:500 }}>{v}</span>
            </div>
          ))}
        </div>
        <div className="ns-wiz__rail">
          <div className="ns-sectlabel">Projected cost</div>
          <div className="ns-audnum" style={{ fontSize:30 }}>{window.NS.fmtMoney(estCost)}</div>
          <div className="ns-muted" style={{ fontSize:11.5,marginBottom:14 }}>est. redemption value this season · capped at {capChoice==="yes"?window.NS.fmtMoney(cfg.budgetAmt):"—"}</div>
          <div className="ns-sectlabel">Fan experience</div>
          <div style={{ background:"var(--ns-navy)",borderRadius:8,padding:"12px 14px",color:"#fff" }}>
            <div style={{ fontSize:10,color:"rgba(255,255,255,0.5)",marginBottom:5 }}>Fan taps to pay</div>
            <div style={{ fontSize:12.5,fontWeight:600,color:"#fff",marginBottom:3 }}>{buildFanPreview(tmplId,cfg).terminal.msg1}</div>
            <div style={{ fontSize:11,color:"rgba(255,255,255,0.7)" }}>{buildFanPreview(tmplId,cfg).terminal.msg2}</div>
          </div>
        </div>
      </div></div>
    );
  }

  const canContinue = step===3 ? previewSeen : true;
  const foot = (
    <>
      <span className="ns-muted" style={{ fontSize:11.5 }}>Step {step+1} of {STEPS.length} · {tmpl.group}</span>
      <div style={{ display:"flex",gap:8 }}>
        {step>0 && step<STEPS.length && <button className="ns-btn ns-btn--secondary" onClick={()=>go(step-1)}>Back</button>}
        {step<STEPS.length-1
          ? <button className="ns-btn ns-btn--primary" onClick={next} disabled={!canContinue}>{step===3?"Confirm preview":"Continue"}<Icon name="chevRight" size={14}/></button>
          : <>
              <button className="ns-btn ns-btn--secondary" onClick={()=>setLaunched("draft")}>Save draft</button>
              <button className="ns-btn ns-btn--secondary" onClick={()=>setLaunched("scheduled")}>Schedule</button>
              <button className="ns-btn ns-btn--primary" onClick={()=>setLaunched("live")}><Icon name="trophy" size={14}/>Launch now</button>
            </>}
      </div>
    </>
  );

  return (
    <NSModal title="Add loyalty program" sub="Template-first · fan-preview required · cost-capped" onClose={onClose} foot={foot}>
      <Stepper steps={STEPS} index={step} maxReached={maxR} onJump={go} />
      {body}
    </NSModal>
  );
}

window.LoyaltyProgramWizard = LoyaltyProgramWizard;
window.LoyaltyTemplateLibrary = LoyaltyTemplateLibrary;
window.LP_TEMPLATES = LP_TEMPLATES;
