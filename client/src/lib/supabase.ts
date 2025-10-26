import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Get Supabase credentials from backend config endpoint
let supabaseClient: SupabaseClient | null = null;

export async function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  try {
    const response = await fetch('/api/config');
    const config = await response.json();
    
    if (!config.supabaseUrl || !config.supabaseAnonKey) {
      console.warn('Supabase configuration not available - social login disabled');
      return null;
    }

    supabaseClient = createClient(config.supabaseUrl, config.supabaseAnonKey);
    return supabaseClient;
  } catch (error) {
    console.warn('Failed to initialize Supabase client - social login disabled:', error);
    return null;
  }
}

// For convenience, export a promise that resolves to the client
export const supabasePromise = getSupabaseClient();
