import { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { brandColors } from "@/constants/theme";
import {
  mockNearbyOfferings,
  mockNearbyRequests,
  type NearbyOfferingRide,
  type NearbyRequestingRide,
} from "@/data/mock/nearby-rides";

type TabId = "offering" | "requesting";

export default function RidesScreen() {
  const [activeTab, setActiveTab] = useState<TabId>("offering");

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={[
          brandColors.beige,
          brandColors.white,
          brandColors.white,
          brandColors.beige,
        ]}
        locations={[0, 0.15, 0.85, 1]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/evergreen_CLRlogo.png")}
              style={styles.logo}
              contentFit="contain"
            />
          </View>

          {/* Tabs */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "offering" && styles.tabActive]}
              onPress={() => setActiveTab("offering")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "offering" && styles.tabTextActive,
                ]}
              >
                Offering
              </Text>
              <View
                style={[
                  styles.tabBadge,
                  activeTab === "offering" && styles.tabBadgeActive,
                ]}
              >
                <Text
                  style={[
                    styles.tabBadgeText,
                    activeTab === "offering" && styles.tabBadgeTextActive,
                  ]}
                >
                  {mockNearbyOfferings.length}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "requesting" && styles.tabActive,
              ]}
              onPress={() => setActiveTab("requesting")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "requesting" && styles.tabTextActive,
                ]}
              >
                Requesting
              </Text>
              <View
                style={[
                  styles.tabBadge,
                  activeTab === "requesting" && styles.tabBadgeActive,
                ]}
              >
                <Text
                  style={[
                    styles.tabBadgeText,
                    activeTab === "requesting" && styles.tabBadgeTextActive,
                  ]}
                >
                  {mockNearbyRequests.length}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {activeTab === "offering" ? (
            <View style={styles.tabContent}>
              {mockNearbyOfferings.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No nearby offerings</Text>
                  <Text style={styles.emptySubtext}>
                    Check back later for ride offers!
                  </Text>
                </View>
              ) : (
                <View style={styles.list}>
                  {mockNearbyOfferings.map((ride) => (
                    <OfferingCard key={ride.id} ride={ride} />
                  ))}
                </View>
              )}
            </View>
          ) : (
            <View style={styles.tabContent}>
              {mockNearbyRequests.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No nearby requests</Text>
                  <Text style={styles.emptySubtext}>
                    Check back later for ride requests!
                  </Text>
                </View>
              ) : (
                <View style={styles.list}>
                  {mockNearbyRequests.map((ride) => (
                    <RequestingCard key={ride.id} ride={ride} />
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>

        <LinearGradient
          colors={["transparent", brandColors.white]}
          locations={[0, 1]}
          style={styles.fadeOverlay}
          pointerEvents="none"
        />
      </LinearGradient>
    </SafeAreaView>
  );
}

/** Seat row layout by vehicle size: [front], [middle], [back] */
const SEAT_LAYOUTS: Record<5 | 6 | 7 | 8, number[]> = {
  5: [2, 3],
  6: [2, 2, 2],
  7: [2, 3, 2],
  8: [2, 3, 3],
};

function SeatOverview({
  totalSeats,
  availableSeats,
}: {
  totalSeats: 5 | 6 | 7 | 8;
  availableSeats: number;
}) {
  const rows = SEAT_LAYOUTS[totalSeats];
  const takenCount = totalSeats - availableSeats - 1;
  let seatIndex = 0;
  const seatStatus: boolean[] = [];
  seatStatus[0] = false;
  for (let i = 0; i < totalSeats - 1; i++) {
    seatStatus.push(i >= takenCount);
  }

  let idx = 0;
  return (
    <View style={styles.seatOverview}>
      {rows.map((seatsInRow, rowIdx) => (
        <View
          key={rowIdx}
          style={[
            styles.seatRow,
            rowIdx === 0 && styles.seatRowFront,
          ]}
        >
          {Array.from({ length: seatsInRow }).map((_, colIdx) => {
            const isAvailable = seatStatus[idx];
            idx++;
            return (
              <View
                key={colIdx}
                style={[
                  styles.seat,
                  isAvailable ? styles.seatAvailable : styles.seatTaken,
                ]}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

function OfferingCard({ ride }: { ride: NearbyOfferingRide }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.milesAway}>{ride.milesAway} mi away</Text>
        <View style={styles.leavingBlock}>
          <Text style={styles.leavingLabel}>Leaving</Text>
          <Text style={styles.leavingTime}>{ride.departureTime}</Text>
        </View>
      </View>
      <View style={styles.rideRoute}>
        <View style={styles.routePoint}>
          <View style={[styles.dot, { backgroundColor: brandColors.primary }]} />
          <Text style={styles.locationText} numberOfLines={1}>
            {ride.origin ?? "—"}
          </Text>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routePoint}>
          <View style={[styles.dot, { backgroundColor: brandColors.dark }]} />
          <Text style={styles.locationText} numberOfLines={1}>
            {ride.destination}
          </Text>
        </View>
      </View>
      <View style={styles.cardMeta}>
        <Text style={styles.driverText}>{ride.driverName}</Text>
      </View>
      <View style={styles.seatsRow}>
        <Text style={styles.seatsLabel}>
          {ride.availableSeats} seat{ride.availableSeats === 1 ? "" : "s"}{" "}
          available
        </Text>
        <SeatOverview
          totalSeats={ride.totalSeats}
          availableSeats={ride.availableSeats}
        />
      </View>
    </View>
  );
}

function RequestingCard({ ride }: { ride: NearbyRequestingRide }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.milesAway}>{ride.milesAway} mi away</Text>
        <View style={styles.leavingBlock}>
          <Text style={styles.leavingLabel}>Leaving</Text>
          <Text style={styles.leavingTime}>{ride.requestedFor}</Text>
        </View>
      </View>
      <View style={styles.rideRoute}>
        <View style={styles.routePoint}>
          <View style={[styles.dot, { backgroundColor: brandColors.primary }]} />
          <Text style={styles.locationText} numberOfLines={1}>
            {ride.origin ?? "—"}
          </Text>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routePoint}>
          <View style={[styles.dot, { backgroundColor: brandColors.dark }]} />
          <Text style={styles.locationText} numberOfLines={1}>
            {ride.destination}
          </Text>
        </View>
      </View>
      <View style={styles.cardMeta}>
        <Text style={styles.requesterText}>{ride.requesterName}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  logo: {
    width: 240,
    height: 80,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: brandColors.white,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: brandColors.beige,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    gap: 6,
  },
  tabActive: {
    backgroundColor: brandColors.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600",
    color: brandColors.dark,
  },
  tabTextActive: {
    color: brandColors.white,
  },
  tabBadge: {
    backgroundColor: brandColors.dark,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  tabBadgeActive: {
    backgroundColor: brandColors.dark,
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: brandColors.white,
  },
  tabBadgeTextActive: {
    color: brandColors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  tabContent: {
    flex: 1,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: brandColors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: brandColors.beige,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  leavingBlock: {
    alignItems: "flex-end",
  },
  leavingLabel: {
    fontSize: 12,
    color: brandColors.beige,
    marginBottom: 2,
  },
  leavingTime: {
    fontSize: 14,
    fontWeight: "600",
    color: brandColors.dark,
  },
  milesAway: {
    fontSize: 14,
    color: brandColors.dark,
  },
  rideRoute: {
    marginBottom: 12,
  },
  routePoint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  routeLine: {
    width: 2,
    height: 16,
    backgroundColor: brandColors.beige,
    marginLeft: 3,
    marginVertical: 4,
  },
  locationText: {
    fontSize: 15,
    color: brandColors.black,
    flex: 1,
  },
  cardMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  driverText: {
    fontSize: 14,
    color: brandColors.dark,
  },
  requesterText: {
    fontSize: 14,
    color: brandColors.dark,
  },
  seatsRow: {
    marginTop: 4,
    alignItems: "flex-start",
  },
  seatsLabel: {
    fontSize: 13,
    color: brandColors.dark,
    marginBottom: 8,
  },
  seatOverview: {
    alignSelf: "center",
  },
  seatRow: {
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    marginBottom: 4,
  },
  seatRowFront: {
    marginBottom: 6,
  },
  seat: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  seatAvailable: {
    backgroundColor: brandColors.primary,
  },
  seatTaken: {
    backgroundColor: brandColors.beige,
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: brandColors.beige,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: brandColors.beige,
    textAlign: "center",
  },
  fadeOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
});
