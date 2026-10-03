/* Chess rules engine — dependency free.
   Board indexing: idx = rank * 8 + file, rank 0 = '1', file 0 = 'a'.
   Pieces: 'KQRBNP' white, 'kqrbnp' black, null = empty. */
const Chess = (() => {
  const KNIGHT = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]];
  const KING = [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]];
  const ROOK = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  const BISHOP = [[1, 1], [1, -1], [-1, -1], [-1, 1]];
  const QUEEN = ROOK.concat(BISHOP);

  const fileOf = i => i & 7;
  const rankOf = i => i >> 3;
  const colorOf = p => (p && p === p.toUpperCase() ? 'w' : 'b');
  const onBoard = (f, r) => f >= 0 && f < 8 && r >= 0 && r < 8;
  const sqName = i => 'abcdefgh'[fileOf(i)] + (rankOf(i) + 1);
  const nameSq = s => (s.charCodeAt(0) - 97) + (s.charCodeAt(1) - 49) * 8;

  function parseFEN(fen) {
    const parts = fen.trim().split(/\s+/);
    const board = new Array(64).fill(null);
    // FEN lists rank 8 first; index 0 is a1, so mirror vertically.
    let row = 0, col = 0;
    for (const ch of parts[0]) {
      if (ch === '/') { row++; col = 0; continue; }
      if (ch >= '1' && ch <= '8') col += +ch;
      else { board[(7 - row) * 8 + col] = ch; col++; }
    }
    const c = (parts[1] || 'w') === 'w' ? 'w' : 'b';
    const cr = parts[2] || '-';
    return {
      board,
      turn: c,
      castling: { wk: cr.includes('K'), wq: cr.includes('Q'), bk: cr.includes('k'), bq: cr.includes('q') },
      ep: parts[3] && parts[3] !== '-' ? nameSq(parts[3]) : null,
      half: +(parts[4] || 0),
      full: +(parts[5] || 1)
    };
  }

  function toFEN(st) {
    let out = '';
    for (let r = 7; r >= 0; r--) {
      let empty = 0;
      for (let f = 0; f < 8; f++) {
        const p = st.board[r * 8 + f];
        if (p) { if (empty) { out += empty; empty = 0; } out += p; }
        else empty++;
      }
      if (empty) out += empty;
      if (r) out += '/';
    }
    const cr = (st.castling.wk ? 'K' : '') + (st.castling.wq ? 'Q' : '') +
      (st.castling.bk ? 'k' : '') + (st.castling.bq ? 'q' : '') || '-';
    return `${out} ${st.turn} ${cr} ${st.ep == null ? '-' : sqName(st.ep)} ${st.half} ${st.full}`;
  }

  function positionKey(st) {
    return toFEN(st).split(' ').slice(0, 4).join(' ');
  }

  function attacked(board, idx, by) {
    const f = fileOf(idx), r = rankOf(idx);
    // knights
    for (const [df, dr] of KNIGHT) {
      const nf = f + df, nr = r + dr;
      if (onBoard(nf, nr)) {
        const p = board[nr * 8 + nf];
        if (p && colorOf(p) === by && p.toLowerCase() === 'n') return true;
      }
    }
    // king
    for (const [df, dr] of KING) {
      const nf = f + df, nr = r + dr;
      if (onBoard(nf, nr)) {
        const p = board[nr * 8 + nf];
        if (p && colorOf(p) === by && p.toLowerCase() === 'k') return true;
      }
    }
    // pawns: attacker sits behind the target relative to its advance
    const pr = by === 'w' ? r - 1 : r + 1;
    for (const df of [-1, 1]) {
      const nf = f + df;
      if (onBoard(nf, pr)) {
        const p = board[pr * 8 + nf];
        if (p && colorOf(p) === by && p.toLowerCase() === 'p') return true;
      }
    }
    // sliders
    const rays = [
      [ROOK, 'rq'], [BISHOP, 'bq']
    ];
    for (const [dirs, set] of rays) {
      for (const [df, dr] of dirs) {
        let nf = f + df, nr = r + dr;
        while (onBoard(nf, nr)) {
          const p = board[nr * 8 + nf];
          if (p) {
            if (colorOf(p) === by && set.includes(p.toLowerCase())) return true;
            break;
          }
          nf += df; nr += dr;
        }
      }
    }
    return false;
  }

  function kingSquare(board, color) {
    const k = color === 'w' ? 'K' : 'k';
    for (let i = 0; i < 64; i++) if (board[i] === k) return i;
    return -1;
  }

  function inCheck(st, color) {
    color = color || st.turn;
    const ks = kingSquare(st.board, color);
    if (ks < 0) return false;
    return attacked(st.board, ks, color === 'w' ? 'b' : 'w');
  }

  // Generate pseudo-legal moves, then filter by king safety.
  function generateMoves(st, opts = {}) {
    const raw = [];
    const us = st.turn, them = us === 'w' ? 'b' : 'w';
    const b = st.board;

    const push = (from, to, extra = {}) => {
      const target = b[to];
      if (target && colorOf(target) === us) return;
      if (b[from].toLowerCase() === 'p' && (rankOf(to) === 7 || rankOf(to) === 0)) {
        for (const promo of ['q', 'r', 'b', 'n']) {
          raw.push(Object.assign({ from, to, piece: b[from], captured: target || null, promotion: promo }, extra));
        }
      } else {
        raw.push(Object.assign({ from, to, piece: b[from], captured: target || null, promotion: null }, extra));
      }
    };

    const slide = (from, dirs) => {
      const f = fileOf(from), r = rankOf(from);
      for (const [df, dr] of dirs) {
        let nf = f + df, nr = r + dr;
        while (onBoard(nf, nr)) {
          const to = nr * 8 + nf;
          const t = b[to];
          if (!t) push(from, to);
          else { if (colorOf(t) === them) push(from, to); break; }
          nf += df; nr += dr;
        }
      }
    };

    for (let i = 0; i < 64; i++) {
      const p = b[i];
      if (!p || colorOf(p) !== us) continue;
      const type = p.toLowerCase();
      const f = fileOf(i), r = rankOf(i);
      if (type === 'p') {
        const dir = us === 'w' ? 1 : -1;
        const startRank = us === 'w' ? 1 : 6;
        const one = (r + dir) * 8 + f;
        if (onBoard(f, r + dir) && !b[one]) {
          push(i, one);
          const two = (r + 2 * dir) * 8 + f;
          if (r === startRank && !b[two]) push(i, two, { double: true });
        }
        for (const df of [-1, 1]) {
          const nf = f + df, nr = r + dir;
          if (!onBoard(nf, nr)) continue;
          const to = nr * 8 + nf;
          if (b[to] && colorOf(b[to]) === them) push(i, to);
          else if (to === st.ep) push(i, to, { enpassant: true, captured: us === 'w' ? 'p' : 'P' });
        }
      } else if (type === 'n') {
        for (const [df, dr] of KNIGHT) {
          const nf = f + df, nr = r + dr;
          if (onBoard(nf, nr)) push(i, nr * 8 + nf);
        }
      } else if (type === 'k') {
        for (const [df, dr] of KING) {
          const nf = f + df, nr = r + dr;
          if (onBoard(nf, nr)) push(i, nr * 8 + nf);
        }
      } else if (type === 'r') slide(i, ROOK);
      else if (type === 'b') slide(i, BISHOP);
      else if (type === 'q') slide(i, QUEEN);
    }

    // castling
    const rights = st.castling;
    const canCastle = us === 'w'
      ? (rights.wk || rights.wq)
      : (rights.bk || rights.bq);
    if (canCastle) {
      const ksq = kingSquare(b, us);
      const home = us === 'w' ? 4 : 60;
      const enemy = them;
      if (ksq === home && !attacked(b, home, enemy)) {
        const shortOk = us === 'w' ? rights.wk : rights.bk;
        const longOk = us === 'w' ? rights.wq : rights.bq;
        if (shortOk && !b[home + 1] && !b[home + 2] &&
            !attacked(b, home + 1, enemy) && !attacked(b, home + 2, enemy)) {
          raw.push({ from: home, to: home + 2, piece: b[home], captured: null, promotion: null, castle: 'k' });
        }
        if (longOk && !b[home - 1] && !b[home - 2] && !b[home - 3] &&
            !attacked(b, home - 1, enemy) && !attacked(b, home - 2, enemy)) {
          raw.push({ from: home, to: home - 2, piece: b[home], captured: null, promotion: null, castle: 'q' });
        }
      }
    }

    if (opts.pseudo) return raw;

    const legal = [];
    for (const m of raw) {
      const next = makeMove(st, m);
      if (!inCheck(next, us)) legal.push(m);
    }
    return legal;
  }

  function makeMove(st, m) {
    const b = st.board.slice();
    const us = st.turn, them = us === 'w' ? 'b' : 'w';
    const piece = b[m.from];
    const captured = m.captured !== undefined ? m.captured : b[m.to];

    b[m.to] = m.promotion
      ? (us === 'w' ? m.promotion.toUpperCase() : m.promotion)
      : piece;
    b[m.from] = null;

    if (m.enpassant) {
      const capSq = us === 'w' ? m.to - 8 : m.to + 8;
      b[capSq] = null;
    }
    if (m.castle) {
      const home = us === 'w' ? 4 : 60;
      if (m.castle === 'k') { b[home + 1] = b[home + 3]; b[home + 3] = null; }
      else { b[home - 1] = b[home - 4]; b[home - 4] = null; }
    }

    const castling = Object.assign({}, st.castling);
    const type = piece.toLowerCase();
    if (type === 'k') {
      if (us === 'w') { castling.wk = castling.wq = false; }
      else { castling.bk = castling.bq = false; }
    }
    // Squares: a1=0, h1=7, a8=56, h8=63
    if (type === 'r') {
      if (m.from === 0) castling.wq = false;
      if (m.from === 7) castling.wk = false;
      if (m.from === 56) castling.bq = false;
      if (m.from === 63) castling.bk = false;
    }
    if (m.to === 0) castling.wq = false;
    if (m.to === 7) castling.wk = false;
    if (m.to === 56) castling.bq = false;
    if (m.to === 63) castling.bk = false;

    let ep = null;
    if (type === 'p' && Math.abs(rankOf(m.to) - rankOf(m.from)) === 2) {
      ep = (m.from + m.to) / 2;
    }

    return {
      board: b,
      turn: them,
      castling,
      ep,
      half: (type === 'p' || captured) ? 0 : st.half + 1,
      full: us === 'b' ? st.full + 1 : st.full
    };
  }

  function insufficientMaterial(board) {
    const pieces = [];
    for (let i = 0; i < 64; i++) if (board[i]) pieces.push({ p: board[i], i });
    const nonKings = pieces.filter(x => x.p.toLowerCase() !== 'k');
    if (nonKings.length === 0) return true;
    if (nonKings.length === 1) {
      const t = nonKings[0].p.toLowerCase();
      if (t === 'b' || t === 'n') return true;
      if (t === 'p') {
        // lone pawn that can never promote (blocked or capturable by king)
        const f = fileOf(nonKings[0].i);
        return f === 0 || f === 7;
      }
    }
    if (nonKings.length === 2 && nonKings.every(x => x.p.toLowerCase() === 'b')) {
      const colors = nonKings.map(x => (fileOf(x.i) + rankOf(x.i)) % 2);
      return colors[0] === colors[1];
    }
    return false;
  }

  function getStatus(st, historyKeys) {
    const moves = generateMoves(st);
    const checked = inCheck(st);
    if (moves.length === 0) {
      if (checked) return { over: true, result: st.turn === 'w' ? '0-1' : '1-0', reason: 'checkmate', check: true };
      return { over: true, result: '1/2-1/2', reason: 'stalemate', check: false };
    }
    if (st.half >= 100) return { over: true, result: '1/2-1/2', reason: 'fifty-move', check: checked };
    if (insufficientMaterial(st.board)) return { over: true, result: '1/2-1/2', reason: 'insufficient material', check: checked };
    if (historyKeys) {
      const key = positionKey(st);
      let count = 0;
      for (const k of historyKeys) if (k === key) count++;
      if (count >= 2) return { over: true, result: '1/2-1/2', reason: 'threefold repetition', check: checked };
    }
    return { over: false, check: checked, moves: moves.length };
  }

  function moveToSAN(st, m) {
    const moves = generateMoves(st);
    if (m.castle) var san = m.castle === 'k' ? 'O-O' : 'O-O-O';
    else if (m.piece.toLowerCase() === 'p') {
      san = (m.captured ? 'abcdefgh'[fileOf(m.from)] + 'x' : '') + sqName(m.to);
      if (m.promotion) san += '=' + m.promotion.toUpperCase();
    } else {
      const letter = m.piece.toUpperCase();
      const rivals = moves.filter(x => x.piece === m.piece && x.to === m.to && x.from !== m.from);
      let dis = '';
      if (rivals.length) {
        const sameFile = rivals.some(x => fileOf(x.from) === fileOf(m.from));
        const sameRank = rivals.some(x => rankOf(x.from) === rankOf(m.from));
        if (!sameFile) dis = 'abcdefgh'[fileOf(m.from)];
        else if (!sameRank) dis = String(rankOf(m.from) + 1);
        else dis = sqName(m.from);
      }
      san = letter + dis + (m.captured ? 'x' : '') + sqName(m.to);
    }
    const next = makeMove(st, m);
    const st2 = getStatus(next);
    if (st2.reason === 'checkmate') san += '#';
    else if (inCheck(next)) san += '+';
    return san;
  }

  const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  return {
    START_FEN, parseFEN, toFEN, generateMoves, makeMove, inCheck, getStatus,
    attacked, kingSquare, moveToSAN, sqName, nameSq, fileOf, rankOf, colorOf, positionKey
  };
})();

if (typeof module !== 'undefined') module.exports = Chess;
