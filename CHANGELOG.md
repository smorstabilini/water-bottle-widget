# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
The version lives in the `VERSION` constant at the top of `acqua.js`.

## [Unreleased]

## [1.0.0] — 2026-09-10

First tagged release.

### Added
- Scriptable script that computes how much the water bottle should weigh at each
  checkpoint to finish a target amount by a set time (default `08:45 → 22:00`,
  2000 ml, tare 29 g, checkpoint every 15 min).
- Home-screen **widget** (small / medium): current target weight, millilitres
  left, progress bar, next checkpoint.
- In-app **menu** with a full checkpoint **table**, current row highlighted.
- **Settings editor** (start, end, water, tare, interval) persisted to
  `acqua-config.json`; no code editing needed.
- **Reminder notifications** every 15 / 30 / 60 minutes, or off. Schedules all
  remaining checkpoints for the day (plus following days when they fit under the
  iOS ~60 pending-notification limit).
- **Bilingual** Italian / English with an in-app switch; `"auto"` follows the
  phone language.
- **Self-update**: once a day the script compares its `VERSION` with `acqua.js`
  on `main` and rewrites itself when a newer version is available. Wrapped in
  `try/catch` with a timeout so it degrades to fully offline. Toggle with
  `autoUpdate`.
- **`VERSION` constant** shown in the menu title and the table header, plus a
  **Check for updates** menu action.
- Per-widget overrides via the widget **Parameter** (JSON).
- **GitHub Pages** site (`docs/index.html`): install instructions, a copy-script
  button that fetches the raw file, and a live browser version of the table.
- MIT `LICENSE`.

[Unreleased]: https://github.com/smorstabilini/water-bottle-widget/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/smorstabilini/water-bottle-widget/releases/tag/v1.0.0
