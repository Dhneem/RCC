/* Validates the English/Arabic setup:
   1. UI dictionary parity between en and ar (keys, placeholders, Arabic script)
   2. Arabic overlay covers every lesson step and puzzle field
   3. content-ar.js actually merged *Ar fields into Course
   4. I18n.t / I18n.tr pick the right language
   5. index.html data-i18n keys all exist in the dictionary */
const fs = require('fs');
const path = require('path');

global.Course = require('../js/content.js');       // must be set before the overlay loads
const ContentAr = require('../js/content-ar.js');  // merges into global Course
const I18n = require('../js/i18n.js');

let failures = 0;
const fail = msg => { failures++; console.log('FAIL ' + msg); };
const ok = msg => console.log('PASS ' + msg);
const AR = /[\u0600-\u06FF]/;
const placeholders = s => (String(s).match(/\{(\w+)\}/g) || []).sort().join(',');

// ---- 1. dictionary parity ----
const { en, ar } = I18n._dict;
for (const k of Object.keys(en)) {
  if (!(k in ar)) fail(`dict: missing Arabic for '${k}'`);
  else if (placeholders(en[k]) !== placeholders(ar[k])) {
    fail(`dict: placeholders differ for '${k}': [${placeholders(en[k])}] vs [${placeholders(ar[k])}]`);
  }
}
for (const k of Object.keys(ar)) {
  if (!(k in en)) fail(`dict: English missing for '${k}'`);
}
for (const k of Object.keys(ar)) {
  const words = ar[k].replace(/\{\w+\}/g, ''); // placeholder-only values are fine
  if (/[A-Za-z\u0600-\u06FF]/.test(words) && !AR.test(ar[k])) fail(`dict: ar['${k}'] contains no Arabic script`);
}
ok(`dictionary: ${Object.keys(en).length} keys, en/ar parity + placeholders + script`);

// ---- 2. Arabic content overlay coverage ----
let overlayChecks = 0;
for (const lesson of Course.lessons) {
  const a = ContentAr.lessons[lesson.id];
  if (!a) { fail(`lesson ${lesson.id}: no Arabic overlay`); continue; }
  if (!a.title || !AR.test(a.title)) fail(`lesson ${lesson.id}: missing Arabic title`);
  if (!a.blurb || !AR.test(a.blurb)) fail(`lesson ${lesson.id}: missing Arabic blurb`);
  if (!a.steps || a.steps.length !== lesson.steps.length) {
    fail(`lesson ${lesson.id}: Arabic has ${a.steps && a.steps.length} steps, English has ${lesson.steps.length}`);
    continue;
  }
  lesson.steps.forEach((s, i) => {
    const sa = a.steps[i];
    const tag = `lesson ${lesson.id} step ${i + 1}`;
    if (!sa.title || !AR.test(sa.title)) fail(`${tag}: missing Arabic title`);
    if (s.body) {
      if (!sa.body) fail(`${tag}: missing Arabic body`);
      else if (sa.body.length !== s.body.length) fail(`${tag}: Arabic body has ${sa.body.length} paras, English ${s.body.length}`);
      else if (!sa.body.every(p => AR.test(p))) fail(`${tag}: some Arabic body paras have no Arabic script`);
    }
    if (s.coach && (!sa.coach || !AR.test(sa.coach))) fail(`${tag}: missing Arabic coach`);
    if (s.question && (!sa.question || !AR.test(sa.question))) fail(`${tag}: missing Arabic question`);
    if (s.options) {
      if (!sa.options) fail(`${tag}: missing Arabic options`);
      else if (sa.options.length !== s.options.length) fail(`${tag}: option count differs`);
      else if (!sa.options.every(o => AR.test(o))) fail(`${tag}: some Arabic options have no Arabic script`);
    }
    if (s.explain && (!sa.explain || !AR.test(sa.explain))) fail(`${tag}: missing Arabic explain`);
    overlayChecks++;
  });
}
for (const p of Course.puzzles) {
  const a = ContentAr.puzzles[p.id];
  if (!a) { fail(`puzzle ${p.id}: no Arabic overlay`); continue; }
  for (const f of ['theme', 'prompt', 'hint', 'explain']) {
    if (!a[f] || !AR.test(a[f])) fail(`puzzle ${p.id}: missing Arabic ${f}`);
  }
  overlayChecks++;
}
ok(`content overlay: ${Course.lessons.length} lessons + ${Course.puzzles.length} puzzles checked (${overlayChecks} units)`);

