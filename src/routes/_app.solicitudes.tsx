import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listBorradores } from "@/lib/borrador.functions";
import { FileText, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_app/solicitudes")({ component: SolicitudesPage });

function SolicitudesPage() {
  const fetchBorradores = useServerFn(listBorradores);
  const { data, isLoading } = useQuery({
    queryKey: ["borradores"],
    queryFn: () => fetchBorradores(),
  });

  return (
    <div className="max-w-5xl">
      <h1 className="font-bold text-3xl" style={{ fontFamily: "var(--font-display)" }}>Mis solicitudes</h1>
      <p className="text-text-muted mt-1">Tus borradores de memoria técnica.</p>

      {isLoading ? (
        <div className="mt-8 grid gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-recessed animate-pulse rounded-lg" />)}
        </div>
      ) : !data || data.length === 0 ? (
        <div className="mt-12 bg-card border border-border rounded-xl p-10 text-center">
          <FileText className="mx-auto text-gold mb-4" size={40} />
          <h2 className="font-bold text-xl" style={{ fontFamily: "var(--font-display)" }}>Aún no tienes borradores</h2>
          <p className="text-text-muted mt-2">Empieza desde una convocatoria del dashboard para crear tu primera memoria técnica con IA.</p>
          <Link to="/dashboard" className="inline-block mt-5 bg-dusk text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-slate transition-colors">
            Ir al dashboard →
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-3">
          {data.map((b) => {
            const conv = b.convocatorias as { titulo?: string; organismo?: string; fecha_fin?: string | null } | null;
            const completadas = b.secciones_completadas ?? 0;
            const pct = Math.round((completadas / 8) * 100);
            return (
              <Link
                key={b.id}
                to="/solicitud/$id"
                params={{ id: b.id }}
                className="group block bg-card border border-border rounded-lg p-5 hover:shadow-notary-md hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-text-h truncate">{conv?.titulo ?? "Sin convocatoria"}</h3>
                    <p className="text-sm text-text-muted mt-1">{conv?.organismo ?? ""}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-[11px] uppercase tracking-wider font-medium px-2 py-1 rounded bg-recessed text-text-muted">
                        {b.estado}
                      </span>
                      <div className="flex-1 max-w-[200px]">
                        <div className="flex justify-between text-[11px] text-text-muted mb-1">
                          <span>{b.secciones_completadas}/8 secciones</span>
                          <span>{pct}%</span>
                        </div>
                        <div className="h-1.5 bg-recessed rounded-full overflow-hidden">
                          <div className="h-full bg-gold transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="text-text-muted group-hover:text-gold group-hover:translate-x-1 transition-all" size={18} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
