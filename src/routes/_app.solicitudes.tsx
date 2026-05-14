import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";
export const Route = createFileRoute("/_app/solicitudes")({ component: () => <ComingSoon title="Mis solicitudes" desc="Tus borradores de memoria técnica aparecerán aquí." /> });
