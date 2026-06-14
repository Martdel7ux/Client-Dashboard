/**
 * Supabase Database types.
 *
 * In a live project you'd generate this with:
 *   supabase gen types typescript --project-id <id> > lib/supabase/database.types.ts
 *
 * It is hand-authored here to match supabase/schema.sql exactly so the app is
 * fully typed from day one.
 */

export type Role = "admin" | "client";

export type ProjectType =
  | "webdesign"
  | "branding"
  | "webapp"
  | "ecommerce"
  | "other";

export type ProjectStatus =
  | "onboarding"
  | "in_progress"
  | "review"
  | "completed"
  | "live";

export type ProjectStage =
  | "discovery"
  | "wireframes"
  | "design"
  | "development"
  | "review"
  | "launched";

export type ContentItemType = "image" | "text" | "url" | "file";
export type ContentItemStatus = "pending" | "uploaded" | "approved";

export type ChangeRequestStatus =
  | "submitted"
  | "reviewing"
  | "in_progress"
  | "completed"
  | "rejected";

export type InvoiceStatus = "unpaid" | "paid";

export type NotificationType =
  | "stage_advanced"
  | "file_uploaded"
  | "message"
  | "change_request"
  | "invoice"
  | "project_live";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: Role;
          avatar_url: string | null;
          last_login_at: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: Role;
          avatar_url?: string | null;
          last_login_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          client_id: string;
          title: string;
          description: string | null;
          type: ProjectType;
          status: ProjectStatus;
          stage: ProjectStage;
          progress_percent: number;
          start_date: string | null;
          estimated_end_date: string | null;
          launched_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          title: string;
          description?: string | null;
          type?: ProjectType;
          status?: ProjectStatus;
          stage?: ProjectStage;
          progress_percent?: number;
          start_date?: string | null;
          estimated_end_date?: string | null;
          launched_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["projects"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey";
            columns: ["client_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      milestones: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          description: string | null;
          order_index: number;
          completed: boolean;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          description?: string | null;
          order_index?: number;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["milestones"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "milestones_project_id_fkey";
            columns: ["project_id"];
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      content_sections: {
        Row: {
          id: string;
          project_id: string;
          section_name: string;
          description: string | null;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          section_name: string;
          description?: string | null;
          order_index?: number;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["content_sections"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "content_sections_project_id_fkey";
            columns: ["project_id"];
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      content_items: {
        Row: {
          id: string;
          section_id: string;
          project_id: string;
          type: ContentItemType;
          label: string;
          value: string | null;
          file_url: string | null;
          file_name: string | null;
          notes: string | null;
          status: ContentItemStatus;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          section_id: string;
          project_id: string;
          type?: ContentItemType;
          label: string;
          value?: string | null;
          file_url?: string | null;
          file_name?: string | null;
          notes?: string | null;
          status?: ContentItemStatus;
          order_index?: number;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["content_items"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "content_items_section_id_fkey";
            columns: ["section_id"];
            referencedRelation: "content_sections";
            referencedColumns: ["id"];
          },
        ];
      };
      change_requests: {
        Row: {
          id: string;
          project_id: string;
          client_id: string;
          title: string;
          description: string | null;
          status: ChangeRequestStatus;
          is_post_launch: boolean;
          fee_euros: number;
          invoice_status: InvoiceStatus;
          stripe_payment_intent_id: string | null;
          stripe_payment_link: string | null;
          file_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          client_id: string;
          title: string;
          description?: string | null;
          status?: ChangeRequestStatus;
          is_post_launch?: boolean;
          fee_euros?: number;
          invoice_status?: InvoiceStatus;
          stripe_payment_intent_id?: string | null;
          stripe_payment_link?: string | null;
          file_url?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["change_requests"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "change_requests_project_id_fkey";
            columns: ["project_id"];
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: {
          id: string;
          project_id: string;
          sender_id: string;
          content: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          sender_id: string;
          content: string;
          read?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["messages"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "messages_project_id_fkey";
            columns: ["project_id"];
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          project_id: string | null;
          type: NotificationType;
          message: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id?: string | null;
          type: NotificationType;
          message: string;
          read?: boolean;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["notifications"]["Insert"]
        >;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
  };
}

// Convenience row aliases
type T = Database["public"]["Tables"];
export type Profile = T["profiles"]["Row"];
export type Project = T["projects"]["Row"];
export type Milestone = T["milestones"]["Row"];
export type ContentSection = T["content_sections"]["Row"];
export type ContentItem = T["content_items"]["Row"];
export type ChangeRequest = T["change_requests"]["Row"];
export type Message = T["messages"]["Row"];
export type Notification = T["notifications"]["Row"];
