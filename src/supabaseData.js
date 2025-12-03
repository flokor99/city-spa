// src/supabaseData.js
import { supabase } from "./supabaseClient";

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
// src/supabaseData.js
import { supabase } from "./supabaseClient";

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

/**
 * Stadt per Name holen oder anlegen
 * Wird genutzt für Schnellstart und "+ Neue Stadt…"
 */
export async function getOrCreateCityByName(name) {
  const trimmed = name.trim();
  if (!trimmed) {
    return { data: null, error: new Error("Name der Stadt ist leer") };
  }

  // Slug grob normalisieren. wie in deinen bestehenden Einträgen
  const slug = trimmed
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/\s+/g, "");

  // Upsert auf Basis des Slugs. falls es die Stadt schon gibt, wird sie zurückgegeben
  const { data, error } = await supabase
    .from("cities")
    .upsert(
      {
        name: trimmed,
        slug,
      },
      { onConflict: "slug" }
    )
    .select()
    .single();

  return { data, error };
}

