/**
 * REAL VIDEO CONTENT DATA
 * 
 * Configuration file for Rob McDonald's actual video content
 * Replace demo data with real videos from YouTube, Vimeo, etc.
 */

module.exports = {
  // Featured videos for the video player
  videos: [
    {
      id: 1,
      title: "Massive – The Waveform Generation",
      description: "Official music video for the breakbeat anthem 'Massive' featuring heavy bass and intricate drum programming",
      category: "breaks",
      duration: "5:52",
      releaseDate: "2024",
      
      // Platform URLs
      platforms: {
        youtube: "https://www.youtube.com/watch?v=FrNw6Z3c55U",
        vimeo: "https://vimeo.com/therob"
      },
      
      // Embed URL for player
      embedUrl: "https://www.youtube.com/embed/FrNw6Z3c55U",
      
      // Thumbnail
      thumbnail: "/images/videos/massive-thumb.jpg",
      
      // Project details
      tools: ["After Effects", "Ableton Live", "TouchDesigner"],
      projectType: "Music Video",
      tags: ["breaks", "music video", "heavy bass"]
    },
    {
      id: 2,
      title: "Joy – The Waveform Generation",
      description: "Ambient visual journey accompanying the track 'Joy' - pure bliss captured in sound and vision",
      category: "ambient",
      duration: "7:18",
      releaseDate: "2024",
      
      platforms: {
        youtube: "https://www.youtube.com/watch?v=zkfQY9ct3yE",
        vimeo: "https://vimeo.com/therob"
      },
      
      embedUrl: "https://www.youtube.com/embed/zkfQY9ct3yE",
      
      thumbnail: "/images/videos/joy-thumb.jpg",
      
      tools: ["TouchDesigner", "After Effects", "Cinema 4D"],
      projectType: "Ambient Visual",
      tags: ["ambient", "visual", "peaceful"]
    },
    {
      id: 3,
      title: "Realtime Generative Visuals",
      description: "Live generative 3D audio-visual performance using TouchDesigner and Unreal Engine",
      category: "realtime",
      duration: "8:30",
      releaseDate: "2024",
      
      platforms: {
        youtube: "https://www.youtube.com/channel/UCLK1PORnw7wtArjjhfnA2RQ",
        vimeo: "https://vimeo.com/therob"
      },
      
      embedUrl: "https://www.youtube.com/embed/demo-realtime-1",
      
      thumbnail: "/images/videos/realtime-generative-thumb.jpg",
      
      tools: ["TouchDesigner", "Unreal Engine", "Ableton Live"],
      projectType: "Live Performance",
      tags: ["realtime", "generative", "interactive"]
    },
    {
      id: 4,
      title: "3D Projection Mapping Demo",
      description: "Projection mapping on custom-printed 3D objects and architectural surfaces",
      category: "mapping",
      duration: "6:45",
      releaseDate: "2024",
      
      platforms: {
        youtube: "https://www.youtube.com/channel/UCLK1PORnw7wtArjjhfnA2RQ",
        vimeo: "https://vimeo.com/therob"
      },
      
      embedUrl: "https://www.youtube.com/embed/demo-mapping-1",
      
      thumbnail: "/images/videos/3d-mapping-thumb.jpg",
      
      tools: ["MadMapper", "TouchDesigner", "Cinema 4D"],
      projectType: "Projection Mapping",
      tags: ["mapping", "3d objects", "architecture"]
    },
    {
      id: 5,
      title: "Live Video Mixing Performance",
      description: "Real-time video mixing and live visual performance systems in action",
      category: "mixing",
      duration: "12:15",
      releaseDate: "2024",
      
      platforms: {
        youtube: "https://www.youtube.com/channel/UCLK1PORnw7wtArjjhfnA2RQ",
        vimeo: "https://vimeo.com/therob"
      },
      
      embedUrl: "https://www.youtube.com/embed/demo-mixing-1",
      
      thumbnail: "/images/videos/live-mixing-thumb.jpg",
      
      tools: ["Resolume", "TouchDesigner", "OBS Studio"],
      projectType: "VJ Performance",
      tags: ["live performance", "vj sets", "real-time"]
    },
    {
      id: 6,
      title: "Cinematic Video Editing Workflow",
      description: "Post-production workflows and cinematic video editing techniques demonstration",
      category: "editing",
      duration: "9:33",
      releaseDate: "2024",
      
      platforms: {
        youtube: "https://www.youtube.com/channel/UCLK1PORnw7wtArjjhfnA2RQ",
        vimeo: "https://vimeo.com/therob"
      },
      
      embedUrl: "https://www.youtube.com/embed/demo-editing-1",
      
      thumbnail: "/images/videos/cinematic-editing-thumb.jpg",
      
      tools: ["DaVinci Resolve", "After Effects", "Cinema 4D"],
      projectType: "Post-Production",
      tags: ["post-production", "cinematic", "workflows"]
    },
    {
      id: 7,
      title: "Interactive Audio-Visual Installation",
      description: "Interactive installation responding to audience movement and sound",
      category: "realtime",
      duration: "7:22",
      releaseDate: "2023",
      
      platforms: {
        youtube: "https://www.youtube.com/channel/UCLK1PORnw7wtArjjhfnA2RQ",
        vimeo: "https://vimeo.com/therob"
      },
      
      embedUrl: "https://www.youtube.com/embed/demo-interactive-1",
      
      thumbnail: "/images/videos/interactive-installation-thumb.jpg",
      
      tools: ["TouchDesigner", "Kinect", "Max/MSP"],
      projectType: "Interactive Installation",
      tags: ["interactive", "installation", "motion tracking"]
    },
    {
      id: 8,
      title: "Architectural Projection Mapping",
      description: "Large-scale projection mapping on building facades and architectural elements",
      category: "mapping",
      duration: "5:18",
      releaseDate: "2023",
      
      platforms: {
        youtube: "https://www.youtube.com/channel/UCLK1PORnw7wtArjjhfnA2RQ",
        vimeo: "https://vimeo.com/therob"
      },
      
      embedUrl: "https://www.youtube.com/embed/demo-architectural-1",
      
      thumbnail: "/images/videos/architectural-mapping-thumb.jpg",
      
      tools: ["MadMapper", "Resolume", "Blender"],
      projectType: "Architectural Mapping",
      tags: ["architecture", "large scale", "buildings"]
    },
    {
      id: 9,
      title: "Multi-Screen VJ Performance",
      description: "Complex multi-screen visual performance with synchronized content across displays",
      category: "mixing",
      duration: "15:45",
      releaseDate: "2023",
      
      platforms: {
        youtube: "https://www.youtube.com/channel/UCLK1PORnw7wtArjjhfnA2RQ",
        vimeo: "https://vimeo.com/therob"
      },
      
      embedUrl: "https://www.youtube.com/embed/demo-multiscreen-1",
      
      thumbnail: "/images/videos/multiscreen-vj-thumb.jpg",
      
      tools: ["Resolume", "TouchDesigner", "MIDI Controllers"],
      projectType: "Multi-Screen Performance",
      tags: ["multi-screen", "synchronized", "performance"]
    },
    {
      id: 10,
      title: "Motion Graphics Compilation",
      description: "Collection of motion graphics work and animated visual elements",
      category: "editing",
      duration: "4:12",
      releaseDate: "2023",
      
      platforms: {
        youtube: "https://www.youtube.com/channel/UCLK1PORnw7wtArjjhfnA2RQ",
        vimeo: "https://vimeo.com/therob"
      },
      
      embedUrl: "https://www.youtube.com/embed/demo-motion-graphics-1",
      
      thumbnail: "/images/videos/motion-graphics-thumb.jpg",
      
      tools: ["After Effects", "Cinema 4D", "Illustrator"],
      projectType: "Motion Graphics",
      tags: ["motion graphics", "animation", "design"]
    },
    {
      id: 11,
      title: "Generative Art Process",
      description: "Behind-the-scenes look at creating generative visual art with code",
      category: "realtime",
      duration: "11:28",
      releaseDate: "2023",
      
      platforms: {
        youtube: "https://www.youtube.com/channel/UCLK1PORnw7wtArjjhfnA2RQ",
        vimeo: "https://vimeo.com/therob"
      },
      
      embedUrl: "https://www.youtube.com/embed/demo-generative-process-1",
      
      thumbnail: "/images/videos/generative-process-thumb.jpg",
      
      tools: ["Processing", "TouchDesigner", "Python"],
      projectType: "Generative Art",
      tags: ["generative", "code art", "process"]
    },
    {
      id: 12,
      title: "Custom Object Mapping",
      description: "Projection mapping on custom-designed and 3D-printed sculptural objects",
      category: "mapping",
      duration: "6:55",
      releaseDate: "2023",
      
      platforms: {
        youtube: "https://www.youtube.com/channel/UCLK1PORnw7wtArjjhfnA2RQ",
        vimeo: "https://vimeo.com/therob"
      },
      
      embedUrl: "https://www.youtube.com/embed/demo-custom-objects-1",
      
      thumbnail: "/images/videos/custom-object-mapping-thumb.jpg",
      
      tools: ["MadMapper", "Fusion 360", "3D Printer"],
      projectType: "Object Mapping",
      tags: ["custom objects", "3d printing", "sculpture"]
    },
    {
      id: 13,
      title: "Live Coding Performance",
      description: "Live coding visual performance creating real-time graphics through code",
      category: "mixing",
      duration: "18:30",
      releaseDate: "2023",
      
      platforms: {
        youtube: "https://www.youtube.com/channel/UCLK1PORnw7wtArjjhfnA2RQ",
        vimeo: "https://vimeo.com/therob"
      },
      
      embedUrl: "https://www.youtube.com/embed/demo-live-coding-1",
      
      thumbnail: "/images/videos/live-coding-thumb.jpg",
      
      tools: ["Hydra", "SuperCollider", "TouchDesigner"],
      projectType: "Live Coding",
      tags: ["live coding", "algorithmic", "performance"]
    },
    {
      id: 14,
      title: "Documentary Style Edit",
      description: "Documentary-style editing showcasing the creative process and technical workflows",
      category: "editing",
      duration: "13:42",
      releaseDate: "2023",
      
      platforms: {
        youtube: "https://www.youtube.com/channel/UCLK1PORnw7wtArjjhfnA2RQ",
        vimeo: "https://vimeo.com/therob"
      },
      
      embedUrl: "https://www.youtube.com/embed/demo-documentary-1",
      
      thumbnail: "/images/videos/documentary-edit-thumb.jpg",
      
      tools: ["DaVinci Resolve", "After Effects", "Audition"],
      projectType: "Documentary",
      tags: ["documentary", "storytelling", "process"]
    }
  ],

  // Video playlists/series for organization
  playlists: [
    {
      id: 1,
      title: "Live Performance Series",
      description: "Collection of live visual performances",
      category: "realtime",
      platforms: {
        youtube: "https://www.youtube.com/playlist?list=PLAYLIST_ID",
        vimeo: "https://vimeo.com/showcase/SHOWCASE_ID"
      },
      videoIds: [1] // Reference to video IDs in this playlist
    },
    {
      id: 2,
      title: "Installation Documentation",
      description: "Documentation of projection mapping installations",
      category: "mapping", 
      platforms: {
        youtube: "https://www.youtube.com/playlist?list=ANOTHER_PLAYLIST_ID",
        vimeo: "https://vimeo.com/showcase/ANOTHER_SHOWCASE_ID"
      },
      videoIds: [2] // Reference to video IDs in this playlist
    }
  ]
};
