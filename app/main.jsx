/* Northstar — app root: nav state, screen routing, tweaks. */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#1a6ab2",
  "tierStyle": "solid",
  "density": "default",
  "chrome": "navy"
}/*EDITMODE-END*/;

function Placeholder({ title }) {
  return (
    <div>
      <PageHead eyebrow="In progress" title={title} desc="This screen is being built out next." />
      <div className="ns-drop">Coming up next.</div>
    </div>
  );
}

function NSApp() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [active, setActive] = React.useState(() => {
    try { return localStorage.getItem("ns-active") || "gameday"; } catch (e) { return "gameday"; }
  });
  const [fanId, setFanId] = React.useState(null);
  const [modal, setModal] = React.useState(null);          // 'campaign' | 'promo' | null
  const [seedAudience, setSeedAudience] = React.useState(null);
  const [rewardEdit, setRewardEdit] = React.useState(null);
  const [modalSeq, setModalSeq] = React.useState(0);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [scope, setScopeState] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem("ns-scope")) || { type: "live", n: 14 }; } catch (e) { return { type: "live", n: 14 }; }
  });
  const contentRef = React.useRef(null);
  const setScope = (s) => { setScopeState(s); try { localStorage.setItem("ns-scope", JSON.stringify(s)); } catch (e) {} if (active !== "gameday") { setActive("gameday"); setFanId(null); } if (contentRef.current) contentRef.current.scrollTop = 0; };

  React.useEffect(() => { try { localStorage.setItem("ns-active", active); } catch (e) {} }, [active]);

  // global keyboard: / or Cmd/Ctrl-K opens AI search
  React.useEffect(() => {
    const h = (e) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target.tagName || "")) || e.target.isContentEditable;
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing && !modal)) {
        e.preventDefault(); setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [modal]);

  const nav = (id) => { setActive(id); setFanId(null); if (contentRef.current) contentRef.current.scrollTop = 0; };
  window.nsOpenFan = (id) => { setActive("fans"); setFanId(id); if (contentRef.current) contentRef.current.scrollTop = 0; };
  window.nsGo = nav;
  window.nsNewCampaign = (aud) => { setSeedAudience(aud || null); setModal("campaign"); setModalSeq((n) => n + 1); setSearchOpen(false); };
  window.nsNewPromotion = (aud) => { setSeedAudience(aud || null); setModal("promo"); setModalSeq((n) => n + 1); setSearchOpen(false); };
  window.nsNewLoyaltyRule = () => { setModal("loyaltyRule"); setModalSeq((n) => n + 1); setSearchOpen(false); };
  window.nsNewLoyaltyProgram = () => { setModal("loyaltyProgram"); setModalSeq((n) => n + 1); setSearchOpen(false); };
  window.nsNewReward = (reward) => { setRewardEdit(reward || null); setModal("reward"); setModalSeq((n) => n + 1); setSearchOpen(false); };
  window.nsSearch = () => setSearchOpen(true);
  const closeModal = () => { setModal(null); setSeedAudience(null); setRewardEdit(null); };

  // apply accent + chrome as CSS vars on the shell
  const appStyle = {
    "--ns-accent": t.accent,
    "--color-action-primary-bg": t.accent,
    "--ns-navy": t.chrome === "blue" ? "#114b86" : t.chrome === "ink" ? "#1c2430" : "#0a2843",
  };

  const render = () => {
    if (active === "fans" && window.FansScreen) return <FansScreen fanId={fanId} setFanId={setFanId} />;
    if (active === "gameday" && window.GameDayScreen) return <GameDayScreen scope={scope} setScope={setScope} />;
    const map = {
      gameday: window.GameDayScreen, sth: window.STHScreen, sentiment: window.SentimentScreen,
      loyalty: window.LoyaltyScreen, promotions: window.PromotionsScreen, campaigns: window.CampaignsScreen,
      sponsorship: window.SponsorshipScreen, entitlements: window.EntitlementsScreen,
      seasons: window.SeasonsSetupScreen,
    };
    const Comp = map[active];
    return Comp ? <Comp /> : <Placeholder title="Screen" />;
  };

  return (
    <div className="ns-app" data-density={t.density} data-tier-style={t.tierStyle} style={appStyle}>
      <NSSidebar active={active} onNav={nav} />
      <div className="ns-main">
        <NSTopBar onSearch={() => setSearchOpen(true)} scope={scope} setScope={setScope} />
        <div className="ns-content" ref={contentRef}>
          <div className="ns-content__inner">{render()}</div>
        </div>
      </div>

      {modal === "campaign" && <CampaignWizard key={"camp" + modalSeq} onClose={closeModal} seedAudience={seedAudience} />}
      {modal === "promo" && <PromotionWizard key={"promo" + modalSeq} onClose={closeModal} seedAudience={seedAudience} />}
      {modal === "loyaltyRule" && <LoyaltyRuleBuilder key={"lr" + modalSeq} onClose={closeModal} />}
      {modal === "loyaltyProgram" && <LoyaltyProgramWizard key={"lp" + modalSeq} onClose={closeModal} />}
      {modal === "reward" && <RewardBuilder key={"rw" + modalSeq} onClose={closeModal} initial={rewardEdit} />}
      {searchOpen && <AISearch onClose={() => setSearchOpen(false)} />}

      <TweaksPanel>
        <TweakSection label="Brand" />
        <TweakColor label="Accent" value={t.accent}
          options={["#1a6ab2", "#0a2843", "#1f7a3a", "#ce1141"]}
          onChange={(v) => setTweak("accent", v)} />
        <TweakRadio label="Dark chrome" value={t.chrome}
          options={["navy", "blue", "ink"]}
          onChange={(v) => setTweak("chrome", v)} />
        <TweakSection label="Confidence tiers" />
        <TweakRadio label="Tier style" value={t.tierStyle}
          options={["solid", "outline"]}
          onChange={(v) => setTweak("tierStyle", v)} />
        <TweakSection label="Layout" />
        <TweakRadio label="Density" value={t.density}
          options={["compact", "default", "comfortable"]}
          onChange={(v) => setTweak("density", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("app")).render(<NSApp />);
