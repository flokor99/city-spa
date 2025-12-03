// src/supabaseData.js
import { supabase } from "./supabaseClient";

/**
 * Kleine Hilfsfunktion, um aus einem Stadtnamen einen Slug zu machen
 * z. B. "Köln Innenstadt" -> "koeln-innenstadt"
 */
function slugifyCityName(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-") // alles Nicht-Alphanumerische zu "-"
    .replace(/^-+|-+$/g, ""); // führende/trailing "-" entfernen
}

/**
 * Alle Städte laden
 */
export async function fetchCities() {
  const { data, error } = await supabase
    .from("cities")
    .select("*")
    .order("name", { ascending: true });

  return { data, error };
}

/**
 * Stadt per Name holen oder anlegen.
 * Nutzt den Slug als eindeutigen Schlüssel.
 */
export async function getOrCreateCityByName(rawName) {
  const name = (rawName || "").trim();
  if (!name) {
    return { data: null, error: new Error("City name is empty") };
  }

  const slug = slugifyCityName(name);

  // 1. Gibt es schon eine Stadt mit diesem Slug
  let { data, error } = await supabase
    .from("cities")
    .select("*")
    .eq("slug", slug);

  if (error) {
    return { data: null, error };
  }

  if (data && data.length > 0) {
    return { data: data[0], error: null };
  }

  // 2. Wenn nicht, neue Stadt anlegen
  const { data: inserted, error: insertError } = await supabase
    .from("cities")
    .insert([{ slug, name }])
    .select()
    .single();

  return { data: inserted, error: insertError };
}

/**
 * Alle Conversations des Users laden
 * optional gefiltert nach city_id
 */
export async function fetchConversations(userId, cityId = null) {
  let query = supabase
    .from("conversations")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (cityId) {
    query = query.eq("city_id", cityId);
  }

  const { data, error } = await query;
  return { data, error };
}

/**
 * Neue Conversation anlegen
 */
export async function createConversation({ userId, cityId, title }) {
  const { data, error } = await supabase
    .from("conversations")
    .insert([
      {
        user_id: userId,
        city_id: cityId,
        title: title || null,
      },
    ])
    .select()
    .single();

  return { data, error };
}

/**
 * Für eine Stadt und einen User eine Conversation holen oder anlegen.
 * Variante. pro Stadt und User maximal ein Chat. wenn es schon eine gibt, nimm die.
 */
export async function getOrCreateConversationForCity({ userId, cityId, title }) {
  // erst schauen, ob schon eine Conversation existiert
  const { data: convos, error } = await fetchConversations(userId, cityId);
  if (error) {
    return { data: null, error };
  }

  if (convos && convos.length > 0) {
    // nimm die jüngste, da fetchConversations nach updated_at sortiert
    return { data: convos[0], error: null };
  }

  // sonst neu anlegen
  return await createConversation({ userId, cityId, title });
}

/**
 * Nachrichten zu einer Conversation laden
 */
export async function fetchMessages(conversationId) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  return { data, error };
}

/**
 * Neue Nachricht speichern
 */
export async function addMessage({
  conversationId,
  userId,
  role,
  content,
  metadata = null,
}) {
  const { data, error } = await supabase
    .from("messages")
    .insert([
      {
        conversation_id: conversationId,
        user_id: userId,
        role,
        content,
        metadata,
      },
    ])
    .select()
    .single();

  return { data, error };
}
