/*
 * navigation.js
 * Navigation structure for the Wavgen.ca Eleventy website.
 * Each section has a title, url, icon, and children (subpages / world pages).
 */

module.exports = {
  main: [
    {
      title: 'Home',
      url: '/',
      icon: 'home'
    },
    {
      title: 'Music',
      url: '/music/',
      icon: 'music',
      children: [
        // Genre pages
        { title: 'Electro',   url: '/music/electro/',   description: 'Electronic beats and synthesis' },
        { title: 'Ambient',   url: '/music/ambient/',   description: 'Atmospheric soundscapes' },
        { title: 'Melodic',   url: '/music/melodic/',   description: 'Harmonic compositions' },
        { title: 'Breaks',    url: '/music/breaks/',    description: 'Breakbeat rhythms' },
        // World pages
        { title: 'Signal Flow',              url: '/music/signal-flow/',              description: 'Audio routing and signal chains' },
        { title: 'Waveform Playground',      url: '/music/waveform-playground/',      description: 'Oscillators, waveforms, and synthesis' },
        { title: 'Modular Patch Lab',        url: '/music/modular-patch-lab/',        description: 'Eurorack and modular synthesis' },
        { title: 'Granular Synthesis',       url: '/music/granular-synthesis/',       description: 'Granular and microsound techniques' },
        { title: 'Algorithmic Composition',  url: '/music/algorithmic-composition/',  description: 'Rules, patterns, and generative music' },
        { title: 'Generative Music Systems', url: '/music/generative-music-systems/', description: 'Self-evolving musical structures' },
        { title: 'Sound Design',             url: '/music/sound-design/',             description: 'Synthesis, sampling, and sound shaping' },
        { title: 'Music Theory',             url: '/music/music-theory/',             description: 'Harmony, scales, and composition' }
      ]
    },
    {
      title: 'Video',
      url: '/video/',
      icon: 'video',
      children: [
        // Section pages
        { title: 'Realtime', url: '/video/realtime/', description: 'Live visual performance' },
        { title: 'Mapping',  url: '/video/mapping/',  description: 'Projection mapping systems' },
        { title: 'Mixing',   url: '/video/mixing/',   description: 'Live video composition' },
        { title: 'Editing',  url: '/video/editing/',  description: 'Post-production workflows' },
        // World pages
        { title: 'Cinematography',  url: '/video/cinematography/',    description: 'Camera craft, lensing, and visual storytelling' },
        { title: 'Color Science',   url: '/video/color-science-lab/', description: 'Color grading, LUTs, and colorimetry' },
        { title: 'DaVinci Resolve', url: '/video/davinci-resolve/',   description: 'Professional grading and editing workflows' },
        { title: 'VFX Compositing', url: '/video/vfx-compositing/',   description: 'Compositing, keying, and visual effects' },
        { title: 'Motion Graphics', url: '/video/motion-graphics/',   description: 'Kinetic type, animation, and motion design' },
        { title: 'AI Video',        url: '/video/ai-video/',          description: 'AI-assisted video generation and editing' }
      ]
    },
    {
      title: 'Data',
      url: '/data/',
      icon: 'data',
      children: [
        // World pages
        { title: 'ML & Predictive AI',   url: '/data/ml-predictive-ai/',    description: 'Algorithms, training, deployment' },
        { title: 'Quantum Computing',    url: '/data/quantum-computing/',    description: 'Qubits, gates, quantum advantage' },
        { title: 'Generative AI',        url: '/data/generative-ai/',        description: 'LLMs, transformers, prompting' },
        { title: 'Automation',           url: '/data/automation/',           description: 'Scripts, orchestration, CI/CD' },
        { title: 'Cloud Computing',      url: '/data/cloud-computing/',      description: 'AWS, Azure, GCP architectures' },
        { title: 'SOA & Microservices',  url: '/data/soa-microservices/',    description: 'Microservices, patterns, gateways' },
        { title: 'AI Agents',            url: '/data/ai-agents/',            description: 'Autonomous agents and multi-agent systems' },
        { title: 'RAG Systems',          url: '/data/rag-systems/',          description: 'Retrieval-augmented generation pipelines' },
        { title: 'API Design',           url: '/data/api-design/',           description: 'REST, GraphQL, and API architecture' },
        { title: 'Distributed Systems',  url: '/data/distributed-systems/',  description: 'Consensus, fault tolerance, scaling' },
        { title: 'Serverless',           url: '/data/serverless/',           description: 'Functions, event-driven, edge compute' },
        // Standard section pages
        { title: 'Web Dev',  url: '/data/webdev/',   description: 'Full-stack development' },
        { title: 'Coding',   url: '/data/coding/',   description: 'Programming projects' },
        { title: 'Gen AI',   url: '/data/genai/',    description: 'AI and machine learning' },
        { title: 'Cloud',    url: '/data/cloud/',    description: 'Cloud infrastructure' },
        { title: 'Big Data', url: '/data/big-data/', description: 'Hadoop, Spark, Kafka, pipelines' }
      ]
    },
    {
      title: 'Art',
      url: '/art/',
      icon: 'art',
      children: [
        // Section pages
        { title: 'Painting',  url: '/art/painting/',  description: 'Digital and traditional painting' },
        { title: 'Drawing',   url: '/art/drawing/',   description: 'Sketches and illustrations' },
        { title: 'Modelling', url: '/art/modelling/', description: '3D modeling and sculpture' },
        { title: 'Printing',  url: '/art/printing/',  description: '3D printing projects' },
        // World pages
        { title: 'Generative Art',      url: '/art/generative-art/',      description: 'Code-driven algorithmic art' },
        { title: 'Shader Art',          url: '/art/shader-art/',          description: 'GLSL shaders and GPU graphics' },
        { title: 'Creative Coding',     url: '/art/creative-coding/',     description: 'p5.js, Processing, and code as medium' },
        { title: 'AI Art',              url: '/art/ai-art/',              description: 'Machine learning and generative imagery' },
        { title: 'Diffusion Models',    url: '/art/diffusion-models/',    description: 'Stable Diffusion, DALL-E, and image synthesis' },
        { title: 'WebGL',               url: '/art/webgl/',               description: 'GPU-accelerated browser graphics' },
        { title: 'Particle Systems',    url: '/art/particle-systems/',    description: 'Simulated particles and emergent patterns' },
        { title: 'Immersive Galleries', url: '/art/immersive-galleries/', description: 'Virtual and spatial art environments' }
      ]
    },
    {
      title: 'AV',
      url: '/av/',
      icon: 'av',
      children: [
        { title: 'Audiovisual Ecosystems',    url: '/av/audiovisual-ecosystems/',    description: 'Integrated AV signal flows and system design' },
        { title: 'TouchDesigner Signal Flow', url: '/av/touchdesigner-signal-flow/', description: 'Node-based visual programming for live media' },
        { title: 'Live Performance',          url: '/av/live-performance/',          description: 'Realtime AV performance and VJ systems' },
        { title: 'Spatial Audio',             url: '/av/spatial-audio/',             description: 'Ambisonics, binaural, and 3D sound' },
        { title: 'Interactive Installations', url: '/av/interactive-installations/', description: 'Sensor-driven and participatory AV systems' },
        { title: 'Realtime Graphics',         url: '/av/realtime-graphics/',         description: 'GPU shaders and generative visual rendering' },
        { title: 'Projection Mapping',        url: '/av/projection-mapping-av/',     description: 'Architectural projection and surface mapping' },
        { title: 'Generative Universe',       url: '/av/generative-universe/',       description: 'Cosmic-scale procedural and emergent systems' }
      ]
    }
  ]
};
