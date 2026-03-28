import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPTransport } from "@hono/mcp";
import { Hono } from "hono";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const MCP_ACCESS_KEY = Deno.env.get("MCP_ACCESS_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ──────────────────────────────────────────────
// MCP Server Setup
// ──────────────────────────────────────────────

const server = new McpServer({
  name: "scheduled-tasks",
  version: "1.0.0",
});

// ──────────────────────────────────────────────
// Tool 1: Create Scheduled Task
// ──────────────────────────────────────────────

server.registerTool(
  "create_scheduled_task",
  {
    title: "Create Scheduled Task",
    description:
      "Register a new scheduled task. Specify trigger type, task type, gather config, and delivery channel. For cron triggers, provide a cron_expression. For due_date triggers, provide due_date_source. For event triggers, provide event_source.",
    inputSchema: {
      name: z.string().describe("Unique human-readable name for the task"),
      description: z.string().optional().describe("What this task does"),
      enabled: z.boolean().optional().default(true).describe("Whether the task is active"),
      trigger_type: z
        .enum(["cron", "due_date", "event", "manual"])
        .describe("What triggers this task"),
      cron_expression: z
        .string()
        .optional()
        .describe("5-field cron expression (for cron triggers), e.g. '0 7 * * 1-5'"),
      due_date_source: z
        .string()
        .optional()
        .describe("Table to scan for approaching due dates (for due_date triggers)"),
      due_date_lead_days: z
        .number()
        .optional()
        .describe("Days before due date to fire (default 1)"),
      event_source: z
        .string()
        .optional()
        .describe("External event source (for event triggers), e.g. 'google_calendar'"),
      event_lead_hours: z
        .number()
        .optional()
        .describe("Hours before event to fire (default 2)"),
      task_type: z
        .enum(["llm_prompt", "alert_digest", "deck_builder", "stale_loop_scan", "trend_analysis"])
        .describe("What to do with gathered data"),
      prompt_template: z
        .string()
        .optional()
        .describe("System prompt for llm_prompt tasks"),
      output_format: z
        .enum(["markdown", "html", "pptx", "json"])
        .optional()
        .default("markdown")
        .describe("Output format"),
      gather_config: z
        .string()
        .optional()
        .describe("JSON string defining data queries, e.g. {\"queries\": [{\"source\": \"actions\", \"filter\": {\"status\": \"open\"}, \"limit\": 20}]}"),
      delivery_channel: z
        .enum(["email", "telegram", "slack", "file", "mcp_response"])
        .optional()
        .default("mcp_response")
        .describe("How to deliver the output"),
      delivery_config: z
        .string()
        .optional()
        .describe("JSON string with channel-specific settings (recipients, etc.)"),
    },
  },
  async ({ name, description, enabled, trigger_type, cron_expression, due_date_source, due_date_lead_days, event_source, event_lead_hours, task_type, prompt_template, output_format, gather_config, delivery_channel, delivery_config }) => {
    try {
      // Validate trigger-specific fields
      if (trigger_type === "cron" && !cron_expression) {
        return { content: [{ type: "text" as const, text: "Error: cron triggers require a cron_expression." }], isError: true };
      }
      if (trigger_type === "due_date" && !due_date_source) {
        return { content: [{ type: "text" as const, text: "Error: due_date triggers require a due_date_source." }], isError: true };
      }
      if (trigger_type === "event" && !event_source) {
        return { content: [{ type: "text" as const, text: "Error: event triggers require an event_source." }], isError: true };
      }
      if (task_type === "llm_prompt" && !prompt_template) {
        return { content: [{ type: "text" as const, text: "Error: llm_prompt tasks require a prompt_template." }], isError: true };
      }

      // Parse JSON strings
      let gatherObj = {};
      if (gather_config) {
        try {
          gatherObj = JSON.parse(gather_config);
        } catch {
          return { content: [{ type: "text" as const, text: "Error: gather_config is not valid JSON." }], isError: true };
        }
      }

      let deliveryObj = {};
      if (delivery_config) {
        try {
          deliveryObj = JSON.parse(delivery_config);
        } catch {
          return { content: [{ type: "text" as const, text: "Error: delivery_config is not valid JSON." }], isError: true };
        }
      }

      const row: Record<string, unknown> = {
        name,
        trigger_type,
        task_type,
        enabled: enabled ?? true,
        gather_config: gatherObj,
        delivery_channel: delivery_channel ?? "mcp_response",
        delivery_config: deliveryObj,
        output_format: output_format ?? "markdown",
      };
      if (description) row.description = description;
      if (cron_expression) row.cron_expression = cron_expression;
      if (due_date_source) row.due_date_source = due_date_source;
      if (due_date_lead_days !== undefined) row.due_date_lead_days = due_date_lead_days;
      if (event_source) row.event_source = event_source;
      if (event_lead_hours !== undefined) row.event_lead_hours = event_lead_hours;
      if (prompt_template) row.prompt_template = prompt_template;

      const { data, error } = await supabase
        .from("scheduled_tasks")
        .insert(row)
        .select("id, name, trigger_type, task_type, enabled")
        .single();

      if (error) {
        return { content: [{ type: "text" as const, text: `Error creating task: ${error.message}` }], isError: true };
      }

      return {
        content: [{
          type: "text" as const,
          text: `Scheduled task created:\n\nID: ${data.id}\nName: ${data.name}\nTrigger: ${data.trigger_type}${cron_expression ? ` (${cron_expression})` : ""}\nType: ${data.task_type}\nEnabled: ${data.enabled}\nDelivery: ${delivery_channel ?? "mcp_response"}`,
        }],
      };
    } catch (err) {
      return { content: [{ type: "text" as const, text: `Error: ${err instanceof Error ? err.message : String(err)}` }], isError: true };
    }
  }
);

// ──────────────────────────────────────────────
// Tool 2: Update Scheduled Task
// ──────────────────────────────────────────────

server.registerTool(
  "update_scheduled_task",
  {
    title: "Update Scheduled Task",
    description: "Update any mutable field on a scheduled task. Provide the task ID and the fields to change.",
    inputSchema: {
      id: z.string().describe("UUID of the task to update"),
      name: z.string().optional().describe("New name"),
      description: z.string().optional().describe("New description"),
      enabled: z.boolean().optional().describe("Enable or disable the task"),
      trigger_type: z.enum(["cron", "due_date", "event", "manual"]).optional(),
      cron_expression: z.string().optional(),
      due_date_source: z.string().optional(),
      due_date_lead_days: z.number().optional(),
      event_source: z.string().optional(),
      event_lead_hours: z.number().optional(),
      task_type: z.enum(["llm_prompt", "alert_digest", "deck_builder", "stale_loop_scan", "trend_analysis"]).optional(),
      prompt_template: z.string().optional(),
      output_format: z.enum(["markdown", "html", "pptx", "json"]).optional(),
      gather_config: z.string().optional().describe("JSON string for gather configuration"),
      delivery_channel: z.enum(["email", "telegram", "slack", "file", "mcp_response"]).optional(),
      delivery_config: z.string().optional().describe("JSON string for delivery configuration"),
    },
  },
  async ({ id, ...fields }) => {
    try {
      const updates: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(fields)) {
        if (value === undefined) continue;

        if (key === "gather_config" || key === "delivery_config") {
          try {
            updates[key] = JSON.parse(value as string);
          } catch {
            return { content: [{ type: "text" as const, text: `Error: ${key} is not valid JSON.` }], isError: true };
          }
        } else {
          updates[key] = value;
        }
      }

      if (Object.keys(updates).length === 0) {
        return { content: [{ type: "text" as const, text: "No fields to update." }], isError: true };
      }

      const { data, error } = await supabase
        .from("scheduled_tasks")
        .update(updates)
        .eq("id", id)
        .select("id, name, trigger_type, task_type, enabled")
        .single();

      if (error) {
        return { content: [{ type: "text" as const, text: `Error updating task: ${error.message}` }], isError: true };
      }

      return {
        content: [{
          type: "text" as const,
          text: `Task updated: ${data.name} (${data.id})\nUpdated fields: ${Object.keys(updates).join(", ")}`,
        }],
      };
    } catch (err) {
      return { content: [{ type: "text" as const, text: `Error: ${err instanceof Error ? err.message : String(err)}` }], isError: true };
    }
  }
);

