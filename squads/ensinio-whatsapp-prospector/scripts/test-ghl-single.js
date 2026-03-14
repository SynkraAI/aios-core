#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Load .env
const envFile = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envFile, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  if (line && !line.startsWith('#')) {
    const [key, value] = line.split('=');
    if (key && value) envVars[key.trim()] = value.trim();
  }
});

const GHL_API_TOKEN = envVars.GHL_API_TOKEN;
const GHL_LOCATION_ID = envVars.GHL_LOCATION_ID;
const GHL_PIPELINE_ID = envVars.GHL_PIPELINE_ID;
const GHL_DEFAULT_STAGE_ID = envVars.GHL_DEFAULT_STAGE_ID;
const GHL_BASE_URL = envVars.GHL_BASE_URL || 'https://services.leadconnectorhq.com';

// GHL API call
async function ghlApi(endpoint, method = 'GET', body = null) {
  const url = `${GHL_BASE_URL}${endpoint}`;
  console.log(`📡 ${method} ${url}`);

  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${GHL_API_TOKEN}`,
      'Version': '2021-07-28',
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
    console.log(`📦 Body: ${JSON.stringify(body, null, 2)}`);
  }

  const response = await fetch(url, options);
  const responseText = await response.text();

  console.log(`🔄 Status: ${response.status}`);
  console.log(`📨 Response: ${responseText}\n`);

  if (!response.ok) {
    throw new Error(`${response.status}: ${responseText}`);
  }

  return JSON.parse(responseText);
}

// Parse outreach-messages.md (get first prospect only)
async function parseOutreachMessagesSingle() {
  const mdFile = path.join(__dirname, '../data/outputs/mentoria-50k/outreach-messages.md');
  const content = fs.readFileSync(mdFile, 'utf-8');

  const prospects = [];
  const lines = content.split('\n');

  let i = 0;
  while (i < lines.length && prospects.length < 1) {
    const line = lines[i];

    // Match: "### N. Name (Score X)"
    const match = line.match(/^### \d+\.\s+(.+?)\s+\(Score\s+\d+\)/);
    if (match) {
      const fullName = match[1];
      i++;

      // Skip until we find Phone line
      let phone = null;
      let message = null;

      while (i < lines.length) {
        const nextLine = lines[i];

        if (nextLine.startsWith('**Phone:**')) {
          phone = nextLine.replace('**Phone:**', '').trim();
          i++;
          break;
        }
        i++;
      }

      // Skip until we find Message line
      while (i < lines.length) {
        const nextLine = lines[i];

        if (nextLine.startsWith('**Message:**')) {
          i++;
          const messageLines = [];
          while (i < lines.length && !lines[i].startsWith('**')) {
            if (lines[i].trim()) {
              messageLines.push(lines[i]);
            }
            i++;
          }
          message = messageLines.join('\n').trim();
          break;
        }
        i++;
      }

      if (fullName && phone && message) {
        // Split name into first and last
        const nameParts = fullName.trim().split(/\s+/);
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');

        prospects.push({
          name: fullName,
          phone,
          firstName,
          lastName,
          message,
        });
      }
    } else {
      i++;
    }
  }

  return prospects;
}

// Test single sync
async function testSingle() {
  console.log('\n🚀 GHL Sync TEST (Single Prospect from outreach-messages.md)\n');
  console.log('📋 Configuration:');
  console.log(`   Location: ${GHL_LOCATION_ID}`);
  console.log(`   Pipeline: ${GHL_PIPELINE_ID}`);
  console.log(`   Stage: ${GHL_DEFAULT_STAGE_ID}\n`);

  const prospects = await parseOutreachMessagesSingle();

  if (!prospects.length) {
    console.error('❌ No prospects found in outreach-messages.md');
    process.exit(1);
  }

  const prospect = prospects[0];
  console.log(`✓ Testing with prospect: ${prospect.name} (${prospect.phone})`);
  console.log(`   FirstName: "${prospect.firstName}"`);
  console.log(`   LastName: "${prospect.lastName}"\n`);

  try {
    // Step 1-2: Create or get contact
    console.log('Step 1️⃣: Create/Get contact...');
    let contactId = null;
    try {
      const createResult = await ghlApi('/contacts', 'POST', {
        locationId: GHL_LOCATION_ID,
        firstName: prospect.firstName,
        lastName: prospect.lastName,
        phone: prospect.phone,
        source: 'WhatsApp Group Prospector',
        tags: ['Lead Fosc'],
      });
      contactId = createResult.contact.id;
      console.log(`✓ Contact created: ${contactId}\n`);
    } catch (e) {
      // If duplicated, extract contactId from error response
      if (e.message.includes('400')) {
        try {
          const errorData = JSON.parse(e.message.split(': ')[1]);
          contactId = errorData.meta?.contactId;
          console.log(`ℹ️  Contact already exists: ${contactId}\n`);
        } catch {
          throw e;
        }
      } else {
        throw e;
      }
    }

    // Step 3: Create opportunity (THE TEST)
    console.log('Step 3️⃣: Create opportunity...');
    const dealResult = await ghlApi('/opportunities/', 'POST', {
      pipelineId: GHL_PIPELINE_ID,
      pipelineStageId: GHL_DEFAULT_STAGE_ID,
      locationId: GHL_LOCATION_ID,
      contactId: contactId,
      name: `${prospect.name} - Mentoria 50K`,
      source: 'WhatsApp Prospector',
      status: 'open',
      monetaryValue: 0,
    });

    console.log(`✅ SUCCESS! Opportunity created: ${dealResult.opportunity?.id || dealResult.id}\n`);

  } catch (error) {
    console.error(`\n❌ ERROR: ${error.message}\n`);
    process.exit(1);
  }
}

testSingle().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
