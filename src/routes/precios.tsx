import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { MarketingNav } from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/MarketingFooter";
import { useState } from "react";

export const Route = createFileRoute("/precios")({ component: Pricing });

function Pricing() {
  const [annual, setAnnual] = useState(false);
  const plans = [
    { name: "Starter", monthly: 29, annual: 290, features: ["5 búsquedas/mes", "3 alertas semanales", "Sin redacción IA", "Soporte por email"] },
    { name: "Pro", monthly: 79, annual: 790, featured: true, features: ["Búsquedas ilimitadas", "15 alertas (diarias o semanales)", "Memoria técnica con IA", "Revisor de cumplimiento", "Exportación PDF y Excel"] },
    { name: "Enterprise", monthly: 199, annual: 1990, features: ["Todo Pro +", "Hasta 15 clientes", "Multi-org, multi-cliente", "Soporte dedicado y onboarding"] },
  ];
  return (
    <div className="min-h-screen bg-page">
      <MarketingNav />
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h1 className="text-center font-bold" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 3rem)" }}>
          Planes claros, sin sorpresas
        </h1>
        <p className="text-center text-text-muted mt-3">30 días gratis en cualquier plan. Sin tarjeta. Cancela cuando quieras.</p>

        <div className="flex justify-center mt-8">
          <div className="inline-flex bg-recessed p-1 rounded-lg">
            <button onClick={() => setAnnual(false)} className={`px-4 py-2 rounded-md text-sm font-medium ${!annual ? "bg-card shadow-notary-sm" : "text-text-muted"}`}>Mensual</button>
            <button onClick={() => setAnnual(true)} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${annual ? "bg-card shadow-notary-sm" : "text-text-muted"}`}>
              Anual <span className="text-[10px] bg-gold-light text-gold-muted px-1.5 py-0.5 rounded">2 meses gratis</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {plans.map((p) => (
            <div key={p.name} className={`rounded-2xl p-8 border-2 ${p.featured ? "border-gold shadow-gold scale-[1.02]" : "border-border bg-card"}`}>
              {p.featured && <div className="text-[11px] font-medium text-gold uppercase tracking-wider mb-2">Más popular</div>}
              <h3 className="font-bold text-2xl" style={{ fontFamily: "var(--font-display)" }}>{p.name}</h3>
              <div className="mt-3">
                <span className="font-bold text-4xl" style={{ fontFamily: "var(--font-display)" }}>€{annual ? Math.round(p.annual / 12) : p.monthly}</span>
                <span className="text-text-muted">/mes</span>
                {annual && <p className="text-xs text-text-muted mt-1">Facturado anualmente · €{p.annual}/año</p>}
              </div>
              <ul className="mt-6 space-y-3 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check size={16} className="text-gold mt-0.5 shrink-0" /><span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/registro" className={`mt-7 inline-flex items-center justify-center w-full py-3 rounded-md font-semibold ${p.featured ? "bg-gold text-obsidian hover:bg-gold-muted hover:text-white" : "bg-dusk text-white hover:bg-obsidian"}`}>
                Empezar 30 días gratis
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-card border border-border rounded-xl p-6 text-center max-w-2xl mx-auto">
          <h3 className="font-bold text-xl" style={{ fontFamily: "var(--font-display)" }}>¿Solo una convocatoria?</h3>
          <p className="text-text-muted mt-2 text-sm">Acceso completo Pro para una sola convocatoria. Pago único.</p>
          <div className="mt-3 font-bold text-3xl" style={{ fontFamily: "var(--font-display)" }}>€149</div>
          <Link to="/registro" className="mt-4 inline-block border border-border-mid px-6 py-2.5 rounded-md hover:bg-recessed">Comprar acceso por solicitud</Link>
        </div>
      </section>
      <MarketingFooter />
    </div>
  );
}
