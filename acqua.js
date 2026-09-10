// ============================================================
//  ACQUA / WATER — Scriptable
//
//  IT: dice quanto deve pesare la bottiglia "adesso" per finire
//      l'acqua all'orario previsto (logica a checkpoint, come la
//      tabella: un valore ogni 15 minuti di default).
//  EN: tells you how much the bottle should weigh "now" so you
//      finish the water by the target time (checkpoint logic,
//      like the table: one value every 15 minutes by default).
//
//  - WIDGET (small / medium): peso obiettivo attuale / current target
//  - SCRIPT in app: menu con tabella + impostazioni + notifiche + lingua
//  - NOTIFICHE opzionali ogni 15 / 30 / 60 minuti
//
//  100% offline. Nessun server. / No server.
// ============================================================

// Versione dello script / script version (semver: major.minor.patch).
// Va incrementata a ogni modifica pubblicata su main.
const VERSION = "1.0.0";


// ---------- CONFIG DI DEFAULT / DEFAULT CONFIG ----------
const DEFAULT_CONFIG = {
  inizio: "08:45",       // full bottle / first sip
  fine: "22:00",         // must be empty by
  acquaML: 2000,         // water to drink (1 ml = 1 g)
  bottigliaVuotaG: 29,   // empty bottle tare
  intervalloMin: 15,     // minutes between checkpoints
  notificaMin: 0,        // reminder cadence: 0 (off) | 15 | 30 | 60
  autoUpdate: true,      // check GitHub once a day and self-update
  lingua: "auto",        // "auto" | "it" | "en"
};

const NOTIF_PREFIX = "acqua-";   // identifica le notifiche di questo script

// sorgente per l'auto-aggiornamento / self-update source
const UPDATE_URL = "https://raw.githubusercontent.com/smorstabilini/water-bottle-widget/main/acqua.js";
const UPDATE_EVERY_MS = 24 * 60 * 60 * 1000;
const UPDATE_SENTINEL = "ACQUA / WATER";


