import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToastStore, type ToastType } from "@/store/toastStore";

const typeStyles: Record<ToastType, string> = {
  success: "bg-success",
  error: "bg-danger",
  info: "bg-primary",
};

export function Toast() {
  const insets = useSafeAreaInsets();
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  return (
    <View
      pointerEvents="box-none"
      className="absolute left-0 right-0 z-50 px-4"
      style={{ top: insets.top + 8 }}
    >
      {toasts.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => dismiss(item.id)}
          className={[
            "mb-2 rounded-lg px-4 py-3 shadow-lg active:opacity-90",
            typeStyles[item.type],
          ].join(" ")}
        >
          <Text className="text-sm font-medium text-white">
            {item.message}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}