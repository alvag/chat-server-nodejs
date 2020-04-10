import express from 'express';
import http from 'http';
import socketIO from 'socket.io';
import * as socket from './sockets/sockets';

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

    start( callback: () => void ) {
        this.httpServer.listen( this.port, callback );
    }

    private listenSockets() {
        this.io.on( 'connection', client => {
            console.log( 'Usuario conectado' );
            socket.mapSockets( client, this.io );
        } );
    }
}
