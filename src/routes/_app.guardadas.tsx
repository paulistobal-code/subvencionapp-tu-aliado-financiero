import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Heart, ExternalLink, Trash2, StickyNote, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/_app/guardadas")({ component: GuardadasPage });

type Estado = "guardada" | "en_revision" | "en_preparacion" | "presentada" | "descartada";

const COLUMNAS: { id: Estado; label: string; color: string }[] = [
  { id: "guardada", label: "Guardadas", color: "var(--text-muted)" },
  { id: "en_revision", label: "En revisión", color: "var(--gold-muted)" },
  { id: "en_preparacion", label: "En preparación", color: "var(--dusk)" },
  { id: "presentada", label: "Presentadas", color: "var(--ok)" },
  { id: "descartada", label: "Descartadas", color: "var(--err)" },
];

interface Guardada {
  id: string;
  estado: Estado;
  notas: string | null;
  guardada_en: string;
  convocatoria_id: string;
  convocatorias: {
    titulo: string;
    organismo: string;
    fecha_fin: string | null;
    importe_maximo: number | null;
    fuente: string | null;
  } | null;
}

function GuardadasPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<Estado | null>(null);
  const [notaOpen, setNotaOpen] = useState<Guardada | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["guardadas", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("convocatorias_guardadas")
        .select("id, estado, notas, guardada_en, convocatoria_id, convocatorias(titulo, organismo, fecha_fin, importe_maximo, fuente)")
        .eq("user_id", user!.id)
        .order("guardada_en", { ascending: false });
      if (error) throw error;
      return data as unknown as Guardada[];
    },
  });

  const moveMutation = useMutation({
    mutationFn: async ({ id, estado }: { id: string; estado: Estado }) => {
      const { error } = await supabase.from("convocatorias_guardadas").update({ estado }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["guardadas"] }),
    onError: () => toast.error("No se pudo mover"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("convocatorias_guardadas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Eliminada");
      qc.invalidateQueries({ queryKey: ["guardadas"] });
    },
  });

  const notaMutation = useMutation({
    mutationFn: async ({ id, notas }: { id: string; notas: string }) => {
      const { error } = await supabase.from("convocatorias_guardadas").update({ notas }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Nota guardada");
      qc.invalidateQueries({ queryKey: ["guardadas"] });
      setNotaOpen(null);
    },
  });

  const grouped = useMemo(() => {
    const g: Record<Estado, Guardada[]> = { guardada: [], en_revision: [], en_preparacion: [], presentada: [], descartada: [] };
    (data ?? []).forEach((it) => g[it.estado]?.push(it));
    return g;
  }, [data]);

  const total = data?.length ?? 0;

  return (
    <div className="max-w-[1400px]">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-bold text-3xl" style={{ fontFamily: "var(--font-display)" }}>Mis convocatorias guardadas</h1>
          <p className="text-text-muted mt-1">Organiza tu pipeline de subvenciones. Arrastra entre columnas para cambiar de fase.</p>
        </div>
        <div className="text-sm text-text-muted">{total} convocatoria{total !== 1 ? "s" : ""}</div>
      </div>

      {isLoading ? (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {COLUMNAS.map((c) => <div key={c.id} className="h-64 bg-recessed animate-pulse rounded-lg" />)}
        </div>
      ) : total === 0 ? (
        <div className="mt-12 bg-card border border-border rounded-xl p-10 text-center">
          <Heart className="mx-auto text-gold mb-4" size={40} />
          <h2 className="font-bold text-xl" style={{ fontFamily: "var(--font-display)" }}>Aún no guardas convocatorias</h2>
          <p className="text-text-muted mt-2">Marca con ♥ las que te interesen para construir tu pipeline.</p>
          <Link to="/dashboard" className="inline-block mt-5 bg-dusk text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-slate transition-colors">
            Ir al dashboard →
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          {COLUMNAS.map((col) => (
            <div
              key={col.id}
              onDragOver={(e) => { e.preventDefault(); setOverCol(col.id); }}
              onDragLeave={() => setOverCol((c) => (c === col.id ? null : c))}
              onDrop={() => {
                if (draggingId) {
                  const current = (data ?? []).find((d) => d.id === draggingId);
                  if (current && current.estado !== col.id) {
                    moveMutation.mutate({ id: draggingId, estado: col.id });
                  }
                }
                setDraggingId(null);
                setOverCol(null);
              }}
              className={`rounded-xl border bg-card p-3 min-h-[300px] transition-colors ${
                overCol === col.id ? "border-gold bg-gold-light/30" : "border-border"
              }`}
            >
              <div className="flex items-center justify-between px-1 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                  <span className="font-semibold text-sm text-text-h">{col.label}</span>
                </div>
                <span className="text-xs text-text-muted font-medium">{grouped[col.id].length}</span>
              </div>

              <div className="space-y-2">
                <AnimatePresence>
                  {grouped[col.id].map((g) => (
                    <motion.div
                      key={g.id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: draggingId === g.id ? 0.4 : 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      draggable
                      onDragStart={() => setDraggingId(g.id)}
                      onDragEnd={() => { setDraggingId(null); setOverCol(null); }}
                      className="bg-page border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:shadow-notary-md transition-shadow group"
                    >
                      <div className="flex items-start gap-2">
                        <GripVertical size={14} className="text-text-muted mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <Link
                            to="/convocatorias/$id"
                            params={{ id: g.convocatoria_id }}
                            className="font-semibold text-[13px] text-text-h line-clamp-2 hover:text-gold-muted leading-tight"
                          >
                            {g.convocatorias?.titulo ?? "Sin título"}
                          </Link>
                          <div className="text-[11px] text-text-muted mt-1 truncate">{g.convocatorias?.organismo}</div>
                          {g.convocatorias?.fecha_fin && (
                            <div className="text-[11px] text-text-muted mt-1">
                              Cierra: {new Date(g.convocatorias.fecha_fin).toLocaleDateString("es-ES")}
                            </div>
                          )}
                          {g.notas && (
                            <div className="mt-2 text-[11px] bg-gold-light/40 text-gold-muted px-2 py-1 rounded line-clamp-2">
                              {g.notas}
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => { e.preventDefault(); setNotaOpen(g); }}
                              className="text-[11px] text-text-muted hover:text-gold-muted flex items-center gap-1"
                            >
                              <StickyNote size={11} /> Nota
                            </button>
                            <Link
                              to="/convocatorias/$id"
                              params={{ id: g.convocatoria_id }}
                              className="text-[11px] text-text-muted hover:text-gold-muted flex items-center gap-1"
                            >
                              <ExternalLink size={11} /> Abrir
                            </Link>
                            <button
                              onClick={() => deleteMutation.mutate(g.id)}
                              className="text-[11px] text-text-muted hover:text-err flex items-center gap-1 ml-auto"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {grouped[col.id].length === 0 && (
                  <div className="text-[11px] text-text-muted text-center py-6 border-2 border-dashed border-border rounded-lg">
                    Suelta aquí
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Nota modal */}
      <AnimatePresence>
        {notaOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/60 z-50 flex items-center justify-center p-4"
            onClick={() => setNotaOpen(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-xl p-6 max-w-md w-full border border-border"
            >
              <h3 className="font-bold text-lg text-text-h" style={{ fontFamily: "var(--font-display)" }}>Nota interna</h3>
              <p className="text-xs text-text-muted mt-1 line-clamp-2">{notaOpen.convocatorias?.titulo}</p>
              <NotaForm initial={notaOpen.notas ?? ""} onSave={(notas) => notaMutation.mutate({ id: notaOpen.id, notas })} onCancel={() => setNotaOpen(null)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotaForm({ initial, onSave, onCancel }: { initial: string; onSave: (n: string) => void; onCancel: () => void }) {
  const [val, setVal] = useState(initial);
  return (
    <>
      <textarea
        value={val}
        onChange={(e) => setVal(e.target.value)}
        rows={5}
        autoFocus
        className="mt-4 w-full px-3 py-2 border border-border rounded-md text-sm bg-page focus:outline-none focus:border-gold"
        placeholder="Ej: Pendiente confirmar requisitos con cliente…"
      />
      <div className="mt-4 flex justify-end gap-2">
        <button onClick={onCancel} className="px-4 py-2 text-sm text-text-muted hover:bg-recessed rounded-md">Cancelar</button>
        <button onClick={() => onSave(val)} className="px-4 py-2 text-sm bg-gold text-obsidian rounded-md font-semibold hover:bg-gold-muted hover:text-white">Guardar</button>
      </div>
    </>
  );
}
