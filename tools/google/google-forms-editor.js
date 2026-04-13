#!/usr/bin/env node
'use strict';

/**
 * Google Forms Editor — CLI utility for reading and editing Google Forms
 *
 * Usage:
 *   node tools/google-forms-editor.js read <formId>
 *   node tools/google-forms-editor.js read <formId> --raw
 *   node tools/google-forms-editor.js update-info <formId> <json-info>
 *   node tools/google-forms-editor.js update-item <formId> <itemIndex> <json-fields>
 *   node tools/google-forms-editor.js responses <formId>
 *
 * Examples:
 *   node tools/google-forms-editor.js read 1idQxXiakp_sW1GHoPGE96QZlJ1zzHcFVzgcrSbVUaUY
 *   node tools/google-forms-editor.js update-info FORM_ID '{"title":"New Title","description":"New desc"}'
 *   node tools/google-forms-editor.js update-item FORM_ID 0 '{"title":"New question text"}'
 *
 * Credentials: reuses same OAuth from google-sheets-writer.js
 *   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN
 *   Or reads from ~/.claude.json MCP config automatically.
 */

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

// --- Credential resolution (shared with google-sheets-writer.js) ---

function getCredentials() {
  // 1. Try environment variables
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN) {
    return {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    };
  }

  // 2. Try .env files
  const envFiles = [
    path.join(process.env.HOME, 'CODE/Projects/whatsapp-prospector/.env'),
    path.join(__dirname, '../.env'),
  ];

  for (const envFile of envFiles) {
    if (fs.existsSync(envFile)) {
      const content = fs.readFileSync(envFile, 'utf-8');
      const vars = {};
      for (const line of content.split('\n')) {
        const match = line.match(/^([A-Z_]+)=(.+)$/);
        if (match) vars[match[1]] = match[2].trim();
      }
      if (vars.GOOGLE_CLIENT_ID && vars.GOOGLE_CLIENT_SECRET && vars.GOOGLE_REFRESH_TOKEN) {
        return {
          clientId: vars.GOOGLE_CLIENT_ID,
          clientSecret: vars.GOOGLE_CLIENT_SECRET,
          refreshToken: vars.GOOGLE_REFRESH_TOKEN,
        };
      }
    }
  }

  // 3. Try ~/.claude.json MCP config
  const claudeJsonPath = path.join(require('os').homedir(), '.claude.json');
  if (fs.existsSync(claudeJsonPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(claudeJsonPath, 'utf-8'));
      const locations = [
        config.mcpServers?.['google-workspace']?.env,
        ...Object.values(config.projects || {}).map(p => p.mcpServers?.['google-workspace']?.env),
      ].filter(Boolean);

      for (const env of locations) {
        const clientId = env.GOOGLE_OAUTH_CLIENT_ID || env.GOOGLE_CLIENT_ID;
        const clientSecret = env.GOOGLE_OAUTH_CLIENT_SECRET || env.GOOGLE_CLIENT_SECRET;
        const refreshToken = env.GOOGLE_OAUTH_REFRESH_TOKEN || env.GOOGLE_REFRESH_TOKEN;
        if (clientId && clientSecret && refreshToken) {
          return { clientId, clientSecret, refreshToken };
        }
      }
    } catch (e) {
      // ignore parse errors
    }
  }

  // 4. Try @presto-ai/google-workspace-mcp credentials cache
  const mcpCredDir = path.join(require('os').homedir(), '.config', 'google-workspace-mcp');
  const credFiles = ['credentials.json', 'tokens.json'];
  for (const file of credFiles) {
    const credPath = path.join(mcpCredDir, file);
    if (fs.existsSync(credPath)) {
      try {
        const creds = JSON.parse(fs.readFileSync(credPath, 'utf-8'));
        if (creds.refresh_token && creds.client_id && creds.client_secret) {
          return {
            clientId: creds.client_id,
            clientSecret: creds.client_secret,
            refreshToken: creds.refresh_token,
          };
        }
      } catch (e) {
        // ignore
      }
    }
  }

  return null;
}

function createAuth() {
  const creds = getCredentials();
  if (!creds) {
    console.error('Error: No Google credentials found.');
    console.error('Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN');
    console.error('Or configure google-workspace MCP in ~/.claude.json');
    process.exit(1);
  }

  const oauth2Client = new google.auth.OAuth2(creds.clientId, creds.clientSecret);
  oauth2Client.setCredentials({ refresh_token: creds.refreshToken });
  return oauth2Client;
}

function createFormsClient() {
  const auth = createAuth();
  return google.forms({ version: 'v1', auth });
}

// --- Formatters ---

function formatItemForDisplay(item, index) {
  const result = { index, itemId: item.itemId, title: item.title || '' };

  if (item.description) {
    result.description = item.description;
  }

  if (item.questionItem) {
    result.type = 'question';
    const q = item.questionItem.question;
    if (q.choiceQuestion) {
      result.questionType = q.choiceQuestion.type || 'RADIO';
      result.options = q.choiceQuestion.options.map(o => o.value);
    } else if (q.textQuestion) {
      result.questionType = q.textQuestion.paragraph ? 'PARAGRAPH' : 'SHORT_TEXT';
    } else if (q.scaleQuestion) {
      result.questionType = 'SCALE';
      result.scale = { low: q.scaleQuestion.low, high: q.scaleQuestion.high };
    } else if (q.dateQuestion) {
      result.questionType = 'DATE';
    } else if (q.timeQuestion) {
      result.questionType = 'TIME';
    } else if (q.fileUploadQuestion) {
      result.questionType = 'FILE_UPLOAD';
    } else {
      result.questionType = 'UNKNOWN';
    }
    if (q.required) result.required = true;
  } else if (item.pageBreakItem) {
    result.type = 'page_break';
  } else if (item.textItem) {
    result.type = 'text';
  } else if (item.imageItem) {
    result.type = 'image';
  } else if (item.videoItem) {
    result.type = 'video';
  } else {
    result.type = 'unknown';
  }

  return result;
}

