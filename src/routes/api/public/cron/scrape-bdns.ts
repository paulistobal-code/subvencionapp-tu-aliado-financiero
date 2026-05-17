/**
 * Cron route — BDNS scraper.
 *
 * Llamado cada noche por pg_cron. Descarga la página más reciente de convocatorias
 * del Sistema Nacional de Publicidad de Subvenciones (BDNS) y hace upsert en la
 * tabla `convocatorias` por codigo_bdns.
 *
 * Endpoint público (sin auth de usuario) protegido por la apikey de Supabase.
 * Idempotente: puede llamarse varias veces sin duplicar.
 */
import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

const BDNS_API = "https://www.pap.hacienda.gob.es/bdnstrans/api/convocatorias/busqueda";

type BdnsRow = {
  numeroConvocatoria?: string;
  codigoBDNS?: string;
  descripcion?: string;
  titulo?: string;
  organismo?: { descripcionCompleta?: string; nivel1?: string } | string;
  nivel1?: string;
  fechaRecepcion?: string;
  fechaInicioSolicitud?: string;
  fechaFinSolicitud?: string;
  importeTotal?: number;
  presupuestoTotal?: number;
  region?: string[] | string;
  tiposBeneficiarios?: string[];
  urlBasesReguladoras?: string;
  url?: string;
};

const COMUNIDAD_MAP: Record<string, string> = {
  "01": "Andalucía", "02": "Aragón", "03": "Asturias", "04": "Baleares",
  "05": "Canarias", "06": "Cantabria", "07": "Castilla y León",
  "08": "Castilla-La Mancha", "09": "Cataluña", "10": "Comunidad Valenciana",
  "11": "Extremadura", "12": "Galicia", "13": "Madrid", "14": "Murcia",
  "15": "Navarra", "16": "País Vasco", "17": "La Rioja", "18": "Ceuta",
  "19": "Melilla", ES: "Nacional",
};

function pickOrganismo(row: BdnsRow): string {
  if (typeof row.organismo === "string") return row.organismo;
  return row.organismo?.descripcionCompleta || row.organismo?.nivel1 || row.nivel1 || "Sin especificar";
}

function pickComunidades(row: BdnsRow): string[] {
  const r = row.region;
  if (!r) return ["Nacional"];
  const arr = Array.isArray(r) ? r : [r];
  const mapped = arr.map((code) => COMUNIDAD_MAP[code] ?? code).filter(Boolean);
  return mapped.length > 0 ? mapped : ["Nacional"];
}

async function fetchPage(page: number, signal: AbortSignal): Promise<BdnsRow[]> {
  const url = `${BDNS_API}?page=${page}&pageSize=50&order=fechaRecepcion&direccion=desc`;
  const r = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "SubvencionApp/1.0 (+https://subvencionapp.es)" },
    signal,
  });
  if (!r.ok) throw new Error(`BDNS ${r.status}`);
  const json = (await r.json()) as { content?: BdnsRow[] } | BdnsRow[];
  return Array.isArray(json) ? json : json.content ?? [];
}

export const Route = createFileRoute("/api/public/cron/scrape-bdns")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Auth: aceptamos la apikey de Supabase (pg_cron la envía)
        const apikey = request.headers.get("apikey") || request.headers.get("authorization")?.replace("Bearer ", "");
        if (!apikey) {
          return new Response("Missing apikey", { status: 401 });
        }

        const supabase = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { autoRefreshToken: false, persistSession: false } },
        );

        const started = Date.now();
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 25_000);

        let inserted = 0;
        let updated = 0;
        let errors = 0;

        try {
          // Recorremos las 2 primeras páginas (~100 convocatorias más recientes)
          for (const page of [1, 2]) {
            let rows: BdnsRow[] = [];
            try {
              rows = await fetchPage(page, controller.signal);
            } catch (err) {
              console.error(`[scrape-bdns] page ${page} fetch error`, err);
              errors++;
              continue;
            }

            for (const row of rows) {
              const codigo = row.codigoBDNS || row.numeroConvocatoria;
              const titulo = row.titulo || row.descripcion;
              if (!codigo || !titulo) continue;

              const payload = {
                fuente: "BDNS",
                codigo_bdns: codigo,
                titulo: titulo.slice(0, 500),
                organismo: pickOrganismo(row).slice(0, 300),
                descripcion: row.descripcion ?? null,
                importe_maximo: row.importeTotal ?? row.presupuestoTotal ?? null,
                fecha_inicio: row.fechaInicioSolicitud ?? row.fechaRecepcion ?? null,
                fecha_fin: row.fechaFinSolicitud ?? null,
                comunidades: pickComunidades(row),
                tipos_beneficiario: row.tiposBeneficiarios ?? ["Todos"],
                url_bases_reguladoras: row.urlBasesReguladoras ?? null,
                url_convocatoria: row.url ?? null,
                activa: !row.fechaFinSolicitud || new Date(row.fechaFinSolicitud) >= new Date(),
                scraped_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };

              // upsert por codigo_bdns
              const { data: existing } = await supabase
                .from("convocatorias")
                .select("id")
                .eq("codigo_bdns", codigo)
                .maybeSingle();

              if (existing) {
                const { error } = await supabase
                  .from("convocatorias")
                  .update(payload)
                  .eq("id", existing.id);
                if (error) errors++;
                else updated++;
              } else {
                const { error } = await supabase.from("convocatorias").insert(payload);
                if (error) errors++;
                else inserted++;
              }
            }
          }
        } finally {
          clearTimeout(timeout);
        }

        const result = {
          ok: true,
          inserted,
          updated,
          errors,
          duration_ms: Date.now() - started,
        };
        console.log("[scrape-bdns]", result);

        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
