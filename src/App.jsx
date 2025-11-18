import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import GlassSurface from './components/GlassSurface';
import GridBackground from './components/GridBackground';
import MissionTiles from './components/MissionTiles';
import SiteFooter from './components/SiteFooter';
import './App.css';
import { assetPath } from './utils/assetPath';

const ASCIIText = lazy(() => import('./components/ASCIIText'));

const APPLY_URL = 'https://forms.gle/c5MmMmwd77zbBtSr8';

const HERO_FONT_FAMILY = "'Times New Roman', Times, serif";
const BIO_PLACEHOLDER = '[coming soon]';

const TEAM_SECTIONS = [
  {
    title: 'Design',
    members: [
      {
        name: 'Andre Boufama',
        imageBase: 'Andre',
        bio: "Hi I'm Andre. I like making websites and CAD and also eating"
      },
      {
        name: 'Ollie Aizer',
        imageBase: 'Ollie',
        bio: 'Hi, my name is Ollie and I like drone design and cooking.'
      },
      {
        name: 'Daniel Sheth',
        imageBase: 'Daniel',
        bio: 'I am an aspiring mechanical engineer interested in aerodynamics and propulsion systems'
      },
      {
        name: 'Josh Lennon',
        bio: BIO_PLACEHOLDER
      },
      {
        name: 'Jonathan Song',
        imageBase: 'Jon',
        bio: "I'm really passionate about integrated electronics and anything robotics. In my free time I like to play ultimate frisbee and acoustic guitar"
      },
      {
        name: 'Yuki Wykoff',
        bio: BIO_PLACEHOLDER
      }
    ]
  },
  {
    title: 'Integration',
    members: [
      {
        name: 'Nicholas Letendre',
        imageBase: 'NickLet',
        bio: "I'm Nicholas, and I am sophomore studying mechanical and aerospace engineering. I'm interested in programming for robotics and games."
      },
      {
        name: 'Mic Robbins',
        imageBase: 'Mic',
        bio: "I'm a sophmore eletrical engineer and like to play clash royale (15k)"
      },
      {
        name: 'Lindsay Kossoff',
        imageBase: 'Lindsay',
        bio: 'Hi, my name is Lindsay Kossoff. I am a freshman from Maryland studying mechanical engineering.'
      },
      {
        name: 'Christopher Guillen-Chacon',
        imageBase: 'Chris',
        bio: "My name is Chris and I'm interested in drone design"
      },
      {
        name: 'Alan Munschy',
        imageBase: 'Alan',
        bio: 'Hi, I like working on robot controls and I play chess'
      }
    ]
  },
  {
    title: 'Software',
    members: [
      {
        name: 'Nick Lennon',
        imageBase: 'NickLen',
        bio: 'Hey, my name is Nick Lennon and I am interested in software, firmware, modeling, team coordination, and spicy food!'
      },
      {
        name: 'Ronan Alo',
        imageBase: 'Ronan',
        bio: 'I am a sophomore majoring in mechanical engineering and computer science, interested in drone pathing'
      }
    ]
  },
  {
    title: 'Business',
    members: [
      {
        name: 'Hamilton Jeong',
        imageBase: 'Hamilton',
        bio: "I'm a BioStats major, I like competing in Taekwondo and playing piano"
      },
      {
        name: 'Anthony Parlatore',
        imageBase: 'Anthony',
        bio: "I'm Anthony, senior ChemE in masters of MechE interested in new technology (and I really like drones)"
      }
    ]
  }
];

