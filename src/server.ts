import express from 'express';
import http from 'http';
import socketIO from 'socket.io';
import * as socket from './sockets/sockets';
import clientController from './components/clients/client.controller';
import JWT from './helpers/jwt.helper';

export default class Server {
    private static _instance: Server;
    public app: express.Application;
    public port: number;
    public io: socketIO.Server;
    private readonly httpServer: http.Server;

    private constructor() {
        this.app = express();
        this.port = Number( process.env.SERVER_PORT || 3000 );
        this.httpServer = new http.Server( this.app );
        this.io = socketIO( this.httpServer );
        this.listenSockets();
    }

    public static get instance() {
        return this._instance || ( this._instance = new this() );
    }

    async start( callback: () => void ) {
        clientController.removeAll().catch( () => {} );
        this.httpServer.listen( this.port, callback );
    }

    private listenSockets() {
        this.io.on( 'connection', client => {
            console.log( 'Usuario conectado' );
            if ( client.handshake.query.token && client.handshake.query.token !== 'null' ) {
                JWT.decodeToken( client.handshake.query.token ).then( payload => {
                    const { user } = payload;
                    clientController.updateClients( client, user._id ).catch( e => console.log( e ) );
                } ).catch(() => {});
            }

            socket.mapSockets( client, this.io );
        } );
    }
}
