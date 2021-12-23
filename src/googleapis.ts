import http from 'http';
import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import axios from 'axios';

const youtube = google.youtube({
    version: 'v3',
    auth: 'AIzaSyDZeWBgJYeAhxhWU5zqv1k6NrbIbofUYL0'
})

export default class GoogleApi {

    constructor() {

    }

    fetchVideoData(videoId: any, callback: any) {
        this.fetchVideoApiLink(videoId, (url: string) => {
            if (!url) return;
            axios.get(url)
                .then(function (response) {
                    callback(response.data.items[0].snippet)
                })
                .catch(function (error) {
                    console.log(error);
                })
        });
    }

    private fetchVideoApiLink(videoId: any, callback: any) {
        youtube.videos.list({
            part: ['snippet'],
            id: [videoId]
        }, function (err: any, data: any) {
            if (err) throw err;
            if (data) {
                callback(data.config.url);
            }
        });
    }

}