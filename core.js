/* ===== Tsutsu-Urara：データと行った記録（地図・あしあと・書き出し・このサイトのページで共通）=====
   data/*.js と site.js のあとに読む。 */

/* ===== 投影(地名めぐりと同じ):緯度1度 = 40単位、経度は cos(36°) で縮める ===== */
const SCALE = 40, KX = 0.81;
const proj = (lo, la) => [(lo - 122) * SCALE * KX, (46 - la) * SCALE];
const PREF_KEY = {};
Object.keys(GEO_PREFS).forEach(k => { PREF_KEY[k === '北海道' ? '北海道' : k.replace(/[都府県]$/, '')] = k; });

const REGION_OF = {};
[['北海道','北海道'],['東北','青森 岩手 宮城 秋田 山形 福島'],['関東','茨城 栃木 群馬 埼玉 千葉 東京 神奈川'],
 ['中部','新潟 富山 石川 福井 山梨 長野 岐阜 静岡 愛知'],['近畿','三重 滋賀 京都 大阪 兵庫 奈良 和歌山'],
 ['中国','鳥取 島根 岡山 広島 山口'],['四国','徳島 香川 愛媛 高知'],['九州・沖縄','福岡 佐賀 長崎 熊本 大分 宮崎 鹿児島 沖縄']]
 .forEach(([r, ps]) => ps.split(' ').forEach(p => { REGION_OF[p] = r; }));
const REGIONS = ['北海道','東北','関東','中部','近畿','中国','四国','九州・沖縄'];


const TYPE_LABEL = { N:'現存天守・国宝', k:'現存天守・重要文化財', s:'復元・復興などの天守', a:'城跡など（天守なし）' };
const CASTLES = CASTLE_TXT.split('\n').map((ln, i) => {
  const [n, pf, lo, la, t, rm, wp] = ln.split('|');
  return { id:'cs:' + n, no:i + 1, n, pf, lo:+lo, la:+la, t, rg:REGION_OF[pf], rm:rm || '', wp:wp || '' };
});

