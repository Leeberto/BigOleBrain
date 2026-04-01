import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY")!;
const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const ALLOWED_CHAT_ID = Deno.env.get("TELEGRAM_ALLOWED_CHAT_ID")!;
const DEFAULT_USER_ID = Deno.env.get("DEFAULT_USER_ID")!;

async function sendTelegramMessage(chatId: number, text: string, replyToMessageId?: number) {
  const body: Record<string, unknown> = {
    chat_id: chatId,
    text,
    parse_mode: "Markdown",
  };
  if (replyToMessageId) {
    body.reply_to_message_id = replyToMessageId;
  }
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/text-embedding-3-small",
      input: text,
    }),
  });
  const data = await response.json();
  return data.data[0].embedding;
}

async function extractMetadata(text: string): Promise<Record<string, unknown>> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Extract structured metadata from this thought. Return JSON only with these fields:
- type: one of [person_note, decision, idea, action_item, observation, reference, question]
- topics: array of 1-3 topic strings
- people: array of names mentioned (empty array if none)
- action_items: array of action item strings (empty array if none)
- sentiment: one of [positive, neutral, negative]`,
        },
        { role: "user", content: text },
      ],
      response_format: { type: "json_object" },
    }),
  });
  const data = await response.json();
  try {
    return JSON.parse(data.choices[0].message.content);
  } catch {
    return { type: "observation", topics: [], people: [], action_items: [], sentiment: "neutral" };
  }
}

serve(async (req) => {
  try {
    const body = await req.json();

    // Handle Telegram webhook
    const message = body?.message;
    if (!message?.text || !message?.chat?.id) {
      return new Response("OK", { status: 200 });
    }

    const chatId = message.chat.id;
    const messageId = message.message_id;
    const text = message.text.trim();

    // Security: only respond to your chat ID
    if (String(chatId) !== String(ALLOWED_CHAT_ID)) {
      console.log(`Ignored message from unauthorized chat ID: ${chatId}`);
      return new Response("OK", { status: 200 });
    }

    // Ignore commands
    if (text.startsWith("/")) {
      await sendTelegramMessage(chatId, "Open Brain is listening. Just type a thought to capture it.", messageId);
      return new Response("OK", { status: 200 });
    }

    // Generate embedding and metadata in parallel
    const [embedding, metadata] = await Promise.all([
      generateEmbedding(text),
      extractMetadata(text),
    ]);

    // Store in Supabase
    const { error } = await supabase.from("thoughts").insert({
      content: text,
      embedding,
      metadata,
      user_id: DEFAULT_USER_ID,
    });

    if (error) throw error;

    // Build confirmation reply
    const type = metadata.type as string || "thought";
    const topics = (metadata.topics as string[])?.join(", ") || "";
    const people = (metadata.people as string[]);
    const actions = (metadata.action_items as string[]);

    let reply = `✅ Captured as *${type}*`;
    if (topics) reply += ` — ${topics}`;
    if (people?.length) reply += `\n👤 People: ${people.join(", ")}`;
    if (actions?.length) reply += `\n📋 Action items: ${actions.join("; ")}`;

    await sendTelegramMessage(chatId, reply, messageId);

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Error:", err);
    return new Response("Error", { status: 500 });
  }
});