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

console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Anon Key length:", supabaseAnonKey ? supabaseAnonKey.length : 0);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDatabase() {
  const tables = [
    'farmer_profiles',
    'farmer_crops',
    'soil_records',
    'weather_records',
    'market_prices',
    'disease_detections',
    'ai_conversations',
    'ai_messages',
    'recommendations',
    'government_schemes',
    'yield_predictions',
    'alerts'
  ];

  console.log("\nChecking database tables via anon client...\n");

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ Table [${table}]: Error ->`, error.message, `(Code: ${error.code})`);
      } else {
        console.log(`✅ Table [${table}]: Accessible! (Total rows: ${count ?? 0})`);
      }
    } catch (e) {
      console.log(`❌ Table [${table}]: Exception ->`, e.message);
    }
  }
}

checkDatabase();
