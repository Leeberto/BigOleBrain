/**
 * Shared auth resolver for Open Brain Edge Functions.
 *
 * Supports two auth paths:
 *   1. JWT (preferred): Authorization: Bearer <jwt> → anon-key client with RLS
 *   2. Access key (backward compat): x-brain-key header → service-role client + DEFAULT_USER_ID
 */

import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const MCP_ACCESS_KEY = Deno.env.get("MCP_ACCESS_KEY")!;
const DEFAULT_USER_ID = Deno.env.get("DEFAULT_USER_ID") ?? "";

export interface AuthResult {
  supabase: SupabaseClient;
  userId: string;
}

/**
 * Resolve user identity from request headers.
 *
 * @param headers - object with `.get(name)` (works with Hono `c.req` headers or standard Headers)
 * @param url - the request URL string (for query-param key fallback)
 * @returns AuthResult or null if unauthorized
 */
export async function resolveAuth(
  headers: { get(name: string): string | null | undefined },
  url: string,
): Promise<AuthResult | null> {
  // Path 1: JWT auth (preferred)
  const authHeader = headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const jwt = authHeader.slice(7);

    // Don't treat service-role key as a user JWT
    if (jwt === SUPABASE_SERVICE_ROLE_KEY) {
      return resolveAccessKey();
    }

    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });

    const { data: { user }, error } = await client.auth.getUser(jwt);
    if (error || !user) return null;

    return { supabase: client, userId: user.id };
  }

  // Path 2: Static access key (backward compat)
  const accessKey =
    headers.get("x-brain-key") ??
    new URL(url).searchParams.get("key");

  if (accessKey && accessKey === MCP_ACCESS_KEY) {
    return resolveAccessKey();
  }

  return null;
}

function resolveAccessKey(): AuthResult | null {
  if (!DEFAULT_USER_ID) return null;
  const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  return { supabase: client, userId: DEFAULT_USER_ID };
}
