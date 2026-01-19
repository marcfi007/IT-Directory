import React, { useCallback, useState } from "react";
import { FlatList, View, StyleSheet, RefreshControl, Pressable, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeIn, FadeOut } from "react-native-reanimated";
import { SearchBar } from "@/components/SearchBar";
import { MarketCard } from "@/components/MarketCard";
import { EmptyState } from "@/components/EmptyState";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useMarketContext } from "@/contexts/MarketContext";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { Market } from "@/types";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function MarketsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { user } = useAuth();
  const {
    markets,
    isLoading,
    searchQuery,
    setSearchQuery,
    getPendingInfos,
    refresh,
  } = useMarketContext();

  const [showMenu, setShowMenu] = useState(false);
  const pendingInfos = getPendingInfos();

  const handleMarketPress = useCallback((market: Market) => {
    navigation.navigate("MarketDetail", { marketId: market.id });
  }, [navigation]);

  const handleAddMarket = useCallback(() => {
    setShowMenu(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate("AddMarket");
  }, [navigation]);

  const handleAddInfo = useCallback(() => {
    setShowMenu(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate("AddInfo", { marketId: undefined });
  }, [navigation]);

  const toggleMenu = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowMenu(!showMenu);
  }, [showMenu]);

  const renderItem = useCallback(({ item, index }: { item: Market; index: number }) => {
    const hasPendingInfo = pendingInfos.some((info) => info.marketId === item.id);
    return (
      <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
        <MarketCard
          market={item}
          onPress={() => handleMarketPress(item)}
          hasPendingInfo={hasPendingInfo}
        />
      </Animated.View>
    );
  }, [handleMarketPress, pendingInfos]);

  const renderEmpty = useCallback(() => {
    if (isLoading) return null;
    return (
      <EmptyState
        image={require("../../assets/images/empty-markets.png")}
        title="Keine Maerkte gefunden"
        description={searchQuery ? "Versuchen Sie eine andere Suche" : "Es wurden noch keine Maerkte angelegt"}
        actionLabel="Markt hinzufuegen"
        onAction={handleAddMarket}
      />
    );
  }, [isLoading, searchQuery, handleAddMarket]);

  const renderHeader = useCallback(() => (
    <View style={styles.searchContainer}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="WAWI-Nr., Name, Stadt..."
      />
    </View>
  ), [searchQuery, setSearchQuery]);

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={markets}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerHeight + Spacing.md,
            paddingBottom: tabBarHeight + 80,
          },
          markets.length === 0 ? styles.emptyContent : null,
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            tintColor={theme.primary}
            progressViewOffset={headerHeight}
          />
        }
      />

      {showMenu ? (
        <Pressable 
          style={styles.menuOverlay} 
          onPress={() => setShowMenu(false)}
        >
          <Animated.View 
            entering={FadeIn.duration(150)}
            exiting={FadeOut.duration(100)}
            style={[styles.menuContainer, { bottom: tabBarHeight + 80 }]}
          >
            <Pressable
              onPress={handleAddMarket}
              style={[styles.menuItem, { backgroundColor: theme.cardBackground }, Shadows.card]}
            >
              <View style={[styles.menuIcon, { backgroundColor: theme.primary }]}>
                <Feather name="shopping-bag" size={18} color="#FFFFFF" />
              </View>
              <ThemedText style={styles.menuLabel}>Neuen Markt anlegen</ThemedText>
            </Pressable>
            <Pressable
              onPress={handleAddInfo}
              style={[styles.menuItem, { backgroundColor: theme.cardBackground }, Shadows.card]}
            >
              <View style={[styles.menuIcon, { backgroundColor: theme.accent }]}>
                <Feather name="file-plus" size={18} color="#FFFFFF" />
              </View>
              <ThemedText style={styles.menuLabel}>Info hinzufuegen</ThemedText>
            </Pressable>
          </Animated.View>
        </Pressable>
      ) : null}

      <Pressable
        onPress={toggleMenu}
        style={[
          styles.fab,
          { 
            backgroundColor: showMenu ? theme.error : theme.primary, 
            bottom: tabBarHeight + Spacing.lg,
          },
          Shadows.fab,
        ]}
      >
        <Feather 
          name={showMenu ? "x" : "plus"} 
          size={24} 
          color="#FFFFFF" 
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  emptyContent: {
    flexGrow: 1,
  },
  searchContainer: {
    marginBottom: Spacing.lg,
  },
  menuOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  menuContainer: {
    position: "absolute",
    right: Spacing.lg,
    gap: Spacing.sm,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    minWidth: 200,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  fab: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});
