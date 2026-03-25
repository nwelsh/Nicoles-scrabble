export const LETTER_SCORES: Record<string, number> = {
  A: 1, B: 3, C: 3, D: 2, E: 1,
  F: 4, G: 2, H: 4, I: 1, J: 8,
  K: 5, L: 1, M: 3, N: 1, O: 1,
  P: 3, Q: 10, R: 1, S: 1, T: 1,
  U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10
};

const BOARD_LAYOUT: (null | 'DL' | 'TL' | 'DW' | 'TW')[][] = [
  ['TW', null, null, 'DL', null, null, null, 'TW', null, null, null, 'DL', null, null, 'TW'],
  [null, 'DW', null, null, null, 'TL', null, null, null, 'TL', null, null, null, 'DW', null],
  [null, null, 'DW', null, null, null, 'DL', null, 'DL', null, null, null, 'DW', null, null],
  ['DL', null, null, 'DW', null, null, null, 'DL', null, null, null, 'DW', null, null, 'DL'],
  [null, null, null, null, 'DW', null, null, null, null, null, 'DW', null, null, null, null],
  [null, 'TL', null, null, null, 'TL', null, null, null, 'TL', null, null, null, 'TL', null],
  [null, null, 'DL', null, null, null, 'DL', null, 'DL', null, null, null, 'DL', null, null],
  ['TW', null, null, 'DL', null, null, null, 'DW', null, null, null, 'DL', null, null, 'TW'],
  [null, null, 'DL', null, null, null, 'DL', null, 'DL', null, null, null, 'DL', null, null],
  [null, 'TL', null, null, null, 'TL', null, null, null, 'TL', null, null, null, 'TL', null],
  [null, null, null, null, 'DW', null, null, null, null, null, 'DW', null, null, null, null],
  ['DL', null, null, 'DW', null, null, null, 'DL', null, null, null, 'DW', null, null, 'DL'],
  [null, null, 'DW', null, null, null, 'DL', null, 'DL', null, null, null, 'DW', null, null],
  [null, 'DW', null, null, null, 'TL', null, null, null, 'TL', null, null, null, 'DW', null],
  ['TW', null, null, 'DL', null, null, null, 'TW', null, null, null, 'DL', null, null, 'TW'],
];
  

export const TILE_DISTRIBUTION = [
  { letter: 'A', count: 9, value: 1 },
  { letter: 'B', count: 2, value: 3 },
  { letter: 'C', count: 2, value: 3 },
  { letter: 'D', count: 4, value: 2 },
  { letter: 'E', count: 12, value: 1 },
  { letter: 'F', count: 2, value: 4 },
  { letter: 'G', count: 3, value: 2 },
  { letter: 'H', count: 2, value: 4 },
  { letter: 'I', count: 9, value: 1 },
  { letter: 'J', count: 1, value: 8 },
  { letter: 'K', count: 1, value: 5 },
  { letter: 'L', count: 4, value: 1 },
  { letter: 'M', count: 2, value: 3 },
  { letter: 'N', count: 6, value: 1 },
  { letter: 'O', count: 8, value: 1 },
  { letter: 'P', count: 2, value: 3 },
  { letter: 'Q', count: 1, value: 10 },
  { letter: 'R', count: 6, value: 1 },
  { letter: 'S', count: 4, value: 1 },
  { letter: 'T', count: 6, value: 1 },
  { letter: 'U', count: 4, value: 1 },
  { letter: 'V', count: 2, value: 4 },
  { letter: 'W', count: 2, value: 4 },
  { letter: 'X', count: 1, value: 8 },
  { letter: 'Y', count: 2, value: 4 },
  { letter: 'Z', count: 1, value: 10 },
];

export const scoreWordWithMultipliers = (
  tiles,
  board,
  placedTiles
) => {
  let total = 0;
  let wordMultiplier = 1;

  const isPlaced = (row, col) =>
    placedTiles.some(t => t.row === row && t.col === col);

  tiles.forEach(({ row, col, letter }) => {
    const cell = board[row][col];
    const base = LETTER_SCORES[letter] || 0;

    if (isPlaced(row, col)) {
      // ✅ apply multipliers ONLY for new tiles
      if (cell.multiplier === 'DL') total += base * 2;
      else if (cell.multiplier === 'TL') total += base * 3;
      else total += base;

      if (cell.multiplier === 'DW') wordMultiplier *= 2;
      if (cell.multiplier === 'TW') wordMultiplier *= 3;
    } else {
      // ❌ old tiles → no multiplier
      total += base;
    }
  });

  return total * wordMultiplier;
};

export const getMultiplier = (row: number, col: number) => {
  return BOARD_LAYOUT[row][col];
};