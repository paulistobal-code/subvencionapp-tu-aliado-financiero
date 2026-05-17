import { createFileRoute } from "@tanstack/react-router";
import { MarketingNav } from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/MarketingFooter";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Política de cookies — SubvencionApp" },
      { name: "description", content: "Información sobre el uso de cookies en SubvencionApp." },
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
            Política de cookies
          </h1>
          <p className="text-text-muted mt-2 text-sm">
            Conforme a la guía sobre el uso de cookies de la AEPD (2023). Última actualización:{" "}
            {new Date().toLocaleDateString("es-ES")}
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-text-h">¿Qué son las cookies?</h2>
          <p>
            Las cookies son pequeños archivos que se descargan en tu dispositivo al visitar una web y
            permiten almacenar y recuperar información sobre tu navegación.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-text-h">Cookies que utilizamos</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-2 pr-4 font-bold">Nombre</th>
                  <th className="py-2 pr-4 font-bold">Tipo</th>
                  <th className="py-2 pr-4 font-bold">Finalidad</th>
                  <th className="py-2 font-bold">Duración</th>
                </tr>
              </thead>
              <tbody className="text-text-body">
                <tr className="border-b border-border">
                  <td className="py-2 pr-4 font-mono text-xs">sb-*-auth-token</td>
                  <td className="py-2 pr-4">Técnica (propia)</td>
                  <td className="py-2 pr-4">Mantener tu sesión iniciada (Supabase Auth).</td>
                  <td className="py-2">Sesión / 1 año</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 pr-4 font-mono text-xs">sa_cookie_consent_v1</td>
                  <td className="py-2 pr-4">Técnica (propia)</td>
                  <td className="py-2 pr-4">Recordar tu decisión sobre el banner de cookies.</td>
                  <td className="py-2">1 año</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono text-xs">__cf_*</td>
                  <td className="py-2 pr-4">Técnica (terceros)</td>
                  <td className="py-2 pr-4">Seguridad y protección anti-bot (Cloudflare).</td>
                  <td className="py-2">30 min – 1 año</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-text-muted text-sm">
            Solo utilizamos cookies <strong>técnicas estrictamente necesarias</strong> para el
            funcionamiento del Servicio, exentas de consentimiento según el art. 22.2 LSSI-CE. Si en
            el futuro incorporamos cookies de analítica o publicidad, te pediremos consentimiento
            expreso mediante el banner.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-text-h">Cómo gestionar las cookies</h2>
          <p>
            Puedes configurar tu navegador para bloquear o eliminar cookies en cualquier momento.
            Ten en cuenta que deshabilitar las cookies técnicas puede impedir el correcto
            funcionamiento del Servicio (no podrás mantener la sesión iniciada).
          </p>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li>
              <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noreferrer" className="underline">Google Chrome</a>
            </li>
            <li>
              <a href="https://support.mozilla.org/es/kb/proteccion-mejorada-contra-rastreo-firefox-escritorio" target="_blank" rel="noreferrer" className="underline">Mozilla Firefox</a>
            </li>
            <li>
              <a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noreferrer" className="underline">Apple Safari</a>
            </li>
            <li>
              <a href="https://support.microsoft.com/es-es/microsoft-edge" target="_blank" rel="noreferrer" className="underline">Microsoft Edge</a>
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-text-h">Revocar el consentimiento</h2>
          <p>
            Puedes borrar tu decisión limpiando el almacenamiento local del navegador. La próxima vez
            que entres, el banner volverá a aparecer.
          </p>
        </section>
      </article>
      <MarketingFooter />
    </div>
  );
}
