import mongoose from 'mongoose';
import validator from 'validator';
import uniqueValidator from 'mongoose-unique-validator';
import UserInterface from './user.interface';
import { messageSchema } from '../message/message.model';

export interface UserModel extends UserInterface, mongoose.Document {}

const userSchema = new mongoose.Schema( {
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        validate: {
            validator: validator.isEmail,
            message: 'El correo no tiene un formato válido.'
        },
    },
    phone: {
        type: String,
        required: false,
        trim: true
    },
    bio: {
        type: String,
        required: false,
        trim: true
    },
    facebook: {
        type: String,
        required: false,
        trim: true
    },
    twitter: {
        type: String,
        required: false,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
        select: false,
    },
    avatar: {
        type: String,
        required: false,
        trim: true,
        default: 'default.png'
    },
    createdAt: {
        type: Date,
        required: false,
        default: Date.now
    },
    deletedAt: {
        type: Date,
        required: false,
    },
    active: {
        type: Boolean,
        required: false,
        default: false
    },
    lastConnection: {
        type: Date,
        required: false,
    },
    messages: [messageSchema],
}, { versionKey: false } );

userSchema.methods.toJSON = function() {
    let user = this;
    let userObject = user.toObject();
    userObject.avatar = `${process.env.SERVER}/api/v1/avatar/${userObject.avatar}`;
    delete userObject.password;
    return userObject;
}

userSchema.plugin( uniqueValidator, { message: '{PATH} debe ser único.' } );

const User = mongoose.model<UserModel>( 'User', userSchema );
export default User;
