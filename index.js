const express = require('express')
const fs = require('fs')
const ytdl = require('ytdl-core')
const app = express()
const port = 4000

const itags_keys = [
    '5',
    '6',
    '17',
    '18',
    '22',
    '34',
    '35',
    '36',
    '37',
    '38',
    '43',
    '44',
    '45',
    '46',
    '96',
    '82',
    '83',
    '84',
    '85',
    '92',
    '93',
    '94',
    '95',
    '100',
    '101',
    '102',
    '132',
    '139',
    '140',
    '141',
    '151',
    '171',
    '249',
    '250',
    '251',
]

const itags_values = [
    '240p.flv',
    '270p.flv',
    '144p.3gp',
    '360p.mp4',
    '720p.mp4',
    '360p.flv',
    '480p.flv',
    '180p.3gp',
    '1080p.mp4',
    '3072p.mp4',
    '360p.webm',
    '480p.webm',
    '720p.webm',
    '1080p.webm',
    '1080p.hls',
    '3D-360p.mp4',
    '3D-480p.mp4',
    '3D-720p.mp4',
    '3D-1080p.mp4',
    '3D-240p.hls',
    '3D-360p.hls',
    '3D-480p.hls',
    '3D-720p.hls',
    '3D-360p.webm',
    '3D-480p.webm',
    '3D-720p.webm',
    '240p.hls',
    '48k.m4a',
    '128k.m4a',
    '256k.m4a',
    '72p.hls',
    '128k.webm',
    '50k.webm',
    '70k.webm',
    '160k.web',
];

const getKeyByValue = (object, value) => {
  return Object.keys(object).find(key => object[key] === value);
}

const millisToMinutesAndSeconds = (millis) => {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;
}

const sortByName = (objs) => objs.sort((a, b) => a.name.localeCompare(b.name));


app.get('/info', async (req, res) => {
    const {query} = req;
    const {uri} = query;
    const isValidUrl = ytdl.validateURL(uri);
    if(isValidUrl) {
        const videoId = ytdl.getVideoID(uri);
        await ytdl
            .getInfo(videoId)
            .then(({videoDetails, formats}) => {
                let {title, description, lengthSeconds, author, ownerChannelName, thumbnails: vThumbnailUrl} = videoDetails;
                let {channel_url, thumbnails: aThumbnailUrl} = author;
                vThumbnailUrl = vThumbnailUrl.splice(-1)[0].url;
                aThumbnailUrl = aThumbnailUrl.splice(-1)[0].url;
                let channel = {...{photo: aThumbnailUrl, url: channel_url, name: ownerChannelName}};
                let video = {...{videoId, thumbnail: vThumbnailUrl, timing: lengthSeconds, title, description}};
                let vformats = [];
                formats.forEach(({url, itag, hasAudio, hasVideo, fps, approxDurationMs}) => {
                    if(hasAudio && getKeyByValue(itags_keys, itag.toString())) {
                        let name = `${hasVideo ? 'Video' : 'Audio'}${hasVideo ? '-' : ''}${hasVideo? fps : ''}-${itags_values[getKeyByValue(itags_keys, itag.toString())]}`;
                        vformats.push({url, name, time: millisToMinutesAndSeconds(approxDurationMs)});
                    }
                });
                vformats = sortByName(vformats);
                res.json({
                    ...{isValidUrl, video, channel, vformats}
                });
            });
    }
    res.json({
        ...{isValidUrl}
    });
    
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})