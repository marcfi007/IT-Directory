import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  FlatList,
  Modal,
  TextInput,
  Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { RoleBadge } from "@/components/RoleBadge";
import { ActivityItem } from "@/components/ActivityItem";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { FAB } from "@/components/FAB";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { useMarketContext } from "@/contexts/MarketContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { MarketInfo, ActivityLog, StoredUser, UserRole, PendingRegistration } from "@/types";

type TabType = "pending" | "registrations" | "users" | "logs";

const TABS: {
  key: TabType;
  label: string;
  icon: keyof typeof Feather.glyphMap;
}[] = [
  { key: "pending", label: "Infos", icon: "clock" },
  { key: "registrations", label: "Registr.", icon: "user-plus" },
  { key: "users", label: "Benutzer", icon: "users" },
  { key: "logs", label: "Logs", icon: "file-text" },
];

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "admin", label: "Administrator" },
  { value: "developer", label: "Entwickler" },
  { value: "user", label: "Techniker" },
];

export default function AdminPanelScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { user, getUsers, addUser, toggleUserActive, getPendingRegistrations, approveRegistration, rejectRegistration } = useAuth();
  const {
    getPendingInfos,
    activityLogs,
    approveMarketInfo,
    rejectMarketInfo,
    getMarketById,
    addActivityLog,
  } = useMarketContext();

  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const [users, setUsers] = useState<StoredUser[]>([]);
  const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistration[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<PendingRegistration | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>("user");
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<UserRole>("user");
  const [newUser2FA, setNewUser2FA] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const pendingInfos = getPendingInfos();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await loadUsers();
    await loadPendingRegistrations();
  };

  const loadUsers = async () => {
    const loadedUsers = await getUsers();
    setUsers(loadedUsers);
  };

  const loadPendingRegistrations = async () => {
    const registrations = await getPendingRegistrations();
    setPendingRegistrations(registrations);
  };

  const handleApprove = async (info: MarketInfo) => {
    if (!user) return;
    await approveMarketInfo(info.id, user.id, user.name);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleReject = async (info: MarketInfo) => {
    if (!user) return;
    await rejectMarketInfo(info.id, user.id, user.name);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  const handleOpenApproveModal = (registration: PendingRegistration) => {
    setSelectedRegistration(registration);
    setSelectedRole("user");
    setShowApproveModal(true);
  };

  const handleApproveRegistration = async () => {
    if (!user || !selectedRegistration) return;
    setIsLoading(true);
    await approveRegistration(selectedRegistration.id, selectedRole, user.id);
    await addActivityLog({
      action: "approve",
      description: `Registrierung freigegeben: ${selectedRegistration.name} als ${selectedRole}`,
      userId: user.id,
      userName: user.name,
    });
    await loadPendingRegistrations();
    await loadUsers();
    setShowApproveModal(false);
    setSelectedRegistration(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsLoading(false);
  };

  const handleRejectRegistration = async (registration: PendingRegistration) => {
    if (!user) return;
    await rejectRegistration(registration.id);
    await addActivityLog({
      action: "reject",
      description: `Registrierung abgelehnt: ${registration.name}`,
      userId: user.id,
      userName: user.name,
    });
    await loadPendingRegistrations();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  const handleToggleUserActive = async (userId: string) => {
    await toggleUserActive(userId);
    await loadUsers();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleAddUser = async () => {
    if (
      !newUserName.trim() ||
      !newUserEmail.trim() ||
      !newUserPassword.trim()
    ) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    try {
      await addUser({
        name: newUserName.trim(),
        email: newUserEmail.trim().toLowerCase(),
        password: newUserPassword,
        role: newUserRole,
        twoFactorEnabled:
          newUser2FA || newUserRole === "admin" || newUserRole === "developer",
        createdBy: user?.id,
      });

      if (user) {
        await addActivityLog({
          action: "add",
          description: `Neuer Mitarbeiter angelegt: ${newUserName.trim()}`,
          userId: user.id,
          userName: user.name,
        });
      }

      await loadUsers();
      setShowAddModal(false);
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserRole("user");
      setNewUser2FA(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPendingItem = useCallback(
    ({ item, index }: { item: MarketInfo; index: number }) => {
      const market = getMarketById(item.marketId);
      return (
        <Animated.View
          entering={FadeInDown.delay(index * 50).duration(250)}
          style={[
            styles.pendingCard,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
            },
          ]}
        >
          <View style={styles.pendingHeader}>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: theme.primary + "15" },
              ]}
            >
              <ThemedText
                style={[styles.categoryText, { color: theme.primary }]}
              >
                {item.category}
              </ThemedText>
            </View>
            <ThemedText
              style={[styles.pendingDate, { color: theme.textSecondary }]}
            >
              {new Date(item.createdAt).toLocaleDateString("de-DE")}
            </ThemedText>
          </View>

          {market ? (
            <View style={styles.marketInfo}>
              <Feather
                name="shopping-bag"
                size={14}
                color={theme.textSecondary}
              />
              <ThemedText
                style={[styles.marketName, { color: theme.textSecondary }]}
              >
                {market.name}
              </ThemedText>
            </View>
          ) : null}

          <ThemedText style={styles.pendingContent}>{item.content}</ThemedText>

          <View style={styles.pendingFooter}>
            <ThemedText
              style={[styles.pendingAuthor, { color: theme.textSecondary }]}
            >
              von {item.createdByName}
            </ThemedText>
            <View style={styles.pendingActions}>
              <Pressable
                onPress={() => handleReject(item)}
                style={[
                  styles.actionButton,
                  { backgroundColor: theme.error + "15" },
                ]}
              >
                <Feather name="x" size={18} color={theme.error} />
              </Pressable>
              <Pressable
                onPress={() => handleApprove(item)}
                style={[
                  styles.actionButton,
                  { backgroundColor: theme.verified + "15" },
                ]}
              >
                <Feather name="check" size={18} color={theme.verified} />
              </Pressable>
            </View>
          </View>
        </Animated.View>
      );
    },
    [theme, getMarketById, handleApprove, handleReject],
  );

  const renderUserItem = useCallback(
    ({ item, index }: { item: StoredUser; index: number }) => (
      <Animated.View
        entering={FadeInDown.delay(index * 50).duration(250)}
        style={[
          styles.userCard,
          {
            backgroundColor: theme.cardBackground,
            borderColor: theme.border,
            opacity: item.isActive ? 1 : 0.5,
          },
        ]}
      >
        <View
          style={[
            styles.userAvatar,
            {
              backgroundColor: item.isActive
                ? theme.primary
                : theme.textSecondary,
            },
          ]}
        >
          <ThemedText style={styles.userAvatarText}>
            {item.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </ThemedText>
        </View>
        <View style={styles.userInfo}>
          <View style={styles.userNameRow}>
            <ThemedText type="h4" style={styles.userName}>
              {item.name}
            </ThemedText>
            {!item.isActive ? (
              <View
                style={[
                  styles.inactiveBadge,
                  { backgroundColor: theme.error + "20" },
                ]}
              >
                <ThemedText
                  style={[styles.inactiveText, { color: theme.error }]}
                >
                  Inaktiv
                </ThemedText>
              </View>
            ) : null}
          </View>
          <ThemedText
            style={[styles.userEmail, { color: theme.textSecondary }]}
          >
            {item.email}
          </ThemedText>
          {item.twoFactorEnabled ? (
            <View style={styles.twoFaRow}>
              <Feather name="shield" size={12} color={theme.verified} />
              <ThemedText style={[styles.twoFaText, { color: theme.verified }]}>
                2FA aktiv
              </ThemedText>
            </View>
          ) : null}
        </View>
        <View style={styles.userActions}>
          <RoleBadge role={item.role} size="small" />
          {user?.role === "admin" && item.id !== user.id ? (
            <Pressable
              onPress={() => handleToggleUserActive(item.id)}
              style={[styles.toggleButton, { borderColor: theme.border }]}
            >
              <Feather
                name={item.isActive ? "user-x" : "user-check"}
                size={16}
                color={item.isActive ? theme.error : theme.verified}
              />
            </Pressable>
          ) : null}
        </View>
      </Animated.View>
    ),
    [theme, user, handleToggleUserActive],
  );

  const renderLogItem = useCallback(
    ({ item, index }: { item: ActivityLog; index: number }) => (
      <Animated.View entering={FadeInDown.delay(index * 30).duration(200)}>
        <ActivityItem log={item} />
      </Animated.View>
    ),
    [],
  );

  const renderRegistrationItem = useCallback(
    ({ item, index }: { item: PendingRegistration; index: number }) => (
      <Animated.View
        entering={FadeInDown.delay(index * 50).duration(250)}
        style={[
          styles.pendingCard,
          { backgroundColor: theme.cardBackground, borderColor: theme.border },
        ]}
      >
        <View style={styles.pendingHeader}>
          <View
            style={[styles.categoryBadge, { backgroundColor: theme.warning + "15" }]}
          >
            <ThemedText style={[styles.categoryText, { color: theme.warning }]}>
              REGISTRIERUNG
            </ThemedText>
          </View>
          <ThemedText style={[styles.pendingDate, { color: theme.textSecondary }]}>
            {new Date(item.requestedAt).toLocaleDateString("de-DE")}
          </ThemedText>
        </View>

        <View style={styles.registrationInfo}>
          <ThemedText type="h4" style={styles.registrationName}>
            {item.name}
          </ThemedText>
          <ThemedText style={[styles.registrationEmail, { color: theme.textSecondary }]}>
            {item.email}
          </ThemedText>
        </View>

        <View style={styles.pendingFooter}>
          <ThemedText style={[styles.pendingAuthor, { color: theme.textSecondary }]}>
            Warte auf Freigabe
          </ThemedText>
          <View style={styles.pendingActions}>
            <Pressable
              onPress={() => handleRejectRegistration(item)}
              style={[styles.actionButton, { backgroundColor: theme.error + "15" }]}
            >
              <Feather name="x" size={18} color={theme.error} />
            </Pressable>
            <Pressable
              onPress={() => handleOpenApproveModal(item)}
              style={[styles.actionButton, { backgroundColor: theme.verified + "15" }]}
            >
              <Feather name="check" size={18} color={theme.verified} />
            </Pressable>
          </View>
        </View>
      </Animated.View>
    ),
    [theme, handleRejectRegistration, handleOpenApproveModal],
  );

  const renderContent = () => {
    switch (activeTab) {
      case "pending":
        return pendingInfos.length > 0 ? (
          <FlatList
            data={pendingInfos}
            keyExtractor={(item) => item.id}
            renderItem={renderPendingItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <EmptyState
            icon="check-circle"
            title="Keine ausstehenden Freigaben"
            description="Alle Ergaenzungen wurden bearbeitet"
          />
        );
      case "registrations":
        return pendingRegistrations.length > 0 ? (
          <FlatList
            data={pendingRegistrations}
            keyExtractor={(item) => item.id}
            renderItem={renderRegistrationItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <EmptyState
            icon="user-check"
            title="Keine offenen Registrierungen"
            description="Alle Registrierungsanfragen wurden bearbeitet"
          />
        );
      case "users":
        return (
          <View style={styles.flex1}>
            <FlatList
              data={users}
              keyExtractor={(item) => item.id}
              renderItem={renderUserItem}
              contentContainerStyle={[
                styles.listContent,
                { paddingBottom: 100 },
              ]}
              showsVerticalScrollIndicator={false}
            />
            <FAB
              icon="user-plus"
              onPress={() => setShowAddModal(true)}
              bottom={insets.bottom + Spacing.lg}
            />
          </View>
        );
      case "logs":
        return activityLogs.length > 0 ? (
          <FlatList
            data={activityLogs.slice(0, 100)}
            keyExtractor={(item) => item.id}
            renderItem={renderLogItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <EmptyState
            icon="file-text"
            title="Keine Logs vorhanden"
            description="Es wurden noch keine Aktivitaeten protokolliert"
          />
        );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.tabBar, { paddingTop: headerHeight + Spacing.md }]}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const count = tab.key === "pending" 
            ? pendingInfos.length 
            : tab.key === "registrations" 
              ? pendingRegistrations.length 
              : undefined;

          return (
            <Pressable
              key={tab.key}
              onPress={() => {
                setActiveTab(tab.key);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[
                styles.tab,
                {
                  backgroundColor: isActive ? theme.primary : "transparent",
                  borderColor: isActive ? theme.primary : theme.border,
                },
              ]}
            >
              <Feather
                name={tab.icon}
                size={16}
                color={isActive ? "#FFFFFF" : theme.textSecondary}
              />
              <ThemedText
                style={[
                  styles.tabLabel,
                  { color: isActive ? "#FFFFFF" : theme.text },
                ]}
              >
                {tab.label}
              </ThemedText>
              {count !== undefined && count > 0 ? (
                <View
                  style={[
                    styles.tabBadge,
                    { backgroundColor: isActive ? "#FFFFFF" : theme.pending },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.tabBadgeText,
                      { color: isActive ? theme.primary : "#FFFFFF" },
                    ]}
                  >
                    {count}
                  </ThemedText>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.contentContainer}>{renderContent()}</View>

      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.cardBackground },
            ]}
          >
            <View style={styles.modalHeader}>
              <ThemedText type="h3">Neuen Mitarbeiter anlegen</ThemedText>
              <Pressable
                onPress={() => setShowAddModal(false)}
                style={styles.modalClose}
              >
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <Input
              label="Name"
              placeholder="Vor- und Nachname"
              value={newUserName}
              onChangeText={setNewUserName}
              leftIcon="user"
            />

            <Input
              label="E-Mail"
              placeholder="email@rewe-group.de"
              value={newUserEmail}
              onChangeText={setNewUserEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail"
            />

            <Input
              label="Passwort"
              placeholder="Passwort"
              value={newUserPassword}
              onChangeText={setNewUserPassword}
              secureTextEntry
              leftIcon="lock"
            />

            <ThemedText
              style={[styles.inputLabel, { color: theme.textSecondary }]}
            >
              Rolle
            </ThemedText>
            <View style={styles.roleOptions}>
              {ROLE_OPTIONS.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => setNewUserRole(option.value)}
                  style={[
                    styles.roleOption,
                    {
                      backgroundColor:
                        newUserRole === option.value
                          ? theme.primary
                          : "transparent",
                      borderColor:
                        newUserRole === option.value
                          ? theme.primary
                          : theme.border,
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.roleOptionText,
                      {
                        color:
                          newUserRole === option.value ? "#FFFFFF" : theme.text,
                      },
                    ]}
                  >
                    {option.label}
                  </ThemedText>
                </Pressable>
              ))}
            </View>

            {newUserRole === "user" ? (
              <View style={styles.switchRow}>
                <ThemedText style={styles.switchLabel}>
                  2-Faktor-Authentifizierung
                </ThemedText>
                <Switch
                  value={newUser2FA}
                  onValueChange={setNewUser2FA}
                  trackColor={{
                    false: theme.border,
                    true: theme.primary + "60",
                  }}
                  thumbColor={newUser2FA ? theme.primary : theme.textSecondary}
                />
              </View>
            ) : (
              <View
                style={[
                  styles.infoBox,
                  { backgroundColor: theme.primary + "15" },
                ]}
              >
                <Feather name="shield" size={16} color={theme.primary} />
                <ThemedText
                  style={[styles.infoBoxText, { color: theme.primary }]}
                >
                  2FA ist fuer Admins und Entwickler erforderlich
                </ThemedText>
              </View>
            )}

            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setShowAddModal(false)}
                style={[styles.cancelButton, { borderColor: theme.border }]}
              >
                <ThemedText style={{ color: theme.text }}>Abbrechen</ThemedText>
              </Pressable>
              <Button
                onPress={handleAddUser}
                style={styles.saveButton}
                disabled={
                  isLoading ||
                  !newUserName.trim() ||
                  !newUserEmail.trim() ||
                  !newUserPassword.trim()
                }
              >
                Anlegen
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* Approve Registration Modal */}
      <Modal
        visible={showApproveModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowApproveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.cardBackground },
            ]}
          >
            <View style={styles.modalHeader}>
              <ThemedText type="h3">Registrierung freigeben</ThemedText>
              <Pressable
                onPress={() => setShowApproveModal(false)}
                style={styles.modalClose}
              >
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            {selectedRegistration ? (
              <>
                <View style={[styles.registrationPreview, { backgroundColor: theme.backgroundSecondary }]}>
                  <ThemedText type="h4">{selectedRegistration.name}</ThemedText>
                  <ThemedText style={{ color: theme.textSecondary }}>{selectedRegistration.email}</ThemedText>
                </View>

                <ThemedText
                  style={[styles.inputLabel, { color: theme.textSecondary }]}
                >
                  Rolle zuweisen
                </ThemedText>
                <View style={styles.roleOptions}>
                  {ROLE_OPTIONS.map((option) => (
                    <Pressable
                      key={option.value}
                      onPress={() => setSelectedRole(option.value)}
                      style={[
                        styles.roleOption,
                        {
                          backgroundColor:
                            selectedRole === option.value
                              ? theme.primary
                              : "transparent",
                          borderColor:
                            selectedRole === option.value
                              ? theme.primary
                              : theme.border,
                        },
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.roleOptionText,
                          {
                            color:
                              selectedRole === option.value ? "#FFFFFF" : theme.text,
                          },
                        ]}
                      >
                        {option.label}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>

                <View
                  style={[
                    styles.infoBox,
                    { backgroundColor: theme.primary + "15" },
                  ]}
                >
                  <Feather name="shield" size={16} color={theme.primary} />
                  <ThemedText
                    style={[styles.infoBoxText, { color: theme.primary }]}
                  >
                    2FA wird beim ersten Login eingerichtet (verpflichtend)
                  </ThemedText>
                </View>

                <View style={styles.modalButtons}>
                  <Pressable
                    onPress={() => setShowApproveModal(false)}
                    style={[styles.cancelButton, { borderColor: theme.border }]}
                  >
                    <ThemedText style={{ color: theme.text }}>Abbrechen</ThemedText>
                  </Pressable>
                  <Button
                    onPress={handleApproveRegistration}
                    style={styles.saveButton}
                    disabled={isLoading}
                  >
                    Freigeben
                  </Button>
                </View>
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginLeft: Spacing.xs,
  },
  tabBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.xs,
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  contentContainer: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.lg,
  },
  pendingCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  pendingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  categoryBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  pendingDate: {
    fontSize: 11,
  },
  marketInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  marketName: {
    fontSize: 13,
    marginLeft: Spacing.xs,
  },
  pendingContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  pendingFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pendingAuthor: {
    fontSize: 12,
  },
  pendingActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  userAvatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  userName: {
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
  },
  twoFaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  twoFaText: {
    fontSize: 11,
    marginLeft: 4,
  },
  userActions: {
    alignItems: "flex-end",
    gap: Spacing.sm,
  },
  toggleButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  inactiveBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  inactiveText: {
    fontSize: 10,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: BorderRadius.lg,
    padding: Spacing["2xl"],
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  modalClose: {
    padding: Spacing.xs,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  roleOptions: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  roleOption: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: "center",
  },
  roleOptionText: {
    fontSize: 13,
    fontWeight: "500",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  switchLabel: {
    fontSize: 14,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 13,
    marginLeft: Spacing.sm,
  },
  modalButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButton: {
    flex: 1,
  },
  registrationInfo: {
    marginBottom: Spacing.md,
  },
  registrationName: {
    marginBottom: 2,
  },
  registrationEmail: {
    fontSize: 14,
  },
  registrationPreview: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
    alignItems: "center",
  },
});
