import { migrateExistingData, testSupabaseConnection } from './src/utils/migrateData.js';

console.log('🚀 Starting Supabase Migration...\n');

// Test connection first
console.log('1️⃣ Testing Supabase connection...');
const connectionOk = await testSupabaseConnection();

if (!connectionOk) {
  console.error('❌ Connection failed. Please check your environment variables.');
  process.exit(1);
}

console.log('✅ Connection successful!\n');

// Run migration
console.log('2️⃣ Starting data migration...');
await migrateExistingData();

console.log('\n🎉 Migration process completed!');
console.log('Visit http://localhost:5173/admin to verify the migration.');
