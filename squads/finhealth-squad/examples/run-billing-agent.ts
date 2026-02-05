/**
 * Example: Run Billing Agent
 * FinHealth Squad
 *
 * This example demonstrates how to:
 * 1. Initialize the agent runtime
 * 2. Create a test medical account in Supabase
 * 3. Execute the billing-agent to validate TISS and generate guides
 *
 * Run:
 *   npx ts-node examples/run-billing-agent.ts
 */

import { config } from 'dotenv';
import * as path from 'path';

// Load environment variables
config({ path: path.join(__dirname, '..', '.env') });

import { createClient } from '@supabase/supabase-js';
import { createRuntime } from '../src/runtime/agent-runtime';
import { BillingAgent } from '../src/agents/billing-agent';

// Create untyped Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY!
);

// Test data
const TEST_PATIENT = {
  external_id: 'PAT-TEST-001',
  name: 'Maria Silva Santos',
  cpf: '123.456.789-00',
  birth_date: '1985-03-15',
  gender: 'F',
  phone: '(11) 98765-4321',
  email: 'maria.santos@email.com',
};

const TEST_PROCEDURES = [
  {
    tuss_code: '10101012',
    description: 'Consulta em consultorio (no horario normal ou preestabelecido)',
    quantity: 1,
    unit_price: 150.0,
    total_price: 150.0,
  },
  {
    tuss_code: '40301010',
    description: 'Hemograma completo',
    quantity: 1,
    unit_price: 25.0,
    total_price: 25.0,
  },
  {
    tuss_code: '40302040',
    description: 'Glicose',
    quantity: 1,
    unit_price: 12.0,
    total_price: 12.0,
  },
  {
    tuss_code: '40302105',
    description: 'Ureia',
    quantity: 1,
    unit_price: 15.0,
    total_price: 15.0,
  },
  {
    tuss_code: '40302113',
    description: 'Creatinina',
    quantity: 1,
    unit_price: 15.0,
    total_price: 15.0,
  },
];

/**
 * Create test data in database
 */
async function createTestData() {
  console.log('\n📦 Creating test data in Supabase...\n');

  // Create or get test patient
  const { data: existingPatient } = await supabase
    .from('patients')
    .select('id')
    .eq('external_id', TEST_PATIENT.external_id)
    .single();

  let patientId: string;

  if (existingPatient) {
    patientId = existingPatient.id;
    console.log(`  ✓ Using existing patient: ${patientId}`);
  } else {
    const { data: newPatient, error } = await supabase
      .from('patients')
      .insert(TEST_PATIENT)
      .select('id')
      .single();

    if (error) throw error;
    patientId = newPatient!.id;
    console.log(`  ✓ Created patient: ${patientId}`);
  }

  // Get a health insurer
  const { data: insurers } = await supabase
    .from('health_insurers')
    .select('id')
    .limit(1);

  const insurerId = insurers?.[0]?.id;

  // Create medical account
  const accountNumber = `ACC-${Date.now()}`;
  const totalAmount = TEST_PROCEDURES.reduce((sum, p) => sum + p.total_price, 0);

  const { data: account, error: accountError } = await supabase
    .from('medical_accounts')
    .insert({
      account_number: accountNumber,
      patient_id: patientId,
      health_insurer_id: insurerId,
      account_type: 'ambulatorial',
      status: 'pending',
      total_amount: totalAmount,
      approved_amount: 0,
      glosa_amount: 0,
      paid_amount: 0,
      metadata: {
        test: true,
        created_by: 'run-billing-agent.ts',
      },
    })
    .select()
    .single();

  if (accountError) throw accountError;

  console.log(`  ✓ Created medical account: ${account.account_number}`);

  // Create procedures
  for (const proc of TEST_PROCEDURES) {
    await supabase.from('procedures').insert({
      medical_account_id: account.id,
      tuss_code: proc.tuss_code,
      description: proc.description,
      quantity: proc.quantity,
      unit_price: proc.unit_price,
      total_price: proc.total_price,
      performed_at: new Date().toISOString(),
      professional_name: 'Dr. João Silva',
      status: 'pending',
      metadata: {},
    });
  }

  console.log(`  ✓ Created ${TEST_PROCEDURES.length} procedures`);
  console.log(`  ✓ Total amount: R$ ${totalAmount.toFixed(2)}`);

  return account;
}

/**
 * Run billing agent example
 */
