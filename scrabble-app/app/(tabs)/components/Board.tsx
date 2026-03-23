import { View, StyleSheet } from 'react-native';
import Cell from './Cell';

export default function Board({ board, onCellPress }) {
  return (
    <View style={styles.board}>
      {board.map((row, r) => (
        <View key={r} style={styles.row}>
          {row.map((cell, c) => (
            <Cell
              key={c}
              letter={cell.letter}
              onPress={() => onCellPress(r, c)}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: { alignSelf: 'center', marginTop: 40 },
  row: { flexDirection: 'row' },
});