import { forwardRef } from "react";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleProp,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<PressableProps, "style" | "children"> {
  title: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
}

const variantStyles: Record<Variant, { container: string; text: string }> = {
  primary: { container: "bg-primary", text: "text-white" },
  secondary: { container: "bg-surface border border-border", text: "text-white" },
  outline: { container: "border border-primary bg-transparent", text: "text-primary" },
  ghost: { container: "bg-transparent", text: "text-primary" },
  danger: { container: "bg-danger", text: "text-white" },
};

const sizeStyles: Record<Size, { container: string; text: string }> = {
  sm: { container: "px-3 py-2", text: "text-sm" },
  md: { container: "px-5 py-3", text: "text-base" },
  lg: { container: "px-6 py-4", text: "text-lg" },
};

export const Button = forwardRef<View, ButtonProps>(function Button(
  {
    title,
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    style,
    titleStyle,
    ...rest
  },
  ref,
) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      ref={ref}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      className={[
        "flex-row items-center justify-center rounded-lg active:opacity-80",
        variantStyles[variant].container,
        sizeStyles[size].container,
        fullWidth ? "w-full" : "self-start",
        isDisabled ? "opacity-50" : "",
      ].join(" ")}
      style={style}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" || variant === "danger" ? "#FFFFFF" : "#208AEF"}
          size="small"
        />
      ) : (
        <>
          {leftIcon}
          <Text
            className={[
              "font-semibold",
              variantStyles[variant].text,
              sizeStyles[size].text,
              leftIcon || rightIcon ? "mx-2" : "",
            ].join(" ")}
            style={titleStyle}
          >
            {title}
          </Text>
          {rightIcon}
        </>
      )}
    </Pressable>
  );
});