async function runExample() {
  console.log('═'.repeat(60));
  console.log('  FinHealth Squad - Billing Agent Example');
  console.log('═'.repeat(60));

  // Check environment
  if (!process.env.SUPABASE_URL || !process.env.OPENAI_API_KEY) {
    console.error('\n❌ Error: Missing environment variables');
    console.error('   Please configure .env with:');
    console.error('   - SUPABASE_URL');
    console.error('   - SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY');
    console.error('   - OPENAI_API_KEY');
    process.exit(1);
  }

  try {
    // Step 1: Create test data
    const account = await createTestData();

    // Step 2: Initialize runtime
    console.log('\n🚀 Initializing Agent Runtime...\n');

    const runtime = await createRuntime({
      squadPath: path.join(__dirname, '..'),
      verbose: true,
    });

    console.log(`  ✓ Loaded agents: ${runtime.listAgents().join(', ')}`);

    // Step 3: Initialize billing agent
    const billingAgent = new BillingAgent(runtime);

    // Step 4: Generate TISS guide
    console.log('\n📝 Generating TISS Guide...\n');

    const generateResult = await billingAgent.generateTissGuide({
      accountId: account.id,
      guideType: 'sadt',
    });

    if (generateResult.success) {
      console.log(`  ✓ Guide generated successfully!`);
      console.log(`    - Guide Number: ${generateResult.output.guideNumber}`);
      console.log(`    - Guide Type: ${generateResult.output.guideType}`);
      console.log(`    - Procedures: ${generateResult.output.procedureCount}`);
      console.log(`    - Total Amount: R$ ${generateResult.output.totalAmount.toFixed(2)}`);
      console.log(`    - XML Length: ${generateResult.output.xml.length} chars`);

      // Show XML preview
      console.log('\n  📄 XML Preview (first 500 chars):');
      console.log('  ' + '-'.repeat(50));
      console.log(generateResult.output.xml.substring(0, 500).split('\n').map((l: string) => '  ' + l).join('\n'));
      console.log('  ...');
    } else {
      console.error('  ❌ Generation failed:', generateResult.errors);
    }

    // Step 5: Validate TISS
    console.log('\n🔍 Validating TISS Guide...\n');

    const validateResult = await billingAgent.validateTiss({
      accountId: account.id,
      schemaVersion: '3.05.00',
    });

    if (validateResult.success) {
      const validation = validateResult.output;
      console.log(`  ✓ Validation complete!`);
      console.log(`    - Is Valid: ${validation.isValid ? '✅ Yes' : '❌ No'}`);
      console.log(`    - Procedures: ${validation.procedureCount}`);

      if (validation.errors?.length > 0) {
        console.log(`    - Errors:`);
        validation.errors.forEach((e: string) => console.log(`      ❌ ${e}`));
      }

      if (validation.warnings?.length > 0) {
        console.log(`    - Warnings:`);
        validation.warnings.forEach((w: string) => console.log(`      ⚠️  ${w}`));
      }
    } else {
      console.error('  ❌ Validation failed:', validateResult.errors);
    }

    // Step 6: Execute via runtime (alternative method)
    console.log('\n🤖 Executing AI analysis via Agent Runtime...\n');

    const runtimeResult = await runtime.executeTask({
      taskName: 'analyze-billing',
      agentId: 'billing-agent',
      parameters: {
        accountNumber: account.account_number,
        totalAmount: account.total_amount,
        procedureCount: TEST_PROCEDURES.length,
        procedures: TEST_PROCEDURES.map(p => ({
          code: p.tuss_code,
          description: p.description,
          value: p.total_price,
        })),
      },
      context: {
        schemaVersion: '3.05.00',
        insurerType: 'private',
      },
    });

    if (runtimeResult.success) {
      console.log('  ✓ AI Analysis complete!');
      console.log('\n  📊 AI Response:');
      console.log('  ' + '-'.repeat(50));

      const output = runtimeResult.output;
      if (output.analysis) {
        console.log(`  Analysis: ${output.analysis}`);
      }
      if (output.recommendations) {
        console.log(`  Recommendations: ${JSON.stringify(output.recommendations, null, 2).split('\n').map((l: string) => '  ' + l).join('\n')}`);
      }
      if (output.data) {
        console.log(`  Data: ${JSON.stringify(output.data, null, 2).substring(0, 300)}...`);
      }

      console.log('\n  Metadata:', runtimeResult.metadata);
    } else {
      console.error('  ❌ AI Analysis failed:', runtimeResult.errors);
    }

    // Summary
    console.log('\n' + '═'.repeat(60));
    console.log('  Example Complete!');
    console.log('═'.repeat(60));
    console.log(`\n  Account ID: ${account.id}`);
    console.log(`  Account Number: ${account.account_number}`);
    console.log(`\n  View in Supabase:`);
    console.log(`    https://supabase.com/dashboard/project/zzxdvmuxzzopqvxotdeb/editor`);

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the example
runExample();
