import { ArrowLeft } from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Logo } from "../components/Logo";
import { ErrorText, Input, PrimaryButton } from "../components/ui";
import { supabase } from "../lib/supabase";
import { useStyles, useTheme } from "../lib/settings";
import { radius, shadowCard, type Colors } from "../lib/theme";

export default function AuthScreen({
  initialMode = "login",
  onBack,
}: {
  initialMode?: "login" | "signup";
  onBack?: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError("");
    setInfo("");
    if (!email.trim() || !password) return setError("Preencha e-mail e senha.");
    setLoading(true);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) setError(error.message);
    } else {
      const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
      if (error) setError(error.message);
      else if (!data.session) setInfo("Conta criada! Confirme o e-mail que enviamos para entrar.");
    }
    setLoading(false);
    // Quando o login dá certo, o App.tsx percebe a sessão e troca de tela sozinho.
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {onBack && (
        <Pressable onPress={onBack} style={[styles.back, { top: insets.top + 10 }]} hitSlop={10}>
          <ArrowLeft size={18} color={colors.primary} />
          <Text style={{ color: colors.primary, fontWeight: "600", fontSize: 14 }}>Voltar</Text>
        </Pressable>
      )}
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: "center", marginBottom: 22 }}>
          <Logo size={34} />
        </View>
        <View style={styles.card}>
          <Text style={styles.title}>{mode === "login" ? "Bem-vinda de volta" : "Criar conta"}</Text>
          <Text style={styles.subtitle}>
            {mode === "login" ? "Entre para ver suas finanças." : "Comece a organizar seu dinheiro."}
          </Text>

          <View style={{ gap: 12, marginTop: 22 }}>
            <Input
              placeholder="E-mail"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />
            <Input
              placeholder="Senha (mínimo 6 caracteres)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <ErrorText>{error}</ErrorText>
          {info ? <Text style={{ color: colors.primary, fontSize: 13, marginTop: 10 }}>{info}</Text> : null}

          <View style={{ marginTop: 20 }}>
            <PrimaryButton
              label={mode === "login" ? "Entrar" : "Criar conta"}
              onPress={handleSubmit}
              loading={loading}
            />
          </View>

          <Pressable
            onPress={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError("");
              setInfo("");
            }}
            style={{ marginTop: 18, alignItems: "center" }}
          >
            <Text style={{ color: colors.primary, fontWeight: "600", fontSize: 14 }}>
              {mode === "login" ? "Não tenho conta. Criar agora" : "Já tenho conta. Entrar"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    container: { flexGrow: 1, justifyContent: "center", padding: 22 },
    back: {
      position: "absolute",
      left: 20,
      zIndex: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: radius.xxl,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 24,
      ...shadowCard,
    },
    title: { fontSize: 24, fontWeight: "700", color: colors.foreground },
    subtitle: { fontSize: 14, color: colors.muted, marginTop: 4 },
  });
