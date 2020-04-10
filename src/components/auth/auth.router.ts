import { Router } from 'express';
import authController from './auth.controller';

const authRoutes = Router();

authRoutes.post( '/v1/login', authController.login );

export default authRoutes;
