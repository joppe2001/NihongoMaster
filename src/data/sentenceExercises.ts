/**
 * Real-world sentence exercises organized by scenario.
 * Every sentence is something a real person would actually say in Japan.
 * No "I am an apple" nonsense.
 */

export interface SentenceExercise {
  id: string;
  scenario: string;
  scenarioIcon: string;
  prompt: string;        // English situation prompt
  japanese: string;      // Full correct sentence
  reading: string;       // Full hiragana reading
  english: string;       // English translation
  words: string[];       // Words in correct order (for sentence builder)
  /** Map of kanji words → hiragana readings for display on tiles */
  wordReadings?: Record<string, string>;
  distractors?: string[]; // Extra wrong words to make it harder
  grammarPoint?: string; // Related grammar pattern
  difficulty: 1 | 2 | 3;
}

export interface FillBlankExercise {
  id: string;
  scenario: string;
  scenarioIcon: string;
  sentence: string;      // Sentence with ___ for blanks
  reading: string;
  english: string;
  blanks: { answer: string; options: string[]; optionReadings?: Record<string, string> }[];
  difficulty: 1 | 2 | 3;
}

export const SCENARIOS = [
  { id: 'konbini', label: 'Convenience Store', icon: '🏪' },
  { id: 'restaurant', label: 'Restaurant', icon: '🍜' },
  { id: 'station', label: 'Train Station', icon: '🚃' },
  { id: 'meeting', label: 'Meeting People', icon: '👋' },
  { id: 'shopping', label: 'Shopping', icon: '🛍' },
  { id: 'home', label: 'At Home', icon: '🏠' },
  { id: 'school', label: 'School / Work', icon: '🏫' },
  { id: 'directions', label: 'Asking Directions', icon: '🗺' },
] as const;

// ─── Sentence Builder Exercises ──────────────────────────────

