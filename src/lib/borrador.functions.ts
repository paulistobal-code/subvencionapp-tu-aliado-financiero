import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/* ============ Crear o reutilizar borrador para una convocatoria ============ */
export const ensureBorrador = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ convocatoria_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: existing } = await supabase
      .from("borradores")
      .select("id")
      .eq("user_id", userId)
      .eq("convocatoria_id", data.convocatoria_id)
      .maybeSingle();
    if (existing) return { id: existing.id };

    const { data: org } = await supabase
      .from("organisations")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    const { data: created, error } = await supabase
      .from("borradores")
      .insert({
        user_id: userId,
        convocatoria_id: data.convocatoria_id,
        org_id: org?.id ?? null,
        secciones: {},
        alertas_cumplimiento: {},
        estado: "borrador",
        secciones_completadas: 0,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: created.id };
  });

/* ============ Guardar contenido de una sección ============ */
export const saveSeccion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      borrador_id: z.string().uuid(),
      seccion_slug: z.string().min(1).max(50),
      contenido: z.string().max(20000),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: borrador } = await supabase
      .from("borradores")
      .select("secciones")
      .eq("id", data.borrador_id)
      .maybeSingle();
    if (!borrador) throw new Error("Borrador no encontrado");

    const secciones = { ...(borrador.secciones as Record<string, string> ?? {}) };
    if (data.contenido.trim().length === 0) {
      delete secciones[data.seccion_slug];
    } else {
      secciones[data.seccion_slug] = data.contenido;
    }
    const completadas = Object.values(secciones).filter(
      (v) => typeof v === "string" && v.trim().split(/\s+/).filter(Boolean).length >= 100,
    ).length;

    const { error } = await supabase
      .from("borradores")
      .update({ secciones, secciones_completadas: completadas, updated_at: new Date().toISOString() })
      .eq("id", data.borrador_id);
    if (error) throw new Error(error.message);
    return { ok: true, completadas };
  });

/* ============ Borrador completo ============ */
export const getBorradorCompleto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ borrador_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: borrador, error } = await supabase
      .from("borradores")
      .select("*, convocatorias(*), organisations(*)")
      .eq("id", data.borrador_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!borrador) throw new Error("Borrador no encontrado");
    return borrador;
  });

/* ============ Listar borradores del usuario ============ */
export const listBorradores = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("borradores")
      .select("id, estado, secciones_completadas, updated_at, convocatorias(titulo, organismo, fecha_fin)")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });
