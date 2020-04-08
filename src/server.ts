import express from 'express';
import http from 'http';

export default class Server {
    private static _instance: Server;
    public app: express.Application;
    public port: number;
    private readonly httpServer: http.Server;

    private constructor() {
        this.app = express();
        this.port = Number( process.env.SERVER_PORT || 3000 );
        this.httpServer = new http.Server( this.app );
    }

    public static get instance() {
        return this._instance || ( this._instance = new this() );
    }

    start( callback: () => void ) {
        this.httpServer.listen( this.port, callback );
    }
}
