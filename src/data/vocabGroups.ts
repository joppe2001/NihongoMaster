/**
 * Thematic vocabulary groups for lesson-based learning.
 * Groups are filter-based (match by tags/POS) rather than hardcoded word lists.
 */

export interface VocabGroup {
  id: string;
  label: string;
  jlptLevel: number;
  /** Filter by tags (OR logic — match any) */
  tags?: string[];
  /** Filter by part of speech (OR logic) */
  pos?: string[];
  /** Max items per lesson group */
  maxItems?: number;
}

export const VOCAB_GROUPS: VocabGroup[] = [
  // ── N5 Groups ──
  { id: 'n5-greetings', label: 'Greetings & Basics', jlptLevel: 5, tags: ['greetings'], maxItems: 10 },
  { id: 'n5-pronouns', label: 'Pronouns & People', jlptLevel: 5, tags: ['pronouns', 'people'], maxItems: 10 },
  { id: 'n5-family', label: 'Family', jlptLevel: 5, tags: ['family'], maxItems: 10 },
  { id: 'n5-time', label: 'Time & Calendar', jlptLevel: 5, tags: ['time', 'calendar'], maxItems: 10 },
  { id: 'n5-places', label: 'Places & Buildings', jlptLevel: 5, tags: ['places'], maxItems: 10 },
  { id: 'n5-food', label: 'Food & Drink', jlptLevel: 5, tags: ['food', 'drink'], maxItems: 10 },
  { id: 'n5-body', label: 'Body & Health', jlptLevel: 5, tags: ['body', 'health'], maxItems: 10 },
  { id: 'n5-nature', label: 'Nature & Weather', jlptLevel: 5, tags: ['nature', 'weather'], maxItems: 10 },
  { id: 'n5-ichidan', label: 'Ichidan Verbs', jlptLevel: 5, pos: ['verb-ichidan'], maxItems: 10 },
  { id: 'n5-godan', label: 'Godan Verbs', jlptLevel: 5, pos: ['verb-godan'], maxItems: 10 },
  { id: 'n5-iadj', label: 'い-Adjectives', jlptLevel: 5, pos: ['i-adjective'], maxItems: 10 },
  { id: 'n5-nadj', label: 'な-Adjectives', jlptLevel: 5, pos: ['na-adjective'], maxItems: 10 },
  { id: 'n5-numbers', label: 'Numbers & Counting', jlptLevel: 5, tags: ['numbers', 'counters'], maxItems: 10 },
  { id: 'n5-transport', label: 'Transport', jlptLevel: 5, tags: ['transport'], maxItems: 10 },
  { id: 'n5-objects', label: 'Objects & Things', jlptLevel: 5, tags: ['objects'], maxItems: 10 },
  { id: 'n5-clothing', label: 'Clothing', jlptLevel: 5, tags: ['clothing'], maxItems: 10 },

  // ── N4 Groups ──
  { id: 'n4-ichidan', label: 'Ichidan Verbs', jlptLevel: 4, pos: ['verb-ichidan'], maxItems: 10 },
  { id: 'n4-godan', label: 'Godan Verbs', jlptLevel: 4, pos: ['verb-godan'], maxItems: 10 },
  { id: 'n4-suru', label: 'する Verbs', jlptLevel: 4, pos: ['verb-suru'], maxItems: 10 },
  { id: 'n4-iadj', label: 'い-Adjectives', jlptLevel: 4, pos: ['i-adjective'], maxItems: 10 },
  { id: 'n4-nadj', label: 'な-Adjectives', jlptLevel: 4, pos: ['na-adjective'], maxItems: 10 },
  { id: 'n4-emotions', label: 'Emotions', jlptLevel: 4, tags: ['emotions'], maxItems: 10 },
  { id: 'n4-work', label: 'Work & Business', jlptLevel: 4, tags: ['work'], maxItems: 10 },
  { id: 'n4-education', label: 'Education', jlptLevel: 4, tags: ['education'], maxItems: 10 },
  { id: 'n4-travel', label: 'Travel & Transport', jlptLevel: 4, tags: ['travel', 'transport'], maxItems: 10 },
  { id: 'n4-food', label: 'Food & Cooking', jlptLevel: 4, tags: ['food', 'cooking'], maxItems: 10 },
  { id: 'n4-daily', label: 'Daily Life', jlptLevel: 4, tags: ['daily'], maxItems: 10 },
  { id: 'n4-health', label: 'Body & Health', jlptLevel: 4, tags: ['body', 'health'], maxItems: 10 },
  { id: 'n4-nature', label: 'Nature & Weather', jlptLevel: 4, tags: ['nature', 'weather'], maxItems: 10 },
  { id: 'n4-culture', label: 'Japanese Culture', jlptLevel: 4, tags: ['japanese-culture'], maxItems: 10 },
  { id: 'n4-expressions', label: 'Expressions', jlptLevel: 4, tags: ['expressions', 'greetings'], maxItems: 10 },
  { id: 'n4-adverbs', label: 'Adverbs', jlptLevel: 4, pos: ['adverb'], maxItems: 10 },
  { id: 'n4-onomatopoeia', label: 'Onomatopoeia', jlptLevel: 4, tags: ['onomatopoeia'], maxItems: 10 },
  { id: 'n4-counters', label: 'Counters', jlptLevel: 4, pos: ['counter'], maxItems: 10 },
  { id: 'n4-shopping', label: 'Shopping & Money', jlptLevel: 4, tags: ['shopping'], maxItems: 10 },

  // ── N3 Groups ──
  { id: 'n3-ichidan', label: 'Ichidan Verbs', jlptLevel: 3, pos: ['verb-ichidan'], maxItems: 12 },
  { id: 'n3-godan', label: 'Godan Verbs', jlptLevel: 3, pos: ['verb-godan'], maxItems: 12 },
  { id: 'n3-suru', label: 'する Verbs', jlptLevel: 3, pos: ['verb-suru'], maxItems: 12 },
  { id: 'n3-iadj', label: 'い-Adjectives', jlptLevel: 3, pos: ['i-adjective'], maxItems: 12 },
  { id: 'n3-nadj', label: 'な-Adjectives', jlptLevel: 3, pos: ['na-adjective'], maxItems: 12 },
  { id: 'n3-society', label: 'Society & Politics', jlptLevel: 3, tags: ['society'], maxItems: 12 },
  { id: 'n3-work', label: 'Work & Career', jlptLevel: 3, tags: ['work'], maxItems: 12 },
  { id: 'n3-education', label: 'Education', jlptLevel: 3, tags: ['education'], maxItems: 12 },
  { id: 'n3-nature', label: 'Nature & Environment', jlptLevel: 3, tags: ['nature'], maxItems: 12 },
  { id: 'n3-health', label: 'Health & Medicine', jlptLevel: 3, tags: ['health'], maxItems: 12 },
  { id: 'n3-emotions', label: 'Emotions', jlptLevel: 3, tags: ['emotions'], maxItems: 12 },
  { id: 'n3-technology', label: 'Technology', jlptLevel: 3, tags: ['technology'], maxItems: 12 },
  { id: 'n3-culture', label: 'Culture', jlptLevel: 3, tags: ['culture'], maxItems: 12 },
  { id: 'n3-media', label: 'Media & Communication', jlptLevel: 3, tags: ['media'], maxItems: 12 },
  { id: 'n3-transport', label: 'Transport & Travel', jlptLevel: 3, tags: ['transport', 'travel'], maxItems: 12 },
  { id: 'n3-daily', label: 'Daily Life', jlptLevel: 3, tags: ['daily'], maxItems: 12 },
  { id: 'n3-adverbs', label: 'Adverbs', jlptLevel: 3, pos: ['adverb'], maxItems: 12 },
  { id: 'n3-conjunctions', label: 'Conjunctions', jlptLevel: 3, pos: ['conjunction'], maxItems: 12 },
  { id: 'n3-expressions', label: 'Expressions', jlptLevel: 3, tags: ['expressions'], maxItems: 12 },
  { id: 'n3-places', label: 'Places', jlptLevel: 3, tags: ['places'], maxItems: 12 },
  { id: 'n3-food', label: 'Food & Cooking', jlptLevel: 3, tags: ['food'], maxItems: 12 },
  { id: 'n3-sports', label: 'Sports', jlptLevel: 3, tags: ['sports'], maxItems: 12 },
  { id: 'n3-family', label: 'Family & Relationships', jlptLevel: 3, tags: ['family'], maxItems: 12 },
  { id: 'n3-entertainment', label: 'Entertainment', jlptLevel: 3, tags: ['entertainment'], maxItems: 12 },
  { id: 'n3-onomatopoeia', label: 'Onomatopoeia', jlptLevel: 3, tags: ['onomatopoeia'], maxItems: 12 },

  // ── N2 Groups ──
  { id: 'n2-ichidan', label: 'Ichidan Verbs', jlptLevel: 2, pos: ['verb-ichidan'], maxItems: 12 },
  { id: 'n2-godan', label: 'Godan Verbs', jlptLevel: 2, pos: ['verb-godan'], maxItems: 12 },
  { id: 'n2-suru', label: 'する Verbs', jlptLevel: 2, pos: ['verb-suru'], maxItems: 12 },
  { id: 'n2-iadj', label: 'い-Adjectives', jlptLevel: 2, pos: ['i-adjective'], maxItems: 12 },
  { id: 'n2-nadj', label: 'な-Adjectives', jlptLevel: 2, pos: ['na-adjective'], maxItems: 12 },
  { id: 'n2-adverbs', label: 'Adverbs', jlptLevel: 2, pos: ['adverb'], maxItems: 12 },
  { id: 'n2-society', label: 'Society & Politics', jlptLevel: 2, tags: ['society', 'politics'], maxItems: 12 },
  { id: 'n2-work', label: 'Work & Economics', jlptLevel: 2, tags: ['work', 'economics'], maxItems: 12 },
  { id: 'n2-education', label: 'Education & Academic', jlptLevel: 2, tags: ['education', 'academic'], maxItems: 12 },
  { id: 'n2-science', label: 'Science & Technology', jlptLevel: 2, tags: ['science', 'technology'], maxItems: 12 },
  { id: 'n2-nature', label: 'Nature & Environment', jlptLevel: 2, tags: ['nature', 'environment'], maxItems: 12 },
  { id: 'n2-health', label: 'Health & Medicine', jlptLevel: 2, tags: ['health', 'medicine'], maxItems: 12 },
  { id: 'n2-culture', label: 'Arts & Culture', jlptLevel: 2, tags: ['culture', 'arts'], maxItems: 12 },
  { id: 'n2-law', label: 'Law & Administration', jlptLevel: 2, tags: ['law', 'formal'], maxItems: 12 },
  { id: 'n2-expressions', label: 'Formal Expressions', jlptLevel: 2, tags: ['expressions', 'formal'], maxItems: 12 },
];

export function getVocabGroupsForLevel(level: number): VocabGroup[] {
  return VOCAB_GROUPS.filter((g) => g.jlptLevel === level);
}
