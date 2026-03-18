/**
 * Mini reading stories using N5 grammar and vocabulary.
 * Every story is about a real situation — no "I am an apple."
 * Uses {漢字|かんじ} furigana syntax for FuriganaText component.
 */

export interface ReadingStory {
  id: string;
  title: string;
  titleReading: string;
  icon: string;
  difficulty: 1 | 2 | 3;
  sentences: {
    japanese: string;   // With furigana markup
    english: string;
  }[];
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
  }[];
}

export const READING_STORIES: ReadingStory[] = [
  {
    id: 'story-konbini',
    title: 'コンビニで',
    titleReading: 'At the Convenience Store',
    icon: '🏪',
    difficulty: 1,
    sentences: [
      { japanese: '{今日|きょう}は{暑|あつ}いです。', english: 'Today is hot.' },
      { japanese: '{私|わたし}はコンビニに{行|い}きます。', english: 'I go to the convenience store.' },
      { japanese: '{冷|つめ}たい{水|みず}を{買|か}います。', english: 'I buy cold water.' },
      { japanese: '「{袋|ふくろ}はいりません」と{言|い}います。', english: '"I don\'t need a bag," I say.' },
      { japanese: '{水|みず}を{飲|の}みます。おいしいです！', english: 'I drink the water. It\'s refreshing!' },
    ],
    questions: [
      { question: 'What is the weather like?', options: ['Cold', 'Hot', 'Rainy', 'Windy'], correctIndex: 1 },
      { question: 'What does the person buy?', options: ['Tea', 'Coffee', 'Water', 'Juice'], correctIndex: 2 },
      { question: 'Does the person want a bag?', options: ['Yes', 'No', 'Two bags', 'A big bag'], correctIndex: 1 },
    ],
  },
  {
    id: 'story-restaurant',
    title: 'レストランで',
    titleReading: 'At the Restaurant',
    icon: '🍜',
    difficulty: 1,
    sentences: [
      { japanese: '{友達|ともだち}と{一緒|いっしょ}にレストランに{行|い}きます。', english: 'I go to a restaurant with a friend.' },
      { japanese: '「メニューをお{願|ねが}いします」', english: '"Menu, please."' },
      { japanese: '{友達|ともだち}はラーメンを{食|た}べます。', english: 'My friend eats ramen.' },
      { japanese: '{私|わたし}はカレーを{食|た}べます。', english: 'I eat curry.' },
      { japanese: 'とてもおいしかったです。', english: 'It was very delicious.' },
      { japanese: '「お{会計|かいけい}をお{願|ねが}いします」', english: '"Check, please."' },
    ],
    questions: [
      { question: 'Who does the person go with?', options: ['Alone', 'Family', 'A friend', 'Teacher'], correctIndex: 2 },
      { question: 'What does the friend eat?', options: ['Curry', 'Sushi', 'Ramen', 'Rice'], correctIndex: 2 },
      { question: 'How was the food?', options: ['Bad', 'OK', 'Expensive', 'Delicious'], correctIndex: 3 },
    ],
  },
  {
    id: 'story-train',
    title: '{電車|でんしゃ}に{乗|の}る',
    titleReading: 'Taking the Train',
    icon: '🚃',
    difficulty: 2,
    sentences: [
      { japanese: '{朝|あさ}、{駅|えき}に{行|い}きます。', english: 'In the morning, I go to the station.' },
      { japanese: '「{新宿|しんじゅく}まで、いくらですか」', english: '"How much to Shinjuku?"' },
      { japanese: '「二百円です」', english: '"Two hundred yen."' },
      { japanese: '切符を{買|か}います。', english: 'I buy a ticket.' },
      { japanese: '{電車|でんしゃ}は{七時|しちじ}に{来|き}ます。', english: 'The train comes at 7 o\'clock.' },
      { japanese: '{電車|でんしゃ}の{中|なか}で{本|ほん}を{読|よ}みます。', english: 'I read a book on the train.' },
    ],
    questions: [
      { question: 'Where is the person going?', options: ['Tokyo', 'Shinjuku', 'Shibuya', 'Osaka'], correctIndex: 1 },
      { question: 'How much is the ticket?', options: ['100 yen', '200 yen', '300 yen', '500 yen'], correctIndex: 1 },
      { question: 'What does the person do on the train?', options: ['Sleep', 'Read a book', 'Eat', 'Listen to music'], correctIndex: 1 },
    ],
  },
  {
    id: 'story-friend',
    title: '{友達|ともだち}に{会|あ}う',
    titleReading: 'Meeting a Friend',
    icon: '👫',
    difficulty: 1,
    sentences: [
      { japanese: '{土曜日|どようび}に{友達|ともだち}に{会|あ}います。', english: 'On Saturday, I meet a friend.' },
      { japanese: '「{久|ひさ}しぶり！{元気|げんき}？」', english: '"Long time no see! How are you?"' },
      { japanese: '「うん、{元気|げんき}だよ。{最近|さいきん}どう？」', english: '"Yeah, I\'m fine. How have you been?"' },
      { japanese: '一緒にカフェに{行|い}きます。', english: 'We go to a cafe together.' },
      { japanese: 'コーヒーを{飲|の}みながら、たくさん{話|はな}します。', english: 'We talk a lot while drinking coffee.' },
      { japanese: 'とても{楽|たの}しかったです。', english: 'It was a lot of fun.' },
    ],
    questions: [
      { question: 'When do they meet?', options: ['Sunday', 'Saturday', 'Monday', 'Friday'], correctIndex: 1 },
      { question: 'Where do they go?', options: ['Restaurant', 'Park', 'Cafe', 'Station'], correctIndex: 2 },
      { question: 'What do they drink?', options: ['Tea', 'Water', 'Juice', 'Coffee'], correctIndex: 3 },
    ],
  },
  {
    id: 'story-room',
    title: '{私|わたし}の{部屋|へや}',
    titleReading: 'My Room',
    icon: '🏠',
    difficulty: 1,
    sentences: [
      { japanese: '{私|わたし}の{部屋|へや}は{小|ちい}さいです。', english: 'My room is small.' },
      { japanese: '{机|つくえ}の{上|うえ}に{本|ほん}があります。', english: 'There are books on the desk.' },
      { japanese: 'ベッドの{隣|となり}に{窓|まど}があります。', english: 'There is a window next to the bed.' },
      { japanese: '{窓|まど}から{山|やま}が{見|み}えます。', english: 'I can see mountains from the window.' },
      { japanese: 'この{部屋|へや}が{好|す}きです。', english: 'I like this room.' },
    ],
    questions: [
      { question: 'How is the room?', options: ['Big', 'Small', 'New', 'Dark'], correctIndex: 1 },
      { question: 'What is on the desk?', options: ['Computer', 'Food', 'Books', 'Phone'], correctIndex: 2 },
      { question: 'What can be seen from the window?', options: ['Ocean', 'City', 'Mountains', 'Park'], correctIndex: 2 },
    ],
  },
  {
    id: 'story-weekend',
    title: '{週末|しゅうまつ}の{予定|よてい}',
    titleReading: 'Weekend Plans',
    icon: '📅',
    difficulty: 2,
    sentences: [
      { japanese: '「{週末|しゅうまつ}、{何|なに}をしますか」', english: '"What are you doing this weekend?"' },
      { japanese: '「{土曜日|どようび}は{買|か}い{物|もの}に{行|い}きます」', english: '"On Saturday, I\'m going shopping."' },
      { japanese: '「{日曜日|にちようび}は{家|いえ}で{映画|えいが}を{見|み}ます」', english: '"On Sunday, I\'ll watch a movie at home."' },
      { japanese: '「いいですね。{一緒|いっしょ}に{行|い}きませんか」', english: '"That\'s nice. Would you like to go together?"' },
      { japanese: '「はい、ぜひ！」', english: '"Yes, of course!"' },
    ],
    questions: [
      { question: 'What happens on Saturday?', options: ['Study', 'Shopping', 'Work', 'Travel'], correctIndex: 1 },
      { question: 'What happens on Sunday?', options: ['Shopping', 'Cooking', 'Watch a movie', 'Clean'], correctIndex: 2 },
      { question: 'Does the person accept the invitation?', options: ['No', 'Maybe', 'Yes', 'Not sure'], correctIndex: 2 },
    ],
  },
  {
    id: 'story-school',
    title: '{学校|がっこう}の{一日|いちにち}',
    titleReading: 'A Day at School',
    icon: '🏫',
    difficulty: 2,
    sentences: [
      { japanese: '{朝|あさ}{八時|はちじ}に{学校|がっこう}に{行|い}きます。', english: 'I go to school at 8 in the morning.' },
      { japanese: '{九時|くじ}から{授業|じゅぎょう}が{始|はじ}まります。', english: 'Class starts at 9.' },
      { japanese: '{日本語|にほんご}の{授業|じゅぎょう}は{面白|おもしろ}いです。', english: 'Japanese class is interesting.' },
      { japanese: '{昼|ひる}ご{飯|はん}は{友達|ともだち}と{食|た}べます。', english: 'I eat lunch with friends.' },
      { japanese: '{三時|さんじ}に{授業|じゅぎょう}が{終|お}わります。', english: 'Class ends at 3.' },
      { japanese: 'その{後|あと}、{図書館|としょかん}で{勉強|べんきょう}します。', english: 'After that, I study at the library.' },
    ],
    questions: [
      { question: 'What time does school start?', options: ['7:00', '8:00', '9:00', '10:00'], correctIndex: 2 },
      { question: 'How is the Japanese class?', options: ['Boring', 'Difficult', 'Interesting', 'Easy'], correctIndex: 2 },
      { question: 'Where does the person study after class?', options: ['Home', 'Cafe', 'Library', 'Park'], correctIndex: 2 },
    ],
  },
];
