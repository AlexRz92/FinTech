import { createClient } from "npm:@supabase/supabase-js@2.57.4";

interface CreateUserPayload {
  name: string;
  username: string;
  email: string;
  password: string;
}

interface ErrorResponse {
  ok: false;
  step: string;
  message: string;
  details?: string;
  code?: string;
  hint?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function sanitizePayload(payload: Partial<CreateUserPayload>) {
  const sanitized = { ...payload };
  delete sanitized.password;
  return sanitized;
}

function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  let payload: Partial<CreateUserPayload>;

  try {
    payload = await req.json();

    // VALIDATION
    if (!payload.email || !payload.username || !payload.password || !payload.name) {
      const errorResponse: ErrorResponse = {
        ok: false,
        step: "VALIDATION",
        message: "Campos requeridos: name, email, username, password",
        details: `Recibido: name=${payload.name ? '✓' : '✗'}, email=${payload.email ? '✓' : '✗'}, username=${payload.username ? '✓' : '✗'}, password=${payload.password ? '✓' : '✗'}`,
      };

      console.error("[VALIDATION]", {
        payload: sanitizePayload(payload),
        error: errorResponse.message,
      });

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!validateEmail(payload.email)) {
      const errorResponse: ErrorResponse = {
        ok: false,
        step: "VALIDATION",
        message: "Email inválido",
        details: `Email: ${payload.email}`,
      };

      console.error("[VALIDATION]", {
        payload: sanitizePayload(payload),
        error: errorResponse.message,
      });

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (payload.password.length < 8) {
      const errorResponse: ErrorResponse = {
        ok: false,
        step: "VALIDATION",
        message: "Contraseña debe tener mínimo 8 caracteres",
        details: `Largo actual: ${payload.password.length}`,
      };

      console.error("[VALIDATION]", {
        payload: sanitizePayload(payload),
        error: errorResponse.message,
      });

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // AUTH_CHECK
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      const errorResponse: ErrorResponse = {
        ok: false,
        step: "AUTH_CHECK",
        message: "Token de autorización faltante o inválido",
        details: "El header Authorization debe incluir un Bearer token válido",
      };

      console.error("[AUTH_CHECK]", errorResponse.message);

      return new Response(JSON.stringify(errorResponse), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const accessToken = authHeader.substring(7);
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { data: { user: currentUser }, error: authError } = await adminClient.auth.getUser(accessToken);

    if (authError || !currentUser) {
      const errorResponse: ErrorResponse = {
        ok: false,
        step: "USER_VERIFICATION",
        message: authError?.message || "Usuario no autenticado",
      };

      console.error("[USER_VERIFICATION]", errorResponse.message);

      return new Response(JSON.stringify(errorResponse), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: currentProfile, error: profileCheckError } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", currentUser.id)
      .maybeSingle();

    if (profileCheckError) {
      const errorResponse: ErrorResponse = {
        ok: false,
        step: "ADMIN_CHECK",
        message: profileCheckError.message || "Error verificando permisos",
        details: profileCheckError.hint,
        code: profileCheckError.code,
      };

      console.error("[ADMIN_CHECK]", errorResponse);

      return new Response(JSON.stringify(errorResponse), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!currentProfile || currentProfile.role !== "ADMIN") {
      const errorResponse: ErrorResponse = {
        ok: false,
        step: "ADMIN_CHECK",
        message: "Solo administradores pueden crear usuarios",
        details: `Rol actual: ${currentProfile?.role || 'sin perfil'}`,
      };

      console.error("[ADMIN_CHECK]", errorResponse.message);

      return new Response(JSON.stringify(errorResponse), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if username already exists
    const { data: existingUsername, error: usernameCheckError } = await adminClient
      .from("profiles")
      .select("id")
      .eq("username", payload.username)
      .maybeSingle();

    if (usernameCheckError) {
      const errorResponse: ErrorResponse = {
        ok: false,
        step: "USERNAME_CHECK",
        message: usernameCheckError.message || "Error verificando username",
        code: usernameCheckError.code,
      };

      console.error("[USERNAME_CHECK]", errorResponse);

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (existingUsername) {
      const errorResponse: ErrorResponse = {
        ok: false,
        step: "VALIDATION",
        message: "Este username ya existe",
        details: `Username: ${payload.username}`,
      };

      console.error("[VALIDATION]", errorResponse.message);

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // STEP 1: AUTH_CREATE (PRUEBA AISLADA - SOLO ESTO)
    console.log("[AUTH_CREATE] Intentando crear usuario Auth...");
    const { data: newAuthUser, error: createAuthError } = await adminClient.auth.admin.createUser({
      email: payload.email as string,
      password: payload.password as string,
      email_confirm: true,
    });

    if (createAuthError) {
      const errorResponse: ErrorResponse = {
        ok: false,
        step: "AUTH_CREATE",
        message: createAuthError.message || "Error al crear usuario en Auth",
        details: createAuthError.code,
        code: createAuthError.code,
      };

      console.error("[AUTH_CREATE] FALLO", {
        payload: sanitizePayload(payload),
        error: errorResponse,
      });

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!newAuthUser?.user?.id) {
      const errorResponse: ErrorResponse = {
        ok: false,
        step: "AUTH_CREATE",
        message: "Usuario de Auth creado sin ID",
      };

      console.error("[AUTH_CREATE] FALLO - Sin ID", errorResponse);

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[AUTH_CREATE] ✓ EXITO - Usuario Auth creado: ${newAuthUser.user.id}`);

    // STEP 2: PROFILE_CREATE
    console.log("[PROFILE_CREATE] Insertando perfil del usuario...");
    const { data: newProfile, error: createProfileError } = await adminClient
      .from("profiles")
      .insert({
        id: newAuthUser.user.id,
        email: payload.email,
        name: payload.name,
        username: payload.username,
        role: "USER",
      })
      .select()
      .single();

    if (createProfileError) {
      const errorResponse: ErrorResponse = {
        ok: false,
        step: "PROFILE_CREATE",
        message: createProfileError.message || "Error al crear perfil",
        details: createProfileError.code,
        code: createProfileError.code,
      };

      console.error("[PROFILE_CREATE] FALLO", {
        userId: newAuthUser.user.id,
        payload: sanitizePayload(payload),
        error: errorResponse,
      });

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[PROFILE_CREATE] ✓ EXITO - Perfil creado para: ${newAuthUser.user.id}`);

    return new Response(
      JSON.stringify({
        ok: true,
        step: "USER_CREATED",
        userId: newAuthUser.user.id,
        message: "Usuario creado exitosamente",
        user: {
          id: newProfile.id,
          email: newProfile.email,
          name: newProfile.name,
          username: newProfile.username,
          role: newProfile.role,
        },
      }),
      {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const errorResponse: ErrorResponse = {
      ok: false,
      step: "UNKNOWN",
      message: error instanceof Error ? error.message : "Error interno del servidor",
      details: error instanceof Error ? error.stack : String(error),
    };

    console.error("[UNKNOWN]", {
      payload: sanitizePayload(payload as Partial<CreateUserPayload>),
      error: errorResponse,
    });

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
