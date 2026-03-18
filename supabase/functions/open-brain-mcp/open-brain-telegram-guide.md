# Build Your Open Brain
## Complete Setup Guide — Telegram + Claude Desktop Edition

The infrastructure layer for your thinking. One database, one AI gateway, two capture methods. Any AI you use can plug in. No middleware, no SaaS chains, no Zapier.

This isn't a notes app. It's a database with vector search and an open protocol — built so that every AI tool you use shares the same persistent memory of you. Claude, ChatGPT, Cursor, Claude Code, whatever ships next month. One brain. All of them.

---

## What You're Building

**Capture Method 1 — Telegram:** A Telegram bot where you type a thought on your phone or desktop — it automatically gets embedded, classified, and stored in your database — you get a confirmation reply showing what was captured.

**Capture Method 2 — Claude Desktop:** Tell Claude directly to "remember this" or "save this to my brain" and it writes to the same database without switching apps.

**Retrieval:** An MCP server that lets any AI assistant search your brain by meaning — and write to it directly.

---

## What You Need

About 45 minutes and zero coding experience. You'll copy and paste everything.

### Services (All Free Tier)

- **Supabase** — Your database — stores everything
- **OpenRouter** — Your AI gateway — understands everything
- **Telegram** — Your mobile capture interface — where you type thoughts on the go

---

## If You Get Stuck

Follow this guide step by step — it's designed to get you through without outside help. But if something goes sideways, Supabase has a free built-in AI assistant in every project dashboard. Look for the chat icon in the bottom-right corner. It has access to all of Supabase's documentation and can help with every Supabase-specific step in this guide.

Things it's good at:
- Walking you through where to click when you can't find something in the dashboard
- Fixing SQL errors if you paste in the error message
- Explaining terminal commands and what their output means
- Interpreting Edge Function logs when something isn't working
- Explaining Supabase concepts in plain English

It can't see your screen or run commands for you, but if you paste what you're seeing, it can tell you what to do next.

---

## Two Parts

**Part 1 — Capture (Steps 1–8):** Telegram Bot → Edge Function → Supabase. Type a thought on your phone, it gets embedded and classified automatically.

**Part 2 — Retrieval (Steps 9–12):** Hosted MCP Server → Any AI. Connect Claude Desktop, ChatGPT, or any MCP client to your brain with a URL. Read and write from any tool — including directly from Claude Desktop conversations.

---

## Cost Breakdown

| Service | Cost |
|---|---|
| Telegram | Free |
| Supabase (free tier) | $0 |
| Embeddings (text-embedding-3-small) | ~$0.02 / million tokens |
| Metadata extraction (gpt-4o-mini) | ~$0.15 / million input tokens |

For 20 thoughts/day: roughly $0.10–0.30/month in API costs.

---

## Credential Tracker

You're going to generate API keys, passwords, and IDs across multiple services. Copy the block below into a text editor (Notes, TextEdit, Notepad) and fill it in as you go.

```
SUPABASE
  Project ref:           ________________  (Step 1)
  Database password:     ________________  (Step 1)
  Project URL:           ________________  (Step 3)
  Service role key:      ________________  (Step 3)

OPENROUTER
  API key:               ________________  (Step 4)

TELEGRAM
  Bot token:             ________________  (Step 5)
  Your chat ID:          ________________  (Step 5)

EDGE FUNCTIONS
  Capture function URL:  ________________  (Step 7)
  MCP server URL:        ________________  (Step 10)
  MCP access key:        ________________  (Step 9)
  MCP connection URL:    ________________  (Step 10)
```

> ⚠️ Copy that now. You'll thank yourself at Step 7.

---

# Part 1 — Capture

## Step 1: Create Your Supabase Project

Supabase is your database. It stores your thoughts as raw text, vector embeddings, and structured metadata. It also gives you a REST API automatically.

