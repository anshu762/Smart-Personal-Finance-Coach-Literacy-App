import { forwardRef } from "react";
import { StyleProp, View, ViewProps, ViewStyle } from "react-native";

export interface CardProps extends ViewProps {
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const Card = forwardRef<View, CardProps>(function Card(
  { padded = true, style, children, ...rest },
  ref,
) {
  return (
    <View
      ref={ref}
      className={[
        "rounded-xl border border-border bg-surface",
        padded ? "p-4" : "",
      ].join(" ")}
      style={style}
      {...rest}
    >
      {children}
    </View>
  );
});