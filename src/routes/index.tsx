import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  TrendingDown, EuroIcon, BellOff, Database, Wifi, FlaskConical,
  MapPin, Factory, Globe, Check, Star,
} from "lucide-react";
import { MarketingNav } from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/MarketingFooter";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-page">
      <MarketingNav />
      <Hero />
      <StatsBar />
      <Problem />
      <HowItWorks />
      <Programmes />
      <ForGestorias />
      <WhoFor />
      <Testimonials />
      <PricingPreview />
      <MarketingFooter />
    </div>
  );
}

/* ========= HERO ========= */
function Hero() {
  return (
    <section className="relative bg-ink overflow-hidden" style={{ minHeight: "94vh" }}>
      {/* radial backgrounds */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          background:
            "radial-gradient(ellipse 800px 600px at 0% 0%, #2A3F6B 0%, transparent 60%), radial-gradient(ellipse 700px 500px at 100% 100%, #9B7A2E 0%, transparent 60%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12 pt-20 lg:pt-28 pb-24 grid lg:grid-cols-2 gap-12 items-center">
        {/* LEFT */}
        <div className="max-w-xl z-10 relative">
          <p className="text-[11px] font-medium text-gold tracking-[0.12em] uppercase">
            Kit Digital · CDTI · BDNS · GVA · IVACE · PRTR
          </p>
          <h1 className="mt-4 text-white font-bold leading-[1.06]"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.5rem, 5.5vw, 4rem)" }}>
            Tu empresa merece<br />
            <span className="italic font-normal">las ayudas que</span><br />
            no sabes que existen
          </h1>
          <p className="mt-6 text-white/60 max-w-[460px] leading-[1.7]" style={{ fontWeight: 300, fontSize: "19px" }}>
            Analizamos más de 200 convocatorias activas y redactamos tu memoria
            técnica en el formato exacto que pide cada organismo. Sin consultores.
            Sin errores. Sin sorpresas.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/registro"
                className="inline-flex items-center bg-gold text-obsidian font-semibold px-8 py-4 rounded-xl shadow-gold"
                style={{ fontSize: "16px" }}
              >
                Empezar — 30 días gratis →
              </Link>
            </motion.div>
            <a
              href="#como-funciona"
              className="inline-flex items-center justify-center text-white border border-white/20 hover:bg-white/[0.06] px-8 py-4 rounded-xl font-medium transition-colors"
              style={{ fontSize: "16px" }}
            >
              Ver cómo funciona ↓
            </a>
          </div>

          <div className="mt-8 flex flex-wrap gap-5 text-[13px] text-white/40">
            <span>🔒 Sin tarjeta de crédito</span>
            <span>✓ Datos oficiales BDNS</span>
            <span>✓ Cumplimiento RGPD</span>
          </div>
        </div>

        {/* RIGHT — floating cards */}
        <div className="hidden lg:block relative h-[460px]">
          <FloatingCard
            className="animate-float"
            style={{ top: 60, left: 0, zIndex: 30 }}
            badges={[
              { label: "KitDigital", color: "#B45309" },
              { label: "94% relevante", color: "#15803D" },
            ]}
            title="Kit Digital — Segmento II"
            org="Red.es / Min. Transformación Digital"
            stats="Hasta €6.000  ·  Cierra en 12 días  ·  Nacional"
          />
          <FloatingCard
            className="animate-float-d1"
            style={{ top: 180, left: 70, zIndex: 20 }}
            badges={[
              { label: "CDTI", color: "#6B21A8" },
              { label: "87% relevante", color: "#15803D" },
            ]}
            title="CDTI — I+D Empresarial"
            org="Centro para el Desarrollo Tecnológico"
            stats="Hasta €250.000  ·  Cierra el 31/10"
          />
          <FloatingCard
            className="animate-float-d2"
            style={{ top: 300, left: 130, zIndex: 10 }}
            badges={[
              { label: "IVACE", color: "#7C2D12" },
              { label: "79% relevante", color: "#92400E" },
            ]}
            title="IVACE Digital"
            org="Generalitat Valenciana"
            stats="Hasta €50.000  ·  C. Valenciana"
          />
        </div>
      </div>
    </section>
  );
}

