const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1];
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1];
const supabase = createClient(url, key);

async function check() {
  const { data: logs } = await supabase
    .from('affiliate_applications')
    .select('created_at, promotion_plan')
    .eq('name', 'WEBHOOK_DEBUG')
    .order('created_at', { ascending: false })
    .limit(3);
    
  console.log("Recent Webhook Logs:");
  if (logs && logs.length > 0) {
    logs.forEach(log => {
      console.log(`[${log.created_at}] Payload:\n${log.promotion_plan}\n\n`);
    });
  } else {
    console.log("No webhook logs found!");
  }
}
check();
