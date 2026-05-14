-- Extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 1. organisations
CREATE TABLE public.organisations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('autonomo','microempresa','pyme')),
  nif TEXT,
  cnae TEXT,
  empleados INT DEFAULT 0,
  facturacion_rango TEXT CHECK (facturacion_rango IN ('menos_100k','100k_300k','300k_1m','mas_1m')),
  antiguedad_anios INT,
  comunidad_autonoma TEXT,
  municipio TEXT,
  sector TEXT[],
  subsector TEXT,
  actividad_descripcion TEXT,
  necesidades_digitalizacion TEXT[],
  subvenciones_previas JSONB DEFAULT '[]',
  perfil_completitud INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. suscripciones
CREATE TABLE public.suscripciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  plan TEXT DEFAULT 'trial' CHECK (plan IN ('trial','starter','pro','enterprise','expirado')),
  estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo','cancelado','pago_fallido','pausado')),
  trial_inicio TIMESTAMPTZ DEFAULT NOW(),
  trial_fin TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  periodo_fin TIMESTAMPTZ,
  facturacion_anual BOOLEAN DEFAULT FALSE,
  por_solicitud_ids UUID[] DEFAULT '{}',
  coincidencias_mes INT DEFAULT 0,
  exportaciones_mes INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. convocatorias
CREATE TABLE public.convocatorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fuente TEXT NOT NULL CHECK (fuente IN ('BDNS','KitDigital','CDTI','GVA','IVACE','PRTR','HorizonEurope','Otro')),
  codigo_bdns TEXT UNIQUE,
  titulo TEXT NOT NULL,
  organismo TEXT NOT NULL,
  descripcion TEXT,
  resumen_ia TEXT,
  resumen_elegibilidad TEXT,
  importe_maximo NUMERIC,
  importe_minimo NUMERIC,
  porcentaje_financiacion INT,
  fecha_inicio DATE,
  fecha_fin DATE,
  sectores TEXT[],
  comunidades TEXT[],
  tipos_beneficiario TEXT[],
  cnae_requeridos TEXT[],
  programa TEXT,
  url_convocatoria TEXT,
  url_bases_reguladoras TEXT,
  url_solicitud TEXT,
  activa BOOLEAN DEFAULT TRUE,
  descripcion_embedding vector(1536),
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. coincidencias
CREATE TABLE public.coincidencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  convocatoria_id UUID REFERENCES public.convocatorias(id) ON DELETE CASCADE,
  puntuacion FLOAT NOT NULL,
  motivos TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, convocatoria_id)
);

-- 5. convocatorias_guardadas
CREATE TABLE public.convocatorias_guardadas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  convocatoria_id UUID REFERENCES public.convocatorias(id) ON DELETE CASCADE,
  notas TEXT,
  estado TEXT DEFAULT 'guardada' CHECK (estado IN ('guardada','en_preparacion','enviada','concedida','denegada')),
  guardada_en TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, convocatoria_id)
);

-- 6. borradores
CREATE TABLE public.borradores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES public.organisations(id),
  convocatoria_id UUID REFERENCES public.convocatorias(id) ON DELETE CASCADE,
  secciones JSONB DEFAULT '{}',
  alertas_cumplimiento JSONB DEFAULT '{}',
  estado TEXT DEFAULT 'borrador' CHECK (estado IN ('borrador','en_revision','listo','enviado')),
  secciones_completadas INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. clientes
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gestor_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  org_id UUID REFERENCES public.organisations(id),
  nombre_cliente TEXT NOT NULL,
  nif_cliente TEXT,
  email_cliente TEXT,
  notas_internas TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. suscripciones_alertas
