// src/lib/ai-gateway.ts
// Switched from Lovable AI Gateway (Gemini) → Anthropic Claude direct
// Uses the Vercel AI SDK anthropic provider — no breaking changes to callers

import Anthropic from "@anthropic-ai/sdk";

// ─── Anthropic client (server-side only) ─────────────────────────────────────
// We instantiate lazily so the import doesn't blow up on the client bundle.
function getAnthropic() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
  return new Anthropic({ apiKey });
}

// ─── Streaming helper (replaces streamText from Lovable gateway) ──────────────
// Returns a ReadableStream<string> of text tokens — identical interface to
// what the old Lovable gateway returned via result.toTextStreamResponse().
export async function streamAnthropicText(opts: {
  system: string;
  prompt: string;
  signal?: AbortSignal;
}): Promise<Response> {
  const anthropic = getAnthropic();

  const stream = await anthropic.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
    system: opts.system,
    messages: [{ role: "user", content: opts.prompt }],
  });

  // Convert Anthropic stream → ReadableStream<Uint8Array> for Response
  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
        controller.close();
      } catch (e) {
        controller.error(e);
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

// ─── Non-streaming helper (replaces generateText from Lovable gateway) ────────
export async function generateAnthropicText(opts: {
  system: string;
  prompt: string;
  signal?: AbortSignal;
  maxTokens?: number;
}): Promise<string> {
  const anthropic = getAnthropic();
  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: opts.maxTokens ?? 1000,
    system: opts.system,
    messages: [{ role: "user", content: opts.prompt }],
  });
  const block = msg.content[0];
  if (block.type !== "text") return "";
  return block.text;
}

// ─── Grant summary (5-bullet IA summary for /convocatorias/:id) ───────────────
export async function generarResumenConvocatoria(conv: {
  titulo: string;
  organismo: string;
  descripcion?: string | null;
  resumen_elegibilidad?: string | null;
  importe_maximo?: number | null;
  porcentaje_financiacion?: number | null;
  fecha_fin?: string | null;
  tipos_beneficiario?: string[] | null;
  comunidades?: string[] | null;
}): Promise<string[]> {
  const prompt = `Resume esta convocatoria en exactamente 5 puntos.
Formato por punto: [emoji] **frase corta en negrita (máx. 6 palabras)** — explicación concisa (máx. 25 palabras).
Los 5 puntos cubren obligatoriamente:
1) importe máximo y porcentaje de financiación
2) quién puede solicitarla (tipo y tamaño empresa)
3) para qué puede usarse (usos elegibles)
4) cuándo cierra el plazo
5) el requisito más importante o diferencial

CONVOCATORIA:
Título: ${conv.titulo}
Organismo: ${conv.organismo}
Importe máximo: ${conv.importe_maximo ? `€${Number(conv.importe_maximo).toLocaleString("es-ES")}` : "—"}
Cofinanciación: ${conv.porcentaje_financiacion ? `${conv.porcentaje_financiacion}%` : "—"}
Plazo: ${conv.fecha_fin ?? "—"}
Beneficiarios: ${(conv.tipos_beneficiario ?? []).join(", ") || "—"}
Comunidades: ${(conv.comunidades ?? []).join(", ") || "—"}
Descripción: ${conv.descripcion ?? "—"}
Elegibilidad: ${conv.resumen_elegibilidad ?? "—"}

Devuelve SOLO los 5 puntos, uno por línea, sin numeración, sin texto adicional.`;

  const text = await generateAnthropicText({
    system: SISTEMA_MEMORIA,
    prompt,
    maxTokens: 600,
  });

  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 5);
}

