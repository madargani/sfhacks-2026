import { StyleSheet, View, Text } from "react-native";

export default function SquadScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Squad</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
  },
});
