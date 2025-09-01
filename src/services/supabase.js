// src/services/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xrvlludmkeytytiymzlu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhydmxsdWRta2V5dHl0aXltemx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1NTk3MDAsImV4cCI6MjA2NDEzNTcwMH0.ws26ZPPy_cKSA21ZDmtV06rZJf8ogwxhATuNSWSSiX0';

let supabaseClient;

if (process.env.NODE_ENV === 'test') {
  // ambiente de teste: client fake para impedir chamadas de rede e evitar que testes quebrem
  supabaseClient = {
    from: (table) => {
      return {
        // select(...).order(...) -> Promise.resolve({ data: [...], error: null })
        select: (selectClause) => ({
          order: (col, opts) => Promise.resolve({ data: [], error: null }),
        }),
        // insert(...)
        insert: (payload) => Promise.resolve({ data: [], error: null }),
        // update / delete podem ser adicionados se necessário
      };
    },
  };
} else {
  // ambiente normal (dev / prod)
  supabaseClient = createClient(supabaseUrl, supabaseKey);
}

export { supabaseClient };
export default supabaseClient;
