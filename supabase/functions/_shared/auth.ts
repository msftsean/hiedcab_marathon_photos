/**
 * Custom JWT claims hook for user roles
 * This module handles JWT token customization for Supabase Auth
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface UserClaims {
  role: 'runner' | 'photographer' | 'admin';
  stripe_connect_status?: 'not_started' | 'pending' | 'active' | 'restricted';
}

/**
 * Get custom claims for a user based on their profile
 * These claims are added to the JWT token during auth
 */
export async function getUserClaims(userId: string): Promise<UserClaims> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('role, stripe_connect_status')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    // Default to runner role if no profile exists
    return { role: 'runner' };
  }

  return {
    role: profile.role as UserClaims['role'],
    stripe_connect_status: profile.stripe_connect_status as UserClaims['stripe_connect_status'],
  };
}

/**
 * Custom JWT hook handler
 * Called by Supabase Auth to add custom claims to JWT tokens
 */
export async function handleCustomJwtClaims(
  event: { user_id: string; claims: Record<string, unknown> }
): Promise<Record<string, unknown>> {
  const userClaims = await getUserClaims(event.user_id);

  return {
    ...event.claims,
    app_metadata: {
      ...((event.claims.app_metadata as Record<string, unknown>) || {}),
      ...userClaims,
    },
  };
}

/**
 * Verify that a user has a specific role
 */
export function hasRole(
  claims: Record<string, unknown>,
  requiredRole: 'runner' | 'photographer' | 'admin'
): boolean {
  const appMetadata = claims.app_metadata as Record<string, unknown> | undefined;
  const role = appMetadata?.role as string | undefined;

  if (requiredRole === 'admin') {
    return role === 'admin';
  }

  if (requiredRole === 'photographer') {
    return role === 'photographer' || role === 'admin';
  }

  // Everyone can access runner features
  return true;
}

/**
 * Verify that a photographer has completed Stripe Connect onboarding
 */
export function hasActiveStripeConnect(claims: Record<string, unknown>): boolean {
  const appMetadata = claims.app_metadata as Record<string, unknown> | undefined;
  return appMetadata?.stripe_connect_status === 'active';
}
