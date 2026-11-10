import { LinearGradient } from "expo-linear-gradient";
import { ArrowRight, PieChart, PiggyBank, Sparkles } from "lucide-react-native";
import { useRef } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Logo } from "../components/Logo";
import { useStyles, useTheme } from "../lib/settings";
import { radius, shadowCard, shadowGlow, type Colors } from "../lib/theme";

const features = [
  {
    icon: PieChart,
    title: "Gastos organizados",
    text: "Cada compra entra na categoria certa automaticamente. Adeus, planilha.",
  },
  {
    icon: PiggyBank,
    title: "Metas que acontecem",
    text: "Guarde aos poucos e acompanhe o progresso de cada sonho — da viagem à reserva de emergência.",
  },
  {
    icon: Sparkles,
    title: "Relatórios claros",
    text: "Gráficos simples que você entende em segundos, sem termos complicados.",
  },
];

const steps = [
  { title: "Conecte suas contas", text: "Bancos e cartões em um só lugar, com segurança." },
  { title: "Veja seus gastos por categoria", text: "Entenda seus maiores gastos em segundos." },
  { title: "Receba alertas úteis", text: "Aviso quando a fatura fecha e quando você gasta demais." },
];

export default function WelcomeScreen({
  onLogin,
  onSignup,
}: {
  onLogin: () => void;
  onSignup: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const howY = useRef(0);

  const heroW = Math.min(width - 56, 340);
  const cardW = Math.round(width * 0.78);
  const saveW = Math.min(width - 56, 340);

  return (
    <ScrollView
      ref={scrollRef}
      style={{ flex: 1, backgroundColor: colors.background }}
      showsVerticalScrollIndicator={false}
    >
      {/* Cabeçalho */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Logo size={22} />
        <Pressable onPress={onLogin} style={styles.enterBtn}>
          <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>Entrar</Text>
        </Pressable>
      </View>

      {/* Hero */}
      <LinearGradient colors={[colors.blush, colors.background]} style={styles.hero}>
        <View style={styles.badge}>
          <Sparkles size={15} color={colors.primary} />
          <Text style={{ color: colors.accentForeground, fontSize: 12, fontWeight: "500" }}>
            Novo: metas inteligentes
          </Text>
        </View>

        <Text style={styles.h1}>
          Seu dinheiro, <Text style={{ color: colors.primary }}>sem mistério</Text>.
        </Text>
        <Text style={styles.lead}>
          Acompanhe gastos, junte para seus sonhos e entenda para onde o salário vai — tudo em um app leve e
          bonito.
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 18, marginTop: 26, flexWrap: "wrap" }}>
          <Pressable onPress={onSignup} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
            <View style={[styles.cta, shadowGlow]}>
              <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>Começar grátis</Text>
              <ArrowRight size={16} color="#fff" />
            </View>
          </Pressable>
          <Pressable onPress={() => scrollRef.current?.scrollTo({ y: howY.current, animated: true })}>
            <Text style={{ color: colors.accentForeground, fontWeight: "600", fontSize: 14 }}>
              Ver como funciona
            </Text>
          </Pressable>
        </View>
        <Text style={{ marginTop: 16, fontSize: 12, color: colors.muted }}>
          Grátis para começar · Sem cartão de crédito
        </Text>

        <View style={{ marginTop: 34, marginBottom: 30, alignItems: "center" }}>
          <Image
            source={require("../assets/hero-app.jpg")}
            style={[{ width: heroW, height: heroW * 1.25, borderRadius: 32 }, shadowGlow]}
            resizeMode="cover"
          />
          <View style={[styles.floatCard, shadowCard, { left: Math.max(0, (width - heroW) / 2 - 8) }]}>
            <Text style={{ fontSize: 12, fontWeight: "500", color: colors.muted }}>Saldo do mês</Text>
            <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground, marginTop: 2 }}>
              <Text style={{ color: colors.primary }}>+12%</Text> economizado
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Recursos */}
      <View style={{ paddingTop: 44 }}>
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={styles.eyebrow}>RECURSOS</Text>
          <Text style={styles.h2}>Tudo para cuidar do seu dinheiro</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={cardW + 16}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 24, gap: 16 }}
        >
          {features.map((f) => (
            <View key={f.title} style={[styles.featureCard, shadowCard, { width: cardW }]}>
              <View style={styles.featureIcon}>
                <f.icon size={22} color={colors.primary} />
              </View>
              <Text style={{ marginTop: 18, fontSize: 18, fontWeight: "700", color: colors.foreground }}>
                {f.title}
              </Text>
              <Text style={{ marginTop: 8, fontSize: 14, lineHeight: 21, color: colors.muted }}>{f.text}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Como funciona */}
      <View
        style={{ paddingHorizontal: 20, paddingTop: 20 }}
        onLayout={(e) => {
          howY.current = e.nativeEvent.layout.y;
        }}
      >
        <View style={{ alignItems: "center" }}>
          <Image
            source={require("../assets/save-goal.jpg")}
            style={[{ width: saveW, height: saveW, borderRadius: 32 }, shadowCard]}
            resizeMode="cover"
          />
        </View>
        <Text style={[styles.eyebrow, { marginTop: 32 }]}>COMO FUNCIONA</Text>
        <Text style={styles.h2}>Em minutos, tudo sob controle</Text>
        <View style={{ marginTop: 26, gap: 24 }}>
          {steps.map((s, i) => (
            <View key={s.title} style={{ flexDirection: "row", gap: 16 }}>
              <View style={styles.stepNum}>
                <Text style={{ color: colors.primary, fontWeight: "700", fontSize: 14 }}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground }}>{s.title}</Text>
                <Text style={{ marginTop: 4, fontSize: 14, lineHeight: 21, color: colors.muted }}>{s.text}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* CTA final */}
      <View style={{ paddingHorizontal: 20, paddingTop: 48, paddingBottom: 44 }}>
        <LinearGradient
          colors={[colors.primary, colors.peach]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.finalCta, shadowGlow]}
        >
          <Text style={styles.finalTitle}>Pronto para ver seu dinheiro com clareza?</Text>
          <Text style={styles.finalText}>Crie sua conta em menos de um minuto. Grátis para começar.</Text>
          <Pressable onPress={onSignup} style={styles.whiteBtn}>
            <Text style={{ fontWeight: "600", fontSize: 16, color: colors.foreground }}>Criar conta grátis</Text>
            <ArrowRight size={16} color={colors.primary} />
          </Pressable>
        </LinearGradient>
      </View>

      {/* Rodapé */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <Logo size={20} />
        <Text style={{ fontSize: 13, color: colors.muted }}>© 2026 CashTrack. Todos os direitos reservados.</Text>
      </View>
    </ScrollView>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingBottom: 12,
      backgroundColor: colors.blush,
    },
    enterBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 999,
    },
    hero: { paddingHorizontal: 20, paddingTop: 24 },
    badge: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: "rgba(255,255,255,0.7)",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 6,
    },
    h1: {
      marginTop: 20,
      fontSize: 40,
      lineHeight: 44,
      fontWeight: "700",
      letterSpacing: -1.2,
      color: colors.foreground,
    },
    lead: { marginTop: 18, fontSize: 16, lineHeight: 24, color: colors.muted },
    cta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: colors.primary,
      paddingHorizontal: 28,
      paddingVertical: 14,
      borderRadius: 999,
    },
    floatCard: {
      position: "absolute",
      bottom: -22,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      paddingHorizontal: 18,
      paddingVertical: 12,
    },
    eyebrow: { fontSize: 12, fontWeight: "600", letterSpacing: 2, color: colors.primary },
    h2: {
      marginTop: 8,
      fontSize: 30,
      lineHeight: 34,
      fontWeight: "700",
      letterSpacing: -0.8,
      color: colors.foreground,
    },
    featureCard: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.xl + 4,
      padding: 24,
    },
    featureIcon: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
    },
    stepNum: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
    },
    finalCta: {
      borderRadius: 32,
      paddingHorizontal: 24,
      paddingVertical: 48,
      alignItems: "center",
    },
    finalTitle: {
      fontSize: 28,
      lineHeight: 32,
      fontWeight: "700",
      letterSpacing: -0.6,
      textAlign: "center",
      color: "#fff",
    },
    finalText: {
      marginTop: 14,
      fontSize: 14,
      lineHeight: 21,
      textAlign: "center",
      color: "rgba(255,255,255,0.85)",
    },
    whiteBtn: {
      marginTop: 28,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: colors.background,
      paddingHorizontal: 30,
      paddingVertical: 15,
      borderRadius: 999,
    },
    footer: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 24,
      paddingHorizontal: 20,
      alignItems: "center",
      gap: 10,
    },
  });
