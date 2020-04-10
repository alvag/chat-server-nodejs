import express from 'express';
import userRoutes from '../components/user/user.router';
import authRoutes from '../components/auth/auth.router';

const appRoutes = express();

appRoutes.use( userRoutes );
appRoutes.use( authRoutes );

export default appRoutes;
