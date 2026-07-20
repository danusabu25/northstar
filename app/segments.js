/* Northstar — audience segmentation model, live estimator, and AI search index.
   Attached to window.NSEG. Treats non-STH fans as first-class. */
(function () {
  // ---- Base population by membership (this season, recognized) ----
  // STH = platinum + gold_full + gold_half + silver_plan = 2,741
  // Non-STH recognized = 4,101  →  total 6,842
  const MEMBERSHIP = [
    { id: "platinum", label: "Platinum", sub: "Courtside / Club", base: 312, sth: true, tier: "gold" },
    { id: "gold_full", label: "Gold — Full season", sub: "Full-season plan", base: 1486, sth: true, tier: "gold" },
    { id: "gold_half", label: "Gold — Half season", sub: "Half-season plan", base: 612, sth: true, tier: "gold" },
    { id: "silver_plan", label: "Silver plan", sub: "Partial / flex plan", base: 331, sth: true, tier: "silver" },
    { id: "nonsth_regular", label: "Non-STH regular", sub: "Recognized · 3+ visits", base: 2480, sth: false, tier: "silver" },
    { id: "nonsth_occasional", label: "Non-STH occasional", sub: "New / 1–2 visits", base: 1621, sth: false, tier: "bronze" },
  ];
  const TOTAL = MEMBERSHIP.reduce((s, m) => s + m.base, 0); // 6,842

  // ---- Quick presets (one-tap audiences) ----
  const PRESETS = [
    { id: "all_recognized", label: "All recognized fans", memberships: MEMBERSHIP.map(m => m.id), conditions: [] },
    { id: "all_sth", label: "All season-ticket holders", memberships: ["platinum", "gold_full", "gold_half", "silver_plan"], conditions: [] },
    { id: "gold_sth", label: "Gold STH", memberships: ["platinum", "gold_full", "gold_half"], conditions: [] },
    { id: "at_risk", label: "At-risk STH", memberships: ["platinum", "gold_full", "gold_half", "silver_plan"], conditions: [{ dim: "sentiment", val: "declining" }, { dim: "recency_not_last", val: 3 }] },
    { id: "non_sth_high", label: "High-value non-STH", memberships: ["nonsth_regular"], conditions: [{ dim: "spend_min", val: 40 }] },
    { id: "lapsing", label: "Lapsing fans", memberships: MEMBERSHIP.map(m => m.id), conditions: [{ dim: "recency_not_last", val: 3 }] },
    { id: "new_fans", label: "New this season", memberships: ["nonsth_occasional"], conditions: [] },
    { id: "win_back_benefit", label: "STH not using benefit", memberships: ["platinum", "gold_full", "gold_half"], conditions: [{ dim: "benefit_unused", val: true }] },
  ];

  // ---- Condition dimensions ----
  const DIMENSIONS = [
    { dim: "visits_min", label: "Attended ≥ N games", kind: "slider", min: 1, max: 14, step: 1, unit: " games", def: 5 },
    { dim: "spend_min", label: "Avg spend / game ≥ $", kind: "slider", min: 0, max: 80, step: 5, unit: "", prefix: "$", def: 40 },
    { dim: "spend_max", label: "Avg spend / game ≤ $", kind: "slider", min: 5, max: 80, step: 5, unit: "", prefix: "$", def: 25 },
    { dim: "sentiment", label: "Sentiment", kind: "select", options: [["positive", "Positive"], ["neutral", "Neutral"], ["declining", "Declining"]], def: "declining" },
    { dim: "recency_not_last", label: "Not seen in last N games", kind: "slider", min: 1, max: 8, step: 1, unit: " games", def: 3 },
    { dim: "recency_last", label: "Seen within last N games", kind: "slider", min: 1, max: 8, step: 1, unit: " games", def: 2 },
    { dim: "benefit_unused", label: "Has not used benefit (STH)", kind: "bool", def: true },
    { dim: "benefit_used", label: "Has used benefit (STH)", kind: "bool", def: true },
    { dim: "points_min", label: "Loyalty balance ≥ N pts", kind: "slider", min: 0, max: 8000, step: 500, unit: " pts", def: 5000 },
    { dim: "section", label: "Seat section in range", kind: "select", options: [["110-120", "Sec 110–120"], ["100-105", "Club (100–105)"], ["200+", "Upper (200+)"]], def: "110-120" },
    { dim: "sms_reachable", label: "SMS-reachable (phone on file)", kind: "bool", def: true },
  ];
  const DIM_BY_ID = Object.fromEntries(DIMENSIONS.map(d => [d.dim, d]));

  // ---- Estimator: returns { count, sth, nonSth, tierMix, smsReachable, avgSpend } ----
  function estimate(audience) {
    const mems = audience.memberships && audience.memberships.length ? audience.memberships : MEMBERSHIP.map(m => m.id);
    const selected = MEMBERSHIP.filter(m => mems.includes(m.id));
    let sthBase = 0, nonSthBase = 0;
    const tier = { gold: 0, silver: 0, bronze: 0 };
    selected.forEach(m => {
      (m.sth ? (sthBase += m.base) : (nonSthBase += m.base));
      tier[m.tier] += m.base;
    });

    let f = 1;            // global keep-factor
    let sthOnly = 1;      // extra factor that only reduces non-STH (benefit conditions n/a)
    (audience.conditions || []).forEach(c => {
      const v = c.val;
      switch (c.dim) {
        case "visits_min": f *= clamp(1 - (v - 1) * 0.061, 0.08, 1); break;
        case "spend_min": f *= clamp(1 - v * 0.0092, 0.1, 1); break;
        case "spend_max": f *= clamp(v * 0.0125 + 0.1, 0.15, 1); break;
        case "sentiment": f *= v === "declining" ? 0.16 : v === "neutral" ? 0.31 : 0.53; break;
        case "recency_not_last": f *= clamp(0.5 - v * 0.05, 0.12, 0.6); break;
        case "recency_last": f *= clamp(0.42 + v * 0.06, 0.3, 0.85); break;
        case "benefit_unused": f *= 0.33; break;
        case "benefit_used": f *= 0.62; break;
        case "points_min": f *= clamp(1 - v / 9000, 0.12, 1); break;
        case "section": f *= v === "110-120" ? 0.34 : v === "100-105" ? 0.12 : 0.4; break;
        case "sms_reachable": f *= 0.9; break;
        default: break;
      }
    });

    const sth = Math.round(sthBase * f);
    const nonSth = Math.round(nonSthBase * f * sthOnly);
    const count = sth + nonSth;
    const tierTotal = tier.gold + tier.silver + tier.bronze || 1;
    const tierMix = {
      gold: Math.round(count * (tier.gold / tierTotal)),
      silver: Math.round(count * (tier.silver / tierTotal)),
      bronze: Math.round(count * (tier.bronze / tierTotal)),
    };
    const smsReachable = Math.round(count * 0.9);
    return { count, sth, nonSth, tierMix, smsReachable };
  }

  function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }

  // describe an audience in words
  function describe(audience) {
    const mems = audience.memberships || [];
    let who;
    const allIds = MEMBERSHIP.map(m => m.id);
    const sthIds = ["platinum", "gold_full", "gold_half", "silver_plan"];
    if (mems.length === 0 || mems.length === allIds.length) who = "All recognized fans";
    else if (mems.length === sthIds.length && sthIds.every(i => mems.includes(i))) who = "All season-ticket holders";
    else who = mems.map(id => MEMBERSHIP.find(m => m.id === id).label).join(" + ");
    const conds = (audience.conditions || []).map(c => condLabel(c));
    return who + (conds.length ? " · " + conds.join(" · ") : "");
  }
  function condLabel(c) {
    const d = DIM_BY_ID[c.dim];
    if (!d) return c.dim;
    if (d.kind === "bool") return d.label.replace(" (STH)", "");
    if (d.kind === "select") { const o = d.options.find(o => o[0] === c.val); return d.label + " " + (o ? o[1] : c.val); }
    return d.label.replace("N", c.val).replace("$", "$" + c.val) + (d.unit && !d.label.includes("N") ? "" : "");
  }

  window.NSEG = { MEMBERSHIP, TOTAL, PRESETS, DIMENSIONS, DIM_BY_ID, estimate, describe, condLabel, clamp };
})();