const AIR_TYPE = { 1:'拠点空港（会社管理）', 2:'拠点空港（国管理）', 3:'拠点空港（特定地方管理）', 4:'地方管理空港', 5:'その他の空港', 6:'共用空港' };
const AIR_FL = { 1:'ジェット機の定期便あり', 2:'プロペラ機の定期便あり', 3:'定期便なし' };
const AIR_FL_SHORT = { 1:'ジェット便', 2:'プロペラ便', 3:'定期便なし' };
/* タグ（tag。種類や区分とは別に付ける分け方。「、」区切り。どの種類のデータにも付けられる） */
const hasTag = (x, t) => !!x.tag && x.tag.split('、').includes(t);
/* 横断検索で種類を1つだけ選んだときに出す、その種類の細かい絞り込み。[ボタンの名前, 値, 条件]。先頭は「すべて」 */
const TYPEF = {
  castles: [['すべて', 'all'], ['現存天守', 'tower', c => c.t === 'N' || c.t === 'k'], ['国宝天守', 'N', c => c.t === 'N'], ['復元などの天守', 's', c => c.t === 's'], ['城跡など', 'a', c => c.t === 'a']],
  museums: [['すべて', 'all'], ['県立', 'pref', x => x.kb === '都道府県立'], ['国立（大学を含む）', 'nat', x => x.kb === '国立' || x.kb === '国立大学'], ['国宝所蔵', 'kokuho', x => x.kb === '国宝所蔵'], ['letroo基準', 'letroo', x => x.kb === 'letroo基準'], ['登録博物館', 'reg', x => x.rj === '登録博物館'], ['指定施設', 'des', x => x.rj === '指定施設'], ['地図に未表示', 'nopos', x => typeof x.la !== 'number']],
  airports: [['定期便:すべて', 'all'], [AIR_FL_SHORT[1], '1', x => x.fl === 1], [AIR_FL_SHORT[2], '2', x => x.fl === 2], [AIR_FL_SHORT[3], '3', x => x.fl === 3]],
  zoos: [['すべて', 'all'], ['合体', 'combo', x => x.tg]],
  aquas: [['すべて', 'all'], ['合体', 'combo', x => x.tg]],
  bots: [['すべて', 'all'], ['合体', 'combo', x => x.tg]],
  parks: [['すべて', 'all'], ['国営公園', 'kokuei', x => x.sb === '国営'], ['広域公園', 'kouiki', x => x.sb === '広域'], ['その他の公園', 'etc', x => x.sb === 'その他']],
  towers: [['すべて', 'all'], ['イースト', 'east', x => x.bl === 'イースト'], ['セントラル', 'central', x => x.bl === 'セントラル'], ['カンサイ', 'kansai', x => x.bl === 'カンサイ'], ['ウエスト', 'west', x => x.bl === 'ウエスト'], ['letroo基準', 'letroo', x => x.kb === 'letroo基準']],
  themes: [['すべて', 'all'], ['合体', 'combo', x => x.tg]],
  koei: [['すべて', 'all'], ['競馬場', 'keiba', x => x.sh === '競馬場'], ['競輪場', 'keirin', x => x.sh === '競輪場'], ['競艇場', 'kyotei', x => x.sh === '競艇場'], ['オートレース場', 'auto', x => x.sh === 'オートレース場'], ['廃止・休止', 'gone', x => x.x]],
};
/* 横断検索で、いま細かい絞り込みを出す種類（1つだけ選んでいて、TYPEF にあるとき）。種類が変わったら「すべて」に戻す */
function typeKind() {
  const k = flt.kinds && flt.kinds.size === 1 ? flt.kinds.values().next().value : null;
  const k1 = k && TYPEF[k] ? k : null;
  if (flt.typeK !== k1) { flt.typeK = k1; flt.type = 'all'; }
  return k1;
}
const AIR_ST = { 1:'供用中', 2:'建設中', 3:'休止中' };
/* 道の駅の表示名。改名した駅は「旧名 → 新名」、閉鎖した駅は名前の後ろに閉鎖年を付ける */
function dn(it) { let t = it.o ? it.o + ' → ' + it.n : it.n; if (it.x) t += '（' + it.x + '年閉鎖）'; return t; }

/* ===== 種類の表 =====
   種類の並び（KORDER）・名前・色・データ・地図の点の大きさ（r）は、ここだけに書く。アイコンは ICON_P */
