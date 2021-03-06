/**
 * This is a some kind of rewritten version of chess.js for custom requirements.
 * Original work: https://github.com/jhlywa/chess.js
 */
const _ = require('lodash');


/**
 * Constants
 */
const BLACK = 'b';
const WHITE = 'w';

const EMPTY = -1;

const PAWN = 'p';
const KNIGHT = 'n';
const BISHOP = 'b';
const ROOK = 'r';
const QUEEN = 'q';
const KING = 'k';

const SYMBOLS = 'pnbrqkPNBRQK';

const DEFAULT_POSITION = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const POSSIBLE_RESULTS = ['1-0', '0-1', '1/2-1/2', '*'];

const PAWN_OFFSETS = {
    b: [16, 32, 17, 15],
    w: [-16, -32, -17, -15]
};

const PIECE_OFFSETS = {
    n: [-18, -33, -31, -14, 18, 33, 31, 14],
    b: [-17, -15, 17, 15],
    r: [-16, 1, 16, -1],
    q: [-17, -16, -15, 1, 17, 16, 15, -1],
    k: [-17, -16, -15, 1, 17, 16, 15, -1]
};

const ATTACKS = [
    20, 0, 0, 0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 0, 20, 0,
    0, 20, 0, 0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 20, 0, 0,
    0, 0, 20, 0, 0, 0, 0, 24, 0, 0, 0, 0, 20, 0, 0, 0,
    0, 0, 0, 20, 0, 0, 0, 24, 0, 0, 0, 20, 0, 0, 0, 0,
    0, 0, 0, 0, 20, 0, 0, 24, 0, 0, 20, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 20, 2, 24, 2, 20, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 2, 53, 56, 53, 2, 0, 0, 0, 0, 0, 0,
    24, 24, 24, 24, 24, 24, 56, 0, 56, 24, 24, 24, 24, 24, 24, 0,
    0, 0, 0, 0, 0, 2, 53, 56, 53, 2, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 20, 2, 24, 2, 20, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 20, 0, 0, 24, 0, 0, 20, 0, 0, 0, 0, 0,
    0, 0, 0, 20, 0, 0, 0, 24, 0, 0, 0, 20, 0, 0, 0, 0,
    0, 0, 20, 0, 0, 0, 0, 24, 0, 0, 0, 0, 20, 0, 0, 0,
    0, 20, 0, 0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 20, 0, 0,
    20, 0, 0, 0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 0, 20
];

const RAYS = [
    17, 0, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 0, 15, 0,
    0, 17, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 15, 0, 0,
    0, 0, 17, 0, 0, 0, 0, 16, 0, 0, 0, 0, 15, 0, 0, 0,
    0, 0, 0, 17, 0, 0, 0, 16, 0, 0, 0, 15, 0, 0, 0, 0,
    0, 0, 0, 0, 17, 0, 0, 16, 0, 0, 15, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 17, 0, 16, 0, 15, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 17, 16, 15, 0, 0, 0, 0, 0, 0, 0,
    1, 1, 1, 1, 1, 1, 1, 0, -1, -1, -1, -1, -1, -1, -1, 0,
    0, 0, 0, 0, 0, 0, -15, -16, -17, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, -15, 0, -16, 0, -17, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, -15, 0, 0, -16, 0, 0, -17, 0, 0, 0, 0, 0,
    0, 0, 0, -15, 0, 0, 0, -16, 0, 0, 0, -17, 0, 0, 0, 0,
    0, 0, -15, 0, 0, 0, 0, -16, 0, 0, 0, 0, -17, 0, 0, 0,
    0, -15, 0, 0, 0, 0, 0, -16, 0, 0, 0, 0, 0, -17, 0, 0,
    -15, 0, 0, 0, 0, 0, 0, -16, 0, 0, 0, 0, 0, 0, -17
];

const SHIFTS = { p: 0, n: 1, b: 2, r: 3, q: 4, k: 5 };

const FLAGS = {
    NORMAL: 'n',
    CAPTURE: 'c',
    BIG_PAWN: 'b',
    EP_CAPTURE: 'e',
    PROMOTION: 'p',
    KSIDE_CASTLE: 'k',
    QSIDE_CASTLE: 'q'
};

