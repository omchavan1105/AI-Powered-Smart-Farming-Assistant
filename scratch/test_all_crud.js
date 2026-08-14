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

async function testAllTablesCRUD() {
  console.log("=== Comprehensive Table CRUD & RLS Verification ===");
  const ts = Date.now();
  const emailA = `farmer_a_${ts}@test.com`;
  const emailB = `farmer_b_${ts}@test.com`;
  const password = "Password@123456";

  // Login/Signup both users
  const { data: authA } = await clientA.auth.signUp({ email: emailA, password, options: { data: { full_name: 'Farmer A' } } });
  const { data: authB } = await clientB.auth.signUp({ email: emailB, password, options: { data: { full_name: 'Farmer B' } } });

  const uA = authA.user.id;
  const uB = authB.user.id;

  // Setup Profiles
  await clientA.from('farmer_profiles').insert({ id: uA, full_name: 'Farmer A', village: 'Pune' });
  await clientB.from('farmer_profiles').insert({ id: uB, full_name: 'Farmer B', village: 'Nashik' });

  console.log("✅ Profiles created for A and B");

  // 1. farmer_crops
  console.log("\n1. Testing farmer_crops...");
  const { data: cropA, error: cErr } = await clientA.from('farmer_crops').insert({
    farmer_id: uA,
    crop_name: 'Tomato',
    season: 'Kharif',
    status: 'active'
  }).select().single();
  console.log(cErr ? `❌ Crop insert failed: ${cErr.message}` : `✅ Crop inserted: ${cropA.crop_name}`);

  // Test RLS: Can B see A's crop?
  const { data: cropLeaked } = await clientB.from('farmer_crops').select('*').eq('id', cropA?.id);
  console.log("Crop RLS Check (B query A):", (cropLeaked && cropLeaked.length > 0) ? "🚨 LEAKED" : "🛡️ PROTECTED");

  // 2. soil_records
  console.log("\n2. Testing soil_records...");
  const { data: soilA, error: sErr } = await clientA.from('soil_records').insert({
    farmer_id: uA,
    ph_level: 6.8,
    nitrogen: 240,
    phosphorus: 45,
    potassium: 180,
    moisture_level: 42
  }).select().single();
  console.log(sErr ? `❌ Soil insert failed: ${sErr.message}` : `✅ Soil record inserted (pH: ${soilA.ph_level})`);

  const { data: soilLeaked } = await clientB.from('soil_records').select('*').eq('id', soilA?.id);
  console.log("Soil RLS Check (B query A):", (soilLeaked && soilLeaked.length > 0) ? "🚨 LEAKED" : "🛡️ PROTECTED");

  // 3. disease_detections
  console.log("\n3. Testing disease_detections...");
  const { data: diseaseA, error: dErr } = await clientA.from('disease_detections').insert({
    farmer_id: uA,
    detected_disease: 'Early Blight',
    confidence_score: 94.5,
    severity: 'Moderate',
    recommended_action: 'Apply Mancozeb'
  }).select().single();
  console.log(dErr ? `❌ Disease insert failed: ${dErr.message}` : `✅ Disease record inserted: ${diseaseA.detected_disease}`);

  const { data: diseaseLeaked } = await clientB.from('disease_detections').select('*').eq('id', diseaseA?.id);
  console.log("Disease RLS Check (B query A):", (diseaseLeaked && diseaseLeaked.length > 0) ? "🚨 LEAKED" : "🛡️ PROTECTED");

  // 4. yield_predictions
  console.log("\n4. Testing yield_predictions...");
  const { data: yieldA, error: yErr } = await clientA.from('yield_predictions').insert({
    farmer_id: uA,
    crop_id: cropA?.id,
    predicted_yield_kg: 4500,
    confidence_score: 88.0
  }).select().single();
  console.log(yErr ? `❌ Yield insert failed: ${yErr.message}` : `✅ Yield record inserted: ${yieldA.predicted_yield_kg} kg`);

  const { data: yieldLeaked } = await clientB.from('yield_predictions').select('*').eq('id', yieldA?.id);
  console.log("Yield RLS Check (B query A):", (yieldLeaked && yieldLeaked.length > 0) ? "🚨 LEAKED" : "🛡️ PROTECTED");

  // 5. alerts
  console.log("\n5. Testing alerts...");
  const { data: alertA, error: aErr } = await clientA.from('alerts').insert({
    farmer_id: uA,
    alert_type: 'weather',
    priority: 'High',
    message: 'Heavy rainfall warning in Pune'
  }).select().single();
  console.log(aErr ? `❌ Alert insert failed: ${aErr.message}` : `✅ Alert inserted: ${alertA.message}`);

  const { data: alertLeaked } = await clientB.from('alerts').select('*').eq('id', alertA?.id);
  console.log("Alert RLS Check (B query A):", (alertLeaked && alertLeaked.length > 0) ? "🚨 LEAKED" : "🛡️ PROTECTED");

  // 6. ai_conversations & messages
  console.log("\n6. Testing ai_conversations & ai_messages...");
  const { data: convA, error: convErr } = await clientA.from('ai_conversations').insert({
    farmer_id: uA,
    title: 'Tomato disease query'
  }).select().single();
  console.log(convErr ? `❌ Conv insert failed: ${convErr.message}` : `✅ Conv created: ${convA.title}`);

  const { data: msgA, error: msgErr } = await clientA.from('ai_messages').insert({
    conversation_id: convA?.id,
    role: 'user',
    content: 'How to cure tomato blight?'
  }).select().single();
  console.log(msgErr ? `❌ Msg insert failed: ${msgErr.message}` : `✅ Msg created: ${msgA.content}`);

  const { data: convLeaked } = await clientB.from('ai_conversations').select('*').eq('id', convA?.id);
  console.log("AI Conv RLS Check (B query A):", (convLeaked && convLeaked.length > 0) ? "🚨 LEAKED" : "🛡️ PROTECTED");

  const { data: msgLeaked } = await clientB.from('ai_messages').select('*').eq('id', msgA?.id);
  console.log("AI Msg RLS Check (B query A):", (msgLeaked && msgLeaked.length > 0) ? "🚨 LEAKED" : "🛡️ PROTECTED");

  console.log("\n=== All Tests Finished ===");
}

testAllTablesCRUD();
