import { supabase } from '../lib/supabase'
import { BOOKS_DATA } from '../lib/data'

/**
 * Migration script to transfer existing book data from static file to Supabase database
 * Run this once after setting up your Supabase database
 */
export async function migrateExistingData() {
  console.log('🚀 Starting data migration to Supabase...')
  console.log(`📚 Found ${BOOKS_DATA.length} books to migrate`)
  
  let successCount = 0
  let errorCount = 0
  
  for (const book of BOOKS_DATA) {
    try {
      console.log(`📖 Migrating: ${book.title} by ${book.author}`)
      
      const { error } = await supabase
        .from('books')
        .insert({
          id: book.id,
          title: book.title,
          author: book.author,
          page_content: book.pageContent,
          cover_image_url: book.coverImageUrl,
          amazon_book_url: book.amazonBookUrl,
          submitted_by: book.submittedBy
        })

      if (error) {
        console.error(`❌ Failed to migrate book ${book.id}:`, error.message)
        errorCount++
      } else {
        console.log(`✅ Successfully migrated: ${book.title}`)
        successCount++
      }
    } catch (err) {
      console.error(`💥 Unexpected error migrating ${book.id}:`, err)
      errorCount++
    }
  }
  
  console.log(`\n📊 Migration Summary:`)
  console.log(`✅ Successful: ${successCount}`)
  console.log(`❌ Failed: ${errorCount}`)
  console.log(`📚 Total: ${BOOKS_DATA.length}`)
  
  if (errorCount === 0) {
    console.log(`🎉 All books migrated successfully!`)
  } else {
    console.log(`⚠️  Some books failed to migrate. Check errors above.`)
  }
}

/**
 * Test connection to Supabase
 */
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
  } catch (err) {
    console.error('💥 Connection test failed:', err)
    return false
  }
}
