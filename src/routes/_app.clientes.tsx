import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePlan } from "@/hooks/usePlan";
import { Building2, Plus, Trash2, Edit3, Lock, Crown } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/clientes")({ component: ClientesPage });

interface Cliente {
  id: string;
  nombre_cliente: string;
  nif_cliente: string | null;
  email_cliente: string | null;
  notas_internas: string | null;
  activo: boolean;
  created_at: string;
}

function ClientesPage() {
  const { user } = useAuth();
  const plan = usePlan();
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState<Cliente | "new" | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["clientes", user?.id],
    enabled: !!user && plan.isEnterprise,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("gestor_user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Cliente[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clientes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Cliente eliminado");
      qc.invalidateQueries({ queryKey: ["clientes"] });
    },
  });

  if (!plan.isEnterprise) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-card border border-border rounded-xl p-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-obsidian text-gold mb-5">
            <Crown size={28} />
          </div>
          <h1 className="font-bold text-2xl text-text-h" style={{ fontFamily: "var(--font-display)" }}>Función Enterprise</h1>
          <p className="text-text-muted mt-3 max-w-md mx-auto">
            El panel multi-cliente está disponible en el plan <strong className="text-text-h">Enterprise</strong>: gestiona hasta 15 clientes
            desde una única cuenta, con expedientes y memorias separadas.
          </p>
          <Link to="/precios" className="inline-flex items-center gap-2 mt-6 bg-obsidian text-white px-6 py-3 rounded-md text-sm font-semibold hover:bg-ink transition-colors">
            <Lock size={14} /> Ver plan Enterprise
          </Link>
        </div>
      </div>
    );
  }

  const usados = data?.length ?? 0;
  const limite = plan.maxClientes;
  const puedeCrear = usados < limite;

  return (
    <div className="max-w-5xl">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-bold text-3xl flex items-center gap-3" style={{ fontFamily: "var(--font-display)" }}>
            Mis clientes
            <span className="text-[10px] uppercase tracking-wider bg-obsidian text-gold px-2 py-1 rounded font-semibold">Enterprise</span>
          </h1>
          <p className="text-text-muted mt-1">Gestiona los expedientes de tus clientes desde un único panel.</p>
        </div>
        <button
          onClick={() => puedeCrear ? setFormOpen("new") : toast.error(`Límite alcanzado (${limite} clientes)`)}
          disabled={!puedeCrear}
          className="bg-gold text-obsidian px-4 py-2.5 rounded-md text-sm font-semibold hover:bg-gold-muted hover:text-white transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <Plus size={16} /> Nuevo cliente
        </button>
      </div>

      <div className="mt-4 bg-card border border-border rounded-lg p-3 text-sm text-text-muted">
        {usados} / {limite} clientes activos
      </div>

      {isLoading ? (
        <div className="mt-6 space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-recessed animate-pulse rounded-lg" />)}
        </div>
      ) : usados === 0 ? (
        <div className="mt-12 bg-card border border-border rounded-xl p-10 text-center">
          <Building2 className="mx-auto text-gold mb-4" size={40} />
          <h2 className="font-bold text-xl" style={{ fontFamily: "var(--font-display)" }}>Aún no has añadido clientes</h2>
          <p className="text-text-muted mt-2">Empieza añadiendo tu primer cliente para gestionar sus expedientes.</p>
        </div>
      ) : (
        <div className="mt-6 bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-recessed text-text-muted text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3 font-semibold">Cliente</th>
                <th className="text-left px-5 py-3 font-semibold">NIF</th>
                <th className="text-left px-5 py-3 font-semibold">Email</th>
                <th className="text-left px-5 py-3 font-semibold">Estado</th>
                <th className="text-right px-5 py-3 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data!.map((c) => (
                <tr key={c.id} className="border-t border-border hover:bg-recessed/40">
                  <td className="px-5 py-3 font-semibold text-text-h">{c.nombre_cliente}</td>
                  <td className="px-5 py-3 text-text-muted">{c.nif_cliente ?? "—"}</td>
                  <td className="px-5 py-3 text-text-muted">{c.email_cliente ?? "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded font-semibold ${c.activo ? "bg-ok-bg text-ok" : "bg-recessed text-text-muted"}`}>
                      {c.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => setFormOpen(c)} className="p-1.5 rounded hover:bg-recessed text-text-muted">
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => { if (confirm(`¿Eliminar "${c.nombre_cliente}"? Esta acción no se puede deshacer.`)) deleteMutation.mutate(c.id); }}
                      className="p-1.5 rounded hover:bg-err-bg text-text-muted hover:text-err ml-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {formOpen && (
          <ClienteFormModal
            userId={user!.id}
            cliente={formOpen === "new" ? null : formOpen}
            onClose={() => setFormOpen(null)}
            onSaved={() => {
              setFormOpen(null);
              qc.invalidateQueries({ queryKey: ["clientes"] });
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ClienteFormModal({
  userId, cliente, onClose, onSaved,
}: { userId: string; cliente: Cliente | null; onClose: () => void; onSaved: () => void }) {
  const [nombre, setNombre] = useState(cliente?.nombre_cliente ?? "");
  const [nif, setNif] = useState(cliente?.nif_cliente ?? "");
  const [email, setEmail] = useState(cliente?.email_cliente ?? "");
  const [notas, setNotas] = useState(cliente?.notas_internas ?? "");
  const [activo, setActivo] = useState(cliente?.activo ?? true);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!nombre.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    setSaving(true);
    const payload = {
      nombre_cliente: nombre.trim(),
      nif_cliente: nif.trim() || null,
      email_cliente: email.trim() || null,
      notas_internas: notas.trim() || null,
      activo,
      gestor_user_id: userId,
    };
    const { error } = cliente
      ? await supabase.from("clientes").update(payload).eq("id", cliente.id)
      : await supabase.from("clientes").insert(payload);
    setSaving(false);
    if (error) {
      toast.error("No se pudo guardar");
      return;
    }
    toast.success(cliente ? "Cliente actualizado" : "Cliente añadido");
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
        <h3 className="font-bold text-xl text-text-h" style={{ fontFamily: "var(--font-display)" }}>
          {cliente ? "Editar cliente" : "Nuevo cliente"}
        </h3>

        <div className="mt-5 space-y-4">
          <Field label="Razón social / Nombre *" value={nombre} onChange={setNombre} placeholder="Acme S.L." />
          <Field label="NIF / CIF" value={nif} onChange={setNif} placeholder="B12345678" />
          <Field label="Email de contacto" value={email} onChange={setEmail} type="email" placeholder="info@acme.es" />
          <div>
            <label className="text-xs font-semibold text-text-h uppercase tracking-wider">Notas internas</label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={3}
              className="mt-1 w-full px-3 py-2 border border-border rounded-md text-sm bg-page focus:outline-none focus:border-gold"
              placeholder="Sector, contacto habitual, observaciones…"
            />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} className="accent-gold" />
            <span className="text-text-body">Cliente activo</span>
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-text-muted hover:bg-recessed rounded-md">Cancelar</button>
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-2 text-sm bg-gold text-obsidian rounded-md font-semibold hover:bg-gold-muted hover:text-white disabled:opacity-50"
          >
            {saving ? "Guardando…" : cliente ? "Guardar cambios" : "Añadir cliente"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-text-h uppercase tracking-wider">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full px-3 py-2 border border-border rounded-md text-sm bg-page focus:outline-none focus:border-gold"
      />
    </div>
  );
}
