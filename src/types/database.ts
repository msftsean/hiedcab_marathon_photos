/**
 * Database types for Supabase
 * Generated from data-model.md schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          role: 'runner' | 'photographer';
          display_name: string | null;
          avatar_url: string | null;
          stripe_connect_id: string | null;
          stripe_connect_status: 'pending' | 'active' | 'restricted' | 'disabled' | null;
          payout_enabled: boolean;
          saved_bib_numbers: string[];
          notification_preferences: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role: 'runner' | 'photographer';
          display_name?: string | null;
          avatar_url?: string | null;
          stripe_connect_id?: string | null;
          stripe_connect_status?: 'pending' | 'active' | 'restricted' | 'disabled' | null;
          payout_enabled?: boolean;
          saved_bib_numbers?: string[];
          notification_preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: 'runner' | 'photographer';
          display_name?: string | null;
          avatar_url?: string | null;
          stripe_connect_id?: string | null;
          stripe_connect_status?: 'pending' | 'active' | 'restricted' | 'disabled' | null;
          payout_enabled?: boolean;
          saved_bib_numbers?: string[];
          notification_preferences?: Json;
          updated_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          name: string;
          date: string;
          location: string;
          description: string | null;
          cover_image_url: string | null;
          created_by: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          date: string;
          location: string;
          description?: string | null;
          cover_image_url?: string | null;
          created_by: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          date?: string;
          location?: string;
          description?: string | null;
          cover_image_url?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      photos: {
        Row: {
          id: string;
          photographer_id: string;
          event_id: string;
          original_url: string;
          watermarked_url: string;
          thumbnail_url: string;
          width: number | null;
          height: number | null;
          file_size_bytes: number | null;
          quality_score: number | null;
          ocr_status: 'pending' | 'processing' | 'completed' | 'failed' | 'manual_review';
          ocr_confidence: number | null;
          ocr_result: Json | null;
          price_cents: number;
          purchase_count: number;
          is_visible: boolean;
          uploaded_at: string;
          processed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          photographer_id: string;
          event_id: string;
          original_url: string;
          watermarked_url: string;
          thumbnail_url: string;
          width?: number | null;
          height?: number | null;
          file_size_bytes?: number | null;
          quality_score?: number | null;
          ocr_status?: 'pending' | 'processing' | 'completed' | 'failed' | 'manual_review';
          ocr_confidence?: number | null;
          ocr_result?: Json | null;
          price_cents?: number;
          purchase_count?: number;
          is_visible?: boolean;
          uploaded_at?: string;
          processed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          original_url?: string;
          watermarked_url?: string;
          thumbnail_url?: string;
          width?: number | null;
          height?: number | null;
          quality_score?: number | null;
          ocr_status?: 'pending' | 'processing' | 'completed' | 'failed' | 'manual_review';
          ocr_confidence?: number | null;
          ocr_result?: Json | null;
          price_cents?: number;
          purchase_count?: number;
          is_visible?: boolean;
          processed_at?: string | null;
          updated_at?: string;
        };
      };
      photo_bibs: {
        Row: {
          id: string;
          photo_id: string;
          bib_number: string;
          confidence: number;
          bounding_box: Json | null;
          is_verified: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          photo_id: string;
          bib_number: string;
          confidence: number;
          bounding_box?: Json | null;
          is_verified?: boolean;
          created_at?: string;
        };
        Update: {
          bib_number?: string;
          confidence?: number;
          bounding_box?: Json | null;
          is_verified?: boolean;
        };
      };
      transactions: {
        Row: {
          id: string;
          buyer_id: string | null;
          buyer_email: string;
          stripe_payment_intent_id: string;
          stripe_checkout_session_id: string | null;
          amount_cents: number;
          platform_fee_cents: number;
          photographer_amount_cents: number;
          currency: string;
          status: 'pending' | 'completed' | 'refunded' | 'disputed' | 'failed';
          refund_amount_cents: number;
          dispute_status: 'needs_response' | 'under_review' | 'won' | 'lost' | null;
          metadata: Json;
          created_at: string;
          completed_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          buyer_id?: string | null;
          buyer_email: string;
          stripe_payment_intent_id: string;
          stripe_checkout_session_id?: string | null;
          amount_cents: number;
          platform_fee_cents: number;
          photographer_amount_cents: number;
          currency?: string;
          status?: 'pending' | 'completed' | 'refunded' | 'disputed' | 'failed';
          refund_amount_cents?: number;
          dispute_status?: 'needs_response' | 'under_review' | 'won' | 'lost' | null;
          metadata?: Json;
          created_at?: string;
          completed_at?: string | null;
          updated_at?: string;
        };
        Update: {
          buyer_id?: string | null;
          status?: 'pending' | 'completed' | 'refunded' | 'disputed' | 'failed';
          refund_amount_cents?: number;
          dispute_status?: 'needs_response' | 'under_review' | 'won' | 'lost' | null;
          metadata?: Json;
          completed_at?: string | null;
          updated_at?: string;
        };
      };
      transaction_items: {
        Row: {
          id: string;
          transaction_id: string;
          photo_id: string;
          photographer_id: string;
          price_cents: number;
          photographer_amount_cents: number;
          download_url: string | null;
          download_count: number;
          download_expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          transaction_id: string;
          photo_id: string;
          photographer_id: string;
          price_cents: number;
          photographer_amount_cents: number;
          download_url?: string | null;
          download_count?: number;
          download_expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          download_url?: string | null;
          download_count?: number;
          download_expires_at?: string | null;
        };
      };
      payouts: {
        Row: {
          id: string;
          photographer_id: string;
          stripe_transfer_id: string | null;
          amount_cents: number;
          currency: string;
          status: 'pending' | 'in_transit' | 'paid' | 'failed' | 'canceled';
          failure_reason: string | null;
          period_start: string;
          period_end: string;
          transaction_count: number;
          initiated_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          photographer_id: string;
          stripe_transfer_id?: string | null;
          amount_cents: number;
          currency?: string;
          status?: 'pending' | 'in_transit' | 'paid' | 'failed' | 'canceled';
          failure_reason?: string | null;
          period_start: string;
          period_end: string;
          transaction_count: number;
          initiated_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          stripe_transfer_id?: string | null;
          status?: 'pending' | 'in_transit' | 'paid' | 'failed' | 'canceled';
          failure_reason?: string | null;
          initiated_at?: string | null;
          completed_at?: string | null;
          updated_at?: string;
        };
      };
    };
    Views: {
      v_photo_search: {
        Row: {
          bib_number: string;
          photo_id: string;
          event_id: string;
          event_name: string;
          event_date: string;
          event_location: string;
          watermarked_url: string;
          thumbnail_url: string;
          quality_score: number;
          price_cents: number;
          bib_confidence: number;
          photographer_id: string;
        };
      };
      v_photographer_dashboard: {
        Row: {
          photographer_id: string;
          display_name: string;
          total_photos: number;
          searchable_photos: number;
          photos_needing_review: number;
          total_earnings_cents: number;
          total_sales: number;
          earnings_last_30_days: number;
          sales_last_30_days: number;
        };
      };
    };
    Functions: {
      calculate_transaction_splits: {
        Args: { amount_cents: number };
        Returns: { platform_fee_cents: number; photographer_amount_cents: number };
      };
    };
  };
}
