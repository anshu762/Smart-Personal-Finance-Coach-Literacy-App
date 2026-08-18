import { StyleProp, Text, View, ViewStyle } from "react-native";
import { Button } from "./Button";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load this content. Check your connection and try again.",
  onRetry,
  style,
}: ErrorStateProps) {
  return (
    <View
      className="items-center justify-center px-8 py-12"
      style={style}
    >
      <Text className="text-center text-lg font-semibold text-white">
        {title}
      </Text>
      {message ? (
        <Text className="mt-2 text-center text-sm text-muted">{message}</Text>
      ) : null}
      {onRetry ? (
        <View className="mt-6">
          <Button title="Try again" variant="outline" onPress={onRetry} />
        </View>
      ) : null}
    </View>
  );
}