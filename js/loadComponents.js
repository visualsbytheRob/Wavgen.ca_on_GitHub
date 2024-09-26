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

// Function to prevent flickering of navigation/header components on mobile
function preventFlicker() {
    // Add 'hidden' class to navigation to hide during page load
    const navbar = document.getElementById('navbar-container');
    navbar.classList.add('hidden');
    
    // Remove 'hidden' class after page is fully loaded
    window.addEventListener('load', () => {
        navbar.classList.remove('hidden');
    });
}

// Load header and footer by calling the function
window.addEventListener('DOMContentLoaded', () => {
    loadComponent('components/header.html', 'header-container');
    loadComponent('components/footer.html', 'footer-container');
});
