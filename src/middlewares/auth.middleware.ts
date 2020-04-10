import { NextFunction, Request, Response } from 'express';
import { errorResponse } from '../helpers/response.helper';
import { HttpResponseCodes } from '../enums';
import JWT from '../helpers/jwt.helper';

export const isAuth = async ( req: Request, res: Response, next: NextFunction ) => {
    const auth = req.get( 'Authorization' );

    if ( !auth ) {
        errorResponse( res, { message: 'No tienes autorización.' }, HttpResponseCodes.Unauthorized );
    } else {
        try {
            const token = auth.split( ' ' )[ 1 ];
            await JWT.decodeToken( token );
            next();
        } catch ( e ) {
            console.log( e );
            errorResponse( res, { message: 'No tienes autorización.' }, HttpResponseCodes.Unauthorized );
        }
    }
};
