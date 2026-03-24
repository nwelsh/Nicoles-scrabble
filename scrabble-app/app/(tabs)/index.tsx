import { useState } from "react";
import { View, Button, Text } from "react-native";
import Board from "./components/Board";
import Rack from "./components/Rack";
import { scoreWordWithMultipliers } from "./utils/game";
import { StyleSheet } from "react-native";
import { createTileBag, drawTiles } from "./components/Bag";

const BOARD_SIZE = 15;
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const getMultiplier = (row: number, col: number) => {
  if (row === 7 && col === 7) return 'DW'; // center

  if (
    (row === 0 && col === 0) ||
    (row === 0 && col === 14) ||
    (row === 14 && col === 0) ||
    (row === 14 && col === 14)
  ) return 'TW';

  if ((row === col) || (row + col === 14)) return 'DL';

  return undefined;
};

const createBoard = () =>
  Array.from({ length: 15 }, (_, row) =>
    Array.from({ length: 15 }, (_, col) => ({
      letter: '',
      multiplier: getMultiplier(row, col),
    }))
  );

const getRandomLetter = () =>
  LETTERS[Math.floor(Math.random() * LETTERS.length)];

const createRack = () => Array.from({ length: 7 }, () => getRandomLetter());
const BASE_URL = 'http://127.0.0.1:3000'; // <-- add this


export default function HomeScreen() {
  const [board, setBoard] = useState(createBoard());
  const [rack, setRack] = useState(createRack());
  const [selected, setSelected] = useState<{
    tile: { letter: string; value: number };
    index: number;
  } | null>(null);
  const [score, setScore] = useState(0);

  const [placedTiles, setPlacedTiles] = useState<
    { row: number; col: number; letter: string }[]
  >([]);

  const handleCellPress = (row: number, col: number) => {
    if (!selected) return;

    const newBoard = [...board];

    // ✅ FIX: use selected.tile.letter
    newBoard[row][col].letter = selected.tile.letter;

    setBoard(newBoard);

    // track placed tile
    setPlacedTiles((prev) => [
      ...prev,
      {
        row,
        col,
        letter: selected.tile.letter,
      },
    ]);

    // remove from rack
    setGameState((prev) => {
      const newRack = [...prev.rack];
      newRack.splice(selected.index, 1);

      return {
        ...prev,
        rack: newRack,
      };
    });

    setSelected(null);
  };

  const getPlacedWord = () => {
    if (placedTiles.length === 0) return "";

    // sort by column (horizontal word)
    const sorted = [...placedTiles].sort((a, b) => a.col - b.col);

    return sorted.map((t) => t.letter).join("");
  };

  const [gameState, setGameState] = useState(() => {
    const bag = createTileBag();
    const { drawn, remaining } = drawTiles(bag, 7);

    return {
      tileBag: remaining,
      rack: drawn,
    };
  });

  const refillRack = () => {
    setGameState((prev) => {
      const tilesNeeded = 7 - prev.rack.length;
      const { drawn, remaining } = drawTiles(prev.tileBag, tilesNeeded);

      return {
        tileBag: remaining,
        rack: [...prev.rack, ...drawn],
      };
    });
  };

 

  const submitWord = async () => {
    const word = getPlacedWord();

    if (!word) {
      alert("No word placed");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/validate?word=${word}`);
      const data = await res.json();

      if (data.valid) {
        const points = scoreWordWithMultipliers(placedTiles, board);

        setScore((prev) => prev + points);

        // ✅ REFILL HERE
        refillRack();

        // clear turn
        setPlacedTiles([]);

        alert(`✅ ${word} +${points}`);
      } else {
        alert(`❌ ${word} is not valid`);

        // (optional next step: return tiles to rack)
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
    }
  };

  return (
    <View style={styles.main}>
      <Text>Score: {score}</Text>

      <Board board={board} onCellPress={handleCellPress} />
      <Rack
        rack={gameState.rack}
        onSelect={(tile, index) => setSelected({ tile, index })}
      />

      <Button title="Submit Word" onPress={submitWord} />
    </View>
  );
}

const styles = StyleSheet.create({ main: { marginTop: 150 } });
