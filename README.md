# Acqua / Water — Scriptable widget

A tiny [Scriptable](https://scriptable.app/) script that tells you **how much your
water bottle should weigh right now** so that you finish a fixed amount of water
by a target time.

Put a kitchen scale under the bottle, compare with the number the widget shows,
and drink until it matches.

- Runs as a **home‑screen widget** (small or medium) and as an **in‑app view**
  with the full schedule.
- Optional **reminder notifications** every 15 / 30 / 60 minutes (or off).
- **Bilingual**: Italian / English, with an in‑app language switch.
- **Self‑updating** from this repo once a day (can be turned off).
- **Works offline.** No server, no account. Network is used only for the daily
  update check, and only if `autoUpdate` is on.

**Install page + browser version:** <https://smorstabilini.github.io/water-bottle-widget/>

---

## How the numbers work

Given a start time (full bottle), an end time (empty bottle), the amount of water
to drink and the empty‑bottle tare:

```
full weight      = water_ml + tare_g            (ml treated as g)
checkpoints (n)  = floor((end - start) / interval)
per checkpoint   = water_ml / n
target weight(k) = full weight − per_checkpoint × k
```

`k` is the number of checkpoints already elapsed since the start time. Before the
start the target is the full weight; after the end it is the tare.

**Defaults:** `08:45 → 22:00`, `2000 ml`, tare `29 g`, checkpoint every `15 min`
→ 53 checkpoints, ~37.7 g per quarter hour.

---

## Install

You do **not** need a Mac or a cable. The script is a plain `.js` text file.

### 1. Install Scriptable

Get **Scriptable** from the App Store (free).

### 2. Get `acqua.js` onto the iPhone

Pick whichever is easiest:

| Method | Steps |
| --- | --- |
| **Share the file** | Send `acqua.js` to yourself (email, Telegram, WhatsApp…). On the iPhone open it → **Share** → **Scriptable**. |
| **Copy / paste** | Open `acqua.js` on the phone, select all, copy. In Scriptable tap **+**, paste, then rename the script to `Acqua` from the settings (wrench) menu. |
| **iCloud Drive (browser)** | On [icloud.com](https://icloud.com) → *Drive* there is a **Scriptable** folder (it appears after the app is installed). Upload `acqua.js` there and it shows up in the app automatically. |

After this you should see a script named **Acqua** in Scriptable. Tap it to open
the menu (current target, full table, settings, language).

### 3. Add the widget

1. Long‑press the home screen → **+** → search **Scriptable** → choose **Small**
   or **Medium** → **Add Widget**.
2. Long‑press the new widget → **Edit Widget**.
3. Set **Script** to **Acqua**. Leave **When Interacting** on *Run Script* so
   tapping the widget opens the full table.

---

## Usage

### Widget

Shows, depending on the time of day:

- before start — the full‑bottle weight and the start time;
- during the day — the **target weight now** (big number), millilitres left, a
  progress bar, and the next checkpoint;
- after end — "empty / done".

The widget refreshes roughly every 5 minutes (iOS decides the exact timing).

### In‑app menu

Tap the script (or the widget) to get:

- **See full table** — every checkpoint from start to end, with the current row
  highlighted, weight in grams and water left in millilitres.
- **Edit settings** — see below.
- **Notifiche / Notifications** — reminder cadence: *off*, *every 15 min*,
  *every 30 min*, *every hour*.
- **Lingua / Language** — *Automatic* (follow the phone), *Italiano*, *English*.
- **Controlla aggiornamenti / Check for updates** — compare the installed
  `VERSION` with `main` on GitHub.
- **Reset to defaults** — restores everything except the chosen language, and
  clears any scheduled reminders.

---

## Configuration

Open the script in Scriptable → **Edit settings**:

| Field | Meaning | Default |
| --- | --- | --- |
| Start (HH:MM) | bottle is full / first sip | `08:45` |
| End (HH:MM) | bottle must be empty | `22:00` |
| Water to drink, in ml | total to drink (1 ml ≈ 1 g) | `2000` |
| Empty bottle, in g | tare on the scale | `29` |
| Interval in minutes | minutes between checkpoints | `15` |
| `notificaMin` | reminder cadence in minutes: `0`, `15`, `30`, `60` | `0` |
| `autoUpdate` | check GitHub once a day and self-update | `true` |

Settings are stored in `acqua-config.json` in Scriptable's local documents
folder. The code itself is never edited.

The very first values live at the top of `acqua.js` in `DEFAULT_CONFIG` if you
prefer to change the defaults before installing.

### Multiple profiles (advanced)

Each widget can carry its own overrides via **Edit Widget → Parameter** as a JSON
snippet, e.g. a weekend widget:

```json
{"acquaML": 2500, "inizio": "10:00", "fine": "23:00"}
```

Recognised keys: `inizio`, `fine`, `acquaML`, `bottigliaVuotaG`,
`intervalloMin`, `notificaMin`, `autoUpdate`, `lingua`. Anything you set here
overrides the saved settings for that widget only.

---

## Version

The script carries a `VERSION` constant (semver `major.minor.patch`) near the
top of `acqua.js`. It is shown in the **menu title** and the **table header**
(`… · v1.0.0`), so you can read off the installed version at a glance.

Menu → **Controlla aggiornamenti / Check for updates** compares it with the
`VERSION` in `acqua.js` on `main` and tells you *"you're on the latest version"*,
*"updated — reopen it"*, or *"can't check right now"*.

**When publishing a change:** bump `VERSION`, then optionally tag the commit:

```sh
git tag v1.0.1 && git push --tags
```

The auto-updater triggers on the `VERSION` number being higher, so a change with
the same version is not pushed to phones even if the file differs.

## Auto-update

When `autoUpdate` is `true` (default), the script checks `acqua.js` on the
`main` branch at most once every 24 hours and, **if its `VERSION` is higher**,
overwrites its own file. The new version is picked up the next time the script
runs. You get a short notice ("Reopen it to use it").

- The check is wrapped in `try/catch` with a 12‑second timeout: **if there is no
  network or GitHub is unreachable, nothing happens and the script keeps running
  the version already installed.**
- The last-check timestamp and version live in `acqua-update.json`.
- Because it follows `main`, a bad commit with a bumped version reaches the phone
  on the next check.
  Set `autoUpdate` to `false` in `acqua-config.json` (or via the widget
  Parameter) if you'd rather update by hand.
- To update immediately, delete `acqua-update.json` in Scriptable's Files and
  reopen the script.

---

## Notifications

Open the script → **Notifiche / Notifications** and pick a cadence: *off*,
*every 15 / 30 / 60 minutes*. Each reminder shows the target weight for that
moment, e.g. *"Bottle should weigh ≈ 1180 g · 900 ml left"*, and a final
"empty bottle" one at the end time.

**First time:** iOS asks for notification permission when you pick a cadence.
If you tapped *Don't Allow*, enable it in *Settings › Scriptable ›
Notifications* and pick the cadence again.

**How scheduling works (important):** Scriptable can only schedule notifications
in advance, not "repeat forever". The script schedules every reminder from now
until the end time — and, when they fit under the iOS limit of ~60 pending
notifications, the next days too (so 30‑ or 60‑minute cadence covers several
days ahead, 15‑minute covers the rest of today). The schedule is refreshed
every time you open the script **or** the widget reloads.

To make reminders reliable day after day without thinking about it, add a
**daily automation**:

1. **Shortcuts app** → *Automation* → *New* → *Time of Day*.
2. Set it a few minutes before your start time, *Run Immediately*, turn off
   *Notify When Run*.
3. Action: **Run Script** (Scriptable) → **Acqua**.

That re-arms the full day's reminders each morning.

To stop reminders, pick **No notifications** in the menu (this also clears the
pending ones) and delete the automation if you made one.

---

## Language

- `lingua` = `"auto"` (default), `"it"` or `"en"`.
- `"auto"` follows the iPhone language: Italian system → Italian, otherwise
  English.
- The switch in the menu applies to both the in‑app screens and the widget.

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Widget shows "Invalid config" | Open the script → **Edit settings**; check the times are `HH:MM` and that end is after start. |
| Widget not updating | iOS throttles widget refreshes; open the script once to force a redraw. Tapping the widget also opens the app. |
| Wrong language on the widget | Set the language explicitly in the menu (not *Automatic*), or add `{"lingua":"en"}` to the widget Parameter. |
| Numbers differ slightly from a hand calculation | The script rounds each displayed value; the underlying steps are exact fractions of the total. |
| No notifications arrive | Check permission in *Settings › Scriptable › Notifications*, then re‑pick the cadence. Reminders past the scheduled horizon need the script or widget to run again — see the daily automation above. |
| Reminders stopped after a day or two | Expected without the daily automation; open the script or add the *Time of Day* automation. |

---

## Files

- `acqua.js` — the Scriptable script (script + widget in one file).
- `docs/index.html` — the GitHub Pages install page + browser calculator.
- `acqua-config.json` — created on the phone by Scriptable when you save settings.
- `acqua-update.json` — created on the phone; holds the last update-check time.

## License

MIT — see [LICENSE](LICENSE).
