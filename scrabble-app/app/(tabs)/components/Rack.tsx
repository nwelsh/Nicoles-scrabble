import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function Rack({ rack, onSelect }) {
  return (
    <View style={styles.rack}>
      {rack.map((tile, i) => (
        <TouchableOpacity key={i} onPress={() => onSelect(tile, i)}>
          <View style={styles.tile}>
            <Text style={styles.letter}>{tile.letter}</Text>
            <Text style={styles.value}>{tile.value}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  rack: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  tile: {
    width: 30,
    height: 30,
    borderWidth: 1,
    margin: 4,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  letter: {
    fontSize: 12,
    fontWeight: "bold",
  },
  value: {
    position: "absolute",
    bottom: 1,
    right: 2,
    fontSize: 10,
  },
});