CREATE TABLE public.suscripciones_alertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  palabras_clave TEXT[],
  frecuencia TEXT DEFAULT 'semanal' CHECK (frecuencia IN ('diaria','semanal')),
  comunidad_filtro TEXT,
  importe_minimo NUMERIC,
  activa BOOLEAN DEFAULT TRUE,
  lssi_opt_in BOOLEAN DEFAULT FALSE,
  lssi_opt_in_at TIMESTAMPTZ,
  ultimo_envio TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX ON public.convocatorias USING ivfflat (descripcion_embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX ON public.convocatorias (activa, fecha_fin);
CREATE INDEX ON public.convocatorias USING GIN (sectores);
CREATE INDEX ON public.convocatorias USING GIN (comunidades);
CREATE INDEX ON public.convocatorias USING GIN (tipos_beneficiario);
CREATE INDEX ON public.convocatorias USING GIN (to_tsvector('spanish', titulo || ' ' || COALESCE(descripcion, '')));
CREATE INDEX ON public.coincidencias (org_id, puntuacion DESC);
CREATE INDEX ON public.convocatorias_guardadas (user_id, estado);
CREATE INDEX ON public.borradores (user_id, convocatoria_id);
CREATE INDEX ON public.clientes (gestor_user_id);

-- Vector search function
CREATE OR REPLACE FUNCTION public.buscar_convocatorias(
  query_embedding vector(1536),
  p_comunidad TEXT DEFAULT NULL,
  p_tipo_org TEXT DEFAULT NULL,
  p_importe_min NUMERIC DEFAULT NULL,
  p_fuente TEXT DEFAULT NULL,
  p_limite INT DEFAULT 25
) RETURNS TABLE (
  id UUID, titulo TEXT, organismo TEXT, fuente TEXT,
  importe_maximo NUMERIC, porcentaje_financiacion INT,
  fecha_fin DATE, tipos_beneficiario TEXT[],
  comunidades TEXT[], puntuacion FLOAT
) LANGUAGE SQL STABLE SET search_path = public AS $$
  SELECT id, titulo, organismo, fuente, importe_maximo,
    porcentaje_financiacion, fecha_fin,
    tipos_beneficiario, comunidades,
    1 - (descripcion_embedding <=> query_embedding) AS puntuacion
  FROM public.convocatorias
  WHERE activa = TRUE
    AND (fecha_fin IS NULL OR fecha_fin >= CURRENT_DATE)
    AND (p_comunidad IS NULL OR comunidades @> ARRAY[p_comunidad] OR 'Nacional' = ANY(comunidades))
    AND (p_tipo_org IS NULL OR tipos_beneficiario @> ARRAY[p_tipo_org] OR 'Todos' = ANY(tipos_beneficiario))
    AND (p_importe_min IS NULL OR importe_maximo >= p_importe_min)
    AND (p_fuente IS NULL OR fuente = p_fuente)
  ORDER BY descripcion_embedding <=> query_embedding
  LIMIT p_limite;
$$;

-- Reset mensual
CREATE OR REPLACE FUNCTION public.reset_contadores_mensuales()
RETURNS VOID LANGUAGE SQL SET search_path = public AS $$
  UPDATE public.suscripciones SET coincidencias_mes = 0, exportaciones_mes = 0;
$$;

-- Completitud
CREATE OR REPLACE FUNCTION public.calcular_completitud(p_org_id UUID)
RETURNS INT LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  o public.organisations%ROWTYPE;
  s INT := 0;
BEGIN
  SELECT * INTO o FROM public.organisations WHERE id = p_org_id;
  IF o.nombre IS NOT NULL THEN s := s + 15; END IF;
  IF o.nif IS NOT NULL THEN s := s + 15; END IF;
  IF o.cnae IS NOT NULL THEN s := s + 15; END IF;
  IF o.comunidad_autonoma IS NOT NULL THEN s := s + 10; END IF;
  IF o.sector IS NOT NULL AND cardinality(o.sector) > 0 THEN s := s + 15; END IF;
  IF o.actividad_descripcion IS NOT NULL AND length(o.actividad_descripcion) > 50 THEN s := s + 15; END IF;
  IF o.necesidades_digitalizacion IS NOT NULL AND cardinality(o.necesidades_digitalizacion) > 0 THEN s := s + 15; END IF;
  RETURN s;
END; $$;

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

CREATE TRIGGER trg_org BEFORE UPDATE ON public.organisations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_conv BEFORE UPDATE ON public.convocatorias FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_borr BEFORE UPDATE ON public.borradores FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_sus BEFORE UPDATE ON public.suscripciones FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_cli BEFORE UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create suscripcion on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.suscripciones (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS
ALTER TABLE public.organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convocatorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coincidencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convocatorias_guardadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.borradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suscripciones_alertas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_select" ON public.organisations FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "org_insert" ON public.organisations FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "org_update" ON public.organisations FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "org_delete" ON public.organisations FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "sus_select" ON public.suscripciones FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "sus_insert" ON public.suscripciones FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "sus_update" ON public.suscripciones FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "coi_select" ON public.coincidencias FOR SELECT USING (org_id IN (SELECT id FROM public.organisations WHERE user_id = auth.uid()));
CREATE POLICY "coi_insert" ON public.coincidencias FOR INSERT WITH CHECK (org_id IN (SELECT id FROM public.organisations WHERE user_id = auth.uid()));
CREATE POLICY "coi_delete" ON public.coincidencias FOR DELETE USING (org_id IN (SELECT id FROM public.organisations WHERE user_id = auth.uid()));

CREATE POLICY "guar_all" ON public.convocatorias_guardadas FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "borr_all" ON public.borradores FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "cli_all" ON public.clientes FOR ALL USING (gestor_user_id = auth.uid()) WITH CHECK (gestor_user_id = auth.uid());
CREATE POLICY "ale_all" ON public.suscripciones_alertas FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "conv_public" ON public.convocatorias FOR SELECT USING (TRUE);

-- Seed convocatorias
INSERT INTO public.convocatorias (fuente, titulo, organismo, descripcion, resumen_elegibilidad, importe_maximo, importe_minimo, porcentaje_financiacion, fecha_fin, sectores, comunidades, tipos_beneficiario, programa, url_convocatoria, descripcion_embedding) VALUES
('KitDigital','Kit Digital — Segmento I (0–2 empleados)','Red.es / Ministerio de Transformación Digital','Ayudas para la digitalización de autónomos y microempresas de 0 a 2 empleados. Soluciones homologadas por agentes digitalizadores acreditados. PRTR financiado por Next Generation EU.','Autónomos y empresas de 0 a 2 empleados con NIF español, mínimo 6 meses de antigüedad, al corriente de AEAT y TGSS.',2000,500,100,'2025-12-31',ARRAY['Todos'],ARRAY['Nacional'],ARRAY['autonomo','microempresa'],'Kit Digital','https://www.acelerapyme.gob.es/kit-digital',array_fill(0::float8, ARRAY[1536])::vector(1536)),
('KitDigital','Kit Digital — Segmento II (3–9 empleados)','Red.es / Ministerio de Transformación Digital','Digitalización de pequeñas empresas de 3 a 9 empleados: ciberseguridad, e-commerce, gestión empresarial, presencia web, comunicaciones seguras e inteligencia artificial.','Empresas de 3–9 empleados, domicilio fiscal España, no estar en situación de crisis conforme a la normativa europea.',6000,1000,100,'2025-12-31',ARRAY['Todos'],ARRAY['Nacional'],ARRAY['microempresa','pyme'],'Kit Digital','https://www.acelerapyme.gob.es/kit-digital',array_fill(0::float8, ARRAY[1536])::vector(1536)),
('KitDigital','Kit Digital — Segmento III (10–50 empleados)','Red.es / Ministerio de Transformación Digital','Digitalización avanzada para medianas empresas de 10 a 50 empleados. Incluye inteligencia artificial, big data, ciberseguridad avanzada y digitalización de procesos productivos.','Empresas de 10–50 empleados, domicilio fiscal España, al corriente de todas las obligaciones tributarias.',12000,4000,100,'2025-12-31',ARRAY['Todos'],ARRAY['Nacional'],ARRAY['pyme'],'Kit Digital','https://www.acelerapyme.gob.es/kit-digital',array_fill(0::float8, ARRAY[1536])::vector(1536)),
('CDTI','CDTI — Proyectos de I+D Empresarial','Centro para el Desarrollo Tecnológico y la Innovación (CDTI)','Financiación preferente para proyectos de investigación y desarrollo tecnológico empresarial. Entre el 33% y el 75% del presupuesto aprobado, con tipos de interés preferentes.','PYMEs y grandes empresas españolas. Presupuesto mínimo 175.000 €. Viabilidad técnica y económica demostrable ante el comité evaluador.',250000,175000,75,'2025-10-31',ARRAY['Tecnología','Industria','Salud','Agroalimentario'],ARRAY['Nacional'],ARRAY['microempresa','pyme'],'I+D Empresarial','https://www.cdti.es/financiacion',array_fill(0::float8, ARRAY[1536])::vector(1536)),
('CDTI','CDTI Neotec — Empresas de Base Tecnológica','Centro para el Desarrollo Tecnológico y la Innovación (CDTI)','Apoyo a la creación y primeras etapas de startups y empresas de base tecnológica de menos de 3 años. Financia hasta el 70% del plan de negocio tecnológico.','Empresas de menos de 3 años, capital privado mayoritario, plan de negocio en tecnología propia, coinversión privada mínima del 30%.',300000,100000,70,'2025-09-30',ARRAY['Tecnología','Biotecnología','Energía','TIC'],ARRAY['Nacional'],ARRAY['microempresa'],'Neotec','https://www.cdti.es/neotec',array_fill(0::float8, ARRAY[1536])::vector(1536)),
('GVA','Ayudas GVA — Modernización del Comercio Minorista 2025','Generalitat Valenciana — Conselleria d''Economia','Subvenciones para la modernización, digitalización y mejora de la competitividad de establecimientos de comercio minorista en la Comunitat Valenciana.','Autónomos y PYMEs del comercio minorista con establecimiento físico en la Comunitat Valenciana. Máximo 50 empleados.',10000,1000,80,'2025-07-31',ARRAY['Comercio'],ARRAY['Comunitat Valenciana'],ARRAY['autonomo','microempresa','pyme'],'Modernización Comercio GVA','https://www.gva.es/comercio-ayudas',array_fill(0::float8, ARRAY[1536])::vector(1536)),
('IVACE','IVACE Digital — Digitalización de la Industria Valenciana 2025','Institut Valencià de Competitivitat Empresarial (IVACE+i)','Ayudas para la implantación de tecnologías de Industria 4.0 en empresas manufactureras valencianas: IoT, automatización, robótica, IA industrial y ciberseguridad OT.','Empresas industriales CNAE sección C, centro productivo en Comunitat Valenciana, mínimo 5 empleados, inversión elegible mínima 10.000 €.',50000,5000,40,'2025-08-15',ARRAY['Industria'],ARRAY['Comunitat Valenciana'],ARRAY['microempresa','pyme'],'IVACE Digital','https://www.ivace.es/digitalizacion',array_fill(0::float8, ARRAY[1536])::vector(1536)),
('PRTR','PRTR — Transformación Digital del Sector Turístico','Secretaría de Estado de Turismo','Fondos Next Generation EU para la digitalización y sostenibilidad de PYMEs turísticas: plataformas de reservas, CRM, analítica de datos, ciberseguridad y presencia digital internacional.','PYMEs del sector turístico (hoteles, restauración, agencias, ocio). Domicilio fiscal España. Cofinanciación del 30% requerida.',150000,10000,70,'2025-11-30',ARRAY['Turismo','Hostelería'],ARRAY['Nacional'],ARRAY['microempresa','pyme'],'PRTR Turismo Digital','https://www.tourspain.es/prtr',array_fill(0::float8, ARRAY[1536])::vector(1536)),
('BDNS','Fomento del Trabajo Autónomo — SEPE 2025','Servicio Público de Empleo Estatal (SEPE)','Subvenciones e incentivos para desempleados que inicien actividad por cuenta propia. Incluye capitalización de la prestación por desempleo en pago único y subvención de cuotas.','Personas desempleadas inscritas como demandantes de empleo, mayores de 18 años, que vayan a iniciar actividad como trabajador autónomo.',15000,3000,100,'2025-12-31',ARRAY['Todos'],ARRAY['Nacional'],ARRAY['autonomo'],'Fomento Autoempleo','https://www.sepe.es/autoempleo',array_fill(0::float8, ARRAY[1536])::vector(1536)),
('BDNS','ICEX Next — Internacionalización de PYMEs 2025','ICEX España Exportación e Inversiones','Programa de cofinanciación y asesoramiento para que PYMEs españolas desarrollen planes de internacionalización, participen en ferias y certámenes internacionales y consoliden presencia exterior.','PYMEs con sede fiscal en España. Facturación mínima 250.000 €. Plan de internacionalización justificado y capacidad exportadora demostrable.',25000,3000,50,'2025-09-15',ARRAY['Todos'],ARRAY['Nacional'],ARRAY['pyme'],'ICEX Next','https://www.icex.es/icex-next',array_fill(0::float8, ARRAY[1536])::vector(1536));