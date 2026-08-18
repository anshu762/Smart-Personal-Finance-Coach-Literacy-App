import { router } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { Button, Card } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";

export default function ProfileScreen() {
  const { user } = useAuth();
  const logout = useAuthStore((state) => state.logout);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
      router.replace("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <View className="flex-1 bg-background p-4">
      <Card className="mb-6">
        <Text className="text-xl font-bold text-white">
          {user?.name ?? "Signed in"}
        </Text>
        <Text className="mt-1 text-sm text-muted">
          {user?.email ?? "Manage your account here."}
        </Text>
      </Card>

      <Button
        title="Sign out"
        variant="danger"
        loading={isLoggingOut}
        disabled={isLoggingOut}
        onPress={() => void handleLogout()}
      />
    </View>
  );
}