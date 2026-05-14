import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { streamText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider, SISTEMA_MEMORIA, buildMemoriaPrompt } from "@/lib/ai-gateway";
import { authFromRequest } from "@/lib/auth-helpers.server";

const InputSchema = z.object({
  borrador_id: z.string().uuid(),
  seccion_slug: z.string().min(1).max(50),
  seccion_nombre: z.string().min(1).max(120),
});

export const Route = createFileRoute("/api/memoria/generar")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const { supabase } = await authFromRequest(request);
          const body = InputSchema.parse(await request.json());

          const { data: borrador } = await supabase
            .from("borradores")
            .select("id, convocatoria_id, org_id, secciones")
            .eq("id", body.borrador_id)
            .maybeSingle();
          if (!borrador) return new Response("Borrador no encontrado", { status: 404 });

          const [{ data: conv }, { data: org }] = await Promise.all([
            supabase.from("convocatorias").select("titulo, organismo, programa, importe_maximo, resumen_elegibilidad").eq("id", borrador.convocatoria_id!).maybeSingle(),
            borrador.org_id
              ? supabase.from("organisations").select("nombre, tipo, sector, cnae, empleados, comunidad_autonoma, actividad_descripcion, necesidades_digitalizacion").eq("id", borrador.org_id).maybeSingle()
              : Promise.resolve({ data: null }),
          ]);
          if (!conv) return new Response("Convocatoria no encontrada", { status: 404 });

          const secciones = (borrador.secciones ?? {}) as Record<string, string>;
          const contenidoActual = secciones[body.seccion_slug] ?? "";

          const apiKey = process.env.LOVABLE_API_KEY;
          if (!apiKey) return new Response("AI Gateway no configurado", { status: 500 });

          const gateway = createLovableAiGatewayProvider(apiKey);
          const model = gateway("google/gemini-3-flash-preview");

          const result = streamText({
            model,
            system: SISTEMA_MEMORIA,
            prompt: buildMemoriaPrompt({
              seccion: body.seccion_nombre,
              org: org ?? {},
              conv,
              contenidoActual,
            }),
            abortSignal: request.signal,
          });

          return result.toTextStreamResponse({
            headers: { "Cache-Control": "no-store" },
          });
        } catch (e) {
          if (e instanceof Response) return e;
          console.error(e);
          return new Response((e as Error).message ?? "Error", { status: 500 });
        }
      },
    },
  },
});
