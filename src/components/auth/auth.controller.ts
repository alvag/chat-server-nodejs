import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import authValidator from './auth.validator';
import ValidationErrors from '../../helpers/validation.helper';
import { errorResponse, successResponse } from '../../helpers/response.helper';
import { HttpResponseCodes } from '../../enums';
import User from '../user/user.model';
import JWT from '../../helpers/jwt.helper';

const login = async ( req: Request, res: Response ) => {
    const result = authValidator( { ...req.body } );
    if ( result.error ) {
        const error = ValidationErrors.getJoiError( result.error.details[ 0 ] );
        return errorResponse( res, error );
    }

    try {

        const user = await User.findOne( {
            email: result.value.email
        } ).select( '+password' ).exec();

        if ( !user ) {
            return errorResponse( res, { message: 'Usuario o contraseña incorrectos.' }, HttpResponseCodes.NotFound );
        } else if ( !user.active ) {
            return successResponse( res, { message: 'Tu cuenta ha sido suspendida.' }, HttpResponseCodes.Unauthorized );
        }

        const isValidLogin = bcrypt.compareSync( result.value.password, user.password );
        if ( isValidLogin ) {
            const userData = await JWT.createToken( user.toObject() );
            return successResponse( res, userData );
        } else {
            return errorResponse( res, { message: 'Usuario o contraseña incorrectos.' }, HttpResponseCodes.Unauthorized );
        }

    } catch ( e ) {
        return errorResponse( res, e, HttpResponseCodes.InternalServerError );
    }
};

const authController = {
    login
};

export default authController;
