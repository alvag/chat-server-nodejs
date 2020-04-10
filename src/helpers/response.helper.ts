import { Response } from 'express';
import { HttpResponseCodes } from '../enums';

export const successResponse = ( res: Response, data: any, status = HttpResponseCodes.Ok ) => {
    return res.status( status ).json( { status, ...data } );
};

export const errorResponse = ( res: Response, error: any, status = HttpResponseCodes.BadRequest ) => {
    return res.status( status ).json( { status, ...error } );
};
