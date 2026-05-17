import { createFileRoute } from "@tanstack/react-router";
import { MarketingNav } from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/MarketingFooter";

export const Route = createFileRoute("/aviso-legal")({
  head: () => ({
    meta: [
      { title: "Aviso legal — SubvencionApp" },
      { name: "description", content: "Aviso legal de SubvencionApp conforme a la LSSI-CE." },
      { name: "robots", content: "index,follow" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="min-h-screen bg-page">
      <MarketingNav />
      <article className="max-w-3xl mx-auto px-6 py-16 space-y-6 text-[15px] leading-relaxed text-text-body">
        <header>
          <h1 className="font-bold text-4xl text-text-h" style={{ fontFamily: "var(--font-display)" }}>
            Aviso legal
          </h1>
          <p className="text-text-muted mt-2 text-sm">
            Última actualización: {new Date().toLocaleDateString("es-ES")}
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-text-h">1. Titular del sitio web</h2>
          <p>
            En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la
            Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Titular:</strong> SubvencionApp S.L.</li>
            <li><strong>NIF:</strong> B-XXXXXXXX</li>
            <li><strong>Domicilio social:</strong> Av. del Puerto, 00, 46011 Valencia, España</li>
            <li><strong>Email:</strong> hola@subvencionapp.es</li>
            <li><strong>Registro Mercantil:</strong> Valencia, Tomo —, Folio —, Hoja V-—</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-text-h">2. Objeto</h2>
          <p>
            El presente aviso legal regula el uso del sitio web <strong>subvencionapp.es</strong> y de
            la aplicación SaaS asociada (en adelante, "el Servicio"), propiedad de SubvencionApp S.L.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-text-h">3. Información orientativa</h2>
          <p>
            <strong>SubvencionApp.es no pertenece a ninguna administración pública.</strong> Los datos
            sobre convocatorias se obtienen del <em>Sistema Nacional de Publicidad de Subvenciones y
            Ayudas Públicas (BDNS)</em> y de otras fuentes oficiales públicas, y tienen carácter
            estrictamente orientativo. El usuario debe verificar siempre la información en las fuentes
            oficiales (BDNS, boletines oficiales y sedes electrónicas) antes de presentar cualquier
            solicitud.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-text-h">4. Propiedad intelectual e industrial</h2>
          <p>
            Todos los contenidos del Servicio (código, diseño, textos, logos, marcas) son titularidad
            de SubvencionApp S.L. o de sus licenciantes y están protegidos por la legislación de
            propiedad intelectual e industrial. Queda prohibida su reproducción sin autorización.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-text-h">5. Responsabilidad</h2>
          <p>
            El titular no se hace responsable de los daños derivados del uso indebido del Servicio ni
            de las decisiones tomadas en base a la información mostrada. El usuario es el único
            responsable de la presentación correcta de sus solicitudes ante las administraciones.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-text-h">6. Ley aplicable y jurisdicción</h2>
          <p>
            El presente aviso legal se rige por la legislación española. Para la resolución de
            cualquier controversia, las partes se someten a los Juzgados y Tribunales de Valencia.
          </p>
        </section>
      </article>
      <MarketingFooter />
    </div>
  );
}
