/*
 * server.js
 * This file sets up a simple Express.js server for local development and previewing the built Wavgen.ca site.
 * - Serves static files from the 'public' directory (the built site output)
 * - Handles requests for images and HTML pages
 * - Returns a 404 page if a requested page does not exist
 * All major sections and lines are commented below for teaching clarity.
 */

const express = require('express');
const path = require('path'); // Node.js module for handling file paths

const app = express(); // Create an Express application instance
const PORT = process.env.PORT || 3001; // Use the PORT env variable or default to 3001

// Serve static files (HTML, CSS, JS, etc.) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public'))); // Make everything in /public accessible

// Serve images from the 'images' directory (for direct image requests)
app.use('/images', express.static(path.join(__dirname, 'images'))); // Map /images URL to images folder

// Route for the homepage (root URL)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html')); // Serve the homepage
});

// For any other route, try to serve the corresponding HTML file
app.get('/:page', (req, res) => {
  const page = req.params.page; // Get the requested page name from the URL
  const filePath = path.join(__dirname, 'public', `${page}.html`); // Build the file path
  
  // Try to send the file. If it doesn't exist, send the 404 page
  res.sendFile(filePath, (err) => {
    if (err) { // If file not found or error occurs
      res.status(404).sendFile(path.join(__dirname, 'public', '404.html')); // Serve the 404 page
    }
  });
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`🚀 Wavgen.ca server running at http://localhost:${PORT}`); // Log server start
  console.log(`📁 Serving files from: ${path.join(__dirname, 'public')}`); // Log serving directory
});
