import { Server } from 'socket.io';
import { PlaybackPacket } from './models/models.interace';
import MongoConn from './database';
import GoogleApi from './googleapis';

const SERVER_CONFIG = {
    cors: {
        origin: "*"
    }
}

/* TODO: store room-user data in a redis */
export default class Socket {
    io: any;

    constructor(private server: any, private database: any, private googleApi: GoogleApi) {
        this.database = new MongoConn;
        this.io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server, SERVER_CONFIG);
        this.addListeners();
    }

    addListeners() {
        this.io.on('connection', (socket: any) => {
            socket.on('join', (id: any) => {
                socket.join(id);
                this.database.joinRoom(id, (room: any) => {
                    console.log("room", room);
                    socket.emit('join', room);
                })
            })

            socket.on('message', (data: any) => {
                data._args.username = "test";
                this.io.emit('message', data._args);
            });

            socket.on('setvideo', (data: any) => {
                this.database.setVideo(data.room, data._args);
                this.io.in(data.room).emit('setvideo', data._args);
            })

            socket.on('appendplaylist', (data: any) => {
                this.googleApi.fetchVideoData(data._args, (_data: any) => {
                    const VIDEO = {
                        videoId: data.title,
                        title: _data.title,
                        publishedAt: _data.publishedAt,
                        channelTitle: _data.channelTitle,
                        thumbnails: _data.thumbnails
                    }
                    
                    this.database.appendPlaylist(data.room, VIDEO, (room: any) => {
                        this.io.in(data.room).emit('appendplaylist', room.videos.playlist);
                    });
                });
                
            })

            socket.on('emptyplaylist', (data: any) => {
                this.database.emptyPlaylist(data.room, (room: any) => {
                    this.io.in(data.room).emit('emptyplaylist', room.videos.playlist);
                });
            })

            socket.on('removeindexplaylist', (data: any) => {
                this.database.removeIndexPlaylist(data.room, data._args, (room: any) => {
                    this.io.in(data.room).emit('removeindexplaylist', room.videos.playlist);
                });
            })

            socket.on('switchplaylist', (data: any) => {
                this.database.switchPlaylist(data.room, data._args.from, data._args.to, (room: any) => {
                    this.io.in(data.room).emit('switchplaylist', room.videos.playlist);
                });
            })

            socket.on('play', (data: any) => {
                this.io.in(data.room).emit('play', data);
            })

            socket.on('pause', (data: PlaybackPacket) => {
                this.io.emit('pause', data);
            })

            socket.on('seek', (data: any) => {
                this.io.in(data.room).emit('seek', data._args);
            })

            socket.on('nextVideo', (data: any) => {
                this.io.emit('nextVideo');
            })

            socket.on('prevVideo', (data: any) => {
                this.io.emit('prevVideo');
            })

            socket.on('playlist_update', (data: any) => {
                console.log(data);
            })

            socket.on('disconnect', () => {
                console.log('~');
            });
        })
    }
}

interface ServerToClientEvents {
    noArg: () => void;
    basicEmit: (a: number, b: string, c: Buffer) => void;
    withAck: (d: string, callback: (e: number) => void) => void;
}

interface ClientToServerEvents {
    hello: () => void;
}

interface InterServerEvents {
    ping: () => void;
}

interface SocketData {
    name: string;
    age: number;
}