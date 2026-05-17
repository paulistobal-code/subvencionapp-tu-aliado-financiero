import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";

const KEY = "sa_cookie_consent_v1";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(KEY)) setShow(true);
  }, []);

  const decide = (value: "accepted" | "rejected") => {
    localStorage.setItem(KEY, JSON.stringify({ value, at: new Date().toISOString() }));
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Aviso de cookies"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-md z-[60] rounded-2xl border border-border bg-card shadow-2xl p-5"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
          <Cookie className="w-4 h-4 text-text-muted" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-text-h" style={{ fontFamily: "var(--font-display)" }}>
            Cookies en SubvencionApp
          </h3>
          <p className="mt-1 text-[13px] text-text-muted leading-relaxed">
            Usamos cookies técnicas necesarias para el funcionamiento del servicio. Si aceptas, podremos
            usar también cookies de analítica para mejorar la app.{" "}
            <Link to="/cookies" className="underline hover:text-text-h">
              Más info
            </Link>
            .
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => decide("accepted")}>
              Aceptar
            </Button>
            <Button size="sm" variant="outline" onClick={() => decide("rejected")}>
              Solo necesarias
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