const MYS_KEY = 'jp-myspots-v1';
const MYS = [];   /* マイスポット（自分で足した地点。この端末のブラウザに保存） */
/* g はグループ（地図の種類のボタンを、グループごとに分けて並べる）。同じグループの種類は続けて書く */
const KINDS = [
  { k:'zoos',     label:'動物園',       col:'#e08a1e', items:ZOOS,     r:4.4, g:'いきもの' },
  { k:'aquas',    label:'水族館',       col:'#1f8fd6', items:AQUAS,    r:4.4, g:'いきもの' },
  { k:'bots',     label:'植物園',       col:'#3fa34d', items:BOTS,     r:4.4, g:'いきもの' },
  { k:'themes',   label:'テーマパーク', col:'#e0457b', items:TPARKS,   r:4.4, g:'遊ぶ・学ぶ' },
  { k:'parks',    label:'公園',         col:'#8bb31d', items:PARKS,    r:5.2, g:'遊ぶ・学ぶ' },
  { k:'museums',  label:'博物・美術館', col:'#8e5bd0', items:MUSEUMS,  r:4.4, g:'遊ぶ・学ぶ' },
  { k:'koei',     label:'公営競技場',   col:'#a33b8a', items:KOEI,     r:4.4, g:'遊ぶ・学ぶ' },
  { k:'castles',  label:'城',           col:'#8a5a2b', items:CASTLES,  r:c => c.t === 'N' ? 5.6 : c.t === 'k' ? 5.2 : c.t === 's' ? 4.4 : 3.8, g:'建物・歴史' },
  { k:'towers',   label:'タワー',       col:'#c62828', items:TOWERS,   r:5.2, g:'建物・歴史' },
  { k:'whs',      label:'世界遺産',     col:'#b5851a', items:WHS,      r:5.6, g:'建物・歴史' },
  { k:'nature',   label:'自然',         col:'#4d7c0f', items:NATURE,   r:5.2, g:'自然・景色' },
  { k:'hyaku',    label:'日本百名山',   col:'#0d47a1', items:HYAKU,    r:5.2, g:'自然・景色' },
  { k:'scenic',   label:'日本百景',     col:'#2f9e8f', items:SCENIC,   r:5.6, g:'自然・景色' },
  { k:'biwa',     label:'琵琶湖',       col:'#2e86ab', items:BIWA,     r:5.8, g:'自然・景色' },
  { k:'airports', label:'空港',         col:'#5b6b7a', items:AIRPORTS, r:4.4, g:'交通・まち' },
  { k:'shin',     label:'新幹線の駅',   col:'#6d7f1f', items:SHIN,     r:4.4, g:'交通・まち' },
  { k:'stations', label:'道の駅',       col:'#148a8a', items:STATIONS, r:3.4, g:'交通・まち' },
  { k:'capitals', label:'県庁所在地',   col:'#4f63c9', items:CAPS,     r:5.2, g:'交通・まち' },
  { k:'ik',       label:'レアスポット', col:'#7a3b3b', items:IKENAI,   r:5.6, g:'とっておき' },
  { k:'my',       label:'マイスポット', col:'#d0662a', items:MYS,      r:5.8, g:'とっておき' },
];
const KORDER = KINDS.map(x => x.k), KIND_BY = {}, MODE_LABEL = {}, KCOL = {};
const KGROUPS = [...new Set(KINDS.map(x => x.g))].map(g => ({ g, ks:KINDS.filter(x => x.g === g).map(x => x.k) }));
KINDS.forEach(x => { KIND_BY[x.k] = x; MODE_LABEL[x.k] = x.label; KCOL[x.k] = x.col; });
/* 種類ごとに、データにあるタグを、細かい絞り込みのボタンにする（付いている数の多い順。種類の絞り込みの後ろに並べる） */
KINDS.forEach(x => {
  const c = {}; x.items.forEach(o => (o.tag ? o.tag.split('、') : []).forEach(t => { c[t] = (c[t] || 0) + 1; }));
  const tags = Object.keys(c).sort((a, b) => c[b] - c[a]); if (!tags.length) return;
  TYPEF[x.k] = (TYPEF[x.k] || [['すべて', 'all']]).concat(tags.map(t => [t, 'tag:' + t, o => hasTag(o, t)]));
});
function modeItems(k) { return (KIND_BY[k] || KIND_BY.castles).items; }

const PREF_ORDER = ["北海道","青森","岩手","宮城","秋田","山形","福島","茨城","栃木","群馬","埼玉","千葉","東京","神奈川","新潟","富山","石川","福井","山梨","長野","岐阜","静岡","愛知","三重","滋賀","京都","大阪","兵庫","奈良","和歌山","鳥取","島根","岡山","広島","山口","徳島","香川","愛媛","高知","福岡","佐賀","長崎","熊本","大分","宮崎","鹿児島","沖縄"];


/* ===== 行った記録(このブラウザに保存。人ごとに分けられる) ===== */
const REC_KEY = 'jp-records-v1';
/* 古い id → いまの id（記録・書き出し・注釈を読むときに読み替える）。
   博物・美術館で同じ館の別登録をまとめたもの、2026-10-24 に id を「種類:名前」にそろえたもの（城・道の駅・公営競技場・テーマパーク・琵琶湖） */
