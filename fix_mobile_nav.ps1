# PowerShell script to fix mobile navigation in all HTML files
 = @(
    'video.html', 'data.html', 'art.html', 'electro.html', 'ambient.html', 'melodic.html', 'breaks.html',
    'mapping.html', 'mixing.html', 'editing.html', 'webdev.html', 'coding.html', 'genai.html', 'cloud.html',
    'painting.html', 'drawing.html', 'modelling.html', 'printing.html'
)

foreach ( in ) {
    if (Test-Path ) {
        Write-Host "Updating ..."
         = Get-Content  -Raw
        
        # Replace the mobile nav structure
         = '    <!-- Mobile Navigation Drawer -->\s*\n    <nav id="mobile-nav" class="fixed top-0 left-0 h-full w-80 bg-wavgen-purple z-50 transform -translate-x-full transition-transform duration-300 ease-in-out">\s*\n        <div class="p-6">\s*\n            <div class="flex justify-between items-center mb-8">\s*\n                <h2 class="text-xl font-bold text-wavgen-yellow">Navigation</h2>\s*\n                <button id="close-mobile-nav" class="text-white hover:text-wavgen-yellow">\s*\n                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">\s*\n                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>\s*\n                    </svg>\s*\n                </button>\s*\n            </div>\s*\n            \s*\n            <!-- Mobile Menu Items -->\s*\n            <div class="space-y-2">'
        
         = '    <!-- Mobile Navigation Drawer -->
    <nav id="mobile-nav" class="fixed top-0 left-0 h-full w-80 bg-wavgen-purple z-50 transform -translate-x-full transition-transform duration-300 ease-in-out flex flex-col">
        <!-- Sticky Header -->
        <div class="flex justify-between items-center p-4 border-b border-wavgen-dark-purple bg-wavgen-purple">
            <h2 class="text-lg font-bold text-wavgen-yellow">Navigation</h2>
            <button id="close-mobile-nav" class="text-white hover:text-wavgen-yellow">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
        
        <!-- Scrollable Content -->
        <div class="flex-1 overflow-y-auto p-4">
            <div class="space-y-1">'
        
         =  -replace , 
         | Set-Content  -NoNewline
    }
}
