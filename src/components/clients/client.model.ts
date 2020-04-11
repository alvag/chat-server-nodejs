import mongoose from 'mongoose';

interface ClientInterface {
    _id: any;
    user: any;
    client: string;
}

interface ClientModel extends ClientInterface, mongoose.Document {}

const clientSchema = new mongoose.Schema( {
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    client: String
}, { versionKey: false } );

const Client = mongoose.model<ClientModel>( 'Client', clientSchema );
export default Client;
