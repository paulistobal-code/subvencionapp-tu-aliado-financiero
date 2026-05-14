import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function MarketingFooter() {
  return (
    <footer className="bg-ink text-white/50 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <Logo size={28} />
              <span className="text-white text-lg" style={{ fontFamily: "var(--font-display)" }}>
                SubvencionApp
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              El copiloto IA para encontrar subvenciones públicas en España.
            </p>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-3" style={{ fontFamily: "var(--font-sans)" }}>Producto</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#como-funciona" className="hover:text-white">Cómo funciona</a></li>
              <li><a href="#programas" className="hover:text-white">Programas</a></li>
              <li><a href="#precios" className="hover:text-white">Precios</a></li>
              <li><a href="#gestorias" className="hover:text-white">Para gestorías</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/aviso-legal" className="hover:text-white">Aviso legal</Link></li>
              <li><Link to="/privacidad" className="hover:text-white">Privacidad (RGPD)</Link></li>
              <li><Link to="/cookies" className="hover:text-white">Política de cookies</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-3">Contacto</h4>
            <ul className="space-y-2 text-sm">
              <li>hola@subvencionapp.es</li>
              <li>Soporte L–V 9:00–18:00</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 text-xs text-white/35 leading-relaxed">
          SubvencionApp S.L. · NIF: B-XXXXXXXX · Inscrita en el Registro Mercantil de Valencia ·
          Domicilio: Av. del Puerto, 00, 46011 Valencia · © {new Date().getFullYear()} Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