const PROFESSORS = [
  {
    name: 'Prof. Jake Welde',
    imageBase: 'ProfWelde',
    formalSuffix: '_suit',
    bio: 'He has worked extensively in drone control systems'
  },
  {
    name: 'Prof. Jingjie Yeo',
    imageBase: 'ProfYeo',
    formalSuffix: '_Suit',
    bio: 'Joined Cornell in 2020 after research in Singapore and postdocs at Tufts & MIT.'
  }
];

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [formalMode, setFormalMode] = useState(false);
  const [flippedPanels, setFlippedPanels] = useState({ quad: false, hexapod: false, swallow: false });
  const [panelHoverSide, setPanelHoverSide] = useState({ quad: null, hexapod: null, swallow: null });
  const [hoverEnabled, setHoverEnabled] = useState({ quad: true, hexapod: true, swallow: true });
  const [flipDirection, setFlipDirection] = useState({ quad: 'right', hexapod: 'right', swallow: 'right' });
  const [activeBioCard, setActiveBioCard] = useState(null);
  const [teamCardTilt, setTeamCardTilt] = useState({});
  const [showAsciiText, setShowAsciiText] = useState(false);
  const [isCompactHero, setIsCompactHero] = useState(false);
  const [missionTilesPlayed, setMissionTilesPlayed] = useState(false);
  const debugCollapseTriggeredRef = useRef(false);
  const heroFontFamily = HERO_FONT_FAMILY;
  const heroAsciiConfig = isCompactHero
    ? { asciiFontSize: 7.8, textFontSize: 736, planeBaseHeight: 24, scaleMultiplier: 1.05, verticalOffset: 0.02 }
    : { asciiFontSize: 10.8, textFontSize: 384, planeBaseHeight: 12, scaleMultiplier: 1, verticalOffset: 0 };
  const heroAsciiText = isCompactHero ? 'C\nU\nP\nI' : 'CUPI';
  const heroAsciiLineSpacing = isCompactHero ? 1.08 : 1;
  const heroSubtitleText = '(Cornell University Physical Intelligence)';

  const glassSettings = {
    borderRadius: 14,
    blur: 2,
    displace: 2,
    distortionScale: -180,
    redOffset: 0,
    greenOffset: 10,
    blueOffset: 20,
    brightness: 50,
    opacity: 0.8,
    backgroundOpacity: 0,
    saturation: 1
  };

  const handleApplyClick = () => {
    window.open(APPLY_URL, '_blank', 'noopener,noreferrer');
  };

  const handleNavClick = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    document.body.classList.remove('scrolled');
  }, [currentPage]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const motionQuery = typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;

    const updateDisplayState = () => {
      const prefersReducedMotion = motionQuery?.matches ?? false;
      setShowAsciiText(!prefersReducedMotion);
      setIsCompactHero(window.innerWidth < 640);
    };

    updateDisplayState();
    motionQuery?.addEventListener('change', updateDisplayState);
    window.addEventListener('resize', updateDisplayState);

    return () => {
      motionQuery?.removeEventListener('change', updateDisplayState);
      window.removeEventListener('resize', updateDisplayState);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      if (scrollY > 0) {
        document.body.classList.add('scrolled');
        // Only trigger the debug collapse animation once per session
        if (!debugCollapseTriggeredRef.current) {
          debugCollapseTriggeredRef.current = true;
          document.body.classList.add('scrolled-once');
          setTimeout(() => {
            document.body.classList.add('debug-hidden');
          }, 500);
        }
      } else {
        document.body.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial state

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const getMemberImage = (member) => {
    const base = member.imageBase;
    if (!base) {
      return assetPath('img/People/Placeholder.png');
    }
    const suffix = formalMode ? member.formalSuffix ?? '_suit' : '';
    return assetPath(`img/People/${base}${suffix}.png`);
  };

  const getInitials = (name) =>
    name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  const clearTeamCardTilt = (cardId) => {
    setTeamCardTilt((prev) => {
      if (!prev[cardId]) return prev;
      const next = { ...prev };
      delete next[cardId];
      return next;
    });
  };

  const toggleBioCard = (cardId) => {
    setActiveBioCard((prev) => (prev === cardId ? null : cardId));
    clearTeamCardTilt(cardId);
  };

  const clearBioCard = (cardId) => {
    setActiveBioCard((prev) => (prev === cardId ? null : prev));
    clearTeamCardTilt(cardId);
  };

  const handleTeamCardMouseMove = (cardId, event) => {
    if (activeBioCard === cardId) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const side = event.clientX - rect.left < rect.width / 2 ? 'left' : 'right';
    setTeamCardTilt((prev) => (prev[cardId] === side ? prev : { ...prev, [cardId]: side }));
  };

  useEffect(() => {
    if (currentPage !== 'work') {
      setFlippedPanels({ quad: false, hexapod: false, swallow: false });
      setPanelHoverSide({ quad: null, hexapod: null, swallow: null });
      setHoverEnabled({ quad: true, hexapod: true, swallow: true });
      setFlipDirection({ quad: 'right', hexapod: 'right', swallow: 'right' });
    }
  }, [currentPage]);

  const handlePanelToggle = (panelKey) => {
    setFlippedPanels((prev) => ({
      ...prev,
      [panelKey]: !prev[panelKey]
    }));
    setFlipDirection((prev) => ({
      ...prev,
      [panelKey]: panelHoverSide[panelKey] ?? prev[panelKey] ?? 'right'
    }));
    setHoverEnabled((prev) => ({
      ...prev,
      [panelKey]: false
    }));
    setPanelHoverSide((prev) => ({
      ...prev,
      [panelKey]: null
    }));
  };

  const handlePanelMouseLeave = (panelKey) => {
    setPanelHoverSide((prev) => ({
      ...prev,
      [panelKey]: null
    }));
    setHoverEnabled((prev) => ({
      ...prev,
      [panelKey]: true
    }));
  };

  const handlePanelMouseMove = (panelKey, event) => {
    if (!hoverEnabled[panelKey]) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const side = event.clientX - rect.left < rect.width / 2 ? 'left' : 'right';

    setPanelHoverSide((prev) =>
      prev[panelKey] === side
        ? prev
        : {
            ...prev,
            [panelKey]: side
          }
    );
  };

  const renderAsciiContent = () => (
    <>
      {showAsciiText && (
        <Suspense fallback={null}>
          <ASCIIText
            text={heroAsciiText}
            asciiFontSize={heroAsciiConfig.asciiFontSize}
            textFontSize={heroAsciiConfig.textFontSize}
            planeBaseHeight={heroAsciiConfig.planeBaseHeight}
            enableWaves={false}
            textFontFamily={heroFontFamily}
            lineSpacing={heroAsciiLineSpacing}
            scaleMultiplier={heroAsciiConfig.scaleMultiplier}
            verticalOffset={heroAsciiConfig.verticalOffset}
          />
        </Suspense>
      )}
      <h1 className="main-title no-glass" style={{ fontFamily: heroFontFamily }}>
        CUPI
      </h1>
    </>
  );

  const renderHeroSection = () => {
    if (isCompactHero) {
      return (
        <section className="mobile-hero">
          <div className="mobile-hero__visual">{renderAsciiContent()}</div>
          <p className="mobile-hero__subtitle main-subtitle" style={{ fontFamily: heroFontFamily }}>
            {heroSubtitleText}
          </p>
        </section>
      );
    }

    return (
      <div className="title-wrapper">
        <div className="ascii-logo">
          <div className="ascii-logo__visual">{renderAsciiContent()}</div>
          <p className="main-subtitle" style={{ fontFamily: heroFontFamily }}>
            {heroSubtitleText}
          </p>
        </div>
      </div>
    );
  };

  const renderPage = () => {
    if (currentPage === 'home') {
      return (
        <>
          <div className={`content-section ${isCompactHero ? 'content-section--mobile-hero' : ''}`}>
            {renderHeroSection()}
            <div className="spacer" />
          </div>
          <MissionTiles played={missionTilesPlayed} onPlay={() => setMissionTilesPlayed(true)} />
          <SiteFooter />
        </>
      );
    }

    if (currentPage === 'work') {
      return (
        <main className="alt-page">
          <section className="alt-section">
            <div className="project-gallery">
              <figure
                className="project-panel"
                tabIndex={0}
                onClick={() => handlePanelToggle('quad')}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handlePanelToggle('quad');
                  }
                }}
                onMouseLeave={() => handlePanelMouseLeave('quad')}
                onMouseMove={(event) => handlePanelMouseMove('quad', event)}
              >
                <div
                  className={`project-panel__flipper ${flipDirection.quad === 'left' ? 'flip-left' : 'flip-right'} ${
                    flippedPanels.quad ? 'is-flipped' : ''
                  } ${panelHoverSide.quad ? `tilt-${panelHoverSide.quad}` : ''}`}
                  data-panel="quad"
                >
                  <div className="project-panel__face project-panel__face--front" data-zoom="in">
                    <img src={assetPath('img/Quad.png')} alt="Project 001 Quad" loading="lazy" />
                    <figcaption className="project-panel__label">Project 001 — Quad</figcaption>
                  </div>
                  <div className="project-panel__face project-panel__face--back">
                    <div className="project-panel__back-content">
                      <p className="project-panel__heading">
                        <span className="project-panel__heading-title">Quadcopter — A family of autonomy focused quadcopters</span>
                        <span className="project-panel__heading-lead">Lead: Andre</span>
                      </p>
                      <div className="project-panel__details">
                        <p>
                          CUPI’s modular quadcopters pair efficient propulsion, onboard compute, and payload-ready hardpoints into an airframe that can jump from
                          mapping flights to data-collection sorties. The large platform
                          keeps future hooks for sharing sensing duties with ground robots while remaining easy to reconfigure for new research payloads.
                        </p>
                        <p>
                          In parallel, a compact indoor drone gives the autonomy team a safe place to train <strong>AI perception</strong>. Six side-mounted cameras and full
                          prop guards let it bounce around hallways while streaming vision back to our lab compute; it is not meant to dock with the larger craft,
                          but to accelerate our model development before we graduate behaviors to the research airframe.
                        </p>
                      </div>
                    </div>
                    <img
                      src={assetPath('img/DroneFlipped.png')}
                      alt="Quadcopter render"
                      className="project-panel__back-image project-panel__back-image--offset-small"
                      loading="lazy"
                    />
                  </div>
                </div>
              </figure>
              <figure
                className="project-panel"
                tabIndex={0}
                onClick={() => handlePanelToggle('hexapod')}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handlePanelToggle('hexapod');
                  }
                }}
                onMouseLeave={() => handlePanelMouseLeave('hexapod')}
                onMouseMove={(event) => handlePanelMouseMove('hexapod', event)}
              >
                <div
                  className={`project-panel__flipper ${flipDirection.hexapod === 'left' ? 'flip-left' : 'flip-right'} ${
                    flippedPanels.hexapod ? 'is-flipped' : ''
                  } ${panelHoverSide.hexapod ? `tilt-${panelHoverSide.hexapod}` : ''}`}
                  data-panel="hexapod"
                >
                  <div className="project-panel__face project-panel__face--front" data-zoom="bird">
                    <img src={assetPath('img/Hexapod.png')} alt="Project 002 Hexapod" loading="lazy" />
                    <figcaption className="project-panel__label">Project 002 — Hexapod</figcaption>
                  </div>
                  <div className="project-panel__face project-panel__face--back">
                    <div className="project-panel__back-content">
                      <p className="project-panel__heading">
                        <span className="project-panel__heading-title">Hexapod — A highly mobile and adaptable legged robot</span>
                        <span className="project-panel__heading-lead">Lead: Alan</span>
                      </p>
                      <div className="project-panel__details">
                        <p>
                          The hexapod extends Cornell’s beach-cleaning research into a <strong>bio-inspired legged system</strong>, keeping most of the mass concentrated
                          near the core for efficiency. A <strong>Jetson Nano</strong> rides onboard for machine-vision inference and field autonomy so the platform can run
                        </p>
                        <p>
                          Each 3DOF limb relies on <strong>tendon-style linkages</strong>, clustering three servos at the first joint while mechanically transmitting motion
                          to the outer joints. That layout simplifies manufacturing, protects the actuators, and still gives the legs the travel they need to
                          navigate uneven surfaces before handing sensor data back to the aerial systems.
                        </p>
                      </div>
                    </div>
                    <img
                      src={assetPath('img/LegFlipped.png')}
                      alt="Hexapod prototype render"
                      className="project-panel__back-image project-panel__back-image--offset"
                      loading="lazy"
                    />
                  </div>
                </div>
              </figure>
              <figure
                className="project-panel"
                tabIndex={0}
                onClick={() => handlePanelToggle('swallow')}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handlePanelToggle('swallow');
                  }
                }}
                onMouseLeave={() => handlePanelMouseLeave('swallow')}
                onMouseMove={(event) => handlePanelMouseMove('swallow', event)}
              >
                <div
                  className={`project-panel__flipper ${flipDirection.swallow === 'left' ? 'flip-left' : 'flip-right'} ${
                    flippedPanels.swallow ? 'is-flipped' : ''
                  } ${panelHoverSide.swallow ? `tilt-${panelHoverSide.swallow}` : ''}`}
                  data-panel="swallow"
                >
                  <div className="project-panel__face project-panel__face--front project-panel__face--placeholder">
                    <span className="project-panel__placeholder">[?]</span>
                    <figcaption className="project-panel__label">Project 003 — Swallow</figcaption>
                  </div>
                  <div className="project-panel__face project-panel__face--back">
                    <div className="project-panel__back-content">
                      <p className="project-panel__heading">
                        <span className="project-panel__heading-title">Coming soon</span>
                        <span className="project-panel__heading-lead">Lead: TBA</span>
                      </p>
                      <div className="project-panel__details project-panel__details--icon-only">
                        <img
                          src={assetPath('img/SwallowProject.png')}
                          alt="Swallow research teaser"
                          className="project-panel__back-image project-panel__back-image--swallow"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </figure>
            </div>
          </section>
          <SiteFooter />
        </main>
      );
    }

    if (currentPage === 'about') {
      return (
        <main className="alt-page">
          <section className="alt-section alt-section--team">
            <div className="alt-section__title-row">
              <h2 className="alt-section__title">Our Team</h2>
              <label className={`formal-toggle ${formalMode ? 'formal-toggle--active' : ''}`}>
                <input
                  type="checkbox"
                  checked={formalMode}
                  onChange={() => setFormalMode((prev) => !prev)}
                  aria-label="Toggle formal portraits"
                />
                <span className="formal-toggle__track">
                  <span className="formal-toggle__thumb" />
                </span>
                <span className="formal-toggle__text">Formal Mode</span>
              </label>
            </div>
            <div className="team-sections">
              {TEAM_SECTIONS.map((section) => (
                <div className="team-section" key={section.title}>
                  <div className="team-section__header">
                    <h3>{section.title}</h3>
                  </div>
                  <div className="team-grid">
                    {section.members.map((member) => {
                      const photoSrc = getMemberImage(member);
                      const bio = member.bio ?? BIO_PLACEHOLDER;
                      const isPlaceholderBio = bio === BIO_PLACEHOLDER;
                      const cardId = `${section.title}-${member.name}`;
                      const isFlipped = activeBioCard === cardId;

                      return (
                        <article
                          className={`team-card ${isFlipped ? 'is-flipped' : ''} ${
                            teamCardTilt[cardId] ? `tilt-${teamCardTilt[cardId]}` : ''
                          }`}
                          key={member.name}
                          tabIndex={0}
                          onClick={() => toggleBioCard(cardId)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              toggleBioCard(cardId);
                            }
                          }}
                          onMouseMove={(event) => handleTeamCardMouseMove(cardId, event)}
                          onMouseLeave={() => clearTeamCardTilt(cardId)}
                          onBlur={(event) => {
                            if (!event.currentTarget.contains(event.relatedTarget)) {
                              clearBioCard(cardId);
                            }
                          }}
                        >
                          <div className="team-card__flipper">
                            <div className="team-card__face team-card__face--front">
                              <div className="team-card__photo">
                                {photoSrc ? (
                                  <img src={photoSrc} alt={member.name} loading="lazy" />
                                ) : (
                                  <span className="team-card__photo-placeholder">{getInitials(member.name)}</span>
                                )}
                              </div>
                              <div className="team-card__body">
                                <p className="team-card__name">{member.name}</p>
                              </div>
                            </div>
                            <div className="team-card__face team-card__face--back">
                              <p className={`team-card__bio ${isPlaceholderBio ? 'team-card__bio--placeholder' : ''}`}>
                                {bio}
                              </p>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div className="team-section team-section--professors">
                <div className="team-section__header">
                  <h3>Faculty</h3>
                </div>
                <div className="team-grid team-grid--professors">
                  {PROFESSORS.map((prof) => {
                    const photoSrc = getMemberImage(prof);
                    const bio = prof.bio ?? BIO_PLACEHOLDER;
                    const isPlaceholderBio = bio === BIO_PLACEHOLDER;
                    const cardId = `Faculty-${prof.name}`;
                    const isFlipped = activeBioCard === cardId;

                    return (
                      <article
                        className={`team-card ${isFlipped ? 'is-flipped' : ''} ${
                          teamCardTilt[cardId] ? `tilt-${teamCardTilt[cardId]}` : ''
                        }`}
                        key={prof.name}
                        tabIndex={0}
                        onClick={() => toggleBioCard(cardId)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            toggleBioCard(cardId);
                          }
                        }}
                        onMouseMove={(event) => handleTeamCardMouseMove(cardId, event)}
                        onMouseLeave={() => clearTeamCardTilt(cardId)}
                        onBlur={(event) => {
                          if (!event.currentTarget.contains(event.relatedTarget)) {
                            clearBioCard(cardId);
                          }
                        }}
                      >
                        <div className="team-card__flipper">
                          <div className="team-card__face team-card__face--front">
                            <div className="team-card__photo">
                              {photoSrc ? (
                                <img src={photoSrc} alt={prof.name} loading="lazy" />
                              ) : (
                                <span className="team-card__photo-placeholder">{getInitials(prof.name)}</span>
                              )}
                            </div>
                            <div className="team-card__body">
                              <p className="team-card__name">{prof.name}</p>
                            </div>
                          </div>
                          <div className="team-card__face team-card__face--back">
                            <p className={`team-card__bio ${isPlaceholderBio ? 'team-card__bio--placeholder' : ''}`}>
                              {bio}
                            </p>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
          <SiteFooter />
        </main>
      );
    }

    return null;
  };

  return (
    <div className="demo-container">
      <GridBackground />
      <nav className="menu-bar">
        <GlassSurface 
          width="auto"
          height={44}
          {...glassSettings}
        >
          <div className="menu-content">
            <button
              onClick={() => handleNavClick('home')}
              className={`menu-item ${currentPage === 'home' ? 'active' : ''}`}
            >
              HOME
              {currentPage === 'home' && <span className="menu-dot" />}
            </button>
            <button
              onClick={() => handleNavClick('work')}
              className={`menu-item ${currentPage === 'work' ? 'active' : ''}`}
            >
              WORK
              {currentPage === 'work' && <span className="menu-dot" />}
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className={`menu-item ${currentPage === 'about' ? 'active' : ''}`}
            >
              ABOUT
              {currentPage === 'about' && <span className="menu-dot" />}
            </button>
            <button 
              onClick={handleApplyClick}
              className="menu-item"
              type="button"
            >
              APPLY
            </button>
          </div>
        </GlassSurface>
      </nav>

      {renderPage()}
    </div>
  );
}

export default App;
