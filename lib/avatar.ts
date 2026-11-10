import * as ImagePicker from "expo-image-picker";
import { supabase } from "./supabase";

export type AvatarResult = { ok: true } | { ok: false; cancelled?: boolean; message: string };

// Abre a galeria, corta em quadrado, envia para o Supabase Storage (bucket "avatars")
// e salva o link da foto no perfil do usuário (user_metadata.avatar_url).
export async function pickAndUploadAvatar(userId: string): Promise<AvatarResult> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    return { ok: false, message: "Permita o acesso às suas fotos para escolher uma imagem." };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.6,
  });
  if (result.canceled || !result.assets?.[0]) return { ok: false, cancelled: true, message: "" };

  const asset = result.assets[0];
  try {
    const buffer = await fetch(asset.uri).then((r) => r.arrayBuffer());
    const path = `${userId}/avatar.jpg`;
    const up = await supabase.storage
      .from("avatars")
      .upload(path, buffer, { contentType: asset.mimeType ?? "image/jpeg", upsert: true });
    if (up.error) {
      return {
        ok: false,
        message: `Não foi possível enviar a foto (rodou o SQL no Supabase?): ${up.error.message}`,
      };
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    // ?v= faz o app baixar a foto nova em vez de mostrar a antiga guardada no cache
    const url = `${data.publicUrl}?v=${Date.now()}`;
    const upd = await supabase.auth.updateUser({ data: { avatar_url: url } });
    if (upd.error) return { ok: false, message: upd.error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erro ao enviar a foto." };
  }
}

export async function removeAvatar(userId: string): Promise<AvatarResult> {
  await supabase.storage.from("avatars").remove([`${userId}/avatar.jpg`]);
  const upd = await supabase.auth.updateUser({ data: { avatar_url: "" } });
  if (upd.error) return { ok: false, message: upd.error.message };
  return { ok: true };
}