1. Go to [supabase.com](https://supabase.com) and sign up (GitHub login is fastest)
2. Click **New Project** in the dashboard
3. Pick your organization (default is fine)
4. Set **Project name**: `open-brain` (or whatever you want)
5. Generate a strong **Database password** — paste into credential tracker NOW
6. Pick the **Region** closest to you
7. Click **Create new project** and wait 1–2 minutes

> 💡 Grab your **Project ref** — it's the random string in your dashboard URL: `supabase.com/dashboard/project/THIS_PART`. Paste it into the tracker.

---

## Step 2: Set Up the Database

Three SQL commands, pasted one at a time. This creates your storage table, your search function, and your security policy.

### Enable the Vector Extension

In the left sidebar: **Database → Extensions → search for "vector" → flip pgvector ON.**

### Create the Thoughts Table

In the left sidebar: **SQL Editor → New query** → paste and Run:

```sql
create extension if not exists vector with schema extensions;

create table thoughts (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  embedding vector(1536),
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index on thoughts using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);
```

### Create the Search Function

New query → paste and Run:

```sql
create or replace function match_thoughts(
  query_embedding vector(1536),
  match_threshold float default 0.5,
  match_count int default 10
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  created_at timestamptz,
  similarity float
)
language sql stable
as $$
  select
    thoughts.id,
    thoughts.content,
    thoughts.metadata,
    thoughts.created_at,
    1 - (thoughts.embedding <=> query_embedding) as similarity
  from thoughts
  where 1 - (thoughts.embedding <=> query_embedding) > match_threshold
  order by thoughts.embedding <=> query_embedding
  limit match_count;
$$;
```

### Lock Down Security

One more new query:

```sql
-- Enable Row Level Security
alter table thoughts enable row level security;

-- Service role full access only
create policy "Service role full access"
  on thoughts
  for all
  using (auth.role() = 'service_role');
```

### Quick Verification

Table Editor should show the `thoughts` table with columns: `id`, `content`, `embedding`, `metadata`, `created_at`, `updated_at`. Database → Functions should show `match_thoughts`.

---

## Step 3: Save Your Connection Details

In the left sidebar: **Settings (gear icon) → API**. Copy these into your credential tracker:

- **Project URL** — Listed at the top as "URL"
- **Service role key** — Under "Project API keys" → click reveal

> ⚠️ Treat the service role key like a password. Anyone with it has full access to your data.

---

## Step 4: Get an OpenRouter API Key

OpenRouter is a universal AI API gateway — one account gives you access to every major model. We're using it for embeddings and lightweight LLM metadata extraction.

1. Go to [openrouter.ai](https://openrouter.ai) and sign up
2. Go to openrouter.ai/keys
3. Click **Create Key**, name it `open-brain`
4. Copy the key into your credential tracker immediately
5. Add $5 in credits under Credits (lasts months)

---

## Step 5: Create Your Telegram Bot

Telegram's bot setup is faster than any other platform — the whole thing happens inside Telegram itself.

### Create the Bot

1. Open Telegram and search for **@BotFather**
2. Start a chat and send `/newbot`
3. Follow the prompts: give your bot a name (e.g. "Open Brain") and a username (e.g. `openbrainYOURNAME_bot` — must end in `_bot`)
4. BotFather will give you a **bot token** that looks like `123456789:ABCdef...`
5. Paste this into your credential tracker as **Bot token**

### Get Your Chat ID

You need your personal Telegram chat ID so the bot only responds to you (not anyone who might find your bot).

1. Search for **@userinfobot** in Telegram
2. Start a chat and send `/start`
3. It will reply with your user ID — a number like `987654321`
4. Paste this into your credential tracker as **Your chat ID**

> 💡 Your chat ID is what locks the bot to you. Messages from any other Telegram user will be silently ignored by the Edge Function.

---

## Step 6: Install the Supabase CLI

> 💡 New to the terminal? The "terminal" is the text-based command line on your computer. On Mac, open the app called **Terminal** (search for it in Spotlight). On Windows, open **PowerShell**. Everything below gets typed there, not in your browser.

```bash
# Mac with Homebrew
brew install supabase/tap/supabase

# Windows with Scoop (recommended)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Linux or Mac without Homebrew
npm install -g supabase
```

Verify it worked:

```bash
supabase --version
```

Log in and link to your project:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

Replace `YOUR_PROJECT_REF` with the project ref from your credential tracker (Step 1).

---

## Step 7: Deploy the Capture Edge Function

This is the brains of the capture pipeline. One function receives messages from your Telegram bot, generates an embedding, extracts metadata, stores everything in Supabase, and replies with a confirmation.

### Create the Function

```bash
supabase functions new ingest-thought
```

Open `supabase/functions/ingest-thought/index.ts` and replace its entire contents with:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY")!;
const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const ALLOWED_CHAT_ID = Deno.env.get("TELEGRAM_ALLOWED_CHAT_ID")!;

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
```

### Set Your Secrets

```bash
supabase secrets set OPENROUTER_API_KEY=your-openrouter-key-here
supabase secrets set TELEGRAM_BOT_TOKEN=your-bot-token-from-botfather
supabase secrets set TELEGRAM_ALLOWED_CHAT_ID=your-chat-id-from-userinfobot
```

> 💡 `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are automatically available inside Edge Functions — you don't need to set them.

### Deploy

```bash
supabase functions deploy ingest-thought --no-verify-jwt
```

> ⚠️ Copy the Edge Function URL immediately after deployment. It looks like:
> `https://YOUR_PROJECT_REF.supabase.co/functions/v1/ingest-thought`

---

## Step 8: Register the Telegram Webhook

This tells Telegram to forward every message your bot receives to your Edge Function. One command in your terminal:

```bash
curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://YOUR_PROJECT_REF.supabase.co/functions/v1/ingest-thought"}'
```

Replace `YOUR_BOT_TOKEN` with your bot token and `YOUR_PROJECT_REF` with your Supabase project ref. You should see:

```json
{"ok":true,"result":true,"description":"Webhook was set"}
```

### Test It

Open Telegram, find your bot, and send it:

```
Sarah mentioned she's thinking about leaving her job to start a consulting business
```

Wait 5–10 seconds. You should see a reply:

```
✅ Captured as person_note — career, consulting
👤 People: Sarah
📋 Action items: Check in with Sarah about consulting plans
```

Then open **Supabase dashboard → Table Editor → thoughts**. You should see one row with your message, an embedding, and metadata.

> 💡 If that works, Part 1 is done. You have a working mobile capture system.

---

# Part 2 — Retrieval

## A Quick Note on Architecture

MCP servers can run two ways: locally on your computer, or hosted in the cloud.

The local approach means installing Node.js, building a TypeScript project, and running a server process on your machine. Every AI client you connect needs the full path to that server plus your database credentials pasted into a config file. If your laptop is closed, your brain is offline.

We're not doing that.

Your capture system already runs on Supabase — the Edge Function you deployed in Part 1 handles Telegram messages without anything running on your computer. The MCP server works the same way. One more Edge Function, deployed to the same project, reachable from anywhere. Your AI clients connect with a URL.

---

## Step 9: Create an Access Key

Your MCP server will be a public URL. You'll generate a simple access key that the server checks on every request.

In your terminal:

```bash
# Mac/Linux
openssl rand -hex 32

# Windows (PowerShell)
-join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Maximum 256) })
```

Copy the output — it'll look something like `a3f8b2c1d4e5...` (64 characters). Paste it into your credential tracker under **MCP Access Key**.

Set it as a Supabase secret:

```bash
supabase secrets set MCP_ACCESS_KEY=your-generated-key-here
```

---

## Step 10: Deploy the MCP Server

One Edge Function. Four tools: semantic search, browse recent thoughts, stats, and capture. The capture tool is how Claude Desktop writes to your brain directly — no Telegram needed when you're already in Claude.

### Create the Function

```bash
supabase functions new open-brain-mcp
```

### Add Dependencies

Create `supabase/functions/open-brain-mcp/deno.json`:

```json
{
  "imports": {
    "@hono/mcp": "npm:@hono/mcp@0.1.1",
    "@modelcontextprotocol/sdk": "npm:@modelcontextprotocol/sdk@1.24.3",
    "hono": "npm:hono@4.9.2",
    "zod": "npm:zod@4.1.13",
    "@supabase/supabase-js": "npm:@supabase/supabase-js@2.47.10"
  }
}
```

### Write the Server

Open `supabase/functions/open-brain-mcp/index.ts` and replace its entire contents with:

```typescript
import { Hono } from "hono";
import { McpServer } from "@hono/mcp";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const app = new Hono();

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY")!;
const MCP_ACCESS_KEY = Deno.env.get("MCP_ACCESS_KEY")!;

// Auth middleware
app.use("*", async (c, next) => {
  const keyFromQuery = c.req.query("key");
  const keyFromHeader = c.req.header("x-brain-key");
  if (keyFromQuery !== MCP_ACCESS_KEY && keyFromHeader !== MCP_ACCESS_KEY) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  return next();
});

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

const mcp = new McpServer({ name: "open-brain", version: "1.0.0" });

// Tool: semantic search
mcp.tool(
  "search_thoughts",
  "Search your brain by meaning. Returns thoughts semantically similar to your query.",
  {
    query: z.string().describe("What to search for"),
    threshold: z.number().optional().default(0.5).describe("Similarity threshold 0-1 (lower = more results)"),
    limit: z.number().optional().default(10).describe("Maximum results to return"),
  },
  async ({ query, threshold, limit }) => {
    const embedding = await generateEmbedding(query);
    const { data, error } = await supabase.rpc("match_thoughts", {
      query_embedding: embedding,
      match_threshold: threshold,
      match_count: limit,
    });
    if (error) throw error;
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  }
);

// Tool: browse recent
mcp.tool(
  "browse_thoughts",
  "Browse recent thoughts, optionally filtered by type or topic.",
  {
    limit: z.number().optional().default(20),
    type: z.string().optional().describe("Filter by type: person_note, decision, idea, action_item, observation, reference, question"),
    topic: z.string().optional().describe("Filter by topic keyword"),
    days: z.number().optional().describe("Limit to thoughts from the last N days"),
  },
  async ({ limit, type, topic, days }) => {
    let query = supabase
      .from("thoughts")
      .select("id, content, metadata, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (type) query = query.eq("metadata->>type", type);
    if (topic) query = query.contains("metadata->topics", [topic]);
    if (days) {
      const since = new Date();
      since.setDate(since.getDate() - days);
      query = query.gte("created_at", since.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  }
);

// Tool: stats
mcp.tool(
  "get_stats",
  "Get overview stats about your brain: total thoughts, types, top topics, most mentioned people.",
  {},
  async () => {
    const { data, error } = await supabase
      .from("thoughts")
      .select("metadata, created_at");
    if (error) throw error;

    const total = data.length;
    const types: Record<string, number> = {};
    const topics: Record<string, number> = {};
    const people: Record<string, number> = {};

    for (const row of data) {
      const m = row.metadata || {};
      if (m.type) types[m.type] = (types[m.type] || 0) + 1;
      for (const t of (m.topics || [])) topics[t] = (topics[t] || 0) + 1;
      for (const p of (m.people || [])) people[p] = (people[p] || 0) + 1;
    }

    const topTopics = Object.entries(topics).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const topPeople = Object.entries(people).sort((a, b) => b[1] - a[1]).slice(0, 10);

    return {
      content: [{
        type: "text",
        text: JSON.stringify({ total, types, topTopics, topPeople }, null, 2),
      }],
    };
  }
);

// Tool: capture (used by Claude Desktop and other MCP clients)
mcp.tool(
  "capture_thought",
  "Save a new thought directly to the brain. Use this when the user says 'remember this', 'save this', 'capture this', or similar.",
  {
    content: z.string().describe("The thought or note to save"),
  },
  async ({ content }) => {
    const [embedding, metadata] = await Promise.all([
      generateEmbedding(content),
      extractMetadata(content),
    ]);

    const { error } = await supabase.from("thoughts").insert({
      content,
      embedding,
      metadata,
    });

    if (error) throw error;

    const type = (metadata.type as string) || "thought";
    const topics = (metadata.topics as string[])?.join(", ") || "";
    return {
      content: [{
        type: "text",
        text: `Captured as ${type}${topics ? ` — ${topics}` : ""}`,
      }],
    };
  }
);

app.all("/mcp/*", (c) => mcp.fetch(c.req.raw));
app.all("/", (c) => mcp.fetch(c.req.raw));

Deno.serve(app.fetch);
```

### Deploy

```bash
supabase functions deploy open-brain-mcp --no-verify-jwt
```

Your MCP server is now live at:

```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/open-brain-mcp
```

Paste the full URL into your credential tracker as **MCP Server URL**.

Now build your **MCP Connection URL** by adding your access key:

```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/open-brain-mcp?key=your-access-key-from-step-9
```

Paste this into your credential tracker as **MCP Connection URL**. This is what you'll give to AI clients.

---

## Step 11: Connect Claude Desktop

1. Open Claude Desktop → **Settings → Connectors**
2. Click **Add custom connector**
3. Name: `Open Brain`
4. Remote MCP server URL: paste your MCP Connection URL (the one ending in `?key=your-access-key`)
5. Click **Add**

Start a new conversation. Claude now has access to your Open Brain tools. Enable or disable per conversation via the "+" button → Connectors.

### How to Use from Claude Desktop

Claude picks up natural language automatically:

| What you say | What happens |
|---|---|
| "Remember that we decided to push the launch to Q3" | Saves to brain via `capture_thought` |
| "Save this: Marcus wants to move to the platform team" | Saves to brain via `capture_thought` |
| "What did I capture about career changes?" | Searches via `search_thoughts` |
| "What did I capture this week?" | Browses via `browse_thoughts` |
| "How many thoughts do I have?" | Stats via `get_stats` |
| "Who do I mention most?" | Stats via `get_stats` |

> 💡 The `capture_thought` tool means Claude Desktop is a full capture channel — not just retrieval. Wherever you're working in Claude, you can save a thought without switching to Telegram.

---

## Step 12: Connect Other AI Clients (Optional)

### ChatGPT

Requires a paid ChatGPT plan. Works on chatgpt.com (not mobile).

1. Go to chatgpt.com → profile → **Settings → Apps & Connectors → Advanced settings**
2. Toggle **Developer Mode ON**
3. In Settings → Apps & Connectors, click **Create**
4. Name: `Open Brain`, MCP endpoint: your MCP Connection URL, Authentication: **No Authentication**
5. Click **Create**

> ⚠️ Enabling Developer Mode disables ChatGPT's built-in Memory. Your Open Brain replaces that — and works across every AI, not just ChatGPT.

### Claude Code

```bash
claude mcp add --transport http open-brain \
  https://YOUR_PROJECT_REF.supabase.co/functions/v1/open-brain-mcp \
  --header "x-brain-key: your-access-key-from-step-9"
```

### Cursor, VS Code Copilot, Windsurf (mcp-remote bridge)

If your client only supports local stdio servers, use `mcp-remote` (requires Node.js):

```json
{
  "mcpServers": {
    "open-brain": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://YOUR_PROJECT_REF.supabase.co/functions/v1/open-brain-mcp",
        "--header",
        "x-brain-key:${BRAIN_KEY}"
      ],
      "env": {
        "BRAIN_KEY": "your-access-key-from-step-9"
      }
    }
  }
}
```

> ⚠️ No space after the colon in `x-brain-key:${BRAIN_KEY}`. Some clients mangle spaces inside args.

---

# Troubleshooting

## Capture Issues (Telegram)

**Bot doesn't respond to messages**

Check that the webhook is set correctly:
```bash
curl "https://api.telegram.org/botYOUR_BOT_TOKEN/getWebhookInfo"
```
The `url` field should match your Edge Function URL. If not, re-run the webhook registration command from Step 8.

**Bot responds to some messages but not others**

Make sure you're messaging the bot directly (not in a group). The Edge Function is configured for direct messages. If you want group support, you'll need to modify the chat ID check.

**Webhook is set but Edge Function never fires**

Check Edge Function logs: **Supabase dashboard → Edge Functions → ingest-thought → Logs**. If logs are empty, Telegram isn't reaching the function — re-check the webhook URL. If there are errors, paste them into the Supabase AI assistant.

**Function runs but nothing in the database**

Check Edge Function logs. Most likely the OpenRouter key is wrong or has no credits.
```bash
supabase secrets list
```

**No confirmation reply from bot**

The function stored the thought but couldn't send the reply. Check that `TELEGRAM_BOT_TOKEN` is set correctly and that the token is valid (test it with BotFather's `/mybots` command).

**Duplicate database entries**

Telegram retries webhook delivery if it doesn't get a response within a few seconds. Embedding + metadata extraction can occasionally exceed this. The captures are identical so search still works — delete the duplicate row in the Supabase Table Editor if it bothers you.

**Metadata extraction seems off**

Normal — the LLM is making its best guess with limited context. The embedding handles semantic search regardless of how metadata gets classified.

## Retrieval Issues (MCP)

**Claude Desktop tools don't appear**

Make sure you added the connector in **Settings → Connectors**. Verify the connector is enabled for your conversation — click the "+" button, then Connectors, and check Open Brain is toggled on. If the connector was added but tools still don't show, try removing and re-adding it.

**Getting 401 errors**

The access key doesn't match what's stored in Supabase secrets. Double-check that the `?key=` value in your URL matches your MCP Access Key exactly. If using the header approach (Claude Code), the header must be `x-brain-key` (lowercase, with the dash).

**Search returns no results**

Make sure you sent test messages first (Part 1). Try asking the AI to "search with threshold 0.3" for a wider net. If still nothing, check Edge Function logs for errors.

**Tools work but responses are slow**

First call on a cold function takes a few seconds — the Edge Function is waking up. Subsequent calls are faster. If consistently slow, check your Supabase project region.

**ChatGPT doesn't use the Open Brain tools**

Confirm Developer Mode is enabled. Be explicit: "Use the Open Brain search_thoughts tool to find my notes about [topic]." ChatGPT needs explicit tool references the first few times.

---

# How It Works Under the Hood

**When you send a message in Telegram:**
Telegram sends it to your Edge Function → the function checks your chat ID (security) → generates an embedding and extracts metadata in parallel → both get stored as a single row in Supabase → the function replies in Telegram with a summary.

**When you capture from Claude Desktop via MCP:**
Claude sends the text to the `capture_thought` tool → the MCP server generates an embedding and extracts metadata in parallel (same pipeline as Telegram) → stored as a single row → confirmation returned to Claude.

**When you ask your AI to search:**
Your AI client sends the query to the MCP Edge Function → the function generates an embedding of your question → Supabase matches it against every stored thought by vector similarity → results come back ranked by meaning, not keywords.

**Why semantic search is powerful:**
"Sarah's thinking about leaving" and "What did I note about career changes?" match semantically even though they share zero keywords. The metadata is a bonus layer for structured filtering on top.

---

# Swapping Models Later

Because you're using OpenRouter, you can swap models by editing the model strings in the Edge Function code and redeploying. Browse available models at [openrouter.ai/models](https://openrouter.ai/models). Make sure embedding dimensions match (1536 for the current setup).

---

# What You Just Built

You have:
- A Telegram bot that captures thoughts on your phone with confirmation replies
- Claude Desktop as a second capture channel — save thoughts inline without switching apps
- A hosted MCP server reachable from any AI tool via a single URL
- Semantic search that matches meaning, not keywords
- A single Supabase database shared across all capture sources

No local servers. No monthly SaaS fee. Roughly $0.10–0.30/month in API costs.

---

# Your Next Step

Your Open Brain is live. The companion prompt pack — **Open Brain: Companion Prompts** — covers the full lifecycle:

- **Memory Migration** — Pull everything your AI already knows about you into your brain
- **Second Brain Migration** — Bring notes from Notion, Obsidian, or any other system
- **Open Brain Spark** — Personalized use case discovery based on your actual workflow
- **Quick Capture Templates** — Five patterns optimized for clean metadata extraction
- **The Weekly Review** — A Friday ritual that surfaces themes, forgotten action items, and connections you missed

Start with the Memory Migration. Then use the Spark to figure out what to capture going forward.
