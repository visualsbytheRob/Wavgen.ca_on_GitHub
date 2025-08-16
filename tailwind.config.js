/*
 * tailwind.config.js
 * This file configures Tailwind CSS for the Wavgen.ca project.
 * - Defines which files Tailwind should scan for class names (content)
 * - Safelists dynamic or JS-applied classes so they are not purged
 * - Can be extended with custom themes, plugins, etc.
 * All sections are commented for teaching clarity.
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  // Enable class-based dark mode so we can toggle theme via JS by adding/removing 'dark' on <html>
  darkMode: 'class',
  // 'content': List of files and patterns Tailwind should scan for class names
  // This ensures all used classes are included in the final CSS

  content: [
    "./src/**/*.{html,njk,js}",
    "./public/**/*.{html,njk,js}"
  ],
  safelist: [
    // 'safelist': Classes that are added dynamically via JS or not found in static HTML/Nunjucks
    // Ensures these classes are not purged from the final CSS

    // Navigation drawer transitions
    'transform',
    'transition-transform',
    'ease-in-out',
    'duration-300',
    '-translate-x-full',
    'translate-x-0',
    'hidden',

    // Positioning for overlay and drawer
    'fixed',
    'inset-0',
    'top-0',
    'left-0',
    'h-full',
    'w-80',

    // Z-index stacking
    'z-[9999]',
    'z-[10000]',
    'z-30',
    'z-50',

    // Interactive Code Playground responsive heights
    'h-[600px]',
    'h-[650px]',
    'h-[700px]',
    'h-[750px]',
    'h-[800px]',
    'h-[850px]',
    'h-[900px]',
    'md:h-[700px]',
    'md:h-[750px]',
    'md:h-[850px]',
    'md:h-[900px]',
    'lg:h-[550px]',
    'lg:h-[600px]',

    // Theme toggle and command palette utilities that may be injected/toggled at runtime
    'dark',
    'bg-white',
    'bg-gray-900',
    'text-gray-900',
    'text-white',
    'backdrop-blur',
    'backdrop-blur-sm',
    'backdrop-blur-md',
    'outline-none',
    'ring-2',
    'ring-wavgen-yellow',
  ],
  theme: {
    extend: {
      colors: {
        'wavgen-purple': '#340093',
        'wavgen-dark-purple': '#2c0077',
        'wavgen-yellow': '#FEDD00',
        'wavgen-light-purple': '#6366f1',
      },
      fontFamily: {
        'roboto': ['Roboto', 'sans-serif'],
        'arvo': ['Arvo', 'serif'],
        'open-sans': ['Open Sans', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
