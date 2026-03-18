/**
 * N5 Grammar dataset — 40 essential grammar patterns for JLPT N5 level.
 * Each pattern includes formation rules and example sentences.
 */

export interface GrammarEntry {
  pattern: string;
  jlptLevel: number;
  meaning: Record<string, string>;
  formation: string;
  examples: { japanese: string; reading: string; translations: Record<string, string> }[];
  notes: string | null;
}

export const GRAMMAR_N5: GrammarEntry[] = [
  // ── Copula & Basic Sentence Patterns ──
  {
    pattern: '〜です',
    jlptLevel: 5,
    meaning: { en: 'Is / Am / Are (polite copula)' },
    formation: 'Noun + です',
    examples: [
      { japanese: '私は学生です。', reading: 'わたしはがくせいです。', translations: { en: 'I am a student.' } },
      { japanese: 'これは本です。', reading: 'これはほんです。', translations: { en: 'This is a book.' } },
    ],
    notes: 'The polite form of だ. Used at the end of sentences to be polite.',
  },
  {
    pattern: '〜ではありません / 〜じゃありません',
    jlptLevel: 5,
    meaning: { en: 'Is not / Am not / Are not (polite negative)' },
    formation: 'Noun + ではありません',
    examples: [
      { japanese: '私は先生ではありません。', reading: 'わたしはせんせいではありません。', translations: { en: 'I am not a teacher.' } },
      { japanese: 'これはペンじゃありません。', reading: 'これはペンじゃありません。', translations: { en: 'This is not a pen.' } },
    ],
    notes: 'じゃありません is the casual contraction of ではありません.',
  },
  {
    pattern: '〜ますform',
    jlptLevel: 5,
    meaning: { en: 'Polite verb form (present/future)' },
    formation: 'Verb stem + ます',
    examples: [
      { japanese: '日本語を勉強します。', reading: 'にほんごをべんきょうします。', translations: { en: 'I study Japanese.' } },
      { japanese: '毎朝コーヒーを飲みます。', reading: 'まいあさコーヒーをのみます。', translations: { en: 'I drink coffee every morning.' } },
    ],
    notes: 'ます is added to the verb stem (masu-stem). Negative: ません. Past: ました.',
  },
  {
    pattern: '〜ません',
    jlptLevel: 5,
    meaning: { en: 'Do not / Does not (polite negative)' },
    formation: 'Verb stem + ません',
    examples: [
      { japanese: '肉を食べません。', reading: 'にくをたべません。', translations: { en: 'I do not eat meat.' } },
      { japanese: 'テレビを見ません。', reading: 'テレビをみません。', translations: { en: 'I do not watch TV.' } },
    ],
    notes: null,
  },
  {
    pattern: '〜ました',
    jlptLevel: 5,
    meaning: { en: 'Did / Was (polite past)' },
    formation: 'Verb stem + ました',
    examples: [
      { japanese: '昨日映画を見ました。', reading: 'きのうえいがをみました。', translations: { en: 'I watched a movie yesterday.' } },
      { japanese: '朝ご飯を食べました。', reading: 'あさごはんをたべました。', translations: { en: 'I ate breakfast.' } },
    ],
    notes: null,
  },

  // ── Particles ──
  {
    pattern: '〜は (topic marker)',
    jlptLevel: 5,
    meaning: { en: 'As for ~ / Speaking of ~ (topic marker)' },
    formation: 'Noun + は',
    examples: [
      { japanese: '私は日本人です。', reading: 'わたしはにほんじんです。', translations: { en: 'I am Japanese.' } },
      { japanese: '東京は大きいです。', reading: 'とうきょうはおおきいです。', translations: { en: 'Tokyo is big.' } },
    ],
    notes: 'は marks the topic of the sentence. Pronounced "wa" not "ha".',
  },
  {
    pattern: '〜が (subject marker)',
    jlptLevel: 5,
    meaning: { en: 'Subject marker / But' },
    formation: 'Noun + が',
    examples: [
      { japanese: '猫がいます。', reading: 'ねこがいます。', translations: { en: 'There is a cat.' } },
      { japanese: '誰が来ましたか。', reading: 'だれがきましたか。', translations: { en: 'Who came?' } },
    ],
    notes: 'が marks the grammatical subject, especially with existence verbs and question words.',
  },
  {
    pattern: '〜を (object marker)',
    jlptLevel: 5,
    meaning: { en: 'Direct object marker' },
    formation: 'Noun + を + Verb',
    examples: [
      { japanese: '本を読みます。', reading: 'ほんをよみます。', translations: { en: 'I read a book.' } },
      { japanese: '水を飲みます。', reading: 'みずをのみます。', translations: { en: 'I drink water.' } },
    ],
    notes: 'を marks the direct object of a transitive verb. Pronounced "o".',
  },
  {
    pattern: '〜に (target/time)',
    jlptLevel: 5,
    meaning: { en: 'To / At / On / In (direction, time, location)' },
    formation: 'Noun + に',
    examples: [
      { japanese: '学校に行きます。', reading: 'がっこうにいきます。', translations: { en: 'I go to school.' } },
      { japanese: '七時に起きます。', reading: 'しちじにおきます。', translations: { en: 'I wake up at 7 o\'clock.' } },
    ],
    notes: 'に indicates direction, specific time, location of existence.',
  },
  {
    pattern: '〜で (location of action / means)',
    jlptLevel: 5,
    meaning: { en: 'At / By / With (location of action, means)' },
    formation: 'Noun + で',
    examples: [
      { japanese: '図書館で勉強します。', reading: 'としょかんでべんきょうします。', translations: { en: 'I study at the library.' } },
      { japanese: 'バスで行きます。', reading: 'バスでいきます。', translations: { en: 'I go by bus.' } },
    ],
    notes: 'で marks the location where an action takes place or the means/instrument.',
  },
  {
    pattern: '〜へ (direction)',
    jlptLevel: 5,
    meaning: { en: 'Toward / To (direction)' },
    formation: 'Place + へ + Movement verb',
    examples: [
      { japanese: '日本へ行きます。', reading: 'にほんへいきます。', translations: { en: 'I go to Japan.' } },
    ],
    notes: 'へ is pronounced "e". Similar to に for direction but emphasizes the direction rather than the destination.',
  },
  {
    pattern: '〜と (and / with / quotation)',
    jlptLevel: 5,
    meaning: { en: 'And / With / (quotation marker)' },
    formation: 'Noun + と + Noun / Person + と + Verb',
    examples: [
      { japanese: 'パンと牛乳を買います。', reading: 'パンとぎゅうにゅうをかいます。', translations: { en: 'I buy bread and milk.' } },
      { japanese: '友達と映画を見ます。', reading: 'ともだちとえいがをみます。', translations: { en: 'I watch a movie with a friend.' } },
    ],
    notes: null,
  },
  {
    pattern: '〜も (also)',
    jlptLevel: 5,
    meaning: { en: 'Also / Too' },
    formation: 'Noun + も',
    examples: [
      { japanese: '私も学生です。', reading: 'わたしもがくせいです。', translations: { en: 'I am also a student.' } },
    ],
    notes: 'Replaces は, が, or を.',
  },
  {
    pattern: '〜の (possessive / modifier)',
    jlptLevel: 5,
    meaning: { en: 'Possessive / Of / Noun modifier' },
    formation: 'Noun + の + Noun',
    examples: [
      { japanese: '私の本です。', reading: 'わたしのほんです。', translations: { en: 'It is my book.' } },
      { japanese: '日本語の先生', reading: 'にほんごのせんせい', translations: { en: 'Japanese teacher' } },
    ],
    notes: null,
  },
  {
    pattern: '〜から (from) / 〜まで (until)',
    jlptLevel: 5,
    meaning: { en: 'From ~ / Until ~' },
    formation: 'Noun + から / Noun + まで',
    examples: [
      { japanese: '九時から五時まで働きます。', reading: 'くじからごじまではたらきます。', translations: { en: 'I work from 9 to 5.' } },
      { japanese: '東京から大阪まで', reading: 'とうきょうからおおさかまで', translations: { en: 'From Tokyo to Osaka' } },
    ],
    notes: 'から and まで are often used together for ranges of time or place.',
  },

  // ── Existence & Location ──
  {
    pattern: '〜がいます',
    jlptLevel: 5,
    meaning: { en: 'There is (animate beings)' },
    formation: 'Place + に + Animate Noun + がいます',
    examples: [
      { japanese: '公園に子供がいます。', reading: 'こうえんにこどもがいます。', translations: { en: 'There are children in the park.' } },
    ],
    notes: 'For people and animals. Use あります for inanimate objects.',
  },
  {
    pattern: '〜があります',
    jlptLevel: 5,
    meaning: { en: 'There is (inanimate things)' },
    formation: 'Place + に + Inanimate Noun + があります',
    examples: [
      { japanese: '机の上に本があります。', reading: 'つくえのうえにほんがあります。', translations: { en: 'There is a book on the desk.' } },
    ],
    notes: 'For inanimate objects and plants.',
  },

  // ── Adjectives ──
  {
    pattern: 'い-adjective (present)',
    jlptLevel: 5,
    meaning: { en: 'Is ~ (i-adjective predicate)' },
    formation: 'い-adjective + です',
    examples: [
      { japanese: 'この本は面白いです。', reading: 'このほんはおもしろいです。', translations: { en: 'This book is interesting.' } },
    ],
    notes: 'Negative: remove い → くないです. Past: remove い → かったです.',
  },
  {
    pattern: 'な-adjective (present)',
    jlptLevel: 5,
    meaning: { en: 'Is ~ (na-adjective predicate)' },
    formation: 'な-adjective + です',
    examples: [
      { japanese: 'この町は静かです。', reading: 'このまちはしずかです。', translations: { en: 'This town is quiet.' } },
    ],
    notes: 'Negative: ではありません. Past: でした. Modifying noun: な-adj + な + noun.',
  },
  {
    pattern: 'い-adjective (negative)',
    jlptLevel: 5,
    meaning: { en: 'Is not ~ (i-adjective negative)' },
    formation: 'Remove い → くないです',
    examples: [
      { japanese: 'この映画は面白くないです。', reading: 'このえいがはおもしろくないです。', translations: { en: 'This movie is not interesting.' } },
      { japanese: '高くないです。', reading: 'たかくないです。', translations: { en: 'It is not expensive.' } },
    ],
    notes: 'Exception: いい → よくないです (not いくないです).',
  },

  // ── Questions ──
  {
    pattern: '〜か (question)',
    jlptLevel: 5,
    meaning: { en: 'Question marker' },
    formation: 'Sentence + か',
    examples: [
      { japanese: 'これは何ですか。', reading: 'これはなんですか。', translations: { en: 'What is this?' } },
      { japanese: '元気ですか。', reading: 'げんきですか。', translations: { en: 'Are you well?' } },
    ],
    notes: 'Add か to the end of a statement to make it a question.',
  },
  {
    pattern: '何 / なに / なん',
    jlptLevel: 5,
    meaning: { en: 'What' },
    formation: '何 + counter / 何 + です',
    examples: [
      { japanese: 'お名前は何ですか。', reading: 'おなまえはなんですか。', translations: { en: 'What is your name?' } },
      { japanese: '何を食べますか。', reading: 'なにをたべますか。', translations: { en: 'What will you eat?' } },
    ],
    notes: 'なん before です, で, の; なに in other contexts.',
  },

  // ── Desire & Invitation ──
  {
    pattern: '〜たいです',
    jlptLevel: 5,
    meaning: { en: 'Want to ~ (desire)' },
    formation: 'Verb stem + たいです',
    examples: [
      { japanese: '日本に行きたいです。', reading: 'にほんにいきたいです。', translations: { en: 'I want to go to Japan.' } },
      { japanese: '寿司を食べたいです。', reading: 'すしをたべたいです。', translations: { en: 'I want to eat sushi.' } },
    ],
    notes: 'Used for first person. Conjugates like an い-adjective.',
  },
  {
    pattern: '〜ませんか',
    jlptLevel: 5,
    meaning: { en: 'Won\'t you ~? / Would you like to ~? (invitation)' },
    formation: 'Verb stem + ませんか',
    examples: [
      { japanese: '一緒に食べませんか。', reading: 'いっしょにたべませんか。', translations: { en: 'Would you like to eat together?' } },
    ],
    notes: 'More polite than ましょう.',
  },
  {
    pattern: '〜ましょう',
    jlptLevel: 5,
    meaning: { en: 'Let\'s ~ / Shall we ~' },
    formation: 'Verb stem + ましょう',
    examples: [
      { japanese: '行きましょう。', reading: 'いきましょう。', translations: { en: 'Let\'s go.' } },
      { japanese: '勉強しましょう。', reading: 'べんきょうしましょう。', translations: { en: 'Let\'s study.' } },
    ],
    notes: null,
  },

  // ── Te-form & Requests ──
  {
    pattern: '〜てください',
    jlptLevel: 5,
    meaning: { en: 'Please do ~' },
    formation: 'Verb te-form + ください',
    examples: [
      { japanese: 'ここに名前を書いてください。', reading: 'ここになまえをかいてください。', translations: { en: 'Please write your name here.' } },
      { japanese: 'ゆっくり話してください。', reading: 'ゆっくりはなしてください。', translations: { en: 'Please speak slowly.' } },
    ],
    notes: 'Polite request form using the te-form of the verb.',
  },
  {
    pattern: '〜ている',
    jlptLevel: 5,
    meaning: { en: 'Is doing ~ / Currently ~ (progressive)' },
    formation: 'Verb te-form + いる/います',
    examples: [
      { japanese: '今、本を読んでいます。', reading: 'いま、ほんをよんでいます。', translations: { en: 'I am reading a book now.' } },
      { japanese: '東京に住んでいます。', reading: 'とうきょうにすんでいます。', translations: { en: 'I live in Tokyo.' } },
    ],
    notes: 'Also expresses habitual actions and states (e.g., 知っている = to know).',
  },
  {
    pattern: '〜てもいいですか',
    jlptLevel: 5,
    meaning: { en: 'May I ~? / Is it OK to ~?' },
    formation: 'Verb te-form + もいいですか',
    examples: [
      { japanese: '写真を撮ってもいいですか。', reading: 'しゃしんをとってもいいですか。', translations: { en: 'May I take a photo?' } },
    ],
    notes: null,
  },
  {
    pattern: '〜てはいけません',
    jlptLevel: 5,
    meaning: { en: 'Must not ~ / May not ~' },
    formation: 'Verb te-form + はいけません',
    examples: [
      { japanese: 'ここで写真を撮ってはいけません。', reading: 'ここでしゃしんをとってはいけません。', translations: { en: 'You must not take photos here.' } },
    ],
    notes: null,
  },

  // ── Connecting & Giving Reasons ──
  {
    pattern: '〜て (connecting)',
    jlptLevel: 5,
    meaning: { en: 'And / Then (connecting actions)' },
    formation: 'Verb te-form + next verb',
    examples: [
      { japanese: '朝起きて、顔を洗います。', reading: 'あさおきて、かおをあらいます。', translations: { en: 'I wake up and wash my face.' } },
    ],
    notes: 'Te-form connects sequential actions.',
  },
  {
    pattern: '〜から (because)',
    jlptLevel: 5,
    meaning: { en: 'Because ~ / So ~' },
    formation: 'Sentence + から + Sentence',
    examples: [
      { japanese: '暑いですから、窓を開けてください。', reading: 'あついですから、まどをあけてください。', translations: { en: 'Because it\'s hot, please open the window.' } },
    ],
    notes: 'Different from から meaning "from" — this から gives a reason.',
  },

  // ── Comparisons ──
  {
    pattern: '〜より',
    jlptLevel: 5,
    meaning: { en: 'More than ~' },
    formation: 'A は B より adjective',
    examples: [
      { japanese: '東京は大阪より大きいです。', reading: 'とうきょうはおおさかよりおおきいです。', translations: { en: 'Tokyo is bigger than Osaka.' } },
    ],
    notes: null,
  },
  {
    pattern: '〜のほうが',
    jlptLevel: 5,
    meaning: { en: '~ is more (comparison)' },
    formation: 'A のほうが B より adjective',
    examples: [
      { japanese: '夏のほうが冬より好きです。', reading: 'なつのほうがふゆよりすきです。', translations: { en: 'I like summer more than winter.' } },
    ],
    notes: null,
  },
  {
    pattern: '一番',
    jlptLevel: 5,
    meaning: { en: 'The most ~ / Number one' },
    formation: 'Group + の中で + Noun + が一番 + adjective',
    examples: [
      { japanese: '果物の中でりんごが一番好きです。', reading: 'くだもののなかでりんごがいちばんすきです。', translations: { en: 'Among fruits, I like apples the most.' } },
    ],
    notes: null,
  },

  // ── Counting & Quantifiers ──
  {
    pattern: '〜つ (counter)',
    jlptLevel: 5,
    meaning: { en: 'General counter for things' },
    formation: 'Number + つ',
    examples: [
      { japanese: 'りんごを三つください。', reading: 'りんごをみっつください。', translations: { en: 'Please give me three apples.' } },
    ],
    notes: 'Used for small, round objects or abstract things. 1-10: ひとつ、ふたつ...とお.',
  },

  // ── Giving & Receiving ──
  {
    pattern: '〜をください',
    jlptLevel: 5,
    meaning: { en: 'Please give me ~' },
    formation: 'Noun + をください',
    examples: [
      { japanese: '水をください。', reading: 'みずをください。', translations: { en: 'Water, please.' } },
      { japanese: 'これをください。', reading: 'これをください。', translations: { en: 'I\'ll have this, please.' } },
    ],
    notes: 'Used when ordering, shopping, or requesting something.',
  },

  // ── Time Expressions ──
  {
    pattern: '〜前に (before)',
    jlptLevel: 5,
    meaning: { en: 'Before ~' },
    formation: 'Verb dictionary form / Noun + の + 前に',
    examples: [
      { japanese: '寝る前に本を読みます。', reading: 'ねるまえにほんをよみます。', translations: { en: 'I read a book before sleeping.' } },
    ],
    notes: null,
  },
  {
    pattern: '〜後で (after)',
    jlptLevel: 5,
    meaning: { en: 'After ~' },
    formation: 'Verb ta-form / Noun + の + 後で',
    examples: [
      { japanese: '食べた後で散歩します。', reading: 'たべたあとでさんぽします。', translations: { en: 'I take a walk after eating.' } },
    ],
    notes: null,
  },

  // ── Must / Have to ──
  {
    pattern: '〜なければなりません',
    jlptLevel: 5,
    meaning: { en: 'Must ~ / Have to ~' },
    formation: 'Verb negative stem + なければなりません',
    examples: [
      { japanese: '薬を飲まなければなりません。', reading: 'くすりをのまなければなりません。', translations: { en: 'I have to take medicine.' } },
    ],
    notes: 'Casual: なきゃ / なくちゃ.',
  },
  {
    pattern: '〜なくてもいいです',
    jlptLevel: 5,
    meaning: { en: 'Don\'t have to ~' },
    formation: 'Verb negative te-form + もいいです',
    examples: [
      { japanese: '明日来なくてもいいです。', reading: 'あしたこなくてもいいです。', translations: { en: 'You don\'t have to come tomorrow.' } },
    ],
    notes: null,
  },
];