const ID_ALIAS = { 'mu:原田の森ギャラリー':'mu:兵庫県立美術館王子分館（原田の森ギャラリー）', 'mu:東山魁夷館':'mu:長野県立美術館', 'mu:立山博物館':'mu:富山県［立山博物館］', 'mu:富山県立近代美術館':'mu:富山県美術館', 'mu:東京大学総合研究博物館・小石川分館':'mu:東京大学総合研究博物館', 'mu:仏教美術資料研究センター':'mu:奈良国立博物館', 'mu:ウポポイ':'mu:国立アイヌ民族博物館',
  'lake:琵琶湖':'bw:琵琶湖', rs:'th:ルスツリゾート', tds:'th:東京ディズニーシー', tdl:'th:東京ディズニーランド', pl:'th:サンリオピューロランド', gb:'th:ジブリパーク', lg:'th:レゴランド・ジャパン', mm:'th:博物館明治村', ss:'th:志摩スペイン村', ut:'th:東映太秦映画村', usj:'th:ユニバーサル・スタジオ・ジャパン', hb:'th:ハウステンボス', 'th:横浜アンパンマンこどもミュージアム＆モール旧':'th:横浜アンパンマンこどもミュージアム＆モール@旧施設' };
CASTLES.forEach(c => { ID_ALIAS['c' + c.no] = c.id; });
/* 2026-10-26 に番号を直した城（金沢城と七尾城、萩城と岩国城）と、名前を変えた城。古い id は、直す前の番号・名前のもの */
Object.assign(ID_ALIAS, { c34:'cs:金沢城', c35:'cs:七尾城', c74:'cs:萩城', c75:'cs:岩国城', c24:'cs:武田氏館（躑躅ヶ崎館）', 'cs:武田氏館':'cs:武田氏館（躑躅ヶ崎館）' });
/* 2026-10-26 に入れ直した博物館で、以前の一覧（Wikipedia由来）と名前が違うもの */
Object.assign(ID_ALIAS, { 'mu:HOKUSHU仙台市科学館':'mu:仙台市科学館', 'mu:いのちのたび博物館':'mu:北九州市立いのちのたび博物館' });
/* 2026-10-27 にテーマパークからほかの種類へ移した施設と、外したミニ遊園地（同じ「わんぱーくこうち」の動物園へまとめる） */
/* 青梅鉄道公園は、2026-10-27 に博物館から外し、2026-10-28 にテーマパークから公園へ移した（もとは TWIN で博物館とテーマパークの記録を共通にしていた） */
Object.assign(ID_ALIAS, { 'mu:青梅鉄道公園':'pa:青梅鉄道公園', 'th:青梅鉄道公園':'pa:青梅鉄道公園' });
/* 2026-10-28 に、博物館を名乗る2館を水族館・動物園から博物館へ移した（名前を重く見る決まり） */
Object.assign(ID_ALIAS, { 'aq:ほたるいかミュージアム':'mu:ほたるいかミュージアム', 'zo:滋賀サファリ博物館':'mu:滋賀サファリ博物館' });
/* 2026-10-30 に、2件入っていたあくあぴあ芥川を、もとからある側にまとめた */
Object.assign(ID_ALIAS, { 'aq:あくあぴあ芥川':'aq:あくあぴあ芥川（芥川緑地資料館）' });
Object.assign(ID_ALIAS, { 'th:市立室蘭水族館':'aq:市立室蘭水族館', 'th:兵庫県立西はりま天文台公園':'mu:西はりま天文台', 'th:わんぱーくこうちプレイランド':'zo:わんぱーくこうちアニマルランド', 'th:東南植物楽園＆おきなわスロー風楽風遊の森':'bt:東南植物楽園' });
STATIONS.forEach(s => { if (s.no) ID_ALIAS['ms:' + s.no] = s.id; });
{ const old = { 競馬場:'keiba', 競輪場:'keirin', 競艇場:'kyotei', オートレース場:'auto' }; KOEI.forEach(x => { ID_ALIAS[old[x.sh] + ':' + x.n] = x.id; }); }
/* 複数のタブに出る施設は、行った記録を1つにまとめる（左が副、右が主） */
const TWIN = { 'bt:東山動植物園':'zo:東山動植物園', 'zo:姫路セントラルパーク':'th:姫路セントラルパーク', 'aq:NIFREL（ニフレル）':'zo:ニフレル', 'bw:琵琶湖':'sc:琵琶湖', 'na:西之島':'ik:西之島', 'na:屋久島':'wh:屋久島', 'na:富士山':'wh:富士山', 'na:鬼ヶ城':'sc:御濱鬼ヶ城',
  'wh:姫路城':'cs:姫路城', 'bt:国立科学博物館附属自然教育園':'mu:国立科学博物館 自然教育園', 'ms:デンパーク安城':'bt:安城産業文化公園デンパーク',
  'ms:マイントピア別子':'th:マイントピア別子', 'ms:小豆島オリーブ公園':'th:小豆島オリーブ公園', 'ms:燕趙園':'th:燕趙園', 'ms:青洲の里':'th:青洲の里', 'ms:神戸フルーツ・フラワーパーク大沢':'th:神戸 フルーツ・フラワーパーク', 'ms:美ヶ原高原':'th:美ヶ原高原美術館',
  'na:鳥海山':'sc:鳥海山', 'na:赤城山':'sc:赤城山', 'na:筑波山':'sc:筑波山', 'na:白馬岳':'sc:白馬岳', 'na:立山':'sc:立山', 'na:八ヶ岳':'sc:八ヶ岳', 'na:甲斐駒ヶ岳':'sc:甲斐駒ヶ岳', 'na:大台ヶ原山':'sc:大台ヶ原山', 'na:大山 (鳥取県)':'sc:大山', 'na:石鎚山':'sc:石鎚山', 'na:阿蘇山':'sc:阿蘇山', 'na:霧島山':'sc:霧島山', 'na:昇仙峡':'sc:御嶽昇仙峡', 'na:十和田湖':'sc:十和田湖', 'na:高田松原':'sc:高田松原', 'na:猪苗代湖':'sc:猪苗代湖', 'na:中禅寺湖':'sc:中禅寺湖', 'na:菅沼 (群馬県)':'sc:菅沼', 'na:華厳滝':'sc:華厳滝', 'na:白糸の滝 (静岡県)':'sc:富士白糸の滝', 'na:上高地':'sc:上高地', 'na:黒部峡谷':'sc:黒部峡谷', 'na:鳥羽港':'sc:鳥羽湾', 'na:朝熊山':'sc:朝熊山', 'na:浦富海岸':'sc:浦富海岸', 'na:寒霞渓':'sc:寒霞渓', 'na:御崎':'sc:赤穂御崎', 'na:鞆の浦':'sc:鞆の浦', 'na:屋島':'sc:屋島', 'na:九十九島 (西海国立公園)':'sc:九十九島', 'na:雲仙岳':'sc:雲仙岳', 'na:久住高原':'sc:久住高原', 'na:飯田高原':'sc:飯田高原', 'na:袋田の滝':'sc:袋田の滝', 'na:養老の滝':'sc:養老の滝', 'na:赤目四十八滝':'sc:赤目四十八滝', 'na:箕面滝':'sc:箕面滝', 'na:那智滝':'sc:那智滝', 'na:古座川':'sc:古座川', 'na:大沼 (七飯町)':'sc:大沼',
  'hm:利尻山':'na:利尻山', 'hm:羅臼岳':'na:羅臼岳', 'hm:斜里岳':'na:斜里岳', 'hm:雌阿寒岳':'na:雌阿寒岳', 'hm:大雪山':'na:大雪山', 'hm:トムラウシ山':'na:トムラウシ山', 'hm:十勝岳':'na:十勝岳', 'hm:幌尻岳':'na:幌尻岳', 'hm:羊蹄山':'na:羊蹄山', 'hm:岩木山':'na:岩木山', 'hm:八甲田山':'na:八甲田山', 'hm:八幡平':'na:八幡平', 'hm:岩手山':'na:岩手山', 'hm:早池峰山':'na:早池峰山', 'hm:鳥海山':'sc:鳥海山', 'hm:月山':'na:月山', 'hm:朝日岳 (山形県・新潟県)':'na:朝日岳 (山形県・新潟県)', 'hm:蔵王山':'na:蔵王山', 'hm:飯豊山':'na:飯豊山', 'hm:吾妻山':'na:吾妻山', 'hm:安達太良山':'na:安達太良山', 'hm:磐梯山':'na:磐梯山', 'hm:会津駒ヶ岳':'na:会津駒ヶ岳', 'hm:那須岳':'na:那須岳', 'hm:越後駒ヶ岳':'na:越後駒ヶ岳', 'hm:平ヶ岳':'na:平ヶ岳', 'hm:巻機山':'na:巻機山', 'hm:燧ヶ岳':'na:燧ヶ岳', 'hm:至仏山':'na:至仏山', 'hm:谷川岳':'na:谷川岳', 'hm:雨飾山':'na:雨飾山', 'hm:苗場山':'na:苗場山', 'hm:妙高山':'na:妙高山', 'hm:火打山':'na:火打山', 'hm:高妻山':'na:高妻山', 'hm:男体山':'na:男体山', 'hm:日光白根山':'na:日光白根山', 'hm:皇海山':'na:皇海山', 'hm:武尊山':'na:武尊山', 'hm:赤城山':'sc:赤城山', 'hm:草津白根山':'na:草津白根山', 'hm:四阿山':'na:四阿山', 'hm:浅間山':'na:浅間山', 'hm:筑波山':'sc:筑波山', 'hm:白馬岳':'sc:白馬岳', 'hm:五竜岳':'na:五竜岳', 'hm:鹿島槍ヶ岳':'na:鹿島槍ヶ岳', 'hm:剱岳':'na:剱岳', 'hm:立山':'sc:立山', 'hm:薬師岳':'na:薬師岳', 'hm:黒部五郎岳':'na:黒部五郎岳', 'hm:水晶岳':'na:水晶岳', 'hm:鷲羽岳':'na:鷲羽岳', 'hm:槍ヶ岳':'na:槍ヶ岳', 'hm:穂高岳':'na:穂高岳', 'hm:常念岳':'na:常念岳', 'hm:笠ヶ岳':'na:笠ヶ岳', 'hm:焼岳':'na:焼岳', 'hm:乗鞍岳':'na:乗鞍岳', 'hm:御嶽山':'na:御嶽山', 'hm:美ヶ原':'na:美ヶ原', 'hm:霧ヶ峰':'na:霧ヶ峰', 'hm:蓼科山':'na:蓼科山', 'hm:八ヶ岳':'sc:八ヶ岳', 'hm:両神山':'na:両神山', 'hm:雲取山':'na:雲取山', 'hm:甲武信ヶ岳':'na:甲武信ヶ岳', 'hm:金峰山 (山梨県・長野県)':'na:金峰山 (山梨県・長野県)', 'hm:瑞牆山':'na:瑞牆山', 'hm:大菩薩嶺':'na:大菩薩嶺', 'hm:丹沢山':'na:丹沢山', 'hm:富士山':'wh:富士山', 'hm:天城山':'na:天城山', 'hm:木曽駒ヶ岳':'na:木曽駒ヶ岳', 'hm:空木岳':'na:空木岳', 'hm:恵那山':'na:恵那山', 'hm:甲斐駒ヶ岳':'sc:甲斐駒ヶ岳', 'hm:仙丈ヶ岳':'na:仙丈ヶ岳', 'hm:鳳凰山':'na:鳳凰山', 'hm:北岳':'na:北岳', 'hm:間ノ岳':'na:間ノ岳', 'hm:塩見岳':'na:塩見岳', 'hm:荒川岳':'na:荒川岳', 'hm:赤石岳':'na:赤石岳', 'hm:聖岳':'na:聖岳', 'hm:光岳':'na:光岳', 'hm:白山':'na:白山', 'hm:荒島岳':'na:荒島岳', 'hm:伊吹山':'na:伊吹山', 'hm:大台ヶ原山':'sc:大台ヶ原山', 'hm:大峰山':'na:大峰山', 'hm:大山 (鳥取県)':'sc:大山', 'hm:剣山':'na:剣山', 'hm:石鎚山':'sc:石鎚山', 'hm:九重山':'na:九重山', 'hm:祖母山':'na:祖母山', 'hm:阿蘇山':'sc:阿蘇山', 'hm:霧島山':'sc:霧島山', 'hm:開聞岳':'na:開聞岳', 'hm:宮之浦岳':'na:宮之浦岳' };
