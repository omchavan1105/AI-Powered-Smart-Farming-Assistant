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

async function testOldUnconfirmed() {
  // Let's try to query the users via an admin API if possible, or just simulate it.
  // Wait, I can't query users without a service_role key.
  
  // I will just perform a login attempt on an email they likely used, e.g. test@example.com
  const likelyEmail = "test@example.com";
  
  console.log(`\n--- Signup Attempt on likely existing email ---`);
  const res = await supabase.auth.signUp({
    email: likelyEmail,
    password: 'Password123!',
    options: { data: { full_name: 'Test Farmer' } }
  });
  console.log("Signup error:", res.error?.message || "None (Success)");
  
  console.log(`\n--- Login Attempt ---`);
  const loginRes = await supabase.auth.signInWithPassword({
    email: likelyEmail,
    password: 'Password123!'
  });
  console.log("Login error:", loginRes.error?.message || "None (Success)");
}

testOldUnconfirmed();
