import Client from './client.model';
import User from '../user/user.model';
import { Socket } from 'socket.io';
import { Events } from '../../constants/constants';

const updateClients = async ( socketClient: Socket, user: any, action = 'add' ) => {
    try {
        if ( action === 'add' ) {
            await new Client( { user, client: socketClient.id } ).save();
        } else {
            if (user) {
                await Client.findOneAndRemove( { client: socketClient.id } );
            } else {
                const client = await Client.findOne( { client: socketClient.id } );
                if (client) {
                    user = client.user;
                    client.remove();
                }
            }
        }

        if (user) {
            const clients = await Client.find( { user } ).countDocuments();
            const data: any = { active: true};
            if ( clients == 0 ) {
                data.active = false;
                data.lastConnection = new Date();
            }

            const userUpdated = await User.findByIdAndUpdate( { _id: user }, data, { new: true } );
            socketClient.broadcast.emit( Events.USER_UPDATED, userUpdated );
        }

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
