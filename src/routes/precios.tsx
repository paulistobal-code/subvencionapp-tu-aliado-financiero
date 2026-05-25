// src/routes/precios.tsx
// Full pricing page — 4 tiers + per-application add-on + FAQ accordion

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, X, Lock, ChevronDown, ChevronUp } from "lucide-react";
import { MarketingNav } from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/MarketingFooter";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/precios")({ component: Pricing });

/* ─── Data ─────────────────────────────────────────────────────────────── */

const PLANS = [
  {
    id: "trial",
    name: "Prueba gratuita",
    tagline: "Empieza sin tarjeta",
    monthly: 0,
    annual: 0,
    cta: "Empezar gratis →",
    ctaTo: "/registro",
    featured: false,
    dark: false,
    features: [
      { text: "Acceso completo a TODAS las funciones", ok: true },
      { text: "30 días sin tarjeta de crédito", ok: true },
      { text: "Sin compromiso ni permanencia", ok: true },
      { text: "Cancela o suscríbete cuando quieras", ok: true },
    ],
  },
  {
    id: "starter",
    name: "Starter",
    tagline: "Para empezar a buscar",
    monthly: 29,
    annual: 290,
    annualMonthly: 24,
    cta: "Elegir Starter",
    ctaTo: "/registro",
    featured: false,
    dark: false,
    features: [
      { text: "Hasta 5 convocatorias al mes", ok: true },
      { text: "Matching con IA + resúmenes", ok: true },
      { text: "Alertas semanales (3 palabras clave)", ok: true },
      { text: "Guardar convocatorias + pipeline Kanban", ok: true },
      { text: "Memoria técnica con IA", ok: false },
      { text: "Revisor de cumplimiento IA", ok: false },
      { text: "Exportar PDF y Excel", ok: false },
      { text: "Chat asistente IA", ok: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "La suite completa",
    monthly: 79,
    annual: 790,
    annualMonthly: 66,
    cta: "Elegir Pro →",
    ctaTo: "/registro",
    featured: true,
    dark: false,
    features: [
      { text: "Convocatorias ilimitadas", ok: true },
      { text: "Memoria técnica completa con IA", ok: true },
      { text: "Revisor de cumplimiento IA", ok: true },
      { text: "Chat con asistente IA", ok: true },
      { text: "Exportar PDF + Excel ilimitado", ok: true },
      { text: "Alertas diarias (hasta 15 palabras clave)", ok: true },
      { text: "Checklist de elegibilidad avanzado", ok: true },
      { text: "Soporte prioritario por email", ok: true },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Para grandes PYMEs",
    monthly: 199,
    annual: 1990,
    annualMonthly: 166,
    cta: "Contratar Enterprise →",
    ctaTo: "/registro",
    featured: false,
    dark: true,
    features: [
      { text: "Todo lo de Pro", ok: true },
      { text: "Hasta 10 departamentos con perfiles independientes", ok: true },
      { text: "Panel centralizado multi-departamento", ok: true },
      { text: "Alertas configuradas por departamento", ok: true },
      { text: "API access (webhooks para sistemas internos)", ok: true },
      { text: "Soporte dedicado y onboarding del equipo", ok: true },
      { text: "SLA de nivel de servicio garantizado", ok: true },
    ],
  },
] as const;

const FAQS = [
  {
    q: "¿Puedo cancelar en cualquier momento?",
    a: "Sí. Sin permanencia ni penalización. Cancela desde Mi cuenta > Facturación con un clic. Si cancelas el plan mensual, conservas el acceso hasta el final del período ya pagado.",
  },
  {
    q: "¿Emitís factura con IVA?",
    a: "Sí. Todas las facturas incluyen el IVA al 21% aplicable en España. Para facturas intracomunitarias o con NIF/CIF específico, escríbenos a facturacion@subvencionapp.es.",
  },
  {
    q: "¿Es legal usar IA para preparar memorias técnicas?",
    a: "Sí. La inteligencia artificial es una herramienta de redacción y organización. La responsabilidad sobre la veracidad de los datos y la decisión de presentar la solicitud es siempre del solicitante. SubvencionApp te ayuda a redactar correctamente, pero eres tú quien firma y presenta.",
  },
  {
    q: "¿Garantizáis que me conceden la subvención?",
    a: "No. SubvencionApp ayuda a encontrar convocatorias y preparar la documentación, pero la resolución definitiva depende exclusivamente del organismo convocante. No garantizamos ni asumimos responsabilidad alguna sobre el resultado de ninguna solicitud.",
  },
  {
    q: "¿Qué diferencia hay entre Pro y Enterprise?",
    a: "Enterprise añade hasta 10 perfiles de departamento independientes gestionados desde una única cuenta. Está diseñado para grandes PYMEs cuyo equipo administrativo gestiona simultáneamente subvenciones para distintas áreas de negocio, divisiones o proyectos.",
  },
  {
    q: "¿Cómo funciona la facturación anual?",
    a: "El plan anual se cobra en un único pago al inicio. Equivale a 10 meses de precio mensual — ahorras 2 meses respecto a pagar mes a mes. No hay reembolso prorrateado si cancelas antes del año, pero conservas el acceso hasta la fecha de renovación.",
  },
  {
    q: "¿Qué pasa con mis datos si cancelo?",
    a: "Tratamos tus datos conforme al RGPD (UE) 2016/679. Tras cancelar, anonimizamos tu cuenta en 30 días salvo obligación legal de conservación (facturas: 5 años). Puedes ejercer el derecho al olvido (art. 17 RGPD) en cualquier momento desde Mi cuenta > Seguridad.",
  },
] as const;

/* ─── Page ──────────────────────────────────────────────────────────────── */

function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-page">
      <MarketingNav />

      <section className="max-w-6xl mx-auto px-6 pt-20 pb-8">
        {/* Header */}
        <div className="text-center">
          <h1
            className="font-bold text-text-h"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 5vw, 3rem)",
            }}
          >
            Elige tu plan
          </h1>
          <p className="text-text-muted mt-3 text-lg">
            Sin permanencia · Cancela cuando quieras · IVA no incluido en los
            precios mostrados
          </p>
        </div>

        {/* Annual toggle */}
        <div className="flex justify-center mt-8">
          <div className="inline-flex bg-recessed p-1 rounded-lg gap-1">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
                !annual
                  ? "bg-card shadow-notary-sm text-text-h"
                  : "text-text-muted hover:text-text-body"
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${
                annual
                  ? "bg-card shadow-notary-sm text-text-h"
                  : "text-text-muted hover:text-text-body"
              }`}
            >
              Anual
              <span className="text-[10px] bg-gold-light text-gold-muted px-1.5 py-0.5 rounded font-semibold">
                2 meses gratis
              </span>
            </button>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
          {PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} annual={annual} />
          ))}
        </div>

        {/* Per-application add-on */}
        <PerApplicationCard />

        {/* FAQ */}
        <FaqSection />
      </section>

      <MarketingFooter />
    </div>
  );
}

/* ─── Plan card ─────────────────────────────────────────────────────────── */

function PlanCard({
  plan,
  annual,
}: {
  plan: (typeof PLANS)[number];
  annual: boolean;
}) {
  const price =
    plan.monthly === 0
      ? "€0"
      : annual && "annualMonthly" in plan
      ? `€${(plan as any).annualMonthly}`
      : `€${plan.monthly}`;

  const priceSub =
    plan.monthly === 0
      ? "30 días"
      : annual && "annual" in plan && plan.annual
      ? `€${(plan as any).annual}/año facturado`
      : "/mes";

  return (
    <motion.div
      layout
      className={`relative flex flex-col rounded-2xl border-2 p-7 ${
        plan.dark
          ? "bg-ink border-dusk text-text-inv"
          : plan.featured
          ? "bg-card border-gold shadow-gold"
          : "bg-card border-border"
      }`}
    >
      {plan.featured && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gold text-obsidian text-[10px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
          Más popular
        </div>
      )}

      <div>
        <div
          className={`text-[11px] uppercase tracking-wider font-semibold ${
            plan.dark ? "text-gold" : "text-text-muted"
          }`}
        >
          {plan.tagline}
        </div>
        <h3
          className="font-bold text-2xl mt-1"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {plan.name}
        </h3>
        <div className="mt-4">
          <span
            className="font-bold text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {price}
          </span>
          {plan.monthly !== 0 && (
            <span
              className={`text-sm ml-1 ${
                plan.dark ? "text-white/50" : "text-text-muted"
              }`}
            >
              /mes
            </span>
          )}
          <p
            className={`text-xs mt-1 ${
              plan.dark ? "text-white/50" : "text-text-muted"
            }`}
          >
            {priceSub}
          </p>
        </div>
      </div>

      <ul className="mt-6 space-y-2.5 flex-1">
        {plan.features.map((f) => (
          <li key={f.text} className="flex items-start gap-2 text-[13px]">
            {f.ok ? (
              <Check
                size={14}
                className="text-gold mt-0.5 shrink-0"
                aria-hidden
              />
            ) : (
              <X
                size={14}
                className={`mt-0.5 shrink-0 ${
                  plan.dark ? "text-white/30" : "text-text-muted/50"
                }`}
                aria-hidden
              />
            )}
            <span
              className={
                !f.ok
                  ? plan.dark
                    ? "text-white/40"
                    : "text-text-muted/60"
                  : plan.dark
                  ? "text-white/90"
                  : "text-text-body"
              }
            >
              {f.text}
            </span>
          </li>
        ))}
      </ul>

      <Link
        to={plan.ctaTo}
        className={`mt-7 inline-flex items-center justify-center w-full py-3 rounded-md font-semibold text-sm transition-colors ${
          plan.featured
            ? "bg-gold text-obsidian hover:bg-gold-muted hover:text-white"
            : plan.dark
            ? "border border-white/25 text-white hover:bg-white/08"
            : "bg-dusk text-white hover:bg-obsidian"
        }`}
      >
        {plan.cta}
      </Link>
    </motion.div>
  );
}

/* ─── Per-application add-on ────────────────────────────────────────────── */

function PerApplicationCard() {
  return (
    <div className="mt-8 bg-card border border-border rounded-2xl p-7 max-w-2xl mx-auto text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold-light text-gold-muted mb-4">
        <Lock size={22} />
      </div>
      <h3
        className="font-bold text-2xl"
        style={{ fontFamily: "var(--font-display)" }}
      >
        ¿Solo una convocatoria?
      </h3>
      <p className="text-text-muted mt-2 text-sm">
        Acceso completo al plan Pro para una única convocatoria. Sin suscripción
        mensual.
      </p>
      <div
        className="mt-4 font-bold text-4xl"
        style={{ fontFamily: "var(--font-display)" }}
      >
        €149{" "}
        <span className="text-text-muted font-normal text-base">
          pago único
        </span>
      </div>
      <p className="text-text-muted text-xs mt-1">
        €180,29 con IVA · Acceso de por vida al borrador
      </p>
      <div className="grid grid-cols-2 gap-3 mt-5 text-[13px] text-left max-w-xs mx-auto">
        {[
          "Memoria técnica completa con IA",
          "Revisor de cumplimiento",
          "Exportar PDF y Excel",
          "Sin suscripción mensual",
        ].map((f) => (
          <div key={f} className="flex items-center gap-1.5">
            <Check size={13} className="text-gold shrink-0" />
            <span className="text-text-body">{f}</span>
          </div>
        ))}
      </div>
      <Link
        to="/registro"
        className="mt-6 inline-block border-2 border-border-mid text-text-h font-semibold px-8 py-3 rounded-md hover:bg-recessed transition-colors"
      >
        Comprar acceso por solicitud →
      </Link>
    </div>
  );
}

/* ─── FAQ accordion ─────────────────────────────────────────────────────── */

function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="mt-20 max-w-2xl mx-auto pb-16">
      <h2
        className="text-center font-bold text-2xl text-text-h mb-8"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Preguntas frecuentes
      </h2>
      <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
        {FAQS.map((faq, i) => (
          <div key={i} className="bg-card">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-6 py-4 text-left text-sm font-medium text-text-h hover:bg-recessed transition-colors gap-4"
              aria-expanded={open === i}
            >
              <span>{faq.q}</span>
              {open === i ? (
                <ChevronUp
                  size={16}
                  className="text-text-muted shrink-0"
                  aria-hidden
                />
              ) : (
                <ChevronDown
                  size={16}
                  className="text-text-muted shrink-0"
                  aria-hidden
                />
              )}
            </button>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <p className="px-6 pb-5 text-sm text-text-muted leading-relaxed">
                    {faq.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-text-muted mt-8">
        ¿Más preguntas? Escríbenos a{" "}
        <a
          href="mailto:hola@subvencionapp.es"
          className="text-gold-muted hover:underline"
        >
          hola@subvencionapp.es
        </a>
      </p>
    </div>
  );
}
