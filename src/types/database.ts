export const CATEGORIES = [
  "Accident",
  "Fighting",
  "Rioting",
  "Fire",
  "Robbery/Theft",
  "Flooding",
  "Medical Emergency",
  "Other",
] as const;

export type IncidentCategory = (typeof CATEGORIES)[number];

export type Incident = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  latitude: number;
  longitude: number;
  address: string | null;
  image_urls: string[];
  created_at: string;
  reporter_name: string;
};

export type IncidentInsert = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  latitude: number;
  longitude: number;
  address: string | null;
  image_urls: string[];
};

type Table<Row, Insert = Partial<Row>, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  __InternalSupabase: { PostgrestVersion: "13.0.4" };
  public: {
    Tables: {
      incidents: Table<Incident, IncidentInsert>;
      profiles: Table<
        { id: string; full_name: string; created_at: string },
        { id: string; full_name: string }
      >;
      push_tokens: Table<
        {
          id: string;
          user_id: string;
          token: string;
          device_id: string;
          created_at: string;
          updated_at: string;
        },
        { user_id: string; token: string; device_id: string }
      >;
    };
    Views: Record<string, never>;
    Functions: {
      register_push_token: {
        Args: { p_token: string; p_device_id: string };
        Returns: undefined;
      };
      unregister_push_token: {
        Args: { p_device_id: string };
        Returns: undefined;
      };
    };
    Enums: { incident_category: IncidentCategory };
    CompositeTypes: Record<string, never>;
  };
};