export const SENTENCE_EXERCISES: SentenceExercise[] = [
  // ── Convenience Store ──
  { id: 'sb-k1', scenario: 'konbini', scenarioIcon: '🏪', prompt: 'Tell the cashier you don\'t need a bag', japanese: '袋はいりません', reading: 'ふくろはいりません', english: 'I don\'t need a bag', words: ['袋', 'は', 'いりません'], wordReadings: { '袋': 'ふくろ' }, distractors: ['ください', 'です'], difficulty: 1 },
  { id: 'sb-k2', scenario: 'konbini', scenarioIcon: '🏪', prompt: 'Ask how much this costs', japanese: 'これはいくらですか', reading: 'これはいくらですか', english: 'How much is this?', words: ['これ', 'は', 'いくら', 'です', 'か'], difficulty: 1 },
  { id: 'sb-k3', scenario: 'konbini', scenarioIcon: '🏪', prompt: 'Ask if they have a restroom', japanese: 'トイレはありますか', reading: 'トイレはありますか', english: 'Is there a restroom?', words: ['トイレ', 'は', 'あります', 'か'], distractors: ['いますか', 'どこ'], difficulty: 1 },
  { id: 'sb-k4', scenario: 'konbini', scenarioIcon: '🏪', prompt: 'Say you\'ll pay with cash', japanese: '現金でお願いします', reading: 'げんきんでおねがいします', english: 'Cash, please', words: ['現金', 'で', 'お願いします'], wordReadings: { '現金': 'げんきん', 'お願いします': 'おねがいします' }, distractors: ['カード', 'は'], difficulty: 2 },

  // ── Restaurant ──
  { id: 'sb-r1', scenario: 'restaurant', scenarioIcon: '🍜', prompt: 'Ask for the menu', japanese: 'メニューをお願いします', reading: 'メニューをおねがいします', english: 'Menu please', words: ['メニュー', 'を', 'お願いします'], wordReadings: { 'お願いします': 'おねがいします' }, distractors: ['ください', 'は'], difficulty: 1 },
  { id: 'sb-r2', scenario: 'restaurant', scenarioIcon: '🍜', prompt: 'Order water', japanese: '水をください', reading: 'みずをください', english: 'Water, please', words: ['水', 'を', 'ください'], wordReadings: { '水': 'みず' }, distractors: ['お茶', 'は', 'お願いします'], difficulty: 1 },
  { id: 'sb-r3', scenario: 'restaurant', scenarioIcon: '🍜', prompt: 'Say "I\'ll have this one"', japanese: 'これにします', reading: 'これにします', english: 'I\'ll have this one', words: ['これ', 'に', 'します'], distractors: ['それ', 'を', 'ください'], difficulty: 1 },
  { id: 'sb-r4', scenario: 'restaurant', scenarioIcon: '🍜', prompt: 'Ask for the bill', japanese: 'お会計をお願いします', reading: 'おかいけいをおねがいします', english: 'Check, please', words: ['お会計', 'を', 'お願いします'], wordReadings: { 'お会計': 'おかいけい', 'お願いします': 'おねがいします' }, distractors: ['メニュー', 'は'], difficulty: 2 },
  { id: 'sb-r5', scenario: 'restaurant', scenarioIcon: '🍜', prompt: 'Say "It was delicious"', japanese: 'おいしかったです', reading: 'おいしかったです', english: 'It was delicious', words: ['おいしかった', 'です'], distractors: ['おいしい', 'でした'], difficulty: 2 },
  { id: 'sb-r6', scenario: 'restaurant', scenarioIcon: '🍜', prompt: 'Ask if this has meat', japanese: 'これは肉が入っていますか', reading: 'これはにくがはいっていますか', english: 'Does this have meat?', words: ['これ', 'は', '肉', 'が', '入って', 'います', 'か'], wordReadings: { '肉': 'にく', '入って': 'はいって' }, distractors: ['魚', 'を'], difficulty: 3 },

  // ── Train Station ──
  { id: 'sb-s1', scenario: 'station', scenarioIcon: '🚃', prompt: 'Ask how much a ticket to Shinjuku costs', japanese: '新宿までいくらですか', reading: 'しんじゅくまでいくらですか', english: 'How much to Shinjuku?', words: ['新宿', 'まで', 'いくら', 'です', 'か'], wordReadings: { '新宿': 'しんじゅく' }, distractors: ['から', 'は'], difficulty: 2 },
  { id: 'sb-s2', scenario: 'station', scenarioIcon: '🚃', prompt: 'Ask which platform', japanese: '何番線ですか', reading: 'なんばんせんですか', english: 'Which platform?', words: ['何番線', 'です', 'か'], wordReadings: { '何番線': 'なんばんせん' }, distractors: ['どこ', 'は'], difficulty: 2 },
  { id: 'sb-s3', scenario: 'station', scenarioIcon: '🚃', prompt: 'Ask if this train goes to Tokyo', japanese: 'この電車は東京に行きますか', reading: 'このでんしゃはとうきょうにいきますか', english: 'Does this train go to Tokyo?', words: ['この', '電車', 'は', '東京', 'に', '行きます', 'か'], wordReadings: { '電車': 'でんしゃ', '東京': 'とうきょう', '行きます': 'いきます' }, distractors: ['から', 'で'], difficulty: 2 },
  { id: 'sb-s4', scenario: 'station', scenarioIcon: '🚃', prompt: 'Say you want to go to Shibuya', japanese: '渋谷に行きたいです', reading: 'しぶやにいきたいです', english: 'I want to go to Shibuya', words: ['渋谷', 'に', '行きたい', 'です'], wordReadings: { '渋谷': 'しぶや', '行きたい': 'いきたい' }, distractors: ['から', 'まで', '行きます'], difficulty: 2 },

  // ── Meeting People ──
  { id: 'sb-m1', scenario: 'meeting', scenarioIcon: '👋', prompt: 'Introduce yourself (I\'m [name])', japanese: '私はジョッペです', reading: 'わたしはジョッペです', english: 'I\'m Joppe', words: ['私', 'は', 'ジョッペ', 'です'], wordReadings: { '私': 'わたし' }, distractors: ['が', 'の'], difficulty: 1 },
  { id: 'sb-m2', scenario: 'meeting', scenarioIcon: '👋', prompt: 'Say "Nice to meet you"', japanese: 'はじめまして、よろしくお願いします', reading: 'はじめまして、よろしくおねがいします', english: 'Nice to meet you, pleased to know you', words: ['はじめまして', 'よろしく', 'お願いします'], wordReadings: { 'お願いします': 'おねがいします' }, distractors: ['ありがとう', 'すみません'], difficulty: 1 },
  { id: 'sb-m3', scenario: 'meeting', scenarioIcon: '👋', prompt: 'Ask where someone is from', japanese: 'どこから来ましたか', reading: 'どこからきましたか', english: 'Where are you from?', words: ['どこ', 'から', '来ました', 'か'], wordReadings: { '来ました': 'きました' }, distractors: ['まで', 'に', 'います'], difficulty: 2 },
  { id: 'sb-m4', scenario: 'meeting', scenarioIcon: '👋', prompt: 'Say you\'re studying Japanese', japanese: '日本語を勉強しています', reading: 'にほんごをべんきょうしています', english: 'I\'m studying Japanese', words: ['日本語', 'を', '勉強', 'しています'], wordReadings: { '日本語': 'にほんご', '勉強': 'べんきょう' }, distractors: ['します', 'は', 'が'], difficulty: 2 },
  { id: 'sb-m5', scenario: 'meeting', scenarioIcon: '👋', prompt: 'Ask someone\'s name', japanese: 'お名前は何ですか', reading: 'おなまえはなんですか', english: 'What is your name?', words: ['お名前', 'は', '何', 'です', 'か'], wordReadings: { 'お名前': 'おなまえ', '何': 'なん' }, distractors: ['どこ', 'だれ'], difficulty: 1 },

  // ── Shopping ──
  { id: 'sb-sh1', scenario: 'shopping', scenarioIcon: '🛍', prompt: 'Ask if you can try it on', japanese: '試着してもいいですか', reading: 'しちゃくしてもいいですか', english: 'May I try it on?', words: ['試着', 'しても', 'いい', 'です', 'か'], wordReadings: { '試着': 'しちゃく' }, distractors: ['ください', 'を'], difficulty: 2 },
  { id: 'sb-sh2', scenario: 'shopping', scenarioIcon: '🛍', prompt: 'Say it\'s too expensive', japanese: 'ちょっと高いですね', reading: 'ちょっとたかいですね', english: 'It\'s a bit expensive', words: ['ちょっと', '高い', 'です', 'ね'], wordReadings: { '高い': 'たかい' }, distractors: ['安い', 'か'], difficulty: 1 },
  { id: 'sb-sh3', scenario: 'shopping', scenarioIcon: '🛍', prompt: 'Ask if there\'s a smaller size', japanese: '小さいサイズはありますか', reading: 'ちいさいサイズはありますか', english: 'Do you have a smaller size?', words: ['小さい', 'サイズ', 'は', 'あります', 'か'], wordReadings: { '小さい': 'ちいさい' }, distractors: ['大きい', 'いますか'], difficulty: 2 },

  // ── At Home ──
  { id: 'sb-h1', scenario: 'home', scenarioIcon: '🏠', prompt: 'Say "I\'m home!"', japanese: 'ただいま', reading: 'ただいま', english: 'I\'m home!', words: ['ただいま'], distractors: ['おかえり', 'いただきます'], difficulty: 1 },
  { id: 'sb-h2', scenario: 'home', scenarioIcon: '🏠', prompt: 'Say "Let\'s eat" before a meal', japanese: 'いただきます', reading: 'いただきます', english: 'Let\'s eat (lit: I humbly receive)', words: ['いただきます'], distractors: ['ごちそうさま', 'ありがとう'], difficulty: 1 },
  { id: 'sb-h3', scenario: 'home', scenarioIcon: '🏠', prompt: 'Ask what\'s for dinner', japanese: '晩ご飯は何ですか', reading: 'ばんごはんはなんですか', english: 'What\'s for dinner?', words: ['晩ご飯', 'は', '何', 'です', 'か'], wordReadings: { '晩ご飯': 'ばんごはん', '何': 'なん' }, distractors: ['朝ご飯', 'どこ'], difficulty: 1 },

  // ── Directions ──
  { id: 'sb-d1', scenario: 'directions', scenarioIcon: '🗺', prompt: 'Ask where the station is', japanese: '駅はどこですか', reading: 'えきはどこですか', english: 'Where is the station?', words: ['駅', 'は', 'どこ', 'です', 'か'], wordReadings: { '駅': 'えき' }, distractors: ['何', 'いつ', 'まで'], difficulty: 1 },
  { id: 'sb-d2', scenario: 'directions', scenarioIcon: '🗺', prompt: 'Ask if it\'s close', japanese: 'ここから近いですか', reading: 'ここからちかいですか', english: 'Is it close from here?', words: ['ここ', 'から', '近い', 'です', 'か'], wordReadings: { '近い': 'ちかい' }, distractors: ['遠い', 'まで', 'そこ'], difficulty: 2 },

  // ── School / Work ──
  { id: 'sb-w1', scenario: 'school', scenarioIcon: '🏫', prompt: 'Say you don\'t understand', japanese: 'すみません、わかりません', reading: 'すみません、わかりません', english: 'Sorry, I don\'t understand', words: ['すみません', 'わかりません'], distractors: ['ありがとう', 'わかります'], difficulty: 1 },
  { id: 'sb-w2', scenario: 'school', scenarioIcon: '🏫', prompt: 'Ask someone to repeat', japanese: 'もう一度お願いします', reading: 'もういちどおねがいします', english: 'One more time, please', words: ['もう', '一度', 'お願いします'], wordReadings: { '一度': 'いちど', 'お願いします': 'おねがいします' }, distractors: ['ください', 'すみません'], difficulty: 1 },
  { id: 'sb-w3', scenario: 'school', scenarioIcon: '🏫', prompt: 'Ask how to say something in Japanese', japanese: 'これは日本語で何ですか', reading: 'これはにほんごでなんですか', english: 'What is this in Japanese?', words: ['これ', 'は', '日本語', 'で', '何', 'です', 'か'], wordReadings: { '日本語': 'にほんご', '何': 'なん' }, distractors: ['英語', 'に'], difficulty: 2 },
  { id: 'sb-w4', scenario: 'school', scenarioIcon: '🏫', prompt: 'Say you have a meeting at 3', japanese: '三時に会議があります', reading: 'さんじにかいぎがあります', english: 'There\'s a meeting at 3', words: ['三時', 'に', '会議', 'が', 'あります'], wordReadings: { '三時': 'さんじ', '会議': 'かいぎ' }, distractors: ['は', 'います', '五時'], difficulty: 2 },
];

