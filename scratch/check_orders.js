const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1];
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1];
const supabase = createClient(url, key);

async function check() {
  const { data: orders } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5);
  console.log("Recent Orders:", JSON.stringify(orders, null, 2));
}
check();
