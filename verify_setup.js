#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Verifying AI Cultural Time Machine Setup...');
console.log('='.repeat(50));

// Check required files
const requiredFiles = [
  'package.json',
  'tsconfig.json',
  'next.config.js',
  'tailwind.config.ts',
  'postcss.config.js',
  'src/app/layout.tsx',
  'src/app/page.tsx',
  'src/components/EraSelector.tsx',
  'src/lib/ai/ModelLoader.tsx'
];

let allFilesExist = true;
console.log('
📁 Checking file structure:');
for (const file of requiredFiles) {
  const exists = fs.existsSync(file);
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
}

// Check package.json dependencies
console.log('
📦 Checking dependencies:');
try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = ['next', 'react', '@xenova/transformers', 'tailwindcss'];
  for (const dep of requiredDeps) {
    const hasDep = pkg.dependencies?.[dep] || pkg.devDependencies?.[dep];
    console.log(`  ${hasDep ? '✅' : '❌'} ${dep}`);
  }
} catch (err) {
  console.log('  ❌ Failed to read package.json');
}

// Check TypeScript compilation
console.log('
⚡ Checking TypeScript:');
try {
  const tscCheck = execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'pipe' }).toString();
  if (tscCheck.includes('error')) {
    console.log('  ❌ TypeScript errors found');
    console.log(tscCheck);
  } else {
    console.log('  ✅ TypeScript compilation successful');
  }
} catch (err) {
  console.log('  ⚠️ TypeScript check failed (may need npm install)');
}

// Summary
console.log('
' + '='.repeat(50));
if (allFilesExist) {
  console.log('🎉 Setup verification complete!');
  console.log('
Next steps:');
  console.log('1. Run: npm install');
  console.log('2. Run: npm run dev');
  console.log('3. Open http://localhost:3000');
} else {
  console.log('⚠️  Some files are missing. Please check above.');
}

console.log('
📚 For more info:');
console.log('   GitHub: https://github.com/shiroonigami23-ui/ai-cultural-timemachine');
console.log('   Development: cat DEVELOPMENT.md');
