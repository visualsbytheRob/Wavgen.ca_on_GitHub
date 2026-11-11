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
        { title: 'Waveform Playground',      url: '/music/waveform-playground/',      description: 'Oscillators, waveforms, and synthesis' },
      ]
    },
    {
      title: 'Video',
      url: '/video/',
      icon: 'video',
      children: [
        { title: 'Mixing',                    url: '/video/mixing/',                    description: 'Live video composition' },
        { title: 'Editing',                   url: '/video/editing/',                   description: 'Post-production workflows' },
        { title: 'Mapping',                   url: '/video/mapping/',                   description: 'Projection mapping systems' },
        { title: 'Realtime',                  url: '/video/realtime/',                  description: 'Live visual performance' },
        { title: 'TouchDesigner', url: '/video/touchdesigner-signal-flow/', description: 'Node-based visual programming for live media' }
      ]
    },
    {
      title: 'Data',
      url: '/data/',
      icon: 'data',
      children: [
        { title: 'Web Dev',            url: '/data/webdev/',             description: 'Full-stack development' },
        { title: 'Big Data',           url: '/data/big-data/',           description: 'Hadoop, Spark, Kafka, pipelines' },
        { title: 'Generative AI',      url: '/data/generative-ai/',      description: 'LLMs, transformers, prompting' },
        { title: 'Cloud Computing',    url: '/data/cloud-computing/',    description: 'AWS, Azure, GCP architectures' },
        { title: 'Quantum Computing',  url: '/data/quantum-computing/',  description: 'Qubits, gates, quantum advantage' },
        { title: 'ML & Predictive AI', url: '/data/ml-predictive-ai/',   description: 'Algorithms, training, deployment' },
        { title: 'Repo Constellation', url: '/data/repo-constellation/', description: 'The GitHub repositories behind Wavgen, mapped' }
      ]
    },
    {
      title: 'Art',
      url: '/art/',
      icon: 'art',
      children: [
        { title: 'Drawing',          url: '/art/drawing/',          description: 'Sketches and illustrations' },
        { title: 'Painting',         url: '/art/painting/',         description: 'Digital and traditional painting' },
        { title: 'Printing',         url: '/art/printing/',         description: '3D printing projects' },
        { title: 'Modelling',        url: '/art/modelling/',        description: '3D modeling and sculpture' },
        { title: 'Particle Systems', url: '/art/particle-systems/', description: 'Simulated particles and emergent patterns' }
      ]
    }
  ]
};
