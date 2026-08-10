const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

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
    console.log(Found \ users and \ firms.);

    if (data.users && data.users.length > 0) {
      for (const user of data.users) {
        const { id, password, experience, ...userData } = user;
        
        userData.password = password || "password123";
        if (!userData.specialisations) userData.specialisations = [];
        
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
