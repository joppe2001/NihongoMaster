/**
 * N3 Grammar dataset — Part 2 (additional 75 patterns).
 * Covers conditionals, voice (passive/causative), completion/regret,
 * giving/receiving, quoting, hearsay, and many more essential N3 patterns
 * not present in grammarN3.ts.
 */

import type { GrammarEntry } from './grammarN5';

export const GRAMMAR_N3_EXTRA: GrammarEntry[] = [
  // ── Conditional Forms ──
  {
    pattern: '〜ば (conditional)',
    jlptLevel: 3,
    meaning: { en: 'If ~ (conditional)' },
    formation: 'Verb ば-form (replace -u with -eba) / い-adj → -ければ / な-adj/Noun + であれば',
    examples: [
      { japanese: '天気がよければ、出かけましょう。', reading: 'てんきがよければ、でかけましょう。', translations: { en: 'If the weather is good, let\'s go out.' } },
      { japanese: '安ければ、買いたい。', reading: 'やすければ、かいたい。', translations: { en: 'If it\'s cheap, I want to buy it.' } },
    ],
    notes: 'General/hypothetical condition. Cannot be used for past events. Often paired with いいのに (wish).',
  },
  {
    pattern: '〜たら (conditional)',
    jlptLevel: 3,
    meaning: { en: 'If / When / After (conditional)' },
    formation: 'Verb た-form + ら / い-adj → かったら / な-adj/Noun + だったら',
    examples: [
      { japanese: '雨が降ったら、家にいます。', reading: 'あめがふったら、いえにいます。', translations: { en: 'If it rains, I\'ll stay home.' } },
      { japanese: '駅に着いたら、電話してください。', reading: 'えきについたら、でんわしてください。', translations: { en: 'When you arrive at the station, please call me.' } },
    ],
    notes: 'Most versatile conditional. Can express hypothetical, temporal, and discovered conditions.',
  },
  {
    pattern: '〜なら (conditional)',
    jlptLevel: 3,
    meaning: { en: 'If (it is the case that) / Speaking of' },
    formation: 'Verb plain form + なら / Noun + なら / な-adj + なら',
    examples: [
      { japanese: '日本に行くなら、京都がおすすめです。', reading: 'にほんにいくなら、きょうとがおすすめです。', translations: { en: 'If you\'re going to Japan, I recommend Kyoto.' } },
      { japanese: '魚なら、このレストランがいい。', reading: 'さかななら、このレストランがいい。', translations: { en: 'If it\'s fish (you want), this restaurant is good.' } },
    ],
    notes: 'Used when responding to information just received. The condition is assumed/given.',
  },
  {
    pattern: '〜と (conditional)',
    jlptLevel: 3,
    meaning: { en: 'When / If (natural/automatic result)' },
    formation: 'Verb dictionary form + と / い-adj + と / な-adj + だと',
    examples: [
      { japanese: 'このボタンを押すと、ドアが開きます。', reading: 'このボタンをおすと、ドアがあきます。', translations: { en: 'When you press this button, the door opens.' } },
      { japanese: '春になると、桜が咲く。', reading: 'はるになると、さくらがさく。', translations: { en: 'When spring comes, the cherry blossoms bloom.' } },
    ],
    notes: 'For natural/habitual consequences. Cannot be used with requests, commands, or volitional intent in the result clause.',
  },

  // ── Voice: Passive ──
  {
    pattern: '〜れる / 〜られる (passive)',
    jlptLevel: 3,
    meaning: { en: 'Is done (passive voice)' },
    formation: 'Group 1: replace -u with -areru / Group 2: stem + られる / する → される / 来る → 来られる',
    examples: [
      { japanese: '電車で足を踏まれた。', reading: 'でんしゃであしをふまれた。', translations: { en: 'My foot was stepped on in the train.' } },
      { japanese: 'この本は多くの人に読まれている。', reading: 'このほんはおおくのひとによまれている。', translations: { en: 'This book is read by many people.' } },
    ],
    notes: 'Three types: direct passive, indirect passive (suffering), and impersonal passive (formal).',
  },
  {
    pattern: '〜に〜(ら)れる (indirect passive / suffering)',
    jlptLevel: 3,
    meaning: { en: 'Was adversely affected by someone doing ~' },
    formation: 'Person に + Verb passive form',
    examples: [
      { japanese: '雨に降られて、びしょ濡れになった。', reading: 'あめにふられて、びしょぬれになった。', translations: { en: 'I got caught in the rain and was soaked.' } },
      { japanese: '隣の人にたばこを吸われた。', reading: 'となりのひとにたばこをすわれた。', translations: { en: 'The person next to me smoked (and it bothered me).' } },
    ],
    notes: 'Unique to Japanese. Expresses that the speaker was negatively affected by someone else\'s action.',
  },

  // ── Voice: Causative ──
  {
    pattern: '〜させる (causative)',
    jlptLevel: 3,
    meaning: { en: 'Make/let someone do ~' },
    formation: 'Group 1: replace -u with -aseru / Group 2: stem + させる / する → させる / 来る → 来させる',
    examples: [
      { japanese: '母は子供に野菜を食べさせた。', reading: 'はははこどもにやさいをたべさせた。', translations: { en: 'The mother made the child eat vegetables.' } },
      { japanese: '先生は学生に発表させた。', reading: 'せんせいはがくせいにはっぴょうさせた。', translations: { en: 'The teacher had the students give presentations.' } },
    ],
    notes: 'Can mean "make" (forced) or "let" (permission) depending on context. に marks the person made/allowed to act.',
  },
  {
    pattern: '〜(さ)せてください',
    jlptLevel: 3,
    meaning: { en: 'Please let me do ~' },
    formation: 'Verb causative て-form + ください',
    examples: [
      { japanese: '私にも言わせてください。', reading: 'わたしにもいわせてください。', translations: { en: 'Please let me speak too.' } },
      { japanese: '少し休ませてください。', reading: 'すこしやすませてください。', translations: { en: 'Please let me rest a little.' } },
    ],
    notes: 'Polite way to ask for permission. Very common in business Japanese.',
  },

  // ── Voice: Causative-Passive ──
  {
    pattern: '〜させられる (causative-passive)',
    jlptLevel: 3,
    meaning: { en: 'Is made to do ~ (forced by someone)' },
    formation: 'Group 1: replace -u with -aserareru (short: -asareru) / Group 2: stem + させられる',
    examples: [
      { japanese: '毎日残業させられている。', reading: 'まいにちざんぎょうさせられている。', translations: { en: 'I\'m made to work overtime every day.' } },
      { japanese: '子供の頃、ピアノを習わせられた。', reading: 'こどものころ、ピアノをならわせられた。', translations: { en: 'When I was a child, I was made to learn piano.' } },
    ],
    notes: 'Combines causative + passive. Always implies being forced unwillingly. Group 1 verbs often use shortened form (e.g., 飲まされる).',
  },

  // ── Potential Form ──
  {
    pattern: '〜える / 〜られる (potential)',
    jlptLevel: 3,
    meaning: { en: 'Can do / Be able to do' },
    formation: 'Group 1: replace -u with -eru / Group 2: stem + られる / する → できる / 来る → 来られる',
    examples: [
      { japanese: 'この漢字が読めますか。', reading: 'このかんじがよめますか。', translations: { en: 'Can you read this kanji?' } },
      { japanese: '朝早く起きられない。', reading: 'あさはやくおきられない。', translations: { en: 'I can\'t wake up early in the morning.' } },
    ],
    notes: 'Object takes が instead of を. Colloquially, Group 2 verbs drop ら (ら抜き言葉): 食べれる.',
  },

  // ── Completion & Regret ──
  {
    pattern: '〜てしまう / 〜ちゃう',
    jlptLevel: 3,
    meaning: { en: 'End up doing / Do completely (often with regret)' },
    formation: 'Verb て-form + しまう (casual: ちゃう / じゃう)',
    examples: [
      { japanese: '財布をなくしてしまった。', reading: 'さいふをなくしてしまった。', translations: { en: 'I ended up losing my wallet.' } },
      { japanese: 'ケーキを全部食べちゃった。', reading: 'ケーキをぜんぶたべちゃった。', translations: { en: 'I ate all the cake (oops).' } },
    ],
    notes: 'Two nuances: regret/accident or completion. Casual forms: ～ちゃう (～てしまう), ～じゃう (～でしまう).',
  },

  // ── Decision & Change ──
  {
    pattern: '〜ことにする',
    jlptLevel: 3,
    meaning: { en: 'Decide to do ~' },
    formation: 'Verb dictionary/ない form + ことにする',
    examples: [
      { japanese: '来月から日本語の学校に通うことにした。', reading: 'らいげつからにほんごのがっこうにかようことにした。', translations: { en: 'I decided to attend a Japanese school from next month.' } },
      { japanese: '夜遅くまで起きないことにした。', reading: 'よるおそくまでおきないことにした。', translations: { en: 'I decided not to stay up late.' } },
    ],
    notes: 'Speaker\'s own decision. Contrast with ～ことになる (decided by external factors).',
  },
  {
    pattern: '〜ことになる',
    jlptLevel: 3,
    meaning: { en: 'It has been decided that / It turns out that' },
    formation: 'Verb dictionary/ない form + ことになる',
    examples: [
      { japanese: '来月、大阪に転勤することになった。', reading: 'らいげつ、おおさかにてんきんすることになった。', translations: { en: 'It has been decided that I will transfer to Osaka next month.' } },
      { japanese: '会議は中止することになりました。', reading: 'かいぎはちゅうしすることになりました。', translations: { en: 'It has been decided that the meeting will be cancelled.' } },
    ],
    notes: 'External decision or natural development. Often used to announce decisions made by organizations.',
  },
  {
    pattern: '〜ようになる',
    jlptLevel: 3,
    meaning: { en: 'Come to / Become able to (gradual change)' },
    formation: 'Verb dictionary/ない form + ようになる',
    examples: [
      { japanese: '日本語が話せるようになった。', reading: 'にほんごがはなせるようになった。', translations: { en: 'I\'ve become able to speak Japanese.' } },
      { japanese: '子供が野菜を食べるようになった。', reading: 'こどもがやさいをたべるようになった。', translations: { en: 'The child has come to eat vegetables.' } },
    ],
    notes: 'Describes a gradual change in ability or habit over time.',
  },

  // ── Expectation & Reasoning ──
  {
    pattern: '〜はずだ',
    jlptLevel: 3,
    meaning: { en: 'Should be / Is expected to / Supposed to' },
    formation: 'Verb/Adj plain form + はずだ / Noun + のはずだ',
    examples: [
      { japanese: '彼はもう着いているはずだ。', reading: 'かれはもうついているはずだ。', translations: { en: 'He should have arrived by now.' } },
      { japanese: '明日は晴れのはずです。', reading: 'あしたははれのはずです。', translations: { en: 'Tomorrow is supposed to be sunny.' } },
    ],
    notes: 'Based on the speaker\'s logical reasoning or information. Different from べきだ (moral obligation).',
  },
  {
    pattern: '〜はずがない',
    jlptLevel: 3,
    meaning: { en: 'There is no way / Cannot possibly be' },
    formation: 'Verb/Adj plain form + はずがない / Noun + のはずがない',
    examples: [
      { japanese: 'あの人が犯人のはずがない。', reading: 'あのひとがはんにんのはずがない。', translations: { en: 'There\'s no way that person is the culprit.' } },
      { japanese: 'こんなに簡単なはずがない。', reading: 'こんなにかんたんなはずがない。', translations: { en: 'There\'s no way it\'s this easy.' } },
    ],
    notes: 'Strong logical denial. Slightly softer than わけがない.',
  },
  {
    pattern: '〜わけだ',
    jlptLevel: 3,
    meaning: { en: 'That\'s why / No wonder / It means that' },
    formation: 'Verb/Adj plain form + わけだ',
    examples: [
      { japanese: '10年住んでいたから、日本語が上手なわけだ。', reading: '10ねんすんでいたから、にほんごがじょうずなわけだ。', translations: { en: 'He lived there for 10 years, so no wonder his Japanese is good.' } },
      { japanese: 'つまり、参加できないわけですね。', reading: 'つまり、さんかできないわけですね。', translations: { en: 'In other words, it means you can\'t participate, right?' } },
    ],
    notes: 'Draws a logical conclusion from known facts.',
  },
  {
    pattern: '〜わけではない',
    jlptLevel: 3,
    meaning: { en: 'It doesn\'t mean that / It\'s not the case that' },
    formation: 'Verb/Adj plain form + わけではない',
    examples: [
      { japanese: '嫌いなわけではないが、あまり食べない。', reading: 'きらいなわけではないが、あまりたべない。', translations: { en: 'It\'s not that I dislike it, but I don\'t eat it much.' } },
      { japanese: '反対しているわけではありません。', reading: 'はんたいしているわけではありません。', translations: { en: 'It\'s not that I\'m opposed to it.' } },
    ],
    notes: 'Partial denial. Softens or clarifies a statement.',
  },

  // ── Obligation & Advice ──
  {
    pattern: '〜べきだ',
    jlptLevel: 3,
    meaning: { en: 'Should / Ought to (moral obligation)' },
    formation: 'Verb dictionary form + べきだ (する → すべきだ/するべきだ)',
    examples: [
      { japanese: '学生はもっと勉強するべきだ。', reading: 'がくせいはもっとべんきょうするべきだ。', translations: { en: 'Students should study more.' } },
      { japanese: '約束は守るべきだ。', reading: 'やくそくはまもるべきだ。', translations: { en: 'You should keep your promises.' } },
    ],
    notes: 'Stronger than ～ほうがいい. Expresses moral or social obligation. Negative: ～べきではない.',
  },

  // ── Appearance & Hearsay ──
  {
    pattern: '〜そうだ (hearsay)',
    jlptLevel: 3,
    meaning: { en: 'I heard that / They say that' },
    formation: 'Plain form + そうだ (no conjugation changes)',
    examples: [
      { japanese: '明日は雨が降るそうだ。', reading: 'あしたはあめがふるそうだ。', translations: { en: 'I heard it will rain tomorrow.' } },
      { japanese: 'あの映画はおもしろいそうです。', reading: 'あのえいがはおもしろいそうです。', translations: { en: 'I heard that movie is interesting.' } },
    ],
    notes: 'Different from appearance そうだ (stem + そうだ). Hearsay そうだ uses the full plain form.',
  },
  {
    pattern: '〜そうだ (appearance)',
    jlptLevel: 3,
    meaning: { en: 'Looks like / Seems like (from appearance)' },
    formation: 'Verb ます-stem + そうだ / い-adj (remove い) + そうだ / な-adj + そうだ',
    examples: [
      { japanese: '雨が降りそうだ。', reading: 'あめがふりそうだ。', translations: { en: 'It looks like it\'s going to rain.' } },
      { japanese: 'このケーキはおいしそうだ。', reading: 'このケーキはおいしそうだ。', translations: { en: 'This cake looks delicious.' } },
    ],
    notes: 'Based on visual impression. いい → よさそうだ. ない → なさそうだ.',
  },
  {
    pattern: '〜らしい',
    jlptLevel: 3,
    meaning: { en: 'It seems / Apparently / -like (typical of)' },
    formation: 'Verb/Adj plain form + らしい / Noun + らしい',
    examples: [
      { japanese: '彼女は来週結婚するらしい。', reading: 'かのじょはらいしゅうけっこんするらしい。', translations: { en: 'Apparently she\'s getting married next week.' } },
      { japanese: '今日は春らしい天気ですね。', reading: 'きょうははるらしいてんきですね。', translations: { en: 'The weather today is typical of spring, isn\'t it?' } },
    ],
    notes: 'Two uses: (1) hearsay/inference from evidence, (2) "typical of / befitting" (Noun + らしい).',
  },
  {
    pattern: '〜ようだ / 〜ような',
    jlptLevel: 3,
    meaning: { en: 'It seems / It appears / Like (comparison)' },
    formation: 'Verb/Adj plain form + ようだ / Noun + のようだ',
    examples: [
      { japanese: '彼は疲れているようだ。', reading: 'かれはつかれているようだ。', translations: { en: 'He seems to be tired.' } },
      { japanese: '夢のような話だ。', reading: 'ゆめのようなはなしだ。', translations: { en: 'It\'s a story like a dream.' } },
    ],
    notes: 'Based on the speaker\'s own observation and inference. Also used for similes (like/as if).',
  },
  {
    pattern: '〜みたいだ',
    jlptLevel: 3,
    meaning: { en: 'Looks like / Seems like (casual)' },
    formation: 'Verb/Adj plain form + みたいだ / Noun + みたいだ',
    examples: [
      { japanese: '風邪を引いたみたいだ。', reading: 'かぜをひいたみたいだ。', translations: { en: 'It seems like I caught a cold.' } },
      { japanese: '子供みたいなことを言うな。', reading: 'こどもみたいなことをいうな。', translations: { en: 'Don\'t say childish things.' } },
    ],
    notes: 'Casual version of ようだ. Used in spoken Japanese. Also for comparison: "like a ~".',
  },

  // ── Quoting ──
  {
    pattern: '〜と言う / 〜って言う',
    jlptLevel: 3,
    meaning: { en: 'To say that / Called / Named' },
    formation: 'Sentence (plain form) + と言う',
    examples: [
      { japanese: '彼は「行かない」と言った。', reading: 'かれは「いかない」といった。', translations: { en: 'He said, "I\'m not going."' } },
      { japanese: 'これは何と言いますか。', reading: 'これはなんといいますか。', translations: { en: 'What do you call this?' } },
    ],
    notes: 'と marks the quoted content. って is the casual form of と.',
  },
  {
    pattern: '〜と思う',
    jlptLevel: 3,
    meaning: { en: 'I think that' },
    formation: 'Verb/Adj plain form + と思う',
    examples: [
      { japanese: '明日は晴れると思います。', reading: 'あしたははれるとおもいます。', translations: { en: 'I think it will be sunny tomorrow.' } },
      { japanese: '日本語は難しいと思う。', reading: 'にほんごはむずかしいとおもう。', translations: { en: 'I think Japanese is difficult.' } },
    ],
    notes: 'For first person opinions. Use ～と思っている for third person\'s ongoing belief.',
  },

  // ── Giving & Receiving (てform) ──
  {
    pattern: '〜てあげる',
    jlptLevel: 3,
    meaning: { en: 'To do ~ for someone (speaker gives action)' },
    formation: 'Verb て-form + あげる',
    examples: [
      { japanese: '友達に日本語を教えてあげた。', reading: 'ともだちににほんごをおしえてあげた。', translations: { en: 'I taught Japanese to my friend (as a favor).' } },
      { japanese: '重い荷物を持ってあげましょうか。', reading: 'おもいにもつをもってあげましょうか。', translations: { en: 'Shall I carry your heavy luggage for you?' } },
    ],
    notes: 'Can sound condescending if used about doing things for people of higher status. Use carefully.',
  },
  {
    pattern: '〜てもらう',
    jlptLevel: 3,
    meaning: { en: 'To have someone do ~ / To receive the favor of ~' },
    formation: 'Person に + Verb て-form + もらう',
    examples: [
      { japanese: '友達に引っ越しを手伝ってもらった。', reading: 'ともだちにひっこしをてつだってもらった。', translations: { en: 'I had my friend help me move.' } },
      { japanese: '先生に推薦状を書いてもらいました。', reading: 'せんせいにすいせんじょうをかいてもらいました。', translations: { en: 'I had my teacher write a recommendation letter for me.' } },
    ],
    notes: 'The subject receives the action as a favor. More humble than ～てくれる.',
  },
  {
    pattern: '〜てくれる',
    jlptLevel: 3,
    meaning: { en: 'Someone does ~ for me/us (gratitude)' },
    formation: 'Person が + Verb て-form + くれる',
    examples: [
      { japanese: '母が弁当を作ってくれた。', reading: 'ははがべんとうをつくってくれた。', translations: { en: 'My mother made a bento for me.' } },
      { japanese: '道を教えてくれてありがとう。', reading: 'みちをおしえてくれてありがとう。', translations: { en: 'Thank you for telling me the way.' } },
    ],
    notes: 'The other person does the action, and the speaker/in-group benefits. Implies gratitude.',
  },

  // ── State & Preparation ──
  {
    pattern: '〜ておく',
    jlptLevel: 3,
    meaning: { en: 'To do ~ in advance / To do ~ for later' },
    formation: 'Verb て-form + おく (casual: ～とく)',
    examples: [
      { japanese: 'パーティーの前に部屋を掃除しておく。', reading: 'パーティーのまえにへやをそうじしておく。', translations: { en: 'I\'ll clean the room before the party (in preparation).' } },
      { japanese: 'ホテルを予約しておいた。', reading: 'ホテルをよやくしておいた。', translations: { en: 'I reserved a hotel in advance.' } },
    ],
    notes: 'Preparation or leaving something in a state intentionally. Casual contraction: ～ておく → ～とく.',
  },
  {
    pattern: '〜てある',
    jlptLevel: 3,
    meaning: { en: 'Has been done (resultant state)' },
    formation: 'Transitive Verb て-form + ある',
    examples: [
      { japanese: '窓が開けてある。', reading: 'まどがあけてある。', translations: { en: 'The window has been opened (intentionally, and remains open).' } },
      { japanese: 'テーブルの上に花が飾ってある。', reading: 'テーブルのうえにはながかざってある。', translations: { en: 'Flowers have been arranged on the table.' } },
    ],
    notes: 'Implies someone intentionally did it, and the result remains. Only with transitive verbs. Object takes が.',
  },
  {
    pattern: '〜ている (resultative state)',
    jlptLevel: 3,
    meaning: { en: 'Is in a state of (result of a change)' },
    formation: 'Verb て-form + いる',
    examples: [
      { japanese: 'ドアが閉まっている。', reading: 'ドアがしまっている。', translations: { en: 'The door is closed (in a state of being closed).' } },
      { japanese: '彼はもう結婚している。', reading: 'かれはもうけっこんしている。', translations: { en: 'He is already married.' } },
    ],
    notes: 'With change-of-state verbs (死ぬ, 結婚する, 壊れる), ている expresses the resulting state, not ongoing action.',
  },

  // ── Particles & Expressions with に/を/で ──
  {
    pattern: '〜にとって',
    jlptLevel: 3,
    meaning: { en: 'For (someone) / From the standpoint of' },
    formation: 'Noun + にとって(は/の)',
    examples: [
      { japanese: '私にとって、家族が一番大切です。', reading: 'わたしにとって、かぞくがいちばんたいせつです。', translations: { en: 'For me, family is the most important thing.' } },
      { japanese: '学生にとって、この問題は難しい。', reading: 'がくせいにとって、このもんだいはむずかしい。', translations: { en: 'For students, this problem is difficult.' } },
    ],
    notes: 'Presents a personal or subjective perspective.',
  },
  {
    pattern: '〜について / 〜についての',
    jlptLevel: 3,
    meaning: { en: 'About / Concerning' },
    formation: 'Noun + について (predicate) / Noun + についての + Noun',
    examples: [
      { japanese: '日本の文化について調べている。', reading: 'にほんのぶんかについてしらべている。', translations: { en: 'I am researching about Japanese culture.' } },
      { japanese: '環境問題についてのレポートを書いた。', reading: 'かんきょうもんだいについてのレポートをかいた。', translations: { en: 'I wrote a report about environmental problems.' } },
    ],
    notes: 'Less formal than ～に関して. Very commonly used in everyday conversation.',
  },
  {
    pattern: '〜によると / 〜によれば',
    jlptLevel: 3,
    meaning: { en: 'According to' },
    formation: 'Noun + によると/によれば',
    examples: [
      { japanese: '天気予報によると、明日は雪だそうだ。', reading: 'てんきよほうによると、あしたはゆきだそうだ。', translations: { en: 'According to the weather forecast, it will snow tomorrow.' } },
      { japanese: 'ニュースによれば、事故があったらしい。', reading: 'ニュースによれば、じこがあったらしい。', translations: { en: 'According to the news, there seems to have been an accident.' } },
    ],
    notes: 'Often paired with ～そうだ or ～らしい at the end of the sentence.',
  },

  // ── Suffixes & Word Formation ──
  {
    pattern: '〜ばかり (just did)',
    jlptLevel: 3,
    meaning: { en: 'Just did ~ / Have just ~' },
    formation: 'Verb た-form + ばかり(だ)',
    examples: [
      { japanese: '今起きたばかりです。', reading: 'いまおきたばかりです。', translations: { en: 'I just woke up.' } },
      { japanese: 'さっき食べたばかりだから、お腹いっぱいだ。', reading: 'さっきたべたばかりだから、おなかいっぱいだ。', translations: { en: 'I just ate, so I\'m full.' } },
    ],
    notes: 'Emphasizes that the action was completed very recently. Different from ～たところ (more immediate).',
  },
  {
    pattern: '〜ばかりいる / 〜てばかりいる',
    jlptLevel: 3,
    meaning: { en: 'Do nothing but ~ / Always doing ~' },
    formation: 'Verb て-form + ばかりいる',
    examples: [
      { japanese: '彼はゲームをしてばかりいる。', reading: 'かれはゲームをしてばかりいる。', translations: { en: 'He does nothing but play games.' } },
      { japanese: '文句を言ってばかりいないで、自分でやりなさい。', reading: 'もんくをいってばかりいないで、じぶんでやりなさい。', translations: { en: 'Stop just complaining and do it yourself.' } },
    ],
    notes: 'Expresses criticism or complaint about repetitive behavior.',
  },
  {
    pattern: '〜っぱなし',
    jlptLevel: 3,
    meaning: { en: 'Left in a state / Keep doing without stopping' },
    formation: 'Verb ます-stem + っぱなし',
    examples: [
      { japanese: 'テレビをつけっぱなしにしないで。', reading: 'テレビをつけっぱなしにしないで。', translations: { en: 'Don\'t leave the TV on.' } },
      { japanese: '電車で2時間立ちっぱなしだった。', reading: 'でんしゃで2じかんたちっぱなしだった。', translations: { en: 'I was standing for 2 hours straight on the train.' } },
    ],
    notes: 'Usually negative connotation — something left undone or an unpleasant continuous state.',
  },
  {
    pattern: '〜気味',
    jlptLevel: 3,
    meaning: { en: 'Slightly / A touch of / -ish (tendency)' },
    formation: 'Verb ます-stem / Noun + 気味',
    examples: [
      { japanese: '最近、風邪気味です。', reading: 'さいきん、かぜぎみです。', translations: { en: 'I\'ve been feeling a bit like I have a cold lately.' } },
      { japanese: '疲れ気味で集中できない。', reading: 'つかれぎみでしゅうちゅうできない。', translations: { en: 'I\'m slightly tired and can\'t concentrate.' } },
    ],
    notes: 'Usually negative tendencies. Common with: 風邪気味, 遅れ気味, 太り気味.',
  },
  {
    pattern: '〜だらけ',
    jlptLevel: 3,
    meaning: { en: 'Full of / Covered with (negative)' },
    formation: 'Noun + だらけ',
    examples: [
      { japanese: '部屋がほこりだらけだ。', reading: 'へやがほこりだらけだ。', translations: { en: 'The room is full of dust.' } },
      { japanese: 'この作文は間違いだらけだ。', reading: 'このさくぶんはまちがいだらけだ。', translations: { en: 'This essay is full of mistakes.' } },
    ],
    notes: 'Always negative connotation. Common: 傷だらけ (covered in scratches), 泥だらけ (covered in mud).',
  },
  {
    pattern: '〜かける / 〜かけ',
    jlptLevel: 3,
    meaning: { en: 'Half-done / About to / In the middle of' },
    formation: 'Verb ます-stem + かける/かけの/かけだ',
    examples: [
      { japanese: '読みかけの本がたくさんある。', reading: 'よみかけのほんがたくさんある。', translations: { en: 'I have many half-read books.' } },
      { japanese: '何か言いかけて、やめた。', reading: 'なにかいいかけて、やめた。', translations: { en: 'I was about to say something but stopped.' } },
    ],
    notes: 'Can mean: (1) started but didn\'t finish, (2) about to happen. As a noun modifier: ～かけの + Noun.',
  },

  // ── Purpose ──
  {
    pattern: '〜ために (purpose)',
    jlptLevel: 3,
    meaning: { en: 'In order to / For the purpose of' },
    formation: 'Verb dictionary form + ために / Noun + のために',
    examples: [
      { japanese: '日本語を勉強するために、日本に来た。', reading: 'にほんごをべんきょうするために、にほんにきた。', translations: { en: 'I came to Japan in order to study Japanese.' } },
      { japanese: '健康のために、毎日運動している。', reading: 'けんこうのために、まいにちうんどうしている。', translations: { en: 'I exercise every day for my health.' } },
    ],
    notes: 'Purpose ために uses dictionary form (not た-form). Different from causal ために (た-form/noun + の).',
  },

  // ── Occurrence & Frequency ──
  {
    pattern: '〜ことがある (occasional)',
    jlptLevel: 3,
    meaning: { en: 'Sometimes / There are times when' },
    formation: 'Verb dictionary form + ことがある',
    examples: [
      { japanese: '朝ごはんを食べないことがある。', reading: 'あさごはんをたべないことがある。', translations: { en: 'There are times when I don\'t eat breakfast.' } },
      { japanese: 'バスが遅れることがある。', reading: 'バスがおくれることがある。', translations: { en: 'The bus is sometimes late.' } },
    ],
    notes: 'Dictionary form + ことがある = sometimes happens. Different from た-form + ことがある = have experienced.',
  },
  {
    pattern: '〜ことがある (experience)',
    jlptLevel: 3,
    meaning: { en: 'Have (ever) done / Have the experience of' },
    formation: 'Verb た-form + ことがある',
    examples: [
      { japanese: '富士山に登ったことがある。', reading: 'ふじさんにのぼったことがある。', translations: { en: 'I have climbed Mt. Fuji before.' } },
      { japanese: '納豆を食べたことがありますか。', reading: 'なっとうをたべたことがありますか。', translations: { en: 'Have you ever eaten natto?' } },
    ],
    notes: 'Used to talk about life experiences. Negative: ～たことがない (have never done).',
  },

  // ── Various Important Patterns ──
  {
    pattern: '〜ようにお願いする',
    jlptLevel: 3,
    meaning: { en: 'To request that someone do ~' },
    formation: 'Verb dictionary/ない form + ようにお願いする',
    examples: [
      { japanese: '静かにするようにお願いしました。', reading: 'しずかにするようにおねがいしました。', translations: { en: 'I requested that they be quiet.' } },
      { japanese: '遅刻しないようにお願いします。', reading: 'ちこくしないようにおねがいします。', translations: { en: 'I request that you not be late.' } },
    ],
    notes: 'Formal/polite way to make requests indirectly.',
  },
  {
    pattern: '〜ことはない',
    jlptLevel: 3,
    meaning: { en: 'There is no need to / Don\'t have to' },
    formation: 'Verb dictionary form + ことはない',
    examples: [
      { japanese: 'そんなに心配することはない。', reading: 'そんなにしんぱいすることはない。', translations: { en: 'There is no need to worry that much.' } },
      { japanese: '急ぐことはありません。', reading: 'いそぐことはありません。', translations: { en: 'There is no need to hurry.' } },
    ],
    notes: 'Reassuring expression. Softer than ～なくてもいい.',
  },
  {
    pattern: '〜てみる',
    jlptLevel: 3,
    meaning: { en: 'Try doing ~ (to see what happens)' },
    formation: 'Verb て-form + みる',
    examples: [
      { japanese: 'この料理を食べてみてください。', reading: 'このりょうりをたべてみてください。', translations: { en: 'Please try eating this dish.' } },
      { japanese: '新しいアプリを使ってみた。', reading: 'あたらしいアプリをつかってみた。', translations: { en: 'I tried using the new app.' } },
    ],
    notes: 'Implies doing something for the first time or to see the result. Different from ～ようとする (attempt).',
  },
  {
    pattern: '〜てほしい',
    jlptLevel: 3,
    meaning: { en: 'Want someone to do ~' },
    formation: 'Person に + Verb て-form + ほしい',
    examples: [
      { japanese: '早く帰ってきてほしい。', reading: 'はやくかえってきてほしい。', translations: { en: 'I want you to come home soon.' } },
      { japanese: '彼にもっと真剣に考えてほしい。', reading: 'かれにもっとしんけんにかんがえてほしい。', translations: { en: 'I want him to think more seriously.' } },
    ],
    notes: 'First person desire for someone else\'s action. Negative: ～ないでほしい.',
  },
  {
    pattern: '〜ことにする / 〜にする',
    jlptLevel: 3,
    meaning: { en: 'To decide on / To make it ~' },
    formation: 'Noun + にする / Verb dictionary form + ことにする',
    examples: [
      { japanese: 'コーヒーにします。', reading: 'コーヒーにします。', translations: { en: 'I\'ll have coffee. (I\'ll go with coffee.)' } },
      { japanese: '旅行に行くことにした。', reading: 'りょこうにいくことにした。', translations: { en: 'I decided to go on a trip.' } },
    ],
    notes: 'Noun + にする = choose/decide on something. Very common when ordering.',
  },
  {
    pattern: '〜ものだ (should/common sense)',
    jlptLevel: 3,
    meaning: { en: 'One should / It\'s common sense that' },
    formation: 'Verb dictionary/ない form + ものだ',
    examples: [
      { japanese: '人の話はちゃんと聞くものだ。', reading: 'ひとのはなしはちゃんときくものだ。', translations: { en: 'One should listen properly to what people say.' } },
      { japanese: '嘘をつくものではない。', reading: 'うそをつくものではない。', translations: { en: 'One should not tell lies.' } },
    ],
    notes: 'Expresses general truths or social norms. Different from nostalgic ものだ (た-form).',
  },

  // ── Conjunctive & Transitional ──
  {
    pattern: '〜かわりに',
    jlptLevel: 3,
    meaning: { en: 'Instead of / In exchange for / In return for' },
    formation: 'Verb dictionary/た-form + かわりに / Noun + のかわりに',
    examples: [
      { japanese: '電車のかわりにバスで行った。', reading: 'でんしゃのかわりにバスでいった。', translations: { en: 'I went by bus instead of by train.' } },
      { japanese: '手伝ってあげるかわりに、お菓子をちょうだい。', reading: 'てつだってあげるかわりに、おかしをちょうだい。', translations: { en: 'In exchange for helping you, give me some sweets.' } },
    ],
    notes: 'Three uses: substitution, compensation, and contrasting aspect.',
  },
  {
    pattern: '〜おきに',
    jlptLevel: 3,
    meaning: { en: 'Every ~ / At intervals of ~' },
    formation: 'Number/Counter + おきに',
    examples: [
      { japanese: '2時間おきに薬を飲んでください。', reading: '2じかんおきにくすりをのんでください。', translations: { en: 'Please take the medicine every 2 hours.' } },
      { japanese: '1日おきにジョギングしている。', reading: '1にちおきにジョギングしている。', translations: { en: 'I jog every other day.' } },
    ],
    notes: 'Can be ambiguous: 2日おきに may mean "every 2 days" or "every other day" depending on context.',
  },
  {
    pattern: '〜最中に',
    jlptLevel: 3,
    meaning: { en: 'In the very middle of / Right in the middle of' },
    formation: 'Verb ている + 最中に / Noun + の最中に',
    examples: [
      { japanese: '試験の最中に携帯が鳴った。', reading: 'しけんのさいちゅうにけいたいがなった。', translations: { en: 'My phone rang in the middle of the exam.' } },
      { japanese: '寝ている最中に起こされた。', reading: 'ねているさいちゅうにおこされた。', translations: { en: 'I was woken up in the middle of sleeping.' } },
    ],
    notes: 'Emphasizes that an interruption occurred at a critical moment.',
  },
  {
    pattern: '〜をきっかけに',
    jlptLevel: 3,
    meaning: { en: 'Taking the opportunity of / Triggered by' },
    formation: 'Noun + をきっかけに(して)',
    examples: [
      { japanese: '留学をきっかけに、日本語の勉強を始めた。', reading: 'りゅうがくをきっかけに、にほんごのべんきょうをはじめた。', translations: { en: 'Triggered by studying abroad, I started studying Japanese.' } },
      { japanese: '結婚をきっかけに引っ越した。', reading: 'けっこんをきっかけにひっこした。', translations: { en: 'I moved, taking my marriage as the opportunity.' } },
    ],
    notes: 'The noun is the trigger/catalyst for a change or new action.',
  },
  {
    pattern: '〜たとたん(に)',
    jlptLevel: 3,
    meaning: { en: 'The moment / Just as (unexpected result)' },
    formation: 'Verb た-form + とたん(に)',
    examples: [
      { japanese: 'ドアを開けたとたん、猫が飛び出した。', reading: 'ドアをあけたとたん、ねこがとびだした。', translations: { en: 'The moment I opened the door, the cat jumped out.' } },
      { japanese: '立ち上がったとたんに、めまいがした。', reading: 'たちあがったとたんに、めまいがした。', translations: { en: 'The moment I stood up, I felt dizzy.' } },
    ],
    notes: 'The second action is unexpected or surprising. Cannot be used with intentional actions in the second clause.',
  },
  {
    pattern: '〜て以来',
    jlptLevel: 3,
    meaning: { en: 'Ever since / Since ~' },
    formation: 'Verb て-form + 以来',
    examples: [
      { japanese: '日本に来て以来、毎日日本語を使っている。', reading: 'にほんにきていらい、まいにちにほんごをつかっている。', translations: { en: 'Ever since I came to Japan, I\'ve been using Japanese every day.' } },
      { japanese: '卒業して以来、一度も会っていない。', reading: 'そつぎょうしていらい、いちどもあっていない。', translations: { en: 'I haven\'t met them even once since graduation.' } },
    ],
    notes: 'Describes a continuous state or habit that started from a specific point.',
  },

  // ── Contrast & Addition ──
  {
    pattern: '〜上に',
    jlptLevel: 3,
    meaning: { en: 'In addition to / On top of / Moreover' },
    formation: 'Verb/Adj plain form + 上に / Noun + の上に / な-adj + な上に',
    examples: [
      { japanese: '安い上においしい。', reading: 'やすいうえにおいしい。', translations: { en: 'In addition to being cheap, it\'s delicious.' } },
      { japanese: '忙しい上に、体調も悪い。', reading: 'いそがしいうえに、たいちょうもわるい。', translations: { en: 'On top of being busy, I\'m also not feeling well.' } },
    ],
    notes: 'Adds information of the same positive or negative nature. Both clauses should be either positive or negative.',
  },
  {
    pattern: '〜どころか',
    jlptLevel: 3,
    meaning: { en: 'Far from / Not only ~ but / Let alone' },
    formation: 'Verb/Adj plain form + どころか / Noun + どころか',
    examples: [
      { japanese: '漢字どころか、ひらがなも読めない。', reading: 'かんじどころか、ひらがなもよめない。', translations: { en: 'Far from kanji, I can\'t even read hiragana.' } },
      { japanese: '減るどころか、増えてしまった。', reading: 'へるどころか、ふえてしまった。', translations: { en: 'Far from decreasing, it actually increased.' } },
    ],
    notes: 'Negates the first item and presents something even more extreme.',
  },
  {
    pattern: '〜というより',
    jlptLevel: 3,
    meaning: { en: 'Rather than / More like' },
    formation: 'Noun/Verb/Adj + というより',
    examples: [
      { japanese: '彼は先生というより、友達みたいだ。', reading: 'かれはせんせいというより、ともだちみたいだ。', translations: { en: 'He\'s more like a friend than a teacher.' } },
      { japanese: '怒っているというより、悲しいんだと思う。', reading: 'おこっているというより、かなしいんだとおもう。', translations: { en: 'Rather than being angry, I think she\'s sad.' } },
    ],
    notes: 'Corrects or refines a description to be more accurate.',
  },
  {
    pattern: '〜とは限らない',
    jlptLevel: 3,
    meaning: { en: 'Not necessarily / Not always true that' },
    formation: 'Verb/Adj plain form + とは限らない / Noun + だとは限らない',
    examples: [
      { japanese: '高いものがいいとは限らない。', reading: 'たかいものがいいとはかぎらない。', translations: { en: 'Expensive things are not necessarily good.' } },
      { japanese: '努力すれば成功するとは限らない。', reading: 'どりょくすればせいこうするとはかぎらない。', translations: { en: 'It\'s not always the case that effort leads to success.' } },
    ],
    notes: 'Cautions against assumptions. Expresses that something is not universally true.',
  },

  // ── Manner & Extent ──
  {
    pattern: '〜ように見える',
    jlptLevel: 3,
    meaning: { en: 'Looks like / Appears to be' },
    formation: 'Verb/Adj plain form + ように見える / Noun + のように見える',
    examples: [
      { japanese: '彼女は若く見える。', reading: 'かのじょはわかくみえる。', translations: { en: 'She looks young.' } },
      { japanese: '泣いているように見えた。', reading: 'ないているようにみえた。', translations: { en: 'It appeared as though they were crying.' } },
    ],
    notes: 'Describes visual appearance or impression received by the observer.',
  },
  {
    pattern: '〜くする / 〜にする',
    jlptLevel: 3,
    meaning: { en: 'To make ~ (change a state)' },
    formation: 'い-adj → く + する / な-adj → に + する',
    examples: [
      { japanese: '部屋をきれいにしてください。', reading: 'へやをきれいにしてください。', translations: { en: 'Please make the room clean.' } },
      { japanese: '音を小さくしてくれない？', reading: 'おとをちいさくしてくれない？', translations: { en: 'Could you turn down the volume?' } },
    ],
    notes: 'い-adj: drop い, add く + する. な-adj: add に + する.',
  },
  {
    pattern: '〜くなる / 〜になる',
    jlptLevel: 3,
    meaning: { en: 'To become ~ (change of state)' },
    formation: 'い-adj → く + なる / な-adj/Noun → に + なる',
    examples: [
      { japanese: '日が短くなった。', reading: 'ひがみじかくなった。', translations: { en: 'The days have become shorter.' } },
      { japanese: '日本語が上手になりましたね。', reading: 'にほんごがじょうずになりましたね。', translations: { en: 'Your Japanese has gotten better!' } },
    ],
    notes: 'Describes a natural/gradual change. Compare with ～ようになる (change in ability/habit).',
  },

  // ── Miscellaneous Essential N3 ──
  {
    pattern: '〜だけでなく〜も',
    jlptLevel: 3,
    meaning: { en: 'Not only ~ but also ~' },
    formation: 'Noun/Verb/Adj + だけでなく + も',
    examples: [
      { japanese: '彼は英語だけでなく、フランス語も話せる。', reading: 'かれはえいごだけでなく、フランスごもはなせる。', translations: { en: 'He can speak not only English but also French.' } },
      { japanese: '安いだけでなく、品質もいい。', reading: 'やすいだけでなく、ひんしつもいい。', translations: { en: 'Not only is it cheap, but the quality is also good.' } },
    ],
    notes: 'Can also be expressed as ～ばかりでなく～も.',
  },
  {
    pattern: '〜かもしれない',
    jlptLevel: 3,
    meaning: { en: 'Might / Maybe / Possibly' },
    formation: 'Verb/Adj plain form + かもしれない / Noun + かもしれない',
    examples: [
      { japanese: '明日は雨が降るかもしれない。', reading: 'あしたはあめがふるかもしれない。', translations: { en: 'It might rain tomorrow.' } },
      { japanese: '彼は忙しいかもしれません。', reading: 'かれはいそがしいかもしれません。', translations: { en: 'He might be busy.' } },
    ],
    notes: 'Expresses uncertainty/possibility. Less certain than ～だろう/～でしょう.',
  },
  {
    pattern: '〜に違いない',
    jlptLevel: 3,
    meaning: { en: 'There is no doubt that / Must be' },
    formation: 'Verb/Adj plain form + に違いない / Noun + に違いない',
    examples: [
      { japanese: '犯人は彼に違いない。', reading: 'はんにんはかれにちがいない。', translations: { en: 'The culprit must be him.' } },
      { japanese: 'この料理はおいしいに違いない。', reading: 'このりょうりはおいしいにちがいない。', translations: { en: 'This dish is without a doubt delicious.' } },
    ],
    notes: 'Strong conviction based on evidence. Written/formal tone.',
  },
  {
    pattern: '〜ないで',
    jlptLevel: 3,
    meaning: { en: 'Without doing ~ / Don\'t do ~' },
    formation: 'Verb ない-form + で',
    examples: [
      { japanese: '朝ごはんを食べないで学校に行った。', reading: 'あさごはんをたべないでがっこうにいった。', translations: { en: 'I went to school without eating breakfast.' } },
      { japanese: '見ないでください。', reading: 'みないでください。', translations: { en: 'Please don\'t look.' } },
    ],
    notes: 'Two uses: (1) without doing (= ～ずに), (2) negative request (= ～ないでください).',
  },
  {
    pattern: '〜ずに',
    jlptLevel: 3,
    meaning: { en: 'Without doing ~ (formal)' },
    formation: 'Verb ない-stem + ずに (する → せずに)',
    examples: [
      { japanese: '辞書を使わずに読めた。', reading: 'じしょをつかわずによめた。', translations: { en: 'I was able to read it without using a dictionary.' } },
      { japanese: '何も言わずに帰った。', reading: 'なにもいわずにかえった。', translations: { en: 'He left without saying anything.' } },
    ],
    notes: 'More formal/written than ～ないで. Exception: する → せずに.',
  },
  {
    pattern: '〜たがる',
    jlptLevel: 3,
    meaning: { en: 'Want to (third person desire, observable)' },
    formation: 'Verb ます-stem + たがる',
    examples: [
      { japanese: '子供はお菓子を食べたがる。', reading: 'こどもはおかしをたべたがる。', translations: { en: 'Children want to eat sweets.' } },
      { japanese: '彼女は海外に行きたがっている。', reading: 'かのじょはかいがいにいきたがっている。', translations: { en: 'She wants to go abroad.' } },
    ],
    notes: 'Used for third person\'s desires. First person uses ～たい. Conjugates like a Group 1 verb.',
  },
  {
    pattern: '〜がる / 〜がっている',
    jlptLevel: 3,
    meaning: { en: 'To show signs of (third person feelings)' },
    formation: 'い-adj (remove い) + がる / Noun + がる',
    examples: [
      { japanese: '弟はお化けを怖がっている。', reading: 'おとうとはおばけをこわがっている。', translations: { en: 'My younger brother is scared of ghosts.' } },
      { japanese: 'みんなが新しいスマホを欲しがっている。', reading: 'みんながあたらしいスマホをほしがっている。', translations: { en: 'Everyone wants a new smartphone.' } },
    ],
    notes: 'Used to express third person feelings/desires based on observable behavior. Common: 怖がる, 嫌がる, 欲しがる.',
  },
  {
    pattern: '〜てたまらない',
    jlptLevel: 3,
    meaning: { en: 'Unbearably / Extremely / Can\'t stand how ~' },
    formation: 'Verb て-form + たまらない / い-adj (remove い) + くてたまらない / な-adj + でたまらない',
    examples: [
      { japanese: '暑くてたまらない。', reading: 'あつくてたまらない。', translations: { en: 'It\'s unbearably hot.' } },
      { japanese: 'のどが渇いてたまらない。', reading: 'のどがかわいてたまらない。', translations: { en: 'I\'m extremely thirsty.' } },
    ],
    notes: 'Expresses an extreme, uncontrollable feeling or sensation. Similar to ～てしょうがない.',
  },
  {
    pattern: '〜てしょうがない / 〜てしかたがない',
    jlptLevel: 3,
    meaning: { en: 'Can\'t help but / Extremely / Terribly' },
    formation: 'Verb て-form + しょうがない / い-adj → くて + しょうがない / な-adj → で + しょうがない',
    examples: [
      { japanese: '気になってしょうがない。', reading: 'きになってしょうがない。', translations: { en: 'I can\'t help but be curious.' } },
      { japanese: '眠くてしかたがない。', reading: 'ねむくてしかたがない。', translations: { en: 'I\'m extremely sleepy.' } },
    ],
    notes: 'Interchangeable with ～てたまらない. しかたがない is slightly more formal than しょうがない.',
  },
  {
    pattern: '〜さえ〜ば',
    jlptLevel: 3,
    meaning: { en: 'If only ~ / As long as ~' },
    formation: 'Noun + さえ + Verb ば-form / Verb ます-stem + さえすれば',
    examples: [
      { japanese: '努力さえすれば、合格できる。', reading: 'どりょくさえすれば、ごうかくできる。', translations: { en: 'If only you make the effort, you can pass.' } },
      { japanese: '薬を飲みさえすれば治る。', reading: 'くすりをのみさえすればなおる。', translations: { en: 'As long as you take the medicine, you\'ll get better.' } },
    ],
    notes: 'さえ emphasizes the minimum necessary condition.',
  },
  {
    pattern: '〜さえ',
    jlptLevel: 3,
    meaning: { en: 'Even (emphatic particle)' },
    formation: 'Noun + さえ',
    examples: [
      { japanese: '子供でさえ知っている。', reading: 'こどもでさえしっている。', translations: { en: 'Even children know it.' } },
      { japanese: '名前さえ覚えていない。', reading: 'なまえさえおぼえていない。', translations: { en: 'I don\'t even remember the name.' } },
    ],
    notes: 'Emphasizes an extreme example. Replaces particles は, が, を; added after に, で, etc.',
  },
  {
    pattern: '〜ては〜ては / 〜たり〜たり',
    jlptLevel: 3,
    meaning: { en: 'Doing ~ and ~ alternately / Doing things like ~ and ~' },
    formation: 'Verb たり + Verb たり + する',
    examples: [
      { japanese: '週末は映画を見たり買い物をしたりする。', reading: 'しゅうまつはえいがをみたりかいものをしたりする。', translations: { en: 'On weekends I do things like watch movies and go shopping.' } },
      { japanese: '行ったり来たりしている。', reading: 'いったりきたりしている。', translations: { en: 'I keep going back and forth.' } },
    ],
    notes: 'Lists representative actions. Usually ended with する. The list is not exhaustive.',
  },
  {
    pattern: '〜からには / 〜以上は',
    jlptLevel: 3,
    meaning: { en: 'Now that / Since (strong resolution)' },
    formation: 'Verb plain form + からには/以上は',
    examples: [
      { japanese: '約束したからには、守らなければならない。', reading: 'やくそくしたからには、まもらなければならない。', translations: { en: 'Now that I\'ve promised, I must keep it.' } },
      { japanese: '引き受けた以上は、最後までやる。', reading: 'ひきうけたいじょうは、さいごまでやる。', translations: { en: 'Since I\'ve taken it on, I\'ll see it through to the end.' } },
    ],
    notes: 'Strong resolution or obligation following from a fact. からには and 以上は are nearly interchangeable.',
  },
  {
    pattern: '〜ないことはない',
    jlptLevel: 3,
    meaning: { en: 'It\'s not that ~ can\'t / It\'s possible that ~' },
    formation: 'Verb ない-form + ことはない',
    examples: [
      { japanese: '行けないことはないが、面倒だ。', reading: 'いけないことはないが、めんどうだ。', translations: { en: 'It\'s not that I can\'t go, but it\'s a hassle.' } },
      { japanese: '分からないことはないけど、説明しにくい。', reading: 'わからないことはないけど、せつめいしにくい。', translations: { en: 'It\'s not that I don\'t understand, but it\'s hard to explain.' } },
    ],
    notes: 'Double negative expressing reluctant affirmation. Nuance: technically possible but with reservations.',
  },
  {
    pattern: '〜とともに',
    jlptLevel: 3,
    meaning: { en: 'Together with / Along with / As' },
    formation: 'Noun + とともに / Verb dictionary form + とともに',
    examples: [
      { japanese: '年齢とともに体力が落ちる。', reading: 'ねんれいとともにたいりょくがおちる。', translations: { en: 'Physical strength declines with age.' } },
      { japanese: '家族とともに過ごす時間は大切だ。', reading: 'かぞくとともにすごすじかんはたいせつだ。', translations: { en: 'Time spent together with family is precious.' } },
    ],
    notes: 'Formal. Two uses: (1) simultaneous change, (2) "together with" (= と一緒に).',
  },
  {
    pattern: '〜に基づいて / 〜に基づく',
    jlptLevel: 3,
    meaning: { en: 'Based on / On the basis of' },
    formation: 'Noun + に基づいて (predicate) / Noun + に基づく + Noun (modifier)',
    examples: [
      { japanese: 'データに基づいて判断する。', reading: 'データにもとづいてはんだんする。', translations: { en: 'I judge based on the data.' } },
      { japanese: '事実に基づく映画', reading: 'じじつにもとづくえいが', translations: { en: 'A movie based on true events' } },
    ],
    notes: 'Formal expression. Common in academic, legal, and business writing.',
  },
  {
    pattern: '〜をもとに / 〜をもとにして',
    jlptLevel: 3,
    meaning: { en: 'Based on / Using ~ as a basis' },
    formation: 'Noun + をもとに(して)',
    examples: [
      { japanese: 'この小説は実話をもとに書かれた。', reading: 'このしょうせつはじつわをもとにかかれた。', translations: { en: 'This novel was written based on a true story.' } },
      { japanese: 'アンケートの結果をもとに改善する。', reading: 'アンケートのけっかをもとにかいぜんする。', translations: { en: 'We will improve based on the survey results.' } },
    ],
    notes: 'Similar to に基づいて but slightly less formal. をもとに implies using as source material.',
  },
  {
    pattern: '〜向きだ',
    jlptLevel: 3,
    meaning: { en: 'Suitable for / Fit for' },
    formation: 'Noun + 向き(だ/の)',
    examples: [
      { japanese: 'この仕事は体力のある人向きだ。', reading: 'このしごとはたいりょくのあるひとむきだ。', translations: { en: 'This job is suitable for people with physical strength.' } },
      { japanese: '家族向きのレストラン', reading: 'かぞくむきのレストラン', translations: { en: 'A family-friendly restaurant' } },
    ],
    notes: 'Describes natural suitability. Compare with 向け (intentionally targeted).',
  },
  {
    pattern: '〜を問わず',
    jlptLevel: 3,
    meaning: { en: 'Regardless of / Irrespective of' },
    formation: 'Noun + を問わず',
    examples: [
      { japanese: '年齢を問わず、誰でも参加できる。', reading: 'ねんれいをとわず、だれでもさんかできる。', translations: { en: 'Regardless of age, anyone can participate.' } },
      { japanese: '男女を問わず募集しています。', reading: 'だんじょをとわずぼしゅうしています。', translations: { en: 'We are recruiting regardless of gender.' } },
    ],
    notes: 'Formal expression. Common in job postings, announcements, and regulations.',
  },
];
