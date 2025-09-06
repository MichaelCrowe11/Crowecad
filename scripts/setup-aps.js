#!/usr/bin/env node

import readline from 'readline';
import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

console.log('\n🚀 Autodesk Platform Services (APS) Setup\n');
console.log('This script will help you set up your APS credentials.\n');

async function setup() {
  try {
    // Step 1: Guide user to create APS app
    console.log('📋 Step 1: Create an APS Application\n');
    console.log('1. Open your browser and go to: https://aps.autodesk.com');
    console.log('2. Sign in or create an Autodesk account');
    console.log('3. Go to "My Apps" → "Create App"');
    console.log('4. Fill in:');
    console.log('   - App Name: CroweCad (or your preferred name)');
    console.log('   - Description: CAD viewer and automation platform');
    console.log('   - Callback URL: http://localhost:5000/callback (for future OAuth)');
    console.log('5. Click "Create App"\n');
    
    const ready = await question('Press Enter when you have created the app...');
    
    // Step 2: Get credentials
    console.log('\n📝 Step 2: Enter Your Credentials\n');
    console.log('Find these in your APS app dashboard:\n');
    
    const clientId = await question('Enter your Client ID: ');
    const clientSecret = await question('Enter your Client Secret: ');
    
    // Step 3: Validate format
    if (!clientId || clientId.length < 20) {
      throw new Error('Invalid Client ID format');
    }
    if (!clientSecret || clientSecret.length < 20) {
      throw new Error('Invalid Client Secret format');
    }
    
    // Step 4: Update .env file
    console.log('\n💾 Updating .env file...\n');
    
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
      
      // Update existing or append new
      if (envContent.includes('APS_CLIENT_ID=')) {
        envContent = envContent.replace(/APS_CLIENT_ID=.*/g, `APS_CLIENT_ID=${clientId}`);
      } else {
        envContent += `\nAPS_CLIENT_ID=${clientId}`;
      }
      
      if (envContent.includes('APS_CLIENT_SECRET=')) {
        envContent = envContent.replace(/APS_CLIENT_SECRET=.*/g, `APS_CLIENT_SECRET=${clientSecret}`);
      } else {
        envContent += `\nAPS_CLIENT_SECRET=${clientSecret}`;
      }
    } else {
      envContent = `# Autodesk Platform Services\nAPS_CLIENT_ID=${clientId}\nAPS_CLIENT_SECRET=${clientSecret}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Credentials saved to .env file\n');
    
    // Step 5: Test connection
    console.log('🔍 Testing APS connection...\n');
    
    const testUrl = 'http://localhost:5000/api/aps/token';
    
    try {
      // Try to get a token
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.access_token) {
          console.log('✅ Successfully connected to APS!');
          console.log(`   Token expires in: ${Math.round(data.expires_in / 60)} minutes\n`);
        } else {
          throw new Error('No access token received');
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.log('⚠️  Could not test connection (server may not be running)');
      console.log('   Run "npm run dev" and visit http://localhost:5000/api/aps/token to test\n');
    }
    
    // Step 6: Next steps
    console.log('🎉 Setup Complete!\n');
    console.log('Next steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Visit: http://localhost:5000/aps-viewer');
    console.log('3. Upload a CAD file (DWG, RVT, STEP, etc.)');
    console.log('4. View it directly in your browser!\n');
    
    console.log('Supported file formats:');
    console.log('- AutoCAD: .dwg, .dxf');
    console.log('- Revit: .rvt, .rfa');
    console.log('- Inventor: .ipt, .iam');
    console.log('- STEP/IGES: .step, .stp, .iges, .igs');
    console.log('- 3D Models: .obj, .stl, .fbx, .3ds\n');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run setup
setup();