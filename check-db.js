const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseService = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  console.log("=== Activating Invitation ===");
  const { data, error } = await supabaseService
    .from('invitations')
    .update({ is_active: true })
    .eq('id', 'e7dd0360-5cbc-4d4c-bc70-12fd8c7e5f3b')
    .select();

  console.log("Error:", error);
  console.log("Updated record:", data);
}
check();
