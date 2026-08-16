const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://frkubiivuwaptgdwiweq.supabase.co';
const supabaseKey = 'sb_publishable_e40mWvVPMn78G9ngJZUSFA_aTPK_CKh';
const supabase = createClient(supabaseUrl, supabaseKey);

async function runHealthCheck() {
  console.log("==================================================");
  console.log(" CANNECT BACKEND & SUPABASE FULL HEALTH CHECK ");
  console.log("==================================================\n");

  const results = {
    connection: false,
    latencyMs: 0,
    tables: {},
    userPersistenceTest: false,
    issues: []
  };

  // 1. Connection & Latency
  const start = Date.now();
  try {
    const { data, error } = await supabase.from('users').select('id').limit(1);
    results.latencyMs = Date.now() - start;
    if (error) {
      results.issues.push(`Connection test error: ${error.message}`);
    } else {
      results.connection = true;
      console.log(`[PASS] Supabase Connection: OK (Latency: ${results.latencyMs}ms)`);
    }
  } catch (err) {
    results.issues.push(`Connection failed: ${err.message}`);
  }

  // 2. Check all application tables
  const tablesToCheck = [
    'users',
    'firms',
    'posts',
    'messages',
    'chat_groups',
    'connections',
    'inquiries',
    'contact_requests',
    'password_reset_tokens'
  ];

  console.log("\n--- Checking Database Tables ---");
  for (const table of tablesToCheck) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .limit(1);

      if (error) {
        results.tables[table] = { status: 'ERROR', error: error.message };
        console.log(`[FAIL] Table '${table}': ERROR -> ${error.message}`);
        results.issues.push(`Table '${table}' query error: ${error.message}`);
      } else {
        const sampleKeys = data && data.length > 0 ? Object.keys(data[0]) : 'No rows yet';
        results.tables[table] = { status: 'OK', count, columns: sampleKeys };
        console.log(`[PASS] Table '${table}': OK (Rows: ${count ?? 0})`);
      }
    } catch (e) {
      results.tables[table] = { status: 'EXCEPTION', error: e.message };
      console.log(`[FAIL] Table '${table}': EXCEPTION -> ${e.message}`);
      results.issues.push(`Table '${table}' exception: ${e.message}`);
    }
  }

  // 3. Check Current Users in Database
  console.log("\n--- Inspecting Existing Users Table ---");
  const { data: users, error: userFetchError } = await supabase
    .from('users')
    .select('id, email, caName, membershipNo, firmName, role, status, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  if (userFetchError) {
    console.log(`[FAIL] Could not fetch users: ${userFetchError.message}`);
  } else {
    console.log(`Total users fetched: ${users?.length || 0}`);
    users?.forEach((u, i) => {
      console.log(`  ${i + 1}. [${u.role || 'user'}] ${u.caName || 'N/A'} (${u.email}) - Mem#: ${u.membershipNo || 'N/A'}, Status: ${u.status || 'N/A'}`);
    });
  }

  // 4. Live User Registration & Data Persistence Simulation
  console.log("\n--- Testing Real-Time User & Firm Persistence (CRUD Test) ---");
  const testEmail = `health_test_${Date.now()}@example.com`;
  const testMemNo = `TEST_${Date.now().toString().slice(-6)}`;
  
  const testUserPayload = {
    email: testEmail,
    password: "TestPasswordHash123!",
    caName: "Dr. Health Check CA",
    membershipNo: testMemNo,
    firmName: "Health Check & Associates",
    specialisations: ["Audit & Assurance", "Direct Taxation", "GST & Indirect Tax"],
    city: "Mumbai",
    state: "Maharashtra",
    yearsOfPractice: 7,
    phone: "9876543210",
    bio: "Automated end-to-end backend test profile.",
    status: "approved",
    role: "user"
  };

  try {
    // Step A: Insert User
    const { data: insertedUser, error: insertUserErr } = await supabase
      .from('users')
      .insert([testUserPayload])
      .select()
      .single();

    if (insertUserErr || !insertedUser) {
      console.log(`[FAIL] User Insert Failed: ${insertUserErr?.message}`);
      results.issues.push(`User insert test failed: ${insertUserErr?.message}`);
    } else {
      console.log(`[PASS] 1. User inserted successfully with ID: ${insertedUser.id}`);

      // Step B: Insert Firm
      const testFirmPayload = {
        userId: insertedUser.id,
        caName: testUserPayload.caName,
        membershipNo: testUserPayload.membershipNo,
        firmName: testUserPayload.firmName,
        specialisations: testUserPayload.specialisations,
        city: testUserPayload.city,
        state: testUserPayload.state,
        yearsOfPractice: testUserPayload.yearsOfPractice,
        phone: testUserPayload.phone,
        email: testUserPayload.email,
        bio: testUserPayload.bio,
        status: "approved"
      };

      const { data: insertedFirm, error: insertFirmErr } = await supabase
        .from('firms')
        .insert([testFirmPayload])
        .select()
        .single();

      if (insertFirmErr || !insertedFirm) {
        console.log(`[FAIL] Firm Insert Failed: ${insertFirmErr?.message}`);
        results.issues.push(`Firm insert test failed: ${insertFirmErr?.message}`);
      } else {
        console.log(`[PASS] 2. Associated Firm inserted successfully with ID: ${insertedFirm.id}`);

        // Step C: Verify and Fetch Back
        const { data: fetchedUser, error: fetchErr } = await supabase
          .from('users')
          .select('*, firms(*)')
          .eq('id', insertedUser.id)
          .maybeSingle();

        if (fetchErr) {
          console.log(`[FAIL] Verification Fetch Failed: ${fetchErr.message}`);
        } else {
          console.log(`[PASS] 3. Data retrieved and verified from Supabase:`);
          console.log(`       - Email saved: ${fetchedUser.email}`);
          console.log(`       - Specialisations: ${JSON.stringify(fetchedUser.specialisations)}`);
          console.log(`       - City & State: ${fetchedUser.city}, ${fetchedUser.state}`);
          console.log(`       - Linked Firm: ${fetchedUser.firms?.[0]?.firmName || 'None'}`);
          results.userPersistenceTest = true;
        }

        // Clean up test firm
        await supabase.from('firms').delete().eq('id', insertedFirm.id);
        console.log(`[CLEANUP] Test firm removed.`);
      }

      // Clean up test user
      await supabase.from('users').delete().eq('id', insertedUser.id);
      console.log(`[CLEANUP] Test user removed.`);
    }
  } catch (err) {
    console.log(`[FAIL] Exception during CRUD persistence test: ${err.message}`);
    results.issues.push(`CRUD test exception: ${err.message}`);
  }

  // Check Existing Firms
  const { data: existingFirms } = await supabase.from('firms').select('id, firmName, email, city');
  console.log(`\nExisting registered firms in database: ${existingFirms?.length || 0}`);

  console.log("\n==================================================");
  console.log(" FINAL HEALTH CHECK SUMMARY ");
  console.log("==================================================");
  console.log(`Supabase Connection: ${results.connection ? '100% HEALTHY' : 'FAILED'}`);
  console.log(`All 9 Tables Operational: ${Object.values(results.tables).every(t => t.status === 'OK') ? 'YES (100% OK)' : 'NO'}`);
  console.log(`User & Firm Persistence: ${results.userPersistenceTest ? '100% VERIFIED & WORKING' : 'FAILED'}`);
  console.log(`Total Issues Remaining: ${results.issues.length}`);
}

runHealthCheck();
