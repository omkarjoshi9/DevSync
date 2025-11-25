import { query } from '../src/config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  try {
    console.log('Setting up database...');
    
    const schemaPath = path.join(__dirname, '..', 'database-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolons and filter out comments and empty lines
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => {
        // Remove empty lines and comments
        const cleaned = s.replace(/--.*$/gm, '').trim();
        return cleaned.length > 0 && !cleaned.startsWith('--');
      })
      .map(s => s.replace(/--.*$/gm, '').trim()) // Remove inline comments
      .filter(s => s.length > 0);
    
    // Separate CREATE TABLE and CREATE INDEX statements
    const tableStatements = [];
    const indexStatements = [];
    
    for (const statement of statements) {
      const upper = statement.toUpperCase().trim();
      if (upper.startsWith('CREATE TABLE')) {
        tableStatements.push(statement);
      } else if (upper.startsWith('CREATE INDEX')) {
        indexStatements.push(statement);
      }
    }
    
    // Execute CREATE TABLE statements first
    console.log('\nCreating tables...');
    for (const statement of tableStatements) {
      try {
        await query(statement);
        const tableName = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/i)?.[1] || 
                         statement.match(/CREATE TABLE (\w+)/i)?.[1] || 'unknown';
        console.log(`✓ Created table: ${tableName}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          const tableName = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/i)?.[1] || 
                           statement.match(/CREATE TABLE (\w+)/i)?.[1] || 'unknown';
          console.log(`- Table already exists: ${tableName}`);
        } else {
          console.error('Error creating table:', error.message);
          console.error('Statement:', statement.substring(0, 150));
          throw error;
        }
      }
    }
    
    // Then execute CREATE INDEX statements
    console.log('\nCreating indexes...');
    for (const statement of indexStatements) {
      try {
        await query(statement);
        const indexName = statement.match(/CREATE INDEX IF NOT EXISTS (\w+)/i)?.[1] || 
                        statement.match(/CREATE INDEX (\w+)/i)?.[1] || 'unknown';
        console.log(`✓ Created index: ${indexName}`);
      } catch (error) {
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          // Index already exists, that's fine
          continue;
        } else if (error.message.includes('does not exist')) {
          console.warn(`⚠ Index creation skipped (table not found): ${statement.substring(0, 80)}`);
        } else {
          console.error('Error creating index:', error.message);
          console.error('Statement:', statement.substring(0, 150));
        }
      }
    }
    
    console.log('\n✅ Database setup completed!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();