const BITS = {
    NORMAL: 1,
    CAPTURE: 2,
    BIG_PAWN: 4,
    EP_CAPTURE: 8,
    PROMOTION: 16,
    KSIDE_CASTLE: 32,
    QSIDE_CASTLE: 64
};

const RANK_1 = 7;
const RANK_2 = 6;
const RANK_3 = 5;
const RANK_4 = 4;
const RANK_5 = 3;
const RANK_6 = 2;
const RANK_7 = 1;
const RANK_8 = 0;

const SQUARES = {
    a8: 0, b8: 1, c8: 2, d8: 3, e8: 4, f8: 5, g8: 6, h8: 7,
    a7: 16, b7: 17, c7: 18, d7: 19, e7: 20, f7: 21, g7: 22, h7: 23,
    a6: 32, b6: 33, c6: 34, d6: 35, e6: 36, f6: 37, g6: 38, h6: 39,
    a5: 48, b5: 49, c5: 50, d5: 51, e5: 52, f5: 53, g5: 54, h5: 55,
    a4: 64, b4: 65, c4: 66, d4: 67, e4: 68, f4: 69, g4: 70, h4: 71,
    a3: 80, b3: 81, c3: 82, d3: 83, e3: 84, f3: 85, g3: 86, h3: 87,
    a2: 96, b2: 97, c2: 98, d2: 99, e2: 100, f2: 101, g2: 102, h2: 103,
    a1: 112, b1: 113, c1: 114, d1: 115, e1: 116, f1: 117, g1: 118, h1: 119
};

const SQUARE_COLORS = [
    0, 1, 0, 1, 0, 1, 0, 1, 0,0,0,0,0,0,0,0,
    1, 0, 1, 0, 1, 0, 1, 0, 0,0,0,0,0,0,0,0,
    0, 1, 0, 1, 0, 1, 0, 1, 0,0,0,0,0,0,0,0,
    1, 0, 1, 0, 1, 0, 1, 0, 0,0,0,0,0,0,0,0,
    0, 1, 0, 1, 0, 1, 0, 1, 0,0,0,0,0,0,0,0,
    1, 0, 1, 0, 1, 0, 1, 0, 0,0,0,0,0,0,0,0,
    0, 1, 0, 1, 0, 1, 0, 1, 0,0,0,0,0,0,0,0,
    1, 0, 1, 0, 1, 0, 1, 0, 0,0,0,0,0,0,0,0,
];

const ROOKS = {
    w: [{ square: SQUARES.a1, flag: BITS.QSIDE_CASTLE },
    { square: SQUARES.h1, flag: BITS.KSIDE_CASTLE }],
    b: [{ square: SQUARES.a8, flag: BITS.QSIDE_CASTLE },
    { square: SQUARES.h8, flag: BITS.KSIDE_CASTLE }]
};

const V = {
    NORTH: -16,
    NN: -32,
    SOUTH: 16,
    SS: 32,
    EAST: 1,
    WEST: -1,
    NE: -15,
    SW: 15,
    NW: -17,
    SE: 17
};


/**
 * Helper functions
 */
// Horizontal row number
function rank(i) {
    return i >> 4;
}

// Vertical column number (0 => a, 1=> b, ...)
function file(i) {
    return i & 15;
}

function algebraic(i) {
    var f = file(i), r = rank(i);
    return 'abcdefgh'.substring(f, f + 1) + '87654321'.substring(r, r + 1);
}

function swap_color(c) {
    return c === WHITE ? BLACK : WHITE;
}

function is_digit(c) {
    return '0123456789'.indexOf(c) !== -1;
}

function validateSquare(square) {
    return rank(square) < 8 && file(square) < 8;
}


/**
 * Class
 */
class Chess2 {
    constructor() {
        this.clear();
        this.reset();
    }


