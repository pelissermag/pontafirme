import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const BACKUP_PATH = 'C:/Users/magnu/Documents/BACKUP-PONTAFIRME/uploads'
const BUCKETS = ['fotos', 'videos', 'jogadores']

async function uploadFile(bucket, filePath) {
  const fileBuffer = fs.readFileSync(filePath)
  const fileName = path.basename(filePath)
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, fileBuffer, {
      upsert: true,
      contentType: getContentType(fileName)
    })

  if (error) {
    console.error(`Error uploading ${fileName} to ${bucket}:`, error.message)
  } else {
    console.log(`Successfully uploaded ${fileName} to ${bucket}`)
  }
}

function getContentType(fileName) {
  const ext = path.extname(fileName).toLowerCase()
  if (['.jpg', '.jpeg'].includes(ext)) return 'image/jpeg'
  if (ext === '.png') return 'image/png'
  if (ext === '.webp') return 'image/webp'
  if (ext === '.mp4') return 'video/mp4'
  if (ext === '.webm') return 'video/webm'
  return 'application/octet-stream'
}

async function runMigration() {
  for (const bucket of BUCKETS) {
    const dirPath = path.join(BACKUP_PATH, bucket)
    if (!fs.existsSync(dirPath)) {
      console.log(`Directory ${dirPath} not found, skipping...`)
      continue
    }

    const files = fs.readdirSync(dirPath)
    console.log(`Found ${files.length} files in ${bucket}`)

    for (const file of files) {
      const filePath = path.join(dirPath, file)
      if (fs.lstatSync(filePath).isFile()) {
        await uploadFile(bucket, filePath)
      }
    }
  }
}

runMigration()
