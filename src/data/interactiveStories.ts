/**
 * Interactive reading stories with word-level annotations.
 * Every word is clickable to reveal meaning/reading.
 * Stories are cute/anime-themed and adapt to JLPT level.
 */

// ─── Types ──────────────────────────────────────────────────

export interface StoryWord {
  /** The displayed text (kanji, kana, or katakana) */
  text: string;
  /** Hiragana reading (only if text contains kanji) */
  reading?: string;
  /** English meaning */
  meaning: string;
  /** Part of speech hint */
  pos?: 'noun' | 'verb' | 'adj' | 'adv' | 'particle' | 'expr' | 'counter' | 'conj';
  /** If true, this is punctuation or whitespace — not clickable */
  isPunct?: boolean;
}

export interface StorySentence {
  /** Ordered words that make up this sentence */
  words: StoryWord[];
  /** Full English translation of the sentence */
  meaning: string;
}

export interface ComprehensionQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface InteractiveStory {
  id: string;
  title: string;
  titleJp: string;
  theme: 'school' | 'adventure' | 'daily-life' | 'fantasy' | 'food' | 'travel';
  difficulty: 1 | 2 | 3 | 4 | 5;
  /** Which writing system is emphasized */
  writingFocus: 'hiragana' | 'katakana' | 'mixed' | 'kanji';
  sentences: StorySentence[];
  questions: ComprehensionQuestion[];
}

// ─── Helper to make word definitions less verbose ───────────

function w(text: string, meaning: string, pos?: StoryWord['pos'], reading?: string): StoryWord {
  return { text, meaning, pos, reading };
}
function p(text: string): StoryWord {
  return { text, meaning: '', isPunct: true };
}

// ─── N5 Stories (heavy hiragana, simple grammar) ────────────

