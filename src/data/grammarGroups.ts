/**
 * Topic-based grammar groups for lesson-based learning.
 * Groups reference grammar patterns by their `pattern` string.
 */

export interface GrammarGroup {
  id: string;
  label: string;
  jlptLevel: number;
  /** Patterns to include (matched against grammar_points.pattern) */
  patterns: string[];
}

export const GRAMMAR_GROUPS: GrammarGroup[] = [
  // ── N5 Groups ──
  { id: 'n5-copula', label: 'Copula & Basics', jlptLevel: 5, patterns: ['〜です', '〜ではありません / 〜じゃありません', '〜ますform', '〜ません', '〜ました'] },
  { id: 'n5-particles-1', label: 'Core Particles', jlptLevel: 5, patterns: ['〜は (topic marker)', '〜が (subject marker)', '〜を (object marker)', '〜の (possessive / modifier)'] },
  { id: 'n5-particles-2', label: 'More Particles', jlptLevel: 5, patterns: ['〜に (target/time)', '〜で (location of action / means)', '〜と (and / with / quotation)', '〜へ (direction)'] },
  { id: 'n5-particles-3', label: 'Particle Extras', jlptLevel: 5, patterns: ['〜から (from) / 〜まで (until)', '〜も (also)', '〜か (question)'] },
  { id: 'n5-adjectives', label: 'Adjectives', jlptLevel: 5, patterns: ['い-adjective (present)', 'な-adjective (present)', 'い-adjective (negative)'] },
  { id: 'n5-existence', label: 'Existence & Location', jlptLevel: 5, patterns: ['〜がいます', '〜があります'] },
  { id: 'n5-desire', label: 'Wants & Requests', jlptLevel: 5, patterns: ['〜たいです', '〜てください', '〜ましょう', '〜ませんか', '〜をください'] },
  { id: 'n5-te-form', label: 'Te-form Patterns', jlptLevel: 5, patterns: ['〜ている', '〜てもいいですか', '〜てはいけません', '〜て (connecting)'] },
  { id: 'n5-time', label: 'Time & Sequence', jlptLevel: 5, patterns: ['〜前に (before)', '〜後で (after)', '〜から (because)', '〜なければなりません', '〜なくてもいいです'] },
  { id: 'n5-comparison', label: 'Comparisons & Questions', jlptLevel: 5, patterns: ['〜より', '〜のほうが', '一番', '〜つ (counter)', '何 / なに / なん'] },

  // ── N4 Groups ──
  { id: 'n4-te-compounds', label: 'て-form Compounds', jlptLevel: 4, patterns: ['〜ている', '〜てある', '〜ておく', '〜てしまう', '〜てみる'] },
  { id: 'n4-verb-forms', label: 'Verb Forms', jlptLevel: 4, patterns: ['〜たい / 〜たがる', 'Potential form (〜える/〜られる)', 'Passive form (〜れる/〜られる)', '〜させる (Causative)'] },
  { id: 'n4-conditionals', label: 'Conditionals (if/when)', jlptLevel: 4, patterns: ['〜たら', '〜ば', '〜なら', '〜と (conditional)'] },
  { id: 'n4-giving', label: 'Giving & Receiving', jlptLevel: 4, patterns: ['〜てあげる / 〜てもらう / 〜てくれる'] },
  { id: 'n4-hearsay', label: 'Quoting & Hearsay', jlptLevel: 4, patterns: ['〜そうだ (hearsay)', '〜そうだ (appearance)', '〜ようだ / 〜みたいだ', '〜らしい'] },
  { id: 'n4-obligation', label: 'Obligation & Permission', jlptLevel: 4, patterns: ['〜なければならない / 〜なくてはいけない', '〜なくてもいい', '〜はずだ'] },
  { id: 'n4-intention', label: 'Intention & Effort', jlptLevel: 4, patterns: ['〜つもりだ', '〜ようにする', '〜ようになる'] },
  { id: 'n4-listing', label: 'Listing & Connection', jlptLevel: 4, patterns: ['〜し〜し', '〜たり〜たりする', '〜のに'] },
  { id: 'n4-experience', label: 'Experience & Decision', jlptLevel: 4, patterns: ['〜ことがある', '〜ことにする / 〜ことになる', '〜ために'] },
  { id: 'n4-degree', label: 'Degree & Ease', jlptLevel: 4, patterns: ['〜すぎる', '〜やすい / 〜にくい', '〜方 (かた)', '〜ほど (extent)'] },
  { id: 'n4-honorifics', label: 'Basic Honorifics', jlptLevel: 4, patterns: ['お/ご〜になる (respectful)', 'お/ご〜する (humble)'] },
  { id: 'n4-extra', label: 'More Patterns', jlptLevel: 4, patterns: ['〜てほしい', '〜ながら', '〜てくる / 〜ていく', '〜てもらえませんか'] },
  { id: 'n4-extra-2', label: 'Advanced Patterns', jlptLevel: 4, patterns: ['〜ても', '〜ところだ', '〜ばかり', '〜ことができる'] },
  { id: 'n4-extra-3', label: 'More Advanced', jlptLevel: 4, patterns: ['〜まま', '〜はずがない', '〜かどうか', '〜間に / 〜間', '〜てから'] },

  // ── N3 Groups ──
  { id: 'n3-cause', label: 'Cause & Reason', jlptLevel: 3, patterns: ['〜ために (cause)', '〜おかげで / 〜せいで', '〜によって / 〜により', '〜として'] },
  { id: 'n3-contrast', label: 'Contrast & Concession', jlptLevel: 3, patterns: ['〜一方で', '〜にもかかわらず', '〜くせに', '〜わりに', '〜ものの'] },
  { id: 'n3-tendency', label: 'Tendency & Frequency', jlptLevel: 3, patterns: ['〜がちだ', '〜っぽい', '〜たびに', '〜ことから', '〜ことなく'] },
  { id: 'n3-degree', label: 'Degree & Extent', jlptLevel: 3, patterns: ['〜ほど〜ない', '〜ば〜ほど', '〜向き / 〜向け'] },
  { id: 'n3-transition', label: 'Conjunctions', jlptLevel: 3, patterns: ['〜上で', '〜うちに', '〜次第', '〜にかけて'] },
  { id: 'n3-manner', label: 'Manner & Expression', jlptLevel: 3, patterns: ['〜とおり / 〜どおり', '〜ようにする', '〜ことは〜が'] },
  { id: 'n3-passive-formal', label: 'Passive & Hearsay', jlptLevel: 3, patterns: ['〜ことになっている', '〜ということだ', '〜と言われている'] },
  { id: 'n3-purpose', label: 'Purpose & Result', jlptLevel: 3, patterns: ['〜ように (purpose)', '〜ようとする', '〜結果'] },
  { id: 'n3-limitation', label: 'Limitation & Scope', jlptLevel: 3, patterns: ['〜に限る', '〜に限らず', '〜しかない', '〜わけがない', '〜わけにはいかない'] },
  { id: 'n3-emotions', label: 'Emotions & Memory', jlptLevel: 3, patterns: ['〜ことに', '〜ものだ (emotion/memory)', '〜ものだから'] },
  { id: 'n3-formal', label: 'Formal Expressions', jlptLevel: 3, patterns: ['〜に関して / 〜に関する', '〜において / 〜における', '〜をはじめ', '〜を中心に'] },
  { id: 'n3-perspective', label: 'Perspective & Change', jlptLevel: 3, patterns: ['〜に対して', '〜からすると / 〜から見ると', '〜に伴って / 〜に伴い', '〜ついでに', '〜を通じて / 〜を通して'] },

  // ── N2 Groups ──
  { id: 'n2-emphasis', label: 'Emphasis & Assertion', jlptLevel: 2, patterns: ['〜からこそ', '〜こそ', '〜さえ〜ば', '〜どころか', '〜にすぎない'] },
  { id: 'n2-formal-conj', label: 'Formal Conjunctions', jlptLevel: 2, patterns: ['〜に基づいて / 〜に基づく', '〜に応じて', '〜につれて / 〜に従って', '〜をもとに', '〜に沿って'] },
  { id: 'n2-negation', label: 'Negation & Limitation', jlptLevel: 2, patterns: ['〜ざるを得ない', '〜ないわけにはいかない', '〜に限って / 〜に限り', '〜からには / 〜以上は', '〜っぱなし'] },
  { id: 'n2-time', label: 'Time & Sequence', jlptLevel: 2, patterns: ['〜て以来 / 〜以来', '〜たとたん(に)', '〜末に / 〜の末', '〜にあたって / 〜に際して', '〜最中に'] },
  { id: 'n2-appearance', label: 'Appearance & Possibility', jlptLevel: 2, patterns: ['〜気味', '〜かねない', '〜かねる', '〜とは限らない', '〜に違いない'] },
  { id: 'n2-written', label: 'Written/Formal', jlptLevel: 2, patterns: ['〜に過ぎない', '〜上(は)', '〜にわたって', '〜を問わず', '〜に反して', '〜をきっかけに'] },
];

export function getGrammarGroupsForLevel(level: number): GrammarGroup[] {
  return GRAMMAR_GROUPS.filter((g) => g.jlptLevel === level);
}
