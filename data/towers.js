/* ===== タワー（全日本タワー連盟の加盟20塔と、letroo基準の塔）=====
   一覧・ブロック・高さ・竣工は、Wikipedia 日本語版「全日本タワー連盟」の加盟タワーの表による（research の candidates/towers.md）。高さ・竣工は、各塔の記事の情報欄（ないものはカテゴリ）と違うときは、記事のほうにした。
   位置は OpenStreetMap の塔そのものの位置（rp に書く）。bl はブロック、ht は高さ（m）、sd は竣工。o は別名（記事の名前など）、in はほかの施設の中にあるときの、その施設の名前。
   web は公式サイト（全日本タワー連盟の各塔のページのリンク・OpenStreetMap・Wikidata から取り、開けることを確かめた）。
   kb が「letroo基準」の塔は、連盟に入っていないが作者の判断で入れたもの（bl は書かない）。 */
const TOWERS = [
{"id": "tw:さっぽろテレビ塔", "n": "さっぽろテレビ塔", "pf": "北海道", "ci": "札幌市中央区", "lo": 141.356448, "la": 43.061113, "rp": "OpenStreetMap", "bl": "イースト", "ht": "144", "sd": "1957年", "in": "大通公園", "wp": "ja:さっぽろテレビ塔", "tag": "タワー六兄弟", "web": "https://www.tv-tower.co.jp/"},
{"id": "tw:五稜郭タワー", "n": "五稜郭タワー", "pf": "北海道", "ci": "函館市", "lo": 140.753965, "la": 41.794643, "rp": "OpenStreetMap", "bl": "イースト", "ht": "107", "sd": "2006年", "wp": "ja:五稜郭タワー", "web": "https://www.goryokaku-tower.co.jp/"},
{"id": "tw:行田タワー", "n": "行田タワー", "pf": "埼玉", "ci": "行田市", "lo": 139.50076, "la": 36.13111, "rp": "OpenStreetMap", "bl": "イースト", "ht": "59.65", "sd": "2001年", "o": "古代蓮会館展望タワー", "in": "古代蓮の里", "wp": "ja:古代蓮の里", "web": "https://www.ikiiki-zaidan.or.jp/kodaihasu/"},
{"id": "tw:銚子ポートタワー", "n": "銚子ポートタワー", "pf": "千葉", "ci": "銚子市", "lo": 140.862865, "la": 35.740951, "rp": "OpenStreetMap", "bl": "イースト", "ht": "57.7", "sd": "1991年", "wp": "ja:銚子ポートタワー", "web": "https://www.choshikanko.com/porttower/"},
{"id": "tw:千葉ポートタワー", "n": "千葉ポートタワー", "pf": "千葉", "ci": "千葉市中央区", "lo": 140.097858, "la": 35.600421, "rp": "OpenStreetMap", "bl": "イースト", "ht": "125", "sd": "1986年", "in": "千葉ポートパーク", "wp": "ja:千葉ポートタワー", "web": "https://www.chiba-porttower.com/"},
{"id": "tw:東京タワー", "n": "東京タワー", "pf": "東京", "ci": "港区", "lo": 139.74544, "la": 35.658564, "rp": "OpenStreetMap", "bl": "イースト", "ht": "333", "sd": "1958年", "wp": "ja:東京タワー", "tag": "タワー六兄弟", "web": "https://www.tokyotower.co.jp/"},
{"id": "tw:東京スカイツリー", "n": "東京スカイツリー", "pf": "東京", "ci": "墨田区", "lo": 139.810714, "la": 35.710045, "rp": "OpenStreetMap", "kb": "letroo基準", "ht": "634", "sd": "2012年", "in": "東京スカイツリータウン", "wp": "ja:東京スカイツリー", "web": "https://www.tokyo-skytree.jp/"},
{"id": "tw:横浜マリンタワー", "n": "横浜マリンタワー", "pf": "神奈川", "ci": "横浜市中区", "lo": 139.6509, "la": 35.443931, "rp": "OpenStreetMap", "bl": "イースト", "ht": "106", "sd": "1961年", "wp": "ja:横浜マリンタワー", "web": "https://www.marinetower.yokohama/"},
{"id": "tw:中部電力 MIRAI TOWER", "n": "中部電力 MIRAI TOWER", "pf": "愛知", "ci": "名古屋市中区", "lo": 136.908334, "la": 35.172297, "rp": "OpenStreetMap", "bl": "セントラル", "ht": "180", "sd": "1954年", "o": "名古屋テレビ塔", "in": "久屋大通公園", "wp": "ja:名古屋テレビ塔", "tag": "タワー六兄弟", "web": "https://www.nagoya-tv-tower.co.jp/"},
{"id": "tw:東山スカイタワー", "n": "東山スカイタワー", "pf": "愛知", "ci": "名古屋市千種区", "lo": 136.978846, "la": 35.156756, "rp": "OpenStreetMap", "bl": "セントラル", "ht": "134", "sd": "1989年", "in": "東山動植物園", "wp": "ja:東山スカイタワー", "web": "https://higashiyamaskytower.jp/"},
{"id": "tw:東尋坊タワー", "n": "東尋坊タワー", "pf": "福井", "ci": "坂井市", "lo": 136.128227, "la": 36.236084, "rp": "OpenStreetMap", "bl": "セントラル", "ht": "55", "sd": "1964年", "web": "http://www.tojinbo.net/"},
{"id": "tw:ツインアーチ138", "n": "ツインアーチ138", "pf": "愛知", "ci": "一宮市", "lo": 136.809056, "la": 35.357698, "rp": "OpenStreetMap", "bl": "セントラル", "ht": "138", "sd": "1995年", "in": "138タワーパーク", "wp": "ja:ツインアーチ138", "web": "https://www.kisosansenkoen.jp/~tower138/m138twinarch.html"},
{"id": "tw:クロスランドタワー", "n": "クロスランドタワー", "pf": "富山", "ci": "小矢部市", "lo": 136.87848, "la": 36.656597, "rp": "OpenStreetMap", "bl": "セントラル", "ht": "118", "sd": "1994年", "in": "クロスランドおやべ", "wp": "ja:クロスランドおやべ", "web": "https://cross-oyabe.jp/"},
{"id": "tw:通天閣", "n": "通天閣", "pf": "大阪", "ci": "大阪市浪速区", "lo": 135.50631, "la": 34.652539, "rp": "OpenStreetMap", "bl": "カンサイ", "ht": "108", "sd": "1956年", "wp": "ja:通天閣", "tag": "タワー六兄弟", "web": "https://www.tsutenkaku.co.jp/"},
{"id": "tw:ニデック京都タワー", "n": "ニデック京都タワー", "pf": "京都", "ci": "京都市下京区", "lo": 135.759329, "la": 34.987556, "rp": "OpenStreetMap", "bl": "カンサイ", "ht": "131", "sd": "1964年", "o": "京都タワー", "wp": "ja:京都タワー", "web": "https://www.kyoto-tower.jp/"},
{"id": "tw:神戸ポートタワー", "n": "神戸ポートタワー", "pf": "兵庫", "ci": "神戸市中央区", "lo": 135.186724, "la": 34.682628, "rp": "OpenStreetMap", "bl": "カンサイ", "ht": "108", "sd": "1963年", "wp": "ja:神戸ポートタワー", "web": "https://www.kobe-port-tower.com/"},
{"id": "tw:空中庭園展望台", "n": "空中庭園展望台", "pf": "大阪", "ci": "大阪市北区", "lo": 135.49014, "la": 34.7053, "rp": "OpenStreetMap", "bl": "カンサイ", "ht": "173", "sd": "1993年", "o": "梅田スカイビル", "in": "梅田スカイビル", "wp": "ja:梅田スカイビル", "web": "https://www.kuchu-teien.com/observatory/"},
{"id": "tw:福岡タワー", "n": "福岡タワー", "pf": "福岡", "ci": "福岡市早良区", "lo": 130.351471, "la": 33.593289, "rp": "OpenStreetMap", "bl": "ウエスト", "ht": "234", "sd": "1989年", "wp": "ja:福岡タワー", "web": "https://www.fukuokatower.co.jp/"},
{"id": "tw:海峡ゆめタワー", "n": "海峡ゆめタワー", "pf": "山口", "ci": "下関市", "lo": 130.929739, "la": 33.949801, "rp": "OpenStreetMap", "bl": "ウエスト", "ht": "153", "sd": "1996年", "wp": "ja:山口県国際総合センター", "web": "https://www.yumetower.jp/"},
{"id": "tw:夢みなとタワー", "n": "夢みなとタワー", "pf": "鳥取", "ci": "境港市", "lo": 133.259572, "la": 35.519619, "rp": "OpenStreetMap", "bl": "ウエスト", "ht": "43", "sd": "1997年", "in": "夢みなと公園", "web": "https://www.yumeminatotower.gr.jp/"},
{"id": "tw:別府タワー", "n": "別府タワー", "pf": "大分", "ci": "別府市", "lo": 131.505924, "la": 33.281711, "rp": "OpenStreetMap", "bl": "ウエスト", "ht": "100", "sd": "1957年", "wp": "ja:別府タワー", "tag": "タワー六兄弟", "web": "https://bepputower.co.jp/"},
];
