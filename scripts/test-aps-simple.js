#!/usr/bin/env node

import dotenv from 'dotenv';
dotenv.config();

console.log('\n🔍 Testing Autodesk Platform Services Connection (Simple)...\n');

async function testConnection() {
  try {
    const clientId = process.env.APS_CLIENT_ID;
    const clientSecret = process.env.APS_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      throw new Error('Missing APS credentials in .env file');
    }
    
    console.log('✅ Credentials found:');
    console.log(`   Client ID: ${clientId.substring(0, 10)}...${clientId.substring(clientId.length - 4)}`);
    console.log(`   Client Secret: ${clientSecret.substring(0, 10)}...****\n`);
    
    // Direct API call to APS OAuth endpoint
    console.log('🔑 Requesting OAuth token from APS...\n');
    
    const response = await fetch('https://developer.api.autodesk.com/authentication/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'grant_type': 'client_credentials',
        'client_id': clientId,
        'client_secret': clientSecret,
        'scope': 'data:read data:write bucket:create bucket:read viewables:read'
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }
    
    const data = await response.json();
    
    if (data.access_token) {
      console.log('✅ SUCCESS! Connection established\n');
      console.log('📊 Token Details:');
      console.log(`   Token Type: ${data.token_type}`);
      console.log(`   Expires In: ${data.expires_in} seconds (${Math.round(data.expires_in / 60)} minutes)`);
      console.log(`   Token Preview: ${data.access_token.substring(0, 30)}...`);
      console.log(`   Scopes Granted: ${data.scope || 'default'}\n`);
      
      console.log('🎉 Your APS integration is working!\n');
      console.log('📝 Next Steps:');
      console.log('1. Run: npm run dev');
      console.log('2. Visit: http://localhost:5000/aps-viewer');
      console.log('3. Upload a CAD file to test the viewer\n');
      
      console.log('📁 Supported File Formats:');
      console.log('   • AutoCAD: .dwg, .dxf');
      console.log('   • Revit: .rvt, .rfa');
      console.log('   • Inventor: .ipt, .iam');
      console.log('   • STEP/IGES: .step, .stp, .iges, .igs');
      console.log('   • 3D Models: .obj, .stl, .fbx');
      console.log('   • And many more!\n');
    } else {
      throw new Error('No access token in response');
    }
    
  } catch (error) {
    console.error('❌ Connection Test Failed\n');
    console.error('Error:', error.message);
    
    if (error.message.includes('401')) {
      console.error('\n⚠️  Authentication failed. Please verify:');
      console.error('   1. Your Client ID and Client Secret are correct');
      console.error('   2. Your app is active at https://aps.autodesk.com');
    } else if (error.message.includes('invalid_client')) {
      console.error('\n⚠️  Invalid client credentials. Please check:');
      console.error('   1. You copied the full Client ID and Secret');
      console.error('   2. There are no extra spaces or characters');
    }
    
    process.exit(1);
  }
}

testConnection();