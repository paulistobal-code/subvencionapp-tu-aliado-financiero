import { createFileRoute, Link, useNavigate, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Home, Heart, FileText, Bell, Building2, Settings, LogOut, Menu, X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { usePlan } from "@/hooks/usePlan";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const plan = usePlan();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bannerHidden, setBannerHidden] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      const path = window.location.pathname;
      navigate({ to: "/login", search: { from: path } });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("trial-banner-hidden") === "1") {
      setBannerHidden(true);
    }
  }, []);

  const { data: org } = useQuery({
    queryKey: ["org", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("organisations").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
  });

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page">
        <div className="text-text-muted text-sm">Cargando…</div>
      </div>
    );
  }

  // Trial expired full-page takeover
  if (plan.isTrialExpired) {
    return <TrialExpiredScreen orgName={org?.nombre} />;
  }

  return (
    <div className="min-h-screen bg-page">
      {/* Top bar mobile */}
      <div className="lg:hidden bg-ink h-14 flex items-center justify-between px-4 sticky top-0 z-40">
        <Link to="/dashboard" className="flex items-center gap-2 text-white">
          <Logo size={24} />
          <span style={{ fontFamily: "var(--font-display)" }}>SubvencionApp</span>
        </Link>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Trial banner */}
      <AnimatePresence>
        {plan.isTrialActive && !bannerHidden && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b"
            style={{ background: "var(--gold-light)", borderColor: "var(--gold-border)" }}
          >
            <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 flex-wrap">
              <div className="text-sm font-medium" style={{ color: "var(--gold-muted)" }}>
                🎁 Prueba gratuita — {plan.trialDaysLeft} día{plan.trialDaysLeft !== 1 ? "s" : ""} restante{plan.trialDaysLeft !== 1 ? "s" : ""} de acceso completo a todas las funciones.
              </div>
              <div className="flex items-center gap-2">
                <Link to="/precios" className="text-xs font-semibold px-3 py-1.5 rounded-md bg-gold text-obsidian hover:bg-gold-muted hover:text-white transition-colors">
                  Activar plan →
                </Link>
                <button
                  onClick={() => { sessionStorage.setItem("trial-banner-hidden", "1"); setBannerHidden(true); }}
                  className="text-gold-muted hover:text-obsidian"
                  aria-label="Cerrar"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex">
        <Sidebar
          open={sidebarOpen}
          close={() => setSidebarOpen(false)}
          orgName={org?.nombre || "Tu empresa"}
          completitud={org?.perfil_completitud ?? 0}
          plan={plan}
        />
        <main className="flex-1 lg:ml-[260px] min-h-[calc(100vh-3.5rem)] lg:min-h-screen">
          <PageWrapper>
            <Outlet />
          </PageWrapper>
        </main>
      </div>
    </div>
  );
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  const { location } = useRouterState();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="px-4 sm:px-8 py-6 sm:py-8"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function Sidebar({
  open, close, orgName, completitud, plan,
}: {
  open: boolean; close: () => void; orgName: string; completitud: number;
  plan: ReturnType<typeof usePlan>;
}) {
  const navigate = useNavigate();
  const { location } = useRouterState();
  const links = [
    { to: "/dashboard", icon: Home, label: "Mis convocatorias" },
    { to: "/guardadas", icon: Heart, label: "Guardadas" },
    { to: "/solicitudes", icon: FileText, label: "Mis solicitudes" },
    { to: "/alertas", icon: Bell, label: "Alertas" },
    ...(plan.isEnterprise ? [{ to: "/clientes", icon: Building2, label: "Mis clientes" }] : []),
    { to: "/cuenta", icon: Settings, label: "Mi cuenta" },
  ];

  const initials = orgName.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  async function logout() {
    await supabase.auth.signOut();
    toast.success("Sesión cerrada");
    navigate({ to: "/" });
  }

  const planBadge = (() => {
    switch (plan.plan) {
      case "trial": return { text: `Prueba — ${plan.trialDaysLeft}d`, cls: "border border-gold text-gold-muted" };
      case "starter": return { text: "Starter", cls: "border border-border text-text-muted bg-recessed" };
      case "pro": return { text: "★ Pro", cls: "bg-gold-light text-gold-muted" };
      case "enterprise": return { text: "Enterprise", cls: "bg-obsidian text-white" };
      default: return { text: "Prueba finalizada", cls: "bg-err-bg text-err" };
    }
  })();

  return (
    <>
      {/* Mobile overlay */}
      {open && <div onClick={close} className="lg:hidden fixed inset-0 bg-ink/60 z-40" />}
      <aside
        className={`fixed top-0 lg:top-0 left-0 bottom-0 w-[260px] bg-card border-r border-border z-50 flex flex-col transition-transform ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Top: logo (desktop) */}
        <div className="hidden lg:flex h-16 items-center px-5 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <Logo size={28} />
            <span className="text-text-h text-base font-semibold" style={{ fontFamily: "var(--font-display)" }}>
              SubvencionApp
            </span>
          </Link>
        </div>

        {/* Profile */}
        <div className="p-5 border-b border-border">
          <div className="w-10 h-10 rounded-full bg-dusk text-white flex items-center justify-center font-semibold text-sm">
            {initials}
          </div>
          <div className="font-semibold text-sm mt-2 text-text-h truncate">{orgName}</div>
          <span className={`mt-2 inline-block text-[10px] font-semibold px-2 py-1 rounded uppercase tracking-wider ${planBadge.cls}`}>
            {planBadge.text}
          </span>
        </div>

        {/* Completitud */}
        <div className="px-5 py-3 border-b border-border">
          <div className="text-[12px] text-text-muted font-medium">Perfil {completitud}% completo</div>
          <div className="h-1.5 bg-recessed rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-gold transition-all duration-500" style={{ width: `${completitud}%` }} />
          </div>
          {completitud < 80 && (
            <Link to="/cuenta" className="text-[11px] text-gold-muted hover:underline mt-2 block">
              Completar perfil para mejores resultados →
            </Link>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto">
          {links.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={close}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "border-l-[3px] border-gold pl-[9px] text-text-h"
                    : "text-text-body hover:bg-recessed"
                }`}
                style={active ? { background: "linear-gradient(90deg, rgba(201,168,76,0.09) 0%, transparent 100%)" } : undefined}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-border space-y-2">
          <div className="text-[11px] text-text-muted">
            {plan.matchLimit === Infinity ? "Búsquedas ilimitadas" : `Búsquedas: ${plan.matchLimit}/mes`}
          </div>
          <button onClick={logout} className="flex items-center gap-2 text-sm text-text-muted hover:text-err transition-colors">
            <LogOut size={14} /> Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}

function TrialExpiredScreen({ orgName }: { orgName?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-page px-6">
      <div className="max-w-2xl text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold-light text-gold-muted mb-6">
          ⏳
        </div>
        <h1 className="font-bold" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}>
          Tu prueba gratuita ha finalizado
        </h1>
        <p className="text-text-muted mt-4 text-lg">
          Esperamos que hayas encontrado subvenciones útiles para {orgName || "tu empresa"}. Elige un plan para seguir accediendo a todas las convocatorias y al asistente de redacción.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/precios" className="bg-gold text-obsidian font-semibold px-8 py-3.5 rounded-xl shadow-gold hover:bg-gold-muted hover:text-white transition-colors">
            Ver planes →
          </Link>
          <Link to="/cuenta" className="border border-border-mid text-text-body px-8 py-3.5 rounded-xl hover:bg-recessed transition-colors">
            Mi cuenta
          </Link>
        </div>
      </div>
    </div>
  );
}
