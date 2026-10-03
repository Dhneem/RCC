/* Interactive chessboard component.
   new Board(container, { orientation, onSquare(idx) })
   board.render(state, { selected, targets, lastMove, check, hint, frozen })
   board.promote(color, cb)  — shows the underpromotion chooser */
class Board {
  constructor(container, opts = {}) {
    this.el = container;
    this.opts = opts;
    this.orientation = opts.orientation || 'w';
    this.onSquare = opts.onSquare || (() => {});
    this.el.classList.add('chessboard');
    this.el.addEventListener('click', e => {
      const sq = e.target.closest('.sq');
      if (sq && !this.el.classList.contains('frozen')) this.onSquare(+sq.dataset.idx);
    });
    this.render(null, {});
  }

  setOrientation(o) {
    if (this.orientation === o) return;
    this.orientation = o;
    this.render(this._lastState, this._lastUi);
  }

  render(state, ui = {}) {
    this._lastState = state;
    this._lastUi = ui;
    const flipped = this.orientation === 'b';
    this.el.innerHTML = '';
    this.el.classList.toggle('frozen', !!ui.frozen);
    if (!state) return;

    const targets = ui.targets || new Map();
    const marks = new Set(ui.marks || []);

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const rank = flipped ? row : 7 - row;
        const file = flipped ? 7 - col : col;
        const idx = rank * 8 + file;

        const sq = document.createElement('div');
        sq.className = 'sq ' + ((rank + file) % 2 ? 'light' : 'dark');
        sq.dataset.idx = idx;
        sq.dataset.square = Chess.sqName(idx);

        if (ui.lastMove && (ui.lastMove[0] === idx || ui.lastMove[1] === idx)) sq.classList.add('last');
        if (ui.selected === idx) sq.classList.add('sel');
        if (ui.check === idx) sq.classList.add('check');
        if (ui.hint === idx) sq.classList.add('hint');
        if (marks.has(idx)) sq.classList.add('mark');

        // coordinates on the edge squares
        if (col === 0) {
          const c = document.createElement('span');
          c.className = 'coord rank';
          c.textContent = rank + 1;
          sq.appendChild(c);
        }
        if (row === 7) {
          const c = document.createElement('span');
          c.className = 'coord file';
          c.textContent = 'abcdefgh'[file];
          sq.appendChild(c);
        }

        const piece = state.board[idx];
        if (piece) {
          const span = document.createElement('span');
          span.className = 'piece ' + (Chess.colorOf(piece) === 'w' ? 'w' : 'b');
          span.textContent = Board.GLYPHS[piece.toLowerCase()];
          span.dataset.piece = piece;
          sq.appendChild(span);
        }

        if (targets.has(idx)) {
          const dot = document.createElement('span');
          dot.className = targets.get(idx) ? 'dot cap' : 'dot';
          sq.appendChild(dot);
        }

        this.el.appendChild(sq);
      }
    }
  }

  // Returns the square element for a board index (for small effects).
  square(idx) {
    return this.el.querySelector(`.sq[data-idx="${idx}"]`);
  }

  shake() {
    this.el.classList.remove('shake');
    void this.el.offsetWidth;
    this.el.classList.add('shake');
  }

  celebrate(idx) {
    const sq = this.square(idx);
    if (sq) { sq.classList.remove('pop'); void sq.offsetWidth; sq.classList.add('pop'); }
  }

  promote(color, cb) {
    const overlay = document.createElement('div');
    overlay.className = 'promo';
    const box = document.createElement('div');
    box.className = 'promo-box';
    const label = document.createElement('div');
    label.className = 'promo-label';
    label.textContent = typeof I18n !== 'undefined' ? I18n.t('promo.label') : 'Promote to';
    box.appendChild(label);
    const row = document.createElement('div');
    row.className = 'promo-row';
    ['q', 'r', 'b', 'n'].forEach(p => {
      const btn = document.createElement('button');
      btn.className = 'promo-btn ' + (color === 'w' ? 'w' : 'b');
      btn.textContent = Board.GLYPHS[p];
      btn.addEventListener('click', () => { overlay.remove(); cb(p); });
      row.appendChild(btn);
    });
    box.appendChild(row);
    overlay.appendChild(box);
    this.el.appendChild(overlay);
  }
}

Board.GLYPHS = {
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟'
};
