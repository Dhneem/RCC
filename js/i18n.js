/* Bilingual support: English + العربية.
   I18n.t(key, params)  — UI string from the dictionary (falls back to English)
   I18n.tr(obj, base)   — picks obj[base+'Ar'] when Arabic else obj[base]
                          (used for course content translated in content-ar.js)
   I18n.set('ar'|'en')  — switches language, persists, updates <html lang/dir> */
const I18n = (() => {
  const KEY = 'royal-chess-club-lang';
  const LEGACY_KEY = 'checkmate-academy-lang';
  let lang = 'en';
  try {
    let s = localStorage.getItem(KEY);
    if (!s) { // migrate the saved language from the old site name
      s = localStorage.getItem(LEGACY_KEY);
      if (s) localStorage.setItem(KEY, s);
    }
    if (s === 'ar' || s === 'en') lang = s;
  } catch (e) { /* private mode */ }

  const en = {
    'brand': 'Royal Chess Club',
    'meta.title': 'Royal Chess Club — Learn chess interactively',
    'nav.menu': 'Toggle menu',
    'nav.home': 'Home',
    'nav.lessons': 'Lessons',
    'nav.puzzles': 'Puzzles',
    'nav.play': 'Play',
    'lang.group': 'Language',

    'hero.eyebrow': 'Free · no sign-up · runs in your browser',
    'hero.h1a': 'Learn chess by ',
    'hero.h1b': 'playing the moves yourself.',
    'hero.lede': 'Five guided lessons on a real board, sixteen hand-checked tactics puzzles — including forced mate-in-two lines — and a bot you can beat. Your progress saves automatically.',
    'hero.cta1': 'Start the course →',
    'hero.cta2': 'Try a puzzle',
    'hero.caption': 'Every position on this site is fully playable — click a piece, then a square.',

    'home.title': 'Everything you need to improve',
    'course.eyebrow': '📚 The course',
    'course.title': 'Guided lessons',
    'course.lede': 'Each lesson mixes short explanations, tasks you solve on the board, and quick quizzes. You can leave anytime — your step is remembered.',
    'course.cta': 'Ready for puzzles? →',
    'footer.text': 'Royal Chess Club — a dependency-free interactive chess course. Rules engine, lessons and bot all hand-written in vanilla JavaScript.',

    'stat.lessons': 'lessons done',
    'stat.puzzles': 'puzzles solved',
    'stat.streak': 'best streak',
    'stat.games': 'games vs bot',

    'feature1.title': 'Guided lessons',
    'feature1.text': '{n} lessons where you play the moves yourself on a real board — piece movement, check & mate, tactics, openings, and endgames.',
    'feature1.cta': 'Open the course',
    'feature2.title': 'Tactics puzzles',
    'feature2.text': '{n} hand-checked positions: back-rank mates, knight forks, pawn forks, smothered mate, promotions, and forced mate-in-two lines.',
    'feature2.cta': 'Solve now',
    'feature3.title': 'Play the bot',
    'feature3.text': 'Three strengths — Beginner, Club and Master — powered by a from-scratch alpha-beta engine.',
    'feature3.cta': 'Start a game',
    'feature4.title': 'Your progress',
    'feature4.text': 'Lessons, streaks and your win–loss record are saved locally in your browser, automatically.',
    'feature4.cta': 'See where you left off',

    'course.steps': '{n} steps',
    'course.completed': ' · completed ✓',
    'course.replay': 'Replay lesson',
    'course.continueBtn': 'Continue',
    'course.startBtn': 'Start lesson',

    'lesson.step': 'Step {a} / {b}',
    'lesson.completeTitle': 'Lesson complete!',
    'lesson.finished': 'You finished {t}.',
    'lesson.next': 'Next lesson →',
    'lesson.allLessons': 'All lessons',
    'lesson.tryPuzzle': 'Try a puzzle',
    'lesson.upNext': 'Up next: {t}.',
    'lesson.courseDone': 'That completes the course — head to the puzzles to keep training.',
    'lesson.finishBtn': 'Finish lesson ✓',
    'lesson.continue': 'Continue →',
    'lesson.back': '← Back',
    'lesson.reset': '↺ Reset',
    'lesson.wellDone': '{san} — well done!',
    'quiz.correct': 'Correct.',
    'quiz.wrong': 'Not quite.',

    'fb.noCheck': 'That move is legal, but it doesn’t give check.',
    'fb.noMate': 'That move is legal, but it isn’t checkmate.',
    'fb.turn': 'Something is off — check whose move it is.',
    'fb.notLooking': 'That’s a legal move, but not the one this step is looking for. ',
    'fb.plan': 'The plan points at {h}.',
    'fb.reread': 'Re-read the instruction.',
    'board.freeExplore': 'Click any piece to see where it can move — try both colours.',
    'board.hint': 'Click a piece, then a highlighted square.',
    'promo.label': 'Promote to',

    'puzzle.eyebrow': '🎯 Puzzle',
    'puzzle.solved': '{a}/{b} solved',
    'puzzle.difficulty': 'Difficulty',
    'puzzle.solvedTitle': 'Solved!',
    'puzzle.streakN': 'Streak: {n} 🔥',
    'puzzle.next': 'Next puzzle →',
    'puzzle.replay': '↺ Replay',
    'puzzle.already': 'Already solved.',
    'puzzle.hintIs': 'Hint: {h}',
    'puzzle.hintBtn': '💡 Hint',
    'puzzle.skip': 'Skip →',
    'puzzle.streakRow': 'Streak',
    'puzzle.bestRow': 'Best',
    'meta.replying': 'Opponent is answering…',
    'meta.mate2': 'Mate in two: find the first move — the reply plays itself.',
    'meta.lineMove': 'Line move {a} of {b} — finish the mate.',
    'meta.findBest': 'Find the best move. Wrong answers don’t change the position.',
    'reply.done': '<b>Their defence is played for them —</b> now deliver the final move.',
    'puzzle.wrong1': 'Not it. Look for checks, captures and threats.',
    'puzzle.wrong2': 'Not the best move — try the move that creates the biggest threat.',

    'play.eyebrow': '🤖 Play the bot',
    'play.setupTitle': 'Set up your game',
    'play.setupBody': 'Pick a side and a strength. The engine searches a few hundred thousand positions per move — the higher the level, the longer it thinks.',
    'play.playAs': 'Play as',
    'play.white': 'White',
    'play.black': 'Black',
    'play.strength': 'Strength',
    'play.beginner': 'Beginner',
    'play.club': 'Club',
    'play.master': 'Master',
    'play.start': 'Start game →',
    'play.record': 'Your record {r}',
    'play.rec': '{w}W · {l}L · {d}D',
    'status.thinking': 'Bot is thinking…',
    'status.checkSelf': 'Check! Get out of it.',
    'status.checkThem': 'Good check — the bot must respond.',
    'status.yourMove': 'Your move.',
    'status.botMove': 'Bot to move…',
    'over.win': 'Checkmate — you win! 🎉',
    'over.loss': 'Checkmate — the bot wins.',
    'over.draw': 'Draw — {reason}.',
    'reason.checkmate': 'checkmate',
    'reason.stalemate': 'stalemate',
    'reason.threefold': 'threefold repetition',
    'reason.fifty': 'fifty-move rule',
    'reason.insufficient': 'insufficient material',
    'play.newGame': 'New game',
    'play.flip': '⟲ Flip',
    'play.noMoves': 'No moves yet — open with a pawn or develop a knight.',
    'play.youPlay': 'You play {s}',
    'play.level': 'Level {l}',
    'play.metaOver': '{r} · {res}',
    'play.metaHint': 'Drag-free click-to-move: pick a piece, then its target square.'
  };

  const ar = {
    'brand': 'نادي الشطرنج الملكي',
    'meta.title': 'نادي الشطرنج الملكي — تعلّم الشطرنج تفاعلياً',
    'nav.menu': 'فتح/إغلاق القائمة',
    'nav.home': 'الرئيسية',
    'nav.lessons': 'الدروس',
    'nav.puzzles': 'الألغاز',
    'nav.play': 'اللعب',
    'lang.group': 'اللغة',

    'hero.eyebrow': 'مجاني · بدون تسجيل · يعمل في متصفحك',
    'hero.h1a': 'تعلّم الشطرنج عبر ',
    'hero.h1b': 'لعب النقلات بنفسك.',
    'hero.lede': 'خمسة دروس موجَّهة على رقعة حقيقية، وستة عشر لغة تكتيكية مُتحقَّقاً منها — بما فيها خطوط كش مات في نقلتين مفروضة — وبوت يمكنك هزمه. يُحفظ تقدمك تلقائياً.',
    'hero.cta1': 'ابدأ الدورة ←',
    'hero.cta2': 'جرب لغزاً',
    'hero.caption': 'كل وضعية في هذا الموقع قابلة لللعب فعلياً — انقر على قطعة ثم على مربع.',

    'home.title': 'كل ما تحتاجه للتحسن',
    'course.eyebrow': '📚 الدورة',
    'course.title': 'دروس موجَّهة',
    'course.lede': 'يخلط كل درس بين شروحات قصيرة، ومهام تحلّها على الرقعة، واختبارات سريعة. يمكنك المغادرة في أي وقت — يُتذكّر خطك.',
    'course.cta': 'جاهز للألغاز؟ ←',
    'footer.text': 'نادي الشطرنج الملكي — دورة شطرنج تفاعلية بدون أي مكتبات خارجية. محرّك القوانين والدروس والبوت كلها مكتوبة يدوياً بجافاسكربت خام.',

    'stat.lessons': 'درساً مكتملاً',
    'stat.puzzles': 'لغزاً محلولاً',
    'stat.streak': 'أطول سلسلة',
    'stat.games': 'مباريات ضد البوت',

    'feature1.title': 'دروس موجَّهة',
    'feature1.text': '{n} درساً تلعب فيها النقلات بنفسك على رقعة حقيقية — حركة القطع، والكش والكش مات، والتكتيكات، والافتتارات، والنهايات.',
    'feature1.cta': 'افتح الدورة',
    'feature2.title': 'ألغاز تكتيكية',
    'feature2.text': '{n} وضعية مُتحقَّقاً منها يدوياً: كش مات بالصف الأخير، ضربات حصان، ضربات بيدق، كش مات الاختناق، الترقيات، وخطوط كش مات في نقلتين مفروضة.',
    'feature2.cta': 'حلّ الآن',
    'feature3.title': 'العب ضد البوت',
    'feature3.text': 'ثلاث درجات صعوبة — مبتدئ ونادي وأستاذ — يعملها محرك بحث ألفا-بيتا مكتوب من الصفر.',
    'feature3.cta': 'ابدأ مباراة',
    'feature4.title': 'تقدمك',
    'feature4.text': 'يُحفظ الدروس والسلسلات وسجل انتصاراتك وهزائمك محلياً في متصفحك تلقائياً.',
    'feature4.cta': 'انظر إلى ما أنجزته',

    'course.steps': '{n} خطوات',
    'course.completed': ' · مكتمل ✓',
    'course.replay': 'أعد الدرس',
    'course.continueBtn': 'أكمل',
    'course.startBtn': 'ابدأ الدرس',

    'lesson.step': 'الخطوة {a} / {b}',
    'lesson.completeTitle': 'اكتمل الدرس!',
    'lesson.finished': 'أنهيت درس {t}.',
    'lesson.next': 'الدرس التالي ←',
    'lesson.allLessons': 'كل الدروس',
    'lesson.tryPuzzle': 'جرّب لغزاً',
    'lesson.upNext': 'التالي: {t}.',
    'lesson.courseDone': 'هذا يكمل الدورة — انتقل إلى الألغاز لمواصلة التدريب.',
    'lesson.finishBtn': 'أنهِ الدرس ✓',
    'lesson.continue': 'تابع ←',
    'lesson.back': '→ رجوع',
    'lesson.reset': '↺ إعادة',
    'lesson.wellDone': '{san} — أحسنت!',
    'quiz.correct': 'صحيح.',
    'quiz.wrong': 'ليس تماماً.',

    'fb.noCheck': 'النقلة قانونية، لكنها لا تُعطي كشاً.',
    'fb.noMate': 'النقلة قانونية، لكنها ليست كش مات.',
    'fb.turn': 'هناك خطأ ما — تحقّق من صاحب النقلة.',
    'fb.notLooking': 'هذه نقلة قانونية، لكنها ليست النقلة التي تريدها هذه الخطوة. ',
    'fb.plan': 'الخطة تشير إلى {h}.',
    'fb.reread': 'أعد قراءة التعليمات.',
    'board.freeExplore': 'انقر على أي قطعة لترى أين يمكنها التحرك — جرّب اللونين معاً.',
    'board.hint': 'انقر على قطعة، ثم على مربع مُظلَّل.',
    'promo.label': 'الترقية إلى',

    'puzzle.eyebrow': '🎯 لغز',
    'puzzle.solved': 'حُلّ {a} من {b}',
    'puzzle.difficulty': 'الصعوبة',
    'puzzle.solvedTitle': 'تمّ الحل!',
    'puzzle.streakN': 'السلسلة: {n} 🔥',
    'puzzle.next': 'اللغز التالي ←',
    'puzzle.replay': '↺ إعادة',
    'puzzle.already': 'محلول سابقاً.',
    'puzzle.hintIs': 'تلميح: {h}',
    'puzzle.hintBtn': '💡 تلميح',
    'puzzle.skip': 'تخطَّ ←',
    'puzzle.streakRow': 'السلسلة',
    'puzzle.bestRow': 'الأفضل',
    'meta.replying': 'الخصم يردّ…',
    'meta.mate2': 'كش مات في نقلتين: جد النقلة الأولى — والرد يلعب نفسه.',
    'meta.lineMove': 'نقلة {a} من {b} في الخط — أكمل الكش مات.',
    'meta.findBest': 'جد أفضل نقلة. الإجابات الخاطئة لا تغيّر الوضعية.',
    'reply.done': '<b>ردّ خصمك يُلعب نيابةً عنه —</b> الآن سلِّم النقلة الأخيرة.',
    'puzzle.wrong1': 'ليست هي. ابحث عن الكشات والآخذ والتهديدات.',
    'puzzle.wrong2': 'ليست أفضل نقلة — جرّب النقلة التي تخلق أكبر تهديد.',

    'play.eyebrow': '🤖 العب ضد البوت',
    'play.setupTitle': 'جهّز مباراتك',
    'play.setupBody': 'اختر الجهة ودرجة الصعوبة. يبحث المحرك عن مئات الآلاف من الوضعيات في كل نقلة — كلما ارتفعت الدرجة طال تفكيره.',
    'play.playAs': 'العب بصفة',
    'play.white': 'الأبيض',
    'play.black': 'الأسود',
    'play.strength': 'القوة',
    'play.beginner': 'مبتدئ',
    'play.club': 'نادي',
    'play.master': 'أستاذ',
    'play.start': 'ابدأ المباراة ←',
    'play.record': 'سجلك {r}',
    'play.rec': '{w} فوز · {l} خسارة · {d} تعادل',
    'status.thinking': 'البوت يفكّر…',
    'status.checkSelf': 'كش! اخرج منه.',
    'status.checkThem': 'كش ممتاز — يجب على البوت أن يردّ.',
    'status.yourMove': 'دورك.',
    'status.botMove': 'دور البوت…',
    'over.win': 'كش مات — فزت! 🎉',
    'over.loss': 'كش مات — البوت فاز.',
    'over.draw': 'تعادل — {reason}.',
    'reason.checkmate': 'كش مات',
    'reason.stalemate': 'جمود',
    'reason.threefold': 'تكرار ثلاث المرات',
    'reason.fifty': 'قاعدة الخمسين نقلة',
    'reason.insufficient': 'مادة غير كافية',
    'play.newGame': 'مباراة جديدة',
    'play.flip': '⟲ قلب',
    'play.noMoves': 'لا نقلات بعد — افتح ببيدق أو طوّر حصاناً.',
    'play.youPlay': 'ألعب بـ{s}',
    'play.level': 'المستوى {l}',
    'play.metaOver': '{r} · {res}',
    'play.metaHint': 'بلا سحب: انقر قطعة ثم مربع الهدف.'
  };

  function t(key, params) {
    let s;
    if (lang === 'ar' && ar[key] !== undefined) s = ar[key];
    else s = en[key] !== undefined ? en[key] : key;
    if (params) for (const k in params) s = s.split('{' + k + '}').join(params[k]);
    return s;
  }

  function tr(obj, base) {
    if (!obj) return '';
    if (lang === 'ar' && obj[base + 'Ar'] !== undefined && obj[base + 'Ar'] !== null) return obj[base + 'Ar'];
    return obj[base];
  }

  function applyDocument() {
    if (typeof document === 'undefined') return; // node tests
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-label]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nLabel)); });
    document.querySelectorAll('[data-lang]').forEach(b => b.classList.toggle('on', b.dataset.lang === lang));
  }

  let listener = null;
  function set(l) {
    if (l !== 'ar' && l !== 'en') return;
    if (l === lang) return;
    lang = l;
    try { localStorage.setItem(KEY, l); } catch (e) { /* ignore */ }
    applyDocument();
    if (listener) listener();
  }
  function get() { return lang; }
  function onchange(fn) { listener = fn; }

  return { t, tr, set, get, onchange, applyDocument, _dict: { en, ar } };
})();

if (typeof module !== 'undefined') module.exports = I18n;
