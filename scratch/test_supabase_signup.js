import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env.local manually
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0) {
    process.env[key.trim()] = values.join('=').trim();
  }
});

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSignup() {
  const randomEmail = `test_farmer_${Date.now()}@example.com`;
  console.log(`Testing signup with completely NEW email: ${randomEmail}`);
  
  const { data, error } = await supabase.auth.signUp({
    email: randomEmail,
    password: 'Password123!',
    options: {
      data: {
        full_name: 'Test Farmer'
      }
    }
  });

  if (error) {
    console.error("Error returned from signUp:");
    console.error({
      message: error.message,
      name: error.name,
      status: error.status
    });
  } else {
    console.log("Signup successful!");
    console.log("data.user exists:", !!data.user);
    if (data.user) {
      console.log("user.email_confirmed_at:", data.user.email_confirmed_at);
      console.log("user.identities length:", data.user.identities?.length);
    }
    console.log("data.session exists:", !!data.session);
  }
}

testSignup();
