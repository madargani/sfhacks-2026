import { useState, useEffect, useCallback, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Modal,
  Dimensions,
  Animated,
} from "react-native";
import type { ScrollView as ScrollViewType } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import { brandColors } from "@/constants/theme";
import {
  mockNearbyOfferings,
  mockNearbyRequests,
  type NearbyOfferingRide,
  type NearbyRequestingRide,
} from "@/data/mock/nearby-rides";
import { OfferRideModal } from "@/components/offer-ride-modal";
import { RequestRideModal } from "@/components/request-ride-modal";
import { CreateRideOffer, CreateRideRequest, RideOffer } from "@evergreen/shared-types";
import { getApiData } from "@/services/api";
import {
  getMockJoinedRideIds,
  joinMockRide,
  leaveMockRide,
  subscribeToMockJoinedRides,
} from "@/utils/mock-joined-rides";
import {
  SCROLLER_PADDING,
  getDaysInMonth,
  getScrollOffsetY,
  getScrollerIndex,
  scrollToIndex,
  useRafScrollScheduler,
} from "@/utils/web-picker";

type TabId = "offering" | "requesting";
type RideOfferWithJoin = RideOffer & { joinedUserIds?: string[] };

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

// Helper function to convert RideRequest to NearbyRequestingRide
const convertRideRequestToNearby = (request: any): NearbyRequestingRide => {
  const requestDate = new Date(request.dateTime);
  const now = new Date();
  
  // Format requested time
  let requestedFor: string;
  const isToday = requestDate.toDateString() === now.toDateString();
  const isTomorrow = 
    new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString() === 
    requestDate.toDateString();
  
  if (isToday) {
    requestedFor = `Today ${requestDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })}`;
  } else if (isTomorrow) {
    requestedFor = `Tomorrow ${requestDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })}`;
  } else {
    requestedFor = requestDate.toLocaleDateString('en-US', {
      weekday: 'short',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  return {
    id: request._id?.toString() || '',
    destination: request.toLocation.address,
    origin: request.fromLocation.address,
    milesAway: 0, // TODO: Calculate distance from user's location
    requesterName: 'Requester', // TODO: Populate from user data
    requestedFor,
  };
};

export default function RidesScreen() {
  const [activeTab, setActiveTab] = useState<TabId>("offering");
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [rideOffers, setRideOffers] = useState<RideOffer[]>([]);
  const [rideRequests, setRideRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [rideOfferNotice, setRideOfferNotice] = useState<string | null>(null);
  const [requestNotice, setRequestNotice] = useState<string | null>(null);
  const [mockJoinedIds, setMockJoinedIds] = useState<Set<string>>(
    getMockJoinedRideIds()
  );
  const [editingRideId, setEditingRideId] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<"offer" | "request" | null>(null);
  const [editDateTime, setEditDateTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [webMonth, setWebMonth] = useState(0);
  const [webDay, setWebDay] = useState(1);
  const [webHour, setWebHour] = useState(0);
  const [webMinute, setWebMinute] = useState(0);
  const webMonthScrollRef = useRef<ScrollViewType>(null);
  const webDayScrollRef = useRef<ScrollViewType>(null);
  const webHourScrollRef = useRef<ScrollViewType>(null);
  const webMinuteScrollRef = useRef<ScrollViewType>(null);
  const { schedule } = useRafScrollScheduler();
  const offerNoticeAnim = useRef(new Animated.Value(0)).current;
  const requestNoticeAnim = useRef(new Animated.Value(0)).current;
  const offerIdsRef = useRef<Set<string>>(new Set());
  const requestIdsRef = useRef<Set<string>>(new Set());
  const hasLoadedOffersRef = useRef(false);
  const hasLoadedRequestsRef = useRef(false);
  const currentUserId = "current-user-id";

  // Fetch ride offers and requests from backend on mount
  useEffect(() => {
    fetchRideOffers();
    fetchRideRequests();
  }, []);

  useEffect(() => {
    return subscribeToMockJoinedRides(setMockJoinedIds);
  }, []);

  // Refresh ride offers and requests when screen is focused (e.g., after creating a ride on home screen)
  useFocusEffect(
    useCallback(() => {
      fetchRideOffers();
      fetchRideRequests();
    }, [])
  );

  useEffect(() => {
    if (!rideOfferNotice) {
      Animated.timing(offerNoticeAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.timing(offerNoticeAnim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();

    const timeoutId = setTimeout(() => {
      setRideOfferNotice(null);
    }, 2500);

    return () => clearTimeout(timeoutId);
  }, [rideOfferNotice, offerNoticeAnim]);

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

  const syncWebPartsFromDate = (sourceDate: Date) => {
    setWebMonth(sourceDate.getMonth());
    setWebDay(sourceDate.getDate());
    setWebHour(sourceDate.getHours());
    setWebMinute(Math.floor(sourceDate.getMinutes() / 15) * 15);
  };

  const createDateTimeFromWebParts = (baseDate: Date) => {
    const nextDate = new Date(baseDate);
    const daysInMonth = getDaysInMonth(nextDate.getFullYear(), webMonth);
    const clampedDay = Math.min(webDay, daysInMonth);
    nextDate.setMonth(webMonth);
    nextDate.setDate(clampedDay);
    nextDate.setHours(webHour);
    nextDate.setMinutes(webMinute);
    nextDate.setSeconds(0);
    nextDate.setMilliseconds(0);
    return nextDate;
  };

  const updateWebMonthFromOffset = (offsetY: number) => {
    if (!editDateTime) {
      return;
    }
    const index = getScrollerIndex(offsetY);
    const clampedIndex = Math.max(0, Math.min(11, index));
    const daysInMonth = getDaysInMonth(editDateTime.getFullYear(), clampedIndex);
    setWebMonth(clampedIndex);
    if (webDay > daysInMonth) {
      setWebDay(daysInMonth);
    }
  };

  const updateWebDayFromOffset = (offsetY: number) => {
    if (!editDateTime) {
      return;
    }
    const index = getScrollerIndex(offsetY);
    const daysInMonth = getDaysInMonth(editDateTime.getFullYear(), webMonth);
    const day = Math.max(1, Math.min(daysInMonth, index + 1));
    setWebDay(day);
  };

  const updateWebHourFromOffset = (offsetY: number) => {
    const index = getScrollerIndex(offsetY);
    const clampedIndex = Math.max(0, Math.min(23, index));
    setWebHour(clampedIndex);
  };

  const updateWebMinuteFromOffset = (offsetY: number) => {
    const index = getScrollerIndex(offsetY);
    const clampedIndex = Math.max(0, Math.min(3, index));
    setWebMinute(clampedIndex * 15);
  };

  const makeScrollHandler = (handler: (nextOffset: number) => void) => {
    return (event: any) => {
      const offsetY = getScrollOffsetY(event);
      schedule(offsetY, handler);
    };
  };

  const updateWebMonthFromScroll = makeScrollHandler(updateWebMonthFromOffset);
  const updateWebDayFromScroll = makeScrollHandler(updateWebDayFromOffset);
  const updateWebHourFromScroll = makeScrollHandler(updateWebHourFromOffset);
  const updateWebMinuteFromScroll = makeScrollHandler(updateWebMinuteFromOffset);

  const fetchRideOffers = async () => {
    try {
      setIsLoading(true);
      const offers = await getApiData<RideOffer[]>("/api/v1/rides/offers");
      const nextIds = new Set<string>();
      const newOffers: RideOffer[] = [];

      offers.forEach((offer) => {
        const id = offer._id?.toString();
        if (!id) {
          return;
        }
        nextIds.add(id);
        if (hasLoadedOffersRef.current && !offerIdsRef.current.has(id)) {
          newOffers.push(offer);
        }
      });

      if (hasLoadedOffersRef.current && newOffers.length > 0) {
        const sampleOffer = newOffers[0];
        const from = sampleOffer.fromLocation?.address ?? "Origin";
        const to = sampleOffer.toLocation?.address ?? "Destination";
        const extraCount = newOffers.length - 1;
        const suffix = extraCount > 0 ? ` (+${extraCount} more)` : "";
        setRideOfferNotice(`Ride offered: ${from} to ${to}${suffix}`);
      }

      offerIdsRef.current = nextIds;
      hasLoadedOffersRef.current = true;
      setRideOffers(offers);
    } catch (error) {
      console.error("Error fetching ride offers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRideRequests = async () => {
    try {
      const requests = await getApiData<any[]>("/api/v1/rides/requests?");
      const nextIds = new Set<string>();
      const newRequests: any[] = [];

      requests.forEach((request) => {
        const id = request._id?.toString();
        if (!id) {
          return;
        }
        nextIds.add(id);
        if (hasLoadedRequestsRef.current && !requestIdsRef.current.has(id)) {
          newRequests.push(request);
        }
      });

      if (hasLoadedRequestsRef.current && newRequests.length > 0) {
        const sampleRequest = newRequests[0];
        const from = sampleRequest.fromLocation?.address ?? "Origin";
        const to = sampleRequest.toLocation?.address ?? "Destination";
        const extraCount = newRequests.length - 1;
        const suffix = extraCount > 0 ? ` (+${extraCount} more)` : "";
        setRequestNotice(`Request posted: ${from} to ${to}${suffix}`);
      }

      requestIdsRef.current = nextIds;
      hasLoadedRequestsRef.current = true;
      setRideRequests(requests);
    } catch (error) {
      console.error("Error fetching ride requests:", error);
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
      // Refresh the ride requests list
      await fetchRideRequests();
      setShowRequestModal(false);
    } catch (error) {
      console.error("Error creating ride request:", error);
      throw error;
    }
  };

  const handleDeleteRideRequest = async (requestId: string) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/rides/requests/${requestId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete ride request");
      }

      // Refresh the ride requests list
      await fetchRideRequests();
    } catch (error) {
      console.error("Error deleting ride request:", error);
      alert("Failed to delete ride request");
    }
  };

  const handleUpdateRideRequest = async (requestId: string, overrideDate?: Date) => {
    const nextDateTime = overrideDate ?? editDateTime;
    if (!nextDateTime) return;

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/rides/requests/${requestId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dateTime: nextDateTime.toISOString(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update ride request");
      }

      setEditingRideId(null);
      setEditingType(null);
      setEditDateTime(null);
      await fetchRideRequests();
    } catch (error) {
      console.error("Error updating ride request:", error);
      alert("Failed to update ride request");
    }
  };

  const handleUpdateRideOffer = async (overrideDate?: Date) => {
    const nextDateTime = overrideDate ?? editDateTime;
    if (!editingRideId || !nextDateTime) return;

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/rides/offers/${editingRideId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dateTime: nextDateTime.toISOString(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update ride offer");
      }

      setEditingRideId(null);
      setEditingType(null);
      setEditDateTime(null);
      await fetchRideOffers();
    } catch (error) {
      console.error("Error updating ride offer:", error);
      alert("Failed to update ride offer");
    }
  };

  const isJoinedRide = (offer: RideOfferWithJoin) => {
    return offer.joinedUserIds?.includes(currentUserId) ?? false;
  };

  const handleJoinRide = async (rideId: string, availableSeats: number) => {
    if (availableSeats <= 0) {
      alert("No seats available");
      return;
    }
    try {
      await getApiData<RideOffer>(`/api/v1/rides/offers/${rideId}/join`, {
        method: "POST",
        body: JSON.stringify({ userId: currentUserId }),
      });

      await fetchRideOffers();
    } catch (error) {
      console.error("Error joining ride:", error);
      alert("Failed to join ride");
    }
  };

  const handleLeaveRide = async (rideId: string) => {
    try {
      await getApiData<RideOffer>(`/api/v1/rides/offers/${rideId}/leave`, {
        method: "POST",
        body: JSON.stringify({ userId: currentUserId }),
      });

      await fetchRideOffers();
    } catch (error) {
      console.error("Error leaving ride:", error);
      alert("Failed to leave ride");
    }
  };

  const isMockJoined = (rideId: string) => mockJoinedIds.has(rideId);

  const getMockSeats = (baseSeats: number, rideId: string) => {
    return Math.max(0, baseSeats - (isMockJoined(rideId) ? 1 : 0));
  };

  const handleMockJoin = (rideId: string, availableSeats: number) => {
    if (isMockJoined(rideId)) {
      return;
    }
    if (availableSeats <= 0) {
      alert("No seats available");
      return;
    }
    joinMockRide(rideId);
  };

  const handleMockLeave = (rideId: string) => {
    leaveMockRide(rideId);
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

          {/* Offer/Request Ride Button */}
          <TouchableOpacity
            style={styles.offerButton}
            onPress={() => {
              if (activeTab === "offering") {
                setShowOfferModal(true);
              } else {
                setShowRequestModal(true);
              }
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.offerButtonText}>
              {activeTab === "offering" ? "+ Offer a Ride" : "+ Request a Ride"}
            </Text>
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
                  {rideRequests.length + mockNearbyRequests.length}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {rideOfferNotice ? (
          <Animated.View
            style={[
              styles.notificationBanner,
              {
                opacity: offerNoticeAnim,
                transform: [
                  {
                    translateY: offerNoticeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-80, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.notificationText}>{rideOfferNotice}</Text>
            <TouchableOpacity
              style={styles.notificationDismiss}
              onPress={() => setRideOfferNotice(null)}
              activeOpacity={0.8}
            >
              <Text style={styles.notificationDismissText}>✕</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : null}

        {requestNotice ? (
          <Animated.View
            style={[
              styles.notificationBannerSecondary,
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
                  {rideOffers.map((offer) => {
                    const rideKey = offer._id?.toString() || "";
                    const isOwner = offer.userId === currentUserId;
                    const availableSeats = offer.availableSeats;
                    const joined = isJoinedRide(offer);
                    return (
                      <OfferingCard
                        key={`backend-${rideKey}`}
                        ride={convertRideOfferToNearby({
                          ...offer,
                          availableSeats,
                        })}
                        rideId={rideKey}
                        isJoined={joined}
                        onJoin={!isOwner ? () => handleJoinRide(rideKey, availableSeats) : undefined}
                        onLeave={!isOwner ? () => handleLeaveRide(rideKey) : undefined}
                        onDelete={
                          isOwner
                            ? () => handleDeleteRide(rideKey)
                            : undefined
                        }
                        onEdit={
                          isOwner
                            ? () => {
                                const nextDate = new Date(offer.dateTime);
                                setEditingRideId(rideKey);
                                setEditingType("offer");
                                setEditDateTime(nextDate);
                                if (Platform.OS === "web") {
                                  syncWebPartsFromDate(nextDate);
                                }
                                setShowDatePicker(true);
                              }
                            : undefined
                        }
                      />
                    );
                  })}
                  {/* Display mock ride offers */}
                  {mockNearbyOfferings.map((ride) => {
                    const rideKey = `mock-${ride.id}`;
                    const availableSeats = getMockSeats(
                      ride.availableSeats,
                      rideKey
                    );
                    return (
                      <OfferingCard
                        key={rideKey}
                        ride={{ ...ride, availableSeats }}
                        isJoined={isMockJoined(rideKey)}
                        onJoin={() => handleMockJoin(rideKey, availableSeats)}
                        onLeave={() => handleMockLeave(rideKey)}
                      />
                    );
                  })}
                </View>
              )}
            </View>
          ) : (
            <View style={styles.tabContent}>
              {rideRequests.length === 0 && mockNearbyRequests.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No nearby requests</Text>
                  <Text style={styles.emptySubtext}>
                    Check back later for ride requests!
                  </Text>
                </View>
              ) : (
                <View style={styles.list}>
                  {rideRequests.map((ride) => {
                    const requestKey = ride._id?.toString() || "";
                    const isOwner = ride.userId === currentUserId;
                    return (
                      <RequestingCard 
                        key={`backend-${requestKey}`}
                        ride={convertRideRequestToNearby(ride)} 
                        requestId={requestKey}
                        onEdit={
                          isOwner
                            ? () => {
                                const nextDate = new Date(ride.dateTime);
                                setEditingRideId(requestKey);
                                setEditingType("request");
                                setEditDateTime(nextDate);
                                if (Platform.OS === "web") {
                                  syncWebPartsFromDate(nextDate);
                                }
                                setShowDatePicker(true);
                              }
                            : undefined
                        }
                        onDelete={
                          isOwner
                            ? () => handleDeleteRideRequest(requestKey)
                            : undefined
                        }
                      />
                    );
                  })}
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

      {/* Request Ride Modal */}
      <RequestRideModal
        visible={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSubmit={handleCreateRideRequest}
        userId="current-user-id" // TODO: Replace with actual logged-in user ID
      />

      {/* Date/Time Picker for Editing Rides */}
      {showDatePicker && editDateTime && Platform.OS !== "web" && (
        <View>
          <DateTimePicker
            value={editDateTime}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              if (selectedDate) {
                const newDate = new Date(selectedDate);
                newDate.setHours(editDateTime.getHours());
                newDate.setMinutes(editDateTime.getMinutes());
                setEditDateTime(newDate);
              }
              setShowDatePicker(false);
              setShowTimePicker(true);
            }}
          />
        </View>
      )}

      {showTimePicker && editDateTime && Platform.OS !== "web" && (
        <View>
          <DateTimePicker
            value={editDateTime}
            mode="time"
            display="default"
            onChange={(event, selectedTime) => {
              if (selectedTime) {
                const updatedDateTime = new Date(editDateTime);
                updatedDateTime.setHours(selectedTime.getHours());
                updatedDateTime.setMinutes(selectedTime.getMinutes());
                setEditDateTime(updatedDateTime);
                if (editingType === "request" && editingRideId) {
                  handleUpdateRideRequest(editingRideId, updatedDateTime);
                } else {
                  handleUpdateRideOffer(updatedDateTime);
                }
              } else {
                if (editingType === "request" && editingRideId) {
                  handleUpdateRideRequest(editingRideId);
                } else {
                  handleUpdateRideOffer();
                }
              }
              setShowTimePicker(false);
            }}
          />
        </View>
      )}

      {/* Web Fallback for Date/Time Picker */}
      {Platform.OS === "web" && (showDatePicker || showTimePicker) && editDateTime && (
        <Modal
          visible={true}
          animationType="fade"
          transparent={true}
          onRequestClose={() => {
            setShowDatePicker(false);
            setShowTimePicker(false);
          }}
        >
          <View style={styles.webPickerOverlay}>
            <View style={styles.webPickerModal}>
              <Text style={styles.webPickerTitle}>
                {showDatePicker ? "Select Date" : "Select Time"}
              </Text>

              {showDatePicker && (
                <View style={styles.webPickerContent}>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollerContainer}
                  >
                    {/* Month Scroller */}
                    <View style={styles.scrollerColumn}>
                      <Text style={styles.scrollerLabel}>Month</Text>
                      <ScrollView 
                        style={styles.scroller}
                        scrollEventThrottle={16}
                        onScroll={updateWebMonthFromScroll}
                        onScrollEndDrag={updateWebMonthFromScroll}
                        onMomentumScrollEnd={updateWebMonthFromScroll}
                        ref={webMonthScrollRef}
                      >
                        <View style={{ height: SCROLLER_PADDING }} />
                        {['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'
                        ].map((month, idx) => (
                          <TouchableOpacity
                            key={month}
                            style={[
                              styles.scrollerItem,
                              idx === webMonth && styles.scrollerItemSelected
                            ]}
                            activeOpacity={0.7}
                            onPress={() => {
                              if (!editDateTime) {
                                return;
                              }
                              const daysInMonth = getDaysInMonth(
                                editDateTime.getFullYear(),
                                idx
                              );
                              setWebMonth(idx);
                              if (webDay > daysInMonth) {
                                setWebDay(daysInMonth);
                              }
                              scrollToIndex(webMonthScrollRef, idx);
                            }}
                          >
                            <Text style={[
                              styles.scrollerItemText,
                              idx === webMonth && styles.scrollerItemTextSelected
                            ]}>
                              {month}
                            </Text>
                          </TouchableOpacity>
                        ))}
                        <View style={{ height: SCROLLER_PADDING }} />
                      </ScrollView>
                    </View>

                    {/* Day Scroller */}
                    <View style={styles.scrollerColumn}>
                      <Text style={styles.scrollerLabel}>Day</Text>
                      <ScrollView 
                        style={styles.scroller}
                        scrollEventThrottle={16}
                        onScroll={updateWebDayFromScroll}
                        onScrollEndDrag={updateWebDayFromScroll}
                        onMomentumScrollEnd={updateWebDayFromScroll}
                        ref={webDayScrollRef}
                      >
                        <View style={{ height: SCROLLER_PADDING }} />
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                          <TouchableOpacity
                            key={day}
                            style={[
                              styles.scrollerItem,
                              day === webDay && styles.scrollerItemSelected
                            ]}
                            activeOpacity={0.7}
                            onPress={() => {
                              if (!editDateTime) {
                                return;
                              }
                              const daysInMonth = getDaysInMonth(
                                editDateTime.getFullYear(),
                                webMonth
                              );
                              const clampedDay = Math.min(day, daysInMonth);
                              setWebDay(clampedDay);
                              scrollToIndex(webDayScrollRef, clampedDay - 1);
                            }}
                          >
                            <Text style={[
                              styles.scrollerItemText,
                              day === webDay && styles.scrollerItemTextSelected
                            ]}>
                              {day}
                            </Text>
                          </TouchableOpacity>
                        ))}
                        <View style={{ height: SCROLLER_PADDING }} />
                      </ScrollView>
                    </View>
                  </ScrollView>

                  <TouchableOpacity
                    onPress={() => {
                      if (editDateTime) {
                        setEditDateTime(createDateTimeFromWebParts(editDateTime));
                      }
                      setShowDatePicker(false);
                      setShowTimePicker(true);
                    }}
                    style={styles.webPickerButton}
                  >
                    <Text style={styles.webPickerButtonText}>Select Date</Text>
                  </TouchableOpacity>
                </View>
              )}

              {showTimePicker && (
                <View style={styles.webPickerContent}>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollerContainer}
                  >
                    {/* Hour Scroller */}
                    <View style={styles.scrollerColumn}>
                      <Text style={styles.scrollerLabel}>Hour</Text>
                      <ScrollView 
                        style={styles.scroller}
                        scrollEventThrottle={16}
                        onScroll={updateWebHourFromScroll}
                        onScrollEndDrag={updateWebHourFromScroll}
                        onMomentumScrollEnd={updateWebHourFromScroll}
                        ref={webHourScrollRef}
                      >
                        <View style={{ height: SCROLLER_PADDING }} />
                        {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                          <TouchableOpacity
                            key={hour}
                            style={[
                              styles.scrollerItem,
                              hour === webHour && styles.scrollerItemSelected
                            ]}
                            activeOpacity={0.7}
                            onPress={() => {
                              setWebHour(hour);
                              scrollToIndex(webHourScrollRef, hour);
                            }}
                          >
                            <Text style={[
                              styles.scrollerItemText,
                              hour === webHour && styles.scrollerItemTextSelected
                            ]}>
                              {String(hour).padStart(2, "0")}
                            </Text>
                          </TouchableOpacity>
                        ))}
                        <View style={{ height: SCROLLER_PADDING }} />
                      </ScrollView>
                    </View>

                    {/* Minute Scroller */}
                    <View style={styles.scrollerColumn}>
                      <Text style={styles.scrollerLabel}>Minute</Text>
                      <ScrollView 
                        style={styles.scroller}
                        scrollEventThrottle={16}
                        onScroll={updateWebMinuteFromScroll}
                        onScrollEndDrag={updateWebMinuteFromScroll}
                        onMomentumScrollEnd={updateWebMinuteFromScroll}
                        ref={webMinuteScrollRef}
                      >
                        <View style={{ height: SCROLLER_PADDING }} />
                        {Array.from({ length: 4 }, (_, i) => i * 15).map((minute) => (
                          <TouchableOpacity
                            key={minute}
                            style={[
                              styles.scrollerItem,
                              minute === webMinute && styles.scrollerItemSelected
                            ]}
                            activeOpacity={0.7}
                            onPress={() => {
                              setWebMinute(minute);
                              scrollToIndex(webMinuteScrollRef, minute / 15);
                            }}
                          >
                            <Text style={[
                              styles.scrollerItemText,
                              minute === webMinute && styles.scrollerItemTextSelected
                            ]}>
                              {String(minute).padStart(2, "0")}
                            </Text>
                          </TouchableOpacity>
                        ))}
                        <View style={{ height: SCROLLER_PADDING }} />
                      </ScrollView>
                    </View>
                  </ScrollView>

                  <View style={styles.webPickerButtonGroup}>
                    <TouchableOpacity
                      onPress={() => {
                        setShowDatePicker(true);
                        setShowTimePicker(false);
                      }}
                      style={[styles.webPickerButton, styles.webPickerButtonSecondary]}
                    >
                      <Text style={styles.webPickerButtonText}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        if (editDateTime) {
                          const nextDate = createDateTimeFromWebParts(editDateTime);
                          setEditDateTime(nextDate);
                          if (editingType === "request" && editingRideId) {
                            handleUpdateRideRequest(editingRideId, nextDate);
                          } else {
                            handleUpdateRideOffer(nextDate);
                          }
                        } else {
                          if (editingType === "request" && editingRideId) {
                            handleUpdateRideRequest(editingRideId);
                          } else {
                            handleUpdateRideOffer();
                          }
                        }
                        setShowDatePicker(false);
                        setShowTimePicker(false);
                      }}
                      style={styles.webPickerButton}
                    >
                      <Text style={styles.webPickerButtonText}>Select Time</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        </Modal>
      )}
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
  onEdit,
  onJoin,
  onLeave,
  isJoined,
}: { 
  ride: NearbyOfferingRide;
  rideId?: string;
  onDelete?: () => void;
  onEdit?: () => void;
  onJoin?: () => void;
  onLeave?: () => void;
  isJoined?: boolean;
}) {
  const isOwnerRide = !!onEdit || !!onDelete;
  const canJoin = ride.availableSeats > 0;
  const handleJoin = onJoin ?? (() => alert("Joined ride"));
  const handleLeave = onLeave ?? (() => alert("Left ride"));

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.milesAway}>{ride.milesAway} mi away</Text>
        {isOwnerRide ? (
          <View style={styles.cardHeaderButtons}>
            {onEdit && (
              <TouchableOpacity 
                onPress={onEdit}
                style={styles.editButton}
              >
                <Text style={styles.editButtonText}>✎</Text>
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity 
                onPress={onDelete}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (onJoin || onLeave) ? (
          <TouchableOpacity
            onPress={isJoined ? handleLeave : handleJoin}
            style={[
              styles.joinButton,
              isJoined && styles.leaveButton,
              !isJoined && !canJoin && styles.joinButtonDisabled,
            ]}
            disabled={!isJoined && !canJoin}
          >
            <Text style={styles.joinButtonText}>
              {isJoined ? "Leave" : "Join"}
            </Text>
          </TouchableOpacity>
        ) : null}
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

function RequestingCard({ 
  ride,
  requestId,
  onEdit,
  onDelete,
}: { 
  ride: NearbyRequestingRide;
  requestId?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const isOwnerRequest = !!onEdit || !!onDelete;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.milesAway}>{ride.milesAway} mi away</Text>
        {isOwnerRequest && (
          <View style={styles.cardHeaderButtons}>
            {onEdit && (
              <TouchableOpacity 
                onPress={onEdit}
                style={styles.editButton}
              >
                <Text style={styles.editButtonText}>✎</Text>
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity 
                onPress={onDelete}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
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
        <Text style={styles.requesterText}>{ride.requesterName}</Text>
      </View>
      <View style={styles.leavingBlock}>
        <Text style={styles.leavingLabel}>Requested</Text>
        <Text style={styles.leavingTime}>{ride.requestedFor}</Text>
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
  notificationBannerSecondary: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: brandColors.dark,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  notificationDismissText: {
    color: brandColors.white,
    fontSize: 18,
    fontWeight: "600",
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
  cardHeaderButtons: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    padding: 6,
    backgroundColor: brandColors.beige,
    borderRadius: 6,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  editButtonText: {
    fontSize: 16,
    color: brandColors.primary,
    fontWeight: "bold",
  },
  joinButton: {
    backgroundColor: brandColors.primary,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  joinButtonDisabled: {
    backgroundColor: brandColors.beige,
  },
  leaveButton: {
    backgroundColor: brandColors.dark,
  },
  joinButtonText: {
    color: brandColors.white,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
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
  webPickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  webPickerModal: {
    backgroundColor: brandColors.white,
    borderRadius: 12,
    padding: 20,
    width: "80%",
    maxWidth: 400,
  },
  webPickerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: brandColors.dark,
    marginBottom: 20,
    textAlign: "center",
  },
  webPickerContent: {
    marginBottom: 24,
  },
  scrollerContainer: {
    gap: 16,
    paddingHorizontal: 12,
  },
  scrollerColumn: {
    alignItems: "center",
    minWidth: 100,
  },
  scrollerLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: brandColors.beige,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  scroller: {
    height: 200,
    width: 80,
    borderWidth: 1,
    borderColor: brandColors.beige,
    borderRadius: 8,
  },
  scrollerItem: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollerItemSelected: {
    backgroundColor: brandColors.primary,
    borderRadius: 4,
  },
  scrollerItemText: {
    fontSize: 18,
    fontWeight: "500",
    color: brandColors.dark,
  },
  scrollerItemTextSelected: {
    color: brandColors.white,
    fontWeight: "700",
  },
  dateInputGroup: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  webPickerButton: {
    backgroundColor: brandColors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 10,
  },
  webPickerButtonSecondary: {
    backgroundColor: brandColors.beige,
  },
  webPickerButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: brandColors.white,
  },
  webPickerButtonGroup: {
    flexDirection: "row",
    gap: 10,
  },
});
