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
// multiplayer
// fix UI
// At least 2 letters need ot be placed
// multiple way words

type WordTile = {
  row: number;
  col: number;
  letter: string;
};

const createBoard = () =>
  Array.from({ length: 15 }, (_, row) =>
    Array.from({ length: 15 }, (_, col) => ({
      letter: "",
      value: 0,
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
  const [isValidMove, setIsValidMove] = useState(false);
  const [currentWordTiles, setCurrentWordTiles] = useState<WordTile[]>([]);

  const handleCellPress = (row: number, col: number) => {
    if (!selected) return;

    const newBoard = [...board];

    // ✅ FIX: use selected.tile.letter
    newBoard[row][col] = {
      ...newBoard[row][col],
      letter: selected.tile.letter,
      value: selected.tile.value,
    };

    setBoard(newBoard);

    // track placed tile
    setPlacedTiles((prev) => [
      ...prev,
      {
        row,
        col,
        letter: selected.tile.letter,
        value: selected.tile.value,
        tile: selected.tile,
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
      (sum, w) => sum + scoreWordWithMultipliers(w.tiles, board, placedTiles),
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

  const validatePlacement = (board, placedTiles) => {
    if (placedTiles.length === 0) {
      return "Place at least one tile";
    }

    const direction = getDirection(placedTiles);

    if (!direction) {
      return "Tiles must be in a straight line";
    }

    const firstMove = isFirstMove(board, placedTiles);

    if (firstMove) {
      if (!coversCenter(placedTiles)) {
        return "First word must cover center";
      }
    } else {
      if (!isConnected(board, placedTiles)) {
        return "Word must connect to existing tiles";
      }
    }

    if (!hasNoGaps(board, placedTiles, direction)) {
      return "No gaps allowed in word";
    }

    return null;
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

  const checkMoveValidity = async () => {
    if (placedTiles.length === 0) {
      setIsValidMove(false);
      return;
    }

    const placementError = validatePlacement(board, placedTiles);

    if (placementError) {
      setIsValidMove(false);
      return;
    }

    const direction = getDirection(placedTiles);

    if (!direction) {
      setCurrentWordTiles([]);
      return;
    }

    const main = getMainWord(board, placedTiles);

    setCurrentWordTiles(main?.tiles || []);
    const crosses = getCrossWords(board, placedTiles, direction);

    const allWords = [main, ...crosses];

    try {
      const results = await Promise.all(
        allWords.map((w) =>
          fetch(`${BASE_URL}/validate?word=${w.word}`).then((res) => res.json())
        )
      );

      const allValid = results.every((r) => r.valid);

      setIsValidMove(allValid);
    } catch (err) {
      console.error(err);
      setIsValidMove(false);
    }
  };

  useEffect(() => {
    checkMoveValidity();
  }, [placedTiles, board]);

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
  const isFirstMove = (board, placedTiles = []) => {
    return board.every((row, r) =>
      row.every((cell, c) => {
        const isNewTile = placedTiles.some((t) => t.row === r && t.col === c);

        return isNewTile || !cell.letter;
      })
    );
  };

  const coversCenter = (placedTiles) => {
    return placedTiles.some((t) => t.row === 7 && t.col === 7);
  };

  const direction = getDirection(placedTiles);

  if (!direction) {
    return "Tiles must be in a straight line";
  }

  const hasNoGaps = (board, placedTiles, direction) => {
    const sorted = [...placedTiles].sort((a, b) =>
      direction === "horizontal" ? a.col - b.col : a.row - b.row
    );

    const start = sorted[0];
    const end = sorted[sorted.length - 1];

    if (direction === "horizontal") {
      for (let c = start.col; c <= end.col; c++) {
        if (!board[start.row][c].letter) {
          return false;
        }
      }
    } else {
      for (let r = start.row; r <= end.row; r++) {
        if (!board[r][start.col].letter) {
          return false;
        }
      }
    }

    return true;
  };

  const isConnected = (board, placedTiles) => {
    return placedTiles.some(({ row, col }) => {
      const neighbors = [
        [row - 1, col],
        [row + 1, col],
        [row, col - 1],
        [row, col + 1],
      ];

      return neighbors.some(([r, c]) => {
        return (
          r >= 0 &&
          r < 15 &&
          c >= 0 &&
          c < 15 &&
          board[r][c].letter &&
          !placedTiles.some((t) => t.row === r && t.col === c)
        );
      });
    });
  };

  const submitWord = async () => {
    const error = validatePlacement(board, placedTiles);

    if (error) {
      alert(error);
      return;
    }

    const direction = getDirection(placedTiles);

    const main = getMainWord(board, placedTiles);
    const crosses = getCrossWords(board, placedTiles, direction);

    const allWords = [main, ...crosses];

    try {
      const results = await Promise.all(
        allWords.map((w) =>
          fetch(`${BASE_URL}/validate?word=${w.word}`).then((res) => res.json())
        )
      );

      // if (!results.every((r) => r.valid)) {
      //   alert("Invalid word");
      //   return;
      // }

      const totalScore = allWords.reduce(
        (sum, w) => sum + scoreWordWithMultipliers(w.tiles, board, placedTiles),
        0
      );

      setScore((prev) => prev + totalScore);

      refillRack();
      setPlacedTiles([]);

      // alert(`+${totalScore}`);
    } catch (err) {
      console.error(err);
      alert("Network error");
    }
  };

  return (
    <View style={styles.main}>
      <Text style={styles.score}>Total score: {score}</Text>

      <Board
        board={board}
        placedTiles={placedTiles}
        isValidMove={isValidMove}
        currentWordTiles={currentWordTiles}
        onCellPress={handleCellPress}
      />
      <Rack
        rack={gameState.rack}
        onSelect={(tile, index) => setSelected({ tile, index })}
      />
      {previewScore > 0 && (
        <Text style={{ textAlign: "center", marginTop: 10 }}>
          {previewScore} pts
        </Text>
      )}
      <View style={styles.buttonsContainer}>
        <View style={[styles.filledButton, { backgroundColor: isValidMove ? "#ae00b4" : "#aba3a3" }]}>
          <Button title="Submit Word" onPress={submitWord} color={"#FFF"} />
        </View>
        <View style={styles.button}>
          <Button title="Undo" onPress={undoLastTile} color={"#ae00b4"} />
        </View>
        <View style={styles.button}>
          <Button title="Clear" onPress={clearTurn} color={"#ae00b4"} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  main: { marginTop: 150 },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    gap: 10,
  },
  score: { textAlign: "center", fontSize: 18, fontWeight: "bold" },
  button: {
    borderWidth: 1,
    borderColor: "#ae00b4",
    borderRadius: 24,
    color: "white",
  },
  filledButton: {
    borderRadius: 24,
    paddingHorizontal: 10,
  },
});
