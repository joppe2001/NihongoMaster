/**
 * Japanese verb and adjective conjugation engine.
 * Handles ichidan, godan, irregular verbs, and adjectives.
 */

export type ConjugationForm =
  | 'masu'        // polite present
  | 'masen'       // polite negative
  | 'mashita'     // polite past
  | 'masendeshita'// polite past negative
  | 'te'          // te-form
  | 'ta'          // casual past
  | 'nai'         // casual negative
  | 'nakatta'     // casual past negative
  | 'potential'   // can do
  | 'volitional'  // let's / shall
  | 'imperative'  // command
  | 'conditional' // ba-form
  | 'tai'         // want to
  | 'passive'     // is done
  | 'causative';  // make/let do

export interface ConjugationResult {
  form: ConjugationForm;
  formLabel: string;
  result: string;
  reading: string;
}

// ── Godan verb ending mappings ──
const GODAN_STEMS: Record<string, { i: string; a: string; e: string; o: string; te: string; ta: string }> = {
  'う': { i: 'い', a: 'わ', e: 'え', o: 'お', te: 'って', ta: 'った' },
  'く': { i: 'き', a: 'か', e: 'け', o: 'こ', te: 'いて', ta: 'いた' },
  'ぐ': { i: 'ぎ', a: 'が', e: 'げ', o: 'ご', te: 'いで', ta: 'いだ' },
  'す': { i: 'し', a: 'さ', e: 'せ', o: 'そ', te: 'して', ta: 'した' },
  'つ': { i: 'ち', a: 'た', e: 'て', o: 'と', te: 'って', ta: 'った' },
  'ぬ': { i: 'に', a: 'な', e: 'ね', o: 'の', te: 'んで', ta: 'んだ' },
  'ぶ': { i: 'び', a: 'ば', e: 'べ', o: 'ぼ', te: 'んで', ta: 'んだ' },
  'む': { i: 'み', a: 'ま', e: 'め', o: 'も', te: 'んで', ta: 'んだ' },
  'る': { i: 'り', a: 'ら', e: 'れ', o: 'ろ', te: 'って', ta: 'った' },
};

// ── Irregular verbs ──
const IRREGULAR: Record<string, Record<ConjugationForm, string>> = {
  'する': {
    masu: 'します', masen: 'しません', mashita: 'しました', masendeshita: 'しませんでした',
    te: 'して', ta: 'した', nai: 'しない', nakatta: 'しなかった',
    potential: 'できる', volitional: 'しよう', imperative: 'しろ',
    conditional: 'すれば', tai: 'したい', passive: 'される', causative: 'させる',
  },
  '来る': {
    masu: '来ます', masen: '来ません', mashita: '来ました', masendeshita: '来ませんでした',
    te: '来て', ta: '来た', nai: '来ない', nakatta: '来なかった',
    potential: '来られる', volitional: '来よう', imperative: '来い',
    conditional: '来れば', tai: '来たい', passive: '来られる', causative: '来させる',
  },
  'くる': {
    masu: 'きます', masen: 'きません', mashita: 'きました', masendeshita: 'きませんでした',
    te: 'きて', ta: 'きた', nai: 'こない', nakatta: 'こなかった',
    potential: 'こられる', volitional: 'こよう', imperative: 'こい',
    conditional: 'くれば', tai: 'きたい', passive: 'こられる', causative: 'こさせる',
  },
  '行く': {
    masu: '行きます', masen: '行きません', mashita: '行きました', masendeshita: '行きませんでした',
    te: '行って', ta: '行った', nai: '行かない', nakatta: '行かなかった',
    potential: '行ける', volitional: '行こう', imperative: '行け',
    conditional: '行けば', tai: '行きたい', passive: '行かれる', causative: '行かせる',
  },
};

const FORM_LABELS: Record<ConjugationForm, string> = {
  masu: 'Polite (ます)', masen: 'Polite Negative', mashita: 'Polite Past', masendeshita: 'Polite Past Neg.',
  te: 'て-form', ta: 'Casual Past', nai: 'Negative (ない)', nakatta: 'Past Negative',
  potential: 'Potential (can)', volitional: 'Volitional (let\'s)', imperative: 'Imperative',
  conditional: 'Conditional (ば)', tai: 'Want to (たい)', passive: 'Passive', causative: 'Causative',
};

/**
 * Detect verb type from dictionary form and POS tag.
 */
