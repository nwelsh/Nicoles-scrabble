import { useState } from "react";
import { View, Button, Text } from "react-native";
import Board from "./components/Board";
import Rack from "./components/Rack";
import { scoreWord } from "./utils/game";
import { StyleSheet } from "react-native";

const BOARD_SIZE = 15;
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const createBoard = () =>
  Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => ({ letter: "" }))
  );

const getRandomLetter = () =>
  LETTERS[Math.floor(Math.random() * LETTERS.length)];

const createRack = () => Array.from({ length: 7 }, () => getRandomLetter());

export default function HomeScreen() {
  const [board, setBoard] = useState(createBoard());
  const [rack, setRack] = useState(createRack());
  const [selected, setSelected] = useState<{
    letter: string;
    index: number;
  } | null>(null);
  const [score, setScore] = useState(0);

  const [placedTiles, setPlacedTiles] = useState<
  { row: number; col: number; letter: string }[]
>([]);

  const handleCellPress = (row: number, col: number) => {
  if (!selected) return;

  const newBoard = [...board];
  newBoard[row][col].letter = selected.letter;
  setBoard(newBoard);

  // track placed tile
  setPlacedTiles(prev => [
    ...prev,
    { row, col, letter: selected.letter }
  ]);

  // remove from rack
  const newRack = [...rack];
  newRack.splice(selected.index, 1);
  setRack(newRack);

  setSelected(null);
};

  const getPlacedWord = () => {
  if (placedTiles.length === 0) return '';

  // sort by column (horizontal word)
  const sorted = [...placedTiles].sort((a, b) => a.col - b.col);

  return sorted.map(t => t.letter).join('');
};

  const submitWord = async () => {
  const word = getPlacedWord();

  if (!word) {
    alert('No word placed');
    return;
  }

  try {
    const res = await fetch(
      `http://10.0.0.121:3000/validate?word=${word}`
    );

    const data = await res.json();

    if (data.valid) {
      const points = scoreWord(word);
      setScore(prev => prev + points);

      alert(`✅ ${word} is valid! +${points}`);

      // clear placed tiles after successful turn
      setPlacedTiles([]);
    } else {
      alert(`❌ ${word} is not valid`);
    }
  } catch (err) {
    console.error(err);
    alert('Error connecting to server');
  }
};

  return (
    <View style={styles.main}>
      <Text>Score: {score}</Text>

      <Board board={board} onCellPress={handleCellPress} />

      <Rack
        rack={rack}
        onSelect={(letter: string, index: number) =>
          setSelected({ letter, index })
        }
      />

      <Button title="Submit Word" onPress={submitWord} />
    </View>
  );
}

const styles = StyleSheet.create({ main: { marginTop: 150 } });
