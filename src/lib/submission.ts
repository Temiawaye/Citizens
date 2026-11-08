import * as ImageManipulator from "expo-image-manipulator";
import { IMAGE_MAX_WIDTH, IMAGE_QUALITY } from "@/lib/constants";
import { supabase } from "@/lib/supabase";
import type { IncidentFormValues } from "@/lib/validation";

/** Uploads incident photos, publishes the incident, and returns its uploaded paths. */
export async function submitIncident({
  id,
  userId,
  values,
}: {
  id: string;
  userId: string;
  values: IncidentFormValues;
}) {
  const paths: string[] = [];
  const urls: string[] = [];
  for (const [index, uri] of values.images.entries()) {
    const image = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: IMAGE_MAX_WIDTH } }],
      { compress: IMAGE_QUALITY, format: ImageManipulator.SaveFormat.JPEG },
    );
    const path = `${userId}/${id}/${index}.jpg`;
    const body = await (await fetch(image.uri)).arrayBuffer();
    const { error } = await supabase.storage
      .from("incident-images")
      .upload(path, body, { contentType: "image/jpeg", upsert: true });
    if (error) throw new Error(`Photo ${index + 1} failed: ${error.message}`);
    paths.push(path);
    urls.push(
      supabase.storage.from("incident-images").getPublicUrl(path).data
        .publicUrl,
    );
  }
  const insert = {
    id,
    user_id: userId,
    title: values.title.trim(),
    description: values.description.trim(),
    category: values.category,
    latitude: values.latitude,
    longitude: values.longitude,
    address: values.address,
    image_urls: urls,
  };
  const { error } = await supabase.from("incidents").insert(insert);
  if (error?.code === "23505") {
    const existing = await supabase
      .from("incidents")
      .select("id")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();
    if (!existing.data) throw error;
  } else if (error) {
    // Keep deterministic uploads for a safe retry after uncertain network failures.
    throw error;
  }
  return { id, paths };
}

/** Deletes an owned incident's stored photos before removing its database record. */
export async function deleteIncidentWithImages(id: string, userId: string) {
  const { data: files, error: listError } = await supabase.storage
    .from("incident-images")
    .list(`${userId}/${id}`);
  if (listError) throw listError;
  const paths = (files ?? []).map((file) => `${userId}/${id}/${file.name}`);
  if (paths.length) {
    const { error } = await supabase.storage
      .from("incident-images")
      .remove(paths);
    if (error) throw error;
  }
  const { error } = await supabase
    .from("incidents")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}

/** Updates the editable fields of an owned incident while preserving its stored photos. */
export async function updateIncident({
  id,
  userId,
  values,
}: {
  id: string;
  userId: string;
  values: IncidentFormValues;
}) {
  const update = {
    title: values.title.trim(),
    description: values.description.trim(),
    category: values.category,
    latitude: values.latitude,
    longitude: values.longitude,
    address: values.address,
  };

  const { error } = await supabase
    .from("incidents")
    .update(update)
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
}
