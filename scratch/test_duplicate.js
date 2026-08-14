import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0) {
    process.env[key.trim()] = values.join('=').trim();
  }
});

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testDuplicateSignup() {
  const existingEmail = `test_farmer_duplicate@example.com`;
  console.log(`\n--- 1. First Signup (Creates Account) ---`);
  let res = await supabase.auth.signUp({
    email: existingEmail,
    password: 'Password123!',
    options: { data: { full_name: 'Test Farmer' } }
  });
  console.log("Signup 1 error:", res.error?.message || "None (Success)");
  console.log("Signup 1 session exists:", !!res.data?.session);

  console.log(`\n--- 2. Second Signup (Duplicate) ---`);
  res = await supabase.auth.signUp({
    email: existingEmail,
    password: 'Password123!',
    options: { data: { full_name: 'Test Farmer' } }
  });
  console.log("Signup 2 error:", res.error?.message || "None (Success but obfuscated)");
  console.log("Signup 2 session exists:", !!res.data?.session);
  
  console.log(`\n--- 3. Login Attempt ---`);
  res = await supabase.auth.signInWithPassword({
    email: existingEmail,
    password: 'Password123!'
  });
  console.log("Login error:", res.error?.message || "None (Success)");
}

testDuplicateSignup();
