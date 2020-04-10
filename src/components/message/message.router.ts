import { Router } from 'express';
import { isAuth } from '../../middlewares/auth.middleware';
import messageController from './message.controller';

const messageRoutes = Router();

messageRoutes.post( '/v1/message', isAuth, messageController.create );
messageRoutes.get( '/v1/message/:to', isAuth, messageController.get );

export default messageRoutes;
