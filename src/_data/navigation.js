/*
 * navigation.js
 * This file defines the navigation structure for the entire Wavgen.ca Eleventy website.
 * - Exports a data object used by Nunjucks templates to generate navigation menus.
 * - Each main section (Music, Video, Data & Tech, Art) is an object with a title, url, icon, and children (subpages).
 * - Only the first section (Music) is commented in detail; others follow the same structure.
 */

// This file exports the navigation structure for the Eleventy website.
// It defines the main sections and their subpages, used to generate navigation menus throughout the site.
//
// Each main section (Music, Video, Data & Tech, Art) uses the same structure:
//   - title: The label for the section in navigation
//   - url: The URL path for the section landing page
//   - children: Array of subpages, each with a title and url
//
// Only the first section is commented in detail; all following sections are analogous.

module.exports = {
  main: [
    {
      title: 'Home',
      url: '/',
      icon: 'home'
    },
    {
      // Main section: Music
      title: 'Music', // The label for the Music section as shown in navigation menus
      url: '/music/', // The URL path for the Music landing page
      icon: 'music', // Icon name for the Music section (used in nav UI)
      children: [ // Array of subpages under Music
        { title: 'Electro', url: '/music/electro/', description: 'Electronic beats and synthesis' }, // Subpage: Electro genre
        { title: 'Ambient', url: '/music/ambient/', description: 'Atmospheric soundscapes' }, // Subpage: Ambient genre
        { title: 'Melodic', url: '/music/melodic/', description: 'Harmonic compositions' }, // Subpage: Melodic genre
        { title: 'Breaks', url: '/music/breaks/', description: 'Breakbeat rhythms' } // Subpage: Breaks genre
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
