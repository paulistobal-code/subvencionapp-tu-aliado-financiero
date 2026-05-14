import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export const createLovableAiGatewayProvider = (lovableApiKey: string) =>
  createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: {
      "Lovable-API-Key": lovableApiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });

export const SISTEMA_MEMORIA = `Eres un experto en subvenciones y ayudas públicas españolas con conocimiento profundo de las bases reguladoras del BDNS, Kit Digital (Red.es), CDTI, IVACE, GVA y fondos europeos PRTR/Next Generation EU. Redactas documentos oficiales en español formal e institucional siguiendo los estándares de los organismos convocantes.

REGLAS ESTRICTAS:
- Nunca inventas datos. Datos desconocidos → [COMPLETAR: dato]
- No menciones que eres IA en el texto de la memoria.
- Usa vocabulario técnico del sector del solicitante.
- Sin introducciones, conclusiones ni metacomentarios.
- Respuestas directamente utilizables en documentos oficiales.`;

export const SECCIONES = [
  { slug: "descripcion",   nombre: "Descripción del proyecto" },
  { slug: "diagnostico",   nombre: "Diagnóstico situación actual" },
  { slug: "objetivos",     nombre: "Objetivos del proyecto" },
  { slug: "plan_trabajo",  nombre: "Plan de trabajo y metodología" },
  { slug: "recursos",      nombre: "Recursos humanos y técnicos" },
  { slug: "presupuesto",   nombre: "Presupuesto detallado" },
  { slug: "viabilidad",    nombre: "Viabilidad técnica y económica" },
  { slug: "impacto",       nombre: "Impacto y resultados esperados" },
] as const;

export type SeccionSlug = typeof SECCIONES[number]["slug"];

export function buildMemoriaPrompt(args: {
  seccion: string;
  org: { nombre?: string | null; tipo?: string | null; sector?: string[] | null; cnae?: string | null; empleados?: number | null; comunidad_autonoma?: string | null; actividad_descripcion?: string | null; necesidades_digitalizacion?: string[] | null };
  conv: { titulo: string; organismo: string; programa?: string | null; importe_maximo?: number | null; resumen_elegibilidad?: string | null };
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
  conv: { titulo: string; organismo: string; resumen_elegibilidad?: string | null };
}) {
  return `Analiza la sección '${args.seccion}' de la memoria técnica para '${args.conv.titulo}' (${args.conv.organismo}).
Requisitos de las bases: ${args.conv.resumen_elegibilidad ?? "(no disponible)"}.
Texto a analizar: ${args.texto}

Devuelve SOLO un array JSON (sin markdown, sin texto extra, sin code fences):
[{"tipo":"error"|"advertencia"|"info","descripcion":"...","sugerencia":"..."}]
Si no hay problemas, devuelve: []`;
}
