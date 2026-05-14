import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";
export const Route = createFileRoute("/_app/clientes")({ component: () => <ComingSoon title="Mis clientes" desc="Panel multi-cliente para gestorías Enterprise." /> });
