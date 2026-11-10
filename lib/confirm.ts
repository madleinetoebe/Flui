import { Alert, Platform } from "react-native";

// Pergunta "tem certeza?" no celular (Alert) e no navegador (window.confirm).
// O Alert.alert com botões não funciona na versão web.
export function confirmAction(title: string, message: string, confirmLabel: string, onConfirm: () => void) {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: "Cancelar", style: "cancel" },
    { text: confirmLabel, style: "destructive", onPress: onConfirm },
  ]);
}

export function showError(message: string) {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") window.alert(message);
    return;
  }
  Alert.alert("Erro", message);
}
