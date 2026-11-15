# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and [Semantic Versioning](https://semver.org/).

## [Unreleased] - 2026-11-15
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
