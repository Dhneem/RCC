/* Validates every lesson task and puzzle in js/content.js against the engine. */
const Chess = require('../js/chess.js');
const Course = require('../js/content.js');

let failures = 0;
const fail = msg => { failures++; console.log('FAIL ' + msg); };
const ok = msg => console.log('PASS ' + msg);

function parseMove(str) {
  return { from: Chess.nameSq(str.slice(0, 2)), to: Chess.nameSq(str.slice(2, 4)) };
}
function sameMove(m, str) {
  const p = parseMove(str);
  return m.from === p.from && m.to === p.to;
}
const coord = m => Chess.sqName(m.from) + Chess.sqName(m.to);

function matingMoves(state) {
  return Chess.generateMoves(state).filter(m => Chess.getStatus(Chess.makeMove(state, m)).reason === 'checkmate');
}

/* true iff playing `move` is not itself mate but leaves the opponent with no
   escape: every legal reply allows the mover to deliver mate next move. */
function isForcedMateIn2(state, move) {
  const after = Chess.makeMove(state, move);
  if (Chess.getStatus(after).reason === 'checkmate') return false;
  const replies = Chess.generateMoves(after);
  if (!replies.length) return false;
  return replies.every(r => matingMoves(Chess.makeMove(after, r)).length > 0);
}

// ---- lessons ----
for (const lesson of Course.lessons) {
  if (!lesson.steps || !lesson.steps.length) fail(`lesson ${lesson.id}: no steps`);
  lesson.steps.forEach((step, i) => {
    const tag = `${lesson.id} step ${i + 1} (${step.type})`;
    if (step.type === 'read') {
      if (!step.fen) fail(`${tag}: missing fen`);
      else { try { Chess.parseFEN(step.fen); ok(`${tag}: fen`); } catch (e) { fail(`${tag}: bad fen`); } }
      return;
    }
    if (step.type === 'quiz') {
      if (!Array.isArray(step.options)) fail(`${tag}: no options`);
      else if (step.answer < 0 || step.answer >= step.options.length) fail(`${tag}: answer out of range`);
      else ok(`${tag}: answer in range`);
      return;
    }
    if (step.type === 'task') {
      let st;
      try { st = Chess.parseFEN(step.fen); } catch (e) { fail(`${tag}: bad fen`); return; }
      if (step.task.highlight && !/^[a-h][1-8]$/.test(step.task.highlight)) {
        fail(`${tag}: bad highlight ${step.task.highlight}`);
      }
      const legal = Chess.generateMoves(st);
      for (const mv of step.task.moves) {
        const found = legal.find(m => sameMove(m, mv));
        if (!found) { fail(`${tag}: move ${mv} not legal in ${step.fen}`); continue; }
        if (step.task.require) {
          const next = Chess.makeMove(st, found);
          const status = Chess.getStatus(next);
          if (step.task.require === 'check' && !Chess.inCheck(next, st.turn === 'w' ? 'b' : 'w')) {
            fail(`${tag}: move ${mv} does not give check`);
          } else if (step.task.require === 'mate' && status.reason !== 'checkmate') {
            fail(`${tag}: move ${mv} is not checkmate (got ${status.reason || 'ongoing'})`);
          } else ok(`${tag}: ${mv} legal + ${step.task.require}`);
        } else ok(`${tag}: ${mv} legal`);
      }
      return;
    }
    fail(`${tag}: unknown step type`);
  });
}

// ---- puzzles ----
const ids = new Set();
for (const p of Course.puzzles) {
  if (ids.has(p.id)) fail(`puzzle ${p.id}: duplicate id`);
  ids.add(p.id);
  let st;
  try { st = Chess.parseFEN(p.fen); } catch (e) { fail(`puzzle ${p.id}: bad fen`); continue; }
  const legal = Chess.generateMoves(st);
  for (const mv of p.solution) {
    const found = legal.find(m => sameMove(m, mv));
    if (!found) { fail(`puzzle ${p.id}: solution ${mv} not legal in ${p.fen}`); continue; }
    const next = Chess.makeMove(st, found);
    if (p.mate) {
      const status = Chess.getStatus(next);
      if (status.reason !== 'checkmate') {
        fail(`puzzle ${p.id}: ${mv} is not mate (reason=${status.reason || 'ongoing'})`);
        continue;
      }
    } else {
      // opponent must not already be mating by accident unless declared
      const status = Chess.getStatus(next);
      if (status.reason && status.reason !== 'checkmate' && status.reason !== 'stalemate') {
        fail(`puzzle ${p.id}: unexpected game end ${status.reason} after ${mv}`);
        continue;
      }
    }
    ok(`puzzle ${p.id}: ${mv}${p.mate ? ' is checkmate' : ' legal'}`);
  }
  // hint/explain present
  if (!p.hint || !p.explain) fail(`puzzle ${p.id}: missing hint/explain`);

  // scripted multi-move lines (mate in two puzzles)
  if (p.line) {
    const tag = `puzzle ${p.id} line`;
    if (!p.mateIn2) fail(`${tag}: line puzzles must declare mateIn2`);
    if (p.line.length < 3 || p.line.length % 2 !== 1) {
      fail(`${tag}: must alternate player/opponent and end on the player's move (odd length >= 3)`);
    }
    if (!p.solution.includes(p.line[0])) fail(`${tag}: line[0] ${p.line[0]} not in solution`);
    // walk the whole line: legal, alternating, ending in checkmate
    let walk = Chess.parseFEN(p.fen), walkOk = true;
    const sans = [];
    for (let i = 0; i < p.line.length; i++) {
      const g = Chess.generateMoves(walk).find(m => sameMove(m, p.line[i]));
      if (!g) { fail(`${tag}: move ${i + 1} (${p.line[i]}) illegal in ${walk ? Chess.toFEN(walk) : '?'}`); walkOk = false; break; }
      sans.push(Chess.moveToSAN(walk, g));
      walk = Chess.makeMove(walk, g);
    }
    if (walkOk) {
      const end = Chess.getStatus(walk);
      if (end.reason !== 'checkmate') fail(`${tag}: does not end in checkmate (reason=${end.reason || 'ongoing'})`);
      else ok(`${tag}: ${sans.join(' ')} is mate`);
    }
    // the "mate in two" claim must be genuine:
    // no immediate mate exists, and line[0] really forces mate in two
    const st0 = Chess.parseFEN(p.fen);
    const m1 = matingMoves(st0);
    if (m1.length) fail(`puzzle ${p.id}: position allows mate in 1 (${m1.map(coord).join(' ')}), not a mate in 2`);
    else ok(`puzzle ${p.id}: no mate in 1 available`);
    const candidates = Chess.generateMoves(st0).filter(m => sameMove(m, p.line[0]));
    if (candidates.some(m => isForcedMateIn2(st0, m))) ok(`puzzle ${p.id}: ${p.line[0]} forces mate in 2`);
    else fail(`puzzle ${p.id}: ${p.line[0]} is not a forced mate in 2`);
  }
}

// negative sanity: claimed mates must NOT already be mate before the move
for (const p of Course.puzzles) {
  if (!p.mate && !p.mateIn2) continue;
  const st = Chess.parseFEN(p.fen);
  const status = Chess.getStatus(st);
  if (status.over) fail(`puzzle ${p.id}: position already over before solution`);
}

console.log(failures === 0 ? '\nALL CONTENT TESTS PASSED' : `\n${failures} FAILURES`);
process.exit(failures ? 1 : 0);
