import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, Text, View } from "react-native";
import { z } from "zod";
import { Button, Card, ErrorState, Input } from "@/components/ui";
import { useLogin } from "@/hooks/useAuth";
import {
  getErrorIssues,
  getErrorMessage,
  isNetworkError,
} from "@/lib/api";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const login = useLogin();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const networkError = login.isError && isNetworkError(login.error);
  const submitError = login.isError && !networkError ? getErrorMessage(login.error) : null;

  const onSubmit = (values: LoginFormValues) => {
    login.mutate(values, {
      onSuccess: () => {
        router.replace("/dashboard");
      },
      onError: (error) => {
        const issues = getErrorIssues(error);
        if (issues) {
          for (const [field, messages] of Object.entries(issues)) {
            setError(field as keyof LoginFormValues, { message: messages[0] });
          }
        }
      },
    });
  };

  const handleRetry = () => {
    void handleSubmit(onSubmit)();
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="mb-8">
        <Text className="text-3xl font-bold text-white">Smart Finance Coach</Text>
        <Text className="mt-2 text-base text-muted">
          Welcome back. Sign in to continue.
        </Text>
      </View>

      <Card>
        {networkError ? (
          <ErrorState
            title="Connection problem"
            message="We couldn't reach the server. Check your internet connection and try again."
            onRetry={handleRetry}
          />
        ) : (
          <>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email"
                  placeholder="you@example.com"
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  className="mb-4"
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Password"
                  placeholder="••••••••"
                  secureTextEntry
                  textContentType="password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  className="mb-6"
                />
              )}
            />

            {submitError ? (
              <Text className="mb-4 text-sm text-danger">{submitError}</Text>
            ) : null}

            <Button
              title="Sign in"
              fullWidth
              loading={isSubmitting}
              disabled={isSubmitting}
              onPress={handleSubmit(onSubmit)}
            />
          </>
        )}
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