// ─── System prompt ────────────────────────────────────────────────────────────
export const SISTEMA_MEMORIA = `Eres un experto en subvenciones y ayudas públicas españolas con conocimiento profundo de las bases reguladoras del BDNS, Kit Digital (Red.es), CDTI, IVACE, GVA y fondos europeos PRTR/Next Generation EU. Redactas documentos oficiales en español formal e institucional siguiendo los estándares de los organismos convocantes.

REGLAS ESTRICTAS:
- Nunca inventas datos. Datos desconocidos → [COMPLETAR: dato]
- No menciones que eres IA en el texto de la memoria.
- Usa vocabulario técnico del sector del solicitante.
- Sin introducciones, conclusiones ni metacomentarios.
- Respuestas directamente utilizables en documentos oficiales.`;

// ─── Section definitions ──────────────────────────────────────────────────────
export const SECCIONES = [
  { slug: "descripcion",  nombre: "Descripción del proyecto" },
  { slug: "diagnostico",  nombre: "Diagnóstico situación actual" },
  { slug: "objetivos",    nombre: "Objetivos del proyecto" },
  { slug: "plan_trabajo", nombre: "Plan de trabajo y metodología" },
  { slug: "recursos",     nombre: "Recursos humanos y técnicos" },
  { slug: "presupuesto",  nombre: "Presupuesto detallado" },
  { slug: "viabilidad",   nombre: "Viabilidad técnica y económica" },
  { slug: "impacto",      nombre: "Impacto y resultados esperados" },
] as const;

export type SeccionSlug = (typeof SECCIONES)[number]["slug"];

// ─── Prompt builders ──────────────────────────────────────────────────────────
export function buildMemoriaPrompt(args: {
  seccion: string;
  org: {
    nombre?: string | null;
    tipo?: string | null;
    sector?: string[] | null;
    cnae?: string | null;
    empleados?: number | null;
    comunidad_autonoma?: string | null;
    actividad_descripcion?: string | null;
    necesidades_digitalizacion?: string[] | null;
  };
  conv: {
    titulo: string;
    organismo: string;
    programa?: string | null;
    importe_maximo?: number | null;
    resumen_elegibilidad?: string | null;
  };
  contenidoActual?: string;
}) {
  const { seccion, org, conv, contenidoActual } = args;
  return `Redacta la sección '${seccion}' de la memoria técnica.

EMPRESA: ${org.nombre ?? "[COMPLETAR: nombre]"}, ${org.tipo ?? "—"}, sector ${(org.sector ?? []).join(", ") || "—"}, CNAE ${org.cnae ?? "—"}, ${org.empleados ?? 0} empleados, ${org.comunidad_autonoma ?? "—"}.
Actividad: ${org.actividad_descripcion ?? "—"}.
Necesidades: ${(org.necesidades_digitalizacion ?? []).join(", ") || "—"}.

CONVOCATORIA: ${conv.titulo} — ${conv.organismo}.
Programa: ${conv.programa ?? "—"}. Importe: ${conv.importe_maximo ? `€${Number(conv.importe_maximo).toLocaleString("es-ES")}` : "—"}.
Bases: ${conv.resumen_elegibilidad ?? "—"}.

Contenido actual (si existe): ${contenidoActual || "(vacío)"}.

Redacta entre 300 y 500 palabras en español formal. Usa terminología propia de ${conv.organismo}. Menciona el CNAE ${org.cnae ?? ""} si es relevante. Datos faltantes → [COMPLETAR: descripción]. Empieza directamente con el contenido, sin título.`;
}

export function buildCompliancePrompt(args: {
  seccion: string;
  texto: string;
  conv: {
    titulo: string;
    organismo: string;
    resumen_elegibilidad?: string | null;
  };
}) {
  return `Analiza la sección '${args.seccion}' de la memoria técnica para '${args.conv.titulo}' (${args.conv.organismo}).
Requisitos de las bases: ${args.conv.resumen_elegibilidad ?? "(no disponible)"}.
Texto a analizar: ${args.texto}

Devuelve SOLO un array JSON (sin markdown, sin texto extra, sin code fences):
[{"tipo":"error"|"advertencia"|"info","descripcion":"...","sugerencia":"..."}]
Si no hay problemas, devuelve: []`;
}
