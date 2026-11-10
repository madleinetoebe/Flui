import type { ReactNode } from "react";
import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";

export function Ring({
  percent,
  size,
  stroke,
  color,
  trackColor,
  children,
}: {
  percent: number;
  size: number;
  stroke: number;
  color: string;
  trackColor: string;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.min(100, Math.max(0, percent));
  const center = size / 2;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Circle cx={center} cy={center} r={r} stroke={trackColor} strokeWidth={stroke} fill="none" />
        <Circle
          cx={center}
          cy={center}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={c - (c * p) / 100}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      {children}
    </View>
  );
}
