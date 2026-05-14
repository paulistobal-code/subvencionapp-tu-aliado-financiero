import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Heart, Lock, Download, FileSpreadsheet, AlertCircle, Search } from "lucide-react";
import { useState } from "react";
import { format, differenceInDays, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import { usePlan } from "@/hooks/usePlan";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
  validateSearch: (s: Record<string, unknown>) => ({ nuevo: s.nuevo === true || s.nuevo === "true" }),
});

const FUENTE_COLORS: Record<string, string> = {
  BDNS: "#1C2D4F", KitDigital: "#B45309", CDTI: "#6B21A8",
  GVA: "#991B1B", IVACE: "#7C2D12", PRTR: "#1D4ED8",
  HorizonEurope: "#065F46", Otro: "#475569",
};

function Dashboard() {
  const { user } = useAuth();
  const plan = usePlan();
  const { nuevo } = Route.useSearch();
  const [sort, setSort] = useState<"relevancia" | "cierre" | "importe">("relevancia");

  const { data: org } = useQuery({
    queryKey: ["org", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("organisations").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
  });

  const { data: convocatorias, isLoading } = useQuery({
    queryKey: ["convocatorias", org?.tipo, org?.comunidad_autonoma, sort],
    enabled: !!org,
    queryFn: async () => {
      let q = supabase.from("convocatorias").select("*").eq("activa", true);
      const { data } = await q;
      if (!data) return [];
      // simple ranking & sort
      const ranked = data.map((c) => {
        let score = 60;
        const t = (c.tipos_beneficiario as string[] | null) || [];
        if (org?.tipo && (t.includes(org.tipo) || t.includes("Todos"))) score += 20;
        const com = (c.comunidades as string[] | null) || [];
        if (org?.comunidad_autonoma && (com.includes(org.comunidad_autonoma) || com.includes("Nacional"))) score += 15;
        const sects = (c.sectores as string[] | null) || [];
        const orgSects = (org?.sector as string[] | null) || [];
        if (orgSects.some((s) => sects.includes(s)) || sects.includes("Todos")) score += 5;
        return { ...c, _puntuacion: Math.min(100, score) };
      });
      ranked.sort((a, b) => {
        if (sort === "cierre") {
          if (!a.fecha_fin) return 1;
          if (!b.fecha_fin) return -1;
          return a.fecha_fin.localeCompare(b.fecha_fin);
        }
        if (sort === "importe") return (b.importe_maximo ?? 0) - (a.importe_maximo ?? 0);
        return b._puntuacion - a._puntuacion;
      });
      return ranked;
    },
  });

  const { data: guardadas } = useQuery({
    queryKey: ["guardadas-ids", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("convocatorias_guardadas").select("convocatoria_id").eq("user_id", user!.id);
      return new Set((data ?? []).map((r) => r.convocatoria_id as string));
    },
  });

  if (isLoading || !org) return <DashboardSkeleton />;

  const total = convocatorias?.length ?? 0;
  const limited = plan.matchLimit === Infinity ? convocatorias : convocatorias?.slice(0, plan.matchLimit);
  const showWall = plan.matchLimit !== Infinity && total > plan.matchLimit;

  return (
    <div className="max-w-[860px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-bold leading-tight" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 3vw, 1.875rem)" }}>
            {nuevo ? `Buscando convocatorias para ${org.nombre}…` : `Encontramos ${total} convocatorias para ${org.nombre}`}
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Ordenadas por relevancia para tu perfil ({org.tipo}, {org.comunidad_autonoma || "España"})
          </p>
        </div>
        <div className="flex gap-2">
          <ExportBtn enabled={plan.canExportExcel} icon={FileSpreadsheet} label="Excel" />
          <ExportBtn enabled={plan.canExportPDF} icon={Download} label="PDF" />
        </div>
      </div>

      {/* Sort */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-border pb-3 text-sm">
        {([
          ["relevancia", "Más relevantes"],
          ["cierre", "Cierre próximo"],
          ["importe", "Mayor importe"],
        ] as const).map(([id, l]) => (
          <button
            key={id}
            onClick={() => setSort(id)}
            className={`px-3 py-1.5 font-medium transition-all ${
              sort === id ? "text-text-h border-b-2 border-gold -mb-[13px] pb-3" : "text-text-muted hover:text-text-body"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {(limited ?? []).map((c, i) => (
          <GrantCard
            key={c.id}
            grant={c}
            index={i}
            saved={guardadas?.has(c.id) ?? false}
            userId={user!.id}
          />
        ))}
        {showWall && (
          <div className="relative">
            <div className="bg-card border-2 border-dashed border-gold-border rounded-xl p-8 text-center">
              <Lock size={32} className="mx-auto text-gold" />
              <h3 className="font-bold text-xl mt-4" style={{ fontFamily: "var(--font-display)" }}>
                Desbloquea {total - plan.matchLimit} convocatorias más
              </h3>
              <p className="text-text-muted mt-2">
                Estás viendo {plan.matchLimit} de {total} convocatorias activas para tu perfil.
              </p>
              <div className="mt-5 flex flex-col sm:flex-row gap-2 justify-center">
                <Link to="/precios" className="bg-gold text-obsidian font-semibold px-6 py-2.5 rounded-md shadow-gold hover:bg-gold-muted hover:text-white">
                  Activar Pro — €79/mes →
                </Link>
                <Link to="/precios" className="border border-border-mid px-6 py-2.5 rounded-md text-text-body hover:bg-recessed">
                  Por solicitud — €149
                </Link>
              </div>
            </div>
          </div>
        )}
        {total === 0 && (
          <div className="text-center py-16">
            <Search size={48} className="mx-auto text-gold mb-4" />
            <h3 className="font-bold text-xl" style={{ fontFamily: "var(--font-display)" }}>No encontramos coincidencias exactas</h3>
            <p className="text-text-muted mt-2">Amplía los filtros o completa el perfil CNAE.</p>
            <Link to="/cuenta" className="inline-block mt-4 bg-gold text-obsidian font-semibold px-6 py-2.5 rounded-md">
              Completar perfil →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function ExportBtn({ enabled, icon: Icon, label }: { enabled: boolean; icon: typeof Download; label: string }) {
  return (
    <button
      onClick={() => !enabled ? toast.info(`La exportación a ${label} requiere el plan Pro`) : toast.success(`Exportación ${label} en preparación`)}
      className="inline-flex items-center gap-2 text-sm border border-border-mid px-3 py-2 rounded-md hover:bg-recessed transition-colors"
    >
      {!enabled && <Lock size={12} />}
      <Icon size={14} /> {label}
    </button>
  );
}

function GrantCard({
  grant, index, saved, userId,
}: { grant: any; index: number; saved: boolean; userId: string }) {
  const [isSaved, setIsSaved] = useState(saved);
  const fuenteColor = FUENTE_COLORS[grant.fuente as string] ?? "#475569";
  const score = grant._puntuacion as number;
  const fechaFin = grant.fecha_fin ? parseISO(grant.fecha_fin) : null;
  const daysLeft = fechaFin ? differenceInDays(fechaFin, new Date()) : null;

  const scoreCls =
    score >= 80 ? "bg-ok-bg text-ok border-ok-bd"
    : score >= 60 ? "bg-warn-bg text-warn border-warn-bd"
    : "bg-recessed text-text-muted border-border";

  async function toggleSave() {
    const prev = isSaved;
    setIsSaved(!prev);
    if (prev) {
      await supabase.from("convocatorias_guardadas").delete().eq("user_id", userId).eq("convocatoria_id", grant.id);
      toast.success("Convocatoria eliminada de guardadas");
    } else {
      const { error } = await supabase.from("convocatorias_guardadas").insert({ user_id: userId, convocatoria_id: grant.id });
      if (error) {
        setIsSaved(prev);
        toast.error("No se pudo guardar");
      } else {
        toast.success("Convocatoria guardada");
      }
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.045, ease: "easeOut" }}
      className="relative bg-card border border-border rounded-xl shadow-notary-sm hover:shadow-notary-md hover:-translate-y-px transition-all overflow-hidden"
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ background: fuenteColor }} />

      <div className="p-6 pl-7">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Badge>{grant.fuente}</Badge>
            {grant.programa && <Badge variant="muted">{grant.programa}</Badge>}
          </div>
          <div className={`shrink-0 w-11 h-11 rounded-full border flex items-center justify-center font-bold text-[13px] ${scoreCls}`}
            title="Relevancia IA según tu perfil">
            {score}%
          </div>
        </div>

        <h3 className="text-text-h font-semibold mt-3 leading-snug line-clamp-2"
          style={{ fontFamily: "var(--font-display)", fontSize: "19px" }}>
          <Link to="/convocatorias/$id" params={{ id: grant.id }} className="hover:underline">
            {grant.titulo}
          </Link>
        </h3>
        <p className="text-text-muted text-[13px] mt-1">{grant.organismo}</p>

        <div className="flex flex-wrap gap-x-5 gap-y-2 mt-3 text-[13px] font-medium">
          {grant.importe_maximo && (
            <span className="text-gold-muted">💶 Hasta €{Number(grant.importe_maximo).toLocaleString("es-ES")}</span>
          )}
          {fechaFin && daysLeft !== null && (
            <DeadlinePill fechaFin={fechaFin} daysLeft={daysLeft} />
          )}
          <span className="text-text-muted">
            🏛 {grant.comunidades?.includes("Nacional") ? "Nacional" : grant.comunidades?.[0] ?? "—"}
          </span>
        </div>

        {grant.descripcion && (
          <p className="text-text-muted text-sm mt-3 line-clamp-2 leading-relaxed">{grant.descripcion}</p>
        )}

        <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
          <div>
            {score < 65 && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-warn-bg text-warn">
                <AlertCircle size={12} /> Verifica elegibilidad
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleSave} className="inline-flex items-center gap-1.5 text-sm text-text-body hover:text-gold-muted">
              <Heart size={16} fill={isSaved ? "var(--gold)" : "none"} stroke={isSaved ? "var(--gold)" : "currentColor"} />
              {isSaved ? "Guardada" : "Guardar"}
            </button>
            <Link to="/convocatorias/$id" params={{ id: grant.id }} className="text-sm font-medium text-dusk hover:underline">
              Ver detalle →
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "muted" }) {
  return (
    <span
      className={`inline-block text-[10px] font-medium px-2 py-1 rounded uppercase tracking-wider ${
        variant === "muted" ? "bg-recessed text-text-muted" : "bg-dusk text-white"
      }`}
    >
      {children}
    </span>
  );
}

function DeadlinePill({ fechaFin, daysLeft }: { fechaFin: Date; daysLeft: number }) {
  if (daysLeft <= 7) {
    return (
      <span className="px-2 py-0.5 rounded bg-err-bg text-err text-xs font-semibold">
        ⚠ Cierra en {daysLeft} día{daysLeft !== 1 ? "s" : ""}
      </span>
    );
  }
  if (daysLeft <= 30) {
    return (
      <span className="px-2 py-0.5 rounded bg-warn-bg text-warn text-xs font-semibold">
        Cierra el {format(fechaFin, "dd/MM", { locale: es })}
      </span>
    );
  }
  return (
    <span className="text-text-muted">
      📅 Plazo: {format(fechaFin, "dd/MM/yyyy", { locale: es })}
    </span>
  );
}

function DashboardSkeleton() {
  return (
    <div className="max-w-[860px] mx-auto">
      <div className="h-8 w-2/3 bg-recessed rounded animate-pulse mb-3" />
      <div className="h-4 w-1/3 bg-recessed rounded animate-pulse mb-8" />
      <div className="space-y-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-6">
            <div className="flex gap-2 mb-3">
              <div className="h-5 w-20 bg-recessed rounded animate-pulse" />
              <div className="h-5 w-24 bg-recessed rounded animate-pulse" />
            </div>
            <div className="h-6 w-3/4 bg-recessed rounded animate-pulse mb-2" />
            <div className="h-4 w-1/2 bg-recessed rounded animate-pulse mb-4" />
            <div className="h-4 w-full bg-recessed rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
