import React, { useCallback } from "react";
import { FlatList, View, StyleSheet, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ActivityItem } from "@/components/ActivityItem";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { useMarketContext } from "@/contexts/MarketContext";
import { Spacing } from "@/constants/theme";
import { ActivityLog } from "@/types";

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { activityLogs, isLoading, refresh } = useMarketContext();

  const renderItem = useCallback(
    ({ item, index }: { item: ActivityLog; index: number }) => (
      <Animated.View entering={FadeInDown.delay(index * 30).duration(250)}>
        <ActivityItem log={item} />
      </Animated.View>
    ),
    [],
  );

  const renderEmpty = useCallback(() => {
    if (isLoading) return null;
    return (
      <EmptyState
        image={require("../../assets/images/empty-activity.png")}
        title="Keine Aktivitaeten"
        description="Es wurden noch keine Aktionen protokolliert"
      />
    );
  }, [isLoading]);

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={activityLogs}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerHeight + Spacing.md,
            paddingBottom: tabBarHeight + Spacing.lg,
          },
          activityLogs.length === 0 ? styles.emptyContent : null,
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
});
