import jwt from 'jsonwebtoken';
import _ from 'lodash';
import UserInterface from '../components/user/user.interface';
import { Request } from 'express';
import { errorResponse } from './response.helper';
import { HttpResponseCodes } from '../enums';

const createToken = ( userData: UserInterface ) => {
    // const user = _.pick( userData, ['_id', 'name', 'email', 'img', 'active', 'createdAt'] );
    const user = _.omit( userData, ['password'] );

    return new Promise( ( resolve, reject ) => {
        try {
            const token = jwt.sign( { user }, process.env.TOKEN_SECRET_KEY || '' );
            resolve( { user, token } );
        } catch ( e ) {
            reject();
        }
    } );
};

const decodeToken = ( token: string ) => {
    return new Promise<{ user: UserInterface, token: string }>( ( resolve, reject ) => {
        try {
            const payload: any = jwt.verify( token, process.env.TOKEN_SECRET_KEY || '' );
            resolve( payload );
        } catch ( error ) {
            reject( error );
        }
    } );
};

const currentUser = async ( req: Request ) => {
    try {
        const auth = req.get( 'Authorization' ) || '';
        const token = auth.split( ' ' )[ 1 ];
        const payload = await JWT.decodeToken( token );
        return payload.user;
    } catch ( e ) {
        console.log( e );
        throw e;
    }
};

const JWT = {
    createToken,
    decodeToken,
    currentUser
};

export default JWT;
