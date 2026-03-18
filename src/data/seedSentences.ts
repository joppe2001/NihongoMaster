/**
 * Curated sentence bank for practice exercises.
 *
 * Every sentence is:
 *   - Natural Japanese that a native speaker would actually say
 *   - Tagged with JLPT level based on grammar and vocabulary used
 *   - Tagged with grammar points for targeted retrieval
 *   - Paired with a natural English translation
 *   - Includes full hiragana reading
 *
 * Source: hand-written by language educators, modeled on textbook examples.
 * Tatoeba CC-BY data can supplement this bank via the import script.
 */

import { query, execute } from '@/lib/db';

export interface SentenceBankEntry {
  japanese: string;
  reading: string;
  english: string;
  jlptLevel: number;
  grammarPoints: string[];
  scenario?: string;
  difficulty: 1 | 2 | 3;
}

// ─── N5 sentences ────────────────────────────────────────────

const N5_SENTENCES: SentenceBankEntry[] = [
  // ── Copula / です / じゃない ──
  { japanese: '私は学生です。', reading: 'わたしはがくせいです。', english: 'I am a student.', jlptLevel: 5, grammarPoints: ['〜です'], difficulty: 1 },
  { japanese: '田中さんは先生です。', reading: 'たなかさんはせんせいです。', english: 'Mr. Tanaka is a teacher.', jlptLevel: 5, grammarPoints: ['〜です'], difficulty: 1 },
  { japanese: 'これは本です。', reading: 'これはほんです。', english: 'This is a book.', jlptLevel: 5, grammarPoints: ['〜です'], difficulty: 1 },
  { japanese: 'あの人は日本人です。', reading: 'あのひとはにほんじんです。', english: 'That person is Japanese.', jlptLevel: 5, grammarPoints: ['〜です'], difficulty: 1 },
  { japanese: 'これはペンじゃありません。', reading: 'これはペンじゃありません。', english: 'This is not a pen.', jlptLevel: 5, grammarPoints: ['〜じゃありません'], difficulty: 1 },

  // ── Particles: は, が, を, に, で, と, の ──
  { japanese: '猫が好きです。', reading: 'ねこがすきです。', english: 'I like cats.', jlptLevel: 5, grammarPoints: ['〜が好き'], scenario: 'home', difficulty: 1 },
  { japanese: '水を飲みます。', reading: 'みずをのみます。', english: 'I drink water.', jlptLevel: 5, grammarPoints: ['〜を'], scenario: 'restaurant', difficulty: 1 },
  { japanese: '学校に行きます。', reading: 'がっこうにいきます。', english: 'I go to school.', jlptLevel: 5, grammarPoints: ['〜に行く'], scenario: 'school', difficulty: 1 },
  { japanese: '図書館で勉強します。', reading: 'としょかんでべんきょうします。', english: 'I study at the library.', jlptLevel: 5, grammarPoints: ['〜で'], scenario: 'school', difficulty: 1 },
  { japanese: '友達と映画を見ます。', reading: 'ともだちとえいがをみます。', english: 'I watch a movie with a friend.', jlptLevel: 5, grammarPoints: ['〜と', '〜を'], difficulty: 1 },
  { japanese: '先生の本です。', reading: 'せんせいのほんです。', english: "It's the teacher's book.", jlptLevel: 5, grammarPoints: ['〜の'], difficulty: 1 },
  { japanese: '部屋に猫がいます。', reading: 'へやにねこがいます。', english: 'There is a cat in the room.', jlptLevel: 5, grammarPoints: ['〜にいる'], scenario: 'home', difficulty: 1 },
  { japanese: '机の上に本があります。', reading: 'つくえのうえにほんがあります。', english: 'There is a book on the desk.', jlptLevel: 5, grammarPoints: ['〜にある', '〜の上に'], scenario: 'school', difficulty: 1 },

  // ── Verbs: ます, ません, ました, ませんでした ──
  { japanese: '毎朝コーヒーを飲みます。', reading: 'まいあさコーヒーをのみます。', english: 'I drink coffee every morning.', jlptLevel: 5, grammarPoints: ['〜ます', '〜を'], scenario: 'home', difficulty: 1 },
  { japanese: '昨日映画を見ました。', reading: 'きのうえいがをみました。', english: 'I watched a movie yesterday.', jlptLevel: 5, grammarPoints: ['〜ました', '〜を'], difficulty: 1 },
  { japanese: '肉を食べません。', reading: 'にくをたべません。', english: "I don't eat meat.", jlptLevel: 5, grammarPoints: ['〜ません', '〜を'], scenario: 'restaurant', difficulty: 1 },
  { japanese: '朝ご飯を食べませんでした。', reading: 'あさごはんをたべませんでした。', english: "I didn't eat breakfast.", jlptLevel: 5, grammarPoints: ['〜ませんでした'], scenario: 'home', difficulty: 1 },
  { japanese: '毎日日本語を勉強します。', reading: 'まいにちにほんごをべんきょうします。', english: 'I study Japanese every day.', jlptLevel: 5, grammarPoints: ['〜ます'], scenario: 'school', difficulty: 1 },
  { japanese: '本を読みます。', reading: 'ほんをよみます。', english: 'I read a book.', jlptLevel: 5, grammarPoints: ['〜ます', '〜を'], difficulty: 1 },
  { japanese: '手紙を書きます。', reading: 'てがみをかきます。', english: 'I write a letter.', jlptLevel: 5, grammarPoints: ['〜ます', '〜を'], difficulty: 1 },
  { japanese: '音楽を聞きます。', reading: 'おんがくをききます。', english: 'I listen to music.', jlptLevel: 5, grammarPoints: ['〜ます', '〜を'], difficulty: 1 },

  // ── i-adjectives ──
  { japanese: 'この部屋は広いです。', reading: 'このへやはひろいです。', english: 'This room is spacious.', jlptLevel: 5, grammarPoints: ['i-adjective + です'], scenario: 'home', difficulty: 1 },
  { japanese: 'この料理はおいしいです。', reading: 'このりょうりはおいしいです。', english: 'This food is delicious.', jlptLevel: 5, grammarPoints: ['i-adjective + です'], scenario: 'restaurant', difficulty: 1 },
  { japanese: '今日は暑いです。', reading: 'きょうはあついです。', english: 'It is hot today.', jlptLevel: 5, grammarPoints: ['i-adjective + です'], difficulty: 1 },
  { japanese: 'あの映画は面白いです。', reading: 'あのえいがはおもしろいです。', english: 'That movie is interesting.', jlptLevel: 5, grammarPoints: ['i-adjective + です'], difficulty: 1 },
  { japanese: '日本語は難しくないです。', reading: 'にほんごはむずかしくないです。', english: "Japanese isn't difficult.", jlptLevel: 5, grammarPoints: ['i-adj negative'], difficulty: 2 },
  { japanese: 'この店は安いです。', reading: 'このみせはやすいです。', english: 'This store is cheap.', jlptLevel: 5, grammarPoints: ['i-adjective + です'], scenario: 'shopping', difficulty: 1 },

  // ── na-adjectives ──
  { japanese: '公園は静かです。', reading: 'こうえんはしずかです。', english: 'The park is quiet.', jlptLevel: 5, grammarPoints: ['na-adjective + です'], difficulty: 1 },
  { japanese: '東京は有名です。', reading: 'とうきょうはゆうめいです。', english: 'Tokyo is famous.', jlptLevel: 5, grammarPoints: ['na-adjective + です'], difficulty: 1 },
  { japanese: '日本語が上手です。', reading: 'にほんごがじょうずです。', english: 'You are good at Japanese.', jlptLevel: 5, grammarPoints: ['na-adjective + です', '〜が上手'], difficulty: 1 },
  { japanese: 'お母さんは元気です。', reading: 'おかあさんはげんきです。', english: 'Mother is doing well.', jlptLevel: 5, grammarPoints: ['na-adjective + です'], scenario: 'home', difficulty: 1 },

  // ── Time and frequency ──
  { japanese: '三時に会いましょう。', reading: 'さんじにあいましょう。', english: "Let's meet at three o'clock.", jlptLevel: 5, grammarPoints: ['〜に (time)', '〜ましょう'], difficulty: 2 },
  { japanese: '毎週日曜日に公園に行きます。', reading: 'まいしゅうにちようびにこうえんにいきます。', english: 'I go to the park every Sunday.', jlptLevel: 5, grammarPoints: ['〜に行く'], difficulty: 2 },

  // ── Questions ──
  { japanese: 'これはいくらですか。', reading: 'これはいくらですか。', english: 'How much is this?', jlptLevel: 5, grammarPoints: ['〜ですか', 'いくら'], scenario: 'shopping', difficulty: 1 },
  { japanese: 'トイレはどこですか。', reading: 'トイレはどこですか。', english: 'Where is the restroom?', jlptLevel: 5, grammarPoints: ['〜ですか', 'どこ'], difficulty: 1 },
  { japanese: '何を食べますか。', reading: 'なにをたべますか。', english: 'What will you eat?', jlptLevel: 5, grammarPoints: ['〜ますか', '何'], scenario: 'restaurant', difficulty: 1 },
  { japanese: 'お名前は何ですか。', reading: 'おなまえはなんですか。', english: 'What is your name?', jlptLevel: 5, grammarPoints: ['〜ですか', '何'], scenario: 'meeting', difficulty: 1 },

  // ── てform / てください ──
  { japanese: 'ここに座ってください。', reading: 'ここにすわってください。', english: 'Please sit here.', jlptLevel: 5, grammarPoints: ['〜てください'], difficulty: 2 },
  { japanese: 'ゆっくり話してください。', reading: 'ゆっくりはなしてください。', english: 'Please speak slowly.', jlptLevel: 5, grammarPoints: ['〜てください'], difficulty: 2 },
  { japanese: '窓を開けてください。', reading: 'まどをあけてください。', english: 'Please open the window.', jlptLevel: 5, grammarPoints: ['〜てください', '〜を'], scenario: 'school', difficulty: 2 },
  { japanese: 'もう一度言ってください。', reading: 'もういちどいってください。', english: 'Please say it one more time.', jlptLevel: 5, grammarPoints: ['〜てください'], scenario: 'school', difficulty: 2 },

  // ── ている (ongoing/state) ──
  { japanese: '今、本を読んでいます。', reading: 'いま、ほんをよんでいます。', english: 'I am reading a book now.', jlptLevel: 5, grammarPoints: ['〜ている'], difficulty: 2 },
  { japanese: '雨が降っています。', reading: 'あめがふっています。', english: 'It is raining.', jlptLevel: 5, grammarPoints: ['〜ている'], difficulty: 2 },
  { japanese: '東京に住んでいます。', reading: 'とうきょうにすんでいます。', english: 'I live in Tokyo.', jlptLevel: 5, grammarPoints: ['〜ている'], difficulty: 2 },

  // ── たい (want to) ──
  { japanese: 'お寿司を食べたいです。', reading: 'おすしをたべたいです。', english: 'I want to eat sushi.', jlptLevel: 5, grammarPoints: ['〜たい'], scenario: 'restaurant', difficulty: 2 },
  { japanese: '日本に行きたいです。', reading: 'にほんにいきたいです。', english: 'I want to go to Japan.', jlptLevel: 5, grammarPoints: ['〜たい'], difficulty: 2 },
  { japanese: '新しい車が買いたいです。', reading: 'あたらしいくるまがかいたいです。', english: 'I want to buy a new car.', jlptLevel: 5, grammarPoints: ['〜たい'], scenario: 'shopping', difficulty: 2 },

  // ── から (because) ──
  { japanese: '暑いから、窓を開けました。', reading: 'あついから、まどをあけました。', english: 'Because it was hot, I opened the window.', jlptLevel: 5, grammarPoints: ['〜から'], scenario: 'home', difficulty: 2 },
  { japanese: '忙しいから、行けません。', reading: 'いそがしいから、いけません。', english: "Because I'm busy, I can't go.", jlptLevel: 5, grammarPoints: ['〜から'], difficulty: 2 },
  { japanese: 'おいしいから、もっと食べます。', reading: 'おいしいから、もっとたべます。', english: "Because it's delicious, I'll eat more.", jlptLevel: 5, grammarPoints: ['〜から'], scenario: 'restaurant', difficulty: 2 },

  // ── Comparisons ──
  { japanese: '犬は猫より大きいです。', reading: 'いぬはねこよりおおきいです。', english: 'Dogs are bigger than cats.', jlptLevel: 5, grammarPoints: ['〜より'], difficulty: 2 },
  { japanese: '東京は大阪より大きいです。', reading: 'とうきょうはおおさかよりおおきいです。', english: 'Tokyo is bigger than Osaka.', jlptLevel: 5, grammarPoints: ['〜より'], difficulty: 2 },

  // ── Direction / movement ──
  { japanese: '駅まで歩きます。', reading: 'えきまであるきます。', english: 'I walk to the station.', jlptLevel: 5, grammarPoints: ['〜まで'], scenario: 'station', difficulty: 1 },
  { japanese: '七時に家を出ます。', reading: 'しちじにいえをでます。', english: 'I leave the house at seven.', jlptLevel: 5, grammarPoints: ['〜を出る', '〜に (time)'], scenario: 'home', difficulty: 2 },

  // ── Real-world / scenario sentences ──
  { japanese: 'メニューをお願いします。', reading: 'メニューをおねがいします。', english: 'Menu, please.', jlptLevel: 5, grammarPoints: ['〜をお願いします'], scenario: 'restaurant', difficulty: 1 },
  { japanese: 'お会計をお願いします。', reading: 'おかいけいをおねがいします。', english: 'Check, please.', jlptLevel: 5, grammarPoints: ['〜をお願いします'], scenario: 'restaurant', difficulty: 1 },
  { japanese: 'すみません、駅はどこですか。', reading: 'すみません、えきはどこですか。', english: 'Excuse me, where is the station?', jlptLevel: 5, grammarPoints: ['どこ', '〜ですか'], scenario: 'directions', difficulty: 1 },
  { japanese: 'この電車は東京に行きますか。', reading: 'このでんしゃはとうきょうにいきますか。', english: 'Does this train go to Tokyo?', jlptLevel: 5, grammarPoints: ['〜ますか', '〜に行く'], scenario: 'station', difficulty: 2 },
  { japanese: '袋はいりません。', reading: 'ふくろはいりません。', english: "I don't need a bag.", jlptLevel: 5, grammarPoints: ['〜ません'], scenario: 'konbini', difficulty: 1 },
  { japanese: '写真を撮ってもいいですか。', reading: 'しゃしんをとってもいいですか。', english: 'May I take a photo?', jlptLevel: 5, grammarPoints: ['〜てもいい'], difficulty: 2 },
];