function FloatingCard({
  className, style, badges, title, org, stats,
}: {
  className: string;
  style: React.CSSProperties;
  badges: { label: string; color: string }[];
  title: string;
  org: string;
  stats: string;
}) {
  return (
    <div
      className={`absolute w-[340px] p-5 rounded-2xl border border-white/10 shadow-2xl ${className}`}
      style={{ ...style, background: "#1C2D4F" }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl bg-gold" />
      <div className="flex gap-2 mb-3">
        {badges.map((b) => (
          <span
            key={b.label}
            className="text-[10px] font-medium px-2 py-1 rounded text-white tracking-wider uppercase"
            style={{ background: b.color }}
          >
            {b.label}
          </span>
        ))}
      </div>
      <h3 className="text-white text-[17px] font-bold leading-tight" style={{ fontFamily: "var(--font-display)" }}>
        {title}
      </h3>
      <p className="text-white/50 text-[13px] mt-1">{org}</p>
      <p className="text-white/70 text-[13px] mt-2">{stats}</p>
    </div>
  );
}

/* ========= STATS ========= */
function StatsBar() {
  const stats = [
    ["200+", "Convocatorias activas"],
    ["40%", "Solicitudes denegadas por errores evitables"],
    ["30 días", "Prueba completa sin tarjeta"],
    ["€2.000+", "Ahorro medio vs. consultor"],
  ];
  return (
    <section className="py-14 border-y border-white/[0.06]" style={{ background: "#1C2D4F" }}>
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats.map(([n, l]) => (
          <div key={l}>
            <div className="text-gold font-bold" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3.25rem)" }}>{n}</div>
            <div className="text-white/55 text-sm mt-2">{l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ========= PROBLEM ========= */
function Problem() {
  const cards = [
    { icon: TrendingDown, color: "var(--err)", stat: "40%", title: "denegaciones evitables", body: "Errores en la documentación, omisiones en la memoria técnica o requisitos formales incumplidos que un revisor profesional detectaría en diez minutos." },
    { icon: EuroIcon, color: "var(--gold)", stat: "€2.000–5.000", title: "cobra un consultor", body: "Por redactar una memoria que la IA genera en minutos, usando la misma terminología técnica y los mismos criterios que los evaluadores." },
    { icon: BellOff, color: "var(--info)", stat: "73%", title: "de convocatorias perdidas", body: "Las empresas no conocen las ayudas a las que son elegibles hasta que el plazo ya ha cerrado. Nuestras alertas resuelven eso." },
  ];
  return (
    <section className="bg-page py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-center text-text-h font-bold leading-tight" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}>
          Solicitar subvenciones en España es innecesariamente complicado
        </h2>
        <p className="text-center text-text-muted text-lg mt-3">
          SubvencionApp existe para cambiar eso.
        </p>
        <div className="grid md:grid-cols-3 gap-6 mt-14">
          {cards.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-card border border-border rounded-xl p-7 shadow-notary-sm hover:shadow-notary-md transition-shadow"
            >
              <c.icon size={28} style={{ color: c.color }} />
              <div className="font-bold mt-4" style={{ fontFamily: "var(--font-display)", fontSize: "2.75rem", color: c.color }}>
                {c.stat}
              </div>
              <div className="font-semibold text-text-h text-lg mt-1">{c.title}</div>
              <p className="text-text-muted text-[15px] mt-3 leading-relaxed">{c.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ========= HOW IT WORKS ========= */
function HowItWorks() {
  const steps = [
    ["Crea tu perfil", "NIF, CNAE, sector, comunidad. Una vez."],
    ["Descubre tus ayudas", "IA analiza 200+ convocatorias."],
    ["Redacta con IA", "Memoria técnica sección por sección."],
    ["Presenta sin errores", "Revisor de cumplimiento incluido."],
  ];
  return (
    <section id="como-funciona" className="bg-card py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-center font-bold" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}>
          Cuatro pasos, sin complicaciones
        </h2>
        <div className="mt-16 grid md:grid-cols-4 gap-6 relative">
          <div className="hidden md:block absolute top-7 left-[12.5%] right-[12.5%] h-[1px] bg-border" />
          {steps.map(([title, body], i) => (
            <div key={title} className="text-center relative">
              <div
                className="w-14 h-14 rounded-full bg-gold text-ink flex items-center justify-center mx-auto font-bold text-lg relative z-10"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {i + 1}
              </div>
              <h3 className="mt-4 text-text-h font-semibold" style={{ fontFamily: "var(--font-display)" }}>{title}</h3>
              <p className="text-text-muted text-sm mt-2">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ========= PROGRAMMES ========= */
function Programmes() {
  const items = [
    { Icon: Database, name: "BDNS", desc: "Todas las subvenciones públicas de España", bg: "#1C2D4F" },
    { Icon: Wifi, name: "Kit Digital", desc: "Red.es · Next Generation EU", bg: "#B45309" },
    { Icon: FlaskConical, name: "CDTI", desc: "Innovación e I+D empresarial", bg: "#6B21A8" },
    { Icon: MapPin, name: "GVA", desc: "Ayudas Comunitat Valenciana", bg: "#991B1B" },
    { Icon: Factory, name: "IVACE", desc: "Industria valenciana", bg: "#7C2D12" },
    { Icon: Globe, name: "PRTR", desc: "Fondos europeos de recuperación", bg: "#1D4ED8" },
  ];
  return (
    <section id="programas" className="bg-page py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-center font-bold" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}>
          Fuentes de datos oficiales
        </h2>
        <p className="text-center text-text-muted mt-2">
          Actualizadas diariamente · Datos del BDNS público
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-10">
          {items.map(({ Icon, name, desc, bg }) => (
            <div key={name} className="rounded-xl p-6 text-white shadow-notary-md" style={{ background: bg }}>
              <Icon size={28} className="text-white/85" />
              <div className="font-semibold mt-3 text-lg">{name}</div>
              <div className="text-white/70 text-[13px] mt-1">{desc}</div>
            </div>
          ))}
        </div>
        <p className="text-center text-text-muted text-xs mt-8 max-w-2xl mx-auto">
          SubvencionApp.es no pertenece a ninguno de estos organismos. La información tiene fines orientativos.
          Verifica siempre en las fuentes oficiales.
        </p>
      </div>
    </section>
  );
}

/* ========= GESTORÍAS ========= */
function ForGestorias() {
  const features = [
    "Panel multi-cliente (hasta 15 empresas)",
    "Borradores y alertas por cliente",
    "Emails white-label con tu dominio",
    "API access para notificaciones",
    "Facturación centralizada",
    "Soporte dedicado y onboarding",
  ];
  return (
    <section id="gestorias" className="bg-ink py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-white font-bold" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}>
          Para gestorías y asesores fiscales
        </h2>
        <p className="text-white/65 mt-4 max-w-3xl text-[17px] leading-relaxed">
          El plan Enterprise te permite gestionar las subvenciones de todos tus clientes desde un único panel.
          Hasta 15 empresas, borradores separados por cliente, alertas personalizadas y facturación centralizada.
        </p>
        <div className="grid md:grid-cols-3 gap-4 mt-10">
          {features.map((f) => (
            <div key={f} className="flex items-start gap-3 text-white/85">
              <Check size={18} className="text-gold mt-1 shrink-0" />
              <span>{f}</span>
            </div>
          ))}
        </div>
        <Link
          to="/precios"
          className="inline-flex items-center mt-10 text-white border border-white/20 hover:bg-white/10 px-6 py-3 rounded-md font-medium transition-colors"
        >
          Ver plan Enterprise →
        </Link>
      </div>
    </section>
  );
}

/* ========= WHO FOR ========= */
function WhoFor() {
  const cards = [
    ["Autónomo", "Encuentra ayudas al autoempleo, digitalización y formación sin necesidad de un consultor."],
    ["Microempresa", "Accede a Kit Digital, GVA y BDNS sin equipo de gestión ni conocimientos técnicos."],
    ["Gestoría", "Gestiona las subvenciones de todos tus clientes desde un solo panel con el plan Enterprise."],
  ];
  return (
    <section className="bg-card py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-center font-bold mb-12" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}>
          Diseñado para tu caso
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {cards.map(([title, body]) => (
            <div key={title} className="border border-border rounded-xl p-7 hover:shadow-notary-md hover:-translate-y-0.5 transition-all">
              <h3 className="font-bold text-xl" style={{ fontFamily: "var(--font-display)" }}>{title}</h3>
              <p className="text-text-muted mt-3 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ========= TESTIMONIALS ========= */
function Testimonials() {
  const items = [
    { initials: "MG", name: "María González", role: "Diseñadora gráfica", city: "Valencia",
      quote: "Encontré el Kit Digital en 5 minutos y generé la memoria en una tarde. El consultor pedía €1.800." },
    { initials: "CM", name: "Carlos Martínez", role: "CEO Talleres Martínez S.L.", city: "Alicante",
      quote: "El IVACE estaba pendiente desde hace dos años. Lo presentamos en una semana." },
    { initials: "AP", name: "Ana Pérez", role: "Asesora fiscal · Gestoría APA", city: "Madrid",
      quote: "Con Enterprise gestiono 8 clientes desde una cuenta. Imprescindible para nuestra gestoría." },
  ];
  return (
    <section className="bg-page py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-center font-bold mb-12" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}>
          Lo dicen quienes ya las consiguieron
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((t) => (
            <div key={t.name} className="bg-card border border-border rounded-xl p-7 shadow-notary-sm">
              <div className="flex gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill="var(--gold)" stroke="var(--gold)" />
                ))}
              </div>
              <p className="text-text-body italic leading-relaxed">"{t.quote}"</p>
              <div className="flex items-center gap-3 mt-5 pt-5 border-t border-border">
                <div className="w-10 h-10 rounded-full bg-dusk text-white flex items-center justify-center font-semibold text-sm">
                  {t.initials}
                </div>
                <div>
                  <div className="font-semibold text-sm text-text-h">{t.name}</div>
                  <div className="text-xs text-text-muted">{t.role} · {t.city}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ========= PRICING PREVIEW ========= */
function PricingPreview() {
  const plans = [
    { name: "Starter", price: "€29", period: "/mes",
      features: ["5 búsquedas/mes", "3 alertas activas", "Sin redacción IA", "Soporte por email"] },
    { name: "Pro", price: "€79", period: "/mes", featured: true,
      features: ["Búsquedas ilimitadas", "15 alertas activas", "Redacción IA completa", "Exportación PDF/Excel", "Revisor de cumplimiento"] },
    { name: "Enterprise", price: "€199", period: "/mes",
      features: ["Todo Pro +", "Hasta 15 clientes", "Multi-cliente y multi-org", "Soporte dedicado"] },
  ];
  return (
    <section id="precios" className="bg-card py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-center font-bold" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}>
          Planes claros, sin sorpresas
        </h2>
        <p className="text-center text-text-muted mt-3">
          30 días gratis en cualquier plan. Sin tarjeta. Cancela cuando quieras.
        </p>
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`rounded-2xl p-8 border-2 transition-all ${p.featured ? "border-gold shadow-gold scale-[1.02]" : "border-border bg-card"}`}
            >
              {p.featured && (
                <div className="text-[11px] font-medium text-gold tracking-wider uppercase mb-2">
                  Más popular
                </div>
              )}
              <h3 className="font-bold text-2xl" style={{ fontFamily: "var(--font-display)" }}>{p.name}</h3>
              <div className="mt-3">
                <span className="font-bold text-4xl" style={{ fontFamily: "var(--font-display)" }}>{p.price}</span>
                <span className="text-text-muted">{p.period}</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check size={16} className="text-gold mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/registro"
                className={`mt-7 inline-flex items-center justify-center w-full py-3 rounded-md font-semibold transition-colors ${
                  p.featured
                    ? "bg-gold text-obsidian hover:bg-gold-muted hover:text-white"
                    : "bg-dusk text-white hover:bg-obsidian"
                }`}
              >
                Empezar 30 días gratis
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
