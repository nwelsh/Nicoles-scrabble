import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function Rack({ rack, onSelect }) {
  return (
    <View style={styles.rack}>
      {rack.map((letter, i) => (
        <TouchableOpacity key={i} onPress={() => onSelect(letter, i)}>
          <View style={styles.tile}>
            <Text>{letter}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  rack: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  tile: {
    width: 30,
    height: 30,
    borderWidth: 1,
    margin: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});