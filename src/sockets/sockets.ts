import socketIO, { Socket } from 'socket.io';
import { Events } from '../constants/constants';
import UserInterface from '../components/user/user.interface';
import clientController from '../components/clients/client.controller';
import JWT from '../helpers/jwt.helper';

export const mapSockets = ( client: Socket, io: socketIO.Server ) => {

    // console.log( 'Token -> ', client.handshake.query.token );
    client.on( 'disconnect', () => {
        console.log( 'Usuario desconectado' );
        clientController.updateClients( client, null, 'remove' ).catch(() => {});
    } );

    client.on( Events.USER_UPDATED, ( user: UserInterface ) => {
        clientController.updateClients( client, user._id ).catch(() => {});
        client.broadcast.emit( Events.USER_UPDATED, user );
    } );

    client.on(Events.CLOSE_SESSION, (userId: string) => {
        clientController.updateClients( client, userId, 'remove' ).catch(() => {});
    })


};
