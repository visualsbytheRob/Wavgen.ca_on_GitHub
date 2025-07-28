/**
 * REAL MUSIC TRACKS DATA
 * 
 * Configuration file for Rob McDonald's actual music releases
 * Replace demo data with real tracks from streaming platforms
 */

module.exports = {
  // Featured tracks for the music player
  tracks: [
    {
      id: 1,
      title: "Reel One",
      artist: "The Waveform Generation",
      genre: "electro",
      duration: "4:32",
      // Streaming platform links
      platforms: {
        bandcamp: "https://waveformgeneration.bandcamp.com/",
        soundcloud: "https://soundcloud.com/robmcd/reel-one",
        appleMusic: "https://music.apple.com/us/artist/the-waveform-generation/1322780552",
        spotify: "",
        youtube: "https://www.youtube.com/channel/UCLK1PORnw7wtArjjhfnA2RQ"
      },
      // For embedded playback
      embedUrl: "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/reel-one&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true",
      cover: "/images/covers/reel-one-cover.jpg",
      description: "Futuristic electro with machine funk and robotic rhythms",
      releaseDate: "2024-01-01",
      tags: ["Electro", "Machine Funk", "Robotic"]
    },
    // Add more tracks here following the same structure
    {
      id: 2,
      title: "Another Track",
      artist: "The Waveform Generation", 
      genre: "ambient",
      duration: "6:45",
      platforms: {
        bandcamp: "https://waveformgeneration.bandcamp.com/track/another-track",
        soundcloud: "https://soundcloud.com/robmcd/another-track",
        appleMusic: "",
        spotify: "",
        youtube: ""
      },
      embedUrl: "",
      cover: "/images/covers/another-track.jpg",
      description: "Description of this ambient piece",
      releaseDate: "2024-02-01",
      tags: ["Ambient", "Atmospheric", "Soundscape"]
    }
    // Continue adding your actual tracks...
  ],

  // Albums/EPs for organization
  releases: [
    {
      id: 1,
      title: "Album/EP Name",
      type: "album", // album, ep, single
      releaseDate: "2024-01-01",
      cover: "/images/covers/album-cover.jpg",
      description: "Album description",
      platforms: {
        bandcamp: "https://waveformgeneration.bandcamp.com/album/album-name",
        soundcloud: "https://soundcloud.com/robmcd/sets/album-name",
        appleMusic: "https://music.apple.com/us/album/album-name/id",
        spotify: "",
        youtube: ""
      },
      trackIds: [1, 2] // Reference to track IDs in this release
    }
  ]
};
