/**
 * Semantic compatibility rules for the dynamic sentence generator.
 *
 * These maps ensure generated sentences make sense by constraining which
 * words can fill which template slots. The keys are based on the `tags[]`
 * that already exist on every VocabEntry.
 *
 * Design principles:
 *  - Rules operate on TAGS, not individual words → new vocab with correct
 *    tags works automatically.
 *  - When a word has multiple tags, ANY matching tag is sufficient.
 *  - If a compatibility map has no entry for a word, it matches nothing
 *    (conservative — no nonsense).
 */

// ─── Adjective → Noun tag compatibility ──────────────────────
// Which noun categories each adjective can sensibly describe.
// Key = the adjective word (dictionary form). Value = compatible noun tags.

export const ADJ_NOUN_AFFINITY: Record<string, string[]> = {
  // ── Size — only physical things you can see/touch ──
  '大きい':   ['places', 'animals', 'nature', 'body', 'objects'],
  '小さい':   ['places', 'animals', 'nature', 'body', 'objects', 'food'],
  '広い':     ['places', 'nature'],
  '狭い':     ['places'],
  '長い':     ['objects', 'nature', 'body', 'readable'],
  '短い':     ['objects', 'body', 'readable'],

  // ── Quality / evaluation — things that can be "good" or "bad" ──
  'いい':     ['places', 'food', 'nature', 'weather', 'objects', 'readable'],
  '悪い':     ['places', 'food', 'nature', 'weather', 'objects'],
  '新しい':   ['places', 'objects', 'buyable'],
  '古い':     ['places', 'objects', 'buyable'],
  '楽しい':   ['places'],
  '面白い':   ['readable', 'viewable'],

  // ── Price — only buyable/tangible things ──
  '高い':     ['food', 'places', 'buyable', 'objects'],
  '安い':     ['food', 'places', 'buyable', 'objects'],

  // ── Weather — weather and time-of-day ──
  '暑い':     ['weather', 'places'],
  '寒い':     ['weather', 'places'],
  '暖かい':   ['weather', 'places', 'food'],

  // ── Taste / food ──
  '美味しい': ['food'],
  '甘い':     ['food'],
  '辛い':     ['food'],

  // ── Appearance / character ──
  '可愛い':   ['animals', 'family'],
  '怖い':     ['animals', 'places', 'nature'],
  '忙しい':   ['family'],       // people are busy, not objects
  '難しい':   ['readable'],     // books/tests are difficult
  '易しい':   ['readable'],
  '近い':     ['places'],
  '遠い':     ['places'],
  '早い':     ['objects'],      // trains/clocks are fast
  '遅い':     ['objects'],
  '多い':     ['food'],         // much food/drink
  '少ない':   ['food'],         // little food/drink
  '強い':     ['animals', 'nature'],
  '弱い':     ['animals'],
  '重い':     ['objects', 'buyable'],
  '軽い':     ['objects', 'food'],
  '明るい':   ['places'],
  '暗い':     ['places', 'nature'],
  '若い':     ['family'],
  '優しい':   ['family'],

  // ── na-adjectives (N5) ──
  '静か':     ['places', 'nature'],
  '賑やか':   ['places'],
  '有名':     ['places', 'food'],
  '元気':     ['family', 'animals'],
  '好き':     ['food', 'animals', 'nature', 'places', 'viewable', 'readable'],
  '嫌い':     ['food'],
  '上手':     ['readable'],     // good at (something learnable)
  '下手':     ['readable'],
  '大切':     ['family', 'objects'],
  '大変':     ['objects'],      // a difficult task
  '簡単':     ['readable'],
  '便利':     ['places', 'objects'],
  '不便':     ['places'],
  'きれい':   ['places', 'nature', 'animals'],

  // ── N4 i-adjectives ──
  '嬉しい':   ['family'],       // happy (people)
  '悲しい':   ['family'],
  '正しい':   ['readable'],     // correct answer
  '珍しい':   ['food', 'animals', 'nature'],
  '柔らかい': ['food', 'objects'],
  '固い':     ['food', 'objects'],
  '深い':     ['nature', 'places'],
  '浅い':     ['nature', 'places'],
  '厚い':     ['objects', 'readable'],
  '薄い':     ['objects', 'readable', 'food'],
  '痛い':     ['body'],
  '眠い':     ['family'],       // sleepy (people)
  '汚い':     ['places', 'objects'],
  '美しい':   ['places', 'nature', 'animals'],
  '素晴らしい': ['places', 'nature', 'food'],
  '恥ずかしい': ['family'],
  '懐かしい': ['food', 'places'],
  '寂しい':   ['places'],
  '危ない':   ['places', 'nature', 'animals'],

  // ── N4 na-adjectives ──
  '必要':     ['objects', 'readable'],
  '安全':     ['places'],
  '危険':     ['places', 'nature', 'animals'],
  '複雑':     ['places', 'readable'],
  '自由':     ['family'],       // free (people)
  '丁寧':     ['family'],       // polite (people)
  '親切':     ['family'],
  '残念':     ['food', 'places'],    // disappointing food/place
  '熱心':     ['family'],       // enthusiastic (people)
  '真面目':   ['family'],
};

