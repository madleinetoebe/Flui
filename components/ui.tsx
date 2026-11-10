import { LinearGradient } from "expo-linear-gradient";
import { X } from "lucide-react-native";
import type { ReactNode } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";
import { useStyles, useTheme } from "../lib/settings";
import { radius, shadowGlow, type Colors } from "../lib/theme";

export function GradientBox({
  children,
  style,
}: {
  children: ReactNode;
  style?: object;
}) {
  const { colors } = useTheme();
  return (
    <LinearGradient
      colors={[colors.primary, colors.roseDeep]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[{ borderRadius: radius.xxl }, shadowGlow, style]}
    >
      {children}
    </LinearGradient>
  );
}

export function PrimaryButton({
  label,
  onPress,
  loading,
  small,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  small?: boolean;
}) {
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  return (
    <Pressable onPress={onPress} disabled={loading} style={({ pressed }) => ({ opacity: pressed || loading ? 0.7 : 1 })}>
      <LinearGradient
        colors={[colors.primary, colors.roseDeep]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.primaryBtn, small && { paddingVertical: 10, paddingHorizontal: 16 }, shadowGlow]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={[styles.primaryBtnText, small && { fontSize: 14 }]}>{label}</Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}

export function Input(props: TextInputProps) {
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  return <TextInput placeholderTextColor={colors.muted} {...props} style={[styles.input, props.style]} />;
}

export function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active ? { backgroundColor: colors.primary } : { backgroundColor: colors.secondary }]}
    >
      <Text style={{ color: active ? "#fff" : colors.accentForeground, fontWeight: "600", fontSize: 13 }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.segmented}>
      {options.map((o) => (
        <Pressable
          key={o.key}
          onPress={() => onChange(o.key)}
          style={[styles.segItem, value === o.key && { backgroundColor: colors.card }]}
        >
          <Text
            style={{
              fontWeight: "600",
              fontSize: 13,
              color: value === o.key ? colors.primary : colors.muted,
            }}
          >
            {o.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export function Sheet({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <Pressable style={styles.overlay} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <X size={22} color={colors.muted} />
            </Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function ErrorText({ children }: { children: string }) {
  const { colors } = useTheme();
  if (!children) return null;
  return <Text style={{ color: colors.destructive, fontSize: 13, marginTop: 10 }}>{children}</Text>;
}

export function EmptyBox({ children }: { children: string }) {
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.empty}>
      <Text style={{ color: colors.muted, fontSize: 14, textAlign: "center" }}>{children}</Text>
    </View>
  );
}

// Rótulo pequeno em cima de campos e seções
export function FieldLabel({ children, style }: { children: string; style?: object }) {
  const { colors } = useTheme();
  return (
    <Text style={[{ marginBottom: 8, fontSize: 12, fontWeight: "600", color: colors.muted }, style]}>{children}</Text>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    primaryBtn: {
      borderRadius: radius.md,
      paddingVertical: 14,
      paddingHorizontal: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
    input: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 15,
      color: colors.foreground,
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
    },
    segmented: {
      flexDirection: "row",
      backgroundColor: colors.secondary,
      borderRadius: radius.md,
      padding: 4,
      gap: 4,
    },
    segItem: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 9,
      borderRadius: radius.sm,
    },
    overlay: { flex: 1, backgroundColor: colors.overlay },
    sheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: radius.xxl,
      borderTopRightRadius: radius.xxl,
      padding: 22,
      paddingBottom: 30,
      maxHeight: "88%",
    },
    sheetHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    sheetTitle: { fontSize: 19, fontWeight: "700", color: colors.foreground },
    empty: {
      marginTop: 20,
      padding: 24,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: colors.border,
    },
  });
