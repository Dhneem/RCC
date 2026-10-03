/* Dev helper: verifies "mate in 2" puzzle candidates against the engine.
   For a FEN it reports:
     - mateIn1: moves that end the game immediately (a "mate in 2" puzzle must have none)
     - mateIn2: first moves that are NOT mate but where EVERY legal reply
       allows the mover to deliver checkmate on the very next move
   Usage: node test/find-mate2.js [fen ...]   (defaults to the four curated candidates) */
const Chess = require('../js/chess.js');

const sq = m => Chess.sqName(m.from) + Chess.sqName(m.to);

function matingMoves(state) {
  return Chess.generateMoves(state).filter(
    m => Chess.getStatus(Chess.makeMove(state, m)).reason === 'checkmate'
  );
}

function analyze(fen) {
  const st = Chess.parseFEN(fen);
  const start = Chess.getStatus(st);
  const result = { fen, side: st.turn, alreadyOver: start.over ? start.reason : null, mateIn1: [], mateIn2: [] };
  if (start.over) return result;
  result.mateIn1 = matingMoves(st).map(sq);
  for (const m1 of Chess.generateMoves(st)) {
    const after1 = Chess.makeMove(st, m1);
    const replies = Chess.generateMoves(after1);
    if (!replies.length) continue; // stalemate or no mate-in-2 line
    const allReplyLose = replies.every(r => matingMoves(Chess.makeMove(after1, r)).length > 0);
    if (allReplyLose && !result.mateIn1.includes(sq(m1))) {
      result.mateIn2.push({ move: sq(m1), replies: replies.map(sq) });
    }
  }
  return result;
}

/* Walk a scripted line: every move must be legal, final position must be mate. */
function checkLine(fen, line) {
  let st = Chess.parseFEN(fen);
  const seen = [];
  for (const coord of line) {
    const m = Chess.generateMoves(st).find(g => sq(g) === coord);
    if (!m) return { ok: false, at: coord, seen, why: 'illegal' };
    seen.push(Chess.moveToSAN(st, m));
    st = Chess.makeMove(st, m);
  }
  const status = Chess.getStatus(st);
  return { ok: status.reason === 'checkmate', seen, endReason: status.reason || 'ongoing' };
}

const CANDIDATES = [
  { id: 'p13', fen: 'r5k1/2P2ppp/8/8/8/8/6PP/2R3K1 w - - 0 1', line: ['c7c8', 'a8c8', 'c1c8'] },
  { id: 'p14', fen: 'r6k/5p1p/8/7Q/8/8/4K1R1/4R3 w - - 0 1', line: ['h5h7', 'h8h7', 'e1h1'] },
  { id: 'p15', fen: '4r3/4k1r1/8/8/3n3q/8/5P1P/5R1K b - - 0 1', line: ['h4h2', 'h1h2', 'e8h8'] },
  { id: 'p16', fen: '2r3k1/6pp/8/8/8/8/2p2PPP/R5K1 b - - 0 1', line: ['c2c1', 'a1c1', 'c8c1'] }
];

const input = process.argv.slice(2).length ? process.argv.slice(2).map(f => ({ id: '?', fen: f, line: null })) : CANDIDATES;

for (const c of input) {
  const r = analyze(c.fen);
  console.log(`\n=== ${c.id} (${r.side === 'w' ? 'White' : 'Black'} to move) ${c.fen}`);
  if (r.alreadyOver) console.log('  ALREADY OVER:', r.alreadyOver);
  console.log('  mate in 1:', r.mateIn1.length ? r.mateIn1.join(' ') : '(none — good for mate-in-2)');
  console.log('  mate in 2 first moves:', r.mateIn2.length ? '' : '(NONE ✗)');
  for (const m of r.mateIn2) console.log(`    ${m.move} — replies: ${m.replies.join(' ')}`);
  if (c.line) {
    const l = checkLine(c.fen, c.line);
    console.log('  scripted line:', l.ok ? `OK (${l.seen.join(' ')})` : `FAIL ${JSON.stringify(l)}`);
    const inSolution = r.mateIn2.some(m => m.move === c.line[0]);
    console.log('  line[0] among verified mate-in-2 moves:', inSolution ? 'yes ✓' : 'NO ✗');
  }
}
