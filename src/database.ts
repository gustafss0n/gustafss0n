import { Schema, model, connect } from 'mongoose';
import * as dotenv from 'dotenv';

const roomSchema = new Schema({
    videos: {
        current: String,
        playlist: [{
            videoId: String,
            title: String,
            publishedAt: Date,
            channelTitle: String,
            thumbnails: {
                default: {
                    url: String,
                    width: Number,
                    height: Number
                },
                medium: {
                    url: String,
                    width: Number,
                    height: Number
                },
                high: {
                    url: String,
                    width: Number,
                    height: Number
                },
                standard: {
                    url: String,
                    width: Number,
                    height: Number
                },
                maxres: {
                    url: String,
                    width: Number,
                    height: Number
                },
            }
        }]
    }
})

const RoomModel = model('Room', roomSchema);

export default class Database {

    constructor() {
        this.conn();
    }

    async conn() {
        if (process.env.DB_CONNECTION_STRING && process.env.DB_COLLECTION) {
            connect(process.env.DB_CONNECTION_STRING + process.env.DB_COLLECTION).then(() => {
                console.log('Connected to database');
            }).catch(err => {
                console.log('Failed to connect to MongoDB', err);
            });
        } else {
            console.log("Missing connection string!");
        }
    }

    async createRoom() {
        const doc = new RoomModel({
            videos: {
                current: 'tbnzAVRZ9Xc'
            }
        });
        await doc.save();
        return doc;
    }

    async findRoom(rid: string) {
        RoomModel.findById(rid, 'videoId', (err: any, room: any) => {
            if (err) throw err;
            return room;
        })
    }

    //TODO: implement users
    joinRoom(rid: string, callback: any) {
        RoomModel.findById(rid, (err: any, room: any) => {
            if (err) throw err;
            callback(room);
        })
    }

    setVideo(rid: string, videoId: string) {
        RoomModel.findByIdAndUpdate(rid, { "videos.current": videoId }, (err) => {
            if (err) throw err;
            return true;
        });
    }

    appendPlaylist(rid: string, video: any, callback?: any) {
        RoomModel.findByIdAndUpdate(rid, { $push: { "videos.playlist": video } }, { returnOriginal: false }, (err, room) => {
            if (err) throw err;
            callback(room);
        });
    }

    emptyPlaylist(rid: string, callback?: any) {
        RoomModel.findByIdAndUpdate(rid, { "videos.playlist": [] }, { returnOriginal: false }, (err, room) => {
            if (err) throw err;
            callback(room);
        });
    }

    removeIndexPlaylist(rid: string, index: number, callback?: any) {
        RoomModel.findById(rid, (err: any, room: any) => {
            if (err) throw err;
            room.videos.playlist.splice(index, 1);
            room.save(callback(room));
        });
    }


    switchPlaylist(rid: string, from: number, to: number, callback?: any) {
        RoomModel.findById(rid, (err: any, room: any) => {
            if (err) throw err;
            this.switch(room.videos.playlist, from, to);
            room.save(callback(room));
        });
    }

    private switch(videos: any, from: number, to: number) {
        if (to >= videos.length) {
            var k = to - videos.length + 1;
            while (k--) {
                videos.push(undefined);
            }
        }
        videos.splice(to, 0, videos.splice(from, 1)[0]);
        return videos; // for testing
    };
}