// ──────────────────────────────────────────────
// Tool 3: List Scheduled Tasks
// ──────────────────────────────────────────────

server.registerTool(
  "list_scheduled_tasks",
  {
    title: "List Scheduled Tasks",
    description: "Show all registered scheduled tasks with their configuration and last run status.",
    inputSchema: {
      enabled_only: z.boolean().optional().default(true).describe("Only show enabled tasks (default true)"),
      limit: z.number().optional().default(20).describe("Max tasks to return"),
    },
  },
  async ({ enabled_only, limit }) => {
    try {
      let query = supabase
        .from("scheduled_tasks")
        .select("*")
        .order("name", { ascending: true })
        .limit(limit ?? 20);

      if (enabled_only !== false) {
        query = query.eq("enabled", true);
      }

      const { data: tasks, error } = await query;

      if (error) {
        return { content: [{ type: "text" as const, text: `Error: ${error.message}` }], isError: true };
      }

      if (!tasks?.length) {
        const scope = enabled_only !== false ? "enabled " : "";
        return { content: [{ type: "text" as const, text: `No ${scope}scheduled tasks found.` }] };
      }

      const lines = tasks.map((t) => {
        const trigger =
          t.trigger_type === "cron" ? `cron: ${t.cron_expression}` :
          t.trigger_type === "due_date" ? `due_date: ${t.due_date_source} (${t.due_date_lead_days}d lead)` :
          t.trigger_type === "event" ? `event: ${t.event_source} (${t.event_lead_hours}h lead)` :
          "manual";
        const lastRun = t.last_run_at
          ? `Last run: ${new Date(t.last_run_at).toLocaleString()} (${t.last_run_status})`
          : "Never run";
        const status = t.enabled ? "ENABLED" : "DISABLED";
        return `**${t.name}** [${status}]\n  ID: ${t.id}\n  ${t.description || "(no description)"}\n  Trigger: ${trigger}\n  Type: ${t.task_type} → ${t.delivery_channel}\n  ${lastRun}`;
      });

      return {
        content: [{
          type: "text" as const,
          text: `Scheduled tasks (${tasks.length}):\n\n${lines.join("\n\n")}`,
        }],
      };
    } catch (err) {
      return { content: [{ type: "text" as const, text: `Error: ${err instanceof Error ? err.message : String(err)}` }], isError: true };
    }
  }
);

