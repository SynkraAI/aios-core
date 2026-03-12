/**
 * Generate test fixtures (ZIP files with WhatsApp chat exports)
 * Run: node generate.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

// Android BR format: DD/MM/YYYY HH:MM - Name: Message
const ANDROID_BR_CHAT = `03/12/2026 14:30 - João Silva: Olá, como vai?
03/12/2026 14:31 - Maria Santos: Tudo bem! E você?
03/12/2026 14:32 - João Silva: Tudo certo, graças a Deus
03/12/2026 15:00 - Dr. Carlos Mendes: Olá pessoal
03/12/2026 15:01 - Maria Santos: Oi Dr. Carlos!
03/12/2026 16:00 - João Silva: Você viu o projeto?
03/12/2026 16:05 - Prof. Ana Costa: Sim, achei muito bom
03/12/2026 16:10 - Maria Santos: Concordo
03/12/2026 16:15 - Dr. Carlos Mendes: Vamos marcar uma reunião
03/12/2026 16:25 - Prof. Ana Costa: Quando?
03/12/2026 16:30 - Dr. Carlos Mendes: Próxima segunda
03/12/2026 16:35 - João Silva: Tá bom
03/12/2026 16:40 - Maria Santos: Pode ser`;

// iOS BR format: [DD/MM/YYYY HH:MM:SS] Name: Message
const IOS_BR_CHAT = `[03/12/2026 14:30:45] João Silva: Olá, como vai?
[03/12/2026 14:31:12] Maria Santos: Tudo bem! E você?
[03/12/2026 14:32:33] João Silva: Tudo certo, graças a Deus
[03/12/2026 15:00:00] Dr. Carlos Mendes: Olá pessoal
[03/12/2026 15:01:15] Maria Santos: Oi Dr. Carlos!
[03/12/2026 16:00:45] João Silva: Você viu o projeto?
[03/12/2026 16:05:20] Prof. Ana Costa: Sim, achei muito bom
[03/12/2026 16:10:00] Maria Santos: Concordo
[03/12/2026 16:15:33] Dr. Carlos Mendes: Vamos marcar uma reunião
[03/12/2026 16:25:44] Prof. Ana Costa: Quando?
[03/12/2026 16:30:22] Dr. Carlos Mendes: Próxima segunda
[03/12/2026 16:35:11] João Silva: Tá bom
[03/12/2026 16:40:50] Maria Santos: Pode ser`;

const EMPTY_CHAT = '';
const CORRUPTED_DATA = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]); // JPEG header

function createZip(filename, content) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zip-'));
  const chatPath = path.join(tmpDir, '_chat.txt');
  const filepath = path.join(__dirname, filename);

  try {
    fs.writeFileSync(chatPath, content);
    execSync(`cd "${tmpDir}" && zip -q "${filepath}" _chat.txt`);
    console.log(`✅ Created ${filename}`);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

function createCorruptedZip(filename) {
  const filepath = path.join(__dirname, filename);
  fs.writeFileSync(filepath, CORRUPTED_DATA);
  console.log(`✅ Created ${filename} (corrupted)`);
}

// Main
console.log('Generating test fixtures...\n');

try {
  createZip('android-br-chat.zip', ANDROID_BR_CHAT);
  createZip('ios-br-chat.zip', IOS_BR_CHAT);
  createZip('empty-chat.zip', EMPTY_CHAT);
  createCorruptedZip('corrupted.zip');

  console.log('\n✅ All fixtures created successfully!');
  process.exit(0);
} catch (error) {
  console.error('❌ Error creating fixtures:', error.message);
  process.exit(1);
}
