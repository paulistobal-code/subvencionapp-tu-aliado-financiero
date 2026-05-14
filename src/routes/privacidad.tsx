import { createFileRoute } from "@tanstack/react-router";
import { MarketingNav } from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/MarketingFooter";

export const Route = createFileRoute("/privacidad")({ component: Page });

function Page() {
  return (
    <div className="min-h-screen bg-page">
      <MarketingNav />
      <article className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="font-bold text-4xl" style={{ fontFamily: "var(--font-display)" }}>Política de privacidad</h1>
        <p className="text-text-muted">Conforme al RGPD (UE) 2016/679 y LOPDGDD 3/2018.</p>
        <h2 className="mt-8 text-xl font-bold">Responsable</h2>
        <p>SubvencionApp S.L. — hola@subvencionapp.es</p>
        <h2 className="mt-6 text-xl font-bold">Finalidad</h2>
        <p>Prestación del servicio de búsqueda y gestión de subvenciones, alertas por email (consentimiento expreso), y gestión de la cuenta de usuario.</p>
        <h2 className="mt-6 text-xl font-bold">Derechos</h2>
        <p>Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, portabilidad y limitación enviando un email a hola@subvencionapp.es.</p>
        <h2 className="mt-6 text-xl font-bold">Encargados</h2>
        <p>Supabase (almacenamiento), Stripe (pagos), Resend (email transaccional). Todos cumplen con el RGPD.</p>
      </article>
      <MarketingFooter />
    </div>
  );
}
