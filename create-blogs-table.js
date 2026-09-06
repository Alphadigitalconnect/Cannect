const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://frkubiivuwaptgdwiweq.supabase.co';
const supabaseKey = 'sb_publishable_e40mWvVPMn78G9ngJZUSFA_aTPK_CKh';
const supabase = createClient(supabaseUrl, supabaseKey);

async function createBlogsTable() {
  console.log("Attempting to check if blogs table exists...");
  
  const { data: existing, error: checkErr } = await supabase.from('blogs').select('*').limit(1);
  
  if (!checkErr) {
    console.log("✅ blogs table already exists!");
    return;
  }
  
  console.log("Table doesn't exist yet. Error:", checkErr.message);
  console.log("\n⚠️  You need to create the table manually in Supabase Dashboard.");
  console.log("Go to: https://supabase.com/dashboard/project/frkubiivuwaptgdwiweq/sql/new");
  console.log("\nPaste and run this SQL:\n");
  console.log(`
CREATE TABLE IF NOT EXISTS blogs (
  id text PRIMARY KEY,
  "userId" text NOT NULL,
  "authorName" text,
  "authorFirmName" text,
  "authorAvatarUrl" text,
  title text NOT NULL,
  content text NOT NULL,
  tags jsonb DEFAULT '[]'::jsonb,
  timestamp timestamptz DEFAULT now()
);

ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON blogs FOR SELECT USING (true);
CREATE POLICY "Allow insert" ON blogs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow delete" ON blogs FOR DELETE USING (true);
  `);
}

createBlogsTable();
