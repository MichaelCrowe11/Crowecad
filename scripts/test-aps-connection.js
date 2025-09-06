#!/usr/bin/env node

import dotenv from 'dotenv';
import { SdkManagerBuilder } from "@aps_sdk/autodesk-sdkmanager";
import { AuthenticationClient, Scopes } from "@aps_sdk/authentication";

// Load environment variables
dotenv.config();

console.log('\n🔍 Testing Autodesk Platform Services Connection...\n');

async function testConnection() {
  try {
    // Check if credentials are set
    const clientId = process.env.APS_CLIENT_ID;
    const clientSecret = process.env.APS_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      throw new Error('Missing APS credentials in .env file');
    }
    
    console.log('✅ Credentials found in .env');
    console.log(`   Client ID: ${clientId.substring(0, 10)}...${clientId.substring(clientId.length - 4)}`);
    console.log(`   Client Secret: ${clientSecret.substring(0, 10)}...****\n`);
    
    // Initialize SDK
    console.log('🔧 Initializing APS SDK...');
    const sdkManager = SdkManagerBuilder.create()
      .sdkManagerConfiguration({
        clientId: clientId,
        clientSecret: clientSecret
      })
      .build();
    
    const authClient = new AuthenticationClient(sdkManager);
    
    // Try to get a 2-legged OAuth token
    console.log('🔑 Requesting OAuth 2.0 token...\n');
    const tokenResponse = await authClient.getTwoLeggedToken(
      clientId,
      clientSecret,
      [Scopes.DataRead, Scopes.DataWrite, Scopes.BucketCreate, Scopes.BucketRead, Scopes.ViewablesRead]
    );
    
    if (tokenResponse && tokenResponse.access_token) {
      console.log('✅ SUCCESS! Connection established\n');
      console.log('📊 Token Details:');
      console.log(`   Token Type: ${tokenResponse.token_type}`);
      console.log(`   Expires In: ${tokenResponse.expires_in} seconds (${Math.round(tokenResponse.expires_in / 60)} minutes)`);
      console.log(`   Token Preview: ${tokenResponse.access_token.substring(0, 30)}...`);
      console.log(`   Scopes: data:read, data:write, bucket:create, bucket:read, viewables:read\n`);
      
      console.log('🎉 Your APS integration is ready!\n');
      console.log('📝 Next Steps:');
      console.log('1. Run: npm run dev');
      console.log('2. Visit: http://localhost:5000/aps-viewer');
      console.log('3. Upload a CAD file to test the viewer\n');
      
      console.log('📁 Supported File Formats:');
      console.log('   • AutoCAD: .dwg, .dxf');
      console.log('   • Revit: .rvt, .rfa, .rvz');
      console.log('   • Inventor: .ipt, .iam');
      console.log('   • Fusion 360: .f3d, .f3z');
      console.log('   • STEP/IGES: .step, .stp, .iges, .igs');
      console.log('   • SolidWorks: .sldprt, .sldasm');
      console.log('   • 3D Models: .obj, .stl, .fbx, .3ds');
      console.log('   • And many more!\n');
      
      process.exit(0);
    } else {
      throw new Error('Token received but invalid format');
    }
    
  } catch (error) {
    console.error('❌ Connection Test Failed\n');
    console.error('Error:', error.message);
    
    if (error.message.includes('401')) {
      console.error('\n⚠️  Authentication failed. Please check:');
      console.error('   1. Your Client ID and Client Secret are correct');
      console.error('   2. Your app is active in the APS dashboard');
      console.error('   3. The credentials are properly saved in .env');
    } else if (error.message.includes('network')) {
      console.error('\n⚠️  Network error. Please check:');
      console.error('   1. Your internet connection');
      console.error('   2. Firewall/proxy settings');
    }
    
    process.exit(1);
  }
}

// Run the test
testConnection();