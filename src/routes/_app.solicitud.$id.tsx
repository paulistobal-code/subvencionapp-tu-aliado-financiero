import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Search, Wand2, Download, FileSpreadsheet, Loader2, Check, X, AlertCircle, AlertTriangle, Info, Square } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { usePlan } from "@/hooks/usePlan";
import { SECCIONES, type SeccionSlug } from "@/lib/ai-gateway";
import { getBorradorCompleto, saveSeccion } from "@/lib/borrador.functions";

export const Route = createFileRoute("/_app/solicitud/$id")({ component: SolicitudEditor });

type Issue = { tipo: "error" | "advertencia" | "info"; descripcion: string; sugerencia: string };

function SolicitudEditor() {
  const { id } = useParams({ from: "/_app/solicitud/$id" });
  const navigate = useNavigate();
  const plan = usePlan();
  const qc = useQueryClient();
  const fetchBorrador = useServerFn(getBorradorCompleto);

  const { data: borrador, isLoading } = useQuery({
    queryKey: ["borrador", id],
    queryFn: () => fetchBorrador({ data: { borrador_id: id } }),
    refetchOnWindowFocus: false,
  });

  const conv = (borrador?.convocatorias ?? null) as { id?: string; titulo?: string; organismo?: string; url_bases_reguladoras?: string | null } | null;
  const initialSecciones = (borrador?.secciones ?? {}) as Record<string, string>;
  const initialAlertas = (borrador?.alertas_cumplimiento ?? {}) as Record<string, Issue[]>;

  const [secciones, setSecciones] = useState<Record<string, string>>(initialSecciones);
  const [alertas, setAlertas] = useState<Record<string, Issue[]>>(initialAlertas);
  const [activeSeccion, setActiveSeccion] = useState<SeccionSlug>("descripcion");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const dirtyRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (borrador) {
      setSecciones((borrador.secciones ?? {}) as Record<string, string>);
      setAlertas((borrador.alertas_cumplimiento ?? {}) as Record<string, Issue[]>);
    }
  }, [borrador]);

  // Auto-save every 30s
  const saveMut = useMutation({
    mutationFn: useServerFn(saveSeccion),
    onSuccess: () => {
      setSavedAt(new Date());
      qc.invalidateQueries({ queryKey: ["borrador", id] });
    },
  });

  const flushDirty = () => {
    const slugs = Array.from(dirtyRef.current);
    dirtyRef.current.clear();
    for (const slug of slugs) {
      saveMut.mutate({ data: { borrador_id: id, seccion_slug: slug, contenido: secciones[slug] ?? "" } });
    }
  };

  useEffect(() => {
    const t = setInterval(flushDirty, 30000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secciones]);

  const updateSeccion = (slug: string, val: string) => {
    setSecciones((s) => ({ ...s, [slug]: val }));
    dirtyRef.current.add(slug);
  };

  const completadas = useMemo(
    () =>
      Object.values(secciones).filter(
        (v) => typeof v === "string" && v.trim().split(/\s+/).filter(Boolean).length >= 100,
      ).length,
    [secciones],
  );

  const sectionStatus = (slug: string): "empty" | "partial" | "complete" => {
    const v = secciones[slug];
    if (!v || !v.trim()) return "empty";
    const words = v.trim().split(/\s+/).filter(Boolean).length;
    if (words >= 100) return "complete";
    return "partial";
  };

  if (isLoading) {
    return <div className="p-8 text-text-muted text-sm">Cargando borrador…</div>;
  }
  if (!borrador) {
    return <div className="p-8">Borrador no encontrado. <Link to="/solicitudes" className="text-dusk underline">Volver</Link></div>;
  }
  if (!plan.canUseAIWriter) {
    return <UpgradeWall plan={plan.plan} />;
  }

  return (
    <div className="-mx-4 sm:-mx-8 -my-6 sm:-my-8 grid grid-cols-1 lg:grid-cols-[220px_1fr_340px] min-h-[calc(100vh-3.5rem)]">
      {/* LEFT NAV */}
      <aside className="bg-card border-r border-border p-4 hidden lg:flex flex-col">
        <Link to="/solicitudes" className="text-xs text-text-muted hover:text-text-h flex items-center gap-1 mb-3">
          <ArrowLeft size={12} /> Volver
        </Link>
        <h2 className="text-sm font-semibold text-text-h line-clamp-2" title={conv?.titulo}>{conv?.titulo}</h2>
        <span className="mt-2 inline-block w-fit text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded bg-recessed text-text-muted">
          Estado: {borrador.estado}
        </span>

        <nav className="mt-5 flex-1 overflow-y-auto space-y-1">
          {SECCIONES.map((s, i) => {
            const st = sectionStatus(s.slug);
            const active = activeSeccion === s.slug;
            const dotCls = st === "complete" ? "bg-ok text-ok-bg" : st === "partial" ? "bg-warn text-warn-bg" : "bg-recessed text-text-muted";
            return (
              <button
                key={s.slug}
                onClick={() => {
                  setActiveSeccion(s.slug);
                  document.getElementById(`sec-${s.slug}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`w-full text-left flex items-center gap-2 px-2 py-2 rounded-md text-[13px] transition-all ${active ? "bg-recessed text-text-h font-medium" : "text-text-body hover:bg-recessed"}`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${dotCls}`}>
                  {st === "complete" ? <Check size={11} /> : i + 1}
                </span>
                <span className="line-clamp-1">{s.nombre}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex justify-between text-xs text-text-muted mb-1.5">
            <span>Completado</span><span>{completadas}/8</span>
          </div>
          <div className="h-1.5 bg-recessed rounded-full overflow-hidden mb-3">
            <div className="h-full bg-gold transition-all" style={{ width: `${(completadas / 8) * 100}%` }} />
          </div>
          <ExportButton tipo="pdf" borradorId={id} disabled={completadas < 8} canExport={plan.canExportPDF} />
          <ExportButton tipo="xlsx" borradorId={id} disabled={completadas < 8} canExport={plan.canExportExcel} />
        </div>
      </aside>

      {/* CENTER EDITOR */}
      <section className="bg-page overflow-y-auto p-6 lg:p-8 relative">
        <div className="sticky top-0 z-10 -mx-6 lg:-mx-8 px-6 lg:px-8 py-2 bg-page/90 backdrop-blur flex justify-end text-[11px] text-text-muted">
          <AnimatePresence mode="wait">
            {savedAt && (
              <motion.span
                key={savedAt.toISOString()}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-1"
              >
                <Check size={12} className="text-ok" /> Guardado {hace(savedAt)}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div className="max-w-3xl mx-auto space-y-8 pb-20">
          {SECCIONES.map((s, i) => (
            <SeccionCard
              key={s.slug}
              index={i + 1}
              seccion={s}
              value={secciones[s.slug] ?? ""}
              onChange={(v) => updateSeccion(s.slug, v)}
              onBlur={flushDirty}
              onFocus={() => setActiveSeccion(s.slug)}
              issues={alertas[s.slug] ?? []}
            />
          ))}
        </div>
      </section>

      {/* RIGHT AI PANEL */}
      <AIPanel
        borradorId={id}
        seccion={SECCIONES.find((s) => s.slug === activeSeccion)!}
        currentText={secciones[activeSeccion] ?? ""}
        onApply={(text) => {
          updateSeccion(activeSeccion, text);
          flushDirty();
        }}
        onComplianceUpdate={(issues) => {
          setAlertas((a) => ({ ...a, [activeSeccion]: issues }));
        }}
      />

      <button
        onClick={() => navigate({ to: "/solicitudes" })}
        className="lg:hidden fixed top-2 left-2 z-20 bg-card border border-border px-3 py-1.5 rounded-md text-xs"
      >
        ← Volver
      </button>
    </div>
  );
}

function hace(d: Date): string {
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 5) return "ahora";
  if (s < 60) return `hace ${s}s`;
  return `hace ${Math.floor(s / 60)}m`;
}

function SeccionCard({
  index, seccion, value, onChange, onBlur, onFocus, issues,
}: {
  index: number;
  seccion: { slug: string; nombre: string };
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  onFocus: () => void;
  issues: Issue[];
}) {
  const words = value.trim().split(/\s+/).filter(Boolean).length;
  const chars = value.length;
  const wColor = words < 100 ? "text-warn" : words <= 600 ? "text-ok" : "text-err";
  return (
    <div id={`sec-${seccion.slug}`} className="bg-card border border-border rounded-xl p-5 scroll-mt-20">
      <div className="flex items-baseline justify-between mb-3 gap-3 flex-wrap">
        <h3 className="font-bold text-xl" style={{ fontFamily: "var(--font-display)" }}>
          <span className="text-gold mr-2">{index}.</span>{seccion.nombre}
        </h3>
        <span className="text-[11px] text-text-muted">300–500 palabras recomendadas</span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onFocus={onFocus}
        rows={10}
        placeholder="Escribe o usa el Asistente IA →"
        className="w-full bg-recessed border border-border rounded-md p-3 text-[15px] leading-[1.7] resize-y focus:outline-none focus:border-slate focus:ring-2 focus:ring-slate/20 transition-all min-h-[240px]"
      />
      <div className="flex justify-between text-[11px] mt-1.5">
        <span className={`${wColor} font-medium`}>{words} palabras · {chars} caracteres</span>
      </div>
      {issues.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {issues.map((it, idx) => <IssuePill key={idx} issue={it} />)}
        </div>
      )}
    </div>
  );
}

function IssuePill({ issue }: { issue: Issue }) {
  const cfg = issue.tipo === "error"
    ? { bg: "bg-err-bg", text: "text-err", bd: "border-err-bd", Icon: AlertCircle }
    : issue.tipo === "advertencia"
    ? { bg: "bg-warn-bg", text: "text-warn", bd: "border-warn-bd", Icon: AlertTriangle }
    : { bg: "bg-info-bg", text: "text-info", bd: "border-info-bd", Icon: Info };
  return (
    <span className={`inline-flex items-start gap-1.5 ${cfg.bg} ${cfg.text} border ${cfg.bd} rounded px-2 py-1 text-[11px] max-w-md`} title={issue.sugerencia}>
      <cfg.Icon size={12} className="mt-0.5 flex-shrink-0" />
      <span>{issue.descripcion}</span>
    </span>
  );
}

function AIPanel({
  borradorId, seccion, currentText, onApply, onComplianceUpdate,
}: {
  borradorId: string;
  seccion: { slug: string; nombre: string };
  currentText: string;
  onApply: (text: string) => void;
  onComplianceUpdate: (issues: Issue[]) => void;
}) {
  const [streamed, setStreamed] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [checking, setChecking] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  async function withAuth(): Promise<HeadersInit> {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
  }

  async function generar() {
    setStreamed("");
    setStreaming(true);
    abortRef.current = new AbortController();
    try {
      const res = await fetch("/api/memoria/generar", {
        method: "POST",
        headers: await withAuth(),
        body: JSON.stringify({ borrador_id: borradorId, seccion_slug: seccion.slug, seccion_nombre: seccion.nombre }),
        signal: abortRef.current.signal,
      });
      if (!res.ok || !res.body) {
        const msg = await res.text().catch(() => "Error");
        throw new Error(msg || "No se pudo generar");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setStreamed(acc);
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        toast.error((e as Error).message);
      }
    } finally {
      setStreaming(false);
    }
  }

  function detener() {
    abortRef.current?.abort();
  }

  async function revisar() {
    setChecking(true);
    try {
      const res = await fetch("/api/memoria/cumplimiento", {
        method: "POST",
        headers: await withAuth(),
        body: JSON.stringify({ borrador_id: borradorId, seccion_slug: seccion.slug, seccion_nombre: seccion.nombre }),
      });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json() as { issues: Issue[] };
      onComplianceUpdate(json.issues);
      if (json.issues.length === 0) toast.success("Sin observaciones en esta sección.");
      else toast.warning(`Encontramos ${json.issues.length} ${json.issues.length === 1 ? "punto" : "puntos"} a revisar.`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setChecking(false);
    }
  }

  return (
    <aside className="bg-card border-l border-border p-5 hidden lg:flex flex-col overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Asistente IA</h3>
        <span className="text-[10px] text-text-muted px-2 py-0.5 rounded bg-recessed">gemini-3-flash</span>
      </div>
      <p className="text-[11px] text-text-muted mt-2 mb-4">
        Sección activa: <span className="font-medium text-text-h">{seccion.nombre}</span>
      </p>

      <div className="flex flex-col gap-2">
        {!streaming ? (
          <button onClick={generar} className="flex items-center justify-center gap-2 bg-gold text-obsidian font-semibold text-sm px-4 py-2.5 rounded-md shadow-gold hover:bg-gold-muted hover:text-white transition-colors">
            <Sparkles size={14} /> Generar esta sección
          </button>
        ) : (
          <button onClick={detener} className="flex items-center justify-center gap-2 bg-err-bg text-err border border-err-bd font-semibold text-sm px-4 py-2.5 rounded-md hover:bg-err hover:text-white transition-colors">
            <Square size={12} /> Detener
          </button>
        )}
        <button
          onClick={revisar}
          disabled={checking || !currentText.trim()}
          className="flex items-center justify-center gap-2 border border-border-mid text-text-body text-sm px-4 py-2.5 rounded-md hover:bg-recessed transition-colors disabled:opacity-50"
        >
          {checking ? <Loader2 className="animate-spin" size={14} /> : <Search size={14} />} Revisar cumplimiento
        </button>
        <button
          disabled
          className="flex items-center justify-center gap-2 border border-border text-text-xmuted text-sm px-4 py-2.5 rounded-md cursor-not-allowed"
          title="Próximamente"
        >
          <Wand2 size={14} /> Mejorar redacción
        </button>
      </div>

      <AnimatePresence>
        {(streamed || streaming) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4"
          >
            <div className="bg-recessed border border-border rounded-md p-3 text-sm leading-relaxed max-h-72 overflow-y-auto whitespace-pre-wrap">
              {streamed}
              {streaming && <span className="inline-block w-1.5 h-4 bg-gold align-middle animate-pulse ml-0.5" />}
            </div>
            {!streaming && streamed && (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => { onApply(streamed); setStreamed(""); toast.success("Aplicado en el editor"); }}
                  className="flex-1 flex items-center justify-center gap-1 bg-gold text-obsidian text-xs font-semibold px-3 py-2 rounded-md hover:bg-gold-muted hover:text-white"
                >
                  <Check size={12} /> Aplicar
                </button>
                <button
                  onClick={() => setStreamed("")}
                  className="flex items-center justify-center gap-1 border border-border text-text-muted text-xs px-3 py-2 rounded-md hover:bg-recessed"
                >
                  <X size={12} /> Descartar
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-auto pt-6 border-t border-border">
        <p className="text-[10px] text-text-muted leading-relaxed">
          Las sugerencias de IA son orientativas. Verifica siempre el cumplimiento con las bases reguladoras oficiales antes de presentar tu solicitud. SubvencionApp no garantiza la concesión de subvenciones ni asume responsabilidad sobre el resultado de ninguna solicitud.
        </p>
      </div>
    </aside>
  );
}

function ExportButton({ tipo, borradorId, disabled, canExport }: { tipo: "pdf" | "xlsx"; borradorId: string; disabled: boolean; canExport: boolean }) {
  const [busy, setBusy] = useState(false);
  const Icon = tipo === "pdf" ? Download : FileSpreadsheet;
  const label = tipo === "pdf" ? "Exportar PDF" : "Exportar Excel";

  async function exportar() {
    if (!canExport) {
      toast.error("Exportar requiere el plan Pro o superior.");
      return;
    }
    setBusy(true);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      const res = await fetch(`/api/export/${tipo}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ borrador_id: borradorId }),
      });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const cd = res.headers.get("Content-Disposition") ?? "";
      const m = /filename="([^"]+)"/.exec(cd);
      const filename = m?.[1] ?? `memoria.${tipo}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
      toast.success("Descarga iniciada");
    } catch (e) {
      toast.error((e as Error).message ?? "Error al exportar");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={exportar}
      disabled={disabled || busy}
      title={disabled ? "Completa las 8 secciones" : undefined}
      className="w-full flex items-center justify-center gap-2 text-xs font-medium px-3 py-2 rounded-md border border-border text-text-body hover:bg-recessed disabled:opacity-50 disabled:cursor-not-allowed mt-2 transition-colors"
    >
      {busy ? <Loader2 size={12} className="animate-spin" /> : <Icon size={12} />} {label}
    </button>
  );
}

function UpgradeWall({ plan }: { plan: string }) {
  return (
    <div className="max-w-xl mx-auto py-16 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gold-light text-gold-muted mb-5">
        <Sparkles size={24} />
      </div>
      <h2 className="font-bold text-2xl" style={{ fontFamily: "var(--font-display)" }}>El editor de memoria requiere el plan Pro</h2>
      <p className="text-text-muted mt-3">
        La memoria técnica con IA, el revisor de cumplimiento y la exportación a PDF/Excel están disponibles desde el plan Pro.
        Tu plan actual: <span className="font-medium text-text-h">{plan}</span>.
      </p>
      <Link to="/precios" className="inline-block mt-6 bg-gold text-obsidian font-semibold px-6 py-3 rounded-md shadow-gold hover:bg-gold-muted hover:text-white transition-colors">
        Ver planes →
      </Link>
    </div>
  );
}
