import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function Cell({
  letter,
  multiplier,
  onPress,
  isInWord,
  isValidMove,
  wordTiles,
  row,
  col,
  value
}) {
  const getColor = (multiplier) => {
    switch (multiplier) {
      case "TW":
        return "#e80000";
      case "DW":
        return "#ff9999";
      case "TL":
        return "#023770";
      case "DL":
        return "#99ccff";
      default:
        return "#eee";
    }
  };

  const direction =
    wordTiles.length > 1 && wordTiles.every((t) => t.row === wordTiles[0].row)
      ? "horizontal"
      : "vertical";

  const isFirst = wordTiles[0]?.row === row && wordTiles[0]?.col === col;
  const isLast =
    wordTiles[wordTiles.length - 1]?.row === row &&
    wordTiles[wordTiles.length - 1]?.col === col;

  const borderColor = isValidMove ? "green" : "transparent";

  let borderStyle = {};

  if (isInWord) {
    if (direction === "horizontal") {
      borderStyle = {
        borderTopWidth: 2,
        borderBottomWidth: 2,
        borderLeftWidth: isFirst ? 2 : 0,
        borderRightWidth: isLast ? 2 : 0,
        borderColor,
      };
    } else {
      borderStyle = {
        borderLeftWidth: 2,
        borderRightWidth: 2,
        borderTopWidth: isFirst ? 2 : 0,
        borderBottomWidth: isLast ? 2 : 0,
        borderColor,
      };
    }
  }

  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={[
          styles.cell,
          { backgroundColor: getColor(multiplier) },
          borderStyle,
        ]}
      >
        <Text style={styles.letter}>{letter || ""}</Text>

        {!!letter && <Text style={styles.value}>{value}</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cell: {
    width: 22,
    height: 22,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  letter: {
    fontSize: 12,
    fontWeight: 'bold',
  },

  value: {
    position: 'absolute',
    bottom: 1,
    right: 2,
    fontSize: 6,
  },
});