/* 日本百名山の山を、まとめた先の id から引く（一覧の行と詳細で使う） */
const HM_OF = {}; HYAKU.forEach(h => { HM_OF[TWIN[h.id] || h.id] = h; });
const cid = id => TWIN[id] || id;

const KIND = new Map(), ALLX = [];
let dataRev = 0;   /* データが変わった回数（initAll のたびに増やす） */
function initAll() {
  if (typeof dotsStale !== 'undefined') dotsStale = true; dataRev++;
  if (ALLX.length) return;
  KORDER.forEach(m => modeItems(m).forEach(o => { if (TWIN[o.id]) return; KIND.set(o.id, m); ALLX.push(o); }));
}

function findItem(id) { return ALLX.find(x => x.id === id); }

function prefFull(p) { return PREF_KEY[p] || p; }

function pfShort(k) { return k === '北海道' ? k : k.replace(/[都府県]$/, ''); }

function fmtDate(d) { return d ? d.replace(/^(\d{4})-(\d{2})-(\d{2})$/, (m, y, mo, da) => y + '/' + mo + '/' + da) : '日付なし'; }

/* ===== マイスポット(自分で足した地点。この端末のブラウザに保存。MYS は「種類の表」のところ) ===== */

function addMySpot(o) {
  if (!o || typeof o !== 'object') return null;
  const n = typeof o.n === 'string' ? o.n.trim().slice(0, 60) : '';
  const lo = +o.lo, la = +o.la;
  if (!n || !(lo >= 122 && lo <= 154) || !(la >= 20 && la <= 46)) return null;
  let id = typeof o.id === 'string' && /^my:[A-Za-z0-9]{3,30}$/.test(o.id) ? o.id : 'my:' + newId();
  if (MYS.some(m => m.id === id)) return null;
  const pf = PREF_ORDER.includes(o.pf) ? o.pf : '東京';
  const m = { id, n, k:typeof o.k === 'string' ? o.k.trim().slice(0, 30) : '', memo:typeof o.memo === 'string' ? o.memo.trim().slice(0, 500) : '', pf, lo, la, rg:REGION_OF[pf], my:1 };
  MYS.push(m);
  return m;
}
function saveMys() { store.set(MYS_KEY, JSON.stringify(MYS.map(m => ({ id:m.id, n:m.n, k:m.k, memo:m.memo, pf:m.pf, lo:m.lo, la:m.la })))); }
try { const a = JSON.parse(store.get(MYS_KEY)); if (Array.isArray(a)) a.forEach(o => addMySpot(o)); } catch (e) {}
function rebuildAllx() { ALLX.length = 0; KIND.clear(); initAll(); }

