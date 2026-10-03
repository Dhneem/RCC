/* Simple negamax engine for "Play" mode.
   Bot.pick(state, level) -> move   (level: 1 beginner, 2 club, 3 master) */
const Bot = (() => {
  const VAL = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };
  const MATE = 100000;

  // Piece-square tables from White's visual perspective (a8 first row).
  const PST = {
    p: [
       0,  0,  0,  0,  0,  0,  0,  0,
      50, 50, 50, 50, 50, 50, 50, 50,
      10, 10, 20, 30, 30, 20, 10, 10,
       5,  5, 10, 25, 25, 10,  5,  5,
       0,  0,  0, 20, 20,  0,  0,  0,
       5, -5,-10,  0,  0,-10, -5,  5,
       5, 10, 10,-20,-20, 10, 10,  5,
       0,  0,  0,  0,  0,  0,  0,  0],
    n: [
     -50,-40,-30,-30,-30,-30,-40,-50,
     -40,-20,  0,  0,  0,  0,-20,-40,
     -30,  0, 10, 15, 15, 10,  0,-30,
     -30,  5, 15, 20, 20, 15,  5,-30,
     -30,  0, 15, 20, 20, 15,  0,-30,
     -30,  5, 10, 15, 15, 10,  5,-30,
     -40,-20,  0,  5,  5,  0,-20,-40,
     -50,-40,-30,-30,-30,-30,-40,-50],
    b: [
     -20,-10,-10,-10,-10,-10,-10,-20,
     -10,  0,  0,  0,  0,  0,  0,-10,
     -10,  0,  5, 10, 10,  5,  0,-10,
     -10,  5,  5, 10, 10,  5,  5,-10,
     -10,  0, 10, 10, 10, 10,  0,-10,
     -10, 10, 10, 10, 10, 10, 10,-10,
     -10,  5,  0,  0,  0,  0,  5,-10,
     -20,-10,-10,-10,-10,-10,-10,-20],
    r: [
       0,  0,  0,  0,  0,  0,  0,  0,
       5, 10, 10, 10, 10, 10, 10,  5,
      -5,  0,  0,  0,  0,  0,  0, -5,
      -5,  0,  0,  0,  0,  0,  0, -5,
      -5,  0,  0,  0,  0,  0,  0, -5,
      -5,  0,  0,  0,  0,  0,  0, -5,
      -5,  0,  0,  0,  0,  0,  0, -5,
       0,  0,  0,  5,  5,  0,  0,  0],
    q: [
     -20,-10,-10, -5, -5,-10,-10,-20,
     -10,  0,  0,  0,  0,  0,  0,-10,
     -10,  0,  5,  5,  5,  5,  0,-10,
      -5,  0,  5,  5,  5,  5,  0, -5,
       0,  0,  5,  5,  5,  5,  0, -5,
     -10,  5,  5,  5,  5,  5,  0,-10,
     -10,  0,  5,  0,  0,  0,  0,-10,
     -20,-10,-10, -5, -5,-10,-10,-20],
    k: [
     -30,-40,-40,-50,-50,-40,-40,-30,
     -30,-40,-40,-50,-50,-40,-40,-30,
     -30,-40,-40,-50,-50,-40,-40,-30,
     -30,-40,-40,-50,-50,-40,-40,-30,
     -20,-30,-30,-40,-40,-30,-30,-20,
     -10,-20,-20,-20,-20,-20,-20,-10,
      20, 20,  0,  0,  0,  0, 20, 20,
      20, 30, 10,  0,  0, 10, 30, 20]
  };

  function evaluate(st) {
    let score = 0;
    for (let i = 0; i < 64; i++) {
      const p = st.board[i];
      if (!p) continue;
      const white = p === p.toUpperCase();
      const type = p.toLowerCase();
      const rank = i >> 3, file = i & 7;
      // visual index: white pieces use rank-from-top, black pieces mirrored
      const vi = white ? (7 - rank) * 8 + file : rank * 8 + file;
      const v = VAL[type] + PST[type][vi];
      score += white ? v : -v;
    }
    return st.turn === 'w' ? score : -score;
  }

  function orderMoves(moves) {
    return moves
      .map(m => {
        let s = 0;
        if (m.captured) s += 10 * VAL[m.captured.toLowerCase()] - VAL[m.piece.toLowerCase()];
        if (m.promotion) s += VAL[m.promotion];
        return { m, s };
      })
      .sort((a, b) => b.s - a.s)
      .map(x => x.m);
  }

  function quiesce(st, alpha, beta, ply) {
    const stand = evaluate(st);
    if (stand >= beta) return beta;
    if (stand > alpha) alpha = stand;
    if (ply > 6) return alpha;
    const caps = orderMoves(Chess.generateMoves(st).filter(m => m.captured));
    for (const m of caps) {
      const score = -quiesce(Chess.makeMove(st, m), -beta, -alpha, ply + 1);
      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }
    return alpha;
  }

  function negamax(st, depth, alpha, beta, ply, stats) {
    const moves = Chess.generateMoves(st);
    if (moves.length === 0) {
      return Chess.inCheck(st) ? -MATE + ply : 0;
    }
    if (depth <= 0) return quiesce(st, alpha, beta, 0);
    stats.nodes++;
    if (stats.nodes > stats.cap) return evaluate(st);
    for (const m of orderMoves(moves)) {
      const score = -negamax(Chess.makeMove(st, m), depth - 1, -beta, -alpha, ply + 1, stats);
      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }
    return alpha;
  }

  function pick(state, level = 2) {
    const depth = level >= 3 ? 3 : level === 2 ? 2 : 1;
    const noise = level === 1 ? 45 : level === 2 ? 15 : 5;
    const stats = { nodes: 0, cap: level >= 3 ? 900000 : 250000 };
    const moves = orderMoves(Chess.generateMoves(state));
    if (!moves.length) return null;

    let best = -Infinity;
    let bestMoves = [];
    for (const m of moves) {
      const score = -negamax(Chess.makeMove(state, m), depth - 1, -Infinity, Infinity, 1, stats)
        + Math.floor(Math.random() * noise);
      if (score > best) { best = score; bestMoves = [m]; }
      else if (score === best) bestMoves.push(m);
    }
    return bestMoves[Math.floor(Math.random() * bestMoves.length)];
  }

  return { pick, evaluate };
})();

if (typeof module !== 'undefined') module.exports = Bot;
