import { createSuperbaseBrowserClient } from "./browser-client";
import { createSuperbaseAdminClient } from "./admin-client";

export const SUPABASE_BUCKET = "wichithra-images";

export const SUPABASE_FOLDERS = {
  TEMP: "temp",
  SIZE_GUIDES: "size-guides",
  SWATCHES: "swatches"
} as const;

// ─── Browser client operations (temp folder only) ────────────────────────────

export async function uploadTempFile(file: File): Promise<{ path: string; url: string }> {
  const supabase = createSuperbaseBrowserClient();
  const ext = file.name.split(".").pop();
  const tempPath = `${SUPABASE_FOLDERS.TEMP}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .upload(tempPath, file, { contentType: file.type, upsert: false });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(tempPath);
  return { path: tempPath, url: data.publicUrl };
}

export async function deleteTempFile(path: string): Promise<void> {
  const supabase = createSuperbaseBrowserClient();
  const { error } = await supabase.storage.from(SUPABASE_BUCKET).remove([path]);
  if (error) throw new Error(error.message);
}

// ─── Admin client operations (permanent folders, called from server only) ────

/**
 * Moves a temp file to its permanent location and returns the new public URL.
 * Call this from a Server Action after the DB row has been created.
 *
 * @param tempPath  - the path returned by uploadTempFile, e.g. "temp/uuid.png"
 * @param folder    - destination folder, e.g. SUPABASE_FOLDERS.SIZE_GUIDES
 * @param filename  - final filename without extension, e.g. the new DB row's id
 * @returns         - { finalPath, publicUrl }
 */
export async function moveTempToPermanent(
  tempPath: string,
  folder: string,
  filename: string
): Promise<{ finalPath: string; publicUrl: string }> {
  const supabase = createSuperbaseAdminClient();
  const ext = tempPath.split(".").pop();
  const finalPath = `${folder}/${filename}.${ext}`;

  //if there's already an image with under
  //this id, delete it first, then move the new image
  await supabase.storage
    .from(SUPABASE_BUCKET)
    .remove([finalPath])
    .catch(() => null);
  
  const { error } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .move(tempPath, finalPath);

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(finalPath);
  return { finalPath, publicUrl: data.publicUrl };
}

export async function uploadImage(
  file: File,
  storagePath: string,
  contentType: string = "image/jpeg"
): Promise<string> {
  const supabase = createSuperbaseAdminClient();

  const { error } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .upload(storagePath, file, { contentType, upsert: true, cacheControl: "3600" });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

export async function deleteImage(path: string): Promise<void> {
  const supabase = createSuperbaseAdminClient();
  const { error } = await supabase.storage.from(SUPABASE_BUCKET).remove([path]);
  if (error) throw new Error(error.message);
}

export function getPublicUrl(storagePath: string): string {
  const supabase = createSuperbaseAdminClient();
  const { data } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}