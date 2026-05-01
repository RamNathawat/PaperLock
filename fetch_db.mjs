import fs from 'fs';
const env = fs.readFileSync('.env.local', 'utf8');
const SUPABASE_URL = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1];
const SUPABASE_KEY = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1];

fetch(`${SUPABASE_URL}/rest/v1/shared_links?token=eq.c406aaea-cfac-418c-b2c3-166406b3fdc1&select=form_data`, {
  headers: {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`
  }
}).then(res => res.json()).then(data => console.log(JSON.stringify(data, null, 2)));
