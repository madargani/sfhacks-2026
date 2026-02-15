import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Animated,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { mockCarbonSaved } from "@/data/mock/rides";
import { mockNearbyOfferings } from "@/data/mock/nearby-rides";
import { brandColors } from "@/constants/theme";
import { OfferRideModal } from "@/components/offer-ride-modal";
import { RequestRideModal } from "@/components/request-ride-modal";
import { CreateRideOffer, CreateRideRequest, RideOffer } from "@evergreen/shared-types";
import { getApiData } from "@/services/api";
import {
  getMockJoinedRideIds,
  subscribeToMockJoinedRides,
} from "@/utils/mock-joined-rides";

type MyRide = {
  id: string;
  type: "offering" | "joined";
  from: string;
  to: string;
  dateTime: string;
  driverName?: string;
  availableSeats: number;
  totalSeats: 5 | 6 | 7 | 8;
};

type RideOfferWithJoin = RideOffer & { joinedUserIds?: string[] };

export default function HomeScreen() {
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [rideOffers, setRideOffers] = useState<RideOffer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [requestNotice, setRequestNotice] = useState<string | null>(null);
  const [mockJoinedIds, setMockJoinedIds] = useState<Set<string>>(
    getMockJoinedRideIds()
  );
  const requestNoticeAnim = useRef(new Animated.Value(0)).current;
  const currentUserId = "current-user-id";

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

  useEffect(() => {
    fetchRideOffers();
  }, []);

  useEffect(() => {
    return subscribeToMockJoinedRides(setMockJoinedIds);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchRideOffers();
    }, [])
  );

  useEffect(() => {
    if (!requestNotice) {
      Animated.timing(requestNoticeAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.timing(requestNoticeAnim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();

    const timeoutId = setTimeout(() => {
      setRequestNotice(null);
    }, 2500);

    return () => clearTimeout(timeoutId);
  }, [requestNotice, requestNoticeAnim]);

  const myRides = useMemo(() => {
    const backendRides = (rideOffers as RideOfferWithJoin[])
      .filter((offer) => {
        const rideId = offer._id?.toString() || "";
        return (
          offer.userId === currentUserId ||
          offer.joinedUserIds?.includes(currentUserId)
        );
      })
      .map((offer) => {
        const rideId = offer._id?.toString() || "";
        const isOffering = offer.userId === currentUserId;
        const departureDate = new Date(offer.dateTime);
        const dateTime = departureDate.toLocaleString("en-US", {
          weekday: "short",
          hour: "numeric",
          minute: "2-digit",
        });
        return {
          id: rideId,
          type: isOffering ? "offering" : "joined",
          from: offer.fromLocation.address,
          to: offer.toLocation.address,
          dateTime,
          driverName: isOffering ? "You" : "Driver",
          availableSeats: offer.availableSeats,
          totalSeats: Math.max(5, offer.availableSeats + 1) as 5 | 6 | 7 | 8,
        } as MyRide;
      });

    const mockJoinedRides = mockNearbyOfferings
      .filter((ride) => mockJoinedIds.has(`mock-${ride.id}`))
      .map((ride) => {
        const availableSeats = Math.max(0, ride.availableSeats - 1);
        return {
          id: `mock-${ride.id}`,
          type: "joined",
          from: ride.origin ?? "—",
          to: ride.destination,
          dateTime: ride.departureTime,
          driverName: ride.driverName,
          availableSeats,
          totalSeats: ride.totalSeats,
        } as MyRide;
      });

    return [...backendRides, ...mockJoinedRides];
  }, [rideOffers, mockJoinedIds]);

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

      setShowOfferModal(false);
      await fetchRideOffers();
    } catch (error) {
      console.error("Error creating ride offer:", error);
      throw error;
    }
  };

  const handleCreateRideRequest = async (rideRequest: CreateRideRequest) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/rides/requests`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(rideRequest),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create ride request");
      }

      setRequestNotice(
        `Request created: ${rideRequest.fromLocation.address} to ${rideRequest.toLocation.address}`
      );
      setShowRequestModal(false);
    } catch (error) {
      console.error("Error creating ride request:", error);
      throw error;
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={[brandColors.beige, brandColors.white, brandColors.white, brandColors.beige]}
        locations={[0, 0.15, 0.85, 1]}
        style={styles.gradient}
      >
        {requestNotice ? (
          <Animated.View
            style={[
              styles.notificationBanner,
              {
                opacity: requestNoticeAnim,
                transform: [
                  {
                    translateY: requestNoticeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-80, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.notificationText}>{requestNotice}</Text>
            <TouchableOpacity
              style={styles.notificationDismiss}
              onPress={() => setRequestNotice(null)}
              activeOpacity={0.8}
            >
              <Text style={styles.notificationDismissText}>✕</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : null}
        {/* Fixed Header - Logo, Carbon Card, and Title */}
        <View style={styles.header}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/evergreen_CLRlogo.png")}
              style={styles.logo}
              contentFit="contain"
            />
          </View>

          {/* Carbon Saved Card */}
          <View style={styles.carbonCard}>
            <Text style={styles.carbonNumber}>{mockCarbonSaved.toLocaleString()}</Text>
            <Text style={styles.carbonUnit}>kg CO₂ saved</Text>
            <Text style={styles.carbonSubtext}>by carpooling together</Text>
          </View>

          {/* Section Title - Fixed */}
          <Text style={styles.sectionTitle}>My Rides</Text>
        </View>

        {/* Scrollable Rides Section */}
        <ScrollView style={styles.ridesScrollView} contentContainerStyle={styles.ridesScrollContent}>
          <View style={styles.ridesSection}>
            {isLoading ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Loading rides...</Text>
              </View>
            ) : myRides.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No rides yet</Text>
                <Text style={styles.emptySubtext}>Offer or join a ride to get started!</Text>
              </View>
            ) : (
              <View style={styles.ridesList}>
                {myRides.map((ride) => (
                  <RideCard key={ride.id} ride={ride} />
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Fade-out gradient overlay */}
        <LinearGradient
          colors={['transparent', brandColors.white]}
          locations={[0, 1]}
          style={styles.fadeOverlay}
          pointerEvents="none"
        />

        {/* Fixed Bottom Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.offerButton} 
            activeOpacity={0.8}
            onPress={() => setShowOfferModal(true)}
          >
            <Text style={styles.offerButtonText}>Offer a Ride</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.requestButton} 
            activeOpacity={0.8}
            onPress={() => setShowRequestModal(true)}
          >
            <Text style={styles.requestButtonText}>Request a Ride</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Offer Ride Modal */}
      <OfferRideModal
        visible={showOfferModal}
        onClose={() => setShowOfferModal(false)}
        onSubmit={handleCreateRideOffer}
        userId="current-user-id" // TODO: Replace with actual logged-in user ID
      />

      {/* Request Ride Modal */}
      <RequestRideModal
        visible={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSubmit={handleCreateRideRequest}
        userId="current-user-id" // TODO: Replace with actual logged-in user ID
      />
    </SafeAreaView>
  );
}

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
          style={[styles.seatRow, rowIdx === 0 && styles.seatRowFront]}
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

function RideCard({ ride }: { ride: MyRide }) {
  return (
    <View style={styles.rideCard}>
      <View style={styles.rideHeader}>
        <Text style={styles.rideType}>
          {ride.type === "offering" ? "🚗 Offering" : "✅ Joined"}
        </Text>
        <Text style={styles.rideTime}>{ride.dateTime}</Text>
      </View>
      
      <View style={styles.rideRoute}>
        <View style={styles.routePoint}>
          <View style={[styles.dot, { backgroundColor: brandColors.primary }]} />
          <Text style={styles.locationText} numberOfLines={1}>{ride.from}</Text>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routePoint}>
          <View style={[styles.dot, { backgroundColor: brandColors.dark }]} />
          <Text style={styles.locationText} numberOfLines={1}>{ride.to}</Text>
        </View>
      </View>
      
      {ride.driverName && (
        <Text style={styles.driverText}>Driver: {ride.driverName}</Text>
      )}
      <View style={styles.seatsRow}>
        <Text style={styles.seatsLabel}>
          {ride.availableSeats} seat{ride.availableSeats === 1 ? "" : "s"} available
        </Text>
        <SeatOverview
          totalSeats={ride.totalSeats}
          availableSeats={ride.availableSeats}
        />
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
  notificationBanner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: brandColors.primary,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  notificationText: {
    color: brandColors.white,
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
    marginRight: 10,
  },
  notificationDismiss: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  notificationDismissText: {
    color: brandColors.white,
    fontSize: 18,
    fontWeight: "600",
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
  carbonCard: {
    backgroundColor: brandColors.dark,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
  },
  carbonNumber: {
    fontSize: 48,
    fontWeight: "bold",
    color: brandColors.white,
  },
  carbonUnit: {
    fontSize: 20,
    color: brandColors.white,
    marginTop: 4,
  },
  carbonSubtext: {
    fontSize: 14,
    color: brandColors.beige,
    marginTop: 8,
  },
  ridesScrollView: {
    flex: 1,
  },
  ridesScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  ridesSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: brandColors.black,
    marginBottom: 0,
    paddingHorizontal: 0,
  },
  ridesList: {
    gap: 12,
  },
  rideCard: {
    backgroundColor: brandColors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: brandColors.beige,
  },
  rideHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  rideType: {
    fontSize: 14,
    fontWeight: "600",
    color: brandColors.black,
  },
  rideTime: {
    fontSize: 14,
    color: brandColors.dark,
  },
  rideRoute: {
    marginBottom: 8,
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
  driverText: {
    fontSize: 13,
    color: brandColors.dark,
    marginTop: 8,
  },
  seatsRow: {
    marginTop: 8,
    alignItems: "flex-start",
    gap: 6,
  },
  seatsLabel: {
    fontSize: 13,
    color: brandColors.dark,
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
    width: 18,
    height: 18,
    borderRadius: 9,
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
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: 20,
    paddingBottom: 30,
    gap: 12,
    backgroundColor: "transparent",
  },
  offerButton: {
    flex: 1,
    backgroundColor: brandColors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  offerButtonText: {
    color: brandColors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  requestButton: {
    flex: 1,
    backgroundColor: brandColors.white,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: brandColors.primary,
  },
  requestButtonText: {
    color: brandColors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
});
