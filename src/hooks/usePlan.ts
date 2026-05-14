import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type Plan = "trial" | "starter" | "pro" | "enterprise" | "expirado";

export interface PlanState {
  plan: Plan;
  isTrialActive: boolean;
  trialDaysLeft: number;
  isTrialExpired: boolean;
  canMatch: boolean;
  matchLimit: number;
  canUseAIWriter: boolean;
  canExportPDF: boolean;
  canExportExcel: boolean;
  canUseCompliance: boolean;
  canUseChat: boolean;
  alertLimit: number;
  alertFrequency: "diaria" | "semanal";
  maxClientes: number;
  isEnterprise: boolean;
  loading: boolean;
}

const DEFAULT: PlanState = {
  plan: "trial",
  isTrialActive: false,
  trialDaysLeft: 0,
  isTrialExpired: false,
  canMatch: false,
  matchLimit: 0,
  canUseAIWriter: false,
  canExportPDF: false,
  canExportExcel: false,
  canUseCompliance: false,
  canUseChat: false,
  alertLimit: 0,
  alertFrequency: "semanal",
  maxClientes: 1,
  isEnterprise: false,
  loading: true,
};

export function usePlan(): PlanState {
  const { user, loading: authLoading } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["suscripcion", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("suscripciones")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  if (authLoading || isLoading || !data) return DEFAULT;

  const plan = (data.plan ?? "trial") as Plan;
  const trialFin = data.trial_fin ? new Date(data.trial_fin) : null;
  const now = new Date();
  const isTrialActive = plan === "trial" && trialFin !== null && now < trialFin;
  const isTrialExpired = plan === "trial" && trialFin !== null && now >= trialFin;
  const trialDaysLeft = trialFin
    ? Math.max(0, Math.ceil((trialFin.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const isPaid = plan === "pro" || plan === "enterprise";
  const isFullAccess = isTrialActive || isPaid;

  return {
    plan,
    isTrialActive,
    trialDaysLeft,
    isTrialExpired,
    canMatch: plan !== "expirado",
    matchLimit: plan === "starter" ? 5 : Infinity,
    canUseAIWriter: isFullAccess,
    canExportPDF: isFullAccess,
    canExportExcel: isFullAccess,
    canUseCompliance: isFullAccess,
    canUseChat: isFullAccess,
    alertLimit: plan === "starter" ? 3 : plan === "pro" ? 15 : Infinity,
    alertFrequency: plan === "starter" ? "semanal" : "diaria",
    maxClientes: plan === "enterprise" ? 15 : 1,
    isEnterprise: plan === "enterprise",
    loading: false,
  };
}