    clear() {
        this.board = new Array(128);
        this.pieces = {
            [KING]: { [WHITE]: EMPTY, [BLACK]: EMPTY },
            [QUEEN]: { [WHITE]: [], [BLACK]: [] },
            [ROOK]: { [WHITE]: [], [BLACK]: [] },
            [BISHOP]: { [WHITE]: [], [BLACK]: [] },
            [KNIGHT]: { [WHITE]: [], [BLACK]: [] },
            [PAWN]: { [WHITE]: [], [BLACK]: [] }
        };
        this.turn = WHITE;
        this.castling = { [WHITE]: 0, [BLACK]: 0 };
        this.epSquare = EMPTY;
        this.halfMoves = 0;
        this.moveNumber = 1;
        this.history = [];
        this.squaresNearKing = {[WHITE]: [], [BLACK]: []};
        this.pawnControl = {[WHITE]: {}, [BLACK]: {}};
        this.pawnCountsByRank = {[WHITE]: [0,0,0,0,0,0,0,0], [BLACK]: [0,0,0,0,0,0,0,0]};
        this.pawnCountsByFile = {[WHITE]: [0,0,0,0,0,0,0,0], [BLACK]: [0,0,0,0,0,0,0,0]};
    }


    reset() {
        this.loadFen(DEFAULT_POSITION);
    }


    loadFen(fen) {
        const tokens = fen.split(/\s+/);
        const position = tokens[0];
        let square = 0;

        this.clear();

        for (let i = 0; i < position.length; i++) {
            const piece = position.charAt(i);

            if (piece === '/') {
                square += 8;
            } else if (is_digit(piece)) {
                square += parseInt(piece, 10);
            } else {
                const color = (piece < 'a') ? WHITE : BLACK;
                this.putPiece({ type: piece.toLowerCase(), color: color }, square);
                // this.putPiece({ type: piece.toLowerCase(), color: color }, algebraic(square));
                square++;
            }
        }

        this.turn = tokens[1];

        if (tokens[2].indexOf('K') > -1) {
            this.castling.w |= BITS.KSIDE_CASTLE;
        }
        if (tokens[2].indexOf('Q') > -1) {
            this.castling.w |= BITS.QSIDE_CASTLE;
        }
        if (tokens[2].indexOf('k') > -1) {
            this.castling.b |= BITS.KSIDE_CASTLE;
        }
        if (tokens[2].indexOf('q') > -1) {
            this.castling.b |= BITS.QSIDE_CASTLE;
        }

        this.epSquare = (tokens[3] === '-') ? EMPTY : SQUARES[tokens[3]];
        this.halfMoves = parseInt(tokens[4], 10);
        this.moveNumber = parseInt(tokens[5], 10);

        return true;
    }


    generateFen() {
        let empty = 0;
        let fen = '';

        for (let i = SQUARES.a8; i <= SQUARES.h1; i++) {
            if (this.board[i] == null) {
                empty++;
            } else {
                if (empty > 0) {
                    fen += empty;
                    empty = 0;
                }
                const color = this.board[i].color;
                const piece = this.board[i].type;

                fen += (color === WHITE) ?
                    piece.toUpperCase() : piece.toLowerCase();
            }

            if ((i + 1) & 0x88) {
                if (empty > 0) {
                    fen += empty;
                }

                if (i !== SQUARES.h1) {
                    fen += '/';
                }

                empty = 0;
                i += 8;
            }
        }

        let cflags = '';
        if (this.castling[WHITE] & BITS.KSIDE_CASTLE) { cflags += 'K'; }
        if (this.castling[WHITE] & BITS.QSIDE_CASTLE) { cflags += 'Q'; }
        if (this.castling[BLACK] & BITS.KSIDE_CASTLE) { cflags += 'k'; }
        if (this.castling[BLACK] & BITS.QSIDE_CASTLE) { cflags += 'q'; }

        /* do we have an empty castling flag? */
        cflags = cflags || '-';
        const epflags = (this.epSquare === EMPTY) ? '-' : algebraic(this.epSquare);

        return [fen, this.turn, cflags, epflags, this.halfMoves, this.moveNumber].join(' ');
    }


    getPiece(square) {
        return this.board[square];
        // const piece = this.board[square];
        // return piece ? { type: piece.type, color: piece.color } : null;
    }


    checkPiece(square, color, type) {
        const piece = this.getPiece(square);
        if (!piece) return false;
        return piece.color == color && piece.type == type;
    }


    putPiece(piece, square) {
        this.board[square] = piece;

        if (piece.type == KING) {
            this.pieces[KING][piece.color] = square;
            this.setSquaresNearKing(piece, square);
        } else {
            this.pieces[piece.type][piece.color].push(square);

            if (piece.type == PAWN) {
                this.addPawnControl(piece, square);
                this.addPawnCounts(piece, square);
            }
        }
    }


