import Client from './client.model';
import User from '../user/user.model';
import { Socket } from 'socket.io';
import { Events } from '../../constants/constants';

const updateClients = async ( socketClient: Socket, user: string, action = 'add' ) => {
    try {
        if ( action === 'add' ) {
            await new Client( { user, client: socketClient.id } ).save();
        } else {
            await Client.findOneAndRemove( { user, client: socketClient.id } );
        }

        const clients = await Client.find( { user } ).countDocuments();

        let active = true;
        if ( clients == 0 ) {
            active = false;
        }

        const userUpdated = await User.findByIdAndUpdate( { _id: user }, { active }, { new: true } );
        socketClient.broadcast.emit( Events.USER_UPDATED, userUpdated );

    } catch ( e ) {
        console.log( e );
    }
};

const removeAll = () => {
    return Client.collection.drop();
};

const clientController = {
    updateClients,
    removeAll
};

export default clientController;
