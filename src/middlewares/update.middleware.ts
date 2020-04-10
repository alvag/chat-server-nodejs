import { NextFunction, Request, Response } from 'express';
import { errorResponse } from '../helpers/response.helper';
import { HttpResponseCodes } from '../enums';
import JWT from '../helpers/jwt.helper';

export const updatePermission = async ( req: Request, res: Response, next: NextFunction ) => {
    const auth = req.get( 'Authorization' );

    if ( !auth ) {
        return errorResponse( res, { message: 'No tienes autorización.' }, HttpResponseCodes.Unauthorized );
    } else {
        try {
            const token = auth.split( ' ' )[ 1 ];
            const decoded = await JWT.decodeToken( token );
            if ( decoded.user._id !== req.params.id ) {
                return errorResponse( res, { message: 'No tienes autorización para editar los datos de otro usuario.' }, HttpResponseCodes.Unauthorized );
            }
            next();
        } catch ( e ) {
            console.log( e );
            return errorResponse( res, { message: 'No tienes autorización.' }, HttpResponseCodes.Unauthorized );
        }
    }
};
