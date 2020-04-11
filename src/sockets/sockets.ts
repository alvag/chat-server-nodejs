import socketIO, { Socket } from 'socket.io';
import { Events } from '../constants/constants';
import UserInterface from '../components/user/user.interface';
import clientController from '../components/clients/client.controller';
import JWT from '../helpers/jwt.helper';

export const mapSockets = ( client: Socket, io: socketIO.Server ) => {

    // console.log( 'Token -> ', client.handshake.query.token );
    client.on( 'disconnect', () => {
        console.log( 'Usuario desconectado' );
        if ( client.handshake.query.token && client.handshake.query.token !== 'null' ) {
            JWT.decodeToken( client.handshake.query.token ).then( payload => {
                const { user } = payload;
                clientController.updateClients( client, user._id, 'remove' );
            } );
        }
    } );

    client.on( Events.USER_UPDATED, ( user: UserInterface ) => {
        clientController.updateClients( client, user._id );
        client.broadcast.emit( Events.USER_UPDATED, user );
    } );


};
