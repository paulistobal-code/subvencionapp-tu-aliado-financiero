import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import * as XLSX from "xlsx";
import { SECCIONES } from "@/lib/ai-gateway";

const NAVY = rgb(28 / 255, 45 / 255, 79 / 255);
const INK = rgb(8 / 255, 13 / 255, 26 / 255);
const MUTED = rgb(100 / 255, 116 / 255, 139 / 255);
const GOLD = rgb(201 / 255, 168 / 255, 76 / 255);

function wrap(text: string, font: import("pdf-lib").PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const para of text.split(/\n+/)) {
    const words = para.split(/\s+/).filter(Boolean);
    let line = "";
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (font.widthOfTextAtSize(test, size) > maxWidth) {
        if (line) lines.push(line);
        line = w;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    lines.push("");
  }
  return lines;
}

export const exportarPDF = createServerFn({ method: "POST", response: "raw" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ borrador_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: borrador } = await supabase
      .from("borradores")
      .select("*, convocatorias(titulo, organismo, programa, fuente), organisations(nombre, nif, cnae, comunidad_autonoma)")
      .eq("id", data.borrador_id)
      .maybeSingle();
    if (!borrador) throw new Error("Borrador no encontrado");

    const conv = borrador.convocatorias as { titulo?: string; organismo?: string; programa?: string | null; fuente?: string } | null;
    const org = borrador.organisations as { nombre?: string; nif?: string | null; cnae?: string | null; comunidad_autonoma?: string | null } | null;
    const secciones = (borrador.secciones ?? {}) as Record<string, string>;

    const pdf = await PDFDocument.create();
    const fontReg = await pdf.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const fontItalic = await pdf.embedFont(StandardFonts.HelveticaOblique);

    const pageW = 595, pageH = 842;
    const marginX = 56, marginTop = 64, marginBottom = 56;
    const contentW = pageW - marginX * 2;

    let page = pdf.addPage([pageW, pageH]);
    let y = pageH - marginTop;

    const newPage = () => {
      page = pdf.addPage([pageW, pageH]);
      y = pageH - marginTop;
    };
    const ensure = (h: number) => { if (y - h < marginBottom) newPage(); };
    const drawText = (txt: string, opts: { font: import("pdf-lib").PDFFont; size: number; color?: import("pdf-lib").RGB; gap?: number }) => {
      ensure(opts.size + 4);
      page.drawText(txt, { x: marginX, y, font: opts.font, size: opts.size, color: opts.color ?? INK });
      y -= opts.size + (opts.gap ?? 4);
    };

    // Cover
    drawText("MEMORIA TÉCNICA", { font: fontBold, size: 22, color: NAVY, gap: 10 });
    page.drawLine({ start: { x: marginX, y }, end: { x: marginX + 60, y }, thickness: 2, color: GOLD });
    y -= 24;
    drawText(conv?.titulo ?? "—", { font: fontBold, size: 16, gap: 6 });
    drawText(conv?.organismo ?? "—", { font: fontReg, size: 11, color: MUTED, gap: 18 });
    drawText(`Solicitante: ${org?.nombre ?? "—"}`, { font: fontReg, size: 11, gap: 4 });
    drawText(`NIF: ${org?.nif ?? "—"}   ·   CNAE: ${org?.cnae ?? "—"}   ·   ${org?.comunidad_autonoma ?? "—"}`, { font: fontReg, size: 10, color: MUTED, gap: 4 });
    drawText(`Fecha de generación: ${new Date().toLocaleDateString("es-ES")}`, { font: fontReg, size: 10, color: MUTED, gap: 24 });

    // Sections
    for (let i = 0; i < SECCIONES.length; i++) {
      const s = SECCIONES[i];
      const contenido = secciones[s.slug] ?? "";
      ensure(40);
      drawText(`${i + 1}. ${s.nombre}`, { font: fontBold, size: 13, color: NAVY, gap: 8 });
      const lines = contenido
        ? wrap(contenido, fontReg, 10.5, contentW)
        : ["[Sección sin contenido]"];
      for (const line of lines) {
        ensure(14);
        page.drawText(line, { x: marginX, y, font: line.startsWith("[") ? fontItalic : fontReg, size: 10.5, color: line.startsWith("[") ? MUTED : INK });
        y -= 14;
      }
      y -= 8;
    }

    // Footer disclaimer
    newPage();
    drawText("Aviso", { font: fontBold, size: 12, color: NAVY, gap: 8 });
    const disclaimer = "Este documento ha sido generado con asistencia de inteligencia artificial. El solicitante es responsable de verificar la conformidad con las bases reguladoras oficiales antes de su presentación. SubvencionApp no garantiza la concesión de subvenciones ni asume responsabilidad sobre el resultado de ninguna solicitud.";
    for (const line of wrap(disclaimer, fontItalic, 10, contentW)) {
      ensure(13);
      page.drawText(line, { x: marginX, y, font: fontItalic, size: 10, color: MUTED });
      y -= 13;
    }

    const bytes = await pdf.save();

    // Increment exportaciones_mes
    await supabase.rpc("reset_contadores_mensuales").catch(() => null); // no-op safe
    await supabase.from("suscripciones").update({ exportaciones_mes: (await supabase.from("suscripciones").select("exportaciones_mes").eq("user_id", userId).maybeSingle()).data?.exportaciones_mes ?? 0 + 1 }).eq("user_id", userId).catch(() => null);

    const filename = `memoria-${(conv?.titulo ?? "borrador").slice(0, 40).replace(/[^a-z0-9-]+/gi, "-")}.pdf`;
    return new Response(bytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  });

