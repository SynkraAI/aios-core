import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger as honoLogger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { HTTPException } from 'hono/http-exception'

import { config } from './lib/config.js'
import { logger } from './lib/logger.js'
import { AppError } from './lib/errors.js'
import { authMiddleware } from './middleware/auth.js'

import { connectionsRouter } from './routes/connections.js'
import { webhooksRouter } from './routes/webhooks.js'
import { redirectRouter } from './routes/redirect.js'
import { linksRouter } from './routes/links.js'
import { projectsRouter } from './routes/projects.js'
import { groupsRouter } from './routes/groups.js'
import { broadcastsRouter } from './routes/broadcasts.js'
import { analyticsRouter } from './routes/analytics.js'
import { monitoredGroupsRouter } from './routes/monitored-groups.js'
import { testDataRouter } from './routes/test-data.js'
import { offersRouter } from './routes/offers.js'
import marketplaceCredentialsRouter from './routes/marketplace-credentials.js'

const app = new Hono()

// ---- Global Middleware ----
app.use(
  '*',
  cors({
    origin: (origin) => {
      // curl / server-to-server
      if (!origin) return origin

      // dev localhost / 127.0.0.1 (qualquer porta)
      if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return origin

      // prod/staging
      if (origin === config.app.url) return origin

      return origin // (em dev, pode deixar assim só pra desbloquear)
    },
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  }),
)

app.use('/api/*', honoLogger())

if (config.isDev) {
  app.use('*', prettyJSON())
}

// ---- Health Check ----
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))

// ---- Redirect Service (public, no auth) ----
app.route('/r', redirectRouter)

// ---- API Routes ----
// Apply auth middleware to protected routes
app.use('/api/v1/*', authMiddleware)

app.route('/api/v1/connections', connectionsRouter)
app.route('/api/v1/projects', projectsRouter)
app.route('/api/v1/groups', groupsRouter)
app.route('/api/v1/monitored-groups', monitoredGroupsRouter)
app.route('/api/v1/links', linksRouter)
app.route('/api/v1/broadcasts', broadcastsRouter)
app.route('/api/v1/analytics', analyticsRouter)
app.route('/api/v1/captured-offers', offersRouter)
app.route('/api/v1/marketplace-credentials', marketplaceCredentialsRouter)
app.route('/api/v1/test', testDataRouter)
app.route('/webhooks', webhooksRouter)

// ---- Global Error Handler ----
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message, code: 'HTTP_ERROR' }, err.status)
  }

  if (err instanceof AppError) {
    logger.warn('Application error', { code: err.code, message: err.message })
    return c.json(
      { error: err.message, code: err.code, details: err.details },
      err.statusCode as 400,
    )
  }

  logger.error('Unhandled error', { error: err })
  return c.json({ error: 'Internal server error', code: 'INTERNAL_ERROR' }, 500)
})

// ---- 404 ----
app.notFound((c) => c.json({ error: 'Route not found', code: 'NOT_FOUND' }, 404))

// ---- Start Server ----
serve({
  fetch: app.fetch,
  port: config.port,
}, (info) => {
  logger.info(`Zap API running on port ${info.port}`, {
    env: config.nodeEnv,
    url: `http://localhost:${info.port}`,
  })
})

export default app
