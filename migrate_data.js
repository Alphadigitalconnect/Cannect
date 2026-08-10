const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Init Supabase
const supabaseUrl = 'https://frkubiivuwaptgdwiweq.supabase.co';
const supabaseKey = 'sb_publishable_e40mWvVPMn78G9ngJZUSFA_aTPK_CKh';
const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  try {
    const dbPath = path.join(__dirname, 'data', 'db.json');
    if (!fs.existsSync(dbPath)) {
      console.log('No local db.json found!');
      return;
    }
    
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    console.log(`Found ${data.users?.length || 0} users and ${data.firms?.length || 0} firms.`);

    if (data.users && data.users.length > 0) {
      for (const user of data.users) {
        // Exclude id so Supabase generates a new UUID or use existing? 
        // We will exclude id because they used 'u1', 'u2' which are not UUIDs.
        const { id, password, experience, ...userData } = user;
        
        // Wait, they used password "password123". Let's migrate that too
        userData.password = password || "password123";
        // Also map some fields if needed
        if (!userData.specialisations) userData.specialisations = [];
        
        // Find if user already exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('email', userData.email)
          .maybeSingle();
          
        let userId;
        if (!existingUser) {
          const { data: newUser, error } = await supabase
            .from('users')
            .insert([userData])
            .select()
            .single();
            
          if (error) {
            console.error('Error inserting user', userData.email, error);
          } else {
            console.log('Inserted user:', userData.email);
            userId = newUser.id;
          }
        } else {
          console.log('User already exists:', userData.email);
          userId = existingUser.id;
        }

        // Now find the firm for this user and migrate it
        if (userId && data.firms) {
          const firm = data.firms.find(f => f.userId === id);
          if (firm) {
            const { id: firmId, userId: oldUserId, experience: firmExp, ...firmData } = firm;
            firmData.userId = userId;
            firmData.firmNumber = "Migrated";
            if (!firmData.specialisations) firmData.specialisations = [];
            
            const { data: existingFirm } = await supabase
              .from('firms')
              .select('*')
              .eq('email', firmData.email)
              .maybeSingle();
              
            if (!existingFirm) {
              const { error: firmError } = await supabase
                .from('firms')
                .insert([firmData]);
              if (firmError) {
                console.error('Error inserting firm', firmData.email, firmError);
              } else {
                console.log('Inserted firm:', firmData.email);
              }
            } else {
               console.log('Firm already exists:', firmData.email);
            }
          }
        }
      }
    }
    
    console.log('Migration complete!');
  } catch(e) {
    console.error(e);
  }
}

migrate();
