import React, { useMemo, useState } from "react";
import { View, StyleSheet, ScrollView, Modal, TextInput, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Barcode from "@kichiyaki/react-native-barcode-generator";
import { ThemedText } from "@/components/ThemedText";
import { InfoSection } from "@/components/InfoSection";
import { InfoRow } from "@/components/InfoRow";
import { FAB } from "@/components/FAB";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useTheme } from "@/hooks/useTheme";
import { useMarketContext } from "@/contexts/MarketContext";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type RouteParams = RouteProp<RootStackParamList, "MarketDetail">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function MarketDetailScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const route = useRoute<RouteParams>();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { getMarketById, getMarketInfos, updateDoorCode, deleteMarket, updateMarket, deleteMarketInfo } = useMarketContext();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditMarketModal, setShowEditMarketModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newDoorCode, setNewDoorCode] = useState("");
  
  // Edit market form state
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editContactPerson, setEditContactPerson] = useState("");
  const [editParkingInfo, setEditParkingInfo] = useState("");
  const [editEgateAccess, setEditEgateAccess] = useState("");
  const [editEgateBarcode, setEditEgateBarcode] = useState("");
  const [editServerLocation, setEditServerLocation] = useState("");
  const [editSwitchRouterLocation, setEditSwitchRouterLocation] = useState("");
  const [editSpecialNotes, setEditSpecialNotes] = useState("");
  const [editFreeTextNotes, setEditFreeTextNotes] = useState("");
  
  const isAdmin = user?.role === "admin";

  const market = getMarketById(route.params.marketId);
  const marketInfos = useMemo(
    () => getMarketInfos(route.params.marketId),
    [getMarketInfos, route.params.marketId]
  );

  const pendingInfos = marketInfos.filter((i) => i.status === "pending");
  const approvedInfos = marketInfos.filter((i) => i.status === "approved");

  const handleAddInfo = () => {
    navigation.navigate("AddInfo", { marketId: route.params.marketId });
  };

  const handleEditDoorCode = () => {
    setNewDoorCode(market?.doorCodes?.replace("encrypted:", "") || "");
    setShowEditModal(true);
  };

  const handleSaveDoorCode = async () => {
    if (!user || !market || !newDoorCode.trim()) return;
    
    await updateDoorCode(market.id, `encrypted:${newDoorCode.trim()}`, user.id, user.name);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowEditModal(false);
    setNewDoorCode("");
  };

  const handleOpenEditMarket = () => {
    if (!market) return;
    setEditName(market.name);
    setEditAddress(market.address);
    setEditCity(market.city);
    setEditContactPerson(market.contactPerson || "");
    setEditParkingInfo(market.parkingInfo || "");
    setEditEgateAccess(market.egateAccess || "");
    setEditEgateBarcode(market.egateBarcode || "");
    setEditServerLocation(market.serverLocation || "");
    setEditSwitchRouterLocation(market.switchRouterLocation || "");
    setEditSpecialNotes(market.specialNotes || "");
    setEditFreeTextNotes(market.freeTextNotes || "");
    setShowEditMarketModal(true);
  };

  const handleSaveMarket = async () => {
    if (!user || !market || !editName.trim() || !editAddress.trim() || !editCity.trim()) return;
    
    await updateMarket(
      market.id,
      {
        name: editName.trim(),
        address: editAddress.trim(),
        city: editCity.trim(),
        contactPerson: editContactPerson.trim() || undefined,
        parkingInfo: editParkingInfo.trim() || undefined,
        egateAccess: editEgateAccess.trim() || undefined,
        egateBarcode: editEgateBarcode.trim() || undefined,
        serverLocation: editServerLocation.trim() || undefined,
        switchRouterLocation: editSwitchRouterLocation.trim() || undefined,
        specialNotes: editSpecialNotes.trim() || undefined,
        freeTextNotes: editFreeTextNotes.trim() || undefined,
      },
      user.id,
      user.name
    );
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowEditMarketModal(false);
  };

  const handleDeleteMarket = async () => {
    if (!user || !market) return;
    
    await deleteMarket(market.id, user.id, user.name);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowDeleteModal(false);
    navigation.goBack();
  };

  const handleDeleteInfo = async (infoId: string) => {
    if (!user) return;
    
    Alert.alert(
      "Info loeschen",
      "Moechten Sie diese Information wirklich loeschen?",
      [
        { text: "Abbrechen", style: "cancel" },
        { 
          text: "Loeschen", 
          style: "destructive",
          onPress: async () => {
            await deleteMarketInfo(infoId, user.id, user.name);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        },
      ]
    );
  };

  if (!market) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <ThemedText style={styles.notFound}>Markt nicht gefunden</ThemedText>
      </View>
    );
  }

  const doorCodeValue = market.doorCodes?.replace("encrypted:", "") || "";

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: headerHeight + Spacing.md, paddingBottom: insets.bottom + 80 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <View style={styles.wawiRow}>
              <ThemedText style={[styles.wawiLabel, { color: theme.textSecondary }]}>
                WAWI-Nr.
              </ThemedText>
              <ThemedText style={[styles.wawiNumber, { color: theme.primary }]}>
                {market.wawiNumber}
              </ThemedText>
            </View>
            {isAdmin ? (
              <View style={styles.adminActions}>
                <Pressable 
                  onPress={handleOpenEditMarket}
                  style={[styles.adminButton, { backgroundColor: theme.primary + "15" }]}
                >
                  <Feather name="edit-2" size={16} color={theme.primary} />
                </Pressable>
                <Pressable 
                  onPress={() => setShowDeleteModal(true)}
                  style={[styles.adminButton, { backgroundColor: theme.error + "15" }]}
                >
                  <Feather name="trash-2" size={16} color={theme.error} />
                </Pressable>
              </View>
            ) : null}
          </View>
          <ThemedText type="h2" style={styles.marketName}>
            {market.name}
          </ThemedText>
          <View style={styles.addressRow}>
            <Feather name="map-pin" size={16} color={theme.textSecondary} />
            <ThemedText style={[styles.address, { color: theme.textSecondary }]}>
              {market.address}, {market.city}
            </ThemedText>
          </View>
          {market.contactPerson ? (
            <View style={styles.contactRow}>
              <Feather name="user" size={16} color={theme.textSecondary} />
              <ThemedText style={[styles.contact, { color: theme.textSecondary }]}>
                {market.contactPerson}
              </ThemedText>
            </View>
          ) : null}
        </View>

        <InfoSection title="Parkplatz & Zugang" icon="navigation" isSecure defaultExpanded>
          {market.parkingInfo ? (
            <InfoRow label="Parkplatz-Info" value={market.parkingInfo} copyable />
          ) : null}
          {market.doorCodes ? (
            <InfoRow 
              label="Tuercodes" 
              value={doorCodeValue} 
              isEncrypted 
              copyable
              editable
              onEdit={handleEditDoorCode}
              history={market.doorCodesHistory?.map(h => ({
                value: h.value.replace("encrypted:", ""),
                date: h.date,
                user: h.user,
              })) || []}
            />
          ) : (
            <View style={styles.addCodeContainer}>
              <ThemedText style={[styles.noData, { color: theme.textSecondary }]}>
                Kein Tuercode hinterlegt
              </ThemedText>
              <Pressable 
                onPress={handleEditDoorCode}
                style={[styles.addCodeButton, { backgroundColor: theme.primary + "15" }]}
              >
                <Feather name="plus" size={14} color={theme.primary} />
                <ThemedText style={[styles.addCodeText, { color: theme.primary }]}>
                  Code hinzufuegen
                </ThemedText>
              </Pressable>
            </View>
          )}
          {market.egateAccess ? (
            <InfoRow label="eGate-Zugang" value={market.egateAccess} copyable />
          ) : null}
        </InfoSection>

        <InfoSection title="IT-Infrastruktur" icon="server">
          {market.serverLocation ? (
            <InfoRow label="Server-Standort" value={market.serverLocation} copyable />
          ) : null}
          {market.switchRouterLocation ? (
            <InfoRow label="Switch/Router" value={market.switchRouterLocation} copyable />
          ) : null}
          {market.specialNotes ? (
            <InfoRow label="Besonderheiten" value={market.specialNotes} copyable />
          ) : null}
          {!market.serverLocation && !market.switchRouterLocation && !market.specialNotes ? (
            <ThemedText style={[styles.noData, { color: theme.textSecondary }]}>
              Keine IT-Infos vorhanden
            </ThemedText>
          ) : null}
        </InfoSection>

        <InfoSection title="Barcodes" icon="maximize">
          {market.egateBarcode ? (
            <View style={styles.barcodeContainer}>
              <ThemedText style={[styles.barcodeLabel, { color: theme.textSecondary }]}>
                eGate Barcode
              </ThemedText>
              <View style={[styles.barcodeWrapper, { backgroundColor: "#FFFFFF" }]}>
                <Barcode 
                  value={market.egateBarcode} 
                  format="CODE128"
                  width={2}
                  height={60}
                  background="#FFFFFF"
                  lineColor="#000000"
                />
              </View>
              <ThemedText style={[styles.barcodeValue, { color: theme.text }]}>
                {market.egateBarcode}
              </ThemedText>
            </View>
          ) : null}
          {market.barcodeInfo ? (
            <InfoRow label="Scanner-Info" value={market.barcodeInfo} copyable />
          ) : null}
          {!market.egateBarcode && !market.barcodeInfo ? (
            <ThemedText style={[styles.noData, { color: theme.textSecondary }]}>
              Keine Barcode-Infos vorhanden
            </ThemedText>
          ) : null}
        </InfoSection>

        {market.freeTextNotes ? (
          <InfoSection title="Notizen" icon="file-text">
            <ThemedText style={styles.notes}>{market.freeTextNotes}</ThemedText>
          </InfoSection>
        ) : null}

        {approvedInfos.length > 0 || pendingInfos.length > 0 ? (
          <InfoSection title="Ergaenzungen" icon="message-circle">
            {approvedInfos.map((info) => (
              <View key={info.id} style={[styles.infoCard, { backgroundColor: theme.backgroundSecondary }]}>
                <View style={styles.infoHeader}>
                  <View style={[styles.statusBadge, { backgroundColor: theme.verified + "20" }]}>
                    <Feather name="check" size={12} color={theme.verified} />
                    <ThemedText style={[styles.statusText, { color: theme.verified }]}>
                      Freigegeben
                    </ThemedText>
                  </View>
                  <View style={styles.infoHeaderRight}>
                    <ThemedText style={[styles.infoDate, { color: theme.textSecondary }]}>
                      {new Date(info.createdAt).toLocaleDateString("de-DE")}
                    </ThemedText>
                    {isAdmin ? (
                      <Pressable 
                        onPress={() => handleDeleteInfo(info.id)}
                        style={[styles.deleteInfoButton, { backgroundColor: theme.error + "15" }]}
                      >
                        <Feather name="trash-2" size={14} color={theme.error} />
                      </Pressable>
                    ) : null}
                  </View>
                </View>
                {info.category === "barcode" && info.barcodeValue ? (
                  <View style={styles.infoBarcodeContainer}>
                    <View style={[styles.infoBarcodeWrapper, { backgroundColor: "#FFFFFF" }]}>
                      <Barcode 
                        value={info.barcodeValue} 
                        format="CODE128"
                        width={1.5}
                        height={40}
                        background="#FFFFFF"
                        lineColor="#000000"
                      />
                    </View>
                    <ThemedText style={[styles.infoBarcodeValue, { color: theme.text }]}>
                      {info.barcodeValue}
                    </ThemedText>
                    {info.content.includes(" - ") ? (
                      <ThemedText style={[styles.infoContent, { marginTop: Spacing.sm }]}>
                        {info.content.split(" - ").slice(1).join(" - ")}
                      </ThemedText>
                    ) : null}
                  </View>
                ) : (
                  <ThemedText style={styles.infoContent}>{info.content}</ThemedText>
                )}
                <ThemedText style={[styles.infoAuthor, { color: theme.textSecondary }]}>
                  von {info.createdByName}
                </ThemedText>
              </View>
            ))}
            {pendingInfos.map((info) => (
              <View key={info.id} style={[styles.infoCard, { backgroundColor: theme.backgroundSecondary }]}>
                <View style={styles.infoHeader}>
                  <View style={[styles.statusBadge, { backgroundColor: theme.pending + "20" }]}>
                    <Feather name="clock" size={12} color={theme.pending} />
                    <ThemedText style={[styles.statusText, { color: theme.pending }]}>
                      Ausstehend
                    </ThemedText>
                  </View>
                  <View style={styles.infoHeaderRight}>
                    <ThemedText style={[styles.infoDate, { color: theme.textSecondary }]}>
                      {new Date(info.createdAt).toLocaleDateString("de-DE")}
                    </ThemedText>
                    {isAdmin ? (
                      <Pressable 
                        onPress={() => handleDeleteInfo(info.id)}
                        style={[styles.deleteInfoButton, { backgroundColor: theme.error + "15" }]}
                      >
                        <Feather name="trash-2" size={14} color={theme.error} />
                      </Pressable>
                    ) : null}
                  </View>
                </View>
                {info.category === "barcode" && info.barcodeValue ? (
                  <View style={styles.infoBarcodeContainer}>
                    <View style={[styles.infoBarcodeWrapper, { backgroundColor: "#FFFFFF" }]}>
                      <Barcode 
                        value={info.barcodeValue} 
                        format="CODE128"
                        width={1.5}
                        height={40}
                        background="#FFFFFF"
                        lineColor="#000000"
                      />
                    </View>
                    <ThemedText style={[styles.infoBarcodeValue, { color: theme.text }]}>
                      {info.barcodeValue}
                    </ThemedText>
                    {info.content.includes(" - ") ? (
                      <ThemedText style={[styles.infoContent, { marginTop: Spacing.sm }]}>
                        {info.content.split(" - ").slice(1).join(" - ")}
                      </ThemedText>
                    ) : null}
                  </View>
                ) : (
                  <ThemedText style={styles.infoContent}>{info.content}</ThemedText>
                )}
                <ThemedText style={[styles.infoAuthor, { color: theme.textSecondary }]}>
                  von {info.createdByName}
                </ThemedText>
              </View>
            ))}
          </InfoSection>
        ) : null}

        <View style={[styles.metaSection, { borderTopColor: theme.border }]}>
          <View style={styles.metaRow}>
            <ThemedText style={[styles.metaLabel, { color: theme.textSecondary }]}>
              Erstellt
            </ThemedText>
            <ThemedText style={[styles.metaValue, { color: theme.text }]}>
              {new Date(market.createdAt).toLocaleDateString("de-DE")}
            </ThemedText>
          </View>
          <View style={styles.metaRow}>
            <ThemedText style={[styles.metaLabel, { color: theme.textSecondary }]}>
              Aktualisiert
            </ThemedText>
            <ThemedText style={[styles.metaValue, { color: theme.text }]}>
              {new Date(market.updatedAt).toLocaleDateString("de-DE")}
            </ThemedText>
          </View>
        </View>
      </ScrollView>

      <FAB icon="plus" onPress={handleAddInfo} bottom={insets.bottom + Spacing.lg} />

      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="h3">Tuercode bearbeiten</ThemedText>
              <Pressable onPress={() => setShowEditModal(false)} style={styles.modalClose}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <View style={[styles.infoBox, { backgroundColor: theme.warning + "15" }]}>
              <Feather name="alert-triangle" size={16} color={theme.warning} />
              <ThemedText style={[styles.infoBoxText, { color: theme.warning }]}>
                Der alte Code wird im Verlauf gespeichert (sichtbar in Rot).
              </ThemedText>
            </View>

            <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>
              Neuer Tuercode
            </ThemedText>
            <TextInput
              style={[
                styles.modalInput,
                { 
                  backgroundColor: theme.backgroundSecondary, 
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              value={newDoorCode}
              onChangeText={setNewDoorCode}
              placeholder="z.B. 4521"
              placeholderTextColor={theme.textSecondary}
              keyboardType="default"
              autoFocus
            />

            <View style={styles.modalButtons}>
              <Pressable 
                onPress={() => setShowEditModal(false)}
                style={[styles.cancelButton, { borderColor: theme.border }]}
              >
                <ThemedText style={{ color: theme.text }}>Abbrechen</ThemedText>
              </Pressable>
              <Button 
                onPress={handleSaveDoorCode} 
                style={styles.saveButton}
                disabled={!newDoorCode.trim()}
              >
                Speichern
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Market Modal - Admin Only */}
      <Modal
        visible={showEditMarketModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditMarketModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView 
            style={styles.editModalScroll}
            contentContainerStyle={styles.editModalScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.modalContent, styles.editModalContent, { backgroundColor: theme.cardBackground }]}>
              <View style={styles.modalHeader}>
                <ThemedText type="h3">Markt bearbeiten</ThemedText>
                <Pressable onPress={() => setShowEditMarketModal(false)} style={styles.modalClose}>
                  <Feather name="x" size={24} color={theme.text} />
                </Pressable>
              </View>

              <Input
                label="Marktname *"
                placeholder="z.B. MediaMarkt Berlin Mitte"
                value={editName}
                onChangeText={setEditName}
                leftIcon="shopping-bag"
              />

              <Input
                label="Adresse *"
                placeholder="z.B. Alexanderplatz 1"
                value={editAddress}
                onChangeText={setEditAddress}
                leftIcon="map-pin"
              />

              <Input
                label="Stadt *"
                placeholder="z.B. Berlin"
                value={editCity}
                onChangeText={setEditCity}
                leftIcon="map"
              />

              <Input
                label="Ansprechpartner"
                placeholder="z.B. Herr Mueller"
                value={editContactPerson}
                onChangeText={setEditContactPerson}
                leftIcon="user"
              />

              <Input
                label="Parkplatz-Info"
                placeholder="z.B. Tiefgarage Einfahrt links"
                value={editParkingInfo}
                onChangeText={setEditParkingInfo}
                leftIcon="navigation"
              />

              <Input
                label="eGate-Zugang"
                placeholder="z.B. Badge + PIN"
                value={editEgateAccess}
                onChangeText={setEditEgateAccess}
                leftIcon="key"
              />

              <Input
                label="eGate-Barcode"
                placeholder="z.B. MM1006MITTE"
                value={editEgateBarcode}
                onChangeText={setEditEgateBarcode}
                leftIcon="maximize"
              />

              <Input
                label="Server-Standort"
                placeholder="z.B. Serverraum UG, Rack 3"
                value={editServerLocation}
                onChangeText={setEditServerLocation}
                leftIcon="server"
              />

              <Input
                label="Switch/Router Standort"
                placeholder="z.B. Hauptverteiler EG"
                value={editSwitchRouterLocation}
                onChangeText={setEditSwitchRouterLocation}
                leftIcon="git-branch"
              />

              <Input
                label="Besonderheiten"
                placeholder="z.B. VLAN 10 fuer Kassen"
                value={editSpecialNotes}
                onChangeText={setEditSpecialNotes}
                leftIcon="alert-circle"
              />

              <Input
                label="Freitext-Notizen"
                placeholder="Weitere Informationen..."
                value={editFreeTextNotes}
                onChangeText={setEditFreeTextNotes}
                leftIcon="file-text"
              />

              <View style={styles.modalButtons}>
                <Pressable 
                  onPress={() => setShowEditMarketModal(false)}
                  style={[styles.cancelButton, { borderColor: theme.border }]}
                >
                  <ThemedText style={{ color: theme.text }}>Abbrechen</ThemedText>
                </Pressable>
                <Button 
                  onPress={handleSaveMarket} 
                  style={styles.saveButton}
                  disabled={!editName.trim() || !editAddress.trim() || !editCity.trim()}
                >
                  Speichern
                </Button>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Delete Confirmation Modal - Admin Only */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="h3">Markt loeschen</ThemedText>
              <Pressable onPress={() => setShowDeleteModal(false)} style={styles.modalClose}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <View style={[styles.infoBox, { backgroundColor: theme.error + "15" }]}>
              <Feather name="alert-triangle" size={16} color={theme.error} />
              <ThemedText style={[styles.infoBoxText, { color: theme.error }]}>
                Diese Aktion kann nicht rueckgaengig gemacht werden! Alle Daten zu diesem Markt werden unwiderruflich geloescht.
              </ThemedText>
            </View>

            <ThemedText style={[styles.deleteConfirmText, { color: theme.text }]}>
              Moechten Sie den Markt "{market.name}" wirklich loeschen?
            </ThemedText>

            <View style={styles.modalButtons}>
              <Pressable 
                onPress={() => setShowDeleteModal(false)}
                style={[styles.cancelButton, { borderColor: theme.border }]}
              >
                <ThemedText style={{ color: theme.text }}>Abbrechen</ThemedText>
              </Pressable>
              <Button 
                onPress={handleDeleteMarket} 
                style={[styles.saveButton, { backgroundColor: theme.error }]}
              >
                Loeschen
              </Button>
            </View>
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
  content: {
    paddingHorizontal: Spacing.lg,
  },
  notFound: {
    textAlign: "center",
    marginTop: 100,
  },
  header: {
    marginBottom: Spacing["2xl"],
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  adminActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  adminButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  wawiRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  wawiLabel: {
    fontSize: 12,
    marginRight: Spacing.xs,
  },
  wawiNumber: {
    fontSize: 16,
    fontWeight: "700",
  },
  marketName: {
    marginBottom: Spacing.sm,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  address: {
    fontSize: 14,
    marginLeft: Spacing.sm,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  contact: {
    fontSize: 14,
    marginLeft: Spacing.sm,
  },
  noData: {
    fontStyle: "italic",
    fontSize: 14,
  },
  addCodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  addCodeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  addCodeText: {
    fontSize: 13,
    fontWeight: "500",
    marginLeft: 4,
  },
  barcodeContainer: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  barcodeLabel: {
    fontSize: 12,
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  barcodeWrapper: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
    minWidth: 200,
    alignItems: "center",
  },
  barcodeValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  notes: {
    fontSize: 15,
    lineHeight: 24,
  },
  infoCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  infoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  infoHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  deleteInfoButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 4,
  },
  infoDate: {
    fontSize: 11,
  },
  infoContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.xs,
  },
  infoBarcodeContainer: {
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  infoBarcodeWrapper: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.xs,
  },
  infoBarcodeValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  infoAuthor: {
    fontSize: 12,
  },
  metaSection: {
    borderTopWidth: 1,
    paddingTop: Spacing.lg,
    marginTop: Spacing.md,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  metaLabel: {
    fontSize: 13,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: "500",
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
    lineHeight: 18,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  modalInput: {
    height: 48,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
    marginBottom: Spacing.lg,
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
  editModalScroll: {
    flex: 1,
    width: "100%",
  },
  editModalScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: Spacing.lg,
  },
  editModalContent: {
    maxHeight: "100%",
  },
  deleteConfirmText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
});