/* 一覧から外した施設の id。行った記録を消さないために、記録の読み込みだけに使う（博物館は data/museums.js の MUSEUMS_RETIRED） */
const RETIRED_IDS = ['th:ゆうばりめろん城', 'th:大洗わくわく科学館'];
const ALL_IDS = new Set([].concat(...KINDS.map(x => x.items.map(o => o.id)), MUSEUMS_RETIRED, RETIRED_IDS));
MYS.forEach(m => ALL_IDS.add(m.id));
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
/* 1か所につき「行った日」のリスト。日付が分からない回は空文字。旧形式(文字列1つ)も読める */
function normList(v) {
  if (Array.isArray(v)) return v.filter(x => typeof x === 'string' && (x === '' || DATE_RE.test(x))).slice(0, 50).sort();
  if (typeof v === 'string') return [DATE_RE.test(v) ? v : ''];
  return [];
}
function newId() { return 'p' + Date.now().toString(36) + Math.floor(Math.random() * 46656).toString(36); }
function loadRec() {
  try {
    const j = JSON.parse(store.get(REC_KEY));
    if (j && Array.isArray(j.profiles) && j.profiles.length && j.data && typeof j.data === 'object') {
      if (!j.profiles.some(p => p.id === j.cur)) j.cur = j.profiles[0].id;
      j.profiles.forEach(p => {
        const o = (j.data[p.id] && typeof j.data[p.id] === 'object') ? j.data[p.id] : {}, n = {};
        Object.keys(o).forEach(id0 => { const id = cid(ID_ALIAS[id0] || id0); if (ALL_IDS.has(id)) { const l = normList(o[id0]).concat(n[id] || []); if (l.length) n[id] = l.filter((d, i) => d === '' ? l.indexOf('') === i : l.indexOf(d) === i).sort(); } });
        j.data[p.id] = n;
      });
      return j;
    }
  } catch (e) {}
  return { v:1, rev:0, cur:'p1', profiles:[{ id:'p1', name:'わたし' }], data:{ p1:{} } };
}
let rec = loadRec();
const storageOK = (() => { try { localStorage.setItem('jp-probe', '1'); localStorage.removeItem('jp-probe'); return true; } catch (e) { return false; } })();
function saveRec() { rec.rev = (rec.rev || 0) + 1; store.set(REC_KEY, JSON.stringify(rec)); }
function curData() { return rec.data[rec.cur]; }
function curName() { return rec.profiles.find(p => p.id === rec.cur).name; }
function isVisited(id) { id = cid(id); return has(curData(), id) && curData()[id].length > 0; }


