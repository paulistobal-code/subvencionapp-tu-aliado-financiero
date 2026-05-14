import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider, SISTEMA_MEMORIA, buildCompliancePrompt } from "@/lib/ai-gateway";
import { authFromRequest } from "@/lib/auth-helpers.server";

const InputSchema = z.object({
  borrador_id: z.string().uuid(),
  seccion_slug: z.string().min(1).max(50),
  seccion_nombre: z.string().min(1).max(120),
});

type Issue = { tipo: "error" | "advertencia" | "info"; descripcion: string; sugerencia: string };

export const Route = createFileRoute("/api/memoria/cumplimiento")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const { supabase } = await authFromRequest(request);
          const body = InputSchema.parse(await request.json());

          const { data: borrador } = await supabase
            .from("borradores")
            .select("id, convocatoria_id, secciones, alertas_cumplimiento")
            .eq("id", body.borrador_id)
            .maybeSingle();
          if (!borrador) return new Response("Borrador no encontrado", { status: 404 });

          const secciones = (borrador.secciones ?? {}) as Record<string, string>;
          const texto = secciones[body.seccion_slug] ?? "";
          if (!texto.trim()) {
            return Response.json({ issues: [] });
          }

          const { data: conv } = await supabase
            .from("convocatorias")
            .select("titulo, organismo, resumen_elegibilidad")
            .eq("id", borrador.convocatoria_id!)
            .maybeSingle();
          if (!conv) return new Response("Convocatoria no encontrada", { status: 404 });

          const apiKey = process.env.LOVABLE_API_KEY!;
          const gateway = createLovableAiGatewayProvider(apiKey);
          const model = gateway("google/gemini-3-flash-preview");

          const { text } = await generateText({
            model,
            system: SISTEMA_MEMORIA,
            prompt: buildCompliancePrompt({ seccion: body.seccion_nombre, texto, conv }),
            abortSignal: request.signal,
          });

          let issues: Issue[] = [];
          try {
            const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/```$/i, "");
            const parsed = JSON.parse(cleaned);
            if (Array.isArray(parsed)) issues = parsed.slice(0, 20);
          } catch {
            issues = [];
          }

          const alertas = ((borrador.alertas_cumplimiento ?? {}) as Record<string, Issue[]>);
          alertas[body.seccion_slug] = issues;
          await supabase.from("borradores").update({ alertas_cumplimiento: alertas }).eq("id", body.borrador_id);

          return Response.json({ issues });
        } catch (e) {
          if (e instanceof Response) return e;
          console.error(e);
          return new Response((e as Error).message ?? "Error", { status: 500 });
        }
      },
    },
  },
});