const STORIES_N5: InteractiveStory[] = [
  {
    id: 'n5-lost-cat',
    title: 'The Lost Cat',
    titleJp: 'まいごのねこ',
    theme: 'adventure',
    difficulty: 1,
    writingFocus: 'hiragana',
    sentences: [
      {
        words: [
          w('ある', 'a certain', 'adj'),
          w('日', 'day', 'noun', 'ひ'),
          p('、'),
          w('さくら', 'Sakura (name)', 'noun'),
          w('は', 'topic marker', 'particle'),
          w('こうえん', 'park', 'noun'),
          w('に', 'to/at', 'particle'),
          w('いきました', 'went', 'verb'),
          p('。'),
        ],
        meaning: 'One day, Sakura went to the park.',
      },
      {
        words: [
          w('こうえん', 'park', 'noun'),
          w('に', 'at', 'particle'),
          w('ちいさい', 'small', 'adj'),
          w('ねこ', 'cat', 'noun'),
          w('が', 'subject marker', 'particle'),
          w('いました', 'was (there)', 'verb'),
          p('。'),
        ],
        meaning: 'There was a small cat at the park.',
      },
      {
        words: [
          w('ねこ', 'cat', 'noun'),
          w('は', 'topic marker', 'particle'),
          w('しろくて', 'white and...', 'adj'),
          p('、'),
          w('とても', 'very', 'adv'),
          w('かわいい', 'cute', 'adj'),
          w('です', 'is (polite)', 'verb'),
          p('。'),
        ],
        meaning: 'The cat was white and very cute.',
      },
      {
        words: [
          p('「'),
          w('おなか', 'stomach', 'noun'),
          w('が', 'subject marker', 'particle'),
          w('すいて', 'hungry', 'verb'),
          w('いますか', 'are you?', 'verb'),
          p('？」'),
          w('と', 'quotation', 'particle'),
          w('さくら', 'Sakura', 'noun'),
          w('は', 'topic marker', 'particle'),
          w('ききました', 'asked', 'verb'),
          p('。'),
        ],
        meaning: '"Are you hungry?" Sakura asked.',
      },
      {
        words: [
          w('ねこ', 'cat', 'noun'),
          w('は', 'topic marker', 'particle'),
          p('「'),
          w('にゃあ', 'meow', 'expr'),
          p('」'),
          w('と', 'quotation', 'particle'),
          w('なきました', 'cried/meowed', 'verb'),
          p('。'),
        ],
        meaning: 'The cat meowed.',
      },
      {
        words: [
          w('さくら', 'Sakura', 'noun'),
          w('は', 'topic marker', 'particle'),
          w('おにぎり', 'rice ball', 'noun'),
          w('を', 'object marker', 'particle'),
          w('あげました', 'gave', 'verb'),
          p('。'),
        ],
        meaning: 'Sakura gave it a rice ball.',
      },
      {
        words: [
          w('ねこ', 'cat', 'noun'),
          w('は', 'topic marker', 'particle'),
          w('うれしそうに', 'happily', 'adv'),
          w('たべました', 'ate', 'verb'),
          p('。'),
        ],
        meaning: 'The cat ate happily.',
      },
      {
        words: [
          w('つぎの', 'next', 'adj'),
          w('日', 'day', 'noun', 'ひ'),
          p('、'),
          w('ねこ', 'cat', 'noun'),
          w('は', 'topic marker', 'particle'),
          w('また', 'again', 'adv'),
          w('こうえん', 'park', 'noun'),
          w('に', 'at', 'particle'),
          w('いました', 'was (there)', 'verb'),
          p('。'),
          w('さくら', 'Sakura', 'noun'),
          w('の', 'possessive', 'particle'),
          w('ともだち', 'friend', 'noun'),
          w('に', 'to', 'particle'),
          w('なりました', 'became', 'verb'),
          p('！'),
        ],
        meaning: 'The next day, the cat was at the park again. It became Sakura\'s friend!',
      },
    ],
    questions: [
      { question: 'Where did Sakura find the cat?', options: ['At school', 'At the park', 'At home', 'At the store'], correctIndex: 1 },
      { question: 'What color was the cat?', options: ['Black', 'Orange', 'White', 'Gray'], correctIndex: 2 },
      { question: 'What did Sakura give the cat?', options: ['Milk', 'Fish', 'A rice ball', 'Bread'], correctIndex: 2 },
    ],
  },
  {
    id: 'n5-onigiri',
    title: 'Making Onigiri',
    titleJp: 'おにぎりを つくろう',
    theme: 'food',
    difficulty: 1,
    writingFocus: 'hiragana',
    sentences: [
      {
        words: [
          w('きょう', 'today', 'noun'),
          w('は', 'topic marker', 'particle'),
          w('おかあさん', 'mother', 'noun'),
          w('と', 'with', 'particle'),
          w('おにぎり', 'rice ball', 'noun'),
          w('を', 'object marker', 'particle'),
          w('つくります', 'make', 'verb'),
          p('。'),
        ],
        meaning: 'Today I make rice balls with Mom.',
      },
      {
        words: [
          w('まず', 'first', 'adv'),
          p('、'),
          w('ごはん', 'cooked rice', 'noun'),
          w('を', 'object marker', 'particle'),
          w('たきます', 'cook (rice)', 'verb'),
          p('。'),
        ],
        meaning: 'First, we cook the rice.',
      },
      {
        words: [
          w('ごはん', 'cooked rice', 'noun'),
          w('は', 'topic marker', 'particle'),
          w('あつい', 'hot', 'adj'),
          w('です', 'is', 'verb'),
          p('！'),
          w('て', 'hands', 'noun'),
          w('に', 'on', 'particle'),
          w('みず', 'water', 'noun'),
          w('を', 'object marker', 'particle'),
          w('つけます', 'put on', 'verb'),
          p('。'),
        ],
        meaning: 'The rice is hot! We wet our hands with water.',
      },
      {
        words: [
          w('しお', 'salt', 'noun'),
          w('を', 'object marker', 'particle'),
          w('すこし', 'a little', 'adv'),
          w('つけて', 'apply and...', 'verb'),
          p('、'),
          w('ごはん', 'rice', 'noun'),
          w('を', 'object marker', 'particle'),
          w('にぎります', 'grip/shape', 'verb'),
          p('。'),
        ],
        meaning: 'We put on a little salt and shape the rice.',
      },
      {
        words: [
          w('なか', 'inside', 'noun'),
          w('に', 'in', 'particle'),
          w('うめぼし', 'pickled plum', 'noun'),
          w('を', 'object marker', 'particle'),
          w('いれます', 'put in', 'verb'),
          p('。'),
        ],
        meaning: 'We put pickled plum inside.',
      },
      {
        words: [
          w('さいご', 'lastly', 'noun'),
          w('に', 'at', 'particle'),
          p('、'),
          w('のり', 'seaweed', 'noun'),
          w('を', 'object marker', 'particle'),
          w('まきます', 'wrap', 'verb'),
          p('。'),
        ],
        meaning: 'Lastly, we wrap it with seaweed.',
      },
      {
        words: [
          w('できました', 'it\'s done', 'verb'),
          p('！'),
          w('いただきます', 'bon appetit', 'expr'),
          p('！'),
        ],
        meaning: 'It\'s done! Bon appetit!',
      },
      {
        words: [
          w('おかあさん', 'mother', 'noun'),
          w('の', 'possessive', 'particle'),
          w('おにぎり', 'rice ball', 'noun'),
          w('は', 'topic marker', 'particle'),
          w('やっぱり', 'as expected', 'adv'),
          w('いちばん', 'number one/best', 'adv'),
          w('おいしい', 'delicious', 'adj'),
          w('です', 'is', 'verb'),
          p('！'),
        ],
        meaning: 'Mom\'s rice balls are the best, as expected!',
      },
    ],
    questions: [
      { question: 'Who helps make the rice balls?', options: ['Father', 'Friend', 'Mother', 'Teacher'], correctIndex: 2 },
      { question: 'What goes inside the onigiri?', options: ['Tuna', 'Pickled plum', 'Salmon', 'Cheese'], correctIndex: 1 },
      { question: 'What is the last step?', options: ['Add salt', 'Shape the rice', 'Wrap with seaweed', 'Cook the rice'], correctIndex: 2 },
    ],
  },
  {
    id: 'n5-rainy-day',
    title: 'Rainy Day',
    titleJp: 'あめの ひ',
    theme: 'daily-life',
    difficulty: 1,
    writingFocus: 'hiragana',
    sentences: [
      {
        words: [
          w('けさ', 'this morning', 'noun'),
          p('、'),
          w('おきたら', 'when I woke up', 'verb'),
          p('、'),
          w('あめ', 'rain', 'noun'),
          w('でした', 'it was', 'verb'),
          p('。'),
        ],
        meaning: 'When I woke up this morning, it was raining.',
      },
      {
        words: [
          w('かさ', 'umbrella', 'noun'),
          w('が', 'subject marker', 'particle'),
          w('ありません', 'don\'t have', 'verb'),
          p('。'),
        ],
        meaning: 'I don\'t have an umbrella.',
      },
      {
        words: [
          p('「'),
          w('どうしよう', 'what should I do', 'expr'),
          p('…」'),
          w('と', 'quotation', 'particle'),
          w('おもいました', 'I thought', 'verb'),
          p('。'),
        ],
        meaning: '"What should I do..." I thought.',
      },
      {
        words: [
          w('おかあさん', 'mother', 'noun'),
          w('が', 'subject marker', 'particle'),
          p('「'),
          w('はい', 'here you go', 'expr'),
          p('、'),
          w('これ', 'this', 'noun'),
          p('」'),
          w('と', 'quotation', 'particle'),
          w('いいました', 'said', 'verb'),
          p('。'),
        ],
        meaning: 'Mother said "Here, take this."',
      },
      {
        words: [
          w('あたらしい', 'new', 'adj'),
          w('かさ', 'umbrella', 'noun'),
          w('です', 'is', 'verb'),
          p('！'),
          w('きいろくて', 'yellow and...', 'adj'),
          p('、'),
          w('かわいい', 'cute', 'adj'),
          w('です', 'is', 'verb'),
          p('。'),
        ],
        meaning: 'It\'s a new umbrella! It\'s yellow and cute.',
      },
      {
        words: [
          w('あめの', 'rainy', 'adj'),
          w('日', 'day', 'noun', 'ひ'),
          w('も', 'also/even', 'particle'),
          p('、'),
          w('すこし', 'a little', 'adv'),
          w('たのしい', 'fun', 'adj'),
          w('です', 'is', 'verb'),
          p('。'),
        ],
        meaning: 'Even rainy days are a little fun.',
      },
    ],
    questions: [
      { question: 'What was the problem?', options: ['No shoes', 'No umbrella', 'No breakfast', 'Late for school'], correctIndex: 1 },
      { question: 'What color was the new umbrella?', options: ['Red', 'Blue', 'Yellow', 'Green'], correctIndex: 2 },
    ],
  },
  {
    id: 'n5-school-club',
    title: 'After School Club',
    titleJp: 'がっこうの クラブ',
    theme: 'school',
    difficulty: 1,
    writingFocus: 'hiragana',
    sentences: [
      {
        words: [
          w('がっこう', 'school', 'noun'),
          w('が', 'subject marker', 'particle'),
          w('おわりました', 'ended', 'verb'),
          p('。'),
        ],
        meaning: 'School is over.',
      },
      {
        words: [
          w('きょう', 'today', 'noun'),
          w('は', 'topic marker', 'particle'),
          w('まんが', 'manga', 'noun'),
          w('クラブ', 'club', 'noun'),
          w('の', 'possessive', 'particle'),
          w('日', 'day', 'noun', 'ひ'),
          w('です', 'is', 'verb'),
          p('！'),
        ],
        meaning: 'Today is manga club day!',
      },
      {
        words: [
          w('ともだち', 'friend', 'noun'),
          w('の', 'possessive', 'particle'),
          w('ゆうき', 'Yuuki (name)', 'noun'),
          w('と', 'with', 'particle'),
          w('いっしょに', 'together', 'adv'),
          w('いきます', 'go', 'verb'),
          p('。'),
        ],
        meaning: 'I go together with my friend Yuuki.',
      },
      {
        words: [
          w('きょう', 'today', 'noun'),
          w('は', 'topic marker', 'particle'),
          w('すきな', 'favorite', 'adj'),
          w('キャラクター', 'character', 'noun'),
          w('を', 'object marker', 'particle'),
          w('かきます', 'draw', 'verb'),
          p('。'),
        ],
        meaning: 'Today we draw our favorite characters.',
      },
      {
        words: [
          w('わたし', 'I', 'noun'),
          w('は', 'topic marker', 'particle'),
          w('ねこ', 'cat', 'noun'),
          w('の', 'possessive', 'particle'),
          w('キャラクター', 'character', 'noun'),
          w('を', 'object marker', 'particle'),
          w('かきました', 'drew', 'verb'),
          p('。'),
        ],
        meaning: 'I drew a cat character.',
      },
      {
        words: [
          w('ゆうき', 'Yuuki', 'noun'),
          w('は', 'topic marker', 'particle'),
          p('「'),
          w('すごい', 'amazing', 'adj'),
          p('！'),
          w('じょうず', 'skillful', 'adj'),
          w('です', 'is', 'verb'),
          w('ね', 'isn\'t it', 'particle'),
          p('！」'),
          w('と', 'quotation', 'particle'),
          w('いいました', 'said', 'verb'),
          p('。'),
        ],
        meaning: 'Yuuki said "Amazing! You\'re so good!"',
      },
      {
        words: [
          w('とても', 'very', 'adv'),
          w('うれしかった', 'was happy', 'adj'),
          w('です', 'is (polite)', 'verb'),
          p('。'),
          w('また', 'again', 'adv'),
          w('らいしゅう', 'next week', 'noun'),
          w('も', 'also', 'particle'),
          w('たのしみ', 'looking forward to', 'noun'),
          w('です', 'is', 'verb'),
          p('！'),
        ],
        meaning: 'I was very happy. I\'m looking forward to next week too!',
      },
    ],
    questions: [
      { question: 'What club does the narrator attend?', options: ['Sports club', 'Music club', 'Manga club', 'Cooking club'], correctIndex: 2 },
      { question: 'What did the narrator draw?', options: ['A dog', 'A cat character', 'A flower', 'A robot'], correctIndex: 1 },
      { question: 'How did the narrator feel?', options: ['Sad', 'Bored', 'Angry', 'Happy'], correctIndex: 3 },
    ],
  },
  {
    id: 'n5-sakura',
    title: 'Cherry Blossom Picnic',
    titleJp: 'おはなみ',
    theme: 'daily-life',
    difficulty: 1,
    writingFocus: 'hiragana',
    sentences: [
      {
        words: [
          w('はる', 'spring', 'noun'),
          w('です', 'is', 'verb'),
          p('。'),
          w('さくら', 'cherry blossoms', 'noun'),
          w('が', 'subject marker', 'particle'),
          w('きれい', 'beautiful', 'adj'),
          w('です', 'is', 'verb'),
          p('。'),
        ],
        meaning: 'It\'s spring. The cherry blossoms are beautiful.',
      },
      {
        words: [
          w('ともだち', 'friends', 'noun'),
          w('と', 'with', 'particle'),
          w('おはなみ', 'cherry blossom viewing', 'noun'),
          w('に', 'to', 'particle'),
          w('いきます', 'go', 'verb'),
          p('。'),
        ],
        meaning: 'I go cherry blossom viewing with friends.',
      },
      {
        words: [
          w('おべんとう', 'boxed lunch', 'noun'),
          w('を', 'object marker', 'particle'),
          w('もって', 'bringing', 'verb'),
          w('いきます', 'go', 'verb'),
          p('。'),
        ],
        meaning: 'We bring boxed lunches.',
      },
      {
        words: [
          w('おおきい', 'big', 'adj'),
          w('き', 'tree', 'noun'),
          w('の', 'possessive', 'particle'),
          w('した', 'under', 'noun'),
          w('に', 'at', 'particle'),
          w('すわります', 'sit', 'verb'),
          p('。'),
        ],
        meaning: 'We sit under a big tree.',
      },
      {
        words: [
          w('ピンク', 'pink', 'noun'),
          w('の', 'possessive', 'particle'),
          w('はなびら', 'petals', 'noun'),
          w('が', 'subject marker', 'particle'),
          p('、'),
          w('ひらひら', 'fluttering', 'adv'),
          w('おちます', 'fall', 'verb'),
          p('。'),
        ],
        meaning: 'Pink petals flutter down.',
      },
      {
        words: [
          p('「'),
          w('きれい', 'beautiful', 'adj'),
          w('だ', 'is (casual)', 'verb'),
          w('ね', 'isn\'t it', 'particle'),
          p('！」'),
          w('みんな', 'everyone', 'noun'),
          w('が', 'subject marker', 'particle'),
          w('わらいます', 'laughs/smiles', 'verb'),
          p('。'),
        ],
        meaning: '"It\'s beautiful, isn\'t it!" Everyone smiles.',
      },
      {
        words: [
          w('はる', 'spring', 'noun'),
          w('は', 'topic marker', 'particle'),
          w('いちばん', 'number one', 'adv'),
          w('すきな', 'favorite', 'adj'),
          w('きせつ', 'season', 'noun'),
          w('です', 'is', 'verb'),
          p('。'),
        ],
        meaning: 'Spring is my favorite season.',
      },
    ],
    questions: [
      { question: 'What season is it?', options: ['Summer', 'Autumn', 'Winter', 'Spring'], correctIndex: 3 },
      { question: 'What color are the petals?', options: ['White', 'Red', 'Pink', 'Purple'], correctIndex: 2 },
      { question: 'What did they bring?', options: ['Snacks', 'Drinks', 'Boxed lunches', 'Games'], correctIndex: 2 },
    ],
  },
];

