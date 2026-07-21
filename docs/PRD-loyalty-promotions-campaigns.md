# Northstar Fan CRM — Product Requirements Document
## Loyalty, Promotions & Campaigns

**Venue context (illustrative):** Chicago Bulls, United Center, 2025–26 season
**Status:** Living document — reflects the current build

---

## 1. Purpose & Vision

Northstar exists to turn every tap at the terminal, every ticket scan, and every message send into a measurable relationship with a fan — not a one-off transaction. The platform gives venue operations and marketing teams three connected tools to do that:

- **Loyalty** — the always-on rewards engine that recognizes fans automatically, every time they buy.
- **Promotions** — time-bound or trigger-bound offers layered on top of loyalty to drive a specific behavior in a specific moment.
- **Campaigns** — the outbound communication layer (SMS/email/push) that reaches fans with a message, optionally carrying a promotion, and proves whether it worked.

The guiding product principle across all three: **an operator should never have to guess what a fan will experience, what it will cost, or whether it worked.** Every builder in Northstar enforces a preview of the fan experience and a cost/impact projection before anything goes live, and every campaign is measured against a control group so results reflect true impact rather than raw activity.

---

## 2. Who Uses This

- **Venue GM / Marketing lead** — sets program strategy, approves budget caps, reviews performance.
- **CRM / Loyalty operator** — builds and launches loyalty programs, promotions, and campaigns day to day.
- **Ticket sales / Guest services** — receives fans "handed off" out of automated journeys when a human conversation is needed.

---

## 3. How the Three Pieces Relate

| | Always-on? | Time-bound? | Carries a message? | Typical goal |
|---|---|---|---|---|
| **Loyalty** | Yes | No (season-long) | No — silent, applies at the terminal | Reward ongoing behavior, build habit |
| **Promotions** | No | Yes (or trigger-bound) | No — applies at the terminal like loyalty | Drive a specific behavior in a specific window |
| **Campaigns** | Can be either | Either | Yes — SMS/email/push | Reach the fan directly, optionally attach a promotion |

A single purchase can be touched by all three at once: a fan gets a text (**campaign**) reminding them a **promotion** is live tonight, and when they tap to pay, their standing **loyalty** points still accrue underneath it. Northstar's conflict-resolution model (Section 6.5) governs exactly how those layers combine so a fan's discount and points never behave unpredictably.

---

## 4. Loyalty

### 4.1 What it is
Loyalty is a season-long points and rewards engine. Every recognized fan earns points automatically at the terminal — no app, no scan, no staff decision. Programs are built from a curated library of **templates**, not open-ended rule authoring: an operator picks a template that matches their business goal, answers a handful of plain questions, and launches. A more open-ended custom rule builder exists for advanced operators, but templates are the primary path.

### 4.2 The template library
Templates are grouped by business intent:

- **F&B loyalty** — the core season-long earn rate, a halftime multiplier, a same-game repeat-purchase bonus, and a "spend above your own baseline" bonus that only Northstar's fan-level history makes possible.
- **STH (season-ticket holder) programs** — reward using the season-ticket benefit itself (utilization milestones), reward renewing early, and reward trying a new stand for the first time.
- **Game-day / sports-specific** — win-night bonuses, loss "come-back" consolation credits, playoff multipliers, season opener/closer bonuses, walk-off/overtime bonuses, and rivalry-game multipliers — all fired automatically off the live game feed and schedule.
- **Re-engagement** — bonus for a fan's first purchase after a multi-game absence, tiered streak-continuation bonuses, and a bonus for simply returning regardless of purchase.
- **Household** — multipliers and bonuses when 2+ linked household members attend and buy together.

### 4.3 What an operator configures
Rather than technical rule logic, the operator sets **business intent**:
- Who qualifies (all fans / Gold only / Silver+ / season-ticket holders only)
- Points per dollar spent
- The multiplier for a qualifying moment
- The streak length that triggers a bonus
- The bonus size
- When points expire (season end / fixed date / never)
- An optional season budget cap — the program pauses itself automatically once reached