/* ===== ファイルへの保存 =====
   claude.ai の中では downloads の機能で、外（GitHub Pages など）では、ふつうのダウンロードにする */
let dlNs = null;
(async () => {
  try {
    const dl = (window.claude && window.claude.use) ? await window.claude.use('downloads') : null;
    if (dl) dlNs = dl;
  } catch (e) {}
})();
function saveFile(name, data, type) {
  if (dlNs) return dlNs.save({ filename:name, data });
  return new Promise((ok, ng) => {
    try {
      const url = URL.createObjectURL(new Blob([data], { type })), a = document.createElement('a');
      a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      ok();
    } catch (e) { ng(e); }
  });
}

var TWIN_KINDS = {};
/* 項目の分類（本来の分類＋双子（TWIN）で重なる分類）。絞り込みと件数で、どれか1つでも選ばれていれば対象にする */
const kindsOf = x => [KIND.get(x.id)].concat(twinKinds()[x.id] || []);
function twinKinds() {
  if (twinKinds.done) return TWIN_KINDS; twinKinds.done = true;
  Object.keys(TWIN).forEach(sec => { const k = KORDER.find(k => modeItems(k).some(o => o.id === sec)); if (k) (TWIN_KINDS[TWIN[sec]] = TWIN_KINDS[TWIN[sec]] || []).push(k); });
  return TWIN_KINDS;
}

/* 戻るボタンで、前に開いたページがそのまま出てきたときは、読み直す（ほかのページで変えた記録を反映するため） */
addEventListener('pageshow', e => { if (e.persisted) location.reload(); });
