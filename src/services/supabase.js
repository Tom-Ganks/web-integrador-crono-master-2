// src/services/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseClient;

if (process.env.NODE_ENV === 'test') {
  // ambiente de teste: mock simples
  supabaseClient = {
    from: () => ({
      select: () => ({
        order: () => Promise.resolve({ data: [], error: null }),
      }),
      insert: () => Promise.resolve({ data: [], error: null }),
      update: () => Promise.resolve({ data: [], error: null }),
      delete: () => Promise.resolve({ data: [], error: null }),
    }),
  };
} else {
  // ambiente normal (dev/prod)
  supabaseClient = createClient(supabaseUrl, supabaseKey);
}

export { supabaseClient };
export default supabaseClient;