// ─── Verb → Object tag compatibility ─────────────────────────
// Which noun tags make valid direct objects (を) for each verb.

export const VERB_OBJECT_AFFINITY: Record<string, string[]> = {
  // ── N5 verbs ──
  '食べる':   ['food'],
  '飲む':     ['food'],
  '見る':     ['viewable', 'nature', 'animals'],
  '聞く':     ['viewable', 'readable'],  // hear music, listen to news
  '話す':     ['readable'],              // talk about (topics)
  '読む':     ['readable'],
  '書く':     ['readable'],
  '買う':     ['food', 'buyable'],
  '使う':     ['objects', 'buyable'],
  '作る':     ['food', 'objects'],
  '持つ':     ['objects', 'buyable'],
  '洗う':     ['objects', 'food', 'body'],
  '開ける':   ['objects'],               // open doors/windows/boxes
  '閉める':   ['objects'],               // close
  '撮る':     ['viewable'],             // take photos

  // ── N4 verbs ──
  '教える':   ['readable'],              // teach subjects
  '覚える':   ['readable'],              // memorize words
  '忘れる':   ['objects', 'readable'],   // forget things/words
  '考える':   ['readable'],              // think about topics
  '答える':   ['readable'],              // answer questions
  '集める':   ['objects', 'food', 'nature'],
  '届ける':   ['objects', 'food', 'readable'],
  '伝える':   ['readable'],              // convey messages
  '見つける': ['objects', 'animals'],     // find things
  '調べる':   ['readable'],              // look up/investigate
  '比べる':   ['food', 'objects'],
  '捨てる':   ['objects', 'food'],
  '建てる':   ['places'],
  '続ける':   ['readable'],              // continue studies
  '見せる':   ['viewable', 'objects'],
  '決める':   ['readable'],              // decide on topics
  '変える':   ['objects'],
  '送る':     ['readable', 'objects'],   // send letters/packages
  '払う':     ['buyable'],               // pay for things
  '売る':     ['food', 'buyable', 'objects'],
  '運ぶ':     ['objects', 'food'],
  '選ぶ':     ['food', 'objects', 'buyable'],
  '頼む':     ['food'],                  // order food
  '動かす':   ['objects'],
};

// NOTE: 洗う is already in the N5 section above.

// ─── Location tags ───────────────────────────────────────────
// Tags that indicate a word can be used as a location (で/に patterns).

export const LOCATION_TAGS = new Set(['places']);

// ─── Existence tags ──────────────────────────────────────────
// Tags for nouns that can physically "exist in" a place (があります/がいます).
// Excludes weather, time, abstract concepts — only tangible objects.

export const EXISTENCE_OBJECT_TAGS = new Set(['food', 'animals', 'objects', 'buyable', 'readable']);

// ─── Movement verb words ─────────────────────────────────────
// Verbs that take destination に (not object を).

export const MOVEMENT_VERBS = new Set([
  '行く', '来る', '帰る', '出る', '入る', '走る', '歩く', '戻る', '通う',
]);

// ─── Intransitive verbs ──────────────────────────────────────
// Verbs that take a subject with が (not object を).
// These cannot appear in transitive を patterns.

