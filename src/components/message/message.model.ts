import mongoose from 'mongoose';
import { MessageInterface } from './message.interface';

interface MessageModel extends MessageInterface, mongoose.Document {}

const messageSchema = new mongoose.Schema( {
    from: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    to: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    deletedAt: {
        type: Date,
    },

}, { versionKey: false } );

const Message = mongoose.model<MessageModel>( 'Message', messageSchema );
export default Message;
