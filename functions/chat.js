// functions/chat.js
export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { message, userEmail, city, conversationId } = body;

    if (!message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No message provided" }),
      };
    }

    // Payload für Make Webhook vorbereiten
    const makePayload = {
      message,
    };

    if (userEmail) {
      makePayload.userEmail = userEmail;
    }
    if (city) {
      makePayload.city = city;
    }
    if (conversationId) {
      makePayload.conversationId = conversationId;
    }

    const webhookUrl = process.env.MAKE_WEBHOOK_URL;
    if (!webhookUrl) {
      console.error("MAKE_WEBHOOK_URL ist nicht gesetzt");
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Webhook URL missing" }),
      };
    }

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(makePayload),
    });

    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      // falls Make kein JSON zurückgibt, ignorieren wir es
    }

    // Wir geben einfach den Status und die Antwort von Make durch
    return {
      statusCode: res.status,
      body: data ? JSON.stringify(data) : text || "",
    };
  } catch (err) {
    console.error("Fehler in chat function", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error" }),
    };
  }
}
