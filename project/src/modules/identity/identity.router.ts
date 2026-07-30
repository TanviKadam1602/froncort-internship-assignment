import express, { Router } from 'express';
import { IdentityController } from './controllers/identity.controller';
import { validateRequest } from '../../middleware/validate.middleware';
import { authenticateMiddleware } from '../../middleware/authenticate.middleware';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  switchOrgSchema,
} from './dtos/identity.dto';

export const identityRouter: Router = express.Router();
const controller = new IdentityController();

/**
 * Public Authentication Routes
 */
identityRouter.post('/register', validateRequest(registerSchema), controller.register);
identityRouter.post('/login', validateRequest(loginSchema), controller.login);
identityRouter.post('/refresh', validateRequest(refreshTokenSchema), controller.refresh);

/**
 * Protected Authentication & Session Routes
 */
identityRouter.use(authenticateMiddleware);

identityRouter.get('/me', controller.getCurrentUser);
identityRouter.get('/sessions', controller.getUserSessions);
identityRouter.post('/switch-org', validateRequest(switchOrgSchema), controller.switchOrg);
identityRouter.post('/logout', controller.logout);
identityRouter.post('/logout-all', controller.logoutAll);
