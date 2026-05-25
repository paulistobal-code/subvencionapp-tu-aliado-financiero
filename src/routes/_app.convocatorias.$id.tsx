// src/routes/_app.convocatorias.$id.tsx
// Full grant detail with 4 tabs: Resumen IA, ¿Soy elegible?, Documentos, Bases reguladoras

import {
  createFileRoute,
  Link,
  useParams,
  useNavigate,
} from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  ArrowLeft,
  Heart,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Square,
  CheckSquare,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ensureBorrador } from "@/lib/borrador.functions";
import { usePlan } from "@/hooks/usePlan";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_app/convocatorias/$id")({
  component: GrantDetail,
});

/* ─── Types ─────────────────────────────────────────────────────────────── */
type Convocatoria = {
  id: string;
  titulo: string;
  organismo: string;
  fuente: string;
  programa: string | null;
  descripcion: string | null;
  resumen_elegibilidad: string | null;
  resumen_ia: string | null;
  importe_maximo: number | null;
  importe_minimo: number | null;
  porcentaje_financiacion: number | null;
  fecha_fin: string | null;
  fecha_inicio: string | null;
  sectores: string[] | null;
  comunidades: string[] | null;
  tipos_beneficiario: string[] | null;
  cnae_requeridos: string[] | null;
  url_convocatoria: string | null;
  url_bases_reguladoras: string | null;
  url_solicitud: string | null;
  activa: boolean;
};

