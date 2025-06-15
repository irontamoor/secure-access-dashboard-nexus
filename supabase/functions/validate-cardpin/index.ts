
/**
 * Validate card number and PIN for controllers.
 * Expects:
 *  - x-api-key header (controller's API key)
 *  - POST body: { card_number: string, pin: string }
 * Returns (if valid and user is enabled): { user_id, name, card_number }
 * Otherwise 401 or 403.
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
    .select("*")
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

  const { card_number, pin } = body ?? {};
  if (!card_number || !pin) {
    return new Response(JSON.stringify({ error: "card_number and pin required" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  // Fetch the user
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, name, card_number, disabled, pin_disabled, pin")
    .eq("card_number", card_number)
    .eq("pin", pin)
    .maybeSingle();

  if (!user || user.disabled || user.pin_disabled) {
    return new Response(
      JSON.stringify({ error: "Not found or access denied" }),
      { status: 403, headers: corsHeaders }
    );
  }

  return new Response(
    JSON.stringify({
      user_id: user.id,
      name: user.name,
      card_number: user.card_number,
    }),
    { status: 200, headers: corsHeaders }
  );
});
