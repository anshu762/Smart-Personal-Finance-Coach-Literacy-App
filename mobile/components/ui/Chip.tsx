import { Pressable, Text, View } from "react-native";

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export function Chip({
  label,
  selected = false,
  onPress,
  disabled = false,
  icon,
}: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      className={[
        "flex-row items-center rounded-full border px-3.5 py-1.5",
        selected ? "border-primary bg-primary" : "border-border bg-surface",
        disabled ? "opacity-50" : "active:opacity-80",
      ].join(" ")}
    >
      {icon ? <View className="mr-1.5">{icon}</View> : null}
      <Text
        className={[
          "text-sm font-medium",
          selected ? "text-white" : "text-muted",
        ].join(" ")}
      >
        {label}
      </Text>
    </Pressable>
  );
}