import { Link } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { Button, Card, Input } from "@/components/ui";

export default function SignupScreen() {
  // TODO(phase 2): wire form state + signup mutation from useAuth.
  const handleSignup = () => {
    // placeholder
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="mb-8">
        <Text className="text-3xl font-bold text-white">Create account</Text>
        <Text className="mt-2 text-base text-muted">
          Start building better money habits today.
        </Text>
      </View>

      <Card>
        <Input
          label="Name"
          placeholder="Your name"
          className="mb-4"
        />
        <Input
          label="Email"
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          className="mb-4"
        />
        <Input
          label="Password"
          placeholder="At least 8 characters"
          secureTextEntry
          className="mb-6"
        />

        <Button title="Create account" onPress={handleSignup} fullWidth />
      </Card>

      <View className="mt-6 flex-row justify-center">
        <Text className="text-sm text-muted">Already have an account? </Text>
        <Link href="/(auth)/login" className="text-sm font-semibold text-primary">
          Sign in
        </Link>
      </View>
    </ScrollView>
  );
}