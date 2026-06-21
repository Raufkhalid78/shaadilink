const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env.local') });

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars in .env.local');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { error: colError } = await supabase
    .from('invitations')
    .select('slug')
    .limit(1);

  if (colError) {
    console.log('Column "slug" does NOT exist in table invitations. Error:', colError.message);
  } else {
    console.log('Column "slug" EXISTS in table invitations!');
  }
}

run();
