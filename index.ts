import dotEnvExtended from 'dotenv-extended';

dotEnvExtended.load();

import Server from './src/server';
import bodyParser from 'body-parser';
import cors from 'cors';

const server = Server.instance;

server.app.use( bodyParser.urlencoded( { extended: true } ) );
server.app.use( bodyParser.json() );

server.app.use( cors( { origin: true, credentials: true } ) );

server.start( () => {
    console.log( `Servidor corriendo en el pueto ${server.port}` );
} );
