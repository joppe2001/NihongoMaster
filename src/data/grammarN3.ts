/**
 * N3 Grammar dataset — 75 essential patterns for JLPT N3 level.
 * Covers advanced conjunctions, cause/reason, contrast, formality, nominalizers, etc.
 */

import type { GrammarEntry } from './grammarN5';

export const GRAMMAR_N3: GrammarEntry[] = [
  // ── Cause & Reason ──
  {
    pattern: '〜ために (cause)',
    jlptLevel: 3,
    meaning: { en: 'Because of / Due to (cause, often negative)' },
    formation: 'Verb た-form / Noun + のために',
    examples: [
      { japanese: '台風のために、電車が止まった。', reading: 'たいふうのために、でんしゃがとまった。', translations: { en: 'The train stopped due to the typhoon.' } },
      { japanese: '事故があったために、道が混んでいる。', reading: 'じこがあったために、みちがこんでいる。', translations: { en: 'The road is congested because there was an accident.' } },
    ],
    notes: 'Causal ために uses た-form or noun+の. Different from purpose ために (dictionary form).',
  },
  {
    pattern: '〜おかげで / 〜せいで',
    jlptLevel: 3,
    meaning: { en: 'Thanks to (positive) / Because of (negative)' },
    formation: 'Verb/Adj plain form + おかげで/せいで / Noun + のおかげで/のせいで',
    examples: [
      { japanese: '先生のおかげで、試験に受かりました。', reading: 'せんせいのおかげで、しけんにうかりました。', translations: { en: 'Thanks to the teacher, I passed the exam.' } },
      { japanese: '雨のせいで、試合が中止になった。', reading: 'あめのせいで、しあいがちゅうしになった。', translations: { en: 'Because of the rain, the game was cancelled.' } },
    ],
    notes: 'おかげで = positive outcome. せいで = negative outcome (blame).',
  },
  {
    pattern: '〜によって / 〜により',
    jlptLevel: 3,
    meaning: { en: 'By means of / Depending on / Due to' },
    formation: 'Noun + によって/により',
    examples: [
      { japanese: 'この小説は夏目漱石によって書かれた。', reading: 'このしょうせつはなつめそうせきによってかかれた。', translations: { en: 'This novel was written by Natsume Soseki.' } },
      { japanese: '国によって文化が違う。', reading: 'くにによってぶんかがちがう。', translations: { en: 'Culture differs depending on the country.' } },
    ],
    notes: 'Three uses: agent in passive, means, and "depending on".',
  },
  {
    pattern: '〜として',
    jlptLevel: 3,
    meaning: { en: 'As / In the capacity of' },
    formation: 'Noun + として',
    examples: [
      { japanese: '留学生として日本に来ました。', reading: 'りゅうがくせいとしてにほんにきました。', translations: { en: 'I came to Japan as an exchange student.' } },
      { japanese: 'この問題は例外として扱う。', reading: 'このもんだいはれいがいとしてあつかう。', translations: { en: 'We will treat this problem as an exception.' } },
    ],
    notes: null,
  },
  {
    pattern: '〜に対して',
    jlptLevel: 3,
    meaning: { en: 'Toward / Against / In contrast to' },
    formation: 'Noun + に対して',
    examples: [
      { japanese: '彼は部下に対して厳しい。', reading: 'かれはぶかにたいしてきびしい。', translations: { en: 'He is strict toward his subordinates.' } },
      { japanese: '男性が60%なのに対して、女性は40%だ。', reading: 'だんせいが60%なのにたいして、じょせいは40%だ。', translations: { en: 'Men are 60%, whereas women are 40%.' } },
    ],
    notes: 'Used for direction of action AND for contrast/comparison.',
  },

  // ── Contrast & Concession ──
  {
    pattern: '〜一方で',
    jlptLevel: 3,
    meaning: { en: 'On the other hand / While' },
    formation: 'Verb dictionary/た-form + 一方で / い-adj + 一方で / な-adj + な一方で',
    examples: [
      { japanese: '都市部は便利な一方で、自然が少ない。', reading: 'としぶはべんりないっぽうで、しぜんがすくない。', translations: { en: 'Cities are convenient, while on the other hand, there is little nature.' } },
      { japanese: '彼は仕事ができる一方で、人付き合いが苦手だ。', reading: 'かれはしごとができるいっぽうで、ひとづきあいがにがてだ。', translations: { en: 'He is good at work, while on the other hand, he is bad at socializing.' } },
    ],
    notes: 'Presents two contrasting aspects of the same subject.',
  },
  {
    pattern: '〜にもかかわらず',
    jlptLevel: 3,
    meaning: { en: 'Despite / In spite of / Nevertheless' },
    formation: 'Verb/Adj plain form + にもかかわらず / Noun + にもかかわらず',
    examples: [
      { japanese: '努力したにもかかわらず、不合格だった。', reading: 'どりょくしたにもかかわらず、ふごうかくだった。', translations: { en: 'Despite making an effort, I failed.' } },
      { japanese: '雨にもかかわらず、大勢の人が来た。', reading: 'あめにもかかわらず、おおぜいのひとがきた。', translations: { en: 'Despite the rain, many people came.' } },
    ],
    notes: 'Formal version of のに. Written/formal contexts.',
  },
  {
    pattern: '〜くせに',
    jlptLevel: 3,
    meaning: { en: 'Even though / Despite (critical/negative nuance)' },
    formation: 'Verb/Adj plain form + くせに / Noun + のくせに',
    examples: [
      { japanese: '知らないくせに、知ったかぶりをする。', reading: 'しらないくせに、しったかぶりをする。', translations: { en: 'Even though he doesn\'t know, he pretends he does.' } },
      { japanese: '子供のくせに生意気だ。', reading: 'こどものくせになまいきだ。', translations: { en: 'He\'s cheeky despite being just a kid.' } },
    ],
    notes: 'Expresses criticism or complaint. Negative connotation.',
  },
  {
    pattern: '〜わりに',
    jlptLevel: 3,
    meaning: { en: 'For / Considering / Despite (unexpected result)' },
    formation: 'Verb/Adj plain form + わりに / Noun + のわりに',
    examples: [
      { japanese: 'このレストランは安いわりにおいしい。', reading: 'このレストランはやすいわりにおいしい。', translations: { en: 'This restaurant is delicious for its price.' } },
      { japanese: '年齢のわりに若く見える。', reading: 'ねんれいのわりにわかくみえる。', translations: { en: 'She looks young for her age.' } },
    ],
    notes: 'The result is unexpected given the initial condition.',
  },
  {
    pattern: '〜ものの',
    jlptLevel: 3,
    meaning: { en: 'Although / Even though (formal)' },
    formation: 'Verb/Adj plain form + ものの',
    examples: [
      { japanese: '買ったものの、一度も使っていない。', reading: 'かったものの、いちどもつかっていない。', translations: { en: 'Although I bought it, I haven\'t used it even once.' } },
      { japanese: '日本語は難しいものの、面白い。', reading: 'にほんごはむずかしいものの、おもしろい。', translations: { en: 'Although Japanese is difficult, it\'s interesting.' } },
    ],
    notes: 'More formal/written than けど/のに.',
  },

  // ── Tendency & Frequency ──
  {
    pattern: '〜がちだ',
    jlptLevel: 3,
    meaning: { en: 'Tend to / Prone to (usually negative)' },
    formation: 'Verb ます-stem + がちだ / Noun + がちだ',
    examples: [
      { japanese: '最近、忘れがちだ。', reading: 'さいきん、わすれがちだ。', translations: { en: 'Lately I tend to forget things.' } },
      { japanese: '冬は風邪を引きがちだ。', reading: 'ふゆはかぜをひきがちだ。', translations: { en: 'In winter, one tends to catch colds.' } },
    ],
    notes: 'Usually implies a negative tendency. Conjugates like a な-adjective.',
  },
  {
    pattern: '〜っぽい',
    jlptLevel: 3,
    meaning: { en: '-ish / Tends to / Looks like' },
    formation: 'Verb ます-stem + っぽい / Noun + っぽい / い-adj stem + っぽい',
    examples: [
      { japanese: '彼は怒りっぽい。', reading: 'かれはおこりっぽい。', translations: { en: 'He gets angry easily.' } },
      { japanese: '今日は夏っぽい天気だ。', reading: 'きょうはなつっぽいてんきだ。', translations: { en: 'The weather today is summer-ish.' } },
    ],
    notes: 'Casual. Can express tendency, resemblance, or appearance.',
  },
  {
    pattern: '〜たびに',
    jlptLevel: 3,
    meaning: { en: 'Every time / Whenever' },
    formation: 'Verb dictionary form + たびに / Noun + のたびに',
    examples: [
      { japanese: '日本に行くたびに、新しい発見がある。', reading: 'にほんにいくたびに、あたらしいはっけんがある。', translations: { en: 'Every time I go to Japan, there are new discoveries.' } },
      { japanese: '旅行のたびにお土産を買う。', reading: 'りょこうのたびにおみやげをかう。', translations: { en: 'Every time I travel, I buy souvenirs.' } },
    ],
    notes: null,
  },
  {
    pattern: '〜ことから',
    jlptLevel: 3,
    meaning: { en: 'From the fact that / Because (reason for naming/explanation)' },
    formation: 'Verb/Adj plain form + ことから / Noun + であることから',
    examples: [
      { japanese: '形が星に似ていることから、「星形」と呼ばれている。', reading: 'かたちがほしににていることから、「ほしがた」とよばれている。', translations: { en: 'From the fact that its shape resembles a star, it is called "star-shaped".' } },
      { japanese: '犯罪が多いことから、この地域は危険とされている。', reading: 'はんざいがおおいことから、このちいきはきけんとされている。', translations: { en: 'Due to the high crime rate, this area is considered dangerous.' } },
    ],
    notes: 'Often used for explanations, origins of names, or reasons behind judgments.',
  },
  {
    pattern: '〜ことなく',
    jlptLevel: 3,
    meaning: { en: 'Without doing' },
    formation: 'Verb dictionary form + ことなく',
    examples: [
      { japanese: '休むことなく働き続けた。', reading: 'やすむことなくはたらきつづけた。', translations: { en: 'I continued working without resting.' } },
      { japanese: '諦めることなく挑戦した。', reading: 'あきらめることなくちょうせんした。', translations: { en: 'I challenged myself without giving up.' } },
    ],
    notes: 'More formal than 〜ないで. Common in written Japanese.',
  },

  // ── Degree & Extent ──
  {
    pattern: '〜ほど〜ない',
    jlptLevel: 3,
    meaning: { en: 'Not as ~ as' },
    formation: 'Noun + ほど + Adj/Verb negative',
    examples: [
      { japanese: '東京ほど人が多くない。', reading: 'とうきょうほどひとがおおくない。', translations: { en: 'It\'s not as crowded as Tokyo.' } },
      { japanese: '思ったほど難しくなかった。', reading: 'おもったほどむずかしくなかった。', translations: { en: 'It wasn\'t as difficult as I thought.' } },
    ],
    notes: null,
  },
  {
    pattern: '〜ば〜ほど',
    jlptLevel: 3,
    meaning: { en: 'The more ~ the more ~' },
    formation: 'Verb ば-form + Verb dictionary form + ほど',
    examples: [
      { japanese: '勉強すればするほど、日本語が上手になる。', reading: 'べんきょうすればするほど、にほんごがじょうずになる。', translations: { en: 'The more you study, the better your Japanese gets.' } },
      { japanese: '考えれば考えるほど、分からなくなる。', reading: 'かんがえればかんがえるほど、わからなくなる。', translations: { en: 'The more I think, the less I understand.' } },
    ],
    notes: 'Creates a proportional relationship between two actions.',
  },
  {
    pattern: '〜向き / 〜向け',
    jlptLevel: 3,
    meaning: { en: 'Suitable for / Aimed at' },
    formation: 'Noun + 向き (suitable) / Noun + 向け (targeted at)',
    examples: [
      { japanese: 'この本は初心者向きです。', reading: 'このほんはしょしんしゃむきです。', translations: { en: 'This book is suitable for beginners.' } },
      { japanese: '子供向けの番組', reading: 'こどもむけのばんぐみ', translations: { en: 'A program aimed at children.' } },
    ],
    notes: '向き = naturally suitable. 向け = intentionally designed/targeted.',
  },

  // ── Conjunctions & Transition ──
  {
    pattern: '〜上で',
    jlptLevel: 3,
    meaning: { en: 'After doing / In (the process of) / For the purpose of' },
    formation: 'Verb た-form + 上で / Noun + の上で',
    examples: [
      { japanese: 'よく考えた上で、決めてください。', reading: 'よくかんがえたうえで、きめてください。', translations: { en: 'Please decide after thinking it over carefully.' } },
      { japanese: '仕事の上で大切なことは何ですか。', reading: 'しごとのうえでたいせつなことはなんですか。', translations: { en: 'What is important in work?' } },
    ],
    notes: 'た-form + 上で = "after doing thoroughly". Noun + の上で = "in the context of".',
  },
  {
    pattern: '〜うちに',
    jlptLevel: 3,
    meaning: { en: 'While / Before (a state changes)' },
    formation: 'Verb dictionary/ない-form + うちに / い-adj + うちに / Noun + のうちに',
    examples: [
      { japanese: '若いうちに、いろいろな経験をしたい。', reading: 'わかいうちに、いろいろなけいけんをしたい。', translations: { en: 'I want to have various experiences while I\'m young.' } },
      { japanese: '忘れないうちにメモしておこう。', reading: 'わすれないうちにメモしておこう。', translations: { en: 'Let me take notes before I forget.' } },
    ],
    notes: 'Implies urgency — do it before the opportunity/state passes.',
  },
  {
    pattern: '〜次第',
    jlptLevel: 3,
    meaning: { en: 'As soon as / Depending on' },
    formation: 'Verb ます-stem + 次第 (as soon as) / Noun + 次第 (depending on)',
    examples: [
      { japanese: '届き次第、連絡します。', reading: 'とどきしだい、れんらくします。', translations: { en: 'I will contact you as soon as it arrives.' } },
      { japanese: '結果は努力次第だ。', reading: 'けっかはどりょくしだいだ。', translations: { en: 'The result depends on your effort.' } },
    ],
    notes: 'ます-stem + 次第 = immediately after. Noun + 次第 = depends on.',
  },
  {
    pattern: '〜にかけて',
    jlptLevel: 3,
    meaning: { en: 'From ~ to ~ (time/space range)' },
    formation: 'Noun + から + Noun + にかけて',
    examples: [
      { japanese: '3月から4月にかけて桜が咲く。', reading: '3がつから4がつにかけてさくらがさく。', translations: { en: 'Cherry blossoms bloom from March through April.' } },
      { japanese: '関東から東北にかけて雨が降るでしょう。', reading: 'かんとうからとうほくにかけてあめがふるでしょう。', translations: { en: 'It will probably rain from Kanto through Tohoku.' } },
    ],
    notes: 'Indicates an approximate range, not a precise boundary.',
  },

  // ── Expression & Manner ──
  {
    pattern: '〜とおり / 〜どおり',
    jlptLevel: 3,
    meaning: { en: 'As / In the way that / Exactly as' },
    formation: 'Verb dictionary/た-form + とおり(に) / Noun + どおり(に)',
    examples: [
      { japanese: '説明したとおりにやってください。', reading: 'せつめいしたとおりにやってください。', translations: { en: 'Please do it as I explained.' } },
      { japanese: '予定どおりに進んでいる。', reading: 'よていどおりにすすんでいる。', translations: { en: 'Things are progressing as planned.' } },
    ],
    notes: 'とおり after verbs, どおり after nouns. に is optional.',
  },
  {
    pattern: '〜ようにする',
    jlptLevel: 3,
    meaning: { en: 'To make sure / To try to (habitual effort)' },
    formation: 'Verb dictionary/ない form + ようにする',
    examples: [
      { japanese: '毎日日本語を使うようにしている。', reading: 'まいにちにほんごをつかうようにしている。', translations: { en: 'I make sure to use Japanese every day.' } },
      { japanese: '甘いものを食べないようにしている。', reading: 'あまいものをたべないようにしている。', translations: { en: 'I try not to eat sweets.' } },
    ],
    notes: '〜ようにしている = ongoing effort (habitual).',
  },
  {
    pattern: '〜ことは〜が',
    jlptLevel: 3,
    meaning: { en: 'It\'s true that ~ but / Indeed ~ however' },
    formation: 'Verb/Adj + ことは + same Verb/Adj + が',
    examples: [
      { japanese: '食べることは食べたが、おいしくなかった。', reading: 'たべることはたべたが、おいしくなかった。', translations: { en: 'I did eat it, but it wasn\'t delicious.' } },
      { japanese: '高いことは高いが、品質がいい。', reading: 'たかいことはたかいが、ひんしつがいい。', translations: { en: 'It is indeed expensive, but the quality is good.' } },
    ],
    notes: 'Acknowledges one thing but adds a contrasting point.',
  },

  // ── Passive Constructions ──
  {
    pattern: '〜ことになっている',
    jlptLevel: 3,
    meaning: { en: 'It is the rule that / It has been arranged that' },
    formation: 'Verb dictionary/ない form + ことになっている',
    examples: [
      { japanese: 'この学校では制服を着ることになっている。', reading: 'このがっこうではせいふくをきることになっている。', translations: { en: 'At this school, it is the rule to wear uniforms.' } },
      { japanese: '毎朝8時に集合することになっている。', reading: 'まいあさ8じにしゅうごうすることになっている。', translations: { en: 'It is arranged that we assemble at 8 every morning.' } },
    ],
    notes: 'Describes established customs, rules, or arrangements.',
  },
  {
    pattern: '〜ということだ',
    jlptLevel: 3,
    meaning: { en: 'I heard that / It means that' },
    formation: 'Plain form + ということだ',
    examples: [
      { japanese: '来月から値上げするということだ。', reading: 'らいげつからねあげするということだ。', translations: { en: 'I heard that prices will go up from next month.' } },
      { japanese: 'つまり、彼は来ないということですね。', reading: 'つまり、かれはこないということですね。', translations: { en: 'In other words, it means he\'s not coming, right?' } },
    ],
    notes: 'Two uses: reported speech (hearsay) and drawing conclusions.',
  },
  {
    pattern: '〜と言われている',
    jlptLevel: 3,
    meaning: { en: 'It is said that' },
    formation: 'Plain form + と言われている',
    examples: [
      { japanese: '日本語は難しいと言われている。', reading: 'にほんごはむずかしいといわれている。', translations: { en: 'It is said that Japanese is difficult.' } },
      { japanese: '早起きは健康にいいと言われている。', reading: 'はやおきはけんこうにいいといわれている。', translations: { en: 'It is said that waking up early is good for health.' } },
    ],
    notes: 'Common in academic/news writing. General belief or common knowledge.',
  },

  // ── Purpose & Result ──
  {
    pattern: '〜ように (purpose)',
    jlptLevel: 3,
    meaning: { en: 'So that / In order to (with non-volitional verbs)' },
    formation: 'Potential/ない form + ように',
    examples: [
      { japanese: '忘れないように、手帳に書いた。', reading: 'わすれないように、てちょうにかいた。', translations: { en: 'I wrote it in my notebook so I wouldn\'t forget.' } },
      { japanese: '子供にも分かるように説明した。', reading: 'こどもにもわかるようにせつめいした。', translations: { en: 'I explained it so that even children could understand.' } },
    ],
    notes: 'Used with potential or intransitive verbs. For volitional verbs, use ために.',
  },
  {
    pattern: '〜ようとする',
    jlptLevel: 3,
    meaning: { en: 'Try to / Be about to' },
    formation: 'Verb volitional form + とする',
    examples: [
      { japanese: '立ち上がろうとしたが、足が痛かった。', reading: 'たちあがろうとしたが、あしがいたかった。', translations: { en: 'I tried to stand up, but my legs hurt.' } },
      { japanese: '出かけようとした時、電話が鳴った。', reading: 'でかけようとしたとき、でんわがなった。', translations: { en: 'Just as I was about to leave, the phone rang.' } },
    ],
    notes: 'Past tense (〜ようとした) = attempted but may not have succeeded.',
  },
  {
    pattern: '〜結果',
    jlptLevel: 3,
    meaning: { en: 'As a result of' },
    formation: 'Verb た-form / Noun + の + 結果',
    examples: [
      { japanese: '調査した結果、問題が見つかった。', reading: 'ちょうさしたけっか、もんだいがみつかった。', translations: { en: 'As a result of the investigation, a problem was found.' } },
      { japanese: '話し合いの結果、合意に達した。', reading: 'はなしあいのけっか、ごういにたっした。', translations: { en: 'As a result of the discussion, they reached an agreement.' } },
    ],
    notes: 'Common in formal/academic writing.',
  },

  // ── Limitation & Scope ──
  {
    pattern: '〜に限る',
    jlptLevel: 3,
    meaning: { en: 'Nothing beats / Is limited to' },
    formation: 'Noun + に限る / Verb dictionary form + に限る',
    examples: [
      { japanese: '夏はビールに限る。', reading: 'なつはビールにかぎる。', translations: { en: 'Nothing beats beer in summer.' } },
      { japanese: '参加は学生に限ります。', reading: 'さんかはがくせいにかぎります。', translations: { en: 'Participation is limited to students.' } },
    ],
    notes: 'Two uses: "X is the best" (colloquial) and "limited to X" (formal).',
  },
  {
    pattern: '〜に限らず',
    jlptLevel: 3,
    meaning: { en: 'Not limited to / Not only' },
    formation: 'Noun + に限らず',
    examples: [
      { japanese: '日本に限らず、アジアの国々は箸を使う。', reading: 'にほんにかぎらず、アジアのくにぐにははしをつかう。', translations: { en: 'Not limited to Japan, Asian countries use chopsticks.' } },
      { japanese: '男性に限らず、女性も参加できる。', reading: 'だんせいにかぎらず、じょせいもさんかできる。', translations: { en: 'Not only men, but women can also participate.' } },
    ],
    notes: null,
  },
  {
    pattern: '〜しかない',
    jlptLevel: 3,
    meaning: { en: 'Have no choice but to / Can only' },
    formation: 'Verb dictionary form + しかない',
    examples: [
      { japanese: '自分でやるしかない。', reading: 'じぶんでやるしかない。', translations: { en: 'I have no choice but to do it myself.' } },
      { japanese: '歩いて行くしかない。', reading: 'あるいていくしかない。', translations: { en: 'We can only walk there.' } },
    ],
    notes: 'Stronger than 〜しか〜ない. Expresses resignation or determination.',
  },
  {
    pattern: '〜わけがない',
    jlptLevel: 3,
    meaning: { en: 'There is no way that / It is impossible that' },
    formation: 'Verb/Adj plain form + わけがない',
    examples: [
      { japanese: 'そんなことがあるわけがない。', reading: 'そんなことがあるわけがない。', translations: { en: 'There\'s no way that could happen.' } },
      { japanese: '彼が犯人のわけがない。', reading: 'かれがはんにんのわけがない。', translations: { en: 'There\'s no way he is the culprit.' } },
    ],
    notes: 'Very strong denial. More emphatic than はずがない.',
  },
  {
    pattern: '〜わけにはいかない',
    jlptLevel: 3,
    meaning: { en: 'Cannot (due to social/moral reasons)' },
    formation: 'Verb dictionary form + わけにはいかない',
    examples: [
      { japanese: '約束したから、行かないわけにはいかない。', reading: 'やくそくしたから、いかないわけにはいかない。', translations: { en: 'Since I promised, I can\'t not go.' } },
      { japanese: 'まだ仕事が残っているので、帰るわけにはいかない。', reading: 'まだしごとがのこっているので、かえるわけにはいかない。', translations: { en: 'Since there\'s still work left, I can\'t just go home.' } },
    ],
    notes: 'The reason is social obligation, not physical inability.',
  },

  // ── Nominalizers & Formal ──
  {
    pattern: '〜ことに',
    jlptLevel: 3,
    meaning: { en: 'To my (surprise/joy/sadness)' },
    formation: 'Adj/Verb + ことに',
    examples: [
      { japanese: '驚いたことに、彼はもう結婚していた。', reading: 'おどろいたことに、かれはもうけっこんしていた。', translations: { en: 'To my surprise, he was already married.' } },
      { japanese: '嬉しいことに、合格した。', reading: 'うれしいことに、ごうかくした。', translations: { en: 'To my joy, I passed.' } },
    ],
    notes: 'Sets up the speaker\'s emotional reaction before the main clause.',
  },
  {
    pattern: '〜ものだ (emotion/memory)',
    jlptLevel: 3,
    meaning: { en: 'Used to / How ~ / It\'s natural that' },
    formation: 'Verb た-form + ものだ (memory) / Verb dictionary form + ものだ (general truth)',
    examples: [
      { japanese: '子供の頃、よくこの川で遊んだものだ。', reading: 'こどものころ、よくこのかわであそんだものだ。', translations: { en: 'I used to play at this river as a child.' } },
      { japanese: '時間が経つのは早いものだ。', reading: 'じかんがたつのははやいものだ。', translations: { en: 'How fast time passes.' } },
    ],
    notes: 'た-form = nostalgic memories. Dictionary form = exclamation about natural truths.',
  },
  {
    pattern: '〜ものだから',
    jlptLevel: 3,
    meaning: { en: 'Because (excuse/justification)' },
    formation: 'Verb/Adj plain form + ものだから',
    examples: [
      { japanese: '道が混んでいたものだから、遅れてしまいました。', reading: 'みちがこんでいたものだから、おくれてしまいました。', translations: { en: 'Because the road was congested, I ended up being late.' } },
      { japanese: '急いでいたものだから、忘れ物をしてしまった。', reading: 'いそいでいたものだから、わすれものをしてしまった。', translations: { en: 'Because I was in a hurry, I forgot something.' } },
    ],
    notes: 'Used to explain/justify one\'s actions. Has an apologetic tone.',
  },

  // ── Miscellaneous Important N3 Patterns ──
  {
    pattern: '〜ついでに',
    jlptLevel: 3,
    meaning: { en: 'While you\'re at it / On the occasion of' },
    formation: 'Verb た-form/dictionary form + ついでに / Noun + のついでに',
    examples: [
      { japanese: '買い物のついでに、郵便局に寄った。', reading: 'かいもののついでに、ゆうびんきょくによった。', translations: { en: 'On the way to shopping, I stopped by the post office.' } },
      { japanese: '出かけたついでに、本を返してきた。', reading: 'でかけたついでに、ほんをかえしてきた。', translations: { en: 'While I was out, I returned the book.' } },
    ],
    notes: 'The secondary action is done conveniently while doing the primary action.',
  },
  {
    pattern: '〜に関して / 〜に関する',
    jlptLevel: 3,
    meaning: { en: 'Regarding / Concerning / About' },
    formation: 'Noun + に関して (sentence) / Noun + に関する + Noun (modifier)',
    examples: [
      { japanese: 'この問題に関して、意見を述べたい。', reading: 'このもんだいにかんして、いけんをのべたい。', translations: { en: 'I would like to express my opinion regarding this problem.' } },
      { japanese: '環境に関する調査', reading: 'かんきょうにかんするちょうさ', translations: { en: 'A survey concerning the environment' } },
    ],
    notes: 'More formal than について. Common in academic/business contexts.',
  },
  {
    pattern: '〜において / 〜における',
    jlptLevel: 3,
    meaning: { en: 'In / At (formal location/context)' },
    formation: 'Noun + において (predicate) / Noun + における + Noun (modifier)',
    examples: [
      { japanese: '会議は東京において行われた。', reading: 'かいぎはとうきょうにおいておこなわれた。', translations: { en: 'The meeting was held in Tokyo.' } },
      { japanese: '日本における教育制度', reading: 'にほんにおけるきょういくせいど', translations: { en: 'The education system in Japan' } },
    ],
    notes: 'Formal/written equivalent of で. Common in academic papers and news.',
  },
  {
    pattern: '〜をはじめ',
    jlptLevel: 3,
    meaning: { en: 'Starting with / Including' },
    formation: 'Noun + をはじめ(として)',
    examples: [
      { japanese: '日本をはじめ、多くのアジアの国がこの問題に取り組んでいる。', reading: 'にほんをはじめ、おおくのアジアのくにがこのもんだいにとりくんでいる。', translations: { en: 'Starting with Japan, many Asian countries are tackling this problem.' } },
      { japanese: '社長をはじめ、全社員が参加した。', reading: 'しゃちょうをはじめ、ぜんしゃいんがさんかした。', translations: { en: 'Starting with the company president, all employees participated.' } },
    ],
    notes: 'Lists a representative example before mentioning others.',
  },
  {
    pattern: '〜を中心に',
    jlptLevel: 3,
    meaning: { en: 'Centered around / Focusing on' },
    formation: 'Noun + を中心に(して)',
    examples: [
      { japanese: '東京を中心に発展した。', reading: 'とうきょうをちゅうしんにはってんした。', translations: { en: 'It developed centered around Tokyo.' } },
      { japanese: '文法を中心に勉強している。', reading: 'ぶんぽうをちゅうしんにべんきょうしている。', translations: { en: 'I am studying with a focus on grammar.' } },
    ],
    notes: null,
  },
  {
    pattern: '〜を通じて / 〜を通して',
    jlptLevel: 3,
    meaning: { en: 'Through / Throughout / By means of' },
    formation: 'Noun + を通じて/を通して',
    examples: [
      { japanese: 'インターネットを通じて情報を得る。', reading: 'インターネットをつうじてじょうほうをえる。', translations: { en: 'I obtain information through the internet.' } },
      { japanese: '一年を通して暖かい気候だ。', reading: 'いちねんをとおしてあたたかいきこうだ。', translations: { en: 'The climate is warm throughout the year.' } },
    ],
    notes: 'を通じて = by means of. を通して = throughout (time/space).',
  },
  {
    pattern: '〜からすると / 〜から見ると',
    jlptLevel: 3,
    meaning: { en: 'From the perspective of / Judging from' },
    formation: 'Noun + からすると/から見ると',
    examples: [
      { japanese: '外国人から見ると、日本の文化は不思議だろう。', reading: 'がいこくじんからみると、にほんのぶんかはふしぎだろう。', translations: { en: 'From a foreigner\'s perspective, Japanese culture must seem mysterious.' } },
      { japanese: '彼の態度からすると、賛成していないようだ。', reading: 'かれのたいどからすると、さんせいしていないようだ。', translations: { en: 'Judging from his attitude, he doesn\'t seem to agree.' } },
    ],
    notes: 'から見ると = viewpoint. からすると = based on evidence/clue.',
  },
  {
    pattern: '〜に伴って / 〜に伴い',
    jlptLevel: 3,
    meaning: { en: 'Along with / As ~ accompanies' },
    formation: 'Noun + に伴って / Verb dictionary form + のに伴って',
    examples: [
      { japanese: '人口の増加に伴って、住宅問題が深刻化した。', reading: 'じんこうのぞうかにともなって、じゅうたくもんだいがしんこくかした。', translations: { en: 'Along with the population increase, the housing problem became serious.' } },
      { japanese: '経済の発展に伴い、環境問題も増えた。', reading: 'けいざいのはってんにともない、かんきょうもんだいもふえた。', translations: { en: 'Accompanying economic development, environmental problems also increased.' } },
    ],
    notes: 'Formal. Describes two things that change together.',
  },
];
