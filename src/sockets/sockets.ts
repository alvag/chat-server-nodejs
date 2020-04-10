import socketIO, { Socket } from 'socket.io';

export const mapSockets = ( client: Socket, io: socketIO.Server ) => {

    client.on( 'disconnect', () => {
        console.log( 'Cliente desconectado' );
    } );
};