    removePiece(square) {
        const piece = this.getPiece(square);
        if (!piece) return;

        this.board[square] = null;

        if (piece.type == KING) {
            this.pieces[KING][piece.color] = EMPTY;
            this.squaresNearKing[piece.color] = [];
        } else {
            const pieces = this.pieces[piece.type][piece.color];
            const index = pieces.indexOf(square);
            pieces.splice(index, 1);

            if (piece.type == PAWN) {
                this.removePawnControl(piece, square);
                this.removePawnCounts(piece, square);
            }
        }
    }


    movePiece(from, to) {
        const piece = this.getPiece(from);
        if (!piece) return;

        this.board[from] = null;
        this.board[to] = piece;

        if (piece.type == KING) {
            this.pieces[KING][piece.color] = to;
            this.setSquaresNearKing(piece, to);
        } else {
            const pieces = this.pieces[piece.type][piece.color];
            const index = pieces.indexOf(from);
            pieces.splice(index, 1, to);

            if (piece.type == PAWN) {
                this.removePawnControl(piece, from);
                this.addPawnControl(piece, to);
                this.removePawnCounts(piece, from);
                this.addPawnCounts(piece, to);
            }
        }
    }


    forEachPiece(callback) {
        for (let i = SQUARES.a8; i <= SQUARES.h1; i++) {
            if (i & 0x88) { i += 7; continue; }

            const piece = this.getPiece(i);
            if (!piece) continue;
            callback(piece, i);
        }
    }


    setSquaresNearKing(piece, square) {
        // if (piece.type != KING) return;

        this.squaresNearKing[piece.color] = [
            square + V.NORTH,
            square + V.SOUTH,
            square + V.EAST,
            square + V.WEST,
            square + V.NW,
            square + V.NE,
            square + V.SW,
            square + V.SE
        ].concat(
            piece.color == WHITE ?
            [
                square + V.NN,
                square + V.NORTH + V.NE,
                square + V.NORTH + V.NW
            ] :
            [
                square + V.SS,
                square + V.SOUTH + V.SE,
                square + V.SOUTH + V.SW
            ]
        );
        //.filter(validateSquare); // Validation is so slow
    }


    addPawnControl(piece, square) {
        // if (piece.type != PAWN) return;

        const squares = [
            square + (piece.color == WHITE ? V.NE : V.SE),
            square + (piece.color == WHITE ? V.NW : V.SW)
        ];

        squares
            // .filter(validateSquare) // Validation is so slow
            .forEach(square => {
                if (this.pawnControl[piece.color][square] === undefined)
                    this.pawnControl[piece.color][square] = 0;

                this.pawnControl[piece.color][square]++;
            });
    }


    removePawnControl(piece, square) {
        // if (piece.type != PAWN) return;

        const squares = [
            square + (piece.color == 'w' ? V.NE : V.SE),
            square + (piece.color == 'w' ? V.NW : V.SW)
        ];

        squares
            // .filter(validateSquare)
            .forEach(square => {
                this.pawnControl[piece.color][square]--;

                if (this.pawnControl[piece.color][square] <= 0)
                    delete this.pawnControl[piece.color][square];
            });
    }


    addPawnCounts(piece, square) {
        this.pawnCountsByRank[piece.color][rank(square)]++;
        this.pawnCountsByFile[piece.color][file(square)]++;
    }


    removePawnCounts(piece, square) {
        this.pawnCountsByRank[piece.color][rank(square)]--;
        this.pawnCountsByFile[piece.color][file(square)]--;
    }


    /**
     * Builds move struct
     */
    buildMove(color, from, to, flags, promotion) {
        const move = {
            color: color,
            from: from,
            to: to,
            flags: flags,
            piece: this.board[from].type
        };

        if (promotion) {
            move.flags |= BITS.PROMOTION;
            move.promotion = promotion;
        }

        const pieceTo = this.board[to];

        if (pieceTo) {
            move.captured = pieceTo.type;
        } else if (flags & BITS.EP_CAPTURE) {
            move.captured = PAWN;
        }

        return move;
    }


