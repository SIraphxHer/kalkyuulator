'use strict';

/* ════════════════════════════════════════
   STATE & ROUTER
════════════════════════════════════════ */
const state = {
  currentRoom: 'room-landing',
  history: []
};

function go(roomId) {
  document.getElementById(state.currentRoom).classList.remove('active');
  document.getElementById(roomId).classList.add('active');
  state.currentRoom = roomId;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  renderHistoryAll();
  /* Init dynamic input panels saat room dibuka */
  if (roomId === 'room-elec') { buildOhmInputs(); buildPwrInputs(); }
  if (roomId === 'room-phys') { buildVelInputs(); buildNewtInputs(); buildWaveInputs(); }
}

/* ════════════════════════════════════════
   HISTORY SYSTEM
   ─ addHistory(tool, result)  → tambah entri
   ─ renderHistoryAll()        → sync semua panel
   ─ clearHistory()            → kosongkan
   ─ Untuk room baru: tambah pasangan id di HIST_PANELS
════════════════════════════════════════ */
const HIST_PANELS = [
  { list: 'history-list-global', empty: 'hist-empty-global' },
  { list: 'history-list-2d',     empty: 'hist-empty-2d'     },
  { list: 'history-list-3d',     empty: 'hist-empty-3d'     },
  { list: 'history-list-elec',   empty: 'hist-empty-elec'   },
  { list: 'history-list-phys',   empty: 'hist-empty-phys'   },
];

function ts() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function addHistory(tool, result) {
  state.history.unshift({ time: ts(), tool, result });
  if (state.history.length > 100) state.history.pop();
  renderHistoryAll();
}

function renderHistoryAll() {
  HIST_PANELS.forEach(({ list, empty }) => {
    const listEl  = document.getElementById(list);
    const emptyEl = document.getElementById(empty);
    if (!listEl) return;

    /* Hapus entri lama */
    listEl.querySelectorAll('.history-entry').forEach(e => e.remove());

    if (state.history.length === 0) {
      if (emptyEl) emptyEl.style.display = 'block';
      return;
    }
    if (emptyEl) emptyEl.style.display = 'none';

    state.history.forEach(h => {
      const div = document.createElement('div');
      div.className = 'history-entry';
      div.innerHTML =
        `<span class="ts">[${h.time}]</span>` +
        `<span class="tool">${h.tool}</span>→ ${h.result}`;
      listEl.appendChild(div);
    });
  });
}

function clearHistory() {
  state.history = [];
  renderHistoryAll();
}

/* ════════════════════════════════════════
   HELPERS
════════════════════════════════════════ */
/** Format angka ke locale Indonesia, max 6 desimal */
function fmt(n, decimals = 4) {
  if (!isFinite(n) || isNaN(n)) return '—';
  return parseFloat(n.toFixed(decimals))
    .toLocaleString('id-ID', { maximumFractionDigits: 6 });
}

/** Baca nilai input sebagai float */
function val(id) {
  const el = document.getElementById(id);
  return el ? parseFloat(el.value) : NaN;
}

/** Set teks elemen */
function set(id, v) {
  const el = document.getElementById(id);
  if (el) el.textContent = v;
}

/** Derajat → radian */
function deg2rad(d) { return d * Math.PI / 180; }


/* ════════════════════════════════════════
   BANGUN DATAR (2D)
════════════════════════════════════════ */

function calcCircle() {
  const r = val('c-r');
  if (isNaN(r) || r < 0) { set('c-area','—'); set('c-peri','—'); return; }
  const area = Math.round(Math.PI * r * r);
  const peri = Math.round(2 * Math.PI * r);
  set('c-area', area.toLocaleString('id-ID'));
  set('c-peri', peri.toLocaleString('id-ID'));
  if (r > 0) addHistory('Lingkaran', `Luas=${area} | Kel=${peri}`);
}

function calcSquare() {
  const s = val('sq-s');
  if (isNaN(s) || s < 0) { set('sq-area','—'); set('sq-peri','—'); return; }
  set('sq-area', fmt(s * s));
  set('sq-peri', fmt(4 * s));
  if (s > 0) addHistory('Persegi', `Luas=${fmt(s*s)} | Kel=${fmt(4*s)}`);
}

