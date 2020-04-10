import mongoose from 'mongoose';
import validator from 'validator';
import uniqueValidator from 'mongoose-unique-validator';
import UserInterface from './user.interface';

interface UserModel extends UserInterface, mongoose.Document {}

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
        default: Date.now
    },
    active: {
        type: Boolean,
        required: false,
        default: true
    }
}, { versionKey: false } );

userSchema.plugin( uniqueValidator, { message: '{PATH} debe ser único.' } );

const User = mongoose.model<UserModel>( 'User', userSchema );
export default User;
