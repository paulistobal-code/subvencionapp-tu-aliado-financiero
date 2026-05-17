import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Search, MapPin, Building2, Euro, Calendar, Filter, X, ArrowRight } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { MarketingNav } from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/MarketingFooter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const COMUNIDADES = [
  "Nacional", "Andalucía", "Aragón", "Asturias", "Baleares", "Canarias",
  "Cantabria", "Castilla-La Mancha", "Castilla y León", "Cataluña",
  "Comunidad Valenciana", "Extremadura", "Galicia", "La Rioja", "Madrid",
  "Murcia", "Navarra", "País Vasco", "Ceuta", "Melilla",
];

const FUENTES = ["BDNS", "KitDigital", "CDTI", "GVA", "IVACE", "PRTR", "HorizonEurope"];

const FUENTE_COLORS: Record<string, string> = {
  BDNS: "#1C2D4F", KitDigital: "#B45309", CDTI: "#6B21A8",
  GVA: "#991B1B", IVACE: "#7C2D12", PRTR: "#1D4ED8",
  HorizonEurope: "#065F46", Otro: "#475569",
};

type SearchParams = {
  q?: string;
  com?: string;
  fuente?: string;
  importe?: string;
};

export const Route = createFileRoute("/convocatorias")({
  head: () => ({
    meta: [
      { title: "Buscador de subvenciones públicas en España — SubvencionApp" },
      {
        name: "description",
        content:
          "Consulta más de 200 convocatorias activas de ayudas y subvenciones para autónomos y PYMEs en España: Kit Digital, CDTI, IVACE, BDNS y más. Datos del BDNS actualizados a diario.",
      },
      { name: "robots", content: "index,follow" },
      { property: "og:title", content: "Buscador de subvenciones · SubvencionApp" },
      {
        property: "og:description",
        content: "Encuentra subvenciones públicas para tu empresa. BDNS, Kit Digital, CDTI, IVACE…",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    q: typeof s.q === "string" ? s.q : undefined,
    com: typeof s.com === "string" ? s.com : undefined,
    fuente: typeof s.fuente === "string" ? s.fuente : undefined,
    importe: typeof s.importe === "string" ? s.importe : undefined,
  }),
  component: BuscadorPage,
});

function BuscadorPage() {
  const params = Route.useSearch();
  const navigate = Route.useNavigate();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [qLocal, setQLocal] = useState(params.q ?? "");

  const setParam = (patch: Partial<SearchParams>) => {
    navigate({ search: (prev: SearchParams) => ({ ...prev, ...patch }) });
  };

  const { data: convocatorias, isLoading } = useQuery({
    queryKey: ["public-convocatorias", params],
    queryFn: async () => {
      let q = supabase
        .from("convocatorias")
        .select(
          "id, titulo, organismo, fuente, descripcion, resumen_ia, importe_maximo, porcentaje_financiacion, fecha_fin, comunidades, tipos_beneficiario, programa",
        )
        .eq("activa", true)
        .order("fecha_fin", { ascending: true, nullsFirst: false })
        .limit(60);

      if (params.fuente) q = q.eq("fuente", params.fuente);
      if (params.com) q = q.contains("comunidades", [params.com]);
      if (params.importe) {
        const n = parseInt(params.importe, 10);
        if (!Number.isNaN(n)) q = q.gte("importe_maximo", n);
      }
      if (params.q) q = q.ilike("titulo", `%${params.q}%`);

      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const activeFilters = useMemo(() => {
    const f: { key: keyof SearchParams; label: string }[] = [];
    if (params.q) f.push({ key: "q", label: `"${params.q}"` });
    if (params.com) f.push({ key: "com", label: params.com });
    if (params.fuente) f.push({ key: "fuente", label: params.fuente });
    if (params.importe) f.push({ key: "importe", label: `≥ ${params.importe} €` });
    return f;
  }, [params]);

  // Structured data: ItemList for SEO
  const itemListJsonLd = useMemo(() => {
    if (!convocatorias || convocatorias.length === 0) return null;
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: convocatorias.slice(0, 20).map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `/convocatorias/${c.id}`,
        name: c.titulo,
      })),
    };
  }, [convocatorias]);

  return (
    <div className="min-h-screen bg-page">
      <MarketingNav />

      {itemListJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      )}

      {/* Hero */}
      <section className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
          <h1
            className="text-text-h font-bold"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              lineHeight: 1.1,
            }}
          >
            Buscador de subvenciones públicas
          </h1>
          <p className="mt-4 text-text-muted text-lg max-w-2xl">
            Convocatorias activas del BDNS, Kit Digital, CDTI, IVACE y más. Datos
            orientativos — verifica siempre en las fuentes oficiales.
          </p>

          {/* Search bar */}
          <form
            className="mt-8 flex flex-col sm:flex-row gap-2 max-w-3xl"
            onSubmit={(e) => {
              e.preventDefault();
              setParam({ q: qLocal || undefined });
            }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <Input
                value={qLocal}
                onChange={(e) => setQLocal(e.target.value)}
                placeholder="Ej. digitalización, I+D, autónomos, agricultura…"
                className="pl-10 h-12 text-base"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 px-6">
              Buscar
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-12 sm:hidden"
              onClick={() => setFiltersOpen(true)}
            >
              <Filter className="w-4 h-4 mr-1" /> Filtros
            </Button>
          </form>

          {activeFilters.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs text-text-muted">Filtros activos:</span>
              {activeFilters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => {
                    if (f.key === "q") setQLocal("");
                    setParam({ [f.key]: undefined });
                  }}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border border-border bg-recessed hover:bg-card transition-colors"
                >
                  {f.label} <X className="w-3 h-3" />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
        {/* Filters desktop */}
        <aside className="hidden lg:block">
          <Filters params={params} setParam={setParam} />
        </aside>

        {/* Results */}
        <main>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-text-muted">
              {isLoading
                ? "Cargando convocatorias…"
                : `${convocatorias?.length ?? 0} resultados`}
            </p>
          </div>

          {isLoading ? (
            <ResultsSkeleton />
          ) : convocatorias && convocatorias.length > 0 ? (
            <div className="space-y-3">
              {convocatorias.map((c) => (
                <ConvocatoriaCard key={c.id} c={c as ConvocatoriaRow} />
              ))}

              <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-center">
                <h3
                  className="font-bold text-lg text-text-h"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  ¿Quieres ver tus coincidencias personalizadas?
                </h3>
                <p className="text-text-muted text-sm mt-1 max-w-md mx-auto">
                  Crea una cuenta gratuita (30 días sin tarjeta) y te diremos qué
                  convocatorias encajan mejor con tu empresa.
                </p>
                <Link
                  to="/registro"
                  className="inline-flex items-center gap-2 mt-4 bg-gold text-obsidian font-semibold px-6 py-3 rounded-xl hover:bg-gold-muted hover:text-white transition-colors"
                >
                  Crear cuenta gratis <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <EmptyState onClear={() => navigate({ search: {} })} />
          )}
        </main>
      </div>

      {/* Mobile filters drawer */}
      {filtersOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-ink/60"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="relative ml-auto w-[80vw] max-w-xs bg-card h-full overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-text-h">Filtros</h3>
              <button onClick={() => setFiltersOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <Filters params={params} setParam={setParam} />
          </div>
        </div>
      )}

      <MarketingFooter />
    </div>
  );
}

