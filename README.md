# Royal Chess Club

A free, dependency-free website for interactive chess learning. No build step, no
frameworks, no npm packages — just HTML, CSS and vanilla JavaScript.

## Run it

Either open `index.html` directly in a browser, or serve the folder (recommended):

```
node serve.js        # http://127.0.0.1:8080
node serve.js 3000   # custom port
```

## What's inside

| Feature | Description |
| --- | --- |
| **Guided lessons** | 5 lessons (pieces, check & mate, tactics, openings, endgames) where you play the moves on a real board; tasks, quizzes and coaching feedback. Progress is saved per step in `localStorage`. |
| **Tactics puzzles** | 16 hand-checked positions with hints, difficulty stars and streaks — back-rank mates, forks, pins, smothered mate, promotion, and four forced mate-in-two lines where the opponent's reply plays itself. |
| **Play the bot** | Three strengths (Beginner / Club / Master) powered by a from-scratch negamax + alpha-beta engine with quiescence search. |
| **Rules engine** | Legal move generation, castling, en passant, promotions, check/mate/stalemate, 50-move rule, threefold repetition, insufficient material, SAN. |
| **English + العربية** | Full bilingual UI and content: a 118-key dictionary (`js/i18n.js`) drives every interface string, and `js/content-ar.js` translates all 5 lessons and 16 puzzles. The language switch in the header flips `<html lang/dir>` — Arabic mode is fully RTL (logical CSS properties, mirrored layout) while the board itself stays left-to-right so squares never mirror. Your choice persists in `localStorage`. |

## Files

```
index.html        page shell (loads the scripts below in order)
css/style.css     responsive dark theme
js/chess.js       rules engine          (exported as Chess)
js/content.js     lessons + puzzles     (Course)
js/content-ar.js  Arabic overlay for all lessons + puzzles
js/i18n.js        bilingual dictionary + language switcher (I18n)
js/board.js       interactive board component
js/bot.js         search engine         (Bot)
js/app.js         app shell: views, flows, saved progress
serve.js          tiny static file server for local use
test/perft.js     perft validation vs official reference counts
test/content.test.js  lesson/puzzle content validation
test/i18n.test.js bilingual validation (key parity, RTL content, markup)
```

## Tests

```
node test/perft.js         # 24 assertions, 6 positions (start, Kiwipete, pos3–6)
node test/content.test.js  # 67 assertions over every lesson step and puzzle
node test/i18n.test.js     # en/ar dictionary parity, Arabic-script coverage of
                           # all 50 content units, index.html key wiring
node test/find-mate2.js    # dev helper: proves mate-in-2 claims (no mate in 1,
                           # every reply allows mate next move, line ends in mate)
```

All suites must pass: perft proves the move generator is correct, the content
test proves every taught move, quiz answer and puzzle solution is legal, every
claimed mate really is mate, and every "mate in two" is genuinely forced, and
the i18n test proves the two languages never drift apart.
