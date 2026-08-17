import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0) {
    process.env[key.trim()] = values.join('=').trim();
  }
});

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const clientA = createClient(supabaseUrl, supabaseAnonKey);
const clientB = createClient(supabaseUrl, supabaseAnonKey);

async function testAuthAndRLS() {
  console.log("=== Testing Supabase Auth & RLS ===");
  const ts = Date.now();
  const emailA = `farmer_a_${ts}@test.com`;
  const emailB = `farmer_b_${ts}@test.com`;
  const password = "Password@123456";

  // 1. Sign up Farmer A
  console.log(`\n1. Signing up Farmer A (${emailA})...`);
  const { data: authA, error: errA } = await clientA.auth.signUp({
    email: emailA,
    password: password,
    options: { data: { full_name: 'Ramesh Patil' } }
  });

  if (errA) {
    console.error("❌ Farmer A signup failed:", errA.message);
    return;
  }
  console.log("✅ Farmer A signup response:", {
    userId: authA.user?.id,
    hasSession: !!authA.session,
    emailConfirmed: authA.user?.email_confirmed_at
  });

  const userAId = authA.user?.id;

  // 2. Sign up Farmer B
  console.log(`\n2. Signing up Farmer B (${emailB})...`);
  const { data: authB, error: errB } = await clientB.auth.signUp({
    email: emailB,
    password: password,
    options: { data: { full_name: 'Suresh Shinde' } }
  });

  if (errB) {
    console.error("❌ Farmer B signup failed:", errB.message);
    return;
  }
  console.log("✅ Farmer B signup response:", {
    userId: authB.user?.id,
    hasSession: !!authB.session,
    emailConfirmed: authB.user?.email_confirmed_at
  });

  const userBId = authB.user?.id;

  // 3. Test Profile creation if session exists
  if (authA.session && userAId) {
    console.log("\n3. Testing Farmer A profile insertion...");
    const { data: profA, error: profErrA } = await clientA.from('farmer_profiles').insert({
      id: userAId,
      full_name: 'Ramesh Patil',
      village: 'Baramati',
      district: 'Pune',
      state: 'Maharashtra',
      farm_size_acres: 5.5,
      soil_type: 'Black Soil'
    }).select().single();

    if (profErrA) {
      console.log("❌ Farmer A profile insert failed:", profErrA.message);
    } else {
      console.log("✅ Farmer A profile created successfully:", profA.full_name, `(${profA.id})`);
    }

    // 4. Test RLS: Farmer B tries to read Farmer A's profile
    if (authB.session && userBId) {
      console.log("\n4. Testing RLS isolation: Farmer B querying Farmer A's profile...");
      const { data: leakedData, error: rlsErr } = await clientB.from('farmer_profiles')
        .select('*')
        .eq('id', userAId);

      console.log("Farmer B query result for Farmer A's ID:", leakedData);
      if (!leakedData || leakedData.length === 0) {
        console.log("🛡️ RLS SUCCESS: Farmer B cannot read Farmer A's profile!");
      } else {
        console.log("🚨 RLS FAILED: Farmer B read Farmer A's profile!");
      }
    }
  } else {
    console.log("ℹ️ Supabase project has 'Confirm Email' enabled. Sessions are created upon email confirmation or auto-confirm.");
  }
}

testAuthAndRLS();
