import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  validateSearch: (s: Record<string, unknown>) => ({ from: (s.from as string) || "" }),
});

const schema = z.object({
  email: z.string().trim().email("Email inválido").max(255),
  password: z.string().min(6, "Mínimo 6 caracteres").max(100),
});

type FormData = z.infer<typeof schema>;

function LoginPage() {
  const navigate = useNavigate();
  const { from } = Route.useSearch();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(data);
    setLoading(false);
    if (error) {
      toast.error("Credenciales incorrectas. Comprueba tu email y contraseña.");
      return;
    }
    toast.success("Sesión iniciada");
    navigate({ to: from || "/dashboard" });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: "linear-gradient(180deg, var(--page) 0%, var(--recessed) 100%)" }}>
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <Logo size={32} />
          <span className="text-text-h text-xl" style={{ fontFamily: "var(--font-display)" }}>SubvencionApp</span>
        </Link>

        <div className="bg-card border border-border rounded-2xl shadow-notary-lg p-10">
          <h1 className="font-bold text-2xl text-center" style={{ fontFamily: "var(--font-display)" }}>
            Bienvenido de nuevo
          </h1>
          <p className="text-text-muted text-center text-sm mt-2">
            Accede a tus convocatorias y borradores.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
            <div>
              <label className="text-sm font-medium text-text-h">Email</label>
              <input
                {...register("email")}
                type="email"
                autoComplete="email"
                className="mt-1.5 w-full bg-recessed border border-border rounded-md px-4 py-2.5 text-sm focus:border-slate focus:ring-2 focus:ring-slate/15 outline-none transition-all"
                placeholder="tu@empresa.es"
              />
              {errors.email && <p className="text-err text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-text-h">Contraseña</label>
              <div className="relative mt-1.5">
                <input
                  {...register("password")}
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  className="w-full bg-recessed border border-border rounded-md px-4 py-2.5 pr-10 text-sm focus:border-slate focus:ring-2 focus:ring-slate/15 outline-none"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-err text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-dusk text-white font-medium py-3 rounded-md hover:bg-obsidian transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Iniciar sesión
            </button>
          </form>

          <p className="text-center text-sm text-text-muted mt-6">
            ¿Aún no tienes cuenta?{" "}
            <Link to="/registro" className="text-gold-muted font-semibold hover:underline">Crear cuenta gratis</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
