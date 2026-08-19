import { View } from "react-native";

export interface GoalProgressBarProps {
  progress: number;
  color?: string;
  trackClassName?: string;
}

export function GoalProgressBar({
  progress,
  color = "#208AEF",
  trackClassName,
}: GoalProgressBarProps) {
  const width = Math.min(100, Math.max(0, progress));

  return (
    <View
      className={[
        "h-2.5 overflow-hidden rounded-full bg-border",
        trackClassName ?? "",
      ].join(" ")}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: width }}
    >
      <View
        className="h-full rounded-full"
        style={{ width: `${width}%`, backgroundColor: color }}
      />
    </View>
  );
}