// ─── Fill-in-the-Blank Exercises ─────────────────────────────

export const FILL_BLANK_EXERCISES: FillBlankExercise[] = [
  // Particle practice (real situations)
  { id: 'fb-1', scenario: 'restaurant', scenarioIcon: '🍜', sentence: '水___ください', reading: 'みず___ください', english: 'Water, please', blanks: [{ answer: 'を', options: ['を', 'は', 'に', 'で'] }], difficulty: 1 },
  { id: 'fb-2', scenario: 'station', scenarioIcon: '🚃', sentence: '東京___行きます', reading: 'とうきょう___いきます', english: 'I\'m going to Tokyo', blanks: [{ answer: 'に', options: ['に', 'を', 'で', 'は'] }], difficulty: 1 },
  { id: 'fb-3', scenario: 'meeting', scenarioIcon: '👋', sentence: '私___学生です', reading: 'わたし___がくせいです', english: 'I am a student', blanks: [{ answer: 'は', options: ['は', 'が', 'を', 'の'] }], difficulty: 1 },
  { id: 'fb-4', scenario: 'home', scenarioIcon: '🏠', sentence: '図書館___勉強します', reading: 'としょかん___べんきょうします', english: 'I study at the library', blanks: [{ answer: 'で', options: ['で', 'に', 'を', 'は'] }], difficulty: 1 },
  { id: 'fb-5', scenario: 'shopping', scenarioIcon: '🛍', sentence: 'この靴___いくらですか', reading: 'このくつ___いくらですか', english: 'How much are these shoes?', blanks: [{ answer: 'は', options: ['は', 'を', 'が', 'の'] }], difficulty: 1 },
  { id: 'fb-6', scenario: 'meeting', scenarioIcon: '👋', sentence: 'どこ___来ましたか', reading: 'どこ___きましたか', english: 'Where did you come from?', blanks: [{ answer: 'から', options: ['から', 'まで', 'に', 'で'] }], difficulty: 2 },
  { id: 'fb-7', scenario: 'station', scenarioIcon: '🚃', sentence: '九時___五時___働きます', reading: 'くじ___ごじ___はたらきます', english: 'I work from 9 to 5', blanks: [{ answer: 'から', options: ['から', 'に', 'で', 'は'] }, { answer: 'まで', options: ['まで', 'に', 'を', 'と'] }], difficulty: 2 },
  { id: 'fb-8', scenario: 'restaurant', scenarioIcon: '🍜', sentence: '友達___一緒にご飯を食べます', reading: 'ともだち___いっしょにごはんをたべます', english: 'I eat with a friend', blanks: [{ answer: 'と', options: ['と', 'に', 'を', 'は'] }], difficulty: 2 },

  // Verb form practice
  { id: 'fb-9', scenario: 'home', scenarioIcon: '🏠', sentence: '毎朝コーヒーを___', reading: 'まいあさコーヒーを___', english: 'I drink coffee every morning', blanks: [{ answer: '飲みます', options: ['飲みます', '食べます', '見ます', '行きます'], optionReadings: { '飲みます': 'のみます', '食べます': 'たべます', '見ます': 'みます', '行きます': 'いきます' } }], difficulty: 1 },
  { id: 'fb-10', scenario: 'school', scenarioIcon: '🏫', sentence: '日本語を___', reading: 'にほんごを___', english: 'I study Japanese', blanks: [{ answer: '勉強します', options: ['勉強します', '食べます', '飲みます', '行きます'], optionReadings: { '勉強します': 'べんきょうします', '食べます': 'たべます', '飲みます': 'のみます', '行きます': 'いきます' } }], difficulty: 1 },
  { id: 'fb-11', scenario: 'meeting', scenarioIcon: '👋', sentence: '日本に___です', reading: 'にほんに___です', english: 'I want to go to Japan', blanks: [{ answer: '行きたい', options: ['行きたい', '行きます', '行きません', '行きました'], optionReadings: { '行きたい': 'いきたい', '行きます': 'いきます', '行きません': 'いきません', '行きました': 'いきました' } }], difficulty: 2 },
  { id: 'fb-12', scenario: 'home', scenarioIcon: '🏠', sentence: '今テレビを___', reading: 'いまテレビを___', english: 'I\'m watching TV now', blanks: [{ answer: '見ています', options: ['見ています', '見ます', '見ました', '見たいです'], optionReadings: { '見ています': 'みています', '見ます': 'みます', '見ました': 'みました', '見たいです': 'みたいです' } }], difficulty: 2 },

  // Adjective practice
  { id: 'fb-13', scenario: 'restaurant', scenarioIcon: '🍜', sentence: 'この料理は___', reading: 'このりょうりは___', english: 'This food is delicious', blanks: [{ answer: 'おいしいです', options: ['おいしいです', '高いです', '安いです', '大きいです'], optionReadings: { '高いです': 'たかいです', '安いです': 'やすいです', '大きいです': 'おおきいです' } }], difficulty: 1 },
  { id: 'fb-14', scenario: 'shopping', scenarioIcon: '🛍', sentence: 'この部屋は___', reading: 'このへやは___', english: 'This room is quiet', blanks: [{ answer: '静かです', options: ['静かです', '元気です', '好きです', '有名です'], optionReadings: { '静かです': 'しずかです', '元気です': 'げんきです', '好きです': 'すきです', '有名です': 'ゆうめいです' } }], difficulty: 2 },

  // Polite expression practice
  { id: 'fb-15', scenario: 'konbini', scenarioIcon: '🏪', sentence: '写真を撮っても___', reading: 'しゃしんをとっても___', english: 'May I take a photo?', blanks: [{ answer: 'いいですか', options: ['いいですか', 'ください', 'ません', 'します'] }], difficulty: 2 },
  { id: 'fb-16', scenario: 'school', scenarioIcon: '🏫', sentence: 'ゆっくり___ください', reading: 'ゆっくり___ください', english: 'Please speak slowly', blanks: [{ answer: '話して', options: ['話して', '書いて', '読んで', '聞いて'], optionReadings: { '話して': 'はなして', '書いて': 'かいて', '読んで': 'よんで', '聞いて': 'きいて' } }], difficulty: 2 },
];