// --- Commands ---

async function cmdRead(forms, formId, raw) {
  const result = await forms.forms.get({ formId });
  const form = result.data;

  if (raw) {
    console.log(JSON.stringify(form, null, 2));
    return;
  }

  const output = {
    ok: true,
    formId: form.formId,
    title: form.info?.title || '',
    description: form.info?.description || '',
    documentTitle: form.info?.documentTitle || '',
    items: (form.items || []).map((item, i) => formatItemForDisplay(item, i)),
  };

  console.log(JSON.stringify(output, null, 2));
}

async function cmdUpdateInfo(forms, formId, info) {
  const updateMask = Object.keys(info).join(',');

  const result = await forms.forms.batchUpdate({
    formId,
    requestBody: {
      requests: [{
        updateFormInfo: {
          info,
          updateMask,
        },
      }],
    },
  });

  console.log(JSON.stringify({
    ok: true,
    action: 'update-info',
    replies: result.data.replies,
  }));
}

async function cmdUpdateItem(forms, formId, itemIndex, fields) {
  // First read the form to get item details
  const formResult = await forms.forms.get({ formId });
  const items = formResult.data.items || [];

  if (itemIndex < 0 || itemIndex >= items.length) {
    console.error(JSON.stringify({
      ok: false,
      error: `Item index ${itemIndex} out of range (0-${items.length - 1})`,
    }));
    process.exit(1);
  }

  const item = items[itemIndex];
  const updatedItem = { ...item };

  if (fields.title !== undefined) updatedItem.title = fields.title;
  if (fields.description !== undefined) updatedItem.description = fields.description;

  const updateMask = Object.keys(fields).join(',');

  const result = await forms.forms.batchUpdate({
    formId,
    requestBody: {
      requests: [{
        updateItem: {
          item: updatedItem,
          location: { index: itemIndex },
          updateMask,
        },
      }],
    },
  });

  console.log(JSON.stringify({
    ok: true,
    action: 'update-item',
    itemIndex,
    replies: result.data.replies,
  }));
}

async function cmdResponses(forms, formId) {
  const result = await forms.forms.responses.list({ formId });
  const responses = result.data.responses || [];

  console.log(JSON.stringify({
    ok: true,
    action: 'responses',
    totalResponses: responses.length,
    responses: responses.map(r => ({
      responseId: r.responseId,
      createTime: r.createTime,
      lastSubmittedTime: r.lastSubmittedTime,
      answers: r.answers,
    })),
  }, null, 2));
}

// --- Programmatic API ---

async function readForm(formId) {
  const forms = createFormsClient();
  const result = await forms.forms.get({ formId });
  return result.data;
}

async function updateFormInfo(formId, info) {
  const forms = createFormsClient();
  const updateMask = Object.keys(info).join(',');
  const result = await forms.forms.batchUpdate({
    formId,
    requestBody: {
      requests: [{ updateFormInfo: { info, updateMask } }],
    },
  });
  return { ok: true, replies: result.data.replies };
}

async function batchUpdateForm(formId, requests) {
  const forms = createFormsClient();
  const result = await forms.forms.batchUpdate({
    formId,
    requestBody: { requests },
  });
  return { ok: true, replies: result.data.replies };
}

// --- Main ---

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const formId = args[1];

  if (!command || !formId) {
    console.error('Usage:');
    console.error('  google-forms-editor.js read <formId> [--raw]');
    console.error('  google-forms-editor.js update-info <formId> <json-info>');
    console.error('  google-forms-editor.js update-item <formId> <itemIndex> <json-fields>');
    console.error('  google-forms-editor.js responses <formId>');
    process.exit(1);
  }

  const forms = createFormsClient();

  try {
    switch (command) {
      case 'read': {
        const raw = args.includes('--raw');
        await cmdRead(forms, formId, raw);
        break;
      }
      case 'update-info': {
        const info = JSON.parse(args[2]);
        await cmdUpdateInfo(forms, formId, info);
        break;
      }
      case 'update-item': {
        const itemIndex = parseInt(args[2], 10);
        const fields = JSON.parse(args[3]);
        await cmdUpdateItem(forms, formId, itemIndex, fields);
        break;
      }
      case 'responses': {
        await cmdResponses(forms, formId);
        break;
      }
      default:
        console.error(`Unknown command: ${command}. Use read, update-info, update-item, or responses.`);
        process.exit(1);
    }
  } catch (error) {
    console.error(JSON.stringify({
      ok: false,
      error: error.message,
      status: error.response?.status,
      details: error.response?.data?.error?.message,
    }));
    process.exit(1);
  }
}

// Export for programmatic use
module.exports = { readForm, updateFormInfo, batchUpdateForm, createFormsClient };

// Run CLI if called directly
if (require.main === module) {
  main();
}
