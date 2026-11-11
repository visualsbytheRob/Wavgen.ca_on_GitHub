const crypto=require('node:crypto');
const approved=require('./approvedImages.json');
const snapshots=require('./contentSnapshots.json');
const cards=require('./visualCards');
const tracks=require('./latestTracks.json');
const videos=require('./latestVideos.json');
const updated=tracks.fetched_at;
const groups={releases:[],videos:[],artwork:[],cards:[],guides:[]};
function add(type,item){groups[type].push({...item,type,id:crypto.createHash('sha256').update(type+'|'+item.key).digest('hex').slice(0,20),updated});}
for(const t of tracks.items)add('releases',{key:t.page_url,title:t.title,section:'Music',image:t.artwork_url,href:t.page_url,description:`${t.release_year} · ${t.tracks.length} tracks · The Waveform Generation`,contain:true});
for(const v of videos.items)add('videos',{key:v.video_id,title:v.title,section:'Video',image:v.thumbnail,href:v.page_url,description:v.category+' · '+v.duration,contain:true});
const seen=new Set();
for(const [key,images] of Object.entries(approved))for(const im of images){if(seen.has(im.url))continue;seen.add(im.url);add('artwork',{key:im.url,title:im.fileSlug,section:key==='home'?'Studio':key.split('/')[0],image:im.url,href:im.assignedPage||(key==='home'?'/':'/'+key+'/'),description:'From the approved artwork and photography collection.'});}
for(const [section,items] of Object.entries(cards))for(const c of items)add('cards',{key:section+'|'+c.href,title:c.title,section:c.pageTitle,image:c.image,href:c.href,description:'Explore '+c.pageTitle});
for(const [key,items] of Object.entries(snapshots))for(const im of items)add('guides',{key:im.url,title:im.fileSlug,section:key.split('/')[0]==='home'?'Studio':key.split('/')[0],image:im.url,href:im.href,description:'Information preview · open the complete page',contain:true});
const items=[];const order=['artwork','releases','cards','videos','guides'];
for(let i=0;i<Math.max(...Object.values(groups).map(g=>g.length));i++)for(const type of order)if(groups[type][i])items.push(groups[type][i]);
module.exports={updated,items,counts:Object.fromEntries(Object.entries(groups).map(([k,v])=>[k,v.length]))};
