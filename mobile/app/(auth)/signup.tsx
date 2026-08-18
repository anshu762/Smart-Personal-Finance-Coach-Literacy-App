import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, Text, View } from "react-native";
import { z } from "zod";
import { Button, Card, ErrorState, Input } from "@/components/ui";
import { useSignup } from "@/hooks/useAuth";
import {
  getErrorCode,
  getErrorIssues,
  getErrorMessage,
  isNetworkError,
} from "@/lib/api";

const signupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .min(2, "Name must be at least 2 characters"),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Enter a valid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupScreen() {
  const signup = useSignup();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const networkError = signup.isError && isNetworkError(signup.error);
  const submitError =
    signup.isError && !networkError ? getErrorMessage(signup.error) : null;

  const onSubmit = (values: SignupFormValues) => {
    signup.mutate(
      {
        name: values.name,
        email: values.email,
        password: values.password,
      },
      {
        onSuccess: () => {
          router.replace("/dashboard");
        },
        onError: (error) => {
          if (getErrorCode(error) === "EMAIL_TAKEN") {
            setError("email", {
              message: "An account with this email already exists",
            });
            return;
          }

          const issues = getErrorIssues(error);
          if (issues) {
            for (const [field, messages] of Object.entries(issues)) {
              setError(field as keyof SignupFormValues, {
                message: messages[0],
              });
            }
          }
        },
      },
    );
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
        <Text className="text-3xl font-bold text-white">Create account</Text>
        <Text className="mt-2 text-base text-muted">
          Start building better money habits today.
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
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Name"
                  placeholder="Your name"
                  autoComplete="name"
                  textContentType="name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
                  className="mb-4"
                />
              )}
            />

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
                  placeholder="At least 8 characters"
                  secureTextEntry
                  textContentType="newPassword"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  className="mb-4"
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Confirm password"
                  placeholder="Repeat your password"
                  secureTextEntry
                  textContentType="newPassword"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.confirmPassword?.message}
                  className="mb-6"
                />
              )}
            />

            {submitError ? (
              <Text className="mb-4 text-sm text-danger">{submitError}</Text>
            ) : null}

            <Button
              title="Create account"
              fullWidth
              loading={isSubmitting}
              disabled={isSubmitting}
              onPress={handleSubmit(onSubmit)}
            />
          </>
        )}
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