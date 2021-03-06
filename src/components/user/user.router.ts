import { Router } from 'express';
import userController from './user.controller';
import { isAuth } from '../../middlewares/auth.middleware';

const userRoutes = Router();

userRoutes.post( '/v1/user', userController.create );
userRoutes.put( '/v1/user', [isAuth], userController.update );
userRoutes.get( '/v1/user', isAuth, userController.get );
userRoutes.get( '/v1/user/:id', isAuth, userController.get );
userRoutes.put( '/v1/user/avatar', [isAuth], userController.updateAvatar );
userRoutes.get( '/v1/avatar/:fileName', userController.getAvatar );


export default userRoutes;
