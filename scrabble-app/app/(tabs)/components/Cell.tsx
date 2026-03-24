import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function Cell({ letter, onPress }) {
// const getColor = (multiplier) => {
//   switch (multiplier) {
//     case 'TW': return '#ff4d4d';
//     case 'DW': return '#ff9999';
//     case 'TL': return '#4da6ff';
//     case 'DL': return '#99ccff';
//     default: return '#eee';
//   }
// };

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.cell}>
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