function calcRect() {
  const p = val('rect-p'), l = val('rect-l');
  if (isNaN(p) || isNaN(l) || p < 0 || l < 0) { set('rect-area','—'); set('rect-peri','—'); return; }
  set('rect-area', fmt(p * l));
  set('rect-peri', fmt(2 * (p + l)));
  if (p > 0 && l > 0) addHistory('Persegi Panjang', `Luas=${fmt(p*l)} | Kel=${fmt(2*(p+l))}`);
}

function calcTriangle() {
  const a = val('tri-a'), t = val('tri-t');
  const b = val('tri-b'), c = val('tri-c');
  if (isNaN(a) || isNaN(t) || a < 0 || t < 0) { set('tri-area','—'); set('tri-peri','—'); return; }
  const area = 0.5 * a * t;
  set('tri-area', fmt(area));
  if (!isNaN(b) && !isNaN(c) && b >= 0 && c >= 0) {
    const peri = a + b + c;
    set('tri-peri', fmt(peri));
    if (a > 0 && t > 0) addHistory('Segitiga', `Luas=${fmt(area)} | Kel=${fmt(peri)}`);
  } else {
    set('tri-peri', '—');
  }
}

function calcTrap() {
  const a = val('trap-a'), b = val('trap-b'), t = val('trap-t'), cd = val('trap-cd');
  if (isNaN(a) || isNaN(b) || isNaN(t)) { set('trap-area','—'); set('trap-peri','—'); return; }
  const area = 0.5 * (a + b) * t;
  set('trap-area', fmt(area));
  if (!isNaN(cd)) {
    const peri = a + b + cd;
    set('trap-peri', fmt(peri));
    if (a > 0 && t > 0) addHistory('Trapesium', `Luas=${fmt(area)} | Kel=${fmt(peri)}`);
  } else {
    set('trap-peri', '—');
  }
}

function calcPara() {
  const a = val('para-a'), t = val('para-t'), b = val('para-b');
  if (isNaN(a) || isNaN(t)) { set('para-area','—'); set('para-peri','—'); return; }
  const area = a * t;
  set('para-area', fmt(area));
  if (!isNaN(b)) {
    const peri = 2 * (a + b);
    set('para-peri', fmt(peri));
    if (a > 0 && t > 0) addHistory('Jajargenjang', `Luas=${fmt(area)} | Kel=${fmt(peri)}`);
  } else {
    set('para-peri', '—');
  }
}


/* ════════════════════════════════════════
   BANGUN RUANG (3D)
════════════════════════════════════════ */

function calcSphere() {
  const r = val('sph-r');
  if (isNaN(r) || r <= 0) { set('sph-vol','—'); set('sph-sa','—'); return; }
  const vol = Math.round((4 / 3) * Math.PI * Math.pow(r, 3));
  const sa  = Math.round(4 * Math.PI * r * r);
  set('sph-vol', vol.toLocaleString('id-ID'));
  set('sph-sa',  sa.toLocaleString('id-ID'));
  addHistory('Bola', `Vol=${vol} | LP=${sa}`);
}

function calcCube() {
  const s = val('cube-s');
  if (isNaN(s) || s <= 0) { set('cube-vol','—'); set('cube-sa','—'); return; }
  const vol = Math.pow(s, 3);
  const sa  = 6 * s * s;
  set('cube-vol', fmt(vol));
  set('cube-sa',  fmt(sa));
  addHistory('Kubus', `Vol=${fmt(vol)} | LP=${fmt(sa)}`);
}

/* BALOK — V = p×l×t | LP = 2(pl + pt + lt) */
function calcBalok() {
  const p = val('blk-p'), l = val('blk-l'), t = val('blk-t');
  if (isNaN(p) || isNaN(l) || isNaN(t) || p <= 0 || l <= 0 || t <= 0) {
    set('blk-vol','—'); set('blk-sa','—'); return;
  }
  const vol = p * l * t;
  const sa  = 2 * (p*l + p*t + l*t);
  set('blk-vol', fmt(vol));
  set('blk-sa',  fmt(sa));
  addHistory('Balok', `Vol=${fmt(vol)} | LP=${fmt(sa)}`);
}

/* TABUNG — V = π r² t | LP = 2πr(r+t) | LS = 2πrt */
function calcCylinder() {
  const r = val('cyl-r'), t = val('cyl-t');
  if (isNaN(r) || isNaN(t) || r <= 0 || t <= 0) {
    set('cyl-vol','—'); set('cyl-sa','—'); set('cyl-ls','—'); return;
  }

  const vol = Math.PI * r * r * t;
  const sa  = 2 * Math.PI * r * (r + t);
  const ls  = 2 * Math.PI * r * t;

  set('cyl-vol', Math.round(vol));
  set('cyl-sa',  Math.round(sa));
  set('cyl-ls',  Math.round(ls));

  addHistory('Tabung', `Vol=${Math.round(vol)} | LP=${Math.round(sa)} | LS=${Math.round(ls)}`);
}