    /**
     * Builds move struct and adds them in `moves` array.
     */
    addMove(moves, color, from, to, flags) {
        /* if pawn promotion */
        if (this.board[from].type === PAWN && (rank(to) === RANK_8 || rank(to) === RANK_1)) {
            [QUEEN, ROOK, BISHOP, KNIGHT].forEach(piece => {
                moves.push(this.buildMove(color, from, to, flags, piece));
            });
        } else {
            moves.push(this.buildMove(color, from, to, flags));
        }
    }


    generatePieceMoves(square) {
        const piece = this.getPiece(square);
        const moves = [];

        const us = piece.color;
        const them = swap_color(us);

        switch (piece.type) {
            case PAWN:
                // Forward, non-capturing
                const forwardSquare = square + PAWN_OFFSETS[us][0];
                if (this.board[forwardSquare] == null) {
                    this.addMove(moves, us, square, forwardSquare, BITS.NORMAL);

                    const doubleForwardSquare = square + PAWN_OFFSETS[us][1];
                    if ({b: RANK_7, w: RANK_2}[us] == rank(square) && this.board[doubleForwardSquare] == null) {
                        this.addMove(moves, us, square, doubleForwardSquare, BITS.BIG_PAWN);
                    }
                }

                // Capturing
                for (let j = 2; j < 4; j++) {
                    var targetSquare = square + PAWN_OFFSETS[us][j];
                    if (targetSquare & 0x88) continue;

                    if (this.board[targetSquare] != null && this.board[targetSquare].color == them) {
                        this.addMove(moves, us, square, targetSquare, BITS.CAPTURE);
                    } else if (targetSquare === this.epSquare) {
                        this.addMove(moves, us, square, this.epSquare, BITS.EP_CAPTURE);
                    }
                }
                break;

            case KING:
                if (this.castling[us] & BITS.KSIDE_CASTLE) {
                    const castling_from = this.pieces[KING][us];
                    const castling_to = castling_from + 2;

                    if (this.board[castling_from + 1] == null &&
                        this.board[castling_to] == null &&
                        !this.checkColorAttack(them, this.pieces[KING][us]) &&
                        !this.checkColorAttack(them, castling_from + 1) &&
                        !this.checkColorAttack(them, castling_to)) {
                        this.addMove(moves, us, this.pieces[KING][us], castling_to,
                            BITS.KSIDE_CASTLE);
                    }
                }

                /* queen-side castling */
                if (this.castling[us] & BITS.QSIDE_CASTLE) {
                    const castling_from = this.pieces[KING][us];
                    const castling_to = castling_from - 2;

                    if (this.board[castling_from - 1] == null &&
                        this.board[castling_from - 2] == null &&
                        this.board[castling_from - 3] == null &&
                        // TODO
                        !this.checkColorAttack(them, this.pieces[KING][us]) &&
                        !this.checkColorAttack(them, castling_from - 1) &&
                        !this.checkColorAttack(them, castling_to)) {
                        this.addMove(moves, us, this.pieces[KING][us], castling_to,
                            BITS.QSIDE_CASTLE);
                    }
                }
                // CAUTION: GOES DOWN!
                // break;

            default:
                for (let j = 0, len = PIECE_OFFSETS[piece.type].length; j < len; j++) {
                    const offset = PIECE_OFFSETS[piece.type][j];
                    let targetSquare = square;

                    while (true) {
                        targetSquare += offset;
                        if (targetSquare & 0x88) break;

                        if (this.board[targetSquare] == null) {
                            this.addMove(moves, us, square, targetSquare, BITS.NORMAL);
                        } else {
                            if (this.board[targetSquare].color == us) break;
                            this.addMove(moves, us, square, targetSquare, BITS.CAPTURE);
                            break;
                        }

                        /* break, if knight or king */
                        // if (piece.type === 'n' || piece.type === 'k') break;
                        if (piece.type === 'n' || piece.type == 'k') break;
                    }
                }
                break;
        }

        return moves;
    }


    generateAllTurnMoves() {
        let moves = [];

        this.forEachPiece((piece, square) => {
            if (piece.color != this.turn) return;
            moves = moves.concat(this.generatePieceMoves(square));
        });

        return moves.filter(move => {
            const us = this.turn;
            this.move(move);
            const valid = !this.isKingAttacked(us);
            this.undo();
            return valid;
        });
    }


