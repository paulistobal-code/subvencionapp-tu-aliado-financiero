import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, User, Users, Building2, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/registro")({
  component: RegistroPage,
});

/* ============= Validators ============= */
const dniRegex = /^[0-9]{8}[A-Z]$/i;
const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/i;
const cifRegex = /^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/i;

const step1Schema = z.object({
  email: z.string().trim().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  passwordConfirm: z.string(),
  lssiOptIn: z.boolean().optional(),
}).refine((d) => d.password === d.passwordConfirm, {
  path: ["passwordConfirm"], message: "Las contraseñas no coinciden",
});

type Step1 = z.infer<typeof step1Schema>;

interface WizardData {
  step1?: Step1;
  tipo?: "autonomo" | "microempresa" | "pyme";
  nombre?: string;
  nif?: string;
  cnae?: string;
  comunidad?: string;
  municipio?: string;
  empleados?: number;
  facturacion?: string;
  antiguedad?: number;
  sectores: string[];
  necesidades: string[];
  actividad?: string;
}

const COMUNIDADES = [
  "Andalucía", "Aragón", "Asturias", "Islas Baleares", "Canarias", "Cantabria",
  "Castilla-La Mancha", "Castilla y León", "Cataluña", "Comunitat Valenciana",
  "Extremadura", "Galicia", "La Rioja", "Madrid", "Murcia", "Navarra",
  "País Vasco", "Ceuta", "Melilla",
];

const CNAES = [
  "4711 – Comercio minorista en establecimientos no especializados",
  "4791 – Comercio al por menor por correspondencia o internet",
  "5610 – Restaurantes y puestos de comidas",
  "5630 – Bares y cafeterías",
  "5510 – Hoteles y alojamientos similares",
  "6201 – Actividades de programación informática",
  "6202 – Actividades de consultoría informática",
  "6311 – Procesamiento de datos, hosting y actividades relacionadas",
  "7022 – Otras actividades de consultoría de gestión empresarial",
  "7311 – Agencias de publicidad",
  "7410 – Actividades de diseño especializado",
  "7420 – Actividades de fotografía",
  "8690 – Otras actividades sanitarias",
  "8559 – Otra educación n.c.o.p.",
  "9602 – Peluquería y otros tratamientos de belleza",
  "4520 – Mantenimiento y reparación de vehículos de motor",
  "4321 – Instalaciones eléctricas",
  "4322 – Fontanería, instalaciones de sistemas de calefacción y aire acondicionado",
  "4120 – Construcción de edificios residenciales",
  "1071 – Fabricación de pan y de productos frescos de panadería",
  "2562 – Ingeniería mecánica por cuenta de terceros",
  "2599 – Fabricación de otros productos metálicos n.c.o.p.",
  "1813 – Servicios de preimpresión y preparación de soportes",
  "8810 – Asistencia en establecimientos residenciales",
  "9499 – Otras actividades asociativas n.c.o.p.",
  "Otro",
];

const SECTORES = [
  "Tecnología e informática", "Hostelería y restauración", "Comercio minorista",
  "Industria y manufactura", "Salud y bienestar", "Educación y formación",
  "Agroalimentario", "Cultura y ocio", "Servicios profesionales",
  "Construcción", "Transporte y logística", "Energía", "Otro",
];

const NECESIDADES = [
  "Presencia web y SEO", "Tienda online (e-commerce)", "Ciberseguridad",
  "Gestión ERP/CRM", "Factura electrónica", "Inteligencia artificial",
  "Automatización de procesos", "Análisis de datos",
  "Oficina sin papel", "Comunicaciones seguras", "Otro",
];

function RegistroPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<WizardData>({ sectores: [], necesidades: [] });

  async function finalSubmit(d: WizardData) {
    if (!d.step1) return;
    setSubmitting(true);
    const { data: signupData, error } = await supabase.auth.signUp({
      email: d.step1.email,
      password: d.step1.password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    if (error || !signupData.user) {
      setSubmitting(false);
      toast.error(error?.message || "Error al crear la cuenta");
      return;
    }

    const userId = signupData.user.id;
    const { error: orgErr } = await supabase.from("organisations").insert({
      user_id: userId,
      nombre: d.nombre!,
      tipo: d.tipo!,
      nif: d.nif || null,
      cnae: d.cnae || null,
      comunidad_autonoma: d.comunidad || null,
      municipio: d.municipio || null,
      empleados: d.empleados ?? 0,
      facturacion_rango: d.facturacion || null,
      antiguedad_anios: d.antiguedad ?? null,
      sector: d.sectores,
      necesidades_digitalizacion: d.necesidades,
      actividad_descripcion: d.actividad || null,
    });

    if (orgErr) {
      setSubmitting(false);
      toast.error("Error al guardar el perfil de empresa");
      return;
    }

    toast.success("¡Cuenta creada! Buscando tus subvenciones…");
    setTimeout(() => navigate({ to: "/dashboard", search: { nuevo: true } }), 800);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: "linear-gradient(180deg, var(--page) 0%, var(--recessed) 100%)" }}>
      <div className="w-full max-w-[520px]">
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <Logo size={32} />
          <span className="text-text-h text-xl" style={{ fontFamily: "var(--font-display)" }}>SubvencionApp</span>
        </Link>

        <div className="bg-card border border-border rounded-3xl shadow-notary-lg p-10">
          <Stepper step={step} />

          <AnimatePresence mode="wait">
            {step === 1 && (
              <Step1Form key="1" defaults={data.step1} onNext={(s1) => { setData({ ...data, step1: s1 }); setStep(2); }} />
            )}
            {step === 2 && (
              <Step2 key="2" value={data.tipo} onBack={() => setStep(1)} onNext={(t) => { setData({ ...data, tipo: t, empleados: t === "autonomo" ? 0 : data.empleados }); setStep(3); }} />
            )}
            {step === 3 && (
              <Step3 key="3" data={data} onBack={() => setStep(2)} onNext={(d) => { setData({ ...data, ...d }); setStep(4); }} />
            )}
            {step === 4 && (
              <Step4
                key="4"
                data={data}
                submitting={submitting}
                onBack={() => setStep(3)}
                onSubmit={(d) => { const merged = { ...data, ...d }; setData(merged); finalSubmit(merged); }}
              />
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-sm text-text-muted mt-6">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-gold-muted font-semibold hover:underline">Iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
}

/* ============= Stepper ============= */
function Stepper({ step }: { step: number }) {
  const labels = ["Cuenta", "Tipo", "Datos", "Necesidades"];
  return (
    <div className="flex items-center justify-between mb-8">
      {labels.map((l, i) => {
        const n = i + 1;
        const active = n === step;
        const done = n < step;
        return (
          <div key={l} className="flex items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
              done ? "bg-gold text-ink" : active ? "bg-dusk text-white" : "bg-recessed text-text-muted"
            }`}>
              {done ? <Check size={14} /> : n}
            </div>
            {i < labels.length - 1 && <div className={`flex-1 h-px mx-2 ${n < step ? "bg-gold" : "bg-border"}`} />}
          </div>
        );
      })}
    </div>
  );
}

const stepMotion = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.2 },
};

/* ============= Step 1 ============= */
function Step1Form({ defaults, onNext }: { defaults?: Step1; onNext: (s: Step1) => void }) {
  const [showPwd, setShowPwd] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<Step1>({
    resolver: zodResolver(step1Schema),
    defaultValues: defaults,
  });
  const pwd = watch("password") || "";
  const strength = pwd.length < 8 ? 0 : pwd.length < 12 ? 1 : /[A-Z]/.test(pwd) && /[0-9]/.test(pwd) ? 3 : 2;

  return (
    <motion.div {...stepMotion}>
      <h2 className="font-bold text-2xl" style={{ fontFamily: "var(--font-display)" }}>
        Empieza gratis — sin tarjeta
      </h2>
      <p className="text-text-muted text-sm mt-1">30 días de acceso completo. Sin compromiso.</p>

      <form onSubmit={handleSubmit(onNext)} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium">Email</label>
          <input {...register("email")} type="email" autoComplete="email" className="input-notary" placeholder="tu@empresa.es" />
          {errors.email && <p className="text-err text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="text-sm font-medium">Contraseña</label>
          <div className="relative">
            <input {...register("password")} type={showPwd ? "text" : "password"} className="input-notary pr-10" autoComplete="new-password" />
            <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {pwd && (
            <div className="mt-2 flex gap-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                  i < strength ? (strength === 1 ? "bg-err" : strength === 2 ? "bg-warn" : "bg-ok") : "bg-border"
                }`} />
              ))}
            </div>
          )}
          {pwd && <p className="text-xs text-text-muted mt-1">{strength <= 1 ? "Débil" : strength === 2 ? "Media" : "Fuerte"}</p>}
          {errors.password && <p className="text-err text-xs mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="text-sm font-medium">Confirmar contraseña</label>
          <input {...register("passwordConfirm")} type={showPwd ? "text" : "password"} className="input-notary" autoComplete="new-password" />
          {errors.passwordConfirm && <p className="text-err text-xs mt-1">{errors.passwordConfirm.message}</p>}
        </div>

        <label className="flex items-start gap-2 text-sm text-text-body cursor-pointer">
          <input {...register("lssiOptIn")} type="checkbox" className="mt-0.5" />
          <span>
            Acepto recibir alertas de nuevas convocatorias por email. Puedo retirar este consentimiento en cualquier momento desde Mi cuenta &gt; Alertas.
          </span>
        </label>
        <p className="text-[11px] text-text-muted -mt-2">
          Este consentimiento es voluntario e independiente del acceso al servicio (LSSI-CE, art. 21).
        </p>

        <p className="text-xs text-text-muted">
          Al crear tu cuenta aceptas nuestra <Link to="/privacidad" className="underline">Política de privacidad</Link>{" "}
          y los <Link to="/aviso-legal" className="underline">Términos de uso</Link>, conforme al RGPD (UE) 2016/679.
        </p>

        <button type="submit" className="btn-primary-cta w-full">Continuar →</button>
      </form>

      <style>{`
        .input-notary { width: 100%; background: var(--recessed); border: 1px solid var(--border); border-radius: 8px; padding: 10px 14px; font-size: 14px; transition: all .15s; margin-top: 6px; outline: none; }
        .input-notary:focus { border-color: var(--slate); box-shadow: 0 0 0 3px rgba(42,63,107,0.12); }
        .btn-primary-cta { background: var(--dusk); color: white; font-weight: 500; padding: 12px 20px; border-radius: 8px; transition: background .12s; font-size: 15px; }
        .btn-primary-cta:hover { background: var(--obsidian); }
        .btn-primary-cta:disabled { opacity: .6; cursor: not-allowed; }
        .btn-ghost { border: 1px solid var(--border-mid); color: var(--text-body); padding: 10px 18px; border-radius: 8px; transition: background .15s; }
        .btn-ghost:hover { background: var(--recessed); }
      `}</style>
    </motion.div>
  );
}

