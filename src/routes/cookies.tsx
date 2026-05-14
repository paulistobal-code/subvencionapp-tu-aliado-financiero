import { createFileRoute } from "@tanstack/react-router";
import { MarketingNav } from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/MarketingFooter";

export const Route = createFileRoute("/cookies")({ component: Page });

function Page() {
  return (
    <div className="min-h-screen bg-page">
      <MarketingNav />
      <article className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="font-bold text-4xl" style={{ fontFamily: "var(--font-display)" }}>Política de cookies</h1>
        <p className="mt-4">Usamos cookies técnicas (sesión y preferencias) imprescindibles para el funcionamiento del servicio. Si en el futuro incorporamos cookies de analítica o publicidad, te solicitaremos consentimiento expreso conforme a la guía de la AEPD.</p>
      </article>
      <MarketingFooter />
    </div>
  );
}
