import { StyleSheet, View, Text } from "react-native";

export default function RidesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rides</Text>
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
