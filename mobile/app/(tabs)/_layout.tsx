import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { useAuthStore } from "@/store/authStore";

type IoniconName = keyof typeof Ionicons.glyphMap;

const tabIcons: Record<string, { active: IoniconName; inactive: IoniconName }> = {
  dashboard: { active: "home", inactive: "home-outline" },
  ledger: { active: "list", inactive: "list-outline" },
  goals: { active: "flag", inactive: "flag-outline" },
  learn: { active: "school", inactive: "school-outline" },
  profile: { active: "person", inactive: "person-outline" },
};

export default function TabsLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#0F172A" },
        headerTintColor: "#FFFFFF",
        tabBarStyle: { backgroundColor: "#0F172A", borderTopColor: "#334155" },
        tabBarActiveTintColor: "#208AEF",
        tabBarInactiveTintColor: "#94A3B8",
      }}
    >
      {Object.entries(tabIcons).map(([name, icons]) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title: name.charAt(0).toUpperCase() + name.slice(1),
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? icons.active : icons.inactive}
                size={size}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}