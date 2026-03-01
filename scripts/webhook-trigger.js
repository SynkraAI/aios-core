#!/usr/bin/env node

/**
 * Event-Driven CI/CD Webhook Trigger
 *
 * HTTP server that receives GitHub Webhook payloads and triggers
 * autonomous Claude Code debug sessions on build/test failures.
 * Reads trigger mappings from scripts/trigger-config.yaml.
 *
 * Usage:
 *   node scripts/webhook-trigger.js
 *   WEBHOOK_SECRET=mysecret node scripts/webhook-trigger.js
 */

const { createServer } = require('node:http')
const { createHmac, timingSafeEqual } = require('node:crypto')
const { readFileSync, mkdirSync, appendFileSync } = require('node:fs')
const { resolve, dirname } = require('node:path')
const { execFile } = require('node:child_process')

const ROOT = resolve(__dirname, '..')

// ---------------------------------------------------------------------------
// Config loader — lightweight YAML parse for known structure
// ---------------------------------------------------------------------------

function loadConfig() {
  const configPath = resolve(__dirname, 'trigger-config.yaml')
  const raw = readFileSync(configPath, 'utf-8')

  const config = { triggers: {}, server: {}, logging: {} }

  // Server section
  const portMatch = raw.match(/^\s+port:\s*(\d+)/m)
  const hostMatch = raw.match(/^\s+host:\s*"([^"]+)"/m)
  const secretEnvMatch = raw.match(/^\s+secret_env:\s*"([^"]+)"/m)

  config.server.port = portMatch ? parseInt(portMatch[1], 10) : 3000
  config.server.host = hostMatch ? hostMatch[1] : '127.0.0.1'
  config.server.secretEnv = secretEnvMatch ? secretEnvMatch[1] : 'WEBHOOK_SECRET'

  // Logging
  const logFileMatch = raw.match(/^\s+file:\s*"([^"]+)"/m)
  config.logging.logFile = logFileMatch ? resolve(ROOT, logFileMatch[1]) : null

  // Parse trigger blocks
  const triggerSection = raw.match(/^triggers:\s*\n([\s\S]*?)(?=\n(?:server|logging):)/m)
  if (triggerSection) {
    const blocks = triggerSection[1].split(/\n  (?=\w+:)/)
    for (const block of blocks) {
      const nameMatch = block.match(/^(\w+):/)
      if (!nameMatch) continue
      const name = nameMatch[1]

      const events = [...block.matchAll(/-\s*"([^"]+)"/g)].map((m) => m[1])
      const condMatch = block.match(/condition:\s*"([^"]+)"/)
      const timeoutMatch = block.match(/timeout_ms:\s*(\d+)/)
      const retriesMatch = block.match(/max_retries:\s*(\d+)/)
      const cmdMatch = block.match(/command:\s*>\s*\n([\s\S]*?)(?=\n\s{4}\w+:|$)/)

      if (events.length === 0) continue

      config.triggers[name] = {
        events,
        condition: condMatch ? condMatch[1] : null,
        command: cmdMatch ? cmdMatch[1].replace(/\n\s+/g, ' ').trim() : null,
        timeout_ms: timeoutMatch ? parseInt(timeoutMatch[1], 10) : 120000,
        max_retries: retriesMatch ? parseInt(retriesMatch[1], 10) : 0,
      }
    }
  }

  return config
}

// ---------------------------------------------------------------------------
// Logger
// ---------------------------------------------------------------------------

function createLogger(config) {
  if (config.logging.logFile) {
    mkdirSync(dirname(config.logging.logFile), { recursive: true })
  }

  function log(level, msg, data) {
    const line = `[${new Date().toISOString()}] ${level} ${msg}${data ? ' ' + JSON.stringify(data) : ''}`
    if (level === 'ERROR') {
      console.error(line)
    } else {
      console.log(line)
    }
    if (config.logging.logFile) {
      appendFileSync(config.logging.logFile, line + '\n')
    }
  }

  return {
    info: (msg, data) => log('INFO ', msg, data),
    error: (msg, data) => log('ERROR', msg, data),
  }
}

// ---------------------------------------------------------------------------
// Signature verification (HMAC-SHA256)
// ---------------------------------------------------------------------------

function verifySignature(secret, payload, signature) {
  if (!secret) return true // no secret configured — skip verification
  if (!signature) return false

  const expected = 'sha256=' + createHmac('sha256', secret).update(payload).digest('hex')
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------
// Safe condition evaluator — no eval()
// ---------------------------------------------------------------------------

function evaluateCondition(condition, ctx) {
  if (!condition) return true

  // Handle OR: "a || b"
  if (condition.includes('||')) {
    return condition.split(/\s*\|\|\s*/).some((part) => evaluateCondition(part.trim(), ctx))
  }

  // Handle AND: "a && b"
  if (condition.includes('&&')) {
    return condition.split(/\s*&&\s*/).every((part) => evaluateCondition(part.trim(), ctx))
  }

  // field === 'value'
  const eqMatch = condition.match(/^(\w+)\s*===\s*'([^']*)'$/)
  if (eqMatch) {
    return String(ctx[eqMatch[1]] || '') === eqMatch[2]
  }

  // field.includes('value')
  const incMatch = condition.match(/^(\w+)\.includes\('([^']*)'\)$/)
  if (incMatch) {
    return String(ctx[incMatch[1]] || '').includes(incMatch[2])
  }

  return true
}

