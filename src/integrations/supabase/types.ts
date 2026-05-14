export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      borradores: {
        Row: {
          alertas_cumplimiento: Json | null
          convocatoria_id: string | null
          created_at: string | null
          estado: string | null
          id: string
          org_id: string | null
          secciones: Json | null
          secciones_completadas: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          alertas_cumplimiento?: Json | null
          convocatoria_id?: string | null
          created_at?: string | null
          estado?: string | null
          id?: string
          org_id?: string | null
          secciones?: Json | null
          secciones_completadas?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          alertas_cumplimiento?: Json | null
          convocatoria_id?: string | null
          created_at?: string | null
          estado?: string | null
          id?: string
          org_id?: string | null
          secciones?: Json | null
          secciones_completadas?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "borradores_convocatoria_id_fkey"
            columns: ["convocatoria_id"]
            isOneToOne: false
            referencedRelation: "convocatorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "borradores_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          activo: boolean | null
          created_at: string | null
          email_cliente: string | null
          gestor_user_id: string
          id: string
          nif_cliente: string | null
          nombre_cliente: string
          notas_internas: string | null
          org_id: string | null
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          email_cliente?: string | null
          gestor_user_id: string
          id?: string
          nif_cliente?: string | null
          nombre_cliente: string
          notas_internas?: string | null
          org_id?: string | null
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          email_cliente?: string | null
          gestor_user_id?: string
          id?: string
          nif_cliente?: string | null
          nombre_cliente?: string
          notas_internas?: string | null
          org_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      coincidencias: {
        Row: {
          convocatoria_id: string | null
          created_at: string | null
          id: string
          motivos: string[] | null
          org_id: string | null
          puntuacion: number
        }
        Insert: {
          convocatoria_id?: string | null
          created_at?: string | null
          id?: string
          motivos?: string[] | null
          org_id?: string | null
          puntuacion: number
        }
        Update: {
          convocatoria_id?: string | null
          created_at?: string | null
          id?: string
          motivos?: string[] | null
          org_id?: string | null
          puntuacion?: number
        }
        Relationships: [
          {
            foreignKeyName: "coincidencias_convocatoria_id_fkey"
            columns: ["convocatoria_id"]
            isOneToOne: false
            referencedRelation: "convocatorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coincidencias_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      convocatorias: {
        Row: {
          activa: boolean | null
          cnae_requeridos: string[] | null
          codigo_bdns: string | null
          comunidades: string[] | null
          created_at: string | null
          descripcion: string | null
          descripcion_embedding: string | null
          fecha_fin: string | null
          fecha_inicio: string | null
          fuente: string
          id: string
          importe_maximo: number | null
          importe_minimo: number | null
          organismo: string
          porcentaje_financiacion: number | null
          programa: string | null
          resumen_elegibilidad: string | null
          resumen_ia: string | null
          scraped_at: string | null
          sectores: string[] | null
          tipos_beneficiario: string[] | null
          titulo: string
          updated_at: string | null
          url_bases_reguladoras: string | null
          url_convocatoria: string | null
          url_solicitud: string | null
        }
        Insert: {
          activa?: boolean | null
          cnae_requeridos?: string[] | null
          codigo_bdns?: string | null
          comunidades?: string[] | null
          created_at?: string | null
          descripcion?: string | null
          descripcion_embedding?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          fuente: string
          id?: string
          importe_maximo?: number | null
          importe_minimo?: number | null
          organismo: string
          porcentaje_financiacion?: number | null
          programa?: string | null
          resumen_elegibilidad?: string | null
          resumen_ia?: string | null
          scraped_at?: string | null
          sectores?: string[] | null
          tipos_beneficiario?: string[] | null
          titulo: string
          updated_at?: string | null
          url_bases_reguladoras?: string | null
          url_convocatoria?: string | null
          url_solicitud?: string | null
        }
        Update: {
          activa?: boolean | null
          cnae_requeridos?: string[] | null
          codigo_bdns?: string | null
          comunidades?: string[] | null
          created_at?: string | null
          descripcion?: string | null
          descripcion_embedding?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          fuente?: string
          id?: string
          importe_maximo?: number | null
          importe_minimo?: number | null
          organismo?: string
          porcentaje_financiacion?: number | null
          programa?: string | null
          resumen_elegibilidad?: string | null
          resumen_ia?: string | null
          scraped_at?: string | null
          sectores?: string[] | null
          tipos_beneficiario?: string[] | null
          titulo?: string
          updated_at?: string | null
          url_bases_reguladoras?: string | null
          url_convocatoria?: string | null
          url_solicitud?: string | null
        }
        Relationships: []
      }
      convocatorias_guardadas: {
        Row: {
          convocatoria_id: string | null
          estado: string | null
          guardada_en: string | null
          id: string
          notas: string | null
          user_id: string | null
        }
        Insert: {
          convocatoria_id?: string | null
          estado?: string | null
          guardada_en?: string | null
          id?: string
          notas?: string | null
          user_id?: string | null
        }
        Update: {
          convocatoria_id?: string | null
          estado?: string | null
          guardada_en?: string | null
          id?: string
          notas?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "convocatorias_guardadas_convocatoria_id_fkey"
            columns: ["convocatoria_id"]
            isOneToOne: false
            referencedRelation: "convocatorias"
            referencedColumns: ["id"]
          },
        ]
      }
      organisations: {
        Row: {
          actividad_descripcion: string | null
          antiguedad_anios: number | null
          cnae: string | null
          comunidad_autonoma: string | null
          created_at: string | null
          empleados: number | null
          facturacion_rango: string | null
          id: string
          municipio: string | null
          necesidades_digitalizacion: string[] | null
          nif: string | null
          nombre: string
          perfil_completitud: number | null
          sector: string[] | null
          subsector: string | null
          subvenciones_previas: Json | null
          tipo: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actividad_descripcion?: string | null
          antiguedad_anios?: number | null
          cnae?: string | null
          comunidad_autonoma?: string | null
          created_at?: string | null
          empleados?: number | null
          facturacion_rango?: string | null
          id?: string
          municipio?: string | null
          necesidades_digitalizacion?: string[] | null
          nif?: string | null
          nombre: string
          perfil_completitud?: number | null
          sector?: string[] | null
          subsector?: string | null
          subvenciones_previas?: Json | null
          tipo: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actividad_descripcion?: string | null
          antiguedad_anios?: number | null
          cnae?: string | null
          comunidad_autonoma?: string | null
          created_at?: string | null
          empleados?: number | null
          facturacion_rango?: string | null
          id?: string
          municipio?: string | null
          necesidades_digitalizacion?: string[] | null
          nif?: string | null
          nombre?: string
          perfil_completitud?: number | null
          sector?: string[] | null
          subsector?: string | null
          subvenciones_previas?: Json | null
          tipo?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      suscripciones: {
        Row: {
          coincidencias_mes: number | null
          estado: string | null
          exportaciones_mes: number | null
          facturacion_anual: boolean | null
          id: string
          periodo_fin: string | null
          plan: string | null
          por_solicitud_ids: string[] | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_fin: string | null
          trial_inicio: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          coincidencias_mes?: number | null
          estado?: string | null
          exportaciones_mes?: number | null
          facturacion_anual?: boolean | null
          id?: string
          periodo_fin?: string | null
          plan?: string | null
          por_solicitud_ids?: string[] | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_fin?: string | null
          trial_inicio?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          coincidencias_mes?: number | null
          estado?: string | null
          exportaciones_mes?: number | null
          facturacion_anual?: boolean | null
          id?: string
          periodo_fin?: string | null
          plan?: string | null
          por_solicitud_ids?: string[] | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_fin?: string | null
          trial_inicio?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      suscripciones_alertas: {
        Row: {
          activa: boolean | null
          comunidad_filtro: string | null
          created_at: string | null
          frecuencia: string | null
          id: string
          importe_minimo: number | null
          lssi_opt_in: boolean | null
          lssi_opt_in_at: string | null
          org_id: string | null
          palabras_clave: string[] | null
          ultimo_envio: string | null
          user_id: string | null
        }
        Insert: {
          activa?: boolean | null
          comunidad_filtro?: string | null
          created_at?: string | null
          frecuencia?: string | null
          id?: string
          importe_minimo?: number | null
          lssi_opt_in?: boolean | null
          lssi_opt_in_at?: string | null
          org_id?: string | null
          palabras_clave?: string[] | null
          ultimo_envio?: string | null
          user_id?: string | null
        }
        Update: {
          activa?: boolean | null
          comunidad_filtro?: string | null
          created_at?: string | null
          frecuencia?: string | null
          id?: string
          importe_minimo?: number | null
          lssi_opt_in?: boolean | null
          lssi_opt_in_at?: string | null
          org_id?: string | null
          palabras_clave?: string[] | null
          ultimo_envio?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suscripciones_alertas_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      buscar_convocatorias: {
        Args: {
          p_comunidad?: string
          p_fuente?: string
          p_importe_min?: number
          p_limite?: number
          p_tipo_org?: string
          query_embedding: string
        }
        Returns: {
          comunidades: string[]
          fecha_fin: string
          fuente: string
          id: string
          importe_maximo: number
          organismo: string
          porcentaje_financiacion: number
          puntuacion: number
          tipos_beneficiario: string[]
          titulo: string
        }[]
      }
      calcular_completitud: { Args: { p_org_id: string }; Returns: number }
      reset_contadores_mensuales: { Args: never; Returns: undefined }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
