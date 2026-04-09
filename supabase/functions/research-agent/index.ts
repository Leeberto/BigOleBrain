import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { Hono } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js";
import { OPENROUTER_BASE } from "../_shared/openrouter.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const MCP_ACCESS_KEY = Deno.env.get("MCP_ACCESS_KEY") ?? "";
const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY")!;
const RESEARCH_MODEL = Deno.env.get("RESEARCH_AGENT_MODEL") ?? "openai/gpt-5.2";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const app = new Hono();

interface ActionRow {
  id: string;
  content: string;
  thought_id: string | null;
  agent_status: string | null;
  assigned_to: string | null;
}

interface ThoughtRow {
  id: string;
  content: string;
}

interface OpenRouterAnnotation {
  type?: string;
  url_citation?: {
    title?: string;
    url?: string;
  };
  url?: string;
  title?: string;
}

function isAuthorized(req: Request): boolean {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (token && token === SUPABASE_SERVICE_ROLE_KEY) {
    return true;
  }

  const url = new URL(req.url);
  const key = req.headers.get("x-brain-key") ?? url.searchParams.get("key") ?? "";
  return key !== "" && key === MCP_ACCESS_KEY;
}

function extractTextContent(content: unknown): string {
  if (typeof content === "string") {
    return content.trim();
  }

  if (!Array.isArray(content)) {
    return "";
  }

  return content
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }
      if (item && typeof item === "object" && "text" in item && typeof item.text === "string") {
        return item.text;
      }
      return "";
    })
    .filter(Boolean)
    .join("\n")
    .trim();
}

function extractSources(annotations: OpenRouterAnnotation[] | undefined): string[] {
  const seen = new Set<string>();
  const sources: string[] = [];

  for (const annotation of annotations ?? []) {
    const citation = annotation.url_citation;
    const url = citation?.url ?? annotation.url;
    if (!url || seen.has(url)) {
      continue;
    }

    seen.add(url);
    let hostname = url;
    try {
      hostname = new URL(url).hostname;
    } catch {
      hostname = url;
    }

    const title = citation?.title ?? annotation.title ?? hostname;
    sources.push(`- [${title}](${url})`);
  }

  return sources;
}

function buildResearchPrompt(action: ActionRow, thought: ThoughtRow | null): string {
  return [
    "Research the following task using current web information.",
    "",
    `Task: ${action.content}`,
    `Additional context: ${thought?.content ?? "None provided."}`,
    "",
    "Return concise markdown with these sections exactly:",
    "## Key Findings",
    "- 3-5 bullet points with concrete findings",
    "## Recommended Next Steps",
    "- 2-4 bullet points with practical follow-up actions",
    "## Caveats",
    "- bullet points describing uncertainty, missing information, or pricing/date caveats",
    "",
    "Use current information and cite sources inline where helpful.",
    "If information is limited or conflicting, say so clearly.",
  ].join("\n");
}

async function runResearch(action: ActionRow, thought: ThoughtRow | null): Promise<string> {
  const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: RESEARCH_MODEL,
      plugins: [
        {
          id: "web",
        },
      ],
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You are a careful research assistant. Use web results to produce a grounded summary. Prefer concrete, current facts and avoid speculation.",
        },
        {
          role: "user",
          content: buildResearchPrompt(action, thought),
        },
      ],
    }),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(`OpenRouter research call failed: ${response.status} ${message}`);
  }

  const data = await response.json();
  const message = data.choices?.[0]?.message;
  const content = extractTextContent(message?.content);
  if (!content) {
    throw new Error("OpenRouter returned an empty research response");
  }

  const sources = extractSources(message?.annotations);
  const sections = [
    "# Research Summary",
    "",
    `Task: ${action.content}`,
    thought?.content ? `Context: ${thought.content}` : null,
    "",
    content,
    "",
    "## Sources Consulted",
    ...(sources.length > 0 ? sources : ["- No source annotations were returned by the provider."]),
  ].filter((section): section is string => section !== null);

  return sections.join("\n");
}

async function updateActionSuccess(actionId: string, output: string) {
  const { error } = await supabase
    .from("actions")
    .update({
      agent_output: output,
      agent_error: null,
      agent_status: "needs_review",
      agent_completed_at: new Date().toISOString(),
    })
    .eq("id", actionId);

  if (error) {
    throw new Error(`Failed to save research output: ${error.message}`);
  }
}

async function updateActionFailure(actionId: string, errorMessage: string) {
  const { error } = await supabase
    .from("actions")
    .update({
      agent_output: null,
      agent_error: errorMessage,
      agent_status: "needs_review",
      agent_completed_at: new Date().toISOString(),
    })
    .eq("id", actionId);

  if (error) {
    console.error("Failed to save research error:", error.message);
  }
}

app.post("*", async (c) => {
  if (!isAuthorized(c.req.raw)) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json().catch(() => ({}));
  const actionId = typeof body.action_id === "string" ? body.action_id : "";
  if (!actionId) {
    return c.json({ error: "action_id is required" }, 400);
  }

  const { data: action, error: actionError } = await supabase
    .from("actions")
    .select("id, content, thought_id, agent_status, assigned_to")
    .eq("id", actionId)
    .single();

  if (actionError || !action) {
    return c.json({ error: `Action not found: ${actionError?.message ?? "unknown error"}` }, 404);
  }

  const thoughtId = action.thought_id;
  let thought: ThoughtRow | null = null;

  if (thoughtId) {
    const { data: thoughtRow, error: thoughtError } = await supabase
      .from("thoughts")
      .select("id, content")
      .eq("id", thoughtId)
      .single();

    if (thoughtError) {
      await updateActionFailure(action.id, `Failed to load thought context: ${thoughtError.message}`);
      return c.json({ error: `Failed to load thought context: ${thoughtError.message}` }, 500);
    }

    thought = thoughtRow as ThoughtRow;
  }

  try {
    const output = await runResearch(action as ActionRow, thought);
    await updateActionSuccess((action as ActionRow).id, output);
    return c.json({
      status: "ok",
      action_id: (action as ActionRow).id,
      agent_status: "needs_review",
      agent_output: output,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await updateActionFailure((action as ActionRow).id, message);
    return c.json({
      status: "error",
      action_id: (action as ActionRow).id,
      agent_status: "needs_review",
      error: message,
    }, 500);
  }
});

app.get("*", (c) =>
  c.json({ status: "ok", service: "Research Agent", model: RESEARCH_MODEL })
);

Deno.serve(app.fetch);
