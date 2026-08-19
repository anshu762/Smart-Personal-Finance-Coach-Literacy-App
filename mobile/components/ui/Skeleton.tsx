import { useEffect, useState } from "react";
import {
  Animated,
  Easing,
  StyleProp,
  View,
  ViewStyle,
} from "react-native";

export interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  className?: string;
  animated?: boolean;
}

export function Skeleton({
  width = "100%",
  height = 16,
  borderRadius = 6,
  style,
  className,
  animated = true,
}: SkeletonProps) {
  const [opacity] = useState(() => new Animated.Value(0.4));

  useEffect(() => {
    if (!animated) return;

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => {
      loop.stop();
    };
  }, [animated, opacity]);

  return (
    <Animated.View
      className={["bg-border", className].filter(Boolean).join(" ")}
      style={[
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

export interface SkeletonTextProps {
  lines?: number;
  lastLineWidth?: number | `${number}%`;
  gap?: number;
}

export function SkeletonText({
  lines = 3,
  lastLineWidth = "60%",
  gap = 8,
}: SkeletonTextProps) {
  return (
    <View style={{ gap }}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? lastLineWidth : "100%"}
          height={14}
        />
      ))}
    </View>
  );
}

export interface SkeletonCardProps {
  height?: number;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function SkeletonCard({ height, children, style }: SkeletonCardProps) {
  return (
    <View
      className="rounded-xl border border-border bg-surface p-4"
      style={[{ minHeight: height }, style]}
    >
      {children}
    </View>
  );
}