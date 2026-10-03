/* Royal Chess Club — app shell: navigation, lessons, puzzles, play, progress. */
const App = (() => {
  const $ = s => document.querySelector(s);
  const KEY = 'royal-chess-club-v1';
  const LEGACY_KEY = 'checkmate-academy-v1';
  const t = I18n.t, tr = I18n.tr;

  // ---------------------------------------------------------------- progress
  const defaultSave = () => ({ lessons: {}, puzzles: { solved: [], streak: 0, best: 0 }, games: { w: 0, l: 0, d: 0 } });
  let save = defaultSave();
  try {
    let raw = localStorage.getItem(KEY);
    if (!raw) { // migrate progress saved under the old site name
      raw = localStorage.getItem(LEGACY_KEY);
      if (raw) localStorage.setItem(KEY, raw);
    }
    if (raw) save = Object.assign(defaultSave(), JSON.parse(raw));
  } catch (e) { /* private mode */ }

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) { /* ignore */ }
  }

  // ------------------------------------------------------------------ boards
  const lessonBoard = new Board($('#boardLesson'), {});
  const puzzleBoard = new Board($('#boardPuzzle'), {});
  const playBoard = new Board($('#boardPlay'), {});
  new Board($('#artBoard'), {}).render(Chess.parseFEN(Chess.START_FEN), { frozen: true });

  // ------------------------------------------------------- shared selection
  /* ctx() -> { state, free, frozen, ui, attempt(move), clickAllowed(idx) } */
  function createSelector(board, ctx) {
    let selected = null, targets = null, legal = [];

    const paint = () => {
      const c = ctx();
      board.render(c.state, Object.assign({}, c.ui || {}, {
        selected, targets, frozen: c.frozen
      }));
    };

    function select(idx) {
      const c = ctx();
      const st = c.state;
      const piece = st.board[idx];
      if (!piece) { clear(paint); return; }
      const color = Chess.colorOf(piece);
      if (c.free) {
        if (color !== st.turn) st.turn = color; // explore both sides
      } else if (color !== st.turn) { clear(paint); return; }
      if (c.clickAllowed && !c.clickAllowed(idx)) { clear(paint); return; }
      selected = idx;
      legal = Chess.generateMoves(st).filter(m => m.from === idx);
      targets = new Map(legal.map(m => [m.to, !!m.captured]));
      paint();
    }

    function clear(cb) { selected = null; targets = null; legal = []; if (cb) cb(); }

    function click(idx) {
      const c = ctx();
      if (c.frozen) return;
      if (selected === null) { select(idx); return; }
      if (idx === selected) { clear(paint); return; }
      if (targets && targets.has(idx)) {
        const moves = legal.filter(m => m.to === idx);
        const from = selected;
        clear();
        if (moves.length > 1 && moves[0].promotion) {
          board.promote(Chess.colorOf(moves[0].piece), p => {
            const chosen = moves.find(m => m.promotion === p) || moves[0];
            c.attempt(chosen);
            paint();
          });
        } else {
          c.attempt(moves[0]);
          paint();
        }
        return;
      }
      select(idx);
    }

    return { click, paint, clear: () => clear(paint) };
  }

  function checkSquare(state) {
    return Chess.inCheck(state) ? Chess.kingSquare(state.board, state.turn) : null;
  }
  function coordMove(m) { return Chess.sqName(m.from) + Chess.sqName(m.to); }
  function stars(n) { return '★'.repeat(n) + '☆'.repeat(3 - n); }

  // ----------------------------------------------------------------navigate
  const VIEWS = ['home', 'course', 'lesson', 'puzzles', 'play'];
  let currentView = 'home';
  function showView(name) {
    if (!VIEWS.includes(name)) name = 'home';
    currentView = name;
    VIEWS.forEach(v => { $('#view-' + v).hidden = v !== name; });
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.nav === name));
    $('#nav').classList.remove('open');
    if (name === 'home') renderHome();
    if (name === 'course') renderCourse();
    if (name === 'puzzles') openPuzzle();
    if (name === 'play') renderPlay();
    window.scrollTo({ top: 0 });
  }
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-nav]');
    if (t) showView(t.dataset.nav);
  });
  $('#navToggle').addEventListener('click', () => $('#nav').classList.toggle('open'));

  // ------------------------------------------------------------------- home
  function renderHome() {
    const lessonsDone = Course.lessons.filter(l => save.lessons[l.id] && save.lessons[l.id].done).length;
    const solved = save.puzzles.solved.length;
    const g = save.games;
    $('#homeStats').innerHTML = `
      <div class="stat"><b>${lessonsDone}/${Course.lessons.length}</b><span>${t('stat.lessons')}</span></div>
      <div class="stat"><b>${solved}/${Course.puzzles.length}</b><span>${t('stat.puzzles')}</span></div>
      <div class="stat"><b>${save.puzzles.best}</b><span>${t('stat.streak')}</span></div>
      <div class="stat"><b>${g.w}–${g.l}–${g.d}</b><span>${t('stat.games')}</span></div>`;
    $('#featureGrid').innerHTML = [
      { icon: '📚', title: t('feature1.title'), text: t('feature1.text', { n: Course.lessons.length }), nav: 'course', cta: t('feature1.cta') },
      { icon: '🎯', title: t('feature2.title'), text: t('feature2.text', { n: Course.puzzles.length }), nav: 'puzzles', cta: t('feature2.cta') },
      { icon: '🤖', title: t('feature3.title'), text: t('feature3.text'), nav: 'play', cta: t('feature3.cta') },
      { icon: '🏅', title: t('feature4.title'), text: t('feature4.text'), nav: 'course', cta: t('feature4.cta') }
    ].map(f => `
      <article class="card feature">
        <div class="feature-icon">${f.icon}</div>
        <h3>${f.title}</h3>
        <p>${f.text}</p>
        <button class="link" data-nav="${f.nav}">${f.cta} →</button>
      </article>`).join('');
  }

  // ----------------------------------------------------------------- course
  function renderCourse() {
    $('#lessonGrid').innerHTML = Course.lessons.map((l, i) => {
      const rec = save.lessons[l.id];
      const done = rec && rec.done;
      const step = rec ? Math.min(rec.step || 0, l.steps.length - 1) : 0;
      const pct = done ? 100 : Math.round((step / l.steps.length) * 100);
      const label = done ? t('course.replay') : (step > 0 ? t('course.continueBtn') : t('course.startBtn'));
      return `
      <article class="card lesson-card" data-lesson="${i}">
        <div class="lesson-icon">${l.icon}</div>
        <div class="lesson-body">
          <h3>${tr(l, 'title')}</h3>
          <p>${tr(l, 'blurb')}</p>
          <div class="bar"><i style="width:${pct}%"></i></div>
          <div class="lesson-foot">
            <span class="muted">${t('course.steps', { n: l.steps.length })}${done ? t('course.completed') : ''}</span>
            <button class="btn small primary" data-open-lesson="${i}">${label}</button>
          </div>
        </div>
      </article>`;
    }).join('');
    $('#lessonGrid').querySelectorAll('[data-open-lesson]').forEach(b => {
      b.addEventListener('click', () => openLesson(+b.dataset.openLesson));
    });
  }

  // ------------------------------------------------------- lesson player
  const lessonState = { idx: 0, step: 0, phase: 'idle' }; // idle | success | answered | complete
  let lessonSnap = null; // parsed FEN for current step

  const lessonCtx = () => {
    const step = Course.lessons[lessonState.idx].steps[lessonState.step];
    const free = step.type === 'read';
    const frozen = lessonState.phase === 'success' || lessonState.phase === 'answered' || lessonState.phase === 'complete';
    return {
      state: lessonSnap,
      free,
      frozen: frozen && !free,
      ui: step.type === 'task' ? {
        hint: step.task.highlight ? Chess.nameSq(step.task.highlight) : null,
        check: lessonSnap ? checkSquare(lessonSnap) : null
      } : {},
      attempt: m => attemptLessonMove(m)
    };
  };
  const lessonSel = createSelector(lessonBoard, lessonCtx);
  lessonBoard.onSquare = idx => lessonSel.click(idx);

  function openLesson(i) {
    lessonState.idx = i;
    const lesson = Course.lessons[i];
    const rec = save.lessons[lesson.id];
    lessonState.step = rec && !rec.done ? Math.min(rec.step || 0, lesson.steps.length - 1) : 0;
    lessonState.phase = 'idle';
    showView('lesson');
    renderLesson();
  }

  function saveLessonStep() {
    const lesson = Course.lessons[lessonState.idx];
    const rec = save.lessons[lesson.id] || { step: 0, done: false };
    rec.step = Math.max(rec.step, Math.min(lessonState.step, lesson.steps.length - 1));
    save.lessons[lesson.id] = rec;
    persist();
  }

  function renderLesson() {
    const lesson = Course.lessons[lessonState.idx];
    const step = lesson.steps[lessonState.step];
    const total = lesson.steps.length;
    $('#stepCount').textContent = t('lesson.step', { a: lessonState.step + 1, b: total });
    $('#stepDots').innerHTML = lesson.steps.map((_, i) =>
      `<i class="${i < lessonState.step ? 'past' : i === lessonState.step ? 'now' : ''}"></i>`).join('');

    const panel = $('#lessonPanel');
    const boardCol = $('#view-lesson .board-col');

    if (lessonState.phase === 'complete') {
      boardCol.style.display = 'none';
      panel.innerHTML = `
        <div class="done-box">
          <div class="done-mark">✓</div>
          <h3>${t('lesson.completeTitle')}</h3>
          <p>${t('lesson.finished', { t: `<b>${tr(lesson, 'title')}</b>` })} ${nextLessonHint()}</p>
          <div class="btn-row">
            ${lessonState.idx < Course.lessons.length - 1
              ? `<button class="btn primary" id="nextLesson">${t('lesson.next')}</button>` : ''}
            <button class="btn ghost" data-nav="course">${t('lesson.allLessons')}</button>
            <button class="btn ghost" data-nav="puzzles">${t('lesson.tryPuzzle')}</button>
          </div>
        </div>`;
      const nx = $('#nextLesson');
      if (nx) nx.addEventListener('click', () => openLesson(lessonState.idx + 1));
      lessonSel.clear();
      return;
    }

    boardCol.style.display = step.fen ? '' : 'none';

    let html = `<p class="eyebrow">${lesson.icon} ${tr(lesson, 'title')}</p><h3>${tr(step, 'title')}</h3>`;
    if (step.body) html += tr(step, 'body').map(p => `<p>${p}</p>`).join('');

    if (step.type === 'quiz') {
      const letters = I18n.get() === 'ar' ? ['أ', 'ب', 'ج', 'د'] : ['A', 'B', 'C', 'D'];
      html += `<div class="quiz">
        <p class="quiz-q">${tr(step, 'question')}</p>
        ${tr(step, 'options').map((o, i) => `<button class="quiz-opt" data-opt="${i}">${letters[i] || i + 1}. ${o}</button>`).join('')}
        <div class="feedback" id="fb"></div>
      </div>
      <div class="btn-row"><button class="btn ghost" id="prevStep" ${lessonState.step === 0 ? 'disabled' : ''}>${t('lesson.back')}</button></div>`;
    } else if (step.type === 'task') {
      html += `<div class="feedback" id="fb"></div>
        <div class="btn-row">
          <button class="btn ghost" id="resetPos">${t('lesson.reset')}</button>
          <button class="btn ghost" id="prevStep" ${lessonState.step === 0 ? 'disabled' : ''}>${t('lesson.back')}</button>
          <button class="btn primary" id="nextStep" hidden>${t('lesson.continue')}</button>
        </div>`;
    } else {
      html += `<div class="btn-row">
          <button class="btn primary" id="nextStep">${lessonState.step === total - 1 ? t('lesson.finishBtn') : t('lesson.continue')}</button>
          <button class="btn ghost" id="prevStep" ${lessonState.step === 0 ? 'disabled' : ''}>${t('lesson.back')}</button>
        </div>`;
    }
    panel.innerHTML = html;

    // wire
    const next = $('#nextStep'), prev = $('#prevStep'), reset = $('#resetPos');
    if (next) { next.addEventListener('click', goNext); next._wired = true; }
    if (prev) prev.addEventListener('click', () => { if (lessonState.step > 0) { lessonState.step--; lessonState.phase = 'idle'; renderLesson(); } });
    if (reset) reset.addEventListener('click', () => { loadStepPosition(); lessonSel.clear(); renderLesson(); });
    panel.querySelectorAll('.quiz-opt').forEach(b => b.addEventListener('click', () => answerQuiz(+b.dataset.opt)));

    if (step.type === 'quiz' && lessonState.phase === 'answered') markQuiz(step, panel);

    // board
    if (step.fen) {
      loadStepPosition();
      lessonSel.clear();
      lessonSel.paint();
      $('#lessonBoardMeta').innerHTML = step.freeExplore
        ? `<span class="muted">${t('board.freeExplore')}</span>`
        : step.type === 'task'
          ? `<span class="muted">${t('board.hint')}</span>`
          : '';
    }
  }

  function loadStepPosition() {
    const step = Course.lessons[lessonState.idx].steps[lessonState.step];
    lessonSnap = step.fen ? Chess.parseFEN(step.fen) : null;
  }

  function nextLessonHint() {
    const n = lessonState.idx + 1;
    return n < Course.lessons.length
      ? t('lesson.upNext', { t: `<b>${tr(Course.lessons[n], 'title')}</b>` })
      : t('lesson.courseDone');
  }

  function goNext() {
    const lesson = Course.lessons[lessonState.idx];
    if (lessonState.step >= lesson.steps.length - 1) {
      lessonState.phase = 'complete';
      const rec = save.lessons[lesson.id] || { step: 0, done: false };
      rec.done = true;
      rec.step = lesson.steps.length - 1;
      save.lessons[lesson.id] = rec;
      persist();
      renderLesson();
      return;
    }
    lessonState.step++;
    lessonState.phase = 'idle';
    saveLessonStep();
    renderLesson();
  }

  function answerQuiz(opt) {
    const step = Course.lessons[lessonState.idx].steps[lessonState.step];
    if (lessonState.phase === 'answered') return;
    lessonState.phase = 'answered';
    lessonState.answer = opt;
    markQuiz(step, $('#lessonPanel'), opt);
    saveLessonStep();
  }

  function markQuiz(step, panel, opt) {
    const chosen = opt !== undefined ? opt : lessonState.answer;
    panel.querySelectorAll('.quiz-opt').forEach((b, i) => {
      b.disabled = true;
      if (i === step.answer) b.classList.add('right');
      else if (i === chosen) b.classList.add('wrong');
    });
    const fb = panel.querySelector('#fb');
    if (fb) {
      fb.className = 'feedback ' + (chosen === step.answer ? 'ok' : 'bad');
      fb.innerHTML = `<b>${chosen === step.answer ? t('quiz.correct') : t('quiz.wrong')}</b> ${tr(step, 'explain')}`;
    }
    ensureNextButton(panel, step);
  }

  function ensureNextButton(panel, step) {
    let next = $('#nextStep');
    if (!next) {
      next = document.createElement('button');
      next.className = 'btn primary';
      next.id = 'nextStep';
      const row = panel.querySelector('.btn-row');
      if (row) row.appendChild(next);
    }
    next.hidden = false;
    next.textContent = lessonState.step >= Course.lessons[lessonState.idx].steps.length - 1 ? t('lesson.finishBtn') : t('lesson.continue');
    if (!next._wired) { next._wired = true; next.addEventListener('click', goNext); }
  }

  function attemptLessonMove(m) {
    const lesson = Course.lessons[lessonState.idx];
    const step = lesson.steps[lessonState.step];
    const fb = $('#lessonPanel #fb');
    if (step.type === 'task') {
      const wanted = step.task.moves.includes(coordMove(m));
      let ok = wanted;
      let why = '';
      if (wanted && step.task.require === 'check') {
        const next = Chess.makeMove(lessonSnap, m);
        ok = Chess.inCheck(next, lessonSnap.turn === 'w' ? 'b' : 'w');
        why = ok ? '' : t('fb.noCheck');
      }
      if (wanted && step.task.require === 'mate') {
        const next = Chess.makeMove(lessonSnap, m);
        ok = Chess.getStatus(next).reason === 'checkmate';
        why = ok ? '' : t('fb.noMate');
      }
      if (ok) {
        const san = Chess.moveToSAN(lessonSnap, m);
        const from = m.from;
        lessonSnap = Chess.makeMove(lessonSnap, m);
        lessonState.phase = 'success';
        lessonSel.clear();
        lessonSel.paint();
        lessonBoard.celebrate(m.to);
        if (fb) { fb.className = 'feedback ok'; fb.innerHTML = `<b>${t('lesson.wellDone', { san })}</b> ${tr(step, 'coach') || ''}`; }
        ensureNextButton($('#lessonPanel'), step);
        saveLessonStep();
      } else {
        lessonBoard.shake();
        if (fb) {
          fb.className = 'feedback bad';
          fb.innerHTML = why || (wanted
            ? t('fb.turn')
            : t('fb.notLooking') +
              (step.task.highlight ? t('fb.plan', { h: `<b>${step.task.highlight}</b>` }) : t('fb.reread')));
        }
      }
    } else {
      // free exploration step
      lessonSnap = Chess.makeMove(lessonSnap, m);
      lessonSel.clear();
      lessonSel.paint();
    }
  }

  // ---------------------------------------------------------------- puzzles
  const puzzleState = { id: null, snap: null, attempts: 0, revealed: false, done: false, phase: 'play', lineIdx: 0 };

  const puzzleCtx = () => ({
    state: puzzleState.snap,
    free: false,
    frozen: puzzleState.done || puzzleState.phase === 'reply',
    ui: puzzleState.snap ? { check: checkSquare(puzzleState.snap) } : {},
    attempt: m => attemptPuzzleMove(m)
  });
  const puzzleSel = createSelector(puzzleBoard, puzzleCtx);
  puzzleBoard.onSquare = idx => puzzleSel.click(idx);

  const skipped = new Set();

  function nextPuzzle() {
    const solved = new Set(save.puzzles.solved);
    let p = Course.puzzles.find(x => !solved.has(x.id) && !skipped.has(x.id));
    if (!p) { // everything left is skipped — start skipping round again
      skipped.clear();
      p = Course.puzzles.find(x => !solved.has(x.id));
    }
    if (!p) p = Course.puzzles[Math.floor(Math.random() * Course.puzzles.length)];
    return p;
  }

  function openPuzzle(id) {
    const p = (id && Course.puzzles.find(x => x.id === id)) || nextPuzzle();
    puzzleState.id = p.id;
    puzzleState.snap = Chess.parseFEN(p.fen);
    puzzleState.attempts = 0;
    puzzleState.revealed = false;
    puzzleState.lineIdx = 0;
    // an explicitly requested (replay) puzzle starts playable even if solved
    puzzleState.done = !id && save.puzzles.solved.includes(p.id);
    puzzleState.phase = puzzleState.done ? 'done' : 'play';
    renderPuzzle();
  }

  function renderPuzzle() {
    const p = Course.puzzles.find(x => x.id === puzzleState.id);
    const solved = save.puzzles.solved.length;
    const head = `
      <div class="puzzle-head">
        <span class="chip">${tr(p, 'theme')}</span>
        <span class="stars" title="${t('puzzle.difficulty')}">${stars(p.difficulty)}</span>
        <span class="muted">${t('puzzle.solved', { a: solved, b: Course.puzzles.length })}</span>
      </div>
      <h3>${tr(p, 'prompt')}</h3>`;

    let body = '';
    if (puzzleState.phase === 'success') {
      body = `
        <div class="feedback ok"><b>${t('puzzle.solvedTitle')} ${save.puzzles.streak > 1 ? t('puzzle.streakN', { n: save.puzzles.streak }) : ''}</b><br>${tr(p, 'explain')}</div>
        <div class="btn-row">
          <button class="btn primary" id="nextPuzzle">${t('puzzle.next')}</button>
          <button class="btn ghost" id="replayPuzzle">${t('puzzle.replay')}</button>
        </div>`;
    } else if (puzzleState.done) {
      body = `
        <div class="feedback ok"><b>${t('puzzle.already')}</b> ${tr(p, 'explain')}</div>
        <div class="btn-row"><button class="btn primary" id="nextPuzzle">${t('puzzle.next')}</button></div>`;
    } else {
      body = `
        ${puzzleState.revealed ? `<div class="feedback hint">${t('puzzle.hintIs', { h: tr(p, 'hint') })}</div>` : ''}
        <div class="feedback" id="fb"></div>
        <div class="btn-row">
          <button class="btn ghost" id="hintBtn" ${puzzleState.revealed ? 'disabled' : ''}>${t('puzzle.hintBtn')}</button>
          <button class="btn ghost" id="skipBtn">${t('puzzle.skip')}</button>
        </div>`;
    }
    $('#puzzlePanel').innerHTML = `
      <p class="eyebrow">${t('puzzle.eyebrow')}</p>${head}${body}
      <div class="streak-row">
        <span>${t('puzzle.streakRow')} <b>${save.puzzles.streak}</b></span>
        <span>${t('puzzle.bestRow')} <b>${save.puzzles.best}</b></span>
      </div>`;

    const hint = $('#hintBtn');
    if (hint) hint.addEventListener('click', () => { puzzleState.revealed = true; renderPuzzle(); });
    const skip = $('#skipBtn');
    if (skip) skip.addEventListener('click', () => {
      skipped.add(puzzleState.id);
      save.puzzles.streak = 0;
      persist();
      openPuzzle();
    });
    const next = $('#nextPuzzle');
    if (next) next.addEventListener('click', () => openPuzzle());
    const replay = $('#replayPuzzle');
    if (replay) replay.addEventListener('click', () => openPuzzle(puzzleState.id));

    $('#puzzleMeta').innerHTML = puzzleState.phase === 'reply'
      ? `<span class="muted">${t('meta.replying')}</span>`
      : p.line && puzzleState.phase === 'play'
        ? (puzzleState.lineIdx === 0
            ? `<span class="muted">${t('meta.mate2')}</span>`
            : `<span class="muted">${t('meta.lineMove', { a: puzzleState.lineIdx + 1, b: p.line.length })}</span>`)
        : puzzleState.phase === 'play'
          ? `<span class="muted">${t('meta.findBest')}</span>`
          : '';

    puzzleSel.clear();
    puzzleSel.paint();
  }

  function attemptPuzzleMove(m) {
    const p = Course.puzzles.find(x => x.id === puzzleState.id);
    const coord = coordMove(m);
    const correct = p.line ? coord === p.line[puzzleState.lineIdx] : p.solution.includes(coord);
    if (correct) {
      puzzleState.snap = Chess.makeMove(puzzleState.snap, m);
      puzzleSel.clear();
      puzzleSel.paint();

      if (p.line && puzzleState.lineIdx + 1 < p.line.length) {
        const nextIdx = puzzleState.lineIdx + 1;
        puzzleState.lineIdx = nextIdx;
        if (nextIdx % 2 === 1) {
          // scripted opponent reply, played after a short pause
          puzzleState.phase = 'reply';
          renderPuzzle();
          const expectId = p.id, expectAt = nextIdx;
          setTimeout(() => {
            if (puzzleState.id !== expectId || puzzleState.lineIdx !== expectAt || puzzleState.phase !== 'reply') return;
            const reply = Chess.generateMoves(puzzleState.snap).find(g => coordMove(g) === p.line[expectAt]);
            if (reply) puzzleState.snap = Chess.makeMove(puzzleState.snap, reply);
            puzzleState.lineIdx = expectAt + 1;
            puzzleState.phase = 'play';
            renderPuzzle();
            const fb = $('#puzzlePanel #fb');
            if (fb) {
              fb.className = 'feedback ok';
              fb.innerHTML = t('reply.done');
            }
          }, 550);
          return;
        }
        renderPuzzle(); // longer lines: straight back to the player
        return;
      }

      // single-move puzzle, or last move of a scripted line
      puzzleState.done = true;
      puzzleState.phase = 'success';
      const firstTime = !save.puzzles.solved.includes(p.id);
      if (firstTime) save.puzzles.solved.push(p.id);
      if (firstTime && puzzleState.attempts === 0) save.puzzles.streak += 1;
      save.puzzles.best = Math.max(save.puzzles.best, save.puzzles.streak);
      persist();
      renderPuzzle();
      puzzleBoard.celebrate(m.to);
      return;
    }
    puzzleState.attempts++;
    save.puzzles.streak = 0;
    persist();
    puzzleBoard.shake();
    const fb = $('#puzzlePanel #fb');
    if (fb) {
      fb.className = 'feedback bad';
      fb.textContent = puzzleState.attempts >= 2
        ? t('puzzle.wrong2')
        : t('puzzle.wrong1');
    }
    const sr = document.querySelector('.streak-row');
    if (sr) sr.innerHTML = `<span>${t('puzzle.streakRow')} <b>0</b></span><span>${t('puzzle.bestRow')} <b>${save.puzzles.best}</b></span>`;
  }

  // ------------------------------------------------------------------- play
  const game = {
    state: null, history: [], keys: [], level: 2, side: 'w',
    orientation: 'w', over: null, thinking: false, lastMove: null, started: false
  };

  const playCtx = () => ({
    state: game.state,
    free: false,
    frozen: !game.started || game.over !== null || game.thinking || game.state.turn !== game.side,
    ui: game.state ? { lastMove: game.lastMove, check: checkSquare(game.state) } : {},
    attempt: m => playerMove(m)
  });
  const playSel = createSelector(playBoard, playCtx);
  playBoard.onSquare = idx => playSel.click(idx);

  function newGame() {
    game.state = Chess.parseFEN(Chess.START_FEN);
    game.history = [];
    game.keys = [Chess.positionKey(game.state)];
    game.over = null;
    game.thinking = false;
    game.lastMove = null;
    game.started = true;
    game.orientation = game.side;
    playBoard.setOrientation(game.side);
    renderPlay();
    if (game.side === 'b') scheduleBot();
  }

  function pushMove(move) {
    const san = Chess.moveToSAN(game.state, move);
    game.keys.push(Chess.positionKey(game.state));
    game.state = Chess.makeMove(game.state, move);
    game.history.push(san);
    game.lastMove = [move.from, move.to];
    return san;
  }

  function checkGameOver() {
    const status = Chess.getStatus(game.state, game.keys);
    if (status.over) {
      game.over = status;
      const whiteWon = status.result === '1-0';
      const blackWon = status.result === '0-1';
      if (status.reason === 'checkmate') {
        const playerWon = (game.side === 'w' && whiteWon) || (game.side === 'b' && blackWon);
        game.overKind = playerWon ? 'win' : 'loss';
        save.games[playerWon ? 'w' : 'l']++;
      } else {
        game.overKind = 'draw';
        save.games.d++;
      }
      persist();
      return true;
    }
    return false;
  }

  const REASON_KEYS = {
    'checkmate': 'checkmate',
    'stalemate': 'stalemate',
    'fifty-move': 'fifty',
    'insufficient material': 'insufficient',
    'threefold repetition': 'threefold'
  };
  function reasonText(r) {
    return REASON_KEYS[r] ? t('reason.' + REASON_KEYS[r]) : r;
  }
  function overHeadline() {
    if (!game.over) return '';
    if (game.overKind === 'win') return t('over.win');
    if (game.overKind === 'loss') return t('over.loss');
    return t('over.draw', { reason: reasonText(game.over.reason) });
  }

  function playerMove(m) {
    if (game.over || game.thinking) return;
    pushMove(m);
    playSel.clear();
    if (checkGameOver()) { renderPlay(); return; }
    renderPlay();
    scheduleBot();
  }

  function scheduleBot() {
    game.thinking = true;
    renderPlay();
    setTimeout(() => {
      if (!game.state || game.over) return;
      const m = Bot.pick(game.state, game.level);
      if (m) pushMove(m);
      game.thinking = false;
      checkGameOver();
      playSel.clear();
      renderPlay();
    }, 350);
  }

  function renderPlay() {
    const panel = $('#playPanel');
    if (!game.started) {
      panel.innerHTML = `
        <p class="eyebrow">${t('play.eyebrow')}</p>
        <h3>${t('play.setupTitle')}</h3>
        <p>${t('play.setupBody')}</p>
        <div class="field">
          <label>${t('play.playAs')}</label>
          <div class="seg" id="sideSeg">
            <button data-side="w" class="${game.side === 'w' ? 'on' : ''}">♙ ${t('play.white')}</button>
            <button data-side="b" class="${game.side === 'b' ? 'on' : ''}">♟ ${t('play.black')}</button>
          </div>
        </div>
        <div class="field">
          <label>${t('play.strength')}</label>
          <div class="seg" id="levelSeg">
            <button data-level="1" class="${game.level === 1 ? 'on' : ''}">${t('play.beginner')}</button>
            <button data-level="2" class="${game.level === 2 ? 'on' : ''}">${t('play.club')}</button>
            <button data-level="3" class="${game.level === 3 ? 'on' : ''}">${t('play.master')}</button>
          </div>
        </div>
        <div class="btn-row"><button class="btn primary" id="newGame">${t('play.start')}</button></div>
        <div class="streak-row"><span>${t('play.record', { r: `<b>${t('play.rec', { w: save.games.w, l: save.games.l, d: save.games.d })}</b>` })}</span></div>`;
      panel.querySelectorAll('[data-side]').forEach(b => b.addEventListener('click', () => { game.side = b.dataset.side; renderPlay(); }));
      panel.querySelectorAll('[data-level]').forEach(b => b.addEventListener('click', () => { game.level = +b.dataset.level; renderPlay(); }));
      $('#newGame').addEventListener('click', newGame);
      playBoard.render(Chess.parseFEN(Chess.START_FEN), { frozen: true });
      $('#playMeta').innerHTML = '';
      return;
    }

    let status;
    if (game.over) status = overHeadline();
    else if (game.thinking) status = t('status.thinking');
    else if (Chess.inCheck(game.state)) status = game.state.turn === game.side ? t('status.checkSelf') : t('status.checkThem');
    else status = game.state.turn === game.side ? t('status.yourMove') : t('status.botMove');

    const moves = game.history;
    const rows = [];
    for (let i = 0; i < moves.length; i += 2) {
      rows.push(`<tr><td>${i / 2 + 1}.</td><td>${moves[i] || ''}</td><td>${moves[i + 1] || ''}</td></tr>`);
    }

    panel.innerHTML = `
      <div class="status ${game.over ? 'over' : game.thinking ? 'thinking' : ''}">${status}</div>
      <div class="btn-row">
        <button class="btn primary small" id="ngBtn">${t('play.newGame')}</button>
        <button class="btn ghost small" id="flipBtn">${t('play.flip')}</button>
      </div>
      <div class="movelist-wrap">${moves.length
        ? `<table class="movelist">${rows.join('')}</table>`
        : `<p class="muted">${t('play.noMoves')}</p>`}</div>
      <div class="streak-row"><span>${t('play.youPlay', { s: `<b>${t(game.side === 'w' ? 'play.white' : 'play.black')}</b>` })}</span><span>${t('play.level', { l: `<b>${[t('play.beginner'), t('play.club'), t('play.master')][game.level - 1]}</b>` })}</span></div>`;

    $('#ngBtn').addEventListener('click', () => { game.started = false; renderPlay(); });
    $('#flipBtn').addEventListener('click', () => { game.orientation = game.orientation === 'w' ? 'b' : 'w'; playBoard.setOrientation(game.orientation); });

    $('#playMeta').innerHTML = game.over
      ? `<span class="muted">${t('play.metaOver', { r: reasonText(game.over.reason), res: game.over.result })}</span>`
      : `<span class="muted">${t('play.metaHint')}</span>`;

    playSel.clear();
    playSel.paint();
  }

  // ------------------------------------------------------------------ init
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { lessonSel.clear(); puzzleSel.clear(); playSel.clear(); }
  });

  // ------------------------------------------------------------------ i18n
  function refresh() {
    if (currentView === 'home') renderHome();
    else if (currentView === 'course') renderCourse();
    else if (currentView === 'lesson') renderLesson();
    else if (currentView === 'puzzles') renderPuzzle();
    else if (currentView === 'play') renderPlay();
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-lang]');
    if (b) I18n.set(b.dataset.lang);
  });
  I18n.onchange(refresh);
  I18n.applyDocument();

  return { showView, openPuzzle, _debug: () => ({ game, lessonState, puzzleState, save }) };
})();

App.showView('home');
