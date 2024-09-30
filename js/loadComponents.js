// Function to load a component (e.g., header or footer) into a specific element
function loadComponent(componentPath, targetElementId) {
    fetch(componentPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            document.getElementById(targetElementId).innerHTML = data;
        })
        .catch(error => {
            console.error('Error loading component:', error);
        });
}

// Load header, footer and subnavs by calling the function
window.addEventListener('DOMContentLoaded', () => {
    loadComponent('components/header.html', 'header-container');
    loadComponent('components/footer.html', 'footer-container');
    loadComponent('components/musicsubnav.html', 'musicsubnav-container');
    loadComponent('components/videosubnav.html', 'videosubnav-container');
    loadComponent('components/datasubnav.html', 'datasubnav-container');
    loadComponent('components/artsubnav.html', 'artsubnav-container');
});

window.addEventListener('load', () => {
  // Register GSAP ScrollTrigger plugin so it can be used for scroll-based animations
  gsap.registerPlugin(ScrollTrigger);

  // Parallax Background Animation Setup
  // Apply the parallax effect to the background image inside .parallax-background
  // yPercent: -50 moves the background image at 50% of the scrolling speed
  gsap.to(".parallax-background", {
    yPercent: -100,  // Moves the background image slower than the scrolling speed
    ease: "none",   // No easing, creating a linear movement
    scrollTrigger: {
      trigger: ".parallax-section", // The section where the effect is applied
      scrub: true,   // Links animation to scrollbar position for smooth effect
      start: "top bottom",  // Starts the effect when the top of the section reaches the bottom of the viewport
      end: "bottom top"     // Ends when the section's bottom reaches the top of the viewport
    }
  });

  // Infinite Scrolling Gallery Animation Setup
  // This will scroll the gallery images from right to left continuously, infinitely
  const galleryWidth = document.querySelector(".gallery-container").scrollWidth; // Get the full width of the gallery container

  // gsap animation for infinite scroll
  gsap.to(".gallery-container", {
    x: -galleryWidth,  // Move the container horizontally by the width of the gallery
    ease: "none",  // No easing, so the animation will be linear (constant speed)
    repeat: -1,    // Repeat infinitely
    duration: 20,  // Time it takes to scroll through the gallery once (adjust as necessary)
  });

  // Modal functionality for the images in the gallery
  // Get the modal and the modal elements
  var modal = document.getElementById("myModal");
  var modalImg = document.getElementById("img01");
  var captionText = document.getElementById("caption");

  // Query all images in the gallery container for the modal functionality
  var galleryImages = document.querySelectorAll(".gallery-container img");

  // Add click event listener to each gallery image for the modal
  galleryImages.forEach(img => {
    img.onclick = function(){
      modal.style.display = "block";  // Show the modal
      modalImg.src = this.src;  // Set the clicked image as the modal image
      captionText.innerHTML = this.alt;  // Set the caption as the alt text of the clicked image
    }
  });

  // Close modal functionality when the 'X' is clicked
  var span = document.getElementsByClassName("close")[0];  // Get the close button element

  span.onclick = function() {
    modal.style.display = "none";  // Close the modal when 'X' is clicked
  };
});
