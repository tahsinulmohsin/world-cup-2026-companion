# Changelog

All notable changes to this project are documented here.
This project follows [Semantic Versioning](https://semver.org/).

## [1.8.1] — 2026-06-28

### Fixed
- **Live Match Coverage now shows ALL simultaneous matches**, not just one. The `/api/live-commentary` endpoint was using `.find()` to pick a single match from ESPN's scoreboard, discarding all other concurrent matches. Now fetches all matches with commentary in parallel. The `LiveCommentary` component adds a match switcher tab bar with team names, live scores, and red pulse indicators when multiple matches are available.

## [1.8.0] — 2026-06-25

### Added
- **Concurrent match switcher** on the match detail page: when multiple matches share the same kickoff time (common on final group-stage matchdays), a horizontal pill strip appears between the hero and watch sections, letting users hop between simultaneous matches without going back to the fixtures list. Includes team badges, live score display, live pulse indicators, and auto-scroll to the current match.

## [1.0.0] — 2026-06-12

### Added
Initial production-ready release. See `RELEASE_NOTES_v1.0.0.md` for the full feature list.
