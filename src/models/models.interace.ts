export interface Message {
    username: string;
    text: string;
}

export interface Config {
    displayMenu: boolean,
    displayChat: boolean,
    displayPlaylist: boolean,
    displaySettings: boolean
  }

export interface PlaybackPacket {
    playtime: Number,
    videoId: String
}

export interface RoomPacket {
    _id: String,
    videos: {
        current: String,
        playlist: [{
            index: number,
            title: string,
            videoId: string
        }]
    }
}