// ──────────────────────────────────────────────
// Tool 4: Run Task Now
// ──────────────────────────────────────────────

server.registerTool(
  "run_task_now",
  {
    title: "Run Task Now",
    description: "Manually trigger a scheduled task regardless of its schedule or enabled state. Provide either the task ID or name.",
    inputSchema: {
      id: z.string().optional().describe("UUID of the task to run"),
      name: z.string().optional().describe("Name of the task to run"),
    },
  },
  async ({ id, name }) => {
    try {
      if (!id && !name) {
        return { content: [{ type: "text" as const, text: "Error: provide either id or name." }], isError: true };
      }

      // Look up the task
      let query = supabase.from("scheduled_tasks").select("id, name");
      if (id) {
        query = query.eq("id", id);
      } else {
        query = query.eq("name", name!);
      }

      const { data: task, error: lookupErr } = await query.single();
      if (lookupErr || !task) {
        return { content: [{ type: "text" as const, text: `Task not found: ${lookupErr?.message ?? "unknown"}` }], isError: true };
      }

      // Call the task-runner Edge Function
      const runnerUrl = `${SUPABASE_URL}/functions/v1/task-runner`;
      const resp = await fetch(runnerUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ task_id: task.id }),
      });

      const result = await resp.json();

      if (!resp.ok || result.status === "error") {
        return {
          content: [{
            type: "text" as const,
            text: `Task "${task.name}" failed:\n\n${result.error || JSON.stringify(result)}`,
          }],
          isError: true,
        };
      }

      return {
        content: [{
          type: "text" as const,
          text: `Task "${task.name}" completed successfully.\n\n${result.output || "(no output)"}`,
        }],
      };
    } catch (err) {
      return { content: [{ type: "text" as const, text: `Error: ${err instanceof Error ? err.message : String(err)}` }], isError: true };
    }
  }
);