// ---------- traduzioni / translations ----------
const STR = {
  it: {
    header: "💧  ACQUA",
    err_title: "💧 Config non valida",
    w_empty_big: "Vuota 🎉",
    w_empty_sub: (fine) => `obiettivo raggiunto (${fine})`,
    w_notstarted_sub: (inizio) => `bottiglia piena · via alle ${inizio}`,
    w_left: (x) => `restano ${x} ml`,
    w_next: (x, time) => `prossimo: ${x} g · ${time}`,

    t_header: (a, b, ml, v) => `💧 ${a}–${b}  ·  ${ml} ml  ·  v${v}`,
    t_empty: "Bottiglia vuota",
    t_now: (x) => `Adesso ≈ ${x} g`,
    t_left: (x) => `restano ${x} ml`,
    t_next_g: (x) => `→ ${x} g`,
    t_at: (time) => `alle ${time}`,

    m_title: "💧 Acqua",
    m_finished: (x) => `Orario finito. Bottiglia vuota (${x} g).`,
    m_started: (x, y) => `Adesso ≈ ${x} g\nrestano ${y} ml`,
    m_notstarted: (x) => `Non ancora iniziato.\nBottiglia piena: ${x} g`,
    a_table: "Vedi tabella completa",
    a_settings: "Modifica impostazioni",
    a_notify: "Notifiche / Notifications",
    a_language: "Lingua / Language",
    a_update: "Controlla aggiornamenti",
    a_reset: "Ripristina valori di default",
    a_close: "Chiudi",

    e_start: "Orario 'inizio' non valido (usa HH:MM)",
    e_end: "Orario 'fine' non valido (usa HH:MM)",
    e_order: "'fine' deve essere dopo 'inizio'",
    e_water: "l'acqua da bere deve essere maggiore di 0",
    e_interval: "Intervallo troppo grande per la finestra oraria",
    cfg_invalid: "Configurazione non valida",

    ec_title: "Impostazioni acqua",
    ec_msg: "Orari in formato HH:MM. Lascia vuoto per non cambiare.",
    ec_start: "Inizio (HH:MM)",
    ec_end: "Fine (HH:MM)",
    ec_water: "Acqua da bere in ml",
    ec_tare: "Bottiglia vuota in g",
    ec_interval: "Intervallo in minuti",

    saved_warn: "Salvato, ma attenzione",
    reset_title: "Ripristinato",
    reset_msg: "Impostazioni riportate ai valori di default.",

    nt_title: "Notifiche",
    nt_msg: "Ogni quanto ricordarti il peso obiettivo?",
    nt_off: "Nessuna notifica",
    nt_15: "Ogni 15 minuti",
    nt_30: "Ogni 30 minuti",
    nt_60: "Ogni ora",
    nt_disabled: "Notifiche disattivate.",
    nt_enabled: (min, count) => `Promemoria ogni ${min} min.\nNotifiche programmate: ${count}.`,
    nt_denied: "Permesso notifiche negato. Attivalo in Impostazioni › Scriptable › Notifiche.",
    n_title: "💧 Acqua",
    n_body: (peso, ml) => `La bottiglia deve pesare ≈ ${peso} g · restano ${ml} ml`,
    n_body_done: (tare) => `Fine! La bottiglia deve essere vuota (${tare} g) 🎉`,

    lang_title: "Lingua / Language",
    lang_auto: "Automatico (come il telefono)",
    lang_updated: "Lingua aggiornata.",

    upd_title: "Aggiornamenti",
    upd_msg: "Script aggiornato all'ultima versione da GitHub. Riaprilo per usarla.",
    upd_latest: (v) => `Sei già alla versione più recente (v${v}).`,
    upd_error: "Impossibile controllare ora. Riprova quando sei online.",

    btn_save: "Salva",
    btn_cancel: "Annulla",
    btn_ok: "OK",
  },
  en: {
    header: "💧  WATER",
    err_title: "💧 Invalid config",
    w_empty_big: "Empty 🎉",
    w_empty_sub: (fine) => `goal reached (${fine})`,
    w_notstarted_sub: (inizio) => `full bottle · starts at ${inizio}`,
    w_left: (x) => `${x} ml left`,
    w_next: (x, time) => `next: ${x} g · ${time}`,

    t_header: (a, b, ml, v) => `💧 ${a}–${b}  ·  ${ml} ml  ·  v${v}`,
    t_empty: "Empty bottle",
    t_now: (x) => `Now ≈ ${x} g`,
    t_left: (x) => `${x} ml left`,
    t_next_g: (x) => `→ ${x} g`,
    t_at: (time) => `at ${time}`,

    m_title: "💧 Water",
    m_finished: (x) => `Time's up. Empty bottle (${x} g).`,
    m_started: (x, y) => `Now ≈ ${x} g\n${y} ml left`,
    m_notstarted: (x) => `Not started yet.\nFull bottle: ${x} g`,
    a_table: "See full table",
    a_settings: "Edit settings",
    a_notify: "Notifiche / Notifications",
    a_language: "Lingua / Language",
    a_update: "Check for updates",
    a_reset: "Reset to defaults",
    a_close: "Close",

    e_start: "'start' time invalid (use HH:MM)",
    e_end: "'end' time invalid (use HH:MM)",
    e_order: "'end' must be after 'start'",
    e_water: "water to drink must be greater than 0",
    e_interval: "Interval too large for the time window",
    cfg_invalid: "Invalid configuration",

    ec_title: "Water settings",
    ec_msg: "Times as HH:MM. Leave blank to keep current value.",
    ec_start: "Start (HH:MM)",
    ec_end: "End (HH:MM)",
    ec_water: "Water to drink, in ml",
    ec_tare: "Empty bottle, in g",
    ec_interval: "Interval in minutes",

    saved_warn: "Saved, but note",
    reset_title: "Reset done",
    reset_msg: "Settings restored to defaults.",

    nt_title: "Notifications",
    nt_msg: "How often should I remind you of the target weight?",
    nt_off: "No notifications",
    nt_15: "Every 15 minutes",
    nt_30: "Every 30 minutes",
    nt_60: "Every hour",
    nt_disabled: "Notifications turned off.",
    nt_enabled: (min, count) => `Reminders every ${min} min.\nScheduled notifications: ${count}.`,
    nt_denied: "Notification permission denied. Enable it in Settings › Scriptable › Notifications.",
    n_title: "💧 Water",
    n_body: (peso, ml) => `Bottle should weigh ≈ ${peso} g · ${ml} ml left`,
    n_body_done: (tare) => `Done! Bottle should be empty (${tare} g) 🎉`,

    lang_title: "Lingua / Language",
    lang_auto: "Automatic (match phone)",
    lang_updated: "Language updated.",

    upd_title: "Updates",
    upd_msg: "Script updated to the latest version from GitHub. Reopen it to use it.",
    upd_latest: (v) => `You're on the latest version (v${v}).`,
    upd_error: "Can't check right now. Try again when online.",

    btn_save: "Save",
    btn_cancel: "Cancel",
    btn_ok: "OK",
  },
};

