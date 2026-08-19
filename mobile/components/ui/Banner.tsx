import { StyleProp, Text, View, ViewStyle } from "react-native";

export type BannerVariant = "warning" | "info" | "danger";

export interface BannerProps {
  message: string;
  variant?: BannerVariant;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const variantStyles: Record<BannerVariant, string> = {
  warning: "bg-warning",
  info: "bg-primary",
  danger: "bg-danger",
};

export function Banner({ message, variant = "warning", icon, style }: BannerProps) {
  return (
    <View
      className={[
        "flex-row items-center rounded-lg px-4 py-3",
        variantStyles[variant],
      ].join(" ")}
      style={style}
    >
      {icon ? <View className="mr-2">{icon}</View> : null}
      <Text className="flex-1 text-sm font-medium text-white">{message}</Text>
    </View>
  );
}