/* KERUCUT — V = ⅓πr²t | LP = πr(r+s) | s = √(r²+t²) */
function calcCone() {
  const r = val('cone-r'), t = val('cone-t');
  if (isNaN(r) || isNaN(t) || r <= 0 || t <= 0) {
    set('cone-vol','—'); set('cone-sa','—'); set('cone-s','—'); return;
  }

  const s   = Math.sqrt(r * r + t * t);
  const vol = (1 / 3) * Math.PI * r * r * t;
  const sa  = Math.PI * r * (r + s);

  set('cone-vol', Math.round(vol));
  set('cone-sa',  Math.round(sa));
  set('cone-s',   Math.round(s));

  addHistory('Kerucut', `Vol=${Math.round(vol)} | LP=${Math.round(sa)} | s=${Math.round(s)}`);
}

/* LIMAS SEGIEMPAT — V = ⅓s²t | t.selimut = √((s/2)²+t²) | LP = s² + 4×(½×s×ts) */
function calcLimas() {
  const s = val('lim-s'), t = val('lim-t');
  if (isNaN(s) || isNaN(t) || s <= 0 || t <= 0) {
    set('lim-vol','—'); set('lim-sa','—'); set('lim-sm','—'); return;
  }
  const ts  = Math.sqrt(Math.pow(s / 2, 2) + Math.pow(t, 2));  /* tinggi selimut */
  const vol = (1 / 3) * s * s * t;
  const sa  = s * s + 4 * (0.5 * s * ts);
  set('lim-vol', fmt(vol));
  set('lim-sa',  fmt(sa));
  set('lim-sm',  fmt(ts));
  addHistory('Limas Segiempat', `Vol=${fmt(vol)} | LP=${fmt(sa)} | Ts=${fmt(ts)}`);
}


/* ════════════════════════════════════════
   KELISTRIKAN
════════════════════════════════════════ */

/* Pembagi Tegangan */
function calcVoltageDivider() {
  const vin = val('vd-vin'), r1 = val('vd-r1'), r2 = val('vd-r2');
  if (isNaN(vin) || isNaN(r1) || isNaN(r2) || r1 <= 0 || r2 <= 0) {
    set('vd-vout','—'); set('vd-vout-sub',''); return;
  }
  const vout = vin * (r2 / (r1 + r2));
  set('vd-vout', fmt(vout, 4) + ' V');
  set('vd-vout-sub', `Vin=${fmt(vin)}V | R1=${fmt(r1)}Ω | R2=${fmt(r2)}Ω`);
  addHistory('Pembagi Tegangan', `Vout=${fmt(vout,4)}V`);
}

/* Hukum Ohm — build input dinamis sesuai pilihan */
function buildOhmInputs() {
  const find = document.getElementById('ohm-find')?.value || 'V';
  const map  = {
    V: ['Arus I (A)', 'Hambatan R (Ω)'],
    I: ['Tegangan V (V)', 'Hambatan R (Ω)'],
    R: ['Tegangan V (V)', 'Arus I (A)'],
  };
  const [lbl1, lbl2] = map[find];
  document.getElementById('ohm-inputs').innerHTML =
    inputPair('ohm-a', lbl1, 'calcOhm()') +
    inputPair('ohm-b', lbl2, 'calcOhm()');
  const resLabel = { V:'Tegangan (V)', I:'Arus (I)', R:'Hambatan (R)' };
  set('ohm-res-label', resLabel[find]);
  set('ohm-result', '—');
  set('ohm-res-unit', '');
}