// ---- 3. merge actually populated *Ar fields ----
let mergeChecks = 0;
for (const l of Course.lessons) {
  if (!l.titleAr || !l.blurbAr) fail(`merge: lesson ${l.id} titleAr/blurbAr missing`);
  l.steps.forEach((s, i) => {
    if (!s.titleAr) fail(`merge: ${l.id} step ${i + 1} titleAr missing`);
    if (s.body && !s.bodyAr) fail(`merge: ${l.id} step ${i + 1} bodyAr missing`);
    if (s.coach && !s.coachAr) fail(`merge: ${l.id} step ${i + 1} coachAr missing`);
    if (s.question && !s.questionAr) fail(`merge: ${l.id} step ${i + 1} questionAr missing`);
    if (s.options && !s.optionsAr) fail(`merge: ${l.id} step ${i + 1} optionsAr missing`);
    if (s.explain && !s.explainAr) fail(`merge: ${l.id} step ${i + 1} explainAr missing`);
    mergeChecks++;
  });
}
for (const p of Course.puzzles) {
  if (!p.themeAr || !p.promptAr || !p.hintAr || !p.explainAr) fail(`merge: puzzle ${p.id} *Ar fields missing`);
  mergeChecks++;
}
ok(`merge: ${mergeChecks} content units carry *Ar fields`);

// ---- 4. language pick behaviour ----
I18n.set('ar');
if (I18n.get() !== 'ar') fail('set(ar): language did not switch');
const lesson0 = Course.lessons[0];
if (I18n.tr(lesson0, 'title') !== lesson0.titleAr) fail('tr: did not pick Arabic title in ar mode');
if (!AR.test(I18n.t('nav.home'))) fail('t: nav.home not Arabic in ar mode');
const step2 = I18n.t('lesson.step', { a: 2, b: 8 });
if (!step2.includes('2') || !step2.includes('8')) fail(`t: placeholders not substituted in ar ('${step2}')`);
I18n.set('en');
if (I18n.get() !== 'en') fail('set(en): language did not switch back');
if (I18n.tr(lesson0, 'title') !== 'Meet the Pieces') fail('tr: did not pick English title in en mode');
if (I18n.t('lesson.step', { a: 2, b: 8 }) !== 'Step 2 / 8') fail('t: English substitution broken');
ok('I18n.t / I18n.tr switch languages and substitute params');

// ---- 5. index.html data-i18n keys exist ----
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const htmlKeys = [...html.matchAll(/data-i18n(?:-label)?="([^"]+)"/g)].map(m => m[1]);
let bad = 0;
for (const k of htmlKeys) {
  if (!(k in en)) { fail(`index.html references unknown i18n key '${k}'`); bad++; }
}
if (htmlKeys.length < 15) fail(`index.html: only ${htmlKeys.length} data-i18n attributes found`);
if (!/js\/content\.js.*js\/content-ar\.js.*js\/i18n\.js.*js\/app\.js/s.test(html)) {
  fail('index.html: script order must be content -> content-ar -> i18n -> ... -> app');
}
if (!html.includes('data-lang="ar"')) fail('index.html: language switcher missing');
ok(`index.html: ${htmlKeys.length} i18n keys resolve, scripts ordered, switcher present`);

console.log(failures === 0 ? '\nALL I18N TESTS PASSED' : `\n${failures} FAILURES`);
process.exit(failures ? 1 : 0);