let LANG = "it";
function T(key) {
  return (STR[LANG] && STR[LANG][key] !== undefined) ? STR[LANG][key] : STR.it[key];
}

function resolveLang(cfg) {
  const pref = String((cfg && cfg.lingua) || "auto").toLowerCase();
  if (pref === "it" || pref === "en") return pref;
  let sys = "";
  try { sys = String(Device.language() || "").toLowerCase(); } catch (e) {}
  if (!sys) { try { sys = String(Device.locale() || "").toLowerCase(); } catch (e) {} }
  return sys.startsWith("it") ? "it" : "en";
}


// ---------- persistenza config / config storage ----------
const fm = FileManager.local();
const CONFIG_PATH = fm.joinPath(fm.documentsDirectory(), "acqua-config.json");

function loadConfig() {
  let cfg = { ...DEFAULT_CONFIG };
  try {
    if (fm.fileExists(CONFIG_PATH)) {
      cfg = { ...cfg, ...JSON.parse(fm.readString(CONFIG_PATH)) };
    }
  } catch (e) {
    // file rovinato: uso i default / broken file: use defaults
  }
  return cfg;
}

function saveConfig(cfg) {
  fm.writeString(CONFIG_PATH, JSON.stringify(cfg, null, 2));
}


// ---------- auto-aggiornamento / self-update ----------
const UPDATE_STAMP = fm.joinPath(fm.documentsDirectory(), "acqua-update.json");

function lastUpdateCheck() {
  try {
    if (fm.fileExists(UPDATE_STAMP)) return JSON.parse(fm.readString(UPDATE_STAMP)).t || 0;
  } catch (e) {}
  return 0;
}

function parseVer(s) {
  return String(s || "").trim().split(".").map((x) => parseInt(x, 10) || 0);
}
// -1 se a<b, 0 se uguali, 1 se a>b
function cmpVer(a, b) {
  const A = parseVer(a), B = parseVer(b);
  const len = Math.max(A.length, B.length);
  for (let i = 0; i < len; i++) {
    const d = (A[i] || 0) - (B[i] || 0);
    if (d !== 0) return d < 0 ? -1 : 1;
  }
  return 0;
}
function extractVersion(src) {
  const m = /VERSION\s*=\s*["']([\d.]+)["']/.exec(String(src || ""));
  return m ? m[1] : null;
}

// Confronta la versione locale con quella su GitHub e, se piu' recente,
// riscrive questo file. Ritorna: "updated" | "latest" | "error" | "throttled".
// silent=true (widget): nessun alert, solo notifica se aggiorna.
// force=true: ignora il limite giornaliero.
// La rete serve SOLO per il check: se fallisce, lo script continua com'e'.
async function checkForUpdate(silent, force) {
  if (!force && Date.now() - lastUpdateCheck() < UPDATE_EVERY_MS) return "throttled";

  let remote;
  try {
    const req = new Request(UPDATE_URL);
    req.timeoutInterval = 12;
    remote = await req.loadString();
  } catch (e) {
    return "error";
  }

  // segna il tentativo comunque, per non ritentare a ogni avvio
  try { fm.writeString(UPDATE_STAMP, JSON.stringify({ t: Date.now(), v: VERSION })); } catch (e) {}

  if (!remote || remote.length < 2000 || remote.indexOf(UPDATE_SENTINEL) === -1) return "error";

  const remoteVer = extractVersion(remote);
  const path = module.filename;
  let local = "";
  try { local = fm.readString(path); } catch (e) {}

  const newer = remoteVer ? cmpVer(remoteVer, VERSION) > 0 : (remote !== local);
  if (!newer) return "latest";

  fm.writeString(path, remote);

  if (silent) {
    try {
      const n = new Notification();
      n.identifier = "acqua-updated-" + Date.now();
      n.title = T("n_title");
      n.body = T("upd_msg");
      n.threadIdentifier = "acqua";
      await n.schedule();
    } catch (e) {}
  } else {
    const a = new Alert();
    a.title = T("upd_title");
    a.message = T("upd_msg") + (remoteVer ? `\n\nv${VERSION} → v${remoteVer}` : "");
    a.addAction(T("btn_ok"));
    await a.presentAlert();
  }
  return "updated";
}


// ---------- utilita' tempo / time helpers ----------
function parseHM(s) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(s).trim());
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

