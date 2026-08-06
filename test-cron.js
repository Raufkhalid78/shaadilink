const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
(async () => {
  const secret = process.env.CRON_SECRET;
  console.log('Using secret:', secret ? secret.substring(0, 5) + '...' : 'NONE');
  try {
    const res = await fetch('https://shaadilink.com.pk/api/cron/abandoned-checkout', {
      headers: { 'Authorization': `Bearer ${secret}` }
    });
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Response:', text);
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
