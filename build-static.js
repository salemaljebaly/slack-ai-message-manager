// Script to build static export
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Read next.config.ts
const configPath = path.join(__dirname, 'next.config.ts')
let config = fs.readFileSync(configPath, 'utf8')

// Uncomment output: 'export'
config = config.replace("// output: 'export',", "output: 'export',")

// Write back
fs.writeFileSync(configPath, config)

try {
  // Run build
  execSync('npm run build', { stdio: 'inherit' })
  console.log('✅ Static build completed successfully!')
} catch (error) {
  console.error('❌ Build failed:', error.message)
  process.exit(1)
} finally {
  // Restore config
  config = config.replace("output: 'export',", "// output: 'export',")
  fs.writeFileSync(configPath, config)
}