/* ─── Main component ─────────────────────────────────────────────────────── */
function GrantDetail() {
  const { id } = useParams({ from: "/_app/convocatorias/$id" });
  const navigate = useNavigate();
  const plan = usePlan();
  const { user } = useAuth();
  const qc = useQueryClient();
  const ensure = useServerFn(ensureBorrador);
  const [creating, setCreating] = useState(false);

  const { data: conv, isLoading } = useQuery({
    queryKey: ["convocatoria", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("convocatorias")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      return data as Convocatoria | null;
    },
  });

  const { data: saved } = useQuery({
    queryKey: ["guardada", id, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("convocatorias_guardadas")
        .select("id")
        .eq("user_id", user!.id)
        .eq("convocatoria_id", id)
        .maybeSingle();
      return !!data;
    },
  });

  const toggleSave = useMutation({
    mutationFn: async () => {
      if (saved) {
        await supabase
          .from("convocatorias_guardadas")
          .delete()
          .eq("user_id", user!.id)
          .eq("convocatoria_id", id);
      } else {
        await supabase
          .from("convocatorias_guardadas")
          .insert({ user_id: user!.id, convocatoria_id: id });
      }
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["guardada", id, user?.id] });
      qc.setQueryData(["guardada", id, user?.id], !saved);
    },
    onSuccess: () =>
      toast.success(saved ? "Eliminada de guardadas" : "Convocatoria guardada"),
    onError: () => {
      qc.setQueryData(["guardada", id, user?.id], saved);
      toast.error("No se pudo guardar");
    },
  });

  async function empezarMemoria() {
    if (!plan.canUseAIWriter) {
      toast.error("La memoria técnica con IA requiere el plan Pro.");
      navigate({ to: "/precios" });
      return;
    }
    setCreating(true);
    try {
      const { id: borrId } = await ensure({ data: { convocatoria_id: id } });
      navigate({ to: "/solicitud/$id", params: { id: borrId } });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setCreating(false);
    }
  }

  if (isLoading) return <Skeleton />;
  if (!conv)
    return (
      <div className="max-w-3xl mx-auto">
        <p className="text-text-muted">Convocatoria no encontrada.</p>
      </div>
    );

  const fuenteColor: Record<string, string> = {
    BDNS: "#1C2D4F",
    KitDigital: "#B45309",
    CDTI: "#6B21A8",
    GVA: "#991B1B",
    IVACE: "#7C2D12",
    PRTR: "#1D4ED8",
    HorizonEurope: "#065F46",
    Otro: "#475569",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[860px] mx-auto"
    >
      {/* Breadcrumb */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-h mb-5"
      >
        <ArrowLeft size={14} aria-hidden />
        Volver al dashboard
      </Link>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span
          className="text-[10px] font-semibold px-2.5 py-1 rounded uppercase tracking-wider text-white"
          style={{ background: fuenteColor[conv.fuente] ?? "#475569" }}
        >
          {conv.fuente}
        </span>
        {conv.programa && (
          <span className="text-[10px] font-medium px-2.5 py-1 rounded uppercase tracking-wider bg-recessed text-text-muted">
            {conv.programa}
          </span>
        )}
        <span
          className={`text-[10px] font-semibold px-2.5 py-1 rounded uppercase tracking-wider ${
            conv.activa
              ? "bg-ok-bg text-ok"
              : "bg-err-bg text-err"
          }`}
        >
          {conv.activa ? "Activa" : "Cerrada"}
        </span>
      </div>

      {/* Title */}
      <h1
        className="font-bold leading-tight text-text-h"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1.6rem, 3.5vw, 2.25rem)",
        }}
      >
        {conv.titulo}
      </h1>
      <div className="flex items-center gap-2 mt-2 text-text-muted text-sm">
        <span>{conv.organismo}</span>
        {conv.url_convocatoria && (
          <a
            href={conv.url_convocatoria}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-gold-muted transition-colors"
            aria-label="Ver convocatoria oficial"
          >
            <ExternalLink size={13} aria-hidden />
          </a>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
        <StatCard
          label="Importe máximo"
          value={
            conv.importe_maximo
              ? `€${Number(conv.importe_maximo).toLocaleString("es-ES")}`
              : "—"
          }
          highlight
        />
        <StatCard
          label="Cofinanciación"
          value={
            conv.porcentaje_financiacion
              ? `${conv.porcentaje_financiacion}%`
              : "—"
          }
        />
        <StatCard
          label="Plazo de cierre"
          value={
            conv.fecha_fin
              ? new Date(conv.fecha_fin).toLocaleDateString("es-ES")
              : "Abierto"
          }
        />
        <StatCard
          label="Cobertura"
          value={
            conv.comunidades?.includes("Nacional")
              ? "Nacional"
              : conv.comunidades?.[0] ?? "—"
          }
        />
      </div>

      {/* Action row */}
      <div className="flex flex-wrap gap-3 mt-6">
        <button
          onClick={() => toggleSave.mutate()}
          disabled={toggleSave.isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-border-mid text-text-body hover:bg-recessed transition-colors text-sm font-medium"
          aria-label={saved ? "Eliminar de guardadas" : "Guardar convocatoria"}
        >
          <Heart
            size={15}
            fill={saved ? "var(--gold)" : "none"}
            stroke={saved ? "var(--gold)" : "currentColor"}
            aria-hidden
          />
          {saved ? "Guardada" : "Guardar"}
        </button>

        <button
          onClick={empezarMemoria}
          disabled={creating}
          className="inline-flex items-center gap-2 bg-gold text-obsidian font-semibold px-6 py-2.5 rounded-md shadow-gold hover:bg-gold-muted hover:text-white transition-colors text-sm disabled:opacity-60"
        >
          {creating && <Loader2 size={14} className="animate-spin" aria-hidden />}
          Preparar solicitud con IA →
        </button>

        {conv.url_bases_reguladoras && (
          <a
            href={conv.url_bases_reguladoras}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-gold-muted transition-colors"
          >
            Bases reguladoras <ExternalLink size={13} aria-hidden />
          </a>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="resumen" className="mt-8">
        <TabsList className="bg-recessed">
          <TabsTrigger value="resumen">Resumen IA</TabsTrigger>
          <TabsTrigger value="elegibilidad">¿Soy elegible?</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="bases">Bases reguladoras</TabsTrigger>
        </TabsList>

        <TabsContent value="resumen" className="mt-5">
          <ResumenIATab conv={conv} />
        </TabsContent>
        <TabsContent value="elegibilidad" className="mt-5">
          <ElegibilidadTab conv={conv} />
        </TabsContent>
        <TabsContent value="documentos" className="mt-5">
          <DocumentosTab conv={conv} />
        </TabsContent>
        <TabsContent value="bases" className="mt-5">
          <BasesTab conv={conv} />
        </TabsContent>
      </Tabs>

      {/* Sticky bottom CTA */}
      <div className="hidden sm:block fixed bottom-0 left-[260px] right-0 bg-card border-t border-border shadow-notary-md px-8 py-4 z-30">
        <div className="max-w-[860px] mx-auto flex items-center justify-between gap-4">
          <p className="text-sm text-text-muted truncate">
            <span className="font-medium text-text-h">{conv.titulo}</span>
          </p>
          <button
            onClick={empezarMemoria}
            disabled={creating}
            className="shrink-0 inline-flex items-center gap-2 bg-gold text-obsidian font-semibold px-5 py-2.5 rounded-md shadow-gold hover:bg-gold-muted hover:text-white transition-colors text-sm disabled:opacity-60"
          >
            {creating && <Loader2 size={13} className="animate-spin" aria-hidden />}
            Preparar solicitud →
          </button>
        </div>
      </div>
      <div className="h-16 hidden sm:block" /> {/* spacer for sticky bar */}
    </motion.div>
  );
}

/* ─── Tab: Resumen IA ───────────────────────────────────────────────────── */
function ResumenIATab({ conv }: { conv: Convocatoria }) {
  const { data: bullets, isLoading } = useQuery({
    queryKey: ["resumen-ia", conv.id],
    queryFn: async () => {
      // Use cached resumen_ia if available
      if (conv.resumen_ia) {
        return conv.resumen_ia
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);
      }
      // Otherwise fall back to plain description split into points
      return null;
    },
    staleTime: Infinity,
  });

  return (
    <div className="space-y-4">
      <div className="bg-warn-bg border border-warn-bd rounded-lg px-4 py-3 text-sm text-warn flex items-start gap-2">
        <AlertCircle size={15} className="shrink-0 mt-0.5" aria-hidden />
        <span>
          Resumen generado con asistencia de IA. Consulta siempre las{" "}
          <strong>bases reguladoras oficiales</strong> antes de presentar tu
          solicitud.
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-5 bg-recessed rounded animate-pulse"
              style={{ width: `${75 + i * 4}%` }}
            />
          ))}
        </div>
      ) : bullets && bullets.length > 0 ? (
        <ul className="space-y-3">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-text-body leading-relaxed">
              <span className="text-lg leading-none mt-0.5">{b.split(" ")[0]}</span>
              <span dangerouslySetInnerHTML={{ __html: b.replace(/^[^\s]+\s/, "").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="bg-card border border-border rounded-xl p-6">
          <p className="text-text-body leading-relaxed">
            {conv.resumen_elegibilidad ?? conv.descripcion ?? "Sin descripción disponible."}
          </p>
        </div>
      )}

      {conv.url_bases_reguladoras && (
        <a
          href={conv.url_bases_reguladoras}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-gold-muted hover:underline font-medium"
        >
          Ver bases reguladoras oficiales <ExternalLink size={13} aria-hidden />
        </a>
      )}
    </div>
  );
}

