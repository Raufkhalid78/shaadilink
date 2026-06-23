const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1];
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1];
const supabase = createClient(url, key);

async function main() {
  const { error } = await supabase.rpc('exec_sql', { sql: `
    CREATE TABLE IF NOT EXISTS public.webhook_logs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      payload TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `});
  
  if (error) {
    // RPC might not exist, let's just insert into a non-existent table to see error or we can create it via REST?
    console.error("RPC error:", error);
  } else {
    console.log("Table created via RPC");
  }
}
main();