// ---------------------------------------------------------------------------
// Template interpolation — sanitized
// ---------------------------------------------------------------------------

function interpolateCommand(command, ctx) {
  if (!command) return ''
  return command.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = ctx[key]
    if (val == null) return ''
    return String(val).replace(/["`$\\]/g, '')
  })
}

// ---------------------------------------------------------------------------
// Command executor — uses execFile for shell safety
// ---------------------------------------------------------------------------

function executeCommand(command, timeout, logger) {
  return new Promise((resolve) => {
    logger.info(`Executing: ${command}`)

    // Split into binary + args respecting quoted strings
    const parts = command.match(/(?:[^\s"]+|"[^"]*")+/g) || []
    const bin = parts.shift()
    const args = parts.map((a) => a.replace(/^"|"$/g, ''))

    execFile(bin, args, { timeout, cwd: ROOT }, (error, stdout, stderr) => {
      if (error) {
        logger.error(`Command failed: ${error.message}`, { stderr: (stderr || '').slice(0, 500) })
        resolve({ success: false, error: error.message })
      } else {
        logger.info('Command succeeded', { stdout: (stdout || '').slice(0, 200) })
        resolve({ success: true, stdout })
      }
    })
  })
}

// ---------------------------------------------------------------------------
// Request handler
// ---------------------------------------------------------------------------

function createHandler(config, logger) {
  const secret = process.env[config.server.secretEnv] || ''

  return async (req, res) => {
    // Health check
    if (req.method === 'GET' && req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ status: 'ok', triggers: Object.keys(config.triggers) }))
      return
    }

    // Only POST /webhook
    if (req.method !== 'POST' || req.url !== '/webhook') {
      res.writeHead(404)
      res.end('Not found')
      return
    }

    // Read body
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    const body = Buffer.concat(chunks)

    // Verify HMAC signature
    const sig = req.headers['x-hub-signature-256']
    if (!verifySignature(secret, body, sig)) {
      logger.error('Invalid webhook signature')
      res.writeHead(401)
      res.end('Unauthorized')
      return
    }

    // Parse JSON payload
    let payload
    try {
      payload = JSON.parse(body.toString())
    } catch {
      res.writeHead(400)
      res.end('Invalid JSON')
      return
    }

    const eventHeader = req.headers['x-github-event'] || ''
    const action = payload.action || ''
    const eventKey = action ? `${eventHeader}.${action}` : eventHeader

    logger.info(`Received webhook: ${eventKey}`)

    // Flatten payload into context for condition evaluation
    const ctx = {
      status: payload.check_suite?.conclusion || payload.workflow_run?.conclusion || payload.status || '',
      conclusion: payload.check_run?.conclusion || payload.check_suite?.conclusion || '',
      name: payload.check_run?.name || payload.workflow_run?.name || '',
      ref: payload.ref || '',
      action,
      pr_number: String(payload.pull_request?.number || payload.number || ''),
      pr_title: payload.pull_request?.title || '',
      check_name: payload.check_run?.name || '',
    }

    // Match triggers
    const matched = []
    for (const [triggerName, trigger] of Object.entries(config.triggers)) {
      const eventMatches = trigger.events.some((e) => e === eventKey || e === eventHeader)
      if (!eventMatches) continue
      if (trigger.condition && !evaluateCondition(trigger.condition, ctx)) continue
      matched.push({ name: triggerName, ...trigger })
    }

    if (matched.length === 0) {
      logger.info('No triggers matched', { event: eventKey })
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ status: 'no_match', event: eventKey }))
      return
    }

    // Execute matched triggers (respond immediately, run async)
    res.writeHead(202, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'triggered', triggers: matched.map((t) => t.name) }))

    for (const trigger of matched) {
      const cmd = interpolateCommand(trigger.command, ctx)
      const result = await executeCommand(cmd, trigger.timeout_ms, logger)

      if (!result.success && trigger.max_retries > 0) {
        logger.info(`Retrying trigger: ${trigger.name}`)
        await executeCommand(cmd, trigger.timeout_ms, logger)
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Main — start server
// ---------------------------------------------------------------------------

if (require.main === module) {
  const config = loadConfig()
  const logger = createLogger(config)
  const handler = createHandler(config, logger)
  const server = createServer(handler)

  server.listen(config.server.port, config.server.host, () => {
    logger.info(`Webhook trigger server listening on ${config.server.host}:${config.server.port}`)
    logger.info(`Registered triggers: ${Object.keys(config.triggers).join(', ')}`)
  })
}

module.exports = { loadConfig, verifySignature, evaluateCondition, interpolateCommand }
