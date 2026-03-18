/**
 * Thematic kanji groups for lesson-based learning.
 * Each group contains ~5 kanji organized by theme.
 */

export interface KanjiGroup {
  id: string;
  label: string;
  jlptLevel: number;
  kanjiChars: string[];
}

export const KANJI_GROUPS: KanjiGroup[] = [
  // ── N5 Groups ──
  { id: 'n5-numbers-1', label: 'Numbers 1-10', jlptLevel: 5, kanjiChars: ['一', '二', '三', '四', '五'] },
  { id: 'n5-numbers-2', label: 'Numbers 6-10', jlptLevel: 5, kanjiChars: ['六', '七', '八', '九', '十'] },
  { id: 'n5-numbers-3', label: 'Big Numbers', jlptLevel: 5, kanjiChars: ['百', '千', '万', '円'] },
  { id: 'n5-days', label: 'Days of Week', jlptLevel: 5, kanjiChars: ['日', '月', '火', '水', '木', '金', '土'] },
  { id: 'n5-time-1', label: 'Time Words 1', jlptLevel: 5, kanjiChars: ['年', '時', '間', '分', '半'] },
  { id: 'n5-time-2', label: 'Time Words 2', jlptLevel: 5, kanjiChars: ['今', '先', '後', '午', '前'] },
  { id: 'n5-time-3', label: 'Time Words 3', jlptLevel: 5, kanjiChars: ['毎', '週'] },
  { id: 'n5-people-1', label: 'People', jlptLevel: 5, kanjiChars: ['人', '子', '女', '男', '友'] },
  { id: 'n5-family', label: 'Family', jlptLevel: 5, kanjiChars: ['父', '母'] },
  { id: 'n5-body', label: 'Body Parts', jlptLevel: 5, kanjiChars: ['目', '耳', '口', '手', '足'] },
  { id: 'n5-nature-1', label: 'Nature 1', jlptLevel: 5, kanjiChars: ['山', '川', '天', '気', '雨'] },
  { id: 'n5-nature-2', label: 'Nature 2', jlptLevel: 5, kanjiChars: ['花', '空'] },
  { id: 'n5-direction', label: 'Directions', jlptLevel: 5, kanjiChars: ['上', '下', '中', '右', '左'] },
  { id: 'n5-size', label: 'Size & Quality', jlptLevel: 5, kanjiChars: ['大', '小', '高', '長', '多'] },
  { id: 'n5-adjectives', label: 'Adjectives', jlptLevel: 5, kanjiChars: ['新', '古', '白', '少', '安'] },
  { id: 'n5-school', label: 'School', jlptLevel: 5, kanjiChars: ['学', '校', '生', '先', '名'] },
  { id: 'n5-language', label: 'Language', jlptLevel: 5, kanjiChars: ['本', '語', '話', '読', '書'] },
  { id: 'n5-actions-1', label: 'Actions 1', jlptLevel: 5, kanjiChars: ['行', '来', '出', '入', '見'] },
  { id: 'n5-actions-2', label: 'Actions 2', jlptLevel: 5, kanjiChars: ['聞', '食', '飲', '買', '休'] },
  { id: 'n5-places', label: 'Places & Travel', jlptLevel: 5, kanjiChars: ['国', '外', '店', '車', '駅'] },
  { id: 'n5-misc', label: 'Common Kanji', jlptLevel: 5, kanjiChars: ['何', '社', '会', '道', '電'] },

  // ── N4 Groups ──
  { id: 'n4-actions-1', label: 'Actions & Verbs 1', jlptLevel: 4, kanjiChars: ['会', '発', '開', '動', '集'] },
  { id: 'n4-actions-2', label: 'Actions & Verbs 2', jlptLevel: 4, kanjiChars: ['使', '持', '走', '送', '売'] },
  { id: 'n4-actions-3', label: 'Actions & Verbs 3', jlptLevel: 4, kanjiChars: ['知', '考', '思', '作', '切'] },
  { id: 'n4-actions-4', label: 'Actions & Verbs 4', jlptLevel: 4, kanjiChars: ['写', '試', '注', '待', '急'] },
  { id: 'n4-movement', label: 'Movement', jlptLevel: 4, kanjiChars: ['通', '転', '運', '進', '歩'] },
  { id: 'n4-movement-2', label: 'Coming & Going', jlptLevel: 4, kanjiChars: ['起', '帰', '乗', '着', '届'] },
  { id: 'n4-society-1', label: 'Society 1', jlptLevel: 4, kanjiChars: ['社', '員', '部', '業', '仕'] },
  { id: 'n4-society-2', label: 'Society 2', jlptLevel: 4, kanjiChars: ['世', '代', '公', '族', '交'] },
  { id: 'n4-mind', label: 'Mind & Thought', jlptLevel: 4, kanjiChars: ['意', '心', '理', '問', '題'] },
  { id: 'n4-knowledge', label: 'Knowledge', jlptLevel: 4, kanjiChars: ['教', '文', '言', '計', '研'] },
  { id: 'n4-body-life', label: 'Body & Life', jlptLevel: 4, kanjiChars: ['体', '身', '医', '死', '去'] },
  { id: 'n4-nature', label: 'Nature & Seasons', jlptLevel: 4, kanjiChars: ['春', '夏', '秋', '冬', '海'] },
  { id: 'n4-places-1', label: 'Places', jlptLevel: 4, kanjiChars: ['場', '地', '屋', '店', '院'] },
  { id: 'n4-directions', label: 'Directions', jlptLevel: 4, kanjiChars: ['北', '南', '東', '西', '近'] },
  { id: 'n4-qualities-1', label: 'Qualities 1', jlptLevel: 4, kanjiChars: ['強', '正', '安', '特', '重'] },
  { id: 'n4-qualities-2', label: 'Qualities 2', jlptLevel: 4, kanjiChars: ['多', '広', '明', '不', '別'] },
  { id: 'n4-abstract', label: 'Abstract Concepts', jlptLevel: 4, kanjiChars: ['自', '合', '有', '以', '用'] },
  { id: 'n4-abstract-2', label: 'Events & Things', jlptLevel: 4, kanjiChars: ['事', '物', '品', '質', '味'] },
  { id: 'n4-daily', label: 'Daily Life', jlptLevel: 4, kanjiChars: ['家', '番', '野', '画', '色'] },
  { id: 'n4-more', label: 'More Kanji', jlptLevel: 4, kanjiChars: ['立', '力', '田', '主', '花'] },
  { id: 'n4-extra', label: 'Additional', jlptLevel: 4, kanjiChars: ['度', '界', '元', '京', '道'] },
  { id: 'n4-misc', label: 'Mixed N4', jlptLevel: 4, kanjiChars: ['始', '終', '習', '楽', '受'] },
  { id: 'n4-misc-2', label: 'More Mixed', jlptLevel: 4, kanjiChars: ['産', '工', '払', '引', '止'] },
  { id: 'n4-misc-3', label: 'Final Group', jlptLevel: 4, kanjiChars: ['内', '外', '風', '者'] },

  // ── N3 Groups ──
  { id: 'n3-government', label: 'Government & Law', jlptLevel: 3, kanjiChars: ['政', '議', '民', '連', '対'] },
  { id: 'n3-law', label: 'Law & Rights', jlptLevel: 3, kanjiChars: ['制', '法', '権', '判', '選'] },
  { id: 'n3-economy-1', label: 'Economy 1', jlptLevel: 3, kanjiChars: ['経', '済', '費', '際', '収'] },
  { id: 'n3-economy-2', label: 'Economy 2', jlptLevel: 3, kanjiChars: ['増', '減', '税', '額', '貿'] },
  { id: 'n3-communication', label: 'Communication', jlptLevel: 3, kanjiChars: ['報', '告', '記', '表', '説'] },
  { id: 'n3-information', label: 'Information', jlptLevel: 3, kanjiChars: ['談', '伝', '放', '示', '認'] },
  { id: 'n3-people', label: 'People & Relations', jlptLevel: 3, kanjiChars: ['性', '格', '命', '約', '仲'] },
  { id: 'n3-age', label: 'Age & Marriage', jlptLevel: 3, kanjiChars: ['老', '若', '婚', '相', '配'] },
  { id: 'n3-actions-1', label: 'Actions 1', jlptLevel: 3, kanjiChars: ['打', '投', '取', '決', '求'] },
  { id: 'n3-actions-2', label: 'Actions 2', jlptLevel: 3, kanjiChars: ['保', '指', '移', '設', '供'] },
  { id: 'n3-nature', label: 'Nature & Science', jlptLevel: 3, kanjiChars: ['光', '熱', '港', '石', '林'] },
  { id: 'n3-preparation', label: 'Preparation', jlptLevel: 3, kanjiChars: ['予', '防', '豊', '積', '険'] },
  { id: 'n3-abstract-1', label: 'Abstract 1', jlptLevel: 3, kanjiChars: ['現', '実', '確', '状', '能'] },
  { id: 'n3-abstract-2', label: 'Abstract 2', jlptLevel: 3, kanjiChars: ['変', '件', '容', '値', '基'] },
  { id: 'n3-knowledge', label: 'Knowledge', jlptLevel: 3, kanjiChars: ['育', '査', '験', '比', '率'] },
  { id: 'n3-systems', label: 'Systems & Rules', jlptLevel: 3, kanjiChars: ['規', '術', '勢', '論', '構'] },
  { id: 'n3-emotions', label: 'Emotions', jlptLevel: 3, kanjiChars: ['感', '情', '望', '信', '禁'] },
  { id: 'n3-society', label: 'Society & Life', jlptLevel: 3, kanjiChars: ['居', '住', '職', '原', '因'] },
  { id: 'n3-depth', label: 'Depth & Position', jlptLevel: 3, kanjiChars: ['深', '付', '側', '労', '向'] },
  { id: 'n3-completion', label: 'Completion', jlptLevel: 3, kanjiChars: ['完', '全', '絶', '満', '末'] },
  { id: 'n3-time', label: 'Time & Change', jlptLevel: 3, kanjiChars: ['期', '然', '由', '久', '歴'] },
  { id: 'n3-response', label: 'Response & Retreat', jlptLevel: 3, kanjiChars: ['応', '退', '刊', '則', '程'] },
  { id: 'n3-body', label: 'Body & Health', jlptLevel: 3, kanjiChars: ['呼', '痛', '症', '骨', '皮'] },
  { id: 'n3-materials', label: 'Materials', jlptLevel: 3, kanjiChars: ['鉄', '銀', '銅', '油', '布'] },
  { id: 'n3-actions-3', label: 'More Actions', jlptLevel: 3, kanjiChars: ['返', '並', '捕', '押', '換'] },
  { id: 'n3-adjectives', label: 'Adjectives', jlptLevel: 3, kanjiChars: ['厚', '暖', '涼', '複', '優'] },
  { id: 'n3-groups', label: 'Groups & Systems', jlptLevel: 3, kanjiChars: ['組', '団', '協', '域', '観'] },
  { id: 'n3-standards', label: 'Standards', jlptLevel: 3, kanjiChars: ['環', '準', '責', '限', '象'] },
  { id: 'n3-misc', label: 'Mixed N3', jlptLevel: 3, kanjiChars: ['紙', '悪', '混', '奥', '破'] },
  { id: 'n3-misc-2', label: 'More Mixed', jlptLevel: 3, kanjiChars: ['預', '討', '境', '半'] },
];

/**
 * Get groups for a specific JLPT level.
 */
export function getGroupsForLevel(level: number): KanjiGroup[] {
  return KANJI_GROUPS.filter((g) => g.jlptLevel === level);
}
