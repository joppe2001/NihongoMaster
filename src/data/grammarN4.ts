/**
 * N4 Grammar dataset — 60 essential grammar patterns for JLPT N4 level.
 * Covers te-form compounds, conditionals, potential/passive/causative, giving/receiving, and more.
 */

import type { GrammarEntry } from './grammarN5';

export const GRAMMAR_N4: GrammarEntry[] = [
  // ── Te-form Compounds ──
  {
    pattern: '〜ている',
    jlptLevel: 4,
    meaning: { en: 'Is doing / State of being (progressive/resultative)' },
    formation: 'Verb て-form + いる',
    examples: [
      { japanese: '今、本を読んでいます。', reading: 'いま、ほんをよんでいます。', translations: { en: 'I am reading a book now.' } },
      { japanese: '窓が開いている。', reading: 'まどがあいている。', translations: { en: 'The window is open.' } },
    ],
    notes: 'Used for ongoing actions and resultative states. Casual: 〜てる.',
  },
  {
    pattern: '〜てある',
    jlptLevel: 4,
    meaning: { en: 'Something has been done (resultative state, intentional)' },
    formation: 'Transitive Verb て-form + ある',
    examples: [
      { japanese: 'テーブルにお皿が並べてある。', reading: 'テーブルにおさらがならべてある。', translations: { en: 'Plates have been arranged on the table.' } },
      { japanese: 'ドアに名前が書いてあります。', reading: 'ドアになまえがかいてあります。', translations: { en: 'A name is written on the door.' } },
    ],
    notes: 'Implies someone intentionally did the action. Uses transitive verbs with が particle.',
  },
  {
    pattern: '〜ておく',
    jlptLevel: 4,
    meaning: { en: 'To do something in advance / leave something as is' },
    formation: 'Verb て-form + おく',
    examples: [
      { japanese: 'パーティーの前に部屋を掃除しておきます。', reading: 'パーティーのまえにへやをそうじしておきます。', translations: { en: 'I\'ll clean the room before the party.' } },
      { japanese: 'チケットを予約しておいた。', reading: 'チケットをよやくしておいた。', translations: { en: 'I booked the tickets in advance.' } },
    ],
    notes: 'Casual contraction: ～とく (しておく → しとく).',
  },
  {
    pattern: '〜てしまう',
    jlptLevel: 4,
    meaning: { en: 'To end up doing / To do completely (regret or completion)' },
    formation: 'Verb て-form + しまう',
    examples: [
      { japanese: '全部食べてしまった。', reading: 'ぜんぶたべてしまった。', translations: { en: 'I ate it all up.' } },
      { japanese: '財布を忘れてしまいました。', reading: 'さいふをわすれてしまいました。', translations: { en: 'I accidentally left my wallet behind.' } },
    ],
    notes: 'Casual contraction: ～ちゃう/じゃう (食べてしまう → 食べちゃう).',
  },
  {
    pattern: '〜てみる',
    jlptLevel: 4,
    meaning: { en: 'To try doing something' },
    formation: 'Verb て-form + みる',
    examples: [
      { japanese: '日本料理を作ってみましょう。', reading: 'にほんりょうりをつくってみましょう。', translations: { en: 'Let\'s try making Japanese food.' } },
      { japanese: 'この靴を履いてみてもいいですか。', reading: 'このくつをはいてみてもいいですか。', translations: { en: 'May I try on these shoes?' } },
    ],
    notes: 'Different from ためす; this is about experiencing something for the first time.',
  },

  // ── Verb Forms ──
  {
    pattern: '〜たい / 〜たがる',
    jlptLevel: 4,
    meaning: { en: 'Want to do / Shows desire to do (3rd person)' },
    formation: 'Verb ます-stem + たい (1st person) / たがる (3rd person)',
    examples: [
      { japanese: '日本に行きたいです。', reading: 'にほんにいきたいです。', translations: { en: 'I want to go to Japan.' } },
      { japanese: '弟はゲームをしたがっている。', reading: 'おとうとはゲームをしたがっている。', translations: { en: 'My younger brother wants to play games.' } },
    ],
    notes: '〜たい conjugates like an い-adjective. 〜たがる is used for others\' desires.',
  },
  {
    pattern: 'Potential form (〜える/〜られる)',
    jlptLevel: 4,
    meaning: { en: 'Can do / Able to' },
    formation: 'Godan: change -u to -eru. Ichidan: stem + られる. する→できる, 来る→来られる',
    examples: [
      { japanese: '漢字が読めますか。', reading: 'かんじがよめますか。', translations: { en: 'Can you read kanji?' } },
      { japanese: '明日は来られません。', reading: 'あしたはこられません。', translations: { en: 'I cannot come tomorrow.' } },
    ],
    notes: 'The object particle often changes from を to が with potential forms.',
  },
  {
    pattern: 'Passive form (〜れる/〜られる)',
    jlptLevel: 4,
    meaning: { en: 'Is done / Was done by (passive voice)' },
    formation: 'Godan: change -u to -areru. Ichidan: stem + られる. する→される, 来る→来られる',
    examples: [
      { japanese: '電車で足を踏まれた。', reading: 'でんしゃであしをふまれた。', translations: { en: 'My foot was stepped on in the train.' } },
      { japanese: 'この本は多くの人に読まれている。', reading: 'このほんはおおくのひとによまれている。', translations: { en: 'This book is read by many people.' } },
    ],
    notes: 'In Japanese, passive often conveys negative nuance (suffering passive).',
  },
  {
    pattern: '〜させる (Causative)',
    jlptLevel: 4,
    meaning: { en: 'Make/Let someone do' },
    formation: 'Godan: change -u to -aseru. Ichidan: stem + させる. する→させる, 来る→来させる',
    examples: [
      { japanese: '母は弟に野菜を食べさせた。', reading: 'はははおとうとにやさいをたべさせた。', translations: { en: 'Mom made my brother eat vegetables.' } },
      { japanese: '好きなことをさせてください。', reading: 'すきなことをさせてください。', translations: { en: 'Please let me do what I like.' } },
    ],
    notes: 'Context determines whether it means "make" or "let".',
  },

  // ── Conditionals ──
  {
    pattern: '〜たら',
    jlptLevel: 4,
    meaning: { en: 'If / When (conditional)' },
    formation: 'Verb た-form + ら / い-adj → ~かったら / な-adj/Noun → だったら',
    examples: [
      { japanese: '雨が降ったら、行きません。', reading: 'あめがふったら、いきません。', translations: { en: 'If it rains, I won\'t go.' } },
      { japanese: '安かったら、買います。', reading: 'やすかったら、かいます。', translations: { en: 'If it\'s cheap, I\'ll buy it.' } },
    ],
    notes: 'Most versatile conditional. Used for hypothetical, temporal, and counter-factual situations.',
  },
  {
    pattern: '〜ば',
    jlptLevel: 4,
    meaning: { en: 'If (hypothetical conditional)' },
    formation: 'Verb: change -u to -eba. い-adj: い→ければ. な-adj/Noun: であれば/なら',
    examples: [
      { japanese: '時間があれば、手伝います。', reading: 'じかんがあれば、てつだいます。', translations: { en: 'If I have time, I\'ll help.' } },
      { japanese: '安ければ買う。', reading: 'やすければかう。', translations: { en: 'If it\'s cheap, I\'ll buy it.' } },
    ],
    notes: 'More formal/hypothetical than ～たら. Focus is on the condition.',
  },
  {
    pattern: '〜なら',
    jlptLevel: 4,
    meaning: { en: 'If it\'s the case that / Speaking of' },
    formation: 'Verb plain + なら / Noun + なら',
    examples: [
      { japanese: '日本語を勉強するなら、この本がいいです。', reading: 'にほんごをべんきょうするなら、このほんがいいです。', translations: { en: 'If you\'re going to study Japanese, this book is good.' } },
      { japanese: '明日なら大丈夫です。', reading: 'あしたならだいじょうぶです。', translations: { en: 'If it\'s tomorrow, that\'s fine.' } },
    ],
    notes: 'Used when giving advice based on a topic the other person brought up.',
  },
  {
    pattern: '〜と (conditional)',
    jlptLevel: 4,
    meaning: { en: 'When / If (natural consequence)' },
    formation: 'Verb dictionary form + と',
    examples: [
      { japanese: 'このボタンを押すと、ドアが開きます。', reading: 'このボタンをおすと、ドアがあきます。', translations: { en: 'When you press this button, the door opens.' } },
      { japanese: '春になると、桜が咲く。', reading: 'はるになると、さくらがさく。', translations: { en: 'When spring comes, cherry blossoms bloom.' } },
    ],
    notes: 'Used for natural/automatic consequences. Cannot use with volitional main clause.',
  },

  // ── Giving & Receiving ──
  {
    pattern: '〜てあげる / 〜てもらう / 〜てくれる',
    jlptLevel: 4,
    meaning: { en: 'Do for someone / Have someone do / Someone does for me' },
    formation: 'Verb て-form + あげる/もらう/くれる',
    examples: [
      { japanese: '友達に日本語を教えてあげた。', reading: 'ともだちににほんごをおしえてあげた。', translations: { en: 'I taught Japanese to my friend (as a favor).' } },
      { japanese: '先生に説明してもらいました。', reading: 'せんせいにせつめいしてもらいました。', translations: { en: 'I had the teacher explain it for me.' } },
      { japanese: '母が弁当を作ってくれた。', reading: 'ははがべんとうをつくってくれた。', translations: { en: 'My mom made me a bento (for me).' } },
    ],
    notes: 'Direction of favor: あげる (give), もらう (receive), くれる (receive toward speaker).',
  },

  // ── Desire & Intention ──
  {
    pattern: '〜つもりだ',
    jlptLevel: 4,
    meaning: { en: 'Intend to / Plan to' },
    formation: 'Verb dictionary form + つもりだ / Verb ない-form + つもりだ',
    examples: [
      { japanese: '来年、日本に行くつもりです。', reading: 'らいねん、にほんにいくつもりです。', translations: { en: 'I intend to go to Japan next year.' } },
      { japanese: 'もう甘いものを食べないつもりだ。', reading: 'もうあまいものをたべないつもりだ。', translations: { en: 'I intend to not eat sweets anymore.' } },
    ],
    notes: 'Expresses personal intention or plan. Not used for others\' intentions.',
  },
  {
    pattern: '〜ようにする',
    jlptLevel: 4,
    meaning: { en: 'Try to / Make an effort to' },
    formation: 'Verb dictionary/ない form + ようにする',
    examples: [
      { japanese: '毎日運動するようにしています。', reading: 'まいにちうんどうするようにしています。', translations: { en: 'I try to exercise every day.' } },
      { japanese: '遅刻しないようにする。', reading: 'ちこくしないようにする。', translations: { en: 'I\'ll try not to be late.' } },
    ],
    notes: 'Implies ongoing effort or habitual change. Different from 〜てみる (one-time try).',
  },
  {
    pattern: '〜ようになる',
    jlptLevel: 4,
    meaning: { en: 'Come to / Become able to (gradual change)' },
    formation: 'Verb dictionary/ない form + ようになる',
    examples: [
      { japanese: '日本語が話せるようになりました。', reading: 'にほんごがはなせるようになりました。', translations: { en: 'I\'ve become able to speak Japanese.' } },
      { japanese: '野菜を食べるようになった。', reading: 'やさいをたべるようになった。', translations: { en: 'I\'ve come to eat vegetables (I didn\'t before).' } },
    ],
    notes: 'Describes a change over time. Often used with potential verbs.',
  },

  // ── Quoting & Hearsay ──
  {
    pattern: '〜そうだ (hearsay)',
    jlptLevel: 4,
    meaning: { en: 'I heard that / They say that' },
    formation: 'Plain form + そうだ',
    examples: [
      { japanese: '明日は雨が降るそうです。', reading: 'あしたはあめがふるそうです。', translations: { en: 'I heard it will rain tomorrow.' } },
      { japanese: 'あの映画はとても面白いそうだ。', reading: 'あのえいがはとてもおもしろいそうだ。', translations: { en: 'I heard that movie is very interesting.' } },
    ],
    notes: 'Hearsay そうだ attaches to the plain form. Different from appearance そうだ.',
  },
  {
    pattern: '〜そうだ (appearance)',
    jlptLevel: 4,
    meaning: { en: 'Looks like / Seems like (visual impression)' },
    formation: 'Verb ます-stem + そうだ / い-adj (drop い) + そうだ / な-adj + そうだ',
    examples: [
      { japanese: 'このケーキはおいしそうです。', reading: 'このケーキはおいしそうです。', translations: { en: 'This cake looks delicious.' } },
      { japanese: '雨が降りそうだ。', reading: 'あめがふりそうだ。', translations: { en: 'It looks like it\'s going to rain.' } },
    ],
    notes: 'Exception: いい → よさそう, ない → なさそう.',
  },
  {
    pattern: '〜ようだ / 〜みたいだ',
    jlptLevel: 4,
    meaning: { en: 'It seems / It appears (based on evidence)' },
    formation: 'Plain form + ようだ/みたいだ. Noun + のようだ/みたいだ',
    examples: [
      { japanese: '彼は疲れているようだ。', reading: 'かれはつかれているようだ。', translations: { en: 'He seems tired.' } },
      { japanese: '風邪を引いたみたいです。', reading: 'かぜをひいたみたいです。', translations: { en: 'It seems like I\'ve caught a cold.' } },
    ],
    notes: 'ようだ is more formal; みたいだ is casual. Both express inference from evidence.',
  },
  {
    pattern: '〜らしい',
    jlptLevel: 4,
    meaning: { en: 'It seems / Apparently (based on hearsay/evidence)' },
    formation: 'Plain form + らしい / Noun + らしい',
    examples: [
      { japanese: '彼は来年結婚するらしい。', reading: 'かれはらいねんけっこんするらしい。', translations: { en: 'Apparently he\'s getting married next year.' } },
      { japanese: 'この町は昔とても静からしかった。', reading: 'このまちはむかしとてもしずからしかった。', translations: { en: 'This town apparently used to be very quiet.' } },
    ],
    notes: 'Also used as a suffix meaning "typical of": 男らしい (manly), 学生らしい (student-like).',
  },

  // ── Obligation & Permission ──
  {
    pattern: '〜なければならない / 〜なくてはいけない',
    jlptLevel: 4,
    meaning: { en: 'Must / Have to' },
    formation: 'Verb ない-form (drop い) + ければならない',
    examples: [
      { japanese: '宿題をしなければなりません。', reading: 'しゅくだいをしなければなりません。', translations: { en: 'I have to do my homework.' } },
      { japanese: '毎日薬を飲まなくてはいけない。', reading: 'まいにちくすりをのまなくてはいけない。', translations: { en: 'I must take medicine every day.' } },
    ],
    notes: 'Casual contractions: 〜なきゃ, 〜なくちゃ.',
  },
  {
    pattern: '〜なくてもいい',
    jlptLevel: 4,
    meaning: { en: 'Don\'t have to / It\'s okay not to' },
    formation: 'Verb ない-form + くてもいい',
    examples: [
      { japanese: '明日は来なくてもいいです。', reading: 'あしたはこなくてもいいです。', translations: { en: 'You don\'t have to come tomorrow.' } },
      { japanese: '全部食べなくてもいいよ。', reading: 'ぜんぶたべなくてもいいよ。', translations: { en: 'You don\'t have to eat everything.' } },
    ],
    notes: null,
  },
  {
    pattern: '〜はずだ',
    jlptLevel: 4,
    meaning: { en: 'Should be / Expected to be' },
    formation: 'Plain form + はずだ / Noun + のはずだ',
    examples: [
      { japanese: '電車はもうすぐ来るはずです。', reading: 'でんしゃはもうすぐくるはずです。', translations: { en: 'The train should come soon.' } },
      { japanese: 'あの店は安いはずだ。', reading: 'あのみせはやすいはずだ。', translations: { en: 'That store should be cheap.' } },
    ],
    notes: 'Expresses logical expectation. Negative: 〜はずがない (there\'s no way that...).',
  },

  // ── Comparison & Extent ──
  {
    pattern: '〜ほど (extent)',
    jlptLevel: 4,
    meaning: { en: 'To the extent that / So much that' },
    formation: 'Verb/Adj plain form + ほど / Noun + ほど',
    examples: [
      { japanese: '死ぬほど疲れた。', reading: 'しぬほどつかれた。', translations: { en: 'I\'m so tired I could die.' } },
      { japanese: '日本語は思ったほど難しくない。', reading: 'にほんごはおもったほどむずかしくない。', translations: { en: 'Japanese is not as difficult as I thought.' } },
    ],
    notes: 'ほど...ない = "not as much as".',
  },
  {
    pattern: '〜のに',
    jlptLevel: 4,
    meaning: { en: 'Even though / Despite' },
    formation: 'Verb/Adj plain form + のに / な-adj + なのに / Noun + なのに',
    examples: [
      { japanese: '勉強したのに、テストに落ちた。', reading: 'べんきょうしたのに、テストにおちた。', translations: { en: 'Even though I studied, I failed the test.' } },
      { japanese: '約束したのに、来なかった。', reading: 'やくそくしたのに、こなかった。', translations: { en: 'Despite the promise, they didn\'t come.' } },
    ],
    notes: 'Expresses frustration or surprise about an unexpected result.',
  },

  // ── Listing & Connection ──
  {
    pattern: '〜し〜し',
    jlptLevel: 4,
    meaning: { en: 'And also / Not only...but also (listing reasons)' },
    formation: 'Clause + し、Clause + し',
    examples: [
      { japanese: 'この店は安いし、おいしいし、最高です。', reading: 'このみせはやすいし、おいしいし、さいこうです。', translations: { en: 'This restaurant is cheap, delicious, and the best.' } },
      { japanese: '時間もないし、お金もない。', reading: 'じかんもないし、おかねもない。', translations: { en: 'I don\'t have time, and I don\'t have money either.' } },
    ],
    notes: 'Lists multiple reasons. Can be used with just one し for soft assertion.',
  },
  {
    pattern: '〜たり〜たりする',
    jlptLevel: 4,
    meaning: { en: 'Do things like...and...' },
    formation: 'Verb た-form + り + Verb た-form + りする',
    examples: [
      { japanese: '週末は映画を見たり、買い物したりします。', reading: 'しゅうまつはえいがをみたり、かいものしたりします。', translations: { en: 'On weekends, I do things like watching movies and shopping.' } },
      { japanese: '天気が良かったり悪かったりする。', reading: 'てんきがよかったりわるかったりする。', translations: { en: 'The weather is sometimes good, sometimes bad.' } },
    ],
    notes: 'Implies the actions are representative, not exhaustive.',
  },

  // ── Miscellaneous Important Patterns ──
  {
    pattern: '〜ことがある',
    jlptLevel: 4,
    meaning: { en: 'Have (ever) done / Sometimes happens' },
    formation: 'Verb た-form + ことがある (experience) / Dictionary form + ことがある (occasional)',
    examples: [
      { japanese: '日本に行ったことがあります。', reading: 'にほんにいったことがあります。', translations: { en: 'I have been to Japan.' } },
      { japanese: '朝ご飯を食べないことがある。', reading: 'あさごはんをたべないことがある。', translations: { en: 'Sometimes I don\'t eat breakfast.' } },
    ],
    notes: 'Past tense + ことがある = life experience. Dictionary form = occasional event.',
  },
  {
    pattern: '〜ことにする / 〜ことになる',
    jlptLevel: 4,
    meaning: { en: 'Decide to / It has been decided that' },
    formation: 'Verb dictionary/ない form + ことにする/ことになる',
    examples: [
      { japanese: '来月から毎日走ることにした。', reading: 'らいげつからまいにちはしることにした。', translations: { en: 'I decided to run every day starting next month.' } },
      { japanese: '来年、東京に引っ越すことになりました。', reading: 'らいねん、とうきょうにひっこすことになりました。', translations: { en: 'It has been decided that I\'ll move to Tokyo next year.' } },
    ],
    notes: 'する = personal decision; なる = external/collective decision or fate.',
  },
  {
    pattern: '〜ために',
    jlptLevel: 4,
    meaning: { en: 'In order to / For the sake of' },
    formation: 'Verb dictionary form + ために / Noun + のために',
    examples: [
      { japanese: '日本語を勉強するために、日本に来ました。', reading: 'にほんごをべんきょうするために、にほんにきました。', translations: { en: 'I came to Japan in order to study Japanese.' } },
      { japanese: '健康のために、野菜を食べます。', reading: 'けんこうのために、やさいをたべます。', translations: { en: 'I eat vegetables for my health.' } },
    ],
    notes: 'Can also express cause: 事故のために電車が遅れた (The train was late because of an accident).',
  },
  {
    pattern: '〜てほしい',
    jlptLevel: 4,
    meaning: { en: 'Want someone to do' },
    formation: 'Person に + Verb て-form + ほしい',
    examples: [
      { japanese: '静かにしてほしい。', reading: 'しずかにしてほしい。', translations: { en: 'I want you to be quiet.' } },
      { japanese: '先生に日本語で話してほしいです。', reading: 'せんせいににほんごではなしてほしいです。', translations: { en: 'I want the teacher to speak in Japanese.' } },
    ],
    notes: 'Conjugates like an い-adjective. Negative: ～てほしくない or ～ないでほしい.',
  },
  {
    pattern: '〜すぎる',
    jlptLevel: 4,
    meaning: { en: 'Too much / Excessively' },
    formation: 'Verb ます-stem + すぎる / い-adj (drop い) + すぎる / な-adj + すぎる',
    examples: [
      { japanese: '昨日飲みすぎました。', reading: 'きのうのみすぎました。', translations: { en: 'I drank too much yesterday.' } },
      { japanese: 'この部屋は暑すぎる。', reading: 'このへやはあつすぎる。', translations: { en: 'This room is too hot.' } },
    ],
    notes: 'すぎる conjugates as an ichidan verb (すぎます, すぎた, etc.).',
  },
  {
    pattern: '〜やすい / 〜にくい',
    jlptLevel: 4,
    meaning: { en: 'Easy to / Hard to' },
    formation: 'Verb ます-stem + やすい / にくい',
    examples: [
      { japanese: 'このペンは書きやすい。', reading: 'このペンはかきやすい。', translations: { en: 'This pen is easy to write with.' } },
      { japanese: 'この漢字は覚えにくい。', reading: 'このかんじはおぼえにくい。', translations: { en: 'This kanji is hard to remember.' } },
    ],
    notes: 'Conjugates like an い-adjective (書きやすくない, 覚えにくかった).',
  },
  {
    pattern: '〜方 (かた)',
    jlptLevel: 4,
    meaning: { en: 'Way of doing / How to' },
    formation: 'Verb ます-stem + 方',
    examples: [
      { japanese: 'この漢字の読み方を教えてください。', reading: 'このかんじのよみかたをおしえてください。', translations: { en: 'Please teach me how to read this kanji.' } },
      { japanese: '箸の使い方は分かりますか。', reading: 'はしのつかいかたはわかりますか。', translations: { en: 'Do you know how to use chopsticks?' } },
    ],
    notes: 'Very commonly used. Acts as a noun.',
  },

  // ── Honorifics Basics ──
  {
    pattern: 'お/ご〜になる (respectful)',
    jlptLevel: 4,
    meaning: { en: 'Respectful form — used for others\' actions' },
    formation: 'お + Verb ます-stem + になる / ご + suru-verb noun + になる',
    examples: [
      { japanese: '先生はもうお帰りになりました。', reading: 'せんせいはもうおかえりになりました。', translations: { en: 'The teacher has already gone home.' } },
      { japanese: 'ご覧になりましたか。', reading: 'ごらんになりましたか。', translations: { en: 'Have you seen it? (respectful)' } },
    ],
    notes: 'Used to elevate the other person\'s actions. Part of keigo (敬語).',
  },
  {
    pattern: 'お/ご〜する (humble)',
    jlptLevel: 4,
    meaning: { en: 'Humble form — used for one\'s own actions toward superiors' },
    formation: 'お + Verb ます-stem + する / ご + suru-verb noun + する',
    examples: [
      { japanese: '荷物をお持ちしましょうか。', reading: 'にもつをおもちしましょうか。', translations: { en: 'Shall I carry your luggage?' } },
      { japanese: 'ご連絡します。', reading: 'ごれんらくします。', translations: { en: 'I will contact you (humbly).' } },
    ],
    notes: 'Lowers the speaker\'s actions to show respect. Part of keigo (敬語).',
  },
];
