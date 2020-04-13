import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcrypt';
import _ from 'lodash';
import  mongoose from 'mongoose';
import User, { UserModel } from './user.model';
import { errorResponse, successResponse } from '../../helpers/response.helper';
import { HttpResponseCodes } from '../../enums';
import ValidationErrors from '../../helpers/validation.helper';
import JWT from '../../helpers/jwt.helper';
import userValidator from './user.validator';
import Message from '../message/message.model';

const create = async ( req: Request, res: Response ) => {
    let body = _.pick( req.body, ['name', 'email', 'phone', 'bio', 'facebook', 'twitter', 'password'] );

    const result = userValidator.create( body );

    if ( result.error ) {
        const error = ValidationErrors.getJoiError( result.error.details[ 0 ] );
        return errorResponse( res, error );
    }

    body = { ...result.value };

    let user = await User.findOne( { email: body.email } );
    if ( user ) {
        return errorResponse( res, { message: 'Ya existe un usuario registrado con ese correo.' } );
    }

    try {
        body.password = await bcrypt.hash( body.password, 10 );
        user = new User( { ...body } );
        await user.save();

        const userResponse = _.omit( user.toObject(), ['password'] );

        return successResponse( res, { user: userResponse }, HttpResponseCodes.Created );
    } catch ( e ) {
        console.log( e );
        if ( e.name === 'ValidationError' ) {
            e = await ValidationErrors.getMongooseErrors( e.errors );
        }
        return errorResponse( res, e );
    }

};

const update = async ( req: Request, res: Response ) => {
    let body = _.pick( req.body, ['name', 'phone', 'bio', 'facebook', 'twitter', 'password', 'active'] );
    const result = userValidator.update( body );
    if ( result.error ) {
        const error = ValidationErrors.getJoiError( result.error.details[ 0 ] );
        return errorResponse( res, error );
    }

    body = { ...result.value };

    if ( body.password && body.password.trim() ) {
        body.password = await bcrypt.hash( body.password, 10 );
    }
    try {
        const user = await JWT.currentUser( req );
        const userUpdated = await User.findByIdAndUpdate( user._id, body, { new: true, runValidators: true } );
        return successResponse( res, { user: userUpdated }, HttpResponseCodes.Created );

    } catch ( e ) {
        if ( e.name === 'ValidationError' ) {
            e = await ValidationErrors.getMongooseErrors( e.errors );
        }
        return errorResponse( res, e );
    }

};

const get = async ( req: Request, res: Response ) => {
    const id = req.params.id;

    if ( id ) {
        try {
            const user = await User.findOne( { _id: id } );
            if ( user ) {
                return successResponse( res, { user } );
            }
            return successResponse( res, { message: 'El usuario no existe o ha sido suspendido.' }, HttpResponseCodes.NotFound );
        } catch ( e ) {
            return errorResponse( res, e, HttpResponseCodes.InternalServerError );
        }
    } else {
        const page = Number( req.query.page ) || 1;
        const per_page = Number( req.query.per_page ) || 999;

        try {
            const user = await JWT.currentUser( req );
            let filter: any = { deletedAt: { $exists: false }, _id: { $ne: user._id } };
            if ( req.query.q ) {
                // console.log( req.query.q );
                let regEx = new RegExp( req.query.q.toString(), 'i' );
                filter = { ...filter, name: regEx };
            }

            /*let users = await User.find( filter ).skip( ( page - 1 ) * per_page ).limit( per_page );
            users = await getLastMessages( users, user._id );
            const total = await User.find( filter ).countDocuments();
            successResponse( res, { page, per_page, total, total_pages: Math.ceil( total / per_page ), users } );*/


            let users = await User.aggregate([
                {
                    $match: {
                        $and: [
                            {deletedAt: {$exists:  false}},
                            {_id: {$ne: mongoose.Types.ObjectId(user._id)}}
                        ]
                    }
                },
                {
                    $lookup: {
                        from: "messages",
                        let: { current_user: mongoose.Types.ObjectId(user._id), user_id: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {
                                                $or: [
                                                    { $eq: ['$to', '$$current_user'] },
                                                    { $eq: ['$from', '$$current_user'] }
                                                ]
                                            },
                                            {
                                                $or: [
                                                    { $eq: ['$to', '$$user_id'] },
                                                    { $eq: ['$from', '$$user_id'] }
                                                ]
                                            }
                                        ],
                                    }
                                }
                            },
                            {
                                $sort: { createdAt: -1 }
                            },
                            {
                                $limit: 1
                            }
                        ],
                        as: "messages"
                    }
                },
                {
                    $unwind: {
                        path: "$messages",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'messages.to',
                        foreignField: '_id',
                        as: 'messages.to'
                    }
                },
                {
                    $unwind: {
                        path: "$messages.to",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'messages.from',
                        foreignField: '_id',
                        as: 'messages.from'
                    }
                },

                {
                    $unwind: {
                        path: "$messages.from",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $unset: ['password']
                },
                {
                    $set: {
                        avatar: {$concat: [`${process.env.SERVER}/api/v1/avatar/`, '$avatar']},
                        'messages.to.avatar': {$concat: [`${process.env.SERVER}/api/v1/avatar/`, '$messages.to.avatar']},
                        'messages.from.avatar': {$concat: [`${process.env.SERVER}/api/v1/avatar/`, '$messages.from.avatar']}
                    }
                },
                {
                    $project : {
                        'messages.from.password': 0,
                        'messages.to.password': 0,
                    }
                }
            ]);

            successResponse( res, { users } );

        } catch ( e ) {
            return errorResponse( res, e, HttpResponseCodes.InternalServerError );
        }
    }
};

