import { useEffect, useMemo, useState } from "react";
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
import { getApiData } from "@/services/api";
import {
  mockSquadMembers,
  mockPendingRequests,
  type SquadMember,
  type PendingSquadRequest,
} from "@/data/mock/squad";
import { type User } from "@evergreen/shared-types";

type TabId = "squad" | "pending";

export default function SquadScreen() {
  const [activeTab, setActiveTab] = useState<TabId>("squad");
  const [inviteCandidates, setInviteCandidates] = useState<User[]>([]);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [isLoadingInvites, setIsLoadingInvites] = useState(false);
  const [showInviteList, setShowInviteList] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadInviteCandidates = async () => {
      setIsLoadingInvites(true);
      setInviteError(null);

      try {
        const users = await getApiData<User[]>("/api/v1/users");
        if (isMounted) {
          setInviteCandidates(users);
        }
      } catch (error) {
        if (isMounted) {
          setInviteError(
            error instanceof Error ? error.message : "Unable to load users"
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingInvites(false);
        }
      }
    };

    loadInviteCandidates();

    return () => {
      isMounted = false;
    };
  }, []);

  const inviteSuggestions = useMemo(() => {
    const existingSquadNames = new Set(
      mockSquadMembers.map((member) => member.name.toLowerCase())
    );
    const pendingNames = new Set(
      mockPendingRequests.map((request) => request.name.toLowerCase())
    );

    return inviteCandidates.filter(
      (user) =>
        user.name &&
        !existingSquadNames.has(user.name.toLowerCase()) &&
        !pendingNames.has(user.name.toLowerCase())
    );
  }, [inviteCandidates]);

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
              style={[styles.tab, activeTab === "squad" && styles.tabActive]}
              onPress={() => setActiveTab("squad")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "squad" && styles.tabTextActive,
                ]}
              >
                Your squad
              </Text>
              <View
                style={[
                  styles.tabBadge,
                  activeTab === "squad" && styles.tabBadgeActive,
                ]}
              >
                <Text
                  style={[
                    styles.tabBadgeText,
                    activeTab === "squad" && styles.tabBadgeTextActive,
                  ]}
                >
                  {mockSquadMembers.length}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "pending" && styles.tabActive]}
              onPress={() => setActiveTab("pending")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "pending" && styles.tabTextActive,
                ]}
              >
                Pending requests
              </Text>
              <View
                style={[
                  styles.tabBadge,
                  activeTab === "pending" && styles.tabBadgeActive,
                ]}
              >
                <Text
                  style={[
                    styles.tabBadgeText,
                    activeTab === "pending" && styles.tabBadgeTextActive,
                  ]}
                >
                  {mockPendingRequests.length}
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
          {activeTab === "squad" ? (
            <View style={styles.tabContent}>
              {mockSquadMembers.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No squad members yet</Text>
                  <Text style={styles.emptySubtext}>
                    Invite friends to join your carpool squad!
                  </Text>
                </View>
              ) : (
                <View style={styles.list}>
                  {mockSquadMembers.map((member) => (
                    <SquadMemberCard key={member.id} member={member} />
                  ))}
                </View>
              )}

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Invite suggestions</Text>
                {isLoadingInvites ? (
                  <Text style={styles.sectionSubtext}>Loading people...</Text>
                ) : inviteError ? (
                  <Text style={styles.errorText}>{inviteError}</Text>
                ) : showInviteList ? (
                  <View style={styles.list}>
                    {inviteSuggestions.length === 0 ? (
                      <Text style={styles.sectionSubtext}>
                        No one new to invite right now.
                      </Text>
                    ) : (
                      inviteSuggestions.map((user) => (
                        <InviteSuggestionCard
                          key={user._id?.toString() ?? user.email}
                          user={user}
                        />
                      ))
                    )}
                  </View>
                ) : (
                  <Text style={styles.sectionSubtext}>
                    Tap "Invite to squad" to see who you can invite.
                  </Text>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.tabContent}>
              {mockPendingRequests.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No pending requests</Text>
                  <Text style={styles.emptySubtext}>
                    Invites you send will show up here.
                  </Text>
                </View>
              ) : (
                <View style={styles.list}>
                  {mockPendingRequests.map((request) => (
                    <PendingRequestCard key={request.id} request={request} />
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

        {/* Invite button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.inviteButton}
            activeOpacity={0.8}
            onPress={() => {
              setActiveTab("squad");
              setShowInviteList((prev) => !prev);
            }}
          >
            <Text style={styles.inviteButtonText}>
              {showInviteList ? "Hide invite list" : "Invite to squad"}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

function SquadMemberCard({ member }: { member: SquadMember }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {member.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </Text>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardName}>{member.name}</Text>
          <Text style={styles.cardMeta}>
            {member.ridesWithUser} ride{member.ridesWithUser === 1 ? "" : "s"}{" "}
            with you
          </Text>
        </View>
      </View>
    </View>
  );
}

function PendingRequestCard({ request }: { request: PendingSquadRequest }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {request.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </Text>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardName}>{request.name}</Text>
          <Text style={styles.cardMeta}>
            {request.status === "sent"
              ? `Invite sent ${request.requestedAt}`
              : `Requested ${request.requestedAt}`}
          </Text>
          {request.status === "received" && (
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.acceptButton} activeOpacity={0.8}>
                <Text style={styles.acceptButtonText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.declineButton} activeOpacity={0.8}>
                <Text style={styles.declineButtonText}>Decline</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

function InviteSuggestionCard({ user }: { user: User }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </Text>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardName}>{user.name}</Text>
          <Text style={styles.cardMeta}>{user.email}</Text>
        </View>
        <TouchableOpacity
          style={styles.inviteAction}
          activeOpacity={0.8}
          onPress={() => {}}
        >
          <Text style={styles.inviteActionText}>Invite</Text>
        </TouchableOpacity>
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
    paddingBottom: 120,
  },
  tabContent: {
    flex: 1,
  },
  list: {
    gap: 12,
  },
  section: {
    marginTop: 24,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: brandColors.black,
  },
  sectionSubtext: {
    fontSize: 14,
    color: brandColors.dark,
  },
  errorText: {
    fontSize: 14,
    color: brandColors.primary,
  },
  card: {
    backgroundColor: brandColors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: brandColors.beige,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: brandColors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "600",
    color: brandColors.white,
  },
  cardContent: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: "600",
    color: brandColors.black,
  },
  cardMeta: {
    fontSize: 14,
    color: brandColors.dark,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  acceptButton: {
    backgroundColor: brandColors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  acceptButtonText: {
    color: brandColors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  declineButton: {
    backgroundColor: brandColors.white,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: brandColors.beige,
  },
  declineButtonText: {
    color: brandColors.dark,
    fontSize: 14,
    fontWeight: "600",
  },
  inviteAction: {
    backgroundColor: brandColors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  inviteActionText: {
    color: brandColors.white,
    fontSize: 14,
    fontWeight: "600",
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
    padding: 20,
    paddingBottom: 30,
    backgroundColor: "transparent",
  },
  inviteButton: {
    backgroundColor: brandColors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  inviteButtonText: {
    color: brandColors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
