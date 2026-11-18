/* ===== Tsutsu-Urara：全ページで共通の上部（文字の大きさ・表示モード・データ更新の日付）=====
   どのページも、本文の最後でこのファイルを読む。地図のページなどは、このあと core.js も読む。 */
/* データ更新の日付。changelog.html に新しい日付の欄を足したら、ここも同じ日付にする */
const DATA_DATE = '2026年11月18日';

const $ = id => document.getElementById(id);

function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c])); }

/* ===== 文字サイズと表示モード(この端末に保存) ===== */
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
};
const THEMES = ['auto', 'light', 'dark'], THEME_LABEL = { auto:'自動', light:'ライト', dark:'ダーク' };
let fsPct = Math.max(80, Math.min(150, parseInt(store.get('jp-fs'), 10) || 100));
let theme = THEMES.includes(store.get('jp-theme')) ? store.get('jp-theme') : 'auto';
let fontSys = store.get('jp-font') === 'sys';   /* true：サイトの書体を使わず、端末の標準の書体にする */
function applyPrefs() {
  document.documentElement.style.fontSize = fsPct + '%';
  if (theme === 'auto') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', theme);
  $('theme').textContent = THEME_LABEL[theme];
  if (fontSys) document.documentElement.setAttribute('data-font', 'sys'); else document.documentElement.removeAttribute('data-font');
  $('fontsel').textContent = fontSys ? '端末の標準' : 'サイト指定';
  applyThemeColor();
}
/* 画面の地の色と、ブラウザ・ホーム画面のアプリの枠の色（theme-color）を、いまの表示モードに合わせる。
   manifest の theme_color は1色しか書けないので、ページが開いたあとはここで付け替える */
