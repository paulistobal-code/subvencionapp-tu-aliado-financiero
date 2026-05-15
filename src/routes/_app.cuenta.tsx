import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Check, AlertTriangle, ExternalLink, Lock, CreditCard, FileText, Shield, Building2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePlan } from "@/hooks/usePlan";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export const Route = createFileRoute("/_app/cuenta")({ component: CuentaPage });

function CuentaPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="font-bold text-text-h" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem, 4vw, 2.25rem)" }}>
        Mi cuenta
      </h1>
      <p className="text-text-muted mt-1">Gestiona tu plan, tu empresa, tu seguridad y tus facturas.</p>

      <Tabs defaultValue="plan" className="mt-8">
        <TabsList className="bg-recessed">
          <TabsTrigger value="plan" className="gap-2"><CreditCard size={14} /> Mi plan</TabsTrigger>
          <TabsTrigger value="empresa" className="gap-2"><Building2 size={14} /> Perfil empresa</TabsTrigger>
          <TabsTrigger value="seguridad" className="gap-2"><Shield size={14} /> Seguridad</TabsTrigger>
          <TabsTrigger value="facturacion" className="gap-2"><FileText size={14} /> Facturación</TabsTrigger>
        </TabsList>

        <TabsContent value="plan" className="mt-6"><MiPlanTab /></TabsContent>
        <TabsContent value="empresa" className="mt-6"><PerfilEmpresaTab /></TabsContent>
        <TabsContent value="seguridad" className="mt-6"><SeguridadTab /></TabsContent>
        <TabsContent value="facturacion" className="mt-6"><FacturacionTab /></TabsContent>
      </Tabs>
    </div>
  );
}

/* ──────────────────────── MI PLAN ──────────────────────── */

