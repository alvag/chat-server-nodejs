import { Response, Request } from 'express';
import _ from 'lodash';
import mongoose from 'mongoose';
import messageValidator from './message.validator';
import ValidationErrors from '../../helpers/validation.helper';
import { errorResponse, successResponse } from '../../helpers/response.helper';
import JWT from '../../helpers/jwt.helper';
import Message from './message.model';
import { HttpResponseCodes } from '../../enums';
import User from '../user/user.model';

const create = async ( req: Request, res: Response ) => {
    try {
        const user = await JWT.currentUser( req );

        let body: any = _.pick( req.body, ['message', 'to'] );

        const result = messageValidator.create( { ...body, from: user._id } );

        if ( result.error ) {
            const error = ValidationErrors.getJoiError( result.error.details[ 0 ] );
            return errorResponse( res, error );
        }

        body = { ...result.value };

        if ( mongoose.Types.ObjectId.isValid( body.from ) && mongoose.Types.ObjectId.isValid( body.to ) ) {
            const message = new Message( { ...body } );
            await message.save();
            return successResponse( res, { message }, HttpResponseCodes.Created );

        } else {
            return errorResponse( res, { message: 'Debes enviar un emisor y un destinatario válido.' } );
        }

    } catch ( e ) {
        console.log( e );
        if ( e.name === 'ValidationError' ) {
            e = await ValidationErrors.getMongooseErrors( e.errors );
        }
        return errorResponse( res, e );
    }

};

const get = async ( req: Request, res: Response ) => {
    try {
        const user = await JWT.currentUser( req );
        const result = messageValidator.getMessage( { to: req.params.to, from: user._id } );

        if ( result.error ) {
            const error = ValidationErrors.getJoiError( result.error.details[ 0 ] );
            return errorResponse( res, error );
        }

        const { from, to } = result.value;

        if ( mongoose.Types.ObjectId.isValid( from ) && mongoose.Types.ObjectId.isValid( to ) ) {

            const page = Number( req.query.page ) || 1;
            const per_page = Number( req.query.per_page ) || 10;

            const messages = await Message.find( { $or: [{ to, from }, { to: from, from: to }] } )
            .sort( { 'createdAt': -1 } )
            .populate( 'to' )
            .populate( 'from' )
            .skip( ( page - 1 ) * per_page ).limit( per_page );

            const total = await Message.find( { $or: [{ to, from }, { to: from, from: to }] } ).countDocuments();

            return successResponse( res, {
                page, per_page, total, total_pages: Math.ceil( total / per_page ), messages
            } );

        } else {
            return errorResponse( res, { message: 'Debes enviar un emisor y un destinatario válido.' } );
        }


    } catch ( e ) {
        if ( e.name === 'ValidationError' ) {
            e = await ValidationErrors.getMongooseErrors( e.errors );
        }
        return errorResponse( res, e );
    }
};

const messageController = {
    create,
    get
};

export default messageController;