    checkPieceAttack(pieceSquare, targetSquare) {
        const piece = this.getPiece(pieceSquare);
        const difference = pieceSquare - targetSquare;
        const index = difference + 119;

        if (ATTACKS[index] & (1 << SHIFTS[piece.type])) {
            if (piece.type === PAWN) {
                if (difference > 0) {
                    if (piece.color === WHITE) return true;
                } else {
                    if (piece.color === BLACK) return true;
                }

                return false;
            }

            /* if the piece is a knight or a king */
            if (piece.type === KNIGHT || piece.type === KING) return true;

            const offset = RAYS[index];
            let j = pieceSquare + offset;

            let blocked = false;
            while (j !== targetSquare) {
                if (this.board[j] != null) { blocked = true; break; }
                j += offset;
            }

            if (!blocked) return true;
        }

        return false;
    }


    checkColorAttack(color, targetSquare) {
        let rv = false;

        this.forEachPiece((piece, square) => {
            if (rv) return;
            if (piece.color != color) return;
            rv = rv || this.checkPieceAttack(square, targetSquare);
        });

        return rv;
    }


    /**
     * Is color's king attacked?
     */
    isKingAttacked(color) {
        return this.checkColorAttack(swap_color(color), this.pieces.k[color]);
    }


    isCheck() {
        return this.isKingAttacked(this.turn);
    }


    isCheckmate() {
        return this.isCheck() && this.generateAllTurnMoves().length == 0;
    }


    isStalemate() {
        return !this.isCheck() && this.generateAllTurnMoves().length == 0;
    }


    isInsufficientMaterial() {
        const counts = {
            p: this.pieces.p.w.length + this.pieces.p.b.length,
            n: this.pieces.n.w.length + this.pieces.n.b.length,
            b: this.pieces.b.w.length + this.pieces.b.b.length,
            r: this.pieces.r.w.length + this.pieces.r.b.length,
            q: this.pieces.q.w.length + this.pieces.q.b.length,
            k: 2
        };
        const totalCount = counts.p + counts.n + counts.b + counts.r + counts.q + counts.k;

        if (totalCount == 2)
            return true;

        if (totalCount == 3 && (counts.b == 1 || counts.n == 1))
            return true;

        if (totalCount == counts.b + 2) {
            const bishops = this.pieces.b.w.concat(this.pieces.b.b);
            const colorSum = bishops.reduce((sum, square) => {
                return sum + SQUARE_COLORS[square];
            }, 0);

            if (colorSum == 0 || colorSum == bishops.length)
                return true;
        }

        return false;
    }


    in_threefold_repetition() {
        // TODO
    }


    isDraw() {
        return this.isStalemate() || this.isInsufficientMaterial();
    }


    isGameOver() {
        return this.generateAllTurnMoves().length == 0 || this.isInsufficientMaterial();
    }


    pushHistory(move) {
        this.history.push({
            move: move,
            // pieces: _.cloneDeep(this.pieces),
            turn: this.turn,
            castling: { b: this.castling.b, w: this.castling.w },
            epSquare: this.epSquare,
            halfMoves: this.halfMoves,
            moveNumber: this.moveNumber
        });
    }


    move_(move) {
        const moves = this.generateAllTurnMoves();
        const found = _.find(moves, move_ => {
            return move_.from == move.from && move_.to == move.to;
        });
        if (!found) return false;
        return this.move(found);
    }


