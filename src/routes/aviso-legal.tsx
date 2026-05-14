import { createFileRoute } from "@tanstack/react-router";
import { MarketingNav } from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/MarketingFooter";

export const Route = createFileRoute("/aviso-legal")({ component: Page });

function Page() {
  return (
    <div className="min-h-screen bg-page">
      <MarketingNav />
      <article className="max-w-3xl mx-auto px-6 py-16 prose prose-slate">
        <h1 className="font-bold text-4xl" style={{ fontFamily: "var(--font-display)" }}>Aviso legal</h1>
        <p className="text-text-muted">Última actualización: {new Date().toLocaleDateString("es-ES")}</p>
        <h2 className="mt-8 text-xl font-bold">Titular del sitio web</h2>
        <p>SubvencionApp S.L. · NIF: B-XXXXXXXX · Domicilio: Av. del Puerto, 00, 46011 Valencia · Email: hola@subvencionapp.es</p>
        <p>Inscrita en el Registro Mercantil de Valencia.</p>
        <h2 className="mt-6 text-xl font-bold">Objeto</h2>
        <p>El presente aviso legal regula el uso del sitio web SubvencionApp.es conforme a la Ley 34/2002 de Servicios de la Sociedad de la Información y Comercio Electrónico (LSSI-CE).</p>
        <h2 className="mt-6 text-xl font-bold">Información orientativa</h2>
        <p>SubvencionApp.es no pertenece a ninguna administración pública. Los datos sobre convocatorias se obtienen del BDNS y otras fuentes oficiales públicas y tienen fines orientativos. Verifica siempre la información en las fuentes oficiales antes de presentar cualquier solicitud.</p>
      </article>
      <MarketingFooter />
    </div>
  );
}
