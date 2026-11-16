# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and [Semantic Versioning](https://semver.org/).

## [Unreleased] - 2026-11-16 (part 3)
### Added
- Hidden History & Conspiracies catalog (38 entries) with claim, evidence and verdict, plus a theme timeline.
- Story, rivalries/hidden history and impact sections for 20 major inventions; 11 new inventions (atomic bomb, television, cinema, AC grid, X-rays, radar, DNA, polio vaccine, the pill, microchip, space rocket).
- 20 science and invention events, 16 inventors (Bell, Meucci, the Wright brothers, Oppenheimer, Meitner, Franklin and others), 24 research papers.
### Changed (depth)
- All 117 short biographies rewritten in full.
- Daily life and culture rewritten for African, Middle Eastern and South Asian empires.
- The 29 newer events gained full causes, course and consequences sections; all paper summaries expanded.

## [Unreleased] - 2026-11-16 (part 2)
### Changed (depth)
- All 247 original events gained a 'Causes, course and consequences' section.
- Rewrote all eras, human species, festivals and peoples and tribes in depth.
- Rewrote Europe, Americas and modern empires (US, British Empire, Soviet Union, Russian, Spanish, Portuguese, Byzantine and others) in depth.
- Rewrote 97 short biographies (Churchill, Roosevelt, Stalin, Hitler, Mao, Gandhi, Nehru, Ambedkar, scientists and philosophers).
### Added
- 115 historical figures: writers, artists and entertainers, philosophers, scientists, explorers, revolutionaries, rulers and tyrants.
- `scripts/make_links.py`: two-way links between people and the empires, dynasties, events and beliefs they belong to.

## [Unreleased] - 2026-11-16
### Changed (depth)
- Rewrote every civilisation's government, architecture, technology, rise, fall, legacy and food as researched multi-sentence accounts (86 civilisations).
- Rewrote how each of the 98 dynasties rose and lost power.
- Expanded people biographies.
### Added
- Manuscripts & Texts catalog (44 entries), linked to civilisations, people, beliefs and languages.
- Six theme timelines: religions, languages and writing, technology, manuscripts, rulers and dynasties, wars, plagues and disasters.
- 29 events (Out of Africa, Bantu and Austronesian expansions, Indo-European migrations, Nalanda, Mansa Musa's hajj and more), 32 people, 12 beliefs and 15 languages.

## [Unreleased] - 2026-11-15
### Added (expansion)
- Branching regional timeline: an SVG swimlane of civilisations and dynasties, plus 10 region timelines (`history/scripts/make_timelines.py`).
- New catalogs: 27 human species, 98 dynasties (with how each rose and fell) and 52 languages; 146 more events tagged by region; 38 more inventions.
- Each civilisation now covers its government, construction, technology, rise, fall and legacy.
- 25 new articles on human evolution, fire, language, iron, empires and regional histories.
- Links between related entries across all catalogs.
### Added
- `history/`: Cultural Time Machine Encyclopedia with 40 eras, 86 civilisations, 101 events, 87 people, 48 sites, 31 peoples and tribes, 36 festivals, 32 religions and scripts, 43 inventions, 23 extinct species and 14 papers, plus 23 in-depth articles.
- Animated statistics, a live archaeology tracker, an embers hero animation, scroll-reveal and count-up animations.
- `scripts/copy-history.js`, run on `predev` and `prebuild`, serves the encyclopedia at `/history/index.html` in the Next.js app; the home page links to it.
- GitHub Actions: `history-pages.yml` (build, link check, Pages deploy) and `history-fetch-papers.yml` (open-access PDF mirror).
- `history/prompts.md`: Nano Banana prompts for every entry.

## [Unreleased] - 2026-11-13

### Documentation
- Rewrote README with badges, preview, feature & tech-stack tables, architecture diagram and roadmap
- Added `docs/ARCHITECTURE.md` (components, data flow, design decisions)
- Added `docs/ROADMAP.md` (milestones and long-term vision)
- Added real project visuals (demo GIFs / screenshots), SSH / GitHub CLI / ZIP / Codespaces access options and a `.devcontainer`

## [1.0.0] - 2026-01-16

### Added
- Historical chat
- Eras & locations
- Daily-life facts
- Visual reconstruction
- Soundscapes
- Notebooks
- Offline-capable
