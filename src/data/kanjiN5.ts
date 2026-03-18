/**
 * N5 Kanji dataset — 103 kanji for JLPT N5 level.
 * Sourced from standard JLPT N5 lists cross-referenced with KANJIDIC2.
 *
 * Each entry includes:
 *   - character, stroke count, grade (school year), frequency rank
 *   - radical and radical name
 *   - on'yomi (katakana) and kun'yomi (hiragana) readings
 *   - meanings keyed by language code (en for now)
 *   - mnemonic hint for memorization
 */

export interface KanjiEntry {
  character: string;
  strokeCount: number;
  jlptLevel: number;
  grade: number;
  frequencyRank: number;
  radical: string;
  radicalNames: string[];
  onReadings: string[];
  kunReadings: string[];
  meanings: Record<string, string[]>;
  mnemonic: string | null;
}

export const KANJI_N5: KanjiEntry[] = [
  // ── Numbers ──
  { character: '一', strokeCount: 1, jlptLevel: 5, grade: 1, frequencyRank: 2, radical: '一', radicalNames: ['one'], onReadings: ['イチ', 'イツ'], kunReadings: ['ひと-', 'ひと.つ'], meanings: { en: ['one', 'first'] }, mnemonic: 'A single horizontal line — the number one' },
  { character: '二', strokeCount: 2, jlptLevel: 5, grade: 1, frequencyRank: 9, radical: '二', radicalNames: ['two'], onReadings: ['ニ', 'ジ'], kunReadings: ['ふた', 'ふた.つ'], meanings: { en: ['two', 'second'] }, mnemonic: 'Two horizontal lines stacked' },
  { character: '三', strokeCount: 3, jlptLevel: 5, grade: 1, frequencyRank: 14, radical: '一', radicalNames: ['one'], onReadings: ['サン'], kunReadings: ['み', 'み.つ', 'みっ.つ'], meanings: { en: ['three', 'third'] }, mnemonic: 'Three horizontal lines stacked' },
  { character: '四', strokeCount: 5, jlptLevel: 5, grade: 1, frequencyRank: 47, radical: '囗', radicalNames: ['enclosure'], onReadings: ['シ'], kunReadings: ['よ', 'よ.つ', 'よっ.つ', 'よん'], meanings: { en: ['four'] }, mnemonic: 'Four legs visible inside the box' },
  { character: '五', strokeCount: 4, jlptLevel: 5, grade: 1, frequencyRank: 31, radical: '二', radicalNames: ['two'], onReadings: ['ゴ'], kunReadings: ['いつ', 'いつ.つ'], meanings: { en: ['five'] }, mnemonic: 'Five — looks like a cross between lines' },
  { character: '六', strokeCount: 4, jlptLevel: 5, grade: 1, frequencyRank: 93, radical: '八', radicalNames: ['eight'], onReadings: ['ロク'], kunReadings: ['む', 'む.つ', 'むっ.つ', 'むい'], meanings: { en: ['six'] }, mnemonic: 'A top hat with legs — six' },
  { character: '七', strokeCount: 2, jlptLevel: 5, grade: 1, frequencyRank: 115, radical: '一', radicalNames: ['one'], onReadings: ['シチ'], kunReadings: ['なな', 'なな.つ', 'なの'], meanings: { en: ['seven'] }, mnemonic: 'A bent number 7' },
  { character: '八', strokeCount: 2, jlptLevel: 5, grade: 1, frequencyRank: 92, radical: '八', radicalNames: ['eight'], onReadings: ['ハチ'], kunReadings: ['や', 'や.つ', 'やっ.つ', 'よう'], meanings: { en: ['eight'] }, mnemonic: 'Two strokes spreading apart like 8' },
  { character: '九', strokeCount: 2, jlptLevel: 5, grade: 1, frequencyRank: 55, radical: '乙', radicalNames: ['second'], onReadings: ['キュウ', 'ク'], kunReadings: ['ここの', 'ここの.つ'], meanings: { en: ['nine'] }, mnemonic: 'Looks like a curving 9' },
  { character: '十', strokeCount: 2, jlptLevel: 5, grade: 1, frequencyRank: 8, radical: '十', radicalNames: ['ten'], onReadings: ['ジュウ', 'ジッ'], kunReadings: ['とお', 'と'], meanings: { en: ['ten'] }, mnemonic: 'A cross — like the Roman numeral X for 10' },
  { character: '百', strokeCount: 6, jlptLevel: 5, grade: 1, frequencyRank: 163, radical: '白', radicalNames: ['white'], onReadings: ['ヒャク', 'ビャク'], kunReadings: ['もも'], meanings: { en: ['hundred'] }, mnemonic: 'One on top of white — one hundred whites' },
  { character: '千', strokeCount: 3, jlptLevel: 5, grade: 1, frequencyRank: 195, radical: '十', radicalNames: ['ten'], onReadings: ['セン'], kunReadings: ['ち'], meanings: { en: ['thousand'] }, mnemonic: 'A line through ten — ten hundreds = thousand' },
  { character: '万', strokeCount: 3, jlptLevel: 5, grade: 2, frequencyRank: 375, radical: '一', radicalNames: ['one'], onReadings: ['マン', 'バン'], kunReadings: ['よろず'], meanings: { en: ['ten thousand', 'myriad'] }, mnemonic: 'Ten thousand — a very large number' },
  { character: '円', strokeCount: 4, jlptLevel: 5, grade: 1, frequencyRank: 69, radical: '冂', radicalNames: ['upside-down box'], onReadings: ['エン'], kunReadings: ['まる.い'], meanings: { en: ['yen', 'circle', 'round'] }, mnemonic: 'The yen symbol — Japanese currency' },

  // ── Time & Calendar ──
  { character: '日', strokeCount: 4, jlptLevel: 5, grade: 1, frequencyRank: 1, radical: '日', radicalNames: ['sun', 'day'], onReadings: ['ニチ', 'ジツ'], kunReadings: ['ひ', '-び', '-か'], meanings: { en: ['day', 'sun', 'Japan'] }, mnemonic: 'The sun — a window showing sunlight' },
  { character: '月', strokeCount: 4, jlptLevel: 5, grade: 1, frequencyRank: 13, radical: '月', radicalNames: ['moon', 'month'], onReadings: ['ゲツ', 'ガツ'], kunReadings: ['つき'], meanings: { en: ['month', 'moon'] }, mnemonic: 'A crescent moon with legs' },
  { character: '火', strokeCount: 4, jlptLevel: 5, grade: 1, frequencyRank: 574, radical: '火', radicalNames: ['fire'], onReadings: ['カ'], kunReadings: ['ひ', '-び', 'ほ-'], meanings: { en: ['fire', 'Tuesday'] }, mnemonic: 'A person with arms spread over a campfire' },
  { character: '水', strokeCount: 4, jlptLevel: 5, grade: 1, frequencyRank: 223, radical: '水', radicalNames: ['water'], onReadings: ['スイ'], kunReadings: ['みず'], meanings: { en: ['water', 'Wednesday'] }, mnemonic: 'Water flowing — a stream with splashes' },
  { character: '木', strokeCount: 4, jlptLevel: 5, grade: 1, frequencyRank: 317, radical: '木', radicalNames: ['tree'], onReadings: ['ボク', 'モク'], kunReadings: ['き', 'こ-'], meanings: { en: ['tree', 'wood', 'Thursday'] }, mnemonic: 'A tree with branches and roots' },
  { character: '金', strokeCount: 8, jlptLevel: 5, grade: 1, frequencyRank: 53, radical: '金', radicalNames: ['metal', 'gold'], onReadings: ['キン', 'コン'], kunReadings: ['かね', 'かな-', '-がね'], meanings: { en: ['gold', 'money', 'metal', 'Friday'] }, mnemonic: 'A mine with gold nuggets underground' },
  { character: '土', strokeCount: 3, jlptLevel: 5, grade: 1, frequencyRank: 307, radical: '土', radicalNames: ['earth'], onReadings: ['ド', 'ト'], kunReadings: ['つち'], meanings: { en: ['earth', 'soil', 'Saturday'] }, mnemonic: 'A cross planted in the ground — earth' },
  { character: '年', strokeCount: 6, jlptLevel: 5, grade: 1, frequencyRank: 6, radical: '干', radicalNames: ['dry'], onReadings: ['ネン'], kunReadings: ['とし'], meanings: { en: ['year'] }, mnemonic: 'A grain growing through seasons — one year' },
  { character: '時', strokeCount: 10, jlptLevel: 5, grade: 2, frequencyRank: 16, radical: '日', radicalNames: ['sun'], onReadings: ['ジ'], kunReadings: ['とき', '-どき'], meanings: { en: ['time', 'hour'] }, mnemonic: 'Sun + temple — time measured by the sun at the temple' },
  { character: '間', strokeCount: 12, jlptLevel: 5, grade: 2, frequencyRank: 33, radical: '門', radicalNames: ['gate'], onReadings: ['カン', 'ケン'], kunReadings: ['あいだ', 'ま', 'あい'], meanings: { en: ['interval', 'space', 'between'] }, mnemonic: 'Sun seen through a gate — the space between' },
  { character: '分', strokeCount: 4, jlptLevel: 5, grade: 2, frequencyRank: 37, radical: '刀', radicalNames: ['sword'], onReadings: ['ブン', 'フン', 'ブ'], kunReadings: ['わ.ける', 'わ.かれる', 'わ.かる', 'わ.かつ'], meanings: { en: ['part', 'minute', 'understand'] }, mnemonic: 'A sword dividing something into parts' },
  { character: '半', strokeCount: 5, jlptLevel: 5, grade: 2, frequencyRank: 224, radical: '十', radicalNames: ['ten'], onReadings: ['ハン'], kunReadings: ['なか.ば'], meanings: { en: ['half', 'middle'] }, mnemonic: 'A cow cut in half — two halves' },
  { character: '今', strokeCount: 4, jlptLevel: 5, grade: 2, frequencyRank: 49, radical: '人', radicalNames: ['person'], onReadings: ['コン', 'キン'], kunReadings: ['いま'], meanings: { en: ['now', 'present'] }, mnemonic: 'A person sitting right now' },
  { character: '先', strokeCount: 6, jlptLevel: 5, grade: 1, frequencyRank: 173, radical: '儿', radicalNames: ['legs'], onReadings: ['セン'], kunReadings: ['さき', 'ま.ず'], meanings: { en: ['previous', 'ahead', 'before'] }, mnemonic: 'Legs walking ahead — going first' },
  { character: '後', strokeCount: 9, jlptLevel: 5, grade: 2, frequencyRank: 26, radical: '彳', radicalNames: ['step'], onReadings: ['ゴ', 'コウ'], kunReadings: ['のち', 'うし.ろ', 'あと'], meanings: { en: ['behind', 'after', 'later'] }, mnemonic: 'Steps taken after — behind' },
  { character: '午', strokeCount: 4, jlptLevel: 5, grade: 2, frequencyRank: 154, radical: '十', radicalNames: ['ten'], onReadings: ['ゴ'], kunReadings: ['うま'], meanings: { en: ['noon', 'sign of the horse'] }, mnemonic: 'The sun at its peak — noon' },
  { character: '前', strokeCount: 9, jlptLevel: 5, grade: 2, frequencyRank: 27, radical: '刀', radicalNames: ['sword'], onReadings: ['ゼン'], kunReadings: ['まえ', '-まえ'], meanings: { en: ['in front', 'before'] }, mnemonic: 'A sword pointing forward — in front' },
  { character: '毎', strokeCount: 6, jlptLevel: 5, grade: 2, frequencyRank: 436, radical: '毋', radicalNames: ['do not'], onReadings: ['マイ'], kunReadings: ['ごと', '-ごと.に'], meanings: { en: ['every', 'each'] }, mnemonic: 'Every mother — every single one' },
  { character: '週', strokeCount: 11, jlptLevel: 5, grade: 2, frequencyRank: 518, radical: '辶', radicalNames: ['road'], onReadings: ['シュウ'], kunReadings: [], meanings: { en: ['week'] }, mnemonic: 'Walking in a cycle — a week of travel' },

  // ── People & Body ──
  { character: '人', strokeCount: 2, jlptLevel: 5, grade: 1, frequencyRank: 5, radical: '人', radicalNames: ['person'], onReadings: ['ジン', 'ニン'], kunReadings: ['ひと', '-り', '-と'], meanings: { en: ['person', 'people'] }, mnemonic: 'A person walking — two legs' },
  { character: '子', strokeCount: 3, jlptLevel: 5, grade: 1, frequencyRank: 72, radical: '子', radicalNames: ['child'], onReadings: ['シ', 'ス'], kunReadings: ['こ', '-こ', 'ね'], meanings: { en: ['child'] }, mnemonic: 'A child with arms outstretched' },
  { character: '女', strokeCount: 3, jlptLevel: 5, grade: 1, frequencyRank: 151, radical: '女', radicalNames: ['woman'], onReadings: ['ジョ', 'ニョ'], kunReadings: ['おんな', 'め'], meanings: { en: ['woman', 'female'] }, mnemonic: 'A woman sitting gracefully' },
  { character: '男', strokeCount: 7, jlptLevel: 5, grade: 1, frequencyRank: 240, radical: '田', radicalNames: ['rice field'], onReadings: ['ダン', 'ナン'], kunReadings: ['おとこ', 'お'], meanings: { en: ['man', 'male'] }, mnemonic: 'Strength in the rice field — a working man' },
  { character: '父', strokeCount: 4, jlptLevel: 5, grade: 2, frequencyRank: 646, radical: '父', radicalNames: ['father'], onReadings: ['フ'], kunReadings: ['ちち'], meanings: { en: ['father'] }, mnemonic: 'Two crossed arms holding tools — father at work' },
  { character: '母', strokeCount: 5, jlptLevel: 5, grade: 2, frequencyRank: 570, radical: '毋', radicalNames: ['do not'], onReadings: ['ボ'], kunReadings: ['はは', 'も'], meanings: { en: ['mother'] }, mnemonic: 'Two dots like breasts — nurturing mother' },
  { character: '友', strokeCount: 4, jlptLevel: 5, grade: 2, frequencyRank: 474, radical: '又', radicalNames: ['again'], onReadings: ['ユウ'], kunReadings: ['とも'], meanings: { en: ['friend'] }, mnemonic: 'Two hands reaching together — friends' },
  { character: '目', strokeCount: 5, jlptLevel: 5, grade: 1, frequencyRank: 76, radical: '目', radicalNames: ['eye'], onReadings: ['モク', 'ボク'], kunReadings: ['め', '-め', 'ま-'], meanings: { en: ['eye', 'look'] }, mnemonic: 'An eye turned sideways' },
  { character: '耳', strokeCount: 6, jlptLevel: 5, grade: 1, frequencyRank: 1328, radical: '耳', radicalNames: ['ear'], onReadings: ['ジ'], kunReadings: ['みみ'], meanings: { en: ['ear'] }, mnemonic: 'An ear with its folds visible' },
  { character: '口', strokeCount: 3, jlptLevel: 5, grade: 1, frequencyRank: 284, radical: '口', radicalNames: ['mouth'], onReadings: ['コウ', 'ク'], kunReadings: ['くち'], meanings: { en: ['mouth', 'opening'] }, mnemonic: 'An open mouth — a square opening' },
  { character: '手', strokeCount: 4, jlptLevel: 5, grade: 1, frequencyRank: 60, radical: '手', radicalNames: ['hand'], onReadings: ['シュ'], kunReadings: ['て', 'て-', '-て', 'た-'], meanings: { en: ['hand'] }, mnemonic: 'A hand with fingers spread' },
  { character: '足', strokeCount: 7, jlptLevel: 5, grade: 1, frequencyRank: 343, radical: '足', radicalNames: ['foot'], onReadings: ['ソク'], kunReadings: ['あし', 'た.りる', 'た.る', 'た.す'], meanings: { en: ['foot', 'leg', 'sufficient'] }, mnemonic: 'A knee and foot — walking' },

  // ── Nature & Direction ──
  { character: '山', strokeCount: 3, jlptLevel: 5, grade: 1, frequencyRank: 131, radical: '山', radicalNames: ['mountain'], onReadings: ['サン', 'セン'], kunReadings: ['やま'], meanings: { en: ['mountain'] }, mnemonic: 'Three peaks of a mountain' },
  { character: '川', strokeCount: 3, jlptLevel: 5, grade: 1, frequencyRank: 181, radical: '川', radicalNames: ['river'], onReadings: ['セン'], kunReadings: ['かわ'], meanings: { en: ['river', 'stream'] }, mnemonic: 'Three flowing streams of a river' },
  { character: '天', strokeCount: 4, jlptLevel: 5, grade: 1, frequencyRank: 512, radical: '大', radicalNames: ['big'], onReadings: ['テン'], kunReadings: ['あめ', 'あま-'], meanings: { en: ['heaven', 'sky'] }, mnemonic: 'Above a person — the heavens' },
  { character: '気', strokeCount: 6, jlptLevel: 5, grade: 1, frequencyRank: 113, radical: '气', radicalNames: ['steam'], onReadings: ['キ', 'ケ'], kunReadings: ['いき'], meanings: { en: ['spirit', 'mood', 'air'] }, mnemonic: 'Rice steaming — the spirit of food' },
  { character: '雨', strokeCount: 8, jlptLevel: 5, grade: 1, frequencyRank: 950, radical: '雨', radicalNames: ['rain'], onReadings: ['ウ'], kunReadings: ['あめ', 'あま-', '-さめ'], meanings: { en: ['rain'] }, mnemonic: 'Raindrops falling from a cloud' },
  { character: '花', strokeCount: 7, jlptLevel: 5, grade: 1, frequencyRank: 578, radical: '艹', radicalNames: ['grass'], onReadings: ['カ'], kunReadings: ['はな'], meanings: { en: ['flower'] }, mnemonic: 'A plant that has changed — blossomed into a flower' },
  { character: '上', strokeCount: 3, jlptLevel: 5, grade: 1, frequencyRank: 10, radical: '一', radicalNames: ['one'], onReadings: ['ジョウ', 'ショウ'], kunReadings: ['うえ', '-うえ', 'うわ-', 'かみ', 'あ.げる', 'のぼ.る'], meanings: { en: ['above', 'up', 'upper'] }, mnemonic: 'A line above the base — up' },
  { character: '下', strokeCount: 3, jlptLevel: 5, grade: 1, frequencyRank: 15, radical: '一', radicalNames: ['one'], onReadings: ['カ', 'ゲ'], kunReadings: ['した', 'しも', 'もと', 'さ.げる', 'くだ.る', 'お.ろす'], meanings: { en: ['below', 'down', 'under'] }, mnemonic: 'A line below the base — down' },
  { character: '中', strokeCount: 4, jlptLevel: 5, grade: 1, frequencyRank: 11, radical: '丨', radicalNames: ['line'], onReadings: ['チュウ'], kunReadings: ['なか', 'うち', 'あた.る'], meanings: { en: ['middle', 'inside', 'center'] }, mnemonic: 'A line through the center of a box' },
  { character: '右', strokeCount: 5, jlptLevel: 5, grade: 1, frequencyRank: 602, radical: '口', radicalNames: ['mouth'], onReadings: ['ウ', 'ユウ'], kunReadings: ['みぎ'], meanings: { en: ['right'] }, mnemonic: 'A hand reaching for the mouth — right hand' },
  { character: '左', strokeCount: 5, jlptLevel: 5, grade: 1, frequencyRank: 630, radical: '工', radicalNames: ['work'], onReadings: ['サ'], kunReadings: ['ひだり'], meanings: { en: ['left'] }, mnemonic: 'A hand holding a tool — left hand' },
  { character: '北', strokeCount: 5, jlptLevel: 5, grade: 2, frequencyRank: 153, radical: '匕', radicalNames: ['spoon'], onReadings: ['ホク'], kunReadings: ['きた'], meanings: { en: ['north'] }, mnemonic: 'Two people sitting back to back — facing north' },
  { character: '南', strokeCount: 9, jlptLevel: 5, grade: 2, frequencyRank: 341, radical: '十', radicalNames: ['ten'], onReadings: ['ナン', 'ナ'], kunReadings: ['みなみ'], meanings: { en: ['south'] }, mnemonic: 'A tent in the warm south' },
  { character: '西', strokeCount: 6, jlptLevel: 5, grade: 2, frequencyRank: 259, radical: '西', radicalNames: ['west'], onReadings: ['セイ', 'サイ'], kunReadings: ['にし'], meanings: { en: ['west'] }, mnemonic: 'A bird nesting as the sun sets in the west' },
  { character: '東', strokeCount: 8, jlptLevel: 5, grade: 2, frequencyRank: 37, radical: '木', radicalNames: ['tree'], onReadings: ['トウ'], kunReadings: ['ひがし'], meanings: { en: ['east'] }, mnemonic: 'The sun rising behind a tree — east' },
  { character: '外', strokeCount: 5, jlptLevel: 5, grade: 2, frequencyRank: 81, radical: '夕', radicalNames: ['evening'], onReadings: ['ガイ', 'ゲ'], kunReadings: ['そと', 'ほか', 'はず.す', 'はず.れる', 'と-'], meanings: { en: ['outside', 'other'] }, mnemonic: 'Evening outside — going out at dusk' },

  // ── Actions & Concepts ──
  { character: '大', strokeCount: 3, jlptLevel: 5, grade: 1, frequencyRank: 7, radical: '大', radicalNames: ['big'], onReadings: ['ダイ', 'タイ'], kunReadings: ['おお-', 'おお.きい', '-おお.いに'], meanings: { en: ['big', 'large', 'great'] }, mnemonic: 'A person stretching arms wide — big' },
  { character: '小', strokeCount: 3, jlptLevel: 5, grade: 1, frequencyRank: 114, radical: '小', radicalNames: ['small'], onReadings: ['ショウ'], kunReadings: ['ちい.さい', 'こ-', 'お-', 'さ-'], meanings: { en: ['small', 'little'] }, mnemonic: 'Small marks — tiny dots' },
  { character: '高', strokeCount: 10, jlptLevel: 5, grade: 2, frequencyRank: 65, radical: '高', radicalNames: ['tall'], onReadings: ['コウ'], kunReadings: ['たか.い', 'たか', '-だか', 'たか.まる', 'たか.める'], meanings: { en: ['tall', 'high', 'expensive'] }, mnemonic: 'A tall tower building' },
  { character: '安', strokeCount: 6, jlptLevel: 5, grade: 3, frequencyRank: 144, radical: '宀', radicalNames: ['roof'], onReadings: ['アン'], kunReadings: ['やす.い', 'やす.まる', 'やす'], meanings: { en: ['cheap', 'peaceful', 'safe'] }, mnemonic: 'A woman under a roof — safe and cheap' },
  { character: '新', strokeCount: 13, jlptLevel: 5, grade: 2, frequencyRank: 51, radical: '斤', radicalNames: ['axe'], onReadings: ['シン'], kunReadings: ['あたら.しい', 'あら.た', 'にい-'], meanings: { en: ['new'] }, mnemonic: 'Cutting a tree with an axe — making something new' },
  { character: '古', strokeCount: 5, jlptLevel: 5, grade: 2, frequencyRank: 509, radical: '口', radicalNames: ['mouth'], onReadings: ['コ'], kunReadings: ['ふる.い', 'ふる-', '-ふる.す'], meanings: { en: ['old', 'ancient'] }, mnemonic: 'A tombstone — something old' },
  { character: '長', strokeCount: 8, jlptLevel: 5, grade: 2, frequencyRank: 12, radical: '長', radicalNames: ['long'], onReadings: ['チョウ'], kunReadings: ['なが.い', 'おさ'], meanings: { en: ['long', 'leader', 'chief'] }, mnemonic: 'Long flowing hair — the chief' },
  { character: '多', strokeCount: 6, jlptLevel: 5, grade: 2, frequencyRank: 139, radical: '夕', radicalNames: ['evening'], onReadings: ['タ'], kunReadings: ['おお.い', 'まさ.に', 'まさ.る'], meanings: { en: ['many', 'much', 'frequent'] }, mnemonic: 'Two evenings stacked — many nights' },
  { character: '少', strokeCount: 4, jlptLevel: 5, grade: 2, frequencyRank: 287, radical: '小', radicalNames: ['small'], onReadings: ['ショウ'], kunReadings: ['すく.ない', 'すこ.し'], meanings: { en: ['few', 'little'] }, mnemonic: 'Small with a cut — even fewer' },
  { character: '白', strokeCount: 5, jlptLevel: 5, grade: 1, frequencyRank: 483, radical: '白', radicalNames: ['white'], onReadings: ['ハク', 'ビャク'], kunReadings: ['しろ', 'しら-', 'しろ.い'], meanings: { en: ['white'] }, mnemonic: 'A white blank space — pure white' },

  // ── Places & School ──
  { character: '国', strokeCount: 8, jlptLevel: 5, grade: 2, frequencyRank: 20, radical: '囗', radicalNames: ['enclosure'], onReadings: ['コク'], kunReadings: ['くに'], meanings: { en: ['country', 'nation'] }, mnemonic: 'A jewel inside a border — a nation' },
  { character: '学', strokeCount: 8, jlptLevel: 5, grade: 1, frequencyRank: 63, radical: '子', radicalNames: ['child'], onReadings: ['ガク'], kunReadings: ['まな.ぶ'], meanings: { en: ['study', 'learning', 'school'] }, mnemonic: 'A child under a roof studying' },
  { character: '校', strokeCount: 10, jlptLevel: 5, grade: 1, frequencyRank: 294, radical: '木', radicalNames: ['tree'], onReadings: ['コウ'], kunReadings: [], meanings: { en: ['school'] }, mnemonic: 'A wooden school building — tree + cross' },
  { character: '生', strokeCount: 5, jlptLevel: 5, grade: 1, frequencyRank: 29, radical: '生', radicalNames: ['life'], onReadings: ['セイ', 'ショウ'], kunReadings: ['い.きる', 'う.まれる', 'なま', 'き'], meanings: { en: ['life', 'birth', 'student', 'raw'] }, mnemonic: 'A plant growing from the ground — life' },
  { character: '店', strokeCount: 8, jlptLevel: 5, grade: 2, frequencyRank: 378, radical: '广', radicalNames: ['dotted cliff'], onReadings: ['テン'], kunReadings: ['みせ', 'たな'], meanings: { en: ['shop', 'store'] }, mnemonic: 'A divining rod under a roof — a fortune-telling shop' },
  { character: '駅', strokeCount: 14, jlptLevel: 5, grade: 3, frequencyRank: 724, radical: '馬', radicalNames: ['horse'], onReadings: ['エキ'], kunReadings: [], meanings: { en: ['station'] }, mnemonic: 'A horse at a post — a station for horses (old relay)' },
  { character: '社', strokeCount: 7, jlptLevel: 5, grade: 2, frequencyRank: 21, radical: '示', radicalNames: ['altar'], onReadings: ['シャ'], kunReadings: ['やしろ'], meanings: { en: ['company', 'shrine', 'society'] }, mnemonic: 'An altar of earth — a shrine or company' },
  { character: '会', strokeCount: 6, jlptLevel: 5, grade: 2, frequencyRank: 4, radical: '人', radicalNames: ['person'], onReadings: ['カイ', 'エ'], kunReadings: ['あ.う', 'あ.わせる'], meanings: { en: ['meeting', 'association'] }, mnemonic: 'People gathered under a roof — meeting' },

  // ── Everyday Objects ──
  { character: '車', strokeCount: 7, jlptLevel: 5, grade: 1, frequencyRank: 82, radical: '車', radicalNames: ['vehicle'], onReadings: ['シャ'], kunReadings: ['くるま'], meanings: { en: ['car', 'vehicle'] }, mnemonic: 'A cart seen from above — wheels and axle' },
  { character: '電', strokeCount: 13, jlptLevel: 5, grade: 2, frequencyRank: 268, radical: '雨', radicalNames: ['rain'], onReadings: ['デン'], kunReadings: [], meanings: { en: ['electricity', 'electric'] }, mnemonic: 'Rain with lightning — electricity from the sky' },
  { character: '話', strokeCount: 13, jlptLevel: 5, grade: 2, frequencyRank: 134, radical: '言', radicalNames: ['speech'], onReadings: ['ワ'], kunReadings: ['はな.す', 'はなし'], meanings: { en: ['talk', 'story', 'conversation'] }, mnemonic: 'Words from the tongue — talking' },
  { character: '語', strokeCount: 14, jlptLevel: 5, grade: 2, frequencyRank: 301, radical: '言', radicalNames: ['speech'], onReadings: ['ゴ'], kunReadings: ['かた.る', 'かた.らう'], meanings: { en: ['language', 'word'] }, mnemonic: 'Speech with five mouths — a language of many words' },
  { character: '本', strokeCount: 5, jlptLevel: 5, grade: 1, frequencyRank: 3, radical: '木', radicalNames: ['tree'], onReadings: ['ホン'], kunReadings: ['もと'], meanings: { en: ['book', 'origin', 'main'] }, mnemonic: 'A tree with roots marked — the origin, the book' },
  { character: '書', strokeCount: 10, jlptLevel: 5, grade: 2, frequencyRank: 169, radical: '曰', radicalNames: ['say'], onReadings: ['ショ'], kunReadings: ['か.く', '-が.き'], meanings: { en: ['write', 'book'] }, mnemonic: 'A hand holding a brush over paper — writing' },
  { character: '食', strokeCount: 9, jlptLevel: 5, grade: 2, frequencyRank: 328, radical: '食', radicalNames: ['eat'], onReadings: ['ショク', 'ジキ'], kunReadings: ['く.う', 'く.らう', 'た.べる', 'は.む'], meanings: { en: ['eat', 'food', 'meal'] }, mnemonic: 'A person sitting at a table to eat' },
  { character: '飲', strokeCount: 12, jlptLevel: 5, grade: 3, frequencyRank: 966, radical: '食', radicalNames: ['eat'], onReadings: ['イン'], kunReadings: ['の.む', '-の.み'], meanings: { en: ['drink'] }, mnemonic: 'Food radical + a person swallowing — drinking' },

  // ── Movement & Actions ──
  { character: '行', strokeCount: 6, jlptLevel: 5, grade: 2, frequencyRank: 19, radical: '行', radicalNames: ['go'], onReadings: ['コウ', 'ギョウ', 'アン'], kunReadings: ['い.く', 'ゆ.く', '-ゆ.き', 'おこな.う'], meanings: { en: ['go', 'carry out', 'line'] }, mnemonic: 'A crossroads — deciding where to go' },
  { character: '来', strokeCount: 7, jlptLevel: 5, grade: 2, frequencyRank: 36, radical: '木', radicalNames: ['tree'], onReadings: ['ライ', 'タイ'], kunReadings: ['く.る', 'きた.る', 'きた.す', 'き.たす', 'き.たる'], meanings: { en: ['come', 'next', 'future'] }, mnemonic: 'Something coming from behind the tree' },
  { character: '出', strokeCount: 5, jlptLevel: 5, grade: 1, frequencyRank: 13, radical: '凵', radicalNames: ['container'], onReadings: ['シュツ', 'スイ'], kunReadings: ['で.る', '-で', 'だ.す', '-だ.す', 'い.でる'], meanings: { en: ['exit', 'leave', 'go out'] }, mnemonic: 'Mountains emerging — coming out' },
  { character: '入', strokeCount: 2, jlptLevel: 5, grade: 1, frequencyRank: 56, radical: '入', radicalNames: ['enter'], onReadings: ['ニュウ', 'ジュ'], kunReadings: ['い.る', '-い.る', '-い.り', 'い.れる', '-い.れ', 'はい.る'], meanings: { en: ['enter', 'put in'] }, mnemonic: 'A person entering a door' },
  { character: '休', strokeCount: 6, jlptLevel: 5, grade: 1, frequencyRank: 459, radical: '人', radicalNames: ['person'], onReadings: ['キュウ'], kunReadings: ['やす.む', 'やす.まる', 'やす.める'], meanings: { en: ['rest', 'day off'] }, mnemonic: 'A person leaning against a tree — resting' },
  { character: '見', strokeCount: 7, jlptLevel: 5, grade: 1, frequencyRank: 22, radical: '見', radicalNames: ['see'], onReadings: ['ケン'], kunReadings: ['み.る', 'み.える', 'み.せる'], meanings: { en: ['see', 'look', 'show'] }, mnemonic: 'An eye on legs — walking to see' },
  { character: '聞', strokeCount: 14, jlptLevel: 5, grade: 2, frequencyRank: 319, radical: '耳', radicalNames: ['ear'], onReadings: ['ブン', 'モン'], kunReadings: ['き.く', 'き.こえる'], meanings: { en: ['hear', 'ask', 'listen'] }, mnemonic: 'An ear at the gate — listening at the door' },
  { character: '読', strokeCount: 14, jlptLevel: 5, grade: 2, frequencyRank: 293, radical: '言', radicalNames: ['speech'], onReadings: ['ドク', 'トク', 'トウ'], kunReadings: ['よ.む', '-よ.み'], meanings: { en: ['read'] }, mnemonic: 'Words being sold — reading a market of words' },
  { character: '書', strokeCount: 10, jlptLevel: 5, grade: 2, frequencyRank: 169, radical: '曰', radicalNames: ['say'], onReadings: ['ショ'], kunReadings: ['か.く', '-が.き'], meanings: { en: ['write', 'book'] }, mnemonic: null },
  { character: '立', strokeCount: 5, jlptLevel: 5, grade: 1, frequencyRank: 58, radical: '立', radicalNames: ['stand'], onReadings: ['リツ', 'リュウ'], kunReadings: ['た.つ', '-た.つ', 'た.ち-', 'た.てる', '-た.てる', 'た.て-'], meanings: { en: ['stand', 'rise', 'set up'] }, mnemonic: 'A person standing on the ground' },

  // ── Language & Study ──
  { character: '言', strokeCount: 7, jlptLevel: 5, grade: 2, frequencyRank: 83, radical: '言', radicalNames: ['speech'], onReadings: ['ゲン', 'ゴン'], kunReadings: ['い.う', 'こと'], meanings: { en: ['say', 'word', 'speech'] }, mnemonic: 'Sound coming from a mouth — words' },
  { character: '名', strokeCount: 6, jlptLevel: 5, grade: 1, frequencyRank: 177, radical: '口', radicalNames: ['mouth'], onReadings: ['メイ', 'ミョウ'], kunReadings: ['な', '-な'], meanings: { en: ['name', 'famous'] }, mnemonic: 'Calling out in the evening — saying your name' },
  { character: '何', strokeCount: 7, jlptLevel: 5, grade: 2, frequencyRank: 340, radical: '人', radicalNames: ['person'], onReadings: ['カ'], kunReadings: ['なに', 'なん', 'なに-', 'なん-'], meanings: { en: ['what'] }, mnemonic: 'A person carrying something — what is it?' },

  // ── Size, Color, Other ──
  { character: '道', strokeCount: 12, jlptLevel: 5, grade: 2, frequencyRank: 207, radical: '辶', radicalNames: ['road'], onReadings: ['ドウ', 'トウ'], kunReadings: ['みち'], meanings: { en: ['road', 'path', 'way'] }, mnemonic: 'A head walking on a road — the way' },
  { character: '空', strokeCount: 8, jlptLevel: 5, grade: 1, frequencyRank: 304, radical: '穴', radicalNames: ['hole'], onReadings: ['クウ'], kunReadings: ['そら', 'あ.く', 'あ.ける', 'から'], meanings: { en: ['sky', 'empty', 'void'] }, mnemonic: 'A hole in the ceiling showing the sky' },
  { character: '力', strokeCount: 2, jlptLevel: 5, grade: 1, frequencyRank: 62, radical: '力', radicalNames: ['power'], onReadings: ['リョク', 'リキ'], kunReadings: ['ちから'], meanings: { en: ['power', 'strength', 'force'] }, mnemonic: 'A flexed arm — strength' },
];