function calcOhm() {
  const find = document.getElementById('ohm-find')?.value;
  const a = parseFloat(document.getElementById('ohm-a')?.value);
  const b = parseFloat(document.getElementById('ohm-b')?.value);
  if (isNaN(a) || isNaN(b) || a <= 0 || b <= 0) { set('ohm-result','—'); return; }
  let res, unit;
  if (find === 'V') { res = a * b; unit = 'Volt';    addHistory('Ohm (V)', `V=${fmt(res)}V | I=${fmt(a)}A | R=${fmt(b)}Ω`); }
  if (find === 'I') { res = a / b; unit = 'Ampere';  addHistory('Ohm (I)', `I=${fmt(res)}A | V=${fmt(a)}V | R=${fmt(b)}Ω`); }
  if (find === 'R') { res = a / b; unit = 'Ohm (Ω)'; addHistory('Ohm (R)', `R=${fmt(res)}Ω | V=${fmt(a)}V | I=${fmt(b)}A`); }
  set('ohm-result',  fmt(res, 6) + ' ' + unit.split(' ')[0]);
  set('ohm-res-unit', unit);
}

/* Daya Listrik */
function buildPwrInputs() {
  const find = document.getElementById('pwr-find')?.value || 'P';
  const map  = {
    P: ['Tegangan V (V)', 'Arus I (A)'],
    V: ['Daya P (W)',     'Arus I (A)'],
    I: ['Daya P (W)',     'Tegangan V (V)'],
  };
  const [lbl1, lbl2] = map[find];
  document.getElementById('pwr-inputs').innerHTML =
    inputPair('pwr-a', lbl1, 'calcPower()') +
    inputPair('pwr-b', lbl2, 'calcPower()');
  const resLabel = { P:'Daya (P)', V:'Tegangan (V)', I:'Arus (I)' };
  set('pwr-res-label', resLabel[find]);
  set('pwr-result', '—');
  set('pwr-res-unit', '');
}

function calcPower() {
  const find = document.getElementById('pwr-find')?.value;
  const a = parseFloat(document.getElementById('pwr-a')?.value);
  const b = parseFloat(document.getElementById('pwr-b')?.value);
  if (isNaN(a) || isNaN(b) || a <= 0 || b <= 0) { set('pwr-result','—'); return; }
  let res, unit;
  if (find === 'P') { res = a * b; unit = 'Watt';   addHistory('Daya (P)', `P=${fmt(res)}W`); }
  if (find === 'V') { res = a / b; unit = 'Volt';   addHistory('Daya (V)', `V=${fmt(res)}V`); }
  if (find === 'I') { res = a / b; unit = 'Ampere'; addHistory('Daya (I)', `I=${fmt(res)}A`); }
  set('pwr-result',  fmt(res, 6) + ' ' + unit.split(' ')[0]);
  set('pwr-res-unit', unit);
}

/* Energi & Biaya Listrik */
function calcEnergy() {
  const w = val('en-watt'), h = val('en-hours'), d = val('en-days'), tarif = val('en-tariff');
  if (isNaN(w) || isNaN(h) || isNaN(d) || w < 0 || h < 0 || d < 0) {
    set('en-kwh','—'); set('en-cost','—'); return;
  }
  const kwh = (w / 1000) * h * d;
  set('en-kwh', fmt(kwh, 4) + ' kWh');
  if (!isNaN(tarif) && tarif > 0) {
    const cost = kwh * tarif;
    set('en-cost', 'Rp ' + Math.round(cost).toLocaleString('id-ID'));
    addHistory('Energi & Biaya', `${fmt(kwh,4)}kWh | Rp${Math.round(cost).toLocaleString('id-ID')}`);
  } else {
    set('en-cost', '—');
  }
}


/* ════════════════════════════════════════
   FISIKA — MEKANIKA & GERAK
════════════════════════════════════════ */

/* GLB: v = s / t  (input dinamis) */
function buildVelInputs() {
  const find = document.getElementById('vel-find')?.value || 'v';
  const map = {
    v: ['Jarak s (m)', 'Waktu t (s)'],
    s: ['Kecepatan v (m/s)', 'Waktu t (s)'],
    t: ['Jarak s (m)', 'Kecepatan v (m/s)'],
  };
  const [lbl1, lbl2] = map[find];
  document.getElementById('vel-inputs').innerHTML =
    inputPair('vel-a', lbl1, 'calcVel()') +
    inputPair('vel-b', lbl2, 'calcVel()');
  const resLabel = { v:'Kecepatan (v) m/s', s:'Jarak (s) meter', t:'Waktu (t) detik' };
  set('vel-res-label', resLabel[find]);
  set('vel-result', '—');
  set('vel-res-unit', '');
}