/* ============= Step 2 ============= */
function Step2({ value, onBack, onNext }: { value?: WizardData["tipo"]; onBack: () => void; onNext: (t: NonNullable<WizardData["tipo"]>) => void }) {
  const [selected, setSelected] = useState<WizardData["tipo"]>(value);
  const opts = [
    { id: "autonomo", Icon: User, title: "Autónomo / Freelance", sub: "Trabajo por cuenta propia · 0 empleados a cargo" },
    { id: "microempresa", Icon: Users, title: "Microempresa", sub: "Menos de 10 empleados" },
    { id: "pyme", Icon: Building2, title: "PYME", sub: "Entre 10 y 249 empleados" },
  ] as const;

  return (
    <motion.div {...stepMotion}>
      <h2 className="font-bold text-2xl" style={{ fontFamily: "var(--font-display)" }}>¿Cómo es tu empresa?</h2>
      <p className="text-text-muted text-sm mt-1">Esto nos ayuda a filtrar las convocatorias correctas.</p>

      <div className="mt-6 space-y-3">
        {opts.map(({ id, Icon, title, sub }) => {
          const sel = selected === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setSelected(id)}
              className={`w-full flex items-center gap-4 p-5 rounded-xl border-2 transition-all relative text-left ${
                sel ? "border-slate bg-gold-light" : "border-border hover:border-border-mid bg-card"
              }`}
            >
              <Icon size={28} className={sel ? "text-gold-muted" : "text-text-muted"} />
              <div className="flex-1">
                <div className="font-semibold">{title}</div>
                <div className="text-xs text-text-muted mt-0.5">{sub}</div>
              </div>
              {sel && <div className="w-5 h-5 rounded-full bg-gold text-ink flex items-center justify-center"><Check size={12} /></div>}
            </button>
          );
        })}
      </div>

      <div className="flex gap-3 mt-7">
        <button type="button" onClick={onBack} className="btn-ghost">← Atrás</button>
        <button type="button" disabled={!selected} onClick={() => selected && onNext(selected)} className="btn-primary-cta flex-1 disabled:opacity-50">Continuar →</button>
      </div>
    </motion.div>
  );
}

