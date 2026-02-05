/**
 * Seed Test Data
 * FinHealth Squad
 *
 * Populates Supabase with sample data for testing
 *
 * Run:
 *   npx ts-node examples/seed-test-data.ts
 */

import { config } from 'dotenv';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

config({ path: path.join(__dirname, '..', '.env') });

// Create untyped client for seeding
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY!
);

// Sample health insurers
const HEALTH_INSURERS = [
  {
    ans_code: '005711',
    name: 'Unimed São Paulo',
    cnpj: '43.202.472/0001-30',
    tiss_version: '3.05.00',
    active: true,
    config: {},
  },
  {
    ans_code: '326305',
    name: 'Bradesco Saúde',
    cnpj: '92.693.118/0001-60',
    tiss_version: '3.05.00',
    active: true,
    config: {},
  },
  {
    ans_code: '359017',
    name: 'SulAmérica Saúde',
    cnpj: '01.685.053/0001-56',
    tiss_version: '3.05.00',
    active: true,
    config: {},
  },
  {
    ans_code: '006246',
    name: 'Amil',
    cnpj: '29.309.127/0001-79',
    tiss_version: '3.05.00',
    active: true,
    config: {},
  },
];

// Sample patients
const PATIENTS = [
  {
    external_id: 'PAT-001',
    name: 'João Carlos Silva',
    cpf: '111.222.333-44',
    birth_date: '1975-05-20',
    gender: 'M',
    phone: '(11) 99999-1111',
    email: 'joao.silva@email.com',
  },
  {
    external_id: 'PAT-002',
    name: 'Maria Aparecida Santos',
    cpf: '222.333.444-55',
    birth_date: '1982-08-15',
    gender: 'F',
    phone: '(11) 99999-2222',
    email: 'maria.santos@email.com',
  },
  {
    external_id: 'PAT-003',
    name: 'Pedro Henrique Oliveira',
    cpf: '333.444.555-66',
    birth_date: '1990-12-01',
    gender: 'M',
    phone: '(11) 99999-3333',
    email: 'pedro.oliveira@email.com',
  },
];

// Sample procedures
const SAMPLE_PROCEDURES = [
  { tuss_code: '10101012', description: 'Consulta em consultório', unit_price: 150, quantity: 1 },
  { tuss_code: '40301010', description: 'Hemograma completo', unit_price: 25, quantity: 1 },
  { tuss_code: '40302040', description: 'Glicose', unit_price: 12, quantity: 1 },
  { tuss_code: '40302105', description: 'Ureia', unit_price: 15, quantity: 1 },
  { tuss_code: '40302113', description: 'Creatinina', unit_price: 15, quantity: 1 },
];

async function seedData() {
  console.log('═'.repeat(60));
  console.log('  FinHealth Squad - Seed Test Data');
  console.log('═'.repeat(60));

  // 1. Seed health insurers
  console.log('\n📦 Seeding health insurers...');

  for (const insurer of HEALTH_INSURERS) {
    const { data: existing } = await supabase
      .from('health_insurers')
      .select('id')
      .eq('ans_code', insurer.ans_code)
      .single();

    if (!existing) {
      const { error } = await supabase.from('health_insurers').insert(insurer);
      if (error) {
        console.error(`  ❌ Error creating ${insurer.name}:`, error.message);
      } else {
        console.log(`  ✓ Created: ${insurer.name} (${insurer.ans_code})`);
      }
    } else {
      console.log(`  - Exists: ${insurer.name}`);
    }
  }

  // Get insurer IDs
  const { data: insurers } = await supabase
    .from('health_insurers')
    .select('id, ans_code');

  // 2. Seed patients
  console.log('\n👥 Seeding patients...');

  for (const patient of PATIENTS) {
    const { data: existing } = await supabase
      .from('patients')
      .select('id')
      .eq('external_id', patient.external_id)
      .single();

    if (!existing) {
      const insurerId = insurers?.[Math.floor(Math.random() * (insurers?.length || 1))]?.id;

      const { error } = await supabase.from('patients').insert({
        ...patient,
        health_insurance_id: insurerId,
      });

      if (error) {
        console.error(`  ❌ Error creating ${patient.name}:`, error.message);
      } else {
        console.log(`  ✓ Created: ${patient.name}`);
      }
    } else {
      console.log(`  - Exists: ${patient.name}`);
    }
  }

  // Get patient IDs
  const { data: patients } = await supabase.from('patients').select('id, external_id');

  // 3. Seed medical accounts
  console.log('\n📋 Seeding medical accounts...');

  const accountTypes = ['ambulatorial', 'sadt', 'internacao'];
  const statuses = ['pending', 'validated', 'sent'];

  for (let i = 0; i < 5; i++) {
    const patient = patients?.[i % (patients?.length || 1)];
    const insurerId = insurers?.[i % (insurers?.length || 1)]?.id;
    const accountNumber = `ACC-SEED-${String(i + 1).padStart(4, '0')}`;

    const { data: existing } = await supabase
      .from('medical_accounts')
      .select('id')
      .eq('account_number', accountNumber)
      .single();

    if (existing) {
      console.log(`  - Exists: ${accountNumber}`);
      continue;
    }

    const totalAmount = SAMPLE_PROCEDURES.reduce(
      (sum, p) => sum + p.unit_price * p.quantity,
      0
    );

    // Create account
    const { data: account, error } = await supabase
      .from('medical_accounts')
      .insert({
        account_number: accountNumber,
        patient_id: patient?.id,
        health_insurer_id: insurerId,
        account_type: accountTypes[i % accountTypes.length],
        status: statuses[i % statuses.length],
        total_amount: totalAmount,
        approved_amount: 0,
        glosa_amount: 0,
        paid_amount: 0,
        metadata: { seeded: true },
      })
      .select('id')
      .single();

    if (error) {
      console.error(`  ❌ Error creating ${accountNumber}:`, error.message);
      continue;
    }

    console.log(`  ✓ Created: ${accountNumber}`);

    // Create procedures
    for (const proc of SAMPLE_PROCEDURES) {
      await supabase.from('procedures').insert({
        medical_account_id: account?.id,
        tuss_code: proc.tuss_code,
        description: proc.description,
        quantity: proc.quantity,
        unit_price: proc.unit_price,
        total_price: proc.unit_price * proc.quantity,
        performed_at: new Date().toISOString(),
        status: 'pending',
        metadata: {},
      });
    }
    console.log(`    + Added ${SAMPLE_PROCEDURES.length} procedures`);
  }

  // Summary
  const { count: insurerCount } = await supabase
    .from('health_insurers')
    .select('*', { count: 'exact', head: true });

  const { count: patientCount } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true });

  const { count: accountCount } = await supabase
    .from('medical_accounts')
    .select('*', { count: 'exact', head: true });

  const { count: procedureCount } = await supabase
    .from('procedures')
    .select('*', { count: 'exact', head: true });

  console.log('\n' + '═'.repeat(60));
  console.log('  Seed Complete!');
  console.log('═'.repeat(60));
  console.log(`\n  Health Insurers: ${insurerCount}`);
  console.log(`  Patients: ${patientCount}`);
  console.log(`  Medical Accounts: ${accountCount}`);
  console.log(`  Procedures: ${procedureCount}`);
  console.log('\n  You can now run the billing agent example:');
  console.log('    npm run example:billing');
}

seedData().catch(console.error);
