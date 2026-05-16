import fs from 'fs'

const inputFile = 'C:/Users/magnu/Documents/BACKUP-PONTAFIRME/pontafirme_db.sql'
const outputFile = 'd:/PONTAFIRME NOVO/supabase_data_import.sql'

const content = fs.readFileSync(inputFile, 'utf8')
const lines = content.split('\n')

let sqlOutput = []
let currentTable = null

for (let line of lines) {
  line = line.trim()
  if (!line || line.startsWith('--') || line.startsWith('/*')) continue

  if (line.startsWith('INSERT INTO')) {
    // Check if it's the admins table, skip if it is
    if (line.includes('`admins`')) {
      currentTable = 'admins'
      continue
    }
    
    // Start of a new insert
    currentTable = line.match(/INSERT INTO `([^`]+)`/)[1]
    
    // Convert backticks to nothing or double quotes
    let adaptedLine = line.replace(/`/g, '')
    // Add OVERRIDING SYSTEM VALUE for PostgreSQL Identity
    adaptedLine = adaptedLine.replace(' VALUES', ' OVERRIDING SYSTEM VALUE VALUES')
    sqlOutput.push(adaptedLine)
  } else if (currentTable && currentTable !== 'admins') {
    // This might be a continuation of an insert (values)
    // We need to handle boolean conversion if it's a known table with boolean
    // But for most tables here, it's just strings and dates.
    
    let adaptedLine = line.replace(/`/g, '')
    
    // Specific fix for tinyint/boolean if any (status in admins is skipped)
    // Other tables don't seem to have booleans in the original MariaDB schema provided in banco.md
    
    sqlOutput.push(adaptedLine)
    
    if (line.endsWith(';')) {
      currentTable = null
    }
  }
}

fs.writeFileSync(outputFile, sqlOutput.join('\n'))
console.log(`Converted ${sqlOutput.length} lines to ${outputFile}`)