/* ─── Tab: Elegibilidad ─────────────────────────────────────────────────── */
function ElegibilidadTab({ conv }: { conv: Convocatoria }) {
  const { user } = useAuth();

  const { data: org } = useQuery({
    queryKey: ["org", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("organisations")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  if (!org) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 text-center">
        <p className="text-text-muted text-sm">Cargando tu perfil de empresa…</p>
      </div>
    );
  }

  // Build eligibility criteria from convocatoria + org
  const criteria = buildEligibilityCriteria(conv, org);
  const okCount = criteria.filter((c) => c.status === "ok").length;
  const totalVerifiable = criteria.filter((c) => c.status !== "verify").length;
  const pct = totalVerifiable > 0 ? Math.round((okCount / criteria.length) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-xl p-5">
        <p className="text-sm text-text-muted mb-1">
          Análisis para <strong className="text-text-h">{org.nombre}</strong>
        </p>
        <p className="text-xs text-text-muted">
          Basado en el perfil de tu empresa. No sustituye la lectura de las bases reguladoras.
        </p>
      </div>

      <div className="space-y-2">
        {criteria.map((c, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 p-4 rounded-lg border text-sm ${
              c.status === "ok"
                ? "bg-ok-bg border-ok-bd"
                : c.status === "no"
                ? "bg-err-bg border-err-bd"
                : "bg-warn-bg border-warn-bd"
            }`}
          >
            {c.status === "ok" ? (
              <CheckCircle2 size={16} className="text-ok shrink-0 mt-0.5" aria-hidden />
            ) : c.status === "no" ? (
              <XCircle size={16} className="text-err shrink-0 mt-0.5" aria-hidden />
            ) : (
              <AlertCircle size={16} className="text-warn shrink-0 mt-0.5" aria-hidden />
            )}
            <div>
              <p className={`font-medium ${c.status === "ok" ? "text-ok" : c.status === "no" ? "text-err" : "text-warn"}`}>
                {c.criterio}
              </p>
              <p className="text-text-body mt-0.5 leading-relaxed">{c.explicacion}</p>
            </div>
          </div>
        ))}
      </div>

      <div
        className={`rounded-xl p-5 border text-sm ${
          pct >= 70
            ? "bg-ok-bg border-ok-bd"
            : "bg-warn-bg border-warn-bd"
        }`}
      >
        <p className="font-semibold text-base">
          {pct >= 70
            ? `✓ Todo apunta a que eres elegible (${pct}% de criterios verificables)`
            : `⚠ Revisa los puntos marcados antes de solicitar (${pct}%)`}
        </p>
        {pct >= 70 && (
          <p className="text-text-muted mt-1">
            ¿Empezamos la solicitud?{" "}
            <Link
              to="/convocatorias/$id"
              params={{ id: conv.id }}
              className="font-semibold text-gold-muted hover:underline"
            >
              Preparar memoria técnica →
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Tab: Documentos ───────────────────────────────────────────────────── */
function DocumentosTab({ conv }: { conv: Convocatoria }) {
  const storageKey = `docs-checked-${conv.id}`;
  const [checked, setChecked] = useState<Set<number>>(() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  });

  const baseDocs = [
    "DNI/NIF del solicitante o representante legal",
    "Declaración responsable de no estar en situación de crisis",
    "Certificado de estar al corriente con la AEAT",
    "Certificado de estar al corriente con la TGSS",
    "Memoria técnica del proyecto",
    "Presupuesto detallado del proyecto",
  ];

  const extraDocs: Record<string, string[]> = {
    KitDigital: ["Formulario de adhesión al programa Kit Digital", "Selección de agente digitalizador acreditado"],
    CDTI: ["Plan de negocio tecnológico", "Informe técnico del proyecto", "Justificación de viabilidad económica"],
    IVACE: ["Certificado de estar al corriente con la Generalitat Valenciana", "Auditoría energética (si aplica)"],
    GVA: ["Licencia de actividad municipal", "Declaración de ayudas de minimis recibidas"],
    PRTR: ["Plan de digitalización de la empresa", "Acreditación de la inversión propia (30%)"],
  };

  const allDocs = [...baseDocs, ...(extraDocs[conv.fuente] ?? [])];

  function toggle(i: number) {
    const next = new Set(checked);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setChecked(next);
    try {
      sessionStorage.setItem(storageKey, JSON.stringify([...next]));
    } catch {
      // ignore
    }
  }

  const doneCount = [...checked].filter((i) => i < allDocs.length).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">
          Marca los documentos que ya tienes preparados
        </p>
        <span className="text-xs font-medium text-text-muted bg-recessed px-2.5 py-1 rounded-full">
          {doneCount}/{allDocs.length}
        </span>
      </div>

      <div className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden">
        {allDocs.map((doc, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className="w-full flex items-center gap-3 px-5 py-3.5 text-left text-sm hover:bg-recessed transition-colors"
            aria-pressed={checked.has(i)}
          >
            {checked.has(i) ? (
              <CheckSquare size={17} className="text-gold shrink-0" aria-hidden />
            ) : (
              <Square size={17} className="text-text-muted shrink-0" aria-hidden />
            )}
            <span className={checked.has(i) ? "line-through text-text-muted" : "text-text-body"}>
              {doc}
            </span>
          </button>
        ))}
      </div>

      {conv.url_bases_reguladoras && (
        <a
          href={conv.url_bases_reguladoras}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-gold-muted hover:underline"
        >
          Ver documentación completa en bases reguladoras <ExternalLink size={13} aria-hidden />
        </a>
      )}
    </div>
  );
}

/* ─── Tab: Bases reguladoras ────────────────────────────────────────────── */
function BasesTab({ conv }: { conv: Convocatoria }) {
  if (!conv.url_bases_reguladoras) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <p className="text-text-muted text-sm">
          Bases reguladoras no disponibles en formato embebido.
        </p>
        {conv.url_convocatoria && (
          <a
            href={conv.url_convocatoria}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 bg-dusk text-white font-medium px-5 py-2.5 rounded-md hover:bg-obsidian transition-colors text-sm"
          >
            Ver en sede electrónica <ExternalLink size={13} aria-hidden />
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <a
          href={conv.url_bases_reguladoras}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-gold-muted hover:underline"
        >
          Abrir en nueva pestaña <ExternalLink size={13} aria-hidden />
        </a>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <iframe
          src={conv.url_bases_reguladoras}
          title="Bases reguladoras"
          className="w-full"
          style={{ height: "600px" }}
        />
      </div>
    </div>
  );
}

/* ─── Helpers ───────────────────────────────────────────────────────────── */

function buildEligibilityCriteria(
  conv: Convocatoria,
  org: { tipo?: string | null; comunidad_autonoma?: string | null; cnae?: string | null; empleados?: number | null }
): { criterio: string; status: "ok" | "no" | "verify"; explicacion: string }[] {
  const criteria = [];

  // Tipo beneficiario
  if (conv.tipos_beneficiario && conv.tipos_beneficiario.length > 0) {
    const tipos = conv.tipos_beneficiario;
    if (tipos.includes("Todos") || (org.tipo && tipos.includes(org.tipo))) {
      criteria.push({
        criterio: "Tipo de empresa",
        status: "ok" as const,
        explicacion: `Tu empresa (${org.tipo ?? "—"}) está entre los beneficiarios aceptados.`,
      });
    } else {
      criteria.push({
        criterio: "Tipo de empresa",
        status: "no" as const,
        explicacion: `Esta convocatoria es para: ${tipos.join(", ")}. Tu empresa es ${org.tipo ?? "—"}.`,
      });
    }
  }

  // Comunidad
  if (conv.comunidades && conv.comunidades.length > 0) {
    const coms = conv.comunidades;
    if (coms.includes("Nacional") || (org.comunidad_autonoma && coms.includes(org.comunidad_autonoma))) {
      criteria.push({
        criterio: "Cobertura territorial",
        status: "ok" as const,
        explicacion: `Tu comunidad (${org.comunidad_autonoma ?? "—"}) está cubierta por esta convocatoria.`,
      });
    } else if (!org.comunidad_autonoma) {
      criteria.push({
        criterio: "Cobertura territorial",
        status: "verify" as const,
        explicacion: "Completa tu comunidad autónoma en el perfil para verificar este punto.",
      });
    } else {
      criteria.push({
        criterio: "Cobertura territorial",
        status: "no" as const,
        explicacion: `Esta convocatoria aplica en: ${coms.join(", ")}. Tu comunidad es ${org.comunidad_autonoma}.`,
      });
    }
  }

  // CNAE
  if (conv.cnae_requeridos && conv.cnae_requeridos.length > 0) {
    if (!org.cnae) {
      criteria.push({
        criterio: "Código CNAE",
        status: "verify" as const,
        explicacion: "Esta convocatoria requiere CNAEs específicos. Añade tu CNAE al perfil para verificar.",
      });
    } else if (conv.cnae_requeridos.includes(org.cnae)) {
      criteria.push({
        criterio: "Código CNAE",
        status: "ok" as const,
        explicacion: `Tu CNAE (${org.cnae}) está entre los requeridos.`,
      });
    } else {
      criteria.push({
        criterio: "Código CNAE",
        status: "no" as const,
        explicacion: `Tu CNAE (${org.cnae}) no está entre los requeridos: ${conv.cnae_requeridos.join(", ")}.`,
      });
    }
  }

  // Always add verify items
  criteria.push({
    criterio: "Obligaciones con AEAT y TGSS",
    status: "verify" as const,
    explicacion: "Debes estar al corriente de pago con la AEAT y la Seguridad Social. No podemos verificarlo automáticamente.",
  });

  criteria.push({
    criterio: "No estar en situación de crisis",
    status: "verify" as const,
    explicacion: "La empresa no debe estar en situación de crisis según el Reglamento (UE) nº 651/2014. Verifica antes de solicitar.",
  });

  return criteria;
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        highlight
          ? "bg-gold-light border-gold-border"
          : "bg-card border-border"
      }`}
    >
      <div className="text-[11px] uppercase tracking-wider text-text-muted font-medium">
        {label}
      </div>
      <div
        className={`font-bold text-xl mt-1 ${
          highlight ? "text-gold-muted" : "text-text-h"
        }`}
        style={{ fontFamily: "var(--font-display)" }}
      >
        {value}
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="max-w-[860px] mx-auto space-y-4 animate-pulse">
      <div className="h-4 w-32 bg-recessed rounded" />
      <div className="h-8 w-3/4 bg-recessed rounded" />
      <div className="h-4 w-1/2 bg-recessed rounded" />
      <div className="grid grid-cols-4 gap-3 mt-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-recessed rounded-lg" />
        ))}
      </div>
      <div className="h-64 bg-recessed rounded-xl mt-8" />
    </div>
  );
}
