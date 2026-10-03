/* Course content: guided lessons + tactical puzzles.
   Moves are coordinate strings, e.g. 'e2e4' (from + to).
   Task shapes: { moves: [...], require?: 'check'|'mate', highlight?: 'e5' } */
const Course = {
  lessons: [
    {
      id: 'pieces',
      title: 'Meet the Pieces',
      icon: '♞',
      blurb: 'How each piece moves — and how far it can go.',
      steps: [
        {
          type: 'read',
          title: 'The board and the squares',
          body: [
            'Chess is played on an 8×8 board of 64 squares. Files are the vertical rows, lettered a to h. Ranks are the horizontal rows, numbered 1 to 8. Every square has a name — the square where the white queen starts is d1, and h8 is the top-right corner from White\'s point of view.',
            'White always moves first, and the players alternate turns. A piece may move to a square only if that square is empty or holds an enemy piece (a capture). Your own pieces block you.',
            'Below is the starting position. Click any piece to see where it can move.'
          ],
          fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
          freeExplore: true
        },
        {
          type: 'task',
          title: 'The rook moves in straight lines',
          body: [
            'The rook slides any number of squares along a rank or file — but it cannot jump over pieces. Rooks are strongest on open files, where they sweep the whole board.'
          ],
          fen: '4k3/8/8/8/8/8/8/R3K3 w - - 0 1',
          task: { moves: ['a1a5'], highlight: 'a5' },
          coach: 'Nice slide! The rook travelled four squares in one move — it can go as far as it likes in a straight line.'
        },
        {
          type: 'task',
          title: 'The bishop moves diagonally',
          body: [
            'The bishop slides along diagonals. Like the rook it cannot jump. Each bishop is tied to one colour of square for the whole game — this bishop lives on the light squares.'
          ],
          fen: '4k3/8/8/8/8/8/8/2B1K3 w - - 0 1',
          task: { moves: ['c1g5'], highlight: 'g5' },
          coach: 'Exactly — four diagonal squares. Notice the bishop never changed square colour.'
        },
        {
          type: 'task',
          title: 'The queen combines both',
          body: [
            'The queen is the strongest piece: it slides like a rook and like a bishop at once — any number of squares horizontally, vertically or diagonally. It still cannot jump.'
          ],
          fen: '4k3/8/8/8/8/8/8/3QK3 w - - 0 1',
          task: { moves: ['d1h5'], highlight: 'h5' },
          coach: 'The queen swept across the board in one move. Don\'t bring her out too early in a real game, though — she can be chased around by weaker pieces.'
        },
        {
          type: 'task',
          title: 'The knight jumps',
          body: [
            'The knight is the only piece that jumps: it moves in an L-shape — two squares in one direction, then one sideways. It lands on the opposite colour from where it started, and friendly pieces never block it.'
          ],
          fen: '4k3/8/8/8/8/8/8/1N2K3 w - - 0 1',
          task: { moves: ['b1c3'], highlight: 'c3' },
          coach: 'The knight leapt straight over everything. From b1 it could also have gone to a3 or d2 — but c3 is the classic developing square.'
        },
        {
          type: 'task',
          title: 'The king steps one square',
          body: [
            'The king moves exactly one square in any direction. It is the most important piece — losing it loses the game — so it must never move onto a square attacked by an enemy piece.',
            'There is one special king move you\'ll learn later: castling.'
          ],
          fen: '4k3/8/8/8/8/8/8/4K3 w - - 0 1',
          task: { moves: ['e1e2'], highlight: 'e2' },
          coach: 'One square, any direction. The king cannot move next to the enemy king, which is why e2 is safe here.'
        },
        {
          type: 'task',
          title: 'Pawns advance, but capture sideways',
          body: [
            'Pawns are the soul of chess. They move one square straight forward — or two squares from their starting square — but they capture one square diagonally forward. A pawn can never move backwards.',
            'Advance the pawn two squares to e4, the most popular opening move in chess.'
          ],
          fen: '4k3/8/8/8/8/8/4P3/4K3 w - - 0 1',
          task: { moves: ['e2e4'], highlight: 'e4' },
          coach: 'e4! From its home rank a pawn may take the two-square leap, and it controls d5 and f5 as it goes.'
        },
        {
          type: 'task',
          title: 'Pawn capture',
          body: [
            'Pawns capture differently from how they move: one square diagonally forwards. The black pawn on d4 is attacked by our pawn on e3 — take it.'
          ],
          fen: '4k3/8/8/8/3p4/4P3/8/4K3 w - - 0 1',
          task: { moves: ['e3d4'], highlight: 'd4' },
          coach: 'Captured! Notice the pawn stayed on the same rank it moved to — pawns capture diagonally but never move sideways.'
        }
      ]
    },
    {
      id: 'checkmate',
      title: 'Check & Checkmate',
      icon: '♜',
      blurb: 'Give check, escape it — and deliver mate.',
      steps: [
        {
          type: 'read',
          title: 'What is check?',
          body: [
            'When a piece attacks the enemy king, the king is in check. The king may never stay in check: on the next move the player must escape by doing one of exactly three things — move the king, block the attack with another piece, or capture the attacking piece.',
            'If none of those are possible, the game is over: that is checkmate.'
          ],
          fen: '6k1/8/8/8/8/8/8/R5K1 w - - 0 1',
          freeExplore: true
        },
        {
          type: 'task',
          title: 'Give check along the file',
          body: [
            'The black king is on g8. Slide the white rook up to a8 to attack it along the 8th rank.'
          ],
          fen: '6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1',
          task: { moves: ['a1a8'], require: 'check', highlight: 'a8' },
          coach: 'Check! The rook attacks the whole rank, and the black king has nowhere on that rank to hide.'
        },
        {
          type: 'read',
          title: 'Checkmate ends the game',
          body: [
            'Checkmate is check that cannot be answered: the king is attacked and every escape square is covered, the check cannot be blocked, and the attacker cannot be captured.',
            'The pattern below is the back-rank mate. Black\'s own pawns imprison the king — only the rook\'s file is left.'
          ],
          fen: '6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1',
          freeExplore: true
        },
        {
          type: 'task',
          title: 'Deliver back-rank mate',
          body: [
            'Black\'s king is boxed in by its own pawns on f7, g7 and h7. One rook move ends the game.'
          ],
          fen: '6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1',
          task: { moves: ['a1a8'], require: 'mate' },
          coach: 'Checkmate! The king cannot step to f8 or h8 (the rook covers the rank) and cannot take the rook. This is the back-rank mate — watch out for it in your own games!'
        },
        {
          type: 'task',
          title: 'Escaping check',
          body: [
            'Now you\'re on the defending side. Black is in check from the rook on a8. Look at the three ways out: move the king, block, or capture.',
            'The knight on d7 can interpose on b8 or f8, and the king can step to h7. Play any one of those moves.'
          ],
          fen: 'R5k1/3n1pp1/8/8/8/8/8/6K1 b - - 0 1',
          task: { moves: ['g8h7', 'd7b8', 'd7f8'] },
          coach: 'Well done — three legal escapes, all of them stop the check. In a game you\'d choose the one that also improves your position.'
        },
        {
          type: 'quiz',
          title: 'Stalemate',
          question: 'The player to move has no legal move, but their king is NOT in check. What is the result?',
          options: [
            'They lose — no moves means a loss',
            'Draw by stalemate',
            'The game continues until a piece is captured',
            'They may pass their turn'
          ],
          answer: 1,
          explain: 'No moves + no check = stalemate, and the game is drawn. It\'s a valuable resource when you are losing — and a heartbreaking blunder when you are winning!'
        },
        {
          type: 'quiz',
          title: 'Multiple choice',
          question: 'Which of these escapes a check?',
          options: [
            'Moving a different piece that does not block or capture',
            'Capturing one of your own pieces',
            'Blocking the line of attack with any piece',
            'Moving the king to a square attacked by an enemy piece'
          ],
          answer: 2,
          explain: 'Only three ways out: king moves to safety, the attack is blocked, or the attacker is captured. Anything else leaves the king in check and is illegal.'
        }
      ]
    },
    {
      id: 'tactics',
      title: 'Tactics: Forks & Pins',
      icon: '⚔',
      blurb: 'Double attacks, immobilised pieces, and winning material.',
      steps: [
        {
          type: 'read',
          title: 'What is a fork?',
          body: [
            'A fork is one piece attacking two enemy pieces at the same time. Since the opponent can only deal with one threat per move, something usually falls. Knights are the most dangerous forkers because they can attack two squares of the same colour at once — including the king and a valuable piece.',
            'Your mission: move the knight so it checks the king and attacks the queen in the same move.'
          ],
          fen: 'q3k3/8/8/1N6/8/8/8/4K3 w - - 0 1',
          freeExplore: true
        },
        {
          type: 'task',
          title: 'The royal knight fork',
          body: [
            'The black queen on a8 and king on e8 sit a knight\'s jump away from c7. Fork them.'
          ],
          fen: 'q3k3/8/8/1N6/8/8/8/4K3 w - - 0 1',
          task: { moves: ['b5c7'], require: 'check', highlight: 'c7' },
          coach: 'Nc7+! The king must move, and on the next move the knight takes the queen. A fork of king and queen is called a royal fork.'
        },
        {
          type: 'read',
          title: 'What is a pin?',
          body: [
            'A pin happens when an attacking piece aims at a valuable piece that sits directly behind a less valuable one — the piece in front cannot move away without exposing what is behind it.',
            'If the piece behind is the king, the pin is absolute: moving the pinned piece is simply illegal. If it\'s a queen or rook, the pin is relative — moving away is allowed, but usually costs material.'
          ],
          fen: '4k3/4n3/8/8/1B6/8/8/4R2K w - - 0 1',
          freeExplore: true
        },
        {
          type: 'task',
          title: 'Win the pinned piece',
          body: [
            'The black knight on e7 stands on the e-file directly in front of its king, with our rook behind it. The knight cannot move — and our bishop on b4 covers the capture square.',
            'Take the knight with the rook.'
          ],
          fen: '4k3/4n3/8/8/1B6/8/8/4R2K w - - 0 1',
          task: { moves: ['e1e7'], highlight: 'e7' },
          coach: 'Rxe7! The knight was absolute-pinned against its king, and the bishop protects the rook so the king cannot recapture. Free piece.'
        },
        {
          type: 'quiz',
          title: 'Pins in your own games',
          question: 'Your knight is absolutely pinned to your king by an enemy bishop. What happens if you move the knight anyway?',
          options: [
            'Nothing — the knight is allowed to move',
            'Your opponent may capture your king on the next move',
            'The move is illegal, because it would leave your king in check',
            'You lose only the knight'
          ],
          answer: 2,
          explain: 'An absolutely pinned piece cannot legally move: doing so would expose the king to attack, and you may never leave (or move into) check.'
        },
        {
          type: 'task',
          title: 'Grab the loose piece',
          body: [
            'Black left the rook on a8 completely undefended — and our queen attacks it along the diagonal. This is called a hanging piece.',
            'Win it.'
          ],
          fen: 'r6k/8/8/3Q4/8/8/8/6K1 w - - 0 1',
          task: { moves: ['d5a8'], require: 'check', highlight: 'a8' },
          coach: 'Qxa8+! Checks the king while taking the rook — a capture with tempo. Always scan for undefended pieces before anything else.'
        }
      ]
    },
    {
      id: 'openings',
      title: 'Opening Principles',
      icon: '♙',
      blurb: 'Four rules that carry you through the first ten moves.',
      steps: [
        {
          type: 'quiz',
          title: 'The centre',
          question: 'Why is controlling the central squares (d4, e4, d5, e5) so important in the opening?',
          options: [
            'Pieces in the centre attack the most squares and reach both wings quickly',
            'The centre squares count double in the final scoring',
            'Pawns in the centre cannot be captured',
            'The king is safest in the centre of the board'
          ],
          answer: 0,
          explain: 'A piece in the centre typically controls 8–13 squares instead of 4–5 on the edge. That\'s why moves like 1.e4 and 1.d4 dominate opening play.'
        },
        {
          type: 'task',
          title: 'Castle early',
          body: [
            'Your king in the centre is exposed to checks down the middle. Castling tucks it behind a wall of pawns and brings a rook into play at the same time — two goals with one move.',
            'The king moves two squares towards its rook, and the rook hops over. Castle kingside here.'
          ],
          fen: 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1',
          task: { moves: ['e1g1'], highlight: 'g1' },
          coach: 'O-O! The king is safe on g1 and the rook swings to f1, ready for the centre. A textbook first-plan in almost every opening.'
        },
        {
          type: 'quiz',
          title: 'Develop your pieces',
          question: 'It\'s move three. Which plan makes the most sense?',
          options: [
            'Move the same knight three times to chase a pawn',
            'Bring out knights and bishops, then castle',
            'Push the h-pawn to the end of the board',
            'Send the queen out early to grab a central pawn'
          ],
          answer: 1,
          explain: 'Develop every minor piece once, control the centre, and castle — then connect the rooks. Moving the same piece repeatedly loses time, and an early queen just gets chased around by weaker pieces.'
        },
        {
          type: 'quiz',
          title: 'King safety',
          question: 'Which early pawn move is usually a mistake in front of your own castled king?',
          options: [
            'Pushing the f-pawn two squares, opening the king\'s diagonal',
            'Pushing the a-pawn to gain space on the rim',
            'Recapturing a piece with a pawn',
            'Moving the d-pawn one square in the opening'
          ],
          answer: 0,
          explain: 'The f-pawn guards the king. Once it disappears, the e1–h4 diagonal and the e-file become highways for enemy pieces — a classic way to get mated.'
        },
        {
          type: 'read',
          title: 'Your opening checklist',
          body: [
            '1. Fight for the centre with pawns (e4/d4 or c4).',
            '2. Develop knights before bishops; don\'t move the same piece twice without a reason.',
            '3. Castle by move 10 — usually much earlier.',
            '4. Don\'t grab pawns with your queen while the opponent develops with tempo.',
            '5. Connect your rooks by clearing the back rank.'
          ],
          fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
          freeExplore: true
        }
      ]
    },
    {
      id: 'endgame',
      title: 'Endgames: Finishing the Game',
      icon: '♔',
      blurb: 'Activate the king, promote, and never stalemate when you\'re winning.',
      steps: [
        {
          type: 'read',
          title: 'Why the endgame matters',
          body: [
            'When the board empties, the game is not over — it is entering its most concrete phase. In the endgame every line can be calculated to its conclusion: either your pawn queens, or it doesn\'t.',
            'The biggest change is the king. In the opening it hides behind pawns; in the endgame it becomes a fighting piece. Below, both kings are ready to march to the centre. Click any piece to explore.'
          ],
          fen: '8/8/3k4/8/8/3K3P/8/8 w - - 0 1',
          freeExplore: true
        },
        {
          type: 'task',
          title: 'Activate your king',
          body: [
            'Both kings are still asleep in the corners. In the endgame you march your king towards the centre — squares like d3, e3 and d4 are the destinations.',
            'Take the first step: king a1 to b2.'
          ],
          fen: '8/8/8/3k4/8/8/8/K7 w - - 0 1',
          task: { moves: ['a1b2'], highlight: 'b2' },
          coach: 'Good — the king heads for the centre. In an endgame a king on b2 is worth far more than a king still cornered on a1.'
        },
        {
          type: 'task',
          title: 'Take the opposition',
          body: [
            'When the two kings stand with exactly one square between them they are in opposition. Because kings may never stand next to each other, the player who has to move must give way — so the side that does NOT have to move is the one who profits.',
            'White to move: step up to d3 and seize the direct opposition.'
          ],
          fen: '8/8/8/3k4/8/8/3K4/8 w - - 0 1',
          task: { moves: ['d2d3'], highlight: 'd3' },
          coach: 'Kd3! The kings face each other with only d4 between them. Black must step aside, and then the white king invades. Opposition is the single most important technique in king-and-pawn endgames.'
        },
        {
          type: 'read',
          title: 'Promotion: every pawn\'s dream',
          body: [
            'Any pawn that reaches the far rank becomes a queen, rook, bishop or knight — your choice. Almost every time, you take the queen.',
            'The a-pawn below is one step from glory. In the next step, push it and choose its new life.'
          ],
          fen: '8/P6k/8/8/8/8/7K/8 w - - 0 1',
          freeExplore: true
        },
        {
          type: 'task',
          title: 'Make the queen',
          body: [
            'Push the pawn from a7 to a8. The board will ask which piece you want — take the queen.'
          ],
          fen: '8/P6k/8/8/8/8/7K/8 w - - 0 1',
          task: { moves: ['a7a8'], highlight: 'a8' },
          coach: 'a8=Q! The humblest piece on the board became the strongest. This is why passed pawns are so precious — and why you must rush them forward.'
        },
        {
          type: 'task',
          title: 'Deliver the ladder mate',
          body: [
            'A queen and king against a lone king is a routine win — if you avoid stalemate on the way. Here the black king is already trapped on the back rank: your king on g6 covers g7 and h7.',
            'One queen move ends it: play Qb1 to b8.'
          ],
          fen: '7k/8/6K1/8/8/8/8/1Q6 w - - 0 1',
          task: { moves: ['b1b8'], require: 'mate', highlight: 'b8' },
          coach: 'Qb8#! The queen takes the whole 8th rank while your king covers the escape squares in front of it. Against a lone king this is the pattern you will use again and again.'
        },
        {
          type: 'quiz',
          title: 'The stalemate trap',
          question: 'You are winning easily and play Qg6. Your opponent, a lone black king on h8, suddenly has no legal move — but is not in check. What is the result?',
          options: [
            'You win — no moves means resignation',
            'Draw by stalemate',
            'You may capture the king next turn',
            'The game continues; they may pass their turn'
          ],
          answer: 1,
          explain: 'No legal moves + no check = stalemate, and the game is drawn. When you are winning, always ask \"does my opponent have a single legal move?\" before you release the queen — it is the classic way to throw away a won endgame.'
        },
        {
          type: 'quiz',
          title: 'Automatic draws',
          question: 'Which of these ends the game immediately as a draw, even though one side is much stronger?',
          options: [
            'Kings only, or a king plus a single bishop/knight versus a king',
            'Two rooks versus a lone king',
            'A queen versus a lone king',
            'A king and three pawns versus a lone king'
          ],
          answer: 0,
          explain: 'Insufficient material — if neither side can possibly force checkmate, the game is drawn on the spot. It is another reason to promote in time: material only counts if it can deliver mate.'
        }
      ]
    }
  ],

  puzzles: [
    {
      id: 'p1',
      fen: '6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1',
      theme: 'Back-rank mate',
      difficulty: 1,
      prompt: 'White to move. Find checkmate in one.',
      solution: ['a1a8'],
      mate: true,
      hint: 'Your rook owns the a-file — but the game is decided on the 8th rank.',
      explain: 'Ra8# — the classic back-rank mate. Black\'s own pawns on f7, g7, h7 block every escape, and f8/h8 are covered by the rook. Always keep a guard (or a Luft) in front of your castled king!'
    },
    {
      id: 'p2',
      fen: '6k1/5ppp/8/8/8/8/8/4Q1K1 w - - 0 1',
      theme: 'Queen mate',
      difficulty: 1,
      prompt: 'White to move. Find checkmate in one.',
      solution: ['e1e8'],
      mate: true,
      hint: 'The queen is already aiming at the 8th rank — all she needs is the king\'s file.',
      explain: 'Qe8# — the queen takes the back rank while the king\'s own pawns shut every door. The king cannot capture: there is nothing to capture, the queen is too far away.'
    },
    {
      id: 'p3',
      fen: 'q3k3/8/8/1N6/8/8/8/4K3 w - - 0 1',
      theme: 'Knight fork',
      difficulty: 1,
      prompt: 'White to move. Win material with a fork.',
      solution: ['b5c7'],
      hint: 'Look for a square that attacks the king and the queen at the same time.',
      explain: 'Nc7+! Royal fork — the king must step out of check, then the knight takes the queen on a8. Net: a whole queen for a knight tempo.'
    },
    {
      id: 'p4',
      fen: 'r6k/8/8/3Q4/8/8/8/6K1 w - - 0 1',
      theme: 'Hanging piece',
      difficulty: 1,
      prompt: 'White to move. Punish the undefended rook.',
      solution: ['d5a8'],
      hint: 'Scan for enemy pieces with no defender — the a8 rook has no friends.',
      explain: 'Qxa8+! The queen grabs the loose rook and gives check at the same time, so Black cannot even think about counterplay.'
    },
    {
      id: 'p5',
      fen: 'k7/8/8/8/2n1r3/3P4/8/6K1 w - - 0 1',
      theme: 'Pawn fork',
      difficulty: 2,
      prompt: 'White to move. Fork the knight and the rook with a pawn.',
      solution: ['d3e4', 'd3c4'],
      hint: 'Pawns capture diagonally — which two black pieces sit next to your pawn\'s diagonals?',
      explain: 'dxe4 wins the rook outright (the knight never attacked the pawn\'s landing square), while dxc4 takes the knight and allows Rxc4. The pawn fork is the cheapest fork in chess — one pawn versus a whole piece.'
    },
    {
      id: 'p6',
      fen: '8/6Q1/8/8/8/5K2/8/7k w - - 0 1',
      theme: 'Queen + king mate',
      difficulty: 2,
      prompt: 'White to move. Find checkmate in one.',
      solution: ['g7g2'],
      mate: true,
      hint: 'The queen needs a bodyguard — your king on f3 can defend her one square away.',
      explain: 'Qg2# — the queen lands directly in front of the enemy king, defended by the white king. g1 and h2 are both covered, and the lone king may not capture a protected piece.'
    },
    {
      id: 'p7',
      fen: '7k/R7/8/8/8/8/8/1R4K1 w - - 0 1',
      theme: 'Ladder mate',
      difficulty: 2,
      prompt: 'White to move. Mate with the two rooks.',
      solution: ['b1b8'],
      mate: true,
      hint: 'One rook already cuts off the 7th rank — put the other rook on the 8th.',
      explain: 'Rb8# — the ladder. The rook on a7 takes away g7 and h7, the rook on b8 delivers check on the 8th rank, and there is nothing left to interpose.'
    },
    {
      id: 'p8',
      fen: '8/P6k/8/8/8/8/7K/8 w - - 0 1',
      theme: 'Promotion',
      difficulty: 1,
      prompt: 'White to move. Make the pawn count.',
      solution: ['a7a8'],
      hint: 'A pawn on the 7th rank is one step from becoming a queen.',
      explain: 'a8=Q — promotion transforms the weakest piece into the strongest, and the new queen immediately dominates the board. Underpromotion to a knight is only useful to deliver a very specific check!'
    },
    {
      id: 'p9',
      fen: 'r5k1/5ppp/8/8/8/8/5PPP/6K1 b - - 0 1',
      theme: 'Back-rank mate (Black)',
      difficulty: 2,
      prompt: 'Black to move. Find checkmate in one.',
      solution: ['a8a1'],
      mate: true,
      hint: 'The same pattern — but now the white king is the one trapped behind its pawns.',
      explain: 'Ra1# — the mirror image of the back-rank mate. White\'s pawns on f2, g2, h2 seal the exit, and the rook owns the 1st rank.'
    },
    {
      id: 'p10',
      fen: '4k3/8/8/8/3n4/8/8/Q3K3 b - - 0 1',
      theme: 'Knight fork',
      difficulty: 3,
      prompt: 'Black to move. Win the queen with a knight fork.',
      solution: ['d4c2'],
      hint: 'Find the square where the knight attacks king and queen simultaneously.',
      explain: 'Nc2+! The knight forks the king on e1 and queen on a1. The king must flee, then Nxa1 — Black wins a queen for nothing.'
    },
    {
      id: 'p11',
      fen: '6rk/6pp/8/4N3/8/8/8/6K1 w - - 0 1',
      theme: 'Smothered mate',
      difficulty: 3,
      prompt: 'White to move. Find checkmate in one.',
      solution: ['e5f7'],
      mate: true,
      hint: 'The black king is buried alive behind its own rook and pawns. A knight jump to the right square ends it.',
      explain: 'Nf7# — the smothered mate. The king is completely wrapped in its own pieces, knight checks cannot be blocked, and no black piece can reach f7. This pattern (usually with the queen sacrificing first) appears constantly in real games.'
    },
    {
      id: 'p12',
      fen: 'r5k1/6pp/8/8/8/8/8/3Q2K1 w - - 0 1',
      theme: 'Double attack',
      difficulty: 3,
      prompt: 'White to move. Check the king — and win the rook.',
      solution: ['d1d5', 'd1d8'],
      hint: 'Find a queen move that checks along a diagonal or rank AND lands on the same line as the a8 rook.',
      explain: 'Qd5+ (or Qd8+) — a double attack: the check forces the king to move, and the queen simultaneously stares down the undefended rook on a8. King moves, Qxa8 wins a whole rook. Checks, captures and threats — in that order — is how every tactic is found.'
    },
    {
      id: 'p13',
      fen: 'r5k1/2P2ppp/8/8/8/8/6PP/2R3K1 w - - 0 1',
      theme: 'Mate in 2',
      difficulty: 2,
      prompt: 'White to move. Force checkmate in two.',
      solution: ['c7c8'],
      line: ['c7c8', 'a8c8', 'c1c8'],
      mateIn2: true,
      hint: 'The pawn is one square from glory — and your rook on c1 is already aiming at the promotion square.',
      explain: 'c8=Q+! Promotion with check, so Black must capture with Rxc8 — and then Rxc8# recaptures with mate. The rook on a8 was the only defender of the back rank; promoting lured it away from its post.'
    },
    {
      id: 'p14',
      fen: 'r6k/5p1p/8/7Q/8/8/4K1R1/4R3 w - - 0 1',
      theme: 'Mate in 2',
      difficulty: 3,
      prompt: 'White to move. Force checkmate in two.',
      solution: ['h5h7'],
      line: ['h5h7', 'h8h7', 'e1h1'],
      mateIn2: true,
      hint: 'Look at the h-file — the rook on e1 has a route to it. What could drag the king onto that file?',
      explain: 'Qxh7+!! A queen sacrifice drags the king to h7 — Kxh7 is forced, there is no other move. Then the rook slides e1–h1 with checkmate: it covers h6 and h8, while the rook on g2 takes away g6, g7 and g8.'
    },
    {
      id: 'p15',
      fen: '4r3/4k1r1/8/8/3n3q/8/5P1P/5R1K b - - 0 1',
      theme: 'Mate in 2 (Black)',
      difficulty: 3,
      prompt: 'Black to move. Force checkmate in two.',
      solution: ['h4h2'],
      line: ['h4h2', 'h1h2', 'e8h8'],
      mateIn2: true,
      hint: 'White\'s king hides behind two pawns with an open file right in front of it. The queen can knock the door down.',
      explain: 'Qxh2+!! The queen sacrifice on h2 is answered by Kxh2 — the only move, since g1, g2 and g3 are all covered by the rook on g7. Then Re8–h8# swings across: check down the h-file, f3 is covered by the knight, and White\'s own rook and pawn block f1 and f2.'
    },
    {
      id: 'p16',
      fen: '2r3k1/6pp/8/8/8/8/2p2PPP/R5K1 b - - 0 1',
      theme: 'Mate in 2 (Black)',
      difficulty: 2,
      prompt: 'Black to move. Force checkmate in two.',
      solution: ['c2c1'],
      line: ['c2c1', 'a1c1', 'c8c1'],
      mateIn2: true,
      hint: 'One square from promotion — and the white rook on a1 is the only piece that can answer.',
      explain: 'c1=Q+! Promotion with check forces Rxc1, and then Rxc1# — the mirror image of the promotion mate. Luring the rook off a1 into the capture is what makes the back rank fall.'
    }
  ]
};

if (typeof module !== 'undefined') module.exports = Course;
