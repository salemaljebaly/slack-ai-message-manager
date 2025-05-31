#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('🔧 Fixing ESLint configuration for Next.js 15...\n')

// Remove old ESLint config files
const oldConfigs = ['.eslintrc.json', 'eslint.config.js']

oldConfigs.forEach((file) => {
  const filePath = path.join(process.cwd(), file)
  if (fs.existsSync(filePath)) {
    console.log(`Removing old config: ${file}`)
    fs.unlinkSync(filePath)
  }
})

// Ensure .eslintrc.js exists
const eslintrcPath = path.join(process.cwd(), '.eslintrc.js')
if (!fs.existsSync(eslintrcPath)) {
  console.log('Creating .eslintrc.js...')
  const config = `module.exports = {
  extends: ['next/core-web-vitals', 'next/typescript'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    'react/display-name': 'off',
    'react-hooks/exhaustive-deps': 'warn',
  },
}`
  fs.writeFileSync(eslintrcPath, config)
}

console.log('\n✅ ESLint configuration fixed!')
console.log('Run `npm run clean:install` to reinstall dependencies.')
