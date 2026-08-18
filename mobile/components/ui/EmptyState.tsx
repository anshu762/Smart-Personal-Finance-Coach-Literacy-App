import { StyleProp, Text, View, ViewStyle } from "react-native";

export interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function EmptyState({
  title,
  message,
  icon,
  action,
  style,
}: EmptyStateProps) {
  return (
    <View
      className="items-center justify-center px-8 py-12"
      style={style}
    >
      {icon ? <View className="mb-4">{icon}</View> : null}
      <Text className="text-center text-lg font-semibold text-white">
        {title}
      </Text>
      {message ? (
        <Text className="mt-2 text-center text-sm text-muted">{message}</Text>
      ) : null}
      {action ? <View className="mt-6">{action}</View> : null}
    </View>
  );
}