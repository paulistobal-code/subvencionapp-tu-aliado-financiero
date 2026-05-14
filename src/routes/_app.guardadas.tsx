import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";
export const Route = createFileRoute("/_app/guardadas")({ component: () => <ComingSoon title="Guardadas" desc="El pipeline Kanban de tus convocatorias guardadas estará disponible muy pronto." /> });
