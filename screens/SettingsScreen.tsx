import { ArrowLeft } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Chip, ErrorText, FieldLabel, Input, PrimaryButton, Segmented } from "../components/ui";
import { currencies } from "../lib/format";
import { useStyles, useTheme, type Mode } from "../lib/settings";
import { supabase } from "../lib/supabase";
import { radius, shadowCard, type Colors } from "../lib/theme";

export default function SettingsScreen({ name, onBack }: { name: string; onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const { colors, mode, setMode, currency, setCurrency } = useTheme();
  const styles = useStyles(makeStyles);

  const [newName, setNewName] = useState(name);
  const [nameBusy, setNameBusy] = useState(false);
  const [nameMsg, setNameMsg] = useState("");
  const [nameErr, setNameErr] = useState("");

  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [passBusy, setPassBusy] = useState(false);
  const [passMsg, setPassMsg] = useState("");
  const [passErr, setPassErr] = useState("");

  async function saveName() {
    setNameErr("");
    setNameMsg("");
    if (!newName.trim()) return setNameErr("Digite seu nome.");
    setNameBusy(true);
    const { error } = await supabase.auth.updateUser({ data: { name: newName.trim() } });
    setNameBusy(false);
    if (error) return setNameErr(error.message);
    setNameMsg("Nome salvo!");
  }

  async function savePassword() {
    setPassErr("");
    setPassMsg("");
    if (pass.length < 6) return setPassErr("A senha precisa ter pelo menos 6 caracteres.");
    if (pass !== pass2) return setPassErr("As duas senhas não são iguais.");
    setPassBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pass });
    setPassBusy(false);
    if (error) return setPassErr(error.message);
    setPass("");
    setPass2("");
    setPassMsg("Senha alterada!");
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 16, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Pressable onPress={onBack} hitSlop={10} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <ArrowLeft size={18} color={colors.primary} />
        <Text style={{ color: colors.primary, fontWeight: "600", fontSize: 14 }}>Perfil</Text>
      </Pressable>
      <Text style={styles.title}>Configurações</Text>

      {/* Nome */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Seu nome</Text>
        <View style={{ marginTop: 12 }}>
          <Input value={newName} onChangeText={setNewName} placeholder="Como você quer ser chamada?" />
        </View>
        <ErrorText>{nameErr}</ErrorText>
        {nameMsg ? <Text style={styles.okText}>{nameMsg}</Text> : null}
        <View style={{ marginTop: 14 }}>
          <PrimaryButton label="Salvar nome" onPress={saveName} loading={nameBusy} />
        </View>
      </View>

      {/* Senha */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Trocar senha</Text>
        <View style={{ gap: 12, marginTop: 12 }}>
          <Input
            value={pass}
            onChangeText={setPass}
            placeholder="Nova senha (mínimo 6 caracteres)"
            secureTextEntry
            autoCapitalize="none"
          />
          <Input
            value={pass2}
            onChangeText={setPass2}
            placeholder="Repita a nova senha"
            secureTextEntry
            autoCapitalize="none"
          />
        </View>
        <ErrorText>{passErr}</ErrorText>
        {passMsg ? <Text style={styles.okText}>{passMsg}</Text> : null}
        <View style={{ marginTop: 14 }}>
          <PrimaryButton label="Trocar senha" onPress={savePassword} loading={passBusy} />
        </View>
      </View>

      {/* Tema */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Aparência</Text>
        <View style={{ marginTop: 12 }}>
          <Segmented<Mode>
            value={mode}
            onChange={setMode}
            options={[
              { key: "light", label: "Claro" },
              { key: "dark", label: "Escuro" },
            ]}
          />
        </View>
      </View>

      {/* Moeda */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Moeda</Text>
        <FieldLabel style={{ marginTop: 12 }}>Símbolo usado nos valores</FieldLabel>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {currencies.map((c) => (
            <Chip key={c.key} label={c.label} active={currency === c.key} onPress={() => setCurrency(c.key)} />
          ))}
        </View>
        <Text style={{ marginTop: 10, fontSize: 12, color: colors.muted }}>
          Troca só o símbolo e o formato. Os valores já lançados não são convertidos.
        </Text>
      </View>
    </ScrollView>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    title: { marginTop: 14, fontSize: 26, fontWeight: "700", color: colors.foreground },
    card: {
      marginTop: 18,
      backgroundColor: colors.card,
      borderRadius: radius.xxl,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 20,
      ...shadowCard,
    },
    cardTitle: { fontSize: 16, fontWeight: "700", color: colors.foreground },
    okText: { color: colors.primary, fontSize: 13, marginTop: 10 },
  });
