import { supabase } from '../lib/supabase'

/**
 * Migration script to transfer existing book data from static file to Supabase database
 * 
 * NOTE: This migration script is now disabled since the static data file has been removed.
 * The application now uses Supabase exclusively for all book data.
 * 
 * If you need to re-run migration, restore the data.ts file temporarily.
 */

// Disabled migration functions - restore data.ts if needed
export async function migrateExistingData() {
  console.log('❌ Migration disabled: data.ts file has been removed.')
  console.log('💡 To re-enable migration, restore the data.ts file and uncomment the migration functions.')
  return false
}

export async function testSupabaseConnection() {
  try {
    console.log('🔌 Testing Supabase connection...')
    const { error } = await supabase
      .from('books')
      .select('count')
      .limit(1)

    if (error) {
      console.error('❌ Connection failed:', error.message)
      return false
    }
    
    console.log('✅ Supabase connection successful!')
    return true
  } catch (error) {
    console.error('❌ Connection failed:', error)
    return false
  }
}