// ──────────────────────────────────────────────
// Tool 5: Task Run History
// ──────────────────────────────────────────────

server.registerTool(
  "task_run_history",
  {
    title: "Task Run History",
    description: "View recent task execution logs. Optionally filter by task ID.",
    inputSchema: {
      task_id: z.string().optional().describe("Filter to a specific task's history"),
      limit: z.number().optional().default(10).describe("Max log entries to return (default 10)"),
    },
  },
  async ({ task_id, limit }) => {
    try {
      let query = supabase
        .from("task_run_log")
        .select("id, task_id, started_at, completed_at, status, input_summary, output_summary, error_message, delivery_status")
        .order("started_at", { ascending: false })
        .limit(limit ?? 10);

      if (task_id) {
        query = query.eq("task_id", task_id);
      }

      const { data: logs, error } = await query;

      if (error) {
        return { content: [{ type: "text" as const, text: `Error: ${error.message}` }], isError: true };
      }

      if (!logs?.length) {
        return { content: [{ type: "text" as const, text: "No task run history found." }] };
      }

      // Fetch task names for display
      const taskIds = [...new Set(logs.map((l) => l.task_id))];
      const { data: tasks } = await supabase
        .from("scheduled_tasks")
        .select("id, name")
        .in("id", taskIds);

      const nameMap = new Map((tasks ?? []).map((t) => [t.id, t.name]));

      const lines = logs.map((l) => {
        const taskName = nameMap.get(l.task_id) ?? l.task_id;
        const started = new Date(l.started_at).toLocaleString();
        const duration = l.completed_at
          ? `${Math.round((new Date(l.completed_at).getTime() - new Date(l.started_at).getTime()) / 1000)}s`
          : "running";
        const statusIcon = l.status === "success" ? "OK" : l.status === "error" ? "ERR" : "...";

        let detail = `[${statusIcon}] ${taskName} — ${started} (${duration})`;
        if (l.input_summary) detail += `\n  Input: ${l.input_summary}`;
        if (l.error_message) detail += `\n  Error: ${l.error_message}`;
        if (l.output_summary) detail += `\n  Output: ${l.output_summary.slice(0, 200)}${l.output_summary.length > 200 ? "..." : ""}`;
        if (l.delivery_status) detail += `\n  Delivery: ${l.delivery_status}`;
        return detail;
      });

      return {
        content: [{
          type: "text" as const,
          text: `Task run history (${logs.length} entries):\n\n${lines.join("\n\n")}`,
        }],
      };
    } catch (err) {
      return { content: [{ type: "text" as const, text: `Error: ${err instanceof Error ? err.message : String(err)}` }], isError: true };
    }
  }
);

// ──────────────────────────────────────────────
// Hono App with Auth Check
// ──────────────────────────────────────────────

const app = new Hono();

app.post("*", async (c) => {
  // Fix: Claude Desktop connectors don't send the Accept header that
  // StreamableHTTPTransport requires. Build a patched request if missing.
  if (!c.req.header("accept")?.includes("text/event-stream")) {
    const headers = new Headers(c.req.raw.headers);
    headers.set("Accept", "application/json, text/event-stream");
    const patched = new Request(c.req.raw.url, {
      method: c.req.raw.method,
      headers,
      body: c.req.raw.body,
      // @ts-ignore -- duplex required for streaming body in Deno
      duplex: "half",
    });
    Object.defineProperty(c.req, "raw", { value: patched, writable: true });
  }

  // Accept access key via header OR URL query parameter
  const provided = c.req.header("x-brain-key") || new URL(c.req.url).searchParams.get("key");
  if (!provided || provided !== MCP_ACCESS_KEY) {
    return c.json({ error: "Invalid or missing access key" }, 401);
  }

  const transport = new StreamableHTTPTransport();
  await server.connect(transport);
  return transport.handleRequest(c);
});

app.get("*", (c) =>
  c.json({ status: "ok", service: "Scheduled Tasks MCP", version: "1.0.0" })
);

Deno.serve(app.fetch);