export function detectVerbType(word: string, pos: string): 'ichidan' | 'godan' | 'irregular' | 'suru' | 'unknown' {
  if (pos === 'verb-suru' || word.endsWith('する')) return 'suru';
  if (IRREGULAR[word]) return 'irregular';
  if (pos === 'verb-ichidan') return 'ichidan';
  if (pos === 'verb-godan') return 'godan';
  // Heuristic for unmarked verbs
  if (word.endsWith('る')) {
    const secondLast = word.slice(-2, -1);
    // Common ichidan endings: え-row or い-row before る
    if ('えけせてねべめれげぜでいきしちにびみり'.includes(secondLast)) return 'ichidan';
    return 'godan';
  }
  return 'godan';
}

/**
 * Conjugate a verb to the specified form.
 * Returns the conjugated word, or null if unable.
 */
export function conjugateVerb(word: string, reading: string, pos: string, form: ConjugationForm): string | null {
  // Check irregular first
  if (IRREGULAR[word]?.[form]) return IRREGULAR[word][form];

  const type = detectVerbType(word, pos);

  if (type === 'suru') {
    // する compound: replace する with irregular form
    const stem = word.slice(0, -2);
    const suruForm = IRREGULAR['する'][form];
    return suruForm ? stem + suruForm : null;
  }

  if (type === 'ichidan') return conjugateIchidan(word, form);
  if (type === 'godan') return conjugateGodan(word, reading, form);

  return null;
}

function conjugateIchidan(word: string, form: ConjugationForm): string | null {
  const stem = word.slice(0, -1); // Drop る

  switch (form) {
    case 'masu': return stem + 'ます';
    case 'masen': return stem + 'ません';
    case 'mashita': return stem + 'ました';
    case 'masendeshita': return stem + 'ませんでした';
    case 'te': return stem + 'て';
    case 'ta': return stem + 'た';
    case 'nai': return stem + 'ない';
    case 'nakatta': return stem + 'なかった';
    case 'potential': return stem + 'られる';
    case 'volitional': return stem + 'よう';
    case 'imperative': return stem + 'ろ';
    case 'conditional': return stem + 'れば';
    case 'tai': return stem + 'たい';
    case 'passive': return stem + 'られる';
    case 'causative': return stem + 'させる';
    default: return null;
  }
}

function conjugateGodan(word: string, _reading: string, form: ConjugationForm): string | null {
  const lastChar = word.slice(-1);
  const stemMap = GODAN_STEMS[lastChar];
  if (!stemMap) return null;

  const stem = word.slice(0, -1);

  switch (form) {
    case 'masu': return stem + stemMap.i + 'ます';
    case 'masen': return stem + stemMap.i + 'ません';
    case 'mashita': return stem + stemMap.i + 'ました';
    case 'masendeshita': return stem + stemMap.i + 'ませんでした';
    case 'te': return stem + stemMap.te;
    case 'ta': return stem + stemMap.ta;
    case 'nai': return stem + stemMap.a + 'ない';
    case 'nakatta': return stem + stemMap.a + 'なかった';
    case 'potential': return stem + stemMap.e + 'る';
    case 'volitional': return stem + stemMap.o + 'う';
    case 'imperative': return stem + stemMap.e;
    case 'conditional': return stem + stemMap.e + 'ば';
    case 'tai': return stem + stemMap.i + 'たい';
    case 'passive': return stem + stemMap.a + 'れる';
    case 'causative': return stem + stemMap.a + 'せる';
    default: return null;
  }
}

/**
 * Get all conjugation forms for a verb (for display/reference).
 */
export function getAllConjugations(word: string, reading: string, pos: string): ConjugationResult[] {
  const forms: ConjugationForm[] = ['masu', 'masen', 'mashita', 'te', 'ta', 'nai', 'nakatta', 'tai', 'potential', 'volitional', 'conditional', 'passive', 'causative'];

  return forms
    .map((form) => {
      const result = conjugateVerb(word, reading, pos, form);
      if (!result) return null;
      return { form, formLabel: FORM_LABELS[form], result, reading: result };
    })
    .filter((r): r is ConjugationResult => r !== null);
}

/**
 * Generate plausible wrong conjugation answers (distractors).
 */
export function generateConjugationDistractors(
  word: string,
  reading: string,
  pos: string,
  correctForm: ConjugationForm,
  count: number = 3
): string[] {
  const allForms: ConjugationForm[] = ['masu', 'te', 'ta', 'nai', 'potential', 'tai', 'passive', 'causative'];
  const distractorForms = allForms.filter((f) => f !== correctForm);

  const distractors: string[] = [];
  const shuffled = distractorForms.sort(() => Math.random() - 0.5);

  for (const form of shuffled) {
    if (distractors.length >= count) break;
    const result = conjugateVerb(word, reading, pos, form);
    if (result) distractors.push(result);
  }

  return distractors;
}
