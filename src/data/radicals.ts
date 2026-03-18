/**
 * Radical data for N5 kanji learning.
 * Each radical has its character, meaning, stroke count, and example kanji.
 */

export interface RadicalEntry {
  radical: string;
  names: string[];
  meaning: string;
  strokeCount: number;
  exampleKanji: string[];
}

/**
 * Common radicals found in N5 kanji, with meanings and examples.
 * Sorted by stroke count for progressive learning.
 */
export const RADICALS_N5: RadicalEntry[] = [
  { radical: '一', names: ['one', 'ichi'], meaning: 'One', strokeCount: 1, exampleKanji: ['一', '二', '三'] },
  { radical: '丨', names: ['line', 'tatebou'], meaning: 'Vertical stroke', strokeCount: 1, exampleKanji: ['中', '十'] },
  { radical: '丶', names: ['dot', 'ten'], meaning: 'Dot', strokeCount: 1, exampleKanji: ['六', '半'] },
  { radical: '乙', names: ['second', 'otsu'], meaning: 'Second / Fishhook', strokeCount: 1, exampleKanji: ['九'] },
  { radical: '亅', names: ['hook', 'kagi'], meaning: 'Hook', strokeCount: 1, exampleKanji: ['子'] },
  { radical: '人', names: ['person', 'hito'], meaning: 'Person', strokeCount: 2, exampleKanji: ['人', '休', '何', '今', '会'] },
  { radical: '入', names: ['enter', 'iru'], meaning: 'Enter', strokeCount: 2, exampleKanji: ['入'] },
  { radical: '八', names: ['eight', 'hachi'], meaning: 'Eight', strokeCount: 2, exampleKanji: ['八', '六', '分'] },
  { radical: '力', names: ['power', 'chikara'], meaning: 'Power / Strength', strokeCount: 2, exampleKanji: ['力', '男'] },
  { radical: '十', names: ['ten', 'juu'], meaning: 'Ten / Cross', strokeCount: 2, exampleKanji: ['十', '千', '半', '南'] },
  { radical: '又', names: ['again', 'mata'], meaning: 'Again', strokeCount: 2, exampleKanji: ['友'] },
  { radical: '口', names: ['mouth', 'kuchi'], meaning: 'Mouth', strokeCount: 3, exampleKanji: ['口', '右', '名', '何'] },
  { radical: '土', names: ['earth', 'tsuchi'], meaning: 'Earth / Soil', strokeCount: 3, exampleKanji: ['土', '社'] },
  { radical: '大', names: ['big', 'dai'], meaning: 'Big', strokeCount: 3, exampleKanji: ['大', '天', '学'] },
  { radical: '女', names: ['woman', 'onna'], meaning: 'Woman', strokeCount: 3, exampleKanji: ['女', '安', '母'] },
  { radical: '子', names: ['child', 'ko'], meaning: 'Child', strokeCount: 3, exampleKanji: ['子', '学', '字'] },
  { radical: '小', names: ['small', 'shou'], meaning: 'Small', strokeCount: 3, exampleKanji: ['小', '少'] },
  { radical: '山', names: ['mountain', 'yama'], meaning: 'Mountain', strokeCount: 3, exampleKanji: ['山', '出'] },
  { radical: '川', names: ['river', 'kawa'], meaning: 'River', strokeCount: 3, exampleKanji: ['川'] },
  { radical: '工', names: ['craft', 'kou'], meaning: 'Craft / Work', strokeCount: 3, exampleKanji: ['左'] },
  { radical: '弓', names: ['bow', 'yumi'], meaning: 'Bow', strokeCount: 3, exampleKanji: ['強'] },
  { radical: '日', names: ['sun', 'hi', 'nichi'], meaning: 'Sun / Day', strokeCount: 4, exampleKanji: ['日', '時', '明', '書'] },
  { radical: '月', names: ['moon', 'tsuki'], meaning: 'Moon / Month', strokeCount: 4, exampleKanji: ['月', '前', '朝'] },
  { radical: '木', names: ['tree', 'ki'], meaning: 'Tree / Wood', strokeCount: 4, exampleKanji: ['木', '本', '校', '東'] },
  { radical: '水', names: ['water', 'mizu'], meaning: 'Water', strokeCount: 4, exampleKanji: ['水'] },
  { radical: '火', names: ['fire', 'hi'], meaning: 'Fire', strokeCount: 4, exampleKanji: ['火'] },
  { radical: '心', names: ['heart', 'kokoro'], meaning: 'Heart / Mind', strokeCount: 4, exampleKanji: ['思'] },
  { radical: '手', names: ['hand', 'te'], meaning: 'Hand', strokeCount: 4, exampleKanji: ['手'] },
  { radical: '文', names: ['script', 'bun'], meaning: 'Script / Writing', strokeCount: 4, exampleKanji: ['文'] },
  { radical: '方', names: ['direction', 'kata'], meaning: 'Direction', strokeCount: 4, exampleKanji: ['方'] },
  { radical: '目', names: ['eye', 'me'], meaning: 'Eye', strokeCount: 5, exampleKanji: ['目', '見'] },
  { radical: '白', names: ['white', 'shiro'], meaning: 'White', strokeCount: 5, exampleKanji: ['白', '百'] },
  { radical: '立', names: ['stand', 'tatsu'], meaning: 'Stand', strokeCount: 5, exampleKanji: ['立'] },
  { radical: '耳', names: ['ear', 'mimi'], meaning: 'Ear', strokeCount: 6, exampleKanji: ['耳', '聞'] },
  { radical: '言', names: ['speech', 'koto', 'gen'], meaning: 'Say / Speech', strokeCount: 7, exampleKanji: ['言', '語', '話', '読'] },
  { radical: '車', names: ['car', 'kuruma'], meaning: 'Cart / Vehicle', strokeCount: 7, exampleKanji: ['車'] },
  { radical: '足', names: ['foot', 'ashi'], meaning: 'Foot / Leg', strokeCount: 7, exampleKanji: ['足'] },
  { radical: '金', names: ['metal', 'kane'], meaning: 'Gold / Metal', strokeCount: 8, exampleKanji: ['金', '銀'] },
  { radical: '門', names: ['gate', 'mon'], meaning: 'Gate', strokeCount: 8, exampleKanji: ['間', '聞'] },
  { radical: '雨', names: ['rain', 'ame'], meaning: 'Rain', strokeCount: 8, exampleKanji: ['雨', '電'] },
  { radical: '食', names: ['food', 'shoku'], meaning: 'Eat / Food', strokeCount: 9, exampleKanji: ['食', '飲'] },
  { radical: '馬', names: ['horse', 'uma'], meaning: 'Horse', strokeCount: 10, exampleKanji: ['駅'] },
];
