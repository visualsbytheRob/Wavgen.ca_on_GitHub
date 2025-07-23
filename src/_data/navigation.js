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
        { title: 'Electro', url: '/music/electro/', description: 'Electronic beats and synthesis' },
        { title: 'Ambient', url: '/music/ambient/', description: 'Atmospheric soundscapes' },
        { title: 'Melodic', url: '/music/melodic/', description: 'Harmonic compositions' },
        { title: 'Breaks', url: '/music/breaks/', description: 'Breakbeat rhythms' }
      ]
    },
    {
      title: 'Video',
      url: '/video/',
      icon: 'video',
      children: [
        { title: 'Realtime', url: '/video/realtime/', description: 'Live visual performance' },
        { title: 'Mapping', url: '/video/mapping/', description: 'Projection mapping systems' },
        { title: 'Mixing', url: '/video/mixing/', description: 'Live video composition' },
        { title: 'Editing', url: '/video/editing/', description: 'Post-production workflows' }
      ]
    },
    {
      title: 'Data',
      url: '/data/',
      icon: 'data',
      children: [
        { title: 'Web Dev', url: '/data/webdev/', description: 'Full-stack development' },
        { title: 'Coding', url: '/data/coding/', description: 'Programming projects' },
        { title: 'Gen AI', url: '/data/genai/', description: 'AI and machine learning' },
        { title: 'Cloud', url: '/data/cloud/', description: 'Cloud infrastructure' }
      ]
    },
    {
      title: 'Art',
      url: '/art/',
      icon: 'art',
      children: [
        { title: 'Painting', url: '/art/painting/', description: 'Digital and traditional painting' },
        { title: 'Drawing', url: '/art/drawing/', description: 'Sketches and illustrations' },
        { title: 'Modelling', url: '/art/modelling/', description: '3D modeling and sculpture' },
        { title: 'Printing', url: '/art/printing/', description: '3D printing projects' }
      ]
    }
  ]
};