function fmtHM(mins) {
  mins = ((Math.round(mins) % 1440) + 1440) % 1440;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function g(x) { return Math.round(x); }


// ---------- calcolo / model ----------
function computeModel(cfg, now) {
  const start = parseHM(cfg.inizio);
  const end = parseHM(cfg.fine);
  const step = Math.max(1, Math.round(Number(cfg.intervalloMin) || 0));
  const water = Number(cfg.acquaML);
  const tare = Number(cfg.bottigliaVuotaG) || 0;
  const full = water + tare;

  const errors = [];
  if (start == null) errors.push(T("e_start"));
  if (end == null) errors.push(T("e_end"));
  if (start != null && end != null && end <= start) errors.push(T("e_order"));
  if (!(water > 0)) errors.push(T("e_water"));
  if (start != null && end != null && end > start &&
      Math.floor((end - start) / step) < 1) errors.push(T("e_interval"));
  if (errors.length) return { errors };

  const n = Math.floor((end - start) / step);   // checkpoint dopo l'inizio / after start
  const perStep = water / n;                     // g per intervallo / per interval

  const nowMin = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

  let k;
  if (nowMin <= start) k = 0;
  else if (nowMin >= end) k = n;
  else k = Math.floor((nowMin - start) / step);

  const nextK = Math.min(k + 1, n);

  const rows = [];
  for (let i = 0; i <= n; i++) {
    rows.push({
      time: start + i * step,
      peso: full - perStep * i,
      acqua: water - perStep * i,
      current: i === k,
    });
  }

  return {
    cfg, full, water, tare, n, perStep, k,
    targetNow: full - perStep * k,
    acquaRimasta: water - perStep * k,
    nextTarget: full - perStep * nextK,
    nextTime: start + nextK * step,
    rows,
    started: nowMin > start,
    finished: nowMin >= end,
  };
}

// peso obiettivo (g) e acqua rimasta (ml) a un dato minuto della giornata
function targetAt(cfg, minuteOfDay) {
  const start = parseHM(cfg.inizio);
  const end = parseHM(cfg.fine);
  const step = Math.max(1, Math.round(Number(cfg.intervalloMin) || 15));
  const water = Number(cfg.acquaML);
  const tare = Number(cfg.bottigliaVuotaG) || 0;
  const full = water + tare;
  const n = Math.floor((end - start) / step);
  const perStep = water / n;
  let k;
  if (minuteOfDay <= start) k = 0;
  else if (minuteOfDay >= end) k = n;
  else k = Math.floor((minuteOfDay - start) / step);
  return { peso: full - perStep * k, acqua: water - perStep * k, atEnd: minuteOfDay >= end };
}


// ---------- notifiche / notifications ----------
async function removeOurPending() {
  try {
    const pending = await Notification.allPending();
    const ids = pending
      .filter((n) => String(n.identifier || "").startsWith(NOTIF_PREFIX))
      .map((n) => n.identifier);
    if (ids.length) await Notification.removePending(ids);
  } catch (e) { /* ignore */ }
}

async function countOurFuturePending() {
  try {
    const pending = await Notification.allPending();
    const now = Date.now();
    return pending.filter((n) =>
      String(n.identifier || "").startsWith(NOTIF_PREFIX) &&
      n.nextTriggerDate && new Date(n.nextTriggerDate).getTime() > now
    ).length;
  } catch (e) {
    return 0;
  }
}

// (ri)programma tutte le notifiche fino a riempire ~60 slot. Ritorna quante ne ha messe.
async function scheduleNotifications(cfg) {
  await removeOurPending();

  const every = Math.round(Number(cfg.notificaMin) || 0);
  const start = parseHM(cfg.inizio);
  const end = parseHM(cfg.fine);
  if (!every || start == null || end == null || end <= start) return 0;

  const step = Math.max(1, Math.round(Number(cfg.intervalloMin) || 15));
  if (Math.floor((end - start) / step) < 1) return 0;
  if (!(Number(cfg.acquaML) > 0)) return 0;

  const perDay = Math.floor((end - start) / every) + 1;
  const maxDays = Math.max(1, Math.min(7, Math.floor(60 / Math.max(1, perDay))));

  const now = new Date();
  const nowMs = now.getTime();
  const L = STR[LANG] || STR.it;
  let count = 0;

  for (let d = 0; d < maxDays && count < 60; d++) {
    for (let m = start; m <= end && count < 60; m += every) {
      const when = new Date(now);
      when.setDate(now.getDate() + d);
      when.setHours(Math.floor(m / 60), m % 60, 0, 0);
      if (when.getTime() <= nowMs + 30 * 1000) continue;

      const tgt = targetAt(cfg, m);
      const notif = new Notification();
      notif.identifier = NOTIF_PREFIX + when.getTime();
      notif.title = L.n_title;
      notif.body = tgt.atEnd ? L.n_body_done(g(tgt.peso)) : L.n_body(g(tgt.peso), g(tgt.acqua));
      notif.sound = "default";
      notif.threadIdentifier = "acqua";
      notif.setTriggerDate(when);
      try {
        await notif.schedule();
        count++;
      } catch (e) {
        return -1; // permesso negato o errore
      }
    }
  }
  return count;
}

// mantiene le notifiche "cariche" senza rifare tutto ogni volta
async function ensureNotifications(cfg, force) {
  if (!Number(cfg.notificaMin)) {
    await removeOurPending();
    return;
  }
  if (!force && (await countOurFuturePending()) >= 4) return;
  await scheduleNotifications(cfg);
}


// ---------- barra di avanzamento / progress bar ----------
function progressImage(frac, width, height, hex) {
  frac = Math.max(0, Math.min(1, frac));
  const dc = new DrawContext();
  dc.size = new Size(width, height);
  dc.opaque = false;
  dc.respectScreenScale = true;

  const bg = new Path();
  bg.addRoundedRect(new Rect(0, 0, width, height), height / 2, height / 2);
  dc.addPath(bg);
  dc.setFillColor(new Color(hex, 0.22));
  dc.fillPath();

  const fw = Math.max(height, width * frac);
  const fg = new Path();
  fg.addRoundedRect(new Rect(0, 0, fw, height), height / 2, height / 2);
  dc.addPath(fg);
  dc.setFillColor(new Color(hex, 1));
  dc.fillPath();

  return dc.getImage();
}


// ---------- widget ----------
const ACCENT = "#3a86ff";

function errorWidget(model) {
  const w = new ListWidget();
  w.setPadding(16, 16, 16, 16);
  const t = w.addText(T("err_title"));
  t.font = Font.semiboldSystemFont(13);
  w.addSpacer(4);
  const d = w.addText(model.errors.join("\n"));
  d.font = Font.systemFont(10);
  d.textColor = Color.gray();
  return w;
}

function buildWidget(model) {
  const w = new ListWidget();
  w.setPadding(16, 16, 16, 16);

  const head = w.addText(T("header"));
  head.font = Font.semiboldSystemFont(11);
  head.textColor = Color.gray();
  w.addSpacer(8);

  if (model.finished) {
    const big = w.addText(T("w_empty_big"));
    big.font = Font.boldSystemFont(28);
    const sub = w.addText(T("w_empty_sub")(model.cfg.fine));
    sub.font = Font.systemFont(11);
    sub.textColor = Color.gray();
    w.addSpacer();
    return w;
  }

  if (!model.started) {
    const big = w.addText(`${g(model.full)} g`);
    big.font = Font.boldSystemFont(30);
    w.addSpacer(2);
    const sub = w.addText(T("w_notstarted_sub")(model.cfg.inizio));
    sub.font = Font.systemFont(11);
    sub.textColor = Color.gray();
    w.addSpacer();
    return w;
  }

  const big = w.addText(`${g(model.targetNow)} g`);
  big.font = Font.boldSystemFont(36);
  w.addSpacer(2);

  const sub = w.addText(T("w_left")(g(model.acquaRimasta)));
  sub.font = Font.systemFont(12);
  sub.textColor = Color.gray();

  w.addSpacer(9);
  const isSmall = config.widgetFamily === "small";
  const barW = isSmall ? 110 : 280;
  const img = w.addImage(progressImage(model.k / model.n, barW, 8, ACCENT));
  img.imageSize = new Size(barW, 8);

  w.addSpacer(6);
  const nx = w.addText(T("w_next")(g(model.nextTarget), fmtHM(model.nextTime)));
  nx.font = Font.systemFont(10);
  nx.textColor = Color.gray();

  w.addSpacer();
  w.refreshAfterDate = new Date(Date.now() + 5 * 60 * 1000);
  return w;
}


// ---------- tabella completa / full table ----------
function presentTable(model) {
  const table = new UITable();
  table.showSeparators = true;

  const header = new UITableRow();
  header.isHeader = true;
  header.addText(T("t_header")(model.cfg.inizio, model.cfg.fine, model.water, VERSION));
  table.addRow(header);

  const summary = new UITableRow();
  summary.height = 62;
  const s1 = summary.addText(
    model.finished ? T("t_empty") : T("t_now")(g(model.targetNow)),
    model.finished ? `${g(model.full - model.water)} g` : T("t_left")(g(model.acquaRimasta))
  );
  s1.widthWeight = 62;
  const s2 = summary.addText(
    model.finished ? "" : T("t_next_g")(g(model.nextTarget)),
    model.finished ? "" : T("t_at")(fmtHM(model.nextTime))
  );
  s2.widthWeight = 38;
  table.addRow(summary);

  for (const r of model.rows) {
    const row = new UITableRow();
    const a = row.addText(fmtHM(r.time), `${g(r.acqua)} ml`);
    a.widthWeight = 42;
    const b = row.addText(`${g(r.peso)} g`);
    b.widthWeight = 58;
    if (r.current) row.backgroundColor = new Color(ACCENT, 0.18);
    table.addRow(row);
  }

  table.present(false);
}


// ---------- editor impostazioni / settings editor ----------
async function editConfig(cfg) {
  const a = new Alert();
  a.title = T("ec_title");
  a.message = T("ec_msg");
  a.addTextField(T("ec_start"), cfg.inizio);
  a.addTextField(T("ec_end"), cfg.fine);
  a.addTextField(T("ec_water"), String(cfg.acquaML));
  a.addTextField(T("ec_tare"), String(cfg.bottigliaVuotaG));
  a.addTextField(T("ec_interval"), String(cfg.intervalloMin));
  a.addAction(T("btn_save"));
  a.addCancelAction(T("btn_cancel"));
  if ((await a.presentAlert()) === -1) return null;

  const num = (s, fallback) => {
    const v = parseFloat(String(s).replace(",", "."));
    return isNaN(v) ? fallback : v;
  };

  return {
    ...cfg,
    inizio: a.textFieldValue(0).trim() || cfg.inizio,
    fine: a.textFieldValue(1).trim() || cfg.fine,
    acquaML: num(a.textFieldValue(2), cfg.acquaML),
    bottigliaVuotaG: num(a.textFieldValue(3), cfg.bottigliaVuotaG),
    intervalloMin: Math.round(num(a.textFieldValue(4), cfg.intervalloMin)),
  };
}


// ---------- scelta notifiche / notification picker ----------
async function chooseNotify(cfg) {
  const a = new Alert();
  a.title = T("nt_title");
  a.message = T("nt_msg");
  a.addAction(T("nt_off"));
  a.addAction(T("nt_15"));
  a.addAction(T("nt_30"));
  a.addAction(T("nt_60"));
  a.addCancelAction(T("btn_cancel"));
  const i = await a.presentSheet();
  const map = { 0: 0, 1: 15, 2: 30, 3: 60 };
  if (!(i in map)) return null;

  const nc = { ...cfg, notificaMin: map[i] };
  saveConfig(nc);
  const count = await scheduleNotifications(nc);

  const e = new Alert();
  e.title = T("btn_ok");
  if (count === -1) e.message = T("nt_denied");
  else if (map[i] === 0) e.message = T("nt_disabled");
  else e.message = T("nt_enabled")(map[i], count);
  e.addAction(T("btn_ok"));
  await e.presentAlert();
  return nc;
}


// ---------- scelta lingua / language picker ----------
async function chooseLanguage(cfg) {
  const a = new Alert();
  a.title = T("lang_title");
  a.addAction(T("lang_auto"));
  a.addAction("Italiano");
  a.addAction("English");
  a.addCancelAction(T("btn_cancel"));
  const i = await a.presentSheet();
  const map = { 0: "auto", 1: "it", 2: "en" };
  if (!(i in map)) return null;

  const nc = { ...cfg, lingua: map[i] };
  saveConfig(nc);
  LANG = resolveLang(nc);
  await scheduleNotifications(nc); // rigenera i testi delle notifiche nella nuova lingua

  const e = new Alert();
  e.title = T("btn_ok");
  e.message = T("lang_updated");
  e.addAction(T("btn_ok"));
  await e.presentAlert();
  return nc;
}


// ---------- main ----------
async function main() {
  let settings = loadConfig();

  // Profilo alternativo dal "Parametro" del widget / alternate profile from widget parameter
  //   es. {"acquaML":2500,"fine":"23:00","lingua":"en"}
  if (args.widgetParameter) {
    try { settings = { ...settings, ...JSON.parse(args.widgetParameter) }; }
    catch (e) { /* parametro non JSON / not JSON: ignore */ }
  }

  LANG = resolveLang(settings);

  const model = computeModel(settings, new Date());

  if (config.runsInWidget) {
    await ensureNotifications(settings, false);
    Script.setWidget(model.errors ? errorWidget(model) : buildWidget(model));
    if (settings.autoUpdate !== false) await checkForUpdate(true, false);
    Script.complete();
    return;
  }

  // --- dentro l'app / inside the app ---
  if (settings.autoUpdate !== false) await checkForUpdate(false, false);
  await ensureNotifications(settings, false);

  if (model.errors) {
    const a = new Alert();
    a.title = T("cfg_invalid");
    a.message = model.errors.join("\n");
    a.addAction(T("a_settings"));
    a.addAction(T("a_language"));
    a.addCancelAction(T("a_close"));
    const i = await a.presentAlert();
    if (i === 0) {
      const nc = await editConfig(settings);
      if (nc) { saveConfig(nc); await ensureNotifications(nc, true); }
    } else if (i === 1) {
      await chooseLanguage(settings);
    }
    return;
  }

  const menu = new Alert();
  menu.title = `${T("m_title")}  ·  v${VERSION}`;
  menu.message = model.finished
    ? T("m_finished")(g(model.full - model.water))
    : (model.started
        ? T("m_started")(g(model.targetNow), g(model.acquaRimasta))
        : T("m_notstarted")(g(model.full)));
  menu.addAction(T("a_table"));      // 0
  menu.addAction(T("a_settings"));   // 1
  menu.addAction(T("a_notify"));     // 2
  menu.addAction(T("a_language"));   // 3
  menu.addAction(T("a_update"));     // 4
  menu.addAction(T("a_reset"));      // 5
  menu.addCancelAction(T("a_close"));
  const choice = await menu.presentSheet();

  if (choice === 0) {
    presentTable(model);

  } else if (choice === 1) {
    const nc = await editConfig(settings);
    if (nc) {
      saveConfig(nc);
      const m2 = computeModel(nc, new Date());
      if (m2.errors) {
        const e = new Alert();
        e.title = T("saved_warn");
        e.message = m2.errors.join("\n");
        e.addAction(T("btn_ok"));
        await e.presentAlert();
      } else {
        await ensureNotifications(nc, true);
        presentTable(m2);
      }
    }

  } else if (choice === 2) {
    await chooseNotify(settings);

  } else if (choice === 3) {
    await chooseLanguage(settings);

  } else if (choice === 4) {
    const st = await checkForUpdate(false, true); // "updated" mostra gia' il suo alert
    if (st === "latest" || st === "error") {
      const e = new Alert();
      e.title = T("upd_title");
      e.message = st === "latest" ? T("upd_latest")(VERSION) : T("upd_error");
      e.addAction(T("btn_ok"));
      await e.presentAlert();
    }

  } else if (choice === 5) {
    const nc = { ...DEFAULT_CONFIG, lingua: settings.lingua };
    saveConfig(nc);
    await ensureNotifications(nc, true); // notificaMin = 0 → pulisce le notifiche
    const e = new Alert();
    e.title = T("reset_title");
    e.message = T("reset_msg");
    e.addAction(T("btn_ok"));
    await e.presentAlert();
  }
}

await main();