const getLastMessages = ( users: UserModel[], userId: any ) => {
    return new Promise<any[]>( async ( resolve, reject ) => {
        try {
            users.map(async (u, i, self) => {
                const m = await Message.find( { $or: [{ to: userId, from: u._id }, { to: u._id, from: userId }] } )
                .sort( { 'createdAt': -1 } )
                .limit( 1 )
                if ( m.length ) {
                    self[i].messages.push(m[ 0 ]);
                }
            });

            resolve( users );
        } catch ( e ) {
            reject( users );
        }
    } );
};

const updateAvatar = async ( req: Request, res: Response ) => {

    if ( !req.files || !req.files.avatar ) {
        return errorResponse( res, { message: 'Debe seleccionar un archivo' } );
    } else {
        try {
            const user = await JWT.currentUser( req );
            const validExtensions = ['png', 'jpg', 'gif', 'jpeg'];
            const file = req.files.avatar as any;
            const ext = file.name.split( '.' )[ file.name.split( '.' ).length - 1 ];

            if ( !validExtensions.includes( ext.toLowerCase() ) ) {
                return errorResponse( res, { message: `Sólo se permiten archivos de tipo: ${validExtensions.join( ', ' )}` } );
            } else {
                const _id = user._id;
                const fileName = `${_id}-${new Date().getTime()}.${ext.toLowerCase()}`;

                file.mv( `./uploads/${fileName}`, async ( error: any ) => {
                    if ( error ) {
                        return errorResponse( res, error, HttpResponseCodes.InternalServerError );
                    } else {
                        let user = await User.findById( _id );
                        if ( user ) {
                            const oldAvatar = user.avatar;
                            user.avatar = fileName;
                            await user.save();
                            if ( oldAvatar !== 'default.png' ) deleteFile( oldAvatar );
                            return successResponse( res, { user }, HttpResponseCodes.Created );
                        } else {
                            return errorResponse( res, { message: 'El usuario no existe.' } );
                        }

                    }
                } );
            }
        } catch ( e ) {
            return errorResponse( res, e, HttpResponseCodes.InternalServerError );
        }
    }
};

const getAvatar = ( req: Request, res: Response ) => {
    const fileName = req.params.fileName;
    const pathFile = path.resolve( `./uploads/${fileName}` );

    if ( fs.existsSync( pathFile ) ) {
        res.sendFile( pathFile );
    } else {
        res.sendFile( path.resolve( `./uploads/default.png` ) );
    }
};

const deleteFile = ( fileName: string ) => {
    let pathFile = path.resolve( `./uploads/${fileName}` );
    if ( fs.existsSync( pathFile ) ) {
        fs.unlinkSync( pathFile );
    }
};

const userController = {
    create,
    get,
    updateAvatar,
    getAvatar,
    update
};

export default userController;
