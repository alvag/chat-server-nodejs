import dotEnvExtended from 'dotenv-extended';

dotEnvExtended.load();
import cors from 'cors';
import mongoose from 'mongoose';
import { MongoError } from 'mongodb';

import Server from './src/server';
import bodyParser from 'body-parser';

mongoose.set( 'useCreateIndex', true );


const server = Server.instance;

server.app.use( bodyParser.urlencoded( { extended: true } ) );
server.app.use( bodyParser.json() );

server.app.use( cors( { origin: true, credentials: true } ) );

const DB_URL = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_URL}/${process.env.DB_NAME}?retryWrites=true&w=majority`;

mongoose.connect( DB_URL, { useNewUrlParser: true, useUnifiedTopology: true } ).then( ( res ) => {
    // console.log( res );
    console.log( 'Conectado a la base de datos' );

    server.start( () => {
        console.log( `Servidor corriendo en el pueto ${server.port}` );
    } );
    
} ).catch( e => {
    console.log( 'Error al conectar con la base de datos' );
    console.log( e );
} );

