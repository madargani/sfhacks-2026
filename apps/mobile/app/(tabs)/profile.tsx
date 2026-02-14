import { StyleSheet, View, Text, ScrollView, SafeAreaView, StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { mockUserProfile } from "@/data/mock/profile";
import { brandColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const user = mockUserProfile;
  const initials = user.name.split(" ").map(n => n[0]).join("");

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={[brandColors.beige, brandColors.white, brandColors.white, brandColors.beige]}
        locations={[0, 0.15, 0.85, 1]}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <View style={styles.cameraIcon}>
                <Ionicons name="camera" size={16} color={brandColors.white} />
              </View>
            </View>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.memberSince}>Member since {user.memberSince}</Text>
          </View>

          {/* Info Cards */}
          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="mail-outline" size={20} color={brandColors.dark} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{user.email}</Text>
                </View>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={20} color={brandColors.dark} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Address</Text>
                  <Text style={styles.infoValue}>{user.address}</Text>
                  <Text style={styles.infoSubvalue}>{user.city}, {user.state} {user.zipCode}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Stats Section */}
          <Text style={styles.sectionTitle}>Your Impact</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="leaf" size={32} color={brandColors.primary} />
              <Text style={styles.statNumber}>{user.co2Saved}</Text>
              <Text style={styles.statUnit}>kg CO₂</Text>
              <Text style={styles.statLabel}>saved</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="car" size={32} color={brandColors.primary} />
              <Text style={styles.statNumber}>{user.totalDrives + user.totalRides}</Text>
              <Text style={styles.statUnit}>total trips</Text>
              <View style={styles.tripBreakdown}>
                <Text style={styles.statLabel}>{user.totalDrives} drives • {user.totalRides} rides</Text>
              </View>
            </View>
          </View>

          {/* History Section */}
          <View style={styles.historyCard}>
            <View style={styles.historyHeader}>
              <Ionicons name="time-outline" size={24} color={brandColors.white} />
              <Text style={styles.historyTitle}>Trip History</Text>
            </View>
            <View style={styles.historyStats}>
              <View style={styles.historyItem}>
                <Text style={styles.historyNumber}>{user.totalDrives}</Text>
                <Text style={styles.historyLabel}>Drives Given</Text>
              </View>
              <View style={styles.historyDivider} />
              <View style={styles.historyItem}>
                <Text style={styles.historyNumber}>{user.totalRides}</Text>
                <Text style={styles.historyLabel}>Rides Taken</Text>
              </View>
            </View>
          </View>
        </ScrollView>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: brandColors.dark,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "bold",
    color: brandColors.white,
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: brandColors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: brandColors.white,
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    color: brandColors.black,
  },
  memberSince: {
    fontSize: 14,
    color: brandColors.beige,
    marginTop: 4,
  },
  infoSection: {
    gap: 12,
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: brandColors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: brandColors.beige,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: brandColors.beige,
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    color: brandColors.black,
    fontWeight: "500",
  },
  infoSubvalue: {
    fontSize: 14,
    color: brandColors.dark,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: brandColors.black,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: brandColors.dark,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 36,
    fontWeight: "bold",
    color: brandColors.white,
    marginTop: 8,
  },
  statUnit: {
    fontSize: 14,
    color: brandColors.beige,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: brandColors.beige,
    marginTop: 2,
  },
  tripBreakdown: {
    marginTop: 4,
  },
  historyCard: {
    backgroundColor: brandColors.dark,
    borderRadius: 16,
    padding: 20,
  },
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: brandColors.white,
  },
  historyStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  historyItem: {
    alignItems: "center",
    flex: 1,
  },
  historyNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: brandColors.primary,
  },
  historyLabel: {
    fontSize: 14,
    color: brandColors.beige,
    marginTop: 4,
  },
  historyDivider: {
    width: 1,
    height: 50,
    backgroundColor: brandColors.beige,
    opacity: 0.3,
  },
});
