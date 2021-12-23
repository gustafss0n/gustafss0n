import express from 'express';
import http from 'http';
import socket_controller from './socket.controller';
import cors from 'cors';
import MongoConn from './database'
import * as dotenv from 'dotenv';
import GoogleApi from './googleapis';

dotenv.config();

const app = express();
const server = http.createServer(app);
const database = new MongoConn;
const googleApi = new GoogleApi;

app.use(cors({ origin: "*" }));

app.get('/createroom', (req, res) => {
    database.createRoom().then((room: any) => {
        res.send(room);
    })
})

new socket_controller(server, database, googleApi);

server.listen(3000, () => {
    console.log('listening on *:3000');
});