// ─── N4 Stories (more katakana, basic kanji) ─────────────────

const STORIES_N4: InteractiveStory[] = [
  {
    id: 'n4-gaming',
    title: 'The Gaming Tournament',
    titleJp: 'ゲーム大会',
    theme: 'school',
    difficulty: 2,
    writingFocus: 'katakana',
    sentences: [
      {
        words: [
          w('土曜日', 'Saturday', 'noun', 'どようび'),
          w('に', 'on', 'particle'),
          p('、'),
          w('学校', 'school', 'noun', 'がっこう'),
          w('で', 'at', 'particle'),
          w('ゲーム', 'game', 'noun'),
          w('大会', 'tournament', 'noun', 'たいかい'),
          w('が', 'subject marker', 'particle'),
          w('あります', 'there is', 'verb'),
          p('。'),
        ],
        meaning: 'On Saturday, there\'s a gaming tournament at school.',
      },
      {
        words: [
          w('みんな', 'everyone', 'noun'),
          w('コントローラー', 'controller', 'noun'),
          w('を', 'object marker', 'particle'),
          w('持って', 'bringing', 'verb', 'もって'),
          w('きました', 'came', 'verb'),
          p('。'),
        ],
        meaning: 'Everyone brought their controllers.',
      },
      {
        words: [
          w('私', 'I', 'noun', 'わたし'),
          w('の', 'possessive', 'particle'),
          w('チーム', 'team', 'noun'),
          w('は', 'topic marker', 'particle'),
          w('三', 'three', 'counter', 'さん'),
          w('人', 'people', 'counter', 'にん'),
          w('です', 'is', 'verb'),
          p('。'),
        ],
        meaning: 'My team is three people.',
      },
      {
        words: [
          w('一回戦', 'first round', 'noun', 'いっかいせん'),
          w('は', 'topic marker', 'particle'),
          w('かんたんに', 'easily', 'adv'),
          w('勝ちました', 'won', 'verb', 'かちました'),
          p('！'),
        ],
        meaning: 'We won the first round easily!',
      },
      {
        words: [
          w('でも', 'but', 'conj'),
          p('、'),
          w('二回戦', 'second round', 'noun', 'にかいせん'),
          w('は', 'topic marker', 'particle'),
          w('とても', 'very', 'adv'),
          w('強い', 'strong', 'adj', 'つよい'),
          w('チーム', 'team', 'noun'),
          w('でした', 'was', 'verb'),
          p('。'),
        ],
        meaning: 'But the second round was against a very strong team.',
      },
      {
        words: [
          w('ドキドキ', 'heart pounding', 'adv'),
          w('しながら', 'while doing', 'conj'),
          p('、'),
          w('がんばりました', 'did our best', 'verb'),
          p('。'),
        ],
        meaning: 'With our hearts pounding, we did our best.',
      },
      {
        words: [
          w('結果', 'result', 'noun', 'けっか'),
          w('は', 'topic marker', 'particle'),
          p('…'),
          w('二位', 'second place', 'noun', 'にい'),
          w('でした', 'was', 'verb'),
          p('！'),
        ],
        meaning: 'The result was... second place!',
      },
      {
        words: [
          w('くやしい', 'frustrating', 'adj'),
          w('けど', 'but', 'conj'),
          p('、'),
          w('楽しかった', 'was fun', 'adj', 'たのしかった'),
          w('です', 'is', 'verb'),
          p('。'),
          w('来年', 'next year', 'noun', 'らいねん'),
          w('は', 'topic marker', 'particle'),
          w('一位', 'first place', 'noun', 'いちい'),
          w('を', 'object marker', 'particle'),
          w('めざします', 'aim for', 'verb'),
          p('！'),
        ],
        meaning: 'It\'s frustrating, but it was fun. Next year we\'ll aim for first place!',
      },
    ],
    questions: [
      { question: 'When was the tournament?', options: ['Sunday', 'Monday', 'Saturday', 'Friday'], correctIndex: 2 },
      { question: 'How many people were on the team?', options: ['Two', 'Three', 'Four', 'Five'], correctIndex: 1 },
      { question: 'What place did they get?', options: ['First', 'Second', 'Third', 'They lost'], correctIndex: 1 },
    ],
  },
  {
    id: 'n4-shinkansen',
    title: 'Shinkansen Adventure',
    titleJp: '新幹線のたび',
    theme: 'travel',
    difficulty: 2,
    writingFocus: 'mixed',
    sentences: [
      {
        words: [
          w('今日', 'today', 'noun', 'きょう'),
          w('は', 'topic marker', 'particle'),
          w('東京', 'Tokyo', 'noun', 'とうきょう'),
          w('から', 'from', 'particle'),
          w('京都', 'Kyoto', 'noun', 'きょうと'),
          w('まで', 'to/until', 'particle'),
          w('新幹線', 'bullet train', 'noun', 'しんかんせん'),
          w('で', 'by', 'particle'),
          w('行きます', 'go', 'verb', 'いきます'),
          p('。'),
        ],
        meaning: 'Today I go from Tokyo to Kyoto by bullet train.',
      },
      {
        words: [
          w('駅', 'station', 'noun', 'えき'),
          w('で', 'at', 'particle'),
          w('おべんとう', 'boxed lunch', 'noun'),
          w('と', 'and', 'particle'),
          w('お茶', 'tea', 'noun', 'おちゃ'),
          w('を', 'object marker', 'particle'),
          w('買いました', 'bought', 'verb', 'かいました'),
          p('。'),
        ],
        meaning: 'I bought a boxed lunch and tea at the station.',
      },
      {
        words: [
          w('新幹線', 'bullet train', 'noun', 'しんかんせん'),
          w('は', 'topic marker', 'particle'),
          w('とても', 'very', 'adv'),
          w('速い', 'fast', 'adj', 'はやい'),
          w('です', 'is', 'verb'),
          p('。'),
        ],
        meaning: 'The bullet train is very fast.',
      },
      {
        words: [
          w('窓', 'window', 'noun', 'まど'),
          w('から', 'from', 'particle'),
          w('富士山', 'Mt. Fuji', 'noun', 'ふじさん'),
          w('が', 'subject marker', 'particle'),
          w('見えました', 'was visible', 'verb', 'みえました'),
          p('！'),
        ],
        meaning: 'I could see Mt. Fuji from the window!',
      },
      {
        words: [
          p('「'),
          w('わあ', 'wow', 'expr'),
          p('、'),
          w('きれい', 'beautiful', 'adj'),
          p('！」'),
          w('と', 'quotation', 'particle'),
          w('写真', 'photo', 'noun', 'しゃしん'),
          w('を', 'object marker', 'particle'),
          w('たくさん', 'many', 'adv'),
          w('撮りました', 'took', 'verb', 'とりました'),
          p('。'),
        ],
        meaning: '"Wow, beautiful!" I took many photos.',
      },
      {
        words: [
          w('二時間', 'two hours', 'noun', 'にじかん'),
          w('で', 'in (time)', 'particle'),
          w('京都', 'Kyoto', 'noun', 'きょうと'),
          w('に', 'to', 'particle'),
          w('着きました', 'arrived', 'verb', 'つきました'),
          p('。'),
        ],
        meaning: 'I arrived in Kyoto in two hours.',
      },
      {
        words: [
          w('お寺', 'temple', 'noun', 'おてら'),
          w('が', 'subject marker', 'particle'),
          w('たくさん', 'many', 'adv'),
          w('あります', 'there are', 'verb'),
          p('。'),
          w('明日', 'tomorrow', 'noun', 'あした'),
          w('が', 'subject marker', 'particle'),
          w('楽しみ', 'looking forward to', 'noun', 'たのしみ'),
          w('です', 'is', 'verb'),
          p('！'),
        ],
        meaning: 'There are many temples. I\'m looking forward to tomorrow!',
      },
    ],
    questions: [
      { question: 'Where is the narrator traveling to?', options: ['Osaka', 'Tokyo', 'Kyoto', 'Nara'], correctIndex: 2 },
      { question: 'What did they see from the window?', options: ['The ocean', 'Mt. Fuji', 'A castle', 'Rice fields'], correctIndex: 1 },
      { question: 'How long was the trip?', options: ['One hour', 'Two hours', 'Three hours', 'Four hours'], correctIndex: 1 },
    ],
  },
  {
    id: 'n4-festival',
    title: 'Night Festival',
    titleJp: '夏祭り',
    theme: 'adventure',
    difficulty: 2,
    writingFocus: 'kanji',
    sentences: [
      {
        words: [
          w('夏', 'summer', 'noun', 'なつ'),
          w('の', 'possessive', 'particle'),
          w('夜', 'night', 'noun', 'よる'),
          p('、'),
          w('友達', 'friends', 'noun', 'ともだち'),
          w('と', 'with', 'particle'),
          w('お祭り', 'festival', 'noun', 'おまつり'),
          w('に', 'to', 'particle'),
          w('行きました', 'went', 'verb', 'いきました'),
          p('。'),
        ],
        meaning: 'On a summer night, I went to a festival with friends.',
      },
      {
        words: [
          w('浴衣', 'yukata (summer kimono)', 'noun', 'ゆかた'),
          w('を', 'object marker', 'particle'),
          w('着ました', 'wore', 'verb', 'きました'),
          p('。'),
          w('青い', 'blue', 'adj', 'あおい'),
          w('浴衣', 'yukata', 'noun', 'ゆかた'),
          w('です', 'is', 'verb'),
          p('。'),
        ],
        meaning: 'I wore a yukata. It\'s a blue yukata.',
      },
      {
        words: [
          w('たこやき', 'takoyaki (octopus balls)', 'noun'),
          w('と', 'and', 'particle'),
          w('かき氷', 'shaved ice', 'noun', 'かきごおり'),
          w('を', 'object marker', 'particle'),
          w('食べました', 'ate', 'verb', 'たべました'),
          p('。'),
        ],
        meaning: 'I ate takoyaki and shaved ice.',
      },
      {
        words: [
          w('金魚', 'goldfish', 'noun', 'きんぎょ'),
          w('すくい', 'scooping', 'noun'),
          w('を', 'object marker', 'particle'),
          w('しました', 'did', 'verb'),
          p('。'),
          w('むずかしかった', 'was difficult', 'adj'),
          w('です', 'is', 'verb'),
          p('！'),
        ],
        meaning: 'I tried goldfish scooping. It was difficult!',
      },
      {
        words: [
          w('でも', 'but', 'conj'),
          p('、'),
          w('一匹', 'one (animal)', 'counter', 'いっぴき'),
          w('つかまえました', 'caught', 'verb'),
          p('！'),
        ],
        meaning: 'But I caught one!',
      },
      {
        words: [
          w('最後', 'lastly', 'noun', 'さいご'),
          w('に', 'at', 'particle'),
          p('、'),
          w('花火', 'fireworks', 'noun', 'はなび'),
          w('を', 'object marker', 'particle'),
          w('見ました', 'watched', 'verb', 'みました'),
          p('。'),
        ],
        meaning: 'At the end, we watched fireworks.',
      },
      {
        words: [
          w('空', 'sky', 'noun', 'そら'),
          w('に', 'in', 'particle'),
          w('大きい', 'big', 'adj', 'おおきい'),
          w('花火', 'fireworks', 'noun', 'はなび'),
          w('が', 'subject marker', 'particle'),
          p('、'),
          w('ドーン', 'boom', 'adv'),
          w('と', 'with (sound)', 'particle'),
          w('ひろがりました', 'spread out', 'verb'),
          p('。'),
        ],
        meaning: 'Big fireworks spread across the sky with a boom.',
      },
      {
        words: [
          w('最高', 'the best', 'adj', 'さいこう'),
          w('の', 'possessive', 'particle'),
          w('夏', 'summer', 'noun', 'なつ'),
          w('の', 'possessive', 'particle'),
          w('思い出', 'memory', 'noun', 'おもいで'),
          w('に', 'to', 'particle'),
          w('なりました', 'became', 'verb'),
          p('。'),
        ],
        meaning: 'It became the best summer memory.',
      },
    ],
    questions: [
      { question: 'What did the narrator wear?', options: ['A dress', 'A yukata', 'A school uniform', 'Casual clothes'], correctIndex: 1 },
      { question: 'What game did they play?', options: ['Ring toss', 'Goldfish scooping', 'Balloon pop', 'Shooting game'], correctIndex: 1 },
      { question: 'What happened at the end?', options: ['They went home', 'They watched fireworks', 'They ate dinner', 'They danced'], correctIndex: 1 },
    ],
  },
];

// ─── Exports ────────────────────────────────────────────────

export const INTERACTIVE_STORIES: InteractiveStory[] = [...STORIES_N5, ...STORIES_N4];

export function getStoriesByDifficulty(difficulty: number): InteractiveStory[] {
  return INTERACTIVE_STORIES.filter((s) => s.difficulty === difficulty);
}

export function getStoriesByTheme(theme: InteractiveStory['theme']): InteractiveStory[] {
  return INTERACTIVE_STORIES.filter((s) => s.theme === theme);
}
