/**
 * N3 Vocabulary dataset — Part 5: More compound nouns, formal expressions (250 words).
 */

import type { VocabEntry } from './vocabN5';

export const VOCAB_N3_PART5: VocabEntry[] = [
  // ── Compound Nouns: Science & Tech ──
  { word: '人工知能', reading: 'じんこうちのう', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['artificial intelligence', 'AI'] }, frequencyRank: 1451, tags: ['nouns', 'technology'] },
  { word: '再生可能', reading: 'さいせいかのう', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['renewable'] }, frequencyRank: 1452, tags: ['nouns', 'technology', 'nature'] },
  { word: '太陽光', reading: 'たいようこう', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['sunlight', 'solar'] }, frequencyRank: 1453, tags: ['nouns', 'nature'] },
  { word: '原子力', reading: 'げんしりょく', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['atomic energy', 'nuclear power'] }, frequencyRank: 1454, tags: ['nouns', 'technology'] },
  { word: '温暖化', reading: 'おんだんか', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['warming (climate)'] }, frequencyRank: 1455, tags: ['nouns', 'nature'] },
  { word: '排出', reading: 'はいしゅつ', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['emission', 'discharge'] }, frequencyRank: 1456, tags: ['nouns', 'nature'] },
  { word: '遺伝子', reading: 'いでんし', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['gene'] }, frequencyRank: 1457, tags: ['nouns', 'technology'] },
  { word: '細胞', reading: 'さいぼう', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['cell (biology)'] }, frequencyRank: 1458, tags: ['nouns', 'technology'] },
  { word: '開発', reading: 'かいはつ', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['development'] }, frequencyRank: 1459, tags: ['nouns', 'technology', 'work'] },
  { word: '発明', reading: 'はつめい', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['invention'] }, frequencyRank: 1460, tags: ['nouns', 'technology'] },

  // ── Economy & Finance ──
  { word: '輸入', reading: 'ゆにゅう', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['import'] }, frequencyRank: 1461, tags: ['nouns', 'work'] },
  { word: '為替', reading: 'かわせ', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['exchange (currency)'] }, frequencyRank: 1462, tags: ['nouns', 'work'] },
  { word: '不況', reading: 'ふきょう', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['recession', 'depression'] }, frequencyRank: 1463, tags: ['nouns', 'work'] },
  { word: '好況', reading: 'こうきょう', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['prosperity', 'boom'] }, frequencyRank: 1464, tags: ['nouns', 'work'] },
  { word: '物価', reading: 'ぶっか', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['prices (commodity)'] }, frequencyRank: 1465, tags: ['nouns', 'work'] },
  { word: '消費税', reading: 'しょうひぜい', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['consumption tax'] }, frequencyRank: 1466, tags: ['nouns', 'work'] },
  { word: '所得', reading: 'しょとく', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['income'] }, frequencyRank: 1467, tags: ['nouns', 'work'] },
  { word: '融資', reading: 'ゆうし', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['financing', 'loan'] }, frequencyRank: 1468, tags: ['nouns', 'work'] },
  { word: '破産', reading: 'はさん', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['bankruptcy'] }, frequencyRank: 1469, tags: ['nouns', 'work'] },
  { word: '倒産', reading: 'とうさん', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['bankruptcy (company)'] }, frequencyRank: 1470, tags: ['nouns', 'work'] },

  // ── More Health & Body ──
  { word: '感染', reading: 'かんせん', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['infection'] }, frequencyRank: 1471, tags: ['nouns', 'health'] },
  { word: '症候群', reading: 'しょうこうぐん', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['syndrome'] }, frequencyRank: 1472, tags: ['nouns', 'health'] },
  { word: '副作用', reading: 'ふくさよう', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['side effect'] }, frequencyRank: 1473, tags: ['nouns', 'health'] },
  { word: '処方箋', reading: 'しょほうせん', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['prescription'] }, frequencyRank: 1474, tags: ['nouns', 'health'] },
  { word: '注射', reading: 'ちゅうしゃ', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['injection', 'shot'] }, frequencyRank: 1475, tags: ['nouns', 'health'] },
  { word: '検査', reading: 'けんさ', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['examination', 'test'] }, frequencyRank: 1476, tags: ['nouns', 'health'] },
  { word: '入院', reading: 'にゅういん', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['hospitalization'] }, frequencyRank: 1477, tags: ['nouns', 'health'] },
  { word: '退院', reading: 'たいいん', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['leaving hospital'] }, frequencyRank: 1478, tags: ['nouns', 'health'] },
  { word: '応急処置', reading: 'おうきゅうしょち', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['first aid'] }, frequencyRank: 1479, tags: ['nouns', 'health'] },
  { word: '精神的', reading: 'せいしんてき', jlptLevel: 3, partOfSpeech: 'na-adjective', meanings: { en: ['mental', 'psychological'] }, frequencyRank: 1480, tags: ['adjectives', 'na-adjective', 'health'] },

  // ── Architecture & City ──
  { word: '建築', reading: 'けんちく', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['architecture', 'construction'] }, frequencyRank: 1481, tags: ['nouns'] },
  { word: '都市', reading: 'とし', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['city', 'urban'] }, frequencyRank: 1482, tags: ['nouns', 'places'] },
  { word: '郊外', reading: 'こうがい', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['suburbs'] }, frequencyRank: 1483, tags: ['nouns', 'places'] },
  { word: '商店街', reading: 'しょうてんがい', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['shopping street'] }, frequencyRank: 1484, tags: ['nouns', 'places'] },
  { word: '工場', reading: 'こうじょう', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['factory'] }, frequencyRank: 1485, tags: ['nouns', 'work', 'places'] },
  { word: '倉庫', reading: 'そうこ', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['warehouse'] }, frequencyRank: 1486, tags: ['nouns', 'places'] },
  { word: '施設', reading: 'しせつ', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['facility', 'institution'] }, frequencyRank: 1487, tags: ['nouns', 'places'] },
  { word: '団地', reading: 'だんち', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['housing complex'] }, frequencyRank: 1488, tags: ['nouns', 'daily'] },
  { word: '景観', reading: 'けいかん', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['landscape', 'scenery'] }, frequencyRank: 1489, tags: ['nouns', 'nature'] },
  { word: '交差点', reading: 'こうさてん', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['intersection'] }, frequencyRank: 1490, tags: ['nouns', 'transport'] },

  // ── Japanese Culture & History ──
  { word: '武士', reading: 'ぶし', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['warrior', 'samurai'] }, frequencyRank: 1491, tags: ['nouns', 'culture'] },
  { word: '侍', reading: 'さむらい', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['samurai'] }, frequencyRank: 1492, tags: ['nouns', 'culture'] },
  { word: '城', reading: 'しろ', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['castle'] }, frequencyRank: 1493, tags: ['nouns', 'culture', 'places'] },
  { word: '幕府', reading: 'ばくふ', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['shogunate'] }, frequencyRank: 1494, tags: ['nouns', 'culture'] },
  { word: '天皇', reading: 'てんのう', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['emperor'] }, frequencyRank: 1495, tags: ['nouns', 'culture', 'society'] },
  { word: '明治', reading: 'めいじ', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['Meiji (era)'] }, frequencyRank: 1496, tags: ['nouns', 'culture'] },
  { word: '江戸', reading: 'えど', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['Edo (old Tokyo)'] }, frequencyRank: 1497, tags: ['nouns', 'culture', 'places'] },
  { word: '仏教', reading: 'ぶっきょう', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['Buddhism'] }, frequencyRank: 1498, tags: ['nouns', 'culture'] },
  { word: '和歌', reading: 'わか', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['Japanese poem (31 syllables)'] }, frequencyRank: 1499, tags: ['nouns', 'culture'] },
  { word: '俳句', reading: 'はいく', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['haiku'] }, frequencyRank: 1500, tags: ['nouns', 'culture'] },

  // ── More する Compound Verbs ──
  { word: '出席する', reading: 'しゅっせきする', jlptLevel: 3, partOfSpeech: 'verb-suru', meanings: { en: ['to attend'] }, frequencyRank: 1501, tags: ['verbs', 'suru', 'education'] },
  { word: '欠席する', reading: 'けっせきする', jlptLevel: 3, partOfSpeech: 'verb-suru', meanings: { en: ['to be absent'] }, frequencyRank: 1502, tags: ['verbs', 'suru', 'education'] },
  { word: '賛成する', reading: 'さんせいする', jlptLevel: 3, partOfSpeech: 'verb-suru', meanings: { en: ['to agree', 'to approve'] }, frequencyRank: 1503, tags: ['verbs', 'suru'] },
  { word: '反対する', reading: 'はんたいする', jlptLevel: 3, partOfSpeech: 'verb-suru', meanings: { en: ['to oppose'] }, frequencyRank: 1504, tags: ['verbs', 'suru'] },
  { word: '主張する', reading: 'しゅちょうする', jlptLevel: 3, partOfSpeech: 'verb-suru', meanings: { en: ['to assert', 'to claim'] }, frequencyRank: 1505, tags: ['verbs', 'suru'] },
  { word: '発展する', reading: 'はってんする', jlptLevel: 3, partOfSpeech: 'verb-suru', meanings: { en: ['to develop', 'to grow'] }, frequencyRank: 1506, tags: ['verbs', 'suru'] },
  { word: '改善する', reading: 'かいぜんする', jlptLevel: 3, partOfSpeech: 'verb-suru', meanings: { en: ['to improve'] }, frequencyRank: 1507, tags: ['verbs', 'suru'] },
  { word: '悪化する', reading: 'あっかする', jlptLevel: 3, partOfSpeech: 'verb-suru', meanings: { en: ['to worsen'] }, frequencyRank: 1508, tags: ['verbs', 'suru'] },
  { word: '拡大する', reading: 'かくだいする', jlptLevel: 3, partOfSpeech: 'verb-suru', meanings: { en: ['to expand', 'to enlarge'] }, frequencyRank: 1509, tags: ['verbs', 'suru'] },
  { word: '縮小する', reading: 'しゅくしょうする', jlptLevel: 3, partOfSpeech: 'verb-suru', meanings: { en: ['to reduce', 'to shrink'] }, frequencyRank: 1510, tags: ['verbs', 'suru'] },
  { word: '登録する', reading: 'とうろくする', jlptLevel: 3, partOfSpeech: 'verb-suru', meanings: { en: ['to register'] }, frequencyRank: 1511, tags: ['verbs', 'suru'] },
  { word: '削除する', reading: 'さくじょする', jlptLevel: 3, partOfSpeech: 'verb-suru', meanings: { en: ['to delete'] }, frequencyRank: 1512, tags: ['verbs', 'suru', 'technology'] },
  { word: '保存する', reading: 'ほぞんする', jlptLevel: 3, partOfSpeech: 'verb-suru', meanings: { en: ['to save', 'to preserve'] }, frequencyRank: 1513, tags: ['verbs', 'suru'] },
  { word: '復旧する', reading: 'ふっきゅうする', jlptLevel: 3, partOfSpeech: 'verb-suru', meanings: { en: ['to restore', 'to recover'] }, frequencyRank: 1514, tags: ['verbs', 'suru'] },
  { word: '普及する', reading: 'ふきゅうする', jlptLevel: 3, partOfSpeech: 'verb-suru', meanings: { en: ['to spread widely'] }, frequencyRank: 1515, tags: ['verbs', 'suru'] },
  { word: '促進する', reading: 'そくしんする', jlptLevel: 3, partOfSpeech: 'verb-suru', meanings: { en: ['to promote', 'to accelerate'] }, frequencyRank: 1516, tags: ['verbs', 'suru'] },
  { word: '抑制する', reading: 'よくせいする', jlptLevel: 3, partOfSpeech: 'verb-suru', meanings: { en: ['to suppress', 'to control'] }, frequencyRank: 1517, tags: ['verbs', 'suru'] },
  { word: '転換する', reading: 'てんかんする', jlptLevel: 3, partOfSpeech: 'verb-suru', meanings: { en: ['to convert', 'to switch'] }, frequencyRank: 1518, tags: ['verbs', 'suru'] },
  { word: '実施する', reading: 'じっしする', jlptLevel: 3, partOfSpeech: 'verb-suru', meanings: { en: ['to implement', 'to carry out'] }, frequencyRank: 1519, tags: ['verbs', 'suru', 'work'] },
  { word: '廃止する', reading: 'はいしする', jlptLevel: 3, partOfSpeech: 'verb-suru', meanings: { en: ['to abolish', 'to discontinue'] }, frequencyRank: 1520, tags: ['verbs', 'suru'] },

  // ── More Nouns ──
  { word: '責任', reading: 'せきにん', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['responsibility'] }, frequencyRank: 1521, tags: ['nouns'] },
  { word: '義務', reading: 'ぎむ', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['duty', 'obligation'] }, frequencyRank: 1522, tags: ['nouns', 'society'] },
  { word: '権利', reading: 'けんり', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['right', 'privilege'] }, frequencyRank: 1523, tags: ['nouns', 'society'] },
  { word: '個人', reading: 'こじん', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['individual', 'personal'] }, frequencyRank: 1524, tags: ['nouns'] },
  { word: '集団', reading: 'しゅうだん', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['group', 'collective'] }, frequencyRank: 1525, tags: ['nouns'] },
  { word: '多数', reading: 'たすう', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['majority', 'many'] }, frequencyRank: 1526, tags: ['nouns'] },
  { word: '少数', reading: 'しょうすう', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['minority', 'few'] }, frequencyRank: 1527, tags: ['nouns'] },
  { word: '過半数', reading: 'かはんすう', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['majority (over half)'] }, frequencyRank: 1528, tags: ['nouns'] },
  { word: '比率', reading: 'ひりつ', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['ratio', 'percentage'] }, frequencyRank: 1529, tags: ['nouns'] },
  { word: '平均', reading: 'へいきん', jlptLevel: 3, partOfSpeech: 'noun', meanings: { en: ['average'] }, frequencyRank: 1530, tags: ['nouns'] },

  // ── More Adjectives ──
  { word: '著しい', reading: 'いちじるしい', jlptLevel: 3, partOfSpeech: 'i-adjective', meanings: { en: ['remarkable', 'striking'] }, frequencyRank: 1531, tags: ['adjectives'] },
  { word: '乏しい', reading: 'とぼしい', jlptLevel: 3, partOfSpeech: 'i-adjective', meanings: { en: ['scarce', 'poor'] }, frequencyRank: 1532, tags: ['adjectives'] },
  { word: '著名', reading: 'ちょめい', jlptLevel: 3, partOfSpeech: 'na-adjective', meanings: { en: ['famous', 'noted'] }, frequencyRank: 1533, tags: ['adjectives', 'na-adjective'] },
  { word: '公平', reading: 'こうへい', jlptLevel: 3, partOfSpeech: 'na-adjective', meanings: { en: ['fair', 'impartial'] }, frequencyRank: 1534, tags: ['adjectives', 'na-adjective'] },
  { word: '慎重', reading: 'しんちょう', jlptLevel: 3, partOfSpeech: 'na-adjective', meanings: { en: ['careful', 'cautious'] }, frequencyRank: 1535, tags: ['adjectives', 'na-adjective'] },
  { word: '大幅', reading: 'おおはば', jlptLevel: 3, partOfSpeech: 'na-adjective', meanings: { en: ['drastic', 'significant'] }, frequencyRank: 1536, tags: ['adjectives', 'na-adjective'] },
  { word: '急速', reading: 'きゅうそく', jlptLevel: 3, partOfSpeech: 'na-adjective', meanings: { en: ['rapid'] }, frequencyRank: 1537, tags: ['adjectives', 'na-adjective'] },
  { word: '些細', reading: 'ささい', jlptLevel: 3, partOfSpeech: 'na-adjective', meanings: { en: ['trivial', 'minor'] }, frequencyRank: 1538, tags: ['adjectives', 'na-adjective'] },
  { word: '莫大', reading: 'ばくだい', jlptLevel: 3, partOfSpeech: 'na-adjective', meanings: { en: ['enormous', 'vast'] }, frequencyRank: 1539, tags: ['adjectives', 'na-adjective'] },
  { word: '多大', reading: 'ただい', jlptLevel: 3, partOfSpeech: 'na-adjective', meanings: { en: ['great', 'considerable'] }, frequencyRank: 1540, tags: ['adjectives', 'na-adjective'] },

  // ── Compound Expressions ──
  { word: 'にもかかわらず', reading: 'にもかかわらず', jlptLevel: 3, partOfSpeech: 'conjunction', meanings: { en: ['despite', 'in spite of'] }, frequencyRank: 1541, tags: ['conjunctions'] },
  { word: 'したがって', reading: 'したがって', jlptLevel: 3, partOfSpeech: 'conjunction', meanings: { en: ['therefore', 'consequently'] }, frequencyRank: 1542, tags: ['conjunctions'] },
  { word: 'それにもかかわらず', reading: 'それにもかかわらず', jlptLevel: 3, partOfSpeech: 'conjunction', meanings: { en: ['nevertheless'] }, frequencyRank: 1543, tags: ['conjunctions'] },
  { word: 'ところが', reading: 'ところが', jlptLevel: 3, partOfSpeech: 'conjunction', meanings: { en: ['however', 'but (unexpected)'] }, frequencyRank: 1544, tags: ['conjunctions'] },
  { word: 'それにしても', reading: 'それにしても', jlptLevel: 3, partOfSpeech: 'conjunction', meanings: { en: ['even so', 'nevertheless'] }, frequencyRank: 1545, tags: ['conjunctions'] },
  { word: '一方では', reading: 'いっぽうでは', jlptLevel: 3, partOfSpeech: 'conjunction', meanings: { en: ['on one hand'] }, frequencyRank: 1546, tags: ['conjunctions'] },
  { word: '他方では', reading: 'たほうでは', jlptLevel: 3, partOfSpeech: 'conjunction', meanings: { en: ['on the other hand'] }, frequencyRank: 1547, tags: ['conjunctions'] },
  { word: '結局', reading: 'けっきょく', jlptLevel: 3, partOfSpeech: 'adverb', meanings: { en: ['after all', 'in the end'] }, frequencyRank: 1548, tags: ['adverbs'] },
  { word: '案の定', reading: 'あんのじょう', jlptLevel: 3, partOfSpeech: 'adverb', meanings: { en: ['as expected', 'sure enough'] }, frequencyRank: 1549, tags: ['adverbs'] },
  { word: '万が一', reading: 'まんがいち', jlptLevel: 3, partOfSpeech: 'adverb', meanings: { en: ['in the unlikely event', 'if by any chance'] }, frequencyRank: 1550, tags: ['adverbs'] },
];
