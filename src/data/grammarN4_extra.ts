/**
 * N4 Grammar dataset — Part 2 (additional patterns to reach ~80 total).
 * Covers more advanced N4 patterns: ~ながら, ~てくる/いく, comparison, ~ように, numbers/counters, etc.
 */

import type { GrammarEntry } from './grammarN5';

export const GRAMMAR_N4_EXTRA: GrammarEntry[] = [
  {
    pattern: '〜ながら',
    jlptLevel: 4,
    meaning: { en: 'While doing (simultaneous actions)' },
    formation: 'Verb ます-stem + ながら + main action',
    examples: [
      { japanese: '音楽を聞きながら勉強する。', reading: 'おんがくをききながらべんきょうする。', translations: { en: 'I study while listening to music.' } },
      { japanese: '歩きながら話しましょう。', reading: 'あるきながらはなしましょう。', translations: { en: "Let's talk while walking." } },
    ],
    notes: 'The main action goes with the main verb. The ながら verb is the secondary action.',
  },
  {
    pattern: '〜てくる / 〜ていく',
    jlptLevel: 4,
    meaning: { en: 'Come to / Go on doing (change toward or away from speaker)' },
    formation: 'Verb て-form + くる/いく',
    examples: [
      { japanese: '雨が降ってきた。', reading: 'あめがふってきた。', translations: { en: 'It started to rain (coming toward us).' } },
      { japanese: 'これからも日本語を勉強していきたい。', reading: 'これからもにほんごをべんきょうしていきたい。', translations: { en: 'I want to continue studying Japanese from now on.' } },
    ],
    notes: '〜てくる = change approaching speaker/present. 〜ていく = change moving away/into future.',
  },
  {
    pattern: '〜てもらえませんか',
    jlptLevel: 4,
    meaning: { en: 'Could you do ~ for me? (polite request)' },
    formation: 'Verb て-form + もらえませんか',
    examples: [
      { japanese: 'ちょっと手伝ってもらえませんか。', reading: 'ちょっとてつだってもらえませんか。', translations: { en: 'Could you help me a little?' } },
      { japanese: '写真を撮ってもらえませんか。', reading: 'しゃしんをとってもらえませんか。', translations: { en: 'Could you take a picture for me?' } },
    ],
    notes: 'More polite than 〜てください. Even more polite: 〜ていただけませんか.',
  },
  {
    pattern: '〜ても',
    jlptLevel: 4,
    meaning: { en: 'Even if / Even though' },
    formation: 'Verb て-form + も / い-adj → くても / な-adj → でも / Noun + でも',
    examples: [
      { japanese: '雨が降っても、サッカーをする。', reading: 'あめがふっても、サッカーをする。', translations: { en: 'Even if it rains, I will play soccer.' } },
      { japanese: '高くても、買いたい。', reading: 'たかくても、かいたい。', translations: { en: 'Even if it is expensive, I want to buy it.' } },
    ],
    notes: 'Different from 〜のに which expresses frustration. 〜ても is more neutral/hypothetical.',
  },
  {
    pattern: '〜ところだ',
    jlptLevel: 4,
    meaning: { en: 'About to / In the middle of / Just finished' },
    formation: 'Dictionary form + ところだ (about to) / ている + ところだ (in the middle) / た + ところだ (just did)',
    examples: [
      { japanese: '今から出かけるところです。', reading: 'いまからでかけるところです。', translations: { en: 'I am about to go out.' } },
      { japanese: '今食べているところです。', reading: 'いまたべているところです。', translations: { en: 'I am in the middle of eating.' } },
      { japanese: '今帰ってきたところです。', reading: 'いまかえってきたところです。', translations: { en: 'I just got home.' } },
    ],
    notes: 'Three time frames depending on which verb form precedes ところ.',
  },
  {
    pattern: '〜ばかり',
    jlptLevel: 4,
    meaning: { en: 'Just did / Nothing but' },
    formation: 'Verb た-form + ばかり (just did) / Verb dictionary + ばかり (only does)',
    examples: [
      { japanese: '日本に来たばかりです。', reading: 'にほんにきたばかりです。', translations: { en: 'I just came to Japan.' } },
      { japanese: '彼はゲームをするばかりだ。', reading: 'かれはゲームをするばかりだ。', translations: { en: 'He does nothing but play games.' } },
    ],
    notes: 'た + ばかり = just finished. Dictionary form + ばかり = only/always does.',
  },
  {
    pattern: '〜ことができる',
    jlptLevel: 4,
    meaning: { en: 'Can / Be able to (ability)' },
    formation: 'Verb dictionary form + ことができる',
    examples: [
      { japanese: '日本語を話すことができます。', reading: 'にほんごをはなすことができます。', translations: { en: 'I can speak Japanese.' } },
      { japanese: 'ここで写真を撮ることができますか。', reading: 'ここでしゃしんをとることができますか。', translations: { en: 'Can I take photos here?' } },
    ],
    notes: 'More formal alternative to potential form. Often used in writing and announcements.',
  },
  {
    pattern: '〜ようにする',
    jlptLevel: 4,
    meaning: { en: 'To make sure to / To try to (habit)' },
    formation: 'Verb dictionary/ない form + ようにする',
    examples: [
      { japanese: '毎日野菜を食べるようにしている。', reading: 'まいにちやさいをたべるようにしている。', translations: { en: 'I make sure to eat vegetables every day.' } },
      { japanese: '遅刻しないようにしてください。', reading: 'ちこくしないようにしてください。', translations: { en: 'Please make sure not to be late.' } },
    ],
    notes: 'Implies making a conscious effort to form a habit.',
  },
  {
    pattern: '〜ようにいう',
    jlptLevel: 4,
    meaning: { en: 'To tell someone to do something' },
    formation: 'Verb dictionary/ない form + ように言う',
    examples: [
      { japanese: '先生は学生に宿題を出すように言った。', reading: 'せんせいはがくせいにしゅくだいをだすようにいった。', translations: { en: 'The teacher told the students to submit their homework.' } },
      { japanese: '医者に走らないように言われた。', reading: 'いしゃにはしらないようにいわれた。', translations: { en: 'I was told by the doctor not to run.' } },
    ],
    notes: 'Used for indirect commands or instructions.',
  },
  {
    pattern: '〜まま',
    jlptLevel: 4,
    meaning: { en: 'As it is / Leaving in a state' },
    formation: 'Verb た-form + まま / Noun + のまま',
    examples: [
      { japanese: '窓を開けたまま寝てしまった。', reading: 'まどをあけたままねてしまった。', translations: { en: 'I fell asleep with the window open.' } },
      { japanese: '靴のまま家に入らないでください。', reading: 'くつのままいえにはいらないでください。', translations: { en: 'Please do not enter the house with your shoes on.' } },
    ],
    notes: 'Implies something remains unchanged, often when it should have been changed.',
  },
  {
    pattern: '〜はずがない',
    jlptLevel: 4,
    meaning: { en: 'Cannot be / There is no way that' },
    formation: 'Plain form + はずがない / Noun + のはずがない',
    examples: [
      { japanese: 'そんなはずがない。', reading: 'そんなはずがない。', translations: { en: 'That cannot be.' } },
      { japanese: '彼がうそをつくはずがない。', reading: 'かれがうそをつくはずがない。', translations: { en: 'There is no way he would lie.' } },
    ],
    notes: 'Strong denial of possibility. Contrast with 〜はずだ (expectation).',
  },
  {
    pattern: '〜ことにしている',
    jlptLevel: 4,
    meaning: { en: 'Make it a rule to / Have decided to (habitual)' },
    formation: 'Verb dictionary/ない form + ことにしている',
    examples: [
      { japanese: '毎朝ジョギングすることにしている。', reading: 'まいあさジョギングすることにしている。', translations: { en: 'I make it a rule to jog every morning.' } },
      { japanese: '夜10時以降はスマホを見ないことにしている。', reading: 'よる10じいこうはスマホをみないことにしている。', translations: { en: 'I have a rule not to look at my phone after 10 PM.' } },
    ],
    notes: '〜ことにする (one-time decision) vs 〜ことにしている (ongoing habit/rule).',
  },
  {
    pattern: '〜ことになっている',
    jlptLevel: 4,
    meaning: { en: 'It is decided/expected that / The rule is' },
    formation: 'Verb dictionary/ない form + ことになっている',
    examples: [
      { japanese: '会議は3時に始まることになっている。', reading: 'かいぎは3じにはじまることになっている。', translations: { en: 'The meeting is supposed to start at 3.' } },
      { japanese: 'この部屋では飲食しないことになっている。', reading: 'このへやではいんしょくしないことになっている。', translations: { en: 'The rule is that eating and drinking are not allowed in this room.' } },
    ],
    notes: 'Describes established rules, customs, or scheduled arrangements.',
  },
  {
    pattern: '〜ように (purpose)',
    jlptLevel: 4,
    meaning: { en: 'So that / In order that' },
    formation: 'Verb potential/ない form + ように',
    examples: [
      { japanese: '聞こえるように大きい声で話してください。', reading: 'きこえるようにおおきいこえではなしてください。', translations: { en: 'Please speak loudly so that people can hear you.' } },
      { japanese: '忘れないようにメモした。', reading: 'わすれないようにメモした。', translations: { en: 'I took notes so that I would not forget.' } },
    ],
    notes: 'Different from ために: ように is used with non-volitional/potential verbs.',
  },
  {
    pattern: '〜最中に',
    jlptLevel: 4,
    meaning: { en: 'In the middle of' },
    formation: 'Verb ている + 最中に / Noun + の最中に',
    examples: [
      { japanese: '食事の最中に電話が来た。', reading: 'しょくじのさいちゅうにでんわがきた。', translations: { en: 'A phone call came in the middle of the meal.' } },
      { japanese: '会議をしている最中に地震があった。', reading: 'かいぎをしているさいちゅうにじしんがあった。', translations: { en: 'An earthquake occurred in the middle of the meeting.' } },
    ],
    notes: 'Emphasizes that the interruption happened at the peak of the activity.',
  },
  {
    pattern: '〜てくれてありがとう',
    jlptLevel: 4,
    meaning: { en: 'Thank you for doing ~' },
    formation: 'Verb て-form + くれて + ありがとう',
    examples: [
      { japanese: '手伝ってくれてありがとう。', reading: 'てつだってくれてありがとう。', translations: { en: 'Thank you for helping me.' } },
      { japanese: '来てくれてありがとうございます。', reading: 'きてくれてありがとうございます。', translations: { en: 'Thank you for coming.' } },
    ],
    notes: 'Natural way to express gratitude for a specific action someone did for you.',
  },
  {
    pattern: '〜かどうか',
    jlptLevel: 4,
    meaning: { en: 'Whether or not' },
    formation: 'Plain form + かどうか',
    examples: [
      { japanese: '明日雨が降るかどうか分からない。', reading: 'あしたあめがふるかどうかわからない。', translations: { en: "I don't know whether or not it will rain tomorrow." } },
      { japanese: '彼が来るかどうか聞いてください。', reading: 'かれがくるかどうかきいてください。', translations: { en: 'Please ask whether or not he is coming.' } },
    ],
    notes: 'Used for embedded yes/no questions. Contrast with 〜か (embedded wh-questions).',
  },
  {
    pattern: '〜ようだ / 〜らしい / 〜そうだ comparison',
    jlptLevel: 4,
    meaning: { en: 'Comparison of three "seems" expressions' },
    formation: 'ようだ (personal inference) / らしい (hearsay inference) / そうだ (appearance)',
    examples: [
      { japanese: '彼は忙しいようだ。(I can see signs)', reading: 'かれはいそがしいようだ。', translations: { en: 'He seems busy. (based on what I observe)' } },
      { japanese: '彼は忙しいらしい。(I heard)', reading: 'かれはいそがしいらしい。', translations: { en: 'He seems busy. (based on what I heard)' } },
      { japanese: '彼は忙しそうだ。(He looks)', reading: 'かれはいそがしそうだ。', translations: { en: 'He looks busy. (from his appearance)' } },
    ],
    notes: 'ようだ = inference from evidence. らしい = inference from hearsay. そうだ (stem+) = visual impression.',
  },
  {
    pattern: '〜間に / 〜間',
    jlptLevel: 4,
    meaning: { en: 'During / While (specific time frame)' },
    formation: 'Verb ている + 間/間に / Noun + の間/間に',
    examples: [
      { japanese: '寝ている間に雪が降った。', reading: 'ねているあいだにゆきがふった。', translations: { en: 'Snow fell while I was sleeping.' } },
      { japanese: '夏休みの間、日本に行きます。', reading: 'なつやすみのあいだ、にほんにいきます。', translations: { en: 'I will go to Japan during summer vacation.' } },
    ],
    notes: '間に = something happened at a point during that time. 間 = throughout the entire duration.',
  },
  {
    pattern: '〜てから',
    jlptLevel: 4,
    meaning: { en: 'After doing ~' },
    formation: 'Verb て-form + から',
    examples: [
      { japanese: '手を洗ってから食べてください。', reading: 'てをあらってからたべてください。', translations: { en: 'Please eat after washing your hands.' } },
      { japanese: '日本に来てから3年になる。', reading: 'にほんにきてから3ねんになる。', translations: { en: "It has been 3 years since I came to Japan." } },
    ],
    notes: 'Emphasizes the order: A must happen before B.',
  },
];
