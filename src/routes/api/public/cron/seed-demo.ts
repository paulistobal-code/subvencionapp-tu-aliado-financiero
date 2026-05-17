/**
 * Seed demo — inserta ~12 convocatorias de ejemplo realistas si la tabla
 * `convocatorias` está vacía. Útil en preview / primer arranque antes de que
 * el scraper BDNS pueble la base de datos.
 *
 * Llamar manualmente:
 *   POST /api/public/cron/seed-demo
 *   Header: apikey: <SUPABASE_PUBLISHABLE_KEY>
 */
import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

const DEMO_DATA: Record<string, unknown>[] = [
  {
    fuente: "KitDigital",
    codigo_bdns: "DEMO-KD-2026-01",
    titulo: "Kit Digital — Segmento III (autónomos y micropymes 0-2 empleados)",
    organismo: "Red.es — Ministerio para la Transformación Digital",
    descripcion:
      "Bono digital de hasta 2.000 € para autónomos y microempresas de hasta 2 empleados destinado a la implantación de soluciones de digitalización: web, ecommerce, gestión de redes sociales, ciberseguridad, factura electrónica y más.",
    resumen_ia:
      "Ayuda directa de hasta 2.000 € en bonos para digitalizar autónomos y micropymes. Sin justificación previa. Cobro al agente digitalizador.",
    importe_maximo: 2000,
    porcentaje_financiacion: 100,
    fecha_fin: "2026-12-31",
    comunidades: ["Nacional"],
    tipos_beneficiario: ["Autónomos", "Microempresa"],
    programa: "Kit Digital",
    url_bases_reguladoras: "https://www.acelerapyme.gob.es/kit-digital",
    activa: true,
  },
  {
    fuente: "KitDigital",
    codigo_bdns: "DEMO-KD-2026-02",
    titulo: "Kit Digital — Segmento II (pymes 3-9 empleados)",
    organismo: "Red.es",
    descripcion:
      "Bono de hasta 6.000 € para pymes de entre 3 y 9 empleados con el mismo catálogo de soluciones digitales.",
    importe_maximo: 6000,
    porcentaje_financiacion: 100,
    fecha_fin: "2026-12-31",
    comunidades: ["Nacional"],
    tipos_beneficiario: ["PYME"],
    programa: "Kit Digital",
    activa: true,
  },
  {
    fuente: "CDTI",
    codigo_bdns: "DEMO-CDTI-2026-NEO",
    titulo: "CDTI NEOTEC 2026 — Creación de empresas de base tecnológica",
    organismo: "Centro para el Desarrollo Tecnológico Industrial",
    descripcion:
      "Subvenciones de hasta 325.000 € (70% del presupuesto) para startups deeptech de menos de 3 años con proyectos innovadores en cualquier sector.",
    resumen_ia:
      "Hasta 325 k€ a fondo perdido para EBTs de menos de 3 años. Cubre el 70% del presupuesto. Requiere plan de empresa y equipo técnico cualificado.",
    importe_maximo: 325000,
    porcentaje_financiacion: 70,
    fecha_fin: "2026-04-15",
    comunidades: ["Nacional"],
    tipos_beneficiario: ["PYME", "Startup"],
    programa: "NEOTEC",
    activa: true,
  },
  {
    fuente: "CDTI",
    codigo_bdns: "DEMO-CDTI-2026-PID",
    titulo: "Proyectos de I+D Empresarial (PID 2026)",
    organismo: "CDTI",
    descripcion:
      "Ayuda parcialmente reembolsable para proyectos de investigación y desarrollo de empresas españolas. Tramo no reembolsable de hasta el 33%.",
    importe_maximo: 1500000,
    porcentaje_financiacion: 85,
    fecha_fin: "2026-12-31",
    comunidades: ["Nacional"],
    tipos_beneficiario: ["PYME", "Gran empresa"],
    programa: "I+D Empresarial",
    activa: true,
  },
  {
    fuente: "IVACE",
    codigo_bdns: "DEMO-IVACE-2026-DIG",
    titulo: "Ayudas IVACE Digitaliza-CV 2026",
    organismo: "Instituto Valenciano de Competitividad Empresarial",
    descripcion:
      "Subvenciones para pymes valencianas que implanten soluciones de Industria 4.0, IoT industrial, ciberseguridad o gemelo digital.",
    importe_maximo: 100000,
    porcentaje_financiacion: 50,
    fecha_fin: "2026-06-30",
    comunidades: ["Comunidad Valenciana"],
    tipos_beneficiario: ["PYME"],
    programa: "Digitaliza-CV",
    activa: true,
  },
  {
    fuente: "GVA",
    codigo_bdns: "DEMO-GVA-2026-EMP",
    titulo: "Ayudas LABORA al fomento del empleo autónomo 2026 (CV)",
    organismo: "LABORA — Generalitat Valenciana",
    descripcion:
      "Subvención de hasta 5.500 € para nuevas altas en RETA en la Comunidad Valenciana, ampliable para colectivos vulnerables y zonas rurales.",
    importe_maximo: 5500,
    porcentaje_financiacion: 100,
    fecha_fin: "2026-09-30",
    comunidades: ["Comunidad Valenciana"],
    tipos_beneficiario: ["Autónomos"],
    activa: true,
  },
  {
    fuente: "PRTR",
    codigo_bdns: "DEMO-PRTR-2026-MOV",
    titulo: "MOVES III — Vehículos eléctricos e infraestructura de recarga",
    organismo: "IDAE — Instituto para la Diversificación y Ahorro de la Energía",
    descripcion:
      "Ayudas para adquisición de vehículos eléctricos (hasta 7.000 €) e instalación de puntos de recarga (hasta 70% del coste). Gestionado por CCAA.",
    importe_maximo: 7000,
    porcentaje_financiacion: 70,
    fecha_fin: "2026-12-31",
    comunidades: ["Nacional"],
    tipos_beneficiario: ["Autónomos", "PYME", "Gran empresa", "Particular"],
    programa: "MOVES III",
    activa: true,
  },
  {
    fuente: "PRTR",
    codigo_bdns: "DEMO-PRTR-2026-EFI",
    titulo: "Eficiencia energética en PYME y Gran Empresa industrial",
    organismo: "IDAE",
    descripcion:
      "Subvenciones para mejora de la eficiencia energética de procesos industriales, calderas, motores y aire comprimido.",
    importe_maximo: 850000,
    porcentaje_financiacion: 45,
    fecha_fin: "2026-10-31",
    comunidades: ["Nacional"],
    tipos_beneficiario: ["PYME", "Gran empresa"],
    activa: true,
  },
  {
    fuente: "BDNS",
    codigo_bdns: "DEMO-BDNS-2026-AGR",
    titulo: "Ayudas a la incorporación de jóvenes agricultores 2026",
    organismo: "Ministerio de Agricultura, Pesca y Alimentación",
    descripcion:
      "Primera instalación de jóvenes (menores de 41 años) en explotaciones agrarias. Prima base de 70.000 € ampliable hasta 100.000 €.",
    importe_maximo: 100000,
    porcentaje_financiacion: 100,
    fecha_fin: "2026-05-31",
    comunidades: ["Nacional"],
    tipos_beneficiario: ["Autónomos", "PYME"],
    activa: true,
  },
  {
    fuente: "HorizonEurope",
    codigo_bdns: "DEMO-HE-2026-EIC",
    titulo: "EIC Accelerator — Deep Tech & Strategic Tech (CE)",
    organismo: "European Innovation Council",
    descripcion:
      "Subvención de hasta 2,5 M€ más inversión en equity de hasta 15 M€ para startups y scale-ups deep-tech con producto validado y ambición global.",
    importe_maximo: 2500000,
    porcentaje_financiacion: 70,
    fecha_fin: "2026-10-08",
    comunidades: ["Nacional"],
    tipos_beneficiario: ["PYME", "Startup"],
    programa: "EIC Accelerator",
    activa: true,
  },
  {
    fuente: "BDNS",
    codigo_bdns: "DEMO-BDNS-2026-MUJ",
    titulo: "Programa EMPRENDE — Mujer rural 2026",
    organismo: "Ministerio de Igualdad",
    descripcion:
      "Ayudas de hasta 12.000 € para mujeres emprendedoras en municipios de menos de 5.000 habitantes.",
    importe_maximo: 12000,
    porcentaje_financiacion: 90,
    fecha_fin: "2026-11-15",
    comunidades: ["Nacional"],
    tipos_beneficiario: ["Autónomos"],
    activa: true,
  },
  {
    fuente: "GVA",
    codigo_bdns: "DEMO-GVA-2026-IND",
    titulo: "Plan Estratégico de Industria CV — Modernización 2026",
    organismo: "Conselleria d'Innovació i Indústria",
    descripcion:
      "Apoyo a inversiones productivas, eficiencia energética y digitalización en empresas industriales de la Comunidad Valenciana.",
    importe_maximo: 500000,
    porcentaje_financiacion: 35,
    fecha_fin: "2026-07-15",
    comunidades: ["Comunidad Valenciana"],
    tipos_beneficiario: ["PYME", "Gran empresa"],
    activa: true,
  },
];

export const Route = createFileRoute("/api/public/cron/seed-demo")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apikey = request.headers.get("apikey") || request.headers.get("authorization")?.replace("Bearer ", "");
        if (!apikey) return new Response("Missing apikey", { status: 401 });

        const supabase = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { autoRefreshToken: false, persistSession: false } },
        );

        // Solo siembra si la tabla está vacía o solo tiene datos demo previos
        const { count } = await supabase
          .from("convocatorias")
          .select("id", { count: "exact", head: true });

        if ((count ?? 0) > DEMO_DATA.length + 5) {
          return new Response(
            JSON.stringify({ ok: true, skipped: true, reason: "table_not_empty", count }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        }

        let inserted = 0;
        let updated = 0;
        for (const row of DEMO_DATA) {
          const { data: existing } = await supabase
            .from("convocatorias")
            .select("id")
            .eq("codigo_bdns", row.codigo_bdns)
            .maybeSingle();

          if (existing) {
            await supabase.from("convocatorias").update(row).eq("id", existing.id);
            updated++;
          } else {
            await supabase.from("convocatorias").insert(row);
            inserted++;
          }
        }

        return new Response(
          JSON.stringify({ ok: true, inserted, updated, total: DEMO_DATA.length }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      },
    },
  },
});
