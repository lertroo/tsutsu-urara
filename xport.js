/* ===== 画像を作る（足あとカード）=====
   地図・あしあと・出力・保存のページで使う。core.js のあとに読む。data-act="xport" のボタンを押すと開く */
const XS_KEY = 'jp-xs-v1';
const XSIZE = { tall:[1080, 1350], square:[1080, 1080], wide:[1600, 900] };
const XPAL = {
  light:{ bg:'#f4f0e6', panel:'#fffdf8', ink:'#1f2933', muted:'#646a70', line:'#ddd5c3', sea:'#d9e5ea', land:'#fbf8ef', coast:'#8a9aa2', accent:'#1f5c8a', stamp:'#c8372d', lv:['#bcd8ea', '#7fb3d6', '#3a86b8'] },
  dark:{ bg:'#12171d', panel:'#1a222b', ink:'#ebe7de', muted:'#9aa5ad', line:'#2c3742', sea:'#0f1b25', land:'#232f38', coast:'#5d7480', accent:'#7db6e0', stamp:'#ff7062', lv:['#2d5a78', '#3f84ad', '#6cb9e3'] }
};
const XDEF = { parts:{ map:true, count:true, share:true, recent:true, years:true }, dots:false, names:true, dates:true, who:true, kinds:{}, period:'all', since:'', size:'tall', theme:'light', title:'', note:'' };
KORDER.forEach(k => { XDEF.kinds[k] = true; });
let XS = (() => {
  let o = {}; try { o = JSON.parse(localStorage.getItem(XS_KEY) || '{}') || {}; } catch (e) {}
  const r = JSON.parse(JSON.stringify(XDEF));
  if (o.parts) Object.keys(r.parts).forEach(k => { if (typeof o.parts[k] === 'boolean') r.parts[k] = o.parts[k]; });
  if (o.kinds) KORDER.forEach(k => { if (typeof o.kinds[k] === 'boolean') r.kinds[k] = o.kinds[k]; });
  ['dots', 'names', 'dates', 'who'].forEach(k => { if (typeof o[k] === 'boolean') r[k] = o[k]; });
  if (['all', 'year', 'd30', 'since'].includes(o.period)) r.period = o.period;
  if (/^\d{4}-\d{2}-\d{2}$/.test(o.since || '')) r.since = o.since;
  if (XSIZE[o.size]) r.size = o.size;
  if (XPAL[o.theme]) r.theme = o.theme;
  if (typeof o.title === 'string') r.title = o.title.slice(0, 24);
  if (typeof o.note === 'string') r.note = o.note.slice(0, 40);
  return r;
})();
let XPID = '';
function xSaveSettings() { try { localStorage.setItem(XS_KEY, JSON.stringify(XS)); } catch (e) {} }
function xToday() { return new Date().toLocaleDateString('sv-SE'); }
function xPeriodLabel() {
  const t = xToday();
  if (XS.period === 'year') return t.slice(0, 4) + '年';
  if (XS.period === 'd30') return '直近30日';
  if (XS.period === 'since') return XS.since ? fmtDate(XS.since) + ' から' : '全期間';
  return '全期間';
}
function xCollect() {
  initAll();
  const data = rec.data[XPID] || {}, today = xToday(), yr = today.slice(0, 4), d30 = new Date(Date.now() - 30 * 864e5).toLocaleDateString('sv-SE');
  const ok = d => XS.period === 'all' ? true : d === '' ? false : XS.period === 'year' ? d.slice(0, 4) === yr : XS.period === 'd30' ? (d >= d30 && d <= today) : (XS.since ? d >= XS.since : true);
  const tk = twinKinds(), kc = {}; KORDER.forEach(k => { kc[k] = 0; });
  const vis = [], recs = [];
  ALLX.forEach(it => {
    const ds = (data[it.id] || []).filter(ok); if (!ds.length) return;
    const ks = [KIND.get(it.id)].concat(tk[it.id] || []).filter(k => XS.kinds[k]);
    if (!ks.length) return;
    ks.forEach(k => { kc[k]++; });
    vis.push({ it, k: ks[0] });
    ds.forEach(d => recs.push({ d, it, k: ks[0] }));
  });
  recs.sort((a, b) => (a.d === '' ? 1 : 0) - (b.d === '' ? 1 : 0) || (a.d < b.d ? 1 : a.d > b.d ? -1 : 0));
  const sum = KORDER.reduce((t, k) => t + kc[k], 0), pcs = {}; let left = 100; const rem = [];
  KORDER.forEach(k => { const f = sum ? kc[k] / sum * 100 : 0; pcs[k] = Math.floor(f); left -= pcs[k]; rem.push([f - pcs[k], k]); });
  if (sum) rem.sort((p, q) => q[0] - p[0]).slice(0, left).forEach(r => { pcs[r[1]]++; });
  const pf = {}; vis.forEach(v => { const k = PREF_KEY[v.it.pf]; if (k) pf[k] = (pf[k] || 0) + 1; });
  const ys = {}; recs.forEach(r => { if (r.d) { const y = r.d.slice(0, 4); ys[y] = (ys[y] || 0) + 1; } });
  return { vis, recs, kc, pcs, pf, ys, nv: vis.length, kinds: KORDER.filter(k => kc[k] > 0).sort((a, b) => kc[b] - kc[a]) };
}
const X_PATHS = {};
function xPath(k) { return X_PATHS[k] || (X_PATHS[k] = new Path2D(GEO_PREFS[k])); }
const XFONT = (px, w) => (w || 400) + ' ' + px + 'px "BIZ UDPGothic","Hiragino Sans","Yu Gothic","Noto Sans CJK JP",sans-serif';
/* ロゴ・タイトル・大きな数字は、画面の見出し（--font-display）と同じ丸ゴシック */
const XHEAD = (px, w) => (w || 400) + ' ' + px + 'px "Zen Maru Gothic","BIZ UDPGothic","Hiragino Maru Gothic ProN","Yu Gothic","Noto Sans CJK JP",sans-serif';
function xRR(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function xFit(c, s, maxW) { if (c.measureText(s).width <= maxW) return s; let t = s; while (t.length > 1 && c.measureText(t + '…').width > maxW) t = t.slice(0, -1); return t + '…'; }
function xDraw(cv, D) {
  const [W, H] = XSIZE[XS.size], P = XPAL[XS.theme], c = cv.getContext('2d'), pad = 64;
  cv.width = W; cv.height = H;
  c.fillStyle = P.bg; c.fillRect(0, 0, W, H);
  c.textBaseline = 'alphabetic';
  // 見出し
  c.save(); c.translate(pad + 38, pad + 38); c.rotate(-0.07);
  c.strokeStyle = P.stamp; c.lineWidth = 4; xRR(c, -38, -38, 76, 76, 12); c.stroke();
  c.fillStyle = P.stamp; c.font = XHEAD(30, 700); c.textAlign = 'center';
  ['津', '々', '浦', 'ラ'].forEach((ch, i) => { c.fillStyle = i === 3 ? P.accent : P.stamp; c.fillText(ch, (i % 2 ? 1 : -1) * 17, (i < 2 ? -3 : 31) - 4 + (i < 2 ? 0 : 0)); });
  c.restore();
  c.textAlign = 'left'; c.fillStyle = P.ink; c.font = XFONT(54, 700);
  const rightTxt = xPeriodLabel();
  c.font = XFONT(28, 400); const rw = c.measureText(rightTxt).width;
  c.font = XHEAD(54, 700); c.fillText(xFit(c, XS.title || 'Tsutsu-Urara', W - pad * 2 - 100 - rw - 24), pad + 100, pad + 40);
  if (XS.who) { c.font = XFONT(28, 400); c.fillStyle = P.muted; c.fillText(xFit(c, curNameOf(XPID), W - pad * 2 - 100 - rw - 24), pad + 100, pad + 82); }
  c.font = XFONT(28, 400); c.fillStyle = P.muted; c.textAlign = 'right'; c.fillText(rightTxt, W - pad, pad + 40); c.textAlign = 'left';
  c.fillStyle = P.line; c.fillRect(pad, pad + 108, W - pad * 2, 2);
  const y0 = pad + 140, yEnd = H - 92;
  // フッター
  c.font = XFONT(24, 400); c.fillStyle = P.muted; c.fillText(xFit(c, XS.note || '行ったところを記録しよう。', W - pad * 2 - 260), pad, H - 40);
  c.textAlign = 'right'; c.fillText(new Date().toLocaleDateString('ja-JP', { year:'numeric', month:'long', day:'numeric' }), W - pad, H - 40); c.textAlign = 'left';
  if (!D.nv) {
    c.fillStyle = P.muted; c.font = XFONT(34, 700); c.textAlign = 'center';
    c.fillText('この条件に当てはまる記録がありません', W / 2, H / 2); c.textAlign = 'left'; return;
  }
  const T = XS.parts, wide = XS.size === 'wide';
  // ブロック
  const blkCount = (x, y, w) => {
    const cp = XS.size !== 'tall', fs = cp ? 108 : 132, by = cp ? 92 : 112;
    c.fillStyle = P.accent; c.font = XHEAD(fs, 700); c.fillText(String(D.nv), x, y + by);
    const nw = c.measureText(String(D.nv)).width;
    c.fillStyle = P.muted; c.font = XFONT(38, 700); c.fillText('か所に行った', x + nw + 14, y + by);
    const np = Object.keys(D.pf).length;
    c.fillStyle = P.ink; c.font = XFONT(34, 700); c.fillText(np + ' 都道府県', x, y + by + 56);
    return cp ? 170 : 190;
  };
  const blkShare = (x, y, w, maxH) => {
    const ks = D.kinds, cols = (w - 24) / 2 >= 330 ? 2 : 1, bh = 26;   /* 1列の幅が狭いと、分類の名前が切れるので、そのときは1列にする */
    if (!ks.length || maxH < 8 + bh + 50) return 0;
    let rowH = 42; if (Math.ceil(ks.length / cols) * rowH > maxH - 8 - bh - 16) rowH = 36;
    const rows = Math.min(Math.ceil(ks.length / cols), Math.floor((maxH - 8 - bh - 16) / rowH));
    const by = y + 4, sum = ks.reduce((t, k) => t + D.kc[k], 0) || 1;
    c.save(); xRR(c, x, by, w, bh, bh / 2); c.clip();
    c.fillStyle = P.line; c.fillRect(x, by, w, bh);
    let cx = x; const gap = 3;
    ks.forEach((k, i) => { const sw = w * D.kc[k] / sum; c.fillStyle = KCOL[k]; c.fillRect(cx, by, Math.max(3, sw - (i < ks.length - 1 ? gap : 0)), bh); cx += sw; });
    c.restore();
    const ew = (w - (cols - 1) * 24) / cols, ly = by + bh + 16;
    ks.slice(0, rows * cols).forEach((k, i) => {
      const col = Math.floor(i / rows), r = i % rows, lx = x + col * (ew + 24), ry = ly + r * rowH;
      c.fillStyle = KCOL[k]; xRR(c, lx, ry + 8, 22, 22, 5); c.fill();
      const pcTxt = D.pcs[k] + '%', cntTxt = '（' + D.kc[k] + '）';
      c.textAlign = 'right'; c.font = XFONT(24, 400); c.fillStyle = P.muted; c.fillText(cntTxt, lx + ew, ry + 30);
      const cw = c.measureText(cntTxt).width; c.font = XFONT(30, 700); c.fillStyle = P.ink; c.fillText(pcTxt, lx + ew - cw - 6, ry + 30);
      const pw = c.measureText(pcTxt).width + cw + 6; c.textAlign = 'left';
      const lw = ew - 34 - pw - 10; let fs = 30;
      c.font = XFONT(fs, 700); while (fs > 22 && c.measureText(MODE_LABEL[k]).width > lw) { fs -= 2; c.font = XFONT(fs, 700); }   /* それでも入らないときだけ、文字を小さくする */
      c.fillStyle = P.ink; c.fillText(xFit(c, MODE_LABEL[k], lw), lx + 34, ry + 30);
    });
    return 8 + bh + 16 + rows * rowH;
  };
  const blkRecent = (x, y, w, maxH) => {
    const n = Math.min(8, Math.floor((maxH - 50) / 52), D.recs.length); if (n < 1) return 0;
    c.fillStyle = P.muted; c.font = XFONT(26, 700); c.fillText(XS.period === 'all' ? '最近の足あと' : 'この期間の足あと', x, y + 24);
    D.recs.slice(0, n).forEach((r, i) => {
      const ry = y + 50 + i * 52; let tx = x;
      if (XS.dates) { c.font = XFONT(26, 400); c.fillStyle = P.muted; c.fillText(r.d ? fmtDate(r.d) : '日付なし', x, ry + 30); tx = x + 190; }
      c.fillStyle = KCOL[r.k]; xRR(c, tx, ry + 12, 18, 18, 4); c.fill();
      c.fillStyle = P.ink; c.font = XFONT(30, 700); c.fillText(xFit(c, KIND.get(r.it.id) === 'stations' ? dn(r.it) : r.it.n, x + w - tx - 30), tx + 30, ry + 31);
    });
    return 50 + n * 52;
  };
  const yearList = () => Object.keys(D.ys).sort().slice(-5);
  const blkYears = (x, y, w) => {
    const yk = yearList(); if (!yk.length) return 0;
    c.fillStyle = P.muted; c.font = XFONT(26, 700); c.fillText('年ごとの記録（延べ回数）', x, y + 24);
    const mx = Math.max.apply(null, yk.map(k => D.ys[k])), gap = 18, bw = Math.min(90, (w - gap * (yk.length - 1)) / yk.length), base = y + 160;
    yk.forEach((k, i) => {
      const bx = x + i * (bw + gap), h = Math.max(8, D.ys[k] / mx * 80);
      c.fillStyle = P.stamp; xRR(c, bx, base - h, bw, h, 6); c.fill();
      c.textAlign = 'center'; c.fillStyle = P.ink; c.font = XFONT(26, 700); c.fillText(String(D.ys[k]), bx + bw / 2, base - h - 8);
      c.fillStyle = P.muted; c.font = XFONT(24, 400); c.fillText(k, bx + bw / 2, base + 30); c.textAlign = 'left';
    });
    return 200;
  };
  const drawMap = (x, y, w) => {
    const sc = w / 680, h = 880 * sc;
    c.save(); xRR(c, x, y, w, h, 18); c.clip();
    c.fillStyle = P.sea; c.fillRect(x, y, w, h);
    c.translate(x, y); c.scale(sc, sc); c.translate(-120, 0);
    c.lineJoin = 'round'; c.lineWidth = 1.1 / sc * 1.0;
    Object.keys(GEO_PREFS).forEach(k => {
      const n = D.pf[k] || 0, lv = n >= 5 ? 3 : n >= 2 ? 2 : n >= 1 ? 1 : 0, p = xPath(k);
      c.fillStyle = lv ? P.lv[lv - 1] : P.land; c.fill(p); c.strokeStyle = P.coast; c.stroke(p);
    });
    if (XS.dots) D.vis.forEach(v => { if (typeof v.it.la !== 'number') return; const [px, py] = proj(v.it.lo, v.it.la); c.beginPath(); c.arc(px, py, 6 / sc * 1.1 * 0.8, 0, 7); c.fillStyle = KCOL[v.k]; c.fill(); c.lineWidth = 1.6 / sc; c.strokeStyle = P.panel; c.stroke(); });
    c.restore();
    c.strokeStyle = P.line; c.lineWidth = 2; xRR(c, x, y, w, h, 18); c.stroke();
    return h;
  };
  const hasA = T.count || T.share, wantRecent = T.recent && XS.names && D.recs.length, wantYears = T.years && XS.dates && yearList().length;
  if (wide) {
    const mapW = T.map ? Math.floor((yEnd - y0) * 680 / 880) : 0, ax = pad + (mapW ? mapW + 48 : 0), aw = W - pad - ax;
    if (T.map) drawMap(pad, y0, mapW);
    const aW = (wantRecent || wantYears) && aw > 640 ? Math.floor(aw * 0.5) : aw, bx = ax + aW + 40, bw = aw - aW - 40, avail = yEnd - y0;
    let y = y0;
    if (T.count) y += blkCount(ax, y, aW);
    if (T.share) blkShare(ax, y, aW, yEnd - y);
    if (aW < aw) {
      let by = y0;
      if (wantRecent) { const hy = wantYears ? 200 : 0; by += blkRecent(bx, by, bw, avail - hy) + (wantYears ? 16 : 0); }
      if (wantYears) blkYears(bx, by, bw);
    } else if (wantRecent || wantYears) {
      /* 右が狭いときは、割合の下に入るだけ出す */
    }
    return;
  }
  const mapW = XS.size === 'tall' ? 480 : 340, mapOn = T.map, mapH = 880 * mapW / 680;
  const ax = pad + (mapOn && hasA ? mapW + 44 : 0), aw = W - pad - ax;
  let row1 = 0;
  if (mapOn) { const mx = hasA ? pad : Math.round((W - mapW) / 2); drawMap(mx, y0, mapW); row1 = mapH; }
  if (hasA) {
    let y = y0; const cap = yEnd - y0;
    if (T.count) y += blkCount(ax, y, aw);
    if (T.share) y += blkShare(ax, y, aw, Math.max(110, cap - (y - y0)));
    row1 = Math.max(row1, y - y0);
  }
  let y = y0 + row1 + 36;
  if (wantRecent || wantYears) {
    const avail = yEnd - y, fw = W - pad * 2, yw = wantYears ? 330 : 0, rw2 = wantRecent ? (wantYears ? fw - yw - 40 : fw) : 0;
    if (wantRecent && avail > 100) blkRecent(pad, y, rw2, avail);
    if (wantYears && avail > 200) blkYears(pad + fw - yw, y, yw);
  }
}
function curNameOf(pid) { const p = rec.profiles.find(p => p.id === pid); return p ? p.name : ''; }

/* --- ダイアログ --- */
let xEl = null, xOpener = null, xTimer = 0;
function xBuild() {
  if (xEl) return;
  xEl = document.createElement('div'); xEl.id = 'xmodal'; xEl.hidden = true; xEl.setAttribute('role', 'dialog'); xEl.setAttribute('aria-modal', 'true'); xEl.setAttribute('aria-label', '画像を作る');
  xEl.innerHTML = '<div class="xpanel"><div class="xhead"><h2>画像を作る</h2><button type="button" class="btn" id="x-close">閉じる</button></div>' +
    '<div class="xprev"><canvas id="x-cv"></canvas></div><p class="msg" id="x-msg" role="status"></p>' +
    '<div class="xact"><button type="button" class="btn primary" id="x-save">画像を保存</button><span class="xhint">設定はこのブラウザに覚えておきます。</span></div><div id="x-fb"></div>' +
    '<div class="xopts" id="x-opts"></div></div>';
  document.body.appendChild(xEl);
  $('x-close').onclick = xClose;
  xEl.addEventListener('click', e => { if (e.target === xEl) xClose(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && xEl && !xEl.hidden) xClose(); });
  $('x-save').onclick = xSave;
}
function xOptsHTML() {
  const ck = (id, label, on, dis) => '<label class="xck' + (dis ? ' off' : '') + '"><input type="checkbox" data-x="' + id + '"' + (on ? ' checked' : '') + (dis ? ' disabled' : '') + '>' + label + '</label>';
  const rd = (name, v, label, cur) => '<label class="xrd"><input type="radio" name="x-' + name + '" data-x="' + name + '" value="' + v + '"' + (cur === v ? ' checked' : '') + '>' + label + '</label>';
  let h = '';
  if (rec.profiles.length > 1) h += '<fieldset><legend>記録する人</legend><select data-x="pid">' + rec.profiles.map(p => '<option value="' + esc(p.id) + '"' + (p.id === XPID ? ' selected' : '') + '>' + esc(p.name) + '</option>').join('') + '</select></fieldset>';
  h += '<fieldset><legend>入れる内容</legend>' + ck('p:map', '地図', XS.parts.map) + ck('p:count', '件数・都道府県数', XS.parts.count) + ck('p:share', '種類ごとの割合', XS.parts.share) +
    ck('p:recent', '最近の足あと', XS.parts.recent, !XS.names) + ck('p:years', '年ごとの回数', XS.parts.years, !XS.dates) + ck('dots', '地図に施設の点も出す', XS.dots, !XS.parts.map) + '</fieldset>';
  h += '<fieldset><legend>見せる範囲</legend>' + ck('names', '施設名を出す', XS.names) + ck('dates', '日付を出す', XS.dates) + ck('who', '名前を出す', XS.who) + '</fieldset>';
  h += '<fieldset><legend>種類を絞る</legend><div class="xkinds">' + KORDER.map(k => '<label class="xk" style="--kc:' + KCOL[k] + '"><input type="checkbox" data-x="k:' + k + '"' + (XS.kinds[k] ? ' checked' : '') + '><span>' + esc(MODE_LABEL[k]) + '</span></label>').join('') + '</div></fieldset>';
  h += '<fieldset><legend>期間</legend><select data-x="period"><option value="all"' + (XS.period === 'all' ? ' selected' : '') + '>全期間</option><option value="year"' + (XS.period === 'year' ? ' selected' : '') + '>今年</option><option value="d30"' + (XS.period === 'd30' ? ' selected' : '') + '>直近30日</option><option value="since"' + (XS.period === 'since' ? ' selected' : '') + '>指定した日から</option></select>' +
    (XS.period === 'since' ? ' <input type="date" data-x="since" value="' + esc(XS.since) + '">' : '') + '<p class="xnote">期間を決めると、日付のある記録だけが対象です。</p></fieldset>';
  h += '<fieldset><legend>見た目</legend><div class="xrow">' + rd('size', 'tall', '縦長', XS.size) + rd('size', 'square', '正方形', XS.size) + rd('size', 'wide', '横長', XS.size) + '</div><div class="xrow">' + rd('theme', 'light', 'ライト', XS.theme) + rd('theme', 'dark', 'ダーク', XS.theme) + '</div></fieldset>';
  h += '<fieldset><legend>文字</legend><label class="xtx">タイトル<input type="text" data-x="title" maxlength="24" placeholder="Tsutsu-Urara" value="' + esc(XS.title) + '"></label><label class="xtx">ひとこと<input type="text" data-x="note" maxlength="40" placeholder="行ったところを記録しよう。" value="' + esc(XS.note) + '"></label></fieldset>';
  return h;
}
let xFontsOK = false;
async function xRender() {
  if (!xEl || xEl.hidden) return;
  if (!xFontsOK) { try { await Promise.all([document.fonts.load(XFONT(30, 700), '津々浦ラあア漢'), document.fonts.load(XFONT(30, 400), '津々浦ラあア漢'), document.fonts.load(XHEAD(30, 700), '津々浦ラあア漢')]); } catch (e) {} xFontsOK = true; }
  const D = xCollect(); xData = D;
  xDraw($('x-cv'), D);
  $('x-save').disabled = !D.nv;
  $('x-msg').textContent = D.nv ? '' : 'この条件に当てはまる記録がありません。期間や種類を変えてみてください。';
  $('x-msg').classList.remove('err');
}
let xData = null;
function xQueue() { clearTimeout(xTimer); xTimer = setTimeout(xRender, 80); }
function xOpen(from) {
  xBuild(); xOpener = from || document.activeElement;
  if (!rec.profiles.some(p => p.id === XPID)) XPID = rec.cur;
  XPID = XPID || rec.cur;
  $('x-opts').innerHTML = xOptsHTML(); $('x-fb').innerHTML = '';
  xEl.hidden = false; document.body.classList.add('xopen');
  $('x-close').focus(); xRender();
}
function xClose() { if (!xEl) return; xEl.hidden = true; document.body.classList.remove('xopen'); if (xOpener && xOpener.focus) try { xOpener.focus(); } catch (e) {} }
function xOnChange(e) {
  const t = e.target, key = t.dataset && t.dataset.x; if (!key) return;
  const v = t.type === 'checkbox' ? t.checked : t.value;
  if (key === 'pid') XPID = v;
  else if (key.startsWith('p:')) XS.parts[key.slice(2)] = v;
  else if (key.startsWith('k:')) XS.kinds[key.slice(2)] = v;
  else if (key === 'since') XS.since = /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : '';
  else XS[key] = (key === 'title' ? v.slice(0, 24) : key === 'note' ? v.slice(0, 40) : v);
  xSaveSettings();
  if (['names', 'dates', 'period', 'parts', 'dots'].includes(key) || key.startsWith('p:') || key === 'pid') { const keep = document.activeElement; $('x-opts').innerHTML = xOptsHTML(); if (keep && keep.dataset && keep.dataset.x) { const n = $('x-opts').querySelector('[data-x="' + keep.dataset.x + '"]'); if (n && n.type !== 'radio') try { n.focus(); } catch (e2) {} } }
  xQueue();
}
document.addEventListener('change', e => { if (xEl && xEl.contains(e.target)) xOnChange(e); });
document.addEventListener('input', e => { if (xEl && xEl.contains(e.target) && e.target.type === 'text') xOnChange(e); });
function xFileName() {
  const per = XS.period === 'all' ? '全期間' : XS.period === 'year' ? xToday().slice(0, 4) + '年' : XS.period === 'd30' ? '直近30日' : (XS.since || '全期間') + '以降';
  return 'tsutsu-urara_' + xToday() + '_' + per + (XS.names ? '' : '_施設名なし') + '.png';
}
async function xSave() {
  const msg = $('x-msg'), cv = $('x-cv'); msg.classList.remove('err'); $('x-fb').innerHTML = '';
  const fallback = why => {
    msg.classList.add('err'); msg.textContent = why + '下の画像を長押しして保存してください。';
    try { $('x-fb').innerHTML = '<img class="xfb" alt="足あとカード" src="' + cv.toDataURL('image/png') + '">'; } catch (e) {}
  };
  const blob = await new Promise(r => cv.toBlob(r, 'image/png'));
  if (!blob) { fallback('画像を作れませんでした。'); return; }
  /* claude.ai の外（GitHub Pages など）では、ふつうのダウンロードで名前をつけて保存する */
  if (!dlNs) {
    try {
      const url = URL.createObjectURL(blob), a = document.createElement('a');
      a.href = url; a.download = xFileName(); document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      msg.textContent = '保存しました。';
    } catch (e) { fallback('この画面では、ファイルへの保存が使えません。'); }
    return;
  }
  try { await dlNs.save({ filename: xFileName(), data: blob }); msg.textContent = '保存しました。'; }
  catch (e) { if (e && e.code === 'declined') msg.textContent = '保存をやめました。'; else fallback('保存できませんでした。'); }
}
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-act="xport"]'); if (b) xOpen(b); });