type ConvocatoriaRow = {
  id: string;
  titulo: string;
  organismo: string;
  fuente: string;
  descripcion: string | null;
  resumen_ia: string | null;
  importe_maximo: number | null;
  porcentaje_financiacion: number | null;
  fecha_fin: string | null;
  comunidades: string[] | null;
  tipos_beneficiario: string[] | null;
  programa: string | null;
};

function ConvocatoriaCard({ c }: { c: ConvocatoriaRow }) {
  const cierre = c.fecha_fin ? parseISO(c.fecha_fin) : null;
  const color = FUENTE_COLORS[c.fuente] ?? FUENTE_COLORS.Otro;
  const resumen = c.resumen_ia || c.descripcion || "";

  return (
    <Link
      to="/convocatorias/$id"
      params={{ id: c.id }}
      className="block rounded-2xl border border-border bg-card hover:border-border-mid hover:shadow-md transition-all p-5"
    >
      <div className="flex items-start gap-3">
        <span
          className="text-[10px] font-bold uppercase tracking-wider text-white px-2 py-1 rounded shrink-0"
          style={{ background: color }}
        >
          {c.fuente}
        </span>
        {c.programa && (
          <Badge variant="outline" className="text-[10px]">
            {c.programa}
          </Badge>
        )}
        {cierre && (
          <span className="ml-auto text-xs text-text-muted flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Cierra {format(cierre, "d MMM yyyy", { locale: es })}
          </span>
        )}
      </div>

      <h2
        className="mt-3 font-bold text-text-h text-lg leading-snug line-clamp-2"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {c.titulo}
      </h2>

      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-text-muted">
        <Building2 className="w-3 h-3" /> {c.organismo}
      </div>

      {resumen && (
        <p className="mt-3 text-sm text-text-body line-clamp-2">{resumen}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-text-muted">
        {c.importe_maximo && (
          <span className="flex items-center gap-1">
            <Euro className="w-3 h-3" />
            Hasta{" "}
            {new Intl.NumberFormat("es-ES", {
              maximumFractionDigits: 0,
            }).format(c.importe_maximo)}{" "}
            €
          </span>
        )}
        {c.porcentaje_financiacion && (
          <span>{c.porcentaje_financiacion}% financiación</span>
        )}
        {c.comunidades && c.comunidades.length > 0 && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {c.comunidades.slice(0, 2).join(", ")}
            {c.comunidades.length > 2 && ` +${c.comunidades.length - 2}`}
          </span>
        )}
      </div>
    </Link>
  );
}

function Filters({
  params,
  setParam,
}: {
  params: SearchParams;
  setParam: (p: Partial<SearchParams>) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
          Comunidad
        </h3>
        <div className="space-y-1">
          {COMUNIDADES.slice(0, 8).map((c) => (
            <button
              key={c}
              onClick={() => setParam({ com: params.com === c ? undefined : c })}
              className={`block w-full text-left text-sm px-2 py-1.5 rounded transition-colors ${
                params.com === c
                  ? "bg-gold-light text-gold-muted font-medium"
                  : "text-text-body hover:bg-recessed"
              }`}
            >
              {c}
            </button>
          ))}
          <select
            value={params.com && !COMUNIDADES.slice(0, 8).includes(params.com) ? params.com : ""}
            onChange={(e) => setParam({ com: e.target.value || undefined })}
            className="mt-2 w-full text-sm bg-card border border-border rounded-md px-2 py-1.5"
          >
            <option value="">Otra comunidad…</option>
            {COMUNIDADES.slice(8).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
          Fuente
        </h3>
        <div className="space-y-1">
          {FUENTES.map((f) => (
            <button
              key={f}
              onClick={() => setParam({ fuente: params.fuente === f ? undefined : f })}
              className={`block w-full text-left text-sm px-2 py-1.5 rounded transition-colors ${
                params.fuente === f
                  ? "bg-gold-light text-gold-muted font-medium"
                  : "text-text-body hover:bg-recessed"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
          Importe mínimo
        </h3>
        <div className="space-y-1">
          {[
            { v: "5000", l: "≥ 5.000 €" },
            { v: "20000", l: "≥ 20.000 €" },
            { v: "100000", l: "≥ 100.000 €" },
            { v: "500000", l: "≥ 500.000 €" },
          ].map((o) => (
            <button
              key={o.v}
              onClick={() =>
                setParam({ importe: params.importe === o.v ? undefined : o.v })
              }
              className={`block w-full text-left text-sm px-2 py-1.5 rounded transition-colors ${
                params.importe === o.v
                  ? "bg-gold-light text-gold-muted font-medium"
                  : "text-text-body hover:bg-recessed"
              }`}
            >
              {o.l}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-5 animate-pulse">
          <div className="h-4 w-20 bg-recessed rounded mb-3" />
          <div className="h-5 w-3/4 bg-recessed rounded mb-2" />
          <div className="h-4 w-1/2 bg-recessed rounded" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
      <Search className="w-10 h-10 text-text-muted mx-auto mb-3" />
      <h3
        className="font-bold text-text-h"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Sin resultados
      </h3>
      <p className="text-sm text-text-muted mt-1 max-w-md mx-auto">
        Prueba a quitar filtros o usar términos más generales. Las convocatorias se
        actualizan a diario desde el BDNS.
      </p>
      <button
        onClick={onClear}
        className="mt-4 text-sm font-medium text-gold-muted hover:underline"
      >
        Quitar todos los filtros
      </button>
    </div>
  );
}
