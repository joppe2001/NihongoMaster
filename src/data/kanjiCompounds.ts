/**
 * Common N5-level kanji compound words (熟語).
 * Maps individual kanji to compounds they form.
 */

export interface CompoundWord {
  word: string;
  reading: string;
  meaning: string;
}

export const KANJI_COMPOUNDS: Record<string, CompoundWord[]> = {
  '一': [
    { word: '一人', reading: 'ひとり', meaning: 'one person / alone' },
    { word: '一つ', reading: 'ひとつ', meaning: 'one (thing)' },
    { word: '一日', reading: 'いちにち', meaning: 'one day' },
    { word: '一番', reading: 'いちばん', meaning: 'number one / most' },
  ],
  '二': [
    { word: '二人', reading: 'ふたり', meaning: 'two people' },
    { word: '二つ', reading: 'ふたつ', meaning: 'two (things)' },
  ],
  '三': [
    { word: '三つ', reading: 'みっつ', meaning: 'three (things)' },
    { word: '三人', reading: 'さんにん', meaning: 'three people' },
  ],
  '日': [
    { word: '日本', reading: 'にほん', meaning: 'Japan' },
    { word: '日本語', reading: 'にほんご', meaning: 'Japanese language' },
    { word: '毎日', reading: 'まいにち', meaning: 'every day' },
    { word: '今日', reading: 'きょう', meaning: 'today' },
    { word: '明日', reading: 'あした', meaning: 'tomorrow' },
    { word: '昨日', reading: 'きのう', meaning: 'yesterday' },
    { word: '誕生日', reading: 'たんじょうび', meaning: 'birthday' },
    { word: '日曜日', reading: 'にちようび', meaning: 'Sunday' },
  ],
  '月': [
    { word: '月曜日', reading: 'げつようび', meaning: 'Monday' },
    { word: '今月', reading: 'こんげつ', meaning: 'this month' },
    { word: '来月', reading: 'らいげつ', meaning: 'next month' },
    { word: '先月', reading: 'せんげつ', meaning: 'last month' },
  ],
  '火': [{ word: '火曜日', reading: 'かようび', meaning: 'Tuesday' }],
  '水': [
    { word: '水曜日', reading: 'すいようび', meaning: 'Wednesday' },
    { word: '水泳', reading: 'すいえい', meaning: 'swimming' },
  ],
  '木': [{ word: '木曜日', reading: 'もくようび', meaning: 'Thursday' }],
  '金': [
    { word: '金曜日', reading: 'きんようび', meaning: 'Friday' },
    { word: 'お金', reading: 'おかね', meaning: 'money' },
  ],
  '土': [{ word: '土曜日', reading: 'どようび', meaning: 'Saturday' }],
  '人': [
    { word: '日本人', reading: 'にほんじん', meaning: 'Japanese person' },
    { word: '外国人', reading: 'がいこくじん', meaning: 'foreigner' },
    { word: '大人', reading: 'おとな', meaning: 'adult' },
    { word: '一人', reading: 'ひとり', meaning: 'one person' },
    { word: '二人', reading: 'ふたり', meaning: 'two people' },
  ],
  '学': [
    { word: '学生', reading: 'がくせい', meaning: 'student' },
    { word: '学校', reading: 'がっこう', meaning: 'school' },
    { word: '大学', reading: 'だいがく', meaning: 'university' },
    { word: '留学', reading: 'りゅうがく', meaning: 'study abroad' },
  ],
  '校': [{ word: '学校', reading: 'がっこう', meaning: 'school' }],
  '生': [
    { word: '学生', reading: 'がくせい', meaning: 'student' },
    { word: '先生', reading: 'せんせい', meaning: 'teacher' },
    { word: '誕生日', reading: 'たんじょうび', meaning: 'birthday' },
  ],
  '先': [
    { word: '先生', reading: 'せんせい', meaning: 'teacher' },
    { word: '先週', reading: 'せんしゅう', meaning: 'last week' },
    { word: '先月', reading: 'せんげつ', meaning: 'last month' },
  ],
  '大': [
    { word: '大学', reading: 'だいがく', meaning: 'university' },
    { word: '大人', reading: 'おとな', meaning: 'adult' },
    { word: '大変', reading: 'たいへん', meaning: 'terrible / very' },
    { word: '大切', reading: 'たいせつ', meaning: 'important' },
    { word: '大きい', reading: 'おおきい', meaning: 'big' },
  ],
  '小': [
    { word: '小さい', reading: 'ちいさい', meaning: 'small' },
    { word: '小学校', reading: 'しょうがっこう', meaning: 'elementary school' },
  ],
  '中': [
    { word: '中学校', reading: 'ちゅうがっこう', meaning: 'middle school' },
    { word: '一日中', reading: 'いちにちじゅう', meaning: 'all day long' },
  ],
  '国': [
    { word: '外国', reading: 'がいこく', meaning: 'foreign country' },
    { word: '外国人', reading: 'がいこくじん', meaning: 'foreigner' },
    { word: '中国', reading: 'ちゅうごく', meaning: 'China' },
  ],
  '外': [
    { word: '外国', reading: 'がいこく', meaning: 'foreign country' },
    { word: '外国人', reading: 'がいこくじん', meaning: 'foreigner' },
  ],
  '電': [
    { word: '電車', reading: 'でんしゃ', meaning: 'train' },
    { word: '電話', reading: 'でんわ', meaning: 'telephone' },
    { word: '電気', reading: 'でんき', meaning: 'electricity / light' },
  ],
  '車': [
    { word: '電車', reading: 'でんしゃ', meaning: 'train' },
    { word: '自転車', reading: 'じてんしゃ', meaning: 'bicycle' },
  ],
  '話': [
    { word: '電話', reading: 'でんわ', meaning: 'telephone' },
    { word: '会話', reading: 'かいわ', meaning: 'conversation' },
  ],
  '語': [
    { word: '日本語', reading: 'にほんご', meaning: 'Japanese language' },
    { word: '英語', reading: 'えいご', meaning: 'English language' },
    { word: '言葉', reading: 'ことば', meaning: 'word / language' },
  ],
  '食': [
    { word: '食べ物', reading: 'たべもの', meaning: 'food' },
    { word: '食事', reading: 'しょくじ', meaning: 'meal' },
    { word: '食堂', reading: 'しょくどう', meaning: 'cafeteria' },
  ],
  '飲': [
    { word: '飲み物', reading: 'のみもの', meaning: 'drink' },
  ],
  '見': [
    { word: '花見', reading: 'はなみ', meaning: 'cherry blossom viewing' },
  ],
  '聞': [
    { word: '新聞', reading: 'しんぶん', meaning: 'newspaper' },
  ],
  '書': [
    { word: '辞書', reading: 'じしょ', meaning: 'dictionary' },
    { word: '図書館', reading: 'としょかん', meaning: 'library' },
  ],
  '読': [
    { word: '読書', reading: 'どくしょ', meaning: 'reading (books)' },
  ],
  '時': [
    { word: '時間', reading: 'じかん', meaning: 'time / hour' },
    { word: '時計', reading: 'とけい', meaning: 'clock / watch' },
    { word: '時々', reading: 'ときどき', meaning: 'sometimes' },
  ],
  '間': [
    { word: '時間', reading: 'じかん', meaning: 'time / hour' },
  ],
  '前': [
    { word: '名前', reading: 'なまえ', meaning: 'name' },
    { word: '午前', reading: 'ごぜん', meaning: 'morning / AM' },
  ],
  '後': [
    { word: '午後', reading: 'ごご', meaning: 'afternoon / PM' },
  ],
  '友': [
    { word: '友達', reading: 'ともだち', meaning: 'friend' },
  ],
  '父': [
    { word: 'お父さん', reading: 'おとうさん', meaning: 'father' },
  ],
  '母': [
    { word: 'お母さん', reading: 'おかあさん', meaning: 'mother' },
  ],
  '子': [
    { word: '子供', reading: 'こども', meaning: 'child' },
    { word: '女の子', reading: 'おんなのこ', meaning: 'girl' },
    { word: '男の子', reading: 'おとこのこ', meaning: 'boy' },
  ],
  '女': [
    { word: '女の子', reading: 'おんなのこ', meaning: 'girl' },
    { word: '彼女', reading: 'かのじょ', meaning: 'she / girlfriend' },
  ],
  '男': [
    { word: '男の子', reading: 'おとこのこ', meaning: 'boy' },
  ],
  '名': [
    { word: '名前', reading: 'なまえ', meaning: 'name' },
    { word: '有名', reading: 'ゆうめい', meaning: 'famous' },
  ],
  '新': [
    { word: '新聞', reading: 'しんぶん', meaning: 'newspaper' },
    { word: '新しい', reading: 'あたらしい', meaning: 'new' },
  ],
  '社': [
    { word: '会社', reading: 'かいしゃ', meaning: 'company' },
    { word: '神社', reading: 'じんじゃ', meaning: 'shrine' },
  ],
  '会': [
    { word: '会社', reading: 'かいしゃ', meaning: 'company' },
    { word: 'お会計', reading: 'おかいけい', meaning: 'bill / check' },
    { word: '会話', reading: 'かいわ', meaning: 'conversation' },
    { word: '会議', reading: 'かいぎ', meaning: 'meeting' },
    { word: '社会', reading: 'しゃかい', meaning: 'society' },
    { word: '出会い', reading: 'であい', meaning: 'encounter' },
  ],
  '店': [
    { word: '喫茶店', reading: 'きっさてん', meaning: 'cafe' },
    { word: '店員', reading: 'てんいん', meaning: 'shop clerk' },
    { word: '売店', reading: 'ばいてん', meaning: 'stand / kiosk' },
  ],
  '天': [
    { word: '天気', reading: 'てんき', meaning: 'weather' },
  ],
  '気': [
    { word: '天気', reading: 'てんき', meaning: 'weather' },
    { word: '元気', reading: 'げんき', meaning: 'healthy / energetic' },
    { word: '電気', reading: 'でんき', meaning: 'electricity' },
    { word: '人気', reading: 'にんき', meaning: 'popular' },
  ],
  '花': [
    { word: '花見', reading: 'はなみ', meaning: 'cherry blossom viewing' },
    { word: '花火', reading: 'はなび', meaning: 'fireworks' },
    { word: '花瓶', reading: 'かびん', meaning: 'vase' },
  ],
  '行': [
    { word: '旅行', reading: 'りょこう', meaning: 'travel' },
    { word: '銀行', reading: 'ぎんこう', meaning: 'bank' },
    { word: '飛行機', reading: 'ひこうき', meaning: 'airplane' },
  ],
  '来': [
    { word: '来週', reading: 'らいしゅう', meaning: 'next week' },
    { word: '来月', reading: 'らいげつ', meaning: 'next month' },
    { word: '来年', reading: 'らいねん', meaning: 'next year' },
  ],
  '出': [
    { word: '出口', reading: 'でぐち', meaning: 'exit' },
  ],
  '入': [
    { word: '入口', reading: 'いりぐち', meaning: 'entrance' },
  ],
  '年': [
    { word: '来年', reading: 'らいねん', meaning: 'next year' },
    { word: '去年', reading: 'きょねん', meaning: 'last year' },
    { word: '今年', reading: 'ことし', meaning: 'this year' },
  ],
  '週': [
    { word: '来週', reading: 'らいしゅう', meaning: 'next week' },
    { word: '先週', reading: 'せんしゅう', meaning: 'last week' },
    { word: '週末', reading: 'しゅうまつ', meaning: 'weekend' },
  ],
  '高': [
    { word: '高校', reading: 'こうこう', meaning: 'high school' },
    { word: '高い', reading: 'たかい', meaning: 'tall / expensive' },
  ],
  '安': [
    { word: '安い', reading: 'やすい', meaning: 'cheap' },
    { word: '安心', reading: 'あんしん', meaning: 'peace of mind' },
  ],
  '白': [
    { word: '白い', reading: 'しろい', meaning: 'white' },
  ],
  '長': [
    { word: '長い', reading: 'ながい', meaning: 'long' },
    { word: '社長', reading: 'しゃちょう', meaning: 'company president' },
  ],
  '駅': [
    { word: '東京駅', reading: 'とうきょうえき', meaning: 'Tokyo Station' },
  ],
  '東': [
    { word: '東京', reading: 'とうきょう', meaning: 'Tokyo' },
  ],
  '西': [
    { word: '東西', reading: 'とうざい', meaning: 'east and west' },
  ],
  '北': [
    { word: '北海道', reading: 'ほっかいどう', meaning: 'Hokkaido' },
  ],
  '南': [
    { word: '南口', reading: 'みなみぐち', meaning: 'south exit' },
  ],

  // ── N4 Kanji Compounds ──
  '事': [
    { word: '仕事', reading: 'しごと', meaning: 'work / job' },
    { word: '食事', reading: 'しょくじ', meaning: 'meal' },
    { word: '事故', reading: 'じこ', meaning: 'accident' },
    { word: '大事', reading: 'だいじ', meaning: 'important' },
  ],
  '自': [
    { word: '自分', reading: 'じぶん', meaning: 'oneself' },
    { word: '自転車', reading: 'じてんしゃ', meaning: 'bicycle' },
    { word: '自然', reading: 'しぜん', meaning: 'nature' },
    { word: '自由', reading: 'じゆう', meaning: 'freedom' },
  ],
  '発': [
    { word: '出発', reading: 'しゅっぱつ', meaning: 'departure' },
    { word: '発見', reading: 'はっけん', meaning: 'discovery' },
    { word: '発表', reading: 'はっぴょう', meaning: 'announcement' },
  ],
  '地': [
    { word: '地図', reading: 'ちず', meaning: 'map' },
    { word: '地下鉄', reading: 'ちかてつ', meaning: 'subway' },
    { word: '地震', reading: 'じしん', meaning: 'earthquake' },
  ],
  '場': [
    { word: '場所', reading: 'ばしょ', meaning: 'place' },
    { word: '場合', reading: 'ばあい', meaning: 'case / situation' },
    { word: '駐車場', reading: 'ちゅうしゃじょう', meaning: 'parking lot' },
  ],
  '開': [
    { word: '開く', reading: 'ひらく', meaning: 'to open' },
    { word: '開始', reading: 'かいし', meaning: 'start / beginning' },
    { word: '公開', reading: 'こうかい', meaning: 'public release' },
  ],
  '力': [
    { word: '力', reading: 'ちから', meaning: 'power / strength' },
    { word: '努力', reading: 'どりょく', meaning: 'effort' },
    { word: '能力', reading: 'のうりょく', meaning: 'ability' },
    { word: '電力', reading: 'でんりょく', meaning: 'electric power' },
  ],
  '問': [
    { word: '問題', reading: 'もんだい', meaning: 'problem / question' },
    { word: '質問', reading: 'しつもん', meaning: 'question' },
    { word: '疑問', reading: 'ぎもん', meaning: 'doubt' },
  ],
  '代': [
    { word: '時代', reading: 'じだい', meaning: 'era / age' },
    { word: '代わり', reading: 'かわり', meaning: 'substitute' },
    { word: '現代', reading: 'げんだい', meaning: 'modern times' },
  ],
  '動': [
    { word: '運動', reading: 'うんどう', meaning: 'exercise / movement' },
    { word: '動物', reading: 'どうぶつ', meaning: 'animal' },
    { word: '自動', reading: 'じどう', meaning: 'automatic' },
  ],
  '通': [
    { word: '交通', reading: 'こうつう', meaning: 'traffic' },
    { word: '通り', reading: 'とおり', meaning: 'street / as expected' },
    { word: '通学', reading: 'つうがく', meaning: 'commuting to school' },
  ],
  '理': [
    { word: '理由', reading: 'りゆう', meaning: 'reason' },
    { word: '料理', reading: 'りょうり', meaning: 'cooking' },
    { word: '理解', reading: 'りかい', meaning: 'understanding' },
    { word: '地理', reading: 'ちり', meaning: 'geography' },
  ],
  '体': [
    { word: '体育', reading: 'たいいく', meaning: 'physical education' },
    { word: '体重', reading: 'たいじゅう', meaning: 'body weight' },
    { word: '体験', reading: 'たいけん', meaning: 'experience' },
  ],
  '意': [
    { word: '意味', reading: 'いみ', meaning: 'meaning' },
    { word: '意見', reading: 'いけん', meaning: 'opinion' },
    { word: '注意', reading: 'ちゅうい', meaning: 'attention / caution' },
  ],
  '思': [
    { word: '思い出', reading: 'おもいで', meaning: 'memory / recollection' },
    { word: '思う', reading: 'おもう', meaning: 'to think' },
    { word: '不思議', reading: 'ふしぎ', meaning: 'mysterious' },
  ],
  '家': [
    { word: '家族', reading: 'かぞく', meaning: 'family' },
    { word: '家庭', reading: 'かてい', meaning: 'household' },
    { word: '作家', reading: 'さっか', meaning: 'author' },
    { word: '専門家', reading: 'せんもんか', meaning: 'expert' },
  ],
  '世': [
    { word: '世界', reading: 'せかい', meaning: 'world' },
    { word: '世話', reading: 'せわ', meaning: 'care / help' },
    { word: '世紀', reading: 'せいき', meaning: 'century' },
  ],
  '知': [
    { word: '知る', reading: 'しる', meaning: 'to know' },
    { word: '知識', reading: 'ちしき', meaning: 'knowledge' },
    { word: '知人', reading: 'ちじん', meaning: 'acquaintance' },
  ],
  '道': [
    { word: '道路', reading: 'どうろ', meaning: 'road' },
    { word: '柔道', reading: 'じゅうどう', meaning: 'judo' },
    { word: '書道', reading: 'しょどう', meaning: 'calligraphy' },
    { word: '北海道', reading: 'ほっかいどう', meaning: 'Hokkaido' },
  ],
  '集': [
    { word: '集める', reading: 'あつめる', meaning: 'to collect' },
    { word: '集中', reading: 'しゅうちゅう', meaning: 'concentration' },
    { word: '集合', reading: 'しゅうごう', meaning: 'gathering' },
  ],
  '物': [
    { word: '動物', reading: 'どうぶつ', meaning: 'animal' },
    { word: '食べ物', reading: 'たべもの', meaning: 'food' },
    { word: '買い物', reading: 'かいもの', meaning: 'shopping' },
    { word: '荷物', reading: 'にもつ', meaning: 'luggage' },
  ],
  '使': [
    { word: '使う', reading: 'つかう', meaning: 'to use' },
    { word: '大使', reading: 'たいし', meaning: 'ambassador' },
    { word: '大使館', reading: 'たいしかん', meaning: 'embassy' },
  ],
  '海': [
    { word: '海外', reading: 'かいがい', meaning: 'overseas' },
    { word: '海岸', reading: 'かいがん', meaning: 'coast / shore' },
    { word: '日本海', reading: 'にほんかい', meaning: 'Sea of Japan' },
  ],
  '教': [
    { word: '教室', reading: 'きょうしつ', meaning: 'classroom' },
    { word: '教科書', reading: 'きょうかしょ', meaning: 'textbook' },
    { word: '教育', reading: 'きょういく', meaning: 'education' },
  ],
  '考': [
    { word: '考える', reading: 'かんがえる', meaning: 'to think' },
    { word: '参考', reading: 'さんこう', meaning: 'reference' },
    { word: '考え', reading: 'かんがえ', meaning: 'thought / idea' },
  ],
  '心': [
    { word: '安心', reading: 'あんしん', meaning: 'peace of mind' },
    { word: '心配', reading: 'しんぱい', meaning: 'worry' },
    { word: '関心', reading: 'かんしん', meaning: 'interest' },
    { word: '中心', reading: 'ちゅうしん', meaning: 'center / core' },
  ],
  '持': [
    { word: '持つ', reading: 'もつ', meaning: 'to hold / have' },
    { word: '気持ち', reading: 'きもち', meaning: 'feeling' },
    { word: '支持', reading: 'しじ', meaning: 'support' },
  ],
  '強': [
    { word: '強い', reading: 'つよい', meaning: 'strong' },
    { word: '勉強', reading: 'べんきょう', meaning: 'study' },
    { word: '強調', reading: 'きょうちょう', meaning: 'emphasis' },
  ],
  '春': [
    { word: '春休み', reading: 'はるやすみ', meaning: 'spring break' },
    { word: '青春', reading: 'せいしゅん', meaning: 'youth' },
  ],
  '夏': [
    { word: '夏休み', reading: 'なつやすみ', meaning: 'summer vacation' },
    { word: '真夏', reading: 'まなつ', meaning: 'midsummer' },
  ],
  '秋': [
    { word: '秋分', reading: 'しゅうぶん', meaning: 'autumnal equinox' },
  ],
  '冬': [
    { word: '冬休み', reading: 'ふゆやすみ', meaning: 'winter break' },
    { word: '真冬', reading: 'まふゆ', meaning: 'midwinter' },
  ],
  '広': [
    { word: '広い', reading: 'ひろい', meaning: 'wide / spacious' },
    { word: '広場', reading: 'ひろば', meaning: 'plaza / square' },
    { word: '広告', reading: 'こうこく', meaning: 'advertisement' },
  ],
  '医': [
    { word: '医者', reading: 'いしゃ', meaning: 'doctor' },
    { word: '医学', reading: 'いがく', meaning: 'medical science' },
    { word: '医院', reading: 'いいん', meaning: 'clinic' },
  ],
  '切': [
    { word: '大切', reading: 'たいせつ', meaning: 'important' },
    { word: '切符', reading: 'きっぷ', meaning: 'ticket' },
    { word: '切る', reading: 'きる', meaning: 'to cut' },
    { word: '親切', reading: 'しんせつ', meaning: 'kind / friendly' },
  ],
  '走': [
    { word: '走る', reading: 'はしる', meaning: 'to run' },
  ],
  '送': [
    { word: '送る', reading: 'おくる', meaning: 'to send' },
    { word: '送料', reading: 'そうりょう', meaning: 'shipping fee' },
    { word: '見送る', reading: 'みおくる', meaning: 'to see off' },
  ],
  '急': [
    { word: '急ぐ', reading: 'いそぐ', meaning: 'to hurry' },
    { word: '急行', reading: 'きゅうこう', meaning: 'express (train)' },
    { word: '救急車', reading: 'きゅうきゅうしゃ', meaning: 'ambulance' },
  ],
  '仕': [
    { word: '仕事', reading: 'しごと', meaning: 'work / job' },
    { word: '仕方', reading: 'しかた', meaning: 'way / method' },
  ],
  '業': [
    { word: '授業', reading: 'じゅぎょう', meaning: 'class / lesson' },
    { word: '卒業', reading: 'そつぎょう', meaning: 'graduation' },
    { word: '産業', reading: 'さんぎょう', meaning: 'industry' },
    { word: '職業', reading: 'しょくぎょう', meaning: 'occupation' },
  ],
  '写': [
    { word: '写真', reading: 'しゃしん', meaning: 'photograph' },
    { word: '写す', reading: 'うつす', meaning: 'to copy' },
  ],
  '試': [
    { word: '試験', reading: 'しけん', meaning: 'exam' },
    { word: '試合', reading: 'しあい', meaning: 'match / game' },
    { word: '試す', reading: 'ためす', meaning: 'to try' },
  ],
  '味': [
    { word: '意味', reading: 'いみ', meaning: 'meaning' },
    { word: '味方', reading: 'みかた', meaning: 'ally' },
    { word: '趣味', reading: 'しゅみ', meaning: 'hobby' },
  ],
  '注': [
    { word: '注意', reading: 'ちゅうい', meaning: 'attention / caution' },
    { word: '注文', reading: 'ちゅうもん', meaning: 'order (at restaurant)' },
    { word: '注目', reading: 'ちゅうもく', meaning: 'attention' },
  ],
  '売': [
    { word: '売る', reading: 'うる', meaning: 'to sell' },
    { word: '販売', reading: 'はんばい', meaning: 'sales' },
    { word: '売り場', reading: 'うりば', meaning: 'sales counter' },
  ],
  '転': [
    { word: '自転車', reading: 'じてんしゃ', meaning: 'bicycle' },
    { word: '運転', reading: 'うんてん', meaning: 'driving' },
    { word: '転校', reading: 'てんこう', meaning: 'transfer schools' },
  ],
  '運': [
    { word: '運動', reading: 'うんどう', meaning: 'exercise' },
    { word: '運転', reading: 'うんてん', meaning: 'driving' },
    { word: '運命', reading: 'うんめい', meaning: 'fate / destiny' },
  ],
  '進': [
    { word: '進む', reading: 'すすむ', meaning: 'to advance' },
    { word: '前進', reading: 'ぜんしん', meaning: 'forward progress' },
  ],
  '歩': [
    { word: '歩く', reading: 'あるく', meaning: 'to walk' },
    { word: '散歩', reading: 'さんぽ', meaning: 'a walk / stroll' },
    { word: '歩道', reading: 'ほどう', meaning: 'sidewalk' },
  ],
  '起': [
    { word: '起きる', reading: 'おきる', meaning: 'to wake up' },
    { word: '起こる', reading: 'おこる', meaning: 'to occur' },
  ],
  '乗': [
    { word: '乗る', reading: 'のる', meaning: 'to ride' },
    { word: '乗り物', reading: 'のりもの', meaning: 'vehicle' },
    { word: '乗客', reading: 'じょうきゃく', meaning: 'passenger' },
  ],
  '着': [
    { word: '着る', reading: 'きる', meaning: 'to wear' },
    { word: '到着', reading: 'とうちゃく', meaning: 'arrival' },
    { word: '着物', reading: 'きもの', meaning: 'kimono' },
  ],
  '屋': [
    { word: '部屋', reading: 'へや', meaning: 'room' },
    { word: '本屋', reading: 'ほんや', meaning: 'bookstore' },
    { word: '肉屋', reading: 'にくや', meaning: 'butcher' },
    { word: '花屋', reading: 'はなや', meaning: 'flower shop' },
  ],
  '質': [
    { word: '質問', reading: 'しつもん', meaning: 'question' },
    { word: '品質', reading: 'ひんしつ', meaning: 'quality' },
  ],
  '待': [
    { word: '待つ', reading: 'まつ', meaning: 'to wait' },
    { word: '期待', reading: 'きたい', meaning: 'expectation' },
    { word: '招待', reading: 'しょうたい', meaning: 'invitation' },
  ],
  '色': [
    { word: '色々', reading: 'いろいろ', meaning: 'various' },
    { word: '景色', reading: 'けしき', meaning: 'scenery' },
    { word: '特色', reading: 'とくしょく', meaning: 'characteristic' },
  ],
  '風': [
    { word: '風景', reading: 'ふうけい', meaning: 'scenery' },
    { word: '台風', reading: 'たいふう', meaning: 'typhoon' },
    { word: '風邪', reading: 'かぜ', meaning: 'cold (illness)' },
    { word: '和風', reading: 'わふう', meaning: 'Japanese-style' },
  ],
};