function MiPlanTab() {
  const plan = usePlan();
  const [annual, setAnnual] = useState(false);

  if (plan.loading) {
    return <div className="h-48 bg-recessed rounded-lg animate-pulse" />;
  }

  const planLabel = {
    trial: "Prueba gratuita",
    starter: "Starter",
    pro: "Pro",
    enterprise: "Enterprise",
    expirado: "Prueba finalizada",
  }[plan.plan];

  const planPrice = {
    trial: "€0 · 30 días",
    starter: "€29/mes",
    pro: "€79/mes",
    enterprise: "€199/mes",
    expirado: "—",
  }[plan.plan];

  return (
    <div className="space-y-6">
      {/* Current plan */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-text-muted font-semibold">Plan actual</div>
            <h2 className="font-bold text-2xl mt-1" style={{ fontFamily: "var(--font-display)" }}>{planLabel}</h2>
            <div className="text-text-muted text-sm mt-1">{planPrice}</div>
          </div>
          {plan.isTrialActive && (
            <div className="bg-gold-light text-gold-muted text-xs font-semibold px-3 py-1.5 rounded-full">
              {plan.trialDaysLeft} día{plan.trialDaysLeft !== 1 ? "s" : ""} restante{plan.trialDaysLeft !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        {/* Features list */}
        <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <PlanFeature on={plan.canMatch}>Búsquedas de convocatorias</PlanFeature>
          <PlanFeature on={plan.canUseAIWriter}>Memoria técnica con IA</PlanFeature>
          <PlanFeature on={plan.canUseCompliance}>Revisor de cumplimiento</PlanFeature>
          <PlanFeature on={plan.canExportPDF}>Exportar PDF</PlanFeature>
          <PlanFeature on={plan.canExportExcel}>Exportar Excel</PlanFeature>
          <PlanFeature on={plan.canUseChat}>Chat asistente IA</PlanFeature>
        </ul>

        {/* Usage */}
        <div className="mt-5 pt-5 border-t border-border grid grid-cols-2 gap-4">
          <UsageMeter
            label="Búsquedas este mes"
            value={0}
            limit={plan.matchLimit === Infinity ? null : plan.matchLimit}
          />
          <UsageMeter
            label="Alertas activas"
            value={0}
            limit={plan.alertLimit === Infinity ? null : plan.alertLimit}
          />
        </div>
      </div>

      {/* Upgrade section */}
      {!plan.isEnterprise && (
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-semibold text-lg" style={{ fontFamily: "var(--font-display)" }}>Mejorar mi plan</h3>
              <p className="text-text-muted text-sm">Paga anual y ahorra 2 meses.</p>
            </div>
            <div className="inline-flex bg-recessed p-1 rounded-lg">
              <button
                onClick={() => setAnnual(false)}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${!annual ? "bg-card shadow-sm" : "text-text-muted"}`}
              >
                Mensual
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={`px-4 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${annual ? "bg-card shadow-sm" : "text-text-muted"}`}
              >
                Anual <span className="text-[9px] bg-gold-light text-gold-muted px-1.5 py-0.5 rounded">−16%</span>
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mt-5">
            <UpgradeCard
              name="Pro"
              monthly={79}
              annual={790}
              isAnnual={annual}
              featured
              features={["Convocatorias ilimitadas", "Memoria técnica IA", "Exportar PDF + Excel", "Alertas diarias (15 keywords)"]}
              cta="Activar Pro"
              currentPlan={plan.plan}
              targetPlan="pro"
            />
            <UpgradeCard
              name="Enterprise"
              monthly={199}
              annual={1990}
              isAnnual={annual}
              features={["Todo Pro +", "Hasta 15 clientes", "Multi-cliente panel", "Soporte dedicado"]}
              cta="Activar Enterprise"
              currentPlan={plan.plan}
              targetPlan="enterprise"
            />
          </div>

          <div className="mt-4 bg-recessed rounded-lg p-4 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="font-semibold text-sm">¿Solo una convocatoria?</div>
              <p className="text-text-muted text-xs mt-1">Acceso Pro completo para una sola convocatoria.</p>
            </div>
            <button
              onClick={() => stripeCheckout("por_solicitud", false)}
              className="border border-border-mid px-4 py-2 rounded-md text-sm hover:bg-card transition-colors"
            >
              Comprar — €149
            </button>
          </div>
        </div>
      )}

      {/* Stripe portal */}
      {(plan.plan === "pro" || plan.plan === "enterprise") && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold" style={{ fontFamily: "var(--font-display)" }}>Suscripción activa</h3>
          <p className="text-text-muted text-sm mt-1">Gestiona tu método de pago, descarga facturas o cancela tu suscripción.</p>
          <button
            onClick={openCustomerPortal}
            className="mt-4 inline-flex items-center gap-2 border border-border-mid px-4 py-2 rounded-md text-sm hover:bg-recessed transition-colors"
          >
            Gestionar suscripción <ExternalLink size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

function PlanFeature({ on, children }: { on: boolean; children: React.ReactNode }) {
  return (
    <li className={`flex items-center gap-2 ${on ? "text-text-body" : "text-text-muted line-through"}`}>
      {on
        ? <Check size={14} className="text-gold shrink-0" />
        : <Lock size={12} className="shrink-0" />}
      {children}
    </li>
  );
}

function UsageMeter({ label, value, limit }: { label: string; value: number; limit: number | null }) {
  const pct = limit ? Math.min(100, (value / limit) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs">
        <span className="text-text-muted">{label}</span>
        <span className="font-semibold">{value}{limit ? ` / ${limit}` : ""}</span>
      </div>
      <div className="h-1.5 bg-recessed rounded-full mt-1.5 overflow-hidden">
        <div className="h-full bg-gold transition-all" style={{ width: limit ? `${pct}%` : "100%" }} />
      </div>
    </div>
  );
}

function UpgradeCard({
  name, monthly, annual, isAnnual, featured, features, cta, currentPlan, targetPlan,
}: {
  name: string; monthly: number; annual: number; isAnnual: boolean; featured?: boolean;
  features: string[]; cta: string; currentPlan: string; targetPlan: "pro" | "enterprise";
}) {
  const price = isAnnual ? Math.round(annual / 12) : monthly;
  const isCurrent = currentPlan === targetPlan;
  return (
    <div className={`rounded-lg p-5 ${featured ? "border-2 border-gold bg-gold-light/30" : "border border-border bg-card"}`}>
      <div className="flex items-center justify-between">
        <div className="font-bold" style={{ fontFamily: "var(--font-display)" }}>{name}</div>
        {featured && <span className="text-[10px] uppercase tracking-wider text-gold-muted font-semibold">Más popular</span>}
      </div>
      <div className="mt-2">
        <motion.div
          key={`${name}-${isAnnual}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <span className="font-bold text-3xl" style={{ fontFamily: "var(--font-display)" }}>€{price}</span>
          <span className="text-text-muted text-sm">/mes</span>
        </motion.div>
        {isAnnual && <p className="text-[11px] text-text-muted">Facturado anualmente · €{annual}/año</p>}
      </div>
      <ul className="mt-3 space-y-1.5 text-xs">
        {features.map((f) => (
          <li key={f} className="flex gap-1.5"><Check size={12} className="text-gold mt-0.5 shrink-0" /> {f}</li>
        ))}
      </ul>
      <button
        onClick={() => stripeCheckout(targetPlan, isAnnual)}
        disabled={isCurrent}
        className={`mt-4 w-full py-2.5 rounded-md font-semibold text-sm transition-colors ${
          isCurrent
            ? "bg-recessed text-text-muted cursor-not-allowed"
            : featured
              ? "bg-gold text-obsidian hover:bg-gold-muted hover:text-white"
              : "bg-dusk text-white hover:bg-obsidian"
        }`}
      >
        {isCurrent ? "Plan actual" : `${cta} →`}
      </button>
    </div>
  );
}

/* ──────────────────────── PERFIL EMPRESA ──────────────────────── */

function PerfilEmpresaTab() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: org, isLoading } = useQuery({
    queryKey: ["org-edit", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("organisations").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
  });

  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (org && !form) setForm(org); }, [org, form]);

  if (isLoading || !form) {
    return <div className="h-96 bg-recessed rounded-lg animate-pulse" />;
  }

  async function save() {
    setSaving(true);
    const { error } = await supabase.from("organisations").update({
      nombre: form.nombre,
      nif: form.nif,
      cnae: form.cnae,
      tipo: form.tipo,
      empleados: form.empleados,
      comunidad_autonoma: form.comunidad_autonoma,
      municipio: form.municipio,
      actividad_descripcion: form.actividad_descripcion,
    }).eq("id", form.id);
    setSaving(false);
    if (error) {
      toast.error("Error al guardar");
    } else {
      toast.success("Cambios guardados ✓");
      qc.invalidateQueries({ queryKey: ["org"] });
      qc.invalidateQueries({ queryKey: ["org-edit"] });
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-5 max-w-2xl">
      <div>
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-text-muted">Completitud del perfil</span>
          <span className="font-semibold">{form.perfil_completitud ?? 0}%</span>
        </div>
        <div className="h-2 bg-recessed rounded-full overflow-hidden">
          <div className="h-full bg-gold" style={{ width: `${form.perfil_completitud ?? 0}%` }} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Nombre / Razón social"><Input value={form.nombre ?? ""} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></Field>
        <Field label="NIF / CIF"><Input value={form.nif ?? ""} onChange={(e) => setForm({ ...form, nif: e.target.value.toUpperCase() })} className="font-mono" /></Field>
        <Field label="CNAE"><Input value={form.cnae ?? ""} onChange={(e) => setForm({ ...form, cnae: e.target.value })} /></Field>
        <Field label="Tipo">
          <select
            value={form.tipo ?? ""}
            onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            className="flex h-10 w-full rounded-md border border-border bg-recessed px-3 py-2 text-sm"
          >
            <option value="autonomo">Autónomo</option>
            <option value="microempresa">Microempresa</option>
            <option value="pyme">PYME</option>
          </select>
        </Field>
        <Field label="Empleados"><Input type="number" value={form.empleados ?? 0} onChange={(e) => setForm({ ...form, empleados: parseInt(e.target.value) || 0 })} /></Field>
        <Field label="Comunidad autónoma"><Input value={form.comunidad_autonoma ?? ""} onChange={(e) => setForm({ ...form, comunidad_autonoma: e.target.value })} /></Field>
        <Field label="Municipio"><Input value={form.municipio ?? ""} onChange={(e) => setForm({ ...form, municipio: e.target.value })} /></Field>
      </div>

      <Field label="Descripción de la actividad">
        <textarea
          value={form.actividad_descripcion ?? ""}
          onChange={(e) => setForm({ ...form, actividad_descripcion: e.target.value })}
          rows={4}
          className="w-full rounded-md border border-border bg-recessed px-3 py-2 text-sm"
        />
      </Field>

      <button
        onClick={save}
        disabled={saving}
        className="bg-dusk text-white px-5 py-2.5 rounded-md font-semibold hover:bg-obsidian transition-colors disabled:opacity-50"
      >
        {saving ? "Guardando…" : "Guardar cambios"}
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs text-text-muted">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

/* ──────────────────────── SEGURIDAD ──────────────────────── */

function SeguridadTab() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(user?.email ?? "");
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [confirmDel, setConfirmDel] = useState(false);
  const [delInput, setDelInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function changeEmail() {
    if (email === user?.email) return;
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ email });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Te enviamos un email de confirmación ✓");
  }

  async function changePwd() {
    if (pwd.length < 8) { toast.error("Mínimo 8 caracteres"); return; }
    if (pwd !== pwd2) { toast.error("Las contraseñas no coinciden"); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("Contraseña actualizada ✓"); setPwd(""); setPwd2(""); }
  }

  async function deleteAccount() {
    if (delInput !== "ELIMINAR") return;
    setBusy(true);
    // Soft-delete: clear org data and sign out. Server fn for hard-delete TBD.
    await supabase.from("organisations").delete().eq("user_id", user!.id);
    await supabase.auth.signOut();
    toast.success("Cuenta eliminada. Hasta pronto.");
    navigate({ to: "/" });
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold mb-4" style={{ fontFamily: "var(--font-display)" }}>Cambiar email</h3>
        <Label className="text-xs text-text-muted">Nuevo email</Label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
        <button onClick={changeEmail} disabled={busy} className="mt-3 bg-dusk text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-obsidian">
          Actualizar email
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold mb-4" style={{ fontFamily: "var(--font-display)" }}>Cambiar contraseña</h3>
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-text-muted">Nueva contraseña</Label>
            <Input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs text-text-muted">Confirmar contraseña</Label>
            <Input type="password" value={pwd2} onChange={(e) => setPwd2(e.target.value)} className="mt-1" />
          </div>
        </div>
        <button onClick={changePwd} disabled={busy} className="mt-3 bg-dusk text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-obsidian">
          Cambiar contraseña
        </button>
      </div>

      {/* Danger zone */}
      <div className="border border-err-bd rounded-xl p-6 bg-err-bg/20">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="text-err shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold text-err" style={{ fontFamily: "var(--font-display)" }}>Eliminar mi cuenta</h3>
            <p className="text-sm text-text-body mt-2">
              Conforme al art. 17 RGPD (derecho al olvido), puedes solicitar la eliminación de tu cuenta. Se borrarán
              tu perfil de empresa, borradores, alertas y convocatorias guardadas. Las facturas se conservarán 5 años por obligación fiscal (art. 30 Código de Comercio).
            </p>
            <button
              onClick={() => setConfirmDel(true)}
              className="mt-4 border border-err text-err px-4 py-2 rounded-md text-sm font-semibold hover:bg-err-bg transition-colors"
            >
              Solicitar eliminación
            </button>
          </div>
        </div>
      </div>

      <Dialog open={confirmDel} onOpenChange={setConfirmDel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar tu cuenta de SubvencionApp</DialogTitle>
            <DialogDescription>
              Esta acción es irreversible. Escribe <strong>ELIMINAR</strong> para confirmar.
            </DialogDescription>
          </DialogHeader>
          <Input value={delInput} onChange={(e) => setDelInput(e.target.value)} placeholder="ELIMINAR" className="font-mono" />
          <DialogFooter>
            <button onClick={() => setConfirmDel(false)} className="px-4 py-2 text-sm">Cancelar</button>
            <button
              onClick={deleteAccount}
              disabled={delInput !== "ELIMINAR" || busy}
              className="bg-err text-white px-4 py-2 rounded-md text-sm font-semibold disabled:opacity-50"
            >
              Eliminar definitivamente
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ──────────────────────── FACTURACIÓN ──────────────────────── */

function FacturacionTab() {
  const plan = usePlan();
  const isPaid = plan.plan === "pro" || plan.plan === "enterprise";

  return (
    <div className="space-y-6 max-w-3xl">
      {!isPaid ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <FileText size={32} className="mx-auto text-text-muted" />
          <h3 className="font-semibold mt-3" style={{ fontFamily: "var(--font-display)" }}>Aún no tienes facturas</h3>
          <p className="text-text-muted text-sm mt-1">Cuando actives un plan de pago, encontrarás aquí todas tus facturas.</p>
          <Link to="/precios" className="mt-4 inline-block bg-gold text-obsidian px-5 py-2.5 rounded-md font-semibold text-sm hover:bg-gold-muted hover:text-white transition-colors">
            Ver planes →
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold" style={{ fontFamily: "var(--font-display)" }}>Tus facturas</h3>
              <button onClick={openCustomerPortal} className="text-sm text-gold-muted hover:underline inline-flex items-center gap-1">
                Portal de Stripe <ExternalLink size={12} />
              </button>
            </div>
            <div className="p-8 text-center text-text-muted text-sm">
              Las facturas se sincronizarán cuando esté conectado Stripe.
            </div>
          </div>
        </>
      )}

      <div className="bg-info-bg border border-info-bd rounded-md p-4 text-xs text-info">
        IVA 21% incluido en todos los precios mostrados con IVA. Para facturas intracomunitarias o casos especiales,
        escríbenos a <a href="mailto:facturacion@subvencionapp.es" className="underline">facturacion@subvencionapp.es</a>.
      </div>
    </div>
  );
}

/* ──────────────────────── Stripe stubs ──────────────────────── */

function stripeCheckout(plan: "starter" | "pro" | "enterprise" | "por_solicitud", annual: boolean) {
  toast.info("Stripe en configuración", {
    description: `Activación ${plan}${annual ? " (anual)" : ""} disponible en cuanto conectes tu cuenta Stripe.`,
  });
}

function openCustomerPortal() {
  toast.info("Portal de Stripe en configuración", {
    description: "Disponible en cuanto conectes tu cuenta Stripe.",
  });
}
