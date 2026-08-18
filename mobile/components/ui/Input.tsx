import { forwardRef } from "react";
import {
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, helper, leftIcon, rightIcon, editable = true, ...rest },
  ref,
) {
  const hasError = Boolean(error);

  return (
    <View className="w-full">
      {label ? (
        <Text className="mb-1.5 text-sm font-medium text-white">{label}</Text>
      ) : null}

      <View
        className={[
          "flex-row items-center rounded-lg border bg-surface",
          hasError
            ? "border-danger"
            : editable
              ? "border-border"
              : "border-border opacity-60",
        ].join(" ")}
      >
        {leftIcon ? <View className="pl-3">{leftIcon}</View> : null}
        <TextInput
          ref={ref}
          editable={editable}
          placeholderTextColor="#94A3B8"
          className="flex-1 px-3 py-3 text-base text-white"
          {...rest}
        />
        {rightIcon ? <View className="pr-3">{rightIcon}</View> : null}
      </View>

      {hasError ? (
        <Text className="mt-1 text-xs text-danger">{error}</Text>
      ) : helper ? (
        <Text className="mt-1 text-xs text-muted">{helper}</Text>
      ) : null}
    </View>
  );
});