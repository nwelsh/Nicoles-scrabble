import { TILE_DISTRIBUTION } from "../utils/game";

export const createTileBag = () => {
  const bag: { letter: string; value: number }[] = [];

  TILE_DISTRIBUTION.forEach(tile => {
    for (let i = 0; i < tile.count; i++) {
      bag.push({ letter: tile.letter, value: tile.value });
    }
  });

  return shuffle(bag);
};

const shuffle = (array: any[]) => {
  return array.sort(() => Math.random() - 0.5);
};

export const drawTiles = (bag: any, count: number) => {
  const drawn = bag.slice(0, count);
  const remaining = bag.slice(count);

  return { drawn, remaining };
};