### 4.4 The build flow
Entry path → choose template → configure the levers above → **mandatory fan-experience preview** → cost projection (low/expected/high, based on the venue's last two seasons) → launch (now, scheduled, or saved as draft).

The preview step exists specifically so nothing surprises the business after launch: it renders the literal plain-English math a fan will see (*"A fan buys a $14 beer. They earn 14 points. If they're Gold, they earn 21 (1.5×)…"*) alongside a mock of the terminal screen itself. As the product frames it: *"If this surprises you, go back and adjust. Once launched, fans see exactly this at every terminal within five minutes."*

If a new program's template group overlaps an already-active program, the operator is forced to explicitly choose how they combine: **stackable** (fan earns both — recommended default), **best value wins**, or **this program takes priority**.

### 4.5 Tiers
Tiers are computed automatically from season behavior, not self-selected:
- **Gold** (312 fans) — spend ≥ $500 **and** attendance ≥ 10 games. 1.25× multiplier, full reward catalog.
- **Silver** (891 fans) — spend ≥ $250 **or** attendance ≥ 5 games. 1.1× multiplier, merch & seat-upgrade catalog.
- **Bronze** (1,538 fans) — default tier, no threshold. Base catalog.

### 4.6 Redemption catalog (rewards)
A "reward" is one line a fan can redeem points for at the terminal: a discount, a free item, or an experience (seat upgrade, lounge access, meet & greet). Each reward is configured with a points cost, a tier gate, an optional inventory cap, and an expiry. Example catalog today ranges from a $12 free-item reward at 1,000 points open to all tiers, up to a Gold-only signed jersey at 15,000 points that is already sold out, and a Gold + 10-games-attended meet-and-greet capped at 20 total redemptions.

### 4.7 How points from different rule groups combine
- **Core earn rules** — always stack additively.
- **Sports promotions** (win bonus, rivalry, playoff, etc.) — only the single best one in the group fires.
- **Behavioral bonuses** (streaks, milestones) — stack on top of earn + sports.
- **Household/social rules** — highest-priority rule wins, doesn't stack with itself.

Worked example: a $28 halftime beer purchase during a Bulls win in a rivalry game earns the base F&B rate, the halftime bonus, and the win bonus (the best of the sports-group options — rivalry doesn't also fire since win already won that comparison), plus the same-game repeat-purchase bonus — every layer that's allowed to stack, stacks; only the sports-group comparison picks a single winner.

### 4.8 What's measured
At the program level: members, points issued, points redeemed, redemption rate, dollar cost to date vs. the budget cap (with an 80%-of-cap warning), and same-day figures during a live game. Portfolio-wide: total points issued this season (4.82M), redeemed (1.24M, a 26% redemption rate), and **outstanding points liability** — the dollar value of points issued but not yet redeemed ($358,000), which the business effectively owes.

Fans are also auto-segmented by lifecycle (Champions, Loyal, Returning, At-risk, Lapsed) so the business always knows who's trending up versus who needs a re-engagement push — feeding directly into Campaigns.

---

## 5. Promotions

### 5.1 What it is
A promotion is a time-bound or trigger-bound offer — separate from the always-on loyalty engine — used to drive a specific behavior in a specific window: a discount, a free item, or a bonus. Promotions move through a lifecycle: draft → scheduled → active → paused → ended.

### 5.2 The type taxonomy (16 types, 7 groups)
- **Discount** — % off, or a fixed $ off.
- **Product** — free F&B item, free merch item.
- **Spend** — spend a threshold and get money back, or spend a threshold and earn bonus points.
- **Visit** — reward for attending N games, or a playoff-day multiplier.
- **Loyalty-linked** — a double-points event, a lapsed-fan comeback bonus, a "redeem before points expire" nudge.
- **Sports** — game-state triggered (e.g., "if the lead reaches 15+, free nachos"), an in-game moment an operator manually fires (a "Celebrate" button), or post-event inventory clearance.
- **Time & location** — a happy-hour window, or a single-stand-only offer.

Sports-type promotions read the live score/game-state feed (or a manual operator trigger) and fire themselves — no one has to be watching the clock.

### 5.3 Building an offer
Every offer specifies **what it discounts** (draft beer / food / all F&B / merch — "applies to") and **where it's honored** (all terminals / a section range / club level / a specific stand — "applies at"), plus the offer mechanic itself: % off, $ off, free item, bonus points, or BOGO.

### 5.4 Validity, limits, and budget
- **Validity window** — tonight, this homestand, on-trigger, or custom dates.
- **Per-fan redemption limit** — once per game, max 3 per season, once ever, or uncapped.
- **Budget cap** — a dollar ceiling that auto-pauses the promotion once hit.
- **Inventory cap** — a redemption-count ceiling ("first 300 fans") that closes the offer regardless of remaining budget.

### 5.5 How promotions interact with loyalty and each other
Each promotion picks a conflict-resolution mode — **stackable**, **first wins**, or **best value** — and separately toggles whether it can stack with a fan's standing entitlement (e.g., a season-ticket holder's permanent 20% F&B discount).

### 5.6 Mandatory previews before launch
Like loyalty, a promotion cannot be launched or scheduled until the operator has viewed two things:
- **Fan preview** — the literal message a targeted fan will see, plus (if caps are set) exactly when the offer will stop.
- **Cost preview** — eligible-fan count, then Conservative / Expected / High redemption scenarios, each benchmarked against similar historical promotions at the same venue (e.g., "based on 8 similar discount promotions"), with a flag if the High scenario would breach budget.

Redemption-rate benchmarks currently on file, by category: Visit-type promotions redeem best (avg 44%), Sports-type worst (avg 26%) — useful context for setting realistic budget expectations by promotion type.

### 5.7 What's measured
Per promotion: redemptions, unique fans, eligible-fan count, redemption rate, budget used vs. cap, inventory remaining, and a breakdown of redemptions by both physical location (which stand/section) and fan segment (Gold STH, Silver STH, non-STH, high-value non-STH).

A running comparison of five recent beer-discount promotions shows the kind of insight this view is built to surface: narrowing the audience from "all STHs" to "Gold only," and raising the discount from 15% to 20%, both independently improved redemption rate — from 22.7% up to 42.5% at the best-performing combination.

---

## 6. Campaigns

### 6.1 What it is
A campaign is an outbound message — SMS, email, or push — tied to a real fan behavioral signal, optionally carrying an attached promotion. The product's own framing: *"Every campaign in Northstar is tied to a real fan profile and a behavioral signal. One-time, triggered, or multi-step sequences — each with control-group measurement, suppression, and a mandatory fan preview."*

### 6.2 Campaign types
- **One-time blast** — a single message, sent once, to the matching audience.
- **Multi-step journey** — a branching sequence of messages, waits, and human handoffs that automatically enrolls qualifying fans and advances each one individually based on how they respond.
- **Triggered campaign** — a single always-on message that fires the instant a specific behavioral condition is met (lighter-weight than a full journey).

### 6.3 Objectives drive most of the setup
Picking an objective — Re-engagement, Pre-game activation, Benefit win-back, Renewal nudge, Convert non-STH, or Announcement — auto-selects a matching audience preset and pre-fills both the message copy and (for journeys) a starter step sequence, so most of a campaign's configuration is a byproduct of stating the goal, not hand-building it.

### 6.4 Channels
SMS ("reaches every fan with a number on file, not just app installs"), Email ("richer layout, lower urgency"), and Push ("instant and free, app installs only"). SMS shows a live character/segment count and always appends a compliance opt-out line automatically; every send — regardless of channel — respects carrier quiet hours and opt-out status.

### 6.5 Audiences
Audiences combine tier/membership selection with behavioral filters (e.g., "not seen in the last N games," minimum visit count) and are **dynamic** — a fan enters or exits the audience the moment their behavior crosses the threshold, with no manual rebuild required. A live estimated fan count (and SMS-reachable count) updates as filters change.

Ready-made, always-current audience templates include At-risk STHs (287), Lapsed fans (671), Benefit non-users (194), High-value fans (486), First-time visitors (1,621), Points about to expire (312), Win-back candidates (408), and Tier-upgrade candidates (233) — plus named, reusable **saved audiences** an operator has built and reused across multiple campaigns (e.g., "Gold STH · halftime buyers," used in 6 campaigns to date).

### 6.6 Attaching a promotion
A campaign can optionally carry a promotion — the operator either inherits the campaign's own audience/schedule for it, or defines a narrower one just for the offer — configured with the same offer, limits, and conflict-resolution controls as a standalone promotion.

### 6.7 Measurement discipline: the control group
Every campaign automatically holds back 10–15% of the eligible audience as an untouched control group. Reported "incremental lift" compares the treated group's attendance/response rate against that control group — explicitly to show "the true campaign effect, not raw attendance rate." Every campaign report includes sent/delivered/opt-outs, attendance rate, average spend, offer cost, the control group's own numbers side by side, incremental lift (in percentage points), incremental visits attributable to the campaign, cost per incremental visit, and ROAS.

Example from the current roster: a triggered "benefit reminder" campaign to Gold members with unused benefits produced the highest lift in the portfolio (+9.4 percentage points) — a small, well-targeted trigger campaign outperforming a much larger pre-game blast (+2.2pp) on a lift basis, even though the blast reached far more fans.

### 6.8 Suppression & fatigue governance
Before any message goes out, every send is checked against standing governance rules:
- A fan who has opted out of SMS is **never** sent to, no exceptions.
- A fan who hasn't opened the last 5 messages is suppressed from non-triggered sends (soft warning, overridable).
- A fan who purchased within the last hour is suppressed from a service-recovery message.
- A fan already inside an active journey is suppressed from a conflicting one-off send unless explicitly overridden.

Frequency caps back this up at the venue level (default: max 2 messages/fan/week, max 1/fan/game day, minimum 12 hours between sends to the same fan). Any override is logged with the operator's stated reason — this is framed as non-negotiable governance, not a suggestion.

### 6.9 Journeys (multi-step sequences)
A journey is built as a chain of steps — each a **Message**, a **Wait**, or a **Handoff** — with an optional Yes/No behavioral branch on any non-handoff step. Each branch outcome is a real, selectable action rather than free text: **end the journey**, **award points and end**, **continue to the next step**, **route to a named human team** (Ticket sales, Guest services, Retention), or **hold and keep monitoring**. This keeps every journey's outcome logic consistent and auditable rather than relying on descriptive text a person has to interpret later.

Four journeys exist today:
- **Lapsed-fan re-engagement** (active, 142 enrolled) — Day 1 message → if the fan returns, award 300 points and end; if not, a stronger Day 2 offer → if they return, award 500 points and end; if not, hand off to Ticket sales as an at-risk renewal. 61 converted, 9 currently handed off.
- **New-fan onboarding** (active, 308 enrolled) — three welcome/education messages across the first three games, ending with a 500-point bonus once the fan is established as a regular. 164 converted.
- **Tier-upgrade journey** (draft) — two nudges for a Silver fan sitting within $50 of Gold, ending the journey the moment they cross the threshold.
- **Pre-renewal nurture** (scheduled) — a three-touch renewal campaign starting 90 days out, escalating to a Ticket sales handoff at 14 days if the fan hasn't renewed.

### 6.10 Triggered library (always-on single-message rules)
Nine standing triggers cover the most common single-message moments without needing a full journey: spend-drop recovery, unused-benefit reminders, purchase-milestone nudges, attendance-lapse win-backs, points-expiry reminders, tier-upgrade congratulations, service-recovery apologies, first-visit welcomes, and lapsed-fan welcome-backs — each with its own firing condition, timing window, and channel.

### 6.11 What's measured
Portfolio level: messages sent this season (3,495), delivery rate (98.2%), average incremental lift (+4.5pp vs. control), and opt-out rate (0.6%, called out as within TCPA compliance expectations). Pipeline view of how many campaigns sit in Draft / Scheduled / Active / Complete. Per-campaign: the full lift/ROAS table above. Per-sequence: enrolled, active, converted, and handed-off counts, visualized as the actual step-by-step flow. Per-audience: fan count and how many live campaigns currently depend on it.

---

## 7. Cross-Cutting Product Principles

These four rules apply identically across Loyalty, Promotions, and Campaigns, and are the connective tissue of the product:

1. **No surprises at launch.** Every builder forces a plain-English fan-experience preview before anything can go live. If the operator is surprised by what they see, they're expected to go back and fix it — not find out from a fan complaint.
2. **No guessing on cost.** Every builder forces a cost/impact projection (low/expected/high) benchmarked against real venue history before launch, and every program that carries a budget shows live spend-to-cap tracking with an early warning at 80%.
3. **Real measurement, not vanity metrics.** Campaigns hold back a control group so lift is proven, not assumed; the same discipline shows up in Promotions' redemption-rate benchmarking and Loyalty's cost-vs-cap tracking.
4. **Layers combine predictably.** Every layer (loyalty rule, promotion, entitlement) declares how it interacts with the others — stackable, best-value, or priority-wins — so a fan's final discount or point total is never ambiguous, and a support agent or auditor could always reconstruct why a given result occurred.

---

## 8. Current Portfolio Snapshot (illustrative data)

| Area | Live/active | In draft or scheduled | Headline metric |
|---|---|---|---|
| Loyalty programs | 4 active (Season F&B, Win bonus, Halftime, Lapsed-fan) | 1 scheduled (Playoff multiplier) | $358K outstanding points liability; 26% redemption rate |
| Promotions | 5 active/ongoing, 1 paused | 2 scheduled (armed, game-triggered), 1 in draft | 22–67% redemption rate range across live promotions |
| Campaigns | 2 complete, 1 active (triggered) | 1 scheduled, 1 draft | +4.5pp average lift; 0.6% opt-out rate |
| Sequences (journeys) | 2 active (450 fans enrolled combined) | 2 (1 draft, 1 scheduled) | 225 conversions combined; 9 fans currently handed off to a human team |

---

## 9. Open Questions for Future Scope

- Should loyalty's "advanced custom rule builder" be exposed more broadly, or remain a Phase 2 / advanced-operator-only capability?
- Should the promotion simulator (testing a new promotion against everything currently live) become a required gate before launch, the way the fan/cost preview already is?
- As journeys grow past 4 named sequences, is a step-reordering (drag-and-drop) capability needed, or does append-and-delete remain sufficient?
- Should suppression-rule overrides surface to the Venue GM for review, given they're already logged with a reason?
