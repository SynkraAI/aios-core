#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const readline = require('readline');

const TSV_FILE = path.join(__dirname, '../data/outputs/mentoria-50k/outreach-sheets-final.tsv');

// Load prospects
function loadProspects() {
  return new Promise((resolve, reject) => {
    const prospects = [];
    const rl = readline.createInterface({
      input: fs.createReadStream(TSV_FILE),
      crlfDelay: Infinity,
    });

    let lineNum = 0;
    rl.on('line', (line) => {
      lineNum++;
      if (lineNum === 1) return;
      
      const parts = line.split('\t');
      if (parts.length >= 6 && parts[1]) {
        prospects.push({
          id: prospects.length + 1,
          name: parts[0],
          phone: parts[1],
          message: parts[5],
        });
      }
    });

    rl.on('close', () => resolve(prospects));
    rl.on('error', reject);
  });
}

// Generate WhatsApp Web link
function generateWhatsAppLink(phone, message) {
  const encodedMsg = encodeURIComponent(message);
  return `https://web.whatsapp.com/send?phone=${phone}&text=${encodedMsg}`;
}

// Open URL in browser
function openUrl(url) {
  const cmd = process.platform === 'darwin' 
    ? `open "${url}"` 
    : process.platform === 'linux'
      ? `xdg-open "${url}"`
      : `start "${url}"`;
  
  exec(cmd, (err) => {
    if (err) console.error('Error opening URL:', err.message);
  });
}

// User confirmation
function getUserInput(prompt) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.toLowerCase().trim());
    });
  });
}

// Main
async function main() {
  console.log('\n🚀 WhatsApp Web Manual Sender v2\n');
  
  const prospects = await loadProspects();
  console.log(`✓ Loaded ${prospects.length} prospects from TSV\n`);
  
  // Ask for interval
  const intervalStr = await getUserInput('⏱️  Interval between messages (1-60 seconds, default 5)? ');
  const interval = parseInt(intervalStr) || 5;
  
  if (interval < 1 || interval > 60) {
    console.error('❌ Invalid interval. Use 1-60 seconds.');
    process.exit(1);
  }

  console.log(`\n📱 Opening WhatsApp Web links with ${interval}s interval...`);
  console.log('\n📋 Commands: [y]es | [s]kip (já enviado) | [q]uit\n');
  
  let successCount = 0;
  const results = [];

  for (let i = 0; i < prospects.length; i++) {
    const prospect = prospects[i];
    const link = generateWhatsAppLink(prospect.phone, prospect.message);
    
    console.log(`[${String(i + 1).padStart(2, '0')}/77] ${prospect.name.padEnd(30)}`);
    console.log(`   📱 ${prospect.phone}\n`);
    
    // Open browser
    openUrl(link);
    
    // Wait for user confirmation
    const answer = await getUserInput('   Ready? (y/s/q): ');
    
    if (answer === 'quit' || answer === 'q') {
      console.log('\n⏸️  Stopped by user.');
      break;
    }
    
    if (answer === 'skip' || answer === 's') {
      results.push({ id: prospect.id, name: prospect.name, phone: prospect.phone, status: 'skipped' });
      console.log('   ⏭️  Skipped (already sent).\n');
      continue;
    }
    
    if (answer === 'y' || answer === '') {
      results.push({ id: prospect.id, name: prospect.name, phone: prospect.phone, status: 'sent' });
      successCount++;
      console.log('   ✅ Marked as sent.\n');
      
      // Wait for interval before next
      if (i < prospects.length - 1) {
        process.stdout.write(`   ⏳ ${interval}s...`);
        for (let sec = interval; sec > 0; sec--) {
          await new Promise(r => setTimeout(r, 1000));
          process.stdout.write(` ${sec}`);
        }
        process.stdout.write('\n\n');
      }
    }
  }

  // Save results
  const resultFile = path.join(__dirname, '../data/outputs/mentoria-50k/whatsapp-manual-results.json');
  fs.writeFileSync(resultFile, JSON.stringify(results, null, 2));

  const skipped = results.filter(r => r.status === 'skipped').length;
  console.log('\n✅ Session Complete!');
  console.log(`   ✓ Sent: ${successCount}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   📁 Results: ${resultFile}\n`);
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
