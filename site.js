/* ===== Tsutsu-Urara：全ページで共通の上部（文字の大きさ・表示モード・データ更新の日付）=====
   どのページも、本文の最後でこのファイルを読む。地図のページなどは、このあと core.js も読む。 */
/* データ更新の日付。changelog.html に新しい日付の欄を足したら、ここも同じ日付にする */
const DATA_DATE = '2026年10月25日';

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
/* 画面の表示設定を初期状態に戻す（地図のページは、地図の設定も戻すように index.html で付け替える） */
$('prefreset').onclick = () => {
  ['jp-fs', 'jp-theme', 'jp-font'].forEach(k => { try { localStorage.removeItem(k); } catch (e) {} });
  fontSys = false; fsPct = 100; theme = 'auto'; applyPrefs();
  const b = $('prefreset'), t0 = b.textContent; b.textContent = '戻しました'; setTimeout(() => { b.textContent = t0; }, 1500);
};
