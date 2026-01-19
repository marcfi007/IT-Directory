import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ActivityScreen from "@/screens/ActivityScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type ActivityStackParamList = {
  Activity: undefined;
};

const Stack = createNativeStackNavigator<ActivityStackParamList>();

export default function ActivityStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Activity"
        component={ActivityScreen}
        options={{
          headerTitle: "Aktivitaet",
        }}
      />
    </Stack.Navigator>
  );
}
