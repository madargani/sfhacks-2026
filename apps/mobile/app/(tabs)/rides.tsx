import { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
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
import { OfferRideModal } from "@/components/offer-ride-modal";
import { CreateRideOffer, RideOffer } from "@evergreen/shared-types";
import { getApiData } from "@/services/api";

type TabId = "offering" | "requesting";

// Helper function to convert RideOffer to NearbyOfferingRide
const convertRideOfferToNearby = (offer: RideOffer): NearbyOfferingRide => {
  const departureDate = new Date(offer.dateTime);
  const now = new Date();
  
  // Format departure time
  let departureTime: string;
  const isToday = departureDate.toDateString() === now.toDateString();
  const isTomorrow = 
    new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString() === 
    departureDate.toDateString();
  
  if (isToday) {
    departureTime = departureDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  } else if (isTomorrow) {
    departureTime = `Tomorrow ${departureDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })}`;
  } else {
    departureTime = departureDate.toLocaleDateString('en-US', {
      weekday: 'short',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  // Estimate total seats (assuming small car if not specified)
  const totalSeats = Math.max(5, offer.availableSeats + 1) as 5 | 6 | 7 | 8;

  return {
    id: offer._id?.toString() || '',
    destination: offer.toLocation.address,
    origin: offer.fromLocation.address,
    milesAway: 0, // TODO: Calculate distance from user's location
    totalSeats,
    availableSeats: offer.availableSeats,
    driverName: 'Driver', // TODO: Populate from user data
    departureTime,
  };
};

export default function RidesScreen() {
  const [activeTab, setActiveTab] = useState<TabId>("offering");
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [rideOffers, setRideOffers] = useState<RideOffer[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch ride offers from backend on mount
  useEffect(() => {
    fetchRideOffers();
  }, []);

  // Refresh ride offers when screen is focused (e.g., after creating a ride on home screen)
  useFocusEffect(
    useCallback(() => {
      fetchRideOffers();
    }, [])
  );

  const fetchRideOffers = async () => {
    try {
      setIsLoading(true);
      const offers = await getApiData<RideOffer[]>("/api/v1/rides/offers");
      setRideOffers(offers);
    } catch (error) {
      console.error("Error fetching ride offers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRide = async (rideId: string) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/rides/offers/${rideId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete ride offer");
      }

      // Refresh the ride offers list
      await fetchRideOffers();
    } catch (error) {
      console.error("Error deleting ride offer:", error);
      alert("Failed to delete ride offer");
    }
  };

  const handleCreateRideOffer = async (rideOffer: CreateRideOffer) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/rides/offers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(rideOffer),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create ride offer");
      }

      // Refresh the ride offers list
      await fetchRideOffers();
      setShowOfferModal(false);
    } catch (error) {
      console.error("Error creating ride offer:", error);
      throw error;
    }
  };

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

          {/* Offer Ride Button */}
          <TouchableOpacity
            style={styles.offerButton}
            onPress={() => {
              console.log("Offer ride button pressed!");
              setShowOfferModal(true);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.offerButtonText}>+ Offer a Ride</Text>
          </TouchableOpacity>

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
                  {mockNearbyOfferings.length + rideOffers.length}
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
              {isLoading ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>Loading rides...</Text>
                </View>
              ) : mockNearbyOfferings.length === 0 && rideOffers.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No nearby offerings</Text>
                  <Text style={styles.emptySubtext}>
                    Be the first to offer a ride!
                  </Text>
                </View>
              ) : (
                <View style={styles.list}>
                  {/* Display backend ride offers */}
                  {rideOffers.map((offer) => (
                    <OfferingCard
                      key={`backend-${offer._id?.toString()}`}
                      ride={convertRideOfferToNearby(offer)}
                      rideId={offer._id?.toString()}
                      onDelete={() => handleDeleteRide(offer._id?.toString() || '')}
                    />
                  ))}
                  {/* Display mock ride offers */}
                  {mockNearbyOfferings.map((ride) => (
                    <OfferingCard key={`mock-${ride.id}`} ride={ride} />
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

      {/* Offer Ride Modal */}
      <OfferRideModal
        visible={showOfferModal}
        onClose={() => setShowOfferModal(false)}
        onSubmit={handleCreateRideOffer}
        userId="current-user-id" // TODO: Replace with actual logged-in user ID
      />
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

function OfferingCard({ 
  ride, 
  rideId, 
  onDelete,
}: { 
  ride: NearbyOfferingRide;
  rideId?: string;
  onDelete?: () => void;
}) {
  const isBackendRide = !!rideId;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.milesAway}>{ride.milesAway} mi away</Text>
        {isBackendRide && onDelete && (
          <TouchableOpacity 
            onPress={onDelete}
            style={styles.deleteButton}
          >
            <Text style={styles.deleteButtonText}>✕</Text>
          </TouchableOpacity>
        )}
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
      <View style={styles.seatsAndTimeRow}>
        <View>
          <Text style={styles.seatsLabel}>
            {ride.availableSeats} seat{ride.availableSeats === 1 ? "" : "s"}{" "}
            available
          </Text>
          <SeatOverview
            totalSeats={ride.totalSeats}
            availableSeats={ride.availableSeats}
          />
        </View>
        <View style={styles.leavingBlock}>
          <Text style={styles.leavingLabel}>Leaving</Text>
          <Text style={styles.leavingTime}>{ride.departureTime}</Text>
        </View>
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
  offerButton: {
    backgroundColor: brandColors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 16,
  },
  offerButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: brandColors.white,
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
  deleteButton: {
    padding: 6,
    backgroundColor: brandColors.beige,
    borderRadius: 6,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonText: {
    fontSize: 16,
    color: "#d32f2f",
    fontWeight: "bold",
  },
  cardFooter: {
    alignItems: "flex-end",
    marginTop: 12,
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
  seatsAndTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 12,
    gap: 12,
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