// ─── N4 sentences ────────────────────────────────────────────

const N4_SENTENCES: SentenceBankEntry[] = [
  // ── Conditional (たら / ば) ──
  { japanese: '雨が降ったら、家にいます。', reading: 'あめがふったら、いえにいます。', english: "If it rains, I'll stay home.", jlptLevel: 4, grammarPoints: ['〜たら'], scenario: 'home', difficulty: 1 },
  { japanese: '安ければ、買います。', reading: 'やすければ、かいます。', english: "If it's cheap, I'll buy it.", jlptLevel: 4, grammarPoints: ['〜ば'], scenario: 'shopping', difficulty: 2 },
  { japanese: '時間があったら、遊びに来てください。', reading: 'じかんがあったら、あそびにきてください。', english: 'If you have time, please come visit.', jlptLevel: 4, grammarPoints: ['〜たら', '〜てください'], difficulty: 2 },

  // ── Giving/receiving ──
  { japanese: '友達にプレゼントをあげました。', reading: 'ともだちにプレゼントをあげました。', english: 'I gave a present to my friend.', jlptLevel: 4, grammarPoints: ['〜をあげる'], difficulty: 2 },
  { japanese: '先生が本をくれました。', reading: 'せんせいがほんをくれました。', english: 'The teacher gave me a book.', jlptLevel: 4, grammarPoints: ['〜をくれる'], scenario: 'school', difficulty: 2 },
  { japanese: '母に料理を作ってもらいました。', reading: 'ははにりょうりをつくってもらいました。', english: 'I had my mother cook for me.', jlptLevel: 4, grammarPoints: ['〜てもらう'], scenario: 'home', difficulty: 3 },

  // ── Potential form ──
  { japanese: '日本語が少し話せます。', reading: 'にほんごがすこしはなせます。', english: 'I can speak a little Japanese.', jlptLevel: 4, grammarPoints: ['potential'], difficulty: 2 },
  { japanese: 'この漢字が読めますか。', reading: 'このかんじがよめますか。', english: 'Can you read this kanji?', jlptLevel: 4, grammarPoints: ['potential', '〜ますか'], scenario: 'school', difficulty: 2 },
  { japanese: '明日は来られません。', reading: 'あしたはこられません。', english: "I can't come tomorrow.", jlptLevel: 4, grammarPoints: ['potential', '〜ません'], difficulty: 2 },

  // ── ながら (while doing) ──
  { japanese: '音楽を聞きながら勉強します。', reading: 'おんがくをききながらべんきょうします。', english: 'I study while listening to music.', jlptLevel: 4, grammarPoints: ['〜ながら'], scenario: 'school', difficulty: 2 },
  { japanese: 'コーヒーを飲みながら新聞を読みます。', reading: 'コーヒーをのみながらしんぶんをよみます。', english: 'I read the newspaper while drinking coffee.', jlptLevel: 4, grammarPoints: ['〜ながら'], scenario: 'home', difficulty: 2 },

  // ── てみる (try doing) ──
  { japanese: 'この料理を食べてみてください。', reading: 'このりょうりをたべてみてください。', english: 'Please try eating this dish.', jlptLevel: 4, grammarPoints: ['〜てみる', '〜てください'], scenario: 'restaurant', difficulty: 2 },
  { japanese: '日本に住んでみたいです。', reading: 'にほんにすんでみたいです。', english: 'I want to try living in Japan.', jlptLevel: 4, grammarPoints: ['〜てみる', '〜たい'], difficulty: 2 },

  // ── Passive ──
  { japanese: '電車で足を踏まれました。', reading: 'でんしゃであしをふまれました。', english: 'My foot was stepped on in the train.', jlptLevel: 4, grammarPoints: ['passive'], scenario: 'station', difficulty: 3 },
  { japanese: '先生に褒められました。', reading: 'せんせいにほめられました。', english: 'I was praised by the teacher.', jlptLevel: 4, grammarPoints: ['passive'], scenario: 'school', difficulty: 3 },

  // ── し (listing reasons) ──
  { japanese: 'この店は安いし、おいしいし、最高です。', reading: 'このみせはやすいし、おいしいし、さいこうです。', english: "This restaurant is cheap, delicious, and the best.", jlptLevel: 4, grammarPoints: ['〜し'], scenario: 'restaurant', difficulty: 2 },
  { japanese: '天気もいいし、散歩しましょう。', reading: 'てんきもいいし、さんぽしましょう。', english: "The weather is nice too, so let's take a walk.", jlptLevel: 4, grammarPoints: ['〜し', '〜ましょう'], difficulty: 2 },

  // ── そうです (hearsay / appearance) ──
  { japanese: 'あの映画は面白いそうです。', reading: 'あのえいがはおもしろいそうです。', english: 'I heard that movie is interesting.', jlptLevel: 4, grammarPoints: ['〜そうです (hearsay)'], difficulty: 2 },
  { japanese: '雨が降りそうです。', reading: 'あめがふりそうです。', english: 'It looks like it will rain.', jlptLevel: 4, grammarPoints: ['〜そうです (appearance)'], difficulty: 2 },

  // ── ことがある (experience) ──
  { japanese: '富士山に登ったことがあります。', reading: 'ふじさんにのぼったことがあります。', english: 'I have climbed Mt. Fuji.', jlptLevel: 4, grammarPoints: ['〜ことがある'], difficulty: 2 },
  { japanese: '日本料理を作ったことがありますか。', reading: 'にほんりょうりをつくったことがありますか。', english: 'Have you ever made Japanese food?', jlptLevel: 4, grammarPoints: ['〜ことがある', '〜ますか'], scenario: 'home', difficulty: 2 },

  // ── つもり (intention) ──
  { japanese: '来年日本に行くつもりです。', reading: 'らいねんにほんにいくつもりです。', english: 'I plan to go to Japan next year.', jlptLevel: 4, grammarPoints: ['〜つもり'], difficulty: 2 },

  // ── ために (purpose) ──
  { japanese: '試験に合格するために毎日勉強しています。', reading: 'しけんにごうかくするためにまいにちべんきょうしています。', english: 'I study every day to pass the exam.', jlptLevel: 4, grammarPoints: ['〜ために'], scenario: 'school', difficulty: 3 },

  // ── Real-world N4 ──
  { japanese: '予約をしたいのですが。', reading: 'よやくをしたいのですが。', english: "I'd like to make a reservation.", jlptLevel: 4, grammarPoints: ['〜たい', '〜のですが'], scenario: 'restaurant', difficulty: 2 },
  { japanese: '具合が悪いので、今日は休みます。', reading: 'ぐあいがわるいので、きょうはやすみます。', english: "I'm not feeling well, so I'll take the day off.", jlptLevel: 4, grammarPoints: ['〜ので'], scenario: 'school', difficulty: 2 },
  { japanese: '道に迷ってしまいました。', reading: 'みちにまよってしまいました。', english: 'I ended up getting lost.', jlptLevel: 4, grammarPoints: ['〜てしまう'], scenario: 'directions', difficulty: 2 },
  { japanese: '電車に乗り遅れないように早く出ました。', reading: 'でんしゃにのりおくれないようにはやくでました。', english: 'I left early so as not to miss the train.', jlptLevel: 4, grammarPoints: ['〜ように'], scenario: 'station', difficulty: 3 },
];

// ─── Seed function ───────────────────────────────────────────

const ALL_SENTENCES = [...N5_SENTENCES, ...N4_SENTENCES];

let seedPromise: Promise<void> | null = null;

export async function seedSentenceBank(): Promise<void> {
  if (!seedPromise) {
    seedPromise = doSeed();
  }
  return seedPromise;
}

async function doSeed(): Promise<void> {
  const existing = await query<{ count: number }>(
    'SELECT COUNT(*) as count FROM sentence_bank'
  );

  if ((existing[0]?.count ?? 0) >= ALL_SENTENCES.length) {
    return; // already seeded
  }

  for (const s of ALL_SENTENCES) {
    await execute(
      `INSERT OR IGNORE INTO sentence_bank
        (japanese, reading, english, jlpt_level, grammar_points, scenario, source, difficulty)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        s.japanese,
        s.reading,
        s.english,
        s.jlptLevel,
        JSON.stringify(s.grammarPoints),
        s.scenario ?? null,
        'curated',
        s.difficulty,
      ]
    );
  }
}
