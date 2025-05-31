#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('🧹 Clearing Next.js cache and build files...\n')

const dirsToDelete = ['.next', 'out', '.turbo', '.vercel']

const filesToDelete = ['.eslintcache']

// Delete directories
dirsToDelete.forEach((dir) => {
  const dirPath = path.join(process.cwd(), dir)
  if (fs.existsSync(dirPath)) {
    console.log(`Deleting ${dir}...`)
    fs.rmSync(dirPath, { recursive: true, force: true })
  }
})

// Delete files
filesToDelete.forEach((file) => {
  const filePath = path.join(process.cwd(), file)
  if (fs.existsSync(filePath)) {
    console.log(`Deleting ${file}...`)
    fs.unlinkSync(filePath)
  }
})

console.log('\n✅ Cache cleared successfully!')
console.log('Run `npm install` to reinstall dependencies if needed.')
