import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_app/convocatorias/$id")({ component: GrantDetail });

function GrantDetail() {
  const { id } = useParams({ from: "/_app/convocatorias/$id" });
  const { data, isLoading } = useQuery({
    queryKey: ["convocatoria", id],
    queryFn: async () => {
      const { data } = await supabase.from("convocatorias").select("*").eq("id", id).maybeSingle();
      return data;
    },
  });

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
        <Link to="/solicitudes" className="bg-gold text-obsidian font-semibold px-6 py-3 rounded-md shadow-gold hover:bg-gold-muted hover:text-white transition-colors">
          Empezar memoria técnica con IA →
        </Link>
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