function calcVel() {
  const find = document.getElementById('vel-find')?.value;
  const a = parseFloat(document.getElementById('vel-a')?.value);
  const b = parseFloat(document.getElementById('vel-b')?.value);
  if (isNaN(a) || isNaN(b) || b <= 0) { set('vel-result','—'); return; }
  let res, unit;
  if (find === 'v') { res = a / b; unit = 'm/s';   }
  if (find === 's') { res = a * b; unit = 'meter'; }
  if (find === 't') { res = a / b; unit = 'detik'; }
  set('vel-result',  fmt(res, 4));
  set('vel-res-unit', unit);
  addHistory('GLB', `${find}=${fmt(res,4)} ${unit}`);
}

/* GLBB: vt = v0 + a·t  |  s = v0·t + ½·a·t² */
function calcGLBB() {
  const v0 = val('glbb-v0'), a = val('glbb-a'), t = val('glbb-t');
  if (isNaN(v0) || isNaN(a) || isNaN(t)) { set('glbb-vt','—'); set('glbb-s','—'); return; }
  const vt = v0 + a * t;
  const s  = v0 * t + 0.5 * a * t * t;
  set('glbb-vt', fmt(vt, 4) + ' m/s');
  set('glbb-s',  fmt(s, 4) + ' m');
  addHistory('GLBB', `vₜ=${fmt(vt,4)}m/s | s=${fmt(s,4)}m`);
}

/* Gerak Jatuh Bebas: t = √(2h/g)  |  v = g·t */
function calcGJB() {
  const h = val('gjb-h'), g = val('gjb-g') || 9.8;
  if (isNaN(h) || h < 0) { set('gjb-t','—'); set('gjb-v','—'); return; }
  const t = Math.sqrt(2 * h / g);
  const v = g * t;
  set('gjb-t', fmt(t, 4) + ' s');
  set('gjb-v', fmt(v, 4) + ' m/s');
  if (h > 0) addHistory('Jatuh Bebas', `t=${fmt(t,4)}s | v=${fmt(v,4)}m/s`);
}

/* Newton II: F = m·a  (input dinamis) */
function buildNewtInputs() {
  const find = document.getElementById('newt-find')?.value || 'F';
  const map = {
    F: ['Massa m (kg)',      'Percepatan a (m/s²)'],
    m: ['Gaya F (N)',        'Percepatan a (m/s²)'],
    a: ['Gaya F (N)',        'Massa m (kg)'],
  };
  const [lbl1, lbl2] = map[find];
  document.getElementById('newt-inputs').innerHTML =
    inputPair('newt-a', lbl1, 'calcNewton()') +
    inputPair('newt-b', lbl2, 'calcNewton()');
  const resLabel = { F:'Gaya F (Newton)', m:'Massa m (kg)', a:'Percepatan a (m/s²)' };
  set('newt-res-label', resLabel[find]);
  set('newt-result', '—');
  set('newt-res-unit', '');
}

function calcNewton() {
  const find = document.getElementById('newt-find')?.value;
  const a = parseFloat(document.getElementById('newt-a')?.value);
  const b = parseFloat(document.getElementById('newt-b')?.value);
  if (isNaN(a) || isNaN(b)) { set('newt-result','—'); return; }
  let res, unit;
  if (find === 'F') { res = a * b; unit = 'Newton'; }
  if (find === 'm') { res = b !== 0 ? a / b : NaN; unit = 'kg'; }
  if (find === 'a') { res = b !== 0 ? a / b : NaN; unit = 'm/s²'; }
  if (!isFinite(res)) { set('newt-result','—'); return; }
  set('newt-result',  fmt(res, 4));
  set('newt-res-unit', unit);
  addHistory('Newton II', `${find}=${fmt(res,4)} ${unit}`);
}


/* ════════════════════════════════════════
   FISIKA — ENERGI & USAHA
════════════════════════════════════════ */

/* Usaha: W = F × s × cos θ */
function calcWork() {
  const f  = val('wk-f');
  const s  = val('wk-s');
  const th = val('wk-th');
  if (isNaN(f) || isNaN(s)) { set('wk-result','—'); return; }
  const theta = isNaN(th) ? 0 : th;
  const w = f * s * Math.cos(deg2rad(theta));
  set('wk-result', fmt(w, 4) + ' J');
  addHistory('Usaha', `W=${fmt(w,4)}J | F=${fmt(f)}N | s=${fmt(s)}m | θ=${theta}°`);
}

