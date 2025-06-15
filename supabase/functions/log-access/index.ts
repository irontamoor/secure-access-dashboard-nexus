
/**
 * Log access event from door controller.
 * Expects:
 *   - x-api-key header (controller's API key)
 *   - POST body: { card_number: string, pin: string, door_id: string, access_type: string, notes?: string }
 * Stores to access_logs (with controller_id for traceability)
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

Deno.serve(async (req) => {
  // CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Missing API key" }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  // Validate API Key
  const supabase = (await import("npm:@supabase/supabase-js")).createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const { data: controller, error: keyError } = await supabase
    .from("controller_api_keys")
    .select("id")
    .eq("api_key", apiKey)
    .eq("is_active", true)
    .maybeSingle();

  if (!controller) {
    return new Response(JSON.stringify({ error: "Invalid or inactive API key" }), {
      status: 403,
      headers: corsHeaders,
    });
  }

  // Get body
  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const { card_number, pin, door_id, access_type, notes } = body ?? {};
  if (!card_number || !pin || !door_id || !access_type) {
    return new Response(
      JSON.stringify({ error: "card_number, pin, door_id, access_type required" }),
      { status: 400, headers: corsHeaders }
    );
  }

  // Optionally fetch user by card_number/pin, but not required
  // Insert log
  const { error: insertErr } = await supabase
    .from("access_logs")
    .insert([{
      card_number,
      pin_used: pin,
      door_id,
      access_type,
      notes,
      controller_id: controller.id,
      timestamp: new Date().toISOString(),
    }]);

  if (insertErr) {
    return new Response(
      JSON.stringify({ error: "DB error", details: insertErr.message }),
      { status: 500, headers: corsHeaders }
    );
  }

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: corsHeaders }
  );
});
