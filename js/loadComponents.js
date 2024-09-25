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

// Load header and footer by calling the function
window.addEventListener('DOMContentLoaded', () => {
    loadComponent('components/header.html', 'header-container');
    loadComponent('components/footer.html', 'footer-container');
});
