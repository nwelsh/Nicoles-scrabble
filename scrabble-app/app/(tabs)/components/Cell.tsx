import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function Cell({ letter, onPress, multiplier}) {
const getColor = (multiplier) => {
  switch (multiplier) {
    case 'TW': return '#e80000';
    case 'DW': return '#ff9999';
    case 'TL': return '#023770';
    case 'DL': return '#99ccff';
    default: return '#eee';
  }
};

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={[styles.cell, { backgroundColor: getColor(multiplier) }]}>
        <Text>{letter}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cell: {
    width: 22,
    height: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});