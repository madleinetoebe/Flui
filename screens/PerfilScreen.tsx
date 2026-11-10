import { Camera, ChevronRight, LogOut, MessageCircle, Settings } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ErrorText } from "../components/ui";
import { pickAndUploadAvatar, removeAvatar } from "../lib/avatar";
import { useStyles, useTheme } from "../lib/settings";
import { supabase } from "../lib/supabase";
import { radius, shadowCard, type Colors } from "../lib/theme";
import SettingsScreen from "./SettingsScreen";

export default function PerfilScreen({
  userId,
  email,
  name,
  avatarUrl,
}: {
  userId: string;
  email: string;
  name: string;
  avatarUrl?: string;
}) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  const [view, setView] = useState<"main" | "settings">("main");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (view === "settings") return <SettingsScreen name={name} onBack={() => setView("main")} />;

  async function changePhoto() {
    setError("");
    setBusy(true);
    const r = await pickAndUploadAvatar(userId);
    setBusy(false);
    if (!r.ok && !r.cancelled) setError(r.message);
  }

  async function deletePhoto() {
    setError("");
    setBusy(true);
    const r = await removeAvatar(userId);
    setBusy(false);
    if (!r.ok) setError(r.message);
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Perfil</Text>

      {/* Foto, nome e e-mail */}
      <View style={styles.profileCard}>
        <Pressable onPress={changePhoto} disabled={busy} style={styles.avatarWrap}>
          <View style={styles.avatar}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={{ width: 104, height: 104 }} />
            ) : (
              <Text style={{ fontSize: 36, fontWeight: "700", color: colors.primary }}>
                {name.slice(0, 2).toUpperCase()}
              </Text>
            )}
            {busy && (
              <View style={styles.busy}>
                <ActivityIndicator color="#fff" />
              </View>
            )}
          </View>
          <View style={styles.camera}>
            <Camera size={16} color="#fff" />
          </View>
        </Pressable>

        <Text numberOfLines={1} style={{ marginTop: 14, fontSize: 20, fontWeight: "700", color: colors.foreground }}>
          {name}
        </Text>
        <Text numberOfLines={1} style={{ marginTop: 2, fontSize: 13, color: colors.muted }}>
          {email}
        </Text>

        <View style={{ flexDirection: "row", gap: 18, marginTop: 14 }}>
          <Pressable onPress={changePhoto} disabled={busy}>
            <Text style={{ color: colors.primary, fontWeight: "600", fontSize: 13 }}>
              {avatarUrl ? "Trocar foto" : "Adicionar foto"}
            </Text>
          </Pressable>
          {avatarUrl ? (
            <Pressable onPress={deletePhoto} disabled={busy}>
              <Text style={{ color: colors.muted, fontWeight: "600", fontSize: 13 }}>Remover foto</Text>
            </Pressable>
          ) : null}
        </View>
        <ErrorText>{error}</ErrorText>
      </View>

      {/* Opções */}
      <View style={styles.list}>
        <Pressable onPress={() => setView("settings")} style={styles.row}>
          <View style={styles.rowIcon}>
            <Settings size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Configurações</Text>
            <Text style={styles.rowSub}>Nome, senha, tema e moeda</Text>
          </View>
          <ChevronRight size={18} color={colors.muted} />
        </Pressable>

        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.border, opacity: 0.6 }]}>
          <View style={styles.rowIcon}>
            <MessageCircle size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Vincular WhatsApp</Text>
            <Text style={styles.rowSub}>Lance gastos mandando mensagem</Text>
          </View>
          <View style={styles.soon}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: colors.accentForeground }}>Em breve</Text>
          </View>
        </View>
      </View>

      <Pressable onPress={() => supabase.auth.signOut()} style={styles.logout}>
        <LogOut size={18} color={colors.destructive} />
        <Text style={{ color: colors.destructive, fontWeight: "700", fontSize: 15 }}>Sair da conta</Text>
      </Pressable>
    </ScrollView>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    title: { fontSize: 26, fontWeight: "700", color: colors.foreground },
    profileCard: {
      marginTop: 20,
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: radius.xxl,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 24,
      ...shadowCard,
    },
    avatarWrap: { width: 104, height: 104 },
    avatar: {
      width: 104,
      height: 104,
      borderRadius: 52,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    busy: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.35)",
      alignItems: "center",
      justifyContent: "center",
    },
    camera: {
      position: "absolute",
      right: 0,
      bottom: 0,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary,
      borderWidth: 2,
      borderColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
    },
    list: {
      marginTop: 18,
      backgroundColor: colors.card,
      borderRadius: radius.xxl,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      ...shadowCard,
    },
    row: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16 },
    rowIcon: {
      width: 42,
      height: 42,
      borderRadius: radius.sm,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
    },
    rowTitle: { fontSize: 15, fontWeight: "600", color: colors.foreground },
    rowSub: { fontSize: 12, color: colors.muted, marginTop: 1 },
    soon: { backgroundColor: colors.accent, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
    logout: {
      marginTop: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 14,
      borderRadius: radius.md,
      backgroundColor: colors.accent,
    },
  });
