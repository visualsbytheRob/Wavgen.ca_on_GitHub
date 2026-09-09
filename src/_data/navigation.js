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
        { title: 'Psychoacoustics Lab',      url: '/music/psychoacoustics-lab/',      description: 'How hearing works — masking, loudness, and spatial perception' }
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
        { title: 'DaVinci Resolve', url: '/video/davinci-resolve/',   description: 'Professional grading and editing workflows' },
        { title: 'AI Video',        url: '/video/ai-video/',          description: 'AI-assisted video generation and editing' },
        // AV worlds (merged from former AV section)
        { title: 'TouchDesigner Signal Flow', url: '/video/touchdesigner-signal-flow/', description: 'Node-based visual programming for live media' }
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
        { title: 'Cloud Computing',      url: '/data/cloud-computing/',      description: 'AWS, Azure, GCP architectures' },
        // Standard section pages
        { title: 'Web Dev',  url: '/data/webdev/',   description: 'Full-stack development' },
        { title: 'Coding',   url: '/data/coding/',   description: 'Programming projects' },
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
        { title: 'Typography',          url: '/art/typography/',          description: 'Type anatomy, classification, spacing, and scale' },
        { title: 'WebGL',               url: '/art/webgl/',               description: 'GPU-accelerated browser graphics' },
        { title: 'Particle Systems',    url: '/art/particle-systems/',    description: 'Simulated particles and emergent patterns' }
      ]
    }
  ]
};
