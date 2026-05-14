import { Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function ComingSoon({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="max-w-2xl mx-auto text-center py-16">
      <Sparkles size={40} className="mx-auto text-gold mb-4" />
      <h1 className="font-bold" style={{ fontFamily: "var(--font-display)", fontSize: "2rem" }}>{title}</h1>
      <p className="text-text-muted mt-3">{desc}</p>
      <Link to="/dashboard" className="inline-block mt-6 bg-dusk text-white font-medium px-6 py-2.5 rounded-md hover:bg-obsidian">
        ← Volver al panel
      </Link>
    </div>
  );
}
