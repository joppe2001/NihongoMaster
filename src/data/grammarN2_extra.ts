/**
 * N2 Grammar dataset (extra) — 120 additional advanced patterns for JLPT N2 level.
 * Covers formal written Japanese, nuanced conjunctions, literary expressions,
 * modality, and complex compound patterns. None of these duplicate grammarN2.ts.
 */

import type { GrammarEntry } from './grammarN5';

export const GRAMMAR_N2_EXTRA: GrammarEntry[] = [

  // ── Contrary / Opposition ──
  {
    pattern: '〜に反する',
    jlptLevel: 2,
    meaning: { en: 'To go against / To run contrary to' },
    formation: 'Noun + に反する (attributive) / に反した + Noun',
    examples: [
      { japanese: '規則に反する行為は許されない。', reading: 'きそくにはんするこういはゆるされない。', translations: { en: 'Conduct that goes against the rules is not permitted.' } },
      { japanese: '彼の行動は常識に反していた。', reading: 'かれのこうどうはじょうしきにはんしていた。', translations: { en: 'His behavior ran contrary to common sense.' } },
    ],
    notes: 'Attributive form of 〜に反して. Used as a noun modifier: に反する＋Noun.',
  },

  // ── Addition / Accompaniment ──
  {
    pattern: '〜に伴って / 〜に伴い',
    jlptLevel: 2,
    meaning: { en: 'Along with / As ~ increases/changes' },
    formation: 'Noun + に伴って / Verb dictionary form + に伴って',
    examples: [
      { japanese: '経済発展に伴って、生活水準が上がった。', reading: 'けいざいはってんにともなって、せいかつすいじゅんがあがった。', translations: { en: 'Along with economic development, the standard of living rose.' } },
      { japanese: '人口増加に伴い、住宅不足が深刻になった。', reading: 'じんこうぞうかにともない、じゅうたくぶそくがしんこくになった。', translations: { en: 'As the population increased, the housing shortage became serious.' } },
    ],
    notes: 'Indicates that two things change or progress together. Formal; common in news and essays.',
  },
  {
    pattern: '〜に加えて',
    jlptLevel: 2,
    meaning: { en: 'In addition to / On top of' },
    formation: 'Noun + に加えて',
    examples: [
      { japanese: '雨に加えて、強い風も吹いていた。', reading: 'あめにくわえて、つよいかぜもふいていた。', translations: { en: 'In addition to rain, strong winds were also blowing.' } },
      { japanese: '能力に加えて、経験も必要だ。', reading: 'のうりょくにくわえて、けいけんもひつようだ。', translations: { en: 'In addition to ability, experience is also necessary.' } },
    ],
    notes: 'Adds a second element on top of the first. Often used to pile up positive or negative factors.',
  },

  // ── Location / Context (Formal) ──
  {
    pattern: '〜において / 〜における',
    jlptLevel: 2,
    meaning: { en: 'In / At / On [formal context or field]' },
    formation: 'Noun + において (predicate) / Noun + における + Noun (modifier)',
    examples: [
      { japanese: '現代社会において、技術の進歩は目覚ましい。', reading: 'げんだいしゃかいにおいて、ぎじゅつのしんぽはめざましい。', translations: { en: 'In modern society, technological progress is remarkable.' } },
      { japanese: '医療における倫理問題を考える。', reading: 'いりょうにおけるりんりもんだいをかんがえる。', translations: { en: 'I think about ethical issues in medicine.' } },
    ],
    notes: 'Formal equivalent of で/での. において connects to verbs; における modifies nouns.',
  },

  // ── Taking Into Account ──
  {
    pattern: '〜を踏まえて',
    jlptLevel: 2,
    meaning: { en: 'Taking ~ into account / Based on (with full consideration of)' },
    formation: 'Noun + を踏まえて',
    examples: [
      { japanese: '前回の失敗を踏まえて、計画を見直した。', reading: 'ぜんかいのしっぱいをふまえて、けいかくをみなおした。', translations: { en: 'Taking the previous failure into account, I revised the plan.' } },
      { japanese: '現状を踏まえた上で、対策を立てる。', reading: 'げんじょうをふまえたうえで、たいさくをたてる。', translations: { en: 'After fully taking the current situation into account, I will draw up countermeasures.' } },
    ],
    notes: 'Implies carefully grounding a decision in facts or prior experience. Formal.',
  },

  // ── Trigger / Starting Point ──
  {
    pattern: '〜を契機に',
    jlptLevel: 2,
    meaning: { en: 'Taking ~ as a trigger / Using ~ as a turning point' },
    formation: 'Noun + を契機に(して) / Noun + を契機として',
    examples: [
      { japanese: '震災を契機に、防災意識が高まった。', reading: 'しんさいをけいきに、ぼうさいいしきがたかまった。', translations: { en: 'Using the earthquake as a turning point, disaster-preparedness awareness increased.' } },
      { japanese: '引退を契機として、新たな事業を始めた。', reading: 'いんたいをけいきとして、あらたなじぎょうをはじめた。', translations: { en: 'Taking his retirement as a trigger, he started a new business.' } },
    ],
    notes: 'Similar to をきっかけに but slightly more formal and literary.',
  },
  {
    pattern: '〜を皮切りに',
    jlptLevel: 2,
    meaning: { en: 'Starting with / Beginning with (as the first of many)' },
    formation: 'Noun + を皮切りに(して)',
    examples: [
      { japanese: '東京を皮切りに、全国ツアーが始まった。', reading: 'とうきょうをかわきりに、ぜんこくツアーがはじまった。', translations: { en: 'Starting with Tokyo, the nationwide tour began.' } },
      { japanese: '彼の発言を皮切りに、議論が白熱した。', reading: 'かれのはつげんをかわきりに、ぎろんがはくねつした。', translations: { en: 'Beginning with his remark, the debate became heated.' } },
    ],
    notes: '皮切り (かわきり) literally means "the first cut of the skin." Used for the first event in a series.',
  },

  // ── Centering / Focusing ──
  {
    pattern: '〜を中心に',
    jlptLevel: 2,
    meaning: { en: 'Centered on / Focusing on / Mainly' },
    formation: 'Noun + を中心に(して) / Noun + を中心とした + Noun',
    examples: [
      { japanese: '若者を中心に、そのブームが広まっている。', reading: 'わかものをちゅうしんに、そのブームがひろまっている。', translations: { en: 'The boom is spreading mainly among young people.' } },
      { japanese: '東京を中心とした関東地方に大雨が降った。', reading: 'とうきょうをちゅうしんとしたかんとうちほうにおおあめがふった。', translations: { en: 'Heavy rain fell in the Kanto region centered on Tokyo.' } },
    ],
    notes: 'Indicates the main focus or geographic/demographic center of an activity.',
  },

  // ── Via / Through ──
  {
    pattern: '〜を通じて / 〜を通して',
    jlptLevel: 2,
    meaning: { en: 'Through / Via / Throughout' },
    formation: 'Noun + を通じて / Noun + を通して',
    examples: [
      { japanese: '友人を通じて、その情報を知った。', reading: 'ゆうじんをつうじて、そのじょうほうをしった。', translations: { en: 'I learned that information through a friend.' } },
      { japanese: '留学を通して、視野が広がった。', reading: 'りゅうがくをとおして、しやがひろがった。', translations: { en: 'Through studying abroad, my horizons broadened.' } },
    ],
    notes: 'を通じて: via a medium/person. を通して: through an experience or the whole period.',
  },

  // ── Regardless / Irrespective ──
  {
    pattern: '〜に関わらず',
    jlptLevel: 2,
    meaning: { en: 'Regardless of / Irrespective of' },
    formation: 'Noun + に関わらず / Verb plain form + かどうかに関わらず',
    examples: [
      { japanese: '天気に関わらず、試合は行われる。', reading: 'てんきにかかわらず、しあいはおこなわれる。', translations: { en: 'The match will be held regardless of the weather.' } },
      { japanese: '経験の有無に関わらず、応募できます。', reading: 'けいけんのゆうむにかかわらず、おうぼできます。', translations: { en: 'You can apply regardless of whether you have experience.' } },
    ],
    notes: 'Interchangeable with を問わず in many contexts, but に関わらず is more commonly used for binary or condition-based contrasts.',
  },
  {
    pattern: '〜いかんによらず / 〜いかんにかかわらず',
    jlptLevel: 2,
    meaning: { en: 'Regardless of ~ / No matter what ~' },
    formation: 'Noun + のいかんによらず / Noun + のいかんにかかわらず',
    examples: [
      { japanese: '理由のいかんによらず、遅刻は許されない。', reading: 'りゆうのいかんによらず、ちこくはゆるされない。', translations: { en: 'Regardless of the reason, being late is not permitted.' } },
      { japanese: '結果のいかんにかかわらず、最善を尽くす。', reading: 'けっかのいかんにかかわらず、さいぜんをつくす。', translations: { en: 'Regardless of the outcome, I will do my best.' } },
    ],
    notes: '如何 (いかん) is a formal literary word meaning "how/what." Used in formal written Japanese.',
  },

  // ── Conditional Negation ──
  {
    pattern: '〜ないことには',
    jlptLevel: 2,
    meaning: { en: 'Unless ~ / If ~ doesn\'t happen first' },
    formation: 'Verb ない-form + ことには',
    examples: [
      { japanese: '食べてみないことには、おいしいかどうかわからない。', reading: 'たべてみないことには、おいしいかどうかわからない。', translations: { en: 'Unless you try eating it, you won\'t know if it\'s good.' } },
      { japanese: '本人が来ないことには、話が進まない。', reading: 'ほんにんがこないことには、はなしがすすまない。', translations: { en: 'Unless the person themselves comes, things won\'t move forward.' } },
    ],
    notes: 'The main clause is always negative or expresses an obstacle.',
  },
  {
    pattern: '〜ない限り',
    jlptLevel: 2,
    meaning: { en: 'Unless / As long as ~ does not' },
    formation: 'Verb ない-form + 限り',
    examples: [
      { japanese: '努力しない限り、成功はない。', reading: 'どりょくしないかぎり、せいこうはない。', translations: { en: 'Unless you make an effort, there is no success.' } },
      { japanese: '許可がない限り、入室できない。', reading: 'きょかがないかぎり、にゅうしつできない。', translations: { en: 'You cannot enter the room unless you have permission.' } },
    ],
    notes: 'Specifies the single condition whose absence blocks the main result.',
  },

  // ── Degree / Comparison ──
  {
    pattern: '〜ほど〜ない',
    jlptLevel: 2,
    meaning: { en: 'Not as ~ as / Less ~ than' },
    formation: 'Noun + ほど + Adjective ない-form',
    examples: [
      { japanese: '今日は昨日ほど暑くない。', reading: 'きょうはきのうほどあつくない。', translations: { en: 'Today is not as hot as yesterday.' } },
      { japanese: '彼は思っていたほど難しくなかった。', reading: 'かれはおもっていたほどむずかしくなかった。', translations: { en: 'He was not as difficult as I had thought.' } },
    ],
    notes: 'A + ほど + B ない = B is not as much as A. The item after ほど sets the upper limit.',
  },
  {
    pattern: '〜ほど',
    jlptLevel: 2,
    meaning: { en: 'To the extent that / The more ~ the more / So ~ that' },
    formation: 'Verb/Adj plain form + ほど + result clause',
    examples: [
      { japanese: '笑えないほど悲しい話だ。', reading: 'わらえないほどかなしいはなしだ。', translations: { en: 'It\'s such a sad story that you can\'t laugh.' } },
      { japanese: '練習すればするほど上手になる。', reading: 'れんしゅうすればするほどじょうずになる。', translations: { en: 'The more you practice, the better you become.' } },
    ],
    notes: 'すればするほど = "the more you do X." Also used to indicate an extreme degree.',
  },

  // ── Reasoning / Concession ──
  {
    pattern: '〜からといって',
    jlptLevel: 2,
    meaning: { en: 'Just because ~ (doesn\'t mean ~)' },
    formation: 'Verb/Adj plain form + からといって / Noun + だからといって',
    examples: [
      { japanese: 'お金があるからといって、幸せとは限らない。', reading: 'おかねがあるからといって、しあわせとはかぎらない。', translations: { en: 'Just because you have money doesn\'t mean you\'re happy.' } },
      { japanese: '難しいからといって、諦めてはいけない。', reading: 'むずかしいからといって、あきらめてはいけない。', translations: { en: 'Just because it\'s difficult, you shouldn\'t give up.' } },
    ],
    notes: 'The main clause typically contains a negative statement or prohibition.',
  },
  {
    pattern: '〜とはいえ',
    jlptLevel: 2,
    meaning: { en: 'Even though / Although / That said' },
    formation: 'Verb/Adj plain form + とはいえ / Noun + とはいえ',
    examples: [
      { japanese: '春とはいえ、まだ寒い日もある。', reading: 'はるとはいえ、まださむいひもある。', translations: { en: 'Even though it\'s spring, there are still cold days.' } },
      { japanese: '経験者とはいえ、ミスをすることもある。', reading: 'けいけんしゃとはいえ、ミスをすることもある。', translations: { en: 'Even though they\'re experienced, they can still make mistakes.' } },
    ],
    notes: 'Acknowledges a fact, then presents a contrasting reality. More formal than けど.',
  },
  {
    pattern: '〜とはいっても',
    jlptLevel: 2,
    meaning: { en: 'Even though that is said / That said, however' },
    formation: 'Verb/Adj plain form + とはいっても / Noun + とはいっても',
    examples: [
      { japanese: '安いとはいっても、それなりの品質はある。', reading: 'やすいとはいっても、それなりのひんしつはある。', translations: { en: 'Even though it\'s cheap, it still has its level of quality.' } },
      { japanese: '夏とはいっても、山の上は涼しい。', reading: 'なつとはいっても、やまのうえはすずしい。', translations: { en: 'Even though it\'s summer, it\'s cool up in the mountains.' } },
    ],
    notes: 'Softer than とはいえ. Often used in spoken and semi-formal language.',
  },
  {
    pattern: '〜ものの',
    jlptLevel: 2,
    meaning: { en: 'Although / Even though (but the result is ~)' },
    formation: 'Verb/Adj plain form + ものの / Noun + であるものの',
    examples: [
      { japanese: '買ったものの、まだ一度も使っていない。', reading: 'かったものの、まだいちどもつかっていない。', translations: { en: 'Although I bought it, I haven\'t used it even once.' } },
      { japanese: '試験に合格したものの、自信はなかった。', reading: 'しけんにごうかくしたものの、じしんはなかった。', translations: { en: 'Although I passed the exam, I had no confidence.' } },
    ],
    notes: 'The outcome in the main clause is often disappointing or contrary to expectation.',
  },
  {
    pattern: '〜とはいうものの',
    jlptLevel: 2,
    meaning: { en: 'Although it is said that / Be that as it may' },
    formation: 'Verb/Adj plain form + とはいうものの',
    examples: [
      { japanese: '節約が大切とはいうものの、つい使いすぎてしまう。', reading: 'せつやくがたいせつとはいうものの、ついつかいすぎてしまう。', translations: { en: 'Although it is said that saving is important, I end up spending too much.' } },
      { japanese: '時代が変わったとはいうものの、基本は同じだ。', reading: 'じだいがかわったとはいうものの、きほんはおなじだ。', translations: { en: 'Be that as it may about the times having changed, the basics are the same.' } },
    ],
    notes: 'More literary than とはいっても. Used mainly in written Japanese.',
  },

  // ── Rhetorical Questions / Assertion ──
  {
    pattern: '〜ではないか',
    jlptLevel: 2,
    meaning: { en: 'Isn\'t it ~ ? / Shouldn\'t we ~ ? (seeking agreement or proposing)' },
    formation: 'Verb/Adj plain form + ではないか',
    examples: [
      { japanese: 'これは問題ではないか。', reading: 'これはもんだいではないか。', translations: { en: 'Isn\'t this a problem?' } },
      { japanese: '今こそ行動する時ではないか。', reading: 'いまこそこうどうするときではないか。', translations: { en: 'Isn\'t now exactly the time to act?' } },
    ],
    notes: 'Used in formal speeches and essays to assert an opinion or call to action.',
  },
  {
    pattern: '〜ではないだろうか',
    jlptLevel: 2,
    meaning: { en: 'I wonder if it isn\'t ~ / Perhaps it is ~' },
    formation: 'Verb/Adj plain form + ではないだろうか',
    examples: [
      { japanese: 'これが真の問題ではないだろうか。', reading: 'これがしんのもんだいではないだろうか。', translations: { en: 'I wonder if this isn\'t the real problem.' } },
      { japanese: '教育こそが解決策ではないだろうか。', reading: 'きょういくこそがかいけつさくではないだろうか。', translations: { en: 'Perhaps education is the solution, isn\'t it?' } },
    ],
    notes: 'Softer and more tentative than ではないか. Common in essay conclusions.',
  },

  // ── Certainty / Conviction ──
  {
    pattern: '〜に相違ない',
    jlptLevel: 2,
    meaning: { en: 'There is no doubt that / It is certain that' },
    formation: 'Verb/Adj plain form + に相違ない / Noun + に相違ない',
    examples: [
      { japanese: 'この指紋は犯人のものに相違ない。', reading: 'このしもんははんにんのものにそういない。', translations: { en: 'There is no doubt that this fingerprint belongs to the culprit.' } },
      { japanese: '彼は優秀な人材に相違ない。', reading: 'かれはゆうしゅうなじんざいにそういない。', translations: { en: 'He is certainly an excellent talent.' } },
    ],
    notes: 'More formal and literary than に違いない. Common in legal and written contexts.',
  },
  {
    pattern: '〜に決まっている',
    jlptLevel: 2,
    meaning: { en: 'It\'s definitely ~ / Must certainly be' },
    formation: 'Verb/Adj plain form + に決まっている / Noun + に決まっている',
    examples: [
      { japanese: 'あんなに練習したんだから、成功に決まっている。', reading: 'あんなにれんしゅうしたんだから、せいこうにきまっている。', translations: { en: 'After practicing that much, they\'re definitely going to succeed.' } },
      { japanese: 'こんな難しい問題、彼には解けないに決まっている。', reading: 'こんなむずかしいもんだい、かれにはとけないにきまっている。', translations: { en: 'There\'s no way he can solve such a difficult problem.' } },
    ],
    notes: 'Expresses the speaker\'s strong certainty or conviction. Can sound assertive.',
  },

  // ── Necessity / Non-necessity ──
  {
    pattern: '〜ことはない',
    jlptLevel: 2,
    meaning: { en: 'No need to / There\'s no reason to' },
    formation: 'Verb dictionary form + ことはない',
    examples: [
      { japanese: 'そんなに心配することはない。', reading: 'そんなにしんぱいすることはない。', translations: { en: 'There\'s no need to worry so much.' } },
      { japanese: '謝ることはないよ。悪くないんだから。', reading: 'あやまることはないよ。わるくないんだから。', translations: { en: 'There\'s no need to apologize. It\'s not your fault.' } },
    ],
    notes: 'Advises someone not to do something unnecessarily. Softer than してはいけない.',
  },
  {
    pattern: '〜ことはある',
    jlptLevel: 2,
    meaning: { en: 'There are times when / It does happen that' },
    formation: 'Verb dictionary form + ことはある',
    examples: [
      { japanese: '彼も怒ることはある。普段は穏やかだけど。', reading: 'かれもおこることはある。ふだんはおだやかだけど。', translations: { en: 'There are times when he gets angry. He\'s usually calm though.' } },
      { japanese: '間違えることはあるが、すぐ直す。', reading: 'まちがえることはあるが、すぐなおす。', translations: { en: 'There are times I make mistakes, but I fix them right away.' } },
    ],
    notes: 'Acknowledges that an exceptional case does occur, even if infrequent.',
  },

  // ── Subjective Quality / Impression ──
  {
    pattern: '〜ものがある',
    jlptLevel: 2,
    meaning: { en: 'There is something ~ about / ~ has a certain quality' },
    formation: 'Verb/Adj plain form + ものがある',
    examples: [
      { japanese: '彼の演技には心を打つものがある。', reading: 'かれのえんぎにはこころをうつものがある。', translations: { en: 'There is something moving about his acting.' } },
      { japanese: 'その話には納得できないものがある。', reading: 'そのはなしにはなっとくできないものがある。', translations: { en: 'There is something about that story I can\'t accept.' } },
    ],
    notes: 'Expresses the speaker\'s subjective feeling or impression about a quality.',
  },
  {
    pattern: '〜というものだ',
    jlptLevel: 2,
    meaning: { en: 'That is what ~ is / It is natural / That\'s what it means to be ~' },
    formation: 'Verb/Adj plain form + というものだ / Noun + というものだ',
    examples: [
      { japanese: '失敗から学ぶことこそ、成長というものだ。', reading: 'しっぱいからまなぶことこそ、せいちょうというものだ。', translations: { en: 'Learning from failure is what growth is all about.' } },
      { japanese: '苦労もせずに成功するのは、虫がよすぎるというものだ。', reading: 'くろうもせずにせいこうするのは、むしがよすぎるというものだ。', translations: { en: 'Succeeding without effort is what you\'d call being too optimistic.' } },
    ],
    notes: 'States a general truth or value judgment. Often sounds philosophical.',
  },
  {
    pattern: '〜というものではない',
    jlptLevel: 2,
    meaning: { en: 'It\'s not necessarily true that / It\'s not always the case that' },
    formation: 'Verb/Adj plain form + というものではない',
    examples: [
      { japanese: '量が多ければいいというものではない。', reading: 'りょうがおおければいいというものではない。', translations: { en: 'It\'s not necessarily true that more is better.' } },
      { japanese: '謝ればすむというものではない。', reading: 'あやまればすむというものではない。', translations: { en: 'It\'s not simply a matter of apologizing and being done with it.' } },
    ],
    notes: 'Negates a simplistic or common assumption. Often sounds lecturing or corrective.',
  },
  {
    pattern: '〜といっても過言ではない',
    jlptLevel: 2,
    meaning: { en: 'It is no exaggeration to say ~ / One could even say ~' },
    formation: '〜といっても過言ではない',
    examples: [
      { japanese: '彼は天才といっても過言ではない。', reading: 'かれはてんさいといっても過言ではない。', translations: { en: 'It is no exaggeration to say he is a genius.' } },
      { japanese: 'これは歴史的な発見といっても過言ではないだろう。', reading: 'これはれきしてきなはっけんといっても過言ではないだろう。', translations: { en: 'One could even say this is a historic discovery.' } },
    ],
    notes: '過言 (かごん) = exaggeration. A formal way to emphasize a strong statement.',
  },

  // ── Compulsion / Strong Emotion ──
  {
    pattern: '〜を余儀なくされる',
    jlptLevel: 2,
    meaning: { en: 'Be forced to / Be compelled to (against one\'s will)' },
    formation: 'Noun + を余儀なくされる',
    examples: [
      { japanese: '悪天候により、イベントの中止を余儀なくされた。', reading: 'あくてんこうにより、イベントのちゅうしをよぎなくされた。', translations: { en: 'Due to bad weather, we were forced to cancel the event.' } },
      { japanese: '経営難で、多くの社員が退職を余儀なくされた。', reading: 'けいえいなんで、おおくのしゃいんがたいしょくをよぎなくされた。', translations: { en: 'Due to management difficulties, many employees were compelled to resign.' } },
    ],
    notes: 'Passive construction emphasizing external pressure. Common in news reporting.',
  },
  {
    pattern: '〜を禁じ得ない',
    jlptLevel: 2,
    meaning: { en: 'Cannot help but feel ~ / Cannot suppress ~' },
    formation: 'Noun + を禁じ得ない',
    examples: [
      { japanese: 'その悲惨な映像に、怒りを禁じ得ない。', reading: 'そのひさんなえいぞうに、いかりをきんじえない。', translations: { en: 'I cannot help but feel anger at those terrible images.' } },
      { japanese: '彼の無責任な態度に、呆れを禁じ得ない。', reading: 'かれのむせきにんなたいどに、あきれをきんじえない。', translations: { en: 'I cannot suppress my exasperation at his irresponsible attitude.' } },
    ],
    notes: 'Very formal, literary expression for an emotion one cannot contain.',
  },

  // ── Formal Means / Agency ──
  {
    pattern: '〜をもって',
    jlptLevel: 2,
    meaning: { en: 'With / By means of / As of (formal)' },
    formation: 'Noun + をもって',
    examples: [
      { japanese: '本日をもって、退職いたします。', reading: 'ほんじつをもって、たいしょくいたします。', translations: { en: 'As of today, I will be retiring.' } },
      { japanese: '誠意をもって交渉に臨む。', reading: 'せいいをもってこうしょうにのぞむ。', translations: { en: 'I will approach the negotiations with sincerity.' } },
    ],
    notes: 'で in formal/ceremonial language. Common in formal announcements.',
  },

  // ── Reaching a State ──
  {
    pattern: '〜に至って',
    jlptLevel: 2,
    meaning: { en: 'Now that it has come to ~ / Only when ~ (too late)' },
    formation: 'Noun + に至って / Verb dict. form + に至って',
    examples: [
      { japanese: '裁判に至って、ようやく事実を認めた。', reading: 'さいばんにいたって、ようやくじじつをみとめた。', translations: { en: 'Only when it came to trial did he finally admit the truth.' } },
      { japanese: '倒産に至って初めて対策を考えた。', reading: 'とうさんにいたってはじめてたいさくをかんがえた。', translations: { en: 'It was only after reaching bankruptcy that they finally thought of countermeasures.' } },
    ],
    notes: 'Implies the situation has deteriorated to an extreme point, often too late.',
  },
  {
    pattern: '〜に至るまで',
    jlptLevel: 2,
    meaning: { en: 'Ranging all the way to / Up to and including' },
    formation: 'Noun + に至るまで',
    examples: [
      { japanese: '子どもから大人に至るまで、みんなが楽しんだ。', reading: 'こどもからおとなにいたるまで、みんながたのしんだ。', translations: { en: 'Everyone from children all the way to adults enjoyed it.' } },
      { japanese: '細かいことに至るまで、丁寧に確認する。', reading: 'こまかいことにいたるまで、ていねいにかくにんする。', translations: { en: 'I carefully check everything right down to the smallest details.' } },
    ],
    notes: 'Emphasizes the full range, often from a broad category to something very specific.',
  },

  // ── Not Limited To ──
  {
    pattern: '〜に限らず',
    jlptLevel: 2,
    meaning: { en: 'Not limited to / Not only ~ but also' },
    formation: 'Noun + に限らず',
    examples: [
      { japanese: '日本に限らず、世界中で環境問題が深刻だ。', reading: 'にほんにかぎらず、せかいじゅうでかんきょうもんだいがしんこくだ。', translations: { en: 'Not limited to Japan, environmental problems are serious throughout the world.' } },
      { japanese: '若者に限らず、高齢者にも人気のゲームだ。', reading: 'わかものにかぎらず、こうれいしゃにもにんきのゲームだ。', translations: { en: 'It is a game popular not only among young people but also among the elderly.' } },
    ],
    notes: 'Expands the scope beyond what one might initially assume.',
  },
  {
    pattern: '〜はおろか',
    jlptLevel: 2,
    meaning: { en: 'Let alone / Not to mention / Far from even' },
    formation: 'Noun + はおろか',
    examples: [
      { japanese: '漢字はおろか、ひらがなも読めない。', reading: 'かんじはおろか、ひらがなもよめない。', translations: { en: 'I can\'t even read hiragana, let alone kanji.' } },
      { japanese: '彼は大学院はおろか、大学にも行っていない。', reading: 'かれはだいがくいんはおろか、だいがくにもいっていない。', translations: { en: 'He didn\'t even go to university, let alone graduate school.' } },
    ],
    notes: 'Presents two items where even the lesser one is unattainable.',
  },

  // ── Despite ──
  {
    pattern: '〜にもかかわらず',
    jlptLevel: 2,
    meaning: { en: 'Despite / In spite of / Even though' },
    formation: 'Verb/Adj plain form + にもかかわらず / Noun + にもかかわらず',
    examples: [
      { japanese: '雨にもかかわらず、多くの人が集まった。', reading: 'あめにもかかわらず、おおくのひとがあつまった。', translations: { en: 'Despite the rain, many people gathered.' } },
      { japanese: '体調が悪いにもかかわらず、出勤した。', reading: 'たいちょうがわるいにもかかわらず、しゅっきんした。', translations: { en: 'Despite feeling unwell, he went to work.' } },
    ],
    notes: 'Formal equivalent of のに. Can be used with nouns, verbs, and adjectives.',
  },

  // ── Standpoint / After ──
  {
    pattern: '〜上で',
    jlptLevel: 2,
    meaning: { en: 'After doing / In terms of / When it comes to' },
    formation: 'Verb た-form + 上で / Noun + の上で',
    examples: [
      { japanese: 'よく考えた上で、決断した。', reading: 'よくかんがえたうえで、けつだんした。', translations: { en: 'After thinking it over carefully, I made a decision.' } },
      { japanese: '生活上の問題について話し合う。', reading: 'せいかつじょうのもんだいについてはなしあう。', translations: { en: 'We discuss problems in terms of daily life.' } },
    ],
    notes: 'Verb た-form + 上で = sequential "after doing." Noun + 上で = "in the field of."',
  },
  {
    pattern: '〜上は',
    jlptLevel: 2,
    meaning: { en: 'Now that / Since (with determination to follow through)' },
    formation: 'Verb plain form + 上は',
    examples: [
      { japanese: '引き受けた上は、最後までやり遂げる。', reading: 'ひきうけたうえは、さいごまでやりとげる。', translations: { en: 'Now that I\'ve accepted, I will see it through to the end.' } },
      { japanese: '覚悟を決めた上は、前に進むしかない。', reading: 'かくごをきめたうえは、まえにすすむしかない。', translations: { en: 'Now that I\'ve steeled myself, I have no choice but to move forward.' } },
    ],
    notes: 'Similar to からには. Implies the speaker\'s firm resolve after an action has been taken.',
  },

  // ── Precisely Because ──
  {
    pattern: '〜だけに',
    jlptLevel: 2,
    meaning: { en: 'Precisely because / As might be expected from (due to that special quality)' },
    formation: 'Verb/Adj plain form + だけに / Noun + だけに',
    examples: [
      { japanese: '期待が大きかっただけに、失望も大きかった。', reading: 'きたいがおおきかっただけに、しつぼうもおおきかった。', translations: { en: 'Precisely because expectations were high, the disappointment was also great.' } },
      { japanese: '彼はプロだけに、仕事が丁寧だ。', reading: 'かれはプロだけに、しごとがていねいだ。', translations: { en: 'As might be expected of a professional, his work is meticulous.' } },
    ],
    notes: 'Indicates that the result is natural given the particular circumstances.',
  },
  {
    pattern: '〜だけあって',
    jlptLevel: 2,
    meaning: { en: 'As might be expected of / Naturally, since (worthy of)' },
    formation: 'Verb/Adj plain form + だけあって / Noun + だけあって',
    examples: [
      { japanese: '有名シェフが作っただけあって、料理が絶品だ。', reading: 'ゆうめいシェフがつくっただけあって、りょうりがぜっぴんだ。', translations: { en: 'As you might expect from a famous chef, the food is exquisite.' } },
      { japanese: '10年の経験があるだけあって、仕事が速い。', reading: '10ねんのけいけんがあるだけあって、しごとがはやい。', translations: { en: 'Naturally, with 10 years of experience, the work is fast.' } },
    ],
    notes: 'The outcome is a natural or deserved result of a quality or effort.',
  },
  {
    pattern: '〜だけのことはある',
    jlptLevel: 2,
    meaning: { en: 'It was worth it / As expected, the result lives up to the effort' },
    formation: 'Verb た-form + だけのことはある / Noun + だけのことはある',
    examples: [
      { japanese: '高いお金を払っただけのことはある。最高の料理だった。', reading: 'たかいおかねをはらっただけのことはある。さいこうのりょうりだった。', translations: { en: 'It was worth the high price. The food was the best.' } },
      { japanese: '苦労しただけのことはあって、成功した。', reading: 'くろうしただけのことはあって、せいこうした。', translations: { en: 'It was worth all the hard work, and I succeeded.' } },
    ],
    notes: 'Expresses that an effort, cost, or experience was justified by the result.',
  },
  {
    pattern: '〜だけましだ',
    jlptLevel: 2,
    meaning: { en: 'At least it\'s better than / Should be grateful that' },
    formation: 'Verb/Adj plain form + だけましだ',
    examples: [
      { japanese: '遅れたけど、来てくれただけましだ。', reading: 'おくれたけど、きてくれただけましだ。', translations: { en: 'You were late, but at least you came.' } },
      { japanese: '給料は少ないが、仕事があるだけましだ。', reading: 'きゅうりょうはすくないが、しごとがあるだけましだ。', translations: { en: 'The salary is low, but at least I have a job.' } },
    ],
    notes: 'Consolation. Implies the situation could be worse, so one should be thankful.',
  },

  // ── Unfortunate Cause ──
  {
    pattern: '〜ばかりに',
    jlptLevel: 2,
    meaning: { en: 'Simply because / Just because (led to a bad result)' },
    formation: 'Verb/Adj plain form + ばかりに',
    examples: [
      { japanese: '一言余計なことを言ったばかりに、関係が壊れた。', reading: 'ひとことよけいなことをいったばかりに、かんけいがこわれた。', translations: { en: 'Simply because I said one unnecessary thing, the relationship broke down.' } },
      { japanese: '欲張ったばかりに、全部失った。', reading: 'よくばったばかりに、ぜんぶうしなった。', translations: { en: 'Just because I was greedy, I lost everything.' } },
    ],
    notes: 'The single cause leads to a negative, often regrettable, outcome.',
  },

  // ── Immediate Sequence ──
  {
    pattern: '〜が最後',
    jlptLevel: 2,
    meaning: { en: 'Once ~ that\'s it / The moment ~ (there is no going back)' },
    formation: 'Verb た-form + が最後',
    examples: [
      { japanese: 'あのゲームを始めたが最後、やめられなくなる。', reading: 'あのゲームをはじめたがさいご、やめられなくなる。', translations: { en: 'Once you start that game, you won\'t be able to stop.' } },
      { japanese: '彼に話しかけたが最後、1時間は解放されない。', reading: 'かれにはなしかけたがさいご、1じかんはかいほうされない。', translations: { en: 'The moment you talk to him, you won\'t be free for an hour.' } },
    ],
    notes: 'Implies an irreversible or inescapable consequence after the initial action.',
  },
  {
    pattern: '〜や否や',
    jlptLevel: 2,
    meaning: { en: 'No sooner than / The moment / As soon as (literary)' },
    formation: 'Verb dictionary form + や否や',
    examples: [
      { japanese: 'ベルが鳴るや否や、学生たちが飛び出した。', reading: 'ベルがなるやいなや、がくせいたちがとびだした。', translations: { en: 'No sooner had the bell rung than the students dashed out.' } },
      { japanese: '彼女は帰宅するや否や、眠ってしまった。', reading: 'かのじょはきたくするやいなや、ねむってしまった。', translations: { en: 'The moment she got home, she fell asleep.' } },
    ],
    notes: 'Literary/written style. Indicates two events occur almost simultaneously.',
  },
  {
    pattern: '〜なり',
    jlptLevel: 2,
    meaning: { en: 'As soon as / No sooner than (immediate following action)' },
    formation: 'Verb dictionary form + なり',
    examples: [
      { japanese: '家に入るなり、コートを脱いだ。', reading: 'いえにはいるなり、コートをぬいだ。', translations: { en: 'As soon as he entered the house, he took off his coat.' } },
      { japanese: '彼は席に着くなり、話し始めた。', reading: 'かれはせきにつくなり、はなしはじめた。', translations: { en: 'No sooner had he taken his seat than he started talking.' } },
    ],
    notes: 'The subject of both clauses must be the same. Very literary.',
  },
  {
    pattern: '〜かと思ったら / 〜かと思うと',
    jlptLevel: 2,
    meaning: { en: 'Just when I thought ~ / No sooner had ~ than' },
    formation: 'Verb た-form + かと思ったら / Verb た-form + かと思うと',
    examples: [
      { japanese: '雨が止んだかと思ったら、また降り始めた。', reading: 'あめがやんだかとおもったら、またふりはじめた。', translations: { en: 'Just when I thought the rain had stopped, it started again.' } },
      { japanese: '子どもが笑ったかと思うと、泣き出した。', reading: 'こどもがわらったかとおもうと、なきだした。', translations: { en: 'No sooner had the child laughed than it started crying.' } },
    ],
    notes: 'The two events happen in rapid, surprising succession.',
  },

  // ── Depending On / As Soon As Completion ──
  {
    pattern: '〜次第で / 〜次第だ',
    jlptLevel: 2,
    meaning: { en: 'Depending on / It all depends on' },
    formation: 'Noun + 次第で / Noun + 次第だ',
    examples: [
      { japanese: '結果は努力次第だ。', reading: 'けっかはどりょくしだいだ。', translations: { en: 'The result depends on your effort.' } },
      { japanese: '天気次第で、行き先を決めよう。', reading: 'てんきしだいで、いきさきをきめよう。', translations: { en: 'Let\'s decide where to go depending on the weather.' } },
    ],
    notes: 'Expresses that the outcome is contingent on a variable. Very common in daily speech.',
  },
  {
    pattern: '〜いかんで',
    jlptLevel: 2,
    meaning: { en: 'Depending on (how/what) ~ / According to the state of ~' },
    formation: 'Noun + のいかんで / Noun + いかんで',
    examples: [
      { japanese: '対応のいかんで、信頼が大きく変わる。', reading: 'たいおうのいかんで、しんらいがおおきくかわる。', translations: { en: 'Depending on how you respond, trust can change significantly.' } },
      { japanese: '交渉の結果いかんで、合併が決まる。', reading: 'こうしょうのけっかいかんで、がっぺいがきまる。', translations: { en: 'The merger will be decided depending on the outcome of the negotiations.' } },
    ],
    notes: 'More formal and literary than 〜次第で. Often in written or official language.',
  },

  // ── Literary Similarity ──
  {
    pattern: '〜ごとき / 〜ごとく',
    jlptLevel: 2,
    meaning: { en: 'Like / As if / Such as (literary)' },
    formation: 'Noun + のごとき/のごとく / Verb plain + がごとき/がごとく',
    examples: [
      { japanese: '嵐のごとき勢いで彼は話した。', reading: 'あらしのごときいきおいでかれははなした。', translations: { en: 'He spoke with the force of a storm.' } },
      { japanese: '風のごとく走り去った。', reading: 'かぜのごとくはしりさった。', translations: { en: 'He ran off like the wind.' } },
    ],
    notes: 'Literary form of ような/ように. Found in formal writing, speeches, and classical texts.',
  },
  {
    pattern: '〜が如く / 〜が如き',
    jlptLevel: 2,
    meaning: { en: 'Like / As if (literary/classical)' },
    formation: 'Noun + が如く / Verb dict. form + が如く',
    examples: [
      { japanese: '光が如く速く走った。', reading: 'ひかりがごとくはやくはしった。', translations: { en: 'He ran as swiftly as light.' } },
      { japanese: '鷹が如き眼光で見つめた。', reading: 'たかがごときがんこうでみつめた。', translations: { en: 'He stared with eyes like a hawk.' } },
    ],
    notes: 'Archaic/literary. Mostly found in formal prose, poetry, and set phrases.',
  },

  // ── Unbearable Feeling ──
  {
    pattern: '〜てならない',
    jlptLevel: 2,
    meaning: { en: 'Can\'t help but feel ~ / Extremely ~ (natural, spontaneous feeling)' },
    formation: 'Verb て-form + ならない / Adj く-form + てならない',
    examples: [
      { japanese: '故郷のことが懐かしくてならない。', reading: 'ふるさとのことがなつかしくてならない。', translations: { en: 'I can\'t help but feel nostalgic about my hometown.' } },
      { japanese: '彼のことが心配でならない。', reading: 'かれのことがしんぱいでならない。', translations: { en: 'I can\'t help worrying about him.' } },
    ],
    notes: 'Used for natural, uncontrollable emotions. Often with emotions/feelings.',
  },
  {
    pattern: '〜てたまらない',
    jlptLevel: 2,
    meaning: { en: 'Unbearably ~ / Can\'t stand it / Extremely (physical or emotional)' },
    formation: 'Verb て-form + たまらない / Adj く-form + てたまらない',
    examples: [
      { japanese: '辛いものを食べて、口が痛くてたまらない。', reading: 'からいものをたべて、くちがいたくてたまらない。', translations: { en: 'After eating spicy food, my mouth is unbearably painful.' } },
      { japanese: '合格できるか、心配でたまらない。', reading: 'ごうかくできるか、しんぱいでたまらない。', translations: { en: 'I can\'t help but worry about whether I\'ll pass.' } },
    ],
    notes: 'Stronger than てならない. Used for overwhelming physical or emotional states.',
  },
  {
    pattern: '〜てしょうがない / 〜てしかたがない',
    jlptLevel: 2,
    meaning: { en: 'Can\'t help it / Extremely ~ (overwhelming feeling)' },
    formation: 'Verb て-form + しょうがない / Adj く-form + てしょうがない',
    examples: [
      { japanese: '彼女に会いたくてしょうがない。', reading: 'かのじょにあいたくてしょうがない。', translations: { en: 'I want to see her so badly I can\'t help it.' } },
      { japanese: '退屈でしかたがない授業だった。', reading: 'たいくつでしかたがないじゅぎょうだった。', translations: { en: 'It was an unbearably boring class.' } },
    ],
    notes: 'Colloquial alternative to てたまらない. Expresses that the feeling is overwhelming.',
  },

  // ── Worth / Unbearable ──
  {
    pattern: '〜にたえる / 〜にたえない',
    jlptLevel: 2,
    meaning: { en: 'Worth doing / Bearable (たえる) | Unbearable / Not worth doing (たえない)' },
    formation: 'Verb dict. form + にたえる/にたえない / Noun + にたえる/にたえない',
    examples: [
      { japanese: 'この作品は鑑賞にたえる芸術だ。', reading: 'このさくひんはかんしょうにたえるげいじゅつだ。', translations: { en: 'This work is art worth viewing.' } },
      { japanese: 'あの映画は見るにたえない内容だった。', reading: 'あのえいがはみるにたえないないようだった。', translations: { en: 'That film had content that was too painful to watch.' } },
    ],
    notes: 'にたえる = worth/able to endure. にたえない = unbearable/not worth it.',
  },

  // ── Irresistible Urge ──
  {
    pattern: '〜ずにはいられない',
    jlptLevel: 2,
    meaning: { en: 'Can\'t help but do / Cannot not do' },
    formation: 'Verb ない-stem + ずにはいられない (する → せずにはいられない)',
    examples: [
      { japanese: 'あんな映画を見たら、泣かずにはいられない。', reading: 'あんなえいがをみたら、なかずにはいられない。', translations: { en: 'If you watch a film like that, you can\'t help but cry.' } },
      { japanese: '彼の演奏を聴いて、拍手せずにはいられなかった。', reading: 'かれのえんそうをきいて、はくしゅせずにはいられなかった。', translations: { en: 'After hearing his performance, I couldn\'t help but applaud.' } },
    ],
    notes: 'Literary. Similar to てしまう but with a sense of being driven by instinct.',
  },
  {
    pattern: '〜ないではいられない',
    jlptLevel: 2,
    meaning: { en: 'Can\'t help but do / Inevitably ends up doing' },
    formation: 'Verb ない-form + ではいられない',
    examples: [
      { japanese: 'あんな話を聞いたら、笑わないではいられない。', reading: 'あんなはなしをきいたら、わらわないではいられない。', translations: { en: 'After hearing a story like that, you can\'t help but laugh.' } },
      { japanese: '不正を見たら、怒らないではいられない。', reading: 'ふせいをみたら、おこらないではいられない。', translations: { en: 'When I see injustice, I can\'t help but get angry.' } },
    ],
    notes: 'Colloquial equivalent of ずにはいられない. Common in spoken language.',
  },

  // ── First Time After ──
  {
    pattern: '〜てはじめて',
    jlptLevel: 2,
    meaning: { en: 'For the first time after doing ~ / Only after ~ does one realize' },
    formation: 'Verb て-form + はじめて',
    examples: [
      { japanese: '親になってはじめて、親のありがたさがわかった。', reading: 'おやになってはじめて、おやのありがたさがわかった。', translations: { en: 'Only after becoming a parent did I understand how grateful I should be to my parents.' } },
      { japanese: '失ってはじめて、その大切さに気づく。', reading: 'うしなってはじめて、そのたいせつさにきづく。', translations: { en: 'You only realize how precious something is after you\'ve lost it.' } },
    ],
    notes: 'Emphasizes that the realization or result only became possible after a key experience.',
  },

  // ── Prior To ──
  {
    pattern: '〜に先立って / 〜に先立ち',
    jlptLevel: 2,
    meaning: { en: 'Before / Prior to / In advance of' },
    formation: 'Noun + に先立って / Verb dict. form + に先立って',
    examples: [
      { japanese: '開会に先立って、会長が挨拶した。', reading: 'かいかいにさきだって、かいちょうがあいさつした。', translations: { en: 'Prior to the opening ceremony, the chairman gave a greeting.' } },
      { japanese: '試合に先立ち、選手紹介が行われた。', reading: 'しあいにさきだち、せんしゅしょうかいがおこなわれた。', translations: { en: 'Before the match, a player introduction was held.' } },
    ],
    notes: 'Formal. Used in ceremonies and official events.',
  },

  // ── Starting With ──
  {
    pattern: '〜を始め(として)',
    jlptLevel: 2,
    meaning: { en: 'Starting with / Including / Such as (and others)' },
    formation: 'Noun + を始め(として)',
    examples: [
      { japanese: '日本語を始め、アジアの言語を勉強している。', reading: 'にほんごをはじめ、アジアのげんごをべんきょうしている。', translations: { en: 'Starting with Japanese, I am studying Asian languages.' } },
      { japanese: '社長を始めとして、全員が参加した。', reading: 'しゃちょうをはじめとして、ぜんいんがさんかした。', translations: { en: 'Starting from the president, everyone participated.' } },
    ],
    notes: 'Lists a prominent example first, then implies similar others.',
  },
  {
    pattern: '〜をはじめとする',
    jlptLevel: 2,
    meaning: { en: 'Starting with / Including (as representative examples)' },
    formation: 'Noun + をはじめとする + Noun',
    examples: [
      { japanese: '東京をはじめとする大都市で人口が増えている。', reading: 'とうきょうをはじめとするだいとしでじんこうがふえている。', translations: { en: 'In large cities including Tokyo, the population is increasing.' } },
      { japanese: '田中先生をはじめとするスタッフに感謝したい。', reading: 'たなかせんせいをはじめとするスタッフにかんしゃしたい。', translations: { en: 'I want to express my gratitude to the staff, starting with Professor Tanaka.' } },
    ],
    notes: 'Attributive form (modifies a noun). More formal than を始め.',
  },

  // ── Setting Aside ──
  {
    pattern: '〜ないまでも',
    jlptLevel: 2,
    meaning: { en: 'Even if not ~ / At least ~ if not fully' },
    formation: 'Verb ない-form + までも',
    examples: [
      { japanese: '完璧でないまでも、できる限り努力する。', reading: 'かんぺきでないまでも、できるかぎりどりょくする。', translations: { en: 'Even if not perfect, I will make every effort I can.' } },
      { japanese: '毎日でないまでも、週に一度は運動したい。', reading: 'まいにちでないまでも、しゅうにいちどはうんどうしたい。', translations: { en: 'Even if not every day, I want to exercise at least once a week.' } },
    ],
    notes: 'Expresses a partial or lesser alternative goal when the ideal is unreachable.',
  },
  {
    pattern: '〜はともかく',
    jlptLevel: 2,
    meaning: { en: 'Setting aside ~ / Regardless of ~ / Whatever the case with ~' },
    formation: 'Noun + はともかく(として)',
    examples: [
      { japanese: '値段はともかく、品質が大事だ。', reading: 'ねだんはともかく、ひんしつがたいせつだ。', translations: { en: 'Setting aside the price, quality is what matters.' } },
      { japanese: '合否はともかく、全力を尽くした。', reading: 'ごうひはともかく、ぜんりょくをつくした。', translations: { en: 'Whatever the result, I gave it my all.' } },
    ],
    notes: 'Temporarily puts one issue aside to focus on another.',
  },
  {
    pattern: '〜はさておき',
    jlptLevel: 2,
    meaning: { en: 'Setting aside / Leaving ~ aside for now' },
    formation: 'Noun + はさておき',
    examples: [
      { japanese: '冗談はさておき、本題に入りましょう。', reading: 'じょうだんはさておき、ほんだいにはいりましょう。', translations: { en: 'Jokes aside, let\'s get to the main topic.' } },
      { japanese: '細かい問題はさておき、大筋では合意できた。', reading: 'こまかいもんだいはさておき、おおすじではごういできた。', translations: { en: 'Setting aside minor issues, we were able to agree on the broad strokes.' } },
    ],
    notes: 'Signals a conversational pivot. Similar to はともかく but more explicitly "putting it aside."',
  },

  // ── Extent / Limit ──
  {
    pattern: '〜限りでは',
    jlptLevel: 2,
    meaning: { en: 'As far as ~ is concerned / To the extent that' },
    formation: 'Verb/Noun phrase + 限りでは',
    examples: [
      { japanese: '私の知る限りでは、彼は正直な人だ。', reading: 'わたしのしるかぎりでは、かれはしょうじきなひとだ。', translations: { en: 'As far as I know, he is an honest person.' } },
      { japanese: '今のところ報告を受けている限りでは、被害はない。', reading: 'いまのところほうこくをうけているかぎりでは、ひがいはない。', translations: { en: 'As far as reports received so far indicate, there is no damage.' } },
    ],
    notes: 'Qualifies a statement by limiting it to the speaker\'s available information.',
  },
  {
    pattern: '〜の限り',
    jlptLevel: 2,
    meaning: { en: 'To the full extent of / With all one\'s ~' },
    formation: 'Noun + の限り',
    examples: [
      { japanese: '声の限り叫んだ。', reading: 'こえのかぎりさけんだ。', translations: { en: 'I shouted at the top of my lungs.' } },
      { japanese: '力の限り戦った。', reading: 'ちからのかぎりたたかった。', translations: { en: 'I fought with every ounce of my strength.' } },
    ],
    notes: 'Expresses using something to its fullest capacity or utmost limit.',
  },

  // ── Absolute Negation / Volitional Negative ──
  {
    pattern: '〜っこない',
    jlptLevel: 2,
    meaning: { en: 'There\'s no way ~ / Absolutely cannot (strong denial)' },
    formation: 'Verb ます-stem + っこない',
    examples: [
      { japanese: 'そんな難しい問題、解けっこない。', reading: 'そんなむずかしいもんだい、とけっこない。', translations: { en: 'There\'s no way I can solve such a difficult problem.' } },
      { japanese: '一日でそんなに覚えられっこない。', reading: 'いちにちでそんなにおぼえられっこない。', translations: { en: 'There\'s absolutely no way you can memorize that much in a single day.' } },
    ],
    notes: 'Colloquial. Strong emphatic negation of possibility.',
  },
  {
    pattern: '〜まい',
    jlptLevel: 2,
    meaning: { en: 'Will not / Must not / Should not (volitional negative)' },
    formation: 'Verb dict. form + まい / Verb ます-stem + まい',
    examples: [
      { japanese: '二度とあんなことはするまいと思った。', reading: 'にどとあんなことはするまいとおもった。', translations: { en: 'I resolved never to do something like that again.' } },
      { japanese: '彼には何も話すまいと決めた。', reading: 'かれにはなにもはなすまいときめた。', translations: { en: 'I decided I would tell him nothing.' } },
    ],
    notes: 'Formal/literary negative volitional. Expresses determination or inference of non-action.',
  },

  // ── Purpose (Formal/Literary) ──
  {
    pattern: '〜んがため(に)',
    jlptLevel: 2,
    meaning: { en: 'In order to / For the purpose of (literary/formal)' },
    formation: 'Verb ない-stem + んがために',
    examples: [
      { japanese: '勝たんがために、あらゆる努力をした。', reading: 'かたんがために、あらゆるどりょくをした。', translations: { en: 'In order to win, I made every effort.' } },
      { japanese: '知らんがために問うのは恥ではない。', reading: 'しらんがためにとうのははじではない。', translations: { en: 'Asking questions in order to know is not shameful.' } },
    ],
    notes: 'Classical grammar. ん is the archaic negative/tentative auxiliary. Very formal.',
  },
  {
    pattern: '〜べく',
    jlptLevel: 2,
    meaning: { en: 'In order to / With the aim of (formal/literary)' },
    formation: 'Verb dict. form + べく',
    examples: [
      { japanese: '夢を実現すべく、毎日努力している。', reading: 'ゆめをじつげんすべく、まいにちどりょくしている。', translations: { en: 'In order to realize my dream, I make an effort every day.' } },
      { japanese: '問題を解決すべく、全力を尽くした。', reading: 'もんだいをかいけつすべく、ぜんりょくをつくした。', translations: { en: 'In order to solve the problem, I gave it everything I had.' } },
    ],
    notes: 'Literary formal purpose. Slightly old-fashioned but common in written Japanese.',
  },

  // ── Without Doing ──
  {
    pattern: '〜ことなく',
    jlptLevel: 2,
    meaning: { en: 'Without doing ~ / Not once ~' },
    formation: 'Verb dict. form + ことなく',
    examples: [
      { japanese: '諦めることなく、挑戦し続けた。', reading: 'あきらめることなく、ちょうせんしつづけた。', translations: { en: 'Without giving up, he continued to challenge himself.' } },
      { japanese: '一度も失敗することなく、完成させた。', reading: 'いちどもしっぱいすることなく、かんせいさせた。', translations: { en: 'Without failing even once, he completed it.' } },
    ],
    notes: 'Formal alternative to ないで. More elegant and used in formal writing.',
  },
  {
    pattern: '〜ずに',
    jlptLevel: 2,
    meaning: { en: 'Without doing (literary/formal ないで)' },
    formation: 'Verb ない-stem + ずに (する → せずに)',
    examples: [
      { japanese: '何も言わずに去った。', reading: 'なにもいわずにさった。', translations: { en: 'He left without saying a word.' } },
      { japanese: '食べずに寝てしまった。', reading: 'たべずにねてしまった。', translations: { en: 'I went to sleep without eating.' } },
    ],
    notes: 'Literary equivalent of ないで. ずに is more formal; ないで is more colloquial.',
  },

  // ── Simultaneous / Parallel Actions ──
  {
    pattern: '〜かたわら',
    jlptLevel: 2,
    meaning: { en: 'While / On the side / Alongside (two parallel pursuits)' },
    formation: 'Verb dict. form + かたわら / Noun + のかたわら',
    examples: [
      { japanese: '仕事のかたわら、小説を書いている。', reading: 'しごとのかたわら、しょうせつをかいている。', translations: { en: 'Alongside my work, I write novels.' } },
      { japanese: '子育てをするかたわら、資格の勉強もしている。', reading: 'こそだてをするかたわら、しかくのべんきょうもしている。', translations: { en: 'While raising children, I am also studying for a qualification.' } },
    ],
    notes: 'The main activity and the secondary activity continue at the same time.',
  },
  {
    pattern: '〜がてら',
    jlptLevel: 2,
    meaning: { en: 'While doing / Taking the opportunity to / On the way to' },
    formation: 'Verb ます-stem + がてら / Noun + がてら',
    examples: [
      { japanese: '散歩がてら、買い物をしてきた。', reading: 'さんぽがてら、かいものをしてきた。', translations: { en: 'I went shopping while I was out for a walk.' } },
      { japanese: '出張がてら、観光地を回った。', reading: 'しゅっちょうがてら、かんこうちをまわった。', translations: { en: 'On my business trip, I also took the opportunity to tour the sights.' } },
    ],
    notes: 'One action serves as the opportunity or means to do another incidental action.',
  },
  {
    pattern: '〜つつ',
    jlptLevel: 2,
    meaning: { en: 'While doing / Even though (concessive)' },
    formation: 'Verb ます-stem + つつ',
    examples: [
      { japanese: '音楽を聴きつつ、勉強する。', reading: 'おんがくをききつつ、べんきょうする。', translations: { en: 'I study while listening to music.' } },
      { japanese: '悪いとわかりつつ、つい食べてしまった。', reading: 'わるいとわかりつつ、ついたべてしまった。', translations: { en: 'Even though I knew it was bad for me, I ended up eating it.' } },
    ],
    notes: 'Simultaneous actions (while) or concessive (knowing ~ yet still doing ~).',
  },
  {
    pattern: '〜つつある',
    jlptLevel: 2,
    meaning: { en: 'Be in the process of / Be gradually ~ing' },
    formation: 'Verb ます-stem + つつある',
    examples: [
      { japanese: '経済は回復しつつある。', reading: 'けいざいはかいふくしつつある。', translations: { en: 'The economy is in the process of recovering.' } },
      { japanese: '技術は急速に発展しつつある。', reading: 'ぎじゅつはきゅうそくにはってんしつつある。', translations: { en: 'Technology is rapidly developing.' } },
    ],
    notes: 'Formal equivalent of ている for gradual change. Common in news and formal writing.',
  },

  // ── State ──
  {
    pattern: '〜まま',
    jlptLevel: 2,
    meaning: { en: 'As is / While still in that state / Without changing' },
    formation: 'Verb た/ない-form + まま / Noun + の + まま',
    examples: [
      { japanese: '靴を履いたまま、家に入ってしまった。', reading: 'くつをはいたまま、いえにはいってしまった。', translations: { en: 'I entered the house with my shoes still on.' } },
      { japanese: '電気をつけたまま眠ってしまった。', reading: 'でんきをつけたままねむってしまった。', translations: { en: 'I fell asleep with the light still on.' } },
    ],
    notes: 'Describes a state that continues unchanged from a past action.',
  },

  // ── One's Own Way / Characteristic ──
  {
    pattern: '〜なりに / 〜なりの',
    jlptLevel: 2,
    meaning: { en: 'In one\'s own way / In a manner appropriate to' },
    formation: 'Noun + なりに / Noun + なりの + Noun',
    examples: [
      { japanese: '子どもなりに、頑張っていると思う。', reading: 'こどもなりに、がんばっているとおもう。', translations: { en: 'I think they are trying their best in their own childlike way.' } },
      { japanese: '初心者なりの疑問を持つことが大切だ。', reading: 'しょしんしゃなりのぎもんをもつことがたいせつだ。', translations: { en: 'It is important to have the kind of questions that are natural for a beginner.' } },
    ],
    notes: 'Acknowledges limitations while affirming effort within those constraints.',
  },

  // ── Suitable For / Directed At ──
  {
    pattern: '〜向きに / 〜向きの',
    jlptLevel: 2,
    meaning: { en: 'Suitable for / For those who are oriented toward' },
    formation: 'Noun + 向きに (adverb) / Noun + 向きの + Noun (modifier)',
    examples: [
      { japanese: 'この本は初心者向きに書かれている。', reading: 'このほんはしょしんしゃむきにかかれている。', translations: { en: 'This book is written with beginners in mind.' } },
      { japanese: '南向きの部屋は明るくて人気がある。', reading: 'みなみむきのへやはあかるくてにんきがある。', translations: { en: 'South-facing rooms are bright and popular.' } },
    ],
    notes: '向きの often refers to physical direction or natural fit/tendency.',
  },
  {
    pattern: '〜向けに / 〜向けの',
    jlptLevel: 2,
    meaning: { en: 'Aimed at / Intended for / Designed for' },
    formation: 'Noun + 向けに (adverb) / Noun + 向けの + Noun (modifier)',
    examples: [
      { japanese: '子ども向けに説明してください。', reading: 'こどもむけにせつめいしてください。', translations: { en: 'Please explain it in a way aimed at children.' } },
      { japanese: '海外向けの製品を開発した。', reading: 'かいがいむけのせいひんをかいはつした。', translations: { en: 'We developed a product aimed at overseas markets.' } },
    ],
    notes: '向けの refers to the intended target audience or market, designed intentionally for them.',
  },

  // ── Tendency ──
  {
    pattern: '〜がち',
    jlptLevel: 2,
    meaning: { en: 'Tend to / Prone to (usually negative tendency)' },
    formation: 'Verb ます-stem + がち / Noun + がち',
    examples: [
      { japanese: '忙しいと食事を忘れがちだ。', reading: 'いそがしいとしょくじをわすれがちだ。', translations: { en: 'When I\'m busy, I tend to forget my meals.' } },
      { japanese: '彼は遅刻がちで、上司に怒られた。', reading: 'かれはちこくがちで、じょうしにおこられた。', translations: { en: 'He has a habit of being late, and his boss got angry.' } },
    ],
    notes: 'Expresses a habitual or natural tendency, often with a negative nuance.',
  },
  {
    pattern: '〜ぎみ',
    jlptLevel: 2,
    meaning: { en: 'Slightly / A touch of / Tends toward (slight undesirable condition)' },
    formation: 'Verb ます-stem + ぎみ / Noun + ぎみ',
    examples: [
      { japanese: '最近疲れぎみで、早めに帰っている。', reading: 'さいきんつかれぎみで、はやめにかえっている。', translations: { en: 'Lately I\'ve been feeling a bit tired, so I\'ve been going home early.' } },
      { japanese: '売れ行きが落ちぎみで、対策が必要だ。', reading: 'うれゆきがおちぎみで、たいさくがひつようだ。', translations: { en: 'Sales are slightly declining, so countermeasures are needed.' } },
    ],
    notes: 'Note: 〜気味 also appears in grammarN2.ts as 〜気味. This entry uses the alternate rendering ぎみ with the same scope but a slightly different nuance pattern.',
  },
  {
    pattern: '〜ぶり',
    jlptLevel: 2,
    meaning: { en: 'Manner of / Way of / After an interval of (e.g. 3 years)' },
    formation: 'Verb ます-stem + ぶり / Noun + ぶり / Time word + ぶり',
    examples: [
      { japanese: '3年ぶりに故郷に帰った。', reading: '3ねんぶりにふるさとにかえった。', translations: { en: 'I returned to my hometown for the first time in 3 years.' } },
      { japanese: '食べっぷりがいいね、よっぽどお腹が空いていたんだね。', reading: 'たべっぷりがいいね、よっぽどおなかがすいていたんだね。', translations: { en: 'You\'re eating with such gusto — you must have been really hungry.' } },
    ],
    notes: 'Two uses: (1) time elapsed (〜ぶりに = for the first time in ~); (2) manner/style of doing.',
  },

  // ── Depending On / How ──
  {
    pattern: '〜如何',
    jlptLevel: 2,
    meaning: { en: 'Depending on / How ~ is / What ~ is like (formal)' },
    formation: 'Noun + 如何で / Noun + 如何によっては',
    examples: [
      { japanese: '対応如何では、大問題になりかねない。', reading: 'たいおういかんでは、だいもんだいになりかねない。', translations: { en: 'Depending on how you handle it, it could become a major problem.' } },
      { japanese: '予算の如何にかかわらず、計画は進める。', reading: 'よさんのいかんにかかわらず、けいかくはすすめる。', translations: { en: 'Regardless of what the budget is, I will proceed with the plan.' } },
    ],
    notes: '如何 = いかん. Very formal. Commonly written in kanji in official documents.',
  },

  // ── Additional Formal / Literary Patterns ──
  {
    pattern: '〜をめぐって',
    jlptLevel: 2,
    meaning: { en: 'Regarding / Over / Surrounding (a topic of debate)' },
    formation: 'Noun + をめぐって / Noun + をめぐる + Noun',
    examples: [
      { japanese: '遺産をめぐって、兄弟が争っている。', reading: 'いさんをめぐって、きょうだいがあらそっている。', translations: { en: 'The siblings are fighting over the inheritance.' } },
      { japanese: '領土をめぐる問題は複雑だ。', reading: 'りょうどをめぐるもんだいはふくざつだ。', translations: { en: 'Issues surrounding territorial disputes are complex.' } },
    ],
    notes: 'Often used with disagreements, debates, or topics of negotiation.',
  },
  {
    pattern: '〜に対して',
    jlptLevel: 2,
    meaning: { en: 'Toward / Against / In contrast to' },
    formation: 'Noun + に対して / Noun + に対する + Noun',
    examples: [
      { japanese: '批判に対して、冷静に答えた。', reading: 'ひはんにたいして、れいせいにこたえた。', translations: { en: 'He responded calmly to the criticism.' } },
      { japanese: '前年に対して、売上が20%増加した。', reading: 'ぜんねんにたいして、うりあげが20%ぞうかした。', translations: { en: 'Sales increased by 20% compared to the previous year.' } },
    ],
    notes: 'Can express direction (toward), contrast (compared to), or opposition (against).',
  },
  {
    pattern: '〜からすると / 〜からすれば',
    jlptLevel: 2,
    meaning: { en: 'From the perspective of / Judging from' },
    formation: 'Noun + からすると/からすれば',
    examples: [
      { japanese: '専門家の立場からすると、この判断は正しい。', reading: 'せんもんかのたちばからすると、このはんだんはただしい。', translations: { en: 'From the perspective of an expert, this judgment is correct.' } },
      { japanese: '外国人からすれば、敬語は難しい。', reading: 'がいこくじんからすれば、けいごはむずかしい。', translations: { en: 'From a foreigner\'s perspective, keigo is difficult.' } },
    ],
    notes: 'Introduces a viewpoint or perspective from which a judgment is made.',
  },
  {
    pattern: '〜からみると / 〜からみれば',
    jlptLevel: 2,
    meaning: { en: 'From the viewpoint of / Looking at it from' },
    formation: 'Noun + からみると/からみれば',
    examples: [
      { japanese: '子どもの目からみると、世界は不思議に見える。', reading: 'こどものめからみると、せかいはふしぎにみえる。', translations: { en: 'Looking at the world from a child\'s eyes, it seems full of wonder.' } },
      { japanese: '長期的な観点からみれば、この投資は有効だ。', reading: 'ちょうきてきなかんてんからみれば、このとうしはゆうこうだ。', translations: { en: 'From a long-term perspective, this investment is effective.' } },
    ],
    notes: 'Emphasizes visual/evaluative standpoint. Slightly more literal than からすると.',
  },
  {
    pattern: '〜をはじめ',
    jlptLevel: 2,
    meaning: { en: 'Beginning with / Starting from (and the rest)' },
    formation: 'Noun + をはじめ',
    examples: [
      { japanese: '山田さんをはじめ、多くの方にお世話になった。', reading: 'やまださんをはじめ、おおくのかたにおせわになった。', translations: { en: 'Starting with Mr. Yamada, I was helped by many people.' } },
      { japanese: '中国をはじめ、アジア各国で人気がある。', reading: 'ちゅうごくをはじめ、アジアかっこくでにんきがある。', translations: { en: 'Starting with China, it is popular in various Asian countries.' } },
    ],
    notes: 'Slightly shorter version of をはじめとして. Lists the first representative example.',
  },
  {
    pattern: '〜に基づき',
    jlptLevel: 2,
    meaning: { en: 'Based on / Grounded in (formal conjunctive)' },
    formation: 'Noun + に基づき',
    examples: [
      { japanese: '調査結果に基づき、提案書を作成した。', reading: 'ちょうさけっかにもとづき、ていあんしょをさくせいした。', translations: { en: 'Based on the survey results, I created a proposal document.' } },
      { japanese: '条約に基づき、両国は協力する。', reading: 'じょうやくにもとづき、りょうこくはきょうりょくする。', translations: { en: 'Based on the treaty, both countries will cooperate.' } },
    ],
    notes: 'Conjunctive form of に基づいて (without the て). Used to connect clauses in formal writing.',
  },
  {
    pattern: '〜にわたり',
    jlptLevel: 2,
    meaning: { en: 'Over / Spanning (conjunctive form of にわたって)' },
    formation: 'Noun + にわたり',
    examples: [
      { japanese: '10年にわたり研究を続けた。', reading: '10ねんにわたりけんきゅうをつづけた。', translations: { en: 'I continued the research spanning 10 years.' } },
      { japanese: '広範囲にわたり、被害が確認された。', reading: 'こうはんいにわたり、ひがいがかくにんされた。', translations: { en: 'Damage was confirmed across a wide range.' } },
    ],
    notes: 'Conjunctive (て-less) form of にわたって. Used mid-sentence in formal writing.',
  },
  {
    pattern: '〜に当たり',
    jlptLevel: 2,
    meaning: { en: 'On the occasion of / When undertaking (conjunctive formal)' },
    formation: 'Verb dict. form / Noun + に当たり',
    examples: [
      { japanese: '就任に当たり、抱負を述べさせていただきます。', reading: 'しゅうにんにあたり、ほうふをのべさせていただきます。', translations: { en: 'On the occasion of taking office, allow me to express my aspirations.' } },
      { japanese: '工事を行うに当たり、ご迷惑をおかけします。', reading: 'こうじをおこなうにあたり、ごめいわくをおかけします。', translations: { en: 'We apologize for any inconvenience caused in undertaking the construction.' } },
    ],
    notes: 'Conjunctive (て-less) form of にあたって. Used in formal mid-sentence positions.',
  },
  {
    pattern: '〜に先立ち',
    jlptLevel: 2,
    meaning: { en: 'Prior to / Before (conjunctive formal)' },
    formation: 'Noun + に先立ち',
    examples: [
      { japanese: '開幕に先立ち、関係者による内覧会が行われた。', reading: 'かいまくにさきだち、かんけいしゃによるないらんかいがおこなわれた。', translations: { en: 'Prior to the opening, a preview for those involved was held.' } },
      { japanese: '式典に先立ち、会場の設営が完了した。', reading: 'しきてんにさきだち、かいじょうのせつえいがかんりょうした。', translations: { en: 'Prior to the ceremony, the venue setup was completed.' } },
    ],
    notes: 'Conjunctive (て-less) form of に先立って. Common in formal written announcements.',
  },
  {
    pattern: '〜とともに',
    jlptLevel: 2,
    meaning: { en: 'Together with / Along with / At the same time as' },
    formation: 'Noun + とともに / Verb dict. form + とともに',
    examples: [
      { japanese: '経済成長とともに、環境問題も深刻化した。', reading: 'けいざいせいちょうとともに、かんきょうもんだいもしんこくかした。', translations: { en: 'Along with economic growth, environmental problems also became more serious.' } },
      { japanese: '時代が変わるとともに、価値観も変わる。', reading: 'じだいがかわるとともに、かちかんもかわる。', translations: { en: 'As the times change, values also change.' } },
    ],
    notes: 'Simultaneous occurrence or parallel change. More formal than と一緒に.',
  },
  {
    pattern: '〜ともなると / 〜ともなれば',
    jlptLevel: 2,
    meaning: { en: 'When it comes to ~ / Once you reach the level of ~' },
    formation: 'Noun + ともなると/ともなれば',
    examples: [
      { japanese: '社長ともなると、責任も重大だ。', reading: 'しゃちょうともなると、せきにんもじゅうだいだ。', translations: { en: 'When it comes to being a company president, the responsibility is immense.' } },
      { japanese: '10年のベテランともなれば、何でも任せられる。', reading: '10ねんのベテランともなれば、なんでもまかせられる。', translations: { en: 'Once you reach the level of a 10-year veteran, anything can be entrusted to you.' } },
    ],
    notes: 'Implies that reaching a certain status brings with it natural expectations.',
  },
  {
    pattern: '〜ないとも限らない',
    jlptLevel: 2,
    meaning: { en: 'There\'s a possibility that ~ might / Can\'t say for sure it won\'t' },
    formation: 'Verb ない-form + とも限らない',
    examples: [
      { japanese: '彼が来ないとも限らない。一応連絡しておこう。', reading: 'かれがこないともかぎらない。いちおうれんらくしておこう。', translations: { en: 'It\'s not impossible that he won\'t come. Let me contact him just in case.' } },
      { japanese: '価格が上がらないとも限らないので、早めに購入した。', reading: 'かかくがあがらないともかぎらないので、はやめにこうにゅうした。', translations: { en: 'Since it\'s not certain prices won\'t rise, I bought early.' } },
    ],
    notes: 'Triple negative construction expressing a cautious possibility.',
  },
  {
    pattern: '〜わけがない',
    jlptLevel: 2,
    meaning: { en: 'There\'s no way / It\'s impossible that' },
    formation: 'Verb/Adj plain form + わけがない / Noun + のわけがない',
    examples: [
      { japanese: '彼がそんなことをするわけがない。', reading: 'かれがそんなことをするわけがない。', translations: { en: 'There\'s no way he would do something like that.' } },
      { japanese: '一晩で覚えられるわけがない。', reading: 'ひとばんでおぼえられるわけがない。', translations: { en: 'There\'s no way you can memorize it in one night.' } },
    ],
    notes: 'Logical impossibility. Stronger certainty of negation than ないと思う.',
  },
  {
    pattern: '〜わけではない',
    jlptLevel: 2,
    meaning: { en: 'It\'s not that ~ / It doesn\'t mean ~' },
    formation: 'Verb/Adj plain form + わけではない / Noun + のわけではない',
    examples: [
      { japanese: '嫌いなわけではないが、苦手だ。', reading: 'きらいなわけではないが、にがてだ。', translations: { en: 'It\'s not that I hate it; I\'m just not good at it.' } },
      { japanese: '彼のことが信じられないわけではない。', reading: 'かれのことがしんじられないわけではない。', translations: { en: 'It\'s not that I can\'t trust him.' } },
    ],
    notes: 'Denies a potential assumption. Often followed by a contrasting explanation.',
  },
  {
    pattern: '〜ことから',
    jlptLevel: 2,
    meaning: { en: 'Because of / Due to the fact that (evidential reasoning)' },
    formation: 'Verb/Adj plain form + ことから',
    examples: [
      { japanese: '桜が多いことから、この公園は「桜公園」と呼ばれる。', reading: 'さくらがおおいことから、このこうえんは「さくらこうえん」とよばれる。', translations: { en: 'Because there are many cherry trees, this park is called "Sakura Park."' } },
      { japanese: '足が大きいことから、靴を探すのが大変だ。', reading: 'あしがおおきいことから、くつをさがすのがたいへんだ。', translations: { en: 'Due to the fact that my feet are big, it\'s hard to find shoes.' } },
    ],
    notes: 'The reason is an observable fact used to draw a conclusion or explain a name/status.',
  },
  {
    pattern: '〜ことで',
    jlptLevel: 2,
    meaning: { en: 'By doing ~ / Through the act of' },
    formation: 'Verb dict. form + ことで',
    examples: [
      { japanese: '毎日練習することで、上達した。', reading: 'まいにちれんしゅうすることで、じょうたつした。', translations: { en: 'By practicing every day, I improved.' } },
      { japanese: 'チームで協力することで、困難を乗り越えた。', reading: 'チームできょうりょくすることで、こんなんをのりこえた。', translations: { en: 'By cooperating as a team, we overcame the difficulties.' } },
    ],
    notes: 'Expresses the means or mechanism by which a result is achieved.',
  },
  {
    pattern: '〜にかけては',
    jlptLevel: 2,
    meaning: { en: 'When it comes to / In terms of (expressing confidence in one area)' },
    formation: 'Noun + にかけては',
    examples: [
      { japanese: '料理にかけては、誰にも負けない。', reading: 'りょうりにかけては、だれにもまけない。', translations: { en: 'When it comes to cooking, I don\'t lose to anyone.' } },
      { japanese: '語学にかけては、彼が一番だ。', reading: 'ごがくにかけては、かれがいちばんだ。', translations: { en: 'When it comes to languages, he is the best.' } },
    ],
    notes: 'Expresses pride or confidence in one particular area of ability.',
  },
  {
    pattern: '〜に関しては',
    jlptLevel: 2,
    meaning: { en: 'Regarding / As for / Concerning (topic marker)' },
    formation: 'Noun + に関しては',
    examples: [
      { japanese: 'この問題に関しては、慎重に対応する必要がある。', reading: 'このもんだいにかんしては、しんちょうにたいおうするひつようがある。', translations: { en: 'Regarding this issue, careful handling is necessary.' } },
      { japanese: '費用に関しては、別途ご連絡します。', reading: 'ひようにかんしては、べっとごれんらくします。', translations: { en: 'Regarding the costs, I will contact you separately.' } },
    ],
    notes: 'Formal topic introducer. Similar to について but more restricted to formal contexts.',
  },
  {
    pattern: '〜にほかならない',
    jlptLevel: 2,
    meaning: { en: 'Nothing but / Is precisely / Is none other than' },
    formation: 'Noun + にほかならない / Verb/Adj plain form + にほかならない',
    examples: [
      { japanese: 'これは彼の努力の結果にほかならない。', reading: 'これはかれのどりょくのけっかにほかならない。', translations: { en: 'This is none other than the result of his efforts.' } },
      { japanese: '失敗の原因は準備不足にほかならない。', reading: 'しっぱいのげんいんはじゅんびぶそくにほかならない。', translations: { en: 'The cause of the failure is nothing but inadequate preparation.' } },
    ],
    notes: 'Strong formal assertion equating two things. Literary.',
  },
  {
    pattern: '〜てもさしつかえない',
    jlptLevel: 2,
    meaning: { en: 'There is no problem with doing ~ / It is fine to do ~' },
    formation: 'Verb て-form + もさしつかえない',
    examples: [
      { japanese: '今日中に提出してもさしつかえありません。', reading: 'きょうじゅうにていしゅつしてもさしつかえありません。', translations: { en: 'There is no problem with submitting it today.' } },
      { japanese: '見学してもさしつかえないですか？', reading: 'けんがくしてもさしつかえないですか？', translations: { en: 'Is there any problem if I observe?' } },
    ],
    notes: 'Formal polite way to give or seek permission. Common in business Japanese.',
  },
  {
    pattern: '〜ないまでも',
    jlptLevel: 2,
    meaning: { en: 'Even if not ~ at least / Short of ~ but at a minimum' },
    formation: 'Verb ない-form + までも',
    examples: [
      { japanese: '旅行に行けないまでも、近くの観光地を訪れたい。', reading: 'りょこうにいけないまでも、ちかくのかんこうちをおとずれたい。', translations: { en: 'Even if I can\'t travel, at least I want to visit a nearby tourist spot.' } },
      { japanese: '完璧に話せないまでも、意思疎通できる程度にはなりたい。', reading: 'かんぺきにはなせないまでも、いしそつうできるていどにはなりたい。', translations: { en: 'Even if I can\'t speak perfectly, I want to at least be able to communicate.' } },
    ],
    notes: 'Presents a lesser alternative to an ideal. See also earlier entry above.',
  },
  {
    pattern: '〜にもほどがある',
    jlptLevel: 2,
    meaning: { en: 'There is a limit to ~ / That\'s going too far with ~' },
    formation: 'Noun + にもほどがある / Adj な + にもほどがある',
    examples: [
      { japanese: 'いい加減にもほどがある！', reading: 'いいかげんにもほどがある！', translations: { en: 'There is a limit to being careless!' } },
      { japanese: '遅刻にもほどがある。なんで3時間も遅れるんだ。', reading: 'ちこくにもほどがある。なんで3じかんもおくれるんだ。', translations: { en: 'There\'s a limit to being late. Why are you 3 hours behind?' } },
    ],
    notes: 'Expresses irritation that something has exceeded acceptable bounds.',
  },
  {
    pattern: '〜ことだし',
    jlptLevel: 2,
    meaning: { en: 'Since ~ / Given that ~ (listing reasons casually)' },
    formation: 'Verb/Adj plain form + ことだし',
    examples: [
      { japanese: '天気もいいことだし、外でランチにしよう。', reading: 'てんきもいいことだし、そとでランチにしよう。', translations: { en: 'Since the weather is nice, let\'s have lunch outside.' } },
      { japanese: '休みもあることだし、旅行しようと思う。', reading: 'やすみもあることだし、りょこうしようとおもう。', translations: { en: 'Since I have time off, I\'m thinking of going on a trip.' } },
    ],
    notes: 'Casual. Lists conditions as reasons supporting a suggestion or decision.',
  },
  {
    pattern: '〜ものとして',
    jlptLevel: 2,
    meaning: { en: 'On the assumption that / Treating ~ as' },
    formation: 'Verb/Adj plain form + ものとして / Noun + のものとして',
    examples: [
      { japanese: '参加するものとして、準備を進めてください。', reading: 'さんかするものとして、じゅんびをすすめてください。', translations: { en: 'Please proceed with preparations on the assumption that you will participate.' } },
      { japanese: '合格したものとして、入学手続きをする。', reading: 'ごうかくしたものとして、にゅうがくてつづきをする。', translations: { en: 'I will complete the enrollment procedures assuming I passed.' } },
    ],
    notes: 'Used in formal/business contexts to state a working assumption.',
  },
  {
    pattern: '〜を機に',
    jlptLevel: 2,
    meaning: { en: 'Taking ~ as an opportunity / On the occasion of' },
    formation: 'Noun + を機に(して)',
    examples: [
      { japanese: '転職を機に、新しい生活を始めた。', reading: 'てんしょくをきに、あたらしいせいかつをはじめた。', translations: { en: 'Taking the job change as an opportunity, I started a new life.' } },
      { japanese: '定年を機に、趣味に専念することにした。', reading: 'ていねんをきに、しゅみにせんねんすることにした。', translations: { en: 'On the occasion of retirement, I decided to devote myself to my hobbies.' } },
    ],
    notes: 'Slightly shorter/more casual variant of 〜を契機に. Very common in daily Japanese.',
  },
  {
    pattern: '〜において言えば',
    jlptLevel: 2,
    meaning: { en: 'In terms of / Speaking in terms of ~ / If we talk about ~' },
    formation: 'Noun + において言えば',
    examples: [
      { japanese: '技術において言えば、このシステムは優秀だ。', reading: 'ぎじゅつにおいていえば、このシステムはゆうしゅうだ。', translations: { en: 'In terms of technology, this system is excellent.' } },
      { japanese: '経験において言えば、彼女の方が上だ。', reading: 'けいけんにおいていえば、かのじょのほうがうえだ。', translations: { en: 'In terms of experience, she is superior.' } },
    ],
    notes: 'Formal topic framing. Directs attention to a specific evaluative dimension.',
  },
  {
    pattern: '〜つきで / 〜つきの',
    jlptLevel: 2,
    meaning: { en: 'With ~ included / Complete with / Equipped with' },
    formation: 'Noun + つきで / Noun + つきの + Noun',
    examples: [
      { japanese: '朝食つきで泊まれるホテルを予約した。', reading: 'ちょうしょくつきでとまれるホテルをよやくした。', translations: { en: 'I booked a hotel where I can stay with breakfast included.' } },
      { japanese: '駐車場つきのマンションを探している。', reading: 'ちゅうしゃじょうつきのマンションをさがしている。', translations: { en: 'I am looking for an apartment that comes with a parking space.' } },
    ],
    notes: 'Noun + 付き (つき). Describes something that comes with an added feature.',
  },
  {
    pattern: '〜向きに / 〜向けに (distinction)',
    jlptLevel: 2,
    meaning: { en: 'For ~ / Directed at ~ (functional comparison of 向き vs 向け)' },
    formation: 'Noun + 向き / Noun + 向け',
    examples: [
      { japanese: 'この教材は中級者向きだが、初心者向けの版もある。', reading: 'このきょうざいはちゅうきゅうしゃむきだが、しょしんしゃむけのはんもある。', translations: { en: 'This material is suited for intermediate learners, but there is also a version aimed at beginners.' } },
      { japanese: '南向きの窓から光が差し込む。', reading: 'みなみむきのまどからひかりがさしこむ。', translations: { en: 'Light streams in through the south-facing window.' } },
    ],
    notes: '向き = naturally suited / facing a direction. 向け = intentionally created for a target.',
  },
  {
    pattern: '〜かのように',
    jlptLevel: 2,
    meaning: { en: 'As if / As though (simile implying it is not actually so)' },
    formation: 'Verb/Adj plain form + かのように / Noun + であるかのように',
    examples: [
      { japanese: '何も知らないかのように振る舞った。', reading: 'なにもしらないかのようにふるまった。', translations: { en: 'He acted as if he knew nothing.' } },
      { japanese: '時間が止まったかのような静けさだった。', reading: 'じかんがとまったかのようなしずけさだった。', translations: { en: 'It was a stillness as if time had stopped.' } },
    ],
    notes: 'Describes behavior or appearance that resembles a false state. Stronger than ように alone.',
  },
  {
    pattern: '〜によると / 〜によれば',
    jlptLevel: 2,
    meaning: { en: 'According to ~ / Based on what ~ says' },
    formation: 'Noun + によると/によれば',
    examples: [
      { japanese: '天気予報によると、明日は雨らしい。', reading: 'てんきよほうによると、あしたはあめらしい。', translations: { en: 'According to the weather forecast, it seems it will rain tomorrow.' } },
      { japanese: '彼の話によれば、事故は朝に起きたそうだ。', reading: 'かれのはなしによれば、じこはあさにおきたそうだ。', translations: { en: 'According to what he says, the accident apparently occurred in the morning.' } },
    ],
    notes: 'Introduces hearsay information and its source. Followed by らしい/そうだ/という.',
  },
  {
    pattern: '〜ことに',
    jlptLevel: 2,
    meaning: { en: 'To my ~ (emotion) / Notably, ~ (emotional emphasis on a fact)' },
    formation: 'Adj な/い plain form + ことに',
    examples: [
      { japanese: '残念なことに、彼は来られなかった。', reading: 'ざんねんなことに、かれはこられなかった。', translations: { en: 'To my disappointment, he was unable to come.' } },
      { japanese: '驚いたことに、彼女は全問正解した。', reading: 'おどろいたことに、かのじょはぜんもんせいかいした。', translations: { en: 'To my surprise, she got every question right.' } },
    ],
    notes: 'Expresses the speaker\'s emotional response to a situation. Common with 残念, 驚いた, うれしい, etc.',
  },
  {
    pattern: '〜にしろ / 〜にせよ',
    jlptLevel: 2,
    meaning: { en: 'Whether ~ or ~ / Even if ~ / No matter whether ~' },
    formation: 'Verb/Adj plain form + にしろ/にせよ / Noun + にしろ/にせよ',
    examples: [
      { japanese: '賛成にせよ反対にせよ、意見を述べてほしい。', reading: 'さんせいにせよはんたいにせよ、いけんをのべてほしい。', translations: { en: 'Whether you are in favor or against, I want you to express your opinion.' } },
      { japanese: '失敗したにせよ、挑戦したことは評価される。', reading: 'しっぱいしたにせよ、ちょうせんしたことはひょうかされる。', translations: { en: 'Even if you failed, the fact that you challenged yourself is recognized.' } },
    ],
    notes: 'Formal. Lists contrasting or alternative conditions and asserts that the main clause holds for all.',
  },
  {
    pattern: '〜かたがた',
    jlptLevel: 2,
    meaning: { en: 'Combining two purposes at once / While doing ~ also doing ~' },
    formation: 'Noun + かたがた',
    examples: [
      { japanese: 'お礼かたがた、ご挨拶に伺いました。', reading: 'おれいかたがた、ごあいさつにうかがいました。', translations: { en: 'I came to visit to express my thanks and also to greet you.' } },
      { japanese: '散歩かたがた、郵便局に寄った。', reading: 'さんぽかたがた、ゆうびんきょくによった。', translations: { en: 'While on a walk, I also stopped by the post office.' } },
    ],
    notes: 'Formal. Used when one action serves two purposes at once. Similar to がてら but more polite.',
  },
  {
    pattern: '〜であれ',
    jlptLevel: 2,
    meaning: { en: 'Whether ~ or / Even if ~ / No matter what ~ (formal)' },
    formation: 'Noun + であれ / Adj な + であれ',
    examples: [
      { japanese: '理由が何であれ、暴力は許されない。', reading: 'りゆうがなんであれ、ぼうりょくはゆるされない。', translations: { en: 'No matter what the reason, violence is not permitted.' } },
      { japanese: '大人であれ子供であれ、ルールは守るべきだ。', reading: 'おとなであれこどもであれ、ルールはまもるべきだ。', translations: { en: 'Whether adult or child, rules should be followed.' } },
    ],
    notes: 'Literary/formal. Often used in pairs (A であれ B であれ) or standalone for a universal condition.',
  },
];
