const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://frkubiivuwaptgdwiweq.supabase.co';
const supabaseKey = 'sb_publishable_e40mWvVPMn78G9ngJZUSFA_aTPK_CKh';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log("Testing connection...");
  const { data, error } = await supabase.from('users').select('*').limit(1);
  if (error) {
    console.error("Connection failed:", error.message);
  } else {
    console.log("Connection successful! Data:", data);
  }
}

testConnection();
