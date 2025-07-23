# Cleanup script to remove old static HTML files before Eleventy deployment
# This ensures GitHub Pages serves the new Eleventy-generated site

Write-Host "Cleaning up old static HTML files..."

# List of old static HTML files to remove
$oldFiles = @(
    "index.html",
    "music.html", 
    "video.html",
    "data.html",
    "art.html",
    "electro.html",
    "ambient.html", 
    "melodic.html",
    "breaks.html",
    "realtime.html",
    "mapping.html",
    "mixing.html", 
    "editing.html",
    "webdev.html",
    "coding.html",
    "genai.html",
    "cloud.html",
    "painting.html",
    "drawing.html",
    "modelling.html",
    "printing.html",
    "identity.html",
    "tabnine.html",
    "indexbackup.html"
)

# Remove old HTML files
foreach ($file in $oldFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "Removed: $file"
    }
}

# Remove old components directory (replaced by Eleventy includes)
if (Test-Path "components") {
    Remove-Item "components" -Recurse -Force
    Write-Host "Removed: components directory"
}

Write-Host "Cleanup complete! Now the Eleventy-generated site in _site will be served by GitHub Pages."
Write-Host "Make sure to commit and push these changes to trigger the GitHub Actions deployment."
