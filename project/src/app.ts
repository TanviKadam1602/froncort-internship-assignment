import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { config } from './config/env.config';
import { requestLoggerMiddleware } from './middleware/request-logger.middleware';
import { globalErrorMiddleware } from './middleware/global-error.middleware';
import { ApiError } from './core/utils/api-error';
import { ApiResponse } from './core/utils/api-response';

// Domain Module Routers
import { identityRouter } from './modules/identity/identity.router';
import { ticketsRouter } from './modules/tickets/tickets.router';
import { prsRouter } from './modules/prs/prs.router';
import { crossOrgRouter } from './modules/cross-org/cross-org.router';
import { auditRouter } from './modules/audit/audit.router';
import { aiDigestRouter } from './modules/ai-digest/ai-digest.router';
import { notificationsRouter } from './modules/notifications/notifications.router';

const app: Express = express();

// 1. Helmet Security Headers
app.use(helmet());

// 2. CORS Whitelist Configuration
app.use(
  cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
  })
);

// 3. Compression Middleware
app.use(compression());

// 4. JSON & URL-Encoded Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Request Logger
app.use(requestLoggerMiddleware);

// Health Check Endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json(
    ApiResponse.success(
      {
        status: 'UP',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      },
      'System healthy'
    )
  );
});

// 6. Version 1 API Router Assembly
const apiV1Router = express.Router();

apiV1Router.get('/', (req: Request, res: Response) => {
  res.status(200).json(ApiResponse.success({ version: 'v1' }, 'Unified Workspace API v1 Base Endpoint'));
});

// Domain Routers
apiV1Router.use('/auth', identityRouter);
apiV1Router.use('/tickets', ticketsRouter);
apiV1Router.use('/prs', prsRouter);
apiV1Router.use('/cross-org', crossOrgRouter);
apiV1Router.use('/collaboration', crossOrgRouter);
apiV1Router.use('/audit-logs', auditRouter);
apiV1Router.use('/ai', aiDigestRouter);
apiV1Router.use('/notifications', notificationsRouter);

app.use('/api/v1', apiV1Router);

// 7. 404 Route Not Found Handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(ApiError.notFound(`Cannot find ${req.method} ${req.originalUrl} on this server`));
});

// 8. Global Error Handler
app.use(globalErrorMiddleware);

export { app };
