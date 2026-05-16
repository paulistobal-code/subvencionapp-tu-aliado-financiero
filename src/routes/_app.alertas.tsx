import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePlan } from "@/hooks/usePlan";
import { Bell, Plus, Trash2, Mail, Pause, Play, Lock } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { UpgradeModal } from "@/components/PlanGate";

export const Route = createFileRoute("/_app/alertas")({ component: AlertasPage });

interface Alerta {
  id: string;
  palabras_clave: string[] | null;
  comunidad_filtro: string | null;
  importe_minimo: number | null;
  frecuencia: "diaria" | "semanal";
  activa: boolean;
  lssi_opt_in: boolean;
  lssi_opt_in_at: string | null;
  ultimo_envio: string | null;
}

const COMUNIDADES = [
  "Cualquiera", "Andalucía", "Aragón", "Asturias", "Baleares", "Canarias", "Cantabria",
  "Castilla-La Mancha", "Castilla y León", "Cataluña", "Comunidad Valenciana", "Extremadura",
  "Galicia", "La Rioja", "Madrid", "Murcia", "Navarra", "País Vasco", "Ceuta", "Melilla",
];

function AlertasPage() {
  const { user } = useAuth();
  const plan = usePlan();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["alertas", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suscripciones_alertas")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Alerta[];
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, activa }: { id: string; activa: boolean }) => {
      const { error } = await supabase.from("suscripciones_alertas").update({ activa }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alertas"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("suscripciones_alertas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Alerta eliminada");
      qc.invalidateQueries({ queryKey: ["alertas"] });
    },
  });

  const usadas = data?.length ?? 0;
  const limite = plan.alertLimit;
  const puedeCrear = usadas < limite;

  function handleNueva() {
    if (!puedeCrear) {
      setShowUpgrade(true);
      return;
    }
    setShowForm(true);
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-bold text-3xl" style={{ fontFamily: "var(--font-display)" }}>Alertas por email</h1>
          <p className="text-text-muted mt-1">
            Recibe nuevas convocatorias que encajen con tus criterios.{" "}
            {plan.alertFrequency === "diaria" ? "Frecuencia diaria." : "Frecuencia semanal (lunes 9:00)."}
          </p>
        </div>
        <button
          onClick={handleNueva}
          className="bg-gold text-obsidian px-4 py-2.5 rounded-md text-sm font-semibold hover:bg-gold-muted hover:text-white transition-colors flex items-center gap-2"
        >
          <Plus size={16} /> Nueva alerta
        </button>
      </div>

      {/* Cuota */}
      <div className="mt-4 bg-card border border-border rounded-lg p-3 flex items-center justify-between text-sm">
        <span className="text-text-muted">
          {usadas} / {limite === Infinity ? "∞" : limite} alertas activas en tu plan{" "}
          <span className="font-semibold text-text-h capitalize">{plan.plan}</span>
        </span>
        {!puedeCrear && limite !== Infinity && (
          <button onClick={() => setShowUpgrade(true)} className="text-gold-muted hover:underline text-xs font-semibold flex items-center gap-1">
            <Lock size={12} /> Subir plan
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="mt-6 space-y-3">
          {[1, 2].map((i) => <div key={i} className="h-24 bg-recessed animate-pulse rounded-lg" />)}
        </div>
      ) : (data?.length ?? 0) === 0 ? (
        <div className="mt-12 bg-card border border-border rounded-xl p-10 text-center">
          <Bell className="mx-auto text-gold mb-4" size={40} />
          <h2 className="font-bold text-xl" style={{ fontFamily: "var(--font-display)" }}>Sin alertas configuradas</h2>
          <p className="text-text-muted mt-2 max-w-md mx-auto">
            Configura una alerta para recibir nuevas convocatorias en tu email sin tener que entrar cada día.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {data!.map((a) => (
            <div key={a.id} className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {(a.palabras_clave ?? []).map((p) => (
                      <span key={p} className="text-xs bg-recessed text-text-body px-2 py-1 rounded font-medium">{p}</span>
                    ))}
                    {(!a.palabras_clave || a.palabras_clave.length === 0) && (
                      <span className="text-xs text-text-muted italic">Sin palabras clave</span>
                    )}
                    <span className={`ml-1 text-[10px] uppercase tracking-wider px-2 py-1 rounded font-semibold ${a.activa ? "bg-ok-bg text-ok" : "bg-recessed text-text-muted"}`}>
                      {a.activa ? "Activa" : "Pausada"}
                    </span>
                  </div>
                  <div className="text-sm text-text-muted mt-2 flex items-center gap-3 flex-wrap">
                    <span>📍 {a.comunidad_filtro ?? "Toda España"}</span>
                    {a.importe_minimo && <span>💶 Mín. {a.importe_minimo.toLocaleString("es-ES")}€</span>}
                    <span>📅 {a.frecuencia === "diaria" ? "Diaria" : "Semanal"}</span>
                    {a.ultimo_envio && <span>📬 Último: {new Date(a.ultimo_envio).toLocaleDateString("es-ES")}</span>}
                  </div>
                  {a.lssi_opt_in && (
                    <div className="text-[11px] text-text-muted mt-2 flex items-center gap-1">
                      <Mail size={11} /> Opt-in LSSI confirmado el {new Date(a.lssi_opt_in_at!).toLocaleDateString("es-ES")}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleMutation.mutate({ id: a.id, activa: !a.activa })}
                    className="p-2 rounded-md hover:bg-recessed text-text-muted"
                    title={a.activa ? "Pausar" : "Activar"}
                  >
                    {a.activa ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                  <button
                    onClick={() => { if (confirm("¿Eliminar alerta?")) deleteMutation.mutate(a.id); }}
                    className="p-2 rounded-md hover:bg-err-bg text-text-muted hover:text-err"
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <NuevaAlertaModal
            userId={user!.id}
            frecuencia={plan.alertFrequency}
            onClose={() => setShowForm(false)}
            onSaved={() => {
              setShowForm(false);
              qc.invalidateQueries({ queryKey: ["alertas"] });
              toast.success("Alerta creada");
            }}
          />
        )}
      </AnimatePresence>

      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        feature="más alertas"
        description={`Tu plan ${plan.plan} permite ${limite === Infinity ? "ilimitadas" : limite} alertas. Sube a Pro para 15 alertas diarias o Enterprise para ilimitadas.`}
      />
    </div>
  );
}

function NuevaAlertaModal({
  userId, frecuencia, onClose, onSaved,
}: { userId: string; frecuencia: "diaria" | "semanal"; onClose: () => void; onSaved: () => void }) {
  const [palabras, setPalabras] = useState("");
  const [comunidad, setComunidad] = useState("Cualquiera");
  const [importe, setImporte] = useState("");
  const [lssi, setLssi] = useState(false);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!lssi) {
      toast.error("Debes aceptar el envío de comunicaciones comerciales (LSSI)");
      return;
    }
    const palabras_clave = palabras.split(",").map((p) => p.trim()).filter(Boolean);
    if (palabras_clave.length === 0) {
      toast.error("Añade al menos una palabra clave");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("suscripciones_alertas").insert({
      user_id: userId,
      palabras_clave,
      comunidad_filtro: comunidad === "Cualquiera" ? null : comunidad,
      importe_minimo: importe ? Number(importe) : null,
      frecuencia,
      activa: true,
      lssi_opt_in: true,
      lssi_opt_in_at: new Date().toISOString(),
    });
    setSaving(false);
    if (error) {
      toast.error("No se pudo crear la alerta");
      return;
    }
    onSaved();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-ink/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-xl p-6 max-w-lg w-full border border-border max-h-[90vh] overflow-y-auto"
      >
        <h3 className="font-bold text-xl text-text-h" style={{ fontFamily: "var(--font-display)" }}>Nueva alerta</h3>
        <p className="text-sm text-text-muted mt-1">Recibirás un email con las nuevas convocatorias que cumplan estos criterios.</p>

        <div className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-text-h uppercase tracking-wider">Palabras clave *</label>
            <input
              value={palabras}
              onChange={(e) => setPalabras(e.target.value)}
              placeholder="digitalización, kit digital, I+D"
              className="mt-1 w-full px-3 py-2 border border-border rounded-md text-sm bg-page focus:outline-none focus:border-gold"
            />
            <p className="text-[11px] text-text-muted mt-1">Separa por comas. Se buscarán en el título y descripción.</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-h uppercase tracking-wider">Comunidad autónoma</label>
            <select
              value={comunidad}
              onChange={(e) => setComunidad(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-border rounded-md text-sm bg-page focus:outline-none focus:border-gold"
            >
              {COMUNIDADES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-h uppercase tracking-wider">Importe mínimo (€)</label>
            <input
              type="number"
              value={importe}
              onChange={(e) => setImporte(e.target.value)}
              placeholder="Ej: 10000"
              className="mt-1 w-full px-3 py-2 border border-border rounded-md text-sm bg-page focus:outline-none focus:border-gold"
            />
          </div>

          <div className="text-xs bg-recessed rounded-md px-3 py-2 text-text-muted">
            Frecuencia: <strong className="text-text-h capitalize">{frecuencia}</strong> (definida por tu plan)
          </div>

          {/* LSSI consent */}
          <label className="flex gap-3 items-start cursor-pointer bg-gold-light/30 border border-gold/30 rounded-md p-3">
            <input
              type="checkbox"
              checked={lssi}
              onChange={(e) => setLssi(e.target.checked)}
              className="mt-0.5 accent-gold"
            />
            <span className="text-[12px] text-gold-muted leading-relaxed">
              <strong>Consiento</strong> recibir comunicaciones comerciales electrónicas con nuevas convocatorias, según la Ley 34/2002 (LSSI-CE).
              Podré darme de baja en cualquier momento desde el email o desde esta página.
            </span>
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-text-muted hover:bg-recessed rounded-md">Cancelar</button>
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-2 text-sm bg-gold text-obsidian rounded-md font-semibold hover:bg-gold-muted hover:text-white disabled:opacity-50"
          >
            {saving ? "Creando…" : "Crear alerta"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