    move(move) {
        const piece = this.getPiece(move.from);
        if (!piece) return false;

        this.removePiece(move.to);
        this.movePiece(move.from, move.to);
        this.pushHistory(move);

        const us = this.turn;
        const them = swap_color(this.turn);

        /* if ep capture, remove the captured pawn */
        if (move.flags & BITS.EP_CAPTURE) {
            if (us === BLACK) {
                this.removePiece(move.to - 16);
            } else {
                this.removePiece(move.to + 16);
            }
        }

        /* if pawn promotion, replace with new piece */
        if (move.flags & BITS.PROMOTION) {
            this.removePiece(move.to);
            this.putPiece({ type: move.promotion, color: us }, move.to);
        }

        /* if we moved the king */
        if (piece.type === KING) {
            /* if we castled, move the rook next to the king */
            if (move.flags & BITS.KSIDE_CASTLE) {
                const castling_to = move.to - 1;
                const castling_from = move.to + 1;
                this.movePiece(castling_from, castling_to);
            } else if (move.flags & BITS.QSIDE_CASTLE) {
                const castling_to = move.to + 1;
                const castling_from = move.to - 2;
                this.movePiece(castling_from, castling_to);
            }

            /* turn off castling */
            this.castling[us] = '';
        }

        /* turn off castling if we move a rook */
        if (this.castling[us]) {
            const rooks = ROOKS[us];
            for (let i = 0, len = rooks.length; i < len; i++) {
                if (move.from === rooks[i].square && this.castling[us] & rooks[i].flag) {
                    this.castling[us] ^= rooks[i].flag;
                    break;
                }
            }
        }

        /* turn off castling if we capture a rook */
        if (this.castling[them]) {
            const rooks = ROOKS[them];
            for (let i = 0, len = rooks.length; i < len; i++) {
                if (move.to === rooks[i].square && this.castling[them] & rooks[i].flag) {
                    this.castling[them] ^= rooks[i].flag;
                    break;
                }
            }
        }

        /* if big pawn move, update the en passant square */
        if (move.flags & BITS.BIG_PAWN) {
            if (us === BLACK) {
                this.epSquare = move.to - 16;
            } else {
                this.epSquare = move.to + 16;
            }
        } else {
            this.epSquare = EMPTY;
        }

        /* reset the 50 move counter if a pawn is moved or a piece is captured */
        if (move.piece === PAWN) {
            this.halfMoves = 0;
        } else if (move.flags & (BITS.CAPTURE | BITS.EP_CAPTURE)) {
            this.halfMoves = 0;
        } else {
            this.halfMoves++;
        }

        if (us == BLACK) {
            this.moveNumber++;
        }

        this.turn = them;
        return true;
    }


    undo() {
        const old = this.history.pop();
        if (!old) return;

        const move = old.move;

        this.turn = old.turn;
        this.castling = old.castling;
        this.epSquare = old.epSquare;
        this.halfMoves = old.halfMoves;
        this.moveNumber = old.moveNumber;

        const us = this.turn;
        const them = swap_color(us);

        this.movePiece(move.to, move.from);

        if (move.flags & BITS.CAPTURE) {
            this.removePiece(move.to);
            this.putPiece({ type: move.captured, color: them }, move.to);
        }

        if (move.flags & BITS.EP_CAPTURE) {
            let index;

            if (us === BLACK) {
                index = move.to - 16;
            } else {
                index = move.to + 16;
            }

            this.putPiece({ type: PAWN, color: them }, index);
        }

        if (move.flags & BITS.PROMOTION) {
            this.removePiece(move.from);
            this.putPiece({ type: move.piece, color: us }, move.from);
        }

        if (move.flags & (BITS.KSIDE_CASTLE | BITS.QSIDE_CASTLE)) {
            let castling_to, castling_from;
            if (move.flags & BITS.KSIDE_CASTLE) {
                castling_to = move.to + 1;
                castling_from = move.to - 1;
            } else if (move.flags & BITS.QSIDE_CASTLE) {
                castling_to = move.to - 2;
                castling_from = move.to + 1;
            }

            this.movePiece(castling_from, castling_to);
        }
    }


    ascii() {
        let s = '   +------------------------+\n';
        for (let i = SQUARES.a8; i <= SQUARES.h1; i++) {
            /* display the rank */
            if (file(i) === 0) {
                s += ' ' + '87654321'[rank(i)] + ' |';
            }

            /* empty piece */
            if (this.board[i] == null) {
                s += ' . ';
            } else {
                const piece = this.board[i].type;
                const color = this.board[i].color;
                const symbol = (color === WHITE) ? piece.toUpperCase() : piece.toLowerCase();
                s += ' ' + symbol + ' ';
            }

            if ((i + 1) & 0x88) {
                s += '|\n';
                i += 8;
            }
        }
        s += '   +------------------------+\n';
        s += '     a  b  c  d  e  f  g  h\n';

        return s;
    }
}


/**
 * Statics
 */
Chess2.SQUARES = SQUARES;
Chess2.SQUARE_COLORS = SQUARE_COLORS;
Chess2.rank = rank;
Chess2.file = file;
Chess2.swap_color = swap_color;
Chess2.validateSquare = validateSquare;
Chess2.algebraic = algebraic;


if (typeof module !== 'undefined') module.exports = Chess2;

