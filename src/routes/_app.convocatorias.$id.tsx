import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ensureBorrador } from "@/lib/borrador.functions";
import { usePlan } from "@/hooks/usePlan";

export const Route = createFileRoute("/_app/convocatorias/$id")({ component: GrantDetail });

function GrantDetail() {
  const { id } = useParams({ from: "/_app/convocatorias/$id" });
  const navigate = useNavigate();
  const plan = usePlan();
  const ensure = useServerFn(ensureBorrador);
  const [creating, setCreating] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["convocatoria", id],
    queryFn: async () => {
      const { data } = await supabase.from("convocatorias").select("*").eq("id", id).maybeSingle();
      return data;
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

  if (isLoading) return <div className="max-w-3xl mx-auto"><div className="h-10 w-2/3 bg-recessed animate-pulse rounded mb-4" /></div>;
  if (!data) return <div className="max-w-3xl mx-auto">No encontrada.</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-h mb-4">
        <ArrowLeft size={14} /> Volver
      </Link>
      <div className="flex gap-2 mb-3">
        <span className="text-[10px] font-medium px-2 py-1 rounded uppercase tracking-wider bg-dusk text-white">{data.fuente}</span>
        {data.programa && <span className="text-[10px] font-medium px-2 py-1 rounded uppercase tracking-wider bg-recessed text-text-muted">{data.programa}</span>}
      </div>
      <h1 className="font-bold leading-tight" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}>
        {data.titulo}
      </h1>
      <p className="text-text-muted mt-2">{data.organismo}</p>

      <div className="mt-6 grid sm:grid-cols-3 gap-3">
        <Stat label="Importe máximo" value={data.importe_maximo ? `€${Number(data.importe_maximo).toLocaleString("es-ES")}` : "—"} />
        <Stat label="Cofinanciación" value={data.porcentaje_financiacion ? `${data.porcentaje_financiacion}%` : "—"} />
        <Stat label="Cierre" value={data.fecha_fin ? new Date(data.fecha_fin).toLocaleDateString("es-ES") : "—"} />
      </div>

      {data.resumen_elegibilidad && (
        <section className="mt-8 bg-card border border-border rounded-xl p-6">
          <h2 className="font-bold text-lg mb-2" style={{ fontFamily: "var(--font-display)" }}>Elegibilidad</h2>
          <p className="text-text-body leading-relaxed">{data.resumen_elegibilidad}</p>
        </section>
      )}

      {data.descripcion && (
        <section className="mt-4 bg-card border border-border rounded-xl p-6">
          <h2 className="font-bold text-lg mb-2" style={{ fontFamily: "var(--font-display)" }}>Descripción</h2>
          <p className="text-text-body leading-relaxed">{data.descripcion}</p>
        </section>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          onClick={empezarMemoria}
          disabled={creating}
          className="bg-gold text-obsidian font-semibold px-6 py-3 rounded-md shadow-gold hover:bg-gold-muted hover:text-white transition-colors disabled:opacity-60 inline-flex items-center gap-2"
        >
          {creating && <Loader2 size={14} className="animate-spin" />}
          Empezar memoria técnica con IA →
        </button>
        {data.url_convocatoria && (
          <a href={data.url_convocatoria} target="_blank" rel="noopener" className="border border-border-mid px-6 py-3 rounded-md hover:bg-recessed">
            Ver convocatoria oficial ↗
          </a>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="text-[11px] uppercase tracking-wider text-text-muted font-medium">{label}</div>
      <div className="text-text-h font-bold text-xl mt-1" style={{ fontFamily: "var(--font-display)" }}>{value}</div>
    </div>
  );
}