const DARK_MQ = window.matchMedia('(prefers-color-scheme: dark)');
function applyThemeColor() {
  const d = theme === 'dark' || (theme === 'auto' && DARK_MQ.matches), c = d ? '#12171d' : '#f2eee4', r = document.documentElement;
  r.style.background = c; r.style.colorScheme = d ? 'dark' : 'light';
  const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = c;
}
if (DARK_MQ.addEventListener) DARK_MQ.addEventListener('change', applyThemeColor); else if (DARK_MQ.addListener) DARK_MQ.addListener(applyThemeColor);
$('fsm').onclick = () => { fsPct = Math.max(80, fsPct - 10); store.set('jp-fs', fsPct); applyPrefs(); };
$('fsp').onclick = () => { fsPct = Math.min(150, fsPct + 10); store.set('jp-fs', fsPct); applyPrefs(); };
$('fontsel').onclick = () => { fontSys = !fontSys; if (fontSys) store.set('jp-font', 'sys'); else { try { localStorage.removeItem('jp-font'); } catch (e) {} } applyPrefs(); };
$('theme').onclick = () => { theme = THEMES[(THEMES.indexOf(theme) + 1) % 3]; store.set('jp-theme', theme); applyPrefs(); };
applyPrefs();
/* 歯車のメニュー：押すと開く。外を押すか Esc で閉じる */
{
  const btn = $('prefbtn'), menu = $('prefmenu');
  const show = on => { menu.hidden = !on; btn.setAttribute('aria-expanded', String(on)); };
  btn.onclick = () => show(menu.hidden);
  document.addEventListener('click', e => { if (!menu.hidden && !e.target.closest('.prefs')) show(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { show(false); btn.focus(); } });
}


{ const e = $('dupd'); if (e) e.textContent = DATA_DATE; }
/* 見出しの行の空いたところに、ひとことを流す（ティッカー）。TICKER の文を足したり消したりしてよい。
   動きを減らす設定の端末では流さず、8秒ごとに入れ替える。マウスを乗せると止まる */
const TICKER = [
  'つつうららは、のんびり育てています。',
  '命名権の名前も、ちゃんと呼んでいます。',
  '閉園した遊園地に、印を付けました。けっこうありました。',
  '金魚だけの水族館が思ったよりありました。',
  '城は別名でも探せます。「ヶ」と「ケ」と「が」は同じ字として探します。',
  '名古屋アンパンマンこどもミュージアム＆パークは三重にあります。',
  '閉園したところを、確かめています。',
  '公園が158か所になりました。まだ道半ばです。',
  '公園の中の動物園も、公園から見つけられるようになりました。',
  '入園料1枚で入れるなら、1か所です。'
];
{
  const brand = document.querySelector('header .head .brand');
  if (brand && TICKER.length) {
    const t = document.createElement('div'); t.className = 'ticker'; t.innerHTML = '<span class="tk"></span>'; brand.after(t);
    const s = t.firstChild, RM = window.matchMedia('(prefers-reduced-motion: reduce)');
    let i = Math.floor(Math.random() * TICKER.length);
    const play = () => {
      const w = t.clientWidth;
      if (w < 40) { setTimeout(play, 2000); return; }   /* 枠がほとんどない（隠れている）ときは待つ */
      s.textContent = TICKER[i]; i = (i + 1) % TICKER.length;
      s.style.animation = 'none';
      if (RM.matches) { setTimeout(play, 8000); return; }
      const sw = s.scrollWidth;
      s.style.setProperty('--tk-from', w + 'px'); s.style.setProperty('--tk-to', -sw + 'px');
      void s.offsetWidth;   /* 同じアニメーションを、はじめからやり直す */
      s.style.animation = 'tk ' + ((w + sw) / 45).toFixed(1) + 's linear';
    };
    s.addEventListener('animationend', play);
    play();
  }
}
/* 画面の表示設定を初期状態に戻す（地図のページは、地図の設定も戻すように index.html で付け替える） */
$('prefreset').onclick = () => {
  ['jp-fs', 'jp-theme', 'jp-font'].forEach(k => { try { localStorage.removeItem(k); } catch (e) {} });
  fontSys = false; fsPct = 100; theme = 'auto'; applyPrefs();
  const b = $('prefreset'), t0 = b.textContent; b.textContent = '戻しました'; setTimeout(() => { b.textContent = t0; }, 1500);
};
/* ===== スマホの下のタブ（2026-11-16）=====
   1列の画面（919px 以下）では、上のタブの代わりに、画面の下にタブの帯を出す。地図・あしあと・出力・保存・その他（更新履歴・このサイト）と、
   地図のページだけ右端に「種類」（右下の三角の代わり。押すと絞り込みの板が開く）。スマホを横にしたとき（高さが低いとき）は、帯を左の縦の列にする。
   どちらを出すかは style.css が決める。ここでは、上のタブ（.ptabs）のリンクから帯を作るだけ */
{
  const tabs = document.querySelector('header .ptabs');
  if (tabs) {
    /* 絵は、作者のドット絵（icons/bn-*.png。28×28。2026-11-16 に試しに入れた）。
       1ドットが画面の点の整数倍になる大きさで出す（ドットの太さがばらつかないように）。画面の点の比（devicePixelRatio）に合わせて、28px にいちばん近い大きさを選ぶ。縁取りの太さも1ドットぶん */
    const IC = { 'index.html': 'bn-map', 'ashiato.html': 'bn-ashiato', 'kiroku.html': 'bn-kiroku', 'changelog.html': 'bn-changelog', 'about.html': 'bn-about', more: 'bn-more', kind: 'bn-kind' };
    const ICV = '20261117a';   /* 絵を描き直したら新しい値にする（古い絵がキャッシュに残らないように） */
    const MAIN = ['index.html', 'ashiato.html', 'kiroku.html'];   /* 地図のページで、「その他」に入れないもの */
    const dpr = window.devicePixelRatio || 1, k = Math.max(1, Math.round(dpr));
    document.documentElement.style.setProperty('--bi', (28 * k / dpr).toFixed(3) + 'px');
    /* 縁取りのずらし幅。ちょうど1ドットだと、計算の誤差で右・下の影が0点に切り捨てられて、左上にしか出なかった（2026-11-17）。右・下は少し多め、左・上は少し少なめにして、どちらも1ドットに収める */
    document.documentElement.style.setProperty('--bo', ((k + .03) / dpr).toFixed(4) + 'px');
    document.documentElement.style.setProperty('--bn', (-(k - .03) / dpr).toFixed(4) + 'px');
    const ico = href => IC[href] ? '<img src="icons/' + IC[href] + '.png?v=' + ICV + '" width="28" height="28" alt="" aria-hidden="true">' : '';
    const svg = n => '<img src="icons/' + n + '.png?v=' + ICV + '" width="28" height="28" alt="" aria-hidden="true">';
    const links = [...tabs.querySelectorAll('a')].map(a => ({ href: a.getAttribute('href'), text: a.textContent, cur: a.getAttribute('aria-current') === 'page' }));
    /* 地図のページは「その他」と「種類」。ほかのページは、更新履歴・このサイトも並べて5つにする（どのページでも、地図・あしあと・出力・保存の位置が動かないように。2026-11-16） */
    const kindPage = !!$('fbtn');
    const main = kindPage ? links.filter(l => MAIN.includes(l.href)) : links, more = kindPage ? links.filter(l => !MAIN.includes(l.href)) : [];
    const nav = document.createElement('nav');
    nav.className = 'bnav'; nav.setAttribute('aria-label', 'ページ');
    let h = main.map((l, i) => '<a href="' + esc(l.href) + '"' + (!kindPage && i === main.length - 1 ? ' class="bwide"' : '') + (l.cur ? ' aria-current="page"' : '') + '>' + ico(l.href) + '<span>' + esc(l.text) + '</span></a>').join('');
    if (more.length) h += '<button type="button" class="bmorebtn' + (more.some(l => l.cur) ? ' cur' : '') + '" aria-expanded="false" aria-controls="bmore">' + svg(IC.more) + '<span>その他</span></button>';
    if ($('fbtn')) h += '<button type="button" class="bkind" id="bkind" aria-controls="fsheet" aria-expanded="false">' + svg(IC.kind) + '<span id="bkindl">種類</span></button>';
    nav.innerHTML = h;
    document.body.appendChild(nav);
    if (more.length) {
      const m = document.createElement('div');
      m.className = 'bmore'; m.id = 'bmore'; m.hidden = true;
      m.innerHTML = more.map(l => '<a href="' + esc(l.href) + '"' + (l.cur ? ' aria-current="page"' : '') + '>' + esc(l.text) + '</a>').join('');
      document.body.appendChild(m);
      const b = nav.querySelector('.bmorebtn');
      /* 「その他」のすぐ上（横の縦の列のときは、すぐ右）に出す */
      const show = on => {
        m.hidden = !on; b.setAttribute('aria-expanded', String(on));
        if (!on) return;
        const r = b.getBoundingClientRect(), nr = nav.getBoundingClientRect(), side = nr.height > nr.width;
        m.style.left = side ? (nr.right + 6) + 'px' : Math.max(8, Math.min(innerWidth - m.offsetWidth - 8, r.left + r.width / 2 - m.offsetWidth / 2)) + 'px';
        m.style.top = side ? Math.max(8, Math.min(innerHeight - m.offsetHeight - 8, r.top)) + 'px' : (nr.top - m.offsetHeight - 6) + 'px';
      };
      b.onclick = e => { e.stopPropagation(); show(m.hidden); };
      document.addEventListener('click', e => { if (!m.hidden && !e.target.closest('#bmore')) show(false); });
      document.addEventListener('keydown', e => { if (e.key === 'Escape' && !m.hidden) { show(false); b.focus(); } });
    }
    /* 「種類」は、右下の三角（#fbtn）と同じ働き。三角の文字（種類 ○/○・タグ・閉じる）を写す */
    const fb = $('fbtn'), bk = $('bkind');
    if (fb && bk) {
      bk.onclick = () => fb.click();
      const sync = () => { $('bkindl').textContent = fb.textContent.replace(/^種類/, '種類 ').replace(/タグ/, '・タグ'); bk.setAttribute('aria-expanded', fb.getAttribute('aria-expanded') || 'false'); bk.classList.toggle('on', fb.getAttribute('aria-expanded') === 'true'); };
      new MutationObserver(sync).observe(fb, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['aria-expanded'] });
      sync();
    }
  }
}
/* ===== ページを開いたら、いちばん上から（2026-11-16）=====
   下のタブでページの途中から移ると、ブラウザやアーティファクトの表示枠が、前の送り位置のまま新しいページを開くことがあったため。
   #… がページの中の場所を指しているときは、触らない。
   ブラウザに任せると前の位置へ戻してしまうので、戻すのはこちらでする（manual）。「戻る・進む」で来たときだけ、そのページを離れたときの位置へ戻す */
{
  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
  const SY_KEY = 'jp-sy:' + location.pathname;
  addEventListener('pagehide', () => { try { sessionStorage.setItem(SY_KEY, String(Math.round(window.scrollY))); } catch (e) {} });
  let nt = '';
  try { nt = (performance.getEntriesByType('navigation')[0] || {}).type || ''; } catch (e) {}
  let anchor = null;
  try { anchor = location.hash.length > 1 ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null; } catch (e) {}
  if (nt !== 'back_forward' && !anchor) {
    const top = () => { if (window.scrollY) window.scrollTo(0, 0); };
    top();
    addEventListener('DOMContentLoaded', top, { once: true });
    addEventListener('load', () => { top(); setTimeout(top, 60); }, { once: true });
  } else if (nt === 'back_forward') {
    let y = 0; try { y = parseInt(sessionStorage.getItem(SY_KEY), 10) || 0; } catch (e) {}
    const back = () => window.scrollTo(0, y);
    if (y > 0) addEventListener('load', () => { back(); setTimeout(back, 60); }, { once: true });
  }
}