/* ============= Step 3 ============= */
const step3Schema = z.object({
  nombre: z.string().trim().min(2, "Nombre requerido").max(120),
  nif: z.string().trim().min(1, "NIF requerido").max(20),
  cnae: z.string().min(1, "Selecciona un CNAE"),
  comunidad: z.string().min(1, "Selecciona comunidad"),
  municipio: z.string().max(80).optional(),
  empleados: z.coerce.number().int().min(0).max(10000).optional(),
  facturacion: z.string().min(1, "Selecciona rango"),
  antiguedad: z.coerce.number().int().min(0).max(120).optional(),
});
type Step3Data = z.infer<typeof step3Schema>;

function Step3({ data, onBack, onNext }: { data: WizardData; onBack: () => void; onNext: (d: Step3Data) => void }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      nombre: data.nombre, nif: data.nif, cnae: data.cnae,
      comunidad: data.comunidad, municipio: data.municipio,
      empleados: data.empleados, facturacion: data.facturacion, antiguedad: data.antiguedad,
    },
  });
  const nifVal = watch("nif") || "";
  const isAutonomo = data.tipo === "autonomo";
  const nifValid = isAutonomo ? (dniRegex.test(nifVal) || nieRegex.test(nifVal)) : cifRegex.test(nifVal);

  return (
    <motion.div {...stepMotion}>
      <h2 className="font-bold text-2xl" style={{ fontFamily: "var(--font-display)" }}>Datos de tu empresa</h2>
      <p className="text-text-muted text-sm mt-1">Para encontrar las convocatorias que aplican a tu caso específico.</p>

      <form onSubmit={handleSubmit(onNext)} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium">{isAutonomo ? "Nombre / actividad" : "Nombre de la empresa"}</label>
          <input {...register("nombre")} className="input-notary" placeholder={isAutonomo ? "Ej: María González — Diseño gráfico" : "Ej: Talleres Martínez S.L."} />
          {errors.nombre && <p className="text-err text-xs mt-1">{errors.nombre.message}</p>}
        </div>

        <div>
          <label className="text-sm font-medium">{isAutonomo ? "DNI / NIE" : "CIF"}</label>
          <div className="relative">
            <input
              {...register("nif")}
              className="input-notary pr-10 uppercase"
              style={{ fontFamily: "var(--font-mono)" }}
              placeholder={isAutonomo ? "12345678A" : "B12345678"}
            />
            {nifVal && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                {nifValid ? <Check size={16} className="text-ok" /> : <span className="text-err text-xs">✗</span>}
              </span>
            )}
          </div>
          <p className="text-[11px] text-text-muted mt-1">Validamos el formato. No consultamos datos con la AEAT.</p>
          {errors.nif && <p className="text-err text-xs mt-1">{errors.nif.message}</p>}
        </div>

        <div>
          <label className="text-sm font-medium">Código CNAE</label>
          <select {...register("cnae")} className="input-notary">
            <option value="">— Selecciona —</option>
            {CNAES.map((c) => <option key={c} value={c.split(" – ")[0]}>{c}</option>)}
          </select>
          {errors.cnae && <p className="text-err text-xs mt-1">{errors.cnae.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Comunidad Autónoma</label>
            <select {...register("comunidad")} className="input-notary">
              <option value="">— Selecciona —</option>
              {COMUNIDADES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.comunidad && <p className="text-err text-xs mt-1">{errors.comunidad.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium">Municipio (opcional)</label>
            <input {...register("municipio")} className="input-notary" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {!isAutonomo && (
            <div>
              <label className="text-sm font-medium">Nº empleados</label>
              <input {...register("empleados")} type="number" min={0} className="input-notary" />
            </div>
          )}
          <div>
            <label className="text-sm font-medium">Años de actividad</label>
            <input {...register("antiguedad")} type="number" min={0} className="input-notary" />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Facturación anual</label>
          <select {...register("facturacion")} className="input-notary">
            <option value="">— Selecciona —</option>
            <option value="menos_100k">Menos de €100.000</option>
            <option value="100k_300k">€100.000 – €300.000</option>
            <option value="300k_1m">€300.000 – €1.000.000</option>
            <option value="mas_1m">Más de €1.000.000</option>
          </select>
          {errors.facturacion && <p className="text-err text-xs mt-1">{errors.facturacion.message}</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onBack} className="btn-ghost">← Atrás</button>
          <button type="submit" className="btn-primary-cta flex-1">Continuar →</button>
        </div>
      </form>
    </motion.div>
  );
}

/* ============= Step 4 ============= */
function Step4({
  data, submitting, onBack, onSubmit,
}: {
  data: WizardData;
  submitting: boolean;
  onBack: () => void;
  onSubmit: (d: { sectores: string[]; necesidades: string[]; actividad?: string }) => void;
}) {
  const [sectores, setSectores] = useState<string[]>(data.sectores);
  const [necesidades, setNecesidades] = useState<string[]>(data.necesidades);
  const [actividad, setActividad] = useState<string>(data.actividad || "");

  const toggle = (list: string[], setter: (l: string[]) => void, val: string) => {
    setter(list.includes(val) ? list.filter((x) => x !== val) : [...list, val]);
  };

  return (
    <motion.div {...stepMotion}>
      <h2 className="font-bold text-2xl" style={{ fontFamily: "var(--font-display)" }}>¿En qué necesita ayuda tu empresa?</h2>
      <p className="text-text-muted text-sm mt-1">Selecciona todo lo que aplique — mejora los resultados.</p>

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-text-h">Sector de actividad</h3>
        <div className="flex flex-wrap gap-2 mt-3">
          {SECTORES.map((s) => (
            <Chip key={s} active={sectores.includes(s)} onClick={() => toggle(sectores, setSectores, s)}>{s}</Chip>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-text-h">Necesidades de digitalización</h3>
        <div className="flex flex-wrap gap-2 mt-3">
          {NECESIDADES.map((s) => (
            <Chip key={s} active={necesidades.includes(s)} onClick={() => toggle(necesidades, setNecesidades, s)}>{s}</Chip>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <label className="text-sm font-medium">Describe tu actividad (mejora los resultados de IA)</label>
        <textarea
          value={actividad}
          onChange={(e) => setActividad(e.target.value)}
          rows={3}
          maxLength={500}
          className="input-notary resize-none"
          placeholder="Ej: Taller de reparación de vehículos en Valencia, 6 empleados. Queremos digitalizarnos con gestión de citas y factura electrónica."
        />
      </div>

      <div className="flex gap-3 mt-7">
        <button type="button" onClick={onBack} className="btn-ghost" disabled={submitting}>← Atrás</button>
        <button
          type="button"
          disabled={submitting}
          onClick={() => onSubmit({ sectores, necesidades, actividad })}
          className="flex-1 bg-gold text-obsidian font-semibold py-4 rounded-xl shadow-gold hover:bg-gold-muted hover:text-white transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ fontSize: "17px" }}
        >
          {submitting ? <><Loader2 size={18} className="animate-spin" /> Analizando convocatorias…</> : "Buscar mis subvenciones →"}
        </button>
      </div>
    </motion.div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs font-medium px-3 py-2 rounded-md border transition-all ${
        active
          ? "bg-obsidian text-white border-transparent"
          : "bg-recessed text-text-body border-border hover:border-border-mid"
      }`}
    >
      {children}
    </button>
  );
}
