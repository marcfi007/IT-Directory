import React, { useCallback } from "react";
import { FlatList, View, StyleSheet, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SearchBar } from "@/components/SearchBar";
import { MarketCard } from "@/components/MarketCard";
import { EmptyState } from "@/components/EmptyState";
import { FAB } from "@/components/FAB";
import { useTheme } from "@/hooks/useTheme";
import { useMarketContext } from "@/contexts/MarketContext";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing } from "@/constants/theme";
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

  const pendingInfos = getPendingInfos();

  const handleMarketPress = useCallback((market: Market) => {
    navigation.navigate("MarketDetail", { marketId: market.id });
  }, [navigation]);

  const handleAddInfo = useCallback(() => {
    navigation.navigate("AddInfo", { marketId: undefined });
  }, [navigation]);

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
      />
    );
  }, [isLoading, searchQuery]);

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
      <FAB icon="plus" onPress={handleAddInfo} bottom={tabBarHeight + Spacing.lg} />
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
});
