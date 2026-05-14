import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";
export const Route = createFileRoute("/_app/cuenta")({ component: () => <ComingSoon title="Mi cuenta" desc="Gestiona tu perfil, suscripción y facturación." /> });