/* Ek = ½mv²   |   Ep = m·g·h */
function calcEnergy2() {
  const m = val('en2-m');
  const v = val('en2-v');
  const h = val('en2-h');
  const g = val('en2-g') || 9.8;

  if (isNaN(m) || m < 0) { set('en2-ek','—'); set('en2-ep','—'); return; }

  if (!isNaN(v)) {
    const ek = 0.5 * m * v * v;
    set('en2-ek', fmt(ek, 4) + ' J');
    addHistory('Energi Kinetik', `Ek=${fmt(ek,4)}J`);
  } else {
    set('en2-ek', '—');
  }

  if (!isNaN(h) && h >= 0) {
    const ep = m * g * h;
    set('en2-ep', fmt(ep, 4) + ' J');
    addHistory('Energi Potensial', `Ep=${fmt(ep,4)}J`);
  } else {
    set('en2-ep', '—');
  }
}


/* ════════════════════════════════════════
   FISIKA — GELOMBANG & BUNYI
════════════════════════════════════════ */

/* v = λ × f  (input dinamis) */
function buildWaveInputs() {
  const find = document.getElementById('wave-find')?.value || 'v';
  const map = {
    v:   ['Panjang gelombang λ (m)', 'Frekuensi f (Hz)'],
    lam: ['Kecepatan v (m/s)',       'Frekuensi f (Hz)'],
    f:   ['Kecepatan v (m/s)',       'Panjang gelombang λ (m)'],
  };
  const [lbl1, lbl2] = map[find];
  document.getElementById('wave-inputs').innerHTML =
    inputPair('wave-a', lbl1, 'calcWave()') +
    inputPair('wave-b', lbl2, 'calcWave()');
  const resLabel = { v:'Kecepatan v (m/s)', lam:'Panjang Gelombang λ (m)', f:'Frekuensi f (Hz)' };
  set('wave-res-label', resLabel[find]);
  set('wave-result', '—');
  set('wave-res-unit', '');
}

function calcWave() {
  const find = document.getElementById('wave-find')?.value;
  const a = parseFloat(document.getElementById('wave-a')?.value);
  const b = parseFloat(document.getElementById('wave-b')?.value);
  if (isNaN(a) || isNaN(b) || b <= 0) { set('wave-result','—'); return; }
  let res, unit;
  if (find === 'v')   { res = a * b; unit = 'm/s';  }
  if (find === 'lam') { res = a / b; unit = 'meter'; }
  if (find === 'f')   { res = a / b; unit = 'Hz';   }
  set('wave-result',  fmt(res, 4));
  set('wave-res-unit', unit);
  addHistory('Gelombang', `${find}=${fmt(res,4)} ${unit}`);
}

/* T = 1/f */
function calcPeriodeFromF() {
  const f = val('per-f');
  if (isNaN(f) || f <= 0) { set('per-tres','—'); set('per-fres','—'); return; }
  const T = 1 / f;
  set('per-tres', fmt(T, 6) + ' s');
  set('per-fres', fmt(f, 4) + ' Hz');
  addHistory('Periode/Frekuensi', `T=${fmt(T,6)}s | f=${fmt(f,4)}Hz`);
}

/* f = 1/T */
function calcPeriodeFromT() {
  const T = val('per-t');
  if (isNaN(T) || T <= 0) { set('per-tres','—'); set('per-fres','—'); return; }
  const f = 1 / T;
  set('per-tres', fmt(T, 6) + ' s');
  set('per-fres', fmt(f, 4) + ' Hz');
  addHistory('Periode/Frekuensi', `T=${fmt(T,6)}s | f=${fmt(f,4)}Hz`);
}

/* Taraf Intensitas Bunyi: TI = 10 × log10(I / I₀) */
function calcSound() {
  const I  = val('snd-i');
  const I0 = val('snd-i0');
  if (isNaN(I) || isNaN(I0) || I <= 0 || I0 <= 0) { set('snd-result','—'); return; }
  const TI = 10 * Math.log10(I / I0);
  set('snd-result', fmt(TI, 2) + ' dB');
  addHistory('Intensitas Bunyi', `TI=${fmt(TI,2)}dB`);
}


/* ════════════════════════════════════════
   UTILITY: buat sepasang input HTML
   Dipakai oleh fungsi build*Inputs()
════════════════════════════════════════ */
function inputPair(id, label, oninput) {
  return `
    <div class="input-group">
      <label class="input-label">${label}</label>
      <input class="input-field" type="number" id="${id}"
             placeholder="masukkan nilai" oninput="${oninput}">
    </div>`;
}


/* ════════════════════════════════════════
   INIT
════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  renderHistoryAll();
});