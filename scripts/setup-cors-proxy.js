#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🔧 Setting up CORS proxy for local development...\n')

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local')
const envExamplePath = path.join(process.cwd(), '.env.local.example')

if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
  console.log('📋 Creating .env.local from example...')
  fs.copyFileSync(envExamplePath, envPath)
  console.log('✅ .env.local created\n')
}

// Options for CORS proxy
console.log('Choose a CORS proxy solution:\n')
console.log('1. Use https://cors-anywhere.herokuapp.com/ (may have rate limits)')
console.log('2. Install and run local CORS proxy')
console.log('3. Use browser extension (recommended for development)')
console.log('4. Skip setup\n')

const readline = require('readline')
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

rl.question('Enter your choice (1-4): ', (answer) => {
  switch (answer) {
    case '1':
      setupHerokuProxy()
      break
    case '2':
      setupLocalProxy()
      break
    case '3':
      showExtensionInfo()
      break
    default:
      console.log('\n⏭️  Skipping CORS proxy setup')
      console.log('You can set it up later by running: npm run setup:cors\n')
  }
  rl.close()
})

function setupHerokuProxy() {
  console.log('\n🌐 Setting up Heroku CORS proxy...')
  console.log('⚠️  Note: This proxy has rate limits and may be slow\n')

  const envContent = fs.readFileSync(envPath, 'utf8')
  const updated = envContent.replace(
    /NEXT_PUBLIC_CORS_PROXY=.*/,
    'NEXT_PUBLIC_CORS_PROXY=https://cors-anywhere.herokuapp.com/'
  )

  fs.writeFileSync(envPath, updated)
  console.log('✅ Updated .env.local with Heroku proxy\n')
  console.log('🚀 You can now run: npm run dev\n')
}

function setupLocalProxy() {
  console.log('\n🖥️  Setting up local CORS proxy...')

  try {
    console.log('Installing cors-anywhere...')
    execSync('npm install --save-dev cors-anywhere', { stdio: 'inherit' })

    // Create proxy server file
    const proxyScript = `
const cors_proxy = require('cors-anywhere');

const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 8080;

cors_proxy.createServer({
  originWhitelist: [], // Allow all origins
  requireHeader: ['origin', 'x-requested-with'],
  removeHeaders: ['cookie', 'cookie2']
}).listen(port, host, () => {
  console.log('CORS Anywhere proxy running on ' + host + ':' + port);
});
`

    fs.writeFileSync(path.join(process.cwd(), 'cors-proxy.js'), proxyScript)

    // Update package.json
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    packageJson.scripts['proxy'] = 'node cors-proxy.js'
    packageJson.scripts['dev:proxy'] = 'concurrently "npm run proxy" "npm run dev"'
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2))

    // Update .env.local
    const envContent = fs.readFileSync(envPath, 'utf8')
    const updated = envContent.replace(
      /NEXT_PUBLIC_CORS_PROXY=.*/,
      'NEXT_PUBLIC_CORS_PROXY=http://localhost:8080/'
    )
    fs.writeFileSync(envPath, updated)

    console.log('✅ Local CORS proxy setup complete!\n')
    console.log('🚀 Run both proxy and dev server with: npm run dev:proxy\n')

    // Install concurrently if needed
    try {
      require.resolve('concurrently')
    } catch (e) {
      console.log('Installing concurrently for running multiple processes...')
      execSync('npm install --save-dev concurrently', { stdio: 'inherit' })
    }
  } catch (error) {
    console.error('❌ Failed to setup local proxy:', error.message)
    showExtensionInfo()
  }
}

function showExtensionInfo() {
  console.log('\n🔌 Browser Extension Setup (Recommended for Development)\n')
  console.log('Install one of these extensions:')
  console.log('\n📍 Chrome:')
  console.log(
    '   - CORS Unblock: https://chrome.google.com/webstore/detail/cors-unblock/lfhmikememgdcahcdlaciloancbhjino'
  )
  console.log(
    '   - Allow CORS: https://chrome.google.com/webstore/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf'
  )
  console.log('\n📍 Firefox:')
  console.log(
    '   - CORS Everywhere: https://addons.mozilla.org/en-US/firefox/addon/cors-everywhere/'
  )
  console.log('\n✅ After installing, enable the extension and run: npm run dev')
  console.log('\n⚠️  Remember to disable the extension when not developing!\n')
}
