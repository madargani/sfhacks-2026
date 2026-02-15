import { useState, useEffect } from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Platform } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { mockRides, mockCarbonSaved, type UpcomingRide } from "@/data/mock/rides";
import { brandColors } from "@/constants/theme";
import { OfferRideModal } from "@/components/offer-ride-modal";
import { CreateRideOffer } from "@evergreen/shared-types";

export default function HomeScreen() {
  const [showOfferModal, setShowOfferModal] = useState(false);

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
    } catch (error) {
      console.error("Error creating ride offer:", error);
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
          <Text style={styles.sectionTitle}>Upcoming Rides</Text>
        </View>

        {/* Scrollable Rides Section */}
        <ScrollView style={styles.ridesScrollView} contentContainerStyle={styles.ridesScrollContent}>
          <View style={styles.ridesSection}>
            {mockRides.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No upcoming rides</Text>
                <Text style={styles.emptySubtext}>Offer or request a ride to get started!</Text>
              </View>
            ) : (
              <View style={styles.ridesList}>
                {mockRides.map((ride) => (
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
          <TouchableOpacity style={styles.requestButton} activeOpacity={0.8}>
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
    </SafeAreaView>
  );
}

function RideCard({ ride }: { ride: UpcomingRide }) {
  return (
    <View style={styles.rideCard}>
      <View style={styles.rideHeader}>
        <Text style={styles.rideType}>
          {ride.type === 'offering' ? '🚗 Offering' : '👋 Requesting'}
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
      <Text style={styles.passengersText}>{ride.passengers} passenger{ride.passengers > 1 ? 's' : ''}</Text>
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
  passengersText: {
    fontSize: 13,
    color: brandColors.dark,
    marginTop: 4,
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
