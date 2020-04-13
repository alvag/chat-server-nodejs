import dotEnvExtended from 'dotenv-extended';

dotEnvExtended.load();
import cors from 'cors';
import path from 'path';
import express from 'express';
import mongoose from 'mongoose';
import fileUpload from 'express-fileupload';
import Server from './src/server';
import bodyParser from 'body-parser';
import appRoutes from './src/routes/routes';
import messageRoutes from './src/components/message/message.router';

mongoose.set( 'useCreateIndex', true );
mongoose.set( 'useFindAndModify', false );

const publicPath = path.resolve(__dirname, '../../public');


const server = Server.instance;

server.app.use( bodyParser.urlencoded( { extended: true } ) );
server.app.use( bodyParser.json() );
server.app.use( cors( { origin: true, credentials: true } ) );
server.app.use( fileUpload( {
    createParentPath: true
} ) );

server.app.use( '/api', appRoutes );
server.app.use( '/api', messageRoutes );

server.app.use(express.static(publicPath));
server.app.get('*', (req, res, next) => {
    res.sendFile(path.resolve(`${publicPath}/index.html`))
});

const DB_URL = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_URL}/${process.env.DB_NAME}?retryWrites=true&w=majority`;

mongoose.connect( DB_URL, { useNewUrlParser: true, useUnifiedTopology: true } ).then( ( res ) => {
    console.log( 'Conectado a la base de datos' );

    server.start( () => {
        console.log( `Servidor corriendo en el pueto ${server.port}` );

    } );

} ).catch( e => {
    console.log( 'Error al conectar con la base de datos' );
    console.log( e );
} );

