import { StyleSheet, View, Text, SafeAreaView, StatusBar } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { brandColors } from "@/constants/theme";

export default function RidesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={[brandColors.beige, brandColors.white, brandColors.white, brandColors.beige]}
        locations={[0, 0.15, 0.85, 1]}
        style={styles.gradient}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/evergreen_CLRlogo.png")}
            style={styles.logo}
            contentFit="contain"
          />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>Rides</Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 16,
  },
  logo: {
    width: 240,
    height: 80,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: brandColors.black,
  },
});
