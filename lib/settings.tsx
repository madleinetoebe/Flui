import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { setCurrency as applyCurrency, type Currency } from "./format";
import { darkColors, lightColors, type Colors } from "./theme";

export type Mode = "light" | "dark";

const KEY = "cashtrack.settings.v1";

type SettingsValue = {
  ready: boolean;
  colors: Colors;
  mode: Mode;
  setMode: (m: Mode) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
};

const SettingsContext = createContext<SettingsValue>({
  ready: false,
  colors: lightColors,
  mode: "light",
  setMode: () => {},
  currency: "BRL",
  setCurrency: () => {},
});

// Guarda tema e moeda no próprio celular (AsyncStorage).
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>("light");
  const [currency, setCurrencyState] = useState<Currency>("BRL");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!raw) return;
        const saved = JSON.parse(raw) as { mode?: Mode; currency?: Currency };
        if (saved.mode === "dark" || saved.mode === "light") setModeState(saved.mode);
        if (saved.currency === "BRL" || saved.currency === "USD" || saved.currency === "EUR") {
          applyCurrency(saved.currency);
          setCurrencyState(saved.currency);
        }
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const persist = useCallback((next: { mode: Mode; currency: Currency }) => {
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const setMode = useCallback(
    (m: Mode) => {
      setModeState(m);
      persist({ mode: m, currency });
    },
    [currency, persist],
  );

  const setCurrency = useCallback(
    (c: Currency) => {
      applyCurrency(c); // antes do re-render, para os valores já saírem com o símbolo novo
      setCurrencyState(c);
      persist({ mode, currency: c });
    },
    [mode, persist],
  );

  const value = useMemo(
    () => ({
      ready,
      colors: mode === "dark" ? darkColors : lightColors,
      mode,
      setMode,
      currency,
      setCurrency,
    }),
    [ready, mode, setMode, currency, setCurrency],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useTheme() {
  return useContext(SettingsContext);
}

// Cria os estilos da tela com as cores do tema atual:
//   const makeStyles = (c: Colors) => StyleSheet.create({ ... });
//   const styles = useStyles(makeStyles);
export function useStyles<T>(make: (c: Colors) => T): T {
  const { colors } = useTheme();
  return useMemo(() => make(colors), [make, colors]);
}
