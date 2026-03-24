import { View, StyleSheet } from "react-native";
import Cell from "./Cell";

type Cell = {
  letter: string;
  multiplier?: "DL" | "TL" | "DW" | "TW";
};

export default function Board({ board, onCellPress }) {
  const getMultiplier = (row: number, col: number) => {
    if (row === 7 && col === 7) return "DW"; // center

    if (
      (row === 0 && col === 0) ||
      (row === 0 && col === 14) ||
      (row === 14 && col === 0) ||
      (row === 14 && col === 14)
    )
      return "TW";

    if (row === col || row + col === 14) return "DL";

    return undefined;
  };

  return (
    <View style={styles.board}>
      {board.map((row, r) => (
        <View key={r} style={styles.row}>
          {row.map((cell, c) => (
            <Cell
              key={c}
              letter={cell.letter}
              multiplier={cell.multiplier}
              onPress={() => onCellPress(r, c)}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

export const getMultiplier = (row: number, col: number) => {
  if (row === 7 && col === 7) return "DW"; // center

  if (
    (row === 0 && col === 0) ||
    (row === 0 && col === 14) ||
    (row === 14 && col === 0) ||
    (row === 14 && col === 14)
  )
    return "TW";

  if (row === col || row + col === 14) return "DL";

  return undefined;
};

const styles = StyleSheet.create({
  board: { alignSelf: "center", marginTop: 40 },
  row: { flexDirection: "row" },
});
