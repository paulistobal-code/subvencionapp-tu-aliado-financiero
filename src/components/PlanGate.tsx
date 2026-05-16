import { ReactNode, useState } from "react";
import { Lock, Check } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { usePlan, PlanState } from "@/hooks/usePlan";

type GateKey = keyof Pick<PlanState,
  "canUseAIWriter" | "canExportPDF" | "canExportExcel" |
  "canUseCompliance" | "canUseChat" | "canMatch"
>;

export function PlanGate({
  requires, children, fallback,
}: {
  requires: GateKey;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const plan = usePlan();
  if (plan.loading) return null;
  if (plan[requires]) return <>{children}</>;
  return <>{fallback ?? null}</>;
}

/**
 * Wraps a CTA so clicks open the upgrade modal when the gate fails,
 * otherwise invokes the original onClick / renders the link.
 */
export function GatedAction({
  requires, children, render,
}: {
  requires: GateKey;
  children?: ReactNode;
  render: (open: () => void, allowed: boolean) => ReactNode;
}) {
  const plan = usePlan();
  const [open, setOpen] = useState(false);
  const allowed = !plan.loading && plan[requires];
  return (
    <>
      {render(() => setOpen(true), allowed)}
      <UpgradeModal open={open} onClose={() => setOpen(false)} feature={requires} />
      {children}
    </>
  );
}

const FEATURE_LABEL: Record<GateKey, string> = {
  canUseAIWriter: "La memoria técnica con IA",
  canExportPDF: "La exportación a PDF",
  canExportExcel: "La exportación a Excel",
  canUseCompliance: "El revisor de cumplimiento",
  canUseChat: "El chat asistente",
  canMatch: "Las búsquedas de convocatorias",
};

export function UpgradeModal({
  open, onClose, feature, description,
}: {
  open: boolean; onClose: () => void; feature: GateKey | string; description?: string;
}) {
  const label = (feature in FEATURE_LABEL ? FEATURE_LABEL[feature as GateKey] : feature) as string;
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[460px]">
        <DialogHeader>
          <div className="mx-auto w-14 h-14 rounded-full bg-gold-light flex items-center justify-center text-gold-muted mb-3">
            <Lock size={28} />
          </div>
          <DialogTitle className="text-center text-2xl" style={{ fontFamily: "var(--font-display)" }}>
            {label} requiere el plan Pro
          </DialogTitle>
          <DialogDescription className="text-center">
            {description ?? "La memoria técnica con IA, el revisor de cumplimiento y las exportaciones están disponibles a partir del plan Pro."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          <div className="border-2 border-dusk rounded-lg p-4 bg-card">
            <div className="text-[11px] uppercase tracking-wider text-gold-muted font-semibold">Recomendado</div>
            <div className="font-bold text-lg mt-1" style={{ fontFamily: "var(--font-display)" }}>Plan Pro</div>
            <div className="text-sm text-text-muted">€79/mes · €790/año</div>
            <ul className="mt-3 space-y-1.5 text-[13px]">
              <li className="flex gap-1.5"><Check size={14} className="text-gold mt-0.5 shrink-0" /> Convocatorias ilimitadas</li>
              <li className="flex gap-1.5"><Check size={14} className="text-gold mt-0.5 shrink-0" /> Memoria técnica IA</li>
              <li className="flex gap-1.5"><Check size={14} className="text-gold mt-0.5 shrink-0" /> Exportar PDF + Excel</li>
            </ul>
            <Link
              to="/precios"
              onClick={onClose}
              className="mt-4 block text-center bg-gold text-obsidian font-semibold py-2.5 rounded-md hover:bg-gold-muted hover:text-white transition-colors"
            >
              Activar Pro →
            </Link>
          </div>

          <div className="border border-border rounded-lg p-4 bg-card">
            <div className="text-[11px] uppercase tracking-wider text-text-muted font-semibold">Pago único</div>
            <div className="font-bold text-lg mt-1" style={{ fontFamily: "var(--font-display)" }}>Por Solicitud</div>
            <div className="text-sm text-text-muted">€149 una sola vez</div>
            <p className="mt-3 text-[13px] text-text-body">Acceso Pro completo para una convocatoria específica.</p>
            <Link
              to="/precios"
              onClick={onClose}
              className="mt-4 block text-center border border-border-mid py-2.5 rounded-md hover:bg-recessed transition-colors text-sm"
            >
              Comprar →
            </Link>
          </div>
        </div>

        <p className="text-[11px] text-text-muted text-center mt-2">
          Sin permanencia. Cancela cuando quieras.
        </p>
      </DialogContent>
    </Dialog>
  );
}
