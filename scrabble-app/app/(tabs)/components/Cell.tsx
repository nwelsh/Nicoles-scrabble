import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function Cell({ letter, onPress }) {
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