import { Link, useRouter } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { Button, Card, Input } from "@/components/ui";

export default function LoginScreen() {
  const router = useRouter();

  // TODO(phase 2): wire form state + login mutation from useAuth.
  const handleLogin = () => {
    router.replace("/(tabs)");
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="mb-8">
        <Text className="text-3xl font-bold text-white">
          Smart Finance Coach
        </Text>
        <Text className="mt-2 text-base text-muted">
          Welcome back. Sign in to continue.
        </Text>
      </View>

      <Card>
        <Input
          label="Email"
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          className="mb-4"
        />
        <Input
          label="Password"
          placeholder="••••••••"
          secureTextEntry
          className="mb-6"
        />

        <Button title="Sign in" onPress={handleLogin} fullWidth />
      </Card>

      <View className="mt-6 flex-row justify-center">
        <Text className="text-sm text-muted">Don't have an account? </Text>
        <Link href="/(auth)/signup" className="text-sm font-semibold text-primary">
          Sign up
        </Link>
      </View>
    </ScrollView>
  );
}