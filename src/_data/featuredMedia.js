const tracks = require('./latestTracks.json').items;
const videos = require('./latestVideos.json').items;
module.exports = { releases: ['Seven','ARP!','Study Break'].map(title => tracks.find(t => t.title === title)).filter(Boolean), videos: ['B-y5r7hWYcM','2G42wtp5Ue4','Vxtk_WgOtZI'].map(id => videos.find(v => v.video_id === id)).filter(Boolean) };
