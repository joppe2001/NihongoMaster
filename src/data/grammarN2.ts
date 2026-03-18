/**
 * N2 Grammar dataset — 50 advanced patterns for JLPT N2 level.
 * Covers formal written Japanese, emphasis, limitation, and nuanced expressions.
 */

import type { GrammarEntry } from './grammarN5';

export const GRAMMAR_N2: GrammarEntry[] = [
  // ── Emphasis & Assertion ──
  {
    pattern: '〜からこそ',
    jlptLevel: 2,
    meaning: { en: 'Precisely because / It is exactly because' },
    formation: 'Verb/Adj plain form + からこそ / Noun + だからこそ',
    examples: [
      { japanese: '好きだからこそ、厳しくする。', reading: 'すきだからこそ、きびしくする。', translations: { en: 'Precisely because I like you, I am strict.' } },
      { japanese: '努力したからこそ、成功した。', reading: 'どりょくしたからこそ、せいこうした。', translations: { en: 'It is exactly because I made an effort that I succeeded.' } },
    ],
    notes: 'Emphasizes the reason. Stronger than just から.',
  },
  {
    pattern: '〜こそ',
    jlptLevel: 2,
    meaning: { en: 'It is precisely ~ / Indeed ~' },
    formation: 'Noun + こそ',
    examples: [
      { japanese: 'こちらこそ、ありがとうございます。', reading: 'こちらこそ、ありがとうございます。', translations: { en: 'It is I who should be thanking you.' } },
      { japanese: '今こそ行動する時だ。', reading: 'いまこそこうどうするときだ。', translations: { en: 'Now is precisely the time to act.' } },
    ],
    notes: 'Particle that adds strong emphasis to the preceding word.',
  },
  {
    pattern: '〜さえ〜ば',
    jlptLevel: 2,
    meaning: { en: 'If only ~ / As long as ~' },
    formation: 'Noun + さえ + Verb ば-form / Verb ます-stem + さえすれば',
    examples: [
      { japanese: 'お金さえあれば、幸せになれる。', reading: 'おかねさえあれば、しあわせになれる。', translations: { en: 'If only I had money, I could be happy.' } },
      { japanese: '薬を飲みさえすれば、治る。', reading: 'くすりをのみさえすれば、なおる。', translations: { en: 'As long as you take the medicine, you\'ll recover.' } },
    ],
    notes: 'Implies the one condition is sufficient for the result.',
  },
  {
    pattern: '〜どころか',
    jlptLevel: 2,
    meaning: { en: 'Far from / Let alone / On the contrary' },
    formation: 'Noun/Verb/Adj + どころか',
    examples: [
      { japanese: '手伝ってくれるどころか、邪魔をした。', reading: 'てつだってくれるどころか、じゃまをした。', translations: { en: 'Far from helping, he got in the way.' } },
      { japanese: '日本語どころか、英語も話せない。', reading: 'にほんごどころか、えいごもはなせない。', translations: { en: 'Let alone Japanese, he can\'t even speak English.' } },
    ],
    notes: 'Negates the first item and presents something even more extreme.',
  },
  {
    pattern: '〜にすぎない',
    jlptLevel: 2,
    meaning: { en: 'Nothing more than / Merely / Just' },
    formation: 'Verb plain / Noun + にすぎない',
    examples: [
      { japanese: 'これは一つの例にすぎない。', reading: 'これはひとつのれいにすぎない。', translations: { en: 'This is nothing more than one example.' } },
      { japanese: '私は学生にすぎません。', reading: 'わたしはがくせいにすぎません。', translations: { en: 'I am merely a student.' } },
    ],
    notes: 'Downplays the significance of something.',
  },

  // ── Formal Conjunctions ──
  {
    pattern: '〜に基づいて / 〜に基づく',
    jlptLevel: 2,
    meaning: { en: 'Based on / In accordance with' },
    formation: 'Noun + に基づいて (sentence) / Noun + に基づく + Noun (modifier)',
    examples: [
      { japanese: 'データに基づいて判断する。', reading: 'データにもとづいてはんだんする。', translations: { en: 'I will judge based on the data.' } },
      { japanese: '法律に基づく処分', reading: 'ほうりつにもとづくしょぶん', translations: { en: 'Punishment based on the law' } },
    ],
    notes: 'Formal. Common in academic/legal writing.',
  },
  {
    pattern: '〜に応じて',
    jlptLevel: 2,
    meaning: { en: 'In response to / According to / Depending on' },
    formation: 'Noun + に応じて',
    examples: [
      { japanese: '状況に応じて対応する。', reading: 'じょうきょうにおうじてたいおうする。', translations: { en: 'I will respond according to the situation.' } },
      { japanese: '能力に応じた仕事を与える。', reading: 'のうりょくにおうじたしごとをあたえる。', translations: { en: 'I give work suited to their ability.' } },
    ],
    notes: null,
  },
  {
    pattern: '〜につれて / 〜に従って',
    jlptLevel: 2,
    meaning: { en: 'As ~ / In accordance with / Following' },
    formation: 'Verb dictionary form + につれて / Noun + に従って',
    examples: [
      { japanese: '年を取るにつれて、体力が落ちる。', reading: 'としをとるにつれて、たいりょくがおちる。', translations: { en: 'As you get older, your stamina decreases.' } },
      { japanese: '指示に従って行動してください。', reading: 'しじにしたがってこうどうしてください。', translations: { en: 'Please act in accordance with the instructions.' } },
    ],
    notes: 'につれて = proportional change. に従って = following rules/instructions.',
  },
  {
    pattern: '〜をもとに',
    jlptLevel: 2,
    meaning: { en: 'Based on / On the basis of' },
    formation: 'Noun + をもとに(して)',
    examples: [
      { japanese: '実話をもとにした映画', reading: 'じつわをもとにしたえいが', translations: { en: 'A movie based on a true story' } },
      { japanese: '調査結果をもとに報告書を作成した。', reading: 'ちょうさけっかをもとにほうこくしょをさくせいした。', translations: { en: 'I created a report based on the survey results.' } },
    ],
    notes: 'Similar to に基づいて but slightly less formal.',
  },
  {
    pattern: '〜に沿って',
    jlptLevel: 2,
    meaning: { en: 'Along / In line with' },
    formation: 'Noun + に沿って',
    examples: [
      { japanese: '川に沿って歩いた。', reading: 'かわにそってあるいた。', translations: { en: 'I walked along the river.' } },
      { japanese: '方針に沿って計画を立てる。', reading: 'ほうしんにそってけいかくをたてる。', translations: { en: 'I make plans in line with the policy.' } },
    ],
    notes: 'Physical (along a path) or figurative (in line with a plan).',
  },

  // ── Negation & Limitation ──
  {
    pattern: '〜ざるを得ない',
    jlptLevel: 2,
    meaning: { en: 'Cannot help but / Have no choice but to' },
    formation: 'Verb ない-stem + ざるを得ない (する → せざるを得ない)',
    examples: [
      { japanese: '事情を考えると、賛成せざるを得ない。', reading: 'じじょうをかんがえると、さんせいせざるをえない。', translations: { en: 'Considering the circumstances, I have no choice but to agree.' } },
      { japanese: '証拠がある以上、認めざるを得ない。', reading: 'しょうこがあるいじょう、みとめざるをえない。', translations: { en: 'Given the evidence, I cannot help but acknowledge it.' } },
    ],
    notes: 'Very formal. Literary ざる (=ない) + を得ない (cannot obtain).',
  },
  {
    pattern: '〜ないわけにはいかない',
    jlptLevel: 2,
    meaning: { en: 'Cannot not do / Must (due to obligation)' },
    formation: 'Verb ない-form + わけにはいかない',
    examples: [
      { japanese: '招待されたからには、行かないわけにはいかない。', reading: 'しょうたいされたからには、いかないわけにはいかない。', translations: { en: 'Since I was invited, I must go.' } },
      { japanese: '約束した以上、守らないわけにはいかない。', reading: 'やくそくしたいじょう、まもらないわけにはいかない。', translations: { en: 'Since I made a promise, I must keep it.' } },
    ],
    notes: 'Double negative = strong obligation. Social/moral pressure.',
  },
  {
    pattern: '〜に限って / 〜に限り',
    jlptLevel: 2,
    meaning: { en: 'Only when / Limited to / (Of all things)' },
    formation: 'Noun + に限って',
    examples: [
      { japanese: '傘を持っていない日に限って雨が降る。', reading: 'かさをもっていないひにかぎってあめがふる。', translations: { en: 'It rains only on the days I don\'t have an umbrella.' } },
      { japanese: '本日に限り、半額です。', reading: 'ほんじつにかぎり、はんがくです。', translations: { en: 'Limited to today only, half price.' } },
    ],
    notes: 'に限って = Murphy\'s law nuance. に限り = formal restriction.',
  },
  {
    pattern: '〜からには / 〜以上は',
    jlptLevel: 2,
    meaning: { en: 'Now that / Since (with resolve)' },
    formation: 'Verb plain form + からには/以上は',
    examples: [
      { japanese: '参加するからには、全力を尽くす。', reading: 'さんかするからには、ぜんりょくをつくす。', translations: { en: 'Now that I\'m participating, I\'ll give it my all.' } },
      { japanese: '約束した以上は、必ず守る。', reading: 'やくそくしたいじょうは、かならずまもる。', translations: { en: 'Since I made a promise, I will definitely keep it.' } },
    ],
    notes: 'Implies determination and commitment after a decision.',
  },
  {
    pattern: '〜っぱなし',
    jlptLevel: 2,
    meaning: { en: 'Left in a state / Keep doing' },
    formation: 'Verb ます-stem + っぱなし',
    examples: [
      { japanese: 'テレビをつけっぱなしにしないで。', reading: 'テレビをつけっぱなしにしないで。', translations: { en: 'Don\'t leave the TV on.' } },
      { japanese: '電車で2時間立ちっぱなしだった。', reading: 'でんしゃで2じかんたちっぱなしだった。', translations: { en: 'I stood for 2 hours straight on the train.' } },
    ],
    notes: 'Negative nuance — something left undone or continuously done.',
  },

  // ── Time & Sequence ──
  {
    pattern: '〜て以来 / 〜以来',
    jlptLevel: 2,
    meaning: { en: 'Since / Ever since' },
    formation: 'Verb て-form + 以来 / Noun + 以来',
    examples: [
      { japanese: '日本に来て以来、毎日日本語を話している。', reading: 'にほんにきていらい、まいにちにほんごをはなしている。', translations: { en: 'Ever since coming to Japan, I speak Japanese every day.' } },
      { japanese: '卒業以来、彼とは会っていない。', reading: 'そつぎょういらい、かれとはあっていない。', translations: { en: 'I haven\'t seen him since graduation.' } },
    ],
    notes: 'Indicates a continuous state from a past point.',
  },
  {
    pattern: '〜たとたん(に)',
    jlptLevel: 2,
    meaning: { en: 'Just as / The moment that' },
    formation: 'Verb た-form + とたん(に)',
    examples: [
      { japanese: '外に出たとたん、雨が降り始めた。', reading: 'そとにでたとたん、あめがふりはじめた。', translations: { en: 'The moment I went outside, it started raining.' } },
      { japanese: '目を閉じたとたんに、眠ってしまった。', reading: 'めをとじたとたんに、ねむってしまった。', translations: { en: 'The moment I closed my eyes, I fell asleep.' } },
    ],
    notes: 'Immediate and usually unexpected consequence.',
  },
  {
    pattern: '〜末に / 〜の末',
    jlptLevel: 2,
    meaning: { en: 'After (long deliberation/effort)' },
    formation: 'Verb た-form + 末に / Noun + の末',
    examples: [
      { japanese: '長い話し合いの末、合意に達した。', reading: 'ながいはなしあいのすえ、ごういにたっした。', translations: { en: 'After long discussions, they reached an agreement.' } },
      { japanese: '悩んだ末に、転職を決めた。', reading: 'なやんだすえに、てんしょくをきめた。', translations: { en: 'After much deliberation, I decided to change jobs.' } },
    ],
    notes: 'Implies the process was long and difficult.',
  },
  {
    pattern: '〜にあたって / 〜に際して',
    jlptLevel: 2,
    meaning: { en: 'On the occasion of / When undertaking' },
    formation: 'Verb dictionary form / Noun + にあたって/に際して',
    examples: [
      { japanese: '新年を迎えるにあたって、一言ご挨拶申し上げます。', reading: 'しんねんをむかえるにあたって、ひとことごあいさつもうしあげます。', translations: { en: 'On the occasion of the new year, I would like to say a word of greeting.' } },
      { japanese: '出発に際して、注意事項を説明します。', reading: 'しゅっぱつにさいして、ちゅういじこうをせつめいします。', translations: { en: 'On the occasion of departure, I will explain the precautions.' } },
    ],
    notes: 'Formal. Used for important events or transitions.',
  },
  {
    pattern: '〜最中に',
    jlptLevel: 2,
    meaning: { en: 'In the middle of / Right in the midst of' },
    formation: 'Verb ている + 最中に / Noun + の最中に',
    examples: [
      { japanese: '試験の最中に携帯が鳴った。', reading: 'しけんのさいちゅうにけいたいがなった。', translations: { en: 'My phone rang in the middle of the exam.' } },
      { japanese: '食事をしている最中に来客があった。', reading: 'しょくじをしているさいちゅうにらいきゃくがあった。', translations: { en: 'A visitor came while we were in the middle of eating.' } },
    ],
    notes: 'Emphasizes the inconvenience or surprise of the interruption.',
  },

  // ── Appearance & Hearsay ──
  {
    pattern: '〜気味',
    jlptLevel: 2,
    meaning: { en: 'A touch of / Slightly / -ish' },
    formation: 'Verb ます-stem / Noun + 気味',
    examples: [
      { japanese: '最近、風邪気味です。', reading: 'さいきん、かぜぎみです。', translations: { en: 'Lately, I\'ve been feeling a bit under the weather.' } },
      { japanese: '太り気味なので、運動を始めた。', reading: 'ふとりぎみなので、うんどうをはじめた。', translations: { en: 'Since I\'m a bit overweight, I started exercising.' } },
    ],
    notes: 'Softens the statement — "slightly" or "a tendency toward".',
  },
  {
    pattern: '〜かねない',
    jlptLevel: 2,
    meaning: { en: 'Might / Could possibly (negative possibility)' },
    formation: 'Verb ます-stem + かねない',
    examples: [
      { japanese: '無理をすると、病気になりかねない。', reading: 'むりをすると、びょうきになりかねない。', translations: { en: 'If you push yourself too hard, you might get sick.' } },
      { japanese: 'このままでは失敗しかねない。', reading: 'このままではしっぱいしかねない。', translations: { en: 'At this rate, it could end in failure.' } },
    ],
    notes: 'Warning about a negative potential outcome.',
  },
  {
    pattern: '〜かねる',
    jlptLevel: 2,
    meaning: { en: 'Cannot / Find it difficult to (politely refuse)' },
    formation: 'Verb ます-stem + かねる',
    examples: [
      { japanese: 'その要求にはお応えしかねます。', reading: 'そのようきゅうにはおこたえしかねます。', translations: { en: 'I am unable to comply with that request.' } },
      { japanese: '決めかねています。', reading: 'きめかねています。', translations: { en: 'I am having difficulty deciding.' } },
    ],
    notes: 'Polite refusal or expression of difficulty. Very common in business.',
  },
  {
    pattern: '〜とは限らない',
    jlptLevel: 2,
    meaning: { en: 'Not necessarily / It doesn\'t always mean' },
    formation: 'Verb/Adj plain form + とは限らない / Noun + とは限らない',
    examples: [
      { japanese: '高いものが良いとは限らない。', reading: 'たかいものがいいとはかぎらない。', translations: { en: 'Expensive things are not necessarily good.' } },
      { japanese: '成功するとは限らない。', reading: 'せいこうするとはかぎらない。', translations: { en: 'It doesn\'t necessarily mean you\'ll succeed.' } },
    ],
    notes: 'Cautions against assumptions. Common in essays.',
  },
  {
    pattern: '〜に違いない',
    jlptLevel: 2,
    meaning: { en: 'Must be / No doubt / Certainly' },
    formation: 'Verb/Adj plain form + に違いない / Noun + に違いない',
    examples: [
      { japanese: '彼は犯人に違いない。', reading: 'かれははんにんにちがいない。', translations: { en: 'He must be the culprit.' } },
      { japanese: 'この問題は難しいに違いない。', reading: 'このもんだいはむずかしいにちがいない。', translations: { en: 'This problem must certainly be difficult.' } },
    ],
    notes: 'Strong conviction based on reasoning/evidence.',
  },

  // ── Written/Formal Patterns ──
  {
    pattern: '〜に過ぎない',
    jlptLevel: 2,
    meaning: { en: 'Nothing more than / Merely' },
    formation: 'Noun + に過ぎない / Verb plain + に過ぎない',
    examples: [
      { japanese: 'それは推測に過ぎない。', reading: 'それはすいそくにすぎない。', translations: { en: 'That is nothing more than speculation.' } },
      { japanese: '彼は平社員に過ぎない。', reading: 'かれはひらしゃいんにすぎない。', translations: { en: 'He is merely an ordinary employee.' } },
    ],
    notes: 'Kanji version of にすぎない. More formal.',
  },
  {
    pattern: '〜上(は)',
    jlptLevel: 2,
    meaning: { en: 'From the standpoint of / In terms of' },
    formation: 'Noun + 上(は)',
    examples: [
      { japanese: '法律上は問題ない。', reading: 'ほうりつじょうはもんだいない。', translations: { en: 'In terms of the law, there is no problem.' } },
      { japanese: '表面上は仲が良さそうだ。', reading: 'ひょうめんじょうはなかがよさそうだ。', translations: { en: 'On the surface, they seem to get along.' } },
    ],
    notes: 'Very common in formal writing and news.',
  },
  {
    pattern: '〜にわたって',
    jlptLevel: 2,
    meaning: { en: 'Over / Spanning / Throughout' },
    formation: 'Noun + にわたって',
    examples: [
      { japanese: '3日間にわたって会議が行われた。', reading: '3にちかんにわたってかいぎがおこなわれた。', translations: { en: 'The meeting was held over a period of 3 days.' } },
      { japanese: '広い範囲にわたって被害が出た。', reading: 'ひろいはんいにわたってひがいがでた。', translations: { en: 'Damage occurred over a wide area.' } },
    ],
    notes: 'Emphasizes the extent or duration of something.',
  },
  {
    pattern: '〜を問わず',
    jlptLevel: 2,
    meaning: { en: 'Regardless of / Irrespective of' },
    formation: 'Noun + を問わず',
    examples: [
      { japanese: '経験を問わず、応募できます。', reading: 'けいけんをとわず、おうぼできます。', translations: { en: 'You can apply regardless of experience.' } },
      { japanese: '年齢を問わず参加できる。', reading: 'ねんれいをとわずさんかできる。', translations: { en: 'Anyone can participate regardless of age.' } },
    ],
    notes: 'Formal. Common in job postings and announcements.',
  },
  {
    pattern: '〜に反して',
    jlptLevel: 2,
    meaning: { en: 'Contrary to / Against / In opposition to' },
    formation: 'Noun + に反して',
    examples: [
      { japanese: '予想に反して、彼は試験に落ちた。', reading: 'よそうにはんして、かれはしけんにおちた。', translations: { en: 'Contrary to expectations, he failed the exam.' } },
      { japanese: '親の意見に反して結婚した。', reading: 'おやのいけんにはんしてけっこんした。', translations: { en: 'He married against his parents\' wishes.' } },
    ],
    notes: null,
  },
  {
    pattern: '〜をきっかけに',
    jlptLevel: 2,
    meaning: { en: 'Taking the opportunity of / Triggered by' },
    formation: 'Noun + をきっかけに(して)',
    examples: [
      { japanese: '留学をきっかけに、日本に興味を持った。', reading: 'りゅうがくをきっかけに、にほんにきょうみをもった。', translations: { en: 'Studying abroad triggered my interest in Japan.' } },
      { japanese: '結婚をきっかけに、引っ越した。', reading: 'けっこんをきっかけに、ひっこした。', translations: { en: 'I moved on the occasion of getting married.' } },
    ],
    notes: 'Describes the event that led to a significant change.',
  },
];
