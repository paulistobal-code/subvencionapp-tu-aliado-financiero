import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";

export function MarketingNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 h-16 backdrop-blur-xl border-b border-white/[0.06]" style={{ background: "rgba(8,13,26,0.94)" }}>
      <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <Logo size={32} />
          <span className="text-white text-xl" style={{ fontFamily: "var(--font-display)" }}>
            SubvencionApp
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-white/70">
          <Link to="/convocatorias" className="hover:text-white transition-colors">Buscador</Link>
          <a href="/#como-funciona" className="hover:text-white transition-colors">Cómo funciona</a>
          <Link to="/precios" className="hover:text-white transition-colors">Precios</Link>
          <a href="/#gestorias" className="hover:text-white transition-colors">Para gestorías</a>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link to="/login" className="text-white text-sm hover:text-gold transition-colors">
            Iniciar sesión
          </Link>
          <Link
            to="/registro"
            className="bg-gold text-obsidian font-semibold text-sm px-4 py-2 rounded-md hover:bg-gold-muted hover:text-white transition-colors"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Empezar gratis
          </Link>
        </div>

        <button className="md:hidden text-white" onClick={() => setOpen(!open)} aria-label="Menú">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden absolute top-16 left-0 right-0 border-b border-white/10 px-6 py-6 flex flex-col gap-4" style={{ background: "rgba(8,13,26,0.98)" }}>
          <Link to="/convocatorias" onClick={() => setOpen(false)} className="text-white/80">Buscador</Link>
          <a href="/#como-funciona" onClick={() => setOpen(false)} className="text-white/80">Cómo funciona</a>
          <Link to="/precios" onClick={() => setOpen(false)} className="text-white/80">Precios</Link>
          <a href="/#gestorias" onClick={() => setOpen(false)} className="text-white/80">Para gestorías</a>
          <hr className="border-white/10" />
          <Link to="/login" className="text-white">Iniciar sesión</Link>
          <Link to="/registro" className="bg-gold text-obsidian font-semibold px-4 py-2.5 rounded-md text-center">
            Empezar gratis
          </Link>
        </div>
      )}
    </header>
  );
}
