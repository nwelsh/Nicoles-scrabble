import { useState } from "react";
import { View, Button, Text } from "react-native";
import Board from "./components/Board";
import Rack from "./components/Rack";
import { scoreWordWithMultipliers, getMultiplier } from "./utils/game";
import { StyleSheet } from "react-native";
import { createTileBag, drawTiles } from "./components/Bag";
import { useEffect } from "react";

const BOARD_SIZE = 15;
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Alerts
// place letter over letters
// only let the multipliers work once
// Valid words
// multiplayer

const createBoard = () =>
  Array.from({ length: 15 }, (_, row) =>
    Array.from({ length: 15 }, (_, col) => ({
      letter: "",
      multiplier: getMultiplier(row, col),
    }))
  );

const getRandomLetter = () =>
  LETTERS[Math.floor(Math.random() * LETTERS.length)];

const createRack = () => Array.from({ length: 7 }, () => getRandomLetter());
const BASE_URL = "http://127.0.0.1:3000"; // <-- add this

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

  const [previewScore, setPreviewScore] = useState(0);

  useEffect(() => {
    calculatePreview();
  }, [placedTiles, board]);

  const calculatePreview = () => {
    if (placedTiles.length === 0) {
      setPreviewScore(0);
      return;
    }

    const direction = getDirection(placedTiles);
    if (!direction) {
      setPreviewScore(0);
      return;
    }

    const main = getMainWord(board, placedTiles);
    const crosses = getCrossWords(board, placedTiles, direction);

    const allWords = [main, ...crosses];

    const total = allWords.reduce(
      (sum, w) => sum + scoreWordWithMultipliers(w.tiles, board),
      0
    );

    setPreviewScore(total);
  };

  const getCrossWords = (board, placedTiles, direction) => {
    const crossDirection =
      direction === "horizontal" ? "vertical" : "horizontal";

    const words = [];

    placedTiles.forEach((tile) => {
      const result = getWordFromBoard(
        board,
        tile.row,
        tile.col,
        crossDirection
      );

      if (result.word.length > 1) {
        words.push(result);
      }
    });

    return words;
  };

  const getDirection = (tiles) => {
    if (tiles.length < 2) return "horizontal";

    const sameRow = tiles.every((t) => t.row === tiles[0].row);
    const sameCol = tiles.every((t) => t.col === tiles[0].col);

    if (sameRow) return "horizontal";
    if (sameCol) return "vertical";

    return null; // invalid placement
  };

  const getMainWord = (board, placedTiles) => {
    const direction = getDirection(placedTiles);
    if (!direction) return null;

    const first = placedTiles[0];

    return getWordFromBoard(board, first.row, first.col, direction);
  };

  const getWordFromBoard = (board, startRow, startCol, direction) => {
    let word = "";
    let tiles = [];

    let r = startRow;
    let c = startCol;

    // ⬅️ move to beginning of word
    while (r >= 0 && c >= 0 && board[r]?.[c]?.letter) {
      if (direction === "horizontal") c--;
      else r--;
    }

    // step forward once (we went too far)
    if (direction === "horizontal") c++;
    else r++;

    // ➡️ build word forward
    while (r < 15 && c < 15 && board[r]?.[c]?.letter) {
      word += board[r][c].letter;

      tiles.push({
        row: r,
        col: c,
        letter: board[r][c].letter,
      });

      if (direction === "horizontal") c++;
      else r++;
    }

    return { word, tiles };
  };

  const clearTurn = () => {
    // remove all placed tiles from board
    setBoard((prev) =>
      prev.map((row, r) =>
        row.map((cell, c) => {
          const wasPlaced = placedTiles.find((t) => t.row === r && t.col === c);

          return wasPlaced ? { ...cell, letter: "" } : cell;
        })
      )
    );

    // return all tiles to rack
    setGameState((prev) => ({
      ...prev,
      rack: [
        ...prev.rack,
        ...placedTiles.map((t) => ({ letter: t.letter, value: 0 })),
      ],
    }));

    // reset
    setPlacedTiles([]);
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

  const undoLastTile = () => {
    if (placedTiles.length === 0) return;

    const last = placedTiles[placedTiles.length - 1];

    // remove from board
    setBoard((prev) =>
      prev.map((row, r) =>
        row.map((cell, c) =>
          r === last.row && c === last.col ? { ...cell, letter: "" } : cell
        )
      )
    );

    // return tile to rack
    setGameState((prev) => ({
      ...prev,
      rack: [...prev.rack, { letter: last.letter, value: 0 }],
    }));

    // remove from placedTiles
    setPlacedTiles((prev) => prev.slice(0, -1));
  };

  const submitWord = async () => {
    if (placedTiles.length === 0) return;

    const direction = getDirection(placedTiles);
    if (!direction) {
      alert("Tiles must be in a straight line");
      return;
    }

    const main = getMainWord(board, placedTiles);
    const crosses = getCrossWords(board, placedTiles, direction);

    const allWords = [main, ...crosses];

    try {
      // validate all words
      const results = await Promise.all(
        allWords.map((w) =>
          fetch(`${BASE_URL}/validate?word=${w.word}`).then((res) => res.json())
        )
      );

      const allValid = results.every((r) => r.valid);

      if (!allValid) {
        alert("Invalid word detected");
        return;
      }

      // ✅ scoring
      const totalScore = allWords.reduce(
        (sum, w) => sum + scoreWordWithMultipliers(w.tiles, board),
        0
      );

      setScore((prev) => prev + totalScore);

      refillRack();
      setPlacedTiles([]);

      alert(`✅ +${totalScore}`);
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

      <Text style={{ textAlign: "center", marginTop: 10 }}>
        Preview: {previewScore} pts
      </Text>
      <Button title="Submit Word" onPress={submitWord} />
      <Button title="Undo" onPress={undoLastTile} />
      <Button title="Clear" onPress={clearTurn} />
    </View>
  );
}

const styles = StyleSheet.create({ main: { marginTop: 150 } });