export const exportarExcel = createServerFn({ method: "POST", response: "raw" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ borrador_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: borrador } = await supabase
      .from("borradores")
      .select("*, convocatorias(titulo, organismo, programa, fuente, importe_maximo, fecha_fin), organisations(nombre, nif, cnae)")
      .eq("id", data.borrador_id)
      .maybeSingle();
    if (!borrador) throw new Error("Borrador no encontrado");

    const conv = borrador.convocatorias as { titulo?: string; organismo?: string; programa?: string | null; fuente?: string; importe_maximo?: number | null; fecha_fin?: string | null } | null;
    const org = borrador.organisations as { nombre?: string; nif?: string | null; cnae?: string | null } | null;
    const secciones = (borrador.secciones ?? {}) as Record<string, string>;

    const wb = XLSX.utils.book_new();

    const cabecera = [
      ["Memoria técnica"],
      [],
      ["Convocatoria", conv?.titulo ?? ""],
      ["Organismo", conv?.organismo ?? ""],
      ["Programa", conv?.programa ?? ""],
      ["Fuente", conv?.fuente ?? ""],
      ["Importe máximo", conv?.importe_maximo ?? ""],
      ["Fecha cierre", conv?.fecha_fin ?? ""],
      [],
      ["Solicitante", org?.nombre ?? ""],
      ["NIF", org?.nif ?? ""],
      ["CNAE", org?.cnae ?? ""],
      ["Fecha exportación", new Date().toLocaleDateString("es-ES")],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(cabecera), "Resumen");

    const seccionesData = [["#", "Sección", "Contenido", "Palabras"]];
    SECCIONES.forEach((s, i) => {
      const c = secciones[s.slug] ?? "";
      seccionesData.push([
        String(i + 1),
        s.nombre,
        c,
        String(c.trim().split(/\s+/).filter(Boolean).length),
      ]);
    });
    const wsSec = XLSX.utils.aoa_to_sheet(seccionesData);
    wsSec["!cols"] = [{ wch: 4 }, { wch: 36 }, { wch: 90 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, wsSec, "Memoria");

    const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
    const filename = `memoria-${(conv?.titulo ?? "borrador").slice(0, 40).replace(/[^a-z0-9-]+/gi, "-")}.xlsx`;
    return new Response(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  });
