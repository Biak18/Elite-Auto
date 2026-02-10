import { supabase } from "../supabase";

const AVATAR_BUCKET = "avatars";

export const uploadAvatar = async (
  base64: string,
  contentType: string,
  userId: string,
) => {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

  const path = `${userId}/avatar.png`;

  const { error } = await supabase.storage.from("avatars").upload(path, bytes, {
    contentType,
    upsert: true,
  });

  if (error) throw error;

  return path;
};

export const uploadCarImage = async (
  base64: string,
  mimeType: string,
  carId: string,
  index: number,
): Promise<string> => {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const fileName = `${carId}/image_${index}_${Date.now()}`;
  const { data, error } = await supabase.storage
    .from("car-images")
    .upload(fileName, bytes, {
      contentType: mimeType,
      upsert: true,
    });

  if (error) throw error;

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("car-images")
    .getPublicUrl(data.path);

  return urlData.publicUrl;
};

const base64ToUint8Array = (base64: string) => {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
};

export const deleteAvatar = async (filePath: string) => {
  const { data, error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .remove([filePath]);

  if (error) throw error;
  return data;
};
