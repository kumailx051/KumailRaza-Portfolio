import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import emailjs from "emailjs-com";
import cards from "./sections";
import flutterBirdVideo from "../asset/flutterbird.mp4";
import resumePdf from "../asset/Kumail Raza CV.pdf";

const QUICKHELP_SLIDES = Object.entries(
  import.meta.glob("../asset/project 5/*.{png,jpg,jpeg,webp}", { eager: true, import: "default" })
)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))
  .map(([, src]) => src);

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function easeIO(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

/* ────── 3D Card Carousel ────── */
function Carousel({ cards, centerIdx, visible, onCardClick }) {
  return (
    <div className={`carousel-wrap${visible ? "" : " hide"}`}>
      <div className="carousel-scene">
        {cards.map((card, i) => {
          const off = i - centerIdx;
          const abs = Math.abs(off);
          const isCenter = abs < 0.3;
          // Cap rotation at 65° so far cards never flip backwards
          // Right cards (off>0) face left (negative rotY), left cards (off<0) face right (positive rotY)
          const rotY = off === 0 ? 0 : -Math.sign(off) * Math.min(abs * 30, 65);
          const tX = off * 310;
          const tZ = -abs * 90;
          // Lift center card up by 30px
          const tY = isCenter ? -30 : 0;
          return (
            <div
              key={card.id}
              className={`phone-card${isCenter ? " center" : ""}`}
              style={{
                "--cc": card.color,
                transform: `translateX(${tX}px) translateY(${tY}px) translateZ(${tZ}px) rotateY(${rotY}deg)`,
                opacity: clamp(1 - abs * 0.15, 0, 1),
                zIndex: 10 - Math.round(abs),
              }}
              onClick={() => onCardClick(i)}
            >
              <div className="phone-body">
                <div className="phone-screen" style={{ background: card.color + "22" }}>
                  <span className="phone-section-title" style={{ color: card.color }}>
                    {card.sectionTitle}
                  </span>
                  <p className="phone-preview-text">
                    {card.text.length > 90 ? card.text.slice(0, 90) + "…" : card.text}
                  </p>
                  <div className="phone-screen-bar" style={{ background: card.color }} />
                </div>
                <div className="phone-notch" />
                <span className="phone-id">{card.id}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ExperienceFullPage({ card, onExit }) {
  const wrapperRef = useRef(null);
  const itemRefs = useRef([]);
  const [visibleItems, setVisibleItems] = useState([]);

  useEffect(() => {
    const rootElement = wrapperRef.current;
    if (!rootElement) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = Number(entry.target.getAttribute("data-index"));
          setVisibleItems((prev) => (prev.includes(index) ? prev : [...prev, index]));
        });
      },
      {
        root: rootElement,
        threshold: 0.34
      }
    );

    itemRefs.current.forEach((element) => {
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [card.experiences]);

  return (
    <div className="fp-wrapper fp-wrapper-exp" ref={wrapperRef}>
      <div className="xp-ambient" aria-hidden="true">
        <span className="xp-rail rail-left" />
        <span className="xp-rail rail-right" />
        <span className="xp-wave wave-top" />
        <span className="xp-wave wave-bottom" />
        <span className="xp-node node-a" />
        <span className="xp-node node-b" />
        <span className="xp-node node-c" />
      </div>
      <div className="xp-snap">
        <section className="fp-screen fp-hero xp-hero-screen">
          <div className="fp-badge" style={{ borderColor: card.color + "44" }}>
            <span className="fp-badge-num" style={{ color: card.color }}>{card.id}</span>
            <span className="fp-badge-label">{card.label}</span>
          </div>
          <h3 className="fp-section-heading" style={{ color: card.color }}>{card.sectionTitle}</h3>
          <h2 className="fp-title">Experience Timeline</h2>
          <p className="fp-text">
            Scroll down and each role appears one by one with a focused transition.
          </p>
          <div className="fp-line" style={{ background: card.color }} />
          <div className="fp-scroll-hint">scroll to reveal each role</div>
        </section>

        {card.experiences.map((job, index) => (
          <section
            key={job.role + job.company}
            className={`xp-role-wrap ${visibleItems.includes(index) ? "show" : ""}`}
            data-index={index}
            ref={(node) => {
              itemRefs.current[index] = node;
            }}
          >
            <article className="xp-role-card" style={{ "--xp": card.color }}>
              <div className="xp-head">
                <div>
                  <h3>{job.role}</h3>
                  <p className="xp-location">{job.location}</p>
                </div>
                <div className="xp-meta">
                  <p className="xp-company">{job.company}</p>
                  <p className="xp-period">{job.period}</p>
                </div>
              </div>

              <ul className="xp-list">
                {job.bullets.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>

              <p className="xp-index">
                {String(index + 1).padStart(2, "0")} / {String(card.experiences.length).padStart(2, "0")}
              </p>
            </article>
          </section>
        ))}

        <section className="fp-screen xp-end">
          <h3 className="fp-sec-title" style={{ color: card.color }}>End of Experience</h3>
          <p className="fp-text">Scroll back up to revisit roles or exit and move to the next card.</p>
          <button className="fp-exit-btn" onClick={onExit} style={{ borderColor: card.color + "55", color: card.color }}>
            ← Back to Cards
          </button>
        </section>
      </div>
    </div>
  );
}

function EducationFullPage({ card, onExit }) {
  const wrapperRef = useRef(null);
  const itemRefs = useRef([]);
  const [visibleItems, setVisibleItems] = useState([]);

  useEffect(() => {
    const rootElement = wrapperRef.current;
    if (!rootElement) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = Number(entry.target.getAttribute("data-index"));
          setVisibleItems((prev) => (prev.includes(index) ? prev : [...prev, index]));
        });
      },
      {
        root: rootElement,
        threshold: 0.34
      }
    );

    itemRefs.current.forEach((element) => {
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [card.educationEntries]);

  return (
    <div className="fp-wrapper fp-wrapper-exp fp-wrapper-edu-flow" ref={wrapperRef}>
      <div className="edu-ambient" aria-hidden="true">
        <span className="edu-stars-layer layer-back" />
        <span className="edu-stars-layer layer-mid" />
        <span className="edu-stars-layer layer-front" />
        <span className="edu-planet planet-a" />
        <span className="edu-planet planet-b" />
        <span className="edu-planet planet-c" />
        <span className="edu-orbit orbit-a" />
        <span className="edu-orbit orbit-b" />
      </div>
      <div className="xp-snap">
        <section className="fp-screen fp-hero edu-hero-screen xp-hero-screen">
          <div className="fp-badge" style={{ borderColor: card.color + "44" }}>
            <span className="fp-badge-num" style={{ color: card.color }}>{card.id}</span>
            <span className="fp-badge-label">{card.label}</span>
          </div>
          <h3 className="fp-section-heading" style={{ color: card.color }}>{card.sectionTitle}</h3>
          <h2 className="fp-title">Academic Journey</h2>
          <p className="fp-text">Scroll down and each education stage appears one by one with the same transition style as experience.</p>
          <div className="fp-line" style={{ background: card.color }} />
          <div className="fp-scroll-hint">scroll to reveal each education stage</div>
        </section>

        {card.educationEntries.map((entry, index) => (
          <section
            key={entry.institute + entry.period}
            className={`xp-role-wrap edu-role-wrap ${visibleItems.includes(index) ? "show" : ""}`}
            data-index={index}
            ref={(node) => {
              itemRefs.current[index] = node;
            }}
          >
            <article
              className="xp-role-card edu-role-card from-bottom"
              style={{ "--xp": card.color }}
            >
              <div className="xp-head">
                <div>
                  <h3>{entry.institute}</h3>
                  <p className="xp-location">{entry.location}</p>
                </div>
                <div className="xp-meta">
                  <p className="xp-company">{entry.program}</p>
                  <p className="xp-period">{entry.period}</p>
                </div>
              </div>

              <ul className="xp-list">
                <li>{entry.program}</li>
                {entry.score ? <li>{entry.score}</li> : null}
              </ul>

              <p className="xp-index">
                {String(index + 1).padStart(2, "0")} / {String(card.educationEntries.length).padStart(2, "0")}
              </p>
            </article>
          </section>
        ))}

        <section className="fp-screen xp-end">
          <h3 className="fp-sec-title" style={{ color: card.color }}>End of Education</h3>
          <p>Scroll up to revisit entries or exit and move to the next card.</p>
          <button className="fp-exit-btn" onClick={onExit} style={{ borderColor: card.color + "55", color: card.color }}>
            ← Back to Cards
          </button>
        </section>
      </div>
    </div>
  );
}

function CertificationsFullPage({ card, onExit }) {
  const wrapperRef = useRef(null);
  const stageRef = useRef(null);
  const cardsSectionRef = useRef(null);
  const endSectionRef = useRef(null);
  const wheelAccum = useRef(0);
  const touchAccum = useRef(0);
  const touchLastY = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const total = card.certifications.length;

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return undefined;

    wrapper.scrollTop = 0;
    return undefined;
  }, []);

  const handleCardWheel = useCallback((e) => {
    const wrapper = wrapperRef.current;
    const cardsSection = cardsSectionRef.current;
    const endSection = endSectionRef.current;
    if (!wrapper || !cardsSection || !endSection) return;

    // Once end section is reached, do not intercept wheel events.
    if (wrapper.scrollTop >= endSection.offsetTop - 2) {
      wheelAccum.current = 0;
      return;
    }

    const zoneStart = cardsSection.offsetTop - wrapper.clientHeight * 0.12;
    const zoneEnd = cardsSection.offsetTop + cardsSection.offsetHeight;
    const inCardsZone = wrapper.scrollTop >= zoneStart && wrapper.scrollTop <= zoneEnd;
    if (!inCardsZone) return;

    const direction = e.deltaY >= 0 ? 1 : -1;
    const canMoveCardsInDirection =
      (direction < 0 && activeIdx > 0) ||
      (direction > 0 && activeIdx < total - 1);

    if (!canMoveCardsInDirection) {
      wheelAccum.current = 0;
      return;
    }

    // Lock page scrolling as soon as user scrolls in cards zone and card movement is possible.
    e.preventDefault();
    e.stopPropagation();

    wheelAccum.current += e.deltaY;
    if (Math.abs(wheelAccum.current) < 100) return;

    const d = wheelAccum.current > 0 ? 1 : -1;
    wheelAccum.current = 0;

    setActiveIdx((p) => clamp(p + d, 0, total - 1));
  }, [activeIdx, total]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return undefined;

    const listener = (event) => handleCardWheel(event);
    wrapper.addEventListener("wheel", listener, { passive: false });
    return () => wrapper.removeEventListener("wheel", listener);
  }, [handleCardWheel]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return undefined;

    const handleTouchStart = (e) => {
      const t = e.changedTouches?.[0];
      if (!t) return;
      touchLastY.current = t.clientY;
      touchAccum.current = 0;
    };

    const handleTouchMove = (e) => {
      const wrapperNode = wrapperRef.current;
      const cardsSection = cardsSectionRef.current;
      const endSection = endSectionRef.current;
      const t = e.changedTouches?.[0];
      if (!wrapperNode || !cardsSection || !endSection || !t || touchLastY.current === null) return;

      // Once end section is reached, do not intercept mobile scroll.
      if (wrapperNode.scrollTop >= endSection.offsetTop - 2) {
        touchAccum.current = 0;
        touchLastY.current = t.clientY;
        return;
      }

      const zoneStart = cardsSection.offsetTop - wrapperNode.clientHeight * 0.12;
      const zoneEnd = cardsSection.offsetTop + cardsSection.offsetHeight;
      const inCardsZone = wrapperNode.scrollTop >= zoneStart && wrapperNode.scrollTop <= zoneEnd;
      if (!inCardsZone) {
        touchAccum.current = 0;
        touchLastY.current = t.clientY;
        return;
      }

      const deltaY = touchLastY.current - t.clientY;
      touchLastY.current = t.clientY;
      if (Math.abs(deltaY) < 2) return;

      const direction = deltaY >= 0 ? 1 : -1;
      const canMoveCardsInDirection =
        (direction < 0 && activeIdx > 0) ||
        (direction > 0 && activeIdx < total - 1);

      if (!canMoveCardsInDirection) {
        touchAccum.current = 0;
        return;
      }

      // Lock page scrolling while swiping through the certification stack.
      e.preventDefault();
      e.stopPropagation();

      touchAccum.current += deltaY;
      if (Math.abs(touchAccum.current) < 56) return;

      const d = touchAccum.current > 0 ? 1 : -1;
      touchAccum.current = 0;
      setActiveIdx((p) => clamp(p + d, 0, total - 1));
    };

    const handleTouchEnd = () => {
      touchAccum.current = 0;
      touchLastY.current = null;
    };

    wrapper.addEventListener("touchstart", handleTouchStart, { passive: true });
    wrapper.addEventListener("touchmove", handleTouchMove, { passive: false });
    wrapper.addEventListener("touchend", handleTouchEnd, { passive: true });
    wrapper.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    return () => {
      wrapper.removeEventListener("touchstart", handleTouchStart);
      wrapper.removeEventListener("touchmove", handleTouchMove);
      wrapper.removeEventListener("touchend", handleTouchEnd);
      wrapper.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [activeIdx, total]);

  return (
    <div className="fp-wrapper fp-wrapper-cert3d-scroll" ref={wrapperRef} style={{ "--cert": card.color }}>
      <div className="cert-ambient" aria-hidden="true">
        <span className="cert-sky-warmth" />
        <span className="cert-sky-night" />
        <span className="cert-sun-glow" />
        <span className="cert-sun" />
        <span className="cert-moon-glow" />
        <span className="cert-moon" />
        <span className="cert-mountain ridge-back" />
        <span className="cert-mountain ridge-front" />
        <span className="cert-dune dune-back" />
        <span className="cert-dune dune-front" />
        <span className="cert-tree tree-a" />
        <span className="cert-tree tree-b" />
        <span className="cert-tree tree-c" />
      </div>
      <div className="fp-scroll-inner">
        {/* Hero Screen */}
        <section className="fp-screen fp-hero cert3d-hero-screen xp-hero-screen">
          <div className="fp-badge" style={{ borderColor: card.color + "44" }}>
            <span className="fp-badge-num" style={{ color: card.color }}>{card.id}</span>
            <span className="fp-badge-label">{card.label}</span>
          </div>
          <h3 className="fp-section-heading" style={{ color: card.color }}>{card.sectionTitle}</h3>
          <h2 className="fp-title">Certifications</h2>
          <p className="fp-text">{card.text}</p>
          <div className="fp-line" style={{ background: card.color }} />
          {card.stats && (
            <div className="fp-stats">
              {card.stats.map((s) => (
                <div className="fp-stat" key={s.l}>
                  <span className="fp-stat-val" style={{ color: card.color }}>{s.v}</span>
                  <span className="fp-stat-lbl">{s.l}</span>
                </div>
              ))}
            </div>
          )}
          <div className="fp-scroll-hint">↓ scroll to explore ↓</div>
        </section>

        {/* 3D Card Stack Section */}
        <section ref={cardsSectionRef} className="cert3d-data-screen" style={{ "--cert": card.color }}>
          <div className="cert3d-stage" ref={stageRef}>
            <div className="cert3d-perspective">
              {card.certifications.map((c, i) => {
                const off = i - activeIdx;
                const absOff = Math.abs(off);
                const rX = off * 12;
                const tZ = -absOff * 60;
                const tY = off * 18;
                const isActive = i === activeIdx;
                return (
                  <article
                    key={c.title + c.issuer}
                    className={`cert3d-card${isActive ? " active" : ""}`}
                    style={{
                      transform: `perspective(900px) rotateX(${rX}deg) translateZ(${tZ}px) translateY(${tY}px)`,
                      opacity: absOff > 3 ? 0 : clamp(1 - absOff * 0.25, 0.1, 1),
                      zIndex: 20 - absOff,
                      pointerEvents: isActive ? "auto" : "none",
                    }}
                  >
                    <div className="cert3d-index">{String(i + 1).padStart(2, "0")}</div>
                    <h3>{c.title}</h3>
                    <p className="cert3d-issuer">{c.issuer}</p>
                    <p className="cert3d-date">{c.date}</p>
                    <a href={c.url} target="_blank" rel="noreferrer" className="cert3d-link">View Certificate ↗</a>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="cert3d-footer">
            <div className="cert3d-progress">
              {card.certifications.map((_, i) => (
                <span key={i} className={`cert3d-dot${i === activeIdx ? " on" : ""}`} />
              ))}
            </div>
            <p className="cert3d-counter">
              {String(activeIdx + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </p>
            <p className="cert3d-hint">scroll or swipe anywhere here to flip through</p>
          </div>
        </section>

        <section ref={endSectionRef} className="fp-screen cert3d-end" style={{ "--cert": card.color }}>
          <h3 className="fp-sec-title" style={{ color: card.color }}>End of Certifications</h3>
          <p className="fp-text">Scroll up to revisit certificates or go back to the main cards.</p>
          <button className="fp-exit-btn" onClick={onExit} style={{ borderColor: card.color + "55", color: card.color }}>
            ← Back to Cards
          </button>
        </section>
      </div>
    </div>
  );
}

function ProjectsFullPage({ card, onExit }) {
  const wrapperRef = useRef(null);
  const heroRef = useRef(null);
  const showcaseRefs = useRef([]);
  const websiteShowcaseRefs = useRef([]);
  const websitesRef = useRef(null);
  const mlRef = useRef(null);
  const endRef = useRef(null);
  const [visibleSections, setVisibleSections] = useState({});
  const [visibleWebsiteRows, setVisibleWebsiteRows] = useState({});
  const [websitesVisible, setWebsitesVisible] = useState(false);
  const [mlVisible, setMlVisible] = useState(false);
  const [endVisible, setEndVisible] = useState(false);
  const [activeStage, setActiveStage] = useState("hero");
  const [activeProject, setActiveProject] = useState(0);
  const [activeWebsite, setActiveWebsite] = useState(0);
  const [isShowcaseRange, setIsShowcaseRange] = useState(false);
  const [mobileExitProgress, setMobileExitProgress] = useState(0);
  const [isCompactViewport, setIsCompactViewport] = useState(() => window.innerWidth <= 980);
  const [quickHelpSlideIndex, setQuickHelpSlideIndex] = useState(0);
  const syncFrameRef = useRef(null);
  const syncStateRef = useRef({
    stage: "hero",
    project: 0,
    website: 0,
    showcase: false,
    mobileExit: 0,
  });
  const showPhone = isShowcaseRange && activeStage.startsWith("showcase-");
  const quickHelpSlides = useMemo(() => QUICKHELP_SLIDES, []);
  const websiteProjects = useMemo(() => {
    const websites = card.websitesSection || {};
    return [websites.websiteProject, websites.websiteProject2, websites.websiteProject3].filter(Boolean);
  }, [card.websitesSection]);
  const mlProjects = useMemo(() => card.mlSection?.projects || [], [card.mlSection]);
  const projectsList = card.projectsList && card.projectsList.length
    ? card.projectsList
    : [{
      name: card.projectName || card.title,
      stack: card.projectStack || "Flutter, Firebase, Python",
      appUrl: card.appUrl,
      leftTitle: "Core Build",
      leftPoints: card.projectPointsLeft || card.highlights || [],
      rightTitle: "Impact",
      rightPoints: card.projectPointsRight || []
    }];

  const handleFrameWheel = useCallback((e) => {
    if (e.target instanceof HTMLIFrameElement) {
      e.stopPropagation();
      return;
    }
    e.preventDefault();
    e.stopPropagation();
  }, []);

  useEffect(() => {
    const root = wrapperRef.current;
    const hero = heroRef.current;
    const websites = websitesRef.current;
    const ml = mlRef.current;
    const end = endRef.current;
    if (!root || !hero || !websites || !ml || !end) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const section = entry.target.getAttribute("data-prj-section");
          if (section === "hero" && entry.isIntersecting) {
            setActiveStage("hero");
          }
          if (section?.startsWith("showcase-") && entry.isIntersecting) {
            const idx = Number(section.split("-")[1] || 0);
            setVisibleSections((prev) => ({ ...prev, [section]: true }));
            setActiveProject(idx);
            setActiveStage(section);
          }
          if (section?.startsWith("web-") && entry.isIntersecting) {
            const idx = Number(section.split("-")[1] || 0);
            setVisibleWebsiteRows((prev) => ({ ...prev, [section]: true }));
          }
          if (section === "websites" && entry.isIntersecting) {
            setWebsitesVisible(true);
          }
          if (section === "ml" && entry.isIntersecting) {
            setMlVisible(true);
            setActiveStage("ml");
          }
          if (section === "end" && entry.isIntersecting) {
            setEndVisible(true);
            setActiveStage("end");
          }
        });
      },
      {
        root,
        threshold: 0.55
      }
    );

    observer.observe(hero);
    showcaseRefs.current.forEach((node) => {
      if (node) observer.observe(node);
    });
    websiteShowcaseRefs.current.forEach((node) => {
      if (node) observer.observe(node);
    });
    observer.observe(websites);
    observer.observe(ml);
    observer.observe(end);
    return () => observer.disconnect();
  }, [projectsList.length, websiteProjects.length]);

  useEffect(() => {
    const onResize = () => {
      setIsCompactViewport(window.innerWidth <= 980);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const root = wrapperRef.current;
    const websites = websitesRef.current;
    const ml = mlRef.current;
    const end = endRef.current;
    if (!root || !websites || !ml || !end) return undefined;

    const syncProjectStageFromScroll = () => {
      const firstShowcaseTop = showcaseRefs.current[0]?.offsetTop ?? Number.MAX_SAFE_INTEGER;
      const websitesTop = websites.offsetTop;
      const mlTop = ml.offsetTop;
      const endTop = end.offsetTop;
      const st = root.scrollTop;
      const viewportProbe = st + root.clientHeight * 0.46;
      const fadeStart = websitesTop - 340;
      const fadeEnd = websitesTop - 70;

      const inShowcase = st >= (firstShowcaseTop - 120) && st < (websitesTop - 80);
      const inWebsites = st >= (websitesTop - 120) && st < (mlTop - 80);
      const inMl = st >= (mlTop - 120) && st < (endTop - 80);
      const nextMobileExit = inShowcase ? clamp((st - fadeStart) / (fadeEnd - fadeStart), 0, 1) : (inWebsites ? 1 : 0);

      if (syncStateRef.current.showcase !== inShowcase) {
        syncStateRef.current.showcase = inShowcase;
        setIsShowcaseRange(inShowcase);
      }

      if (Math.abs(syncStateRef.current.mobileExit - nextMobileExit) > 0.02) {
        syncStateRef.current.mobileExit = nextMobileExit;
        setMobileExitProgress(nextMobileExit);
      }

      if (inWebsites) {
        setWebsitesVisible(true);
        const wrapperRect = root.getBoundingClientRect();
        const viewportCenter = wrapperRect.top + root.clientHeight * 0.5;
        let nextWebsiteIdx = 0;
        let bestDistance = Number.POSITIVE_INFINITY;
        for (let i = 0; i < websiteProjects.length; i += 1) {
          const row = websiteShowcaseRefs.current[i];
          if (!row) continue;

          const rowRect = row.getBoundingClientRect();
          const rowCenter = rowRect.top + (rowRect.height * 0.5);
          const distance = Math.abs(rowCenter - viewportCenter);
          if (distance < bestDistance) {
            bestDistance = distance;
            nextWebsiteIdx = i;
          }
        }
        const nextStage = `websites-${nextWebsiteIdx}`;
        if (syncStateRef.current.website !== nextWebsiteIdx) {
          syncStateRef.current.website = nextWebsiteIdx;
          setActiveWebsite(nextWebsiteIdx);
        }
        if (syncStateRef.current.stage !== nextStage) {
          syncStateRef.current.stage = nextStage;
          setActiveStage(nextStage);
        }
        return;
      }

      if (inMl) {
        setMlVisible(true);
        if (syncStateRef.current.stage !== "ml") {
          syncStateRef.current.stage = "ml";
          setActiveStage("ml");
        }
        return;
      }

      if (!inShowcase) {
        const nextStage = st < firstShowcaseTop - 120 ? "hero" : "end";
        if (syncStateRef.current.stage !== nextStage) {
          syncStateRef.current.stage = nextStage;
          setActiveStage(nextStage);
        }
        return;
      }

      let nextProjectIdx = 0;
      for (let i = 0; i < projectsList.length; i += 1) {
        const top = showcaseRefs.current[i]?.offsetTop ?? Number.MAX_SAFE_INTEGER;
        if (viewportProbe >= top - 16) nextProjectIdx = i;
      }

      const nextStage = `showcase-${nextProjectIdx}`;
      if (syncStateRef.current.project !== nextProjectIdx) {
        syncStateRef.current.project = nextProjectIdx;
        setActiveProject(nextProjectIdx);
      }
      if (syncStateRef.current.stage !== nextStage) {
        syncStateRef.current.stage = nextStage;
        setActiveStage(nextStage);
      }
    };

    const onScroll = () => {
      if (syncFrameRef.current) return;
      syncFrameRef.current = window.requestAnimationFrame(() => {
        syncFrameRef.current = null;
        syncProjectStageFromScroll();
      });
    };

    syncProjectStageFromScroll();
    root.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      root.removeEventListener("scroll", onScroll);
      if (syncFrameRef.current) {
        window.cancelAnimationFrame(syncFrameRef.current);
        syncFrameRef.current = null;
      }
    };
  }, [projectsList.length, websiteProjects.length]);

  useEffect(() => {
    if (!(showPhone && activeProject === 4 && quickHelpSlides.length > 1)) return undefined;

    const intervalId = window.setInterval(() => {
      setQuickHelpSlideIndex((prev) => (prev + 1) % quickHelpSlides.length);
    }, 2000);

    return () => window.clearInterval(intervalId);
  }, [activeProject, showPhone, quickHelpSlides.length]);

  useEffect(() => {
    if (activeProject !== 4) setQuickHelpSlideIndex(0);
  }, [activeProject]);

  const phoneMotion = useMemo(() => {
    if (!showPhone) {
      return {
        opacity: 0,
        x: isCompactViewport ? 0 : (activeProject === 2 ? 360 : (activeProject === 0 ? 0 : -360)),
        y: -260,
        rotateY: 0,
        rotateZ: 0,
        scale: 0.96,
      };
    }

    if (activeProject === 0) {
      return {
        opacity: 1,
        x: 0,
        y: 0,
        rotateY: 0,
        rotateZ: 0,
        scale: 1,
      };
    }

    if (activeProject === 1) {
      return {
        opacity: 1,
        x: isCompactViewport ? 0 : -360,
        y: 44,
        rotateY: 0,
        rotateZ: 0,
        scale: 0.95,
      };
    }

    if (activeProject === 2) {
      return {
        opacity: 1,
        x: isCompactViewport ? 0 : 360,
        y: 44,
        rotateY: 0,
        rotateZ: 0,
        scale: 0.95,
      };
    }

    if (activeProject === 3) {
      return {
        opacity: 1,
        x: 0,
        y: 0,
        rotateY: 0,
        rotateZ: 0,
        scale: 1,
      };
    }

    if (activeProject === 4) {
      return {
        opacity: 1 - (mobileExitProgress * 0.95),
        x: isCompactViewport ? 0 : -360,
        y: 44 + (mobileExitProgress * 130),
        rotateY: 0,
        rotateZ: 0,
        scale: 0.95 - (mobileExitProgress * 0.06),
      };
    }

    return {
      opacity: 1,
      x: isCompactViewport ? 0 : -360,
      y: 44,
      rotateY: 0,
      rotateZ: 0,
      scale: 0.95,
    };
  }, [activeProject, isCompactViewport, mobileExitProgress, showPhone]);

  const phoneTransition = useMemo(() => (
    activeProject === 4
      ? { duration: 0.32, ease: [0.22, 1, 0.36, 1] }
      : { type: "spring", stiffness: 115, damping: 24, mass: 0.78 }
  ), [activeProject]);

  return (
    <div ref={wrapperRef} className="fp-wrapper fp-wrapper-project-showcase" style={{ "--prj": card.color }}>
      <div className="projects-ambient" aria-hidden="true">
        <span className="projects-grid" />
        <span className="projects-frame frame-a" />
        <span className="projects-frame frame-b" />
        <span className="projects-comet comet-a" />
        <span className="projects-comet comet-b" />
        <span className="projects-orb orb-a" />
        <span className="projects-orb orb-b" />
      </div>

      <div className="project-phone-sticky">
        <div className="project-phone-floating" style={{ pointerEvents: showPhone ? "auto" : "none" }}>
          <motion.div
            className="project-phone-shell"
            initial={false}
            animate={phoneMotion}
            transition={phoneTransition}
            onWheelCapture={handleFrameWheel}
          >
            <div className="project-phone-notch" />
            <div className={`project-phone-screen ${activeProject === 4 ? "quickhelp-screen" : ""}`}>
              {activeProject === 4 && quickHelpSlides.length ? (
                <motion.img
                  key={quickHelpSlideIndex}
                  className="project-phone-image"
                  src={quickHelpSlides[quickHelpSlideIndex]}
                  alt={`QuickHelp screen ${quickHelpSlideIndex + 1}`}
                  initial={{ opacity: 0.25, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                />
              ) : (
                <iframe
                  src={projectsList[activeProject]?.appUrl}
                  title={`${projectsList[activeProject]?.name || "Project"} Live App`}
                  loading="lazy"
                  allow="clipboard-read; clipboard-write"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              )}
            </div>
            <div className="project-phone-homebar" />
          </motion.div>
        </div>
      </div>

      <div className="fp-scroll-inner">
        <section ref={heroRef} data-prj-section="hero" className="fp-screen fp-hero project-hero-screen">
          <div className="fp-badge" style={{ borderColor: card.color + "44" }}>
            <span className="fp-badge-num" style={{ color: card.color }}>{card.id}</span>
            <span className="fp-badge-label">{card.label}</span>
          </div>
          <h3 className="fp-section-heading" style={{ color: card.color }}>{card.sectionTitle}</h3>
          <h2 className="fp-title">{card.title || "Featured Projects"}</h2>
          <p className="fp-text">Scroll down to explore project highlights and live app previews.</p>
          <div className="fp-line" style={{ background: card.color }} />
          <div className="fp-scroll-hint">↓ scroll to explore project ↓</div>
        </section>

        {projectsList.map((project, idx) => {
          const isSecond = idx === 1 || idx === 4;
          const isThird = idx === 2;
          const isFourth = idx === 3;
          const hasLeftPanel = idx === 0 || isThird || isFourth;
          const hasRightPanel = !isThird;
          const hasCenterPhoneLane = idx === 0 || isThird || isFourth;

          return (
            <section
              key={project.name + idx}
              ref={(node) => { showcaseRefs.current[idx] = node; }}
              data-prj-section={`showcase-${idx}`}
              className={`project-showcase-screen ${isSecond ? "second" : ""} ${isThird ? "third" : ""} ${visibleSections[`showcase-${idx}`] ? "show" : ""}`}
            >
              <div className={`project-showcase-layout ${isSecond ? "second" : ""} ${isThird ? "third" : ""}`}>
                {hasLeftPanel ? (
                  <aside className="project-side-panel left">
                    <h3>{project.leftTitle || (idx === 0 ? "Core Build" : project.name || "Project Details")}</h3>
                    {project.description ? <p className="project-side-note">{project.description}</p> : null}
                    <ul>
                      {(project.leftPoints || []).map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                    {isThird ? (
                      <a className="project-live-link" href={project.appUrl} target="_blank" rel="noreferrer">
                        Open {project.name} ↗
                      </a>
                    ) : null}
                  </aside>
                ) : <div className="project-empty-slot" aria-hidden="true" />}

                {hasCenterPhoneLane ? <div className="project-phone-lane" aria-hidden="true" /> : null}

                {hasRightPanel ? (
                  <aside className="project-side-panel right">
                    <h3>{project.rightTitle || project.name || "Project Details"}</h3>
                    {project.description ? <p className="project-side-note">{project.description}</p> : null}
                    <ul>
                      {(project.rightPoints || []).map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                    <a className="project-live-link" href={project.appUrl} target="_blank" rel="noreferrer">
                      Open {project.name} ↗
                    </a>
                  </aside>
                ) : null}

                <div className="project-mobile-frame" aria-label={`${project.name} mobile preview`}>
                  <div className="project-mobile-shell" onWheelCapture={handleFrameWheel}>
                    <div className="project-phone-notch" />
                    <div className={`project-phone-screen ${idx === 4 ? "quickhelp-screen" : ""}`}>
                      {idx === 4 && quickHelpSlides.length ? (
                        <img
                          className="project-phone-image"
                          src={quickHelpSlides[quickHelpSlideIndex]}
                          alt={`QuickHelp screen ${quickHelpSlideIndex + 1}`}
                        />
                      ) : (
                        <iframe
                          src={project.appUrl}
                          title={`${project.name} Mobile Preview`}
                          loading="lazy"
                          allow="clipboard-read; clipboard-write"
                          referrerPolicy="strict-origin-when-cross-origin"
                        />
                      )}
                    </div>
                    <div className="project-phone-homebar" />
                  </div>
                </div>
              </div>
            </section>
          );
        })}

        <section
          ref={websitesRef}
          data-prj-section="websites"
          className={`project-websites-flow ${websitesVisible ? "show" : ""}`}
        >
          <div className="project-web-laptop-sticky">
            <div
              className="project-web-laptop-floating"
              style={{ pointerEvents: activeStage.startsWith("websites-") ? "auto" : "none" }}
            >
              <motion.div
                className="project-web-laptop moving"
                initial={false}
                animate={{
                  opacity: activeStage.startsWith("websites-") ? 1 : 0,
                  x: isCompactViewport
                    ? 0
                    : (activeWebsite === 1 ? 380 : -380),
                  y: activeStage.startsWith("websites-") ? 38 : -220,
                  rotateY: isCompactViewport
                    ? 0
                    : (activeWebsite === 1 ? -16 : 16),
                  scale: activeStage.startsWith("websites-") ? 1 : 0.96,
                }}
                transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
                onWheelCapture={handleFrameWheel}
              >
                <div className="project-web-laptop-top" />
                <div className="project-web-laptop-screen">
                  <iframe
                    src={websiteProjects[activeWebsite]?.appUrl || "https://kumailx051.github.io/ECOMMERCE-WEBSITE/"}
                    title={`${websiteProjects[activeWebsite]?.name || "Website Project"} Live Preview`}
                    loading="lazy"
                    allow="clipboard-read; clipboard-write"
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
                <div className="project-web-laptop-base" />
              </motion.div>
            </div>
          </div>

          <div className="project-websites-list">
            {websiteProjects.map((project, idx) => {
              const textLeft = idx === 1;
              return (
                <article
                  key={project.name + idx}
                  ref={(node) => { websiteShowcaseRefs.current[idx] = node; }}
                  data-prj-section={`web-${idx}`}
                  className={`project-web-row ${textLeft ? "left" : "right"} ${visibleWebsiteRows[`web-${idx}`] ? "show" : ""}`}
                >
                  {textLeft ? (
                    <aside className="project-websites-panel">
                      <h3>{project.name}</h3>
                      <p>{project.description}</p>
                      <h4>Technologies Used</h4>
                      <ul>
                        {(project.technologies || []).map((tech) => (
                          <li key={tech}>{tech}</li>
                        ))}
                      </ul>
                      <a className="project-live-link" href={project.appUrl} target="_blank" rel="noreferrer">
                        Open {project.name} ↗
                      </a>
                    </aside>
                  ) : <div className="project-web-lane" aria-hidden="true" />}

                  {!textLeft ? (
                    <aside className="project-websites-panel">
                      <h3>{project.name}</h3>
                      <p>{project.description}</p>
                      <h4>Technologies Used</h4>
                      <ul>
                        {(project.technologies || []).map((tech) => (
                          <li key={tech}>{tech}</li>
                        ))}
                      </ul>
                      <a className="project-live-link" href={project.appUrl} target="_blank" rel="noreferrer">
                        Open {project.name} ↗
                      </a>
                    </aside>
                  ) : <div className="project-web-lane" aria-hidden="true" />}

                  <div className="project-web-mobile-frame" aria-label={`${project.name} website preview`}>
                    <div className="project-web-mobile-shell" onWheelCapture={handleFrameWheel}>
                      <div className="project-web-laptop-top" />
                      <div className="project-web-laptop-screen">
                        <iframe
                          src={project.appUrl}
                          title={`${project.name} Mobile Website Preview`}
                          loading="lazy"
                          allow="clipboard-read; clipboard-write"
                          referrerPolicy="strict-origin-when-cross-origin"
                        />
                      </div>
                      <div className="project-web-laptop-base" />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section
          ref={mlRef}
          data-prj-section="ml"
          className={`fp-screen project-ml-screen ${mlVisible ? "show" : ""}`}
        >
          <div className="project-ml-wrap">
            <header className="project-ml-head">
              <h3>{card.mlSection?.title || "Machine Learning Projects"}</h3>
              <p>{card.mlSection?.subtitle || "Applied ML systems for document intelligence and multilingual text classification."}</p>
            </header>

            <div className="project-ml-grid">
              {mlProjects.map((project) => (
                <article key={project.name} className="project-ml-card">
                  <h4>{project.name}</h4>
                  <p>{project.description}</p>
                  <ul>
                    {(project.points || []).map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                  <a className="project-live-link" href={project.githubUrl} target="_blank" rel="noreferrer">
                    View on GitHub ↗
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          ref={endRef}
          data-prj-section="end"
          className={`fp-screen project-end-screen ${endVisible ? "show" : ""}`}
        >
          <h3 className="fp-sec-title" style={{ color: card.color }}>End of Projects</h3>
          <p className="fp-text">Scroll up to revisit projects or go back to the main cards.</p>
          <button className="fp-exit-btn" onClick={onExit} style={{ borderColor: card.color + "55", color: card.color }}>
            ← Back to Cards
          </button>
        </section>
      </div>
    </div>
  );
}

function AchievementsFullPage({ card, onExit }) {
  const wrapperRef = useRef(null);
  const itemRefs = useRef([]);
  const [visItems, setVisItems] = useState([]);

  useEffect(() => {
    const root = wrapperRef.current;
    if (!root) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((ent) => {
        if (!ent.isIntersecting) return;
        const idx = Number(ent.target.dataset.idx);
        setVisItems((prev) => prev.includes(idx) ? prev : [...prev, idx]);
      });
    }, { root, threshold: 0.2 });
    itemRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [card.achievements]);

  return (
    <div className="fp-wrapper fp-wrapper-ach3d" ref={wrapperRef}>
      <div className="ach-ambient" aria-hidden="true">
        <span className="ach-stars" />
        <span className="ach-mars" />
        <span className="ach-orbit orbit-one">
          <span className="ach-moon moon-a" />
        </span>
        <span className="ach-orbit orbit-two">
          <span className="ach-moon moon-b" />
        </span>
      </div>
      <div className="fp-scroll-inner">
        {/* Hero */}
        <section className="fp-screen fp-hero ach3d-hero">
          <div className="fp-badge" style={{ borderColor: card.color + "44" }}>
            <span className="fp-badge-num" style={{ color: card.color }}>{card.id}</span>
            <span className="fp-badge-label">{card.label}</span>
          </div>
          <h3 className="fp-section-heading" style={{ color: card.color }}>{card.sectionTitle}</h3>
          <h2 className="fp-title">Achievements</h2>
          <p className="fp-text">Scroll down — each achievement flies in with a 3D perspective reveal.</p>
          <div className="fp-line" style={{ background: card.color }} />
          <div className="fp-scroll-hint">↓ scroll to reveal ↓</div>
        </section>

        {/* 3D Achievement Cards */}
        <section className="ach3d-grid" style={{ "--ach": card.color }}>
          {card.achievements.map((item, i) => (
            <article
              key={item.title + i}
              className={`ach3d-card${visItems.includes(i) ? " show" : ""}`}
              data-idx={i}
              ref={(el) => { itemRefs.current[i] = el; }}
              style={{ transitionDelay: `${(i % 2) * 0.12}s` }}
            >
              <div className="ach3d-medal">🏆</div>
              <div className="ach3d-body">
                <p className="ach3d-num">{String(i + 1).padStart(2, "0")}</p>
                <h3>{item.title}</h3>
                <p className="ach3d-note">{item.note}</p>
                {item.url ? (
                  <a href={item.url} target="_blank" rel="noreferrer" className="ach3d-link">View Proof ↗</a>
                ) : (
                  <span className="ach3d-link muted">No link</span>
                )}
              </div>
            </article>
          ))}
        </section>

        <section className="fp-screen ach3d-end">
          <button className="fp-exit-btn" onClick={onExit} style={{ borderColor: card.color + "55", color: card.color }}>
            ← Back to Cards
          </button>
        </section>
      </div>
    </div>
  );
}

function IconLinkedIn() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.94 8.5H3.56V20h3.38V8.5ZM5.25 3C4.13 3 3.2 3.93 3.2 5.05c0 1.11.92 2.05 2.04 2.05 1.13 0 2.05-.94 2.05-2.05C7.3 3.93 6.38 3 5.25 3Zm3.82 5.5V20h3.37v-6.03c0-1.6.31-3.15 2.3-3.15 1.96 0 1.98 1.84 1.98 3.26V20h3.38v-6.63c0-3.26-.7-5.76-4.5-5.76-1.82 0-3.03 1-3.53 1.95h-.05V8.5H9.07Z" fill="currentColor"/>
    </svg>
  );
}

function IconGitHub() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.2c-3.34.73-4.04-1.6-4.04-1.6-.54-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.08 1.84 1.24 1.84 1.24 1.07 1.86 2.82 1.32 3.51 1.01.11-.79.42-1.32.76-1.62-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.37 1.23-3.2-.12-.3-.53-1.53.12-3.19 0 0 1.01-.32 3.31 1.22a11.5 11.5 0 0 1 6.03 0c2.3-1.54 3.3-1.22 3.3-1.22.66 1.66.25 2.89.13 3.19.77.83 1.22 1.89 1.22 3.2 0 4.62-2.8 5.64-5.49 5.94.43.37.82 1.11.82 2.23v3.3c0 .32.22.69.83.58A12 12 0 0 0 12 .5Z" fill="currentColor"/>
    </svg>
  );
}

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 6.75A2.75 2.75 0 0 1 5.75 4h12.5A2.75 2.75 0 0 1 21 6.75v10.5A2.75 2.75 0 0 1 18.25 20H5.75A2.75 2.75 0 0 1 3 17.25V6.75Zm2 .18v.16l7 4.81 7-4.81v-.16a.75.75 0 0 0-.75-.75H5.75a.75.75 0 0 0-.75.75Zm14 2.58-6.44 4.43a1 1 0 0 1-1.12 0L5 9.51v7.74c0 .41.34.75.75.75h12.5c.41 0 .75-.34.75-.75V9.51Z" fill="currentColor"/>
    </svg>
  );
}

function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.62 2.98c.3-.07.62.02.84.25l2.24 2.24c.29.3.38.74.22 1.12l-1.1 2.67a.8.8 0 0 0 .17.87l5.06 5.06c.24.24.6.3.88.17l2.67-1.1c.38-.16.82-.08 1.12.22l2.24 2.24c.23.23.32.54.25.84-.37 1.7-1.9 2.94-3.64 2.94C9.58 21.5 2.5 14.42 2.5 5.62c0-1.74 1.24-3.27 2.94-3.64h1.18Z" fill="currentColor"/>
    </svg>
  );
}

function IconMapPin() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.75a7.25 7.25 0 0 0-7.25 7.25c0 4.9 5.8 10.73 6.05 10.97a1.75 1.75 0 0 0 2.4 0c.24-.24 6.05-6.08 6.05-10.97A7.25 7.25 0 0 0 12 2.75Zm0 9.75a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" fill="currentColor"/>
    </svg>
  );
}

function ContactFullPage({ card, onExit }) {
  const formRef = useRef(null);
  const [flipped, setFlipped] = useState(false);
  const [submitState, setSubmitState] = useState("idle");
  const [submitNote, setSubmitNote] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSending) return;

    try {
      setIsSending(true);
      setSubmitState("idle");
      setSubmitNote("");

      await emailjs.sendForm(
        "service_69bwyvr",
        "template_zwu8hsc",
        formRef.current,
        "8M3WWyVHNaqj1Au2Q"
      );

      setSubmitState("success");
      setSubmitNote("Message sent successfully.");
      formRef.current?.reset();
    } catch (err) {
      setSubmitState("error");
      setSubmitNote(`Message failed to send: ${err?.text || "Please try again."}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fp-wrapper fp-wrapper-contact3d-scroll" style={{ "--contact": card.color }}>
      <div className="contact-ambient" aria-hidden="true">
        <span className="contact-grid-field" />
        <span className="contact-radar-core" />
        <span className="contact-radar-ring ring-a" />
        <span className="contact-radar-ring ring-b" />
        <span className="contact-radar-sweep" />
        <span className="contact-route route-a" />
        <span className="contact-route route-b" />
        <span className="contact-chat chat-a" />
        <span className="contact-chat chat-b" />
        <span className="contact-chat chat-c" />
      </div>
      <div className="fp-scroll-inner">
        {/* Hero Screen */}
        <section className="fp-screen fp-hero contact3d-hero-screen">
          <div className="fp-badge" style={{ borderColor: card.color + "44" }}>
            <span className="fp-badge-num" style={{ color: card.color }}>{card.id}</span>
            <span className="fp-badge-label">{card.label}</span>
          </div>
          <h3 className="fp-section-heading" style={{ color: card.color }}>{card.sectionTitle}</h3>
          <h2 className="fp-title">Get In Touch</h2>
          <p className="fp-text">{card.text}</p>
          <div className="fp-line" style={{ background: card.color }} />
          {card.stats && (
            <div className="fp-stats">
              {card.stats.map((s) => (
                <div className="fp-stat" key={s.l}>
                  <span className="fp-stat-val" style={{ color: card.color }}>{s.v}</span>
                  <span className="fp-stat-lbl">{s.l}</span>
                </div>
              ))}
            </div>
          )}
          <div className="fp-scroll-hint">↓ scroll to connect ↓</div>
        </section>

        {/* 3D Flip Card Section */}
        <section className="contact3d-data-screen" style={{ "--ccc": card.color }}>
          <div className="contact3d-stage">
            <div className={`contact3d-flipper${flipped ? " flipped" : ""}`}>
              {/* Front — Info */}
              <div className="contact3d-face contact3d-front">
                <h3>Contact Info</h3>
                <div className="contact3d-list">
                  <p><IconMapPin /> <span>{card.location}</span></p>
                  <p><IconPhone /> <span>{card.phone}</span></p>
                  <p><IconMail /> <span>{card.email}</span></p>
                </div>
                <div className="contact3d-socials">
                  <a href={card.linkedinUrl} target="_blank" rel="noreferrer"><IconLinkedIn /> LinkedIn</a>
                  <a href={card.githubUrl} target="_blank" rel="noreferrer"><IconGitHub /> GitHub</a>
                </div>
                <button className="contact3d-flip-btn" onClick={() => setFlipped(true)}>
                  Send a Message →
                </button>
              </div>

              {/* Back — Form */}
              <div className="contact3d-face contact3d-back">
                <h3>Send Message</h3>
                <form ref={formRef} className="contact3d-form" onSubmit={handleSubmit}>
                  <input name="name" type="text" required placeholder="Your name" />
                  <input name="email" type="email" required placeholder="you@example.com" />
                  <input name="subject" type="text" required placeholder="Subject" />
                  <textarea name="message" rows="3" required placeholder="Your message..." />
                  <button type="submit" disabled={isSending}>{isSending ? "Sending..." : "Send ↗"}</button>
                </form>
                {submitNote ? (
                  <p className={`contact3d-sent${submitState === "error" ? " error" : ""}`}>{submitNote}</p>
                ) : null}
                <button className="contact3d-flip-btn back" onClick={() => setFlipped(false)}>
                  ← Back to Info
                </button>
              </div>
            </div>
          </div>

          <button className="fp-exit-btn" onClick={onExit} style={{ borderColor: card.color + "55", color: card.color }}>
            ← Back to Cards
          </button>
        </section>
      </div>
    </div>
  );
}

/* ────── Full-Page Content (inside zoomed card) ────── */
function FullPage({ card, onExit }) {
  if (card.label === "Experience" && Array.isArray(card.experiences)) {
    return <ExperienceFullPage card={card} onExit={onExit} />;
  }

  if (card.label === "Education" && Array.isArray(card.educationEntries)) {
    return <EducationFullPage card={card} onExit={onExit} />;
  }

  if (card.label === "Certifications" && Array.isArray(card.certifications)) {
    return <CertificationsFullPage card={card} onExit={onExit} />;
  }

  if (card.label === "Achievements" && Array.isArray(card.achievements)) {
    return <AchievementsFullPage card={card} onExit={onExit} />;
  }

  if (card.label === "Projects" && card.appUrl) {
    return <ProjectsFullPage card={card} onExit={onExit} />;
  }

  if (card.label === "Contact" && card.linkedinUrl && card.githubUrl) {
    return <ContactFullPage card={card} onExit={onExit} />;
  }

  const isProfileSection = card.label === "Profile";
  const isSkillsSection = card.label === "Skills";
  const isProjectsSection = card.label === "Projects";

  return (
    <div className={`fp-wrapper${isProfileSection ? " fp-wrapper-profile" : ""}${isSkillsSection ? " fp-wrapper-skills" : ""}${isProjectsSection ? " fp-wrapper-projects" : ""}`}>
      {isProjectsSection ? (
        <div className="projects-ambient" aria-hidden="true">
          <span className="projects-grid" />
          <span className="projects-frame frame-a" />
          <span className="projects-frame frame-b" />
          <span className="projects-comet comet-a" />
          <span className="projects-comet comet-b" />
          <span className="projects-orb orb-a" />
          <span className="projects-orb orb-b" />
        </div>
      ) : null}
      <div className="fp-scroll-inner">
        {/* Screen 1 – Hero */}
        <div className="fp-screen fp-hero">
          {isProfileSection ? (
            <div className="profile-ambient" aria-hidden="true">
              <span className="ambient-ring ring-a" />
              <span className="ambient-ring ring-b" />
              <span className="ambient-glow glow-a" />
              <span className="ambient-glow glow-b" />
              <span className="ambient-spark spark-a" />
              <span className="ambient-spark spark-b" />
              <span className="ambient-spark spark-c" />
            </div>
          ) : null}
          {isSkillsSection ? (
            <div className="skills-ambient" aria-hidden="true">
              <span className="skills-grid" />
              <span className="skills-beam beam-a" />
              <span className="skills-beam beam-b" />
              <span className="skills-orb orb-a" />
              <span className="skills-orb orb-b" />
              <span className="skills-pulse pulse-a" />
              <span className="skills-pulse pulse-b" />
              <div className="skills-bird-flight">
                <video autoPlay muted loop playsInline preload="auto">
                  <source src={flutterBirdVideo} type="video/mp4" />
                </video>
              </div>
              <div className="skills-bird-flight-left">
                <video autoPlay muted loop playsInline preload="auto">
                  <source src={flutterBirdVideo} type="video/mp4" />
                </video>
              </div>
            </div>
          ) : null}
          <div className="fp-badge" style={{ borderColor: card.color + "44" }}>
            <span className="fp-badge-num" style={{ color: card.color }}>{card.id}</span>
            <span className="fp-badge-label">{card.label}</span>
          </div>
          <h3 className="fp-section-heading" style={{ color: card.color }}>{card.sectionTitle}</h3>
          <h2 className="fp-title">{card.title}</h2>
          <p className="fp-text">{card.text}</p>
          <div className="fp-line" style={{ background: card.color }} />
          <div className="fp-stats">
            {card.stats.map((s) => (
              <div key={s.l} className="fp-stat">
                <span className="fp-stat-val" style={{ color: card.color }}>{s.v}</span>
                <span className="fp-stat-lbl">{s.l}</span>
              </div>
            ))}
          </div>
          <div className="fp-scroll-hint">↓ scroll down ↓</div>
        </div>
        {/* Screen 2 – Details */}
        <div className="fp-screen fp-details">
          <h3 className="fp-sec-title" style={{ color: card.color }}>Key Highlights</h3>
          <div className="fp-highlights">
            {card.highlights.map((h) => (
              <div key={h} className="fp-hi-card">
                <div className="fp-hi-dot" style={{ background: card.color }} />
                <p>{h}</p>
              </div>
            ))}
          </div>
          <div className="fp-tags-row">
            {card.tags.map((t) => (
              <span key={t} className="fp-tag" style={{ borderColor: card.color + "55", color: card.color }}>{t}</span>
            ))}
          </div>
          {/* Click to go out */}
          <button className="fp-exit-btn" onClick={onExit} style={{ borderColor: card.color + "55", color: card.color }}>
            ← Click to Go Out
          </button>
        </div>
      </div>
    </div>
  );
}

/* ────── Particles ────── */
function Particles() {
  const pts = useMemo(() => Array.from({ length: 35 }, (_, i) => ({
    id: i, l: Math.random() * 100, t: Math.random() * 100,
    sz: 1 + Math.random() * 2, dur: 14 + Math.random() * 22, del: -(Math.random() * 18), op: 0.12 + Math.random() * 0.2,
  })), []);
  return (
    <div className="particles" aria-hidden>
      {pts.map((p) => (
        <div key={p.id} className="dot" style={{
          left: p.l + "%", top: p.t + "%", width: p.sz, height: p.sz,
          animationDuration: p.dur + "s", animationDelay: p.del + "s", opacity: p.op,
        }} />
      ))}
    </div>
  );
}

/* ────── App ────── */
export default function App() {
  const n = cards.length;
  const [centerIdx, setCenterIdx] = useState(Math.floor(n / 2)); // start in the middle
  const [openCard, setOpenCard] = useState(null); // index of opened card, or null
  const scrollAccum = useRef(0);
  const stickyRef = useRef(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchHasStarted = useRef(false);
  const suppressTapRef = useRef(false);
  const tapUnlockTimerRef = useRef(null);

  // Scroll ONLY moves cards (when not inside a card)
  useEffect(() => {
    const handleWheel = (e) => {
      if (openCard !== null) return; // don't move carousel when inside a card

      e.preventDefault();

      // Accumulate scroll delta
      scrollAccum.current += e.deltaY;

      const threshold = 120; // pixels of scroll needed to move one card
      if (Math.abs(scrollAccum.current) >= threshold) {
        const direction = scrollAccum.current > 0 ? 1 : -1;
        setCenterIdx((prev) => clamp(prev + direction, 0, n - 1));
        scrollAccum.current = 0;
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [openCard, n]);

  // Touch swipe moves cards on mobile/tablet home screen
  useEffect(() => {
    const area = stickyRef.current;
    if (!area) return undefined;

    const handleTouchStart = (e) => {
      if (openCard !== null) return;
      const t = e.changedTouches?.[0];
      if (!t) return;
      touchStartX.current = t.clientX;
      touchStartY.current = t.clientY;
      touchHasStarted.current = true;
    };

    const handleTouchEnd = (e) => {
      if (openCard !== null || !touchHasStarted.current) return;
      const t = e.changedTouches?.[0];
      touchHasStarted.current = false;
      if (!t) return;

      const dx = t.clientX - touchStartX.current;
      const dy = t.clientY - touchStartY.current;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      if (absX < 56 || absX < absY * 1.15) return;

      const direction = dx < 0 ? 1 : -1;
      setCenterIdx((prev) => clamp(prev + direction, 0, n - 1));

      suppressTapRef.current = true;
      if (tapUnlockTimerRef.current) window.clearTimeout(tapUnlockTimerRef.current);
      tapUnlockTimerRef.current = window.setTimeout(() => {
        suppressTapRef.current = false;
      }, 260);
    };

    area.addEventListener("touchstart", handleTouchStart, { passive: true });
    area.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      area.removeEventListener("touchstart", handleTouchStart);
      area.removeEventListener("touchend", handleTouchEnd);
      if (tapUnlockTimerRef.current) {
        window.clearTimeout(tapUnlockTimerRef.current);
        tapUnlockTimerRef.current = null;
      }
    };
  }, [openCard, n]);

  // Click on a card → open it
  const handleCardClick = useCallback((cardIndex) => {
    if (suppressTapRef.current) return;
    // First move to center, then open
    setCenterIdx(cardIndex);
    // Small delay so user sees card center before zoom
    setTimeout(() => {
      setOpenCard(cardIndex);
    }, 300);
  }, []);

  // Click "Go Out" → close card
  const handleExit = useCallback(() => {
    setOpenCard(null);
  }, []);

  const isZoomed = openCard !== null;
  const activeCard = isZoomed ? openCard : centerIdx;

  return (
    <div className="page">
      <div className="grain" aria-hidden />
      <Particles />

      <div ref={stickyRef} className="sticky-vp">
        {/* Hero */}
        <header className={`hero-text${isZoomed ? " hidden" : ""}`}>
          <p className="eyebrow">SOFTWARE DEVELOPER • WEB & MOBILE</p>
          <h1>Portfolio Resume<br /><span className="hero-hl">KUMAIL RAZA</span></h1>
          <p className="subcopy">Scroll or swipe to navigate cards • Click any card to dive in</p>
        </header>

        {/* 3D Carousel */}
        <Carousel
          cards={cards}
          centerIdx={centerIdx}
          visible={!isZoomed}
          onCardClick={handleCardClick}
        />

        {/* Zoom frame — opens when a card is clicked */}
        <div
          className={`zoom-frame${isZoomed ? " open" : ""}`}
          style={{
            background: `radial-gradient(ellipse at 50% 30%, ${cards[activeCard].color}0d, transparent 60%), #0a0a12`,
          }}
        >
          {isZoomed && <FullPage card={cards[activeCard]} onExit={handleExit} />}
        </div>

        {/* Scroll dots */}
        <div className={`scroll-dots${isZoomed ? " hidden" : ""}`}>
          {cards.map((c, i) => (
            <div key={c.id} className={`sdot${i === centerIdx ? " on" : ""}`} style={{ "--dc": c.color }} />
          ))}
        </div>

        {/* CTA */}
        <a className={`cta${isZoomed ? " hidden" : ""}`} href={resumePdf} download="Kumail Raza CV.pdf">
          Download Resume
        </a>
      </div>
    </div>
  );
}
