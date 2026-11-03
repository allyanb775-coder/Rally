import { ReactNode } from 'react';
import { MockStoreProvider } from './MockStoreProvider';
import { supabase } from './supabase';
import { SupabaseStoreProvider } from './SupabaseStoreProvider';

/** Uses Supabase when EXPO_PUBLIC_SUPABASE_* are set, otherwise in-memory demo data. */
export function StoreProvider({ children }: { children: ReactNode }) {
  return supabase ? (
    <SupabaseStoreProvider client={supabase}>{children}</SupabaseStoreProvider>
  ) : (
    <MockStoreProvider>{children}</MockStoreProvider>
  );
}
