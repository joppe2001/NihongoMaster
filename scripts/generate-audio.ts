#!/usr/bin/env npx tsx
/**
 * Audio Generation Script — Google Cloud Text-to-Speech
 *
 * Generates high-quality Japanese pronunciation audio files for all
 * kana, kanji, and vocabulary items in the NihongoMaster data files.
 *
 * Output: src-tauri/resources/audio/{kana,kanji,vocab}/*.mp3
 *
 * Prerequisites:
 *   1. A Google Cloud project with Text-to-Speech API enabled
 *   2. A service account key JSON file
 *   3. Set GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json
 *
 * Usage:
 *   npx tsx scripts/generate-audio.ts
 *   npx tsx scripts/generate-audio.ts --type=kana       # Only kana
 *   npx tsx scripts/generate-audio.ts --type=vocab       # Only vocab
 *   npx tsx scripts/generate-audio.ts --type=kanji       # Only kanji
 *   npx tsx scripts/generate-audio.ts --skip-existing    # Skip already generated files
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Configuration ──
const VOICE = 'ja-JP-Neural2-B'; // Clear female voice, excellent for language learning
const SPEAKING_RATE_NORMAL = 0.88; // Slightly slower than natural for learners
const SPEAKING_RATE_SLOW = 0.68;   // Slow version for study
const AUDIO_ENCODING = 'MP3';
const OUTPUT_BASE = path.resolve(__dirname, '../src-tauri/resources/audio');

// ── Types ──
interface AudioItem {
  text: string;      // Japanese text to pronounce
  filename: string;  // Output filename (without extension)
  category: 'kana' | 'kanji' | 'vocab';
}

// ── Google Cloud TTS Client ──
async function synthesize(text: string, outputPath: string, rate: number): Promise<void> {
  // Dynamic import to avoid requiring the package at parse time
  const { TextToSpeechClient } = await import('@google-cloud/text-to-speech');
  const client = new TextToSpeechClient();

  const [response] = await client.synthesizeSpeech({
    input: { text },
    voice: {
      languageCode: 'ja-JP',
      name: VOICE,
    },
    audioConfig: {
      audioEncoding: AUDIO_ENCODING as 'MP3',
      speakingRate: rate,
      pitch: 0,
      sampleRateHertz: 24000,
    },
  });

  if (response.audioContent) {
    fs.writeFileSync(outputPath, response.audioContent as Buffer);
  }
}

// ── Collect items from data files ──
async function collectKanaItems(): Promise<AudioItem[]> {
  // Read kana data — each kana character + romaji
  const items: AudioItem[] = [];
  const kanaChars = new Set<string>();

  // Basic hiragana
  const hiragana = 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん';
  for (const ch of hiragana) {
    if (!kanaChars.has(ch)) {
      kanaChars.add(ch);
      items.push({ text: ch, filename: `hiragana_${ch}`, category: 'kana' });
    }
  }

  // Basic katakana
  const katakana = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
  for (const ch of katakana) {
    if (!kanaChars.has(ch)) {
      kanaChars.add(ch);
      items.push({ text: ch, filename: `katakana_${ch}`, category: 'kana' });
    }
  }

  // Dakuten hiragana
  const dakutenH = 'がぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ';
  for (const ch of dakutenH) {
    if (!kanaChars.has(ch)) {
      kanaChars.add(ch);
      items.push({ text: ch, filename: `hiragana_${ch}`, category: 'kana' });
    }
  }

  // Dakuten katakana
  const dakutenK = 'ガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポ';
  for (const ch of dakutenK) {
    if (!kanaChars.has(ch)) {
      kanaChars.add(ch);
      items.push({ text: ch, filename: `katakana_${ch}`, category: 'kana' });
    }
  }

  // Combination kana (hiragana)
  const comboH = ['きゃ','きゅ','きょ','しゃ','しゅ','しょ','ちゃ','ちゅ','ちょ','にゃ','にゅ','にょ','ひゃ','ひゅ','ひょ','みゃ','みゅ','みょ','りゃ','りゅ','りょ','ぎゃ','ぎゅ','ぎょ','じゃ','じゅ','じょ','びゃ','びゅ','びょ','ぴゃ','ぴゅ','ぴょ'];
  for (const combo of comboH) {
    if (!kanaChars.has(combo)) {
      kanaChars.add(combo);
      items.push({ text: combo, filename: `hiragana_${combo}`, category: 'kana' });
    }
  }

  // Combination kana (katakana)
  const comboK = ['キャ','キュ','キョ','シャ','シュ','ショ','チャ','チュ','チョ','ニャ','ニュ','ニョ','ヒャ','ヒュ','ヒョ','ミャ','ミュ','ミョ','リャ','リュ','リョ','ギャ','ギュ','ギョ','ジャ','ジュ','ジョ','ビャ','ビュ','ビョ','ピャ','ピュ','ピョ'];
  for (const combo of comboK) {
    if (!kanaChars.has(combo)) {
      kanaChars.add(combo);
      items.push({ text: combo, filename: `katakana_${combo}`, category: 'kana' });
    }
  }

  console.log(`  Collected ${items.length} kana items`);
  return items;
}

async function collectKanjiItems(): Promise<AudioItem[]> {
  const items: AudioItem[] = [];
  const seen = new Set<string>();

  // Dynamically import all kanji data files
  const kanjiFiles = [
    '../src/data/kanjiN5',
    '../src/data/kanjiN4',
    '../src/data/kanjiN3_part1',
    '../src/data/kanjiN3_part2',
    '../src/data/kanjiN3_part3',
    '../src/data/kanjiN2_part1',
  ];

  for (const file of kanjiFiles) {
    try {
      const mod = await import(file);
      // Find the exported array (first array export)
      const arr = Object.values(mod).find((v) => Array.isArray(v)) as any[];
      if (!arr) continue;

      for (const kanji of arr) {
        const char = kanji.character || kanji.char;
        if (char && !seen.has(char)) {
          seen.add(char);
          items.push({ text: char, filename: `kanji_${char}`, category: 'kanji' });
        }
      }
    } catch {
      console.log(`  Skipped ${file} (not found)`);
    }
  }

  console.log(`  Collected ${items.length} kanji items`);
  return items;
}

async function collectVocabItems(): Promise<AudioItem[]> {
  const items: AudioItem[] = [];
  const seen = new Set<string>();

  const vocabFiles = [
    '../src/data/vocabN5',
    '../src/data/vocabN4',
    '../src/data/vocabN4_extra',
    '../src/data/vocabN3_part1',
    '../src/data/vocabN3_part2',
    '../src/data/vocabN3_part3',
    '../src/data/vocabN3_part4',
    '../src/data/vocabN3_part5',
  ];

  for (const file of vocabFiles) {
    try {
      const mod = await import(file);
      const arr = Object.values(mod).find((v) => Array.isArray(v)) as any[];
      if (!arr) continue;

      for (const vocab of arr) {
        const word = vocab.word;
        const reading = vocab.reading;
        if (word && !seen.has(word)) {
          seen.add(word);
          // Use reading for pronunciation (more natural than kanji alone)
          const pronounceText = reading || word;
          // Filename uses word but sanitized (replace slashes etc)
          const safeName = word.replace(/[/\\?%*:|"<>]/g, '_');
          items.push({ text: pronounceText, filename: `vocab_${safeName}`, category: 'vocab' });
        }
      }
    } catch {
      console.log(`  Skipped ${file} (not found)`);
    }
  }

  console.log(`  Collected ${items.length} vocab items`);
  return items;
}

// ── Main ──
async function main() {
  const args = process.argv.slice(2);
  const typeFilter = args.find(a => a.startsWith('--type='))?.split('=')[1];
  const skipExisting = args.includes('--skip-existing');
  const slowMode = args.includes('--slow');

  console.log('═══════════════════════════════════════');
  console.log('NihongoMaster Audio Generator');
  console.log(`Voice: ${VOICE}`);
  console.log(`Rate: ${slowMode ? SPEAKING_RATE_SLOW : SPEAKING_RATE_NORMAL}`);
  console.log(`Output: ${OUTPUT_BASE}`);
  console.log('═══════════════════════════════════════\n');

  // Verify credentials
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error('ERROR: Set GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json');
    console.error('  1. Go to Google Cloud Console → APIs & Services → Credentials');
    console.error('  2. Create a service account key');
    console.error('  3. Enable the Text-to-Speech API');
    console.error('  4. export GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json');
    process.exit(1);
  }

  // Ensure output directories exist
  for (const dir of ['kana', 'kanji', 'vocab']) {
    const dirPath = path.join(OUTPUT_BASE, dir);
    fs.mkdirSync(dirPath, { recursive: true });
  }

  // Also create slow variants directory
  if (slowMode) {
    for (const dir of ['kana', 'kanji', 'vocab']) {
      fs.mkdirSync(path.join(OUTPUT_BASE, `${dir}_slow`), { recursive: true });
    }
  }

  // Collect all items
  console.log('Collecting items...');
  let items: AudioItem[] = [];

  if (!typeFilter || typeFilter === 'kana') {
    items.push(...await collectKanaItems());
  }
  if (!typeFilter || typeFilter === 'kanji') {
    items.push(...await collectKanjiItems());
  }
  if (!typeFilter || typeFilter === 'vocab') {
    items.push(...await collectVocabItems());
  }

  console.log(`\nTotal: ${items.length} items to generate\n`);

  // Generate audio
  const rate = slowMode ? SPEAKING_RATE_SLOW : SPEAKING_RATE_NORMAL;
  const suffix = slowMode ? '_slow' : '';
  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const dirName = slowMode ? `${item.category}_slow` : item.category;
    const outputPath = path.join(OUTPUT_BASE, dirName, `${item.filename}${suffix}.mp3`);

    if (skipExisting && fs.existsSync(outputPath)) {
      skipped++;
      continue;
    }

    try {
      process.stdout.write(`\r  [${i + 1}/${items.length}] Generating: ${item.text} (${item.category})...`);
      await synthesize(item.text, outputPath, rate);
      generated++;

      // Rate limiting — Google TTS has 300 requests/min limit
      if (generated % 250 === 0) {
        console.log('\n  Pausing for rate limit...');
        await new Promise(r => setTimeout(r, 10000));
      }
    } catch (err: any) {
      failed++;
      console.error(`\n  FAILED: ${item.text} — ${err.message}`);
    }
  }

  console.log(`\n\n═══════════════════════════════════════`);
  console.log(`Done! Generated: ${generated}, Skipped: ${skipped}, Failed: ${failed}`);
  console.log(`Output: ${OUTPUT_BASE}`);

  // Calculate total size
  let totalSize = 0;
  for (const dir of ['kana', 'kanji', 'vocab', 'kana_slow', 'kanji_slow', 'vocab_slow']) {
    const dirPath = path.join(OUTPUT_BASE, dir);
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath);
      for (const f of files) {
        totalSize += fs.statSync(path.join(dirPath, f)).size;
      }
    }
  }
  console.log(`Total audio size: ${(totalSize / 1024 / 1024).toFixed(1)} MB`);
  console.log('═══════════════════════════════════════');
}

main().catch(console.error);