export const INTRANSITIVE_VERBS = new Set([
  '降る', '止まる', '始まる', '終わる', '開く', '閉まる', '消える',
  '咲く', 'つく', '届く', '落ちる', '集まる', '動く', '壊れる',
  '変わる', '増える', '減る', '続く', '見つかる',
]);

// ─── Intransitive subject affinity ───────────────────────────
// Which nouns can be the が-subject of each intransitive verb.

export const INTRANSITIVE_SUBJECT_AFFINITY: Record<string, string[]> = {
  '降る':     ['weather'],              // 雨が降る, 雪が降る
  '止まる':   ['mechanical'],           // 電車が止まる, 時計が止まる (transport/machines only)
  '始まる':   ['viewable', 'readable'], // 授業が始まる, 映画が始まる
  '終わる':   ['viewable', 'readable'], // 仕事が終わる, 授業が終わる
  '開く':     ['places', 'objects'],    // ドアが開く, 店が開く
  '閉まる':   ['places', 'objects'],    // ドアが閉まる, 店が閉まる
  '消える':   ['objects', 'nature'],    // 電気が消える, 火が消える
  '咲く':     ['nature'],               // 花が咲く
  'つく':     ['objects'],              // 電気がつく
  '届く':     ['objects', 'readable'],  // 手紙が届く, 荷物が届く
  '落ちる':   ['objects', 'nature'],    // 葉が落ちる, 物が落ちる
  '集まる':   ['family'],               // 人が集まる, 友達が集まる
  '動く':     ['objects', 'animals'],   // 車が動く, 猫が動く
  '壊れる':   ['objects'],              // パソコンが壊れる
  '変わる':   ['weather'],              // 天気が変わる
  '増える':   ['food', 'family'],       // 人が増える, 仕事が増える
  '減る':     ['food'],                 // お金が減る → not great, but acceptable
  '続く':     ['weather'],              // 雨が続く
  '見つかる': ['objects', 'animals'],   // 鍵が見つかる, 猫が見つかる
};

// ─── Tags that should NOT be used as generic nouns ───────────
// (greetings, pronouns, time words don't work as random noun fillers)

export const EXCLUDED_NOUN_TAGS = new Set([
  'greetings', 'pronouns', 'time', 'verbs', 'adjectives',
]);

// ─── Scenario bundles ────────────────────────────────────────
// Pre-grouped word combinations that naturally co-occur.
// The generator can pick a scenario and constrain all slots to it.

export interface ScenarioBundle {
  id: string;
  label: string;
  /** Noun tags to draw from for this scenario */
  nounTags: string[];
  /** Specific adjective words that fit this scenario */
  adjectives: string[];
  /** Specific verb words that fit this scenario */
  verbs: string[];
}

export const SCENARIO_BUNDLES: ScenarioBundle[] = [
  {
    id: 'restaurant',
    label: 'Restaurant',
    nounTags: ['food', 'places'],
    adjectives: ['美味しい', '高い', '安い', '甘い', '辛い'],
    verbs: ['食べる', '飲む', '作る', '買う'],
  },
  {
    id: 'school',
    label: 'School',
    nounTags: ['essentials', 'places'],
    adjectives: ['難しい', '易しい', '楽しい', '新しい', '面白い'],
    verbs: ['読む', '書く', '勉強する', '聞く', '話す'],
  },
  {
    id: 'home',
    label: 'At Home',
    nounTags: ['essentials', 'places', 'family'],
    adjectives: ['大きい', '小さい', '新しい', '古い', '広い', '静か', 'きれい'],
    verbs: ['見る', '作る', '使う', '読む', '聞く'],
  },
  {
    id: 'outdoors',
    label: 'Outdoors',
    nounTags: ['nature', 'places', 'animals'],
    adjectives: ['大きい', '小さい', '可愛い', '暑い', '寒い', 'きれい'],
    verbs: ['見る', '行く', '歩く', '走る'],
  },
  {
    id: 'shopping',
    label: 'Shopping',
    nounTags: ['essentials', 'food', 'places'],
    adjectives: ['高い', '安い', '新しい', '古い', 'いい', '悪い'],
    verbs: ['買う', '見る', '使う', '持つ'],
  },
];
