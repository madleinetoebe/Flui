import {
  Car,
  Gem,
  Gift,
  GraduationCap,
  Home,
  Plane,
  ShieldCheck,
  Smartphone,
  Sun,
  Target,
} from "lucide-react-native";
import { Text } from "react-native";

export const goalIcons = {
  target: Target,
  plane: Plane,
  home: Home,
  car: Car,
  gem: Gem,
  school: GraduationCap,
  phone: Smartphone,
  shield: ShieldCheck,
  gift: Gift,
  sun: Sun,
} as const;

export const iconKeys = Object.keys(goalIcons);

export function GoalIcon({ name, size, color }: { name: string; size: number; color: string }) {
  const Icon = goalIcons[name as keyof typeof goalIcons];
  // metas antigas que foram criadas com emoji
  if (!Icon) return <Text style={{ fontSize: size }}>{name}</Text>;
  return <Icon size={size} color={color} />;
}
