import "react-native-url-polyfill/auto";
import type { Session } from "@supabase/supabase-js";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, AppState, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { TabBar } from "./components/TabBar";
import { capitalize } from "./lib/format";
import { SettingsProvider, useTheme } from "./lib/settings";
import { supabase } from "./lib/supabase";
import type { Tab } from "./lib/types";
import AuthScreen from "./screens/AuthScreen";
import GastosScreen from "./screens/GastosScreen";
import HomeScreen from "./screens/HomeScreen";
import MetasScreen from "./screens/MetasScreen";
import PerfilScreen from "./screens/PerfilScreen";
import WelcomeScreen from "./screens/WelcomeScreen";

// Mantém o login renovado enquanto o app está aberto
AppState.addEventListener("change", (state) => {
  if (state === "active") supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});

export default function App() {
  return (
    <SettingsProvider>
      <Main />
    </SettingsProvider>
  );
}

function Main() {
  const { colors, mode, ready: settingsReady } = useTheme();
  const [session, setSession] = useState<Session | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [tab, setTab] = useState<Tab>("inicio");
  const [authView, setAuthView] = useState<"welcome" | "login" | "signup">("welcome");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessionReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (!s) {
        setTab("inicio");
        setAuthView("welcome");
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!sessionReady || !settingsReady) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const email = session?.user.email ?? "";
  const meta = session?.user.user_metadata ?? {};
  const name = (meta.name as string | undefined) || capitalize(email.split("@")[0] || "");
  const avatarUrl = (meta.avatar_url as string | undefined) || undefined;

  return (
    <SafeAreaProvider>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      {!session ? (
        authView === "welcome" ? (
          <WelcomeScreen onLogin={() => setAuthView("login")} onSignup={() => setAuthView("signup")} />
        ) : (
          <AuthScreen key={authView} initialMode={authView} onBack={() => setAuthView("welcome")} />
        )
      ) : (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={{ flex: 1 }}>
            {tab === "inicio" && <HomeScreen name={name} avatarUrl={avatarUrl} go={setTab} />}
            {tab === "gastos" && <GastosScreen />}
            {tab === "metas" && <MetasScreen />}
            {tab === "perfil" && (
              <PerfilScreen userId={session.user.id} email={email} name={name} avatarUrl={avatarUrl} />
            )}
          </View>
          <TabBar active={tab} onChange={setTab} />
        </View>
      )}
    </SafeAreaProvider>
  );
}
