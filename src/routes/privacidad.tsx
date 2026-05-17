import { createFileRoute } from "@tanstack/react-router";
import { MarketingNav } from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/MarketingFooter";

export const Route = createFileRoute("/privacidad")({
  head: () => ({
    meta: [
      { title: "Política de privacidad — SubvencionApp" },
      { name: "description", content: "Política de privacidad conforme al RGPD y la LOPDGDD." },
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
            Política de privacidad
          </h1>
          <p className="text-text-muted mt-2 text-sm">
            Conforme al Reglamento (UE) 2016/679 (RGPD) y la LO 3/2018 (LOPDGDD). Última actualización:{" "}
            {new Date().toLocaleDateString("es-ES")}
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-text-h">1. Responsable del tratamiento</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Razón social:</strong> SubvencionApp S.L. (B-XXXXXXXX)</li>
            <li><strong>Domicilio:</strong> Av. del Puerto, 00, 46011 Valencia</li>
            <li><strong>Email del responsable y DPO:</strong> hola@subvencionapp.es</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-text-h">2. Finalidades y base jurídica</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Prestación del servicio</strong> de búsqueda y gestión de subvenciones —{" "}
              <em>base: ejecución de contrato (art. 6.1.b RGPD)</em>.
            </li>
            <li>
              <strong>Alertas por email</strong> de nuevas convocatorias —{" "}
              <em>base: consentimiento expreso (art. 6.1.a RGPD y art. 21 LSSI-CE)</em>. Revocable en
              cualquier momento desde tu cuenta o con el enlace "Darse de baja" en cada email.
            </li>
            <li>
              <strong>Facturación y cumplimiento fiscal</strong> —{" "}
              <em>base: obligación legal (art. 6.1.c RGPD)</em>.
            </li>
            <li>
              <strong>Comunicaciones comerciales propias</strong> a clientes —{" "}
              <em>base: interés legítimo (art. 6.1.f RGPD)</em>, con derecho de oposición.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-text-h">3. Datos tratados</h2>
          <p>
            Datos identificativos (nombre, email), datos fiscales de la empresa (NIF, razón social,
            domicilio), datos del proyecto (descripción, sector, CNAE, facturación), datos de pago
            (procesados por Stripe — no almacenamos la tarjeta) y datos de uso del Servicio.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-text-h">4. Plazos de conservación</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Datos de cuenta: mientras dure la relación contractual.</li>
            <li>Datos fiscales y de facturación: 6 años (art. 30 Código de Comercio).</li>
            <li>Logs técnicos: 12 meses.</li>
            <li>Tras la baja, los datos se bloquean durante los plazos de prescripción legal.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-text-h">5. Destinatarios y encargados del tratamiento</h2>
          <p>Trabajamos con los siguientes encargados de tratamiento, todos con garantías RGPD:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Supabase Inc.</strong> — almacenamiento de base de datos (UE).</li>
            <li><strong>Stripe Payments Europe Ltd.</strong> — procesamiento de pagos (Irlanda).</li>
            <li><strong>Resend</strong> — email transaccional y alertas (UE/EEUU con SCCs).</li>
            <li><strong>Anthropic / Lovable AI Gateway</strong> — generación asistida de memoria técnica.</li>
            <li><strong>Cloudflare</strong> — hosting y CDN.</li>
          </ul>
          <p className="text-text-muted text-sm">
            Existen transferencias internacionales a EEUU amparadas por Cláusulas Contractuales Tipo
            (SCCs) aprobadas por la Comisión Europea.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-text-h">6. Tus derechos</h2>
          <p>
            Puedes ejercer en cualquier momento tus derechos de <strong>acceso, rectificación,
            supresión, oposición, limitación, portabilidad</strong> y a no ser objeto de decisiones
            automatizadas escribiendo a <strong>hola@subvencionapp.es</strong> con copia de tu DNI.
          </p>
          <p>
            Tienes derecho a presentar reclamación ante la Agencia Española de Protección de Datos{" "}
            <a href="https://www.aepd.es" className="underline" target="_blank" rel="noreferrer">
              (www.aepd.es)
            </a>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-text-h">7. Decisiones automatizadas</h2>
          <p>
            El algoritmo de coincidencias (match) entre tu organización y convocatorias es orientativo
            y no produce efectos jurídicos automáticos. Toda decisión sobre presentar una solicitud
            corresponde al usuario.
          </p>
        </section>
      </article>
      <MarketingFooter />
    </div>
  );
}
